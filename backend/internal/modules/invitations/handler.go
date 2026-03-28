package invitations

import (
	"database/sql"
	"time"

	"github.com/gofiber/fiber/v2"
)

func GetInvitation(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var inv Invitation
		err := db.QueryRow(`
			SELECT id, event_name, location_dummy, event_date, is_accepted, 
			       amey_outfit, amey_top_color, amey_bottom_color, 
			       paisen_outfit, paisen_top_color, paisen_bottom_color 
			FROM invitations WHERE id = 1`).
			Scan(&inv.ID, &inv.EventName, &inv.LocationDummy, &inv.EventDate, &inv.IsAccepted,
				&inv.AmeyOutfit, &inv.AmeyTopColor, &inv.AmeyBottomColor,
				&inv.PaisenOutfit, &inv.PaisenTopColor, &inv.PaisenBottomColor)

		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}
		return c.JSON(inv)
	}
}

func AcceptInvitation(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var payload AmeyAcceptRequest
		if err := c.BodyParser(&payload); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Format data salah"})
		}

		_, err := db.Exec(`
			UPDATE invitations 
			SET is_accepted = true, amey_outfit = $1, amey_top_color = $2, amey_bottom_color = $3, accepted_at = $4 
			WHERE id = 1`,
			payload.Outfit, payload.TopColor, payload.BottomColor, time.Now())
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Gagal menyimpan konfirmasi"})
		}
		return c.JSON(fiber.Map{"message": "Undangan diterima!"})
	}
}

func UpdatePaisenOutfit(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		var payload PaisenUpdateRequest
		if err := c.BodyParser(&payload); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Format data salah"})
		}

		_, err := db.Exec(`
			UPDATE invitations 
			SET paisen_outfit = $1, paisen_top_color = $2, paisen_bottom_color = $3 
			WHERE id = 1`,
			payload.Outfit, payload.TopColor, payload.BottomColor)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Gagal update outfit"})
		}
		return c.JSON(fiber.Map{"message": "Outfit Paisen diupdate!"})
	}
}
