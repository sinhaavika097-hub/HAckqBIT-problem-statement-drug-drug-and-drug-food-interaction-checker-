#include <opencv2/opencv.hpp>
#include <tesseract/baseapi.h>
#include <leptonica/allheaders.h>
#include <fstream>
#include <iostream>
#include <string>

int main(int argc, char* argv[]) {
    if (argc < 2) {
        std::cerr << "Error: No image path provided! Usage: ./ocrppline12.exe <path_to_image>\n";
        return 1;
    }

    std::string inputPath = argv[1];
    cv::Mat src = cv::imread(inputPath, cv::IMREAD_COLOR);
    if (src.empty()) {
        std::cerr << "Error: Could not read image from path: " << inputPath << "\n";
        return 1;
    }

    // Initialize Tesseract OCR
    tesseract::TessBaseAPI* ocr = new tesseract::TessBaseAPI();
    if (ocr->Init(NULL, "eng")) {
        std::cerr << "Could not initialize tesseract.\n";
        return 1;
    }

    ocr->SetImage(src.data, src.cols, src.rows, 3, src.step);
    std::string extractedText = std::string(ocr->GetUTF8Text());
    
    // Save to text file
    std::ofstream outFile("extracted_prescription.txt");
    if (outFile.is_open()) {
        outFile << extractedText;
        outFile.close();
        std::cout << "Success! Text saved to extracted_prescription.txt\n";
    } else {
        std::cerr << "Error: Could not save the text file.\n";
    }

    ocr->End();
    delete ocr;
    return 0;
}