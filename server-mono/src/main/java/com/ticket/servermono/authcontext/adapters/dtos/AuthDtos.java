package com.ticket.servermono.authcontext.adapters.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

public class AuthDtos {
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OtpRequest {
        public String email;
    }
    public static class OtpVerifyRequest {
        public String otp;
        public String email;
    }
    public static class RegisterRequest {
        public String email;
        public String password;
    }
    public static class LoginRequest {
        public String email;
        public String password;
    }
    public static class LoginResponse {
        public String token;

        public LoginResponse(String token) {
            this.token = token;
        }
    }    
    public static class ResetPasswordRequest {
        public String email;
        public String password;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GoogleLoginRequest {
        public String idToken;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GoogleAuthCodeRequest {
        public String authorizationCode;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GoogleAuthUrlResponse {
        public String authorizationUrl;
    }
}
