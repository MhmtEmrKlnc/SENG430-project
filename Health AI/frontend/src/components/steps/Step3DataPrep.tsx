'use client'

import * as React from 'react'
import { Settings2, Loader2, CheckCircle2, ChevronRight } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { getDomainById } from '@/lib/domains'
import { preprocessData } from '@/lib/api'
import { useTranslation } from '@/lib/i18n'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Banner } from '@/components/shared/Banner'
import { Separator } from '@/components/ui/separator'
import { formatPercent } from '@/lib/utils'

export function Step3DataPrep() {
  const { t } = useTranslation()
  const {
    selectedDomainId,
    columnMapping,
    rawData: storeRawData,
    rowCount,
    prepSettings,
    processedDataset,
    isPreparing,
    prepError,
    setPrepSettings,
    setProcessedDataset,
    setIsPreparing,
    setPrepError,
    setCurrentStep,
  } = useAppStore()

  const domain = selectedDomainId ? getDomainById(selectedDomainId) : null

  async function handleRunPreprocessing() {
    if (!domain || !columnMapping) return
    setIsPreparing(true)
    setPrepError(null)
    try {
      const result = await preprocessData({
        rawData: storeRawData,
        columnMapping,
        prepSettings,
        taskType: domain.taskType,
      })
      setProcessedDataset(result)
    } catch (err) {
      setPrepError(err instanceof Error ? err.message : t('steps.3.running'))
    } finally {
      setIsPreparing(false)
    }
  }

  const trainCount = processedDataset
    ? processedDataset.nTrain
    : Math.round(rowCount * (1 - prepSettings.testSize))
  const testCount = processedDataset
    ? processedDataset.nTest
    : Math.round(rowCount * prepSettings.testSize)

  return (
    <div className="step-container">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="teal" size="sm">{t('common.step')} 3</Badge>
          <span className="text-xs text-muted-foreground">{t('steps.3.label')}</span>
        </div>
        <h1 className="step-heading">{t('steps.3.heading')}</h1>
        <p className="step-subheading">
          {t('steps.3.subheading')}
        </p>
      </div>

      {!columnMapping && (
        <Banner
          variant="warning"
          title={t('steps.3.mappingRequiredTitle')}
          message={t('steps.3.mappingRequiredMsg')}
        />
      )}

      {columnMapping && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Settings panel */}
          <div className="space-y-6">
            {/* Train/test split */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings2 className="h-4 w-4" />
                  {t('steps.3.splitTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('steps.3.testSetSize')}</span>
                  <span className="font-semibold text-brand-navy">
                    {formatPercent(prepSettings.testSize)}
                  </span>
                </div>
                <Slider
                  min={10}
                  max={40}
                  step={5}
                  value={[Math.round(prepSettings.testSize * 100)]}
                  onValueChange={([v]) => setPrepSettings({ testSize: v / 100 })}
                />
                <div className="grid grid-cols-2 gap-3 text-center text-sm">
                  <div className="rounded-lg bg-brand-navy/5 p-3">
                    <p className="text-xl font-bold text-brand-navy">
                      {formatPercent(1 - prepSettings.testSize)}
                    </p>
                    <p className="text-xs text-muted-foreground">{t('steps.3.trainingRows')} ({trainCount} {t('steps.2.rows').toLowerCase()})</p>
                  </div>
                  <div className="rounded-lg bg-brand-blue/5 p-3">
                    <p className="text-xl font-bold text-brand-blue">
                      {formatPercent(prepSettings.testSize)}
                    </p>
                    <p className="text-xs text-muted-foreground">{t('steps.3.testingRows')} ({testCount} {t('steps.2.rows').toLowerCase()})</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Missing values */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('steps.3.missingStrategyTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={prepSettings.missingStrategy}
                  onValueChange={(v) =>
                    setPrepSettings({ missingStrategy: v as typeof prepSettings.missingStrategy })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="median">
                      {t('steps.3.imputeMedian')}
                    </SelectItem>
                    <SelectItem value="mode">
                      {t('steps.3.imputeMode')}
                    </SelectItem>
                    <SelectItem value="remove">{t('steps.3.removeRows')}</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-2">
                  {t('steps.3.medianDesc')}
                </p>
              </CardContent>
            </Card>

            {/* Normalisation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('steps.3.normTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={prepSettings.normalizeMethod}
                  onValueChange={(v) =>
                    setPrepSettings({ normalizeMethod: v as typeof prepSettings.normalizeMethod })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zscore">{t('steps.3.zscore')}</SelectItem>
                    <SelectItem value="minmax">{t('steps.3.minmax')}</SelectItem>
                    <SelectItem value="none">{t('steps.3.none')}</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-2">
                  {t('steps.3.normDesc')}
                </p>
              </CardContent>
            </Card>

            {/* SMOTE */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('steps.3.imbalanceTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('steps.3.applySmote')}</Label>
                    <p className="text-xs text-muted-foreground max-w-[220px]">
                      {t('steps.3.smoteDesc')}
                    </p>
                  </div>
                  <Switch
                    checked={prepSettings.applySmote}
                    onCheckedChange={(checked) => setPrepSettings({ applySmote: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary + run */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('steps.3.summaryTitle')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {[
                  { label: t('steps.3.features'), value: `${columnMapping.featureColumns.length} ${t('steps.2.columns').toLowerCase()}` },
                  { label: t('steps.3.target'), value: columnMapping.targetColumn },
                  { label: t('steps.3.testSplit'), value: formatPercent(prepSettings.testSize) },
                  { label: t('steps.3.missingStrategyTitle'), value: t(`steps.3.impute${prepSettings.missingStrategy.charAt(0).toUpperCase()}${prepSettings.missingStrategy.slice(1)}`) },
                  { label: t('steps.3.normTitle'), value: t(`steps.3.${prepSettings.normalizeMethod}`) },
                  { label: 'SMOTE', value: prepSettings.applySmote ? t('steps.3.yes') : t('steps.3.no') },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-1 border-b border-border-subtle last:border-0">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium text-brand-navy">{value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {prepError && (
              <Banner variant="error" title={t('steps.3.prepFailed')} message={prepError} />
            )}

            {processedDataset && (
              <Banner
                variant="success"
                title={t('steps.3.prepComplete')}
                message={t('steps.3.prepCompleteMsg').replace('{train}', processedDataset.nTrain.toString()).replace('{test}', processedDataset.nTest.toString())}
              />
            )}

            <Button
              variant="teal"
              size="lg"
              className="w-full"
              onClick={handleRunPreprocessing}
              loading={isPreparing}
              disabled={isPreparing}
            >
              {isPreparing ? (
                t('steps.3.running')
              ) : processedDataset ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  {t('steps.3.rerun')}
                </>
              ) : (
                <>
                  {t('steps.3.run')}
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>

            {processedDataset && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setCurrentStep(4)}
              >
                {t('steps.3.continue')}
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
