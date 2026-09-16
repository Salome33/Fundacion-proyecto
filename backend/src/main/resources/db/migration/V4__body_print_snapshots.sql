ALTER TABLE modelo_corporal
    ADD COLUMN IF NOT EXISTS body_print_front TEXT,
    ADD COLUMN IF NOT EXISTS body_print_back TEXT;
