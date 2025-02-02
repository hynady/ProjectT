package com.ticket.userserver.features.auth.services.interfaces;

public interface EmailTemplateService {
    String getRegisterOtpTemplate(String otp);
    String getResetPasswordOtpTemplate(String otp);
}