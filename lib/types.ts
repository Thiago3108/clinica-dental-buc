export type DentalCenter = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  whatsapp: string | null;
  phone: string | null;
  instagram: string | null;
  email: string | null;
  address: string | null;
  google_maps_url: string | null;
  timezone: string;
  primary_color: string | null;
  accent_color: string | null;
  is_active: boolean;
};

export type Specialty = {
  id: string;
  dental_center_id: string;
  name: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
};

export type Specialist = {
  id: string;
  dental_center_id: string;
  name: string;
  slug: string;
  photo_url: string | null;
  title: string | null;
  description: string | null;
  phone: string | null;
  email: string | null;
  calendar_id: string | null;
  google_refresh_token: string | null;
  is_active: boolean;
  sort_order: number;
};

export type SpecialistWithSpecialties = Specialist & {
  specialties: Specialty[];
};

export type Treatment = {
  id: string;
  dental_center_id: string;
  specialty_id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number | null;
  is_active: boolean;
  sort_order: number;
};

export type Patient = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
};

export type AppointmentStatus =
  | "confirmed"
  | "cancelled"
  | "completed"
  | "no_show"
  | "pending";

export type AppointmentType = "first_visit" | "treatment";

export type Appointment = {
  id: string;
  dental_center_id: string;
  specialist_id: string;
  specialty_id: string | null;
  treatment_id: string | null;
  patient_id: string;
  appointment_type: AppointmentType;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  reason: string | null;
  notes: string | null;
  is_first_visit: boolean;
  confirmation_sent: boolean;
  reminder_sent: boolean;
  google_calendar_event_id: string | null;
};

export type UserRole = "super_admin" | "specialist";

export type UserRoleRecord = {
  id: string;
  user_id: string;
  role: UserRole;
  specialist_id: string | null;
};

export type WorkingHour = {
  id: string;
  specialist_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
};

export type Break = {
  id: string;
  specialist_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
};

export type TimeSlot = {
  startTime: string;
  endTime: string;
  available: boolean;
  label: string;
};

export type DayAvailability = {
  date: string;
  label: string;
  available: boolean;
  slotsCount: number;
  slots: TimeSlot[];
  status: "open" | "few" | "full" | "closed";
};
