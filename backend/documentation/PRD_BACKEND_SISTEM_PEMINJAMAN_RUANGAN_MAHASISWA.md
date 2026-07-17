# PRD dan Desain Teknis Backend
## Sistem Peminjaman Ruangan

**Nama sementara produk:** Roomify  
**Jenis aplikasi:** Aplikasi web *full-stack*  
**Fokus tahap pertama:** Backend API  
**Status dokumen:** Draft implementasi v1  
**Target pengguna:** Mahasiswa sebagai peminjam ruangan serta administrator/petugas kampus sebagai pengelola.

---

# 1. Ringkasan Produk

Sistem Peminjaman Ruangan adalah aplikasi berbasis web yang digunakan mahasiswa untuk melihat ruangan, mengecek ketersediaan jadwal, mengajukan peminjaman, dan memantau status permohonan. Administrator atau petugas kampus dapat mengelola ruangan serta menyetujui atau menolak permohonan.

Project ini dirancang sebagai aplikasi *full-stack* yang tetap realistis untuk tugas perkuliahan. Materi utama yang diterapkan adalah:

1. MongoDB sebagai database utama.
2. Redis sebagai *cache* dan penyimpanan data sementara.
3. Docker dan Docker Compose untuk menjalankan seluruh layanan.

---

# 2. Latar Belakang Masalah

Proses peminjaman ruangan yang dilakukan melalui pesan pribadi, formulir manual, atau spreadsheet memiliki beberapa masalah:

- pengguna sulit mengetahui ruangan yang tersedia;
- jadwal dapat bertabrakan;
- status permohonan tidak transparan;
- administrator harus mengecek jadwal secara manual;
- data riwayat peminjaman sulit dicari;
- laporan penggunaan ruangan tidak tersedia secara langsung.

Sistem ini menyelesaikan masalah tersebut dengan menyediakan satu aplikasi terpusat untuk pengajuan, pemeriksaan konflik jadwal, persetujuan, dan pemantauan peminjaman.

---

# 3. Tujuan Produk

## 3.1 Tujuan utama

- Mempermudah pengguna mencari ruangan yang tersedia.
- Mencegah peminjaman pada jadwal yang bertabrakan.
- Mempermudah administrator memproses permohonan.
- Menyediakan riwayat dan statistik penggunaan ruangan.
- Menerapkan MongoDB, Redis, Docker, dan Docker Compose dalam satu project nyata.

## 3.2 Indikator keberhasilan

Versi pertama dianggap berhasil apabila:

- mahasiswa dapat registrasi dan login menggunakan email;
- mahasiswa dapat melihat ruangan dan ketersediaannya;
- mahasiswa dapat mengajukan peminjaman;
- sistem dapat mendeteksi konflik jadwal;
- admin dapat menyetujui atau menolak permohonan;
- mahasiswa dapat melihat perubahan status permohonannya;
- backend, frontend, MongoDB, dan Redis dapat dijalankan menggunakan Docker Compose;
- endpoint utama memiliki pengujian otomatis secara lokal.

---

# 4. Ruang Lingkup

## 4.1 Termasuk dalam MVP

### Mahasiswa

- Registrasi akun.
- Login dan logout.
- Melihat profil.
- Mengubah password.
- Melihat daftar dan detail ruangan.
- Mencari ruangan.
- Memfilter ruangan berdasarkan kapasitas, gedung, fasilitas, dan status.
- Mengecek ketersediaan berdasarkan tanggal dan waktu.
- Membuat permohonan peminjaman.
- Melihat riwayat peminjaman pribadi.
- Melihat detail peminjaman.
- Membatalkan permohonan yang masih dapat dibatalkan.

### Administrator

- Login sebagai admin.
- Melihat dashboard.
- Mengelola data ruangan.
- Mengelola fasilitas ruangan.
- Melihat seluruh permohonan.
- Menyetujui permohonan.
- Menolak permohonan dengan catatan.
- Menandai peminjaman selesai.
- Mengelola status aktif mahasiswa.
- Melihat kalender penggunaan ruangan.
- Melihat *activity log*.

## 4.2 Tidak termasuk dalam MVP

- Pembayaran.
- Integrasi Google Calendar.
- QR code akses ruangan.
- Notifikasi WhatsApp atau SMS.
- Aplikasi mobile.
- Multi-organisasi atau multi-tenant.
- Sistem peminjaman peralatan.
- Sinkronisasi dengan sistem akademik.
- Elasticsearch.
- RabbitMQ.

Fitur tersebut dapat menjadi pengembangan tahap kedua.

---

# 5. Aktor dan Hak Akses

## 5.1 MAHASISWA

Mahasiswa yang terdaftar pada sistem dan dapat melihat ruangan serta membuat peminjaman.

Hak akses:

- membaca data ruangan aktif;
- melihat ketersediaan;
- membuat peminjaman;
- melihat data peminjaman sendiri;
- membatalkan permohonan sendiri;
- mengubah profil dan password sendiri.


Keputusan role:

```text
MAHASISWA
ADMIN
```

Role `MAHASISWA` digunakan untuk akun peminjam. Role `ADMIN` digunakan untuk petugas pengelola ruangan. Nama collection tetap `users` karena collection tersebut menyimpan seluruh akun autentikasi.

## 5.2 ADMIN

Petugas yang mengelola ruangan dan permohonan.

Hak akses:

- seluruh akses MAHASISWA;
- CRUD ruangan;
- melihat seluruh peminjaman;
- menyetujui dan menolak peminjaman;
- menyelesaikan peminjaman;
- mengaktifkan atau menonaktifkan pengguna;
- melihat dashboard dan log aktivitas.

---

# 6. Alur Bisnis Utama

## 6.1 Registrasi dan login

1. Mahasiswa mengisi nama, NIM, email, dan password.
2. Backend memvalidasi data.
3. Backend memastikan NIM dan email belum digunakan.
4. Password di-*hash*.
5. Akun dibuat dengan role `MAHASISWA`.
6. Mahasiswa login menggunakan email dan password.
7. Backend mengeluarkan *access token* dan *refresh token*.
8. Frontend menggunakan token untuk mengakses endpoint terproteksi.

## 6.2 Pengajuan peminjaman

1. Mahasiswa memilih ruangan.
2. Mahasiswa memilih tanggal, waktu mulai, dan waktu selesai.
3. Mahasiswa mengisi tujuan kegiatan dan jumlah peserta.
4. Backend memvalidasi data.
5. Backend memastikan ruangan aktif.
6. Backend memastikan kapasitas ruangan mencukupi.
7. Backend memeriksa konflik jadwal.
8. Permohonan disimpan dengan status `PENDING`.
9. Cache ketersediaan ruangan dihapus.
10. Mahasiswa menerima detail permohonan.

## 6.3 Persetujuan peminjaman

1. Admin membuka permohonan `PENDING`.
2. Backend melakukan pemeriksaan konflik sekali lagi.
3. Jika tidak ada konflik, status menjadi `APPROVED`.
4. Jika ada konflik, persetujuan ditolak oleh sistem.
5. Cache jadwal, dashboard, dan daftar peminjaman terkait dihapus.
6. Aktivitas admin dicatat.

Pemeriksaan ulang pada saat persetujuan diperlukan untuk menghindari dua permohonan yang dibuat hampir bersamaan.

## 6.4 Penolakan peminjaman

1. Admin memilih permohonan.
2. Admin memasukkan alasan penolakan.
3. Status berubah menjadi `REJECTED`.
4. Catatan admin disimpan.
5. Aktivitas dicatat.

## 6.5 Pembatalan oleh mahasiswa

Mahasiswa hanya dapat membatalkan peminjaman apabila:

- peminjaman dimiliki oleh mahasiswa tersebut;
- status masih `PENDING` atau `APPROVED`;
- waktu mulai belum terlewati;
- pembatalan masih memenuhi batas waktu yang ditentukan.

---

# 7. Status Peminjaman

Status yang digunakan:

```text
PENDING
APPROVED
REJECTED
CANCELLED
COMPLETED
```

Transisi yang diizinkan:

```text
PENDING   -> APPROVED
PENDING   -> REJECTED
PENDING   -> CANCELLED
APPROVED  -> CANCELLED
APPROVED  -> COMPLETED
```

Transisi yang tidak terdapat pada daftar di atas harus ditolak oleh backend.

---

# 8. Aturan Bisnis

## 8.1 Aturan waktu

- Tanggal peminjaman tidak boleh berada di masa lalu.
- Waktu selesai harus lebih besar daripada waktu mulai.
- Durasi minimum peminjaman: 30 menit.
- Durasi maksimum peminjaman: 8 jam.
- Pengajuan maksimal 90 hari sebelum jadwal.
- Jam operasional awal: 07.00–21.00.
- Aturan tersebut dibuat melalui konfigurasi agar dapat diubah tanpa mengubah kode utama.

## 8.2 Konflik jadwal

Dua jadwal dianggap bertabrakan apabila:

```text
waktu_mulai_baru < waktu_selesai_lama
AND
waktu_selesai_baru > waktu_mulai_lama
```

Pemeriksaan hanya dilakukan terhadap peminjaman dengan status yang memblokir jadwal, yaitu:

```text
APPROVED
```

Keputusan MVP: permohonan `PENDING` tidak langsung memblokir ruangan. Namun, persetujuan admin harus memeriksa konflik kembali.

## 8.3 Kapasitas

Jumlah peserta tidak boleh melebihi kapasitas ruangan.

## 8.4 Status ruangan

Status ruangan:

```text
AVAILABLE
MAINTENANCE
INACTIVE
```

- `AVAILABLE`: dapat dilihat dan dipinjam.
- `MAINTENANCE`: dapat dilihat, tetapi tidak dapat dipinjam.
- `INACTIVE`: tidak ditampilkan pada halaman publik.

## 8.5 Penghapusan data

- Ruangan yang sudah pernah memiliki riwayat peminjaman tidak dihapus permanen.
- Penghapusan ruangan menggunakan *soft delete* atau perubahan status menjadi `INACTIVE`.
- Mahasiswa dinonaktifkan tanpa menghapus riwayatnya.
- Peminjaman tidak dapat dihapus oleh pengguna atau admin pada MVP.

---

# 9. Kebutuhan Fungsional

## FR-AUTH

- FR-AUTH-01: Sistem harus mendukung registrasi pengguna.
- FR-AUTH-02: Sistem harus menolak NIM duplikat.
- FR-AUTH-03: Sistem harus menolak email duplikat.
- FR-AUTH-04: Sistem harus mendukung login menggunakan email.
- FR-AUTH-05: Sistem harus mendukung refresh token.
- FR-AUTH-06: Sistem harus mendukung logout.
- FR-AUTH-07: Sistem harus menolak akun tidak aktif.
- FR-AUTH-08: Sistem harus membatasi endpoint berdasarkan role.
- FR-AUTH-09: Sistem harus mendukung perubahan password.

## FR-ROOM

- FR-ROOM-01: Mahasiswa dapat melihat ruangan aktif.
- FR-ROOM-02: Mahasiswa dapat melihat detail ruangan.
- FR-ROOM-03: Mahasiswa dapat mencari dan memfilter ruangan.
- FR-ROOM-04: Mahasiswa dapat mengecek ketersediaan.
- FR-ROOM-05: Admin dapat menambah ruangan.
- FR-ROOM-06: Admin dapat mengubah ruangan.
- FR-ROOM-07: Admin dapat menonaktifkan ruangan.
- FR-ROOM-08: Kode ruangan harus unik.

## FR-BOOKING

- FR-BOOKING-01: Mahasiswa dapat membuat permohonan.
- FR-BOOKING-02: Sistem harus memvalidasi tanggal dan waktu.
- FR-BOOKING-03: Sistem harus mendeteksi konflik.
- FR-BOOKING-04: Mahasiswa dapat melihat peminjaman sendiri.
- FR-BOOKING-05: Mahasiswa dapat membatalkan peminjaman.
- FR-BOOKING-06: Admin dapat melihat seluruh peminjaman.
- FR-BOOKING-07: Admin dapat menyetujui permohonan.
- FR-BOOKING-08: Admin dapat menolak permohonan.
- FR-BOOKING-09: Admin dapat menandai peminjaman selesai.
- FR-BOOKING-10: Setiap perubahan status harus menyimpan waktu dan aktor.

## FR-DASHBOARD

- FR-DASH-01: Admin dapat melihat jumlah mahasiswa aktif.
- FR-DASH-02: Admin dapat melihat total ruangan.
- FR-DASH-03: Admin dapat melihat jumlah permohonan per status.
- FR-DASH-04: Admin dapat melihat ruangan paling sering digunakan.
- FR-DASH-05: Admin dapat melihat tren peminjaman.
- FR-DASH-06: Mahasiswa dapat melihat ringkasan peminjamannya sendiri.

## FR-AUDIT

- FR-AUDIT-01: Sistem mencatat login penting dan perubahan data.
- FR-AUDIT-02: Sistem mencatat aktor, aksi, entitas, waktu, dan metadata.
- FR-AUDIT-03: Hanya admin yang dapat melihat log aktivitas.

---

# 10. Kebutuhan Nonfungsional

## 10.1 Performa

- Target respons endpoint umum: kurang dari 500 ms pada lingkungan lokal normal.
- Endpoint daftar menggunakan pagination.
- Data yang sering dibaca dapat disimpan di Redis.
- Query MongoDB harus menggunakan index yang sesuai.

## 10.2 Keamanan

- Password disimpan dalam bentuk hash Argon2.
- Token memiliki masa berlaku.
- Refresh token dapat dicabut.
- Endpoint admin menggunakan pemeriksaan role di backend.
- Request body divalidasi dengan Pydantic.
- CORS hanya mengizinkan origin frontend yang ditentukan.
- Rate limiting diterapkan pada login dan endpoint sensitif.
- Log tidak boleh menyimpan password atau token mentah.
- Secret disimpan melalui environment variable.
- Header keamanan diterapkan pada reverse proxy atau aplikasi.
- Input pencarian dibatasi panjangnya.
- ObjectId divalidasi sebelum query database.

## 10.3 Reliabilitas

- Health check tersedia untuk API, MongoDB, dan Redis.
- Kegagalan Redis tidak boleh membuat fungsi utama berhenti total.
- Database tetap menjadi sumber data utama.
- Cache dapat dibuat ulang dari database.
- Exception tidak boleh mengekspos detail internal kepada client.

## 10.4 Maintainability

- Kode menggunakan type hint.
- Pemisahan route, service, repository, schema, dan model.
- Format response konsisten.
- Pengujian otomatis untuk aturan bisnis utama.
- Lint dan format dijalankan secara lokal.

## 10.5 Observability

- Log berbentuk terstruktur.
- Setiap request memiliki `request_id`.
- Log mencatat method, path, status code, dan durasi.
- Error server memiliki log stack trace.
- Endpoint health tersedia tanpa autentikasi.

---

# 11. Keputusan Stack Backend

> **Catatan ruang lingkup:** Project tahap awal difokuskan pada backend, MongoDB, Redis, pengujian lokal, Docker, dan Docker Compose.


## 11.1 Runtime dan framework

| Komponen | Pilihan | Fungsi |
|---|---|---|
| Bahasa | Python 3.13 | Runtime backend |
| Framework | FastAPI | REST API |
| ASGI server | Uvicorn | Menjalankan aplikasi |
| Validasi | Pydantic v2 | Request, response, dan konfigurasi |
| Konfigurasi | pydantic-settings | Environment variable |
| Database driver | PyMongo Async API | Akses MongoDB secara asynchronous |
| Cache | redis-py asyncio | Akses Redis |
| Password | pwdlib + Argon2 | Hash dan verifikasi password |
| JWT | PyJWT | Access dan refresh token |
| Testing | pytest + pytest-asyncio | Unit dan integration test |
| HTTP test client | HTTPX | Pengujian endpoint |
| Logging | structlog | Log terstruktur |
| Lint | Ruff | Lint dan format |
| Type checking | mypy | Pemeriksaan tipe opsional |

## 11.2 Mengapa FastAPI

- Validasi berbasis type hint.
- Dokumentasi OpenAPI, Swagger UI, dan ReDoc otomatis.
- Mendukung endpoint asynchronous.
- Cocok digunakan bersama PyMongo Async dan Redis asyncio.
- Struktur API lebih ringkas dibandingkan menggunakan Flask dengan banyak extension.

## 11.3 Mengapa tidak menggunakan Motor

Project baru menggunakan PyMongo Async API. Motor tidak dipilih agar project tidak bergantung pada driver async lama.

## 11.4 Package manager

Rekomendasi:

```text
uv
```

Alternatif:

```text
pip + requirements.txt
```

Untuk tugas perkuliahan, `uv` dapat digunakan bersama `pyproject.toml`. File lock disimpan di repository agar versi dependency konsisten.

---

# 12. Arsitektur Backend

Arsitektur diadaptasi dari pola:

```text
Route -> Controller -> Service -> Repository -> Database
```

Pada FastAPI, fungsi endpoint sudah berperan sebagai controller. Karena itu, implementasi disederhanakan menjadi:

```text
main.py
   ↓
API Router / Endpoint
   ↓
Service
   ↓
Repository
   ↓
MongoDB / Redis
```

Komponen tambahan:

```text
Dependencies -> Auth, current user, role
Schemas      -> Validasi request dan response
Core         -> Config, security, exception, logging
Middleware   -> Request ID, logging, CORS
Cache        -> Cache helper dan invalidation
```

## 12.1 Tanggung jawab layer

### API Router

- Mendefinisikan path dan method.
- Membaca parameter.
- Memanggil service.
- Menentukan status code.
- Tidak berisi query database langsung.

### Service

- Menyimpan aturan bisnis.
- Memvalidasi transisi status.
- Memeriksa konflik jadwal.
- Menggabungkan beberapa repository.
- Menghapus cache setelah perubahan data.

### Repository

- Menjalankan query MongoDB.
- Membuat filter, pagination, dan update.
- Tidak menentukan response HTTP.
- Tidak menyimpan aturan bisnis kompleks.

### Schema

- Memvalidasi input.
- Mendefinisikan response.
- Memisahkan schema create, update, dan read.

### Model/Document Mapper

MongoDB tidak menggunakan ORM wajib. Model domain dan fungsi serialisasi digunakan untuk:

- membentuk dokumen;
- mengubah `ObjectId` menjadi string;
- menjaga nama field konsisten.

---

# 13. Struktur Folder Backend

```text
backend/
├── app/
│   ├── main.py
│   ├── lifespan.py
│   │
│   ├── api/
│   │   ├── router.py
│   │   ├── dependencies.py
│   │   └── endpoints/
│   │       ├── auth.py
│   │       ├── users.py
│   │       ├── rooms.py
│   │       ├── bookings.py
│   │       ├── dashboards.py
│   │       ├── activity_logs.py
│   │       └── health.py
│   │
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   ├── exceptions.py
│   │   ├── error_handlers.py
│   │   ├── logging.py
│   │   └── constants.py
│   │
│   ├── database/
│   │   ├── mongodb.py
│   │   ├── redis.py
│   │   └── indexes.py
│   │
│   ├── middleware/
│   │   ├── request_id.py
│   │   └── access_log.py
│   │
│   ├── schemas/
│   │   ├── common.py
│   │   ├── auth.py
│   │   ├── user.py
│   │   ├── room.py
│   │   ├── booking.py
│   │   ├── dashboard.py
│   │   └── activity_log.py
│   │
│   ├── repositories/
│   │   ├── user_repository.py
│   │   ├── refresh_token_repository.py
│   │   ├── room_repository.py
│   │   ├── booking_repository.py
│   │   └── activity_log_repository.py
│   │
│   ├── services/
│   │   ├── auth_service.py
│   │   ├── user_service.py
│   │   ├── room_service.py
│   │   ├── booking_service.py
│   │   ├── dashboard_service.py
│   │   └── activity_log_service.py
│   │
│   ├── cache/
│   │   ├── keys.py
│   │   ├── client.py
│   │   └── invalidation.py
│   │
│   ├── utils/
│   │   ├── object_id.py
│   │   ├── pagination.py
│   │   ├── datetime.py
│   │   └── slug.py
│   │
│   └── tests/
│       ├── unit/
│       ├── integration/
│       ├── fixtures/
│       └── conftest.py
│
├── scripts/
│   ├── seed_admin.py
│   ├── seed_rooms.py
│   └── create_indexes.py
│
├── Dockerfile
├── pyproject.toml
├── uv.lock
├── .env.example
├── .dockerignore
├── README.md
└── Makefile
```

---

# 14. Kontrak Response API

## 14.1 Response sukses

```json
{
  "success": true,
  "message": "Permohonan peminjaman berhasil dibuat",
  "data": {},
  "meta": null,
  "request_id": "01J...",
  "timestamp": "2026-07-16T10:00:00Z"
}
```

## 14.2 Response daftar dengan pagination

```json
{
  "success": true,
  "message": "Data ruangan berhasil diambil",
  "data": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "total_items": 42,
    "total_pages": 5,
    "has_next": true,
    "has_previous": false
  },
  "request_id": "01J...",
  "timestamp": "2026-07-16T10:00:00Z"
}
```

## 14.3 Response error

```json
{
  "success": false,
  "message": "Jadwal ruangan bertabrakan",
  "error": {
    "code": "BOOKING_TIME_CONFLICT",
    "details": null
  },
  "request_id": "01J...",
  "timestamp": "2026-07-16T10:00:00Z"
}
```

## 14.4 Kode error utama

```text
VALIDATION_ERROR
UNAUTHENTICATED
INVALID_CREDENTIALS
TOKEN_EXPIRED
REFRESH_TOKEN_REVOKED
FORBIDDEN
RESOURCE_NOT_FOUND
NIM_ALREADY_EXISTS
EMAIL_ALREADY_EXISTS
ROOM_CODE_ALREADY_EXISTS
ROOM_NOT_AVAILABLE
BOOKING_TIME_CONFLICT
INVALID_STATUS_TRANSITION
BOOKING_CANNOT_BE_CANCELLED
RATE_LIMIT_EXCEEDED
INTERNAL_SERVER_ERROR
```

---

# 15. Model Data MongoDB

## 15.1 Collection `users`

```json
{
  "_id": "ObjectId",
  "name": "Muhammad Dafa Aziul Ardi",
  "nim": "2311082027",
  "email": "2311082027@student.pnp.ac.id",
  "password_hash": "argon2_hash",
  "role": "MAHASISWA",
  "phone": null,
  "is_active": true,
  "last_login_at": null,
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

Index:

```text
nim unique
email unique
role
is_active
created_at descending
```


Aturan field `nim`:

- wajib untuk akun dengan role `MAHASISWA`;
- harus unik;
- disimpan sebagai string agar angka nol di awal tidak hilang;
- hanya boleh berisi angka;
- panjang awal yang digunakan adalah 10 digit dan dapat disesuaikan dengan format NIM kampus;
- tidak wajib untuk akun `ADMIN` yang dibuat melalui seed atau oleh administrator.

## 15.2 Collection `rooms`

```json
{
  "_id": "ObjectId",
  "code": "LAB-01",
  "name": "Laboratorium Komputer 1",
  "building": "Gedung A",
  "floor": 2,
  "location_description": "Lantai 2, sebelah ruang server",
  "capacity": 30,
  "facilities": [
    "AC",
    "Proyektor",
    "Komputer"
  ],
  "description": "Laboratorium untuk praktikum komputer",
  "image_url": null,
  "status": "AVAILABLE",
  "is_deleted": false,
  "created_by": "ObjectId",
  "updated_by": "ObjectId",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

Index:

```text
code unique
status
building
capacity
name text
created_at descending
```

## 15.3 Collection `bookings`

```json
{
  "_id": "ObjectId",
  "booking_code": "BKG-20260716-AB12",
  "user_id": "ObjectId",
  "room_id": "ObjectId",
  "purpose": "Rapat kelompok capstone",
  "participant_count": 10,
  "booking_date": "2026-07-20",
  "start_at": "2026-07-20T09:00:00+07:00",
  "end_at": "2026-07-20T11:00:00+07:00",
  "status": "PENDING",
  "user_note": null,
  "admin_note": null,
  "reviewed_by": null,
  "reviewed_at": null,
  "cancelled_by": null,
  "cancelled_at": null,
  "completed_at": null,
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

Keputusan teknis:

- Simpan `start_at` dan `end_at` sebagai datetime lengkap.
- Semua datetime disimpan dalam UTC.
- Zona waktu lokal hanya digunakan pada input dan output.
- `booking_date` dapat disimpan untuk membantu filter kalender, tetapi sumber kebenaran tetap `start_at`.

Index:

```text
booking_code unique
user_id + created_at descending
room_id + start_at + end_at
status + created_at descending
room_id + status + start_at
```

## 15.4 Collection `refresh_tokens`

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "token_hash": "sha256_hash",
  "jti": "uuid",
  "expires_at": "datetime",
  "revoked_at": null,
  "created_at": "datetime",
  "user_agent": "string",
  "ip_address": "string"
}
```

Index:

```text
jti unique
token_hash unique
user_id
expires_at TTL
```

Refresh token mentah tidak disimpan.

## 15.5 Collection `activity_logs`

```json
{
  "_id": "ObjectId",
  "actor_id": "ObjectId",
  "actor_role": "ADMIN",
  "action": "BOOKING_APPROVED",
  "entity_type": "BOOKING",
  "entity_id": "ObjectId",
  "description": "Admin menyetujui peminjaman",
  "metadata": {
    "old_status": "PENDING",
    "new_status": "APPROVED"
  },
  "ip_address": "string",
  "request_id": "string",
  "created_at": "datetime"
}
```

Index:

```text
actor_id + created_at descending
entity_type + entity_id
action + created_at descending
created_at descending
```

---

# 16. Strategi Konsistensi Jadwal

MongoDB tidak memiliki constraint interval waktu otomatis. Karena itu, aturan konflik dilakukan pada service.

## 16.1 Saat membuat permohonan

- Validasi format dan aturan waktu.
- Periksa kapasitas dan status ruangan.
- Simpan sebagai `PENDING`.
- Permohonan `PENDING` tidak memblokir jadwal.

## 16.2 Saat menyetujui

- Ambil data permohonan terbaru.
- Pastikan status masih `PENDING`.
- Periksa konflik terhadap `APPROVED`.
- Jalankan perubahan status menggunakan operasi atomik dengan filter status.
- Apabila status sudah berubah oleh request lain, operasi harus gagal.
- Hapus cache jadwal terkait.

Filter update atomik:

```text
_id = booking_id
status = PENDING
```

Hal ini mengurangi risiko dua admin memproses permohonan yang sama secara bersamaan.

## 16.3 Pengembangan lebih kuat

Untuk kebutuhan produksi skala lebih tinggi:

- gunakan MongoDB transaction;
- gunakan distributed lock singkat di Redis saat persetujuan;
- atau ubah representasi jadwal menjadi slot waktu unik.

MVP tidak memerlukan distributed lock selama pemeriksaan ulang dan atomic update diterapkan dengan benar.

---

# 17. Redis Caching

## 17.1 Data yang di-cache

```text
rooms:list:{hash_query}
rooms:detail:{room_id}
rooms:availability:{room_id}:{date}
dashboard:admin
dashboard:mahasiswa:{user_id}
```

## 17.2 TTL awal

| Cache | TTL |
|---|---:|
| Daftar ruangan | 5 menit |
| Detail ruangan | 10 menit |
| Ketersediaan harian | 2 menit |
| Dashboard admin | 2 menit |
| Dashboard pengguna | 2 menit |

## 17.3 Strategi

Gunakan pola *cache-aside*:

1. cek Redis;
2. jika data ada, kembalikan;
3. jika tidak ada, query MongoDB;
4. simpan hasil ke Redis;
5. kembalikan response.

## 17.4 Invalidation

Saat ruangan dibuat, diubah, atau dinonaktifkan:

```text
hapus rooms:list:*
hapus rooms:detail:{room_id}
hapus dashboard:admin
```

Saat peminjaman dibuat atau status berubah:

```text
hapus rooms:availability:{room_id}:{date}
hapus dashboard:admin
hapus dashboard:mahasiswa:{user_id}
```

Untuk MVP, wildcard deletion sebaiknya dihindari pada production. Gunakan versioned key:

```text
rooms:list:v{version}:{hash_query}
```

Saat data ruangan berubah, nilai version dinaikkan.

## 17.5 Ketika Redis gagal

- Backend mencatat warning.
- Backend mengambil data dari MongoDB.
- Request tetap diproses.
- Operasi cache tidak boleh menjadi sumber kegagalan utama.

Redis bukan sumber kebenaran data.

---

# 18. Autentikasi dan Otorisasi

## 18.1 Token

- Access token JWT: masa berlaku 15 menit.
- Refresh token JWT: masa berlaku 7 hari.
- Refresh token disimpan sebagai cookie `HttpOnly`.
- Access token dikirim melalui response dan digunakan sebagai Bearer token.
- Refresh token memiliki `jti`.
- Hash refresh token disimpan di MongoDB.
- Logout mencabut refresh token.
- Rotasi refresh token dilakukan setiap refresh.

## 18.2 Isi access token

```json
{
  "sub": "user_id",
  "role": "MAHASISWA",
  "type": "access",
  "jti": "uuid",
  "iat": 0,
  "exp": 0
}
```

## 18.3 Dependency auth

```text
get_current_user()
require_role("ADMIN")
require_active_user()
```

Otorisasi selalu dilakukan di backend, bukan hanya menyembunyikan menu pada frontend.

## 18.4 Password

- Minimum 8 karakter.
- Disarankan mengandung huruf dan angka.
- Hash menggunakan Argon2.
- Password lama diverifikasi saat perubahan password.
- Password tidak pernah dicatat dalam log.

## 18.5 Identifier login

- Email menjadi credential login untuk seluruh akun, termasuk `MAHASISWA` dan `ADMIN`.
- Field `nim` tetap wajib dan unik untuk akun mahasiswa, tetapi tidak digunakan sebagai credential login.
- Akun admin tidak diwajibkan memiliki NIM.

---

# 19. Rate Limiting

Gunakan Redis untuk rate limiting sederhana.

Aturan awal:

| Endpoint | Batas |
|---|---:|
| Login | 5 request/menit/IP |
| Register | 3 request/menit/IP |
| Refresh token | 10 request/menit/IP |
| Create booking | 10 request/menit/user |
| Endpoint umum | 100 request/menit/IP |

Ketika Redis tidak tersedia, endpoint bisnis tetap berjalan, tetapi sistem mencatat warning bahwa rate limiting sedang tidak aktif.

---

# 20. Daftar Endpoint

Prefix API:

```text
(tidak menggunakan prefix global)
```

## 20.1 Health

```http
GET /health
GET /health/live
GET /health/ready
```

## 20.2 Auth

```http
POST /auth/register
POST /auth/login
POST /auth/refresh
POST /auth/logout
GET  /auth/me
PATCH /auth/change-password
```

## 20.3 Rooms — publik/login

```http
GET /rooms
GET /rooms/{room_id}
GET /rooms/{room_id}/availability?date=2026-07-20
```

Query daftar:

```text
search
building
status
min_capacity
facility
page
limit
sort
```

## 20.4 Rooms — admin

```http
POST   /admin/rooms
PATCH  /admin/rooms/{room_id}
PATCH  /admin/rooms/{room_id}/status
DELETE /admin/rooms/{room_id}
```

`DELETE` melakukan soft delete.

## 20.5 Bookings — pengguna

```http
POST  /bookings
GET   /bookings/me
GET   /bookings/{booking_id}
PATCH /bookings/{booking_id}/cancel
```

Query riwayat:

```text
status
room_id
date_from
date_to
page
limit
sort
```

## 20.6 Bookings — admin

```http
GET   /admin/bookings
GET   /admin/bookings/{booking_id}
PATCH /admin/bookings/{booking_id}/approve
PATCH /admin/bookings/{booking_id}/reject
PATCH /admin/bookings/{booking_id}/complete
```

## 20.7 Mahasiswa — admin

```http
GET   /admin/mahasiswa
GET   /admin/mahasiswa/{user_id}
PATCH /admin/mahasiswa/{user_id}/status
```

## 20.8 Dashboard

```http
GET /dashboards/admin
GET /dashboards/admin/booking-trend
GET /dashboards/admin/room-usage
GET /dashboards/me
```

Catatan implementasi saat ini:
- `GET /dashboards/admin` mengembalikan ringkasan admin:
  jumlah mahasiswa aktif, total ruangan, dan jumlah peminjaman per status.
- `GET /dashboards/admin/booking-trend` mengembalikan tren peminjaman per tanggal booking.
- `GET /dashboards/admin/room-usage` mengembalikan daftar ruangan paling sering dipakai.
- `GET /dashboards/me` mengembalikan ringkasan peminjaman milik mahasiswa yang sedang login.

## 20.9 Activity logs

```http
GET /activity-logs
```

Catatan implementasi saat ini:
- Endpoint ini hanya dapat diakses oleh `ADMIN`.
- Filter yang saat ini tersedia:
  `actor_id`, `action`, `entity_type`, `entity_id`, `page`, dan `limit`.
- Sistem saat ini sudah mencatat log aktivitas untuk:
  registrasi, login, refresh session, ubah password,
  create/cancel booking, approve/reject/complete booking,
  serta create/update/status/delete room.

---

# 21. Contoh Request dan Response


## 21.1 Registrasi mahasiswa

Request:

```http
POST /auth/register
Content-Type: application/json
```

```json
{
  "name": "Muhammad Dafa Aziul Ardi",
  "nim": "2311082027",
  "email": "2311082027@student.pnp.ac.id",
  "password": "Password123"
}
```

Response:

```json
{
  "success": true,
  "message": "Registrasi mahasiswa berhasil",
  "data": {
    "id": "6878f...",
    "name": "Muhammad Dafa Aziul Ardi",
    "nim": "2311082027",
    "email": "2311082027@student.pnp.ac.id",
    "role": "MAHASISWA"
  },
  "meta": null,
  "request_id": "01J...",
  "timestamp": "2026-07-16T10:00:00Z"
}
```

## 21.2 Login

Request:

```http
POST /auth/login
Content-Type: application/json
```

```json
{
  "email": "2311082027@student.pnp.ac.id",
  "password": "Password123"
}
```

Response:

```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "access_token": "<jwt_access_token>",
    "token_type": "bearer"
  },
  "meta": null,
  "request_id": "01J...",
  "timestamp": "2026-07-16T10:00:00Z"
}
```

Catatan implementasi:

- access token dikirim melalui body response;
- refresh token dikirim melalui cookie `HttpOnly`;
- semua akun login menggunakan email.

## 21.3 Refresh token

Request:

```http
POST /auth/refresh
Cookie: refresh_token=<refresh_token>
```

Response:

```json
{
  "success": true,
  "message": "Refresh token berhasil",
  "data": {
    "access_token": "<jwt_access_token_baru>",
    "token_type": "bearer"
  },
  "meta": null,
  "request_id": "01J...",
  "timestamp": "2026-07-16T10:05:00Z"
}
```

Catatan implementasi:

- refresh token lama dicabut;
- refresh token baru dikirim kembali melalui cookie `HttpOnly`;
- access token baru dikirim melalui body response.

## 21.4 Profil pengguna saat ini

Request:

```http
GET /auth/me
Authorization: Bearer <access_token>
```

Response:

```json
{
  "success": true,
  "message": "Profil pengguna berhasil diambil",
  "data": {
    "id": "6878f...",
    "name": "Muhammad Dafa Aziul Ardi",
    "nim": "2311082027",
    "email": "2311082027@student.pnp.ac.id",
    "role": "MAHASISWA"
  },
  "meta": null,
  "request_id": "01J...",
  "timestamp": "2026-07-16T10:06:00Z"
}
```

## 21.5 Ubah password

Request:

```http
PATCH /auth/change-password
Authorization: Bearer <access_token>
Content-Type: application/json
```

```json
{
  "current_password": "Password123",
  "new_password": "NewPassword123"
}
```

Response:

```json
{
  "success": true,
  "message": "Password berhasil diubah",
  "data": null,
  "meta": null,
  "request_id": "01J...",
  "timestamp": "2026-07-16T10:07:00Z"
}
```

## 21.6 Logout

Request:

```http
POST /auth/logout
Cookie: refresh_token=<refresh_token>
```

Response:

```json
{
  "success": true,
  "message": "Logout berhasil",
  "data": null,
  "meta": null,
  "request_id": "01J...",
  "timestamp": "2026-07-16T10:08:00Z"
}
```

Catatan implementasi:

- refresh token yang terkait dicabut;
- cookie `refresh_token` dihapus dari client.

## 21.7 Membuat peminjaman


Request:

```http
POST /bookings
Authorization: Bearer <access_token>
Content-Type: application/json
```

```json
{
  "room_id": "6878f...",
  "purpose": "Rapat kelompok capstone",
  "participant_count": 10,
  "start_at": "2026-07-20T09:00:00+07:00",
  "end_at": "2026-07-20T11:00:00+07:00",
  "user_note": "Membutuhkan proyektor"
}
```

Response:

```json
{
  "success": true,
  "message": "Permohonan peminjaman berhasil dibuat",
  "data": {
    "id": "6879a...",
    "booking_code": "BKG-20260716-AB12",
    "status": "PENDING"
  },
  "meta": null,
  "request_id": "01J...",
  "timestamp": "2026-07-16T10:00:00Z"
}
```

## 21.8 Konflik jadwal

```json
{
  "success": false,
  "message": "Ruangan telah digunakan pada rentang waktu tersebut",
  "error": {
    "code": "BOOKING_TIME_CONFLICT",
    "details": {
      "conflicting_booking_code": "BKG-20260710-CD34"
    }
  },
  "request_id": "01J...",
  "timestamp": "2026-07-16T10:00:00Z"
}
```

---

# 22. Environment Variable

```dotenv
APP_NAME=Roomify API
APP_ENV=development
APP_DEBUG=true
APP_HOST=0.0.0.0
APP_PORT=8000
API_PREFIX=/api
FRONTEND_ORIGINS=http://localhost:3000

MONGODB_URI=mongodb://mongodb:27017
MONGODB_DATABASE=roomify

REDIS_URL=redis://redis:6379/0
REDIS_ENABLED=true

JWT_SECRET_KEY=change-with-strong-random-secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

PASSWORD_MIN_LENGTH=8

LOCAL_TIMEZONE=Asia/Jakarta
BOOKING_OPEN_HOUR=07:00
BOOKING_CLOSE_HOUR=21:00
BOOKING_MIN_DURATION_MINUTES=30
BOOKING_MAX_DURATION_HOURS=8
BOOKING_MAX_ADVANCE_DAYS=90
BOOKING_CANCELLATION_LIMIT_HOURS=2

LOG_LEVEL=INFO
```

File `.env` tidak boleh di-*commit*.

---

# 23. Docker

## 23.1 Service development

```text
backend
mongodb
redis
mongo-express (opsional, profile tools)
redis-commander (opsional, profile tools)
```

Frontend akan ditambahkan pada tahap berikutnya.

## 23.2 Dockerfile backend

Gunakan *multi-stage build*:

- stage dependency;
- stage runtime;
- base image `python:3.13-slim`;
- jalankan aplikasi sebagai non-root user;
- hanya salin file yang diperlukan;
- tambahkan health check;
- gunakan Uvicorn untuk development;
- production dapat menggunakan beberapa worker sesuai kebutuhan.

## 23.3 Docker Compose

Kebutuhan:

- network internal;
- named volume MongoDB;
- named volume Redis jika persistence digunakan;
- health check;
- backend menunggu MongoDB dan Redis sehat;
- environment berasal dari `.env`;
- port backend `8000`;
- MongoDB dan Redis tidak perlu diekspos pada production.

---

# 24. Logging dan Error Handling

## 24.1 Request log

Field minimal:

```text
timestamp
level
request_id
method
path
status_code
duration_ms
client_ip
user_id
```

## 24.2 Error handler global

Handler untuk:

- Pydantic validation error;
- invalid ObjectId;
- authentication error;
- authorization error;
- domain/business error;
- MongoDB error;
- Redis error;
- unhandled exception.

Client menerima pesan aman. Detail stack trace hanya masuk log.

## 24.3 Domain exception

Contoh:

```text
ResourceNotFoundError
EmailAlreadyExistsError
BookingConflictError
InvalidStatusTransitionError
RoomUnavailableError
BookingCancellationNotAllowedError
```

---

# 25. Dokumentasi API

FastAPI menyediakan:

```text
/docs
/redoc
/openapi.json
```

Dokumentasi harus memuat:

- deskripsi endpoint;
- contoh request;
- contoh response;
- response error;
- kebutuhan autentikasi;
- tag per modul.

Pada environment production, Swagger dapat:

- tetap aktif untuk demo;
- dibatasi hanya untuk internal;
- atau dinonaktifkan melalui konfigurasi.

---

# 26. Strategi Pengujian

## 26.1 Unit test service

Prioritas:

- validasi tanggal masa lalu;
- waktu selesai lebih kecil;
- durasi minimum dan maksimum;
- kapasitas peserta;
- konflik jadwal;
- transisi status;
- pembatalan;
- role authorization.

## 26.2 Integration test repository

- create dan find mahasiswa;
- NIM unik;
- email unik;
- CRUD ruangan;
- pencarian dan filter;
- create booking;
- query konflik;
- atomic status update;
- pagination.

## 26.3 API test

- register mahasiswa sukses/gagal;
- registrasi dengan NIM duplikat;
- registrasi dengan format NIM tidak valid;
- login email sukses/gagal;
- refresh dan logout;
- akses endpoint tanpa token;
- akses endpoint admin oleh user;
- CRUD ruangan;
- booking lengkap;
- approve/reject/cancel;
- response contract.

## 26.4 Cache test

- cache miss mengambil MongoDB;
- cache hit tidak menjalankan query utama;
- invalidation setelah update;
- fallback ketika Redis mati.

## 26.5 Target coverage

Target awal:

```text
70% keseluruhan
90% untuk booking service
```

Coverage bukan satu-satunya ukuran; aturan bisnis utama wajib memiliki test.

---

# 27. Seed Data

Script awal:

```text
seed_admin.py
seed_rooms.py
```

Admin awal berasal dari environment:

```dotenv
INITIAL_ADMIN_NAME=Administrator
INITIAL_ADMIN_EMAIL=admin@example.com
INITIAL_ADMIN_PASSWORD=change-me
```

Akun admin tidak diwajibkan memiliki NIM dan login menggunakan email. Password awal harus diganti setelah login pertama pada pengembangan production-ready.

Contoh ruangan:

- LAB-01 — Laboratorium Komputer 1.
- LAB-02 — Laboratorium Komputer 2.
- RKT-01 — Ruang Kelas Teori 1.
- RAPAT-01 — Ruang Rapat Utama.

---

# 28. Deployment Manual pada Tahap Berikutnya

Pada tahap awal, project dijalankan pada lingkungan lokal menggunakan Docker dan Docker Compose. Setelah backend dan frontend stabil, aplikasi dapat dipasang secara manual pada server development atau server kampus.

Deployment tahap berikutnya dapat mencakup:

- menjalankan container backend, frontend, MongoDB, dan Redis pada server;
- menggunakan Nginx sebagai reverse proxy;
- mengatur domain dan HTTPS;
- menyimpan environment variable langsung pada server;
- melakukan backup volume MongoDB secara berkala.


# 29. Definition of Done

Satu fitur dianggap selesai apabila:

- kebutuhan fungsional terpenuhi;
- validasi backend tersedia;
- role access benar;
- response mengikuti contract;
- error ditangani;
- cache dihapus ketika perlu;
- log aktivitas ditambahkan untuk aksi penting;
- unit/integration test lulus;
- endpoint muncul pada Swagger;
- dokumentasi diperbarui;
- lint dan format lokal lulus;
- Docker build lokal berhasil.

---

# 30. Tahapan Implementasi Backend

## Sprint 0 — Fondasi

- Inisialisasi FastAPI.
- Konfigurasi Pydantic Settings.
- MongoDB dan Redis connection.
- Lifespan startup/shutdown.
- Response helper.
- Error handler global.
- Logging dan request ID.
- Dockerfile dan Docker Compose.
- Health check.

## Sprint 1 — Authentication

- Schema mahasiswa dan repository user.
- Validasi NIM.
- Registrasi mahasiswa.
- Login.
- Access token.
- Refresh token rotation.
- Logout.
- Current user.
- Role dependency.
- Change password.
- Seed admin.

## Sprint 2 — Rooms

- Room schema.
- Repository.
- CRUD admin.
- Public list dan detail.
- Search, filter, pagination.
- Cache daftar dan detail.
- Soft delete.

## Sprint 3 — Bookings

- Booking schema.
- Create booking.
- Validasi waktu dan kapasitas.
- Riwayat pengguna.
- Cancel booking.
- Admin list.
- Approve, reject, complete.
- Conflict detection.
- Cache availability.
- Activity log.

## Sprint 4 — Dashboard dan hardening

- Statistik pengguna.
- Statistik admin.
- Tren peminjaman.
- Penggunaan ruangan.
- Rate limiting.
- Integration test.
- Dokumentasi deployment.

---

# 31. Prioritas Implementasi

## Wajib

- Auth.
- Role.
- CRUD ruangan.
- Peminjaman.
- Conflict detection.
- Approval.
- MongoDB.
- Redis cache.
- Docker Compose.
- Test utama.

## Bagus ditambahkan

- Refresh token rotation.
- Activity log.
- Request ID.
- Rate limiting.
- Dashboard.
- Structured logging.

## Pengembangan tahap kedua

- RabbitMQ untuk notifikasi asynchronous.
- Email notifikasi.
- Kalender visual.
- QR code.
- Export laporan.
- Integrasi kalender eksternal.
- Elasticsearch apabila data pencarian berkembang besar.

---

# 32. Risiko Teknis

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Dua admin menyetujui secara bersamaan | Jadwal konflik | Recheck conflict dan atomic update |
| Cache stale | Jadwal tidak terbaru | TTL pendek dan invalidation |
| Redis tidak tersedia | Cache/rate limit gagal | Fallback ke MongoDB |
| Zona waktu salah | Jadwal bergeser | Simpan UTC, tampilkan Asia/Jakarta |
| Token bocor | Akses tidak sah | Token pendek, refresh rotation, revoke |
| Ruangan dihapus tetapi punya riwayat | Relasi data rusak | Soft delete |
| Query daftar lambat | Response lambat | Pagination dan index |
| Secret masuk repository | Risiko keamanan | `.env`, environment variable, dan `.gitignore` |

---

# 33. Nama Project dan Judul

Nama produk yang dapat digunakan:

```text
Roomify
RoomBook
PinjamRuang
RuangKita
SpaceReserve
```

Judul akademik yang direkomendasikan:

> Pengembangan Sistem Peminjaman Ruangan Berbasis Web Menggunakan FastAPI, MongoDB, Redis Caching, dan Docker Compose

---

# 34. Kesimpulan Keputusan Teknis

Stack final backend:

```text
Python 3.13
FastAPI
Uvicorn
Pydantic v2
PyMongo Async API
MongoDB
redis-py asyncio
Redis
PyJWT
pwdlib + Argon2
pytest
HTTPX
Ruff
structlog
Docker
Docker Compose
```

Arsitektur final:

```text
API Router
    ↓
Service
    ↓
Repository
    ↓
MongoDB

Service
    ↕
Redis Cache
```

Dokumen ini menjadi acuan untuk tahap implementasi backend. Pengerjaan kode dimulai dari Sprint 0 agar konfigurasi, koneksi database, response contract, error handling, logging, Docker, dan health check sudah stabil sebelum fitur auth dan peminjaman ditambahkan.
