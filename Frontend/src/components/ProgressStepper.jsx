import React from 'react';
import { Check } from 'lucide-react';

const steps = [
  { num: 1, title: 'Clinical Context', subtitle: 'Use case & goals' },
  { num: 2, title: 'Data Exploration', subtitle: 'Upload & understand' },
  { num: 3, title: 'Data Preparation', subtitle: 'Clean & split data' },
  { num: 4, title: 'Model & Parameters', subtitle: 'Select & tune' },
  { num: 5, title: 'Results', subtitle: 'Metrics & matrix' },
  { num: 6, title: 'Explainability', subtitle: 'Why this prediction?' },
  { num: 7, title: 'Ethics & Bias', subtitle: 'Fairness check' }
];

export default function ProgressStepper({ currentStep }) {
  return (
    <div className="progress-stepper">
      {steps.map((step) => {
        let statusClass = '';
        if (step.num < currentStep) statusClass = 'completed';
        else if (step.num === currentStep) statusClass = 'active';

        return (
          <div key={step.num} className={`stepper-item ${statusClass}`}>
            <div className="stepper-header">
              <div className="step-number">
                {step.num < currentStep ? <Check size={16} strokeWidth={3} /> : step.num}
              </div>
              <div className="step-info">
                <span className="step-title">{step.title}</span>
                <span className="step-subtitle">{step.subtitle}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
