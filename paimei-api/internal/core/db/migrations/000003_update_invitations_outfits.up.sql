-- Ubah kolom lama menjadi warna atasan Amey
ALTER TABLE invitations RENAME COLUMN selected_color TO amey_top_color;

-- Tambah preferensi pakaian Amey
ALTER TABLE invitations ADD COLUMN amey_outfit VARCHAR(50) DEFAULT 'dress';
ALTER TABLE invitations ADD COLUMN amey_bottom_color VARCHAR(50);

-- Tambah preferensi pakaian Paisen
ALTER TABLE invitations ADD COLUMN paisen_outfit VARCHAR(50) DEFAULT 'suit';
ALTER TABLE invitations ADD COLUMN paisen_top_color VARCHAR(50) DEFAULT '#1c1917';
ALTER TABLE invitations ADD COLUMN paisen_bottom_color VARCHAR(50) DEFAULT '#1c1917';