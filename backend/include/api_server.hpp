#pragma once

#include "types.hpp"
#include "medicine_repository.hpp"
#include "ddi_engine.hpp"
#include <string>
#include <vector>
#include <memory>
#include <cstdint>

namespace polysafe {

// HTTP Request abstraction
struct HttpRequest {
    std::string method; // "GET", "POST", "OPTIONS"
    std::string path;   // "/api/v1/medicines/search"
    std::string query;  // "q=warfarin"
    std::string body;   // JSON payload for POST
};

// HTTP Response abstraction
struct HttpResponse {
    int statusCode{200};
    std::string contentType{"application/json"};
    std::string body;
};

/**
 * @brief REST API HTTP Server for Clinical Polypharmacy Safety Checker.
 * 
 * Exposes core endpoints matching frontend interactionService:
 * - GET  /api/v1/medicines/search?q=...
 * - GET  /api/v1/medicines
 * - GET  /api/v1/interactions?medicineId=...
 * - POST /api/v1/interactions/regimen
 * - POST /api/v1/ocr/scan
 */
class ApiServer {
public:
    ApiServer(std::shared_ptr<MedicineRepository> medRepo,
              std::shared_ptr<DdiEngine> ddiEngine,
              int port = 8080);
    ~ApiServer();

    /**
     * @brief Start listening for incoming HTTP connections on configured port.
     */
    bool start();

    /**
     * @brief Stop server and release networking resources.
     */
    void stop();

    /**
     * @brief Check whether server is active and listening.
     */
    bool isRunning() const;

    /**
     * @brief Route and dispatch an incoming HTTP request.
     * Handles CORS pre-flight, validation, and serialization.
     */
    HttpResponse handleRequest(const HttpRequest& req);

    // JSON serialization utilities
    static std::string serializeMedicine(const Medicine& med);
    static std::string serializeMedicineList(const std::vector<Medicine>& meds);
    static std::string serializeDdi(const DrugDrugInteraction& ddi);
    static std::string serializeDfi(const DrugFoodInteraction& dfi);
    static std::string serializeMultiMedicineResponse(const MultiMedicineResponse& resp);
    static std::string serializeOcrResult(const PrescriptionOcrResult& result);
    static std::string serializeError(const std::string& errorMsg, int code = 400);

private:
    std::shared_ptr<MedicineRepository> medRepo_;
    std::shared_ptr<DdiEngine> ddiEngine_;
    int port_;
    bool isRunning_{false};
    uintptr_t serverSocket_{0};

    // Endpoint dispatchers
    HttpResponse handleMedicineSearch(const std::string& query);
    HttpResponse handleAllMedicines();
    HttpResponse handleInteractions(const std::string& query);
    HttpResponse handleRegimenCheck(const std::string& requestBody);
    HttpResponse handleOcrScan(const std::string& requestBody);

    static std::string extractQueryParam(const std::string& query, const std::string& paramName);
    static std::vector<std::string> parseMedicineIdsFromBody(const std::string& jsonBody);
};

} // namespace polysafe
