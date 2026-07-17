import {
  formatIndonesianDate,
  formatTimeLabel,
  formatTimeRangeLabel,
} from "@/lib/date";
import type { RoomAvailability } from "@/types/room";

type AvailabilityTimelineProps = {
  availability: RoomAvailability;
};

function formatHourLabel(value: string) {
  return formatTimeLabel(value);
}

export function AvailabilityTimeline({
  availability,
}: AvailabilityTimelineProps) {
  return (
    <section className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold tracking-[-0.03em] text-[color:var(--color-text-primary)]">
            Jadwal Ruangan
          </h3>
          <p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">
            {formatIndonesianDate(availability.date)}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {availability.blocked_slots.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[color:var(--color-border-strong)] bg-[color:var(--color-success-container)]/35 p-4">
            <p className="text-sm font-semibold text-[color:var(--color-on-success-container)]">
              Belum ada slot terblokir pada tanggal ini.
            </p>
            <p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">
              Ruangan masih terbuka untuk diajukan selama status ruangan aktif.
            </p>
          </div>
        ) : (
          availability.blocked_slots.map((slot) => (
            <div
              key={`${slot.start_at}-${slot.end_at}`}
              className="flex gap-3 sm:gap-4"
            >
              <div className="w-12 pt-1 text-[11px] font-semibold text-[color:var(--color-text-secondary)] sm:w-14 sm:text-xs">
                {formatHourLabel(slot.start_at)}
              </div>
              <div className="flex-1 rounded-r-2xl border-l-4 border-[color:var(--color-danger)] bg-[color:var(--color-danger-container)] p-3 sm:p-4">
                <p className="text-sm font-semibold text-[color:var(--color-on-danger-container)]">
                  Slot terpakai
                </p>
                <p className="mt-1 text-xs text-[color:var(--color-on-danger-container)]/80">
                  {formatTimeRangeLabel(slot.start_at, slot.end_at)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <p className="mt-6 border-t border-[color:var(--color-border)] pt-4 text-center text-xs text-[color:var(--color-text-secondary)]">
        Jadwal ketersediaan dapat berubah sesuai keputusan admin dan booking baru.
      </p>
    </section>
  );
}
