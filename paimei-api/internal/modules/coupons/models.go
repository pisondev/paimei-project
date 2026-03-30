package coupons

import "time"

type Coupon struct {
	ID          int        `json:"id"`
	Title       string     `json:"title"`
	Description string     `json:"description"`
	IsRedeemed  bool       `json:"is_redeemed"`
	DrawnWeek   *int       `json:"drawn_week"`
	UnlockedAt  *time.Time `json:"unlocked_at"`
}

type CouponState struct {
	CurrentWeek     int       `json:"current_week"`
	NextWeekStart   time.Time `json:"next_week_start"`
	CanDraw         bool      `json:"can_draw"`
	UnlockedCoupons []Coupon  `json:"unlocked_coupons"`
	TotalCoupons    int       `json:"total_coupons"`
}

type CouponInput struct {
	Title       string `json:"title"`
	Description string `json:"description"`
}
