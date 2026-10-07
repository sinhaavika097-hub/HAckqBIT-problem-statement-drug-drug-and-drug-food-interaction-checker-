import React, { useState, useRef } from 'react';
import { ExtractedMedicine, SupportedLanguage } from '../types/interactions';
import { processPrescriptionOcr } from '../services/interactionService';
import { t } from '../utils/localization';
import {
  FileText,
  CheckCircle2,
  Edit3,
  Loader2,
  Camera,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react';

interface PrescriptionUploadProps {
  currentLanguage: SupportedLanguage;
  onConfirmMedicines: (medicines: ExtractedMedicine[]) => void;
}

export const PrescriptionUpload: React.FC<PrescriptionUploadProps> = ({
  currentLanguage,
  onConfirmMedicines,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedList, setExtractedList] = useState<ExtractedMedicine[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    await runOcr(file);
  };

    // Offline-resilient embedded SVG prescription preview
    const sampleRxSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240" viewBox="0 0 400 240"><rect width="100%" height="100%" fill="%23fdfbf7" stroke="%23cbd5e1" stroke-width="2"/><text x="20" y="32" font-family="serif" font-size="16" font-weight="bold" fill="%230f172a">CITY HEALTH CLINIC</text><text x="20" y="50" font-family="sans-serif" font-size="11" fill="%2364748b">Dr. R. Sharma, MD &bull; Reg: 84920</text><line x1="20" y1="60" x2="380" y2="60" stroke="%2394a3b8" stroke-dasharray="2 2"/><text x="20" y="90" font-family="serif" font-size="22" font-weight="bold" fill="%230d9488">&#8478;</text><text x="50" y="105" font-family="sans-serif" font-size="13" font-weight="bold" fill="%231e293b">1. Tab Warfarin 5mg &mdash; OD</text><text x="50" y="135" font-family="sans-serif" font-size="13" font-weight="bold" fill="%231e293b">2. Tab Ecosprin 75mg &mdash; BD</text><text x="50" y="165" font-family="sans-serif" font-size="13" font-weight="bold" fill="%231e293b">3. Tab Atorva 20mg &mdash; HS</text><text x="250" y="215" font-family="cursive" font-size="14" fill="%232563eb">Dr. R. Sharma</text></svg>`;
    setImagePreview(sampleRxSvg);
    await runOcr(mockFile);
  };

  const runOcr = async (file: File) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setExtractedList([]);

    const res = await processPrescriptionOcr(file);
    setIsProcessing(false);

    if (res.error) {
      setErrorMessage(res.error);
    } else if (res.data) {
      setExtractedList(res.data.extractedMedicines);
    }
  };

  const toggleConfirm = (id: string) => {
    setExtractedList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isConfirmed: !item.isConfirmed } : item))
    );
  };

  const updateNormalizedName = (id: string, newName: string) => {
    setExtractedList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, normalizedName: newName } : item))
    );
  };

  const handleConfirmAllAndProceed = () => {
    const confirmed = extractedList.filter((m) => m.isConfirmed);
    if (confirmed.length === 0) {
      alert('Please confirm at least one extracted medicine before proceeding.');
      return;
    }
    onConfirmMedicines(confirmed);
  };

  const selectAll = () => {
    setExtractedList((prev) => prev.map((m) => ({ ...m, isConfirmed: true })));
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        padding: '24px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
            {t('uploadPrescription', currentLanguage)}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            Scan handwritten or printed doctor prescriptions to automatically extract medication names for interaction checking.
          </p>
        </div>

        {/* Quick Demo Button */}
        <button
          type="button"
          onClick={handleSampleRx}
          disabled={isProcessing}
          style={{
            padding: '6px 14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#f0fdfa',
            color: 'var(--color-primary)',
            border: '1px solid var(--color-primary-light)',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Sparkles size={15} />
          <span>Load Sample Rx Demo</span>
        </button>
      </div>

      {/* Upload Drop Zone & Preview */}
      <div style={{ display: 'grid', gridTemplateColumns: imagePreview ? '1fr 1.2fr' : '1fr', gap: '24px' }}>
        <div>
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '32px 16px',
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: '#fafbfc',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
              }}
            >
              <Camera size={24} />
            </div>
            <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text-main)' }}>
              Click or drag prescription photo here
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              Supports JPG, PNG, WEBP (Handwritten or Printed)
            </p>
          </div>

          {imagePreview && (
            <div style={{ marginTop: '16px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                Prescription Preview:
              </span>
              <div
                style={{
                  marginTop: '6px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  border: '1px solid var(--color-border)',
                  maxHeight: '220px',
                }}
              >
                <img
                  src={imagePreview}
                  alt="Prescription Scan"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* OCR Processing State & Verification List */}
        <div>
          {isProcessing ? (
            <div
              style={{
                height: '240px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f8fafc',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
              }}
            >
              <Loader2 size={36} color="var(--color-primary)" style={{ animation: 'spin 1s linear infinite' }} />
              <p style={{ marginTop: '14px', fontWeight: 600, color: 'var(--color-text-main)' }}>
                Analyzing handwritten prescription...
              </p>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                Running optical character recognition &amp; drug entity normalization
              </p>
            </div>
          ) : extractedList.length > 0 ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                  Extracted Medicines ({extractedList.length}) - Please Review &amp; Confirm:
                </span>
                <button
                  type="button"
                  onClick={selectAll}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--color-primary)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Select All
                </button>
              </div>

              {/* Medicine Review Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto' }}>
                {extractedList.map((med) => (
                  <div
                    key={med.id}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid',
                      borderColor: med.isConfirmed ? '#a7f3d0' : 'var(--color-border)',
                      backgroundColor: med.isConfirmed ? '#f0fdf4' : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleConfirm(med.id)}
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
                    >
                      {med.isConfirmed ? (
                        <CheckSquare size={22} color="#16a34a" />
                      ) : (
                        <Square size={22} color="var(--color-text-subtle)" />
                      )}
                    </button>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Raw text:</span>
                        <code style={{ fontSize: '0.78rem', backgroundColor: '#f1f5f9', padding: '1px 6px', borderRadius: '4px' }}>
                          {med.rawText}
                        </code>
                      </div>

                      {/* Editable Normalized Medicine Name */}
                      <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input
                          type="text"
                          value={med.normalizedName}
                          onChange={(e) => updateNormalizedName(med.id, e.target.value)}
                          aria-label="Normalized medicine name"
                          style={{
                            padding: '4px 8px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--color-border)',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            color: 'var(--color-text-main)',
                            width: '180px',
                          }}
                        />
                        <Edit3 size={14} color="var(--color-text-subtle)" />
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                          {med.dosage}
                        </span>
                      </div>
                    </div>

                    {/* Confidence Score */}
                    <div style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backgroundColor: med.confidence >= 0.9 ? '#ecfdf5' : '#fffbeb',
                          color: med.confidence >= 0.9 ? '#059669' : '#d97706',
                          border: '1px solid',
                          borderColor: med.confidence >= 0.9 ? '#a7f3d0' : '#fde68a',
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        {Math.round(med.confidence * 100)}% match
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Confirm & Check Interactions Button */}
              <button
                type="button"
                onClick={handleConfirmAllAndProceed}
                style={{
                  marginTop: '16px',
                  width: '100%',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-primary)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <CheckCircle2 size={18} />
                <span>{t('confirmMedications', currentLanguage)}</span>
              </button>
            </div>
          ) : (
            <div
              style={{
                height: '240px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f8fafc',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-muted)',
                textAlign: 'center',
                padding: '20px',
              }}
            >
              <FileText size={36} color="var(--color-text-subtle)" style={{ marginBottom: '8px' }} />
              <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>No prescription uploaded yet</p>
              <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                Upload an image or click &quot;Load Sample Rx Demo&quot; to test the OCR verification pipeline.
              </p>
            </div>
          )}

          {errorMessage && (
            <p style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '10px' }}>{errorMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
};
