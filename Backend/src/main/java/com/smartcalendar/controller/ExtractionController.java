package com.smartcalendar.controller;

import com.smartcalendar.dto.ApiResponse;
import com.smartcalendar.dto.ExtractTextRequest;
import com.smartcalendar.dto.ExtractUrlRequest;
import com.smartcalendar.dto.ExtractedEventDto;
import com.smartcalendar.service.AIExtractionService;
import com.smartcalendar.service.OcrService;
import com.smartcalendar.service.PdfExtractionService;
import com.smartcalendar.service.WebScrapingService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/extract")
public class ExtractionController {

    private static final Logger log = LoggerFactory.getLogger(ExtractionController.class);

    private final AIExtractionService aiExtractionService;
    private final WebScrapingService webScrapingService;
    private final PdfExtractionService pdfExtractionService;
    private final OcrService ocrService;

    public ExtractionController(AIExtractionService aiExtractionService, WebScrapingService webScrapingService,
                                PdfExtractionService pdfExtractionService, OcrService ocrService) {
        this.aiExtractionService = aiExtractionService;
        this.webScrapingService = webScrapingService;
        this.pdfExtractionService = pdfExtractionService;
        this.ocrService = ocrService;
    }

    @PostMapping("/text")
    public ResponseEntity<ApiResponse<ExtractedEventDto>> extractFromText(@Valid @RequestBody ExtractTextRequest request) {
        log.info("Received request for Text extraction");
        ExtractedEventDto result = aiExtractionService.extractEventInformation(request.getText(), "TEXT", null);
        return ResponseEntity.ok(ApiResponse.ok("Event details extracted successfully", result));
    }

    @PostMapping("/url")
    public ResponseEntity<ApiResponse<ExtractedEventDto>> extractFromUrl(@Valid @RequestBody ExtractUrlRequest request) {
        log.info("Received request for URL extraction: {}", request.getUrl());
        String scrapedText = webScrapingService.scrapeUrl(request.getUrl());
        ExtractedEventDto result = aiExtractionService.extractEventInformation(scrapedText, "URL", request.getUrl());
        return ResponseEntity.ok(ApiResponse.ok("Event details extracted from URL successfully", result));
    }

    @PostMapping(value = "/pdf", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ExtractedEventDto>> extractFromPdf(@RequestParam("file") MultipartFile file) {
        log.info("Received request for PDF extraction: {}", file.getOriginalFilename());
        String pdfText = pdfExtractionService.extractTextFromPdf(file);
        ExtractedEventDto result = aiExtractionService.extractEventInformation(pdfText, "PDF", file.getOriginalFilename());
        return ResponseEntity.ok(ApiResponse.ok("Event details extracted from PDF successfully", result));
    }

    @PostMapping(value = "/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ExtractedEventDto>> extractFromImage(@RequestParam("file") MultipartFile file) {
        log.info("Received request for Image extraction: {}", file.getOriginalFilename());
        String ocrText = ocrService.extractTextFromImage(file);
        ExtractedEventDto result = aiExtractionService.extractEventInformation(ocrText, "IMAGE", file.getOriginalFilename());
        return ResponseEntity.ok(ApiResponse.ok("Event details extracted from Image successfully", result));
    }
}
