import React, { useState } from 'react';
import { Check, CheckCircle2 } from 'lucide-react';
import StepHeader from '../components/StepHeader';

export default function Step3DataPreparation({ onNext, onPrevious }) {
  const [split, setSplit] = useState(80);
  const [isApplied, setIsApplied] = useState(false);

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
            <div className="form-group" style={{marginBottom: '2rem'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
                <label className="form-label" style={{marginBottom: 0}}>Train / Test Split</label>
                <span style={{fontWeight: 600, color: 'var(--color-primary)'}}>{split}%</span>
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
              <p style={{fontSize: '0.75rem', marginTop: '0.5rem', marginBottom: 0}}>
                Training: {Math.round(304 * (split/100))} patients &middot; Testing: {304 - Math.round(304 * (split/100))} patients
              </p>
              <p style={{fontSize: '0.75rem', marginTop: '0.5rem', marginBottom: 0}}>
                The model learns from the training group and is tested on the testing group — patients it has never seen before.
              </p>
            </div>
            
            {/* Handling Missing Values */}
            <div className="form-group">
              <label className="form-label">Handling Missing Values</label>
              <select className="form-select">
                <option>Fill with the middle value (median) — recommended</option>
              </select>
              <p style={{fontSize: '0.75rem', marginTop: '0.5rem', marginBottom: '0'}}>Serum Creatinine has 6.8% missing. Filling with the median preserves all 304 patients.</p>
            </div>
            
            {/* Normalisation */}
            <div className="form-group" style={{marginTop: '1.5rem'}}>
              <label className="form-label">Normalisation (Putting All Values on the Same Scale)</label>
              <select className="form-select">
                <option>Z-score (recommended for most models)</option>
              </select>
              <p style={{fontSize: '0.75rem', marginTop: '0.5rem', marginBottom: '0'}}>Age (0–100) and Serum Sodium (130–150 mmol/L) are on different scales. Without normalisation, some models get confused by the size difference.</p>
            </div>
            
            {/* Class Imbalance */}
            <div className="form-group" style={{marginTop: '1.5rem'}}>
              <label className="form-label">Handling Class Imbalance (More Non-Readmitted Than Readmitted)</label>
              <select className="form-select">
                <option>SMOTE — Create synthetic similar cases for training</option>
              </select>
              <p style={{fontSize: '0.75rem', marginTop: '0.5rem', marginBottom: '0'}}>Because only 33% were readmitted, SMOTE creates extra examples of readmitted patients so the model learns both groups equally well.</p>
            </div>
            
            <button 
              className="btn-primary" 
              style={{width: '100%', justifyContent: 'center', marginTop: '1.5rem', backgroundColor: '#059669'}}
              onClick={() => setIsApplied(true)}
            >
              <Check size={16} /> Apply Preparation Settings
            </button>
            
          </div>
        </div>
        
        {/* Right Content */}
        <div style={{opacity: isApplied ? 1 : 0.4, transition: 'opacity 0.3s', pointerEvents: isApplied ? 'auto' : 'none'}}>
          <div className="output-table-container">
            <h3 className="sidebar-title">Before & After Normalisation — Ejection Fraction</h3>
            
            <div className="compare-row">
              {/* Before Normalisation */}
              <div>
                <div className="compare-head">Before (Raw Values)</div>
                <div className="progress-bar-container">
                  <div className="progress-header" style={{fontSize: '0.75rem'}}><span>Minimum</span><strong>14%</strong></div>
                  <div className="progress-track" style={{backgroundColor: 'transparent', display: 'flex'}}>
                    <div style={{width: '14%', backgroundColor: '#EF4444', height: '100%', borderRadius: '4px'}}></div>
                    <div style={{flex: 1, backgroundColor: '#F1F5F9', marginLeft: '4px', borderRadius: '4px'}}></div>
                  </div>
                </div>
                <div className="progress-bar-container">
                  <div className="progress-header" style={{fontSize: '0.75rem'}}><span>Average</span><strong>38%</strong></div>
                  <div className="progress-track" style={{backgroundColor: 'transparent', display: 'flex'}}>
                    <div style={{width: '38%', backgroundColor: '#3B82F6', height: '100%', borderRadius: '4px'}}></div>
                    <div style={{flex: 1, backgroundColor: '#F1F5F9', marginLeft: '4px', borderRadius: '4px'}}></div>
                  </div>
                </div>
                <div className="progress-bar-container">
                  <div className="progress-header" style={{fontSize: '0.75rem'}}><span>Maximum</span><strong>80%</strong></div>
                  <div className="progress-track" style={{backgroundColor: 'transparent', display: 'flex'}}>
                    <div style={{width: '80%', backgroundColor: '#10B981', height: '100%', borderRadius: '4px'}}></div>
                    <div style={{flex: 1, backgroundColor: '#F1F5F9', marginLeft: '4px', borderRadius: '4px'}}></div>
                  </div>
                </div>
              </div>
              
              {/* After Normalisation */}
              <div>
                <div className="compare-head">After (Normalised 0-1)</div>
                <div className="progress-bar-container">
                  <div className="progress-header" style={{fontSize: '0.75rem'}}><span>Minimum</span><strong>0.00</strong></div>
                  <div className="progress-track" style={{backgroundColor: 'transparent', display: 'flex'}}>
                    <div style={{width: '0%', backgroundColor: '#EF4444', height: '100%', borderRadius: '4px'}}></div>
                    <div style={{flex: 1, backgroundColor: '#F1F5F9', marginLeft: '4px', borderRadius: '4px'}}></div>
                  </div>
                </div>
                <div className="progress-bar-container">
                  <div className="progress-header" style={{fontSize: '0.75rem'}}><span>Average</span><strong>0.50</strong></div>
                  <div className="progress-track" style={{backgroundColor: 'transparent', display: 'flex'}}>
                    <div style={{width: '50%', backgroundColor: '#3B82F6', height: '100%', borderRadius: '4px'}}></div>
                    <div style={{flex: 1, backgroundColor: '#F1F5F9', marginLeft: '4px', borderRadius: '4px'}}></div>
                  </div>
                </div>
                <div className="progress-bar-container">
                  <div className="progress-header" style={{fontSize: '0.75rem'}}><span>Maximum</span><strong>1.00</strong></div>
                  <div className="progress-track" style={{backgroundColor: 'transparent', display: 'flex'}}>
                    <div style={{width: '100%', backgroundColor: '#10B981', height: '100%', borderRadius: '4px'}}></div>
                    <div style={{flex: 1, backgroundColor: '#F1F5F9', marginLeft: '4px', borderRadius: '4px'}}></div>
                  </div>
                </div>
              </div>
            </div>
            
            <hr style={{border: 0, borderTop: '1px solid var(--color-border)', margin: '2rem 0'}} />
            
            <h3 className="sidebar-title">Class Balance — Before & After SMOTE</h3>
            
            <div className="compare-row">
              {/* Before SMOTE */}
              <div>
                <div className="compare-head">Before</div>
                <div className="progress-bar-container">
                  <div className="progress-header" style={{fontSize: '0.75rem'}}><span>Not Readmitted</span><strong>67%</strong></div>
                  <div className="progress-track"><div className="progress-fill" style={{width: '67%'}}></div></div>
                </div>
                <div className="progress-bar-container">
                  <div className="progress-header" style={{fontSize: '0.75rem'}}><span>Readmitted</span><strong>33%</strong></div>
                  <div className="progress-track"><div className="progress-fill alt" style={{width: '33%'}}></div></div>
                </div>
              </div>
              
              {/* After SMOTE */}
              <div>
                <div className="compare-head">After SMOTE</div>
                <div className="progress-bar-container">
                  <div className="progress-header" style={{fontSize: '0.75rem'}}><span>Not Readmitted</span><strong>50%</strong></div>
                  <div className="progress-track"><div className="progress-fill" style={{width: '50%'}}></div></div>
                </div>
                <div className="progress-bar-container">
                  <div className="progress-header" style={{fontSize: '0.75rem'}}><span>Readmitted</span><strong>50%</strong></div>
                  <div className="progress-track"><div className="progress-fill alt" style={{width: '50%'}}></div></div>
                </div>
              </div>
            </div>
            
            {isApplied && (
              <div className="alert alert-success" style={{marginTop: '1.5rem'}}>
                <CheckCircle2 className="alert-icon" size={18} />
                <div>
                  <strong>Ready:</strong> Data is clean, split, and balanced. Proceed to Step 4 to choose a model.
                </div>
              </div>
            )}
            
          </div>
          
          <div style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', marginTop: '2rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--color-border)' }}>
             <span className="step-eyebrow" style={{marginBottom: 0}}>STEP 3 / 7 - DATA PREPARATION</span>
             <div style={{display: 'flex', gap: '0.5rem'}}>
               <button className="btn-secondary" onClick={onPrevious}>← Previous</button>
               {isApplied ? (
                 <button className="btn-primary" onClick={onNext}>Next Step →</button>
               ) : (
                 <button className="btn-primary" style={{opacity: 0.5, cursor: 'not-allowed'}}>Next Step →</button>
               )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
