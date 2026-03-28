package core

import (
	"database/sql"

	"paimei-backend/internal/modules/auth"
	"paimei-backend/internal/modules/coupons"
	"paimei-backend/internal/modules/invitations"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App, db *sql.DB) {
	api := app.Group("/api")

	// Routes Auth
	api.Post("/login", auth.HandleLogin(db))

	// Routes Coupons
	api.Get("/coupons/state", coupons.GetCouponState(db))
	api.Post("/coupons/draw", coupons.DrawRandomCoupon(db))
	api.Post("/coupons/:id/redeem", coupons.RedeemCoupon(db))

	// Routes Invitations
	api.Get("/invitation", invitations.GetInvitation(db))
	api.Post("/invitation/accept", invitations.AcceptInvitation(db))
	api.Post("/invitation/paisen", invitations.UpdatePaisenOutfit(db))
}
