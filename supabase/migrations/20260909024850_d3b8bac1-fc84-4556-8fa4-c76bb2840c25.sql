CREATE TABLE public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patients TO anon, authenticated;
GRANT ALL ON public.patients TO service_role;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clinic_full_access_patients" ON public.patients FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  service TEXT NOT NULL CHECK (service IN ('تنظيف الأسنان', 'حشو الأسنان', 'كشف عام')),
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL CHECK (appointment_time >= TIME '09:00' AND appointment_time < TIME '14:00'),
  status TEXT NOT NULL DEFAULT 'بالانتظار' CHECK (status IN ('مؤكد', 'بالانتظار', 'مكتمل', 'ملغي')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO anon, authenticated;
GRANT ALL ON public.appointments TO service_role;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clinic_full_access_appointments" ON public.appointments FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

INSERT INTO public.patients (name, phone, notes) VALUES
  ('أحمد محمود', '0102345678', 'حساسية من البنج الموضعي'),
  ('سارة عبد الله', '0114567890', NULL),
  ('كريم يوسف', '0126789012', 'مريض جديد'),
  ('منى إبراهيم', '0105890123', NULL),
  ('خالد سمير', '0113456789', 'يعاني من سكر الدم'),
  ('هالة مصطفى', '0125679012', NULL);

INSERT INTO public.appointments (patient_id, service, appointment_date, appointment_time, status)
SELECT p.id, s.service, CURRENT_DATE, s.t, s.status
FROM (VALUES
  ('أحمد محمود', 'تنظيف الأسنان', TIME '09:00', 'مؤكد'),
  ('سارة عبد الله', 'حشو الأسنان', TIME '09:30', 'بالانتظار'),
  ('كريم يوسف', 'كشف عام', TIME '10:15', 'مؤكد'),
  ('منى إبراهيم', 'تنظيف الأسنان', TIME '11:00', 'مؤكد'),
  ('خالد سمير', 'حشو الأسنان', TIME '12:30', 'بالانتظار'),
  ('هالة مصطفى', 'كشف عام', TIME '13:30', 'مؤكد')
) AS s(pname, service, t, status)
JOIN public.patients p ON p.name = s.pname;