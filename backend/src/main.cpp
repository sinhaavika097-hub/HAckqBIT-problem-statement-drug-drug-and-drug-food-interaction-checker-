#include "../include/medicine_repository.hpp"
#include "../include/ddi_engine.hpp"
#include "../include/api_server.hpp"
#include <iostream>
#include <memory>
#include <fstream>

using namespace polysafe;

// Helper to locate dataset path whether running from root or backend/ directory
static std::string resolveDataPath(const std::string& filename) {
    std::string path1 = "backend/data/" + filename;
    std::ifstream f1(path1);
    if (f1.good()) return path1;

    std::string path2 = "data/" + filename;
    std::ifstream f2(path2);
    if (f2.good()) return path2;

    std::string path3 = "../backend/data/" + filename;
    std::ifstream f3(path3);
    if (f3.good()) return path3;

    return filename;
}

int main(int argc, char* argv[]) {
    int port = 8080;
    if (argc > 1) {
        port = std::atoi(argv[1]);
        if (port <= 0) port = 8080;
    }

    std::cout << "========================================================\n";
    std::cout << "       PolySafe: Clinical Polypharmacy REST Engine      \n";
    std::cout << "========================================================\n";

    // 1. Initialize Medicine Catalogue Repository
    auto medRepo = std::make_shared<MedicineRepository>();
    std::string medPath = resolveDataPath("medicines.json");
    if (medRepo->loadFromFile(medPath)) {
        std::cout << "[+] Loaded " << medRepo->count() << " clinical medicines from: " << medPath << "\n";
    } else {
        std::cerr << "[-] Warning: Failed to load medicines catalogue from: " << medPath << "\n";
    }

    // 2. Initialize Interaction & Polypharmacy Engine
    auto ddiEngine = std::make_shared<DdiEngine>(medRepo);
    std::string ddiPath = resolveDataPath("drug_drug_interactions.json");
    std::string dfiPath = resolveDataPath("drug_food_interactions.json");
    if (ddiEngine->loadInteractions(ddiPath, dfiPath)) {
        std::cout << "[+] Loaded " << ddiEngine->ddiCount() << " validated DDI rules from: " << ddiPath << "\n";
        std::cout << "[+] Loaded " << ddiEngine->dfiCount() << " validated DFI rules from: " << dfiPath << "\n";
    } else {
        std::cerr << "[-] Warning: Failed to load interaction rules.\n";
    }

    // 3. Start REST API Server
    std::cout << "[+] Bootstrapping REST HTTP service on port " << port << "...\n";
    std::cout << "    Endpoints available:\n";
    std::cout << "    - GET  http://127.0.0.1:" << port << "/api/v1/medicines/search?q=:name\n";
    std::cout << "    - GET  http://127.0.0.1:" << port << "/api/v1/medicines\n";
    std::cout << "    - GET  http://127.0.0.1:" << port << "/api/v1/interactions?medicineId=:id\n";
    std::cout << "    - POST http://127.0.0.1:" << port << "/api/v1/interactions/regimen\n";
    std::cout << "    - POST http://127.0.0.1:" << port << "/api/v1/ocr/scan\n";
    std::cout << "    - GET  http://127.0.0.1:" << port << "/health\n";
    std::cout << "--------------------------------------------------------\n";

    ApiServer server(medRepo, ddiEngine, port);
    if (!server.start()) {
        std::cerr << "[-] Failed to start HTTP server on port " << port << ".\n";
        return 1;
    }

    return 0;
}
