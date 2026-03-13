CREATE TABLE IF NOT EXISTS guns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  caliber TEXT NOT NULL,
  photo_url TEXT,
  base_round_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shooting_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gun_id UUID REFERENCES guns(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  rounds_fired INTEGER NOT NULL,
  range_location TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cleaning_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gun_id UUID REFERENCES guns(id) ON DELETE CASCADE,
  cleaned_at DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS range_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL
);
