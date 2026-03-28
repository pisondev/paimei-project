ALTER TABLE coupons DROP COLUMN drawn_week;
ALTER TABLE coupons DROP COLUMN unlocked_at;

ALTER TABLE coupons ADD COLUMN week_number INT;