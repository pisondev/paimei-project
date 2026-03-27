CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE coupons (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    is_redeemed BOOLEAN DEFAULT FALSE,
    redeemed_at TIMESTAMP,
    week_number INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE invitations (
    id SERIAL PRIMARY KEY,
    event_name VARCHAR(100) DEFAULT 'Birthday Date',
    location_dummy TEXT NOT NULL,
    event_date TIMESTAMP NOT NULL,
    selected_color VARCHAR(20),
    is_accepted BOOLEAN DEFAULT FALSE,
    accepted_at TIMESTAMP
);

-- Data Seeding Awal
INSERT INTO users (username, password_hash, role) VALUES 
('paisen', 'dummy_hash', 'admin'),
('amey', 'dummy_hash', 'user');

INSERT INTO coupons (title, description, week_number) VALUES 
('The Master Chef', 'Request makanan/jajanan apapun bebas protes', 1),
('Tierratie Off-Duty Day', 'Libur sehari dari urusan kerjaan, Paisen yang handle', 2),
('Movie Director', 'Hak mutlak pilih film dan cemilan', 3),
('The Royal Treatment', 'Pijat punggung & pundak 20 menit', 4),
('Win Any Argument Pass', 'Kartu sakti menang debat otomatis', 5);

INSERT INTO invitations (location_dummy, event_date) VALUES 
('Secret Romantic Place (TBA)', '2026-04-11 16:00:00');