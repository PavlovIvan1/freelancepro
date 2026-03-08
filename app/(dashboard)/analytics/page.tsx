'use client'

import { STATUS_LABELS } from '@/lib/store'
import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell, Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis, YAxis,
} from 'recharts'

const STATUS_PIE_COLORS: Record<string, string> = {
  'Активен':  '#10b981',
  'Завершён': '#0ea5e9',
  'Пауза':    '#f59e0b',
  'Отменён':  '#ef4444',
}
const NEUTRAL = ['#111', '#555', '#888', '#aaa', '#ccc']
const tooltipStyle = { background: '#fff', border: '1px solid #eee', borderRadius: 8, fontSize: 12 }

export default function AnalyticsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [monthlyEarnings, setMonthlyEarnings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then((projectsData) => {
        if (Array.isArray(projectsData)) {
          setProjects(projectsData)
          
          // Calculate monthly earnings from completed projects
          const earningsByMonth: Record<string, number> = {}
          projectsData.forEach((project: any) => {
            if (project.status === 'completed' && project.earnedAmount > 0) {
              const date = new Date(project.updatedAt || project.createdAt)
              const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
              earningsByMonth[monthKey] = (earningsByMonth[monthKey] || 0) + (project.earnedAmount || 0)
            }
          })
          
          // Convert to array with month names
          const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']
          const earningsArray = Object.entries(earningsByMonth)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, amount]) => ({
              month: months[parseInt(month.split('-')[1]) - 1] + ' ' + month.split('-')[0],
              amount
            }))
          
          setMonthlyEarnings(earningsArray)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const stats = useMemo(() => {
    const totalEarned  = projects.reduce((s: number, p: any) => s + (p.earnedAmount || 0), 0)
    const allTasks     = projects.flatMap((p: any) => p.tasks || [])
    const doneTasks    = allTasks.filter((t: any) => t.status === 'done').length
    const yearTotal    = monthlyEarnings.reduce((s: number, m: any) => s + (m.amount || 0), 0)
    return { totalEarned, doneTasks, totalTasks: allTasks.length, yearTotal }
  }, [projects, monthlyEarnings])

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {}
    for (const p of projects) {
      const key = p.category || 'Другое'
      map[key] = (map[key] ?? 0) + (p.budget || 0)
    }
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [projects])

  const statusData = useMemo(() =>
    (['active', 'completed', 'paused', 'cancelled'] as const)
      .map((s) => ({ name: STATUS_LABELS[s], value: projects.filter((p: any) => p.status === s).length }))
      .filter((d) => d.value > 0),
    [projects]
  )

  const cumulativeData = useMemo(() => {
    let acc = 0
    return monthlyEarnings.map((m: any) => ({ month: m.month, accumulated: (acc += m.amount) }))
  }, [monthlyEarnings])

  const taskProgressData = useMemo(() =>
    projects
      .filter((p: any) => (p.tasks || []).length > 0)
      .map((p: any) => ({
        name: p.name.length > 14 ? p.name.slice(0, 14) + '…' : p.name,
        done: p.tasks.filter((t: any) => t.status === 'done').length,
        total: p.tasks.length,
        pct: Math.round((p.tasks.filter((t: any) => t.status === 'done').length / p.tasks.length) * 100),
      })),
    [projects]
  )

  if (loading) {
    return (
      <div className="px-4 md:px-8 py-6 md:py-10 flex flex-col gap-6 w-full">
        <div className="animate-pulse">
          <div className="h-8 w-32 bg-muted rounded mb-2"></div>
          <div className="h-4 w-48 bg-muted rounded"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-px bg-border rounded-xl overflow-hidden border border-border">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-card px-4 md:px-6 py-4 md:py-5">
              <div className="h-3 w-16 bg-muted rounded mb-2"></div>
              <div className="h-7 w-20 bg-muted rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-10 flex flex-col gap-6 md:gap-8 w-full">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold text-foreground">Аналитика</h1>
        <p className="text-muted-foreground text-sm mt-1">Обзор эффективности</p>
      </div>

      {/* KPIs - Responsive grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-xl overflow-hidden border border-border">
        <div className="bg-card px-3 md:px-6 py-3 md:py-5">
          <p className="text-[10px] md:text-xs text-muted-foreground">Доход за год</p>
          <p className="text-lg md:text-2xl font-semibold text-foreground mt-1">${stats.yearTotal.toLocaleString()}</p>
        </div>
        <div className="bg-card px-3 md:px-6 py-3 md:py-5">
          <p className="text-[10px] md:text-xs text-muted-foreground">Заработано</p>
          <p className="text-lg md:text-2xl font-semibold text-foreground mt-1">${stats.totalEarned.toLocaleString()}</p>
        </div>
        <div className="bg-card px-3 md:px-6 py-3 md:py-5">
          <p className="text-[10px] md:text-xs text-muted-foreground">Задач выполнено</p>
          <p className="text-lg md:text-2xl font-semibold text-foreground mt-1">{stats.totalTasks > 0 ? Math.round((stats.doneTasks / stats.totalTasks) * 100) : 0}%</p>
        </div>
        <div className="bg-card px-3 md:px-6 py-3 md:py-5">
          <p className="text-[10px] md:text-xs text-muted-foreground">Проектов</p>
          <p className="text-lg md:text-2xl font-semibold text-foreground mt-1">{projects.length}</p>
        </div>
      </div>

      {/* Monthly bar chart */}
      <div className="border border-border rounded-xl p-3 md:p-5 bg-card flex flex-col gap-3">
        <p className="text-sm font-medium text-foreground">Доход по месяцам</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={monthlyEarnings} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#999' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#999' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`$${v.toLocaleString()}`, 'Доход']} />
            <Bar dataKey="amount" name="Доход" fill="#111" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cumulative line */}
      <div className="border border-border rounded-xl p-3 md:p-5 bg-card flex flex-col gap-3">
        <p className="text-sm font-medium text-foreground">Накопленный доход</p>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={cumulativeData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#999' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#999' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`$${v.toLocaleString()}`, 'Накоплено']} />
            <Line type="monotone" dataKey="accumulated" stroke="#111" strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Task progress bar chart */}
      <div className="border border-border rounded-xl p-3 md:p-5 bg-card flex flex-col gap-3">
        <p className="text-sm font-medium text-foreground">Прогресс задач по проектам</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={taskProgressData} layout="vertical" margin={{ top: 4, right: 8, bottom: 0, left: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#999' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#555' }} axisLine={false} tickLine={false} width={80} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, 'Выполнено']} />
            <Bar dataKey="pct" name="Прогресс" fill="#111" radius={[0, 3, 3, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Two pies - Responsive grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="border border-border rounded-xl p-3 md:p-5 bg-card flex flex-col gap-3">
          <p className="text-sm font-medium text-foreground">Статусы проектов</p>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={STATUS_PIE_COLORS[entry.name] ?? NEUTRAL[i % NEUTRAL.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [v, 'Проектов']} contentStyle={tooltipStyle} />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground py-8 md:py-16 text-center">Нет данных</p>
          )}
        </div>
        <div className="border border-border rounded-xl p-3 md:p-5 bg-card flex flex-col gap-3">
          <p className="text-sm font-medium text-foreground">Доход по категориям</p>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  {categoryData.map((_, i) => <Cell key={i} fill={NEUTRAL[i % NEUTRAL.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, 'Бюджет']} contentStyle={tooltipStyle} />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground py-8 md:py-16 text-center">Нет данных</p>
          )}
        </div>
      </div>
    </div>
  )
}
