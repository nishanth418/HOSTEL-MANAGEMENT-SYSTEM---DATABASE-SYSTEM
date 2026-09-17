import React from 'react';
import { Shield, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage({ onNavigate }) {
  return (
    <div>
      <div className="page-header">
        <div className="page-header-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Shield size={24} color="#2563eb" />
            <h2>Privacy Policy</h2>
          </div>
          <p>Institutional data governance and student privacy standards</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('dashboard')}>
            <ArrowLeft size={14} />
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="panel" style={{ maxWidth: '880px', lineHeight: 1.7 }}>
        <h3 style={{ color: '#fff', marginBottom: 12, fontSize: '1.1rem' }}>1. Information We Collect</h3>
        <p style={{ color: '#cbd5e1', marginBottom: 16, fontSize: '0.88rem' }}>
          This software system operates under the administrative authority of [INSTITUTION_NAME]. 
          We process records necessary for campus residence administration, including student identification, 
          room allocations, payment verification, and facility access logs.
        </p>

        <h3 style={{ color: '#fff', marginBottom: 12, fontSize: '1.1rem' }}>2. Use of Information</h3>
        <p style={{ color: '#cbd5e1', marginBottom: 16, fontSize: '0.88rem' }}>
          Data collected in this database is strictly used for university residence hall operations, 
          meal provisioning, disciplinary documentation, and billing audits. We do not sell or monetize 
          student records to external third-party entities.
        </p>

        <h3 style={{ color: '#fff', marginBottom: 12, fontSize: '1.1rem' }}>3. Data Retention and Security</h3>
        <p style={{ color: '#cbd5e1', marginBottom: 16, fontSize: '0.88rem' }}>
          All relational records are stored in protected database systems enforcing relational integrity 
          and access control policies established by [INSTITUTION_NAME].
        </p>

        <h3 style={{ color: '#fff', marginBottom: 12, fontSize: '1.1rem' }}>4. Contact and Inquiries</h3>
        <p style={{ color: '#cbd5e1', marginBottom: 8, fontSize: '0.88rem' }}>
          For inquiries regarding institutional data protection or student record amendments, please contact:
        </p>
        <p style={{ color: '#38bdf8', fontFamily: 'var(--font-mono)', fontSize: '0.84rem' }}>
          [CONTACT_EMAIL]
        </p>
      </div>
    </div>
  );
}
