  GNU nano 7.2                                                                              deploy.sh                                                                                        
#!/bin/bash
set -e
echo "🚀 Memulai Update Project Paimei..."

# Cukup pull satu kali di root folder (projects/paimei)
git pull origin main

# Rebuild dan jalankan container
echo "📦 Membangun ulang container..."
docker compose up -d --build

# Jalankan Migrasi
echo "⏳ Mengecek dan Menjalankan Migrasi Database..."
docker run --rm --network host -v $(pwd)/paimei-api/db/migrations:/migrations migrate/migrate -path=/migrations/ -database "postgres://user_paimei:dbpaimei123@localhost:5435/paimei_db?sslm>

# Bersihkan image lama
docker image prune -f
echo "✅ Paimei Berhasil Diperbarui dan Siap Beroperasi!"
