package com.smartcalendar.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcalendar.exception.ExtractionException;
import org.jsoup.Connection;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;

@Service
public class WebScrapingService {

    private static final Logger log = LoggerFactory.getLogger(WebScrapingService.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String scrapeUrl(String url) {
        if (url == null || url.trim().isEmpty()) {
            throw new ExtractionException("Invalid or empty URL provided");
        }

        String targetUrl = url.trim();
        if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
            targetUrl = "https://" + targetUrl;
        }

        StringBuilder cleanTextBuilder = new StringBuilder();
        String extractedTitle = null;
        String extractedDescription = null;
        String extractedLocation = null;
        String extractedCategory = null;
        List<String> structuredDates = new ArrayList<>();

        try {
            log.info("Scraping webpage URL: {}", targetUrl);
            Connection connection = Jsoup.connect(targetUrl)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")
                    .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8")
                    .header("Accept-Language", "en-US,en;q=0.9")
                    .header("Sec-Ch-Ua", "\"Chromium\";v=\"124\", \"Google Chrome\";v=\"124\", \"Not-A.Brand\";v=\"99\"")
                    .header("Sec-Ch-Ua-Mobile", "?0")
                    .header("Sec-Ch-Ua-Platform", "\"Windows\"")
                    .timeout(15000)
                    .followRedirects(true)
                    .ignoreHttpErrors(true);

            Document doc = connection.get();

            // 1. Extract and parse structured JSON-LD schema properly (without leaking raw JSON)
            Elements jsonLdScripts = doc.select("script[type=application/ld+json]");
            for (Element script : jsonLdScripts) {
                try {
                    String json = script.data();
                    if (json != null && !json.isBlank()) {
                        JsonNode node = objectMapper.readTree(json);
                        parseJsonLdNode(node, cleanTextBuilder);
                    }
                } catch (Exception ignored) {}
            }

            // 2. Extract OpenGraph and Meta tags
            Element ogTitle = doc.selectFirst("meta[property=og:title], meta[name=twitter:title]");
            if (ogTitle != null && ogTitle.hasAttr("content") && !ogTitle.attr("content").isBlank()) {
                extractedTitle = ogTitle.attr("content").trim();
            } else if (doc.title() != null && !doc.title().isBlank()) {
                extractedTitle = doc.title().trim();
            }

            Element ogDesc = doc.selectFirst("meta[property=og:description], meta[name=description], meta[name=twitter:description]");
            if (ogDesc != null && ogDesc.hasAttr("content") && !ogDesc.attr("content").isBlank()) {
                extractedDescription = ogDesc.attr("content").trim();
            }

            Element ogSite = doc.selectFirst("meta[property=og:site_name]");
            if (ogSite != null && ogSite.hasAttr("content")) {
                cleanTextBuilder.append("Organized by: ").append(ogSite.attr("content").trim()).append("\n");
            }

            // 3. Extract visible clean body content
            doc.select("script, style, nav, footer, header, noscript, svg, iframe, form, button").remove();

            Element mainElement = doc.selectFirst("main, article, #content, .content, .event-details, .event-container, [role=main]");
            String bodyText = "";
            if (mainElement != null && !mainElement.text().isBlank()) {
                bodyText = mainElement.text();
            } else if (doc.body() != null) {
                bodyText = doc.body().text();
            }

            // Filter out any leaked script or raw json artifacts from bodyText
            bodyText = bodyText.replaceAll("\\{[^}]*\\}", " ").replaceAll("\\s+", " ").trim();

            if (extractedTitle != null && !extractedTitle.isBlank()) {
                cleanTextBuilder.insert(0, "Event Title: " + cleanTitleString(extractedTitle) + "\n");
            }

            if (extractedDescription != null && !extractedDescription.isBlank()) {
                cleanTextBuilder.append("Description: ").append(extractedDescription).append("\n");
            }

            if (!bodyText.isBlank()) {
                cleanTextBuilder.append("Content Details: ").append(bodyText).append("\n");
            }

        } catch (Exception e) {
            log.warn("Direct HTML scrape failed for {}: {}. Will fallback to URL metadata inference.", targetUrl, e.getMessage());
        }

        String finalResult = cleanTextBuilder.toString().trim();

        // If direct HTML produced too little text or failed, infer from URL path slug
        if (finalResult.length() < 30 || finalResult.contains("403 Forbidden") || finalResult.contains("Access Denied")) {
            log.info("Inferring event metadata from URL slug: {}", targetUrl);
            finalResult = inferMetadataFromUrl(targetUrl);
        }

        if (finalResult.length() > 8000) {
            finalResult = finalResult.substring(0, 8000);
        }

        return finalResult;
    }

    private void parseJsonLdNode(JsonNode node, StringBuilder sb) {
        if (node.isArray()) {
            for (JsonNode item : node) {
                parseJsonLdNode(item, sb);
            }
            return;
        }

        if (node.has("@graph") && node.get("@graph").isArray()) {
            for (JsonNode item : node.get("@graph")) {
                parseJsonLdNode(item, sb);
            }
            return;
        }

        // Look for alternateName or name
        if (node.has("alternateName") && !node.get("alternateName").isNull()) {
            JsonNode alt = node.get("alternateName");
            if (alt.isArray() && alt.size() > 0) {
                sb.append("Event Title: ").append(alt.get(0).asText()).append("\n");
            } else if (!alt.asText().isBlank()) {
                sb.append("Event Title: ").append(alt.asText()).append("\n");
            }
        } else if (node.has("name") && !node.get("name").isNull() && !node.get("name").asText().isBlank()) {
            String name = node.get("name").asText();
            if (!name.equalsIgnoreCase("website") && !name.equalsIgnoreCase("home")) {
                sb.append("Event Title: ").append(name).append("\n");
            }
        }

        if (node.has("description") && !node.get("description").isNull()) {
            sb.append("Description: ").append(node.get("description").asText()).append("\n");
        }

        if (node.has("startDate") && !node.get("startDate").isNull()) {
            sb.append("Start Date: ").append(node.get("startDate").asText()).append("\n");
        }

        if (node.has("endDate") && !node.get("endDate").isNull()) {
            sb.append("End Date: ").append(node.get("endDate").asText()).append("\n");
        }

        if (node.has("location") && !node.get("location").isNull()) {
            JsonNode loc = node.get("location");
            if (loc.isTextual()) {
                sb.append("Location: ").append(loc.asText()).append("\n");
            } else if (loc.has("name")) {
                sb.append("Location: ").append(loc.get("name").asText()).append("\n");
            }
        }
    }

    private String cleanTitleString(String raw) {
        if (raw == null) return "";
        // Strip common site suffix pipes or dashes: e.g. "ORION 1.0 Hackathon | Microsoft Club"
        String cleaned = raw.replaceAll("\\s*(\\||-|–).*$", "").trim();
        return cleaned.isEmpty() ? raw.trim() : cleaned;
    }

    private String inferMetadataFromUrl(String url) {
        StringBuilder sb = new StringBuilder();
        try {
            URI uri = new URI(url);
            String host = uri.getHost() != null ? uri.getHost() : "";
            String path = uri.getPath() != null ? uri.getPath() : "";

            String category = "GENERAL";
            if (path.toLowerCase().contains("hackathon") || host.toLowerCase().contains("hackathon")) category = "HACKATHON";
            else if (path.toLowerCase().contains("workshop") || path.toLowerCase().contains("bootcamp")) category = "WORKSHOP";
            else if (path.toLowerCase().contains("competition") || path.toLowerCase().contains("contest")) category = "COMPETITION";
            else if (path.toLowerCase().contains("seminar") || path.toLowerCase().contains("webinar")) category = "SEMINAR";

            sb.append("Category: ").append(category).append("\n");

            String[] segments = path.split("/");
            String lastSegment = segments.length > 0 ? segments[segments.length - 1] : "";
            if (lastSegment.isBlank() && segments.length > 1) {
                lastSegment = segments[segments.length - 2];
            }

            if (!lastSegment.isBlank()) {
                String cleanSlug = lastSegment.replaceAll("-\\d{5,}$", "");
                String[] words = cleanSlug.split("[-_]");
                StringBuilder titleBuilder = new StringBuilder();
                for (String word : words) {
                    if (!word.isBlank()) {
                        titleBuilder.append(Character.toUpperCase(word.charAt(0)))
                                .append(word.substring(1).toLowerCase())
                                .append(" ");
                    }
                }
                String inferredTitle = titleBuilder.toString().trim();
                sb.append("Event Title: ").append(inferredTitle).append("\n");
                sb.append("Description: Event announced on ").append(host).append(".\n");

                if (cleanSlug.contains("srm") || cleanSlug.contains("institute") || cleanSlug.contains("college") || cleanSlug.contains("university")) {
                    sb.append("Location: Campus / University Venue\n");
                }
            }
        } catch (Exception e) {
            sb.append("Event Source: ").append(url);
        }
        return sb.toString();
    }
}
