import { useAppStore } from './store'
import { en } from '@/locales/en'
import { tr } from '@/locales/tr'

export function useTranslation() {
  const language = useAppStore((state) => state.language)
  const translations = language === 'tr' ? tr : en

  // Helper to access nested objects using string paths like 'common.next'
  const t = (path: string) => {
    const keys = path.split('.')
    let current: any = translations
    for (const key of keys) {
      if (!current || current[key] === undefined) {
        console.warn(`Translation path not found: ${path}`)
        return path
      }
      current = current[key]
    }
    return current
  }

  return { t, language }
}
