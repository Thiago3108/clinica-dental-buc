-- ============================================
-- CLINICA DENTAL BUC - DATABASE SCHEMA
-- ============================================

-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ============================================
-- TABLA: dental_centers
-- ============================================
CREATE TABLE dental_centers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  whatsapp TEXT,
  phone TEXT,
  instagram TEXT,
  email TEXT,
  address TEXT,
  google_maps_url TEXT,
  timezone TEXT NOT NULL DEFAULT 'America/Bogota',
  primary_color TEXT DEFAULT '#1E6DB5',
  accent_color TEXT DEFAULT '#60A5FA',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLA: specialties
-- ============================================
CREATE TABLE specialties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dental_center_id UUID NOT NULL REFERENCES dental_centers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLA: specialists
-- ============================================
CREATE TABLE specialists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dental_center_id UUID NOT NULL REFERENCES dental_centers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  photo_url TEXT,
  title TEXT,
  description TEXT,
  phone TEXT,
  email TEXT,
  calendar_id TEXT,
  google_refresh_token TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(dental_center_id, slug)
);

-- ============================================
-- TABLA: specialist_specialties (relacion N:N)
-- ============================================
CREATE TABLE specialist_specialties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  specialist_id UUID NOT NULL REFERENCES specialists(id) ON DELETE CASCADE,
  specialty_id UUID NOT NULL REFERENCES specialties(id) ON DELETE CASCADE,
  UNIQUE(specialist_id, specialty_id)
);

-- ============================================
-- TABLA: treatments
-- ============================================
CREATE TABLE treatments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dental_center_id UUID NOT NULL REFERENCES dental_centers(id) ON DELETE CASCADE,
  specialty_id UUID NOT NULL REFERENCES specialties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INT NOT NULL DEFAULT 30,
  price DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLA: patients
-- ============================================
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_patients_phone ON patients(phone);

-- ============================================
-- TABLA: appointments
-- ============================================
CREATE TYPE appointment_status AS ENUM (
  'confirmed',
  'cancelled',
  'completed',
  'no_show',
  'pending'
);

CREATE TYPE appointment_type AS ENUM (
  'first_visit',
  'treatment'
);

CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dental_center_id UUID NOT NULL REFERENCES dental_centers(id) ON DELETE CASCADE,
  specialist_id UUID NOT NULL REFERENCES specialists(id) ON DELETE CASCADE,
  specialty_id UUID REFERENCES specialties(id),
  treatment_id UUID REFERENCES treatments(id),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  appointment_type appointment_type NOT NULL DEFAULT 'first_visit',
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status appointment_status NOT NULL DEFAULT 'pending',
  reason TEXT,
  notes TEXT,
  is_first_visit BOOLEAN DEFAULT false,
  confirmation_sent BOOLEAN DEFAULT false,
  reminder_sent BOOLEAN DEFAULT false,
  google_calendar_event_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  EXCLUDE USING gist (
    specialist_id WITH =,
    tstzrange(start_time, end_time) WITH &&
  ) WHERE (status NOT IN ('cancelled'))
);

CREATE INDEX idx_appointments_specialist ON appointments(specialist_id, start_time);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_reminder ON appointments(reminder_sent, start_time) WHERE status != 'cancelled';

-- ============================================
-- TABLA: specialist_working_hours
-- ============================================
CREATE TABLE specialist_working_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  specialist_id UUID NOT NULL REFERENCES specialists(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(specialist_id, day_of_week)
);

-- ============================================
-- TABLA: specialist_breaks
-- ============================================
CREATE TABLE specialist_breaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  specialist_id UUID NOT NULL REFERENCES specialists(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- ============================================
-- TABLA: blocked_dates
-- ============================================
CREATE TABLE blocked_dates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  specialist_id UUID REFERENCES specialists(id) ON DELETE CASCADE,
  dental_center_id UUID REFERENCES dental_centers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLA: user_roles (autenticación por especialista)
-- ============================================
CREATE TABLE user_roles (
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

CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_specialist ON user_roles(specialist_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE dental_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialists ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialist_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialist_working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialist_breaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Politicas publicas de lectura
CREATE POLICY "Public read dental_centers" ON dental_centers FOR SELECT USING (is_active = true);
CREATE POLICY "Public read specialties" ON specialties FOR SELECT USING (is_active = true);
CREATE POLICY "Public read specialists" ON specialists FOR SELECT USING (is_active = true);
CREATE POLICY "Public read specialist_specialties" ON specialist_specialties FOR SELECT USING (true);
CREATE POLICY "Public read treatments" ON treatments FOR SELECT USING (is_active = true);
CREATE POLICY "Public read working_hours" ON specialist_working_hours FOR SELECT USING (true);
CREATE POLICY "Public read breaks" ON specialist_breaks FOR SELECT USING (true);
CREATE POLICY "Public read blocked_dates" ON blocked_dates FOR SELECT USING (true);

-- Politicas publicas de insercion
CREATE POLICY "Public insert patients" ON patients FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert appointments" ON appointments FOR INSERT WITH CHECK (true);

-- Politicas publicas de lectura para pacientes
CREATE POLICY "Public read patients" ON patients FOR SELECT USING (true);
CREATE POLICY "Public read appointments" ON appointments FOR SELECT USING (true);

-- Politicas para service_role (admin)
CREATE POLICY "Admin full access dental_centers" ON dental_centers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access specialties" ON specialties FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access specialists" ON specialists FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access specialist_specialties" ON specialist_specialties FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access treatments" ON treatments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access patients" ON patients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access appointments" ON appointments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access working_hours" ON specialist_working_hours FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access breaks" ON specialist_breaks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access blocked_dates" ON blocked_dates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access user_roles" ON user_roles FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- DATOS INICIALES: Clinica Dental Buc
-- ============================================
INSERT INTO dental_centers (name, slug, description, phone, whatsapp, address, google_maps_url, timezone)
VALUES (
  'Clínica Dental Buc',
  'buc',
  'Centro de especialistas en salud bucal. Ofrecemos atención integral con los mejores profesionales en endodoncia, estética dental, periodoncia, ortodoncia, ortopedia y cirugía maxilofacial.',
  '+573138618055',
  '573138618055',
  'Bucaramanga, Santander',
  'https://www.google.com/maps?q=7.1124369,-73.1115091&hl=es&z=17&output=embed',
  'America/Bogota'
);

-- Especialidades
INSERT INTO specialties (dental_center_id, name, description, icon, sort_order) VALUES
((SELECT id FROM dental_centers WHERE slug = 'buc'), 'Endodoncia', 'Tratamiento del nervio dental. Si tienes dolor de muela intenso, sensibilidad al frío o calor, o infección dental.', 'tooth', 1),
((SELECT id FROM dental_centers WHERE slug = 'buc'), 'Estética Dental', 'Mejora la apariencia de tu sonrisa. Blanqueamiento, carillas, restauraciones estéticas y diseño de sonrisa.', 'sparkles', 2),
((SELECT id FROM dental_centers WHERE slug = 'buc'), 'Periodoncia', 'Cuidado de las encías. Si tienes encías sangrantes, inflamadas, mal aliento persistente o movilidad dental.', 'shield', 3),
((SELECT id FROM dental_centers WHERE slug = 'buc'), 'Ortodoncia', 'Corrección de la posición de los dientes. Brackets metálicos, estéticos y tratamientos de alineación dental.', 'align-center', 4),
((SELECT id FROM dental_centers WHERE slug = 'buc'), 'Ortopedia Maxilofacial', 'Corrección del crecimiento óseo facial. Aparatos ortopédicos para niños y adolescentes en desarrollo.', 'bone', 5),
((SELECT id FROM dental_centers WHERE slug = 'buc'), 'Cirugía Maxilofacial', 'Procedimientos quirúrgicos dentales. Extracciones complejas, implantes dentales y cirugías orales.', 'syringe', 6);

-- Especialistas
INSERT INTO specialists (dental_center_id, name, slug, title, description, photo_url, sort_order) VALUES
((SELECT id FROM dental_centers WHERE slug = 'buc'), 'Dr. Jhonny Contreras', 'jhonny-contreras', 'Especialista en Endodoncia y Estética Dental', 'Profesional con amplia experiencia en tratamientos de conducto y restauraciones estéticas.', '/img/profesionales/jonny_contreras.png', 1),
((SELECT id FROM dental_centers WHERE slug = 'buc'), 'Dr. Felipe Quiceno', 'felipe-quiceno', 'Especialista en Periodoncia', 'Experto en el diagnóstico y tratamiento de enfermedades de las encías y tejidos de soporte dental.', '/img/profesionales/Drfelipequinceno.png', 2),
((SELECT id FROM dental_centers WHERE slug = 'buc'), 'Dr. Maximo Polonia', 'maximo-polonia', 'Especialista en Ortodoncia y Ortopedia Maxilofacial', 'Especialista en corrección de maloclusiones y tratamientos de ortopedia facial.', '/img/profesionales/maximo_polonia.png', 3),
((SELECT id FROM dental_centers WHERE slug = 'buc'), 'Dra. Vanessa Capacho', 'vanessa-capacho', 'Especialista en Cirugía Maxilofacial', 'Cirujana experta en procedimientos quirúrgicos orales, extracciones complejas e implantes dentales.', '/img/profesionales/vanessa_capacho.png', 4);

-- Relaciones especialista-especialidad
INSERT INTO specialist_specialties (specialist_id, specialty_id) VALUES
((SELECT id FROM specialists WHERE slug = 'jhonny-contreras'), (SELECT id FROM specialties WHERE name = 'Endodoncia')),
((SELECT id FROM specialists WHERE slug = 'jhonny-contreras'), (SELECT id FROM specialties WHERE name = 'Estética Dental')),
((SELECT id FROM specialists WHERE slug = 'felipe-quiceno'), (SELECT id FROM specialties WHERE name = 'Periodoncia')),
((SELECT id FROM specialists WHERE slug = 'maximo-polonia'), (SELECT id FROM specialties WHERE name = 'Ortodoncia')),
((SELECT id FROM specialists WHERE slug = 'maximo-polonia'), (SELECT id FROM specialties WHERE name = 'Ortopedia Maxilofacial')),
((SELECT id FROM specialists WHERE slug = 'vanessa-capacho'), (SELECT id FROM specialties WHERE name = 'Cirugía Maxilofacial'));

-- Tratamientos por especialidad
-- Endodoncia
INSERT INTO treatments (dental_center_id, specialty_id, name, description, duration_minutes, price, sort_order) VALUES
((SELECT id FROM dental_centers WHERE slug = 'buc'), (SELECT id FROM specialties WHERE name = 'Endodoncia'), 'Endodoncia Unirradicular', 'Tratamiento de conducto en dientes con una sola raíz (incisivos, caninos).', 60, NULL, 1),
((SELECT id FROM dental_centers WHERE slug = 'buc'), (SELECT id FROM specialties WHERE name = 'Endodoncia'), 'Endodoncia Birradicular', 'Tratamiento de conducto en dientes con dos raíces (premolares).', 90, NULL, 2),
((SELECT id FROM dental_centers WHERE slug = 'buc'), (SELECT id FROM specialties WHERE name = 'Endodoncia'), 'Endodoncia Multirradicular', 'Tratamiento de conducto en dientes con múltiples raíces (molares).', 120, NULL, 3),
((SELECT id FROM dental_centers WHERE slug = 'buc'), (SELECT id FROM specialties WHERE name = 'Endodoncia'), 'Retratamiento Endodóntico', 'Repetición de un tratamiento de conducto previo que no fue exitoso.', 90, NULL, 4);

-- Estetica Dental
INSERT INTO treatments (dental_center_id, specialty_id, name, description, duration_minutes, price, sort_order) VALUES
((SELECT id FROM dental_centers WHERE slug = 'buc'), (SELECT id FROM specialties WHERE name = 'Estética Dental'), 'Blanqueamiento Dental', 'Aclaramiento profesional del color de los dientes en consultorio.', 60, NULL, 1),
((SELECT id FROM dental_centers WHERE slug = 'buc'), (SELECT id FROM specialties WHERE name = 'Estética Dental'), 'Carillas de Porcelana', 'Láminas ultrafinas de porcelana para mejorar forma y color dental.', 90, NULL, 2),
((SELECT id FROM dental_centers WHERE slug = 'buc'), (SELECT id FROM specialties WHERE name = 'Estética Dental'), 'Diseño de Sonrisa (Consulta)', 'Evaluación y planificación del tratamiento estético integral.', 45, NULL, 3),
((SELECT id FROM dental_centers WHERE slug = 'buc'), (SELECT id FROM specialties WHERE name = 'Estética Dental'), 'Restauración con Composite', 'Reparación estética de dientes con resina del color natural.', 45, NULL, 4);

-- Periodoncia
INSERT INTO treatments (dental_center_id, specialty_id, name, description, duration_minutes, price, sort_order) VALUES
((SELECT id FROM dental_centers WHERE slug = 'buc'), (SELECT id FROM specialties WHERE name = 'Periodoncia'), 'Profilaxis / Limpieza Dental', 'Limpieza profesional completa para eliminar placa y sarro.', 45, NULL, 1),
((SELECT id FROM dental_centers WHERE slug = 'buc'), (SELECT id FROM specialties WHERE name = 'Periodoncia'), 'Detartraje Supragingival', 'Remoción de cálculo dental por encima de la línea de la encía.', 60, NULL, 2),
((SELECT id FROM dental_centers WHERE slug = 'buc'), (SELECT id FROM specialties WHERE name = 'Periodoncia'), 'Detartraje Subgingival', 'Limpieza profunda por debajo de la línea de la encía.', 90, NULL, 3),
((SELECT id FROM dental_centers WHERE slug = 'buc'), (SELECT id FROM specialties WHERE name = 'Periodoncia'), 'Cirugía Periodontal', 'Procedimiento quirúrgico para tratar enfermedad periodontal avanzada.', 120, NULL, 4);

-- Ortodoncia
INSERT INTO treatments (dental_center_id, specialty_id, name, description, duration_minutes, price, sort_order) VALUES
((SELECT id FROM dental_centers WHERE slug = 'buc'), (SELECT id FROM specialties WHERE name = 'Ortodoncia'), 'Consulta de Ortodoncia', 'Evaluación inicial, diagnóstico y plan de tratamiento de ortodoncia.', 30, NULL, 1),
((SELECT id FROM dental_centers WHERE slug = 'buc'), (SELECT id FROM specialties WHERE name = 'Ortodoncia'), 'Instalación de Brackets', 'Colocación de brackets metálicos o estéticos.', 90, NULL, 2),
((SELECT id FROM dental_centers WHERE slug = 'buc'), (SELECT id FROM specialties WHERE name = 'Ortodoncia'), 'Control de Ortodoncia', 'Cita de seguimiento y ajuste de brackets o alineadores.', 30, NULL, 3);

-- Ortopedia Maxilofacial
INSERT INTO treatments (dental_center_id, specialty_id, name, description, duration_minutes, price, sort_order) VALUES
((SELECT id FROM dental_centers WHERE slug = 'buc'), (SELECT id FROM specialties WHERE name = 'Ortopedia Maxilofacial'), 'Consulta de Ortopedia', 'Evaluación del crecimiento y desarrollo maxilofacial.', 30, NULL, 1),
((SELECT id FROM dental_centers WHERE slug = 'buc'), (SELECT id FROM specialties WHERE name = 'Ortopedia Maxilofacial'), 'Instalación de Aparato Ortopédico', 'Colocación de aparatología ortopédica funcional.', 60, NULL, 2),
((SELECT id FROM dental_centers WHERE slug = 'buc'), (SELECT id FROM specialties WHERE name = 'Ortopedia Maxilofacial'), 'Control Ortopédico', 'Seguimiento y ajuste de aparatos ortopédicos.', 30, NULL, 3);

-- Cirugia Maxilofacial
INSERT INTO treatments (dental_center_id, specialty_id, name, description, duration_minutes, price, sort_order) VALUES
((SELECT id FROM dental_centers WHERE slug = 'buc'), (SELECT id FROM specialties WHERE name = 'Cirugía Maxilofacial'), 'Extracción Simple', 'Extracción de dientes sin complicaciones.', 30, NULL, 1),
((SELECT id FROM dental_centers WHERE slug = 'buc'), (SELECT id FROM specialties WHERE name = 'Cirugía Maxilofacial'), 'Extracción de Muela del Juicio', 'Extracción quirúrgica de terceros molares.', 60, NULL, 2),
((SELECT id FROM dental_centers WHERE slug = 'buc'), (SELECT id FROM specialties WHERE name = 'Cirugía Maxilofacial'), 'Implante Dental', 'Colocación de implante de titanio para reemplazo dental.', 120, NULL, 3),
((SELECT id FROM dental_centers WHERE slug = 'buc'), (SELECT id FROM specialties WHERE name = 'Cirugía Maxilofacial'), 'Consulta Prequirúrgica', 'Evaluación y planificación previa a procedimiento quirúrgico.', 30, NULL, 4);

-- Horarios de trabajo por defecto (Lunes a Viernes 8:00-12:00, 14:00-18:00)
DO $$
DECLARE
  spec RECORD;
  d INT;
BEGIN
  FOR spec IN SELECT id FROM specialists LOOP
    FOR d IN 1..5 LOOP
      INSERT INTO specialist_working_hours (specialist_id, day_of_week, start_time, end_time, is_active)
      VALUES (spec.id, d, '08:00', '18:00', true);
      INSERT INTO specialist_breaks (specialist_id, day_of_week, start_time, end_time, is_active)
      VALUES (spec.id, d, '12:00', '14:00', true);
    END LOOP;
    INSERT INTO specialist_working_hours (specialist_id, day_of_week, start_time, end_time, is_active)
    VALUES (spec.id, 6, '08:00', '12:00', true);
  END LOOP;
END $$;
