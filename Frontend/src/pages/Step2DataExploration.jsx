import React, { useState, useEffect } from 'react';
import { AlertTriangle, Lock, CheckCircle2, LayoutGrid, Loader2, UploadCloud } from 'lucide-react';
import StepHeader from '../components/StepHeader';
import ColumnMapperModal from '../components/ColumnMapperModal';
import api from '../api';

export default function Step2DataExploration({ domain, onNext, onPrevious }) {
  const [dataSource, setDataSource] = useState('default');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMapped, setIsMapped] = useState(false);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [blockedBanner, setBlockedBanner] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadBanner, setUploadBanner] = useState(null);

  const loadDefaultDataset = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = domain ? { domain: domain.name } : { domain: "Cardiology" };
      const res = await api.post('/projects/1/set-domain-dataset/', payload);
      setSummary(res.data);
      setIsMapped(res.data.schema_ok);
    } catch (err) {
      console.error('Error fetching summary:', err);
      const backendMsg = err?.response?.data?.error;
      setError(backendMsg || 'Failed to load dataset summary. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dataSource === 'default') {
      loadDefaultDataset();
    } else {
      setLoading(true);
      api.get('/projects/1/step2/summary/')
        .then(res => {
          setSummary(res.data);
          setIsMapped(res.data.schema_ok);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching summary:', err);
          setLoading(false);
        });
    }
  }, [dataSource, domain]);

  const handleAttemptNext = () => {
    if (!isMapped) {
      setBlockedBanner({
        type: 'error',
        title: 'Step 3 is locked',
        message: 'Open Column Mapper, choose a valid target column, and click Save to unlock Step 3.',
      });
      return;
    }
    setBlockedBanner(null);
    onNext();
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      setUploading(true);
      setUploadBanner(null);
      setError('');

      const form = new FormData();
      form.append('file', selectedFile);

      const res = await api.post('/projects/1/step2/upload/', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSummary(res.data);
      setIsMapped(Boolean(res.data.schema_ok));
      setUploadBanner({
        type: 'success',
        title: 'Upload successful',
        message: 'Dataset loaded. You can now open Column Mapper to validate your target column.',
      });
    } catch (err) {
      console.error('Error uploading dataset:', err);
      const banner = err?.response?.data?.banner;
      const message =
        banner?.message ||
        err?.response?.data?.error ||
        'Upload failed. Please check your file and try again.';
      setUploadBanner({
        type: 'error',
        title: banner?.title || 'Upload failed',
        message,
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="step-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Loader2 className="animate-spin" size={32} style={{ color: 'var(--color-primary)' }} />
        <span style={{ marginLeft: '1rem' }}>Loading dataset summary...</span>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="step-container">
        <div className="alert alert-danger">
          <AlertTriangle className="alert-icon" size={24} />
          <div>{error || "Failed to load summary. No data available."}</div>
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
        onNext={handleAttemptNext}
        onPrevious={onPrevious}
      />

      {dataSource === 'csv' && (
        <div className="alert alert-info" style={{ margin: '1.5rem 1.5rem 0' }}>
          <Lock className="alert-icon" size={18} style={{ color: '#3B82F6' }} />
          <div>
            <strong style={{ color: '#1D4ED8' }}>Your data is private</strong><br />
            If you upload your own file, it is used only within your current browser session and is never saved to any server or shared with anyone. The privacy notice is displayed on every screen.
          </div>
        </div>
      )}

      {blockedBanner && (
        <div className="alert alert-danger" style={{ margin: '1.5rem 1.5rem 0' }}>
          <AlertTriangle className="alert-icon" size={18} />
          <div>
            <strong>{blockedBanner.title}:</strong> {blockedBanner.message}
          </div>
        </div>
      )}

      <div className="page-grid">
        {/* Left Sidebar */}
        <div>
          <div className="sidebar-section">
            <h3 className="sidebar-title">Data Source</h3>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <button
                className={`btn-outline ${dataSource === 'default' ? 'active' : ''}`}
                style={{ flex: 1 }}
                onClick={() => setDataSource('default')}
              >
                Use Default Dataset
              </button>
              <button
                className={`btn-outline ${dataSource === 'csv' ? 'active' : ''}`}
                style={{ flex: 1 }}
                onClick={() => setDataSource('csv')}
              >
                Upload Your CSV
              </button>
            </div>

            {dataSource === 'csv' && (
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Upload CSV file</label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    setSelectedFile(e.target.files?.[0] || null);
                    setUploadBanner(null);
                  }}
                  className="form-select"
                  style={{ padding: '0.6rem' }}
                />
                <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', marginBottom: '0.75rem' }}>
                  Requirements: CSV, ≤ 50MB, at least 10 rows, and at least one numeric measurement column.
                </p>
                <button
                  className="btn-secondary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                >
                  {uploading ? <Loader2 className="animate-spin" size={16} /> : <UploadCloud size={16} />}
                  {uploading ? 'Uploading...' : 'Upload & Load Dataset'}
                </button>

                {uploadBanner && (
                  <div className={`alert ${uploadBanner.type === 'success' ? 'alert-success' : 'alert-danger'}`} style={{ marginTop: '0.75rem', fontSize: '0.875rem' }}>
                    {uploadBanner.type === 'success' ? <CheckCircle2 className="alert-icon" size={16} /> : <AlertTriangle className="alert-icon" size={16} />}
                    <div>
                      <strong>{uploadBanner.title}:</strong> {uploadBanner.message}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Target Column (What We Want to Predict)</label>
              <select className="form-select">
                {summary.target_column ? (
                  <option>{summary.target_column}</option>
                ) : (
                  <option>Not selected</option>
                )}
              </select>
              <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', marginBottom: '1rem' }}>This is the outcome the model will learn to predict.</p>
            </div>

            <button
              className="btn-secondary"
              style={{ width: '100%', justifyContent: 'center', marginBottom: '1rem', color: '#B45309', borderColor: '#FDE68A', backgroundColor: '#FFFBEB' }}
              onClick={() => setIsModalOpen(true)}
            >
              <LayoutGrid size={16} /> Open Column Mapper & Validate
            </button>

            {!isMapped && (
              <div className="alert alert-warning" style={{ fontSize: '0.75rem', padding: '0.75rem' }}>
                <AlertTriangle className="alert-icon" size={14} />
                <div><strong>Action needed:</strong> Open the Column Mapper to confirm your data structure before continuing to Step 3.</div>
              </div>
            )}
            {isMapped && (
              <div className="alert alert-success" style={{ fontSize: '0.75rem', padding: '0.75rem' }}>
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
                <div className="stat-value" style={{ color: missingPercentage > 5 ? '#D97706' : 'inherit' }}>
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
                    <div className={`progress-fill ${idx === 1 ? 'alt' : ''}`} style={{ width: `${cls.percentage}%` }}></div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: '#64748B', fontSize: '0.875rem', padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '6px' }}>
                Select a target column to view class balance.
              </div>
            )}

            {summary.imbalance_warning && (
              <div className="alert alert-warning" style={{ marginTop: '1.5rem' }}>
                <AlertTriangle className="alert-icon" size={16} />
                <div>
                  <strong>Imbalance detected:</strong> One class is significantly larger than the other. This can cause the model to be biased. We will handle this in Step 3.
                </div>
              </div>
            )}

            <h3 className="sidebar-title" style={{ marginTop: '2.5rem' }}>Patient Measurements (Features)</h3>
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
                      <td style={{ fontWeight: 500 }}>{col.name}</td>
                      <td style={{ color: '#475569' }}>{col.type}</td>
                      <td style={{ color: '#475569' }}>{missingColPerc}%</td>
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
            <span className="step-eyebrow" style={{ marginBottom: 0 }}>STEP 2 / 7 - DATA EXPLORATION</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn-secondary" onClick={onPrevious}>← Previous</button>
              <button
                className="btn-primary"
                onClick={handleAttemptNext}
                style={!isMapped ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
              >
                Next Step →
              </button>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <ColumnMapperModal
          summary={summary}
          onClose={() => setIsModalOpen(false)}
          onSave={(result) => {
            setIsMapped(Boolean(result?.schema_ok));
            setIsModalOpen(false);
            setSummary(prev => ({
              ...prev,
              target_column: result?.target_column ?? prev?.target_column,
              schema_ok: Boolean(result?.schema_ok),
            }));
          }}
        />
      )}
    </div>
  );
}
