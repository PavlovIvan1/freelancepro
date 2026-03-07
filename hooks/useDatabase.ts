'use client'

import { useEffect, useState } from 'react'

export function useDatabase() {
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initDatabase = async () => {
      try {
        const response = await fetch('/api/init')
        if (!response.ok) {
          throw new Error('Failed to initialize database')
        }
        setIsReady(true)
      } catch (err) {
        console.error('Database initialization error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
    }

    initDatabase()
  }, [])

  return { isReady, error }
}
