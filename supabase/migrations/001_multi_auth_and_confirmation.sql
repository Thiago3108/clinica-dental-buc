-- ============================================
-- MIGRATION 001: Multi-auth + Manual WhatsApp confirmation
-- ============================================
-- Ejecuta este script en el SQL Editor de Supabase
-- DESPUÉS de haber corrido schema.sql.
-- Si vas a hacer una instalación nueva desde cero,
-- ya está todo incluido en schema.sql.
-- ============================================

-- 1. Tabla de roles de usuarios
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'specialist')),
  specialist_id UUID REFERENCES specialists(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT specialist_required CHECK (
    (role = 'specialist' AND specialist_id IS NOT NULL) OR
    (role = 'super_admin' AND specialist_id IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_specialist ON user_roles(specialist_id);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin full access user_roles" ON user_roles;
CREATE POLICY "Admin full access user_roles" ON user_roles FOR ALL USING (true) WITH CHECK (true);

-- 2. Tracking de confirmación manual
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS confirmation_sent BOOLEAN DEFAULT false;

-- 2b. Datos de contacto del centro (si aún no están)
UPDATE dental_centers
SET
  whatsapp = COALESCE(NULLIF(whatsapp, ''), '573138618055'),
  phone = COALESCE(NULLIF(phone, ''), '+573138618055'),
  address = COALESCE(NULLIF(address, ''), 'Bucaramanga, Santander'),
  google_maps_url = COALESCE(NULLIF(google_maps_url, ''), 'https://www.google.com/maps?q=7.1124369,-73.1115091&hl=es&z=17&output=embed')
WHERE slug = 'buc';

-- 3. (Opcional) Asignar al usuario actual como super_admin
-- Reemplaza 'TU_EMAIL_AQUI' por el email del usuario admin
-- que creaste en Supabase Auth.
-- Si no lo haces, no podrás entrar al panel admin.
--
-- DO $$
-- DECLARE
--   admin_user_id UUID;
-- BEGIN
--   SELECT id INTO admin_user_id FROM auth.users WHERE email = 'TU_EMAIL_AQUI';
--   IF admin_user_id IS NOT NULL THEN
--     INSERT INTO user_roles (user_id, role) VALUES (admin_user_id, 'super_admin')
--     ON CONFLICT (user_id) DO NOTHING;
--   END IF;
-- END $$;
