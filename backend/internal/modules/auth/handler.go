package auth

import (
	"database/sql"

	"github.com/gofiber/fiber/v2"
)

func HandleLogin(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var req LoginRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
		}

		var dbPassword string
		err := db.QueryRow("SELECT password_hash FROM users WHERE username = $1", req.Username).Scan(&dbPassword)
		if err != nil {
			if err == sql.ErrNoRows {
				return c.Status(401).JSON(fiber.Map{"error": "User tidak ditemukan"})
			}
			return c.Status(500).JSON(fiber.Map{"error": "Database error"})
		}

		if req.Password != dbPassword {
			return c.Status(401).JSON(fiber.Map{"error": "Password salah, coba ingat lagi!"})
		}

		return c.JSON(fiber.Map{"message": "Login berhasil!"})
	}
}
