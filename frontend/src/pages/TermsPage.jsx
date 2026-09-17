import React from 'react';
import { FileText, ArrowLeft } from 'lucide-react';

export default function TermsPage({ onNavigate }) {
  return (
    <div>
      <div className="page-header">
        <div className="page-header-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileText size={24} color="#2563eb" />
            <h2>Terms and Conditions</h2>
          </div>
          <p>Operational terms of service and administrative compliance rules</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('dashboard')}>
            <ArrowLeft size={14} />
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="panel" style={{ maxWidth: '880px', lineHeight: 1.7 }}>
        <h3 style={{ color: '#fff', marginBottom: 12, fontSize: '1.1rem' }}>1. Institutional Terms of Use</h3>
        <p style={{ color: '#cbd5e1', marginBottom: 16, fontSize: '0.88rem' }}>
          This system is deployed for authorized university administrators, wardens, and bursar staff of [INSTITUTION_NAME]. 
          Unauthorized access, data tampering, or unauthorized SQL modification is strictly prohibited.
        </p>

        <h3 style={{ color: '#fff', marginBottom: 12, fontSize: '1.1rem' }}>2. Data Accuracy and Audit Obligations</h3>
        <p style={{ color: '#cbd5e1', marginBottom: 16, fontSize: '0.88rem' }}>
          Authorized personnel entering records into the relational database must ensure data accuracy for student profiles, 
          fee receipts, meal allotments, and inventory logs. Every transaction maintains strict referential constraints.
        </p>

        <h3 style={{ color: '#fff', marginBottom: 12, fontSize: '1.1rem' }}>3. Governing Law and Jurisdiction</h3>
        <p style={{ color: '#cbd5e1', marginBottom: 16, fontSize: '0.88rem' }}>
          These terms and all administrative processes are governed by and construed in accordance with the applicable laws 
          of [GOVERNING_JURISDICTION]. Any institutional disputes shall be handled through established administrative tribunals.
        </p>
      </div>
    </div>
  );
}
