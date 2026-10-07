#include <iostream>
#include <string>
#include <vector>
#include <unordered_map>

// Match React TypeScript Interfaces
struct GraphNode {
    std::string id;
    std::string label;
    std::string type;     // "PRIMARY_DRUG", "DRUG", "FOOD"
    std::string severity; // "LOW", "MODERATE", "HIGH", "CRITICAL"
};

struct GraphEdge {
    std::string id;
    std::string source;
    std::string target;
    std::string severity; // "LOW", "MODERATE", "HIGH", "CRITICAL"
    std::string description;
};

// Internal Interaction definition
struct Interaction {
    std::string target;
    std::string targetType;
    std::string severity;
    std::string description;
};

// In-Memory Adjacency List
typedef std::unordered_map<std::string, std::vector<Interaction>> KnowledgeGraph;

// Helper to escape strings for JSON
std::string escapeJSON(const std::string& s) {
    std::string out;
    for (char c : s) {
        if (c == '"') out += "\\\"";
        else out += c;
    }
    return out;
}

int main(int argc, char* argv[]) {
    // 1. Initialize Graph with Hackathon Prototype Data
    KnowledgeGraph kg;
    
    // Warfarin Interactions (Primary Drug example)
    kg["Warfarin"].push_back({"Aspirin", "DRUG", "CRITICAL", "Increased risk of severe gastrointestinal bleeding."});
    kg["Warfarin"].push_back({"Spinach", "FOOD", "MODERATE", "High Vitamin K reduces anticoagulant effectiveness."});
    kg["Warfarin"].push_back({"Paracetamol", "DRUG", "LOW", "Safe in low doses, monitor prolonged use."});

    // 2. Simulate Input (In production, this comes from OCR text)
    std::string primaryDrug = "Warfarin";
    std::vector<std::pair<std::string, std::string>> patientProfile = {
        {"Aspirin", "DRUG"},
        {"Spinach", "FOOD"},
        {"Paracetamol", "DRUG"}
    };

    // 3. Process Interactions and Build React-Compatible Data
    std::vector<GraphNode> nodes;
    std::vector<GraphEdge> edges;
    
    // Add Primary Node
    nodes.push_back({"node_" + primaryDrug, primaryDrug, "PRIMARY_DRUG", "CRITICAL"}); // Severity reflects highest risk

    int edgeCounter = 1;
    if (kg.find(primaryDrug) != kg.end()) {
        for (const auto& med : patientProfile) {
            std::string peripheralEntity = med.first;
            std::string entityType = med.second;

            // Check if this peripheral entity interacts with the primary drug
            for (const auto& interaction : kg[primaryDrug]) {
                if (interaction.target == peripheralEntity) {
                    // Add Peripheral Node
                    nodes.push_back({
                        "node_" + peripheralEntity, 
                        peripheralEntity, 
                        entityType, 
                        interaction.severity
                    });

                    // Add Connecting Edge
                    edges.push_back({
                        "edge_" + std::to_string(edgeCounter++),
                        "node_" + primaryDrug,
                        "node_" + peripheralEntity,
                        interaction.severity,
                        interaction.description
                    });
                }
            }
        }
    }

    // 4. Output Raw JSON to stdout (Node.js will capture this)
    std::cout << "{\n  \"nodes\": [\n";
    for (size_t i = 0; i < nodes.size(); ++i) {
        std::cout << "    {\"id\": \"" << nodes[i].id << "\", \"label\": \"" << escapeJSON(nodes[i].label) 
                  << "\", \"type\": \"" << nodes[i].type << "\", \"severity\": \"" << nodes[i].severity << "\"}";
        if (i < nodes.size() - 1) std::cout << ",";
        std::cout << "\n";
    }
    
    std::cout << "  ],\n  \"edges\": [\n";
    for (size_t i = 0; i < edges.size(); ++i) {
        std::cout << "    {\"id\": \"" << edges[i].id << "\", \"source\": \"" << edges[i].source 
                  << "\", \"target\": \"" << edges[i].target << "\", \"severity\": \"" << edges[i].severity 
                  << "\", \"description\": \"" << escapeJSON(edges[i].description) << "\"}";
        if (i < edges.size() - 1) std::cout << ",";
        std::cout << "\n";
    }
    std::cout << "  ]\n}\n";

    return 0;
}