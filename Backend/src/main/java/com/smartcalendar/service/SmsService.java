package com.smartcalendar.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class SmsService {

    private static final Logger log = LoggerFactory.getLogger(SmsService.class);
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${smartcalendar.sms.provider:dev}")
    private String smsProvider; // 'twilio', 'fast2sms', '2factor', or 'dev'

    // Twilio Credentials
    @Value("${smartcalendar.sms.twilio.accountSid:}")
    private String twilioAccountSid;

    @Value("${smartcalendar.sms.twilio.authToken:}")
    private String twilioAuthToken;

    @Value("${smartcalendar.sms.twilio.fromNumber:}")
    private String twilioFromNumber;

    // Fast2SMS / 2Factor / Generic SMS Key
    @Value("${smartcalendar.sms.apiKey:}")
    private String smsApiKey;

    /**
     * Send real-time OTP via configured SMS Gateway
     * @param mobileNumber Target phone number (e.g. 9876543210 or +919876543210)
     * @param otp 6-digit numeric OTP code
     * @return boolean indicating whether dispatch succeeded
     */
    public boolean sendOtpSms(String mobileNumber, String otp) {
        String cleanPhone = mobileNumber.trim();
        String messageBody = "Your SmartCal verification code is: " + otp + ". Valid for 10 minutes. Do not share with anyone.";

        // 1. Try Twilio Gateway
        if (twilioAccountSid != null && !twilioAccountSid.isBlank() && twilioAuthToken != null && !twilioAuthToken.isBlank()) {
            return sendViaTwilio(cleanPhone, messageBody);
        }

        // 2. Try Fast2SMS Gateway (Popular for Indian numbers)
        if (smsApiKey != null && !smsApiKey.isBlank()) {
            return sendViaFast2Sms(cleanPhone, otp);
        }

        // 3. Fallback to Local Dev Log
        log.info("--------------------------------------------------");
        log.info("[REAL-TIME SMS GATEWAY (DEV MODE)]");
        log.info("To: {}", cleanPhone);
        log.info("Message: {}", messageBody);
        log.info("--------------------------------------------------");
        return true;
    }

    private boolean sendViaTwilio(String toPhone, String message) {
        try {
            log.info("Dispatching SMS via Twilio to {}", toPhone);
            String url = "https://api.twilio.com/2010-04-01/Accounts/" + twilioAccountSid + "/Messages.json";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            headers.setBasicAuth(twilioAccountSid, twilioAuthToken);

            String formattedTo = toPhone.startsWith("+") ? toPhone : "+91" + toPhone;

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("To", formattedTo);
            body.add("From", twilioFromNumber);
            body.add("Body", message);

            HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("SMS delivered successfully via Twilio to {}", formattedTo);
                return true;
            }
        } catch (Exception e) {
            log.error("Twilio SMS dispatch failed for {}: {}", toPhone, e.getMessage());
        }
        return false;
    }

    private boolean sendViaFast2Sms(String toPhone, String otp) {
        try {
            log.info("Dispatching real-time OTP SMS via Fast2SMS to phone: {}", toPhone);
            String url = "https://www.fast2sms.com/dev/bulkV2";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("authorization", smsApiKey.trim());
            headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");

            String numericPhone = toPhone.replaceAll("[^0-9]", "");
            if (numericPhone.length() > 10) {
                numericPhone = numericPhone.substring(numericPhone.length() - 10);
            }

            Map<String, Object> payload = Map.of(
                    "variables_values", otp,
                    "route", "otp",
                    "numbers", numericPhone
            );

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(payload, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);

            log.info("Fast2SMS Response: Status={}, Body={}", response.getStatusCode(), response.getBody());

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null && response.getBody().contains("\"return\":true")) {
                log.info("SMS delivered successfully via Fast2SMS to +91{}", numericPhone);
                return true;
            }
        } catch (Exception e) {
            log.error("Fast2SMS dispatch failed for {}: {}", toPhone, e.getMessage());
        }
        return false;
    }
}
