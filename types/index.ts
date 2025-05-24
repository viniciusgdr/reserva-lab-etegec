export interface User {
  id: string
  email: string
  role: "admin" | "professor"
  name: string
  firstAccess: boolean
}

export interface Professor {
  id: string
  name: string
  email: string
}

export interface Laboratory {
  id: string
  name: string
}

export interface TimeSlot {
  id: string
  start: string
  end: string
}

export interface Reservation {
  id: string
  labId: string
  timeSlotId: string
  professorId: string
  date: string
  status: "active" | "cancelled"
  createdAt: string
}

export interface ReservationDetails {
  labId: string
  timeSlotId: string
  date: string
  labName: string
  timeSlot: string
  dateFormatted: string
}

export type ReservationStatus = "free" | "mine" | "recent" | "occupied";

export interface ReservationStatusInfo {
  status: ReservationStatus;
  reservation: Reservation | null;
}
