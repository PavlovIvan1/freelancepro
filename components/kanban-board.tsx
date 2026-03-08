'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { Plus, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

const columns: { id: TaskStatus; label: string }[] = [
  { id: 'todo',        label: 'К выполнению' },
  { id: 'in-progress', label: 'В работе' },
  { id: 'review',      label: 'Ревью' },
  { id: 'done',        label: 'Готово' },
]

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  medium: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  high: 'bg-red-500/10 text-red-600 dark:text-red-400',
}

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
}

type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done'

interface Task {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  status: TaskStatus
}

interface Project {
  id: string
  tasks: Task[]
}

const defaultTask = { title: '', description: '', priority: 'medium' as const, status: 'todo' as TaskStatus }

interface Props { 
  projectId: string
  onTasksChange?: (tasks: Task[]) => void
}

export function KanbanBoard({ projectId, onTasksChange }: Props) {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProject = useCallback(async () => {
    const res = await fetch(`/api/projects/${projectId}`)
    const data = await res.json()
    setProject(data)
    setLoading(false)
  }, [projectId])

  useEffect(() => {
    fetchProject()
  }, [fetchProject])

  // Notify parent when tasks change (only when tasks array reference changes)
  const prevTasksRef = useRef<Task[] | null>(null)
  useEffect(() => {
    if (project?.tasks && onTasksChange && prevTasksRef.current !== project.tasks) {
      prevTasksRef.current = project.tasks
      onTasksChange(project.tasks)
    }
  }, [project?.tasks, onTasksChange])

  const tasks = project?.tasks ?? []

  const [dragging, setDragging] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<TaskStatus | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [newTask, setNewTask] = useState(defaultTask)

  const handleDrop = useCallback(async (col: TaskStatus) => {
    if (dragging) {
      await fetch(`/api/tasks/${dragging}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: col, projectId })
      })
      fetchProject()
    }
    setDragging(null)
    setDragOver(null)
  }, [dragging, projectId, fetchProject])

  const handleAdd = useCallback(async () => {
    if (!newTask.title) return
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newTask, projectId })
    })
    setAddOpen(false)
    setNewTask(defaultTask)
    fetchProject()
  }, [newTask, projectId, fetchProject])

  const handleDelete = useCallback(async (taskId: string) => {
    await fetch(`/api/tasks/${taskId}?projectId=${projectId}`, {
      method: 'DELETE'
    })
    fetchProject()
  }, [projectId, fetchProject])

  if (loading) {
    return <div className="text-sm text-muted-foreground">Загрузка...</div>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">Доска задач</p>
        <Button size="sm" variant="outline" onClick={() => setAddOpen(true)} className="gap-1.5 h-8 text-xs">
          <Plus className="w-3.5 h-3.5" /> Задача
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id)
          return (
            <div
              key={col.id}
              onDragOver={(e) => { e.preventDefault(); setDragOver(col.id) }}
              onDrop={() => handleDrop(col.id)}
              className={cn(
                'flex flex-col gap-2 p-3 rounded-lg bg-muted/40 border border-border min-h-[160px] transition-colors',
                dragOver === col.id && 'border-foreground/30 bg-muted/70'
              )}
            >
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-medium text-foreground">{col.label}</span>
                <span className="text-xs text-muted-foreground">{colTasks.length}</span>
              </div>
              {colTasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => setDragging(task.id)}
                  onDragEnd={() => setDragging(null)}
                  className={cn(
                    'bg-card border border-border rounded-lg p-3 flex flex-col gap-2 cursor-grab active:cursor-grabbing select-none hover:border-foreground/20 transition-colors',
                    dragging === task.id && 'opacity-40'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-medium text-foreground leading-relaxed flex-1">{task.title}</span>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="shrink-0 text-muted-foreground/50 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  {task.description && (
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{task.description}</p>
                  )}
                  <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-full w-fit', PRIORITY_COLORS[task.priority])}>
                    {PRIORITY_LABELS[task.priority]}
                  </span>
                </div>
              ))}
            </div>
          )
        })}
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Новая задача</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label>Название</Label>
              <Input value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} placeholder="Название задачи..." />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Описание</Label>
              <Input value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} placeholder="Необязательно..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Приоритет</Label>
                <Select value={newTask.priority} onValueChange={(v) => setNewTask({ ...newTask, priority: v as Task['priority'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Низкий</SelectItem>
                    <SelectItem value="medium">Средний</SelectItem>
                    <SelectItem value="high">Высокий</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Колонка</Label>
                <Select value={newTask.status} onValueChange={(v) => setNewTask({ ...newTask, status: v as TaskStatus })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">К выполнению</SelectItem>
                    <SelectItem value="in-progress">В работе</SelectItem>
                    <SelectItem value="review">Ревью</SelectItem>
                    <SelectItem value="done">Готово</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Отмена</Button>
            <Button onClick={handleAdd}>Добавить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
