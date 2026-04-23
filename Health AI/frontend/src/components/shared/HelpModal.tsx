'use client'

import * as React from 'react'
import { Search, BookOpen } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/lib/i18n'





const CATEGORY_COLORS: Record<string, string> = {
  data: 'info',
  model: 'default',
  metrics: 'teal',
  ethics: 'warning',
  clinical: 'success',
}

interface HelpModalProps {
  open: boolean
  onClose: () => void
}

export function HelpModal({ open, onClose }: HelpModalProps) {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = React.useState('')

  const CATEGORY_LABELS: Record<string, string> = {
    data: t('glossary.categories.data'),
    model: t('glossary.categories.model'),
    metrics: t('glossary.categories.metrics'),
    ethics: t('glossary.categories.ethics'),
    clinical: t('glossary.categories.clinical'),
  }

  const filteredEntries = React.useMemo(() => {
    const entries = (t('glossary.entries') as any[]) || []
    const q = searchQuery.toLowerCase().trim()
    if (!q) return entries
    return entries.filter(
      (entry) =>
        entry.term.toLowerCase().includes(q) ||
        entry.definition.toLowerCase().includes(q) ||
        CATEGORY_LABELS[entry.category]?.toLowerCase().includes(q)
    )
  }, [searchQuery, t])

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      onClose()
      setSearchQuery('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
        {/* Fixed header */}
        <div className="px-6 pt-6 pb-4 border-b border-border-subtle">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <BookOpen className="h-5 w-5 text-brand-teal" />
              {t('glossary.title')}
            </DialogTitle>
            <DialogDescription>
              {t('glossary.description')}
            </DialogDescription>
          </DialogHeader>

          {/* Search */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder={t('glossary.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>
        </div>

        {/* Scrollable entries */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-3 opacity-40" />
              <p className="text-sm">{t('glossary.noResults').replace('{query}', searchQuery)}</p>
              <p className="text-xs mt-1">{t('glossary.tryDifferent')}</p>
            </div>
          ) : (
            filteredEntries.map((entry) => (
              <div
                key={entry.term}
                className="rounded-lg border border-border-subtle bg-surface p-4"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-sm font-bold text-brand-navy leading-tight">
                    {entry.term}
                  </h3>
                  <Badge
                    variant={CATEGORY_COLORS[entry.category] as 'info' | 'default' | 'teal' | 'warning' | 'success'}
                    size="sm"
                    className="shrink-0"
                  >
                    {CATEGORY_LABELS[entry.category]}
                  </Badge>
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  {entry.definition}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border-subtle bg-surface">
          <p className="text-xs text-muted-foreground text-center">
            {t('glossary.termsInfo')
              .replace('{count}', filteredEntries.length.toString())
              .replace('{total}', (t('glossary.entries') as any[] || []).length.toString())}
            {searchQuery && t('glossary.matching').replace('{query}', searchQuery)}
            {' · '}
            {t('steps.7.footer')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
