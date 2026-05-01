-- ============================================================
--  Liga Deportiva — Supabase Schema
--  Ejecuta este script en el SQL Editor de tu proyecto Supabase
-- ============================================================

-- Tabla de integrantes (jugadores)
CREATE TABLE IF NOT EXISTS integrantes (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre       TEXT        NOT NULL,
  fecha_registro DATE      NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de pagos
CREATE TABLE IF NOT EXISTS pagos (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  jugador_id   UUID        REFERENCES integrantes(id) ON DELETE CASCADE,
  fecha        DATE        NOT NULL,
  monto        INTEGER     NOT NULL DEFAULT 25,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(jugador_id, fecha)          -- un pago por jugador por fecha
);

-- Tabla de gastos de la liga
CREATE TABLE IF NOT EXISTS gastos (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  concepto     TEXT        NOT NULL,
  categoria    TEXT        NOT NULL,
  fecha        DATE        NOT NULL,
  monto        INTEGER     NOT NULL,
  nota         TEXT        DEFAULT '',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Cola de llegada / turnos del día
CREATE TABLE IF NOT EXISTS turnos (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  jugador_id   UUID        REFERENCES integrantes(id) ON DELETE CASCADE,
  posicion     INTEGER     NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Configuración general (fecha_base, etc.)
CREATE TABLE IF NOT EXISTS configuracion (
  key          TEXT        PRIMARY KEY,
  value        TEXT
);

-- ============================================================
--  Row Level Security — acceso público (sin autenticación)
--  Cambia las policies si agregas auth de usuarios después
-- ============================================================
ALTER TABLE integrantes  ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos         ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos        ENABLE ROW LEVEL SECURITY;
ALTER TABLE turnos        ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;

-- Everyone can read; only authenticated users (admins) can write
-- Run this in Supabase SQL Editor after deleting existing "public_all" policies

DROP POLICY IF EXISTS "public_all" ON integrantes;
DROP POLICY IF EXISTS "public_all" ON pagos;
DROP POLICY IF EXISTS "public_all" ON gastos;
DROP POLICY IF EXISTS "public_all" ON turnos;
DROP POLICY IF EXISTS "public_all" ON configuracion;

-- integrantes
CREATE POLICY "public_read"  ON integrantes FOR SELECT USING (true);
CREATE POLICY "auth_write"   ON integrantes FOR ALL
  USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- pagos
CREATE POLICY "public_read"  ON pagos FOR SELECT USING (true);
CREATE POLICY "auth_write"   ON pagos FOR ALL
  USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- gastos
CREATE POLICY "public_read"  ON gastos FOR SELECT USING (true);
CREATE POLICY "auth_write"   ON gastos FOR ALL
  USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- turnos
CREATE POLICY "public_read"  ON turnos FOR SELECT USING (true);
CREATE POLICY "auth_write"   ON turnos FOR ALL
  USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- configuracion
CREATE POLICY "public_read"  ON configuracion FOR SELECT USING (true);
CREATE POLICY "auth_write"   ON configuracion FOR ALL
  USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
