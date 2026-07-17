"use client";

import { Search } from "lucide-react";
import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { RoomCard } from "@/components/rooms/room-card";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRooms } from "@/hooks/use-rooms";
import type { RoomStatus } from "@/types/room";

const facilityOptions = ["Projector", "AC", "WiFi", "Komputer", "Whiteboard"];
const sortOptions = [
  { label: "Nama A-Z", value: "name" },
  { label: "Kapasitas Terbesar", value: "-capacity" },
  { label: "Kapasitas Terkecil", value: "capacity" },
];

function parsePositiveInt(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function RoomsClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const building = searchParams.get("building") ?? "";
  const status = (searchParams.get("status") as RoomStatus | "") ?? "";
  const minCapacity = searchParams.get("min_capacity") ?? "";
  const selectedFacilities = searchParams.getAll("facility");
  const sort = searchParams.get("sort") ?? "name";
  const page = parsePositiveInt(searchParams.get("page"), 1);

  const params = useMemo(
    () => ({
      search: search || undefined,
      building: building || undefined,
      status: status || undefined,
      min_capacity: minCapacity ? Number(minCapacity) : undefined,
      facility: selectedFacilities.length ? selectedFacilities : undefined,
      sort,
      page,
      limit: 9,
    }),
    [building, minCapacity, page, search, selectedFacilities, sort, status],
  );

  const roomsQuery = useRooms(params);
  const rooms = roomsQuery.data?.data ?? [];
  const meta = roomsQuery.data?.meta;

  const updateQueryString = (
    updates: Record<string, string | number | string[] | null | undefined>,
  ) => {
    const nextParams = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      nextParams.delete(key);

      if (Array.isArray(value)) {
        value.forEach((item) => {
          if (item) {
            nextParams.append(key, item);
          }
        });
        return;
      }

      if (value !== null && value !== undefined && value !== "") {
        nextParams.set(key, String(value));
      }
    });

    const query = nextParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const resetFilters = () => {
    updateQueryString({
      search: null,
      building: null,
      status: null,
      min_capacity: null,
      facility: [],
      sort: "name",
      page: null,
    });
  };

  const handlePageChange = (nextPage: number) => {
    updateQueryString({ page: nextPage <= 1 ? null : nextPage });
  };

  const toggleFacility = (facility: string) => {
    const nextFacilities = selectedFacilities.includes(facility)
      ? selectedFacilities.filter((item) => item !== facility)
      : [...selectedFacilities, facility];

    updateQueryString({
      facility: nextFacilities,
      page: null,
    });
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Cari Ruangan"
        description="Cari ruangan berdasarkan nama, gedung, status, kapasitas, dan fasilitas yang Anda butuhkan."
      />

      <section className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-white p-5 shadow-sm sm:rounded-[1.75rem] sm:p-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[color:var(--color-text-muted)]" />
          <Input
            value={search}
            onChange={(event) =>
              updateQueryString({
                search: event.target.value || null,
                page: null,
              })
            }
            placeholder="Cari berdasarkan nama atau kode ruangan..."
            className="h-12 rounded-2xl border-[color:var(--color-border)] bg-[color:var(--color-surface)] pl-11 pr-4"
          />
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <label className="space-y-2 text-sm font-semibold text-[color:var(--color-text-primary)]">
            <span>Gedung</span>
            <Input
              value={building}
              onChange={(event) =>
                updateQueryString({
                  building: event.target.value || null,
                  page: null,
                })
              }
              placeholder="Contoh: Gedung A"
              className="h-11 rounded-xl"
            />
          </label>

          <label className="space-y-2 text-sm font-semibold text-[color:var(--color-text-primary)]">
            <span>Status</span>
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
                <SelectItem value="INACTIVE">Nonaktif</SelectItem>
              </SelectContent>
            </Select>
          </label>

          <label className="space-y-2 text-sm font-semibold text-[color:var(--color-text-primary)]">
            <span>Kapasitas minimum</span>
            <Input
              value={minCapacity}
              onChange={(event) =>
                updateQueryString({
                  min_capacity: event.target.value || null,
                  page: null,
                })
              }
              type="number"
              min={1}
              placeholder="Contoh: 30"
              className="h-11 rounded-xl"
            />
          </label>

          <label className="space-y-2 text-sm font-semibold text-[color:var(--color-text-primary)]">
            <span>Urutkan</span>
            <Select
              value={sort}
              onValueChange={(value) =>
                updateQueryString({
                  sort: value,
                  page: null,
                })
              }
            >
              <SelectTrigger className="h-11 w-full rounded-xl border-[color:var(--color-border)] bg-white px-3 text-sm">
                <SelectValue placeholder="Pilih urutan" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <div className="space-y-2 text-sm font-semibold text-[color:var(--color-text-primary)]">
            <span>Reset filter</span>
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full rounded-xl"
              onClick={resetFilters}
            >
              Bersihkan Filter
            </Button>
          </div>
        </div>

        <div className="mt-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                Fasilitas
              </p>
              <p className="mt-1 text-xs leading-6 text-[color:var(--color-text-secondary)]">
                Pilih satu atau beberapa fasilitas yang ingin tersedia di ruangan.
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {facilityOptions.map((facility) => {
              const active = selectedFacilities.includes(facility);

              return (
                <button
                  key={facility}
                  type="button"
                  onClick={() => toggleFacility(facility)}
                  className={
                    active
                      ? "rounded-full border border-[color:var(--color-primary)] bg-[color:var(--color-primary-container)] px-4 py-2 text-xs font-semibold text-[color:var(--color-on-primary)]"
                      : "rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-subtle)] px-4 py-2 text-xs font-semibold text-[color:var(--color-text-secondary)] transition-colors hover:border-[color:var(--color-primary)]"
                  }
                >
                  {facility}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-[-0.03em] text-[color:var(--color-text-primary)]">
              Hasil Pencarian
            </h2>
            <p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">
              {roomsQuery.data?.meta?.total_items ?? rooms.length} ruangan ditemukan
            </p>
          </div>
        </div>

        {roomsQuery.isLoading ? <LoadingSkeleton lines={6} /> : null}

        {roomsQuery.isError ? (
          <ErrorState
            description="Data ruangan belum berhasil dimuat. Coba periksa koneksi Anda lalu muat ulang halaman."
            actionLabel="Coba Lagi"
            onAction={() => roomsQuery.refetch()}
          />
        ) : null}

        {!roomsQuery.isLoading && !roomsQuery.isError && rooms.length === 0 ? (
          <EmptyState
            title="Belum ada ruangan yang cocok"
            description="Ubah kata kunci atau filter Anda untuk melihat ruangan lain yang tersedia."
          />
        ) : null}

        {!roomsQuery.isLoading && !roomsQuery.isError && rooms.length > 0 ? (
          <div className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {rooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>

            <PaginationControls meta={meta} onPageChange={handlePageChange} />
          </div>
        ) : null}
      </section>
    </div>
  );
}
