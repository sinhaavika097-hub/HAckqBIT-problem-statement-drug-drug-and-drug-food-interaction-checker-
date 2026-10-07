#include "../include/ddi_engine.hpp"
#include <fstream>
#include <sstream>
#include <algorithm>
#include <cctype>
#include <set>

namespace polysafe {

// Helper to normalize an ID string: lowercases and converts '-' to '_'
static std::string normalizeIdStr(const std::string& str) {
    std::string out;
    out.reserve(str.size());
    for (char c : str) {
        if (c == '-') {
            out.push_back('_');
        } else if (std::isalnum(static_cast<unsigned char>(c)) || c == '_') {
            out.push_back(static_cast<char>(std::tolower(static_cast<unsigned char>(c))));
        }
    }
    return out;
}

std::string DdiEngine::makePairKey(const std::string& a, const std::string& b) {
    std::string normA = normalizeIdStr(a);
    std::string normB = normalizeIdStr(b);
    if (normA < normB) {
        return normA + ":" + normB;
    } else {
        return normB + ":" + normA;
    }
}

DdiEngine::DdiEngine(std::shared_ptr<MedicineRepository> medRepo)
    : medRepo_(std::move(medRepo)) {}

bool DdiEngine::loadInteractions(const std::string& ddiFilePath, const std::string& dfiFilePath) {
    bool ddiOk = false;
    bool dfiOk = false;

    std::ifstream ddiFile(ddiFilePath);
    if (ddiFile.is_open()) {
        std::stringstream buffer;
        buffer << ddiFile.rdbuf();
        ddiOk = loadDdiFromJsonString(buffer.str());
    }

    std::ifstream dfiFile(dfiFilePath);
    if (dfiFile.is_open()) {
        std::stringstream buffer;
        buffer << dfiFile.rdbuf();
        dfiOk = loadDfiFromJsonString(buffer.str());
    }

    return ddiOk && dfiOk;
}

// Lightweight JSON parser helper for string extracting and nested structures
class SimpleJsonReader {
public:
    explicit SimpleJsonReader(const std::string& src) : src_(src), pos_(0), len_(src.size()) {}

    void skipWhitespace() {
        while (pos_ < len_ && (src_[pos_] == ' ' || src_[pos_] == '\t' || 
                               src_[pos_] == '\n' || src_[pos_] == '\r')) {
            pos_++;
        }
    }

    bool hasNext() const { return pos_ < len_; }
    char peek() { skipWhitespace(); return pos_ < len_ ? src_[pos_] : '\0'; }
    char next() { skipWhitespace(); return pos_ < len_ ? src_[pos_++] : '\0'; }

    std::string parseString() {
        skipWhitespace();
        if (pos_ >= len_ || src_[pos_] != '"') return "";
        pos_++;
        std::string val;
        while (pos_ < len_) {
            char c = src_[pos_++];
            if (c == '"') {
                break;
            } else if (c == '\\' && pos_ < len_) {
                char esc = src_[pos_++];
                if (esc == '"' || esc == '\\' || esc == '/') val.push_back(esc);
                else if (esc == 'n') val.push_back('\n');
                else if (esc == 't') val.push_back('\t');
                else val.push_back(esc);
            } else {
                val.push_back(c);
            }
        }
        return val;
    }

    std::vector<std::string> parseStringArray() {
        std::vector<std::string> arr;
        skipWhitespace();
        if (peek() != '[') return arr;
        next(); // skip '['
        while (hasNext()) {
            if (peek() == ']') {
                next();
                break;
            }
            if (peek() == '"') {
                arr.push_back(parseString());
            }
            skipWhitespace();
            if (peek() == ',') next();
        }
        return arr;
    }

    void skipValue() {
        skipWhitespace();
        if (!hasNext()) return;
        char c = peek();
        if (c == '"') {
            parseString();
        } else if (c == '{') {
            next();
            int depth = 1;
            while (hasNext() && depth > 0) {
                char ch = next();
                if (ch == '{') depth++;
                else if (ch == '}') depth--;
            }
        } else if (c == '[') {
            next();
            int depth = 1;
            while (hasNext() && depth > 0) {
                char ch = next();
                if (ch == '[') depth++;
                else if (ch == ']') depth--;
            }
        } else {
            while (hasNext() && src_[pos_] != ',' && src_[pos_] != '}' && src_[pos_] != ']') {
                pos_++;
            }
        }
    }

private:
    const std::string& src_;
    size_t pos_;
    size_t len_;
};

static Medicine parseMedicineObject(SimpleJsonReader& reader) {
    Medicine med;
    if (reader.peek() != '{') return med;
    reader.next(); // skip '{'

    while (reader.hasNext()) {
        if (reader.peek() == '}') {
            reader.next();
            break;
        }
        std::string key = reader.parseString();
        reader.skipWhitespace();
        if (reader.peek() == ':') reader.next();
        reader.skipWhitespace();

        if (key == "id") med.id = reader.parseString();
        else if (key == "name") med.name = reader.parseString();
        else if (key == "genericName") med.genericName = reader.parseString();
        else if (key == "dosage") med.dosage = reader.parseString();
        else if (key == "category") med.category = reader.parseString();
        else if (key == "atcCode") med.atcCode = reader.parseString();
        else if (key == "brandNames") med.brandNames = reader.parseStringArray();
        else reader.skipValue();

        reader.skipWhitespace();
        if (reader.peek() == ',') reader.next();
    }
    return med;
}

static PatientExplanation parsePatientExplanation(SimpleJsonReader& reader) {
    PatientExplanation pe;
    if (reader.peek() != '{') return pe;
    reader.next(); // skip '{'

    while (reader.hasNext()) {
        if (reader.peek() == '}') {
            reader.next();
            break;
        }
        std::string key = reader.parseString();
        reader.skipWhitespace();
        if (reader.peek() == ':') reader.next();
        reader.skipWhitespace();

        if (key == "summary") pe.summary = reader.parseString();
        else if (key == "whatItMeans") pe.whatItMeans = reader.parseString();
        else if (key == "whyItMatters") pe.whyItMatters = reader.parseString();
        else if (key == "actionAdvice") pe.actionAdvice = reader.parseString();
        else reader.skipValue();

        reader.skipWhitespace();
        if (reader.peek() == ',') reader.next();
    }
    return pe;
}

static DoctorSummary parseDoctorSummary(SimpleJsonReader& reader) {
    DoctorSummary ds;
    if (reader.peek() != '{') return ds;
    reader.next(); // skip '{'

    while (reader.hasNext()) {
        if (reader.peek() == '}') {
            reader.next();
            break;
        }
        std::string key = reader.parseString();
        reader.skipWhitespace();
        if (reader.peek() == ':') reader.next();
        reader.skipWhitespace();

        if (key == "clinicalMechanism") ds.clinicalMechanism = reader.parseString();
        else if (key == "evidenceLevel") ds.evidenceLevel = reader.parseString();
        else if (key == "suggestedAction") ds.suggestedAction = reader.parseString();
        else if (key == "monitoringParameters") ds.monitoringParameters = reader.parseStringArray();
        else if (key == "alternativesForReview") {
            reader.skipWhitespace();
            if (reader.peek() == '[') {
                reader.next();
                while (reader.hasNext()) {
                    if (reader.peek() == ']') {
                        reader.next();
                        break;
                    }
                    if (reader.peek() == '{') {
                        reader.next();
                        ClinicianAlternative alt;
                        while (reader.hasNext()) {
                            if (reader.peek() == '}') {
                                reader.next();
                                break;
                            }
                            std::string akey = reader.parseString();
                            reader.skipWhitespace();
                            if (reader.peek() == ':') reader.next();
                            reader.skipWhitespace();
                            if (akey == "id") alt.id = reader.parseString();
                            else if (akey == "medicineName") alt.medicineName = reader.parseString();
                            else if (akey == "rationale") alt.rationale = reader.parseString();
                            else if (akey == "safetyNote") alt.safetyNote = reader.parseString();
                            else reader.skipValue();

                            reader.skipWhitespace();
                            if (reader.peek() == ',') reader.next();
                        }
                        ds.alternativesForReview.push_back(alt);
                    }
                    reader.skipWhitespace();
                    if (reader.peek() == ',') reader.next();
                }
            }
        } else {
            reader.skipValue();
        }

        reader.skipWhitespace();
        if (reader.peek() == ',') reader.next();
    }
    return ds;
}

static FoodItem parseFoodItem(SimpleJsonReader& reader) {
    FoodItem food;
    if (reader.peek() != '{') return food;
    reader.next(); // skip '{'

    while (reader.hasNext()) {
        if (reader.peek() == '}') {
            reader.next();
            break;
        }
        std::string key = reader.parseString();
        reader.skipWhitespace();
        if (reader.peek() == ':') reader.next();
        reader.skipWhitespace();

        if (key == "id") food.id = reader.parseString();
        else if (key == "name") food.name = reader.parseString();
        else if (key == "category") food.category = reader.parseString();
        else if (key == "commonExamples") food.commonExamples = reader.parseStringArray();
        else reader.skipValue();

        reader.skipWhitespace();
        if (reader.peek() == ',') reader.next();
    }
    return food;
}

bool DdiEngine::loadDdiFromJsonString(const std::string& jsonStr) {
    ddis_.clear();
    pairIndex_.clear();

    SimpleJsonReader reader(jsonStr);
    if (reader.peek() != '[') return false;
    reader.next(); // skip '['

    while (reader.hasNext()) {
        if (reader.peek() == ']') {
            reader.next();
            break;
        }

        if (reader.peek() == '{') {
            reader.next();
            DrugDrugInteraction ddi;

            while (reader.hasNext()) {
                if (reader.peek() == '}') {
                    reader.next();
                    break;
                }
                std::string key = reader.parseString();
                reader.skipWhitespace();
                if (reader.peek() == ':') reader.next();
                reader.skipWhitespace();

                if (key == "id") ddi.id = reader.parseString();
                else if (key == "type") ddi.type = reader.parseString();
                else if (key == "severity") ddi.severity = stringToSeverity(reader.parseString());
                else if (key == "documentationUrl") ddi.documentationUrl = reader.parseString();
                else if (key == "primaryDrug") ddi.primaryDrug = parseMedicineObject(reader);
                else if (key == "interactingDrug") ddi.interactingDrug = parseMedicineObject(reader);
                else if (key == "patientExplanation") ddi.patientExplanation = parsePatientExplanation(reader);
                else if (key == "doctorSummary") ddi.doctorSummary = parseDoctorSummary(reader);
                else reader.skipValue();

                reader.skipWhitespace();
                if (reader.peek() == ',') reader.next();
            }

            if (!ddi.primaryDrug.id.empty() && !ddi.interactingDrug.id.empty()) {
                size_t idx = ddis_.size();
                ddis_.push_back(ddi);
                std::string pkey = makePairKey(ddi.primaryDrug.id, ddi.interactingDrug.id);
                pairIndex_[pkey] = idx;
            }
        }

        reader.skipWhitespace();
        if (reader.peek() == ',') reader.next();
    }

    return !ddis_.empty();
}

bool DdiEngine::loadDfiFromJsonString(const std::string& jsonStr) {
    dfis_.clear();
    medToDfiIndices_.clear();

    SimpleJsonReader reader(jsonStr);
    if (reader.peek() != '[') return false;
    reader.next(); // skip '['

    while (reader.hasNext()) {
        if (reader.peek() == ']') {
            reader.next();
            break;
        }

        if (reader.peek() == '{') {
            reader.next();
            DrugFoodInteraction dfi;

            while (reader.hasNext()) {
                if (reader.peek() == '}') {
                    reader.next();
                    break;
                }
                std::string key = reader.parseString();
                reader.skipWhitespace();
                if (reader.peek() == ':') reader.next();
                reader.skipWhitespace();

                if (key == "id") dfi.id = reader.parseString();
                else if (key == "type") dfi.type = reader.parseString();
                else if (key == "severity") dfi.severity = stringToSeverity(reader.parseString());
                else if (key == "dietaryRecommendation") dfi.dietaryRecommendation = reader.parseString();
                else if (key == "drug") dfi.drug = parseMedicineObject(reader);
                else if (key == "food") dfi.food = parseFoodItem(reader);
                else if (key == "patientExplanation") dfi.patientExplanation = parsePatientExplanation(reader);
                else if (key == "doctorSummary") dfi.doctorSummary = parseDoctorSummary(reader);
                else reader.skipValue();

                reader.skipWhitespace();
                if (reader.peek() == ',') reader.next();
            }

            if (!dfi.drug.id.empty() && !dfi.food.id.empty()) {
                size_t idx = dfis_.size();
                dfis_.push_back(dfi);
                std::string normMedId = normalizeIdStr(dfi.drug.id);
                medToDfiIndices_[normMedId].push_back(idx);
            }
        }

        reader.skipWhitespace();
        if (reader.peek() == ',') reader.next();
    }

    return !dfis_.empty();
}

const DrugDrugInteraction* DdiEngine::checkPair(const std::string& medIdA, const std::string& medIdB) const {
    std::string key = makePairKey(medIdA, medIdB);
    auto it = pairIndex_.find(key);
    if (it != pairIndex_.end()) {
        return &ddis_[it->second];
    }
    return nullptr;
}

std::vector<DrugDrugInteraction> DdiEngine::getDrugInteractions(const std::string& medicineId) const {
    std::vector<DrugDrugInteraction> results;
    std::string normId = normalizeIdStr(medicineId);

    for (const auto& ddi : ddis_) {
        if (normalizeIdStr(ddi.primaryDrug.id) == normId ||
            normalizeIdStr(ddi.interactingDrug.id) == normId) {
            results.push_back(ddi);
        }
    }
    return results;
}

std::vector<DrugFoodInteraction> DdiEngine::getFoodInteractions(const std::string& medicineId) const {
    std::vector<DrugFoodInteraction> results;
    std::string normId = normalizeIdStr(medicineId);

    auto it = medToDfiIndices_.find(normId);
    if (it != medToDfiIndices_.end()) {
        for (size_t idx : it->second) {
            if (idx < dfis_.size()) {
                results.push_back(dfis_[idx]);
            }
        }
    }
    return results;
}

MultiMedicineResponse DdiEngine::checkRegimen(const std::vector<std::string>& medicineIds) const {
    MultiMedicineResponse response;

    // Deduplicate and resolve medicine records
    std::vector<Medicine> activeMeds;
    std::set<std::string> seenIds;

    for (const auto& rawId : medicineIds) {
        std::string normId = normalizeIdStr(rawId);
        if (seenIds.count(normId) == 0) {
            seenIds.insert(normId);
            const Medicine* med = medRepo_ ? medRepo_->getById(rawId) : nullptr;
            if (med) {
                activeMeds.push_back(*med);
            } else {
                Medicine fallback;
                fallback.id = rawId;
                fallback.name = rawId;
                activeMeds.push_back(fallback);
            }
        }
    }

    // 1. Combinatorial cross-check: evaluate all N*(N-1)/2 pairs
    std::set<std::string> detectedDdiIds;
    const size_t numMeds = activeMeds.size();

    for (size_t i = 0; i < numMeds; ++i) {
        for (size_t j = i + 1; j < numMeds; ++j) {
            const auto* ddi = checkPair(activeMeds[i].id, activeMeds[j].id);
            if (ddi && detectedDdiIds.count(ddi->id) == 0) {
                detectedDdiIds.insert(ddi->id);
                response.drugInteractions.push_back(*ddi);
            }
        }
    }

    // 2. Aggregate all dietary contraindications for every medicine in the regimen
    std::set<std::string> detectedDfiIds;
    for (const auto& med : activeMeds) {
        auto medDfis = getFoodInteractions(med.id);
        for (const auto& dfi : medDfis) {
            if (detectedDfiIds.count(dfi.id) == 0) {
                detectedDfiIds.insert(dfi.id);
                response.foodInteractions.push_back(dfi);
            }
        }
    }

    // 3. Build semantic graph without coordinates (frontend SVG layout owns geometric positioning)
    response.graphData = buildSemanticGraph(activeMeds, response.drugInteractions, response.foodInteractions);

    return response;
}

InteractionGraphData DdiEngine::buildSemanticGraph(
    const std::vector<Medicine>& activeMeds,
    const std::vector<DrugDrugInteraction>& detectedDdis,
    const std::vector<DrugFoodInteraction>& detectedDfis
) const {
    InteractionGraphData graph;

    // Determine max severity per drug
    std::unordered_map<std::string, InteractionSeverity> drugMaxSeverity;
    for (const auto& ddi : detectedDdis) {
        std::string pId = normalizeIdStr(ddi.primaryDrug.id);
        std::string iId = normalizeIdStr(ddi.interactingDrug.id);
        if (ddi.severity > drugMaxSeverity[pId]) drugMaxSeverity[pId] = ddi.severity;
        if (ddi.severity > drugMaxSeverity[iId]) drugMaxSeverity[iId] = ddi.severity;
    }

    // Add nodes for all active regimen medicines
    for (size_t i = 0; i < activeMeds.size(); ++i) {
        const auto& med = activeMeds[i];
        GraphNode node;
        node.id = med.id;
        node.label = med.name;
        node.subLabel = med.dosage.empty() ? med.genericName : (med.dosage + " · " + med.genericName);
        node.type = (i == 0) ? "PRIMARY_DRUG" : "INTERACTING_DRUG";
        
        std::string nId = normalizeIdStr(med.id);
        auto sevIt = drugMaxSeverity.find(nId);
        if (sevIt != drugMaxSeverity.end()) {
            node.severity = severityToString(sevIt->second);
        } else {
            node.severity = "LOW";
        }
        graph.nodes.push_back(node);
    }

    // Add nodes for unique food items
    std::set<std::string> seenFoodIds;
    for (const auto& dfi : detectedDfis) {
        if (seenFoodIds.count(dfi.food.id) == 0) {
            seenFoodIds.insert(dfi.food.id);
            GraphNode foodNode;
            foodNode.id = dfi.food.id;
            foodNode.label = dfi.food.name;
            foodNode.subLabel = dfi.food.category;
            foodNode.type = "FOOD";
            foodNode.severity = severityToString(dfi.severity);
            graph.nodes.push_back(foodNode);
        }
    }

    // Add edges for Drug-Drug Interactions
    for (const auto& ddi : detectedDdis) {
        GraphEdge edge;
        edge.id = ddi.id;
        edge.source = ddi.primaryDrug.id;
        edge.target = ddi.interactingDrug.id;
        edge.type = "DRUG_DRUG";
        edge.severity = severityToString(ddi.severity);
        edge.label = severityToString(ddi.severity) + " Risk";
        graph.edges.push_back(edge);
    }

    // Add edges for Drug-Food Interactions
    for (const auto& dfi : detectedDfis) {
        GraphEdge edge;
        edge.id = dfi.id;
        edge.source = dfi.drug.id;
        edge.target = dfi.food.id;
        edge.type = "DRUG_FOOD";
        edge.severity = severityToString(dfi.severity);
        edge.label = dfi.food.name;
        graph.edges.push_back(edge);
    }

    return graph;
}

size_t DdiEngine::ddiCount() const {
    return ddis_.size();
}

size_t DdiEngine::dfiCount() const {
    return dfis_.size();
}

} // namespace polysafe
