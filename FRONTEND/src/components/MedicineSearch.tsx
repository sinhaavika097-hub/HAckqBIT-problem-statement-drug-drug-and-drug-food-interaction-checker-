import React, { useState, useEffect, useRef } from 'react';
import { Medicine, SupportedLanguage } from '../types/interactions';
import { searchMedicines } from '../services/interactionService';
import { t } from '../utils/localization';
import { Search, Loader2, Pill, AlertCircle } from 'lucide-react';

interface MedicineSearchProps {
  currentLanguage: SupportedLanguage;
  selectedMedicine: Medicine | null;
  onSelectMedicine: (medicine: Medicine) => void;
}

const QUICK_DEMO_MEDICINES = ['Warfarin', 'Aspirin', 'Atorvastatin', 'Metformin', 'Ciprofloxacin'];

export const MedicineSearch: React.FC<MedicineSearchProps> = ({
  currentLanguage,
  selectedMedicine,
  onSelectMedicine,
}) => {
  const [query, setQuery] = useState(selectedMedicine ? selectedMedicine.name : '');
  const [suggestions, setSuggestions] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync with selectedMedicine prop if changed from external source (e.g., OCR or Quick Select)
  useEffect(() => {
    if (selectedMedicine) {
      setQuery(selectedMedicine.name);
    }
  }, [selectedMedicine]);

  // Debounced search effect
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoading(false);
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      setSearchError(null);
      const res = await searchMedicines(query);
      setIsLoading(false);
      setHasSearched(true);

      if (res.error) {
        setSearchError(res.error);
        setSuggestions([]);
      } else {
        setSuggestions(res.data || []);
        setIsOpen(true);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (med: Medicine) => {
    setQuery(med.name);
    setIsOpen(false);
    onSelectMedicine(med);
  };

  const handleQuickDemoClick = async (medName: string) => {
    setQuery(medName);
    setIsLoading(true);
    const res = await searchMedicines(medName);
    setIsLoading(false);
    if (res.data && res.data.length > 0) {
      handleSelect(res.data[0]);
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        maxWidth: '780px',
        margin: '0 auto',
        position: 'relative',
      }}
    >
      {/* Search Input Container */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-md)',
          border: '2px solid var(--color-border)',
          padding: '8px 16px',
          boxShadow: 'var(--shadow-sm)',
          transition: 'border-color 0.2s',
        }}
      >
        <Search size={22} color="var(--color-text-muted)" style={{ flexShrink: 0, marginRight: '12px' }} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={t('searchPlaceholder', currentLanguage)}
          aria-label="Search medicine"
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            fontSize: '1rem',
            color: 'var(--color-text-main)',
            backgroundColor: 'transparent',
          }}
        />
        {isLoading && (
          <Loader2
            size={20}
            color="var(--color-primary)"
            style={{ animation: 'spin 1s linear infinite', marginLeft: '8px' }}
          />
        )}
      </div>

      {/* Autocomplete / Search Results Dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--color-border)',
            maxHeight: '320px',
            overflowY: 'auto',
            zIndex: 50,
          }}
        >
          {suggestions.length > 0 ? (
            suggestions.map((med) => (
              <div
                key={med.id}
                onClick={() => handleSelect(med)}
                style={{
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--color-border)',
                  transition: 'background-color 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-subtle)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Pill size={18} color="var(--color-primary)" />
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-main)', fontSize: '0.95rem' }}>
                      {med.name} {med.dosage ? `(${med.dosage})` : ''}
                    </div>
                    {med.genericName && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        Generic: {med.genericName}
                      </div>
                    )}
                  </div>
                </div>
                {med.category && (
                  <span
                    style={{
                      fontSize: '0.75rem',
                      backgroundColor: '#f1f5f9',
                      color: '#475569',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    {med.category}
                  </span>
                )}
              </div>
            ))
          ) : hasSearched && !isLoading ? (
            <div
              style={{
                padding: '20px',
                textAlign: 'center',
                color: 'var(--color-text-muted)',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <AlertCircle size={18} color="var(--color-text-subtle)" />
              <span>{searchError || 'No matching medicine found. Try generic names like Warfarin or Aspirin.'}</span>
            </div>
          ) : null}
        </div>
      )}

      {/* Quick Select Demonstration Pills */}
      <div
        style={{
          marginTop: '12px',
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          fontSize: '0.82rem',
          color: 'var(--color-text-muted)',
        }}
      >
        <span style={{ fontWeight: 500 }}>Quick test:</span>
        {QUICK_DEMO_MEDICINES.map((medName) => (
          <button
            key={medName}
            type="button"
            onClick={() => handleQuickDemoClick(medName)}
            style={{
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: query === medName ? 'var(--color-primary-light)' : '#f1f5f9',
              color: query === medName ? 'var(--color-primary)' : '#334155',
              border: '1px solid',
              borderColor: query === medName ? 'var(--color-primary)' : '#e2e8f0',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.8rem',
              transition: 'all 0.15s ease',
            }}
          >
            {medName}
          </button>
        ))}
      </div>
    </div>
  );
};
