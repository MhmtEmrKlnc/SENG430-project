import React, { useState } from 'react';
import { Check, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';
import StepHeader from '../components/StepHeader';
import api from '../api';

export default function Step3DataPreparation({ onNext, onPrevious }) {
  const [split, setSplit] = useState(80);
  const [missingStrategy, setMissingStrategy] = useState('median');
  const [normalizationMethod, setNormalizationMethod] = useState('zscore');
  const [smoteEnabled, setSmoteEnabled] = useState('true');

  const [isApplied, setIsApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState(null);
  const [chartsData, setChartsData] = useState(null);

  const handleApply = async () => {
    try {
      setApplying(true);
      setError(null);
      const res = await api.post('/projects/1/step3/apply/', {
        missing_strategy: missingStrategy,
        normalization_method: normalizationMethod,
        train_ratio: split,
        smote_enabled: smoteEnabled === 'true'
      });
      setChartsData(res.data.charts);
      setIsApplied(true);
    } catch (err) {
      console.error("Error applying preparation settings:", err);
      setError(err.response?.data?.blocked_banner?.message || err.response?.data?.error || "Failed to apply settings.");
      setIsApplied(false);
    } finally {
      setApplying(false);
    }
  };

  // Helper function to calculate total and percentages for class balance
  const calculateClassBalance = (data) => {
    if (!data) return [];
    const total = data.reduce((sum, item) => sum + item.count, 0);
    return data.map(item => ({
      ...item,
      percentage: total > 0 ? Math.round((item.count / total) * 100) : 0
    }));
  };

  const cbbData = calculateClassBalance(chartsData?.class_balance_before);
  const cbaData = calculateClassBalance(chartsData?.class_balance_after);

  return (
    <div className="step-container">
      <StepHeader
        stepNum={3}
        title="Data Preparation — Cleaning & Organising Your Data"
        description="Before a model can learn, the data must be clean, consistent, and split into two groups: one for training (learning) and one for testing (checking accuracy on patients the model has never seen)."
        onNext={onNext}
        onPrevious={onPrevious}
      />

      <div className="page-grid">
        {/* Left Sidebar */}
        <div>
          <div className="sidebar-section">
            <h3 className="sidebar-title">Preparation Settings</h3>

            {/* Train/Test Split */}
            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Train / Test Split</label>
                <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{split}%</span>
              </div>
              <div className="range-slider-container">
                <input
                  type="range"
                  min="60"
                  max="90"
                  step="5"
                  value={split}
                  onChange={(e) => setSplit(parseInt(e.target.value))}
                  className="range-input"
                />
                <div className="range-labels">
                  <span>60% train</span>
                  <span>90% train</span>
                </div>
              </div>
              <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', marginBottom: 0 }}>
                Training: {Math.round(304 * (split / 100))} patients &middot; Testing: {304 - Math.round(304 * (split / 100))} patients
              </p>
              <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', marginBottom: 0 }}>
                The model learns from the training group and is tested on the testing group — patients it has never seen before.
              </p>
            </div>

            {/* Handling Missing Values */}
            <div className="form-group">
              <label className="form-label">Handling Missing Values</label>
              <select className="form-select" value={missingStrategy} onChange={e => setMissingStrategy(e.target.value)}>
                <option value="median">Fill with the middle value (median) — recommended</option>
                <option value="mode">Fill with the most common value (mode)</option>
                <option value="remove">Remove patients with missing data</option>
              </select>
              <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', marginBottom: '0' }}>Serum Creatinine has 6.8% missing. Filling with the median preserves all 304 patients.</p>
            </div>

            {/* Normalisation */}
            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label className="form-label">Normalisation (Putting All Values on the Same Scale)</label>
              <select className="form-select" value={normalizationMethod} onChange={e => setNormalizationMethod(e.target.value)}>
                <option value="zscore">Z-score (recommended for most models)</option>
                <option value="minmax">Min-max (scale between 0 and 1)</option>
                <option value="none">None (keep original scale)</option>
              </select>
              <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', marginBottom: '0' }}>Age (0–100) and Serum Sodium (130–150 mmol/L) are on different scales. Without normalisation, some models get confused by the size difference.</p>
            </div>

            {/* Class Imbalance */}
            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label className="form-label">Handling Class Imbalance (More Non-Readmitted Than Readmitted)</label>
              <select className="form-select" value={smoteEnabled} onChange={e => setSmoteEnabled(e.target.value)}>
                <option value="true">SMOTE — Create synthetic similar cases for training</option>
                <option value="false">None — use data as-is</option>
              </select>
              <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', marginBottom: '0' }}>Because only 33% were readmitted, SMOTE creates extra examples of readmitted patients so the model learns both groups equally well.</p>
            </div>

            {error && (
              <div className="alert alert-danger" style={{ marginTop: '1.5rem', fontSize: '0.875rem' }}>
                <AlertTriangle className="alert-icon" size={16} />
                <div>{error}</div>
              </div>
            )}

            <button
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '1.5rem', backgroundColor: '#059669' }}
              onClick={handleApply}
              disabled={applying}
            >
              {applying ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
              {applying ? 'Applying...' : 'Apply Preparation Settings'}
            </button>

          </div>
        </div>

        {/* Right Content */}
        <div style={{ opacity: isApplied ? 1 : 0.4, transition: 'opacity 0.3s', pointerEvents: isApplied ? 'auto' : 'none' }}>
          <div className="output-table-container">
            <h3 className="sidebar-title">Before & After Normalisation (Feature Averages)</h3>

            <div className="compare-row">
              {/* Before Normalisation */}
              <div>
                <div className="compare-head">Before (Raw Values)</div>
                {chartsData?.normalization_before?.map((item, idx) => (
                  <div className="progress-bar-container" key={`before-${idx}`}>
                    <div className="progress-header" style={{ fontSize: '0.75rem' }}>
                      <span>{item.feature}</span>
                      <strong>{item.value}</strong>
                    </div>
                  </div>
                ))}
              </div>

              {/* After Normalisation */}
              <div>
                <div className="compare-head">After Normalisation</div>
                {chartsData?.normalization_after?.map((item, idx) => (
                  <div className="progress-bar-container" key={`after-${idx}`}>
                    <div className="progress-header" style={{ fontSize: '0.75rem' }}>
                      <span>{item.feature}</span>
                      <strong>{item.value.toFixed(4)}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <hr style={{ border: 0, borderTop: '1px solid var(--color-border)', margin: '2rem 0' }} />

            <h3 className="sidebar-title">Class Balance — Before & After SMOTE</h3>

            <div className="compare-row">
              {/* Before SMOTE */}
              <div>
                <div className="compare-head">Before</div>
                {cbbData.map((item, idx) => (
                  <div className="progress-bar-container" key={idx}>
                    <div className="progress-header" style={{ fontSize: '0.75rem' }}>
                      <span>Class: {item.label}</span>
                      <strong>{item.percentage}%</strong>
                    </div>
                    <div className="progress-track">
                      <div className={`progress-fill ${idx === 1 ? 'alt' : ''}`} style={{ width: `${item.percentage}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* After SMOTE */}
              <div>
                <div className="compare-head">After</div>
                {cbaData.map((item, idx) => (
                  <div className="progress-bar-container" key={idx}>
                    <div className="progress-header" style={{ fontSize: '0.75rem' }}>
                      <span>Class: {item.label}</span>
                      <strong>{item.percentage}%</strong>
                    </div>
                    <div className="progress-track">
                      <div className={`progress-fill ${idx === 1 ? 'alt' : ''}`} style={{ width: `${item.percentage}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {isApplied && (
              <div className="alert alert-success" style={{ marginTop: '1.5rem' }}>
                <CheckCircle2 className="alert-icon" size={18} />
                <div>
                  <strong>Ready:</strong> Data is clean, split, and balanced. Proceed to Step 4 to choose a model.
                </div>
              </div>
            )}

          </div>

          <div style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', marginTop: '2rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--color-border)' }}>
            <span className="step-eyebrow" style={{ marginBottom: 0 }}>STEP 3 / 7 - DATA PREPARATION</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn-secondary" onClick={onPrevious}>← Previous</button>
              {isApplied ? (
                <button className="btn-primary" onClick={onNext}>Next Step →</button>
              ) : (
                <button className="btn-primary" style={{ opacity: 0.5, cursor: 'not-allowed' }}>Next Step →</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
