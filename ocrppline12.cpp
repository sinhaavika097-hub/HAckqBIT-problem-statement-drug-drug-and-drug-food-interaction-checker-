#include <opencv2/opencv.hpp>
#include <tesseract/baseapi.h>
#include <leptonica/allheaders.h>
#include <fstream>
#include <iostream>
#include <string>

int main() {

    std::string inputPath = "prscpton.png"; 
    cv::Mat src = cv::imread(inputPath, cv::IMREAD_COLOR);
    if (src.empty()) {
        std::cerr << "Error: Could not read image! Make sure '" << inputPath << "' exists in the folder." << std::endl;
        return -1;
    }
    cv::Mat gray;
    cv::cvtColor(src, gray, cv::COLOR_BGR2GRAY);
    cv::Mat filtered;
    cv::bilateralFilter(gray, filtered, 9, 75, 75);
    cv::Mat thresh;
    cv::adaptiveThreshold(filtered, thresh, 255, 
                          cv::ADAPTIVE_THRESH_GAUSSIAN_C, 
                          cv::THRESH_BINARY, 31, 10);
    cv::Mat kernel = cv::getStructuringElement(cv::MORPH_RECT, cv::Size(1, 1));
    cv::Mat cleaned;
    cv::morphologyEx(thresh, cleaned, cv::MORPH_OPEN, kernel);
    std::string outputPath = "cleaned_prscpton.png";
    cv::imwrite(outputPath, cleaned);
    
    std::cout << "Success! Preprocessed image saved as: " << outputPath << std::endl;
    tesseract::TessBaseAPI *ocr = new tesseract::TessBaseAPI();
    if (ocr->Init("C:/msys64/ucrt64/share/tessdata", "eng")) {
        std::cerr << "Error: Could not initialize tesseract." << std::endl;
        return 1;
    }
    ocr->SetImage(cleaned.data, cleaned.cols, cleaned.rows, 1, cleaned.step[0]);
    std::string extractedText = std::string(ocr->GetUTF8Text());
    std::ofstream outFile("extracted_prescription.txt");
    if (outFile.is_open()) {
        outFile << extractedText;
        outFile.close();
        std::cout << "Success! Text saved to extracted_prescription.txt" << std::endl;
    } else {
        std::cerr << "Error: Could not save the text file." << std::endl;
    }
    ocr->End();
    delete ocr;

    return 0;
}














    
    
    
    
