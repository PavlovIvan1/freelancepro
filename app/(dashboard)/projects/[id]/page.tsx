'use client'

import { KanbanBoard } from '@/components/kanban-board'
import { NotesEditor } from '@/components/notes-editor'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { STATUS_COLORS, STATUS_LABELS, getProgress } from '@/lib/store'
import { cn } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { use, useEffect, useMemo, useRef, useState } from 'react'

interface Project {
  id: string
  name: string
  clientId: string | null
  budget: number
  status: string
  description?: string
  earnedAmount?: number
  tasks: any[]
}

interface Client {
  id: string
  name: string
  company?: string
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [project, setProject] = useState<Project | null>(null)
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const projectRef = useRef<Project | null>(null)
  projectRef.current = project

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setProject(null)
        } else {
          setProject(data)
          // Fetch client if exists
          if (data.clientId) {
            fetch('/api/clients')
              .then(res => res.json())
              .then(clients => {
                const c = clients.find((c: Client) => c.id === data.clientId)
                if (c) setClient(c)
              })
          }
        }
      })
      .catch(() => setProject(null))
      .finally(() => setLoading(false))
  }, [id])

  const { doneTasks, totalTasks, progress } = useMemo(() => {
    const tasks = project?.tasks ?? []
    const doneTasks = tasks.filter((t) => t.status === 'done').length
    return { doneTasks, totalTasks: tasks.length, progress: getProgress(tasks) }
  }, [project?.tasks])

  const handleStatusChange = async (newStatus: string) => {
    await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
    setProject({ ...project, status: newStatus })
  }

  if (loading) {
    return (
      <div className="px-8 py-8">
        <p className="text-muted-foreground">Загрузка...</p>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="px-8 py-8">
        <Link href="/projects">
          <Button variant="ghost" className="gap-2 mb-6 -ml-2"><ArrowLeft className="w-4 h-4" /> Назад</Button>
        </Link>
        <p className="text-muted-foreground text-sm">Проект не найден.</p>
      </div>
    )
  }

  return (
    <div className="px-3 md:px-8 py-5 md:py-8 flex flex-col gap-4 md:gap-6 w-full">
      <Link href="/projects">
        <Button variant="ghost" size="sm" className="gap-2 -ml-2 h-8 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Проекты</span>
        </Button>
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-semibold text-foreground">{project.name}</h1>
            <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0', STATUS_COLORS[project.status])}>
              {STATUS_LABELS[project.status as keyof typeof STATUS_LABELS] || project.status}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-6 text-xs">Изменить</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => handleStatusChange('active')}>Активный</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('on-hold')}>На паузе</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('completed')}>Завершён</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('cancelled')}>Отменён</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {project.description && <p className="text-sm text-muted-foreground">{project.description}</p>}
        </div>
      </div>

      {/* Meta - Responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-border rounded-xl overflow-hidden border border-border">
        <div className="bg-card px-4 md:px-5 py-3 md:py-4">
          <p className="text-xs text-muted-foreground">Клиент</p>
          <p className="text-sm font-medium text-foreground mt-1 truncate">{client?.name ?? '—'}</p>
          {client?.company && <p className="text-xs text-muted-foreground truncate">{client.company}</p>}
        </div>
        <div className="bg-card px-4 md:px-5 py-3 md:py-4">
          <p className="text-xs text-muted-foreground">Бюджет</p>
          <p className="text-sm font-medium text-foreground mt-1">${project.budget.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Заработано: ${(project.earnedAmount || 0).toLocaleString()}</p>
        </div>
        <div className="bg-card px-4 md:px-5 py-3 md:py-4 flex flex-col gap-2">
          <p className="text-xs text-muted-foreground">Прогресс задач</p>
          <Progress value={progress} className="h-1.5 mt-1" />
          <p className="text-xs text-muted-foreground">{doneTasks} из {totalTasks} выполнено</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="kanban" className="flex flex-col gap-4">
        <TabsList className="w-fit">
          <TabsTrigger value="kanban">Задачи</TabsTrigger>
          <TabsTrigger value="notes">Заметки</TabsTrigger>
        </TabsList>
        <TabsContent value="kanban">
          <KanbanBoard projectId={project.id} onTasksChange={(tasks) => setProject(prev => prev ? { ...prev, tasks } : null)} />
        </TabsContent>
        <TabsContent value="notes">
          <NotesEditor projectId={project.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
