"use client"

import { useState, useEffect } from "react"
import { Reservation, Professor, Laboratory, TimeSlot } from "@/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { reservationApi, professorApi, laboratoryApi, timeSlotApi } from "@/services/mockApi"

interface HistoryTabProps {
  userId: string
  isAdmin: boolean
}

export function HistoryTab({ userId, isAdmin }: HistoryTabProps) {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [professors, setProfessors] = useState<Professor[]>([])
  const [laboratories, setLaboratories] = useState<Laboratory[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])

  useEffect(() => {
    (async () => {
      const [reservationsData, professorsData, laboratoriesData, timeSlotsData] = await Promise.all([
        reservationApi.getAll(),
        professorApi.getAll(),
        laboratoryApi.getAll(),
        timeSlotApi.getAll()
      ])
      setReservations(reservationsData)
      setProfessors(professorsData)
      setLaboratories(laboratoriesData)
      setTimeSlots(timeSlotsData)
    })()
  }, [])

  // Filtrar reservas para mostrar apenas as do usuário (se não for admin)
  const filteredReservations = reservations
    .filter((r) => isAdmin || r.professorId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Reservas</CardTitle>
        <CardDescription>
          {isAdmin
            ? "Histórico completo de todas as atividades do sistema"
            : "Suas reservas e cancelamentos"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredReservations.map((reservation) => {
            const lab = laboratories.find((l) => l.id === reservation.laboratoryId)
            const timeSlot = timeSlots.find((t) => t.id === reservation.timeSlotId)
            const professor = professors.find((p) => p.id === reservation.professorId)

            return (
              <div key={reservation.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">
                    {lab?.name} - {timeSlot?.start} às {timeSlot?.end}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {isAdmin ? professor?.name : "Você"} - {reservation.date}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(reservation.createdAt).toLocaleString("pt-BR")}
                  </p>
                </div>
                <Badge variant={reservation.status === "ACTIVE" ? "default" : "secondary"}>
                  {reservation.status === "ACTIVE" ? "Ativa" : "Cancelada"}
                </Badge>
              </div>
            )
          })}

          {filteredReservations.length === 0 && (
            <div className="text-center py-8 text-gray-500">Nenhuma reserva encontrada</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
