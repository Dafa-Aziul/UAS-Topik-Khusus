"use client";

import { Edit3, Eye, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { RoomStatusBadge } from "@/components/rooms/room-status-badge";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRooms } from "@/hooks/use-rooms";
import { cn } from "@/lib/utils";
import type { RoomStatus } from "@/types/room";

function parsePositiveInt(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function AdminRoomsClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const building = searchParams.get("building") ?? "";
  const status = (searchParams.get("status") as RoomStatus | "") ?? "";
  const page = parsePositiveInt(searchParams.get("page"), 1);

  const params = useMemo(
    () => ({
      search: search || undefined,
      building: building || undefined,
      status: status || undefined,
      page,
      limit: 20,
      sort: "name",
    }),
    [building, page, search, status],
  );

  const roomsQuery = useRooms(params);
  const rooms = roomsQuery.data?.data ?? [];
  const meta = roomsQuery.data?.meta;

  const updateQueryString = (
    updates: Record<string, string | number | null | undefined>,
  ) => {
    const nextParams = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      nextParams.delete(key);

      if (value !== null && value !== undefined && value !== "") {
        nextParams.set(key, String(value));
      }
    });

    const query = nextParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const handlePageChange = (nextPage: number) => {
    updateQueryString({ page: nextPage <= 1 ? null : nextPage });
  };

  const roomCount = roomsQuery.data?.meta?.total_items ?? rooms.length;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <PageHeader
          title="Manajemen Ruangan"
          description="Kelola daftar ruang kelas, laboratorium, dan auditorium kampus."
        />

        <Link
          href="/admin/rooms/create"
          className={cn(
            buttonVariants({ size: "lg" }),
            "h-11 rounded-xl text-white hover:text-white",
          )}
        >
          <Plus className="size-4" />
          Tambah Ruangan
        </Link>
      </section>

      <section className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="relative xl:col-span-2">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[color:var(--color-text-muted)]" />
            <Input
              value={search}
              onChange={(event) =>
                updateQueryString({
                  search: event.target.value || null,
                  page: null,
                })
              }
              placeholder="Cari kode atau nama ruangan..."
              className="h-11 rounded-xl pl-11"
            />
          </div>

          <Input
            value={building}
            onChange={(event) =>
              updateQueryString({
                building: event.target.value || null,
                page: null,
              })
            }
            placeholder="Filter gedung"
            className="h-11 rounded-xl"
          />

          <Select
            value={status}
            onValueChange={(value) =>
              updateQueryString({
                status: value || null,
                page: null,
              })
            }
          >
            <SelectTrigger className="h-11 w-full rounded-xl border-[color:var(--color-border)] bg-white px-3 text-sm">
              <SelectValue placeholder="Semua status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Semua status</SelectItem>
              <SelectItem value="AVAILABLE">Tersedia</SelectItem>
              <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
              <SelectItem value="INACTIVE">Tidak aktif</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {roomsQuery.isLoading ? <LoadingSkeleton lines={8} /> : null}
      {roomsQuery.isError ? (
        <ErrorState
          description="Daftar ruangan admin belum berhasil dimuat."
          actionLabel="Coba Lagi"
          onAction={() => roomsQuery.refetch()}
        />
      ) : null}
      {!roomsQuery.isLoading && !roomsQuery.isError && rooms.length === 0 ? (
        <EmptyState
          title="Belum ada ruangan"
          description="Tambahkan ruangan baru atau ubah filter agar data lebih mudah ditemukan."
          actionLabel="Tambah Ruangan"
          onAction={() => router.push("/admin/rooms/create")}
        />
      ) : null}

      {!roomsQuery.isLoading && !roomsQuery.isError && rooms.length > 0 ? (
        <section className="space-y-5 overflow-hidden rounded-[1.5rem] border border-[color:var(--color-border)] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[color:var(--color-text-primary)]">
                Daftar Ruangan
              </h2>
              <p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">
                {roomCount} ruangan ditemukan
              </p>
            </div>
          </div>

          <div className="grid gap-4 lg:hidden">
            {rooms.map((room, index) => (
              <div
                key={room.id || `${room.code}-${room.name}-${index}`}
                className="rounded-[1.25rem] border border-[color:var(--color-border)] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[color:var(--color-primary)]">
                      {room.code}
                    </p>
                    <h3 className="mt-1 text-base font-semibold text-[color:var(--color-text-primary)]">
                      {room.name}
                    </h3>
                  </div>
                  <RoomStatusBadge status={room.status} />
                </div>

                <div className="mt-4 space-y-2 text-sm text-[color:var(--color-text-secondary)]">
                  <p>{room.building}, Lt. {room.floor}</p>
                  <p>{room.capacity} orang</p>
                </div>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <Link
                    href={`/admin/rooms/${room.id}`}
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "w-full rounded-xl sm:w-auto",
                    )}
                  >
                    <Eye className="size-4" />
                    Detail
                  </Link>
                  <Link
                    href={`/admin/rooms/${room.id}/edit`}
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "w-full rounded-xl sm:w-auto",
                    )}
                  >
                    <Edit3 className="size-4" />
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto lg:block">
            <table className="min-w-full text-left">
              <thead className="bg-[color:var(--color-surface-subtle)]">
                <tr>
                  <th className="px-5 py-4 text-sm font-semibold text-[color:var(--color-text-secondary)]">
                    Kode
                  </th>
                  <th className="px-5 py-4 text-sm font-semibold text-[color:var(--color-text-secondary)]">
                    Nama Ruangan
                  </th>
                  <th className="px-5 py-4 text-sm font-semibold text-[color:var(--color-text-secondary)]">
                    Lokasi
                  </th>
                  <th className="px-5 py-4 text-sm font-semibold text-[color:var(--color-text-secondary)]">
                    Kapasitas
                  </th>
                  <th className="px-5 py-4 text-sm font-semibold text-[color:var(--color-text-secondary)]">
                    Status
                  </th>
                  <th className="px-5 py-4 text-right text-sm font-semibold text-[color:var(--color-text-secondary)]">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room, index) => (
                  <tr
                    key={room.id || `${room.code}-${room.name}-${index}`}
                    className="border-t border-[color:var(--color-border)]"
                  >
                    <td className="px-5 py-4 text-sm font-semibold text-[color:var(--color-primary)]">
                      {room.code}
                    </td>
                    <td className="px-5 py-4 text-sm text-[color:var(--color-text-primary)]">
                      {room.name}
                    </td>
                    <td className="px-5 py-4 text-sm text-[color:var(--color-text-secondary)]">
                      {room.building}, Lt. {room.floor}
                    </td>
                    <td className="px-5 py-4 text-sm text-[color:var(--color-text-primary)]">
                      {room.capacity} orang
                    </td>
                    <td className="px-5 py-4">
                      <RoomStatusBadge status={room.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/rooms/${room.id}`}
                          className={cn(
                            buttonVariants({ variant: "outline" }),
                            "rounded-xl",
                          )}
                        >
                          <Eye className="size-4" />
                          Detail
                        </Link>
                        <Link
                          href={`/admin/rooms/${room.id}/edit`}
                          className={cn(
                            buttonVariants({ variant: "outline" }),
                            "rounded-xl",
                          )}
                        >
                          <Edit3 className="size-4" />
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <PaginationControls meta={meta} onPageChange={handlePageChange} />
        </section>
      ) : null}
    </div>
  );
}
