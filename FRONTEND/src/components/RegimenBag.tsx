import React from 'react';
import { Medicine, SupportedLanguage } from '../types/interactions';
import { Pill, Trash2, PlusCircle, Sparkles, ShieldCheck } from 'lucide-react';

interface RegimenBagProps {
  regimen: Medicine[];
  currentLanguage: SupportedLanguage;
  onRemoveMedicine: (id: string) => void;
  onLoadElderlyPreset: () => void;
  onCheckRegimen: () => void;
  isChecking: boolean;
}

export const RegimenBag: React.FC<RegimenBagProps> = ({
  regimen,
  currentLanguage: _currentLanguage,
  onRemoveMedicine,
  onLoadElderlyPreset,
  onCheckRegimen,
  isChecking,
}) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        padding: '20px 24px',
        marginBottom: '24px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
              Patient Medication Bag
            </h3>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: regimen.length >= 5 ? '#fef2f2' : '#f0fdfa',
                color: regimen.length >= 5 ? '#dc2626' : 'var(--color-primary)',
                border: '1px solid',
                borderColor: regimen.length >= 5 ? '#fecaca' : 'var(--color-primary-light)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              {regimen.length} {regimen.length === 1 ? 'Medicine' : 'Medicines'}
              {regimen.length >= 5 ? ' (Polypharmacy Alert: 5+ Rx)' : ''}
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            Add multiple prescriptions to identify cross-interactions between independent doctors&apos; orders.
          </p>
        </div>

        {/* Action Preset Button */}
        <button
          type="button"
          onClick={onLoadElderlyPreset}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#eff6ff',
            color: '#1d4ed8',
            border: '1px solid #bfdbfe',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background-color 0.15s',
          }}
        >
          <Sparkles size={15} />
          <span>Load Elderly Regimen (5 Rx Preset)</span>
        </button>
      </div>

      {/* Regimen Chips Container */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          minHeight: '48px',
          alignItems: 'center',
          backgroundColor: '#fafbfc',
          padding: '12px',
          borderRadius: 'var(--radius-md)',
          border: '1px dashed var(--color-border)',
        }}
      >
        {regimen.length > 0 ? (
          regimen.map((med) => (
            <div
              key={med.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--color-border)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                fontSize: '0.84rem',
                fontWeight: 600,
                color: 'var(--color-text-main)',
              }}
            >
              <Pill size={14} color="var(--color-primary)" />
              <span>{med.name}</span>
              {med.dosage && (
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                  ({med.dosage})
                </span>
              )}
              <button
                type="button"
                onClick={() => onRemoveMedicine(med.id)}
                title={`Remove ${med.name}`}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--color-text-subtle)',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#dc2626')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-subtle)')}
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-subtle)', fontSize: '0.84rem' }}>
            <PlusCircle size={16} />
            <span>Medication bag is empty. Search medicines above or load the elderly preset.</span>
          </div>
        )}
      </div>

      {/* Check Regimen Cross-Interactions Button */}
      {regimen.length >= 2 && (
        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onCheckRegimen}
            disabled={isChecking}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 18px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <ShieldCheck size={18} />
            <span>Analyze Cross-Interactions ({regimen.length} Medications)</span>
          </button>
        </div>
      )}
    </div>
  );
};
