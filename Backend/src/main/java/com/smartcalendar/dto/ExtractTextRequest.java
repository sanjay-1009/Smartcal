package com.smartcalendar.dto;

import jakarta.validation.constraints.NotBlank;

public class ExtractTextRequest {
    @NotBlank(message = "Text content is required")
    private String text;

    public ExtractTextRequest() {}

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
}
