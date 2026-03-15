import React from 'react';
import { AlertTriangle, CheckSquare } from 'lucide-react';
import StepHeader from '../components/StepHeader';

const stepOutputs = [
  { step: 1, create: 'Clinical Brief', meaning: 'The problem we are solving, and the safety rules' },
  { step: 2, create: 'Data Profile', meaning: 'Understanding your patient dataset — who is in it and what is missing' },
  { step: 3, create: 'Preprocessing Recipe', meaning: 'Cleaning and preparing data so the model can learn correctly' },
  { step: 4, create: 'Trained Model', meaning: 'A computer programme that has learned patterns from past patients' },
  { step: 5, create: 'Evaluation Report', meaning: 'How accurately does the model predict readmission?' },
  { step: 6, create: 'Explanation', meaning: 'Why did the model flag a specific patient as high risk?' },
  { step: 7, create: 'Ethics Checklist', meaning: 'Is the model fair for all patient groups? Who oversees it?' }
];

export default function Step1ClinicalContext({ onNext }) {
  return (
    <div className="step-container">
      <StepHeader 
        stepNum={1}
        title="Clinical Context & Problem Definition"
        description={<>Before we look at any data, we define the clinical problem. In <strong>Cardiology</strong>, we want to predict which patients are most likely to be readmitted to hospital within 30 days after a heart failure discharge — so doctors can arrange follow-up care in advance.</>}
        onNext={onNext}
      />
      
      <div className="page-grid">
        {/* Left Sidebar */}
        <div>
          <div className="sidebar-section">
            <h3 className="sidebar-title">Clinical Scenario</h3>
            <div className="scenario-block">
              <div className="scenario-label">Domain</div>
              <div className="scenario-value" style={{fontSize: '1.125rem'}}>Cardiology</div>
            </div>
            
            <div className="scenario-block">
              <div className="scenario-label" style={{fontWeight: 600, color: '#0F172A'}}>Clinical Question</div>
              <div className="question-box">
                Will this patient be readmitted to hospital within 30 days of discharge following a heart failure episode?
              </div>
            </div>
            
            <div className="scenario-block">
              <div className="scenario-label" style={{fontWeight: 600, color: '#0F172A'}}>Why This Matters</div>
              <p style={{fontSize: '0.875rem', marginTop: '0.5rem'}}>
                30% of heart failure patients are readmitted within 30 days. Each readmission costs approximately €15,000. Early identification allows nurses to arrange discharge follow-up calls and medication checks.
              </p>
            </div>
            
            <div className="alert alert-warning">
              <AlertTriangle className="alert-icon" size={16} />
              <div>
                <strong>What ML cannot do:</strong> It cannot replace your clinical judgment. It can flag high-risk patients, but you make the final decision.
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Content */}
        <div>
          <div className="output-table-container">
            <h3 className="sidebar-title">What will be produced in each step</h3>
            <table className="output-table">
              <thead>
                <tr>
                  <th>Step</th>
                  <th>What you will create</th>
                  <th>Plain English Meaning</th>
                </tr>
              </thead>
              <tbody>
                {stepOutputs.map(row => (
                  <tr key={row.step}>
                    <td>
                      <div className="step-circle">{row.step}</div>
                    </td>
                    <td style={{fontWeight: 500}}>{row.create}</td>
                    <td style={{color: '#475569'}}>{row.meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="alert alert-success" style={{marginTop: '1.5rem'}}>
              <CheckSquare className="alert-icon" size={18} />
              <div>
                <strong>Remember:</strong> A human doctor or nurse must always review the model's suggestions. This tool helps you learn — it does not make clinical decisions.
              </div>
            </div>
          </div>
          
          <div style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', marginTop: '2rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--color-border)' }}>
             <span className="step-eyebrow" style={{marginBottom: 0}}>STEP 1 / 7 - CLINICAL CONTEXT</span>
             <button className="btn-primary" onClick={onNext}>Next Step →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
