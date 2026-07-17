# API Documentation

## Overview

Dokumen ini menjelaskan endpoint backend yang aktif saat ini untuk sistem peminjaman ruangan. Semua route berjalan tanpa prefix global seperti `/api` atau `/api/v1`.

Base URL lokal:

```text
http://localhost:8000
```

Format response umum:

```json
{
  "success": true,
  "message": "string",
  "data": {},
  "meta": null,
  "request_id": null,
  "timestamp": "2026-07-16T10:00:00Z"
}
```

Format error umum:

```json
{
  "success": false,
  "message": "string",
  "error": {
    "code": "ERROR_CODE",
    "details": {}
  },
  "request_id": null,
  "timestamp": "2026-07-16T10:00:00Z"
}
```

## Authentication

Backend memakai:
- `Authorization: Bearer <access_token>` untuk endpoint terproteksi
- cookie `refresh_token` `HttpOnly` untuk refresh session

Role yang dipakai saat ini:
- `MAHASISWA`
- `ADMIN`

## System Endpoints

### `GET /`

Tujuan: root welcome endpoint.

Auth: tidak perlu.

Response `200`:

```json
{
  "success": true,
  "message": "Welcome to Roomify API",
  "data": {
    "app_name": "Roomify API"
  }
}
```

### `GET /health`

Tujuan: status health ringkas service.

Auth: tidak perlu.

### `GET /health/live`

Tujuan: liveness probe.

Auth: tidak perlu.

### `GET /health/ready`

Tujuan: readiness probe.

Auth: tidak perlu.

## Auth Endpoints

### `POST /auth/register`

Tujuan: registrasi mahasiswa.

Auth: tidak perlu.

Request body:

```json
{
  "name": "Muhammad Dafa Aziul Ardi",
  "nim": "2311082027",
  "email": "2311082027@student.pnp.ac.id",
  "password": "Password123"
}
```

Validasi penting:
- `nim` hanya digit
- `email` dinormalisasi ke lowercase
- `password` minimal 8 karakter dan harus mengandung huruf + angka

Response `201`:

```json
{
  "success": true,
  "message": "Registrasi mahasiswa berhasil",
  "data": {
    "id": "user-id",
    "name": "Muhammad Dafa Aziul Ardi",
    "nim": "2311082027",
    "email": "2311082027@student.pnp.ac.id",
    "role": "MAHASISWA"
  }
}
```

Error code penting:
- `NIM_ALREADY_EXISTS`
- `EMAIL_ALREADY_EXISTS`

### `POST /auth/login`

Tujuan: login semua akun dengan email.

Auth: tidak perlu.

Request body:

```json
{
  "email": "admin@example.com",
  "password": "change-me"
}
```

Response `200`:

```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "access_token": "jwt-access-token",
    "token_type": "bearer"
  }
}
```

Catatan:
- backend juga mengirim cookie `refresh_token`
- frontend perlu menyimpan `access_token` untuk header Bearer

Error code penting:
- `INVALID_CREDENTIALS`
- `FORBIDDEN`

### `POST /auth/refresh`

Tujuan: mendapatkan access token baru dari refresh token cookie.

Auth: tidak memakai Bearer, tetapi perlu cookie `refresh_token`.

Request:

```http
POST /auth/refresh
Cookie: refresh_token=<refresh_token>
```

Response `200`:

```json
{
  "success": true,
  "message": "Refresh token berhasil",
  "data": {
    "access_token": "new-access-token",
    "token_type": "bearer"
  }
}
```

Catatan:
- refresh token lama di-rotate
- response akan mengirim cookie `refresh_token` yang baru

Error code penting:
- `UNAUTHENTICATED`
- `REFRESH_TOKEN_REVOKED`

### `POST /auth/logout`

Tujuan: revoke refresh token dan hapus cookie session.

Auth: perlu cookie `refresh_token`.

Response `200`:

```json
{
  "success": true,
  "message": "Logout berhasil",
  "data": null
}
```

### `GET /auth/me`

Tujuan: mengambil profil user yang sedang login.

Auth: Bearer token wajib.

Response `200`:

```json
{
  "success": true,
  "message": "Profil pengguna berhasil diambil",
  "data": {
    "id": "user-id",
    "name": "Muhammad Dafa Aziul Ardi",
    "nim": "2311082027",
    "email": "2311082027@student.pnp.ac.id",
    "role": "MAHASISWA"
  }
}
```

### `PATCH /auth/change-password`

Tujuan: ganti password akun yang sedang login.

Auth: Bearer token wajib.

Request body:

```json
{
  "current_password": "Password123",
  "new_password": "NewPassword123"
}
```

Response `200`:

```json
{
  "success": true,
  "message": "Password berhasil diubah",
  "data": null
}
```

## Room Endpoints

### `GET /rooms`

Tujuan: mengambil daftar ruangan publik.

Auth: tidak perlu.

Query params:
- `search`
- `building`
- `status`
- `min_capacity`
- `facility`
- `page`
- `limit`
- `sort`

Catatan field room:
- `image_url` adalah field opsional.
- Nilai `image_url` bisa berupa URL string atau `null`.
- Untuk endpoint admin create/update room, backend sekarang menerima upload file foto dan akan mengisi `image_url` otomatis.

Contoh:

```http
GET /rooms?search=lab&building=Gedung A&page=1&limit=10&sort=name
```

Response `200`:

```json
{
  "success": true,
  "message": "Data ruangan berhasil diambil",
  "data": [
    {
      "id": "room-lab-01",
      "code": "LAB-01",
      "name": "Laboratorium Komputer 1",
      "building": "Gedung A",
      "floor": 2,
      "location_description": "Lantai 2, sebelah ruang server",
      "capacity": 30,
      "facilities": ["AC", "Proyektor", "Komputer"],
      "description": "Laboratorium untuk praktikum komputer",
      "image_url": null,
      "status": "AVAILABLE"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total_items": 1,
    "total_pages": 1,
    "has_next": false,
    "has_previous": false
  }
}
```

### `GET /rooms/{room_id}`

Tujuan: mengambil detail ruangan.

Auth: tidak perlu.

Response `200`:

```json
{
  "success": true,
  "message": "Detail ruangan berhasil diambil",
  "data": {
    "id": "room-lab-01",
    "code": "LAB-01",
    "name": "Laboratorium Komputer 1",
    "building": "Gedung A",
    "floor": 2,
    "location_description": "Lantai 2, sebelah ruang server",
    "capacity": 30,
    "facilities": ["AC", "Proyektor", "Komputer"],
    "description": "Laboratorium untuk praktikum komputer",
    "image_url": "/uploads/rooms/lab-room-sample.png",
    "status": "AVAILABLE"
  }
}
```

Catatan:
- response detail room juga mengandung `image_url`
- jika ruangan belum memiliki gambar, `image_url` akan bernilai `null`
- endpoint publik tidak akan mengembalikan ruangan dengan status `INACTIVE`

Error code penting:
- `RESOURCE_NOT_FOUND`

### `GET /rooms/{room_id}/availability`

Tujuan: mengambil ketersediaan ruangan per hari.

Auth: tidak perlu.

Query params:
- `date` wajib, format `YYYY-MM-DD`

Contoh:

```http
GET /rooms/room-lab-01/availability?date=2026-07-20
```

Response `200`:

```json
{
  "success": true,
  "message": "Ketersediaan ruangan berhasil diambil",
  "data": {
    "room_id": "room-lab-01",
    "date": "2026-07-20",
    "room_status": "AVAILABLE",
    "is_bookable": true,
    "blocked_slots": [
      {
        "start_at": "2026-07-20T09:00:00+07:00",
        "end_at": "2026-07-20T11:00:00+07:00",
        "booking_id": "booking-approved-1"
      }
    ]
  }
}
```

## Booking Endpoints for Mahasiswa

### `POST /bookings`

Tujuan: membuat permohonan peminjaman.

Auth: Bearer token wajib.

Request body:

```json
{
  "room_id": "room-lab-01",
  "purpose": "Rapat kelompok capstone",
  "participant_count": 10,
  "start_at": "2026-07-20T11:30:00+07:00",
  "end_at": "2026-07-20T13:00:00+07:00",
  "user_note": "Membutuhkan proyektor"
}
```

Validasi penting:
- tanggal tidak boleh di masa lalu
- `end_at` harus lebih besar dari `start_at`
- durasi minimum `30` menit
- durasi maksimum `8` jam
- harus di dalam jam operasional
- kapasitas peserta tidak boleh melebihi kapasitas ruangan
- konflik dicek terhadap booking `APPROVED`

Response `201`:

```json
{
  "success": true,
  "message": "Permohonan peminjaman berhasil dibuat",
  "data": {
    "id": "booking-id",
    "booking_code": "BKG-20260716-B-01",
    "user_id": "user-id",
    "room_id": "room-lab-01",
    "purpose": "Rapat kelompok capstone",
    "participant_count": 10,
    "booking_date": "2026-07-20",
    "start_at": "2026-07-20T11:30:00+07:00",
    "end_at": "2026-07-20T13:00:00+07:00",
    "status": "PENDING",
    "user_note": "Membutuhkan proyektor",
    "admin_note": null,
    "user": {
      "id": "user-id",
      "name": "Muhammad Dafa Aziul Ardi",
      "nim": "2311082027",
      "email": "2311082027@student.pnp.ac.id",
      "role": "MAHASISWA"
    },
    "room": {
      "id": "room-lab-01",
      "code": "LAB-01",
      "name": "Laboratorium Komputer 1",
      "building": "Gedung A",
      "floor": 2,
      "location_description": "Lantai 2, sebelah ruang server",
      "capacity": 30,
      "facilities": ["AC", "Proyektor", "Komputer"],
      "description": "Laboratorium untuk praktikum komputer",
      "image_url": "/uploads/rooms/lab-room-sample.png",
      "status": "AVAILABLE"
    }
  }
}
```

Catatan:
- response create booking sekarang juga mengembalikan ringkasan `user` dan `room`

Error code penting:
- `VALIDATION_ERROR`
- `ROOM_NOT_AVAILABLE`
- `BOOKING_TIME_CONFLICT`
- `RESOURCE_NOT_FOUND`

### `GET /bookings/me`

Tujuan: mengambil riwayat booking milik user login.

Auth: Bearer token wajib.

Query params:
- `status`
- `room_id`
- `date_from`
- `date_to`
- `page`
- `limit`
- `sort`

Response `200`:

```json
{
  "success": true,
  "message": "Riwayat peminjaman berhasil diambil",
  "data": [
    {
      "id": "booking-id",
      "booking_code": "BKG-20260716-B-01",
      "user_id": "user-id",
      "room_id": "room-lab-01",
      "purpose": "Rapat kelompok capstone",
      "participant_count": 10,
      "booking_date": "2026-07-20",
      "start_at": "2026-07-20T11:30:00+07:00",
      "end_at": "2026-07-20T13:00:00+07:00",
      "status": "PENDING",
      "user_note": "Membutuhkan proyektor",
      "admin_note": null,
      "reviewed_by": null,
      "reviewed_at": null,
      "cancelled_by": null,
      "cancelled_at": null,
      "completed_by": null,
      "completed_at": null,
      "created_at": "2026-07-16T10:00:00Z",
      "updated_at": "2026-07-16T10:00:00Z",
      "user": {
        "id": "user-id",
        "name": "Muhammad Dafa Aziul Ardi",
        "nim": "2311082027",
        "email": "2311082027@student.pnp.ac.id",
        "role": "MAHASISWA"
      },
      "room": {
        "id": "room-lab-01",
        "code": "LAB-01",
        "name": "Laboratorium Komputer 1",
        "building": "Gedung A",
        "floor": 2,
        "location_description": "Lantai 2, sebelah ruang server",
        "capacity": 30,
        "facilities": ["AC", "Proyektor", "Komputer"],
        "description": "Laboratorium untuk praktikum komputer",
        "image_url": "/uploads/rooms/lab-room-sample.png",
        "status": "AVAILABLE"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total_items": 1,
    "total_pages": 1,
    "has_next": false,
    "has_previous": false
  }
}
```

Catatan:
- list booking mahasiswa sekarang juga mengembalikan ringkasan `user` dan `room`
- ini memudahkan halaman riwayat booking menampilkan data ruangan tanpa request detail tambahan

### `GET /bookings/{booking_id}`

Tujuan: mengambil detail booking milik user login.

Auth: Bearer token wajib.

Response `200`:

```json
{
  "success": true,
  "message": "Detail peminjaman berhasil diambil",
  "data": {
    "id": "booking-id",
    "booking_code": "BKG-20260716-B-01",
    "user_id": "user-id",
    "room_id": "room-lab-01",
    "purpose": "Rapat kelompok capstone",
    "participant_count": 10,
    "booking_date": "2026-07-20",
    "start_at": "2026-07-20T11:30:00+07:00",
    "end_at": "2026-07-20T13:00:00+07:00",
    "status": "PENDING",
    "user_note": "Membutuhkan proyektor",
    "admin_note": null,
    "reviewed_by": null,
    "reviewed_at": null,
    "cancelled_by": null,
    "cancelled_at": null,
    "completed_by": null,
    "completed_at": null,
    "created_at": "2026-07-16T10:00:00Z",
    "updated_at": "2026-07-16T10:00:00Z",
    "user": {
      "id": "user-id",
      "name": "Muhammad Dafa Aziul Ardi",
      "nim": "2311082027",
      "email": "2311082027@student.pnp.ac.id",
      "role": "MAHASISWA"
    },
    "room": {
      "id": "room-lab-01",
      "code": "LAB-01",
      "name": "Laboratorium Komputer 1",
      "building": "Gedung A",
      "floor": 2,
      "location_description": "Lantai 2, sebelah ruang server",
      "capacity": 30,
      "facilities": ["AC", "Proyektor", "Komputer"],
      "description": "Laboratorium untuk praktikum komputer",
      "image_url": "/uploads/rooms/lab-room-sample.png",
      "status": "AVAILABLE"
    }
  }
}
```

Catatan:
- endpoint detail booking sekarang mengembalikan data relasi `user` dan `room`
- field `user` memuat ringkasan data mahasiswa pemilik booking
- field `room` memuat ringkasan data ruangan yang dipesan

Error code penting:
- `RESOURCE_NOT_FOUND`

### `PATCH /bookings/{booking_id}/cancel`

Tujuan: membatalkan booking milik user login.

Auth: Bearer token wajib.

Syarat:
- booking milik user tersebut
- status hanya `PENDING` atau `APPROVED`
- belum melewati batas pembatalan

Response `200`:

```json
{
  "success": true,
  "message": "Peminjaman berhasil dibatalkan",
  "data": {
    "id": "booking-id",
    "booking_code": "BKG-20260716-B-01",
    "status": "CANCELLED",
    "cancelled_by": "user-id",
    "cancelled_at": "2026-07-16T12:00:00+07:00",
    "user": {
      "id": "user-id",
      "name": "Muhammad Dafa Aziul Ardi",
      "nim": "2311082027",
      "email": "2311082027@student.pnp.ac.id",
      "role": "MAHASISWA"
    },
    "room": {
      "id": "room-lab-01",
      "code": "LAB-01",
      "name": "Laboratorium Komputer 1",
      "building": "Gedung A",
      "floor": 2,
      "location_description": "Lantai 2, sebelah ruang server",
      "capacity": 30,
      "facilities": ["AC", "Proyektor", "Komputer"],
      "description": "Laboratorium untuk praktikum komputer",
      "image_url": "/uploads/rooms/lab-room-sample.png",
      "status": "AVAILABLE"
    }
  }
}
```

Error code penting:
- `BOOKING_CANNOT_BE_CANCELLED`
- `RESOURCE_NOT_FOUND`

## Admin Room Endpoints

Semua endpoint di bawah ini membutuhkan role `ADMIN`.

### `GET /admin/rooms/{room_id}`

Tujuan: mengambil detail ruangan untuk admin.

Auth: role `ADMIN`.

Catatan:
- endpoint ini dapat mengambil detail ruangan meskipun status ruangan `INACTIVE`
- response mengandung `image_url`, `description`, `facilities`, dan semua field room lain yang dibutuhkan halaman detail admin
- endpoint ini cocok dipakai untuk halaman detail ruangan admin, edit form admin, dan preview data sebelum update status atau hapus ruangan

Response `200`:

```json
{
  "success": true,
  "message": "Detail ruangan admin berhasil diambil",
  "data": {
    "id": "room-lab-01",
    "code": "LAB-01",
    "name": "Laboratorium Komputer 1",
    "building": "Gedung A",
    "floor": 2,
    "location_description": "Lantai 2, sebelah ruang server",
    "capacity": 30,
    "facilities": ["AC", "Proyektor", "Komputer"],
    "description": "Laboratorium untuk praktikum komputer",
    "image_url": "/uploads/rooms/lab-room-sample.png",
    "status": "AVAILABLE"
  }
}
```

Error code penting:
- `RESOURCE_NOT_FOUND`

### `POST /admin/rooms`

Tujuan: membuat ruangan baru.

Request body:

Format request:
- `multipart/form-data`

Field form:
- `code`
- `name`
- `building`
- `floor`
- `location_description`
- `capacity`
- `facilities` dapat dikirim berulang
- `description`
- `status`
- `image_file` untuk file foto ruangan

Catatan:
- `image_file` opsional
- jika file foto berhasil diupload, backend akan menyimpan file secara lokal dan mengembalikan URL publik di field `image_url`
- jika `image_file` tidak dikirim, `image_url` akan bernilai `null`

Response `201`: object `Room`.

Error code penting:
- `ROOM_CODE_ALREADY_EXISTS`

### `PATCH /admin/rooms/{room_id}`

Tujuan: update data ruangan.

Request body: field parsial dari room update.

Format request:
- `multipart/form-data`

Contoh field yang bisa dikirim:
- `capacity`
- `description`
- `status`
- `facilities`
- `image_file`
- `remove_image`

Catatan:
- `image_file` boleh dikirim untuk mengganti foto ruangan
- `remove_image=true` dapat dipakai untuk menghapus foto lama
- jika `image_file` tidak dikirim dan `remove_image` tidak diaktifkan, nilai `image_url` lama tidak berubah

Response `200`: object `Room`.

### `PATCH /admin/rooms/{room_id}/status`

Tujuan: update status ruangan.

Request body:

```json
{
  "status": "AVAILABLE"
}
```

Response `200`: object `Room`.

### `DELETE /admin/rooms/{room_id}`

Tujuan: soft delete / nonaktifkan ruangan.

Response `200`:

```json
{
  "success": true,
  "message": "Ruangan berhasil dinonaktifkan",
  "data": null
}
```

## Admin Booking Endpoints

Semua endpoint di bawah ini membutuhkan role `ADMIN`.

### `GET /admin/bookings`

Tujuan: melihat semua booking.

Query params:
- `status`
- `room_id`
- `user_id`
- `date_from`
- `date_to`
- `page`
- `limit`
- `sort`

Response `200`:

```json
{
  "success": true,
  "message": "Daftar peminjaman berhasil diambil",
  "data": [
    {
      "id": "booking-pending-1",
      "booking_code": "BKG-20260715-AB12",
      "user_id": "user-id",
      "room_id": "room-lab-01",
      "purpose": "Diskusi capstone",
      "participant_count": 10,
      "booking_date": "2026-07-20",
      "start_at": "2026-07-20T13:00:00+07:00",
      "end_at": "2026-07-20T15:00:00+07:00",
      "status": "PENDING",
      "user_note": null,
      "admin_note": null,
      "reviewed_by": null,
      "reviewed_at": null,
      "cancelled_by": null,
      "cancelled_at": null,
      "completed_by": null,
      "completed_at": null,
      "created_at": "2026-07-15T02:00:00Z",
      "updated_at": "2026-07-15T02:00:00Z",
      "user": {
        "id": "user-id",
        "name": "Muhammad Dafa Aziul Ardi",
        "nim": "2311082027",
        "email": "2311082027@student.pnp.ac.id",
        "role": "MAHASISWA"
      },
      "room": {
        "id": "room-lab-01",
        "code": "LAB-01",
        "name": "Laboratorium Komputer 1",
        "building": "Gedung A",
        "floor": 2,
        "location_description": "Lantai 2, sebelah ruang server",
        "capacity": 30,
        "facilities": ["AC", "Proyektor", "Komputer"],
        "description": "Laboratorium untuk praktikum komputer",
        "image_url": "/uploads/rooms/lab-room-sample.png",
        "status": "AVAILABLE"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total_items": 1,
    "total_pages": 1,
    "has_next": false,
    "has_previous": false
  }
}
```

Catatan:
- list booking admin sekarang juga mengembalikan ringkasan `user` dan `room` pada setiap item
- ini memudahkan halaman tabel admin menampilkan nama mahasiswa, NIM, nama ruangan, dan detail room tanpa request tambahan

### `GET /admin/bookings/{booking_id}`

Tujuan: detail booking untuk admin.

Response `200`:

```json
{
  "success": true,
  "message": "Detail peminjaman berhasil diambil",
  "data": {
    "id": "booking-pending-1",
    "booking_code": "BKG-20260715-AB12",
    "user_id": "user-id",
    "room_id": "room-lab-01",
    "purpose": "Diskusi capstone",
    "participant_count": 10,
    "booking_date": "2026-07-20",
    "start_at": "2026-07-20T13:00:00+07:00",
    "end_at": "2026-07-20T15:00:00+07:00",
    "status": "PENDING",
    "user_note": null,
    "admin_note": null,
    "reviewed_by": null,
    "reviewed_at": null,
    "cancelled_by": null,
    "cancelled_at": null,
    "completed_by": null,
    "completed_at": null,
    "created_at": "2026-07-15T02:00:00Z",
    "updated_at": "2026-07-15T02:00:00Z",
    "user": {
      "id": "user-id",
      "name": "Muhammad Dafa Aziul Ardi",
      "nim": "2311082027",
      "email": "2311082027@student.pnp.ac.id",
      "role": "MAHASISWA"
    },
    "room": {
      "id": "room-lab-01",
      "code": "LAB-01",
      "name": "Laboratorium Komputer 1",
      "building": "Gedung A",
      "floor": 2,
      "location_description": "Lantai 2, sebelah ruang server",
      "capacity": 30,
      "facilities": ["AC", "Proyektor", "Komputer"],
      "description": "Laboratorium untuk praktikum komputer",
      "image_url": "/uploads/rooms/lab-room-sample.png",
      "status": "AVAILABLE"
    }
  }
}
```

Catatan:
- endpoint detail booking admin juga mengembalikan data relasi `user` dan `room`
- cocok untuk halaman detail booking admin, review booking, dan modal approval/rejection

### `PATCH /admin/bookings/{booking_id}/approve`

Tujuan: menyetujui booking `PENDING`.

Request body:

```json
{
  "admin_note": "Disetujui untuk kegiatan akademik"
}
```

Response `200`:

```json
{
  "success": true,
  "message": "Peminjaman berhasil disetujui",
  "data": {
    "id": "booking-pending-1",
    "status": "APPROVED",
    "admin_note": "Disetujui untuk kegiatan akademik",
    "reviewed_by": "admin-id",
    "reviewed_at": "2026-07-16T12:00:00+07:00",
    "user": {
      "id": "user-id",
      "name": "Muhammad Dafa Aziul Ardi",
      "nim": "2311082027",
      "email": "2311082027@student.pnp.ac.id",
      "role": "MAHASISWA"
    },
    "room": {
      "id": "room-lab-01",
      "code": "LAB-01",
      "name": "Laboratorium Komputer 1",
      "building": "Gedung A",
      "floor": 2,
      "location_description": "Lantai 2, sebelah ruang server",
      "capacity": 30,
      "facilities": ["AC", "Proyektor", "Komputer"],
      "description": "Laboratorium untuk praktikum komputer",
      "image_url": "/uploads/rooms/lab-room-sample.png",
      "status": "AVAILABLE"
    }
  }
}
```

Error code penting:
- `INVALID_BOOKING_STATUS`
- `BOOKING_TIME_CONFLICT`
- `RESOURCE_NOT_FOUND`

### `PATCH /admin/bookings/{booking_id}/reject`

Tujuan: menolak booking `PENDING`.

Request body:

```json
{
  "admin_note": "Jadwal tidak bisa difasilitasi"
}
```

Response `200`: status berubah ke `REJECTED`.

Catatan:
- response reject booking juga mengikuti shape booking lengkap dan mengandung `user` serta `room`

### `PATCH /admin/bookings/{booking_id}/complete`

Tujuan: menandai booking `APPROVED` menjadi selesai.

Request body: tidak ada.

Response `200`:

```json
{
  "success": true,
  "message": "Peminjaman berhasil diselesaikan",
  "data": {
    "id": "booking-approved-1",
    "status": "COMPLETED",
    "completed_by": "admin-id",
    "completed_at": "2026-07-16T12:00:00+07:00",
    "user": {
      "id": "user-id",
      "name": "Muhammad Dafa Aziul Ardi",
      "nim": "2311082027",
      "email": "2311082027@student.pnp.ac.id",
      "role": "MAHASISWA"
    },
    "room": {
      "id": "room-lab-01",
      "code": "LAB-01",
      "name": "Laboratorium Komputer 1",
      "building": "Gedung A",
      "floor": 2,
      "location_description": "Lantai 2, sebelah ruang server",
      "capacity": 30,
      "facilities": ["AC", "Proyektor", "Komputer"],
      "description": "Laboratorium untuk praktikum komputer",
      "image_url": "/uploads/rooms/lab-room-sample.png",
      "status": "AVAILABLE"
    }
  }
}
```

## Dashboard Endpoints

### `GET /dashboards/admin`

Tujuan: ringkasan dashboard admin.

Auth: role `ADMIN`.

Response `200`:

```json
{
  "success": true,
  "message": "Dashboard admin berhasil diambil",
  "data": {
    "total_active_students": 10,
    "total_rooms": 3,
    "booking_status_summary": {
      "PENDING": 2,
      "APPROVED": 1,
      "COMPLETED": 1
    }
  }
}
```

### `GET /dashboards/admin/booking-trend`

Tujuan: tren booking per tanggal.

Auth: role `ADMIN`.

Response `200`:

```json
{
  "success": true,
  "message": "Tren peminjaman berhasil diambil",
  "data": [
    {
      "booking_date": "2026-07-20",
      "total_bookings": 2
    }
  ]
}
```

### `GET /dashboards/admin/room-usage`

Tujuan: daftar ruangan paling sering dipakai.

Auth: role `ADMIN`.

Response `200`:

```json
{
  "success": true,
  "message": "Penggunaan ruangan berhasil diambil",
  "data": [
    {
      "room_id": "room-lab-01",
      "room_name": "Laboratorium Komputer 1",
      "total_bookings": 2
    }
  ]
}
```

### `GET /dashboards/me`

Tujuan: ringkasan dashboard mahasiswa yang sedang login.

Auth: Bearer token wajib.

Response `200`:

```json
{
  "success": true,
  "message": "Dashboard mahasiswa berhasil diambil",
  "data": {
    "total_bookings": 5,
    "pending_bookings": 1,
    "approved_bookings": 2,
    "completed_bookings": 1,
    "cancelled_bookings": 1
  }
}
```

## Activity Log Endpoint

### `GET /activity-logs`

Tujuan: melihat log aktivitas sistem.

Auth: role `ADMIN`.

Query params:
- `actor_id`
- `action`
- `entity_type`
- `entity_id`
- `page`
- `limit`

Contoh:

```http
GET /activity-logs?action=BOOKING_APPROVED&page=1&limit=10
```

Response `200`:

```json
{
  "success": true,
  "message": "Log aktivitas berhasil diambil",
  "data": [
    {
      "id": "log-id",
      "actor_id": "admin-id",
      "actor_role": "ADMIN",
      "action": "BOOKING_APPROVED",
      "entity_type": "BOOKING",
      "entity_id": "booking-pending-1",
      "description": "Admin menyetujui peminjaman",
      "metadata": {
        "new_status": "APPROVED",
        "admin_note": "Disetujui untuk kegiatan akademik"
      },
      "ip_address": "127.0.0.1",
      "request_id": "request-id",
      "created_at": "2026-07-16T12:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total_items": 1,
    "total_pages": 1,
    "has_next": false,
    "has_previous": false
  }
}
```

## Data Reference

### Room Status

- `AVAILABLE`
- `MAINTENANCE`
- `INACTIVE`

### Booking Status

- `PENDING`
- `APPROVED`
- `REJECTED`
- `CANCELLED`
- `COMPLETED`

### Activity Log Action

- `USER_REGISTERED`
- `USER_LOGGED_IN`
- `USER_LOGGED_OUT`
- `PASSWORD_CHANGED`
- `BOOKING_CREATED`
- `BOOKING_CANCELLED`
- `BOOKING_APPROVED`
- `BOOKING_REJECTED`
- `BOOKING_COMPLETED`
- `ROOM_CREATED`
- `ROOM_UPDATED`
- `ROOM_STATUS_UPDATED`
- `ROOM_DELETED`

## Error Code Reference

Error code yang sudah dipakai aktif saat ini:
- `UNAUTHENTICATED`
- `FORBIDDEN`
- `RESOURCE_NOT_FOUND`
- `INVALID_CREDENTIALS`
- `REFRESH_TOKEN_REVOKED`
- `EMAIL_ALREADY_EXISTS`
- `NIM_ALREADY_EXISTS`
- `VALIDATION_ERROR`
- `ROOM_CODE_ALREADY_EXISTS`
- `ROOM_NOT_AVAILABLE`
- `BOOKING_TIME_CONFLICT`
- `BOOKING_CANNOT_BE_CANCELLED`
- `INVALID_BOOKING_STATUS`
