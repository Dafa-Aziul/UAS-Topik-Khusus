# Repository Guidelines

## Project Structure & Module Organization

This repository currently contains the backend product/design reference in `documentation/PRD_BACKEND_SISTEM_PEMINJAMAN_RUANGAN.md`. The PRD defines the intended app layout under `app/`, with `api/v1/endpoints/` for routes, `services/` for business rules, `repositories/` for MongoDB access, `schemas/` for Pydantic models, `database/` for MongoDB and Redis clients, and `tests/` split into `unit/`, `integration/`, and shared `fixtures/`. Keep utility code in `utils/`, cache helpers in `cache/`, and operational scripts in `scripts/` such as `seed_admin.py` and `create_indexes.py`.

## Build, Test, and Development Commands

Use the PRD-defined Python and container workflow:

- `uv sync` installs dependencies from `pyproject.toml` and `uv.lock`.
- `uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000` runs the FastAPI server locally.
- `uv run pytest` runs the full test suite.
- `uv run pytest tests/unit -q` runs unit tests only.
- `docker compose up --build` starts `backend`, `mongodb`, and `redis` for local development.

Store local settings in `.env` based on `.env.example`; never commit secrets.

## Coding Style & Naming Conventions

Target Python 3.13, 4-space indentation, and type hints on public functions. Use `snake_case` for modules, files, and functions (`booking_service.py`), `PascalCase` for schema/model classes, and uppercase for constants and enum-style status values such as `PENDING`. Keep endpoints thin: validation in schemas, orchestration in services, persistence in repositories.

## Testing Guidelines

Use `pytest`, `pytest-asyncio`, and `httpx` for API tests. Name test files `test_<feature>.py` and test functions `test_<scenario>`. Minimum goals from the PRD are 70% overall coverage and 90% coverage for booking service rules. Prioritize conflict detection, status transitions, authorization, Redis fallback, and response contract checks.

## Commit & Pull Request Guidelines

This checkout does not yet expose Git history, so use Conventional Commit style going forward, for example `feat: add booking approval endpoint` or `fix: invalidate room availability cache`. PRs should include a short summary, affected modules, test evidence, any new environment variables, and sample request/response payloads when API behavior changes.

## Security & Configuration Tips

Do not commit `.env`, JWT secrets, or seeded credentials. Validate role-based access in protected endpoints, keep MongoDB indexes in sync with query patterns, and treat Redis as an optimization layer that must fail gracefully without breaking core booking flows.
