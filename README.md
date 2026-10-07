# PolySafe 🩺 — Drug-Drug &amp; Drug-Food Interaction Checker for Polypharmacy Patients

> **Domain:** Healthcare &amp; Biotech &nbsp;|&nbsp; **Track:** Bio-Pharma Safety  
> **Problem Statement:** Preventing dangerous adverse drug interactions and food contraindications for elderly and polypharmacy patients taking 5+ medications prescribed by multiple independent doctors.

---

## 🌟 Solution Overview

Elderly polypharmacy patients often suffer from uncoordinated treatment regimens:
- Multiple specialists prescribe medications without full visibility into overlapping regimens.
- Prescriptions are frequently handwritten or printed with varying regional conventions.
- Patients may have limited medical literacy or understand only regional Indian languages.

**PolySafe** is an end-to-end clinical decision-support and patient safety platform combining a **C++ OpenCV + Tesseract OCR pipeline** with a **React 19 + TypeScript clinical frontend**.

```text
 ┌────────────────────────┐      ┌─────────────────────────┐      ┌─────────────────────────┐
 │ Handwritten / Printed  │      │ C++ Preprocessing & OCR │      │  extracted_             │
 │   Prescription Image   │ ───► │  (OpenCV + Tesseract)   │ ───► │  prescription.txt       │
 └────────────────────────┘      └─────────────────────────┘      └────────────┬────────────┘
                                                                               │
 ┌────────────────────────┐      ┌─────────────────────────┐                   │
 │ Voice Audio (TTS) in   │ ◄─── │ Multi-Drug Interaction  │ ◄─────────────────┘
 │  Hindi, Bengali, & EN  │      │  Graph & Regimen Bag    │  (Normalization & Verification)
 └────────────────────────┘      └─────────────────────────┘
```

---

## 🚀 Key Features

### 1. 🔍 Multi-Medication Polypharmacy Bag (5+ Rx Regimen)
- Designed specifically for patients on multi-drug regimens.
- One-click **"Load Elderly Regimen (5 Rx Preset)"** instantly tests *Warfarin, Aspirin, Atorvastatin, Metformin, and Ciprofloxacin*.
- Detects multi-directional cross-interactions across all 5 medications simultaneously.

### 2. 🕸️ Interactive Radial SVG Interaction Graph
- Medicine-to-medicine and medicine-to-food connection network.
- Visual severity coding (`LOW`, `MODERATE`, `HIGH`, `CRITICAL`) with non-color-reliant indicators.
- Interactive pan, zoom in/out, reset view, and clickable node/edge inspection.

### 3. 👥 Dual-Perspective Insights
- **Patient-Friendly View:** Simple language explaining *What it means*, *Why it matters*, and *What you should do*.
- **Doctor-Facing View:** Pharmacological mechanism, evidence levels (`ESTABLISHED`, `PROBABLE`), monitoring parameters (e.g. INR, liver enzymes), and **"Possible alternatives for clinician review"** (strict medical safety rules).

### 4. 🇮🇳 Indian Regional Languages & Voice Audio (TTS)
- Full localization for **English (`en`)**, **हिन्दी (`hi`)**, and **বাংলা (`bn`)**.
- Integrated speech synthesis reads patient warnings aloud in clear, paced regional audio.

### 5. 📷 C++ OCR Prescription Pipeline Integration
- C++ backend cleans prescription images with bilateral filtering and adaptive thresholding (`ocrppline1.cpp`).
- Tesseract OCR engine extracts text and writes `extracted_prescription.txt` (`ocrppline12.cpp`).
- The frontend features an **"Import C++ Output (.txt)"** loader to parse, normalize, review confidence, and verify drugs into the regimen bag.

---

## 🏗️ Repository Architecture

```text
.
├── ocrppline1.cpp               # C++ OpenCV image preprocessing pipeline
├── ocrppline12.cpp              # C++ OpenCV + Tesseract OCR extraction engine
├── README.md                    # Root project documentation
└── FRONTEND/                    # React 19 + TypeScript + Vite Web Application
    ├── index.html               # SPA mounting entry point
    ├── package.json             # Manifest, dependencies, and build scripts
    ├── tsconfig.json            # Strict TypeScript configuration
    ├── vite.config.ts           # Vite dev server and bundler config
    └── src/
        ├── App.tsx              # Master UI orchestrator
        ├── main.tsx             # React DOM root
        ├── index.css            # Clinical design system & severity CSS tokens
        ├── components/
        │   ├── Header.tsx           # Safety banner & regional language switcher
        │   ├── MedicineSearch.tsx   # Autocomplete live search & quick test pills
        │   ├── RegimenBag.tsx       # Polypharmacy medication bag (5+ Rx)
        │   ├── InteractionGraph.tsx # Radial SVG network with zoom/pan
        │   ├── InteractionDetails.tsx# Patient View (Voice TTS) & Doctor View (Alternatives)
        │   └── PrescriptionUpload.tsx# OCR preview, correction, & C++ TXT import
        ├── services/
        │   ├── interactionService.ts# Centralized API service with mock/live toggle
        │   └── mockData.ts          # Isolated clinical polypharmacy dataset
        ├── types/
        │   └── interactions.ts      # Data contracts, severity enums, and OCR types
        └── utils/
            └── localization.ts      # EN / HI / BN translation dictionaries & TTS helper
```

---

## 💻 Quick Start & Running Locally

### Running the Frontend
```bash
# Navigate to FRONTEND
cd FRONTEND

# Install dependencies
npm install

# Start development server
npm run dev
```
Open **`http://localhost:3000`** in your browser.

### Running the C++ OCR Pipeline
```bash
# Compile image preprocessing
g++ ocrppline1.cpp -o ocrppline1 `pkg-config --cflags --libs opencv4`

# Compile Tesseract OCR extraction pipeline
g++ ocrppline12.cpp -o ocrppline12 `pkg-config --cflags --libs opencv4` -ltesseract -llept

# Run OCR on prescription image
./ocrppline12
```

---

## ⚖️ Medical Safety Compliance
*PolySafe is an engineering decision-support prototype created for hackathon research and clinical workflow demonstration. It is never intended to replace licensed medical diagnosis or direct physician judgment. Patients must never independently alter, start, or discontinue medications without direct physician consultation.*