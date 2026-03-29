'use client'

import * as React from 'react'
import { Eye, Loader2, ChevronRight, User } from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Cell,
  ReferenceLine,
} from 'recharts'
import { useAppStore } from '@/lib/store'
import { getDomainById } from '@/lib/domains'
import { explainPrediction } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Banner } from '@/components/shared/Banner'
import { formatPercent, getClassLabel } from '@/lib/utils'

export function Step6Explainability() {
  const {
    selectedDomainId,
    activeResults,
    processedDataset,
    selectedPatientIndex,
    explanationData,
    isExplaining,
    setSelectedPatientIndex,
    setExplanationData,
    setIsExplaining,
    preCheckItem,
    setCurrentStep,
  } = useAppStore()

  const domain = selectedDomainId ? getDomainById(selectedDomainId) : null

  async function handleExplain() {
    if (!activeResults || !processedDataset) return
    setIsExplaining(true)
    try {
      const data = await explainPrediction({
        processedDataset,
        trainResults: activeResults,
        patientIndex: selectedPatientIndex,
      })
      setExplanationData(data)
      preCheckItem('explanations')
    } catch (err) {
      console.error('Explanation failed:', err)
    } finally {
      setIsExplaining(false)
    }
  }

  const nTest = processedDataset?.nTest ?? 0
  const actualLabel =
    processedDataset && domain && explanationData !== null
      ? getClassLabel(domain, processedDataset.yTest[selectedPatientIndex] ?? 0)
      : null
  const predictedLabel =
    domain && explanationData !== null
      ? getClassLabel(domain, explanationData.prediction)
      : null
  const isCorrect =
    explanationData !== null &&
    processedDataset &&
    explanationData.prediction === processedDataset.yTest[selectedPatientIndex]

  if (!activeResults || !processedDataset) {
    return (
      <div className="step-container">
        <Banner
          variant="warning"
          title="No active model"
          message="Train and select a model in Step 4, then view results in Step 5 before using Explainability."
        />
      </div>
    )
  }

  return (
    <div className="step-container">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="teal" size="sm">Step 6</Badge>
          <span className="text-xs text-muted-foreground">Explainability</span>
        </div>
        <h1 className="step-heading">Why Did the Model Predict That?</h1>
        <p className="step-subheading">
          Examine which features most influenced the model's prediction for an individual patient.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient selector */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                Select Patient
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <Label>Test Patient Index</Label>
                  <span className="font-semibold text-brand-navy">
                    #{selectedPatientIndex + 1}
                  </span>
                </div>
                <Slider
                  min={0}
                  max={Math.max(0, nTest - 1)}
                  step={1}
                  value={[selectedPatientIndex]}
                  onValueChange={([v]) => setSelectedPatientIndex(v)}
                />
                <p className="text-xs text-muted-foreground">
                  Patient {selectedPatientIndex + 1} of {nTest} in test set
                </p>
              </div>

              {processedDataset && domain && (
                <div className="rounded-lg bg-surface border border-border-subtle p-3 space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Actual Outcome
                  </p>
                  <Badge variant={processedDataset.yTest[selectedPatientIndex] === 0 ? 'success' : 'warning'}>
                    {getClassLabel(domain, processedDataset.yTest[selectedPatientIndex] ?? 0)}
                  </Badge>
                </div>
              )}

              <Button
                variant="teal"
                className="w-full"
                onClick={handleExplain}
                loading={isExplaining}
                disabled={isExplaining}
              >
                <Eye className="h-4 w-4" />
                {isExplaining ? 'Explaining...' : 'Explain This Patient'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Explanation */}
        <div className="lg:col-span-2 space-y-4">
          {!explanationData && !isExplaining && (
            <div className="flex items-center justify-center min-h-[200px] rounded-xl border border-dashed border-border-subtle bg-surface">
              <div className="text-center">
                <Eye className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Select a patient and click "Explain" to see feature contributions.
                </p>
              </div>
            </div>
          )}

          {isExplaining && (
            <div className="flex items-center gap-3 p-8 rounded-xl border border-border-subtle bg-surface-card">
              <Loader2 className="h-5 w-5 animate-spin text-brand-teal" />
              <span className="text-sm text-muted-foreground">Generating explanation...</span>
            </div>
          )}

          {explanationData && !isExplaining && (
            <>
              {/* Prediction summary */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Model Prediction</p>
                      <Badge
                        variant={explanationData.prediction === 0 ? 'success' : 'warning'}
                        size="lg"
                      >
                        {predictedLabel}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">Confidence</p>
                      <span className="text-2xl font-bold text-brand-navy">
                        {formatPercent(
                          Math.max(...explanationData.probability)
                        )}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Actual Outcome</p>
                      <Badge
                        variant={actualLabel === predictedLabel ? 'success' : 'destructive'}
                        size="lg"
                      >
                        {actualLabel}
                      </Badge>
                    </div>
                    <div>
                      <Badge
                        variant={isCorrect ? 'success' : 'destructive'}
                        size="md"
                      >
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Feature contributions waterfall */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Feature Contributions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-4">
                    Bars pointing right (positive) push the prediction toward the positive class.
                    Bars pointing left (negative) push toward the negative class.
                  </p>
                  <ResponsiveContainer width="100%" height={Math.max(200, explanationData.contributions.length * 32)}>
                    <BarChart
                      data={explanationData.contributions}
                      layout="vertical"
                      margin={{ top: 5, right: 20, bottom: 5, left: 140 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis
                        type="category"
                        dataKey="label"
                        tick={{ fontSize: 11 }}
                        width={135}
                      />
                      <RechartsTooltip
                        formatter={(value: number, name: string) => [
                          value.toFixed(4),
                          'Contribution',
                        ]}
                      />
                      <ReferenceLine x={0} stroke="#94a3b8" />
                      <Bar dataKey="contribution" radius={[0, 4, 4, 0]}>
                        {explanationData.contributions.map((c, i) => (
                          <Cell
                            key={i}
                            fill={c.contribution >= 0 ? '#0D9488' : '#DC2626'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-end mt-6">
        <Button variant="teal" size="lg" onClick={() => setCurrentStep(7)}>
          Ethics & Bias Review
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
