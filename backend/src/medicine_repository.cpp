#include "../include/medicine_repository.hpp"
#include <fstream>
#include <sstream>
#include <algorithm>
#include <cctype>

namespace polysafe {

// Utility helper to trim and sanitize text to lower-case alphanumeric
std::string MedicineRepository::sanitizeString(const std::string& str) {
    std::string result;
    result.reserve(str.size());
    for (char c : str) {
        if (std::isalnum(static_cast<unsigned char>(c)) || c == ' ') {
            result.push_back(static_cast<char>(std::tolower(static_cast<unsigned char>(c))));
        }
    }
    // Trim leading and trailing spaces
    size_t first = result.find_first_not_of(' ');
    if (first == std::string::npos) return "";
    size_t last = result.find_last_not_of(' ');
    return result.substr(first, (last - first + 1));
}

bool MedicineRepository::loadFromFile(const std::string& filepath) {
    std::ifstream file(filepath);
    if (!file.is_open()) {
        return false;
    }
    std::stringstream buffer;
    buffer << file.rdbuf();
    return loadFromJsonString(buffer.str());
}

// Lightweight, deterministic JSON parser for medicine catalogue records
bool MedicineRepository::loadFromJsonString(const std::string& jsonStr) {
    medicines_.clear();
    idToIndex_.clear();
    aliasToId_.clear();

    size_t pos = 0;
    const size_t len = jsonStr.size();

    auto skipWhitespace = [&]() {
        while (pos < len && (jsonStr[pos] == ' ' || jsonStr[pos] == '\t' || 
                             jsonStr[pos] == '\n' || jsonStr[pos] == '\r')) {
            pos++;
        }
    };

    auto parseString = [&]() -> std::string {
        skipWhitespace();
        if (pos >= len || jsonStr[pos] != '"') return "";
        pos++; // Skip opening quote
        std::string val;
        while (pos < len) {
            char c = jsonStr[pos++];
            if (c == '"') {
                break;
            } else if (c == '\\' && pos < len) {
                char esc = jsonStr[pos++];
                if (esc == '"' || esc == '\\' || esc == '/') val.push_back(esc);
                else if (esc == 'n') val.push_back('\n');
                else if (esc == 't') val.push_back('\t');
                else val.push_back(esc);
            } else {
                val.push_back(c);
            }
        }
        return val;
    };

    skipWhitespace();
    if (pos >= len || jsonStr[pos] != '[') {
        return false;
    }
    pos++; // Skip '['

    while (pos < len) {
        skipWhitespace();
        if (pos < len && jsonStr[pos] == ']') {
            pos++;
            break;
        }

        if (jsonStr[pos] == '{') {
            pos++; // Skip '{'
            Medicine med;

            while (pos < len) {
                skipWhitespace();
                if (pos < len && jsonStr[pos] == '}') {
                    pos++;
                    break;
                }

                std::string key = parseString();
                skipWhitespace();
                if (pos < len && jsonStr[pos] == ':') pos++;
                skipWhitespace();

                if (key == "id") {
                    med.id = parseString();
                } else if (key == "name") {
                    med.name = parseString();
                } else if (key == "genericName") {
                    med.genericName = parseString();
                } else if (key == "dosage") {
                    med.dosage = parseString();
                } else if (key == "category") {
                    med.category = parseString();
                } else if (key == "atcCode") {
                    med.atcCode = parseString();
                } else if (key == "brandNames") {
                    skipWhitespace();
                    if (pos < len && jsonStr[pos] == '[') {
                        pos++;
                        while (pos < len) {
                            skipWhitespace();
                            if (pos < len && jsonStr[pos] == ']') {
                                pos++;
                                break;
                            }
                            if (jsonStr[pos] == '"') {
                                med.brandNames.push_back(parseString());
                            }
                            skipWhitespace();
                            if (pos < len && jsonStr[pos] == ',') pos++;
                        }
                    }
                } else {
                    // Skip unknown string or value
                    if (pos < len && jsonStr[pos] == '"') {
                        parseString();
                    } else {
                        while (pos < len && jsonStr[pos] != ',' && jsonStr[pos] != '}') pos++;
                    }
                }

                skipWhitespace();
                if (pos < len && jsonStr[pos] == ',') pos++;
            }

            if (!med.id.empty()) {
                medicines_.push_back(med);
            }
        }

        skipWhitespace();
        if (pos < len && jsonStr[pos] == ',') pos++;
    }

    buildIndices();
    return !medicines_.empty();
}

void MedicineRepository::buildIndices() {
    idToIndex_.clear();
    aliasToId_.clear();

    for (size_t i = 0; i < medicines_.size(); ++i) {
        const auto& med = medicines_[i];
        idToIndex_[med.id] = i;

        // Register normalized variations for fast lookup
        aliasToId_[sanitizeString(med.id)] = med.id;
        aliasToId_[sanitizeString(med.name)] = med.id;
        aliasToId_[sanitizeString(med.genericName)] = med.id;

        for (const auto& brand : med.brandNames) {
            aliasToId_[sanitizeString(brand)] = med.id;
        }
    }
}

const Medicine* MedicineRepository::getById(const std::string& id) const {
    auto it = idToIndex_.find(id);
    if (it != idToIndex_.end()) {
        return &medicines_[it->second];
    }
    // Also try normalized ID lookup
    std::string sanitized = sanitizeString(id);
    auto aliasIt = aliasToId_.find(sanitized);
    if (aliasIt != aliasToId_.end()) {
        auto medIt = idToIndex_.find(aliasIt->second);
        if (medIt != idToIndex_.end()) {
            return &medicines_[medIt->second];
        }
    }
    return nullptr;
}

std::vector<Medicine> MedicineRepository::getAll() const {
    return medicines_;
}

size_t MedicineRepository::count() const {
    return medicines_.size();
}

std::vector<Medicine> MedicineRepository::search(const std::string& query, size_t limit) const {
    std::vector<Medicine> results;
    std::string cleanQuery = sanitizeString(query);
    if (cleanQuery.empty()) {
        return results;
    }

    for (const auto& med : medicines_) {
        std::string nameClean = sanitizeString(med.name);
        std::string genClean = sanitizeString(med.genericName);
        std::string atcClean = sanitizeString(med.atcCode);
        std::string catClean = sanitizeString(med.category);

        bool matched = (nameClean.find(cleanQuery) != std::string::npos) ||
                        (genClean.find(cleanQuery) != std::string::npos) ||
                        (atcClean.find(cleanQuery) != std::string::npos) ||
                        (catClean.find(cleanQuery) != std::string::npos);

        if (!matched) {
            for (const auto& brand : med.brandNames) {
                if (sanitizeString(brand).find(cleanQuery) != std::string::npos) {
                    matched = true;
                    break;
                }
            }
        }

        if (matched) {
            results.push_back(med);
            if (results.size() >= limit) {
                break;
            }
        }
    }

    return results;
}

std::string MedicineRepository::normalizeToId(const std::string& inputName) const {
    std::string clean = sanitizeString(inputName);
    if (clean.empty()) return "";

    // 1. Direct alias match
    auto it = aliasToId_.find(clean);
    if (it != aliasToId_.end()) {
        return it->second;
    }

    // 2. Substring/token match: check if clean input contains any known alias or vice versa
    for (const auto& pair : aliasToId_) {
        const std::string& alias = pair.first;
        if (alias.length() >= 3) {
            if (clean.find(alias) != std::string::npos || alias.find(clean) != std::string::npos) {
                return pair.second;
            }
        }
    }

    return "";
}

} // namespace polysafe
