DB_URL=postgresql://paisen:secretpassword@localhost:5432/paimei_db?sslmode=disable

.PHONY: run-all stop-all migrate-create migrate-up migrate-down

run-all:
	docker compose up -d --build

stop-all:
	docker compose down

migrate-create:
	@read -p "Enter migration name: " name; \
	migrate create -ext sql -dir backend/internal/core/db/migrations -seq $$name

migrate-up:
	migrate -path backend/internal/core/db/migrations -database "$(DB_URL)" -verbose up

migrate-down:
	migrate -path backend/internal/core/db/migrations -database "$(DB_URL)" -verbose down