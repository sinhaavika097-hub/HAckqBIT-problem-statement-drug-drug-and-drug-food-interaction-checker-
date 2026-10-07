#ifndef MEDICINE_REPOSITORY_HPP
#define MEDICINE_REPOSITORY_HPP

#include "types.hpp"
#include <string>
#include <vector>
#include <unordered_map>

namespace polysafe {

/**
 * @brief In-memory catalogue repository for drug entities.
 * 
 * Provides thread-safe, fast lookup by canonical ID, fuzzy/substring
 * alias search across brand and generic names, and normalization
 * of unstructured prescription strings into standard medicine IDs.
 */
class MedicineRepository {
public:
    MedicineRepository() = default;
    ~MedicineRepository() = default;

    /**
     * @brief Load medicine catalogue from formatted JSON file.
     * @param filepath Path to medicines.json
     * @return true if loaded and parsed successfully
     */
    bool loadFromFile(const std::string& filepath);

    /**
     * @brief Load medicine catalogue from JSON string payload.
     * @param jsonStr Raw JSON string content
     * @return true if parsed successfully
     */
    bool loadFromJsonString(const std::string& jsonStr);

    /**
     * @brief Search medicines matching query against generic name, brand names, or aliases.
     * @param query User search string (case-insensitive)
     * @param limit Maximum results to return (default 10)
     * @return Vector of matched Medicine records
     */
    std::vector<Medicine> search(const std::string& query, size_t limit = 10) const;

    /**
     * @brief Lookup medicine by canonical ID (e.g., "med_warfarin").
     * @param id Canonical medicine identifier
     * @return Pointer to Medicine record if found, nullptr otherwise
     */
    const Medicine* getById(const std::string& id) const;

    /**
     * @brief Retrieve all loaded medicines.
     * @return Vector of all medicine records in catalogue
     */
    std::vector<Medicine> getAll() const;

    /**
     * @brief Total number of medicines loaded.
     */
    size_t count() const;

    /**
     * @brief Maps a raw or OCR-extracted drug name to a canonical medicine ID.
     * Matches exact brand aliases, generic stems, and sanitized forms.
     * @param inputName Raw brand or generic name (e.g., "Coumadin", "aspirin 75mg")
     * @return Canonical ID (e.g., "med_warfarin") or empty string if unresolved
     */
    std::string normalizeToId(const std::string& inputName) const;

private:
    std::vector<Medicine> medicines_;
    std::unordered_map<std::string, size_t> idToIndex_;
    std::unordered_map<std::string, std::string> aliasToId_;

    void buildIndices();
    static std::string sanitizeString(const std::string& str);
};

} // namespace polysafe

#endif // MEDICINE_REPOSITORY_HPP

