'use client'

import * as React from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Languages } from 'lucide-react'

export function LanguageSwitcher() {
  const { language, setLanguage } = useAppStore()

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={() => setLanguage(language === 'en' ? 'tr' : 'en')}
      className="gap-2 px-2 text-muted-foreground hover:text-brand-blue hover:bg-brand-blue/10"
      title={language === 'en' ? "Türkçe'ye geç" : 'Switch to English'}
    >
      <Languages className="h-4 w-4" />
      <span className="text-xs font-bold uppercase w-5">{language}</span>
    </Button>
  )
}
