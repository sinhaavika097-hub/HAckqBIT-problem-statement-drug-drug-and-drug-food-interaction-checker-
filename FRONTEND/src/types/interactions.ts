/**
 * Core Type Definitions for Drug-Drug & Drug-Food Interaction Checker
 * Bio-Pharma Safety / Polypharmacy Management
 */

export type InteractionSeverity = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export type InteractionType = 'DRUG_DRUG' | 'DRUG_FOOD';

export interface Medicine {
  id: string;
  name: string;
  genericName?: string;
  brandNames?: string[];
  dosage?: string;
  category?: string;
}

export interface FoodItem {
  id: string;
  name: string;
  category: 'FRUIT' | 'DAIRY' | 'BEVERAGE' | 'ALCOHOL' | 'HERB' | 'GENERAL_FOOD';
  commonExamples?: string[];
}

export interface ClinicianAlternative {
  id: string;
  medicineName: string;
  rationale: string;
  requiresPrescription: boolean;
  /** Explicit disclaimer ensuring compliance with healthcare safety rules */
  safetyNote: 'Possible alternative for clinician review only. Do not alter medication without physician consultation.';
}

export interface PatientExplanation {
  summary: string;
  whatItMeans: string;
  whyItMatters: string;
  actionAdvice: string;
}

export interface DoctorSummary {
  clinicalMechanism: string;
  evidenceLevel: 'ESTABLISHED' | 'PROBABLE' | 'SUSPECTED' | 'THEORETICAL';
  suggestedAction: string;
  monitoringParameters?: string[];
  alternativesForReview?: ClinicianAlternative[];
}

export interface DrugDrugInteraction {
  id: string;
  type: 'DRUG_DRUG';
  primaryDrug: Medicine;
  interactingDrug: Medicine;
  severity: InteractionSeverity;
  patientExplanation: PatientExplanation;
  doctorSummary: DoctorSummary;
  documentationUrl?: string;
}

export interface DrugFoodInteraction {
  id: string;
  type: 'DRUG_FOOD';
  drug: Medicine;
  food: FoodItem;
  severity: InteractionSeverity;
  patientExplanation: PatientExplanation;
  doctorSummary: DoctorSummary;
  dietaryRecommendation: string;
}

export type Interaction = DrugDrugInteraction | DrugFoodInteraction;

/** Interactive Graph Node and Edge Contracts */
export type GraphNodeType = 'PRIMARY_DRUG' | 'INTERACTING_DRUG' | 'FOOD';

export interface GraphNode {
  id: string;
  label: string;
  subLabel?: string;
  type: GraphNodeType;
  severity?: InteractionSeverity;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: InteractionType;
  severity: InteractionSeverity;
  label: string;
}

export interface InteractionGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/** Prescription OCR Types */
export interface ExtractedMedicine {
  id: string;
  rawText: string;
  normalizedName: string;
  confidence: number; // 0 to 1
  isConfirmed: boolean;
  dosage?: string;
  frequency?: string;
}

export interface PrescriptionOcrResult {
  imageUrl: string;
  processingTimeMs: number;
  extractedMedicines: ExtractedMedicine[];
  rawOcrText?: string;
}

/** Supported Languages for Localization */
export type SupportedLanguage = 'en' | 'hi' | 'bn'; // English, Hindi, Bengali

export interface LocalizedContent {
  en: string;
  hi: string;
  bn: string;
}
