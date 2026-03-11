import React from 'react';
import { X, AlertTriangle, Info } from 'lucide-react';

export default function ColumnMapperModal({ onClose, onSave }) {
  const previewData = [
    { col: 'Age', val: '62' },
    { col: 'Ejection_Fraction', val: '38' },
    { col: 'Serum_Creatinine', val: '1.3' },
    { col: 'Smoker', val: 'Yes' },
    { col: 'patient_id', val: 'PX-88412' },
    { col: 'Readmitted_30d', val: '1' },
  ];

  const columnRoles = [
    { name: 'Readmitted_30d', auto: 'Binary (0/1)', role: 'Target (what to predict)', color: 'success' },
    { name: 'Age', auto: 'Number', role: 'Number (measurement)', color: 'success' },
    { name: 'Ejection_Fraction', auto: 'Number', role: 'Number (measurement)', color: 'success' },
    { name: 'Serum_Creatinine', auto: 'Number — 6.8% missing', role: 'Number (measurement)', color: 'warning' },
    { name: 'Smoker', auto: 'Category', role: 'Category', color: 'success' },
    { name: 'patient_id', auto: 'Identifier-like', role: 'Ignore (not a measurement)', color: 'danger' },
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Column Mapper & Schema Validator</h3>
            <p className="modal-subtitle">Assign a role to each column in your dataset. This prevents the model from accidentally using patient IDs or other non-clinical information that would give misleading results.</p>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={20} /> Close
          </button>
        </div>
        
        <div className="modal-body">
          {/* Left Column: Settings and Preview */}
          <div>
            <h4 className="sidebar-title">Settings</h4>
            
            <div className="form-group">
              <label className="form-label">Problem Type</label>
              <select className="form-select">
                <option>Binary classification (Yes / No outcome)</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Target Column (What We Are Predicting)</label>
              <select className="form-select">
                <option>Readmitted_30d</option>
              </select>
            </div>

            <div style={{display: 'flex', gap: '0.5rem', marginBottom: '1rem'}}>
              <span className="badge badge-warning">Schema: Needs review</span>
              <span className="badge badge-outline">Identifiers found: 1</span>
            </div>
            
            <div style={{fontWeight: 500, fontSize: '0.875rem', marginBottom: '1rem'}}>
              Target missing: 0%
            </div>
            
            <div className="alert alert-warning" style={{fontSize: '0.75rem', padding: '0.75rem'}}>
              <AlertTriangle className="alert-icon" size={14} />
              <div>
                <strong>Warning:</strong> patient_id appears to be an identifier (random text/number). Set its role to 'Ignore' — it is not a clinical measurement and would mislead the model.
              </div>
            </div>
            
            <div style={{display: 'flex', gap: '0.5rem', marginBottom: '2rem'}}>
              <button className="btn-secondary" style={{flex: 1, justifyContent: 'center'}}>Validate Schema</button>
              <button className="btn-primary" style={{flex: 1, justifyContent: 'center'}} onClick={onSave}>Save Mapping</button>
            </div>
            
            <h4 className="sidebar-title">Data Preview (First 5 Rows)</h4>
            <table className="output-table">
               <thead>
                 <tr>
                   <th>Column</th>
                   <th>Sample Value</th>
                 </tr>
               </thead>
               <tbody>
                 {previewData.map((row, i) => (
                   <tr key={i}>
                     <td style={{fontSize: '0.875rem'}}>{row.col}</td>
                     <td style={{fontSize: '0.875rem', color: '#475569'}}>{row.val}</td>
                   </tr>
                 ))}
               </tbody>
            </table>
          </div>
          
          {/* Right Column: Column Roles */}
          <div>
             <h4 className="sidebar-title">Column Roles — Drag to Assign</h4>
             <table className="output-table">
               <thead>
                 <tr>
                   <th>Column Name</th>
                   <th>Auto-Detected</th>
                   <th>Assign Role</th>
                 </tr>
               </thead>
               <tbody>
                 {columnRoles.map((col, i) => (
                   <tr key={i}>
                     <td style={{fontSize: '0.875rem', fontWeight: 500}}>{col.name}</td>
                     <td>
                       <span className={`badge badge-${col.color}`}>{col.auto}</span>
                     </td>
                     <td>
                       <select className="form-select" style={{padding: '0.375rem', fontSize: '0.75rem'}} defaultValue={col.role}>
                         <option>{col.role}</option>
                         <option>Target (what to predict)</option>
                         <option>Number (measurement)</option>
                         <option>Category</option>
                         <option>Ignore (not a measurement)</option>
                       </select>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
             
             <div className="alert alert-info" style={{marginTop: '1.5rem', fontSize: '0.75rem'}}>
               <Info className="alert-icon" size={14} />
               <div>
                  <strong>Blocking rules:</strong> No target column = blocked &middot; Target column has more than 20% missing values = blocked &middot; All columns set to Ignore = blocked
               </div>
             </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <span style={{fontSize: '0.875rem', color: '#64748B'}}>Save the mapping to unlock Step 3.</span>
          <div style={{display: 'flex', gap: '0.5rem'}}>
            <button className="btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn-primary" style={{backgroundColor: '#059669'}} onClick={onSave}>Save & Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}
