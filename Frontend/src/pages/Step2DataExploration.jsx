import React, { useState, useEffect } from 'react';
import { AlertTriangle, Database, Lock, CheckCircle2, ChevronRight, LayoutGrid, Loader2 } from 'lucide-react';
import StepHeader from '../components/StepHeader';
import ColumnMapperModal from '../components/ColumnMapperModal';
import api from '../api';

export default function Step2DataExploration({ onNext, onPrevious }) {
  const [dataSource, setDataSource] = useState('default');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMapped, setIsMapped] = useState(false);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch summary for project with ID 1
    api.get('/projects/1/step2/summary/')
      .then(res => {
        setSummary(res.data);
        setIsMapped(res.data.schema_ok);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching summary:', err);
        setError('Failed to load dataset summary. Make sure the backend is running.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="step-container" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px'}}>
        <Loader2 className="animate-spin" size={32} style={{color: 'var(--color-primary)'}} />
        <span style={{marginLeft: '1rem'}}>Loading dataset summary...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="step-container">
        <div className="alert alert-danger">
          <AlertTriangle className="alert-icon" size={24} />
          <div>{error}</div>
        </div>
      </div>
    );
  }

  // Calculate missing percentage
  const totalCells = summary.row_count * summary.column_count;
  const missingPercentage = totalCells > 0 ? ((summary.missing_cells / totalCells) * 100).toFixed(1) : 0;

  // Process class distribution if available
  let totalClasses = 0;
  let classes = [];
  if (summary.class_distribution && Object.keys(summary.class_distribution).length > 0) {
    totalClasses = Object.values(summary.class_distribution).reduce((a, b) => a + b, 0);
    classes = Object.entries(summary.class_distribution).map(([name, count]) => ({
      name,
      count,
      percentage: totalClasses > 0 ? Math.round((count / totalClasses) * 100) : 0
    }));
  }

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
                {summary.target_column ? (
                  <option>{summary.target_column}</option>
                ) : (
                  <option>Not selected</option>
                )}
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
                <div className="stat-value">{summary.row_count}</div>
                <div className="stat-label">Patients</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{summary.column_count}</div>
                <div className="stat-label">Measurements</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{color: missingPercentage > 5 ? '#D97706' : 'inherit'}}>
                  {missingPercentage}%
                </div>
                <div className="stat-label">Missing Data</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Content */}
        <div>
          <div className="output-table-container">
            <h3 className="sidebar-title">Class Balance — How many readmitted vs. not?</h3>
            
            {classes.length > 0 ? (
              classes.map((cls, idx) => (
                <div className="progress-bar-container" key={idx}>
                  <div className="progress-header">
                    <span>Class: {cls.name} ({cls.count})</span>
                    <strong>{cls.percentage}%</strong>
                  </div>
                  <div className="progress-track">
                    <div className={`progress-fill ${idx === 1 ? 'alt' : ''}`} style={{width: `${cls.percentage}%`}}></div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{color: '#64748B', fontSize: '0.875rem', padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '6px'}}>
                Select a target column to view class balance.
              </div>
            )}
            
            {summary.imbalance_warning && (
              <div className="alert alert-warning" style={{marginTop: '1.5rem'}}>
                <AlertTriangle className="alert-icon" size={16} />
                <div>
                  <strong>Imbalance detected:</strong> One class is significantly larger than the other. This can cause the model to be biased. We will handle this in Step 3.
                </div>
              </div>
            )}
            
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
                {summary.columns.map((col, i) => {
                  const missingColPerc = ((col.missing / summary.row_count) * 100).toFixed(1);
                  let status = 'success';
                  let action = 'Ready';
                  if (col.missing > 0) { status = 'warning'; action = 'Fill Missing Values'; }
                  if (col.name === 'patient_id' || col.name.toLowerCase().includes('id')) { status = 'danger'; action = 'Exclude'; }

                  return (
                    <tr key={i}>
                      <td style={{fontWeight: 500}}>{col.name}</td>
                      <td style={{color: '#475569'}}>{col.type}</td>
                      <td style={{color: '#475569'}}>{missingColPerc}%</td>
                      <td>
                        <span className={`badge badge-${status}`}>
                          {action}
                        </span>
                      </td>
                    </tr>
                  );
                })}
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
          summary={summary}
          onClose={() => setIsModalOpen(false)} 
          onSave={(targetColumn) => { 
            // In a real app we would refresh summary state here from backend after save
            setIsMapped(true); 
            setIsModalOpen(false); 
            // Optimistic update of UI
            setSummary(prev => ({...prev, target_column: targetColumn, schema_ok: true}));
          }} 
        />
      )}
    </div>
  );
}
