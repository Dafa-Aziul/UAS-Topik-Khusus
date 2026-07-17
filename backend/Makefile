install:
	pip install -r requirements.txt

run:
	uvicorn app.main:app --reload

test:
	pytest

lint:
	ruff check .

compose-up:
	docker compose up --build

