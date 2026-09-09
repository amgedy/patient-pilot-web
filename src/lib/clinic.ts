export const SERVICES = ["تنظيف الأسنان", "حشو الأسنان", "كشف عام"] as const;
export type Service = (typeof SERVICES)[number];

export const SERVICE_META: Record<
  Service,
  { duration: string; color: "brand" | "mint" | "rose"; letter: string; description: string }
> = {
  "تنظيف الأسنان": {
    duration: "٤٥ دقيقة",
    color: "brand",
    letter: "ن",
    description: "إزالة الجير والتلميع الكامل مع فحص اللثة",
  },
  "حشو الأسنان": {
    duration: "٦٠ دقيقة",
    color: "mint",
    letter: "ح",
    description: "علاج التسوس وحشو التجاويف بأحدث الخامات",
  },
  "كشف عام": {
    duration: "٣٠ دقيقة",
    color: "rose",
    letter: "ك",
    description: "فحص شامل وتقييم صحة الفم والأسنان",
  },
};

export const STATUSES = ["مؤكد", "بالانتظار", "مكتمل", "ملغي"] as const;
export type AppointmentStatus = (typeof STATUSES)[number];

// مواعيد العيادة: من ٩ صباحاً حتى ٢ ظهراً فقط
export const TIME_SLOTS: string[] = (() => {
  const slots: string[] = [];
  for (let h = 9; h < 14; h++) {
    for (const m of [0, 30]) {
      if (h === 13 && m === 30) {
        slots.push("13:30");
        continue;
      }
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return slots;
})();

const AR_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

export function toArabicDigits(value: string | number): string {
  return String(value).replace(/\d/g, (d) => AR_DIGITS[Number(d)] ?? d);
}

export function formatTime(time: string): string {
  const [hStr = "9", mStr = "00"] = time.slice(0, 5).split(":");
  let h = Number(hStr);
  const period = h < 12 ? "ص" : "م";
  if (h > 12) h -= 12;
  return `${toArabicDigits(h)}:${toArabicDigits(mStr)} ${period}`;
}

export function formatDateAr(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  return new Intl.DateTimeFormat("ar-EG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export const STATUS_STYLES: Record<AppointmentStatus, string> = {
  مؤكد: "bg-mint-soft text-mint",
  بالانتظار: "bg-gold-soft text-gold",
  مكتمل: "bg-brand-soft text-brand",
  ملغي: "bg-rose-soft text-rose",
};

export const SERVICE_DOT: Record<Service, string> = {
  "تنظيف الأسنان": "bg-brand",
  "حشو الأسنان": "bg-mint",
  "كشف عام": "bg-rose",
};
