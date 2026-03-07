'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

interface Client {
  id: string
  name: string
  email?: string
  company?: string
}

interface Project {
  id: string
  clientId: string | null
  budget: number
}

const defaultForm = { name: '', email: '', company: '' }

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [projects, setProjects] = useState<Project[]>([])

  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(defaultForm)

  useEffect(() => {
    Promise.all([
      fetch('/api/clients').then(res => res.json()),
      fetch('/api/projects').then(res => res.json())
    ])
      .then(([clientsData, projectsData]) => {
        if (Array.isArray(clientsData)) {
          setClients(clientsData)
        }
        if (Array.isArray(projectsData)) {
          setProjects(projectsData)
        }
      })
      .catch(console.error)
  }, [])

  // Pre-compute project stats per client once
  const clientStats = useMemo(() => {
    const map: Record<string, { count: number; budget: number }> = {}
    for (const p of projects) {
      if (p.clientId) {
        if (!map[p.clientId]) map[p.clientId] = { count: 0, budget: 0 }
        map[p.clientId].count++
        map[p.clientId].budget += p.budget
      }
    }
    return map
  }, [projects])

  const handleOpen = useCallback((clientId?: string) => {
    if (clientId) {
      const c = clients.find((c) => c.id === clientId)
      if (c) setForm({ name: c.name, email: c.email ?? '', company: c.company ?? '' })
      setEditId(clientId)
    } else {
      setForm(defaultForm)
      setEditId(null)
    }
    setOpen(true)
  }, [clients])

  const handleSave = useCallback(async () => {
    if (!form.name) return
    
    if (editId) {
      // Update client - for now just update local state
      setClients(clients.map(c => c.id === editId ? { ...c, ...form } : c))
    } else {
      // Create new client via API
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      
      if (res.ok) {
        const newClient = await res.json()
        setClients([...clients, newClient])
      } else {
        const error = await res.json()
        alert(error.error || 'Ошибка при создании клиента')
        return
      }
    }
    
    setOpen(false)
    setForm(defaultForm)
    setEditId(null)
  }, [form, editId, clients])

  const handleDelete = async (id: string) => {
    // For now just delete locally - can add API call later
    setClients(clients.filter(c => c.id !== id))
  }

  return (
    <div className="px-8 py-10 flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Клиенты</h1>
          <p className="text-muted-foreground text-sm mt-1">{clients.length} клиентов</p>
        </div>
        <Button onClick={() => handleOpen()} className="gap-2">
          <Plus className="w-4 h-4" /> Новый клиент
        </Button>
      </div>

      <div className="grid gap-3">
        {clients.map((client) => {
          const stats = clientStats[client.id] || { count: 0, budget: 0 }
          return (
            <div key={client.id} className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:bg-muted/50 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">{client.name}</p>
                <p className="text-sm text-muted-foreground">{client.email || '—'} · {client.company || '—'}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-medium text-foreground">{stats.count} проектов</p>
                <p className="text-xs text-muted-foreground">${stats.budget.toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpen(client.id)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(client.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )
        })}
        {clients.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">Клиенты не найдены</p>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? 'Редактировать клиента' : 'Новый клиент'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Имя</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Иван Иванов" />
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="ivan@example.com" />
            </div>
            <div className="grid gap-2">
              <Label>Компания</Label>
              <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="ИП Иванов" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Отмена</Button>
            <Button onClick={handleSave}>{editId ? 'Сохранить' : 'Создать'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
