/**
 * Centralized Interaction API Service Layer
 * Bio-Pharma Safety / Polypharmacy Management
 *
 * Connects directly to the high-performance C++ REST Backend API (port 8080).
 * Features automatic resilient fallback to verified clinical mock records
 * when operating offline or during standalone presentations.
 */

import {
  Medicine,
  DrugDrugInteraction,
  DrugFoodInteraction,
  InteractionGraphData,
  PrescriptionOcrResult,
} from '../types/interactions';
import {
  MOCK_MEDICINES,
  MOCK_DRUG_DRUG_INTERACTIONS,
  MOCK_DRUG_FOOD_INTERACTIONS,
  buildMockGraphData,
  buildMultiMedicineGraphData,
} from './mockData';

const API_BASE_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) || 'http://127.0.0.1:8080/api/v1';

const TIMEOUT_MS = 1500;

export interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
  isMock: boolean;
}

// Timeout fetch wrapper to ensure UI remains snappy even if backend is offline
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

/**
 * Checks if the C++ REST backend server is live and responsive
 */
export async function checkBackendHealth(): Promise<{ isLive: boolean; message: string }> {
  try {
    const res = await fetchWithTimeout('http://127.0.0.1:8080/health', {}, 1000);
    if (res.ok) {
      return { isLive: true, message: 'Connected to Presci-Check C++ Engine' };
    }
  } catch {
    // Backend offline
  }
  return { isLive: false, message: 'Offline Demo Mode' };
}

/**
 * Searches medicine directory by name or generic name
 * C++ Endpoint: GET /api/v1/medicines/search?q={query}
 */
export async function searchMedicines(query: string): Promise<ServiceResponse<Medicine[]>> {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) {
    return { data: [], error: null, isMock: false };
  }

  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/medicines/search?q=${encodeURIComponent(cleanQuery)}`);
    if (res.ok) {
      const data: Medicine[] = await res.json();
      return { data, error: null, isMock: false };
    }
  } catch {
    // Graceful fallback to local mock catalogue
  }

  const matches = MOCK_MEDICINES.filter(
    (med) =>
      med.name.toLowerCase().includes(cleanQuery) ||
      med.genericName?.toLowerCase().includes(cleanQuery) ||
      med.brandNames?.some((b) => b.toLowerCase().includes(cleanQuery))
  );
  return { data: matches, error: null, isMock: true };
}

/**
 * Fetches all Drug-Drug and Drug-Food interactions for a selected medicine
 * C++ Endpoint: GET /api/v1/interactions?medicineId={medicineId}
 */
export async function getInteractionsForMedicine(
  medicineId: string
): Promise<ServiceResponse<{ drugInteractions: DrugDrugInteraction[]; foodInteractions: DrugFoodInteraction[] }>> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/interactions?medicineId=${encodeURIComponent(medicineId)}`);
    if (res.ok) {
      const data = await res.json();
      return { data, error: null, isMock: false };
    }
  } catch {
    // Graceful fallback to local mock interactions
  }

  const ddis = MOCK_DRUG_DRUG_INTERACTIONS.filter(
    (ddi) => ddi.primaryDrug.id === medicineId || ddi.interactingDrug.id === medicineId
  );
  const dfis = MOCK_DRUG_FOOD_INTERACTIONS.filter((dfi) => dfi.drug.id === medicineId);

  return {
    data: { drugInteractions: ddis, foodInteractions: dfis },
    error: null,
    isMock: true,
  };
}

/**
 * Retrieves the semantic graph representation centered on a medicine
 */
export async function getGraphData(medicineId: string): Promise<ServiceResponse<InteractionGraphData>> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/interactions/regimen`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ medicineIds: [medicineId] }),
    });
    if (res.ok) {
      const multiResp: MultiMedicineResponse = await res.json();
      return { data: multiResp.graphData, error: null, isMock: false };
    }
  } catch {
    // Fallback to local mock graph generator
  }

  const primary = MOCK_MEDICINES.find((m) => m.id === medicineId);
  if (!primary) {
    return { data: null, error: `Medicine with ID "${medicineId}" not found in catalogue.`, isMock: true };
  }
  const graph = buildMockGraphData(primary);
  return { data: graph, error: null, isMock: true };
}

export interface MultiMedicineResponse {
  graphData: InteractionGraphData;
  drugInteractions: DrugDrugInteraction[];
  foodInteractions: DrugFoodInteraction[];
}

/**
 * Retrieves the unified interaction network across an entire list of medications (Polypharmacy Regimen)
 * C++ Endpoint: POST /api/v1/interactions/regimen
 */
export async function getMultiMedicineInteractions(
  medicineIds: string[]
): Promise<ServiceResponse<MultiMedicineResponse>> {
  if (medicineIds.length === 0) {
    return {
      data: { graphData: { nodes: [], edges: [] }, drugInteractions: [], foodInteractions: [] },
      error: null,
      isMock: false,
    };
  }

  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/interactions/regimen`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ medicineIds }),
    });
    if (res.ok) {
      const data: MultiMedicineResponse = await res.json();
      return { data, error: null, isMock: false };
    }
  } catch {
    // Fallback to client-side polypharmacy evaluator
  }

  const matchedMeds = MOCK_MEDICINES.filter((m) => medicineIds.includes(m.id));
  const graph = buildMultiMedicineGraphData(matchedMeds.length > 0 ? matchedMeds : MOCK_MEDICINES.slice(0, 2));

  const ddis: DrugDrugInteraction[] = [];
  for (let i = 0; i < matchedMeds.length; i++) {
    for (let j = i + 1; j < matchedMeds.length; j++) {
      const medA = matchedMeds[i];
      const medB = matchedMeds[j];
      const match = MOCK_DRUG_DRUG_INTERACTIONS.find(
        (ddi) =>
          (ddi.primaryDrug.id === medA.id && ddi.interactingDrug.id === medB.id) ||
          (ddi.primaryDrug.id === medB.id && ddi.interactingDrug.id === medA.id)
      );
      if (match) ddis.push(match);
    }
  }

  const dfis = MOCK_DRUG_FOOD_INTERACTIONS.filter((dfi) => medicineIds.includes(dfi.drug.id));

  return {
    data: {
      graphData: graph,
      drugInteractions: ddis,
      foodInteractions: dfis,
    },
    error: null,
    isMock: true,
  };
}

/**
 * Submits an uploaded prescription image or text for OCR processing & extraction
 * C++ Endpoint: POST /api/v1/ocr/scan
 */
export async function processPrescriptionOcr(file: File): Promise<ServiceResponse<PrescriptionOcrResult>> {
  try {
    const textContent = await file.text();
    const res = await fetchWithTimeout(`${API_BASE_URL}/ocr/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: textContent, filename: file.name }),
    });
    if (res.ok) {
      const data: PrescriptionOcrResult = await res.json();
      data.imageUrl = URL.createObjectURL(file);
      return { data, error: null, isMock: false };
    }
  } catch {
    // Fallback to demo OCR pipeline
  }

  // Fallback demo parser
  const mockResult: PrescriptionOcrResult = {
    imageUrl: URL.createObjectURL(file),
    processingTimeMs: 420,
    extractedMedicines: [
      {
        id: 'ocr-1',
        rawText: 'Tab Warfarin 5mg OD',
        normalizedName: 'Warfarin',
        confidence: 0.94,
        isConfirmed: false,
        dosage: '5mg',
        frequency: 'Once Daily',
      },
      {
        id: 'ocr-2',
        rawText: 'Tab Ecosprin 75mg BD',
        normalizedName: 'Aspirin',
        confidence: 0.88,
        isConfirmed: false,
        dosage: '75mg',
        frequency: 'Twice Daily',
      },
      {
        id: 'ocr-3',
        rawText: 'Tab Atorva 20mg HS',
        normalizedName: 'Atorvastatin',
        confidence: 0.91,
        isConfirmed: false,
        dosage: '20mg',
        frequency: 'At Bedtime',
      },
    ],
    rawOcrText: 'Rx:\n1. Tab Warfarin 5mg OD\n2. Tab Ecosprin 75mg BD\n3. Tab Atorva 20mg HS\nDr. R. Sharma, MD',
  };

  return { data: mockResult, error: null, isMock: true };
}

