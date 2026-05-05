'use client'

import * as React from 'react'
import { Cpu, Play, ChevronRight, CheckCircle2, Plus } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { trainModel } from '@/lib/api'
import { useTranslation } from '@/lib/i18n'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { KNNVisualisation } from './KNNVisualisation'
import { SVMVisualisation } from './SVMVisualisation'
import { DecisionTreeVisualisation } from './DecisionTreeVisualisation'
import { RandomForestVisualisation } from './RandomForestVisualisation'
import { LogisticRegressionVisualisation } from './LogisticRegressionVisualisation'
import { NaiveBayesVisualisation } from './NaiveBayesVisualisation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Banner } from '@/components/shared/Banner'
import { getModelLabel, generateId, formatPercent } from '@/lib/utils'
import type { ModelType } from '@/lib/types'

const getModelOptions = (t: any): { value: ModelType; label: string; description: string }[] => [
  {
    value: 'knn',
    label: 'K-Nearest Neighbours',
    description: t('steps.4.algo.knn.desc'),
  },
  {
    value: 'logistic_regression',
    label: 'Logistic Regression',
    description: t('steps.4.algo.lr.desc'),
  },
  {
    value: 'decision_tree',
    label: 'Decision Tree',
    description: t('steps.4.algo.dt.desc'),
  },
  {
    value: 'random_forest',
    label: 'Random Forest',
    description: t('steps.4.algo.rf.desc'),
  },
  {
    value: 'svm',
    label: 'Support Vector Machine',
    description: t('steps.4.algo.svm.desc'),
  },
  {
    value: 'naive_bayes',
    label: 'Naïve Bayes',
    description: t('steps.4.algo.nb.desc'),
  },
]

const ParamLabel = ({ label, tooltip }: { label: string; tooltip: string }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="cursor-help underline decoration-dotted underline-offset-2 transition-colors hover:text-brand-navy">
          <Label className="cursor-help">{label}</Label>
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-xs p-2">
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
)

export function Step4ModelTraining() {
  const { t } = useTranslation()
  const MODEL_OPTIONS = getModelOptions(t)
  const {
    processedDataset,
    selectedModel,
    hyperparams,
    trainedModels,
    comparisonRows,
    isTraining,
    trainingError,
    autoRetrain,
    setSelectedModel,
    updateHyperparam,
    setAutoRetrain,
    setTrainedModel,
    setIsTraining,
    setTrainingError,
    setActiveResults,
    addComparisonRow,
    setCurrentStep,
  } = useAppStore()

  async function handleTrain() {
    if (!processedDataset) return
    setIsTraining(true)
    setTrainingError(null)
    try {
      const result = await trainModel({
        processedDataset,
        modelType: selectedModel,
        hyperparams: hyperparams[selectedModel],
      })
      setTrainedModel(selectedModel, result)
      setActiveResults(result)
    } catch (err) {
      setTrainingError(err instanceof Error ? err.message : t('steps.4.training'))
    } finally {
      setIsTraining(false)
    }
  }

  React.useEffect(() => {
    if (!autoRetrain || !processedDataset || !selectedModel) return
    const timer = setTimeout(() => {
      handleTrain()
    }, 300)
    return () => clearTimeout(timer)
  }, [hyperparams[selectedModel], autoRetrain])

  function handleAddToComparison() {
    const result = trainedModels[selectedModel]
    if (!result) return
    addComparisonRow({
      id: generateId(),
      modelType: selectedModel,
      modelLabel: getModelLabel(selectedModel),
      hyperparams: hyperparams[selectedModel],
      metrics: result.metrics,
    })
  }

  const currentResult = trainedModels[selectedModel]
  const hp = hyperparams[selectedModel]

  if (!processedDataset) {
    return (
      <div className="step-container">
        <Banner
          variant="warning"
          title={t('steps.4.notPreparedTitle')}
          message={t('steps.4.notPreparedMsg')}
        />
      </div>
    )
  }

  return (
    <div className="step-container">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="teal" size="sm">{t('common.step')} 4</Badge>
          <span className="text-xs text-muted-foreground">{t('steps.4.label')}</span>
        </div>
        <h1 className="step-heading">{t('steps.4.heading')}</h1>
        <p className="step-subheading">
          {t('steps.4.subheading')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Model selector */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('steps.4.chooseAlgorithm')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-3">
              {MODEL_OPTIONS.map((opt) => {
                const trained = trainedModels[opt.value] !== null
                return (
                  <button
                    key={opt.value}
                    onClick={() => setSelectedModel(opt.value)}
                    className={`w-full text-left rounded-lg px-3 py-2.5 border transition-colors ${
                      selectedModel === opt.value
                        ? 'border-brand-navy bg-brand-navy/5'
                        : 'border-transparent hover:border-border-subtle hover:bg-surface'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-brand-navy">{opt.label}</span>
                      {trained && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-clinical-success shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-tight">
                      {opt.description}
                    </p>
                  </button>
                )
              })}
            </CardContent>
          </Card>
        </div>

        {/* Hyperparameters + train */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Cpu className="h-4 w-4" />
                {t('steps.4.hyperparameters')} — {getModelLabel(selectedModel)}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Label htmlFor="auto-retrain" className="text-xs font-normal text-muted-foreground mr-1">{t('steps.4.autoRetrain')}</Label>
                <Switch 
                  id="auto-retrain" 
                  checked={autoRetrain} 
                  onCheckedChange={setAutoRetrain} 
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedModel === 'knn' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <ParamLabel label={t('steps.4.hp.knn.k')} tooltip={t('steps.4.hp.knn.k_tip')} />
                        <span className="font-semibold">{(hp as { k: number }).k}</span>
                      </div>
                      <Slider
                        min={1} max={20} step={2}
                        value={[(hp as { k: number }).k]}
                        onValueChange={([v]) => updateHyperparam('knn', 'k', v)}
                      />
                    </div>
                    <div className="space-y-2">
                      <ParamLabel label={t('steps.4.hp.knn.distance')} tooltip={t('steps.4.hp.knn.distance_tip')} />
                      <Select
                        value={(hp as { distance: string }).distance}
                        onValueChange={(v) => updateHyperparam('knn', 'distance', v)}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="euclidean">{t('steps.4.hp.knn.euclidean')}</SelectItem>
                          <SelectItem value="manhattan">{t('steps.4.hp.knn.manhattan')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-center items-center pt-4">
                    <KNNVisualisation k={(hp as { k: number }).k} />
                  </div>
                </div>
              )}

              {selectedModel === 'svm' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <ParamLabel label={t('steps.4.hp.svm.kernel')} tooltip={t('steps.4.hp.svm.kernel_tip')} />
                      <Select
                        value={(hp as { kernel: string }).kernel}
                        onValueChange={(v) => updateHyperparam('svm', 'kernel', v)}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rbf">{t('steps.4.hp.svm.rbf')}</SelectItem>
                          <SelectItem value="linear">{t('steps.4.hp.svm.linear')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <ParamLabel label={t('steps.4.hp.svm.c')} tooltip={t('steps.4.hp.svm.c_tip')} />
                        <span className="font-semibold">{(hp as { C: number }).C}</span>
                      </div>
                      <Slider
                        min={1} max={100} step={1}
                        value={[(hp as { C: number }).C]}
                        onValueChange={([v]) => updateHyperparam('svm', 'C', v)}
                      />
                    </div>
                  </div>
                  <div className="flex justify-center items-center pt-4">
                    <SVMVisualisation kernel={(hp as { kernel: string }).kernel} C={(hp as { C: number }).C} />
                  </div>
                </div>
              )}

              {selectedModel === 'decision_tree' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <ParamLabel label={t('steps.4.hp.dt.maxDepth')} tooltip={t('steps.4.hp.dt.maxDepth_tip')} />
                        <span className="font-semibold">{(hp as { maxDepth: number }).maxDepth}</span>
                      </div>
                      <Slider
                        min={1} max={20} step={1}
                        value={[(hp as { maxDepth: number }).maxDepth]}
                        onValueChange={([v]) => updateHyperparam('decision_tree', 'maxDepth', v)}
                      />
                    </div>
                  </div>
                  <div className="flex justify-center items-center pt-4">
                    <DecisionTreeVisualisation maxDepth={(hp as { maxDepth: number }).maxDepth} />
                  </div>
                </div>
              )}

              {selectedModel === 'random_forest' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <ParamLabel label={t('steps.4.hp.rf.nTrees')} tooltip={t('steps.4.hp.rf.nTrees_tip')} />
                        <span className="font-semibold">{(hp as { nTrees: number }).nTrees}</span>
                      </div>
                      <Slider
                        min={10} max={200} step={10}
                        value={[(hp as { nTrees: number }).nTrees]}
                        onValueChange={([v]) => updateHyperparam('random_forest', 'nTrees', v)}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <ParamLabel label={t('steps.4.hp.rf.maxDepth')} tooltip={t('steps.4.hp.rf.maxDepth_tip')} />
                        <span className="font-semibold">{(hp as { maxDepth: number }).maxDepth}</span>
                      </div>
                      <Slider
                        min={1} max={20} step={1}
                        value={[(hp as { maxDepth: number }).maxDepth]}
                        onValueChange={([v]) => updateHyperparam('random_forest', 'maxDepth', v)}
                      />
                    </div>
                  </div>
                  <div className="flex justify-center items-center pt-4">
                    <RandomForestVisualisation nTrees={(hp as { nTrees: number }).nTrees} maxDepth={(hp as { maxDepth: number }).maxDepth} />
                  </div>
                </div>
              )}

              {selectedModel === 'logistic_regression' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <ParamLabel label={t('steps.4.hp.lr.c')} tooltip={t('steps.4.hp.lr.c_tip')} />
                        <span className="font-semibold">{(hp as { C: number }).C}</span>
                      </div>
                      <Slider
                        min={1} max={100} step={1}
                        value={[(hp as { C: number }).C]}
                        onValueChange={([v]) => updateHyperparam('logistic_regression', 'C', v)}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <ParamLabel label={t('steps.4.hp.lr.maxIter')} tooltip={t('steps.4.hp.lr.maxIter_tip')} />
                        <span className="font-semibold">{(hp as { maxIter: number }).maxIter}</span>
                      </div>
                      <Slider
                        min={50} max={500} step={50}
                        value={[(hp as { maxIter: number }).maxIter]}
                        onValueChange={([v]) =>
                          updateHyperparam('logistic_regression', 'maxIter', v)
                        }
                      />
                    </div>
                  </div>
                  <div className="flex justify-center items-center pt-4">
                    <LogisticRegressionVisualisation C={(hp as { C: number }).C} maxIter={(hp as { maxIter: number }).maxIter} />
                  </div>
                </div>
              )}

              {selectedModel === 'naive_bayes' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4 flex flex-col justify-center h-full">
                    <p className="text-sm text-muted-foreground">
                      {t('steps.4.hp.nb.desc')}
                    </p>
                  </div>
                  <div className="flex justify-center items-center pt-4">
                    <NaiveBayesVisualisation />
                  </div>
                </div>
              )}

              {trainingError && (
                <Banner variant="error" title={t('steps.4.trainingError')} message={trainingError} />
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  variant="teal"
                  className="flex-1"
                  onClick={handleTrain}
                  loading={isTraining}
                  disabled={isTraining}
                >
                  <Play className="h-4 w-4" />
                  {isTraining ? t('steps.4.training') : t('steps.4.trainModel')}
                </Button>
                {currentResult && (
                  <Button variant="outline" onClick={handleAddToComparison}>
                    <Plus className="h-4 w-4" />
                    {t('steps.4.compare')}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick results preview */}
          {currentResult && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-clinical-success" />
                  {t('steps.4.trainingComplete')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: t('steps.4.accuracy'), value: currentResult.metrics.accuracy },
                    { label: t('steps.4.sensitivity'), value: currentResult.metrics.sensitivity },
                    { label: t('steps.4.auc'), value: currentResult.metrics.auc },
                  ].map(({ label, value }) => (
                    <div key={label} className="text-center rounded-lg bg-surface p-3">
                      <p className="text-2xl font-bold text-brand-navy">
                        {formatPercent(value)}
                      </p>
                      <p className="text-xs text-muted-foreground">{label}</p>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setCurrentStep(5)}
                >
                  {t('steps.4.viewFullResults')}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Comparison table */}
          {comparisonRows.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('steps.4.modelComparison')}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border-subtle">
                        {[t('steps.4.model'), t('steps.4.accuracy'), t('steps.4.sensitivity'), t('steps.4.specificity'), t('steps.4.auc')].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonRows.map((row) => (
                        <tr key={row.id} className="border-b border-border-subtle">
                          <td className="px-4 py-2 font-medium text-brand-navy text-xs">
                            {row.modelLabel}
                          </td>
                          <td className="px-4 py-2 text-xs">{formatPercent(row.metrics.accuracy)}</td>
                          <td className="px-4 py-2 text-xs">{formatPercent(row.metrics.sensitivity)}</td>
                          <td className="px-4 py-2 text-xs">{formatPercent(row.metrics.specificity)}</td>
                          <td className="px-4 py-2 text-xs">{formatPercent(row.metrics.auc)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
