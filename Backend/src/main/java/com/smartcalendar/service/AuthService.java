package com.smartcalendar.service;

import com.smartcalendar.dto.JwtResponse;
import com.smartcalendar.dto.LoginRequest;
import com.smartcalendar.dto.RegisterRequest;
import com.smartcalendar.dto.VerifyOtpRequest;
import com.smartcalendar.entity.User;
import com.smartcalendar.exception.BadRequestException;
import com.smartcalendar.exception.ResourceNotFoundException;
import com.smartcalendar.repository.UserRepository;
import com.smartcalendar.security.JwtUtils;
import com.smartcalendar.security.UserDetailsImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final SmsService smsService;
    private final EmailService emailService;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager, JwtUtils jwtUtils,
                       SmsService smsService, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.smsService = smsService;
        this.emailService = emailService;
    }

    @Transactional
    public String register(RegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Password and confirm password do not match");
        }

        String username = request.getUsername() != null ? request.getUsername().trim() : "";
        String contact = request.getMobileNumber() != null ? request.getMobileNumber().trim() : "";

        if (username.isEmpty() || contact.isEmpty()) {
            throw new BadRequestException("Username and Email/Phone are required");
        }

        // Check if user already exists
        Optional<User> existingUserOpt = userRepository.findByUsernameOrMobileNumber(username, contact);

        String otp = generateOtp();
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(10);
        User user;

        if (existingUserOpt.isPresent()) {
            User existing = existingUserOpt.get();
            if (Boolean.TRUE.equals(existing.getIsVerified())) {
                throw new BadRequestException("An account with this username or email is already registered. Please sign in.");
            }
            // Update the unverified user with new credentials and a new OTP
            existing.setUsername(username);
            existing.setMobileNumber(contact);
            existing.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            existing.setOtpCode(otp);
            existing.setOtpExpiry(expiry);
            user = userRepository.save(existing);
        } else {
            user = User.builder()
                    .username(username)
                    .mobileNumber(contact)
                    .passwordHash(passwordEncoder.encode(request.getPassword()))
                    .isVerified(false)
                    .otpCode(otp)
                    .otpExpiry(expiry)
                    .role("ROLE_USER")
                    .build();
            user = userRepository.save(user);
        }

        // Dispatch real-time OTP via Email or SMS
        boolean sent = dispatchOtp(user, otp);

        log.info("USER REGISTRATION: Username: {}, Contact: {}, OTP: {}, Sent: {}", user.getUsername(), user.getMobileNumber(), otp, sent);
        
        if (sent) {
            String channel = user.getMobileNumber().contains("@") ? "email inbox (" + user.getMobileNumber() + ")" : "mobile phone (" + user.getMobileNumber() + ")";
            return "Registration successful. An OTP has been sent to your " + channel + ".";
        } else {
            return "Registration successful. (Dev OTP: " + otp + ")";
        }
    }

    @Transactional
    public JwtResponse verifyOtp(VerifyOtpRequest request) {
        User user = userRepository.findByUsernameOrMobileNumber(request.getUsernameOrPhone(), request.getUsernameOrPhone())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username or identifier: " + request.getUsernameOrPhone()));

        if (Boolean.TRUE.equals(user.getIsVerified())) {
            return generateJwtForUser(user);
        }

        if (user.getOtpCode() == null || !user.getOtpCode().equals(request.getOtpCode().trim())) {
            throw new BadRequestException("Invalid OTP code. Please check and try again.");
        }

        if (user.getOtpExpiry() != null && user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("OTP has expired. Please request a new OTP.");
        }

        user.setIsVerified(true);
        user.setOtpCode(null);
        user.setOtpExpiry(null);
        userRepository.save(user);

        log.info("User {} successfully verified OTP", user.getUsername());
        return generateJwtForUser(user);
    }

    @Transactional
    public String resendOtp(String usernameOrPhone) {
        User user = userRepository.findByUsernameOrMobileNumber(usernameOrPhone, usernameOrPhone)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + usernameOrPhone));

        String otp = generateOtp();
        user.setOtpCode(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        // Dispatch real-time OTP
        boolean sent = dispatchOtp(user, otp);

        log.info("NEW OTP GENERATED for user {}: {}, Sent: {}", user.getUsername(), otp, sent);
        if (sent) {
            return "A new OTP has been dispatched to " + user.getMobileNumber();
        } else {
            return "New OTP generated. (Dev OTP: " + otp + ")";
        }
    }

    @Transactional
    public JwtResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsernameOrPhone().trim(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();

        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!Boolean.TRUE.equals(user.getIsVerified())) {
            String otp = generateOtp();
            user.setOtpCode(otp);
            user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
            userRepository.save(user);

            // Dispatch real-time OTP
            boolean sent = dispatchOtp(user, otp);

            String msg = sent 
                ? "Account not verified. An OTP has been sent to " + user.getMobileNumber() 
                : "Account not verified. (Dev OTP: " + otp + ")";
            throw new BadRequestException(msg);
        }

        String jwt = jwtUtils.generateJwtToken(authentication);
        List<String> roles = userPrincipal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        return JwtResponse.builder()
                .token(jwt)
                .type("Bearer")
                .id(user.getId())
                .username(user.getUsername())
                .mobileNumber(user.getMobileNumber())
                .isVerified(user.getIsVerified())
                .roles(roles)
                .build();
    }

    private boolean dispatchOtp(User user, String otp) {
        String contact = user.getMobileNumber() != null ? user.getMobileNumber().trim() : "";
        if (contact.contains("@")) {
            return emailService.sendOtpEmail(contact, user.getUsername(), otp);
        } else {
            return smsService.sendOtpSms(contact, otp);
        }
    }

    public User getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            throw new BadRequestException("No authenticated user found");
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found in database"));
    }

    private JwtResponse generateJwtForUser(User user) {
        String token = jwtUtils.generateTokenFromUsername(user.getUsername());
        return JwtResponse.builder()
                .token(token)
                .type("Bearer")
                .id(user.getId())
                .username(user.getUsername())
                .mobileNumber(user.getMobileNumber())
                .isVerified(user.getIsVerified())
                .roles(List.of(user.getRole()))
                .build();
    }

    private String generateOtp() {
        int code = 100000 + secureRandom.nextInt(900000);
        return String.valueOf(code);
    }
}
