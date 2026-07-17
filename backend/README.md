# Roomify Backend

Backend API for the Roomify room-booking system. This scaffold follows the latest PRD in `documentation/PRD_BACKEND_SISTEM_PEMINJAMAN_RUANGAN_MAHASISWA.md`.

## Quick Start

1. Create a local env file from `.env.example`.
2. Install or sync dependencies:
   `pip install -r requirements.txt`
   or
   `uv sync`
3. Activate the virtual environment:
   `.\.venv\Scripts\Activate.ps1`
4. Run the API locally:
   `uvicorn app.main:app --reload`
5. Run tests:
   `pytest`
6. Run containers:
   `docker compose up --build`

## Project Layout

- `app/` application code and internal tests
- `scripts/` operational helpers
- `documentation/` planning and technical references

## Available Endpoint

- `POST /auth/register` register mahasiswa dengan `name`, `nim`, `email`, dan `password`
- `POST /auth/login` login semua akun dengan `email` dan `password`
- `GET /health` service status summary
- `GET /health/live` liveness probe
- `GET /health/ready` readiness probe
