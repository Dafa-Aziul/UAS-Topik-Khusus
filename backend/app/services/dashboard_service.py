from __future__ import annotations

from collections import Counter, defaultdict

from app.repositories.booking_repository import BookingRepository
from app.repositories.room_repository import RoomRepository
from app.repositories.user_repository import UserRepository
from app.schemas.dashboard import (
    AdminDashboardSummary,
    BookingTrendItem,
    RoomUsageItem,
    StudentDashboardSummary,
)


class DashboardService:
    def __init__(
        self,
        user_repository: UserRepository | None = None,
        room_repository: RoomRepository | None = None,
        booking_repository: BookingRepository | None = None,
    ):
        self.user_repository = user_repository or UserRepository()
        self.room_repository = room_repository or RoomRepository()
        self.booking_repository = booking_repository or BookingRepository()

    async def get_admin_summary(self) -> AdminDashboardSummary:
        users = await self.user_repository.list_all()
        rooms = await self.room_repository.list_all()
        bookings = await self.booking_repository.list_all()

        total_active_students = sum(
            1 for user in users if user.get("role") == "MAHASISWA" and user.get("is_active", True)
        )
        booking_status_summary = dict(Counter(booking["status"] for booking in bookings))
        return AdminDashboardSummary(
            total_active_students=total_active_students,
            total_rooms=len(rooms),
            booking_status_summary=booking_status_summary,
        )

    async def get_room_usage(self) -> list[RoomUsageItem]:
        rooms = await self.room_repository.list_all()
        bookings = await self.booking_repository.list_all()
        room_lookup = {room["_id"]: room["name"] for room in rooms}
        counts = Counter(booking["room_id"] for booking in bookings)
        items = [
            RoomUsageItem(
                room_id=room_id,
                room_name=room_lookup.get(room_id, room_id),
                total_bookings=total_bookings,
            )
            for room_id, total_bookings in counts.most_common()
        ]
        return items

    async def get_booking_trend(self) -> list[BookingTrendItem]:
        bookings = await self.booking_repository.list_all()
        daily_counts: dict[str, int] = defaultdict(int)
        for booking in bookings:
            daily_counts[booking["booking_date"]] += 1
        return [
            BookingTrendItem(booking_date=booking_date, total_bookings=total_bookings)
            for booking_date, total_bookings in sorted(daily_counts.items())
        ]

    async def get_student_summary(self, user_id: str) -> StudentDashboardSummary:
        bookings = await self.booking_repository.list_by_user(user_id)
        status_counts = Counter(booking["status"] for booking in bookings)
        return StudentDashboardSummary(
            total_bookings=len(bookings),
            pending_bookings=status_counts.get("PENDING", 0),
            approved_bookings=status_counts.get("APPROVED", 0),
            completed_bookings=status_counts.get("COMPLETED", 0),
            cancelled_bookings=status_counts.get("CANCELLED", 0),
        )
