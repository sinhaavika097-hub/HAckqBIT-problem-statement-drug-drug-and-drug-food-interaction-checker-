import React, { useState, useEffect } from 'react';
import {
  DrugDrugInteraction,
  DrugFoodInteraction,
  SupportedLanguage,
  InteractionSeverity,
} from '../types/interactions';
import { t, speakText, stopSpeech, getLocalizedPatientExplanation } from '../utils/localization';
import {
  Volume2,
  Square,
  AlertTriangle,
  Stethoscope,
  UserCheck,
  Utensils,
  Pill,
  ExternalLink,
  Info,
} from 'lucide-react';

interface InteractionDetailsProps {
  interaction: DrugDrugInteraction | DrugFoodInteraction | null;
  currentLanguage: SupportedLanguage;
}

const SEVERITY_CONFIG: Record<
  InteractionSeverity,
  { labelKey: 'severityLow' | 'severityModerate' | 'severityHigh' | 'severityCritical'; className: string }
> = {
  LOW: { labelKey: 'severityLow', className: 'badge-low' },
  MODERATE: { labelKey: 'severityModerate', className: 'badge-moderate' },
  HIGH: { labelKey: 'severityHigh', className: 'badge-high' },
  CRITICAL: { labelKey: 'severityCritical', className: 'badge-critical' },
};

export const InteractionDetails: React.FC<InteractionDetailsProps> = ({
  interaction,
  currentLanguage,
}) => {
  const [activeTab, setActiveTab] = useState<'PATIENT' | 'DOCTOR'>('PATIENT');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Stop speech if interaction or language changes or component unmounts
  useEffect(() => {
    stopSpeech();
    setIsSpeaking(false);
    return () => {
      stopSpeech();
    };
  }, [interaction, currentLanguage]);

  if (!interaction) {
    return (
      <div
        style={{
          padding: '40px 24px',
          textAlign: 'center',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-muted)',
        }}
      >
        <Info size={36} color="var(--color-text-subtle)" style={{ marginBottom: '12px' }} />
        <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px' }}>
          No Interaction Selected
        </h3>
        <p style={{ fontSize: '0.88rem' }}>
          Click on any connecting line or satellite node in the graph above to inspect its clinical details.
        </p>
      </div>
    );
  }

  const isDrugDrug = interaction.type === 'DRUG_DRUG';
  const sevConfig = SEVERITY_CONFIG[interaction.severity];

  const patientExp = getLocalizedPatientExplanation(
    interaction.id,
    currentLanguage,
    interaction.patientExplanation
  );

  const handleVoiceToggle = () => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
    } else {
      const speechContent = `${patientExp.summary}. ${patientExp.whatItMeans}. ${patientExp.actionAdvice}`;
      const started = speakText(
        speechContent,
        currentLanguage,
        () => setIsSpeaking(false),
        () => setIsSpeaking(false)
      );
      if (started) setIsSpeaking(true);
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
      }}
    >
      {/* Detail Header with Entity Names & Severity */}
      <div
        style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: '#fafbfc',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              padding: '10px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: isDrugDrug ? 'var(--color-primary-light)' : '#ffedd5',
              color: isDrugDrug ? 'var(--color-primary)' : '#ea580c',
            }}
          >
            {isDrugDrug ? <Pill size={24} /> : <Utensils size={24} />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                {isDrugDrug ? 'Drug-Drug Interaction' : 'Drug-Food Interaction'}
              </span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-main)', marginTop: '2px' }}>
              {isDrugDrug
                ? `${interaction.primaryDrug.name} ↔ ${interaction.interactingDrug.name}`
                : `${interaction.drug.name} ↔ ${interaction.food.name}`}
            </h2>
          </div>
        </div>

        {/* Severity Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            className={sevConfig.className}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.85rem',
              fontWeight: 700,
            }}
          >
            <AlertTriangle size={16} />
            <span>{t(sevConfig.labelKey, currentLanguage)}</span>
          </div>
        </div>
      </div>

      {/* View Switcher Tabs: Patient vs Doctor */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface)',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('PATIENT')}
          style={{
            flex: 1,
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '0.9rem',
            fontWeight: 600,
            border: 'none',
            borderBottom: activeTab === 'PATIENT' ? '3px solid var(--color-primary)' : '3px solid transparent',
            color: activeTab === 'PATIENT' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            backgroundColor: activeTab === 'PATIENT' ? '#f0fdfa' : 'transparent',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <UserCheck size={18} />
          <span>{t('patientViewTab', currentLanguage)}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('DOCTOR')}
          style={{
            flex: 1,
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '0.9rem',
            fontWeight: 600,
            border: 'none',
            borderBottom: activeTab === 'DOCTOR' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeTab === 'DOCTOR' ? '#2563eb' : 'var(--color-text-muted)',
            backgroundColor: activeTab === 'DOCTOR' ? '#eff6ff' : 'transparent',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Stethoscope size={18} />
          <span>{t('doctorViewTab', currentLanguage)}</span>
        </button>
      </div>

      {/* Tab Content Panel */}
      <div style={{ padding: '24px' }}>
        {activeTab === 'PATIENT' ? (
          <div>
            {/* Voice Audio Playback Bar */}
            <div
              style={{
                marginBottom: '20px',
                padding: '12px 18px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isSpeaking ? '#fef3c7' : '#f8fafc',
                border: '1px solid',
                borderColor: isSpeaking ? '#fde68a' : 'var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Volume2 size={20} color={isSpeaking ? '#b45309' : 'var(--color-primary)'} />
                <span style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--color-text-main)' }}>
                  {isSpeaking ? 'Reading explanation aloud...' : t('listenExplanation', currentLanguage)}
                </span>
              </div>
              <button
                type="button"
                onClick={handleVoiceToggle}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isSpeaking ? '#dc2626' : 'var(--color-primary)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {isSpeaking ? (
                  <>
                    <Square size={14} />
                    <span>{t('stopVoice', currentLanguage)}</span>
                  </>
                ) : (
                  <>
                    <Volume2 size={14} />
                    <span>{t('listenExplanation', currentLanguage)}</span>
                  </>
                )}
              </button>
            </div>

            {/* Core Patient-Friendly Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: '#fff', border: '1px solid var(--color-border)' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  What this means
                </h4>
                <p style={{ fontSize: '0.96rem', color: 'var(--color-text-main)', lineHeight: 1.6 }}>
                  {patientExp.whatItMeans}
                </p>
              </div>

              <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: '#fff', border: '1px solid var(--color-border)' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Why it matters for your health
                </h4>
                <p style={{ fontSize: '0.96rem', color: 'var(--color-text-main)', lineHeight: 1.6 }}>
                  {patientExp.whyItMatters}
                </p>
              </div>

              <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase', marginBottom: '6px' }}>
                  What you should do
                </h4>
                <p style={{ fontSize: '0.96rem', color: '#166534', lineHeight: 1.6, fontWeight: 500 }}>
                  {patientExp.actionAdvice}
                </p>
              </div>

              {!isDrugDrug && (
                <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: '#fff7ed', border: '1px solid #fed7aa' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#c2410c', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Dietary Guidance
                  </h4>
                  <p style={{ fontSize: '0.96rem', color: '#9a3412', lineHeight: 1.6 }}>
                    {(interaction as DrugFoodInteraction).dietaryRecommendation}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Doctor-Facing Clinical Panel */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: '#f8fafc', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase' }}>
                  Pharmacological Mechanism
                </h4>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0369a1', backgroundColor: '#e0f2fe', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>
                  Evidence: {interaction.doctorSummary.evidenceLevel}
                </span>
              </div>
              <p style={{ fontSize: '0.92rem', color: 'var(--color-text-main)', lineHeight: 1.6, fontFamily: 'monospace' }}>
                {interaction.doctorSummary.clinicalMechanism}
              </p>
            </div>

            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: '#f8fafc', border: '1px solid var(--color-border)' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>
                Suggested Clinical Action
              </h4>
              <p style={{ fontSize: '0.92rem', color: 'var(--color-text-main)', lineHeight: 1.6 }}>
                {interaction.doctorSummary.suggestedAction}
              </p>
              {interaction.doctorSummary.monitoringParameters && (
                <div style={{ marginTop: '10px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                    Monitoring Parameters:{' '}
                  </span>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                    {interaction.doctorSummary.monitoringParameters.map((param) => (
                      <span
                        key={param}
                        style={{
                          fontSize: '0.75rem',
                          backgroundColor: '#e2e8f0',
                          color: '#334155',
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        {param}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Possible Alternatives for Clinician Review Only */}
            {interaction.doctorSummary.alternativesForReview && interaction.doctorSummary.alternativesForReview.length > 0 && (
              <div
                style={{
                  padding: '18px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Stethoscope size={18} color="#1d4ed8" />
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e40af' }}>
                    {t('possibleAlternatives', currentLanguage)}
                  </h4>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#1e40af', marginBottom: '12px', fontStyle: 'italic' }}>
                  Notice: These options are catalogued solely for professional clinician evaluation. They are not prescriptive recommendations.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {interaction.doctorSummary.alternativesForReview.map((alt) => (
                    <div
                      key={alt.id}
                      style={{
                        padding: '12px 14px',
                        backgroundColor: '#ffffff',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid #dbeafe',
                      }}
                    >
                      <div style={{ fontWeight: 600, color: '#1e3a8a', fontSize: '0.92rem' }}>
                        {alt.medicineName}
                      </div>
                      <p style={{ fontSize: '0.84rem', color: '#475569', marginTop: '4px' }}>
                        {alt.rationale}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isDrugDrug && (interaction as DrugDrugInteraction).documentationUrl && (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <a
                  href={(interaction as DrugDrugInteraction).documentationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.82rem',
                    color: '#2563eb',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  <span>View NCBI / Clinical Documentation</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
