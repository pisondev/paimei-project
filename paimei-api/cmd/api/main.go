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
	db := core.InitDB()
	defer db.Close()

	// 2. Setup Fiber & Middleware
	app := fiber.New()

	// PERBAIKAN CORS (Sangat Penting untuk Mac/Safari & JWT)
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:3000, https://paimei.tierratie.com, https://www.paimei.tierratie.com",
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization", // Authorization WAJIB ada!
		AllowCredentials: true,
	}))

	app.Use(logger.New())

	// 3. Setup Routes Terpusat
	core.SetupRoutes(app, db)

	// 4. Start Server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Tangkap variabel environment VPS (jika ada) untuk memastikan port Docker yang dipakai benar
	// Di Dockerfile kita EXPOSE 3000, jadi paksa ke 3000 jika dijalankan dalam Docker
	if os.Getenv("DOCKER_ENV") == "true" {
		port = "3000"
	}

	log.Printf("Server Modular Monolith berjalan di port %s", port)
	log.Fatal(app.Listen(":" + port))
}
