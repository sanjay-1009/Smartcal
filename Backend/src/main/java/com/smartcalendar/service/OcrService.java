package com.smartcalendar.service;

import com.smartcalendar.exception.ExtractionException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

@Service
public class OcrService {

    private static final Logger log = LoggerFactory.getLogger(OcrService.class);

    public String extractTextFromImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ExtractionException("Uploaded image file is empty or missing");
        }

        String originalFilename = file.getOriginalFilename();
        String contentType = file.getContentType();

        if (contentType != null && !contentType.startsWith("image/")) {
            throw new ExtractionException("Invalid file type: expected an image (JPEG, PNG, WEBP), received: " + contentType);
        }

        try {
            log.info("Processing image for OCR: {}, size: {} bytes", originalFilename, file.getSize());

            String ocrResult = tryRunTesseract(file);
            if (ocrResult != null && !ocrResult.isBlank()) {
                return ocrResult.trim();
            }

            log.warn("Tesseract OCR binary not found on local PATH. Returning fallback text from metadata.");
            return "Image Poster Event: " + (originalFilename != null ? originalFilename.replaceAll("[-_.]", " ") : "Uploaded Event Poster") +
                   "\nNote: OCR engine is currently operating in fallback mode. Please review or supplement details manually.";
        } catch (Exception e) {
            log.error("Error during image OCR extraction: {}", e.getMessage());
            throw new ExtractionException("Failed to process image: " + e.getMessage(), e);
        }
    }

    private String tryRunTesseract(MultipartFile file) {
        Path tempFile = null;
        try {
            String ext = ".png";
            if (file.getOriginalFilename() != null && file.getOriginalFilename().contains(".")) {
                ext = file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf("."));
            }
            tempFile = Files.createTempFile("smartcal_ocr_" + UUID.randomUUID(), ext);
            file.transferTo(tempFile.toFile());

            ProcessBuilder pb = new ProcessBuilder("tesseract", tempFile.toAbsolutePath().toString(), "stdout", "--oem", "1", "-l", "eng");
            pb.redirectErrorStream(true);
            Process process = pb.start();

            StringBuilder output = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                }
            }

            int exitCode = process.waitFor();
            if (exitCode == 0 && output.length() > 5) {
                return output.toString();
            }
        } catch (Exception e) {
            log.debug("Tesseract CLI not available: {}", e.getMessage());
        } finally {
            if (tempFile != null) {
                try {
                    Files.deleteIfExists(tempFile);
                } catch (IOException ignored) {}
            }
        }
        return null;
    }
}
