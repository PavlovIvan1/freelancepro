'use client'

import { useMemo } from 'react'
import { useProjects, useMonthlyEarnings, STATUS_LABELS } from '@/lib/store'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
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
  const projects        = useProjects()
  const monthlyEarnings = useMonthlyEarnings()

  const stats = useMemo(() => {
    const totalEarned  = projects.reduce((s, p) => s + p.earnedAmount, 0)
    const allTasks     = projects.flatMap((p) => p.tasks)
    const doneTasks    = allTasks.filter((t) => t.status === 'done').length
    const yearTotal    = monthlyEarnings.reduce((s, m) => s + m.amount, 0)
    return { totalEarned, doneTasks, totalTasks: allTasks.length, yearTotal }
  }, [projects, monthlyEarnings])

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {}
    for (const p of projects) {
      const key = p.category || 'Другое'
      map[key] = (map[key] ?? 0) + p.budget
    }
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [projects])

  const statusData = useMemo(() =>
    (['active', 'completed', 'paused', 'cancelled'] as const)
      .map((s) => ({ name: STATUS_LABELS[s], value: projects.filter((p) => p.status === s).length }))
      .filter((d) => d.value > 0),
    [projects]
  )

  const cumulativeData = useMemo(() => {
    let acc = 0
    return monthlyEarnings.map((m) => ({ month: m.month, accumulated: (acc += m.amount) }))
  }, [monthlyEarnings])

  const taskProgressData = useMemo(() =>
    projects
      .filter((p) => p.tasks.length > 0)
      .map((p) => ({
        name: p.name.length > 14 ? p.name.slice(0, 14) + '…' : p.name,
        done: p.tasks.filter((t) => t.status === 'done').length,
        total: p.tasks.length,
        pct: Math.round((p.tasks.filter((t) => t.status === 'done').length / p.tasks.length) * 100),
      })),
    [projects]
  )

  return (
    <div className="px-8 py-10 flex flex-col gap-8 w-full">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Аналитика</h1>
        <p className="text-muted-foreground text-sm mt-1">Обзор эффективности</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-px bg-border rounded-xl overflow-hidden border border-border">
        {[
          { label: 'Доход за год',    value: `$${stats.yearTotal.toLocaleString()}` },
          { label: 'Заработано',      value: `$${stats.totalEarned.toLocaleString()}` },
          { label: 'Задач выполнено', value: `${stats.totalTasks > 0 ? Math.round((stats.doneTasks / stats.totalTasks) * 100) : 0}%` },
          { label: 'Проектов',        value: projects.length },
        ].map((s) => (
          <div key={s.label} className="bg-card px-6 py-5">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-semibold text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Monthly bar chart */}
      <div className="border border-border rounded-xl p-5 bg-card flex flex-col gap-3">
        <p className="text-sm font-medium text-foreground">Доход по месяцам</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthlyEarnings} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`$${v.toLocaleString()}`, 'Доход']} />
            <Bar dataKey="amount" name="Доход" fill="#111" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cumulative line */}
      <div className="border border-border rounded-xl p-5 bg-card flex flex-col gap-3">
        <p className="text-sm font-medium text-foreground">Накопленный доход</p>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={cumulativeData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`$${v.toLocaleString()}`, 'Накоплено']} />
            <Line type="monotone" dataKey="accumulated" stroke="#111" strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Task progress bar chart */}
      <div className="border border-border rounded-xl p-5 bg-card flex flex-col gap-3">
        <p className="text-sm font-medium text-foreground">Прогресс задач по проектам</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={taskProgressData} layout="vertical" margin={{ top: 4, right: 16, bottom: 0, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#555' }} axisLine={false} tickLine={false} width={110} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, 'Выполнено']} />
            <Bar dataKey="pct" name="Прогресс" fill="#111" radius={[0, 3, 3, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Two pies */}
      <div className="grid grid-cols-2 gap-6">
        <div className="border border-border rounded-xl p-5 bg-card flex flex-col gap-3">
          <p className="text-sm font-medium text-foreground">Статусы проектов</p>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={STATUS_PIE_COLORS[entry.name] ?? NEUTRAL[i % NEUTRAL.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [v, 'Проектов']} contentStyle={tooltipStyle} />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground py-16 text-center">Нет данных</p>
          )}
        </div>
        <div className="border border-border rounded-xl p-5 bg-card flex flex-col gap-3">
          <p className="text-sm font-medium text-foreground">Доход по категориям</p>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {categoryData.map((_, i) => <Cell key={i} fill={NEUTRAL[i % NEUTRAL.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, 'Бюджет']} contentStyle={tooltipStyle} />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground py-16 text-center">Нет данных</p>
          )}
        </div>
      </div>
    </div>
  )
}
