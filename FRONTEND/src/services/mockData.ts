/**
 * ISOLATED MOCK / DEMONSTRATION DATA
 * NOTICE: This is prototype demo data for UI validation.
 * Not intended for live medical decisions without physician oversight.
 */

import {
  Medicine,
  FoodItem,
  DrugDrugInteraction,
  DrugFoodInteraction,
  InteractionGraphData,
} from '../types/interactions';

export const MOCK_MEDICINES: Medicine[] = [
  {
    id: 'med-warfarin',
    name: 'Warfarin',
    genericName: 'Warfarin Sodium',
    brandNames: ['Coumadin', 'Jantoven'],
    dosage: '5mg',
    category: 'Anticoagulant',
  },
  {
    id: 'med-aspirin',
    name: 'Aspirin',
    genericName: 'Acetylsalicylic acid',
    brandNames: ['Ecosprin', 'Disprin', 'Bayer'],
    dosage: '75mg',
    category: 'Antiplatelet / NSAID',
  },
  {
    id: 'med-atorvastatin',
    name: 'Atorvastatin',
    genericName: 'Atorvastatin Calcium',
    brandNames: ['Lipitor', 'Atorva', 'Storvas'],
    dosage: '20mg',
    category: 'Statin / Lipid-lowering',
  },
  {
    id: 'med-metformin',
    name: 'Metformin',
    genericName: 'Metformin Hydrochloride',
    brandNames: ['Glucophage', 'Glycomet'],
    dosage: '500mg',
    category: 'Antidiabetic / Biguanide',
  },
  {
    id: 'med-ciprofloxacin',
    name: 'Ciprofloxacin',
    genericName: 'Ciprofloxacin',
    brandNames: ['Cifran', 'Cipro'],
    dosage: '500mg',
    category: 'Fluoroquinolone Antibiotic',
  },
  {
    id: 'med-amlodipine',
    name: 'Amlodipine',
    genericName: 'Amlodipine Besylate',
    brandNames: ['Norvasc', 'Amlong'],
    dosage: '5mg',
    category: 'Calcium Channel Blocker',
  },
];

export const MOCK_FOODS: FoodItem[] = [
  {
    id: 'food-grapefruit',
    name: 'Grapefruit / Grapefruit Juice',
    category: 'FRUIT',
    commonExamples: ['Fresh grapefruit', 'Processed grapefruit juice'],
  },
  {
    id: 'food-spinach',
    name: 'Spinach & Dark Leafy Greens (Vitamin K rich)',
    category: 'GENERAL_FOOD',
    commonExamples: ['Spinach (Palak)', 'Kale', 'Broccoli', 'Collard greens'],
  },
  {
    id: 'food-dairy',
    name: 'Milk & Dairy Products (Calcium rich)',
    category: 'DAIRY',
    commonExamples: ['Cow milk', 'Yogurt (Curd/Dahi)', 'Cheese', 'Paneer'],
  },
  {
    id: 'food-alcohol',
    name: 'Alcoholic Beverages',
    category: 'ALCOHOL',
    commonExamples: ['Beer', 'Wine', 'Spirits'],
  },
];

export const MOCK_DRUG_DRUG_INTERACTIONS: DrugDrugInteraction[] = [
  {
    id: 'ddi-warfarin-aspirin',
    type: 'DRUG_DRUG',
    primaryDrug: MOCK_MEDICINES[0], // Warfarin
    interactingDrug: MOCK_MEDICINES[1], // Aspirin
    severity: 'CRITICAL',
    patientExplanation: {
      summary: 'Taking Warfarin together with Aspirin significantly increases your risk of severe internal bleeding.',
      whatItMeans: 'Both medications thin your blood using different mechanisms. Combining them doubles the anti-clotting effect.',
      whyItMatters: 'Even minor injuries or unnoticed stomach ulcers could cause dangerous bleeding.',
      actionAdvice: 'Do not discontinue abruptly, but immediately consult your prescribing physician to check if both are essential.',
    },
    doctorSummary: {
      clinicalMechanism: 'Synergistic antihemostatic effect: Warfarin inhibits vitamin K-dependent clotting factors while Aspirin irreversibly inhibits platelet COX-1.',
      evidenceLevel: 'ESTABLISHED',
      suggestedAction: 'Re-evaluate indication for dual therapy. Monitor INR closely and assess gastrointestinal bleeding risk.',
      monitoringParameters: ['INR (International Normalized Ratio)', 'Hemoglobin/Hematocrit', 'Stool occult blood'],
      alternativesForReview: [
        {
          id: 'alt-paracetamol',
          medicineName: 'Paracetamol (Acetaminophen)',
          rationale: 'If Aspirin is taken solely for analgesia/fever, low-dose Paracetamol carries substantially lower bleeding risk.',
          requiresPrescription: false,
          safetyNote: 'Possible alternative for clinician review only. Do not alter medication without physician consultation.',
        },
      ],
    },
    documentationUrl: 'https://ncbi.nlm.nih.gov/books/NBK534248/',
  },
  {
    id: 'ddi-warfarin-atorvastatin',
    type: 'DRUG_DRUG',
    primaryDrug: MOCK_MEDICINES[0], // Warfarin
    interactingDrug: MOCK_MEDICINES[2], // Atorvastatin
    severity: 'MODERATE',
    patientExplanation: {
      summary: 'Atorvastatin may moderately increase the blood thinning effects of Warfarin.',
      whatItMeans: 'Both medications are processed by overlapping liver pathways, which may slightly elevate Warfarin concentration in the blood.',
      whyItMatters: 'Small changes in Warfarin strength can alter blood clotting balance.',
      actionAdvice: 'Your doctor may request a routine blood test (INR) when starting or adjusting your statin dose.',
    },
    doctorSummary: {
      clinicalMechanism: 'Competitive CYP3A4 / CYP2C9 metabolism and protein binding displacement can mildly prolong prothrombin time.',
      evidenceLevel: 'PROBABLE',
      suggestedAction: 'Monitor baseline INR upon initiating or titrating Atorvastatin.',
      monitoringParameters: ['INR within 3-5 days of dose adjustment'],
    },
    documentationUrl: 'https://ncbi.nlm.nih.gov/books/NBK534248/',
  },
];

export const MOCK_DRUG_FOOD_INTERACTIONS: DrugFoodInteraction[] = [
  {
    id: 'dfi-atorvastatin-grapefruit',
    type: 'DRUG_FOOD',
    drug: MOCK_MEDICINES[2], // Atorvastatin
    food: MOCK_FOODS[0], // Grapefruit
    severity: 'HIGH',
    patientExplanation: {
      summary: 'Grapefruit blocks your body from breaking down Atorvastatin, causing drug levels to build up to dangerous levels.',
      whatItMeans: 'Compounds in grapefruit stop your liver enzymes from clearing this cholesterol medicine normally.',
      whyItMatters: 'Excess drug concentration can lead to severe muscle pain, muscle breakdown, and kidney stress.',
      actionAdvice: 'Avoid eating grapefruit or drinking grapefruit juice while taking Atorvastatin.',
    },
    doctorSummary: {
      clinicalMechanism: 'Furanocoumarins in grapefruit inhibit intestinal CYP3A4, increasing oral bioavailability and systemic exposure of Atorvastatin by 2-3 fold.',
      evidenceLevel: 'ESTABLISHED',
      suggestedAction: 'Advise patient to eliminate grapefruit products or consider statins less dependent on CYP3A4 metabolism.',
      monitoringParameters: ['Creatine kinase (CK)', 'Liver function tests (ALT/AST)', 'Myalgia symptoms'],
      alternativesForReview: [
        {
          id: 'alt-rosuvastatin',
          medicineName: 'Rosuvastatin / Pravastatin',
          rationale: 'Minimally metabolized by CYP3A4; minimal interaction with grapefruit juice.',
          requiresPrescription: true,
          safetyNote: 'Possible alternative for clinician review only. Do not alter medication without physician consultation.',
        },
      ],
    },
    dietaryRecommendation: 'Avoid grapefruit and Seville oranges completely during therapy. Citrus fruits such as sweet oranges, lemons, and limes are generally acceptable.',
  },
  {
    id: 'dfi-metformin-alcohol',
    type: 'DRUG_FOOD',
    drug: MOCK_MEDICINES[3], // Metformin
    food: MOCK_FOODS[3], // Alcohol
    severity: 'HIGH',
    patientExplanation: {
      summary: 'Drinking alcohol with Metformin significantly elevates the risk of lactic acidosis, a rare but dangerous metabolic condition.',
      whatItMeans: 'Alcohol impairs your liver ability to process lactate, while Metformin also increases lactic acid production.',
      whyItMatters: 'Can cause severe exhaustion, muscle cramps, and difficulty breathing requiring emergency care.',
      actionAdvice: 'Avoid excessive or binge alcohol consumption while taking Metformin.',
    },
    doctorSummary: {
      clinicalMechanism: 'Ethanol oxidation increases NADH/NAD+ ratio, inhibiting hepatic gluconeogenesis from lactate and predisposing to lactic acidosis.',
      evidenceLevel: 'ESTABLISHED',
      suggestedAction: 'Counsel patient regarding moderate or zero alcohol intake; assess baseline eGFR.',
      monitoringParameters: ['Serum bicarbonate', 'Serum lactate', 'eGFR / Creatinine'],
    },
    dietaryRecommendation: 'Avoid excessive or binge alcohol consumption. Moderate alcohol only with meals if approved by physician.',
  },
  {
    id: 'dfi-ciprofloxacin-dairy',
    type: 'DRUG_FOOD',
    drug: MOCK_MEDICINES[4], // Ciprofloxacin
    food: MOCK_FOODS[2], // Dairy
    severity: 'MODERATE',
    patientExplanation: {
      summary: 'Calcium in milk and yogurt binds with Ciprofloxacin, preventing your body from absorbing the antibiotic properly.',
      whatItMeans: 'The calcium forms an unabsorbable compound with the medicine in your stomach.',
      whyItMatters: 'If your body cannot absorb the medicine, the infection may not be cured.',
      actionAdvice: 'Take Ciprofloxacin at least 2 hours before or 4 hours after consuming milk, yogurt, or calcium supplements.',
    },
    doctorSummary: {
      clinicalMechanism: 'Polyvalent cations (Ca2+) form insoluble chelate complexes with quinolones, reducing Cmax and AUC by over 40%.',
      evidenceLevel: 'ESTABLISHED',
      suggestedAction: 'Counsel patient on proper spacing between dose and dairy intake.',
      monitoringParameters: ['Resolution of infection', 'Patient adherence'],
    },
    dietaryRecommendation: 'Space doses at least 2 hours before or 4 hours after dairy products (milk, yogurt, cheese).',
  },
  {
    id: 'dfi-warfarin-spinach',
    type: 'DRUG_FOOD',
    drug: MOCK_MEDICINES[0], // Warfarin
    food: MOCK_FOODS[1], // Spinach
    severity: 'HIGH',
    patientExplanation: {
      summary: 'Foods high in Vitamin K (like spinach and dark greens) can counteract Warfarin and make your blood clot more easily.',
      whatItMeans: 'Warfarin works by blocking Vitamin K. Sudden increases in Vitamin K directly oppose the medicine.',
      whyItMatters: 'Blood clot risk increases if your INR drops below the target range.',
      actionAdvice: 'Keep your intake of green leafy vegetables consistent week-to-week rather than making sudden large changes.',
    },
    doctorSummary: {
      clinicalMechanism: 'Exogenous vitamin K1 directly promotes synthesis of prothrombin complex factors, overcoming competitive inhibition by Warfarin.',
      evidenceLevel: 'ESTABLISHED',
      suggestedAction: 'Advise consistent dietary intake rather than strict avoidance. Check INR if diet fluctuates.',
      monitoringParameters: ['INR consistency'],
    },
    dietaryRecommendation: 'Maintain steady, consistent consumption of green leafy vegetables. Avoid sudden large dietary shifts.',
  },
];

/**
 * Builds mock graph nodes and edges centered around a single selected medicine
 */
export function buildMockGraphData(primaryMedicine: Medicine): InteractionGraphData {
  const nodes: InteractionGraphData['nodes'] = [
    {
      id: primaryMedicine.id,
      label: primaryMedicine.name,
      subLabel: primaryMedicine.category,
      type: 'PRIMARY_DRUG',
    },
  ];

  const edges: InteractionGraphData['edges'] = [];

  // Match Drug-Drug interactions
  for (const ddi of MOCK_DRUG_DRUG_INTERACTIONS) {
    if (ddi.primaryDrug.id === primaryMedicine.id) {
      nodes.push({
        id: ddi.interactingDrug.id,
        label: ddi.interactingDrug.name,
        subLabel: ddi.interactingDrug.category,
        type: 'INTERACTING_DRUG',
        severity: ddi.severity,
      });
      edges.push({
        id: ddi.id,
        source: primaryMedicine.id,
        target: ddi.interactingDrug.id,
        type: 'DRUG_DRUG',
        severity: ddi.severity,
        label: `${ddi.severity} Risk: ${ddi.interactingDrug.name}`,
      });
    }
  }

  // Match Drug-Food interactions
  for (const dfi of MOCK_DRUG_FOOD_INTERACTIONS) {
    if (dfi.drug.id === primaryMedicine.id) {
      nodes.push({
        id: dfi.food.id,
        label: dfi.food.name,
        subLabel: dfi.food.category,
        type: 'FOOD',
        severity: dfi.severity,
      });
      edges.push({
        id: dfi.id,
        source: primaryMedicine.id,
        target: dfi.food.id,
        type: 'DRUG_FOOD',
        severity: dfi.severity,
        label: `${dfi.severity} Risk: ${dfi.food.name}`,
      });
    }
  }

  return { nodes, edges };
}

/**
 * Builds a multi-medicine regimen graph showing cross-interactions across all medications
 */
export function buildMultiMedicineGraphData(medicines: Medicine[]): InteractionGraphData {
  const nodes: InteractionGraphData['nodes'] = medicines.map((med) => ({
    id: med.id,
    label: med.name,
    subLabel: med.category,
    type: 'PRIMARY_DRUG',
  }));

  const edges: InteractionGraphData['edges'] = [];
  const addedFoodIds = new Set<string>();

  // Check all pairwise Drug-Drug interactions in the regimen
  for (let i = 0; i < medicines.length; i++) {
    for (let j = i + 1; j < medicines.length; j++) {
      const medA = medicines[i];
      const medB = medicines[j];

      const match = MOCK_DRUG_DRUG_INTERACTIONS.find(
        (ddi) =>
          (ddi.primaryDrug.id === medA.id && ddi.interactingDrug.id === medB.id) ||
          (ddi.primaryDrug.id === medB.id && ddi.interactingDrug.id === medA.id)
      );

      if (match) {
        edges.push({
          id: match.id,
          source: medA.id,
          target: medB.id,
          type: 'DRUG_DRUG',
          severity: match.severity,
          label: `${match.severity}: ${medA.name} ↔ ${medB.name}`,
        });
      }
    }

    // Include relevant Drug-Food interactions for each medicine in regimen
    for (const dfi of MOCK_DRUG_FOOD_INTERACTIONS) {
      if (dfi.drug.id === medicines[i].id) {
        if (!addedFoodIds.has(dfi.food.id)) {
          nodes.push({
            id: dfi.food.id,
            label: dfi.food.name,
            subLabel: dfi.food.category,
            type: 'FOOD',
            severity: dfi.severity,
          });
          addedFoodIds.add(dfi.food.id);
        }
        edges.push({
          id: dfi.id,
          source: medicines[i].id,
          target: dfi.food.id,
          type: 'DRUG_FOOD',
          severity: dfi.severity,
          label: `${dfi.severity}: ${medicines[i].name} ↔ ${dfi.food.name}`,
        });
      }
    }
  }

  return { nodes, edges };
}
