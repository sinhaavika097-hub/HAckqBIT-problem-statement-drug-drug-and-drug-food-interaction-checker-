import React from 'react';
import {
  Medicine,
  DrugDrugInteraction,
  DrugFoodInteraction,
  SupportedLanguage,
} from '../types/interactions';
import { t, getLocalizedPatientExplanation } from '../utils/localization';
import { Printer, Download, X, FileText, ShieldAlert } from 'lucide-react';

interface ClinicalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  regimen: Medicine[];
  drugInteractions: DrugDrugInteraction[];
  foodInteractions: DrugFoodInteraction[];
  currentLanguage: SupportedLanguage;
}

export const ClinicalReportModal: React.FC<ClinicalReportModalProps> = ({
  isOpen,
  onClose,
  regimen,
  drugInteractions,
  foodInteractions,
  currentLanguage,
}) => {
  if (!isOpen) return null;

  const criticalCount = drugInteractions.filter((i) => i.severity === 'CRITICAL').length;
  const highCount = drugInteractions.filter((i) => i.severity === 'HIGH').length;
  const moderateCount = drugInteractions.filter((i) => i.severity === 'MODERATE').length;
  const foodWarningCount = foodInteractions.length;

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    const reportData = {
      reportTitle: 'Presci-Check Clinical Interaction & Polypharmacy Safety Audit',
      generatedAt: new Date().toISOString(),
      patientRegimen: regimen.map((m) => ({ id: m.id, name: m.name, generic: m.genericName, category: m.category })),
      summary: {
        totalMedications: regimen.length,
        criticalDrugInteractions: criticalCount,
        highDrugInteractions: highCount,
        moderateDrugInteractions: moderateCount,
        foodContraindications: foodWarningCount,
      },
      drugDrugInteractions: drugInteractions.map((i) => ({
        pair: [i.primaryDrug.name, i.interactingDrug.name],
        severity: i.severity,
        mechanism: i.doctorSummary.clinicalMechanism,
        patientAdvice: i.patientExplanation.actionAdvice,
        monitoringParameters: i.doctorSummary.monitoringParameters,
        clinicianAlternatives: i.doctorSummary.alternativesForReview,
      })),
      drugFoodInteractions: foodInteractions.map((f) => ({
        drug: f.drug.name,
        food: f.food.name,
        severity: f.severity,
        recommendation: f.dietaryRecommendation,
      })),
      disclaimer: 'Clinical decision-support aid. Not a replacement for professional physician oversight.',
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `presci-check-clinical-report-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(3px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          maxWidth: '850px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Modal Actions Header (Hidden in Print) */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            borderBottom: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} color="var(--color-primary)" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
              Clinical Safety Audit Report
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={handlePrint}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                backgroundColor: '#ffffff',
                color: 'var(--color-text-main)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Printer size={16} />
              Print / Save PDF
            </button>

            <button
              type="button"
              onClick={handleExportJson}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                backgroundColor: '#ffffff',
                color: 'var(--color-text-main)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Download size={16} />
              Export JSON
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: 'transparent',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Report Content Body */}
        <div
          style={{
            padding: '24px',
            overflowY: 'auto',
            fontSize: '0.9rem',
            lineHeight: 1.6,
          }}
        >
          {/* Institutional Header */}
          <div style={{ borderBottom: '2px solid var(--color-border)', paddingBottom: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary)', margin: 0 }}>
                  Presci-Check 📋 Polypharmacy Safety Audit
                </h1>
                <p style={{ margin: '4px 0 0 0', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                  Biomedical Decision Support &amp; Adverse Reaction Surveillance
                </p>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                <div><strong>Audit Date:</strong> {new Date().toLocaleDateString()}</div>
                <div><strong>Language:</strong> {currentLanguage.toUpperCase()}</div>
              </div>
            </div>
          </div>

          {/* Regimen Summary KPIs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '12px',
              marginBottom: '20px',
            }}
          >
            <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Active Regimen</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>{regimen.length} Drugs</div>
            </div>
            <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--severity-critical-border)', backgroundColor: 'var(--severity-critical-bg)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--severity-critical)' }}>Critical Interactions</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--severity-critical)' }}>{criticalCount}</div>
            </div>
            <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--severity-high-border)', backgroundColor: 'var(--severity-high-bg)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--severity-high)' }}>High Severity</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--severity-high)' }}>{highCount}</div>
            </div>
            <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--severity-moderate-border)', backgroundColor: 'var(--severity-moderate-bg)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--severity-moderate)' }}>Moderate Severity</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--severity-moderate)' }}>{moderateCount}</div>
            </div>
            <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Food Warnings</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>{foodWarningCount}</div>
            </div>
          </div>

          {/* Section 1: Active Regimen */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, borderBottom: '1px solid var(--color-border)', paddingBottom: '6px', marginBottom: '10px' }}>
              1. Evaluated Polypharmacy Regimen
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-surface-subtle)', textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '8px' }}>#</th>
                  <th style={{ padding: '8px' }}>Brand / Primary Name</th>
                  <th style={{ padding: '8px' }}>Generic Compound</th>
                  <th style={{ padding: '8px' }}>Therapeutic Class</th>
                </tr>
              </thead>
              <tbody>
                {regimen.map((med, idx) => (
                  <tr key={med.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '8px' }}>{idx + 1}</td>
                    <td style={{ padding: '8px', fontWeight: 600 }}>{med.name}</td>
                    <td style={{ padding: '8px' }}>{med.genericName}</td>
                    <td style={{ padding: '8px', color: 'var(--color-text-muted)' }}>{med.category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 2: Drug-Drug Interactions */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, borderBottom: '1px solid var(--color-border)', paddingBottom: '6px', marginBottom: '10px' }}>
              2. Flagged Drug-Drug Interactions ({drugInteractions.length})
            </h3>
            {drugInteractions.length === 0 ? (
              <p style={{ color: 'var(--severity-low)', fontWeight: 600 }}>No negative drug-drug interactions detected across current regimen.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {drugInteractions.map((item) => {
                  const localizedExpl = getLocalizedPatientExplanation(item.id, currentLanguage, item.patientExplanation);
                  const isCritOrHigh = item.severity === 'CRITICAL' || item.severity === 'HIGH';

                  return (
                    <div
                      key={item.id}
                      className="print-break-inside-avoid"
                      style={{
                        padding: '14px',
                        borderRadius: 'var(--radius-sm)',
                        border: `1px solid ${isCritOrHigh ? 'var(--severity-critical-border)' : 'var(--color-border)'}`,
                        backgroundColor: isCritOrHigh ? '#fffbfb' : '#ffffff',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                          {item.primaryDrug.name} ⚡ {item.interactingDrug.name}
                        </span>
                        <span className={`badge-${item.severity.toLowerCase()}`} style={{ padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700 }}>
                          {item.severity}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.85rem', marginBottom: '6px' }}>
                        <strong>Mechanism:</strong> {item.doctorSummary.clinicalMechanism}
                      </div>

                      <div style={{ fontSize: '0.85rem', marginBottom: '6px', backgroundColor: 'var(--color-surface-subtle)', padding: '6px 10px', borderRadius: 'var(--radius-sm)' }}>
                        <strong>Patient Guidance ({currentLanguage.toUpperCase()}):</strong> {localizedExpl?.actionAdvice || item.patientExplanation.actionAdvice}
                      </div>

                      {item.doctorSummary.monitoringParameters && item.doctorSummary.monitoringParameters.length > 0 && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                          <strong>Monitoring:</strong> {item.doctorSummary.monitoringParameters.join(', ')}
                        </div>
                      )}

                      {item.doctorSummary.alternativesForReview && item.doctorSummary.alternativesForReview.length > 0 && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-primary-hover)', marginTop: '4px' }}>
                          <strong>Physician Review Alternatives:</strong> {item.doctorSummary.alternativesForReview.map((a) => a.medicineName).join(', ')}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 3: Food Contraindications */}
          {foodInteractions.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, borderBottom: '1px solid var(--color-border)', paddingBottom: '6px', marginBottom: '10px' }}>
                3. Dietary &amp; Food Contraindications ({foodInteractions.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {foodInteractions.map((food) => (
                  <div
                    key={food.id}
                    className="print-break-inside-avoid"
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--severity-moderate-border)',
                      backgroundColor: 'var(--severity-moderate-bg)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>{food.drug.name} 🥗 {food.food.name}</strong>
                      <span className={`badge-${food.severity.toLowerCase()}`} style={{ padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700 }}>
                        {food.severity}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                      {food.dietaryRecommendation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Clinical Sign-off & Medical Disclaimer */}
          <div
            className="print-break-inside-avoid"
            style={{
              borderTop: '2px dashed var(--color-border)',
              paddingTop: '16px',
              marginTop: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Medical Safety Notice:</strong> {t('safetyDisclaimer', currentLanguage)}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                Generated via Presci-Check Clinical Decision-Support System
              </div>
              <div style={{ textAlign: 'center', width: '220px' }}>
                <div style={{ borderBottom: '1px solid #000000', marginBottom: '4px', height: '24px' }}></div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>Physician / Pharmacist Sign-Off</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
