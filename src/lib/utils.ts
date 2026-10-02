import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, format: 'short' | 'long' | 'relative' = 'short'): string {
  const d = new Date(date)
  if (format === 'relative') {
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return 'agora'
    if (minutes < 60) return `${minutes}min atrás`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h atrás`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days}d atrás`
    return d.toLocaleDateString('pt-BR')
  }
  if (format === 'long') {
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('pt-BR')
}

export function getStorageUrl(bucket: string, path: string): string {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`
}

export function generateId(): string {
  return crypto.randomUUID()
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function calculatePoints(wins: number, draws: number): number {
  return wins * 3 + draws * 1
}

export function calculateScoreDiff(scoreFor: number, scoreAgainst: number): number {
  return scoreFor - scoreAgainst
}
