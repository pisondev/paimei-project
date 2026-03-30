#!/bin/bash
set -e
echo "🚀 Memulai Update Project Paimei..."

# Cukup pull satu kali di root folder (projects/paimei)
git pull origin main

# Rebuild dan jalankan container
echo "📦 Membangun ulang container..."
docker compose up -d --build

# Jalankan Migrasi dengan Path Absolut yang Benar
echo "⏳ Mengecek dan Menjalankan Migrasi Database..."
docker run --rm --network host -v /home/user_pison/projects/paimei/paimei-api/internal/core/db/migrations:/migrations migrate/migrate -path=/migrations/ -database "postgres://user_paimei:dbpaimei123@localhost:5435/paimei_db?sslmode=disable" up

# Bersihkan image lama
docker image prune -f
echo "✅ Paimei Berhasil Diperbarui dan Siap Beroperasi!"
