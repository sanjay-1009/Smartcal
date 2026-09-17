package com.smartcalendar.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String senderEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Send real-time OTP via Gmail / SMTP server
     * @param toEmail Recipient email address
     * @param username Username of recipient
     * @param otp 6-digit numeric verification code
     * @return boolean indicating whether dispatch succeeded
     */
    public boolean sendOtpEmail(String toEmail, String username, String otp) {
        if (senderEmail == null || senderEmail.isBlank()) {
            log.warn("Email sender not configured. Set spring.mail.username and spring.mail.password in application.properties.");
            return false;
        }

        try {
            log.info("Sending real-time OTP email to {} via Gmail SMTP", toEmail);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(senderEmail, "SmartCal AI Calendar");
            helper.setTo(toEmail.trim());
            helper.setSubject(otp + " is your SmartCal Verification Code");

            String htmlBody = """
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

            helper.setText(htmlBody, true);
            mailSender.send(message);

            log.info("OTP email successfully delivered to {}", toEmail);
            return true;
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", toEmail, e.getMessage());
            return false;
        }
    }
}
