import Link from "next/link";

type RoleDashboardPlaceholderProps = {
  title: string;
  description: string;
  checklistPath: string;
};

export function RoleDashboardPlaceholder({
  title,
  description,
  checklistPath,
}: RoleDashboardPlaceholderProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-6 py-12">
      <section className="w-full rounded-[2rem] border border-[color:var(--color-border-strong)] bg-white p-8 shadow-[0_24px_60px_rgba(15,23,42,0.08)] sm:p-10">
        <span className="inline-flex rounded-full bg-[color:var(--color-accent)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--color-primary)]">
          Roomify Auth Flow
        </span>
        <h1 className="mt-6 text-4xl font-bold tracking-[-0.03em] text-[color:var(--color-text-primary)]">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-[color:var(--color-text-secondary)]">
          {description}
        </p>

        <div className="mt-8 rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-subtle)] p-6">
          <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">
            Kondisi saat ini
          </p>
          <p className="mt-2 text-sm leading-7 text-[color:var(--color-text-secondary)]">
            Redirect berdasarkan role sudah aktif. Dashboard penuh dan route
            guard lanjutan bisa dilanjutkan dari fondasi ini.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-4 text-sm">
          <div className="rounded-full bg-[color:var(--color-primary)] px-5 py-3 font-semibold text-white">
            {checklistPath}
          </div>
          <Link
            href="/login"
            className="rounded-full border border-[color:var(--color-border-strong)] px-5 py-3 font-semibold text-[color:var(--color-text-primary)] transition hover:bg-[color:var(--color-surface-subtle)]"
          >
            Kembali ke login
          </Link>
        </div>
      </section>
    </main>
  );
}
