"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Building2,
  ImagePlus,
  Save,
  ShieldAlert,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { ErrorState } from "@/components/feedback/error-state";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateRoomMutation,
  useDeactivateRoomMutation,
  useUpdateRoomMutation,
  useUpdateRoomStatusMutation,
} from "@/hooks/use-admin-rooms";
import { useRoomDetail } from "@/hooks/use-rooms";
import { getApiErrorMessage } from "@/lib/auth";
import { resolveMediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";
import {
  roomSchema,
  type RoomSchema,
  type RoomSchemaInput,
} from "@/schemas/room-schema";
import type { RoomStatus } from "@/types/room";

type AdminRoomFormClientProps = {
  mode: "create" | "edit";
  roomId?: string;
};

function splitFacilities(input: string) {
  return input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function AdminRoomFormClient({
  mode,
  roomId,
}: AdminRoomFormClientProps) {
  const router = useRouter();
  const detailQuery = useRoomDetail(roomId ?? "");
  const createMutation = useCreateRoomMutation();
  const updateMutation = useUpdateRoomMutation(roomId ?? "");
  const statusMutation = useUpdateRoomStatusMutation(roomId ?? "");
  const deactivateMutation = useDeactivateRoomMutation(roomId ?? "");
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [confirmDeactivateOpen, setConfirmDeactivateOpen] = useState(false);

  const form = useForm<RoomSchemaInput, unknown, RoomSchema>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      code: "",
      name: "",
      building: "",
      floor: 1,
      location_description: "",
      capacity: 1,
      facilities_input: "",
      description: "",
      status: "AVAILABLE",
    },
  });
  const selectedStatus = useWatch({
    control: form.control,
    name: "status",
  });

  useEffect(() => {
    if (mode !== "edit" || !detailQuery.data?.data) {
      return;
    }

    const room = detailQuery.data.data;
    form.reset({
      code: room.code,
      name: room.name,
      building: room.building,
      floor: room.floor,
      location_description: room.location_description,
      capacity: room.capacity,
      facilities_input: room.facilities.join(", "),
      description: room.description,
      status: room.status,
    });
  }, [detailQuery.data, form, mode]);

  useEffect(() => {
    if (!selectedImageFile) {
      return;
    }

    const objectUrl = URL.createObjectURL(selectedImageFile);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedImageFile]);

  const previewUrl = useMemo(() => {
    if (removeImage) {
      return null;
    }

    if (selectedImageFile) {
      return URL.createObjectURL(selectedImageFile);
    }

    if (mode === "edit") {
      return resolveMediaUrl(detailQuery.data?.data?.image_url);
    }

    return null;
  }, [detailQuery.data?.data?.image_url, mode, removeImage, selectedImageFile]);

  useEffect(() => {
    if (!selectedImageFile || !previewUrl || mode === "edit" && previewUrl === detailQuery.data?.data?.image_url) {
      return;
    }

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [detailQuery.data?.data?.image_url, mode, previewUrl, selectedImageFile]);

  if (mode === "edit" && detailQuery.isLoading) {
    return <LoadingSkeleton lines={8} />;
  }

  if (mode === "edit" && (detailQuery.isError || !detailQuery.data?.data)) {
    return (
      <ErrorState
        description="Data ruangan untuk mode edit belum berhasil dimuat."
        actionLabel="Coba Lagi"
        onAction={() => detailQuery.refetch()}
      />
    );
  }

  const mutationError =
    createMutation.error ||
    updateMutation.error ||
    statusMutation.error ||
    deactivateMutation.error;
  const errorMessage = mutationError ? getApiErrorMessage(mutationError) : null;
  const currentRoom = mode === "edit" ? detailQuery.data?.data : null;

  const onSubmit = form.handleSubmit(async (values) => {
    const facilities = splitFacilities(values.facilities_input);
    const payload = {
      code: values.code,
      name: values.name,
      building: values.building,
      floor: values.floor,
      location_description: values.location_description,
      capacity: values.capacity,
      facilities,
      description: values.description,
      status: values.status,
      image_file: selectedImageFile,
      remove_image: removeImage,
    };

    if (mode === "create") {
      await createMutation.mutateAsync(payload, {
        onSuccess: () => {
          setSelectedImageFile(null);
          setRemoveImage(false);
          setFileInputKey((value) => value + 1);
          toast.success("Ruangan baru berhasil ditambahkan.");
          router.push("/admin/rooms");
        },
      });
      return;
    }

    const updatePayload = {
      ...(currentRoom?.code !== values.code ? { code: values.code } : {}),
      ...(currentRoom?.name !== values.name ? { name: values.name } : {}),
      ...(currentRoom?.building !== values.building
        ? { building: values.building }
        : {}),
      ...(currentRoom?.floor !== values.floor ? { floor: values.floor } : {}),
      ...(currentRoom?.location_description !== values.location_description
        ? { location_description: values.location_description }
        : {}),
      ...(currentRoom?.capacity !== values.capacity
        ? { capacity: values.capacity }
        : {}),
      ...(currentRoom?.description !== values.description
        ? { description: values.description }
        : {}),
      ...(currentRoom?.status !== values.status ? { status: values.status } : {}),
      ...(currentRoom?.facilities.join("|") !== facilities.join("|")
        ? { facilities }
        : {}),
      ...(selectedImageFile ? { image_file: selectedImageFile } : {}),
      ...(removeImage ? { remove_image: true } : {}),
    };

    if (Object.keys(updatePayload).length === 0) {
      toast.info("Belum ada perubahan yang perlu disimpan.");
      return;
    }

    await updateMutation.mutateAsync(updatePayload, {
      onSuccess: () => {
        setSelectedImageFile(null);
        setRemoveImage(false);
        setFileInputKey((value) => value + 1);
        toast.success("Data ruangan berhasil diperbarui.");
      },
    });
  });

  const handleStatusChange = async (status: RoomStatus) => {
    await statusMutation.mutateAsync(status, {
      onSuccess: () => {
        form.setValue("status", status);
        toast.success("Status ruangan berhasil diperbarui.");
      },
    });
  };

  const handleDeactivate = async () => {
    await deactivateMutation.mutateAsync(undefined, {
      onSuccess: () => {
        setConfirmDeactivateOpen(false);
        toast.success("Ruangan berhasil dinonaktifkan.");
        router.push("/admin/rooms");
      },
    });
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedImageFile(file);
    setRemoveImage(false);
  };

  const handleRemoveSelectedImage = () => {
    setSelectedImageFile(null);
    setFileInputKey((value) => value + 1);

    if (mode === "edit" && detailQuery.data?.data?.image_url) {
      setRemoveImage(true);
      return;
    }

    setRemoveImage(false);
  };

  const imageSummaryLabel = selectedImageFile
    ? selectedImageFile.name
    : mode === "edit" && previewUrl
      ? "Gambar ruangan saat ini"
      : "Belum ada gambar dipilih";
  const imageSummaryMeta = selectedImageFile
    ? `${Math.max(1, Math.round(selectedImageFile.size / 1024))} KB • ${selectedImageFile.type || "image/*"}`
    : null;

  return (
    <div className=" max-w-5xl space-y-6">
      <PageHeader
        title={mode === "create" ? "Tambah Ruangan" : "Edit Ruangan"}
        description={
          mode === "create"
            ? "Tambahkan ruangan kampus baru beserta detail, fasilitas, dan foto utamanya."
            : "Perbarui informasi ruangan, status, dan fasilitasnya."
        }
        breadcrumb={
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <nav className="flex flex-wrap items-center gap-2 text-sm sm:gap-2.5 sm:text-[15px]">
              <Link
                href="/admin/rooms"
                className="transition hover:text-[color:var(--color-primary)]"
              >
                Ruangan
              </Link>
              <span>/</span>
              <span className="font-semibold text-[color:var(--color-primary)]">
                {mode === "create"
                  ? "Tambah Ruangan"
                  : currentRoom?.name ?? "Edit Ruangan"}
              </span>
            </nav>

            <div className="flex w-full sm:w-auto">
              <Link
                href="/admin/rooms"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full rounded-xl sm:w-auto",
                )}
              >
                <ArrowLeft className="size-4" />
                Kembali ke daftar
              </Link>
            </div>
          </div>
        }
      />

      {errorMessage ? (
        <Alert className="rounded-xl border-red-200 bg-[color:var(--color-danger-container)] text-[color:var(--color-on-danger-container)]">
          <ShieldAlert className="size-4" />
          <AlertTitle>Perubahan belum berhasil</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <section className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-white p-6 shadow-sm">
          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="code">Kode ruangan</Label>
                <Input id="code" className="h-11 rounded-xl" {...form.register("code")} />
                {form.formState.errors.code ? (
                  <p className="text-sm text-[color:var(--color-danger)]">
                    {form.formState.errors.code.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nama ruangan</Label>
                <Input id="name" className="h-11 rounded-xl" {...form.register("name")} />
                {form.formState.errors.name ? (
                  <p className="text-sm text-[color:var(--color-danger)]">
                    {form.formState.errors.name.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="building">Gedung</Label>
                <Input id="building" className="h-11 rounded-xl" {...form.register("building")} />
                {form.formState.errors.building ? (
                  <p className="text-sm text-[color:var(--color-danger)]">
                    {form.formState.errors.building.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="floor">Lantai</Label>
                <Input
                  id="floor"
                  type="number"
                  className="h-11 rounded-xl"
                  {...form.register("floor")}
                />
                {form.formState.errors.floor ? (
                  <p className="text-sm text-[color:var(--color-danger)]">
                    {form.formState.errors.floor.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="location_description">Deskripsi lokasi</Label>
                <Input
                  id="location_description"
                  className="h-11 rounded-xl"
                  {...form.register("location_description")}
                />
                {form.formState.errors.location_description ? (
                  <p className="text-sm text-[color:var(--color-danger)]">
                    {form.formState.errors.location_description.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Kapasitas</Label>
                <Input
                  id="capacity"
                  type="number"
                  className="h-11 rounded-xl"
                  {...form.register("capacity")}
                />
                {form.formState.errors.capacity ? (
                  <p className="text-sm text-[color:var(--color-danger)]">
                    {form.formState.errors.capacity.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={selectedStatus}
                  onValueChange={(value) =>
                    form.setValue("status", value as RoomStatus, {
                      shouldDirty: true,
                      shouldTouch: true,
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger
                    id="status"
                    className="h-11 w-full rounded-xl border-[color:var(--color-border)] bg-white px-3 text-sm"
                  >
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AVAILABLE">Tersedia</SelectItem>
                    <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                    <SelectItem value="INACTIVE">Tidak aktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="facilities_input">
                  Fasilitas
                </Label>
                <Input
                  id="facilities_input"
                  className="h-11 rounded-xl"
                  placeholder="Pisahkan dengan koma, misalnya: AC, Projector, WiFi"
                  {...form.register("facilities_input")}
                />
                {form.formState.errors.facilities_input ? (
                  <p className="text-sm text-[color:var(--color-danger)]">
                    {form.formState.errors.facilities_input.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Deskripsi ruangan</Label>
                <Textarea
                  id="description"
                  rows={5}
                  {...form.register("description")}
                />
                {form.formState.errors.description ? (
                  <p className="text-sm text-[color:var(--color-danger)]">
                    {form.formState.errors.description.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-3 md:col-span-2">
                <Label htmlFor="image_file">Foto ruangan</Label>
                <div className="rounded-[1.5rem] border border-dashed border-[color:var(--color-border-strong)] bg-[color:var(--color-surface-subtle)] p-6">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                        Preview gambar
                      </p>
                      <p className="text-xs text-[color:var(--color-text-secondary)]">
                        Tampilan foto ruangan yang akan disimpan.
                      </p>
                    </div>
                    {(previewUrl || selectedImageFile || removeImage) && (
                      <Button
                        type="button"
                        variant="outline"
                        className="h-9 rounded-xl"
                        onClick={handleRemoveSelectedImage}
                      >
                        <X className="size-4" />
                        Hapus
                      </Button>
                    )}
                  </div>

                  <div className="flex min-h-[260px] items-center justify-center rounded-[1.25rem] border border-dashed border-[color:var(--color-border-strong)] bg-white p-4">
                    {previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={previewUrl}
                        alt="Preview foto ruangan"
                        className="h-[230px] w-full rounded-[1rem] object-cover"
                      />
                    ) : (
                      <div className="max-w-sm text-center">
                        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[color:var(--color-accent)] text-[color:var(--color-primary)]">
                          <ImagePlus className="size-6" />
                        </div>
                        <p className="mt-4 text-base font-semibold text-[color:var(--color-text-primary)]">
                          Belum ada foto ruangan
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                      Upload foto
                    </p>
                    <Input
                      key={fileInputKey}
                      id="image_file"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleImageChange}
                    />
                    <label
                      htmlFor="image_file"
                      className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-[color:var(--color-border-strong)] bg-white px-4 py-3 transition-colors hover:border-[color:var(--color-primary)]/40 hover:bg-[color:var(--color-surface-subtle)]"
                    >
                      <span className="inline-flex h-10 shrink-0 items-center rounded-xl bg-[color:var(--color-accent)] px-4 text-sm font-semibold text-[color:var(--color-primary)]">
                        Pilih File
                      </span>
                      <span className="min-w-0 flex-1 truncate text-right text-sm text-[color:var(--color-text-secondary)]">
                        {selectedImageFile?.name ??
                          (previewUrl && mode === "edit"
                            ? "Menggunakan foto saat ini"
                            : "Belum ada file dipilih")}
                      </span>
                    </label>
                    <p className="text-xs text-[color:var(--color-text-secondary)]">
                      {imageSummaryLabel}
                      {imageSummaryMeta ? ` • ${imageSummaryMeta}` : ""}
                    </p>
                  </div>

                  {removeImage ? (
                    <div className="mt-3 rounded-[1rem] border border-red-200 bg-[color:var(--color-danger-container)] px-4 py-3 text-sm text-[color:var(--color-on-danger-container)]">
                      Gambar lama akan dihapus saat perubahan disimpan.
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="h-11 rounded-xl"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              <Save className="size-4" />
              {mode === "create" ? "Simpan Ruangan" : "Simpan Perubahan"}
            </Button>
          </form>
        </section>

        <aside className="space-y-4">
          <section className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-[color:var(--color-accent)] text-[color:var(--color-primary)]">
                <Building2 className="size-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[color:var(--color-text-primary)]">
                  Aksi Cepat
                </h3>
                <p className="text-sm text-[color:var(--color-text-secondary)]">
                  Kelola status ruangan dari panel ini.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <Button
                type="button"
                variant="outline"
                className="h-10 w-full rounded-xl"
                onClick={() => handleStatusChange("AVAILABLE")}
                disabled={mode === "create" || statusMutation.isPending}
              >
                Tandai Tersedia
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-10 w-full rounded-xl"
                onClick={() => handleStatusChange("MAINTENANCE")}
                disabled={mode === "create" || statusMutation.isPending}
              >
                Tandai Maintenance
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-10 w-full rounded-xl"
                onClick={() => handleStatusChange("INACTIVE")}
                disabled={mode === "create" || statusMutation.isPending}
              >
                Tandai Tidak Aktif
              </Button>
            </div>
          </section>

          {mode === "edit" ? (
            <section className="rounded-[1.5rem] border border-[color:var(--color-danger-container)] bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-[color:var(--color-text-primary)]">
                Nonaktifkan Ruangan
              </h3>
              <p className="mt-2 text-sm leading-7 text-[color:var(--color-text-secondary)]">
                Gunakan tindakan ini jika ruangan tidak lagi dipakai atau perlu
                disembunyikan dari daftar ruangan aktif.
              </p>
              <Button
                type="button"
                variant="destructive"
                className="mt-4 h-10 w-full rounded-xl"
                onClick={() => setConfirmDeactivateOpen(true)}
                disabled={deactivateMutation.isPending}
              >
                <Trash2 className="size-4" />
                {deactivateMutation.isPending
                  ? "Menonaktifkan..."
                  : "Nonaktifkan Ruangan"}
              </Button>
            </section>
          ) : null}
        </aside>
      </div>

      <AlertDialog
        open={confirmDeactivateOpen}
        onOpenChange={setConfirmDeactivateOpen}
        title="Nonaktifkan ruangan ini?"
        description="Ruangan tidak akan lagi tampil sebagai ruangan aktif dan tetap bisa dikelola kembali dari panel admin bila diperlukan."
        confirmLabel="Ya, nonaktifkan"
        cancelLabel="Tutup"
        confirmVariant="destructive"
        isLoading={deactivateMutation.isPending}
        onConfirm={handleDeactivate}
      />
    </div>
  );
}
