CREATE TABLE IF NOT EXISTS t_p32278697_solar_energy_initiat.places (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'other',
  address TEXT,
  city VARCHAR(100) NOT NULL DEFAULT 'Анапа',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  access_rating SMALLINT NOT NULL DEFAULT 3 CHECK (access_rating BETWEEN 1 AND 5),
  access_comment TEXT,
  features TEXT[] DEFAULT '{}',
  photo_url TEXT,
  website TEXT,
  phone VARCHAR(50),
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);