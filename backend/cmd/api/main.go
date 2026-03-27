package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func main() {
	// Abaikan error jika di dalam Docker (karena pakai env vars dari docker-compose)
	_ = godotenv.Load()

	dbHost := os.Getenv("DB_HOST")
	if dbHost == "" {
		dbHost = "localhost" // Fallback local
	}
	dbUser := os.Getenv("DB_USER")
	if dbUser == "" {
		dbUser = "paisen"
	}
	dbPass := os.Getenv("DB_PASSWORD")
	if dbPass == "" {
		dbPass = "secretpassword"
	}
	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "paimei_db"
	}
	dbPort := os.Getenv("DB_PORT")
	if dbPort == "" {
		dbPort = "5432"
	}

	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		dbHost, dbPort, dbUser, dbPass, dbName)

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		log.Fatalf("Gagal membuka koneksi DB: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("Gagal melakukan ping ke DB: %v", err)
	}
	fmt.Println("Database berhasil terkoneksi! Siap untuk Amey.")

	app := fiber.New()
	app.Use(logger.New())

	// Health check route
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "ok",
			"message": "Paimei Backend API is running smoothly!",
		})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server berjalan di port %s", port)
	log.Fatal(app.Listen(":" + port))
}
