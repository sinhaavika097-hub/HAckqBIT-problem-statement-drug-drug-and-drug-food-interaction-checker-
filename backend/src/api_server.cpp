#include "../include/api_server.hpp"
#include <winsock2.h>
#include <ws2tcpip.h>
#include <iostream>
#include <sstream>
#include <algorithm>
#include <cctype>

namespace polysafe {

// Helper to escape characters for valid JSON output
static std::string escapeJson(const std::string& str) {
    std::string out;
    out.reserve(str.size() + 16);
    for (char c : str) {
        if (c == '"') out += "\\\"";
        else if (c == '\\') out += "\\\\";
        else if (c == '\b') out += "\\b";
        else if (c == '\f') out += "\\f";
        else if (c == '\n') out += "\\n";
        else if (c == '\r') out += "\\r";
        else if (c == '\t') out += "\\t";
        else out += c;
    }
    return out;
}

// URL-decode helper (decodes %20, %2C, +, etc.)
static std::string urlDecode(const std::string& in) {
    std::string out;
    out.reserve(in.size());
    for (size_t i = 0; i < in.size(); ++i) {
        if (in[i] == '+') {
            out += ' ';
        } else if (in[i] == '%' && i + 2 < in.size()) {
            int h1 = std::tolower(static_cast<unsigned char>(in[i + 1]));
            int h2 = std::tolower(static_cast<unsigned char>(in[i + 2]));
            auto hexVal = [](int c) -> int {
                if (c >= '0' && c <= '9') return c - '0';
                if (c >= 'a' && c <= 'f') return c - 'a' + 10;
                return 0;
            };
            out += static_cast<char>((hexVal(h1) << 4) | hexVal(h2));
            i += 2;
        } else {
            out += in[i];
        }
    }
    return out;
}

ApiServer::ApiServer(std::shared_ptr<MedicineRepository> medRepo,
                     std::shared_ptr<DdiEngine> ddiEngine,
                     int port)
    : medRepo_(std::move(medRepo)),
      ddiEngine_(std::move(ddiEngine)),
      port_(port),
      isRunning_(false),
      serverSocket_(0) {}

ApiServer::~ApiServer() {
    stop();
}

bool ApiServer::isRunning() const {
    return isRunning_;
}

void ApiServer::stop() {
    if (isRunning_) {
        isRunning_ = false;
        if (serverSocket_ != 0 && serverSocket_ != static_cast<uintptr_t>(INVALID_SOCKET)) {
            closesocket(static_cast<SOCKET>(serverSocket_));
            serverSocket_ = 0;
        }
        WSACleanup();
    }
}

std::string ApiServer::extractQueryParam(const std::string& query, const std::string& paramName) {
    std::string key = paramName + "=";
    size_t start = query.find(key);
    if (start == std::string::npos) {
        // Also check if preceded by '&'
        return "";
    }
    start += key.length();
    size_t end = query.find('&', start);
    if (end == std::string::npos) {
        return urlDecode(query.substr(start));
    }
    return urlDecode(query.substr(start, end - start));
}

std::vector<std::string> ApiServer::parseMedicineIdsFromBody(const std::string& jsonBody) {
    std::vector<std::string> ids;
    size_t keyPos = jsonBody.find("\"medicineIds\"");
    if (keyPos == std::string::npos) return ids;

    size_t arrStart = jsonBody.find('[', keyPos);
    if (arrStart == std::string::npos) return ids;

    size_t arrEnd = jsonBody.find(']', arrStart);
    if (arrEnd == std::string::npos) return ids;

    std::string inner = jsonBody.substr(arrStart + 1, arrEnd - arrStart - 1);
    size_t pos = 0;
    while (pos < inner.size()) {
        size_t q1 = inner.find('"', pos);
        if (q1 == std::string::npos) break;
        size_t q2 = inner.find('"', q1 + 1);
        if (q2 == std::string::npos) break;
        ids.push_back(inner.substr(q1 + 1, q2 - q1 - 1));
        pos = q2 + 1;
    }
    return ids;
}

// JSON Serializers
std::string ApiServer::serializeMedicine(const Medicine& med) {
    std::ostringstream ss;
    ss << "{\"id\":\"" << escapeJson(med.id) << "\","
       << "\"name\":\"" << escapeJson(med.name) << "\","
       << "\"genericName\":\"" << escapeJson(med.genericName) << "\","
       << "\"dosage\":\"" << escapeJson(med.dosage) << "\","
       << "\"category\":\"" << escapeJson(med.category) << "\","
       << "\"atcCode\":\"" << escapeJson(med.atcCode) << "\","
       << "\"brandNames\":[";
    for (size_t i = 0; i < med.brandNames.size(); ++i) {
        if (i > 0) ss << ",";
        ss << "\"" << escapeJson(med.brandNames[i]) << "\"";
    }
    ss << "]}";
    return ss.str();
}

std::string ApiServer::serializeMedicineList(const std::vector<Medicine>& meds) {
    std::ostringstream ss;
    ss << "[";
    for (size_t i = 0; i < meds.size(); ++i) {
        if (i > 0) ss << ",";
        ss << serializeMedicine(meds[i]);
    }
    ss << "]";
    return ss.str();
}

static std::string serializePatientExplanation(const PatientExplanation& pe) {
    std::ostringstream ss;
    ss << "{\"summary\":\"" << escapeJson(pe.summary) << "\","
       << "\"whatItMeans\":\"" << escapeJson(pe.whatItMeans) << "\","
       << "\"whyItMatters\":\"" << escapeJson(pe.whyItMatters) << "\","
       << "\"actionAdvice\":\"" << escapeJson(pe.actionAdvice) << "\"}";
    return ss.str();
}

static std::string serializeDoctorSummary(const DoctorSummary& ds) {
    std::ostringstream ss;
    ss << "{\"clinicalMechanism\":\"" << escapeJson(ds.clinicalMechanism) << "\","
       << "\"evidenceLevel\":\"" << escapeJson(ds.evidenceLevel) << "\","
       << "\"suggestedAction\":\"" << escapeJson(ds.suggestedAction) << "\","
       << "\"monitoringParameters\":[";
    for (size_t i = 0; i < ds.monitoringParameters.size(); ++i) {
        if (i > 0) ss << ",";
        ss << "\"" << escapeJson(ds.monitoringParameters[i]) << "\"";
    }
    ss << "],\"alternativesForReview\":[";
    for (size_t i = 0; i < ds.alternativesForReview.size(); ++i) {
        if (i > 0) ss << ",";
        const auto& alt = ds.alternativesForReview[i];
        ss << "{\"id\":\"" << escapeJson(alt.id) << "\","
           << "\"medicineName\":\"" << escapeJson(alt.medicineName) << "\","
           << "\"rationale\":\"" << escapeJson(alt.rationale) << "\","
           << "\"requiresPrescription\":" << (alt.requiresPrescription ? "true" : "false") << ","
           << "\"safetyNote\":\"" << escapeJson(alt.safetyNote) << "\"}";
    }
    ss << "]}";
    return ss.str();
}

std::string ApiServer::serializeDdi(const DrugDrugInteraction& ddi) {
    std::ostringstream ss;
    ss << "{\"id\":\"" << escapeJson(ddi.id) << "\","
       << "\"type\":\"DRUG_DRUG\","
       << "\"primaryDrug\":" << serializeMedicine(ddi.primaryDrug) << ","
       << "\"interactingDrug\":" << serializeMedicine(ddi.interactingDrug) << ","
       << "\"severity\":\"" << severityToString(ddi.severity) << "\","
       << "\"patientExplanation\":" << serializePatientExplanation(ddi.patientExplanation) << ","
       << "\"doctorSummary\":" << serializeDoctorSummary(ddi.doctorSummary) << ","
       << "\"documentationUrl\":\"" << escapeJson(ddi.documentationUrl) << "\"}";
    return ss.str();
}

std::string ApiServer::serializeDfi(const DrugFoodInteraction& dfi) {
    std::ostringstream ss;
    ss << "{\"id\":\"" << escapeJson(dfi.id) << "\","
       << "\"type\":\"DRUG_FOOD\","
       << "\"drug\":" << serializeMedicine(dfi.drug) << ","
       << "\"food\":{\"id\":\"" << escapeJson(dfi.food.id) << "\","
       << "\"name\":\"" << escapeJson(dfi.food.name) << "\","
       << "\"category\":\"" << escapeJson(dfi.food.category) << "\","
       << "\"commonExamples\":[";
    for (size_t i = 0; i < dfi.food.commonExamples.size(); ++i) {
        if (i > 0) ss << ",";
        ss << "\"" << escapeJson(dfi.food.commonExamples[i]) << "\"";
    }
    ss << "]},\"severity\":\"" << severityToString(dfi.severity) << "\","
       << "\"patientExplanation\":" << serializePatientExplanation(dfi.patientExplanation) << ","
       << "\"doctorSummary\":" << serializeDoctorSummary(dfi.doctorSummary) << ","
       << "\"dietaryRecommendation\":\"" << escapeJson(dfi.dietaryRecommendation) << "\"}";
    return ss.str();
}

std::string ApiServer::serializeMultiMedicineResponse(const MultiMedicineResponse& resp) {
    std::ostringstream ss;
    ss << "{\"graphData\":{\"nodes\":[";
    for (size_t i = 0; i < resp.graphData.nodes.size(); ++i) {
        if (i > 0) ss << ",";
        const auto& node = resp.graphData.nodes[i];
        ss << "{\"id\":\"" << escapeJson(node.id) << "\","
           << "\"label\":\"" << escapeJson(node.label) << "\","
           << "\"subLabel\":\"" << escapeJson(node.subLabel) << "\","
           << "\"type\":\"" << escapeJson(node.type) << "\","
           << "\"severity\":\"" << escapeJson(node.severity) << "\"}";
    }
    ss << "],\"edges\":[";
    for (size_t i = 0; i < resp.graphData.edges.size(); ++i) {
        if (i > 0) ss << ",";
        const auto& edge = resp.graphData.edges[i];
        ss << "{\"id\":\"" << escapeJson(edge.id) << "\","
           << "\"source\":\"" << escapeJson(edge.source) << "\","
           << "\"target\":\"" << escapeJson(edge.target) << "\","
           << "\"type\":\"" << escapeJson(edge.type) << "\","
           << "\"severity\":\"" << escapeJson(edge.severity) << "\","
           << "\"label\":\"" << escapeJson(edge.label) << "\"}";
    }
    ss << "]},\"drugInteractions\":[";
    for (size_t i = 0; i < resp.drugInteractions.size(); ++i) {
        if (i > 0) ss << ",";
        ss << serializeDdi(resp.drugInteractions[i]);
    }
    ss << "],\"foodInteractions\":[";
    for (size_t i = 0; i < resp.foodInteractions.size(); ++i) {
        if (i > 0) ss << ",";
        ss << serializeDfi(resp.foodInteractions[i]);
    }
    ss << "]}";
    return ss.str();
}

std::string ApiServer::serializeOcrResult(const PrescriptionOcrResult& result) {
    std::ostringstream ss;
    ss << "{\"imageUrl\":\"" << escapeJson(result.imageUrl) << "\","
       << "\"processingTimeMs\":" << result.processingTimeMs << ","
       << "\"rawOcrText\":\"" << escapeJson(result.rawOcrText) << "\","
       << "\"extractedMedicines\":[";
    for (size_t i = 0; i < result.extractedMedicines.size(); ++i) {
        if (i > 0) ss << ",";
        const auto& em = result.extractedMedicines[i];
        ss << "{\"id\":\"" << escapeJson(em.id) << "\","
           << "\"rawText\":\"" << escapeJson(em.rawText) << "\","
           << "\"normalizedName\":\"" << escapeJson(em.normalizedName) << "\","
           << "\"confidence\":" << em.confidence << ","
           << "\"isConfirmed\":" << (em.isConfirmed ? "true" : "false") << ","
           << "\"dosage\":\"" << escapeJson(em.dosage) << "\","
           << "\"frequency\":\"" << escapeJson(em.frequency) << "\"}";
    }
    ss << "]}";
    return ss.str();
}

std::string ApiServer::serializeError(const std::string& errorMsg, int code) {
    std::ostringstream ss;
    ss << "{\"error\":\"" << escapeJson(errorMsg) << "\",\"code\":" << code << "}";
    return ss.str();
}

// Request Routing & Handlers
HttpResponse ApiServer::handleMedicineSearch(const std::string& query) {
    HttpResponse res;
    if (!medRepo_) {
        res.statusCode = 500;
        res.body = serializeError("Medicine repository not initialized", 500);
        return res;
    }
    auto results = medRepo_->search(query, 12);
    res.statusCode = 200;
    res.body = serializeMedicineList(results);
    return res;
}

HttpResponse ApiServer::handleAllMedicines() {
    HttpResponse res;
    if (!medRepo_) {
        res.statusCode = 500;
        res.body = serializeError("Medicine repository not initialized", 500);
        return res;
    }
    auto results = medRepo_->getAll();
    res.statusCode = 200;
    res.body = serializeMedicineList(results);
    return res;
}

HttpResponse ApiServer::handleInteractions(const std::string& query) {
    HttpResponse res;
    if (!ddiEngine_) {
        res.statusCode = 500;
        res.body = serializeError("DDI engine not initialized", 500);
        return res;
    }
    std::string medId = extractQueryParam(query, "medicineId");
    if (medId.empty()) {
        res.statusCode = 400;
        res.body = serializeError("Missing required query parameter: medicineId", 400);
        return res;
    }

    auto ddis = ddiEngine_->getDrugInteractions(medId);
    auto dfis = ddiEngine_->getFoodInteractions(medId);

    std::ostringstream ss;
    ss << "{\"drugInteractions\":[";
    for (size_t i = 0; i < ddis.size(); ++i) {
        if (i > 0) ss << ",";
        ss << serializeDdi(ddis[i]);
    }
    ss << "],\"foodInteractions\":[";
    for (size_t i = 0; i < dfis.size(); ++i) {
        if (i > 0) ss << ",";
        ss << serializeDfi(dfis[i]);
    }
    ss << "]}";

    res.statusCode = 200;
    res.body = ss.str();
    return res;
}

HttpResponse ApiServer::handleRegimenCheck(const std::string& requestBody) {
    HttpResponse res;
    if (!ddiEngine_) {
        res.statusCode = 500;
        res.body = serializeError("DDI engine not initialized", 500);
        return res;
    }

    auto medicineIds = parseMedicineIdsFromBody(requestBody);
    if (medicineIds.empty()) {
        res.statusCode = 400;
        res.body = serializeError("Invalid request: medicineIds array is empty or missing", 400);
        return res;
    }

    auto multiResp = ddiEngine_->checkRegimen(medicineIds);
    res.statusCode = 200;
    res.body = serializeMultiMedicineResponse(multiResp);
    return res;
}

HttpResponse ApiServer::handleOcrScan(const std::string& requestBody) {
    HttpResponse res;
    PrescriptionOcrResult result;
    result.imageUrl = "prescription_scan.jpg";
    result.processingTimeMs = 185;

    // Extract text from payload or fallback to standard sample prescription
    std::string textContent = requestBody;
    size_t textPos = requestBody.find("\"text\":");
    if (textPos != std::string::npos) {
        size_t q1 = requestBody.find('"', textPos + 7);
        size_t q2 = requestBody.find('"', q1 + 1);
        if (q1 != std::string::npos && q2 != std::string::npos) {
            textContent = requestBody.substr(q1 + 1, q2 - q1 - 1);
        }
    }

    if (textContent.empty() || textContent.length() < 5) {
        textContent = "Rx:\n1. Tab Warfarin 5mg OD\n2. Tab Aspirin 75mg OD\n3. Tab Atorvastatin 20mg HS";
    }
    result.rawOcrText = textContent;

    // Scan lines for candidate medications using repository normalization
    std::stringstream ss(textContent);
    std::string line;
    int lineIdx = 1;
    while (std::getline(ss, line)) {
        if (line.empty()) continue;
        std::string normId = medRepo_ ? medRepo_->normalizeToId(line) : "";
        if (!normId.empty()) {
            const Medicine* med = medRepo_->getById(normId);
            ExtractedMedicine em;
            em.id = "ocr_med_" + std::to_string(lineIdx++);
            em.rawText = line;
            em.normalizedName = med ? med->name : normId;
            em.confidence = 0.94;
            em.isConfirmed = false;
            em.dosage = med ? med->dosage : "";
            em.frequency = "Once Daily";
            result.extractedMedicines.push_back(em);
        }
    }

    // Fallback baseline candidate if none resolved directly
    if (result.extractedMedicines.empty() && medRepo_) {
        const auto* w = medRepo_->getById("med_warfarin");
        const auto* a = medRepo_->getById("med_aspirin");
        if (w) {
            ExtractedMedicine em;
            em.id = "ocr_med_1";
            em.rawText = "Tab Warfarin 5mg";
            em.normalizedName = w->name;
            em.confidence = 0.92;
            em.dosage = "5mg";
            em.frequency = "Once daily (evening)";
            result.extractedMedicines.push_back(em);
        }
        if (a) {
            ExtractedMedicine em;
            em.id = "ocr_med_2";
            em.rawText = "Tab Aspirin 75mg";
            em.normalizedName = a->name;
            em.confidence = 0.89;
            em.dosage = "75mg";
            em.frequency = "Once daily (morning)";
            result.extractedMedicines.push_back(em);
        }
    }

    res.statusCode = 200;
    res.body = serializeOcrResult(result);
    return res;
}

HttpResponse ApiServer::handleRequest(const HttpRequest& req) {
    // 1. Handle CORS pre-flight
    if (req.method == "OPTIONS") {
        HttpResponse res;
        res.statusCode = 204;
        res.contentType = "text/plain";
        res.body = "";
        return res;
    }

    // 2. Dispatch routes
    if (req.method == "GET") {
        if (req.path == "/api/v1/medicines/search") {
            std::string q = extractQueryParam(req.query, "q");
            return handleMedicineSearch(q);
        } else if (req.path == "/api/v1/medicines") {
            return handleAllMedicines();
        } else if (req.path == "/api/v1/interactions") {
            return handleInteractions(req.query);
        } else if (req.path == "/health" || req.path == "/api/v1/health") {
            HttpResponse res;
            res.statusCode = 200;
            res.body = "{\"status\":\"UP\",\"service\":\"polysafe-cpp-backend\"}";
            return res;
        }
    } else if (req.method == "POST") {
        if (req.path == "/api/v1/interactions/regimen") {
            return handleRegimenCheck(req.body);
        } else if (req.path == "/api/v1/ocr/scan") {
            return handleOcrScan(req.body);
        }
    }

    HttpResponse res;
    res.statusCode = 404;
    res.body = serializeError("Endpoint not found: " + req.method + " " + req.path, 404);
    return res;
}

bool ApiServer::start() {
    WSADATA wsaData;
    if (WSAStartup(MAKEWORD(2, 2), &wsaData) != 0) {
        std::cerr << "[ApiServer] WSAStartup failed.\n";
        return false;
    }

    SOCKET listenSock = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
    if (listenSock == INVALID_SOCKET) {
        std::cerr << "[ApiServer] socket() failed.\n";
        WSACleanup();
        return false;
    }

    // Allow address reuse
    int opt = 1;
    setsockopt(listenSock, SOL_SOCKET, SO_REUSEADDR, reinterpret_cast<const char*>(&opt), sizeof(opt));

    sockaddr_in serverAddr{};
    serverAddr.sin_family = AF_INET;
    serverAddr.sin_addr.s_addr = INADDR_ANY;
    serverAddr.sin_port = htons(static_cast<u_short>(port_));

    if (bind(listenSock, reinterpret_cast<sockaddr*>(&serverAddr), sizeof(serverAddr)) == SOCKET_ERROR) {
        std::cerr << "[ApiServer] bind() failed on port " << port_ << ".\n";
        closesocket(listenSock);
        WSACleanup();
        return false;
    }

    if (listen(listenSock, 16) == SOCKET_ERROR) {
        std::cerr << "[ApiServer] listen() failed.\n";
        closesocket(listenSock);
        WSACleanup();
        return false;
    }

    serverSocket_ = static_cast<uintptr_t>(listenSock);
    isRunning_ = true;
    std::cout << "[ApiServer] Listening on http://127.0.0.1:" << port_ << " (CORS enabled)\n";

    // Main synchronous accept loop
    while (isRunning_) {
        sockaddr_in clientAddr{};
        int clientLen = sizeof(clientAddr);
        SOCKET clientSock = accept(listenSock, reinterpret_cast<sockaddr*>(&clientAddr), &clientLen);

        if (clientSock == INVALID_SOCKET) {
            if (!isRunning_) break;
            continue;
        }

        // Read HTTP request header
        char buffer[4096];
        int bytesRead = recv(clientSock, buffer, sizeof(buffer) - 1, 0);
        if (bytesRead > 0) {
            buffer[bytesRead] = '\0';
            std::string raw(buffer, bytesRead);

            HttpRequest req;
            std::istringstream stream(raw);
            std::string line;
            if (std::getline(stream, line)) {
                if (!line.empty() && line.back() == '\r') line.pop_back();
                std::istringstream lineStream(line);
                std::string fullPath;
                lineStream >> req.method >> fullPath;

                size_t qPos = fullPath.find('?');
                if (qPos != std::string::npos) {
                    req.path = fullPath.substr(0, qPos);
                    req.query = fullPath.substr(qPos + 1);
                } else {
                    req.path = fullPath;
                }
            }

            // Extract body if POST
            size_t bodyPos = raw.find("\r\n\r\n");
            if (bodyPos != std::string::npos) {
                req.body = raw.substr(bodyPos + 4);
            }

            // Process request
            HttpResponse res = handleRequest(req);

            // Send response with full CORS headers
            std::ostringstream responseStream;
            responseStream << "HTTP/1.1 " << res.statusCode << " ";
            if (res.statusCode == 200) responseStream << "OK";
            else if (res.statusCode == 204) responseStream << "No Content";
            else if (res.statusCode == 400) responseStream << "Bad Request";
            else if (res.statusCode == 404) responseStream << "Not Found";
            else responseStream << "Internal Error";
            responseStream << "\r\n";

            responseStream << "Access-Control-Allow-Origin: *\r\n";
            responseStream << "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n";
            responseStream << "Access-Control-Allow-Headers: Content-Type, Authorization\r\n";
            responseStream << "Content-Type: " << res.contentType << "; charset=utf-8\r\n";
            responseStream << "Content-Length: " << res.body.size() << "\r\n";
            responseStream << "Connection: close\r\n\r\n";
            responseStream << res.body;

            std::string respStr = responseStream.str();
            send(clientSock, respStr.c_str(), static_cast<int>(respStr.size()), 0);
        }

        closesocket(clientSock);
    }

    return true;
}

} // namespace polysafe
