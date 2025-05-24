import { useState, useEffect } from 'react'
import { Reservation, ReservationStatusInfo } from '@/types'
import { reservationApi } from '@/services/mockApi'

export function useReservations(userId: string | undefined) {
  const [reservations, setReservations] = useState<Reservation[]>([])
  
  useEffect(() => {
    const fetchReservations = () => {
      const allReservations = reservationApi.getAll()
      setReservations(allReservations)
    }
    
    fetchReservations()
    
    // Poderia implementar uma função de escuta para atualizações em tempo real
    // Neste exemplo, vamos apenas carregar os dados iniciais
  }, [])
  
  const makeReservation = (labId: string, timeSlotId: string, date: string, professorId: string) => {
    if (!professorId) return null
    
    const newReservation = reservationApi.add({
      labId,
      timeSlotId,
      professorId,
      date,
      status: "active"
    })
    
    setReservations(prev => [...prev, newReservation])
    return newReservation
  }
  
  const cancelReservation = (reservationId: string) => {
    const updatedReservation = reservationApi.update(reservationId, "cancelled")
    
    if (updatedReservation) {
      setReservations(prev => 
        prev.map(r => r.id === reservationId ? updatedReservation : r)
      )
    }
  }
  
  const getReservationStatus = (labId: string, timeSlotId: string, date: string): ReservationStatusInfo => {
    const reservation = reservations.find(
      (r) => r.labId === labId && r.timeSlotId === timeSlotId && r.date === date && r.status === "active",
    )

    if (!reservation) return { status: "free", reservation: null }

    const isMyReservation = reservation.professorId === userId
    const isRecent = new Date(reservation.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)

    return {
      status: isMyReservation ? "mine" : isRecent ? "recent" : "occupied",
      reservation,
    }
  }
  
  return {
    reservations,
    makeReservation,
    cancelReservation,
    getReservationStatus
  }
}
