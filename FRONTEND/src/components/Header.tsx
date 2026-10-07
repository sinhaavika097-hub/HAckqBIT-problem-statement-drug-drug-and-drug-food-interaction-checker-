import React from 'react';
import { SupportedLanguage } from '../types/interactions';
import { t } from '../utils/localization';
import { ShieldAlert, Languages, HeartPulse } from 'lucide-react';

interface HeaderProps {
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  isBackendLive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ currentLanguage, onLanguageChange, isBackendLive = false }) => {
  return (
    <header style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
      {/* Top Clinical Safety Alert Banner */}
      <div
        style={{
          backgroundColor: '#eff6ff',
          borderBottom: '1px solid #bfdbfe',
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontSize: '0.82rem',
          color: '#1e40af',
          textAlign: 'center',
        }}
      >
        <ShieldAlert size={16} color="#2563eb" aria-hidden="true" style={{ flexShrink: 0 }} />
        <span>{t('safetyDisclaimer', currentLanguage)}</span>
      </div>

      {/* Main Header Navigation Bar */}
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        {/* Brand / Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              borderRadius: 'var(--radius-md)',
              padding: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <HeartPulse size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text-main)', letterSpacing: '-0.02em' }}>
                {t('appTitle', currentLanguage)}
              </h1>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid #cbd5e1',
                  textTransform: 'uppercase',
                }}
              >
                Bio-Pharma Safety
              </span>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  backgroundColor: isBackendLive ? '#ecfdf5' : '#fffbeb',
                  color: isBackendLive ? '#047857' : '#b45309',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  border: isBackendLive ? '1px solid #a7f3d0' : '1px solid #fde68a',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: isBackendLive ? '#10b981' : '#f59e0b',
                  }}
                />
                {isBackendLive ? 'Live C++ Engine' : 'Offline Demo Mode'}
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              {t('appSubtitle', currentLanguage)}
            </p>
          </div>
        </div>

        {/* Language Selection Control */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Languages size={18} color="var(--color-text-muted)" aria-hidden="true" />
          <label htmlFor="language-selector" style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
            Language:
          </label>
          <select
            id="language-selector"
            value={currentLanguage}
            onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              fontSize: '0.85rem',
              fontWeight: 500,
              color: 'var(--color-text-main)',
              cursor: 'pointer',
            }}
          >
            <option value="en">English (EN)</option>
            <option value="hi">हिन्दी (Hindi)</option>
            <option value="bn">বাংলা (Bengali)</option>
          </select>
        </div>
      </div>
    </header>
  );
};

