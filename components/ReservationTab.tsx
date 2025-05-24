"use client"

import { useState, useEffect } from "react"
import { Laboratory, TimeSlot, ReservationDetails } from "@/types"
import { useReservations } from "@/hooks/useReservations"
import { getWeekDates } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { laboratoryApi, timeSlotApi } from "@/services/mockApi"

interface ReservationTabProps {
  userId: string
  isAdmin: boolean
}

export function ReservationTab({ userId, isAdmin }: ReservationTabProps) {
  const [laboratories, setLaboratories] = useState<Laboratory[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [selectedLabId, setSelectedLabId] = useState<string>("")
  const [showReservationModal, setShowReservationModal] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState<ReservationDetails | null>(null)
  
  const { makeReservation, cancelReservation, getReservationStatus } = useReservations(userId)
  
  useEffect(() => {
    // Carregar dados
    const labs = laboratoryApi.getAll()
    setLaboratories(labs)
    setTimeSlots(timeSlotApi.getAll())
    
    // Definir laboratório padrão selecionado
    if (labs.length > 0) {
      setSelectedLabId(labs[0].id)
    }
  }, [])
  
  // Filtrar laboratório selecionado
  const selectedLab = laboratories.find(lab => lab.id === selectedLabId) || laboratories[0]
  const weekDates = getWeekDates()
  
  const openReservationModal = (labId: string, timeSlotId: string, date: string) => {
    const lab = laboratories.find((l) => l.id === labId)
    const timeSlot = timeSlots.find((t) => t.id === timeSlotId)
    const dateObj = new Date(date)

    setSelectedReservation({
      labId,
      timeSlotId,
      date,
      labName: lab?.name || "",
      timeSlot: `${timeSlot?.start} - ${timeSlot?.end}`,
      dateFormatted: `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`,
    })
    setShowReservationModal(true)
  }

  const confirmReservation = () => {
    if (selectedReservation && userId) {
      makeReservation(
        selectedReservation.labId,
        selectedReservation.timeSlotId,
        selectedReservation.date,
        userId
      )
      setShowReservationModal(false)
      setSelectedReservation(null)
    }
  }
  
  return (
    <>
      <Card className="border-none shadow-md overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg p-4 mx-4">
          <CardTitle className="text-blue-800 dark:text-blue-300">Agenda de Laboratórios</CardTitle>
          <CardDescription className="text-blue-600 dark:text-blue-400">
            Selecione um laboratório para visualizar e gerenciar reservas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          {/* Seletor de laboratório */}
          <div className="mb-6">
            <Label htmlFor="lab-selector" className="mb-2 block font-medium text-gray-700 dark:text-gray-300">
              Laboratório
            </Label>
            <Select
              value={selectedLabId}
              onValueChange={(value) => setSelectedLabId(value)}
            >
              <SelectTrigger className="w-full rounded-lg border-gray-300 dark:border-gray-600 transition-all hover:border-blue-400 dark:hover:border-blue-500">
                <SelectValue placeholder="Selecione um laboratório" />
              </SelectTrigger>
              <SelectContent className="rounded-lg border-gray-200 dark:border-gray-700 shadow-lg">
                {laboratories.map((lab) => (
                  <SelectItem key={lab.id} value={lab.id} className="cursor-pointer">
                    {lab.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Legendas */}
          <div className="flex flex-wrap gap-2 mb-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800">
              Livre
            </Badge>
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-800">
              Recente
            </Badge>
            <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
              Ocupado
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800">
              Suas Reservas
            </Badge>
          </div>

          {/* Tabela de horários */}
          {selectedLab && (
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="border border-gray-200 dark:border-gray-700 p-3 text-left font-medium text-gray-700 dark:text-gray-300">
                      Horário
                    </th>
                    {weekDates.map((date) => (
                      <th 
                        key={date.toISOString()} 
                        className={`border border-gray-200 dark:border-gray-700 p-3 text-center font-medium min-w-[120px] ${
                          date.getDay() === 0 || date.getDay() === 6 ? 'bg-gray-100 dark:bg-gray-700' : ''
                        }`}
                      >
                        <div className="text-gray-700 dark:text-gray-300">
                          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][date.getDay()]}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {date.getDate()}/{date.getMonth() + 1}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((timeSlot, index) => (
                    <tr key={timeSlot.id} className={index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800/50'}>
                      <td className="border border-gray-200 dark:border-gray-700 p-3 font-medium text-gray-700 dark:text-gray-300">
                        {timeSlot.start} - {timeSlot.end}
                      </td>
                      {weekDates.map((date) => {
                        const dateStr = date.toISOString().split("T")[0]
                        const { status, reservation } = getReservationStatus(selectedLab.id, timeSlot.id, dateStr)

                        return (
                          <td key={dateStr} className="border border-gray-200 dark:border-gray-700 p-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className={`w-full h-12 text-xs font-medium transition-all ${
                                status === "free"
                                  ? "bg-green-50 hover:bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 dark:text-green-300 dark:border-green-800"
                                  : status === "mine"
                                    ? "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800"
                                    : status === "recent"
                                      ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800 cursor-not-allowed"
                                      : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 cursor-not-allowed"
                              }`}
                              onClick={() => {
                                if (status === "free" && !isAdmin) {
                                  openReservationModal(selectedLab.id, timeSlot.id, dateStr)
                                } else if (status === "mine") {
                                  if (reservation) cancelReservation(reservation.id)
                                }
                              }}
                              onDoubleClick={() => {
                                if (status === "mine" && reservation) {
                                  cancelReservation(reservation.id)
                                }
                              }}
                              disabled={
                                status === "recent" ||
                                status === "occupied" ||
                                (status === "free" && isAdmin)
                              }
                            >
                              {status === "free" ? "Livre" : status === "mine" ? "Você" : "Ocupado"}
                            </Button>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Modal de Confirmação de Reserva */}
      <Dialog open={showReservationModal} onOpenChange={setShowReservationModal}>
        <DialogContent className="sm:max-w-md rounded-xl shadow-xl border-blue-100 dark:border-blue-900">
          <DialogHeader>
            <DialogTitle className="text-xl text-blue-800 dark:text-blue-300">
              Confirmar Reserva
            </DialogTitle>
            <DialogDescription className="text-blue-600 dark:text-blue-400">
              Você tem certeza que deseja reservar este horário?
            </DialogDescription>
          </DialogHeader>
          {selectedReservation && (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/30 p-5 rounded-lg border border-blue-100 dark:border-blue-800">
                <h3 className="font-medium text-lg text-blue-800 dark:text-blue-300">{selectedReservation.labName}</h3>
                <p className="text-blue-700 dark:text-blue-400 mt-2">
                  <strong>Data:</strong> {selectedReservation.dateFormatted}
                </p>
                <p className="text-blue-700 dark:text-blue-400 mt-1">
                  <strong>Horário:</strong> {selectedReservation.timeSlot}
                </p>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowReservationModal(false)}
                  className="rounded-full border-gray-300 hover:bg-red-50 hover:text-red-600 dark:border-gray-600 dark:hover:bg-red-900/30 dark:hover:text-red-300"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={confirmReservation}
                  className="rounded-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                >
                  Confirmar Reserva
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
