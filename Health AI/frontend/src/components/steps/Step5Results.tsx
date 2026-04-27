'use client'

import * as React from 'react'
import {
  BarChart2,
  ChevronRight,
  TrendingUp,
} from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  Cell,
  ReferenceLine,
} from 'recharts'
import { useAppStore } from '@/lib/store'
import { getDomainById } from '@/lib/domains'
import { useTranslation } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MetricCard } from '@/components/shared/MetricCard'
import { Banner } from '@/components/shared/Banner'
import { getMetricStatus, formatPercent, getModelLabel } from '@/lib/utils'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

// Removed METRIC_DESCRIPTIONS here as it is now in locale files

export function Step5Results() {
  const { t } = useTranslation()
  const {
    selectedDomainId,
    activeResults,
    setCurrentStep,
  } = useAppStore()

  const domain = selectedDomainId ? getDomainById(selectedDomainId) : null

  if (!activeResults) {
    return (
      <div className="step-container">
        <Banner
          variant="warning"
          title={t('steps.5.noModelTitle')}
          message={t('steps.5.noModelMsg')}
        />
      </div>
    )
  }

  const { metrics, confusionMatrix, rocCurve, featureImportance, modelType } = activeResults

  // ROC chart data
  const rocData = rocCurve.fpr.map((fpr, i) => ({
    fpr,
    tpr: rocCurve.tpr[i],
  }))

  // Feature importance chart (top 10)
  const topFeatures = [...featureImportance]
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 10)

  return (
    <div className="step-container">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="teal" size="sm">{t('common.step')} 5</Badge>
          <span className="text-xs text-muted-foreground">{t('steps.5.label')}</span>
        </div>
        <h1 className="step-heading">{t('steps.5.heading')}</h1>
        <p className="step-subheading">
          {t('steps.5.subheading').replace('{model}', getModelLabel(modelType))}
        </p>
      </div>

      {/* Clinical sense-check banner */}
      {domain?.clinicalSenseCheck && (
        <Banner
          variant="info"
          title={t('steps.5.clinicalSenseCheck')}
          message={domain.clinicalSenseCheck}
          className="mb-6"
        />
      )}

      {/* Low Sensitivity Warning Banner */}
      {metrics.sensitivity < 0.5 && (
        <Banner
          variant="error"
          title={t('steps.5.lowSensitivityTitle')}
          message={t('steps.5.lowSensitivityMsg').replace('{percent}', formatPercent(metrics.sensitivity))}
          className="mb-6"
        />
      )}

      {/* Metrics grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        {(
          [
            ['sensitivity', true],
            ['specificity', false],
            ['auc', false],
            ['accuracy', false],
            ['precision', false],
            ['f1', false],
          ] as [string, boolean][]
        ).map(([key, emphasized]) => (
          <MetricCard
            key={key}
            label={t(`steps.5.metrics.${key}.label`)}
            value={metrics[key as keyof typeof metrics]}
            description={t(`steps.5.metrics.${key}.desc`)}
            concern={t(`steps.5.metrics.${key}.concern`)}
            status={getMetricStatus(key, metrics[key as keyof typeof metrics])}
            emphasized={emphasized}
          />
        ))}
      </div>

      {/* Tabs: Confusion Matrix, ROC Curve, Feature Importance */}
      <Tabs defaultValue="confusion">
        <TabsList className="mb-4">
          <TabsTrigger value="confusion">{t('steps.5.confusionMatrix')}</TabsTrigger>
          <TabsTrigger value="roc">{t('steps.5.rocCurve')}</TabsTrigger>
          <TabsTrigger value="features">{t('steps.5.featureImportance')}</TabsTrigger>
        </TabsList>

        <TabsContent value="confusion">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('steps.5.confusionMatrix')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <div className="text-xs text-muted-foreground">{t('steps.5.predicted')} →</div>
                <div className="overflow-x-auto">
                  <table className="border-collapse text-center">
                    <thead>
                      <tr>
                        <th className="p-3 text-xs font-semibold text-muted-foreground" />
                        {(domain?.classLabels ?? confusionMatrix[0].map((_, i) => `Class ${i}`)).map(
                          (label) => (
                            <th
                              key={label}
                              className="p-3 text-xs font-semibold text-brand-navy bg-surface border border-border-subtle"
                            >
                              {t('steps.5.predicted')}<br />{label}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {confusionMatrix.map((row, ri) => {
                        const actualLabel =
                          domain?.classLabels[ri] ?? `Class ${ri}`
                        return (
                          <tr key={ri}>
                            <th className="p-3 text-xs font-semibold text-brand-navy bg-surface border border-border-subtle whitespace-nowrap">
                              {t('steps.5.actual')}<br />{actualLabel}
                            </th>
                            {row.map((val, ci) => {
                              const isDiagonal = ri === ci
                              return (
                                <td
                                  key={ci}
                                  className={`p-4 border border-border-subtle text-sm font-bold ${
                                    isDiagonal
                                      ? 'bg-clinical-success/15 text-clinical-success'
                                      : 'bg-clinical-danger/10 text-clinical-danger'
                                  }`}
                                >
                                  {val}
                                </td>
                              )
                            })}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground text-center max-w-md">
                  {t('steps.5.matrixDesc')}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roc">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                {t('steps.5.aucTitle').replace('{auc}', formatPercent(metrics.auc))}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={rocData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis
                      dataKey="fpr"
                      label={{ value: t('steps.5.fpr'), position: 'insideBottom', offset: -5 }}
                      tickFormatter={(v) => `${Math.round(v * 100)}%`}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      label={{
                        value: t('steps.5.tpr'),
                        angle: -90,
                        position: 'insideLeft',
                        offset: 10,
                      }}
                      tickFormatter={(v) => `${Math.round(v * 100)}%`}
                      tick={{ fontSize: 11 }}
                    />
                    <RechartsTooltip
                      formatter={(value: number) => [formatPercent(value), '']}
                      labelFormatter={(v) => `${t('steps.5.fpr')}: ${formatPercent(Number(v))}`}
                    />
                  <ReferenceLine
                    x={0}
                    y={0}
                    stroke="#94a3b8"
                    strokeDasharray="4 4"
                    label=""
                  />
                  <Line
                    type="monotone"
                    dataKey="tpr"
                    stroke="#0D9488"
                    strokeWidth={2.5}
                    dot={false}
                    name="ROC"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart2 className="h-4 w-4" />
                {t('steps.5.top10Features')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topFeatures.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t('steps.5.noFeatures')}
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={topFeatures}
                    layout="vertical"
                    margin={{ top: 5, right: 20, bottom: 5, left: 120 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis
                      type="number"
                      tickFormatter={(v) => v.toFixed(3)}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      type="category"
                      dataKey="feature"
                      tick={{ fontSize: 11 }}
                      width={115}
                    />
                    <RechartsTooltip
                      formatter={(value: number) => [value.toFixed(4), t('steps.5.featureImportance')]}
                    />
                    <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                      {topFeatures.map((_, i) => (
                        <Cell
                          key={i}
                          fill={i === 0 ? '#1B3A6B' : i < 3 ? '#2563EB' : '#0D9488'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Navigation */}
      <div className="flex justify-end mt-6">
        <Button variant="teal" size="lg" onClick={() => setCurrentStep(6)}>
          {t('steps.5.continue')}
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
