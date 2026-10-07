
#include <iostream>
#include <string>
#include <vector>

// Helper to escape strings for JSON formatting
std::string escapeJSON(const std::string& s) {
    std::string out;
    for (char c : s) {
        if (c == '"') out += "\\\"";
        else out += c;
    }
    return out;
}

int main(int argc, char* argv[]) {
    // In a full production environment, you would accept arguments (e.g., argv[1] = "Warfarin", argv[2] = "Aspirin")
    // For this prototype, we will output a JSON array of the interactions that match your teammate's TS dictionary IDs.

    std::cout << "[\n";

    // 1. Drug-Drug Interaction: Warfarin + Aspirin (Matches ID 'ddi-warfarin-aspirin')
    std::cout << "  {\n"
              << "    \"id\": \"ddi-warfarin-aspirin\",\n"
              << "    \"type\": \"DRUG_DRUG\",\n"
              << "    \"primaryDrug\": { \"name\": \"Warfarin\" },\n"
              << "    \"interactingDrug\": { \"name\": \"Aspirin\" },\n"
              << "    \"severity\": \"Critical\",\n"
              << "    \"doctorSummary\": {\n"
              << "      \"evidenceLevel\": \"High\",\n"
              << "      \"clinicalMechanism\": \"Both drugs act via independent mechanisms. Aspirin inhibits platelet cyclooxygenase and warfarin inhibits vitamin K-dependent clotting factors, increasing the risk of life-threatening bleeding 3- to 5-fold.\",\n"
              << "      \"suggestedAction\": \"Re-review the justification for concurrent use. If unavoidable, strictly monitor PT/INR and consider adding a PPI for gastroprotection.\",\n"
              << "      \"monitoringParameters\": [\"PT\", \"INR\", \"Hemoglobin\", \"Signs of occult bleeding\"],\n"
              << "      \"alternativesForReview\": [\n"
              << "        { \"medicineName\": \"Clopidogrel (if indicated)\" },\n"
              << "        { \"medicineName\": \"Lower dose monotherapy\" }\n"
              << "      ]\n"
              << "    }\n"
              << "  },\n";

    // 2. Drug-Food Interaction: Atorvastatin + Grapefruit (Matches ID 'dfi-atorvastatin-grapefruit')
    std::cout << "  {\n"
              << "    \"id\": \"dfi-atorvastatin-grapefruit\",\n"
              << "    \"type\": \"DRUG_FOOD\",\n"
              << "    \"drug\": { \"name\": \"Atorvastatin\" },\n"
              << "    \"food\": { \"name\": \"Grapefruit\" },\n"
              << "    \"severity\": \"Moderate\",\n"
              << "    \"doctorSummary\": {\n"
              << "      \"evidenceLevel\": \"Moderate\",\n"
              << "      \"clinicalMechanism\": \"Furanocoumarins in grapefruit inhibit intestinal CYP3A4, decreasing first-pass metabolism of atorvastatin and multiplying serum concentration.\",\n"
              << "      \"suggestedAction\": \"Advise patient to completely avoid grapefruit and its juice during statin therapy to prevent myopathy risk.\",\n"
              << "      \"monitoringParameters\": [\"CPK levels\", \"Muscle pain/weakness\"],\n"
              << "      \"alternativesForReview\": [\n"
              << "        { \"medicineName\": \"Rosuvastatin (not metabolized by CYP3A4)\" }\n"
              << "      ]\n"
              << "    }\n"
              << "  }\n";

    std::cout << "]\n";

    return 0;
}























