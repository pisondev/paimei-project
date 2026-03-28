package coupons

import (
	"database/sql"
	"math/rand"
	"time"

	"github.com/gofiber/fiber/v2"
)

// Inisialisasi zona waktu Jakarta/Solo (WIB)
func getWIBLocation() *time.Location {
	loc, err := time.LoadLocation("Asia/Jakarta")
	if err != nil {
		return time.FixedZone("WIB", 7*3600)
	}
	return loc
}

// Tanggal rilis awal (29 Maret 2026 jam 00:00:00 WIB)
func getAnniversaryStartDate() time.Time {
	return time.Date(2026, time.March, 27, 0, 0, 0, 0, getWIBLocation())
}

func GetCouponState(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		now := time.Now().In(getWIBLocation())
		startDate := getAnniversaryStartDate()

		var currentWeek int
		var nextWeekStart time.Time

		// Hitung minggu berjalan
		if now.Before(startDate) {
			currentWeek = 0
			nextWeekStart = startDate
		} else {
			duration := now.Sub(startDate)
			days := int(duration.Hours() / 24)
			currentWeek = (days / 7) + 1
			nextWeekStart = startDate.AddDate(0, 0, currentWeek*7)
		}

		// Ambil semua kupon yang sudah terbuka
		rows, err := db.Query("SELECT id, title, description, is_redeemed, drawn_week, unlocked_at FROM coupons WHERE unlocked_at IS NOT NULL ORDER BY drawn_week ASC")
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}
		defer rows.Close()

		// KODE BARU:
		unlockedCoupons := []Coupon{}
		for rows.Next() {
			var coupon Coupon
			if err := rows.Scan(&coupon.ID, &coupon.Title, &coupon.Description, &coupon.IsRedeemed, &coupon.DrawnWeek, &coupon.UnlockedAt); err != nil {
				return c.Status(500).JSON(fiber.Map{"error": err.Error()})
			}
			unlockedCoupons = append(unlockedCoupons, coupon)
		}

		// Hitung total kupon di database
		var totalCoupons int
		db.QueryRow("SELECT COUNT(*) FROM coupons").Scan(&totalCoupons)

		unlockedCount := len(unlockedCoupons)

		// Bisa gacha jika jumlah kupon terbuka lebih kecil dari minggu saat ini,
		// DAN masih ada sisa kupon yang belum dibuka.
		canDraw := (unlockedCount < currentWeek) && (unlockedCount < totalCoupons)

		return c.JSON(CouponState{
			CurrentWeek:     currentWeek,
			NextWeekStart:   nextWeekStart,
			CanDraw:         canDraw,
			UnlockedCoupons: unlockedCoupons,
			TotalCoupons:    totalCoupons,
		})
	}
}

func DrawRandomCoupon(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Ambil ID kupon yang masih terkunci
		rows, err := db.Query("SELECT id FROM coupons WHERE unlocked_at IS NULL")
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Database error"})
		}
		defer rows.Close()

		var lockedIDs []int
		for rows.Next() {
			var id int
			rows.Scan(&id)
			lockedIDs = append(lockedIDs, id)
		}

		if len(lockedIDs) == 0 {
			return c.Status(400).JSON(fiber.Map{"error": "Semua kupon sudah terbuka!"})
		}

		// Acak secara random
		rand.Seed(time.Now().UnixNano())
		selectedID := lockedIDs[rand.Intn(len(lockedIDs))]

		// Cari tahu minggu keberapa kupon ini ditarik
		var currentDrawnCount int
		db.QueryRow("SELECT COUNT(*) FROM coupons WHERE unlocked_at IS NOT NULL").Scan(&currentDrawnCount)
		drawnWeek := currentDrawnCount + 1

		// Update ke database
		_, err = db.Exec("UPDATE coupons SET unlocked_at = $1, drawn_week = $2 WHERE id = $3", time.Now().In(getWIBLocation()), drawnWeek, selectedID)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Gagal menyimpan kupon"})
		}

		return c.JSON(fiber.Map{"message": "Kupon berhasil diundi!", "id": selectedID})
	}
}

func RedeemCoupon(db *sql.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")
		_, err := db.Exec("UPDATE coupons SET is_redeemed = true, redeemed_at = $1 WHERE id = $2", time.Now().In(getWIBLocation()), id)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Gagal update database"})
		}
		return c.JSON(fiber.Map{"message": "Kupon berhasil di-redeem!"})
	}
}
