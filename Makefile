# Ubah 5432 menjadi 5438 di bagian localhost:5438
DB_URL=postgresql://paisen:secretpassword@localhost:5438/paimei_db?sslmode=disable

.PHONY: run-all stop-all migrate-create migrate-up migrate-down

run-all:
	docker compose up -d --build

stop-all:
	docker compose down

migrate-create:
	@read -p "Enter migration name: " name; \
	migrate create -ext sql -dir paimei-api/internal/core/db/migrations -seq $$name

migrate-up:
	migrate -path paimei-api/internal/core/db/migrations -database "$(DB_URL)" -verbose up

migrate-down:
	migrate -path paimei-api/internal/core/db/migrations -database "$(DB_URL)" -verbose down