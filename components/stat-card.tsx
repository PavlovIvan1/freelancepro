import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string
  sub?: string
  trend?: { value: string; positive: boolean }
  className?: string
}

export function StatCard({ label, value, sub, trend, className }: StatCardProps) {
  return (
    <div className={cn('bg-card border border-border rounded-xl p-5 flex flex-col gap-3', className)}>
      <span className="text-sm text-muted-foreground font-medium">{label}</span>
      <div className="flex flex-col gap-1">
        <span className="text-2xl font-semibold text-foreground tracking-tight">{value}</span>
        {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
      </div>
      {trend && (
        <div className={cn('flex items-center gap-1 text-xs font-medium', trend.positive ? 'text-emerald-600' : 'text-red-500')}>
          <span>{trend.positive ? '↑' : '↓'}</span>
          <span>{trend.value} vs last month</span>
        </div>
      )}
    </div>
  )
}
