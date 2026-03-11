import React from 'react';

export default function StepHeader({ stepNum, totalSteps = 7, title, description, onNext, onPrevious, nextLabel = "Next Step →" }) {
  return (
    <div className="step-header-area">
      <div className="step-header-content">
        <span className="step-eyebrow">STEP {stepNum} OF {totalSteps}</span>
        <h2 className="step-main-title">{title}</h2>
        <p className="step-description">{description}</p>
      </div>
      <div className="step-actions">
        {stepNum === 1 && <div className="time-estimate">⏱ ~3 minutes</div>}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          {onPrevious && (
            <button className="btn-secondary" onClick={onPrevious}>
              ← Previous
            </button>
          )}
          <button className="btn-primary" onClick={onNext}>
            {nextLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
