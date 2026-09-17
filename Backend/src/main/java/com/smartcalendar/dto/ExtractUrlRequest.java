package com.smartcalendar.dto;

import jakarta.validation.constraints.NotBlank;

public class ExtractUrlRequest {
    @NotBlank(message = "URL is required")
    private String url;

    public ExtractUrlRequest() {}

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
}
