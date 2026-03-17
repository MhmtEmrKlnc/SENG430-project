import React from 'react';
import { domainsList } from '../data/domains';

export default function DomainTabs({ activeDomain, setActiveDomain }) {
  return (
    <div className="domain-tabs">
      {domainsList.map((domain) => (
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
