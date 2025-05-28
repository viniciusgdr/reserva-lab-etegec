"use client"

import { useState, useEffect } from "react"
import { Professor } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit, Trash2, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { professorApi } from "@/services/mockApi"

export function ProfessorTab() {
  const [professors, setProfessors] = useState<Professor[]>([])
  const [showAddProfessor, setShowAddProfessor] = useState(false)
  const [showEditProfessor, setShowEditProfessor] = useState(false)
  const [newProfessor, setNewProfessor] = useState({ name: "", email: "" })
  const [editingProfessor, setEditingProfessor] = useState<Professor | null>(null)

  useEffect(() => {
    // Carregar professores do serviço
    (async () => {
      setProfessors(await professorApi.getAll())
    })()
  }, [])

  const addProfessor = async () => {
    if (newProfessor.name && newProfessor.email) {
      const professor = await professorApi.add(newProfessor)
      setProfessors([...professors, professor])
      setNewProfessor({ name: "", email: "" })
      setShowAddProfessor(false)
    }
  }

  const updateProfessor = async () => {
    if (editingProfessor && editingProfessor.name && editingProfessor.email) {
      const updated = await professorApi.update(editingProfessor)
      setProfessors(professors.map(p => p.id === updated.id ? updated : p))
      setEditingProfessor(null)
      setShowEditProfessor(false)
    }
  }

  const deleteProfessor = (id: string) => {
    if (confirm(`Tem certeza que deseja excluir este professor? Todas as reservas dele serão removidas.`)) {
      professorApi.delete(id)
      setProfessors(professors.filter(p => p.id !== id))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Gerenciamento de Professores
          <Dialog open={showAddProfessor} onOpenChange={setShowAddProfessor}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Professor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Professor</DialogTitle>
                <DialogDescription>
                  A senha inicial será automaticamente definida como 12345678
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="prof-name">Nome</Label>
                  <Input
                    id="prof-name"
                    value={newProfessor.name}
                    onChange={(e) => setNewProfessor({ ...newProfessor, name: e.target.value })}
                    placeholder="Nome do professor"
                  />
                </div>
                <div>
                  <Label htmlFor="prof-email">Email</Label>
                  <Input
                    id="prof-email"
                    type="email"
                    value={newProfessor.email}
                    onChange={(e) => setNewProfessor({ ...newProfessor, email: e.target.value })}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowAddProfessor(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={addProfessor}>Adicionar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {professors.map((professor) => (
            <div key={professor.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">{professor.name}</h3>
                <p className="text-sm text-gray-500">{professor.email}</p>
              </div>
              <div className="flex space-x-2">
                <Dialog open={showEditProfessor && editingProfessor?.id === professor.id} 
                        onOpenChange={(open) => {
                          setShowEditProfessor(open);
                          if (!open) setEditingProfessor(null);
                        }}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setEditingProfessor(professor);
                        setShowEditProfessor(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Editar Professor</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="edit-prof-name">Nome</Label>
                        <Input
                          id="edit-prof-name"
                          value={editingProfessor?.name || ""}
                          onChange={(e) => setEditingProfessor(
                            editingProfessor ? { ...editingProfessor, name: e.target.value } : null
                          )}
                          placeholder="Nome do professor"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-prof-email">Email</Label>
                        <Input
                          id="edit-prof-email"
                          type="email"
                          value={editingProfessor?.email || ""}
                          onChange={(e) => setEditingProfessor(
                            editingProfessor ? { ...editingProfessor, email: e.target.value } : null
                          )}
                          placeholder="email@exemplo.com"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => {
                          setShowEditProfessor(false);
                          setEditingProfessor(null);
                        }}>
                          Cancelar
                        </Button>
                        <Button onClick={updateProfessor}>Salvar</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteProfessor(professor.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          {professors.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhum professor cadastrado
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
