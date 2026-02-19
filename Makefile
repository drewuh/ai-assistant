.PHONY: dev backend frontend install

dev: ## Run both servers concurrently (Ctrl-C stops both)
	@trap 'kill 0' INT; \
	(cd backend && source .venv/bin/activate && uvicorn main:app --reload --port 8000) & \
	(cd frontend && npm run dev) & \
	wait

backend: ## Run only the FastAPI backend
	cd backend && source .venv/bin/activate && uvicorn main:app --reload --port 8000

frontend: ## Run only the Vite frontend
	cd frontend && npm run dev

install: ## Install all dependencies
	cd backend && uv venv && uv pip install -r requirements.txt
	cd frontend && npm install
