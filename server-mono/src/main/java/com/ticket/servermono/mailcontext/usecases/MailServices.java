package com.ticket.servermono.mailcontext.usecases;

import com.ticket.servermono.mailcontext.infrastructure.repositories.OTPRepository;
import com.ticket.servermono.mailcontext.entities.OTP;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.mail.internet.MimeMessage;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class MailServices {

    private final OTPRepository otpRepository;
    private final JavaMailSender mailSender;
    private final EmailTemplateService emailTemplateService;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;    private static final String REGISTER_TOPIC = "auth.register.otp";
    private static final String RESET_TOPIC = "auth.reset.otp";
    private static final String VERIFY_TOPIC = "auth.verify.otp";
    private static final String OTP_VERIFICATION_RESULT = "auth.otp.verification.result";
    private static final String PURCHASE_NOTIFICATION_TOPIC = "mail.purchase.success";
    private static final String REGISTRATION_SUCCESS_TOPIC = "auth.register.success";

    @Value("${app.mail.username}")
    private String email;
    
    @Value("${app.website.url:https://tackticket.com}")
    private String websiteUrl;

    public String generateOTP() {
        return String.format("%06d", new Random().nextInt(999999));
    }

    public boolean sendMail(String to, String subject, String text) {

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(email, "Tack Ticket"); // Add sender name
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(text, true);

            mailSender.send(message);
            System.out.println("Mail sent successfully");
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @Async
    @KafkaListener(topics = REGISTER_TOPIC)
    public void handleRegisterOtpRequest(String email) {
        String otp = generateOTP();
        otpRepository.save(new OTP(email, otp));
        sendMail(
                email,
                "Register OTP",
                emailTemplateService.getRegisterOtpTemplate(otp)
        );
    }    @Async
    @KafkaListener(topics = RESET_TOPIC)
    public void handleResetPasswordOtpRequest(String email) {
        String otp = generateOTP();
        otpRepository.save(new OTP(email, otp));
        sendMail(
                email,
                "Reset Password OTP",
                emailTemplateService.getResetPasswordOtpTemplate(otp)
        );
    }    @Async
    @KafkaListener(topics = PURCHASE_NOTIFICATION_TOPIC)
    public void handlePurchaseNotification(String payload) {
        try {
            log.info("Received purchase success notification request: {}", payload);
            
            // Parse the JSON payload
            @SuppressWarnings("unchecked")
            Map<String, Object> data = objectMapper.readValue(payload, Map.class);
            
            // Extract required fields from the payload
            String paymentId = (String) data.get("paymentId");
            String userId = (String) data.get("userId");
            String showId = (String) data.get("showId");
            String userEmail = (String) data.get("userEmail");
            String userName = (String) data.get("userName");
            String eventName = (String) data.get("occaName");
            String eventDate = (String) data.get("time");
            String eventLocation = (String) data.get("location");
            Double totalAmount = Double.parseDouble(data.get("totalAmount").toString());
            String ticketUrl = (String) data.get("ticketUrl");
            
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> ticketItems = (List<Map<String, Object>>) data.get("ticketItems");
            
            // Generate email content using template service
            String emailContent = emailTemplateService.getPurchaseSuccessTemplate(
                    userId,
                    showId,
                    paymentId,
                    userName,
                    eventName,
                    eventDate,
                    eventLocation,
                    ticketItems,
                    totalAmount,
                    ticketUrl
            );
            
            // Send the email
            boolean sent = sendMail(
                    userEmail,
                    "Thông báo đặt vé thành công - " + eventName,
                    emailContent
            );
            
            if (sent) {
                log.info("Purchase success notification email sent successfully to {} for paymentId: {}", userEmail, paymentId);
            } else {
                log.error("Failed to send purchase success notification email for paymentId: {}", paymentId);
            }
            
        } catch (Exception e) {
            log.error("Error processing purchase notification message: {}", e.getMessage(), e);
        }
    }


    @KafkaListener(topics = VERIFY_TOPIC)
    public void handleOtpVerification(String payload) {
        String[] data = payload.split(":");
        String email = data[0];
        String otp = data[1];

        if (verifyOtp(email, otp)) {
            kafkaTemplate.send(OTP_VERIFICATION_RESULT, "true");
        } else {
            kafkaTemplate.send(OTP_VERIFICATION_RESULT, "false");
        }
    }

    public boolean verifyOtp(String email, String otp) {
        Optional<OTP> otpEntity = otpRepository.findById(email);
        
        if (otpEntity.isEmpty()) {
            return false;
        }

        OTP currentOtp = otpEntity.get();
        
        if (currentOtp.isUsed() || 
            LocalDateTime.now().isAfter(currentOtp.getExpiryDate())) {
            otpRepository.deleteById(email);
            return false;
        }

        if (currentOtp.getCode().equals(otp)) {
            currentOtp.setUsed(true);
            otpRepository.save(currentOtp);
            return true;
        }

        return false;
    }
    
    /**
     * Xử lý sự kiện đăng ký thành công và gửi email xác nhận đến người dùng
     */
    @Async
    @KafkaListener(topics = REGISTRATION_SUCCESS_TOPIC)
    public void handleRegistrationSuccess(String payload) {
        try {
            log.info("Received registration success notification request: {}", payload);
            
            // Parse the JSON payload
            @SuppressWarnings("unchecked")
            Map<String, Object> data = objectMapper.readValue(payload, Map.class);
            
            // Extract required fields from the payload
            String userId = (String) data.get("userId");
            String userEmail = (String) data.get("userEmail");
            String userName = (String) data.get("userName");
            String registrationDate = (String) data.get("registrationDate");
            
            // Generate email content using template service
            String emailContent = emailTemplateService.getRegisterSuccessTemplate(
                    userName,
                    userEmail,
                    registrationDate,
                    websiteUrl
            );
            
            // Send the email
            boolean sent = sendMail(
                    userEmail,
                    "Chào mừng bạn đến với Tack Ticket",
                    emailContent
            );
            
            if (sent) {
                log.info("Registration success notification email sent successfully to {} for userId: {}", userEmail, userId);
            } else {
                log.error("Failed to send registration success notification email for userId: {}", userId);
            }
            
        } catch (Exception e) {
            log.error("Error processing registration success notification message: {}", e.getMessage(), e);
        }
    }
}
