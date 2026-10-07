# PolySafe — Drug-Drug & Drug-Food Interaction Checker
**Domain:** Healthcare & Biotech | **Track:** Bio-Pharma Safety  
**Target Audience:** Polypharmacy Patients (taking 5+ medications), Geriatric Caregivers, & Attending Clinicians

---

## 📌 Problem Overview
Elderly and polypharmacy patients frequently receive prescriptions from multiple independent specialists. Uncoordinated regimens increase the probability of severe adverse drug interactions and dangerous food incompatibilities. Handwritten prescriptions and language barriers further exacerbate health risks.

**PolySafe** provides a specialized clinical safety prototype to:
1. Normalize and verify medicines from printed or handwritten prescription scans via OCR.
2. Interactively explore multi-directional Drug-Drug and Drug-Food interaction networks.
3. Visually distinguish interaction severity (`LOW`, `MODERATE`, `HIGH`, `CRITICAL`).
4. Deliver patient-friendly, jargon-free explanations with multi-language text and text-to-speech (TTS) voice synthesis (English, Hindi, Bengali).
5. Provide clinicians with pharmacological mechanism summaries, evidence ratings, and alternatives for clinical review.

---

## 🛠️ Architecture & Tech Stack

- **Framework:** React 19 (TypeScript)
- **Tooling & Bundler:** Vite 6
- **Styling:** Custom Clinical Design Tokens & CSS Variables (zero bloat, high-contrast WCAG compliant)
- **Graph Visualization:** Radial Interactive SVG Graph with zoom/pan and severity halos
- **Icons:** Lucide React
- **Voice / Audio:** Browser Speech Synthesis with regional language mappings
- **API Service Layer:** Centralized client (`src/services/interactionService.ts`) with toggleable mock demo data and live C++ backend endpoint routing

---

## 📂 Project Structure

```text
FRONTEND/
├── index.html                   # HTML entry point with responsive viewport
├── package.json                 # Project manifest & build scripts
├── tsconfig.json                # Strict TypeScript configuration
├── vite.config.ts               # Vite build & alias configuration
├── .gitignore                   # Ignores node_modules, dist, and cache
├── README.md                    # Documentation & API integration guide
└── src/
    ├── main.tsx                 # React DOM root mounting
    ├── App.tsx                  # Master application orchestrator
    ├── index.css                # Global design system & severity CSS tokens
    ├── components/
    │   ├── Header.tsx           # Branding bar, safety notice, & language selector
    │   ├── MedicineSearch.tsx   # Autocomplete search & quick-select test pills
    │   ├── RegimenBag.tsx       # 5-medication polypharmacy bag & elderly presets
    │   ├── InteractionGraph.tsx # Radial SVG interaction network with zoom/pan
    │   ├── InteractionDetails.tsx# Patient View (Voice TTS) & Doctor View (Alternatives)
    │   └── PrescriptionUpload.tsx# OCR preview, editable normalization, & verification
    ├── services/
    │   ├── interactionService.ts# Centralized API layer with mock/live toggle
    │   └── mockData.ts          # Isolated polypharmacy clinical demonstration dataset
    ├── types/
    │   └── interactions.ts      # Domain models, severity enums, & OCR types
    └── utils/
        └── localization.ts      # EN / HI / BN translation dictionaries & TTS helper
```

---

## 🔌 C++ Backend API Integration Contract

The frontend connects to the C++ backend through `src/services/interactionService.ts`. To switch to the live backend, set `USE_MOCK_DATA = false`.

### Planned Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/medicines/search?q={query}` | Autocomplete search for medicines by name or generic |
| `GET` | `/api/v1/interactions?medicine_id={id}` | Retrieve single medicine Drug-Drug and Drug-Food interaction records |
| `POST` | `/api/v1/interactions/regimen` | Retrieve multi-drug cross-interaction network for full polypharmacy regimens |
| `GET` | `/api/v1/graph?medicine_id={id}` | Retrieve node & edge data for interactive visualization |
| `POST` | `/api/v1/ocr/scan` (`multipart/form-data`) | Prescription image upload and OCR extraction |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation
```bash
cd FRONTEND
npm install
```

### Run Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your web browser.

### Production Build
```bash
npm run build
```

---

## ⚖️ Medical Safety Notice
*This software is an engineering prototype designed for academic demonstration and clinical decision-support research. It is never intended to replace licensed medical diagnosis or direct physician judgment. Patients must never alter, start, or discontinue medications without direct physician consultation.*
