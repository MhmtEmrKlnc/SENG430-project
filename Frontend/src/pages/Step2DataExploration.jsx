import React, { useState } from 'react';
import { AlertTriangle, Database, Lock, CheckCircle2, ChevronRight, LayoutGrid } from 'lucide-react';
import StepHeader from '../components/StepHeader';
import ColumnMapperModal from '../components/ColumnMapperModal';

const measurements = [
  { name: 'Ejection Fraction (%)', type: 'Number', missing: '0%', action: 'Ready', status: 'success' },
  { name: 'Serum Creatinine', type: 'Number', missing: '6.8%', action: 'Fill Missing Values', status: 'warning' },
  { name: 'Age (years)', type: 'Number', missing: '0%', action: 'Ready', status: 'success' },
  { name: 'Sex', type: 'Category', missing: '0%', action: 'Ready', status: 'success' },
  { name: 'Smoking Status', type: 'Category', missing: '0.3%', action: 'Ready', status: 'success' },
  { name: 'Patient ID', type: 'Identifier', missing: '0%', action: 'Exclude - Not a clinical measurement', status: 'danger' },
];

export default function Step2DataExploration({ onNext, onPrevious }) {
  const [dataSource, setDataSource] = useState('default');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMapped, setIsMapped] = useState(false);

  return (
    <div className="step-container">
      <StepHeader 
        stepNum={2}
        title="Data Exploration — Understanding Your Patient Dataset"
        description="Before training any model, we examine what data is available. Use the default dataset or upload your own CSV file of de-identified patient records."
        onNext={onNext}
        onPrevious={onPrevious}
      />
      
      {dataSource === 'csv' && (
        <div className="alert alert-info" style={{margin: '1.5rem 1.5rem 0'}}>
          <Lock className="alert-icon" size={18} style={{color: '#3B82F6'}} />
          <div>
            <strong style={{color: '#1D4ED8'}}>Your data is private</strong><br/>
            If you upload your own file, it is used only within your current browser session and is never saved to any server or shared with anyone. The privacy notice is displayed on every screen.
          </div>
        </div>
      )}

      <div className="page-grid">
        {/* Left Sidebar */}
        <div>
          <div className="sidebar-section">
            <h3 className="sidebar-title">Data Source</h3>
            <div style={{display: 'flex', gap: '0.5rem', marginBottom: '1.5rem'}}>
              <button 
                className={`btn-outline ${dataSource === 'default' ? 'active' : ''}`}
                style={{flex: 1}}
                onClick={() => setDataSource('default')}
              >
                Use Default Dataset
              </button>
              <button 
                className={`btn-outline ${dataSource === 'csv' ? 'active' : ''}`}
                style={{flex: 1}}
                onClick={() => setDataSource('csv')}
              >
                Upload Your CSV
              </button>
            </div>
            
            <div className="form-group">
              <label className="form-label">Target Column (What We Want to Predict)</label>
              <select className="form-select">
                <option>Readmitted within 30 days (Yes / No)</option>
              </select>
              <p style={{fontSize: '0.75rem', marginTop: '0.5rem', marginBottom: '1rem'}}>This is the outcome the model will learn to predict.</p>
            </div>
            
            <button 
              className="btn-secondary" 
              style={{width: '100%', justifyContent: 'center', marginBottom: '1rem', color: '#B45309', borderColor: '#FDE68A', backgroundColor: '#FFFBEB'}}
              onClick={() => setIsModalOpen(true)}
            >
              <LayoutGrid size={16} /> Open Column Mapper & Validate
            </button>
            
            {!isMapped && (
              <div className="alert alert-warning" style={{fontSize: '0.75rem', padding: '0.75rem'}}>
                <AlertTriangle className="alert-icon" size={14} />
                <div><strong>Action needed:</strong> Open the Column Mapper to confirm your data structure before continuing to Step 3.</div>
              </div>
            )}
            {isMapped && (
              <div className="alert alert-success" style={{fontSize: '0.75rem', padding: '0.75rem'}}>
                <CheckCircle2 className="alert-icon" size={14} />
                <div><strong>Ready:</strong> Columns mapped successfully.</div>
              </div>
            )}
          </div>
          
          <div className="sidebar-section">
            <h3 className="sidebar-title">Dataset Summary</h3>
            <div className="stat-cards">
              <div className="stat-card">
                <div className="stat-value">304</div>
                <div className="stat-label">Patients</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">12</div>
                <div className="stat-label">Measurements</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{color: '#D97706'}}>6.8%</div>
                <div className="stat-label">Missing Data</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Content */}
        <div>
          <div className="output-table-container">
            <h3 className="sidebar-title">Class Balance — How many readmitted vs. not?</h3>
            
            <div className="progress-bar-container">
              <div className="progress-header">
                <span>Not Readmitted (0)</span>
                <strong>67%</strong>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{width: '67%'}}></div>
              </div>
            </div>
            
            <div className="progress-bar-container">
              <div className="progress-header">
                <span>Readmitted (1)</span>
                <strong>33%</strong>
              </div>
              <div className="progress-track">
                <div className="progress-fill alt" style={{width: '33%'}}></div>
              </div>
            </div>
            
            <div className="alert alert-warning" style={{marginTop: '1.5rem'}}>
              <AlertTriangle className="alert-icon" size={16} />
              <div>
                <strong>Imbalance detected:</strong> Only 33% of patients were readmitted. A lazy model could predict 'not readmitted' for everyone and be 67% accurate — but miss all real cases. We will handle this in Step 3.
              </div>
            </div>
            
            <h3 className="sidebar-title" style={{marginTop: '2.5rem'}}>Patient Measurements (Features)</h3>
            <table className="output-table">
              <thead>
                <tr>
                  <th>Measurement</th>
                  <th>Type</th>
                  <th>Missing?</th>
                  <th>Action Needed</th>
                </tr>
              </thead>
              <tbody>
                {measurements.map((row, i) => (
                  <tr key={i}>
                    <td style={{fontWeight: 500}}>{row.name}</td>
                    <td style={{color: '#475569'}}>{row.type}</td>
                    <td style={{color: '#475569'}}>{row.missing}</td>
                    <td>
                      <span className={`badge badge-${row.status}`}>
                        {row.action}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', marginTop: '2rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--color-border)' }}>
             <span className="step-eyebrow" style={{marginBottom: 0}}>STEP 2 / 7 - DATA EXPLORATION</span>
             <div style={{display: 'flex', gap: '0.5rem'}}>
               <button className="btn-secondary" onClick={onPrevious}>← Previous</button>
               {/* In the real app, this would be disabled if not mapped. We leave it active for the demo. */}
               <button className="btn-primary" onClick={onNext}>Next Step →</button>
             </div>
          </div>
        </div>
      </div>
      
      {isModalOpen && (
        <ColumnMapperModal 
          onClose={() => setIsModalOpen(false)} 
          onSave={() => { setIsMapped(true); setIsModalOpen(false); }} 
        />
      )}
    </div>
  );
}
