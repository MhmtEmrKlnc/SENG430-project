'use client'

import * as React from 'react'
import {
  Scale,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Download,
  RefreshCw,
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { getDomainById } from '@/lib/domains'
import { analysisBias, downloadCertificate } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Banner } from '@/components/shared/Banner'
import { Progress } from '@/components/ui/progress'
import { formatPercent, downloadBase64PDF } from '@/lib/utils'
import type { ChecklistItem } from '@/lib/types'

export function Step7Ethics() {
  const {
    selectedDomainId,
    activeResults,
    processedDataset,
    rawData,
    biasData,
    isAnalysingBias,
    checklistItems,
    setBiasData,
    setIsAnalysingBias,
    toggleChecklistItem,
    preCheckItem,
  } = useAppStore()

  const domain = selectedDomainId ? getDomainById(selectedDomainId) : null

  async function handleBiasAnalysis() {
    if (!activeResults || !processedDataset || !domain) return
    setIsAnalysingBias(true)
    try {
      const result = await analysisBias({
        processedDataset,
        trainResults: activeResults,
        subgroupFields: domain.subgroupFields,
        rawData,
      })
      setBiasData(result)
      preCheckItem('bias_audit')
    } catch (err) {
      console.error('Bias analysis failed:', err)
    } finally {
      setIsAnalysingBias(false)
    }
  }

  async function handleDownloadCertificate() {
    if (!domain || !activeResults) return
    try {
      const base64 = await downloadCertificate({
        domainId: domain.id,
        modelType: activeResults.modelType,
        metrics: activeResults.metrics,
        checklistItems,
        completedAt: new Date().toISOString(),
      })
      downloadBase64PDF(base64, `HEALTH-AI-Certificate-${domain.id}.pdf`)
    } catch (err) {
      console.error('Certificate download failed:', err)
    }
  }

  const checkedCount = checklistItems.filter((i) => i.checked).length
  const totalCount = checklistItems.length
  const checklistProgress = (checkedCount / totalCount) * 100

  const statusColors: Record<string, string> = {
    OK: 'text-clinical-success',
    Review: 'text-clinical-warning',
    Warning: 'text-clinical-danger',
  }

  const statusBadgeVariants: Record<string, 'success' | 'warning' | 'destructive'> = {
    OK: 'success',
    Review: 'warning',
    Warning: 'destructive',
  }

  return (
    <div className="step-container">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="teal" size="sm">Step 7</Badge>
          <span className="text-xs text-muted-foreground">Ethics & Bias</span>
        </div>
        <h1 className="step-heading">Ethics Review & Bias Audit</h1>
        <p className="step-subheading">
          Evaluate fairness across patient subgroups and complete the responsible AI deployment
          checklist.
        </p>
      </div>

      {/* Bias analysis section */}
      {activeResults && domain && domain.subgroupFields.length > 0 ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Subgroup Bias Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Subgroup analysis compares model performance across patient groups defined by:{' '}
              <strong>{domain.subgroupFields.join(', ')}</strong>. Differences in sensitivity
              or specificity &gt; 10 percentage points warrant careful review.
            </p>

            {!biasData && (
              <Button
                variant="teal"
                onClick={handleBiasAnalysis}
                loading={isAnalysingBias}
                disabled={isAnalysingBias}
              >
                {isAnalysingBias ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Analysing...</>
                ) : (
                  <><Scale className="h-4 w-4" /> Run Bias Analysis</>
                )}
              </Button>
            )}

            {biasData && (
              <>
                {biasData.hasSignificantBias ? (
                  <Banner
                    variant="warning"
                    title="Significant Bias Detected"
                    message="One or more subgroups show performance differences exceeding 10 percentage points. Review before clinical deployment."
                  />
                ) : (
                  <Banner
                    variant="success"
                    title="No Significant Bias Detected"
                    message="Subgroup performance is within acceptable thresholds (&lt;10pp difference). Continue to monitor in deployment."
                  />
                )}

                <div className="grid grid-cols-2 gap-3 mb-2">
                  <div className="rounded-lg bg-surface p-3 text-center">
                    <p className="text-xl font-bold text-brand-navy">
                      {formatPercent(biasData.overallSensitivity)}
                    </p>
                    <p className="text-xs text-muted-foreground">Overall Sensitivity</p>
                  </div>
                  <div className="rounded-lg bg-surface p-3 text-center">
                    <p className="text-xl font-bold text-brand-navy">
                      {formatPercent(biasData.overallSpecificity)}
                    </p>
                    <p className="text-xs text-muted-foreground">Overall Specificity</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border-subtle">
                        {['Subgroup', 'Group', 'N', 'Sensitivity', 'Specificity', 'Δ Sensitivity', 'Status'].map((h) => (
                          <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {biasData.subgroups.map((sg, i) => (
                        <tr key={i} className="border-b border-border-subtle">
                          <td className="px-3 py-2 font-medium text-brand-navy text-xs">{sg.name}</td>
                          <td className="px-3 py-2 text-xs">{sg.group}</td>
                          <td className="px-3 py-2 text-xs">{sg.n}</td>
                          <td className="px-3 py-2 text-xs">{formatPercent(sg.sensitivity)}</td>
                          <td className="px-3 py-2 text-xs">{formatPercent(sg.specificity)}</td>
                          <td className={`px-3 py-2 text-xs font-medium ${statusColors[sg.status] ?? ''}`}>
                            {sg.deltaSensitivity > 0 ? '+' : ''}{formatPercent(sg.deltaSensitivity)}
                          </td>
                          <td className="px-3 py-2">
                            <Badge variant={statusBadgeVariants[sg.status] ?? 'outline'} size="sm">
                              {sg.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBiasAnalysis}
                  disabled={isAnalysingBias}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Re-run Analysis
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        !activeResults && (
          <Banner
            variant="info"
            message="Train a model in Step 4 to run bias analysis."
            className="mb-6"
          />
        )
      )}

      {/* Responsible AI Checklist */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Responsible AI Deployment Checklist
            </CardTitle>
            <div className="text-right shrink-0">
              <span className="text-sm font-bold text-brand-navy">
                {checkedCount}/{totalCount}
              </span>
              <p className="text-xs text-muted-foreground">completed</p>
            </div>
          </div>
          <Progress value={checklistProgress} className="mt-3 h-2" />
        </CardHeader>
        <CardContent className="space-y-3">
          {checklistItems.map((item: ChecklistItem) => (
            <div
              key={item.id}
              className={`flex items-start gap-3 rounded-lg p-3 border transition-colors ${
                item.checked
                  ? 'border-clinical-success/30 bg-clinical-success/5'
                  : 'border-border-subtle bg-surface'
              }`}
            >
              <Checkbox
                id={`check-${item.id}`}
                checked={item.checked}
                onCheckedChange={() => toggleChecklistItem(item.id)}
                className="mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <label
                  htmlFor={`check-${item.id}`}
                  className="text-sm font-medium text-brand-navy cursor-pointer leading-tight"
                >
                  {item.label}
                  {item.preChecked && (
                    <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-brand-teal">
                      Auto
                    </span>
                  )}
                </label>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}

          <Separator className="my-4" />

          {checklistProgress < 100 && (
            <Banner
              variant="warning"
              message={`${totalCount - checkedCount} checklist item${totalCount - checkedCount !== 1 ? 's' : ''} remaining before this model should be considered for real-world deployment.`}
              icon={false}
            />
          )}

          {checklistProgress === 100 && (
            <Banner
              variant="success"
              title="Checklist Complete"
              message="All responsible AI deployment considerations have been addressed. You may now download your certificate."
            />
          )}
        </CardContent>
      </Card>

      {/* Certificate download */}
      {activeResults && (
        <div className="mt-6 flex justify-center">
          <Button
            variant="teal"
            size="xl"
            onClick={handleDownloadCertificate}
            disabled={!domain}
            className="gap-3"
          >
            <Download className="h-5 w-5" />
            Download Learning Certificate (PDF)
          </Button>
        </div>
      )}

      {/* End of journey */}
      <div className="mt-8 text-center text-xs text-muted-foreground">
        <p>
          HEALTH-AI · ML Learning Tool · Erasmus+ KA220-HED
        </p>
        <p className="mt-1">
          For educational purposes only. All datasets are synthetic and do not contain real patient
          data.
        </p>
      </div>
    </div>
  )
}
