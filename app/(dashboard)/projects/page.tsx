'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { ProjectStatus } from '@/lib/store'
import { STATUS_COLORS, STATUS_LABELS, getProgress } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Plus, Search, Trash2, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'

interface Project {
  id: string
  name: string
  clientId: string | null
  budget: number
  status: string
  description?: string
  startDate?: string
  endDate?: string
  earnedAmount?: number
  category?: string
  notes?: string
  tasks: any[]
}

interface Client {
  id: string
  name: string
  email?: string
  company?: string
}

const defaultForm = {
  name: '', clientId: '', newClientName: '', newClientEmail: '', newClientCompany: '',
  budget: '', currency: 'USD',
  status: 'active' as ProjectStatus, description: '',
  startDate: new Date().toISOString().split('T')[0], category: '', earnedAmount: 0,
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [clients, setClients] = useState<Client[]>([])

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(defaultForm)
  const [isCreatingClient, setIsCreatingClient] = useState(false)

  // Fetch projects and clients from API
  useEffect(() => {
    Promise.all([
      fetch('/api/projects').then(res => res.json()),
      fetch('/api/clients').then(res => res.json())
    ])
      .then(([projectsData, clientsData]) => {
        if (Array.isArray(projectsData)) {
          setProjects(projectsData)
        }
        if (Array.isArray(clientsData)) {
          setClients(clientsData)
        }
      })
      .catch(console.error)
  }, [])

  const filtered = useMemo(() =>
    projects.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
      const matchStatus = filterStatus === 'all' || p.status === filterStatus
      return matchSearch && matchStatus
    }),
    [projects, search, filterStatus]
  )

  const clientMap = useMemo(() =>
    Object.fromEntries(clients.map((c) => [c.id, c.name])),
    [clients]
  )

  const handleDelete = async (id: string) => {
    await fetch(`/api/projects/${id}`, { method: 'DELETE' })
    setProjects(projects.filter(p => p.id !== id))
  }

  const handleAdd = useCallback(async () => {
    let finalClientId = form.clientId

    // Create new client if needed
    if (isCreatingClient && form.newClientName) {
      const clientRes = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.newClientName,
          email: form.newClientEmail,
          company: form.newClientCompany
        })
      })
      
      if (!clientRes.ok) {
        const errorData = await clientRes.json()
        alert(errorData.error || 'Ошибка при создании клиента')
        return
      }
      
      const newClient = await clientRes.json()
      setClients([...clients, newClient])
      finalClientId = newClient.id
    }

    if (!form.name || !finalClientId || !form.budget) return
    
    // Call API to create project (will check limits)
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        clientId: finalClientId,
        budget: form.budget,
        status: form.status,
        description: form.description,
        startDate: form.startDate,
        category: form.category,
      })
    })
    
    if (!res.ok) {
      const errorData = await res.json()
      alert(errorData.error || 'Ошибка при создании проекта')
      return
    }
    
    const newProject = await res.json()
    setProjects([...projects, { ...newProject, tasks: [] }])
    
    setOpen(false)
    setForm(defaultForm)
    setIsCreatingClient(false)
  }, [form, isCreatingClient, projects, clients])

  const handleOpenChange = (open: boolean) => {
    setOpen(open)
    if (!open) {
      setIsCreatingClient(false)
      setForm(defaultForm)
    }
  }

  return (
    <div className="px-3 md:px-8 py-5 md:py-10 flex flex-col gap-4 md:gap-6 w-full">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-foreground">Проекты</h1>
          <p className="text-muted-foreground text-sm mt-1">{projects.length} проектов</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2 text-sm">
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Новый проект</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Поиск..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-56"
          />
        </div>
        <div className="flex items-center gap-1">
          {(['all', 'active', 'completed', 'paused', 'cancelled'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                filterStatus === s
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* List - Responsive cards */}
      <div className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {filtered.map((project) => {
          const progress = getProgress(project.tasks || [])
          return (
            <div key={project.id} className="relative bg-card border border-border rounded-xl p-4 hover:bg-muted/30 transition-colors">
              <Link href={`/projects/${project.id}`} className="absolute inset-0" aria-label={project.name} />
              <div className="flex items-start justify-between gap-2 mb-3 pointer-events-none">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{project.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{clientMap[project.clientId || ''] ?? '—'}</p>
                </div>
                <Button
                  variant="ghost" size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0 relative z-10"
                  onClick={(e) => { e.preventDefault(); handleDelete(project.id) }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
              <div className="flex items-center justify-between gap-3 pointer-events-none">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Progress value={progress} className="h-1.5 flex-1" />
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap">{progress}%</span>
                </div>
                <span className="text-sm font-medium text-foreground whitespace-nowrap">${project.budget.toLocaleString()}</span>
              </div>
              <div className="mt-3 pointer-events-none">
                <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full', STATUS_COLORS[project.status])}>
                  {STATUS_LABELS[project.status as keyof typeof STATUS_LABELS] || project.status}
                </span>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground py-8 text-center col-span-full">Проекты не найдены.</p>
        )}
      </div>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Новый проект</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label>Название</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Интернет-магазин" />
            </div>

            {!isCreatingClient ? (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <Label>Клиент</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 text-xs gap-1 text-muted-foreground hover:text-foreground"
                    onClick={() => setIsCreatingClient(true)}
                  >
                    <UserPlus className="w-3 h-3" /> Новый клиент
                  </Button>
                </div>
                <Select value={form.clientId} onValueChange={(v) => setForm({ ...form, clientId: v })}>
                  <SelectTrigger><SelectValue placeholder="Выберите клиента" /></SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    {clients.length === 0 && <p className="text-sm text-muted-foreground p-2">Нет клиентов</p>}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-1.5">
                  <Label>Новый клиент</Label>
                  <Input 
                    value={form.newClientName} 
                    onChange={(e) => setForm({ ...form, newClientName: e.target.value })} 
                    placeholder="Имя клиента *" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Input 
                    value={form.newClientEmail} 
                    onChange={(e) => setForm({ ...form, newClientEmail: e.target.value })} 
                    placeholder="Email (необязательно)" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Input 
                    value={form.newClientCompany} 
                    onChange={(e) => setForm({ ...form, newClientCompany: e.target.value })} 
                    placeholder="Компания (необязательно)" 
                  />
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs text-muted-foreground hover:text-foreground self-start"
                  onClick={() => {
                    setIsCreatingClient(false)
                    setForm({ ...form, newClientName: '', newClientEmail: '', newClientCompany: '' })
                  }}
                >
                  ← Выбрать существующего клиента
                </Button>
              </>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Бюджет</Label>
                <Input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="3500" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Статус</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as ProjectStatus })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Активен</SelectItem>
                    <SelectItem value="paused">Пауза</SelectItem>
                    <SelectItem value="completed">Завершён</SelectItem>
                    <SelectItem value="cancelled">Отменён</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Категория</Label>
                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Веб-разработка" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Дата начала</Label>
                <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Описание</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Необязательно..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleOpenChange(false)}>Отмена</Button>
            <Button onClick={handleAdd}>Создать</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
