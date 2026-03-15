import React from 'react';
import { RefreshCcw, HelpCircle } from 'lucide-react';

export default function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <div className="header-logo-box">H</div>
        <div className="header-title">
          <h1>HEALTH-AI <span style={{fontWeight: 400, color: '#A0AEC0'}}>&middot; ML Learning Tool</span></h1>
          <div className="header-subtitle">Erasmus+ KA220-HED &middot; For Healthcare Professionals</div>
        </div>
      </div>
      <div className="header-right">
        <div className="domain-selector">
          <div className="domain-indicator"></div>
          Domain: Cardiology
          <span style={{ fontSize: '10px' }}>▼</span>
        </div>
        <button className="btn-header">
          <RefreshCcw size={16} /> Reset
        </button>
        <button className="btn-header btn-help">
          <HelpCircle size={16} /> Help
        </button>
      </div>
    </header>
  );
}
