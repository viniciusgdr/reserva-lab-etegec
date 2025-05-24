import { User, Professor, Laboratory, TimeSlot, Reservation } from "@/types"

// Dados iniciais para simulação
const initialProfessors: Professor[] = [
  { id: "1", name: "Prof. João Silva", email: "joao@lab.com" },
  { id: "2", name: "Prof. Maria Santos", email: "maria@lab.com" },
]

const initialLaboratories: Laboratory[] = [
  { id: "1", name: "Laboratório de Informática 1" },
  { id: "2", name: "Laboratório de Química" },
  { id: "3", name: "Laboratório de Física" },
]

const initialTimeSlots: TimeSlot[] = [
  { id: "1", start: "08:00", end: "10:00" },
  { id: "2", start: "10:00", end: "12:00" },
  { id: "3", start: "14:00", end: "16:00" },
  { id: "4", start: "16:00", end: "18:00" },
  { id: "5", start: "19:00", end: "21:00" },
  { id: "6", start: "21:00", end: "23:00" },
]

// Storage keys
const PROFESSORS_KEY = 'professors'
const LABORATORIES_KEY = 'laboratories'
const TIME_SLOTS_KEY = 'timeSlots'
const RESERVATIONS_KEY = 'reservations'
const USER_KEY = 'user'

// Funções auxiliares para armazenamento local
const getStoredData = <T>(key: string, initialData: T[]): T[] => {
  if (typeof window === 'undefined') return initialData
  
  const storedData = localStorage.getItem(key)
  return storedData ? JSON.parse(storedData) : initialData
}

const setStoredData = <T>(key: string, data: T[]): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data))
  }
}

// API de Professores
export const professorApi = {
  getAll: (): Professor[] => {
    return getStoredData<Professor>(PROFESSORS_KEY, initialProfessors)
  },
  
  add: (professor: Omit<Professor, "id">): Professor => {
    const professors = professorApi.getAll()
    const newProfessor = {
      id: Date.now().toString(),
      ...professor
    }
    const updatedProfessors = [...professors, newProfessor]
    setStoredData(PROFESSORS_KEY, updatedProfessors)
    return newProfessor
  },
  
  update: (professor: Professor): Professor => {
    const professors = professorApi.getAll()
    const updatedProfessors = professors.map(p => 
      p.id === professor.id ? professor : p
    )
    setStoredData(PROFESSORS_KEY, updatedProfessors)
    return professor
  },
  
  delete: (id: string): void => {
    const professors = professorApi.getAll()
    const updatedProfessors = professors.filter(p => p.id !== id)
    setStoredData(PROFESSORS_KEY, updatedProfessors)
  }
}

// API de Laboratórios
export const laboratoryApi = {
  getAll: (): Laboratory[] => {
    return getStoredData<Laboratory>(LABORATORIES_KEY, initialLaboratories)
  },
  
  add: (laboratory: Omit<Laboratory, "id">): Laboratory => {
    const laboratories = laboratoryApi.getAll()
    const newLaboratory = {
      id: Date.now().toString(),
      ...laboratory
    }
    const updatedLaboratories = [...laboratories, newLaboratory]
    setStoredData(LABORATORIES_KEY, updatedLaboratories)
    return newLaboratory
  },
  
  update: (laboratory: Laboratory): Laboratory => {
    const laboratories = laboratoryApi.getAll()
    const updatedLaboratories = laboratories.map(l => 
      l.id === laboratory.id ? laboratory : l
    )
    setStoredData(LABORATORIES_KEY, updatedLaboratories)
    return laboratory
  },
  
  delete: (id: string): void => {
    const laboratories = laboratoryApi.getAll()
    const updatedLaboratories = laboratories.filter(l => l.id !== id)
    setStoredData(LABORATORIES_KEY, updatedLaboratories)
  }
}

// API de Horários
export const timeSlotApi = {
  getAll: (): TimeSlot[] => {
    return getStoredData<TimeSlot>(TIME_SLOTS_KEY, initialTimeSlots)
  },
  
  add: (timeSlot: Omit<TimeSlot, "id">): TimeSlot => {
    const timeSlots = timeSlotApi.getAll()
    const newTimeSlot = {
      id: Date.now().toString(),
      ...timeSlot
    }
    const updatedTimeSlots = [...timeSlots, newTimeSlot]
    setStoredData(TIME_SLOTS_KEY, updatedTimeSlots)
    return newTimeSlot
  },
  
  update: (timeSlot: TimeSlot): TimeSlot => {
    const timeSlots = timeSlotApi.getAll()
    const updatedTimeSlots = timeSlots.map(t => 
      t.id === timeSlot.id ? timeSlot : t
    )
    setStoredData(TIME_SLOTS_KEY, updatedTimeSlots)
    return timeSlot
  },
  
  delete: (id: string): void => {
    const timeSlots = timeSlotApi.getAll()
    const updatedTimeSlots = timeSlots.filter(t => t.id !== id)
    setStoredData(TIME_SLOTS_KEY, updatedTimeSlots)
  }
}

// API de Reservas
export const reservationApi = {
  getAll: (): Reservation[] => {
    return getStoredData<Reservation>(RESERVATIONS_KEY, [])
  },
  
  add: (reservation: Omit<Reservation, "id" | "createdAt">): Reservation => {
    const reservations = reservationApi.getAll()
    const newReservation = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...reservation
    }
    const updatedReservations = [...reservations, newReservation]
    setStoredData(RESERVATIONS_KEY, updatedReservations)
    return newReservation
  },
  
  update: (reservationId: string, status: "active" | "cancelled"): Reservation | null => {
    const reservations = reservationApi.getAll()
    let updatedReservation: Reservation | null = null
    
    const updatedReservations = reservations.map(r => {
      if (r.id === reservationId) {
        updatedReservation = { ...r, status }
        return updatedReservation
      }
      return r
    })
    
    setStoredData(RESERVATIONS_KEY, updatedReservations)
    return updatedReservation
  }
}

// API de Usuário
export const userApi = {
  getCurrentUser: (): User | null => {
    if (typeof window === 'undefined') return null
    
    const userData = localStorage.getItem(USER_KEY)
    return userData ? JSON.parse(userData) : null
  },
  
  login: (user: User): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    }
  },
  
  logout: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(USER_KEY)
    }
  }
}
