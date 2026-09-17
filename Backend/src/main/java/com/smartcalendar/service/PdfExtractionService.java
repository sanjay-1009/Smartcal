package com.smartcalendar.service;

import com.smartcalendar.exception.ExtractionException;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class PdfExtractionService {

    private static final Logger log = LoggerFactory.getLogger(PdfExtractionService.class);

    public String extractTextFromPdf(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ExtractionException("Uploaded PDF file is empty or missing");
        }

        try {
            log.info("Extracting text from PDF: {}, size: {} bytes", file.getOriginalFilename(), file.getSize());
            byte[] bytes = file.getBytes();
            try (PDDocument document = Loader.loadPDF(bytes)) {
                PDFTextStripper stripper = new PDFTextStripper();
                stripper.setSortByPosition(true);
                String text = stripper.getText(document);

                if (text == null || text.trim().isEmpty()) {
                    throw new ExtractionException("The uploaded PDF does not contain selectable text (may be a scanned image). Please use the Image Upload feature or enter text directly.");
                }

                text = text.replaceAll("\\r\\n", "\n").replaceAll("[ \\t]+", " ").trim();
                if (text.length() > 15000) {
                    text = text.substring(0, 15000);
                }

                return text;
            }
        } catch (IOException e) {
            log.error("Error reading PDF file: {}", e.getMessage());
            throw new ExtractionException("Failed to read PDF document: " + e.getMessage(), e);
        }
    }
}
