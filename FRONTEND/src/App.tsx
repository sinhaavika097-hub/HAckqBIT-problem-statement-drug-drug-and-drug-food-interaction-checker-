import React, { useState, useEffect, useCallback } from 'react';
import {
  Medicine,
  InteractionGraphData,
  DrugDrugInteraction,
  DrugFoodInteraction,
  GraphNode,
  GraphEdge,
  SupportedLanguage,
  ExtractedMedicine,
} from './types/interactions';
import { getInteractionsForMedicine, getGraphData, searchMedicines } from './services/interactionService';
import { Header } from './components/Header';
import { MedicineSearch } from './components/MedicineSearch';
import { InteractionGraph } from './components/InteractionGraph';
import { InteractionDetails } from './components/InteractionDetails';
import { PrescriptionUpload } from './components/PrescriptionUpload';
import { t } from './utils/localization';
import { Activity, FileText, Sparkles, AlertCircle, Loader2 } from 'lucide-react';

export const App: React.FC = () => {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en');
  const [activeTab, setActiveTab] = useState<'EXPLORER' | 'OCR'>('EXPLORER');

  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [graphData, setGraphData] = useState<InteractionGraphData>({ nodes: [], edges: [] });
  const [drugInteractions, setDrugInteractions] = useState<DrugDrugInteraction[]>([]);
  const [foodInteractions, setFoodInteractions] = useState<DrugFoodInteraction[]>([]);

  const [selectedInteraction, setSelectedInteraction] = useState<DrugDrugInteraction | DrugFoodInteraction | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [serviceError, setServiceError] = useState<string | null>(null);

  // Load interactions & graph whenever selected medicine changes
  const loadMedicineInteractions = useCallback(async (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setIsLoading(true);
    setServiceError(null);

    const [interactionsRes, graphRes] = await Promise.all([
      getInteractionsForMedicine(medicine.id),
      getGraphData(medicine.id),
    ]);

    setIsLoading(false);

    if (interactionsRes.error) setServiceError(interactionsRes.error);
    if (graphRes.error) setServiceError(graphRes.error);

    const ddis = interactionsRes.data?.drugInteractions || [];
    const dfis = interactionsRes.data?.foodInteractions || [];

    setDrugInteractions(ddis);
    setFoodInteractions(dfis);
    setGraphData(graphRes.data || { nodes: [], edges: [] });

    // Automatically select first significant interaction for immediate display
    if (ddis.length > 0) {
      setSelectedInteraction(ddis[0]);
      setSelectedNodeId(ddis[0].interactingDrug.id);
    } else if (dfis.length > 0) {
      setSelectedInteraction(dfis[0]);
      setSelectedNodeId(dfis[0].food.id);
    } else {
      setSelectedInteraction(null);
      setSelectedNodeId(null);
    }
  }, []);

  // Initial load: Pre-populate Warfarin as prominent polypharmacy demonstration
  useEffect(() => {
    async function initDemo() {
      const res = await searchMedicines('Warfarin');
      if (res.data && res.data.length > 0) {
        await loadMedicineInteractions(res.data[0]);
      }
    }
    initDemo();
  }, [loadMedicineInteractions]);

  // Handle graph node click
  const handleSelectNode = (node: GraphNode) => {
    setSelectedNodeId(node.id);
    // Find corresponding interaction
    const matchedDdi = drugInteractions.find((ddi) => ddi.interactingDrug.id === node.id);
    if (matchedDdi) {
      setSelectedInteraction(matchedDdi);
      return;
    }
    const matchedDfi = foodInteractions.find((dfi) => dfi.food.id === node.id);
    if (matchedDfi) {
      setSelectedInteraction(matchedDfi);
      return;
    }
  };

  // Handle graph edge click
  const handleSelectEdge = (edge: GraphEdge) => {
    const matched = [...drugInteractions, ...foodInteractions].find((i) => i.id === edge.id);
    if (matched) {
      setSelectedInteraction(matched);
      setSelectedNodeId(edge.target);
    }
  };

  // Handle OCR confirmed medicines
  const handleOcrConfirm = async (confirmedList: ExtractedMedicine[]) => {
    if (confirmedList.length === 0) return;
    const firstMedName = confirmedList[0].normalizedName;
    const res = await searchMedicines(firstMedName);
    if (res.data && res.data.length > 0) {
      await loadMedicineInteractions(res.data[0]);
    } else {
      // Fallback medicine entity if not directly in mock catalogue
      await loadMedicineInteractions({
        id: `ocr-${Date.now()}`,
        name: firstMedName,
        category: 'Extracted Prescription Medication',
      });
    }
    setActiveTab('EXPLORER');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-surface-subtle)' }}>
      {/* Top Clinical Header */}
      <Header currentLanguage={currentLanguage} onLanguageChange={setCurrentLanguage} />

      {/* Main App Content Container */}
      <main style={{ flex: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '24px 16px' }}>
        {/* Navigation Mode Selector */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: '#e2e8f0',
              borderRadius: 'var(--radius-md)',
              padding: '4px',
              gap: '4px',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('EXPLORER')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 20px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: activeTab === 'EXPLORER' ? '#ffffff' : 'transparent',
                color: activeTab === 'EXPLORER' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: activeTab === 'EXPLORER' ? 'var(--shadow-sm)' : 'none',
              }}
            >
              <Activity size={18} />
              <span>Drug Interaction Explorer</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('OCR')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 20px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: activeTab === 'OCR' ? '#ffffff' : 'transparent',
                color: activeTab === 'OCR' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: activeTab === 'OCR' ? 'var(--shadow-sm)' : 'none',
              }}
            >
              <FileText size={18} />
              <span>{t('ocrTab', currentLanguage)}</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Interaction Explorer Flow */}
        {activeTab === 'EXPLORER' && (
          <div>
            {/* Search Section */}
            <div style={{ marginBottom: '28px' }}>
              <MedicineSearch
                currentLanguage={currentLanguage}
                selectedMedicine={selectedMedicine}
                onSelectMedicine={loadMedicineInteractions}
              />
            </div>

            {/* Error Banner */}
            {serviceError && (
              <div
                style={{
                  maxWidth: '780px',
                  margin: '0 auto 20px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.88rem',
                }}
              >
                <AlertCircle size={18} />
                <span>{serviceError}</span>
              </div>
            )}

            {/* Loading Spinner */}
            {isLoading ? (
              <div
                style={{
                  height: '360px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-text-muted)',
                }}
              >
                <Loader2 size={36} color="var(--color-primary)" style={{ animation: 'spin 1s linear infinite' }} />
                <p style={{ marginTop: '12px', fontSize: '0.95rem', fontWeight: 500 }}>
                  {t('searchingText', currentLanguage)}
                </p>
              </div>
            ) : selectedMedicine ? (
              /* Two-Column Responsive Layout: Graph + Detailed Explanation */
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
                  gap: '24px',
                  alignItems: 'start',
                }}
              >
                {/* Left Column: Interactive Graph & Interaction Lists */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <InteractionGraph
                    data={graphData}
                    currentLanguage={currentLanguage}
                    selectedNodeId={selectedNodeId}
                    onSelectNode={handleSelectNode}
                    onSelectEdge={handleSelectEdge}
                  />

                  {/* Quick-Click Interaction Summary Bar */}
                  <div
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderRadius: 'var(--radius-md)',
                      padding: '16px',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                      All Detected Safety Risks ({drugInteractions.length + foodInteractions.length}):
                    </span>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                      {drugInteractions.map((ddi) => (
                        <button
                          key={ddi.id}
                          type="button"
                          onClick={() => {
                            setSelectedInteraction(ddi);
                            setSelectedNodeId(ddi.interactingDrug.id);
                          }}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid',
                            borderColor: selectedInteraction?.id === ddi.id ? 'var(--color-primary)' : 'var(--color-border)',
                            backgroundColor: selectedInteraction?.id === ddi.id ? 'var(--color-primary-light)' : '#ffffff',
                            color: 'var(--color-text-main)',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <span
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: ddi.severity === 'CRITICAL' ? '#dc2626' : '#ea580c',
                            }}
                          />
                          <span>{ddi.interactingDrug.name}</span>
                        </button>
                      ))}

                      {foodInteractions.map((dfi) => (
                        <button
                          key={dfi.id}
                          type="button"
                          onClick={() => {
                            setSelectedInteraction(dfi);
                            setSelectedNodeId(dfi.food.id);
                          }}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid',
                            borderColor: selectedInteraction?.id === dfi.id ? '#ea580c' : 'var(--color-border)',
                            backgroundColor: selectedInteraction?.id === dfi.id ? '#fff7ed' : '#ffffff',
                            color: 'var(--color-text-main)',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <span
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: '#d97706',
                            }}
                          />
                          <span>{dfi.food.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Detailed Patient Explanation + Doctor Summary */}
                <div>
                  <InteractionDetails interaction={selectedInteraction} currentLanguage={currentLanguage} />
                </div>
              </div>
            ) : (
              /* Empty State */
              <div
                style={{
                  padding: '60px 20px',
                  textAlign: 'center',
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                  maxWidth: '680px',
                  margin: '0 auto',
                }}
              >
                <Sparkles size={40} color="var(--color-primary)" style={{ marginBottom: '14px' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '8px' }}>
                  Begin Polypharmacy Interaction Check
                </h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                  {t('emptyStatePrompt', currentLanguage)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Prescription OCR Flow */}
        {activeTab === 'OCR' && (
          <div style={{ maxWidth: '880px', margin: '0 auto' }}>
            <PrescriptionUpload currentLanguage={currentLanguage} onConfirmMedicines={handleOcrConfirm} />
          </div>
        )}
      </main>

      {/* Footer & Compliance Notice */}
      <footer
        style={{
          borderTop: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface)',
          padding: '20px 24px',
          textAlign: 'center',
          fontSize: '0.82rem',
          color: 'var(--color-text-muted)',
          marginTop: 'auto',
        }}
      >
        <p style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>
          Drug-Drug &amp; Drug-Food Interaction Checker &bull; Track: Bio-Pharma Safety
        </p>
        <p style={{ marginTop: '4px' }}>
          Notice: Prototype developed for collegiate hackathon demonstration. All recommendations require clinical physician oversight.
        </p>
      </footer>
    </div>
  );
};
