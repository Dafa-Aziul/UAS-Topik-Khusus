# PRD dan Desain Teknis Frontend
## Roomify — Sistem Peminjaman Ruangan Kampus

**Nama produk:** Roomify  
**Jenis aplikasi:** Aplikasi web *full-stack*  
**Fokus dokumen:** Product Requirement Document dan desain teknis frontend  
**Target pengguna:** Mahasiswa dan administrator/petugas kampus  
**Status dokumen:** Draft implementasi frontend v1  
**Bahasa antarmuka:** Bahasa Indonesia  
**Backend lokal:** `http://localhost:8000`  
**Prefix API:** Tidak menggunakan prefix global `/api` atau `/api/v1`

---

# 1. Ringkasan Produk

Roomify adalah aplikasi web untuk membantu mahasiswa menemukan ruangan kampus, melihat kapasitas dan fasilitas, mengecek jadwal ketersediaan, mengajukan peminjaman, serta memantau status permohonan.

Administrator menggunakan aplikasi yang sama untuk mengelola data ruangan, memproses permohonan, melihat statistik penggunaan ruangan, mengelola status mahasiswa, dan menelusuri *activity log*.

Frontend Roomify harus menjadi representasi langsung dari aturan bisnis backend. Frontend membantu mencegah kesalahan input dan memberikan pengalaman penggunaan yang jelas, tetapi backend tetap menjadi sumber kebenaran untuk autentikasi, otorisasi, konflik jadwal, kapasitas, transisi status, dan validasi akhir.

---

# 2. Dasar Penyusunan Dokumen

PRD frontend ini dikembangkan dari tiga sumber utama:

1. dokumentasi teknis frontend yang memuat pola implementasi Next.js App Router, React Query, Axios, Zustand, React Hook Form, Zod, AppShell, dan role guard;
2. dokumentasi integrasi frontend dengan backend Roomify yang memuat endpoint aktif, format response, token flow, query parameter, kontrak data, status, dan error code;
3. PRD backend Roomify yang memuat alur bisnis, aturan waktu, konflik jadwal, role, ruang lingkup MVP, dan kebutuhan nonfungsional.

Pola dari project frontend sebelumnya digunakan sebagai referensi arsitektur, bukan sebagai daftar fitur. Modul khusus project lain seperti prediksi, riwayat prediksi, model ML, merek kendaraan, dan role `SUPERADMIN` tidak dibawa ke Roomify.

Adaptasi yang digunakan:

```text
Next.js App Router
AppShell untuk protected area
React Query untuk server state
Axios sebagai satu-satunya HTTP client
Zustand khusus auth state
React Hook Form + Zod untuk form
shadcn/ui untuk komponen dasar
Sonner untuk toast
Recharts untuk dashboard admin
```

Role Roomify hanya:

```text
MAHASISWA
ADMIN
```

---

# 3. Latar Belakang Masalah Frontend

Proses peminjaman ruangan secara manual menimbulkan masalah pengalaman pengguna:

- mahasiswa tidak mengetahui ruangan yang tersedia;
- data fasilitas dan kapasitas tersebar;
- jadwal penggunaan tidak terlihat;
- form manual mudah menghasilkan input salah;
- status permohonan tidak transparan;
- alasan penolakan sulit diketahui;
- admin harus memeriksa data dari banyak sumber;
- perubahan status tidak terlihat secara konsisten;
- daftar permohonan sulit difilter dan ditelusuri.

Frontend Roomify menyelesaikan masalah tersebut melalui:

- pencarian dan filter ruangan;
- detail ruangan yang lengkap;
- tampilan ketersediaan;
- form dengan validasi langsung;
- status dan timeline peminjaman;
- dashboard role-based;
- daftar administratif dengan pagination;
- dialog konfirmasi untuk tindakan penting;
- penanganan error backend yang konsisten.

---

# 4. Tujuan Frontend

## 4.1 Tujuan utama

- Membuat proses pencarian ruangan mudah dipahami.
- Mengurangi kesalahan mahasiswa saat mengisi jadwal dan jumlah peserta.
- Menjelaskan bahwa pengajuan tidak berarti langsung disetujui.
- Menampilkan status permohonan secara transparan.
- Mempercepat admin menemukan permohonan `PENDING`.
- Menjaga integrasi frontend-backend konsisten.
- Menyediakan antarmuka responsif untuk desktop dan mobile.
- Menyediakan struktur kode yang mudah dipelihara dan dikembangkan.

## 4.2 Indikator keberhasilan

Frontend MVP dianggap berhasil apabila:

- mahasiswa dapat registrasi dan login menggunakan email;
- sesi dapat dipulihkan melalui refresh token;
- redirect setelah login sesuai role;
- mahasiswa dapat mencari dan memfilter ruangan;
- mahasiswa dapat melihat detail dan ketersediaan ruangan;
- mahasiswa dapat membuat peminjaman;
- konflik jadwal ditampilkan secara jelas;
- mahasiswa dapat melihat dan membatalkan peminjaman yang memenuhi aturan;
- admin dapat mengelola ruangan;
- admin dapat melihat, menyetujui, menolak, dan menyelesaikan peminjaman;
- admin dapat melihat dashboard dan activity log;
- halaman list menggunakan pagination dari metadata backend;
- halaman memiliki loading, empty, error, dan success state;
- antarmuka berfungsi pada mobile dan desktop;
- pengujian alur utama lulus.

---

# 5. Ruang Lingkup

## 5.1 Termasuk dalam MVP

### Autentikasi

- Login.
- Registrasi mahasiswa.
- Logout.
- Bootstrap sesi.
- Refresh access token.
- Profil pengguna saat ini.
- Ubah password.
- Guest guard.
- Auth guard.
- Role guard.
- Redirect berdasarkan role.

### Mahasiswa

- Dashboard mahasiswa.
- Melihat daftar ruangan.
- Mencari ruangan.
- Memfilter ruangan.
- Melihat detail ruangan.
- Melihat ketersediaan berdasarkan tanggal.
- Mengajukan peminjaman.
- Melihat daftar peminjaman sendiri.
- Melihat detail peminjaman.
- Melihat catatan admin.
- Membatalkan peminjaman yang masih diperbolehkan.
- Melihat profil.

### Admin

- Dashboard admin.
- Melihat statistik peminjaman.
- Melihat tren peminjaman.
- Melihat penggunaan ruangan.
- Menambah ruangan.
- Mengubah ruangan.
- Mengubah status ruangan.
- Menonaktifkan ruangan.
- Melihat seluruh permohonan.
- Memfilter permohonan.
- Melihat detail permohonan.
- Menyetujui permohonan.
- Menolak dengan catatan.
- Menandai peminjaman selesai.
- Melihat daftar mahasiswa.
- Melihat detail mahasiswa.
- Mengaktifkan atau menonaktifkan mahasiswa.
- Melihat activity log.

### Sistem antarmuka

- Halaman 403.
- Halaman 404.
- Global error boundary.
- Loading state.
- Skeleton.
- Empty state.
- Toast.
- Dialog konfirmasi.
- Pagination.
- Responsive navigation.

## 5.2 Tidak termasuk dalam MVP

- Pembayaran.
- Google Calendar.
- QR code akses ruangan.
- Notifikasi WhatsApp atau SMS.
- Push notification.
- Chat.
- Aplikasi mobile native.
- Multi-tenant.
- Peminjaman alat.
- Sinkronisasi sistem akademik.
- Upload gambar langsung jika backend hanya menerima `image_url`.
- Real-time WebSocket.
- Dark mode sebagai kebutuhan wajib.
- Role `SUPERADMIN`.

---

# 6. Aktor dan Hak Akses Frontend

## 6.1 MAHASISWA

Navigasi:

```text
Dashboard
Cari Ruangan
Peminjaman Saya
Profil
```

Akses:

- `/mahasiswa/dashboard`
- `/mahasiswa/rooms`
- `/mahasiswa/rooms/[id]`
- `/mahasiswa/bookings`
- `/mahasiswa/bookings/[id]`
- `/mahasiswa/profile`
- `/mahasiswa/change-password`

Mahasiswa tidak boleh melihat menu admin. Apabila mahasiswa membuka URL admin secara langsung, frontend menampilkan 403 atau mengarahkan ke dashboard mahasiswa. Backend tetap melakukan pemeriksaan role.

## 6.2 ADMIN

Navigasi:

```text
Dashboard
Ruangan
Peminjaman
Mahasiswa
Activity Log
```

Akses:

- `/admin/dashboard`
- `/admin/rooms`
- `/admin/rooms/create`
- `/admin/rooms/[id]/edit`
- `/admin/bookings`
- `/admin/bookings/[id]`
- `/admin/mahasiswa`
- `/admin/mahasiswa/[id]`
- `/admin/activity-logs`

Admin tidak memerlukan NIM.

---

# 7. Alur Pengguna Utama

## 7.1 Registrasi

```text
Buka register
→ Isi nama, NIM, email, password
→ Validasi frontend
→ POST /auth/register
→ Registrasi berhasil
→ Redirect ke login
```

## 7.2 Login dan bootstrap sesi

```text
Isi email dan password
→ POST /auth/login
→ Simpan access token di memory
→ GET /auth/me
→ Simpan profil
→ Redirect sesuai role
```

Saat aplikasi dimuat ulang:

```text
Aplikasi tidak memiliki access token di memory
→ POST /auth/refresh memakai cookie HttpOnly
→ Terima access token baru
→ GET /auth/me
→ Pulihkan profil dan role
→ Render protected area
```

Jika refresh gagal:

```text
Bersihkan auth state
→ Redirect ke /login
```

## 7.3 Pencarian dan peminjaman

```text
Cari Ruangan
→ Terapkan filter
→ Buka detail
→ Pilih tanggal
→ Lihat availability
→ Isi form
→ Tinjau ringkasan
→ POST /bookings
→ Status PENDING
→ Buka detail peminjaman
```

## 7.4 Pemrosesan oleh admin

```text
Buka daftar peminjaman
→ Filter PENDING
→ Buka detail
→ Periksa mahasiswa, ruangan, jadwal, dan tujuan
→ Setujui atau tolak
→ Tampilkan hasil terbaru
→ Invalidate dashboard dan list
```

## 7.5 Pembatalan mahasiswa

```text
Buka detail peminjaman
→ Frontend menampilkan tombol jika status memungkinkan
→ Dialog konfirmasi
→ PATCH /bookings/{id}/cancel
→ Refresh detail dan daftar
```

Backend tetap dapat menolak pembatalan karena batas waktu.

---

# 8. Aturan Bisnis yang Harus Direpresentasikan

## 8.1 Login

- Login menggunakan email dan password.
- NIM tidak menjadi credential login.
- User nonaktif tidak dapat mengakses protected area.

## 8.2 Waktu peminjaman

Frontend memberi validasi awal:

- tanggal tidak boleh masa lalu;
- waktu selesai harus setelah waktu mulai;
- durasi minimum 30 menit;
- durasi maksimum 8 jam;
- pengajuan maksimal 90 hari;
- jam operasional 07.00–21.00.

Nilai konfigurasi frontend harus diletakkan pada constants dan tetap mengikuti backend.

## 8.3 Kapasitas

Jumlah peserta:

```text
1 <= participant_count <= room.capacity
```

## 8.4 Status ruangan

```text
AVAILABLE   → Tersedia dan dapat dipinjam
MAINTENANCE → Terlihat, tetapi tombol booking nonaktif
INACTIVE    → Tidak tampil pada mahasiswa
```

## 8.5 Status booking

```text
PENDING
APPROVED
REJECTED
CANCELLED
COMPLETED
```

Label UI:

```text
PENDING   → Menunggu Persetujuan
APPROVED  → Disetujui
REJECTED  → Ditolak
CANCELLED → Dibatalkan
COMPLETED → Selesai
```

## 8.6 Konflik

Frontend tidak menentukan konflik sebagai keputusan final. Frontend hanya:

- menampilkan availability;
- mencegah pilihan yang jelas tidak valid;
- mengirim request;
- menangani `BOOKING_TIME_CONFLICT`.

## 8.7 Penghapusan ruangan

Endpoint `DELETE` adalah soft delete. Copy UI menggunakan:

```text
Nonaktifkan ruangan
```

bukan:

```text
Hapus permanen
```

---

# 9. Kebutuhan Fungsional Frontend

## FR-FE-AUTH

- FR-FE-AUTH-01: Menyediakan form login email dan password.
- FR-FE-AUTH-02: Menyediakan form registrasi mahasiswa.
- FR-FE-AUTH-03: Memvalidasi NIM, email, password, dan konfirmasi password.
- FR-FE-AUTH-04: Menyimpan access token hanya pada memory/state aplikasi.
- FR-FE-AUTH-05: Mengirim refresh cookie melalui `withCredentials`.
- FR-FE-AUTH-06: Mencoba refresh sekali ketika menerima 401.
- FR-FE-AUTH-07: Mencegah refresh loop.
- FR-FE-AUTH-08: Mengambil profil melalui `/auth/me`.
- FR-FE-AUTH-09: Redirect berdasarkan role.
- FR-FE-AUTH-10: Mendukung logout.
- FR-FE-AUTH-11: Mendukung ubah password.
- FR-FE-AUTH-12: Menolak tampilan protected page saat sesi belum selesai diperiksa.

## FR-FE-NAV

- FR-FE-NAV-01: Menyediakan sidebar desktop.
- FR-FE-NAV-02: Menyediakan bottom navigation mahasiswa pada mobile.
- FR-FE-NAV-03: Menampilkan menu sesuai role.
- FR-FE-NAV-04: Menyediakan breadcrumb pada halaman detail.
- FR-FE-NAV-05: Menyediakan halaman 403 dan 404.

## FR-FE-ROOM

- FR-FE-ROOM-01: Menampilkan daftar ruangan.
- FR-FE-ROOM-02: Mendukung pencarian nama atau kode.
- FR-FE-ROOM-03: Mendukung filter gedung, status, kapasitas, dan fasilitas.
- FR-FE-ROOM-04: Mendukung sort dan pagination.
- FR-FE-ROOM-05: Menampilkan detail ruangan.
- FR-FE-ROOM-06: Menampilkan fasilitas, kapasitas, lokasi, dan status.
- FR-FE-ROOM-07: Menampilkan availability berdasarkan tanggal.
- FR-FE-ROOM-08: Menonaktifkan booking untuk ruangan yang tidak tersedia.

## FR-FE-BOOKING

- FR-FE-BOOKING-01: Menyediakan form pengajuan.
- FR-FE-BOOKING-02: Menampilkan ringkasan sebelum submit.
- FR-FE-BOOKING-03: Menampilkan validasi waktu dan kapasitas.
- FR-FE-BOOKING-04: Menangani konflik jadwal.
- FR-FE-BOOKING-05: Menampilkan riwayat mahasiswa.
- FR-FE-BOOKING-06: Mendukung filter dan pagination riwayat.
- FR-FE-BOOKING-07: Menampilkan detail dan timeline status.
- FR-FE-BOOKING-08: Menampilkan catatan admin.
- FR-FE-BOOKING-09: Menyediakan pembatalan dengan dialog konfirmasi.
- FR-FE-BOOKING-10: Menangani status yang sudah berubah pada server.

## FR-FE-ADMIN-ROOM

- FR-FE-AROOM-01: Menampilkan daftar ruangan admin.
- FR-FE-AROOM-02: Menyediakan form tambah ruangan.
- FR-FE-AROOM-03: Menyediakan form edit.
- FR-FE-AROOM-04: Mendukung fasilitas berbentuk tag.
- FR-FE-AROOM-05: Mendukung perubahan status.
- FR-FE-AROOM-06: Mendukung soft delete dengan konfirmasi.
- FR-FE-AROOM-07: Menangani kode ruangan duplikat.

## FR-FE-ADMIN-BOOKING

- FR-FE-ABOOK-01: Menampilkan seluruh permohonan.
- FR-FE-ABOOK-02: Menyediakan status tabs.
- FR-FE-ABOOK-03: Mendukung filter ruangan, mahasiswa, dan tanggal.
- FR-FE-ABOOK-04: Admin harus membuka detail sebelum approve/reject.
- FR-FE-ABOOK-05: Menyediakan approve dengan konfirmasi.
- FR-FE-ABOOK-06: Menyediakan reject dengan catatan wajib.
- FR-FE-ABOOK-07: Menyediakan complete saat diizinkan.
- FR-FE-ABOOK-08: Menangani konflik saat approval.
- FR-FE-ABOOK-09: Menangani stale status dengan refetch.

## FR-FE-DASHBOARD

- FR-FE-DASH-01: Menampilkan ringkasan mahasiswa.
- FR-FE-DASH-02: Menampilkan ringkasan admin.
- FR-FE-DASH-03: Menampilkan tren booking.
- FR-FE-DASH-04: Menampilkan penggunaan ruangan.
- FR-FE-DASH-05: Menampilkan permohonan terbaru yang membutuhkan tindakan.
- FR-FE-DASH-06: Menampilkan loading dan empty state.

## FR-FE-MAHASISWA-MGMT

- FR-FE-USER-01: Admin dapat melihat daftar mahasiswa.
- FR-FE-USER-02: Admin dapat melihat detail mahasiswa.
- FR-FE-USER-03: Admin dapat mengaktifkan atau menonaktifkan akun.
- FR-FE-USER-04: Perubahan status menggunakan dialog konfirmasi.
- FR-FE-USER-05: List mendukung search dan pagination apabila backend menyediakannya.

## FR-FE-AUDIT

- FR-FE-AUDIT-01: Admin dapat melihat activity log.
- FR-FE-AUDIT-02: Mendukung filter actor, action, entity type, dan entity ID.
- FR-FE-AUDIT-03: Menampilkan metadata melalui drawer.
- FR-FE-AUDIT-04: Menampilkan request ID untuk kebutuhan debugging.

---

# 10. Kebutuhan Nonfungsional

## 10.1 Performa

- Render awal tidak diblokir request yang tidak diperlukan.
- Request dashboard independen dapat dipanggil paralel.
- List memakai pagination backend.
- Filter search menggunakan debounce 300–500 ms.
- Halaman berat dapat menggunakan dynamic import.
- Gambar ruangan menggunakan optimasi image Next.js.
- Mutation tidak melakukan retry otomatis.
- Query read dapat retry satu kali.
- `refetchOnWindowFocus` dinonaktifkan secara default agar request tidak agresif.
- Data penting melakukan refetch setelah mutation terkait.

## 10.2 Keamanan

- Access token tidak disimpan di localStorage.
- Refresh token tidak dibaca frontend.
- Request refresh menggunakan cookie `HttpOnly`.
- Semua request protected menggunakan Bearer token.
- Role guard frontend bukan pengganti otorisasi backend.
- HTML dari backend tidak dirender mentah.
- Error tidak menampilkan stack trace.
- Secret tidak diletakkan pada `NEXT_PUBLIC_*`.
- `.env.local` tidak di-commit.
- Frontend tidak menyimpan password atau token dalam log.

## 10.3 Reliabilitas

- Refresh token hanya dicoba satu kali per request.
- Multiple 401 bersamaan memakai satu proses refresh.
- Request yang menunggu dilanjutkan setelah refresh berhasil.
- State auth dibersihkan saat refresh gagal.
- Error boundary tersedia.
- Mutation menampilkan hasil sukses atau gagal.
- Query dapat dicoba ulang manual.

## 10.4 Maintainability

- TypeScript strict.
- Type response terpusat.
- Semua request melalui satu instance Axios.
- Server state menggunakan React Query.
- Zustand hanya untuk auth state.
- Form menggunakan React Hook Form dan Zod.
- Query key didefinisikan konsisten.
- Page tidak berisi request kompleks.
- Komponen presentasional tidak memanggil API besar langsung.
- Lint dan format dijalankan lokal.

## 10.5 Aksesibilitas

- Semua input memiliki label.
- Error dikaitkan ke input.
- Navigasi keyboard didukung.
- Fokus terlihat.
- Dialog mengelola fokus.
- Status memiliki teks, tidak hanya warna.
- Target sentuh minimal 44×44 px.
- Kontras memenuhi kebutuhan keterbacaan.
- Tombol ikon mempunyai `aria-label`.
- Skeleton dan status async mempunyai label yang sesuai.

## 10.6 Responsiveness

- Mobile: satu kolom.
- Tablet: dua kolom untuk card list.
- Desktop: sidebar dan tabel penuh.
- Tabel administratif berubah menjadi kartu pada mobile.
- Filter mobile menggunakan sheet.
- Action utama dapat menjadi sticky pada mobile.

---

# 11. Keputusan Stack Frontend

| Komponen | Pilihan | Fungsi |
|---|---|---|
| Framework | Next.js App Router | Routing dan rendering |
| Bahasa | TypeScript | Type safety |
| UI runtime | React | Komponen antarmuka |
| Styling | Tailwind CSS | Styling utility |
| UI kit | shadcn/ui | Komponen dasar |
| HTTP client | Axios | Request dan interceptor |
| Server state | TanStack React Query | Query, mutation, cache |
| Global state | Zustand | Auth state |
| Form | React Hook Form | Form state |
| Validasi | Zod | Schema frontend |
| Toast | Sonner | Notifikasi |
| Ikon | Lucide React | Ikon konsisten |
| Tanggal | date-fns | Parse dan format waktu |
| Grafik | Recharts | Dashboard |
| Unit test | Vitest | Test logic |
| Component test | React Testing Library | Test UI |
| Mock API | MSW | Test integrasi frontend |
| E2E | Playwright | Alur pengguna |
| Lint | ESLint | Pemeriksaan kode |
| Format | Prettier | Format kode |

## 11.1 Prinsip pemilihan

- React Query menyimpan data server.
- Zustand tidak digunakan untuk list, dashboard, room, atau booking.
- Axios menjadi satu-satunya client HTTP.
- Zod schema dapat digunakan kembali untuk form dan tipe input.
- shadcn/ui dapat dikustomisasi mengikuti `DESIGN.md`.

---

# 12. Arsitektur Frontend

Alur utama:

```text
App Router
    ↓
Layout / AppShell
    ↓
Page
    ↓
Feature Component
    ↓
Hook Query / Mutation
    ↓
Axios API Client
    ↓
FastAPI Backend
```

State:

```text
Auth state   → Zustand
Server state → React Query
Form state   → React Hook Form
URL state    → searchParams
Local UI     → useState
```

## 12.1 Tanggung jawab layer

### App route

- Menentukan URL.
- Menyusun layout.
- Menyediakan page boundary.
- Tidak menyimpan business flow kompleks.

### Layout dan AppShell

- Menyediakan sidebar/header.
- Menjalankan auth bootstrap.
- Menangani loading sesi.
- Menentukan akses area.
- Menyediakan logout.

### Page

- Menyusun bagian halaman.
- Memanggil hook.
- Mengirim data ke komponen.

### Hook

- Menjalankan query dan mutation.
- Menormalisasi error.
- Menentukan query key.
- Melakukan invalidation.
- Menyusun form hook apabila diperlukan.

### API client

- Menentukan base URL.
- Mengirim credentials.
- Menyisipkan access token.
- Menangani refresh.
- Menormalisasi response transport.

### Component

- Menampilkan data.
- Mengirim event.
- Tidak membuat instance Axios baru.

### Store auth

- Menyimpan user.
- Menyimpan access token di memory.
- Menyimpan status authenticated.
- Menyimpan status bootstrap.

---

# 13. Struktur Folder

```text
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   │
│   ├── (mahasiswa)/
│   │   └── mahasiswa/
│   │       ├── dashboard/
│   │       │   └── page.tsx
│   │       ├── rooms/
│   │       │   ├── page.tsx
│   │       │   └── [roomId]/
│   │       │       └── page.tsx
│   │       ├── bookings/
│   │       │   ├── page.tsx
│   │       │   └── [bookingId]/
│   │       │       └── page.tsx
│   │       ├── profile/
│   │       │   └── page.tsx
│   │       ├── change-password/
│   │       │   └── page.tsx
│   │       └── layout.tsx
│   │
│   ├── (admin)/
│   │   └── admin/
│   │       ├── dashboard/
│   │       │   └── page.tsx
│   │       ├── rooms/
│   │       │   ├── page.tsx
│   │       │   ├── create/
│   │       │   │   └── page.tsx
│   │       │   └── [roomId]/
│   │       │       └── edit/
│   │       │           └── page.tsx
│   │       ├── bookings/
│   │       │   ├── page.tsx
│   │       │   └── [bookingId]/
│   │       │       └── page.tsx
│   │       ├── mahasiswa/
│   │       │   ├── page.tsx
│   │       │   └── [userId]/
│   │       │       └── page.tsx
│   │       ├── activity-logs/
│   │       │   └── page.tsx
│   │       └── layout.tsx
│   │
│   ├── 403/
│   │   └── page.tsx
│   ├── error.tsx
│   ├── loading.tsx
│   ├── not-found.tsx
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── ui/
│   ├── layout/
│   │   ├── app-shell.tsx
│   │   ├── app-sidebar.tsx
│   │   ├── app-header.tsx
│   │   └── mobile-bottom-nav.tsx
│   ├── auth/
│   ├── rooms/
│   ├── bookings/
│   ├── dashboards/
│   ├── mahasiswa/
│   ├── activity-logs/
│   └── shared/
│
├── hooks/
│   ├── useAuth.ts
│   ├── useRooms.ts
│   ├── useBookings.ts
│   ├── useAdminRooms.ts
│   ├── useAdminBookings.ts
│   ├── useDashboard.ts
│   ├── useMahasiswa.ts
│   ├── useActivityLogs.ts
│   ├── useDebounce.ts
│   └── usePaginationParams.ts
│
├── lib/
│   ├── axios.ts
│   ├── auth.ts
│   ├── providers.tsx
│   ├── query-client.ts
│   ├── query-keys.ts
│   ├── errors.ts
│   ├── date-time.ts
│   ├── formatters.ts
│   └── utils.ts
│
├── store/
│   └── authStore.ts
│
├── schemas/
│   ├── authSchema.ts
│   ├── roomSchema.ts
│   └── bookingSchema.ts
│
├── types/
│   ├── apiTypes.ts
│   ├── authTypes.ts
│   ├── roomTypes.ts
│   ├── bookingTypes.ts
│   ├── dashboardTypes.ts
│   ├── mahasiswaTypes.ts
│   └── activityLogTypes.ts
│
├── constants/
│   ├── routes.ts
│   ├── roles.ts
│   ├── statuses.ts
│   ├── booking-rules.ts
│   └── navigation.ts
│
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   ├── mocks/
│   └── setup.ts
│
├── public/
├── middleware.ts
├── .env.local
├── .env.example
├── components.json
├── next.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

# 14. Route Map

## 14.1 Guest

| Route | Fungsi |
|---|---|
| `/` | Redirect berdasarkan sesi |
| `/login` | Login |
| `/register` | Registrasi mahasiswa |

## 14.2 Mahasiswa

| Route | Fungsi |
|---|---|
| `/mahasiswa/dashboard` | Ringkasan peminjaman |
| `/mahasiswa/rooms` | Daftar ruangan |
| `/mahasiswa/rooms/[roomId]` | Detail dan availability |
| `/mahasiswa/bookings` | Riwayat sendiri |
| `/mahasiswa/bookings/[bookingId]` | Detail booking |
| `/mahasiswa/profile` | Profil |
| `/mahasiswa/change-password` | Ubah password |

## 14.3 Admin

| Route | Fungsi |
|---|---|
| `/admin/dashboard` | Dashboard admin |
| `/admin/rooms` | Manajemen ruangan |
| `/admin/rooms/create` | Tambah ruangan |
| `/admin/rooms/[roomId]/edit` | Edit ruangan |
| `/admin/bookings` | Daftar booking |
| `/admin/bookings/[bookingId]` | Detail dan tindakan |
| `/admin/mahasiswa` | Daftar mahasiswa |
| `/admin/mahasiswa/[userId]` | Detail mahasiswa |
| `/admin/activity-logs` | Activity log |

---

# 15. Desain Halaman

## 15.1 Login

Komponen:

- logo;
- email;
- password;
- show password;
- tombol masuk;
- link registrasi;
- error global.

State:

- default;
- loading;
- invalid credentials;
- inactive account;
- network error.

## 15.2 Register

Field:

- nama;
- NIM;
- email;
- password;
- konfirmasi password.

Tidak menampilkan pilihan role.

## 15.3 Dashboard mahasiswa

- greeting;
- total booking;
- pending;
- approved;
- completed;
- upcoming booking;
- recent bookings;
- tombol cari ruangan.

## 15.4 Daftar ruangan

- search;
- filter;
- sort;
- room cards;
- pagination;
- skeleton;
- empty state.

## 15.5 Detail ruangan

- gambar;
- identitas;
- status;
- lokasi;
- fasilitas;
- kapasitas;
- deskripsi;
- pemilih tanggal;
- jadwal;
- tombol booking.

## 15.6 Form booking

- ringkasan ruangan;
- tanggal;
- waktu mulai;
- waktu selesai;
- jumlah peserta;
- tujuan;
- catatan;
- ringkasan final;
- submit.

## 15.7 Booking mahasiswa

Desktop tabel, mobile card.

## 15.8 Detail booking mahasiswa

- kode;
- badge;
- timeline;
- data ruangan;
- jadwal;
- purpose;
- notes;
- admin note;
- cancel.

## 15.9 Dashboard admin

- mahasiswa aktif;
- total ruangan;
- status booking;
- trend;
- room usage;
- pending list.

## 15.10 Admin rooms

- table;
- filter;
- form;
- status action;
- soft delete.

## 15.11 Admin bookings

- status tabs;
- filter;
- table;
- detail;
- approve;
- reject;
- complete.

## 15.12 Admin mahasiswa

- search;
- status filter;
- table;
- detail;
- activate/deactivate.

## 15.13 Activity logs

- table;
- filter;
- detail drawer;
- request ID.

---

# 16. Design System

Frontend mengikuti arah:

```text
Modern Academic Workspace
```

Prinsip:

- latar slate terang;
- surface putih;
- primary biru;
- semantic status;
- radius sedang;
- shadow ringan;
- whitespace cukup;
- tanpa glassmorphism;
- tanpa gradient dekoratif berlebihan.

Token utama:

```text
Primary    #2563EB
Background #F8FAFC
Surface    #FFFFFF
Text       #0F172A
Border     #E2E8F0
Success    #15803D
Warning    #B45309
Danger     #B91C1C
```

Font:

```text
Inter
```

Detail aturan visual mengacu pada `DESIGN.md`.

---

# 17. Kontrak Response Frontend

## 17.1 Generic success

```ts
export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
  meta: PaginationMeta | null;
  request_id: string | null;
  timestamp: string;
}
```

## 17.2 Error

```ts
export interface ApiError {
  success: false;
  message: string;
  error: {
    code: string;
    details: unknown;
  };
  request_id?: string | null;
  timestamp?: string;
}
```

## 17.3 Pagination

```ts
export interface PaginationMeta {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}
```

Pagination UI wajib membaca `meta`, bukan menghitung total sendiri.

---

# 18. Kontrak Data

## 18.1 User

```ts
export type UserRole = "MAHASISWA" | "ADMIN";

export interface UserProfile {
  id: string;
  name: string;
  nim: string | null;
  email: string;
  role: UserRole;
  is_active?: boolean;
}
```

## 18.2 Room

```ts
export type RoomStatus = "AVAILABLE" | "MAINTENANCE" | "INACTIVE";

export interface Room {
  id: string;
  code: string;
  name: string;
  building: string;
  floor: number;
  location_description: string;
  capacity: number;
  facilities: string[];
  description: string;
  image_url: string | null;
  status: RoomStatus;
}
```

## 18.3 Booking

```ts
export type BookingStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED";

export interface Booking {
  id: string;
  booking_code: string;
  user_id: string;
  room_id: string;
  purpose: string;
  participant_count: number;
  booking_date: string;
  start_at: string;
  end_at: string;
  status: BookingStatus;
  user_note: string | null;
  admin_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  cancelled_by: string | null;
  cancelled_at: string | null;
  completed_by: string | null;
  completed_at: string | null;
}
```

Data list atau detail dapat memiliki embedded `room` dan `user`. Frontend harus mengikuti response backend aktif dan menyediakan adapter bila bentuk response berbeda.

---

# 19. API Client

File:

```text
frontend/lib/axios.ts
```

Konfigurasi:

```ts
baseURL: process.env.NEXT_PUBLIC_API_BASE_URL
withCredentials: true
```

Request interceptor:

- membaca access token dari Zustand;
- menambahkan `Authorization: Bearer <token>`;
- tidak menambahkan token pada login/register bila tidak diperlukan.

Response interceptor:

1. menerima 401;
2. memastikan request belum pernah di-retry;
3. memanggil refresh melalui satu shared promise;
4. menyimpan access token baru;
5. mengulang request;
6. jika gagal, membersihkan auth dan redirect login.

Aturan penting:

- hanya satu refresh berjalan pada satu waktu;
- mutation yang sudah menghasilkan response non-401 tidak diulang;
- endpoint refresh tidak boleh memicu refresh lagi;
- login dan refresh error dinormalisasi.

---

# 20. Auth State

Store:

```text
frontend/store/authStore.ts
```

State:

```ts
interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isHydratingAuth: boolean;
}
```

Action:

```text
setSession(user, accessToken)
setAccessToken(accessToken)
setUser(user)
setHydratingAuth(value)
clearAuth()
```

Keputusan:

- access token tidak dipersist;
- `isAuthenticated` tidak dijadikan bukti otorisasi tanpa bootstrap;
- user profile dapat dipersist hanya untuk pengalaman visual, tetapi tidak boleh digunakan sebagai security boundary;
- role final diperoleh dari `/auth/me`.

---

# 21. Auth Hooks

File:

```text
frontend/hooks/useAuth.ts
```

Hook:

```text
useAuthBootstrap()
useLoginForm()
useRegisterForm()
useLoginMutation()
useRegisterMutation()
useLogoutMutation()
useChangePasswordMutation()
```

## useAuthBootstrap

Tanggung jawab:

- set hydrating true;
- jika belum ada access token, coba refresh;
- panggil `/auth/me`;
- set user;
- set hydrating false;
- clear auth jika gagal.

## useLoginMutation

- POST login;
- simpan token;
- GET me;
- simpan user;
- invalidate auth query;
- redirect role.

## useLogoutMutation

- POST logout;
- clear store;
- clear React Query cache yang sensitif;
- redirect login.

---

# 22. Guard dan Redirect

Helper:

```text
frontend/lib/auth.ts
```

Function:

```text
getDefaultRoute(role)
canAccessArea(role, area)
```

Mapping:

```text
MAHASISWA → /mahasiswa/dashboard
ADMIN     → /admin/dashboard
```

Komponen:

```text
HomeRedirect
GuestGuard
AppShell
```

AppShell:

- menjalankan bootstrap;
- menampilkan splash/skeleton saat hydration;
- memeriksa user;
- memeriksa active status;
- memeriksa role;
- menampilkan navigation role;
- menyediakan logout.

Middleware boleh membantu redirect kasar, tetapi otorisasi final tetap pada bootstrap frontend dan backend.

---

# 23. React Query

## 23.1 Default

```text
retry: 1 untuk query read
retry: 0 untuk mutation
refetchOnWindowFocus: false
```

## 23.2 Query key

```ts
authKeys.me()

roomKeys.all()
roomKeys.list(params)
roomKeys.detail(roomId)
roomKeys.availability(roomId, date)

bookingKeys.me(params)
bookingKeys.detail(bookingId)
bookingKeys.admin(params)
bookingKeys.adminDetail(bookingId)

dashboardKeys.me()
dashboardKeys.admin()
dashboardKeys.trend(params)
dashboardKeys.roomUsage(params)

mahasiswaKeys.list(params)
mahasiswaKeys.detail(userId)

activityLogKeys.list(params)
```

## 23.3 Invalidation matrix

| Mutation | Invalidate |
|---|---|
| Create booking | booking me, dashboard me, room availability |
| Cancel booking | booking detail, booking me, dashboard me, availability |
| Create room | room lists, admin dashboard |
| Update room | room detail, room lists, admin dashboard |
| Change room status | room detail, room lists, availability |
| Soft delete room | room lists, admin dashboard |
| Approve booking | admin booking list/detail, admin dashboard, availability |
| Reject booking | admin booking list/detail, admin dashboard |
| Complete booking | admin booking list/detail, admin dashboard |
| Change mahasiswa status | mahasiswa list/detail, admin dashboard |
| Change password | auth/session sesuai kebijakan backend |

---

# 24. Hook per Modul

## 24.1 Rooms

File:

```text
frontend/hooks/useRooms.ts
```

Hook:

```text
useRooms(params)
useRoomDetail(roomId)
useRoomAvailability(roomId, date)
useRoomFilters()
```

## 24.2 Student bookings

File:

```text
frontend/hooks/useBookings.ts
```

Hook:

```text
useBookingForm(room)
useCreateBookingMutation()
useMyBookings(params)
useBookingDetail(bookingId)
useCancelBookingMutation()
```

## 24.3 Admin rooms

File:

```text
frontend/hooks/useAdminRooms.ts
```

Hook:

```text
useRoomCreateForm()
useRoomUpdateForm(room)
useCreateRoomMutation()
useUpdateRoomMutation()
useChangeRoomStatusMutation()
useDeactivateRoomMutation()
```

## 24.4 Admin bookings

File:

```text
frontend/hooks/useAdminBookings.ts
```

Hook:

```text
useAdminBookings(params)
useAdminBookingDetail(id)
useApproveBookingMutation()
useRejectBookingMutation()
useCompleteBookingMutation()
```

## 24.5 Dashboard

File:

```text
frontend/hooks/useDashboard.ts
```

Hook:

```text
useMahasiswaDashboard()
useAdminDashboard()
useBookingTrend()
useRoomUsage()
```

Independent dashboard endpoint dapat dipanggil paralel dengan `Promise.all` atau beberapa React Query hooks.

## 24.6 Mahasiswa management

```text
useMahasiswaList(params)
useMahasiswaDetail(userId)
useSetMahasiswaStatusMutation()
```

## 24.7 Activity logs

```text
useActivityLogs(params)
```

---

# 25. Form dan Zod

## 25.1 Login schema

```ts
email: valid email
password: required
```

## 25.2 Register schema

```ts
name: required
nim: numeric string, expected campus length
email: valid email
password: minimum 8
confirmPassword: same as password
```

## 25.3 Room schema

```ts
code: required
name: required
building: required
floor: integer
capacity: positive integer
facilities: array of strings
description: required
image_url: valid URL or empty
status: enum
```

## 25.4 Booking schema

```ts
room_id: required
purpose: required
participant_count: positive and <= room capacity
start_at: valid datetime
end_at: after start_at
user_note: optional
```

Frontend validation membantu pengguna. Backend error tetap ditampilkan jika aturan berubah.

---

# 26. Filter, Search, dan Pagination

State list disimpan pada URL:

```text
?search=lab&building=A&page=1&limit=10
```

Manfaat:

- halaman dapat di-refresh;
- filter dapat dibagikan;
- tombol back bekerja;
- state tidak hilang.

Aturan:

- perubahan filter mengembalikan page ke 1;
- search menggunakan debounce;
- nilai kosong tidak dimasukkan ke URL;
- parsing query divalidasi;
- `limit` memiliki nilai default;
- pagination memakai `meta.has_next` dan `meta.has_previous`.

---

# 27. Tanggal dan Zona Waktu

Backend menerima ISO 8601.

Contoh:

```text
2026-07-21T09:00:00+07:00
```

Frontend:

- input menggunakan Asia/Jakarta;
- payload menyertakan offset;
- display menggunakan format Indonesia;
- fungsi parse dan format terpusat;
- tidak memotong string tanggal secara manual;
- `booking_date` untuk display/filter;
- `start_at` dan `end_at` sebagai sumber jadwal.

Contoh tampilan:

```text
Senin, 21 Juli 2026
09.00–11.00 WIB
```

---

# 28. Error Handling

Helper:

```text
frontend/lib/errors.ts
```

Function:

```text
extractApiError(error)
getErrorMessage(code)
```

Mapping:

| Code | UI |
|---|---|
| `INVALID_CREDENTIALS` | Error login |
| `UNAUTHENTICATED` | Refresh atau logout |
| `TOKEN_EXPIRED` | Refresh |
| `REFRESH_TOKEN_REVOKED` | Logout |
| `FORBIDDEN` | 403 |
| `RESOURCE_NOT_FOUND` | 404/not found |
| `NIM_ALREADY_EXISTS` | Field NIM |
| `EMAIL_ALREADY_EXISTS` | Field email |
| `ROOM_CODE_ALREADY_EXISTS` | Field kode ruangan |
| `ROOM_NOT_AVAILABLE` | Disable form dan informasi status |
| `BOOKING_TIME_CONFLICT` | Field jadwal dan conflict alert |
| `INVALID_STATUS_TRANSITION` | Refetch detail |
| `INVALID_BOOKING_STATUS` | Refetch detail |
| `BOOKING_CANNOT_BE_CANCELLED` | Dialog informasi |
| `RATE_LIMIT_EXCEEDED` | Pesan tunggu dan coba lagi |
| `VALIDATION_ERROR` | Map ke field jika details tersedia |
| `INTERNAL_SERVER_ERROR` | General error + request ID |

`request_id` dapat ditampilkan dalam detail teknis kecil:

```text
Kode referensi: 01J...
```

---

# 29. UI State Wajib

Setiap halaman data menyediakan:

## Loading

- skeleton sesuai layout;
- tidak memakai spinner penuh kecuali bootstrap auth;
- tombol mempertahankan ukuran.

## Empty

- penjelasan;
- satu aksi relevan.

## Error

- pesan;
- coba lagi;
- request ID bila tersedia.

## Success

- toast;
- update state;
- redirect bila diperlukan.

## Stale data

Apabila mutation ditolak karena status berubah:

- tampilkan pesan;
- refetch;
- render status terbaru.

---

# 30. Komponen Reusable

```text
AppShell
AppSidebar
AppHeader
MobileBottomNavigation
PageHeader
StatCard
RoomCard
RoomStatusBadge
BookingStatusBadge
AvailabilityTimeline
BookingTimeline
BookingSummary
FilterBar
PaginationControls
DataTable
ResponsiveDataList
EmptyState
ErrorState
LoadingSkeleton
ConfirmActionDialog
RejectBookingDialog
RoomForm
BookingForm
UserAvatar
RoleGuard
GuestGuard
```

Aturan:

- komponen UI tidak mengetahui endpoint;
- komponen menerima typed props;
- dialog tidak melakukan mutation sendiri jika dapat dikendalikan oleh parent/hook;
- status label berasal dari constants.

---

# 31. API Mapping

## Auth

| UI | Endpoint |
|---|---|
| Register | `POST /auth/register` |
| Login | `POST /auth/login` |
| Bootstrap profile | `GET /auth/me` |
| Refresh | `POST /auth/refresh` |
| Logout | `POST /auth/logout` |
| Change password | `PATCH /auth/change-password` |

## Rooms

| UI | Endpoint |
|---|---|
| Room list | `GET /rooms` |
| Room detail | `GET /rooms/{room_id}` |
| Availability | `GET /rooms/{room_id}/availability` |
| Create | `POST /admin/rooms` |
| Update | `PATCH /admin/rooms/{room_id}` |
| Status | `PATCH /admin/rooms/{room_id}/status` |
| Deactivate | `DELETE /admin/rooms/{room_id}` |

## Bookings

| UI | Endpoint |
|---|---|
| Create | `POST /bookings` |
| My list | `GET /bookings/me` |
| My detail | `GET /bookings/{booking_id}` |
| Cancel | `PATCH /bookings/{booking_id}/cancel` |
| Admin list | `GET /admin/bookings` |
| Admin detail | `GET /admin/bookings/{booking_id}` |
| Approve | `PATCH /admin/bookings/{booking_id}/approve` |
| Reject | `PATCH /admin/bookings/{booking_id}/reject` |
| Complete | `PATCH /admin/bookings/{booking_id}/complete` |

## Dashboard

| UI | Endpoint |
|---|---|
| Mahasiswa | `GET /dashboards/me` |
| Admin summary | `GET /dashboards/admin` |
| Trend | `GET /dashboards/admin/booking-trend` |
| Usage | `GET /dashboards/admin/room-usage` |

## Mahasiswa admin

| UI | Endpoint |
|---|---|
| List | `GET /admin/mahasiswa` |
| Detail | `GET /admin/mahasiswa/{user_id}` |
| Status | `PATCH /admin/mahasiswa/{user_id}/status` |

## Activity log

| UI | Endpoint |
|---|---|
| List | `GET /activity-logs` |

---

# 32. Environment Variable

`.env.local`:

```dotenv
NEXT_PUBLIC_APP_NAME=Roomify
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_LOCAL_TIMEZONE=Asia/Jakarta
```

Jangan menyimpan:

```text
JWT secret
Database URL
Redis URL
Backend internal secret
```

`NEXT_PUBLIC_*` dapat terlihat oleh browser.

---

# 33. CORS dan Cookie

Kebutuhan integrasi lokal:

```text
Frontend: http://localhost:3000
Backend : http://localhost:8000
```

Axios:

```text
withCredentials: true
```

Backend harus mengizinkan origin frontend dan credentials.

Frontend tidak dapat memperbaiki cookie yang salah konfigurasi. Saat debugging, periksa:

- cookie muncul pada browser;
- domain dan path;
- SameSite;
- Secure;
- CORS;
- response refresh.

---

# 34. Pengujian

## 34.1 Unit test

- status label;
- role route helper;
- date formatter;
- pagination parser;
- error mapper;
- Zod schema;
- booking duration logic;
- capacity validation.

## 34.2 Component test

- login form;
- register validation;
- room card;
- booking form;
- status badge;
- confirmation dialog;
- empty/error state;
- responsive table card.

## 34.3 Integration test dengan MSW

- login success/failure;
- refresh success/failure;
- room list;
- pagination;
- create booking;
- conflict;
- cancel;
- admin approve;
- admin reject;
- status mahasiswa.

## 34.4 E2E

### Mahasiswa

```text
register
→ login
→ cari ruangan
→ detail
→ create booking
→ lihat booking
→ cancel
```

### Admin

```text
login
→ dashboard
→ open pending booking
→ approve/reject
→ manage room
→ view activity log
```

### Auth

```text
expired access token
→ refresh
→ original request succeeds
```

## 34.5 Target

```text
70% coverage keseluruhan
90% untuk auth helper dan booking form/business UI
```

Coverage bukan satu-satunya target. Alur utama wajib diuji.

---

# 35. Performa dan Caching

Frontend cache bukan sumber kebenaran.

Rekomendasi stale time:

| Query | Stale time awal |
|---|---:|
| Room list | 60 detik |
| Room detail | 120 detik |
| Availability | 30 detik |
| My bookings | 30 detik |
| Admin bookings | 20 detik |
| Dashboard | 60 detik |
| Activity log | 30 detik |

Mutation selalu diikuti invalidation yang sesuai.

Hindari:

- polling agresif;
- menyimpan salinan server data di Zustand;
- request duplicate pada mount;
- refetch semua query tanpa alasan.

---

# 36. Logging dan Debugging

Frontend log development boleh mencatat:

```text
method
path
status
request_id
error code
```

Tidak boleh mencatat:

```text
password
access token
refresh token
cookie
```

Scenario debugging:

## Redirect loop

Periksa:

- bootstrap dipanggil sekali;
- refresh endpoint tidak memicu interceptor;
- hydrating state;
- default route role.

## Auth hilang setelah reload

Periksa:

- cookie refresh tersedia;
- `withCredentials`;
- CORS;
- bootstrap refresh;
- `/auth/me`.

## Booking tidak muncul setelah create

Periksa:

- invalidation `bookingKeys.me`;
- dashboard invalidation;
- pagination/filter aktif;
- response mutation.

## Availability tidak berubah

Periksa:

- invalidate key room/date;
- format date query;
- timezone;
- backend cache invalidation.

## Admin status stale

Periksa:

- refetch detail setelah mutation;
- invalidation list;
- error `INVALID_BOOKING_STATUS`.

---

# 37. Keamanan Route

Frontend menyembunyikan menu dan melakukan guard, tetapi backend adalah security boundary.

Aturan:

- jangan render halaman admin sebelum role diketahui;
- jangan percaya role dari localStorage;
- setiap page protected menunggu bootstrap;
- forbidden bukan login redirect apabila user sudah login namun role salah;
- saat account inactive, clear auth dan tampilkan pesan.

---

# 38. Deployment dan Docker

## Development awal

```text
Frontend Next.js berjalan langsung di Windows
Backend FastAPI berjalan langsung di Windows
MongoDB dan Redis berjalan pada Docker
```

Frontend:

```text
http://localhost:3000
```

Backend:

```text
http://localhost:8000
```

## Tahap berikutnya

- tambahkan Dockerfile frontend;
- tambahkan frontend ke Docker Compose;
- environment production;
- reverse proxy Nginx;
- HTTPS;
- health check;
- build production.

CI/CD belum menjadi ruang lingkup awal.

---

# 39. Definition of Done

Satu fitur frontend dianggap selesai apabila:

- route tersedia;
- UI sesuai desain;
- responsive;
- type tersedia;
- Zod validation tersedia;
- query/mutation menggunakan Axios global;
- query key konsisten;
- invalidation benar;
- loading tersedia;
- empty state tersedia;
- error backend dipetakan;
- success feedback tersedia;
- role guard benar;
- accessibility dasar terpenuhi;
- test utama lulus;
- lint dan format lulus;
- dokumentasi diperbarui.

---

# 40. Tahapan Implementasi

## Sprint FE 0 — Fondasi

- Inisialisasi Next.js TypeScript.
- Tailwind CSS.
- shadcn/ui.
- Providers.
- QueryClient.
- Axios client.
- Zustand auth store.
- Design token.
- AppShell.
- Error/empty/loading component.
- Route constants.
- Type API umum.

## Sprint FE 1 — Auth

- Login.
- Register.
- Auth bootstrap.
- Refresh interceptor.
- GuestGuard.
- RoleGuard.
- HomeRedirect.
- Logout.
- Profile.
- Change password.

## Sprint FE 2 — Rooms

- Room types.
- Room list.
- Search/filter/pagination.
- Room card.
- Room detail.
- Availability.
- Admin room list.
- Create/edit room.
- Status dan deactivate.

## Sprint FE 3 — Bookings Mahasiswa

- Booking form.
- Date/time validation.
- Booking summary.
- Create.
- Conflict handling.
- My booking list.
- Detail.
- Timeline.
- Cancel.

## Sprint FE 4 — Admin Booking

- Admin booking list.
- Status tabs.
- Filter.
- Detail.
- Approve.
- Reject.
- Complete.
- Stale-status handling.

## Sprint FE 5 — Dashboard dan Admin Tambahan

- Dashboard mahasiswa.
- Dashboard admin.
- Trend.
- Usage.
- Mahasiswa management.
- Activity log.

## Sprint FE 6 — Hardening

- Responsive audit.
- Accessibility.
- Test.
- Error mapping.
- Performance.
- Documentation.
- Docker frontend.

---

# 41. Prioritas

## Wajib

- Auth dan refresh.
- Role guard.
- Room list/detail.
- Availability.
- Create booking.
- My bookings.
- Admin booking approval.
- Admin room management.
- Error handling.
- Responsive.
- Test alur utama.

## Bagus ditambahkan

- Dashboard chart.
- Activity log drawer.
- Mahasiswa management.
- Skeleton lengkap.
- URL-synced filters.
- E2E test penuh.

## Tahap kedua

- Kalender visual bulanan.
- Real-time status.
- Notification center.
- Upload gambar.
- Export laporan.
- QR code.
- Integrasi kalender.

---

# 42. Risiko Teknis

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Refresh request berulang | Loop dan banyak request | Shared refresh promise + retry flag |
| Token disimpan tidak aman | Token bocor | Memory only |
| Auth flicker | Redirect salah | `isHydratingAuth` |
| Role stale | Akses UI salah | `/auth/me` sebagai sumber role |
| Query tidak di-invalidate | Data lama | Invalidation matrix |
| Filter hilang | UX buruk | URL searchParams |
| Zona waktu salah | Jadwal bergeser | Helper terpusat + ISO offset |
| Double submit | Data ganda | Disable submit saat pending |
| Admin approve data stale | Status salah | Refetch dan backend validation |
| Response berubah | Runtime error | Type, adapter, contract test |
| Tabel buruk di mobile | Sulit digunakan | Card alternative |
| CORS/cookie salah | Login gagal | Dokumentasi debugging |
| UI menampilkan fitur backend belum siap | Request gagal | Feature readiness checklist |

---

# 43. Traceability Matrix

| Fitur | Page | Hook | Endpoint |
|---|---|---|---|
| Login | `/login` | `useLoginMutation` | `POST /auth/login` |
| Register | `/register` | `useRegisterMutation` | `POST /auth/register` |
| Bootstrap | AppShell | `useAuthBootstrap` | `POST /auth/refresh`, `GET /auth/me` |
| Rooms | `/mahasiswa/rooms` | `useRooms` | `GET /rooms` |
| Room detail | `/mahasiswa/rooms/[id]` | `useRoomDetail` | `GET /rooms/{id}` |
| Availability | Room detail | `useRoomAvailability` | `GET /rooms/{id}/availability` |
| Create booking | Room detail/form | `useCreateBookingMutation` | `POST /bookings` |
| My bookings | `/mahasiswa/bookings` | `useMyBookings` | `GET /bookings/me` |
| Booking detail | `/mahasiswa/bookings/[id]` | `useBookingDetail` | `GET /bookings/{id}` |
| Cancel | Booking detail | `useCancelBookingMutation` | `PATCH /bookings/{id}/cancel` |
| Admin rooms | `/admin/rooms` | `useAdminRooms` | room endpoints |
| Admin bookings | `/admin/bookings` | `useAdminBookings` | `GET /admin/bookings` |
| Approve | Admin detail | `useApproveBookingMutation` | approve endpoint |
| Reject | Admin detail | `useRejectBookingMutation` | reject endpoint |
| Complete | Admin detail | `useCompleteBookingMutation` | complete endpoint |
| Student dashboard | `/mahasiswa/dashboard` | `useMahasiswaDashboard` | `GET /dashboards/me` |
| Admin dashboard | `/admin/dashboard` | `useAdminDashboard` | dashboard endpoints |
| Mahasiswa admin | `/admin/mahasiswa` | `useMahasiswaList` | admin mahasiswa endpoints |
| Activity logs | `/admin/activity-logs` | `useActivityLogs` | `GET /activity-logs` |

---

# 44. Acceptance Criteria

## Auth

- Login menggunakan email.
- Token refresh berjalan setelah reload.
- Multiple 401 tidak menghasilkan multiple refresh request.
- Role redirect benar.
- User tidak aktif ditolak.
- Logout membersihkan state.

## Rooms

- Search dan filter bekerja.
- Pagination mengikuti meta.
- Status terlihat jelas.
- Maintenance tidak dapat dibooking.
- Availability berubah sesuai tanggal.

## Booking

- Invalid date/time ditolak sebelum submit.
- Kapasitas divalidasi.
- Conflict backend ditampilkan.
- Successful booking menjadi PENDING.
- Detail menampilkan admin note.
- Cancel mempunyai konfirmasi.

## Admin booking

- Pending mudah ditemukan.
- Detail wajib dibuka sebelum tindakan.
- Reject mewajibkan alasan.
- Conflict approval ditampilkan.
- UI refetch setelah perubahan status.

## Responsive

- Navigasi mobile berfungsi.
- Tabel berubah menjadi card.
- Dialog/form dapat digunakan pada layar kecil.
- Tidak ada horizontal overflow utama.

## Accessibility

- Keyboard navigation.
- Focus visible.
- Label form.
- Status text.
- Dialog focus management.

---

# 45. Kesimpulan Keputusan Teknis

Stack frontend:

```text
Next.js App Router
React
TypeScript
Tailwind CSS
shadcn/ui
Axios
TanStack React Query
Zustand
React Hook Form
Zod
Sonner
Lucide React
date-fns
Recharts
Vitest
React Testing Library
MSW
Playwright
```

Arsitektur:

```text
Route
  ↓
Layout / AppShell
  ↓
Page
  ↓
Feature Component
  ↓
Hook
  ↓
Axios
  ↓
FastAPI
```

Pembagian state:

```text
Auth    → Zustand
Server  → React Query
Form    → React Hook Form
Filter  → URL searchParams
UI      → Local state
```

Dokumen ini menjadi acuan implementasi frontend Roomify. Pengerjaan dimulai dari fondasi dan autentikasi, kemudian room discovery, booking mahasiswa, pemrosesan admin, dashboard, dan hardening.
