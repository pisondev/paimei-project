package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/joho/godotenv"

	"paimei-backend/internal/core"
)

func main() {
	_ = godotenv.Load()

	// 1. Inisialisasi Database
	db := core.InitDB() // Memanggil dari internal/core/database.go
	defer db.Close()

	// 2. Setup Fiber & Middleware
	app := fiber.New()
	app.Use(cors.New(cors.Config{
		AllowOrigins: "http://localhost:3000",
		AllowHeaders: "Origin, Content-Type, Accept",
	}))
	app.Use(logger.New())

	// 3. Setup Routes Terpusat
	core.SetupRoutes(app, db)

	// 4. Start Server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server Modular Monolith berjalan di port %s", port)
	log.Fatal(app.Listen(":" + port))
}
