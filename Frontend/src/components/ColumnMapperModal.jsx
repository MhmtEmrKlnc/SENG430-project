import React, { useState } from 'react';
import { X, AlertTriangle, Info, Loader2 } from 'lucide-react';
import api from '../api';

export default function ColumnMapperModal({ summary, onClose, onSave }) {
  const defaultTarget = summary?.target_column || (summary?.columns.length > 0 ? summary.columns[0].name : '');
  const [targetColumn, setTargetColumn] = useState(defaultTarget);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.post('/projects/1/column-mapper/save/', {
        target_column: targetColumn
      });
      onSave(targetColumn);
    } catch (err) {
      console.error("Error saving column mapper:", err);
      alert(err.response?.data?.banner?.message || "Failed to save column mapping.");
      setSaving(false);
    }
  };
  // Determine the display columns to show
  // If we have real summary data, use that. Otherwise fallback to empty arrays to prevent crashes.
  const previewData = summary?.preview_data || [];
  
  const columnRoles = summary?.columns?.map(col => ({
    name: col.name,
    auto: col.type === 'numeric' 
          ? (col.missing_percentage > 0 ? `Number — ${col.missing_percentage}% missing` : 'Number') 
          : 'Category',
    role: col.name === defaultTarget ? 'Target (what to predict)' : (col.type === 'numeric' ? 'Number (measurement)' : 'Category'),
    color: col.missing_percentage > 20 ? 'danger' : (col.missing_percentage > 0 ? 'warning' : 'success')
  })) || [];

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
              <select 
                className="form-select"
                value={targetColumn}
                onChange={e => setTargetColumn(e.target.value)}
              >
                {summary?.columns?.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
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
                <strong>Warning:</strong> Ensure identifier columns like patient IDs are set to 'Ignore' — they are not clinical measurements and would mislead the model.
              </div>
            </div>
            
            <div style={{display: 'flex', gap: '0.5rem', marginBottom: '2rem'}}>
              <button className="btn-secondary" style={{flex: 1, justifyContent: 'center'}}>Validate Schema</button>
              <button 
                className="btn-primary" 
                style={{flex: 1, justifyContent: 'center'}} 
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? <Loader2 className="animate-spin" size={16} /> : 'Save Mapping'}
              </button>
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
                 {previewData.slice(0, 5).map((row, i) => (
                   Object.keys(row).map((colName, j) => (
                     <tr key={`${i}-${j}`}>
                       <td style={{fontSize: '0.875rem'}}>{colName}</td>
                       <td style={{fontSize: '0.875rem', color: '#475569'}}>{String(row[colName])}</td>
                     </tr>
                   ))
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
            <button className="btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
            <button 
              className="btn-primary" 
              style={{backgroundColor: '#059669'}} 
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save & Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
