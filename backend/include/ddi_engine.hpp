#pragma once

#include "types.hpp"
#include "medicine_repository.hpp"
#include <string>
#include <vector>
#include <unordered_map>
#include <memory>

namespace polysafe {

/**
 * @brief Clinical Interaction & Polypharmacy Evaluation Engine.
 * 
 * Provides:
 * 1. Bidirectional pairwise Drug-Drug Interaction (DDI) matching.
 * 2. Drug-Food Interaction (DFI) dietary contraindication matching.
 * 3. Combinatorial polypharmacy cross-checking across arbitrary N-drug regimens.
 * 4. Semantic interaction graph synthesis (nodes & edges without coordinates).
 */
class DdiEngine {
public:
    explicit DdiEngine(std::shared_ptr<MedicineRepository> medRepo);
    ~DdiEngine() = default;

    /**
     * @brief Load DDI and DFI clinical datasets from JSON files.
     * @param ddiFilePath Path to drug_drug_interactions.json
     * @param dfiFilePath Path to drug_food_interactions.json
     * @return true if both datasets loaded successfully
     */
    bool loadInteractions(const std::string& ddiFilePath, const std::string& dfiFilePath);

    /**
     * @brief Load DDI dataset from JSON string payload.
     */
    bool loadDdiFromJsonString(const std::string& jsonStr);

    /**
     * @brief Load DFI dataset from JSON string payload.
     */
    bool loadDfiFromJsonString(const std::string& jsonStr);

    /**
     * @brief Find all known DDIs involving a single medicine.
     * @param medicineId Canonical medicine ID (e.g., "med_warfarin")
     */
    std::vector<DrugDrugInteraction> getDrugInteractions(const std::string& medicineId) const;

    /**
     * @brief Find all dietary DFIs involving a single medicine.
     * @param medicineId Canonical medicine ID
     */
    std::vector<DrugFoodInteraction> getFoodInteractions(const std::string& medicineId) const;

    /**
     * @brief Direct pairwise check between two specific medicines.
     * Order-independent (checks medA-medB and medB-medA).
     */
    const DrugDrugInteraction* checkPair(const std::string& medIdA, const std::string& medIdB) const;

    /**
     * @brief Evaluate a multi-drug regimen (polypharmacy patient profile).
     * Computes all N*(N-1)/2 pairwise cross-interactions, evaluates dietary contraindications,
     * and constructs the semantic interaction graph for React rendering.
     * @param medicineIds List of canonical medicine IDs in patient's regimen
     * @return Complete MultiMedicineResponse matching frontend API contract
     */
    MultiMedicineResponse checkRegimen(const std::vector<std::string>& medicineIds) const;

    /**
     * @brief Total number of registered DDI rules.
     */
    size_t ddiCount() const;

    /**
     * @brief Total number of registered DFI rules.
     */
    size_t dfiCount() const;

private:
    std::shared_ptr<MedicineRepository> medRepo_;

    std::vector<DrugDrugInteraction> ddis_;
    // Fast symmetric pair index: "medA:medB" (lexicographically ordered) -> index in ddis_
    std::unordered_map<std::string, size_t> pairIndex_;

    std::vector<DrugFoodInteraction> dfis_;
    // Fast lookup: medicineId -> list of indices in dfis_
    std::unordered_map<std::string, std::vector<size_t>> medToDfiIndices_;

    static std::string makePairKey(const std::string& a, const std::string& b);

    InteractionGraphData buildSemanticGraph(
        const std::vector<Medicine>& activeMeds,
        const std::vector<DrugDrugInteraction>& detectedDdis,
        const std::vector<DrugFoodInteraction>& detectedDfis
    ) const;
};

} // namespace polysafe
