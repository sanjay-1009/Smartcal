package com.smartcalendar.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${spring.mail.username:}")
    private String senderEmail;

    @Value("${smartcalendar.resend.apiKey:${RESEND_API_KEY:}}")
    private String resendApiKey;

    @Value("${smartcalendar.resend.fromEmail:SmartCal <onboarding@resend.dev>}")
    private String resendFromEmail;

    @Value("${smartcalendar.brevo.apiKey:${BREVO_API_KEY:}}")
    private String brevoApiKey;

    @Value("${smartcalendar.brevo.senderEmail:${BREVO_SENDER_EMAIL:gskgm2006@gmail.com}}")
    private String brevoSenderEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Send real-time OTP via Brevo / Resend HTTPS API (Port 443) or Gmail SMTP
     * @param toEmail Recipient email address
     * @param username Username of recipient
     * @param otp 6-digit numeric verification code
     * @return boolean indicating whether dispatch succeeded
     */
    public boolean sendOtpEmail(String toEmail, String username, String otp) {
        String htmlBody = buildHtmlTemplate(username, otp);

        // 1. Try Brevo HTTPS API (Port 443 - free 300 emails/day to ANY recipient without domain restriction)
        if (brevoApiKey != null && !brevoApiKey.isBlank()) {
            boolean sentViaBrevo = sendViaBrevoHttp(toEmail, username, otp, htmlBody);
            if (sentViaBrevo) {
                return true;
            }
        }

        // 2. Try Resend HTTPS API (Port 443)
        if (resendApiKey != null && !resendApiKey.isBlank()) {
            boolean sentViaResend = sendViaResendHttp(toEmail, username, otp, htmlBody);
            if (sentViaResend) {
                return true;
            }
        }

        // 3. Fallback to JavaMail SMTP
        if (senderEmail != null && !senderEmail.isBlank()) {
            try {
                log.info("Attempting Gmail SMTP delivery to {}", toEmail);

                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

                helper.setFrom(senderEmail, "SmartCal AI Calendar");
                helper.setTo(toEmail.trim());
                helper.setSubject(otp + " is your SmartCal Verification Code");
                helper.setText(htmlBody, true);

                mailSender.send(message);

                log.info("OTP email successfully delivered to {} via SMTP", toEmail);
                return true;
            } catch (Exception e) {
                log.warn("SMTP socket blocked/timed out on cloud host: {}", e.getMessage());
            }
        }

        return false;
    }

    private boolean sendViaBrevoHttp(String toEmail, String username, String otp, String htmlBody) {
        try {
            log.info("Sending OTP email to {} via Brevo HTTPS API", toEmail);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("api-key", brevoApiKey.trim());

            Map<String, Object> senderMap = Map.of("name", "SmartCal AI", "email", brevoSenderEmail.trim());
            Map<String, Object> recipientMap = Map.of("email", toEmail.trim(), "name", username != null ? username : "User");

            Map<String, Object> payload = new HashMap<>();
            payload.put("sender", senderMap);
            payload.put("to", List.of(recipientMap));
            payload.put("subject", otp + " is your SmartCal Verification Code");
            payload.put("htmlContent", htmlBody);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
            ResponseEntity<String> response = restTemplate.postForEntity("https://api.brevo.com/v3/smtp/email", request, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Brevo HTTPS email successfully sent to {}", toEmail);
                return true;
            }
        } catch (Exception e) {
            log.error("Failed to send via Brevo API: {}", e.getMessage());
        }
        return false;
    }

    private boolean sendViaResendHttp(String toEmail, String username, String otp, String htmlBody) {
        try {
            log.info("Sending OTP email to {} via Resend HTTPS API", toEmail);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(resendApiKey.trim());

            Map<String, Object> payload = new HashMap<>();
            payload.put("from", resendFromEmail);
            payload.put("to", List.of(toEmail.trim()));
            payload.put("subject", otp + " is your SmartCal Verification Code");
            payload.put("html", htmlBody);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
            ResponseEntity<String> response = restTemplate.postForEntity("https://api.resend.com/emails", request, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Resend HTTPS email successfully sent to {}", toEmail);
                return true;
            }
        } catch (Exception e) {
            log.error("Failed to send via Resend API: {}", e.getMessage());
        }
        return false;
    }

    private String buildHtmlTemplate(String username, String otp) {
        return """
            <div style="font-family: Arial, sans-serif; background-color: #F8F3D9; padding: 40px 20px; color: #504B38;">
                <div style="max-width: 520px; margin: 0 auto; background-color: #EBE5C2; border: 1.5px solid #B9B28A; border-radius: 20px; padding: 32px; box-shadow: 0 10px 30px rgba(80, 75, 56, 0.08);">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <div style="display: inline-block; background-color: #504B38; color: #F8F3D9; padding: 10px 18px; border-radius: 14px; font-weight: bold; font-size: 20px; letter-spacing: 0.5px;">
                            SmartCal
                        </div>
                        <p style="font-size: 12px; color: #8C8563; margin-top: 6px; font-weight: 600;">Intelligent Event & Deadline Manager</p>
                    </div>
                    
                    <h2 style="color: #504B38; font-size: 18px; font-weight: 800; margin-bottom: 12px; text-align: center;">Verify Your Account</h2>
                    <p style="font-size: 14px; color: #504B38; line-height: 1.5; text-align: center; margin-bottom: 24px;">
                        Hello <strong>%s</strong>, please enter the following 6-digit verification code in SmartCal to activate your account:
                    </p>
                    
                    <div style="background-color: #F8F3D9; border: 2px dashed #504B38; border-radius: 14px; padding: 18px; text-align: center; margin-bottom: 24px;">
                        <span style="font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #504B38;">%s</span>
                    </div>
                    
                    <p style="font-size: 12px; color: #8C8563; text-align: center; line-height: 1.4;">
                        This code is valid for <strong>10 minutes</strong>. If you did not request this verification, you can safely ignore this email.
                    </p>
                    
                    <div style="border-top: 1px solid rgba(185, 178, 138, 0.5); margin-top: 24px; padding-top: 16px; text-align: center; font-size: 11px; color: #8C8563;">
                        SmartCal AI Calendar Workspace &bull; Zero-Collision Event Intelligence
                    </div>
                </div>
            </div>
            """.formatted(username != null ? username : "there", otp);
    }
}
