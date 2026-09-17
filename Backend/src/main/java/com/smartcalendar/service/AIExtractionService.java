package com.smartcalendar.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcalendar.dto.ExtractedEventDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class AIExtractionService {

    private static final Logger log = LoggerFactory.getLogger(AIExtractionService.class);

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${smartcalendar.ai.provider:fallback}")
    private String aiProvider;

    @Value("${smartcalendar.ai.groq.apiKey:}")
    private String groqApiKey;

    @Value("${smartcalendar.ai.groq.apiUrl:https://api.groq.com/openai/v1/chat/completions}")
    private String groqApiUrl;

    @Value("${smartcalendar.ai.groq.model:llama-3.3-70b-versatile}")
    private String groqModel;

    @Value("${smartcalendar.ai.gemini.apiKey:}")
    private String geminiApiKey;

    public AIExtractionService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public ExtractedEventDto extractEventInformation(String rawText, String sourceType, String sourceUrl) {
        if (rawText == null || rawText.trim().isEmpty()) {
            return createEmptyDto(sourceType, sourceUrl, "");
        }

        ExtractedEventDto dto = null;

        if (groqApiKey != null && !groqApiKey.isBlank()) {
            dto = tryGroqExtraction(rawText);
        } else if (geminiApiKey != null && !geminiApiKey.isBlank()) {
            dto = tryGeminiExtraction(rawText);
        }

        if (dto == null) {
            log.info("Using built-in intelligent NLP heuristic extractor");
            dto = extractUsingHeuristics(rawText);
        }

        dto.setSourceType(sourceType);
        if (dto.getSourceUrl() == null || dto.getSourceUrl().isBlank()) {
            dto.setSourceUrl(sourceUrl);
        }
        dto.setRawExtractedText(rawText);

        Map<String, Boolean> confidence = new HashMap<>();
        confidence.put("eventName", dto.getEventName() != null && !dto.getEventName().isBlank());
        confidence.put("description", dto.getDescription() != null && !dto.getDescription().isBlank());
        confidence.put("startDate", dto.getStartDate() != null);
        confidence.put("startTime", dto.getStartTime() != null);
        confidence.put("endDate", dto.getEndDate() != null);
        confidence.put("endTime", dto.getEndTime() != null);
        confidence.put("registrationDeadline", dto.getRegistrationDeadline() != null);
        confidence.put("submissionDeadline", dto.getSubmissionDeadline() != null);
        confidence.put("location", dto.getLocation() != null && !dto.getLocation().isBlank());
        confidence.put("coordinatorName", dto.getCoordinatorName() != null && !dto.getCoordinatorName().isBlank());
        confidence.put("coordinatorPhone", dto.getCoordinatorPhone() != null && !dto.getCoordinatorPhone().isBlank());
        confidence.put("category", dto.getCategory() != null && !dto.getCategory().isBlank());
        confidence.put("sourceUrl", dto.getSourceUrl() != null && !dto.getSourceUrl().isBlank());

        dto.setFieldConfidence(confidence);
        return dto;
    }

    private ExtractedEventDto tryGroqExtraction(String rawText) {
        try {
            log.info("Calling Groq AI API with model {}", groqModel);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(groqApiKey);

            String systemPrompt = getSystemExtractionPrompt();

            Map<String, Object> body = new HashMap<>();
            body.put("model", groqModel);
            body.put("response_format", Map.of("type", "json_object"));
            body.put("messages", List.of(
                    Map.of("role", "system", "content", systemPrompt),
                    Map.of("role", "user", "content", rawText)
            ));

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(groqApiUrl, requestEntity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode rootNode = objectMapper.readTree(response.getBody());
                String content = rootNode.path("choices").get(0).path("message").path("content").asText();
                return parseJsonToDto(content);
            }
        } catch (Exception e) {
            log.warn("Groq AI extraction failed: {}. Falling back to NLP heuristics.", e.getMessage());
        }
        return null;
    }

    private ExtractedEventDto tryGeminiExtraction(String rawText) {
        try {
            log.info("Calling Gemini AI API");
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey;
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String prompt = getSystemExtractionPrompt() + "\n\nEVENT TEXT:\n" + rawText;
            Map<String, Object> body = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(Map.of("text", prompt)))
                    )
            );

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                String text = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
                return parseJsonToDto(text);
            }
        } catch (Exception e) {
            log.warn("Gemini AI extraction failed: {}. Falling back.", e.getMessage());
        }
        return null;
    }

    private String getSystemExtractionPrompt() {
        return """
            You are an expert event information extraction AI. 
            Analyze the provided event text, poster, or webpage content and extract all event details into a strictly valid JSON object with the following fields:
            {
              "eventName": "Clear title of the event",
              "description": "Concise summary of what the event is about",
              "startDate": "YYYY-MM-DD or null",
              "startTime": "HH:MM:SS or null (24h format)",
              "endDate": "YYYY-MM-DD or null",
              "endTime": "HH:MM:SS or null",
              "registrationDeadline": "YYYY-MM-DD or null",
              "submissionDeadline": "YYYY-MM-DD or null",
              "location": "Physical venue or Online / Discord / Zoom URL",
              "coordinatorName": "Name of contact person/organizer or null",
              "coordinatorPhone": "Phone/WhatsApp of organizer or null",
              "category": "HACKATHON | WORKSHOP | COMPETITION | SEMINAR | EXAM | MEETING | GENERAL",
              "priority": "LOW | MEDIUM | HIGH | URGENT",
              "sourceUrl": "URL if present or null"
            }
            Output ONLY valid JSON.
            """;
    }

    private ExtractedEventDto parseJsonToDto(String jsonText) {
        try {
            String cleanJson = jsonText.replaceAll("```json", "").replaceAll("```", "").trim();
            JsonNode node = objectMapper.readTree(cleanJson);

            ExtractedEventDto dto = new ExtractedEventDto();
            dto.setEventName(getNodeText(node, "eventName"));
            dto.setDescription(getNodeText(node, "description"));
            dto.setLocation(getNodeText(node, "location"));
            dto.setCoordinatorName(getNodeText(node, "coordinatorName"));
            dto.setCoordinatorPhone(getNodeText(node, "coordinatorPhone"));
            dto.setCategory(getNodeText(node, "category", "GENERAL"));
            dto.setPriority(getNodeText(node, "priority", "MEDIUM"));
            dto.setSourceUrl(getNodeText(node, "sourceUrl"));

            dto.setStartDate(parseDate(getNodeText(node, "startDate")));
            dto.setEndDate(parseDate(getNodeText(node, "endDate")));
            dto.setRegistrationDeadline(parseDate(getNodeText(node, "registrationDeadline")));
            dto.setSubmissionDeadline(parseDate(getNodeText(node, "submissionDeadline")));

            dto.setStartTime(parseTime(getNodeText(node, "startTime")));
            dto.setEndTime(parseTime(getNodeText(node, "endTime")));

            if (dto.getStartDate() == null) {
                dto.setStartDate(LocalDate.now());
            }

            return dto;
        } catch (Exception e) {
            log.warn("Failed to parse AI JSON response: {}", e.getMessage());
            return null;
        }
    }

    public ExtractedEventDto extractUsingHeuristics(String text) {
        ExtractedEventDto dto = new ExtractedEventDto();
        String lower = text.toLowerCase();

        // 1. Title Extraction
        String eventName = extractEventTitle(text);
        dto.setEventName(eventName);

        // 2. Category & Priority
        if (lower.contains("hackathon") || lower.contains("hack")) {
            dto.setCategory("HACKATHON");
            dto.setPriority("HIGH");
        } else if (lower.contains("workshop") || lower.contains("bootcamp") || lower.contains("hands-on")) {
            dto.setCategory("WORKSHOP");
            dto.setPriority("MEDIUM");
        } else if (lower.contains("competition") || lower.contains("contest") || lower.contains("challenge")) {
            dto.setCategory("COMPETITION");
            dto.setPriority("HIGH");
        } else if (lower.contains("exam") || lower.contains("test") || lower.contains("quiz") || lower.contains("midterm") || lower.contains("final")) {
            dto.setCategory("EXAM");
            dto.setPriority("URGENT");
        } else if (lower.contains("seminar") || lower.contains("webinar") || lower.contains("talk") || lower.contains("symposium")) {
            dto.setCategory("SEMINAR");
            dto.setPriority("LOW");
        } else {
            dto.setCategory("GENERAL");
            dto.setPriority("MEDIUM");
        }

        // 3. Dates
        List<LocalDate> dates = extractDates(text);
        if (!dates.isEmpty()) {
            dto.setStartDate(dates.get(0));
            if (dates.size() > 1) {
                dto.setEndDate(dates.get(1));
            } else {
                dto.setEndDate(dates.get(0));
            }
        } else {
            dto.setStartDate(LocalDate.now().plusDays(2));
            dto.setEndDate(LocalDate.now().plusDays(2));
        }

        // 4. Times
        List<LocalTime> times = extractTimes(text);
        if (!times.isEmpty()) {
            dto.setStartTime(times.get(0));
            if (times.size() > 1) {
                dto.setEndTime(times.get(1));
            } else {
                dto.setEndTime(times.get(0).plusHours(2));
            }
        } else {
            dto.setStartTime(LocalTime.of(10, 0));
            dto.setEndTime(LocalTime.of(17, 0));
        }

        // 5. Deadlines
        LocalDate regDeadline = extractSpecificDeadline(text, "register|registration|apply|rsvp|last date");
        LocalDate subDeadline = extractSpecificDeadline(text, "submission|submit|project submission|deadline");

        dto.setRegistrationDeadline(regDeadline != null ? regDeadline : dto.getStartDate().minusDays(2));
        dto.setSubmissionDeadline(subDeadline);

        // 6. Venue / Location
        String location = extractLocation(text);
        dto.setLocation(location);

        // 7. Contact Phone & Coordinator
        String phone = extractPhone(text);
        dto.setCoordinatorPhone(phone);

        String coordinator = extractCoordinator(text);
        dto.setCoordinatorName(coordinator);

        // 8. Description
        String description = extractDescription(text);
        dto.setDescription(description);

        return dto;
    }

    private String extractEventTitle(String text) {
        // Priority 1: Check for explicit "Event Title:" or "Event Name:" or "Title:" line
        Pattern explicitTitlePattern = Pattern.compile("(?im)^(?:event title|event name|title|event)\\s*[:\\-]\\s*([^{\\n\\[\\]]+)$");
        Matcher m = explicitTitlePattern.matcher(text);
        if (m.find()) {
            String candidate = m.group(1).trim();
            if (isValidTitle(candidate)) {
                return sanitizeTitle(candidate);
            }
        }

        // Priority 2: Scan non-empty lines for the first clean title-like line
        String[] lines = text.split("\\r?\\n");
        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.startsWith("Event Title:") || trimmed.startsWith("Event Name:") || trimmed.startsWith("Title:")) {
                String sub = trimmed.substring(trimmed.indexOf(':') + 1).trim();
                if (isValidTitle(sub)) return sanitizeTitle(sub);
            }
            if (isValidTitle(trimmed)) {
                return sanitizeTitle(trimmed);
            }
        }

        return "New Calendar Event";
    }

    private boolean isValidTitle(String s) {
        if (s == null) return false;
        String trimmed = s.trim();
        if (trimmed.length() < 3 || trimmed.length() > 90) return false;
        if (trimmed.startsWith("{") || trimmed.startsWith("[") || trimmed.contains("@context") || trimmed.contains("schema.org") || trimmed.contains("Structured Schema")) return false;
        if (trimmed.toLowerCase().startsWith("http://") || trimmed.toLowerCase().startsWith("https://")) return false;
        if (trimmed.toLowerCase().startsWith("description:") || trimmed.toLowerCase().startsWith("content details:") || trimmed.toLowerCase().startsWith("location:")) return false;
        return true;
    }

    private String sanitizeTitle(String t) {
        return t.replaceAll("^[\\\"'\\s]+|[\\\"'\\s]+$", "")
                .replaceAll("\\s*(\\||-|–).*$", "")
                .trim();
    }

    private String extractDescription(String text) {
        Pattern descPattern = Pattern.compile("(?im)^(?:description|about this event|about)\\s*[:\\-]\\s*([^{\\n\\[\\]]+)");
        Matcher m = descPattern.matcher(text);
        if (m.find()) {
            String d = m.group(1).trim();
            if (!d.isBlank() && !d.contains("@context")) {
                return d.length() > 400 ? d.substring(0, 400) + "..." : d;
            }
        }

        // Clean out raw JSON, HTML tags, and bracket noise from text
        String cleaned = text.replaceAll("(?im)^(?:event title|event name|title|category|start date|end date|location)\\s*:[^\\n]*", "")
                .replaceAll("\\[[^\\]]*\\]", " ")
                .replaceAll("\\{[^}]*\\}", " ")
                .replaceAll("\\s+", " ")
                .trim();

        if (cleaned.length() > 350) {
            cleaned = cleaned.substring(0, 350) + "...";
        }
        return cleaned.isEmpty() ? "Event extracted via SmartCal AI Extractor." : cleaned;
    }

    private List<LocalDate> extractDates(String text) {
        List<LocalDate> result = new ArrayList<>();

        // ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)
        Pattern pIso = Pattern.compile("\\b(\\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])(?:T[0-9:Z+-]+)?\\b");
        Matcher mIso = pIso.matcher(text);
        while (mIso.find()) {
            try {
                result.add(LocalDate.parse(mIso.group(0).substring(0, 10)));
            } catch (Exception ignored) {}
        }

        // DD/MM/YYYY or DD-MM-YYYY
        Pattern pDmY = Pattern.compile("\\b(0[1-9]|[12]\\d|3[01])[/-](0[1-9]|1[0-2])[/-](\\d{4})\\b");
        Matcher mDmY = pDmY.matcher(text);
        while (mDmY.find()) {
            try {
                int day = Integer.parseInt(mDmY.group(1));
                int month = Integer.parseInt(mDmY.group(2));
                int year = Integer.parseInt(mDmY.group(3));
                result.add(LocalDate.of(year, month, day));
            } catch (Exception ignored) {}
        }

        // Month Names: e.g. Oct 15, 2026 or 15th October 2026
        Pattern pMonth = Pattern.compile("(?i)\\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\\s+(\\d{1,2})(?:st|nd|rd|th)?,?\\s*(\\d{4})?\\b");
        Matcher mMonth = pMonth.matcher(text);
        Map<String, Integer> monthMap = Map.ofEntries(
                Map.entry("jan", 1), Map.entry("feb", 2), Map.entry("mar", 3), Map.entry("apr", 4),
                Map.entry("may", 5), Map.entry("jun", 6), Map.entry("jul", 7), Map.entry("aug", 8),
                Map.entry("sep", 9), Map.entry("oct", 10), Map.entry("nov", 11), Map.entry("dec", 12)
        );
        while (mMonth.find()) {
            try {
                String mStr = mMonth.group(1).toLowerCase().substring(0, 3);
                int month = monthMap.getOrDefault(mStr, 1);
                int day = Integer.parseInt(mMonth.group(2));
                int year = mMonth.group(3) != null ? Integer.parseInt(mMonth.group(3)) : LocalDate.now().getYear();
                result.add(LocalDate.of(year, month, day));
            } catch (Exception ignored) {}
        }

        return result;
    }

    private List<LocalTime> extractTimes(String text) {
        List<LocalTime> result = new ArrayList<>();
        Pattern pTime = Pattern.compile("(?i)\\b(\\d{1,2}):(\\d{2})(?::(\\d{2}))?\\s*(AM|PM)?\\b");
        Matcher m = pTime.matcher(text);
        while (m.find()) {
            try {
                int hour = Integer.parseInt(m.group(1));
                int minute = Integer.parseInt(m.group(2));
                String ampm = m.group(4);
                if (ampm != null) {
                    if (ampm.equalsIgnoreCase("PM") && hour < 12) hour += 12;
                    if (ampm.equalsIgnoreCase("AM") && hour == 12) hour = 0;
                }
                if (hour >= 0 && hour < 24 && minute >= 0 && minute < 60) {
                    result.add(LocalTime.of(hour, minute));
                }
            } catch (Exception ignored) {}
        }
        return result;
    }

    private LocalDate extractSpecificDeadline(String text, String keywordRegex) {
        Pattern pattern = Pattern.compile("(?i)(?:" + keywordRegex + ")[^\\n.]{0,40}?(\\d{4}-\\d{2}-\\d{2}|\\d{1,2}[/-]\\d{1,2}[/-]\\d{4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\\s+\\d{1,2})");
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            List<LocalDate> extracted = extractDates(matcher.group(0));
            if (!extracted.isEmpty()) {
                return extracted.get(0);
            }
        }
        return null;
    }

    private String extractLocation(String text) {
        Pattern explicitLoc = Pattern.compile("(?im)^(?:location|venue|at)\\s*[:\\-]\\s*([^{\\n\\[\\]]+)$");
        Matcher locMatcher = explicitLoc.matcher(text);
        if (locMatcher.find()) {
            String l = locMatcher.group(1).trim();
            if (!l.isBlank() && !l.contains("@context")) return l;
        }

        String lower = text.toLowerCase();
        if (lower.contains("online") || lower.contains("zoom") || lower.contains("google meet") || lower.contains("discord") || lower.contains("virtual")) {
            return "Online (Virtual / Link Provided)";
        }
        Pattern p = Pattern.compile("(?i)(?:venue|location|place|auditorium|hall|campus)\\s*[:\\-]\\s*([^\\n,]{3,50})");
        Matcher m = p.matcher(text);
        if (m.find()) {
            return m.group(1).trim();
        }
        return "Main Auditorium / Campus";
    }

    private String extractPhone(String text) {
        Pattern p = Pattern.compile("\\b(?:\\+?\\d{1,3}[- ]?)?([6-9]\\d{9})\\b");
        Matcher m = p.matcher(text);
        if (m.find()) {
            return m.group(1);
        }
        return null;
    }

    private String extractCoordinator(String text) {
        Pattern p = Pattern.compile("(?i)(?:coordinator|contact person|organizer|poc|lead)\\s*[:\\-]\\s*([A-Za-z ]{3,30})");
        Matcher m = p.matcher(text);
        if (m.find()) {
            return m.group(1).trim();
        }
        return null;
    }

    private String getNodeText(JsonNode node, String field) {
        return getNodeText(node, field, null);
    }

    private String getNodeText(JsonNode node, String field, String defaultValue) {
        if (node.has(field) && !node.get(field).isNull()) {
            String val = node.get(field).asText().trim();
            return val.equalsIgnoreCase("null") || val.isEmpty() ? defaultValue : val;
        }
        return defaultValue;
    }

    private LocalDate parseDate(String dateStr) {
        if (dateStr == null || dateStr.isBlank() || dateStr.equalsIgnoreCase("null")) return null;
        try {
            return LocalDate.parse(dateStr.trim().substring(0, 10), DateTimeFormatter.ISO_LOCAL_DATE);
        } catch (Exception e) {
            return null;
        }
    }

    private LocalTime parseTime(String timeStr) {
        if (timeStr == null || timeStr.isBlank() || timeStr.equalsIgnoreCase("null")) return null;
        try {
            if (timeStr.length() == 5) timeStr = timeStr + ":00";
            return LocalTime.parse(timeStr.trim());
        } catch (Exception e) {
            return null;
        }
    }

    private ExtractedEventDto createEmptyDto(String sourceType, String sourceUrl, String text) {
        return ExtractedEventDto.builder()
                .eventName("New Extracted Event")
                .description("")
                .startDate(LocalDate.now())
                .startTime(LocalTime.of(10, 0))
                .endDate(LocalDate.now())
                .endTime(LocalTime.of(11, 0))
                .category("GENERAL")
                .priority("MEDIUM")
                .sourceType(sourceType)
                .sourceUrl(sourceUrl)
                .rawExtractedText(text)
                .fieldConfidence(Collections.emptyMap())
                .build();
    }
}
