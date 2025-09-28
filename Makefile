up:
	docker compose up -d --build
	echo "Frontend: http://localhost:5173 | Backend: http://localhost:8000 | pgAdmin: http://localhost:5050"

down:
	docker compose down

logs:
	docker compose logs -f --tail=200

migrate:
	python backend/scripts/migrate.py

seed:
	python backend/scripts/seed.py

test:
	docker compose exec backend pytest -q || true
	npm --prefix frontend test --silent || true

fmt:
	docker compose exec backend ruff format .
	npm --prefix frontend run format

lint:
	docker compose exec backend ruff check .
	npm --prefix frontend run lint

new-migration:
	python backend/scripts/new_migration.py "$(m)"
