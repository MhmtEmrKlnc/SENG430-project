import React, { useState } from 'react';

const domains = [
  'Cardiology', 'Nephrology', 'Oncology', 'Neurology', 'Diabetes',
  'Pulmonology', 'Sepsis / ICU', 'Fetal Health', 'Dermatology', 'Stroke Risk'
];

export default function DomainTabs() {
  const [activeDomain, setActiveDomain] = useState('Cardiology');

  return (
    <div className="domain-tabs">
      {domains.map((domain) => (
        <button 
          key={domain} 
          className={`domain-tab ${activeDomain === domain ? 'active' : ''}`}
          onClick={() => setActiveDomain(domain)}
        >
          {domain}
        </button>
      ))}
    </div>
  );
}
