'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done'
export type Priority = 'low' | 'medium' | 'high'
export type ProjectStatus = 'active' | 'completed' | 'paused' | 'cancelled'

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: Priority
  createdAt: string
}

export interface Project {
  id: string
  name: string
  clientId: string
  budget: number
  currency: string
  status: ProjectStatus
  description?: string
  startDate: string
  endDate?: string
  tasks: Task[]
  notes: string
  earnedAmount: number
  category?: string
}

export interface Client {
  id: string
  name: string
  email?: string
  company?: string
}

export interface MonthlyEarning {
  month: string
  amount: number
}

interface Store {
  projects: Project[]
  clients: Client[]
  monthlyEarnings: MonthlyEarning[]
  addProject: (project: Omit<Project, 'id' | 'tasks' | 'notes'>) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  addClient: (client: Omit<Client, 'id'>) => void
  updateClient: (id: string, updates: Partial<Client>) => void
  deleteClient: (id: string) => void
  addTask: (projectId: string, task: Omit<Task, 'id' | 'createdAt'>) => void
  updateTask: (projectId: string, taskId: string, updates: Partial<Task>) => void
  deleteTask: (projectId: string, taskId: string) => void
  moveTask: (projectId: string, taskId: string, newStatus: TaskStatus) => void
  updateNotes: (projectId: string, notes: string) => void
}

const uid = () => Math.random().toString(36).slice(2, 11)

const initialClients: Client[] = []

const initialProjects: Project[] = []

const initialMonthlyEarnings: MonthlyEarning[] = []

export const useStore = create<Store>()(
  persist(
    (set) => ({
      projects: initialProjects,
      clients: initialClients,
      monthlyEarnings: initialMonthlyEarnings,

      addProject: (project) =>
        set((s) => ({ projects: [...s.projects, { ...project, id: uid(), tasks: [], notes: '' }] })),

      updateProject: (id, updates) =>
        set((s) => ({ projects: s.projects.map((p) => p.id === id ? { ...p, ...updates } : p) })),

      deleteProject: (id) =>
        set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),

      addClient: (client) =>
        set((s) => ({ clients: [...s.clients, { ...client, id: uid() }] })),

      updateClient: (id, updates) =>
        set((s) => ({ clients: s.clients.map((c) => c.id === id ? { ...c, ...updates } : c) })),

      deleteClient: (id) =>
        set((s) => ({ clients: s.clients.filter((c) => c.id !== id) })),

      addTask: (projectId, task) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId
              ? { ...p, tasks: [...p.tasks, { ...task, id: uid(), createdAt: new Date().toISOString().split('T')[0] }] }
              : p
          ),
        })),

      updateTask: (projectId, taskId, updates) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId
              ? { ...p, tasks: p.tasks.map((t) => t.id === taskId ? { ...t, ...updates } : t) }
              : p
          ),
        })),

      deleteTask: (projectId, taskId) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId ? { ...p, tasks: p.tasks.filter((t) => t.id !== taskId) } : p
          ),
        })),

      moveTask: (projectId, taskId, newStatus) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId
              ? { ...p, tasks: p.tasks.map((t) => t.id === taskId ? { ...t, status: newStatus } : t) }
              : p
          ),
        })),

      updateNotes: (projectId, notes) =>
        set((s) => ({ projects: s.projects.map((p) => p.id === projectId ? { ...p, notes } : p) })),
    }),
    {
      name: 'freelio-store',
      partialize: (s) => ({ projects: s.projects, clients: s.clients, monthlyEarnings: s.monthlyEarnings }),
    }
  )
)

// Granular selectors — prevents unnecessary re-renders
export const useProjects = () => useStore((s) => s.projects)
export const useClients  = () => useStore((s) => s.clients)
export const useMonthlyEarnings = () => useStore((s) => s.monthlyEarnings)
export const useProjectById = (id: string) => useStore((s) => s.projects.find((p) => p.id === id))
export const useClientById  = (id: string) => useStore((s) => s.clients.find((c) => c.id === id))

// Shared constants — defined once, never re-created
export const STATUS_COLORS: Record<string, string> = {
  active:    'bg-emerald-100 text-emerald-700',
  completed: 'bg-sky-100 text-sky-700',
  paused:    'bg-amber-100 text-amber-700',
  cancelled: 'bg-red-100 text-red-700',
}

export const STATUS_LABELS: Record<string, string> = {
  all:       'Все',
  active:    'Активен',
  completed: 'Завершён',
  paused:    'Пауза',
  cancelled: 'Отменён',
}

export const PRIORITY_COLORS: Record<string, string> = {
  low:    'bg-slate-100 text-slate-500',
  medium: 'bg-amber-100 text-amber-700',
  high:   'bg-red-100 text-red-600',
}

export const PRIORITY_LABELS: Record<string, string> = {
  low: 'Низкий', medium: 'Средний', high: 'Высокий',
}

export function getProgress(tasks: { status: string }[]): number {
  if (tasks.length === 0) return 0
  return Math.round((tasks.filter((t) => t.status === 'done').length / tasks.length) * 100)
}
