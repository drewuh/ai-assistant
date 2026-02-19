# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# AI Assistant — Portfolio Project

## Project Overview
A general-purpose AI chat assistant built to showcase:
- Clean, modern React/TypeScript UI
- Python/FastAPI backend
- Model-agnostic AI integration via OpenRouter
- Multi-agent development workflow using Claude Code

Developer: Andrew Moyer
Stack: React + TypeScript (frontend), Python 3 + FastAPI (backend), OpenRouter API

## Architecture
```
ai-assistant/
├── backend/        # FastAPI app, OpenRouter integration
│   ├── main.py
│   ├── routers/
│   ├── models/
│   └── .env        # NEVER commit this
├── frontend/       # React + TypeScript
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── types/
│   └── ...
├── .claude/
│   ├── agents/
│   └── commands/
└── CLAUDE.md
```

## Core Rules — Always Follow These
- NEVER commit `.env` files or API keys to git
- Always use `python3` and `pip3`, never `python` or `pip`
- Use `uv` for Python package management (e.g. `uv pip install`)
- Use TypeScript strict mode — no `any` types
- Prefer functional React components with hooks
- All API calls go through the FastAPI backend — frontend never calls OpenRouter directly
- Every new feature branch before coding, commit often with clear messages

## Code Style
- Python: PEP 8, type hints on all functions, docstrings on all classes
- TypeScript: interfaces over types, named exports, no default exports except pages
- CSS: Tailwind utility classes only — no custom CSS files unless absolutely necessary
- Component files: PascalCase (e.g. `ChatWindow.tsx`)
- Python files: snake_case (e.g. `chat_router.py`)

## Environment Variables
Backend `.env` (never committed):
```
OPENROUTER_API_KEY=your_key_here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
DEFAULT_MODEL=meta-llama/llama-3.3-70b-instruct:free
APP_NAME=AI Assistant
```

## OpenRouter Integration
- Use the OpenAI-compatible API format (OpenRouter supports this)
- Default to a free model: `meta-llama/llama-3.3-70b-instruct:free`
- Make the model configurable via environment variable so it's easy to swap
- Always include proper error handling for API failures and rate limits

## Commands to Know
```bash
# Backend
cd backend && uv pip install -r requirements.txt
uvicorn main:app --reload

# Frontend  
cd frontend && npm install
npm run dev

# Both together (once we add a Makefile)
make dev
```

## Agent Roles
This project uses three specialist Claude Code agents:
- **product-manager** — defines features, acceptance criteria, user stories
- **ux-designer** — names things, designs UI/UX, component structure, color/typography
- **frontend-dev** — implements React components, handles state, styling

When starting a new feature, always invoke the product-manager agent first,
then ux-designer, then frontend-dev. This mirrors a real product team workflow.

## What NOT to Do
- Don't scaffold boilerplate without reading this file first
- Don't install packages without adding them to requirements.txt or package.json
- Don't hardcode any model names — always use environment variables
- Don't put business logic in React components — use custom hooks
- Don't skip TypeScript types to "save time"
