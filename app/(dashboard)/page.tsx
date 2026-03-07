'use client'

import { Progress } from '@/components/ui/progress'
import { STATUS_COLORS, STATUS_LABELS, getProgress } from '@/lib/store'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const tooltipStyle = { background: '#fff', border: '1px solid #eee', borderRadius: 8, fontSize: 12 }

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
  tasks: any[]
}

interface Client {
  id: string
  name: string
}

interface MonthlyEarning {
  month: string
  amount: number
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [monthlyEarnings, setMonthlyEarnings] = useState<MonthlyEarning[]>([])

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
    
    // Fetch monthly earnings - use empty for now, can add API later
    setMonthlyEarnings([
      { month: 'Янв', amount: 0 },
      { month: 'Фев', amount: 0 },
      { month: 'Мар', amount: 0 },
      { month: 'Апр', amount: 0 },
      { month: 'Май', amount: 0 },
      { month: 'Июн', amount: 0 },
    ])
  }, [])

  const stats = useMemo(() => {
    const totalEarned    = projects.reduce((s, p) => s + (p.earnedAmount || 0), 0)
    const activeProjects = projects.filter((p) => p.status === 'active').length
    const allTasks       = projects.flatMap((p) => p.tasks || [])
    const doneTasks      = allTasks.filter((t) => t.status === 'done').length
    return { totalEarned, activeProjects, doneTasks, totalTasks: allTasks.length }
  }, [projects])

  const recentProjects = useMemo(() =>
    [...projects]
      .sort((a, b) => new Date(b.startDate || 0).getTime() - new Date(a.startDate || 0).getTime())
      .slice(0, 6),
    [projects]
  )

  return (
    <div className="px-8 py-10 flex flex-col gap-10 w-full">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Добро пожаловать</h1>
        <p className="text-muted-foreground text-sm mt-1">Обзор вашего бизнеса на сегодня.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-px bg-border rounded-xl overflow-hidden border border-border">
        {[
          { label: 'Заработано',         value: `$${stats.totalEarned.toLocaleString()}` },
          { label: 'Активных проектов',  value: stats.activeProjects },
          { label: 'Задач выполнено',    value: `${stats.doneTasks} / ${stats.totalTasks}` },
          { label: 'Клиентов',           value: clients.length },
        ].map((s) => (
          <div key={s.label} className="bg-card px-6 py-5">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-semibold text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-foreground">Доход по месяцам</p>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={monthlyEarnings} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#111" stopOpacity={0.08} />
                <stop offset="95%" stopColor="#111" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`$${v.toLocaleString()}`, 'Доход']} />
            <Area type="monotone" dataKey="amount" stroke="#111" strokeWidth={1.5} fill="url(#grad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent projects */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">Последние проекты</p>
          <Link href="/projects" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Все проекты →
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {recentProjects.map((p) => (
            <Link key={p.id} href={`/projects/${p.id}`} className="block group">
              <div className="bg-card border border-border rounded-xl p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-sm text-foreground line-clamp-1">{p.name}</p>
                  <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0', STATUS_COLORS[p.status])}>
                    {STATUS_LABELS[p.status as keyof typeof STATUS_LABELS] || p.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Progress value={getProgress(p.tasks || [])} className="h-1 flex-1" />
                  <span className="text-[10px] text-muted-foreground w-8 text-right">{getProgress(p.tasks || [])}%</span>
                </div>
              </div>
            </Link>
          ))}
          {recentProjects.length === 0 && (
            <p className="col-span-3 text-sm text-muted-foreground text-center py-8">Нет проектов</p>
          )}
        </div>
      </div>
    </div>
  )
}
