package auth

import (
	"database/sql"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

const jwtSecret = "paimei_super_secret_key_2026" // Ganti dengan secret key yang kuat nanti di .env

func Login(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var req LoginRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Format request salah"})
		}

		var userID int
		var dbHash string
		var role string

		err := db.QueryRow("SELECT id, password_hash, role FROM users WHERE username = $1", req.Username).Scan(&userID, &dbHash, &role)
		if err != nil {
			return c.Status(401).JSON(fiber.Map{"error": "Username atau password salah"})
		}

		// === SEAMLESS BCRYPT MIGRATION ===
		// Jika panjang hash kurang dari 60, berarti masih Plain Text di database!
		if len(dbHash) < 60 {
			if dbHash == req.Password {
				// Hash password-nya dan timpa ke DB secara diam-diam
				hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
				db.Exec("UPDATE users SET password_hash = $1 WHERE id = $2", string(hashedPassword), userID)
			} else {
				return c.Status(401).JSON(fiber.Map{"error": "Username atau password salah"})
			}
		} else {
			// Jika sudah di-hash, gunakan perbandingan Bcrypt
			if err := bcrypt.CompareHashAndPassword([]byte(dbHash), []byte(req.Password)); err != nil {
				return c.Status(401).JSON(fiber.Map{"error": "Username atau password salah"})
			}
		}

		// Generate JWT Token
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"user_id":  userID,
			"username": req.Username,
			"role":     role,
			"exp":      time.Now().Add(time.Hour * 24).Unix(), // Berlaku 24 Jam
		})

		tokenString, err := token.SignedString([]byte(jwtSecret))
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Gagal membuat sesi"})
		}

		return c.JSON(fiber.Map{
			"message": "Login berhasil",
			"token":   tokenString,
			"user":    UserResponse{Username: req.Username, Role: role},
		})
	}
}
