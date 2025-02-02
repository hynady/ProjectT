package com.ticket.userserver.features.auth.services.interfaces;

public interface MailServices {
    boolean sendMail(String to, String subject, String text);
    void sendOtpForRegister(String email);
    void sendOtpForForgotPassword(String email);
    boolean verifyOtp(String email, String otp);
    String generateOTP();
}
