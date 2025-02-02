package com.ticket.userserver.features.auth.services.impl;

import com.ticket.userserver.features.auth.services.interfaces.EmailTemplateService;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.util.FileCopyUtils;

import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;

@Service
public class EmailTemplateServiceImpl implements EmailTemplateService {

    private String readEmailTemplate(String templatePath) {
        try {
            ClassPathResource resource = new ClassPathResource(templatePath);
            InputStreamReader reader = new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8);
            return FileCopyUtils.copyToString(reader);
        } catch (IOException e) {
            throw new RuntimeException("Could not read template file", e);
        }
    }

    @Override
    public String getRegisterOtpTemplate(String otp) {
        String template = readEmailTemplate("templates/email/register-otp.html");
        System.out.println("template: " + template);
        return String.format(template, otp, LocalDateTime.now()+ " (UTC+7)");
    }

    @Override
    public String getResetPasswordOtpTemplate(String otp) {
        String template = readEmailTemplate("templates/email/reset-password-otp.html");
        System.out.println("template: " + template);
        return String.format(template, otp, LocalDateTime.now()+ " (UTC+7)");
    }
}