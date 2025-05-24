"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, Users, Building, History } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Header } from '@/components/Header'
import { HistoryTab } from '@/components/HistoryTab'
import { TimeSlotTab } from '@/components/TimeSlotTab'
import { ProfessorTab } from '@/components/ProfessorTab'
import { LaboratoryTab } from '@/components/LaboratoryTab'
import { ReservationTab } from '@/components/ReservationTab'

interface User {
  id: string
  email: string
  role: "admin" | "professor"
  name: string
  firstAccess: boolean
}

interface Reservation {
  id: string
  labId: string
  timeSlotId: string
  professorId: string
  date: string
  status: "active" | "cancelled"
  createdAt: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)

  const [reservations, setReservations] = useState<Reservation[]>([])

  // Estados para modais
  const [showReservationModal, setShowReservationModal] = useState(false)
  
  const [selectedReservation, setSelectedReservation] = useState<{
    labId: string
    timeSlotId: string
    date: string
    labName: string
    timeSlot: string
    dateFormatted: string
  } | null>(null)

  useEffect(() => {
    setMounted(true)
    const userData = localStorage.getItem("user")
    if (!userData) {
      window.location.href = "/"
      return
    }
    setUser(JSON.parse(userData))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("user")
    window.location.href = "/"
  }



  // Nova função para editar laboratório


  const makeReservation = (labId: string, timeSlotId: string, date: string) => {
    if (user) {
      const reservation: Reservation = {
        id: Date.now().toString(),
        labId,
        timeSlotId,
        professorId: user.id,
        date,
        status: "active",
        createdAt: new Date().toISOString(),
      }
      setReservations([...reservations, reservation])
    }
  }




  const confirmReservation = () => {
    if (selectedReservation && user) {
      makeReservation(selectedReservation.labId, selectedReservation.timeSlotId, selectedReservation.date)
      setShowReservationModal(false)
      setSelectedReservation(null)
    }
  }

  if (!mounted || !user) return null

  
  // Filtrar laboratório selecionado

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <Header
        userName={user.name}
        userRole={user.role}
        onLogout={handleLogout}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="reservations" className="space-y-6">
          {/* Tabs - Design melhorado */}
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-800">
            <TabsTrigger value="reservations" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm transition-all">
              <Calendar className="h-4 w-4 mr-2" />
              Reservas
            </TabsTrigger>
            {user.role === "admin" && (
              <>
                <TabsTrigger value="professors" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm transition-all">
                  <Users className="h-4 w-4 mr-2" />
                  Professores
                </TabsTrigger>
                <TabsTrigger value="laboratories" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm transition-all">
                  <Building className="h-4 w-4 mr-2" />
                  Laboratórios
                </TabsTrigger>
                <TabsTrigger value="schedules" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm transition-all">
                  <Clock className="h-4 w-4 mr-2" />
                  Horários
                </TabsTrigger>
              </>
            )}
            <TabsTrigger value="history" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm transition-all">
              <History className="h-4 w-4 mr-2" />
              Histórico
            </TabsTrigger>
          </TabsList>

          {/* Aba de Reservas - Design melhorado */}
          <TabsContent value="reservations" className="space-y-6 animate-in fade-in-50 duration-300">
            <ReservationTab 
              userId={user.id}
              isAdmin={user.role === "admin"}
            />
          </TabsContent>

          {/* Aba de Professores (Admin) */}
          {user.role === "admin" && (
            <TabsContent value="professors" className="space-y-6">
              <ProfessorTab
              />
            </TabsContent>
          )}

          {/* Aba de Laboratórios (Admin) */}
          {user.role === "admin" && (
            <TabsContent value="laboratories" className="space-y-6">
              <LaboratoryTab />
            </TabsContent>
          )}

          {/* Aba de Horários (Admin) */}
          {user.role === "admin" && (
            <TabsContent value="schedules" className="space-y-6">
              <TimeSlotTab
              />
            </TabsContent>
          )}

          <TabsContent value="history" className="space-y-6">
            <HistoryTab
              userId={user.id}
              isAdmin={user.role === "admin"}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Modal de Confirmação de Reserva - Design melhorado */}
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
    </div>
  )
}
