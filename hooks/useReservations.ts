import { useState, useEffect, useCallback } from 'react'
import { Reservation, ReservationStatusInfo } from '@/types'

export function useReservations(userId: string | undefined) {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const fetchReservations = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/reservations');
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar reservas: ${response.status}`);
      }
      
      const data = await response.json();
      setReservations(data);
    } catch (err) {
      console.error('Erro ao buscar reservas:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [userId]);
  
  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);
  
  const makeReservation = async (labId: string, timeSlotId: string, date: string, professorId: string) => {
    if (!professorId) return null;
    
    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          laboratoryId: labId,
          timeSlotId,
          date,
          professorId
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erro ao criar reserva: ${response.status}`);
      }
      
      const newReservation = await response.json();
      setReservations(prev => [...prev, newReservation]);
      return newReservation;
    } catch (err) {
      console.error('Erro ao criar reserva:', err);
      throw err;
    }
  }
  
  const cancelReservation = async (reservationId: string) => {
    try {
      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'CANCELLED'
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erro ao cancelar reserva: ${response.status}`);
      }
      
      const updatedReservation = await response.json();
      
      setReservations(prev => 
        prev.map(r => r.id === reservationId ? updatedReservation : r)
      );
      
      return updatedReservation;
    } catch (err) {
      console.error('Erro ao cancelar reserva:', err);
      throw err;
    }
  }
  
  const getReservationStatus = useCallback((labId: string, timeSlotId: string, date: string): ReservationStatusInfo => {
    const reservation = reservations.find(
      (r) => r.laboratoryId === labId && r.timeSlotId === timeSlotId && r.date === date && r.status === "ACTIVE",
    );

    if (!reservation) return { status: "free", reservation: null };

    const isMyReservation = reservation.professorId === userId;
    const isRecent = new Date(reservation.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000);

    return {
      status: isMyReservation ? "mine" : isRecent ? "recent" : "occupied",
      reservation,
    };
  }, [reservations, userId]);
  
  return {
    reservations,
    loading,
    error,
    makeReservation,
    cancelReservation,
    getReservationStatus,
    refreshReservations: fetchReservations
  }
}
