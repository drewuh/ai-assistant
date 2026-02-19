"""
Chat router — POST /api/chat
Proxies multi-turn conversation to OpenRouter with SSE streaming.
"""
import json
import os
from typing import AsyncGenerator

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from openai import AsyncOpenAI, APIStatusError

from models.chat import ChatRequest

router = APIRouter(prefix="/api", tags=["chat"])


def _make_client() -> AsyncOpenAI:
    """Construct the OpenAI-compatible client pointed at OpenRouter."""
    return AsyncOpenAI(
        api_key=os.environ["OPENROUTER_API_KEY"],
        base_url=os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1"),
    )


async def _stream_tokens(request: ChatRequest) -> AsyncGenerator[str, None]:
    """
    Async generator that streams SSE-formatted tokens from OpenRouter.

    Yields lines in the format:  data: <json>\\n\\n
    Terminates with:             data: [DONE]\\n\\n
    Errors mid-stream go through the SSE channel (HTTP status cannot change once streaming starts).
    """
    client = _make_client()
    model = os.getenv("DEFAULT_MODEL", "meta-llama/llama-3.3-70b-instruct:free")

    try:
        stream = await client.chat.completions.create(
            model=model,
            messages=[m.model_dump() for m in request.messages],
            stream=True,
        )
        async for chunk in stream:
            if not chunk.choices or chunk.choices[0].delta.content is None:
                continue
            delta = chunk.choices[0].delta.content
            if delta:
                yield f"data: {json.dumps({'delta': delta})}\n\n"
        yield "data: [DONE]\n\n"

    except APIStatusError as exc:
        payload = json.dumps({"error": {"message": exc.message}})
        yield f"data: {payload}\n\n"
    except Exception as exc:
        payload = json.dumps({"error": {"message": str(exc)}})
        yield f"data: {payload}\n\n"


@router.post("/chat")
async def chat(request: ChatRequest) -> StreamingResponse:
    """
    Accept a conversation history and stream the next assistant turn via SSE.

    Request body: { "messages": [{ "role": "user"|"assistant", "content": "..." }] }
    Response: text/event-stream with delta tokens
    """
    if not os.environ.get("OPENROUTER_API_KEY"):
        raise HTTPException(
            status_code=502,
            detail={"error": {"message": "Server is not configured with an OpenRouter API key."}},
        )

    return StreamingResponse(
        _stream_tokens(request),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # disables Nginx response buffering
        },
    )
