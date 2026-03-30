package core

import (
	"database/sql"

	"paimei-backend/internal/core/middleware" // Import middleware yang baru dibuat
	"paimei-backend/internal/modules/auth"
	"paimei-backend/internal/modules/coupons"
	"paimei-backend/internal/modules/invitations"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App, db *sql.DB) {
	api := app.Group("/api")

	// ==========================================
	// 1. PUBLIC ROUTES (Tanpa Token)
	// ==========================================
	// Catatan: Pastikan nama fungsinya auth.Login(db) sesuai dengan handler.go yang baru
	api.Post("/login", auth.Login(db))
	// ==========================================
	// 2. PROTECTED ROUTES (Wajib Token JWT)
	// ==========================================
	// Semua route di dalam grup "protected" ini akan dicegat oleh middleware.Protected()
	protected := api.Group("/", middleware.Protected())

	// Routes Coupons (Amey & Paisen)
	protected.Get("/coupons/state", coupons.GetCouponState(db))
	protected.Post("/coupons/draw", coupons.DrawRandomCoupon(db))
	protected.Post("/coupons/:id/redeem", coupons.RedeemCoupon(db))

	// Routes Admin Coupons (Paisen Only)
	protected.Post("/coupons/admin", coupons.AddCoupon(db))
	protected.Put("/coupons/admin/:id", coupons.UpdateCoupon(db))
	protected.Delete("/coupons/admin/:id", coupons.DeleteCoupon(db))

	// Routes Invitations
	protected.Get("/invitation", invitations.GetInvitation(db))
	protected.Post("/invitation/accept", invitations.AcceptInvitation(db))
	protected.Post("/invitation/paisen", invitations.UpdatePaisenOutfit(db))
	protected.Get("/coupons/admin", coupons.GetAllCouponsAdmin(db))
	protected.Post("/invitation/reset", invitations.ResetInvitation(db))
}
