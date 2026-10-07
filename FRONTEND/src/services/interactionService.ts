/**
 * Centralized Interaction API Service Layer
 * Bio-Pharma Safety / Polypharmacy Management
 *
 * Designed to cleanly switch between isolated mock demo data
 * and the live C++ backend API endpoints once ready.
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
} from './mockData';

// Configuration: Switch between isolated mock data and live C++ backend
const USE_MOCK_DATA = true;
const API_BASE_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) || 'http://localhost:8080/api/v1';

export interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
  isMock: boolean;
}

/**
 * Searches medicine directory by name or generic name
 * Planned C++ Endpoint: GET /api/v1/medicines/search?q={query}
 */
export async function searchMedicines(query: string): Promise<ServiceResponse<Medicine[]>> {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) {
    return { data: [], error: null, isMock: USE_MOCK_DATA };
  }

  if (USE_MOCK_DATA) {
    // Simulate brief network latency for realistic UX validation
    await new Promise((res) => setTimeout(res, 200));

    const matches = MOCK_MEDICINES.filter(
      (med) =>
        med.name.toLowerCase().includes(cleanQuery) ||
        med.genericName?.toLowerCase().includes(cleanQuery) ||
        med.brandNames?.some((b) => b.toLowerCase().includes(cleanQuery))
    );

    return { data: matches, error: null, isMock: true };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/medicines/search?q=${encodeURIComponent(cleanQuery)}`);
    if (!res.ok) throw new Error(`Backend error (${res.status}): Failed to search medicines.`);
    const data: Medicine[] = await res.json();
    return { data, error: null, isMock: false };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unable to connect to backend service.';
    return { data: null, error: message, isMock: false };
  }
}

/**
 * Fetches all Drug-Drug and Drug-Food interactions for a selected medicine
 * Planned C++ Endpoint: GET /api/v1/interactions?medicine_id={medicineId}
 */
export async function getInteractionsForMedicine(
  medicineId: string
): Promise<ServiceResponse<{ drugInteractions: DrugDrugInteraction[]; foodInteractions: DrugFoodInteraction[] }>> {
  if (USE_MOCK_DATA) {
    await new Promise((res) => setTimeout(res, 250));

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

  try {
    const res = await fetch(`${API_BASE_URL}/interactions?medicine_id=${encodeURIComponent(medicineId)}`);
    if (!res.ok) throw new Error(`Backend error (${res.status}): Failed to retrieve interaction records.`);
    const data = await res.json();
    return { data, error: null, isMock: false };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unable to connect to backend service.';
    return { data: null, error: message, isMock: false };
  }
}

/**
 * Retrieves the graph representation centered on a medicine
 * Planned C++ Endpoint: GET /api/v1/graph?medicine_id={medicineId}
 */
export async function getGraphData(medicineId: string): Promise<ServiceResponse<InteractionGraphData>> {
  if (USE_MOCK_DATA) {
    await new Promise((res) => setTimeout(res, 180));
    const primary = MOCK_MEDICINES.find((m) => m.id === medicineId);
    if (!primary) {
      return { data: null, error: `Medicine with ID "${medicineId}" not found in catalogue.`, isMock: true };
    }
    const graph = buildMockGraphData(primary);
    return { data: graph, error: null, isMock: true };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/graph?medicine_id=${encodeURIComponent(medicineId)}`);
    if (!res.ok) throw new Error(`Backend error (${res.status}): Failed to retrieve interaction graph.`);
    const data: InteractionGraphData = await res.json();
    return { data, error: null, isMock: false };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unable to connect to backend service.';
    return { data: null, error: message, isMock: false };
  }
}

/**
 * Submits an uploaded prescription image for OCR processing & extraction
 * Planned C++ Endpoint: POST /api/v1/ocr/scan (multipart/form-data)
 */
export async function processPrescriptionOcr(file: File): Promise<ServiceResponse<PrescriptionOcrResult>> {
  if (USE_MOCK_DATA) {
    // Simulate OCR pipeline latency (1.2s)
    await new Promise((res) => setTimeout(res, 1200));

    const mockResult: PrescriptionOcrResult = {
      imageUrl: URL.createObjectURL(file),
      processingTimeMs: 1180,
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

  try {
    const formData = new FormData();
    formData.append('prescription', file);

    const res = await fetch(`${API_BASE_URL}/ocr/scan`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) throw new Error(`OCR processing failed with status ${res.status}.`);
    const data: PrescriptionOcrResult = await res.json();
    return { data, error: null, isMock: false };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Prescription OCR service unavailable.';
    return { data: null, error: message, isMock: false };
  }
}
