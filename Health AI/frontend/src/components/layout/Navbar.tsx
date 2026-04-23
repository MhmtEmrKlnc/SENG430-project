'use client'

import * as React from 'react'
import { RotateCcw, HelpCircle } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { DomainSelector } from './DomainSelector'
import { LanguageSwitcher } from './LanguageSwitcher'
import { HelpModal } from '@/components/shared/HelpModal'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

function HeartCircuitLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Background circle */}
      <circle cx="20" cy="20" r="20" fill="#1B3A6B" />
      {/* Heart shape */}
      <path
        d="M20 30 C20 30 10 23 10 16.5C10 13.4 12.4 11 15.5 11C17.2 11 18.7 11.8 20 13C21.3 11.8 22.8 11 24.5 11C27.6 11 30 13.4 30 16.5C30 23 20 30 20 30Z"
        fill="none"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* ECG line through heart */}
      <path
        d="M12 18 L15 18 L16.5 15 L18 21 L19.5 16.5 L21 18 L28 18"
        stroke="#0D9488"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Navbar() {
  const { t } = useTranslation()
  const { resetAll, columnMapping, selectedDomainId, setCurrentStep } = useAppStore()
  const [resetDialogOpen, setResetDialogOpen] = React.useState(false)
  const [helpOpen, setHelpOpen] = React.useState(false)

  const hasProgress = columnMapping !== null || selectedDomainId !== null

  function handleResetClick() {
    if (hasProgress) {
      setResetDialogOpen(true)
    } else {
      resetAll()
      setCurrentStep(1)
    }
  }

  function handleConfirmReset() {
    resetAll()
    setCurrentStep(1)
    setResetDialogOpen(false)
  }

  return (
    <>
      <nav
        className="sticky top-0 z-50 w-full border-b border-border-subtle bg-surface-card/95 backdrop-blur supports-[backdrop-filter]:bg-surface-card/80"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Left: Logo + App name */}
            <div className="flex items-center gap-3 min-w-0 shrink-0">
              <HeartCircuitLogo className="h-9 w-9 shrink-0" />
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-brand-navy tracking-tight leading-none">
                    {t('nav.appName')}
                  </span>
                  <span className="hidden sm:inline text-sm font-medium text-muted-foreground leading-none">
                    · {t('nav.tagline')}
                  </span>
                </div>
                <p className="hidden md:block text-[10px] text-muted-foreground mt-0.5 leading-tight">
                  {t('nav.professionals')}
                </p>
              </div>
            </div>

            {/* Center: Erasmus note (large screens) */}
            <div className="hidden lg:flex flex-1 justify-center">
              <span className="text-xs text-muted-foreground">
                {t('nav.erasmus')}
              </span>
            </div>

            {/* Right: Domain selector + actions */}
            <div className="flex items-center gap-2 shrink-0">
              <LanguageSwitcher />
              <DomainSelector />

              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleResetClick}
                title={t('common.reset')}
                aria-label={t('common.reset')}
                className="text-muted-foreground hover:text-clinical-danger hover:bg-clinical-danger/10"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setHelpOpen(true)}
                title={t('common.help')}
                aria-label={t('common.help')}
                className="text-muted-foreground hover:text-brand-blue hover:bg-brand-blue/10"
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Reset confirmation dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-clinical-warning" />
              {t('common.resetTitle')}
            </DialogTitle>
            <DialogDescription>
              {t('common.resetDesc')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setResetDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleConfirmReset}>
              {t('common.confirmReset')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Help modal */}
      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  )
}
