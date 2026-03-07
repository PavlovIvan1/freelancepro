'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Check, Edit3, Eye } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

// Markdown → HTML — pure function, memoized via useMemo
function renderMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold text-foreground mt-4 mb-1.5">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-semibold text-foreground mt-5 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold text-foreground mt-6 mb-2">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-xs font-mono">$1</code>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 text-sm list-disc">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 text-sm list-decimal">$2</li>')
    .replace(/\n\n/g, '</p><p class="text-sm leading-relaxed mb-2">')
    .replace(/^(?!<[h1-6li])(.+)$/gm, (m) => m.trim() ? `<p class="text-sm leading-relaxed mb-2">${m}</p>` : '')
}

interface Project {
  id: string
  notes: string
}

export function NotesEditor({ projectId }: { projectId: string }) {
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

  const [value, setValue] = useState('')
  const [mode, setMode] = useState<'edit' | 'preview'>('edit')
  const [saved, setSaved] = useState(true)

  useEffect(() => {
    setValue(project?.notes ?? '')
  }, [project?.notes])

  const handleChange = useCallback((v: string) => {
    setValue(v)
    setSaved(false)
  }, [])

  const handleSave = useCallback(async () => {
    await fetch(`/api/projects/${projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: value })
    })
    setSaved(true)
    fetchProject()
  }, [value, projectId, fetchProject])

  // Auto-save on blur
  const handleBlur = useCallback(async () => {
    if (!saved && value !== (project?.notes ?? '')) {
      await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: value })
      })
      setSaved(true)
      fetchProject()
    }
  }, [saved, value, project?.notes, projectId, fetchProject])

  if (loading) {
    return <div className="text-sm text-muted-foreground">Загрузка...</div>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">Заметки</p>
        <div className="flex items-center gap-2">
          {!saved && <span className="text-xs text-muted-foreground">Не сохранено</span>}
          <div className="flex items-center gap-1 border rounded-md p-0.5">
            <Button
              size="sm"
              variant={mode === 'edit' ? 'secondary' : 'ghost'}
              onClick={() => setMode('edit')}
              className="h-6 px-2 text-xs gap-1"
            >
              <Edit3 className="w-3 h-3" /> Изменить
            </Button>
            <Button
              size="sm"
              variant={mode === 'preview' ? 'secondary' : 'ghost'}
              onClick={() => setMode('preview')}
              className="h-6 px-2 text-xs gap-1"
            >
              <Eye className="w-3 h-3" /> Просмотр
            </Button>
          </div>
          {mode === 'edit' && (
            <Button size="sm" onClick={handleSave} className="h-7 gap-1.5 text-xs">
              <Check className="w-3.5 h-3.5" />{saved ? 'Сохранено' : 'Сохранить'}
            </Button>
          )}
        </div>
      </div>

      <div className={cn('min-h-[300px] rounded-lg border bg-card', mode === 'edit' ? 'p-4' : 'p-4')}>
        {mode === 'edit' ? (
          <textarea
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            placeholder="Напишите заметки здесь... (Markdown поддерживается)"
            className="w-full h-[280px] resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        ) : (
          <div
            className="prose prose-sm max-w-none text-foreground"
            dangerouslySetInnerHTML={{ __html: value ? renderMarkdown(value) : '<p class="text-muted-foreground text-sm">Пока нет заметок...</p>' }}
          />
        )}
      </div>
    </div>
  )
}
