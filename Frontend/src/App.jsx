import React, { useState } from 'react';
import Header from './components/Header';
import DomainTabs from './components/DomainTabs';
import ProgressStepper from './components/ProgressStepper';
import Step1ClinicalContext from './pages/Step1ClinicalContext';
import Step2DataExploration from './pages/Step2DataExploration';
import Step3DataPreparation from './pages/Step3DataPreparation';

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);

  const handleNext = () => setCurrentStep(prev => prev + 1);
  const handlePrevious = () => setCurrentStep(prev => prev - 1);

  return (
    <div className="app-container">
      <Header />
      
      <main className="main-content">
        <DomainTabs />
        <ProgressStepper currentStep={currentStep} />
        
        {currentStep === 1 && <Step1ClinicalContext onNext={handleNext} />}
        {currentStep === 2 && <Step2DataExploration onNext={handleNext} onPrevious={handlePrevious} />}
        {currentStep === 3 && <Step3DataPreparation onNext={handleNext} onPrevious={handlePrevious} />}
        
        {/* Placeholder for steps 4-7 if needed */}
        {currentStep > 3 && (
          <div className="step-container" style={{padding: '4rem', textAlign: 'center'}}>
            <h2>Step {currentStep} under construction</h2>
            <button className="btn-secondary" onClick={handlePrevious} style={{margin: '2rem auto 0'}}>← Go Back</button>
          </div>
        )}
      </main>
    </div>
  );
}
