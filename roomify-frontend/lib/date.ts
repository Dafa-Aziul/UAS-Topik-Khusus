import { format } from "date-fns";
import { id } from "date-fns/locale";

export function formatIndonesianDate(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  return format(date, "EEEE, d MMMM yyyy", { locale: id });
}

export function formatTimeLabel(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  return format(date, "HH:mm");
}

export function formatTimeRangeLabel(start: string | Date, end: string | Date) {
  return `${formatTimeLabel(start)} - ${formatTimeLabel(end)}`;
}

export function getDurationLabel(start: string, end: string) {
  if (!start || !end || end <= start) {
    return "-";
  }

  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);
  const totalMinutes =
    endHour * 60 + endMinute - (startHour * 60 + startMinute);

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes} menit`;
  }

  if (minutes === 0) {
    return `${hours} jam`;
  }

  return `${hours} jam ${minutes} menit`;
}

export function toJakartaIso(date: string, time: string) {
  return `${date}T${time}:00+07:00`;
}

export function getTodayInputValue() {
  return format(new Date(), "yyyy-MM-dd");
}
