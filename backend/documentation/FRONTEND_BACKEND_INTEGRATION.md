# Dokumentasi Integrasi Frontend ke Backend

## Tujuan

Dokumen ini menjadi acuan implementasi frontend agar langsung sesuai dengan backend yang aktif saat ini, bukan hanya PRD.

Base URL lokal default:

```text
http://localhost:8000
```

Backend saat ini tidak memakai prefix global seperti `/api` atau `/api/v1`.

## Format Response Umum

Semua endpoint memakai pola:

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

Untuk list ber-pagination, field `meta` berisi:
- `page`
- `limit`
- `total_items`
- `total_pages`
- `has_next`
- `has_previous`

Untuk error:

```json
{
  "success": false,
  "message": "string",
  "error": {
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

## Auth Frontend Flow

Login semua role memakai `email + password`.

Endpoint utama:
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`
- `PATCH /auth/change-password`

Catatan penting:
- `access_token` dikirim di response body login.
- `refresh_token` disimpan backend ke cookie `HttpOnly`.
- Request terproteksi wajib mengirim header:

```text
Authorization: Bearer <access_token>
```

Saran alur frontend:
1. Login ke `/auth/login`.
2. Simpan `access_token` di memory/state app.
3. Ambil profil lewat `/auth/me`.
4. Jika access token expired, panggil `/auth/refresh`.
5. Jika refresh gagal, paksa logout ke halaman login.

## Mapping Endpoint ke Halaman Frontend

### Mahasiswa

Login/Register:
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

Daftar dan detail ruangan:
- `GET /rooms`
- `GET /rooms/{room_id}`
- `GET /rooms/{room_id}/availability?date=YYYY-MM-DD`

Booking:
- `POST /bookings`
- `GET /bookings/me`
- `GET /bookings/{booking_id}`
- `PATCH /bookings/{booking_id}/cancel`

Dashboard mahasiswa:
- `GET /dashboards/me`

### Admin

Manajemen ruangan:
- `POST /admin/rooms`
- `PATCH /admin/rooms/{room_id}`
- `PATCH /admin/rooms/{room_id}/status`
- `DELETE /admin/rooms/{room_id}`

Manajemen booking:
- `GET /admin/bookings`
- `GET /admin/bookings/{booking_id}`
- `PATCH /admin/bookings/{booking_id}/approve`
- `PATCH /admin/bookings/{booking_id}/reject`
- `PATCH /admin/bookings/{booking_id}/complete`

Dashboard admin:
- `GET /dashboards/admin`
- `GET /dashboards/admin/booking-trend`
- `GET /dashboards/admin/room-usage`

Audit log:
- `GET /activity-logs`

## Query Params yang Perlu Dipakai Frontend

Rooms list:
- `search`
- `building`
- `status`
- `min_capacity`
- `facility`
- `page`
- `limit`
- `sort`

Bookings mahasiswa:
- `status`
- `room_id`
- `date_from`
- `date_to`
- `page`
- `limit`
- `sort`

Bookings admin:
- `status`
- `room_id`
- `user_id`
- `date_from`
- `date_to`
- `page`
- `limit`
- `sort`

Activity logs:
- `actor_id`
- `action`
- `entity_type`
- `entity_id`
- `page`
- `limit`

## Kontrak Data Penting

User profile:
- `id`
- `name`
- `nim`
- `email`
- `role`

Room:
- `id`
- `code`
- `name`
- `building`
- `floor`
- `location_description`
- `capacity`
- `facilities`
- `description`
- `image_url`
- `status`

Booking:
- `id`
- `booking_code`
- `user_id`
- `room_id`
- `purpose`
- `participant_count`
- `booking_date`
- `start_at`
- `end_at`
- `status`
- `user_note`
- `admin_note`
- `reviewed_by`
- `reviewed_at`
- `cancelled_by`
- `cancelled_at`
- `completed_by`
- `completed_at`

## Status yang Perlu Di-handle Frontend

Room status:
- `AVAILABLE`
- `MAINTENANCE`
- `INACTIVE`

Booking status:
- `PENDING`
- `APPROVED`
- `REJECTED`
- `CANCELLED`
- `COMPLETED`

## Error Code Penting

Frontend sebaiknya membaca `error.code`, bukan hanya `message`.

Contoh yang sudah dipakai:
- `INVALID_CREDENTIALS`
- `UNAUTHENTICATED`
- `FORBIDDEN`
- `RESOURCE_NOT_FOUND`
- `ROOM_NOT_AVAILABLE`
- `BOOKING_TIME_CONFLICT`
- `BOOKING_CANNOT_BE_CANCELLED`
- `EMAIL_ALREADY_EXISTS`
- `NIM_ALREADY_EXISTS`
- `INVALID_BOOKING_STATUS`

## Catatan Implementasi Frontend

- Role admin dan mahasiswa memakai endpoint login yang sama.
- `nim` tetap tampil sebagai data profil mahasiswa, bukan identifier login.
- Date-time booking sudah memakai format ISO 8601, misalnya `2026-07-21T09:00:00+07:00`.
- Endpoint admin wajib disembunyikan dari UI mahasiswa walaupun backend tetap proteksi dengan role check.
- Untuk halaman list, frontend sebaiknya langsung siapkan state pagination dari `meta`.
