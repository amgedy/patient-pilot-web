export interface Patient {
  id: string;
  name: string;
  phone: string;
  notes: string | null;
  created_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  service: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  created_at: string;
  patients?: Patient | null;
}
