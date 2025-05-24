"use client"

import { useState, useEffect } from "react"
import { Laboratory } from "@/types"
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
import { laboratoryApi } from "@/services/mockApi"

export function LaboratoryTab() {
  const [laboratories, setLaboratories] = useState<Laboratory[]>([])
  const [showAddLab, setShowAddLab] = useState(false)
  const [showEditLab, setShowEditLab] = useState(false)
  const [newLab, setNewLab] = useState({ name: "" })
  const [editingLab, setEditingLab] = useState<Laboratory | null>(null)

  useEffect(() => {
    // Carregar laboratórios do serviço
    setLaboratories(laboratoryApi.getAll())
  }, [])

  const addLaboratory = () => {
    if (newLab.name) {
      const laboratory = laboratoryApi.add(newLab)
      setLaboratories([...laboratories, laboratory])
      setNewLab({ name: "" })
      setShowAddLab(false)
    }
  }

  const updateLaboratory = () => {
    if (editingLab && editingLab.name) {
      const updated = laboratoryApi.update(editingLab)
      setLaboratories(laboratories.map(l => l.id === updated.id ? updated : l))
      setEditingLab(null)
      setShowEditLab(false)
    }
  }

  const deleteLaboratory = (id: string) => {
    if (confirm(`Tem certeza que deseja excluir este laboratório?`)) {
      laboratoryApi.delete(id)
      setLaboratories(laboratories.filter(l => l.id !== id))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Gerenciamento de Laboratórios
          <Dialog open={showAddLab} onOpenChange={setShowAddLab}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Laboratório
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Laboratório</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="lab-name">Nome do Laboratório</Label>
                  <Input
                    id="lab-name"
                    value={newLab.name}
                    onChange={(e) => setNewLab({ name: e.target.value })}
                    placeholder="Nome do laboratório"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowAddLab(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={addLaboratory}>Adicionar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {laboratories.map((lab) => (
            <div key={lab.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">{lab.name}</h3>
              </div>
              <div className="flex space-x-2">
                <Dialog open={showEditLab && editingLab?.id === lab.id} 
                        onOpenChange={(open) => {
                          setShowEditLab(open);
                          if (!open) setEditingLab(null);
                        }}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setEditingLab(lab);
                        setShowEditLab(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Editar Laboratório</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="edit-lab-name">Nome do Laboratório</Label>
                        <Input
                          id="edit-lab-name"
                          value={editingLab?.name || ""}
                          onChange={(e) => setEditingLab(
                            editingLab ? { ...editingLab, name: e.target.value } : null
                          )}
                          placeholder="Nome do laboratório"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => {
                          setShowEditLab(false);
                          setEditingLab(null);
                        }}>
                          Cancelar
                        </Button>
                        <Button onClick={updateLaboratory}>Salvar</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteLaboratory(lab.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          {laboratories.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhum laboratório cadastrado
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
