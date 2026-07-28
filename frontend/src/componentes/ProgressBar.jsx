// src/componentes/ProgressBar.jsx
import React from 'react';
import './ProgressBar.css';

export function ProgressBar({ percentage, hours }) {
  const getProgressColorClass = (pct) => {
    if (pct >= 100) return 'green';
    if (pct >= 50) return 'blue';
    return 'orange';
  };

  const colorName = getProgressColorClass(percentage);

  return (
    <div className="progress-bar-container">
      <div className="progress-track">
        <div 
          className={`progress-fill bg-${colorName}`} 
          style={{ width: `${Math.min(Math.max(percentage, 0), 100)}%` }}
        />
      </div>
      <div className="progress-metrics">
        <span className={`progress-percentage-text text-${colorName}`}>{percentage}%</span>
        <span className="progress-hours-text">{hours}h</span>
      </div>
    </div>
  );
}

export default ProgressBar;
