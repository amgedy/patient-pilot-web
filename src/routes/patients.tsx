import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Appointment, Patient } from "@/lib/types";
import {
  STATUS_STYLES,
  STATUSES,
  formatDateAr,
  formatTime,
  toArabicDigits,
  type AppointmentStatus,
} from "@/lib/clinic";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/patients")({
  head: () => ({
    meta: [
      { title: "ملفات المرضى — عيادة نور لطب الأسنان" },
      {
        name: "description",
        content: "ملفات مرضى عيادة الأسنان بالاسم ورقم الهاتف وسجل المواعيد السابقة.",
      },
      { property: "og:title", content: "ملفات المرضى — عيادة نور لطب الأسنان" },
      { property: "og:description", content: "ملفات المرضى وسجل مواعيدهم في العيادة." },
    ],
  }),
  component: PatientsPage,
});

function PatientsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Patient | null>(null);

  const { data: patients = [] } = useQuery({
    queryKey: ["patients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Patient[];
    },
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ["appointments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*, patients(*)")
        .order("appointment_date", { ascending: false })
        .order("appointment_time", { ascending: true });
      if (error) throw error;
      return data as unknown as Appointment[];
    },
  });

  const filtered = patients.filter((p) => {
    if (!search.trim()) return true;
    const q = search.trim();
    return p.name.includes(q) || p.phone.includes(q);
  });

  const gradients = [
    "from-brand to-[#7DB4FF]",
    "from-mint to-[#4FC8B2]",
    "from-gold to-[#E0B055]",
    "from-rose to-[#F08AAB]",
  ];

  return (
    <>
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-line">
        <div className="flex items-center gap-4 px-4 md:px-8 h-16">
          <div>
            <h1 className="font-cairo font-extrabold text-lg leading-none">ملفات المرضى</h1>
            <div className="text-xs text-muted-foreground mt-1">
              {toArabicDigits(patients.length)} ملف مسجل
            </div>
          </div>
          <div className="ms-auto">
            <label className="flex items-center gap-2 h-10 px-3 rounded-xl bg-card border border-line text-sm text-muted-foreground">
              <span>بحث</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-40 md:w-52 bg-transparent outline-none placeholder:text-muted-foreground/60"
                placeholder="الاسم أو رقم الهاتف"
              />
            </label>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-8">
        {filtered.length === 0 && (
          <div className="rounded-2xl bg-card border border-line p-10 text-center text-muted-foreground text-sm">
            لا توجد ملفات مطابقة
          </div>
        )}
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p, i) => {
            const count = appointments.filter((a) => a.patient_id === p.id).length;
            return (
              <button
                key={p.id}
                onClick={() => setSelected(p)}
                className="rounded-2xl bg-card border border-line p-5 text-right hover:bg-brand-soft/30 transition-colors animate-[fade_.4s_ease_both]"
                style={{ animationDelay: `${(i % 9) * 40}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`size-11 rounded-xl bg-gradient-to-br ${gradients[i % gradients.length]} grid place-items-center text-primary-foreground font-cairo font-extrabold`}
                  >
                    {p.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm truncate">{p.name}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {count > 0 ? `${toArabicDigits(count)} مواعيد سابقة` : "مريض جديد"}
                    </div>
                  </div>
                </div>
                <div className="mt-4 rounded-xl bg-background border border-line px-3 py-2.5 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">رقم الهاتف</span>
                  <span dir="ltr" className="text-[13px] font-semibold text-ink">
                    {p.phone}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-lg" dir="rtl">
          {selected && (
            <PatientFile
              patient={selected}
              appointments={appointments.filter((a) => a.patient_id === selected.id)}
              onChanged={() => {
                queryClient.invalidateQueries({ queryKey: ["patients"] });
                queryClient.invalidateQueries({ queryKey: ["appointments"] });
              }}
              onDeleted={() => setSelected(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function PatientFile({
  patient,
  appointments,
  onChanged,
  onDeleted,
}: {
  patient: Patient;
  appointments: Appointment[];
  onChanged: () => void;
  onDeleted: () => void;
}) {
  const [notes, setNotes] = useState(patient.notes ?? "");
  const [saving, setSaving] = useState(false);

  const saveNotes = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("patients")
      .update({ notes: notes.trim() || null })
      .eq("id", patient.id);
    setSaving(false);
    if (error) {
      toast.error("تعذر حفظ الملاحظات");
      return;
    }
    toast.success("تم حفظ الملاحظات");
    onChanged();
  };

  const deletePatient = async () => {
    const { error } = await supabase.from("patients").delete().eq("id", patient.id);
    if (error) {
      toast.error("تعذر حذف الملف");
      return;
    }
    toast.success("تم حذف ملف المريض");
    onChanged();
    onDeleted();
  };

  const inputCls =
    "w-full px-3 py-2.5 rounded-xl bg-background border border-line text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-cairo">ملف المريض</DialogTitle>
      </DialogHeader>
      <div className="flex items-center gap-3 mt-1">
        <div className="size-12 rounded-2xl bg-gradient-to-br from-brand to-[#7DB4FF] grid place-items-center text-primary-foreground font-cairo font-extrabold text-lg">
          {patient.name.charAt(0)}
        </div>
        <div>
          <div className="font-bold text-base">{patient.name}</div>
          <div className="text-xs text-muted-foreground" dir="ltr">
            {patient.phone}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <label className="text-xs font-semibold text-muted-foreground">ملاحظات طبية</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className={`${inputCls} mt-1 resize-none`}
          placeholder="حساسية، أمراض مزمنة، ملاحظات العلاج…"
        />
        <button
          onClick={saveNotes}
          disabled={saving}
          className="mt-2 h-9 px-4 rounded-xl bg-brand-soft text-brand text-xs font-bold hover:bg-brand hover:text-primary-foreground transition-colors disabled:opacity-60"
        >
          {saving ? "جارٍ الحفظ…" : "حفظ الملاحظات"}
        </button>
      </div>

      <div className="mt-4">
        <div className="text-xs font-semibold text-muted-foreground mb-2">
          سجل المواعيد ({toArabicDigits(appointments.length)})
        </div>
        <div className="space-y-2 max-h-56 overflow-y-auto">
          {appointments.length === 0 && (
            <div className="text-sm text-muted-foreground rounded-xl border border-line p-4 text-center">
              لا توجد مواعيد سابقة
            </div>
          )}
          {appointments.map((a) => {
            const status = (STATUSES.includes(a.status as AppointmentStatus)
              ? a.status
              : "بالانتظار") as AppointmentStatus;
            return (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-xl border border-line px-3 py-2.5 text-sm"
              >
                <div>
                  <div className="font-semibold">{a.service}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {formatDateAr(a.appointment_date)} — {formatTime(a.appointment_time)}
                  </div>
                </div>
                <span
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[status]}`}
                >
                  {status}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={deletePatient}
        className="mt-4 h-9 px-4 rounded-xl bg-rose-soft text-rose text-xs font-bold hover:bg-rose hover:text-primary-foreground transition-colors"
      >
        حذف ملف المريض
      </button>
    </>
  );
}
