package com.ticket.servermono.authcontext.usecases;

import com.ticket.servermono.authcontext.infrastructure.repositories.EndUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServices {
    private final EndUserRepository eUserRepo;
    private final KafkaTemplate<String, String> kafkaTemplate;

    private static final String REGISTER_TOPIC = "auth.register.otp";
    private static final String RESET_TOPIC = "auth.reset.otp";
    private static final String VERIFY_TOPIC = "auth.verify.otp";
    private static final String OTP_VERIFICATION_RESULT = "auth.otp.verification.result";

    public void requestRegisterOtp(String email) {
        if (eUserRepo.existsByEmail(email)) {
            throw new RuntimeException("Email đã tồn tại");
        }
        kafkaTemplate.send(REGISTER_TOPIC, email);
    }

    public void requestResetPasswordOtp(String email) {
        if (!eUserRepo.existsByEmail(email)) {
            throw new RuntimeException("Email chưa được đăng ký");
        }
        kafkaTemplate.send(RESET_TOPIC, email);
    }

    public void requestVerifyOtp(String email, String otp) {
        kafkaTemplate.send(VERIFY_TOPIC, email + ":" + otp);
    }

    @KafkaListener(topics = OTP_VERIFICATION_RESULT)
    public void handleOtpVerificationCompleted(String payload) {
        // Handle verification result
        if (!payload.equals("true")) {
            throw new RuntimeException("Xác thực OTP thất bại");
        }
    }
}