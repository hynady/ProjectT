package com.ticket.servermono.authcontext.adapters.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.ticket.servermono.authcontext.adapters.dtos.AuthDtos;
import com.ticket.servermono.authcontext.usecases.AuthServices;
import com.ticket.servermono.authcontext.usecases.EndUserServices;

import java.util.Map;

@RestController
@RequestMapping("v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final EndUserServices endUserServices;
    private final AuthServices authServices;

    // Send OTP for register to email
    @PostMapping("/register/send-otp")
    public ResponseEntity<String> sendOtpForRegister(@RequestBody AuthDtos.OtpRequest payload) {
        try {
            authServices.requestRegisterOtp(payload.email);
            return ResponseEntity.ok("OTP đã được gửi đến email của bạn");
        } catch (RuntimeException e) {
            return ResponseEntity.status(409).body(e.getMessage());
        }
    }

    // Send OTP for reset password to email
    @PostMapping("/reset-password/send-otp")
    public ResponseEntity<String> sendOtpForForgotPassword(@RequestBody AuthDtos.OtpRequest payload) {
        try {
            authServices.requestResetPasswordOtp(payload.email);
            return ResponseEntity.ok("OTP đã được gửi đến email của bạn");
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }
    // Reset password
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody AuthDtos.ResetPasswordRequest payload) {
        try {
            endUserServices.resetPassword(payload.email, payload.password);
            return ResponseEntity.ok("Đổi mật khẩu thành công");
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    // Verify OTP
    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(@RequestBody AuthDtos.OtpVerifyRequest payload) {
        try {
            authServices.requestVerifyOtp(payload.email, payload.otp);
            return ResponseEntity.ok("Xác thực thành công");
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    // Register new user
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody AuthDtos.RegisterRequest payload) {
        try {
            String email = payload.email;
            String password = payload.password;
            System.out.println("Email: "+ email);
            endUserServices.newEndUser(email, password);
            return ResponseEntity.ok("Đăng ký thành công");
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }

    // Login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthDtos.LoginRequest payload) {
        try {
            String token = endUserServices.login(payload.email, payload.password);
            AuthDtos.LoginResponse response = new AuthDtos.LoginResponse(token);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("message", e.getMessage()));
        }
    }
}
