-- ============================================================
-- Parking API — Database Schema
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(20) NOT NULL DEFAULT 'viewer'
                CHECK (role IN ('admin', 'operator', 'viewer')),
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PARKING LOTS
-- ============================================================
CREATE TABLE IF NOT EXISTS parking_lots (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(150) NOT NULL,
  address       TEXT NOT NULL,
  city          VARCHAR(100),
  latitude      DECIMAL(9,6),
  longitude     DECIMAL(9,6),
  total_spots   INTEGER NOT NULL DEFAULT 0,
  open_time     TIME,
  close_time    TIME,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_by    UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PARKING ZONES (sections within a lot e.g. Floor 1, Zone A)
-- ============================================================
CREATE TABLE IF NOT EXISTS parking_zones (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lot_id        UUID NOT NULL REFERENCES parking_lots(id) ON DELETE CASCADE,
  name          VARCHAR(100) NOT NULL,
  level         VARCHAR(20),
  total_spots   INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PARKING SPOTS
-- ============================================================
CREATE TABLE IF NOT EXISTS parking_spots (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lot_id        UUID NOT NULL REFERENCES parking_lots(id) ON DELETE CASCADE,
  zone_id       UUID REFERENCES parking_zones(id) ON DELETE SET NULL,
  spot_number   VARCHAR(20) NOT NULL,
  spot_type     VARCHAR(20) NOT NULL DEFAULT 'standard'
                CHECK (spot_type IN ('standard', 'handicapped', 'ev_charging', 'reserved', 'motorcycle')),
  status        VARCHAR(20) NOT NULL DEFAULT 'available'
                CHECK (status IN ('available', 'occupied', 'reserved', 'maintenance')),
  sensor_id     VARCHAR(100),          -- ID of the physical IoT sensor
  last_updated  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (lot_id, spot_number)
);

-- ============================================================
-- SPOT STATUS HISTORY (for analytics)
-- ============================================================
CREATE TABLE IF NOT EXISTS spot_history (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  spot_id       UUID NOT NULL REFERENCES parking_spots(id) ON DELETE CASCADE,
  lot_id        UUID NOT NULL REFERENCES parking_lots(id) ON DELETE CASCADE,
  old_status    VARCHAR(20),
  new_status    VARCHAR(20) NOT NULL,
  source        VARCHAR(20) NOT NULL DEFAULT 'sensor'
                CHECK (source IN ('sensor', 'camera', 'manual', 'system')),
  changed_by    UUID REFERENCES users(id) ON DELETE SET NULL,
  changed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_spots_lot_id     ON parking_spots(lot_id);
CREATE INDEX IF NOT EXISTS idx_spots_zone_id    ON parking_spots(zone_id);
CREATE INDEX IF NOT EXISTS idx_spots_status     ON parking_spots(status);
CREATE INDEX IF NOT EXISTS idx_history_spot_id  ON spot_history(spot_id);
CREATE INDEX IF NOT EXISTS idx_history_lot_id   ON spot_history(lot_id);
CREATE INDEX IF NOT EXISTS idx_history_changed  ON spot_history(changed_at);

-- ============================================================
-- AUTO-UPDATE updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trg_lots_updated_at
  BEFORE UPDATE ON parking_lots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trg_zones_updated_at
  BEFORE UPDATE ON parking_zones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
