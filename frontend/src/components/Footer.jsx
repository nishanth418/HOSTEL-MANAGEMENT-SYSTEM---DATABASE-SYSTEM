import React from 'react';

export default function Footer({ onNavigate }) {
  return (
    <footer className="app-footer">
      <div className="app-footer-content">
        <div className="app-footer-left">
          <span>HostelHub Campus Operations System</span>
          <span className="app-footer-dot">·</span>
          <span>18 Relational Tables</span>
        </div>
        <div className="app-footer-links">
          <button
            type="button"
            className="app-footer-link"
            onClick={() => onNavigate && onNavigate('privacy')}
          >
            Privacy Policy
          </button>
          <span className="app-footer-dot">·</span>
          <button
            type="button"
            className="app-footer-link"
            onClick={() => onNavigate && onNavigate('terms')}
          >
            Terms and Conditions
          </button>
        </div>
      </div>
    </footer>
  );
}
