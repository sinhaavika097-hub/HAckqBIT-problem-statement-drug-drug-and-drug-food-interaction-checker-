#pragma once

#include <string>
#include <vector>
#include <algorithm>

namespace polysafe {

// Interaction severity tiers aligned with clinical pharmacovigilance standards
enum class InteractionSeverity {
    LOW,
    MODERATE,
    HIGH,
    CRITICAL
};

inline std::string severityToString(InteractionSeverity sev) {
    switch (sev) {
        case InteractionSeverity::LOW: return "LOW";
        case InteractionSeverity::MODERATE: return "MODERATE";
        case InteractionSeverity::HIGH: return "HIGH";
        case InteractionSeverity::CRITICAL: return "CRITICAL";
        default: return "LOW";
    }
}

inline InteractionSeverity stringToSeverity(const std::string& str) {
    std::string upper = str;
    std::transform(upper.begin(), upper.end(), upper.begin(), ::toupper);
    if (upper == "CRITICAL") return InteractionSeverity::CRITICAL;
    if (upper == "HIGH") return InteractionSeverity::HIGH;
    if (upper == "MODERATE") return InteractionSeverity::MODERATE;
    return InteractionSeverity::LOW;
}

// Medicine domain model matching TypeScript interface Medicine
struct Medicine {
    std::string id;
    std::string name;
    std::string genericName;
    std::vector<std::string> brandNames;
    std::string dosage;
    std::string category;
    std::string atcCode;
};

// Dietary Food Item domain model matching TypeScript interface FoodItem
struct FoodItem {
    std::string id;
    std::string name;
    std::string category; // FRUIT, DAIRY, BEVERAGE, ALCOHOL, HERB, GENERAL_FOOD
    std::vector<std::string> commonExamples;
};

// Clinician Alternative option for professional evaluation only
struct ClinicianAlternative {
    std::string id;
    std::string medicineName;
    std::string rationale;
    bool requiresPrescription{true};
    std::string safetyNote{
        "Possible alternative for clinician review only. Do not alter medication without physician consultation."
    };
};

// Patient-facing plain-language explanation
struct PatientExplanation {
    std::string summary;
    std::string whatItMeans;
    std::string whyItMatters;
    std::string actionAdvice;
};

// Physician-facing clinical protocol summary
struct DoctorSummary {
    std::string clinicalMechanism;
    std::string evidenceLevel; // ESTABLISHED, PROBABLE, SUSPECTED, THEORETICAL
    std::string suggestedAction;
    std::vector<std::string> monitoringParameters;
    std::vector<ClinicianAlternative> alternativesForReview;
};

// Pairwise Drug-Drug interaction model matching DrugDrugInteraction
struct DrugDrugInteraction {
    std::string id;
    std::string type{"DRUG_DRUG"};
    Medicine primaryDrug;
    Medicine interactingDrug;
    InteractionSeverity severity{InteractionSeverity::LOW};
    PatientExplanation patientExplanation;
    DoctorSummary doctorSummary;
    std::string documentationUrl;
};

// Drug-Food dietary contraindication model matching DrugFoodInteraction
struct DrugFoodInteraction {
    std::string id;
    std::string type{"DRUG_FOOD"};
    Medicine drug;
    FoodItem food;
    InteractionSeverity severity{InteractionSeverity::LOW};
    PatientExplanation patientExplanation;
    DoctorSummary doctorSummary;
    std::string dietaryRecommendation;
};

// Semantic Graph Node (Coordinates owned exclusively by frontend SVG layout)
struct GraphNode {
    std::string id;
    std::string label;
    std::string subLabel;
    std::string type; // PRIMARY_DRUG, INTERACTING_DRUG, FOOD
    std::string severity; // Optional severity string for styling
};

// Semantic Graph Edge (Layout and curved geometry owned by frontend)
struct GraphEdge {
    std::string id;
    std::string source;
    std::string target;
    std::string type; // DRUG_DRUG, DRUG_FOOD
    std::string severity;
    std::string label;
};

// Semantic Graph Data container matching InteractionGraphData
struct InteractionGraphData {
    std::vector<GraphNode> nodes;
    std::vector<GraphEdge> edges;
};

// Multi-medicine regimen response container matching MultiMedicineResponse
struct MultiMedicineResponse {
    InteractionGraphData graphData;
    std::vector<DrugDrugInteraction> drugInteractions;
    std::vector<DrugFoodInteraction> foodInteractions;
};

// Prescription OCR normalized medicine model matching ExtractedMedicine
struct ExtractedMedicine {
    std::string id;
    std::string rawText;
    std::string normalizedName;
    double confidence{0.0}; // 0.0 to 1.0
    bool isConfirmed{false};
    std::string dosage;
    std::string frequency;
};

// Prescription OCR overall payload matching PrescriptionOcrResult
struct PrescriptionOcrResult {
    std::string imageUrl;
    long long processingTimeMs{0};
    std::vector<ExtractedMedicine> extractedMedicines;
    std::string rawOcrText;
};

} // namespace polysafe
