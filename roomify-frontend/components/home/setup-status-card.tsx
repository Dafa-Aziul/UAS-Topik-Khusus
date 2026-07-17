import { CheckCircle2, CircleDashed, CircleHelp } from "lucide-react";

const items = [
  {
    title: "Bootstrap Next.js",
    description: "Project, TypeScript, ESLint, dan Tailwind CSS sudah aktif.",
    done: true,
  },
  {
    title: "Fondasi Frontend",
    description:
      "Env example, Axios client, React Query provider, dan auth store awal sudah dibuat.",
    done: true,
  },
  {
    title: "Integrasi Roomify",
    description:
      "Auth flow, route guard, dashboard, dan modul ruangan masih menjadi langkah berikutnya.",
    done: false,
  },
];

export function SetupStatusCard() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <CircleHelp className="size-5 text-teal-600" />
        <h2 className="text-lg font-semibold text-slate-900">Status setup</h2>
      </div>
      <div className="mt-5 space-y-4">
        {items.map((item) => (
          <div
            key={item.title}
            className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4"
          >
            {item.done ? (
              <CheckCircle2 className="mt-0.5 size-5 text-emerald-600" />
            ) : (
              <CircleDashed className="mt-0.5 size-5 text-amber-600" />
            )}
            <div>
              <h3 className="font-medium text-slate-900">{item.title}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
