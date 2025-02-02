package com.ticket.userserver.features.auth.services.impl;

import com.ticket.userserver.features.auth.models.OTP;
import com.ticket.userserver.features.auth.repositories.EndUserRepository;
import com.ticket.userserver.features.auth.repositories.OTPRepository;
import com.ticket.userserver.features.auth.services.interfaces.EmailTemplateService;
import com.ticket.userserver.features.auth.services.interfaces.MailServices;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailServicesImpl implements MailServices {

    private final EndUserRepository eUserRepo;
    private final OTPRepository otpRepository;
    private final JavaMailSender mailSender;
    private final EmailTemplateService emailTemplateService;

    @Value("${app.mail.username}")
    private String email;

    @Override
    public String generateOTP() {
        return String.format("%06d", new Random().nextInt(999999));
    }

    @Override
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

    @Override
    public void sendOtpForRegister(String email) {
        if (eUserRepo.existsByEmail(email)) {
            throw new RuntimeException("Email đã tồn tại");
        }
        String otp = generateOTP();
        otpRepository.save(new OTP(email, otp));
        sendMail(
                email,
                "Registration OTP",
                emailTemplateService.getRegisterOtpTemplate(otp)
        );
    }

    @Override
    public void sendOtpForForgotPassword(String email) {
        if (!eUserRepo.existsByEmail(email)) {
            throw new RuntimeException("Email chưa được đăng ký");
        }
        String otp = generateOTP();
        otpRepository.save(new OTP(email, otp));
        sendMail(
                email,
                "Reset Password OTP",
                emailTemplateService.getResetPasswordOtpTemplate(otp)
        );
    }

    @Override
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
