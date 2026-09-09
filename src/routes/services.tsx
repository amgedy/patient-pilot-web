import { createFileRoute, Link } from "@tanstack/react-router";
import { SERVICES, SERVICE_META } from "@/lib/clinic";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "خدمات العيادة — عيادة نور لطب الأسنان" },
      {
        name: "description",
        content:
          "خدمات عيادة الأسنان: تنظيف الأسنان، حشو الأسنان، وكشف عام.",
      },
      { property: "og:title", content: "خدمات العيادة — عيادة نور لطب الأسنان" },
      {
        property: "og:description",
        content: "أسعار خدمات العيادة: تنظيف الأسنان، حشو الأسنان، وكشف عام.",
      },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  return (
    <>
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-line">
        <div className="flex items-center gap-4 px-4 md:px-8 h-16">
          <div>
            <h1 className="font-cairo font-extrabold text-lg leading-none">خدمات العيادة</h1>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-8 space-y-6">
        <div className="grid sm:grid-cols-3 gap-4">
          {SERVICES.map((service, i) => {
            const meta = SERVICE_META[service];
            const styles =
              meta.color === "brand"
                ? { chip: "bg-brand-soft text-brand", bar: "from-brand to-[#7DB4FF]" }
                : meta.color === "mint"
                  ? { chip: "bg-mint-soft text-mint", bar: "from-mint to-[#4FC8B2]" }
                  : { chip: "bg-rose-soft text-rose", bar: "from-rose to-[#F08AAB]" };
            return (
              <div
                key={service}
                className="rounded-2xl bg-card border border-line overflow-hidden animate-[rise_.5s_ease_both]"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className={`h-1.5 bg-gradient-to-l ${styles.bar}`} />
                <div className="p-6">
                  <div
                    className={`size-12 rounded-2xl grid place-items-center font-cairo font-extrabold text-xl ${styles.chip}`}
                  >
                    {meta.letter}
                  </div>
                  <h2 className="mt-4 font-cairo font-extrabold text-lg">{service}</h2>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                    {meta.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-cairo font-extrabold text-base text-brand">
                      {meta.price}
                    </span>
                    <Link
                      to="/"
                      className="text-xs font-bold text-brand hover:underline"
                    >
                      احجز موعداً ←
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
