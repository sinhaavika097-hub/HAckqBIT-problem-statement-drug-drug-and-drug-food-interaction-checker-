#include <opencv2/opencv.hpp>
#include <iostream>
#include <string>

int main() {

    std::string inputPath = "prescription.png"; 
    

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

    
    std::string outputPath = "cleaned_prescription.png";
    cv::imwrite(outputPath, cleaned);
    
    std::cout << "Success! Preprocessed image saved as: " << outputPath << std::endl;

    return 0;
}














    
    
    
    
