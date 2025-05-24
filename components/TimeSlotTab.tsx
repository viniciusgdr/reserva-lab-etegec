"use client"

import { useState, useEffect } from "react"
import { TimeSlot } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit, Trash2, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { timeSlotApi } from "@/services/mockApi"

export function TimeSlotTab() {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [showAddTimeSlot, setShowAddTimeSlot] = useState(false)
  const [showEditTimeSlot, setShowEditTimeSlot] = useState(false)
  const [newTimeSlot, setNewTimeSlot] = useState({ start: "", end: "" })
  const [editingTimeSlot, setEditingTimeSlot] = useState<TimeSlot | null>(null)

  useEffect(() => {
    // Carregar horários do serviço
    setTimeSlots(timeSlotApi.getAll())
  }, [])

  const addTimeSlot = () => {
    if (newTimeSlot.start && newTimeSlot.end) {
      const timeSlot = timeSlotApi.add(newTimeSlot)
      setTimeSlots([...timeSlots, timeSlot])
      setNewTimeSlot({ start: "", end: "" })
      setShowAddTimeSlot(false)
    }
  }

  const updateTimeSlot = () => {
    if (editingTimeSlot && editingTimeSlot.start && editingTimeSlot.end) {
      const updated = timeSlotApi.update(editingTimeSlot)
      setTimeSlots(timeSlots.map(t => t.id === updated.id ? updated : t))
      setEditingTimeSlot(null)
      setShowEditTimeSlot(false)
    }
  }

  const deleteTimeSlot = (id: string) => {
    if (confirm(`Tem certeza que deseja excluir este horário?`)) {
      timeSlotApi.delete(id)
      setTimeSlots(timeSlots.filter(t => t.id !== id))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Gerenciamento de Horários
          <Dialog open={showAddTimeSlot} onOpenChange={setShowAddTimeSlot}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Horário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Horário</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="time-start">Horário de Início</Label>
                  <Input
                    id="time-start"
                    type="time"
                    value={newTimeSlot.start}
                    onChange={(e) => setNewTimeSlot({ ...newTimeSlot, start: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="time-end">Horário de Fim</Label>
                  <Input
                    id="time-end"
                    type="time"
                    value={newTimeSlot.end}
                    onChange={(e) => setNewTimeSlot({ ...newTimeSlot, end: e.target.value })}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowAddTimeSlot(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={addTimeSlot}>Adicionar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {timeSlots.map((timeSlot) => (
            <div key={timeSlot.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">
                  {timeSlot.start} - {timeSlot.end}
                </h3>
              </div>
              <div className="flex space-x-2">
                <Dialog open={showEditTimeSlot && editingTimeSlot?.id === timeSlot.id} 
                        onOpenChange={(open) => {
                          setShowEditTimeSlot(open);
                          if (!open) setEditingTimeSlot(null);
                        }}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setEditingTimeSlot(timeSlot);
                        setShowEditTimeSlot(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Editar Horário</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="edit-time-start">Horário de Início</Label>
                        <Input
                          id="edit-time-start"
                          type="time"
                          value={editingTimeSlot?.start || ""}
                          onChange={(e) => setEditingTimeSlot(
                            editingTimeSlot ? { ...editingTimeSlot, start: e.target.value } : null
                          )}
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-time-end">Horário de Fim</Label>
                        <Input
                          id="edit-time-end"
                          type="time"
                          value={editingTimeSlot?.end || ""}
                          onChange={(e) => setEditingTimeSlot(
                            editingTimeSlot ? { ...editingTimeSlot, end: e.target.value } : null
                          )}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => {
                          setShowEditTimeSlot(false);
                          setEditingTimeSlot(null);
                        }}>
                          Cancelar
                        </Button>
                        <Button onClick={updateTimeSlot}>Salvar</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteTimeSlot(timeSlot.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          {timeSlots.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhum horário cadastrado
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
