-- Hapus kolom statis lama
ALTER TABLE coupons DROP COLUMN week_number;

-- Tambahkan kolom dinamis untuk sistem Gacha & Timeline
ALTER TABLE coupons ADD COLUMN drawn_week INT;
ALTER TABLE coupons ADD COLUMN unlocked_at TIMESTAMP;