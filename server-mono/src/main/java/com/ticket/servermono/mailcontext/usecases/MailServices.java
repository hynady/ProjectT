package com.ticket.servermono.mailcontext.usecases;

import com.ticket.servermono.mailcontext.infrastructure.repositories.OTPRepository;
import com.ticket.servermono.mailcontext.entities.OTP;
import jakarta.mail.internet.MimeMessage;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailServices {

    private final OTPRepository otpRepository;
    private final JavaMailSender mailSender;
    private final EmailTemplateService emailTemplateService;
    private final KafkaTemplate<String, String> kafkaTemplate;

    private static final String REGISTER_TOPIC = "auth.register.otp";
    private static final String RESET_TOPIC = "auth.reset.otp";
    private static final String VERIFY_TOPIC = "auth.verify.otp";
    private static final String OTP_VERIFICATION_RESULT = "auth.otp.verification.result";

    @Value("${app.mail.username}")
    private String email;

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
    }

    @Async
    @KafkaListener(topics = RESET_TOPIC)
    public void handleResetPasswordOtpRequest(String email) {
        String otp = generateOTP();
        otpRepository.save(new OTP(email, otp));
        sendMail(
                email,
                "Reset Password OTP",
                emailTemplateService.getResetPasswordOtpTemplate(otp)
        );
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
}
