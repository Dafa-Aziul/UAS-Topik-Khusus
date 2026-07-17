import { ArrowRight, Building2, MapPin, Users } from "lucide-react";
import Link from "next/link";

import { RoomStatusBadge } from "@/components/rooms/room-status-badge";
import { buttonVariants } from "@/components/ui/button";
import { resolveMediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";
import type { Room } from "@/types/room";

type RoomCardProps = {
  room: Room;
};

export function RoomCard({ room }: RoomCardProps) {
  const isAvailable = room.status === "AVAILABLE";
  const imageUrl = resolveMediaUrl(room.image_url);
  const facilities = room.facilities.slice(0, 3);
  const remainingFacilities = Math.max(room.facilities.length - facilities.length, 0);

  return (
    <article className="group overflow-hidden rounded-[1.4rem] border border-[color:var(--color-border)] bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--color-primary)]/20 hover:shadow-lg">
      <div className="relative h-48 overflow-hidden bg-[linear-gradient(135deg,#dbeafe_0%,#bfdbfe_42%,#eff6ff_100%)] sm:h-52">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={room.name}
            className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        ) : null}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.95),transparent_34%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.05)_0%,rgba(15,23,42,0.4)_100%)]" />
        <div className="absolute left-4 top-4 sm:left-5 sm:top-5">
          <RoomStatusBadge status={room.status} />
        </div>
        <div className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-5 sm:right-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/85">
            {room.code}
          </p>
          <h3 className="mt-1.5 line-clamp-2 text-[1.65rem] font-bold tracking-[-0.03em] text-white sm:text-2xl">
            {room.name}
          </h3>
        </div>
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        <div className="space-y-3 text-sm text-[color:var(--color-text-secondary)]">
          <div className="flex items-start gap-2.5">
            <MapPin className="mt-0.5 size-4 shrink-0 text-[color:var(--color-primary)]" />
            <span className="leading-6">
              {room.building}, Lantai {room.floor}
            </span>
          </div>
          <div className="flex items-start gap-2.5">
            <Users className="mt-0.5 size-4 shrink-0 text-[color:var(--color-primary)]" />
            <span className="leading-6">Kapasitas {room.capacity} orang</span>
          </div>
          <div className="flex items-start gap-2.5">
            <Building2 className="mt-0.5 size-4 shrink-0 text-[color:var(--color-primary)]" />
            <span className="line-clamp-2 leading-6">{room.location_description}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {facilities.map((facility) => (
            <span
              key={facility}
              className="rounded-full bg-[color:var(--color-surface-subtle)] px-3 py-1 text-xs font-semibold text-[color:var(--color-text-secondary)]"
            >
              {facility}
            </span>
          ))}
          {remainingFacilities > 0 ? (
            <span className="rounded-full border border-[color:var(--color-border)] bg-white px-3 py-1 text-xs font-semibold text-[color:var(--color-text-muted)]">
              +{remainingFacilities} lainnya
            </span>
          ) : null}
        </div>

        {isAvailable ? (
          <Link
            href={`/mahasiswa/rooms/${room.id}`}
            className={cn(buttonVariants(), "h-11 w-full rounded-xl")}
          >
            Lihat Detail
            <ArrowRight className="size-4" />
          </Link>
        ) : (
          <div
            className={cn(
              buttonVariants(),
              "h-11 w-full rounded-xl opacity-50 pointer-events-none",
            )}
          >
            Ruangan Tidak Tersedia
            <ArrowRight className="size-4" />
          </div>
        )}
      </div>
    </article>
  );
}
