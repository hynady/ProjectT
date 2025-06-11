package com.ticket.servermono.authcontext.infrastructure.services;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;

@Service
@RequiredArgsConstructor
public class GoogleOAuthService {

    @Value("${app.googleClientId}")
    private String googleClientId;

    @Value("${app.googleClientSecret}")
    private String googleClientSecret;

    @Value("${google.oauth.redirect-uri}")
    private String redirectUri;

    private final NetHttpTransport transport = new NetHttpTransport();
    private final GsonFactory jsonFactory = GsonFactory.getDefaultInstance();

    /**
     * Xác thực Google ID Token từ frontend
     */
    public GoogleIdToken.Payload verifyGoogleToken(String idToken) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(transport, jsonFactory)
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken googleIdToken = verifier.verify(idToken);
            if (googleIdToken != null) {
                return googleIdToken.getPayload();
            }
            throw new RuntimeException("Invalid Google token");
        } catch (GeneralSecurityException | IOException e) {
            throw new RuntimeException("Failed to verify Google token: " + e.getMessage());
        }
    }

    /**
     * Tạo authorization URL cho OAuth flow
     */
    public String getAuthorizationUrl() {
        GoogleAuthorizationCodeFlow flow = new GoogleAuthorizationCodeFlow.Builder(
                transport, jsonFactory, googleClientId, googleClientSecret,
                Collections.singletonList("openid email profile"))
                .setAccessType("offline")
                .build();

        return flow.newAuthorizationUrl()
                .setRedirectUri(redirectUri)
                .build();
    }

    /**
     * Đổi authorization code lấy access token (cho server-side flow)
     */
    public GoogleTokenResponse exchangeCodeForTokens(String authorizationCode) {
        try {
            GoogleAuthorizationCodeFlow flow = new GoogleAuthorizationCodeFlow.Builder(
                    transport, jsonFactory, googleClientId, googleClientSecret,
                    Collections.singletonList("openid email profile"))
                    .build();

            return flow.newTokenRequest(authorizationCode)
                    .setRedirectUri(redirectUri)
                    .execute();
        } catch (IOException e) {
            throw new RuntimeException("Failed to exchange code for tokens: " + e.getMessage());
        }
    }

    /**
     * Xác thực Google Token và lấy thông tin user (cho server-side flow)
     */
    public GoogleIdToken.Payload verifyAndGetUserInfo(String authorizationCode) {
        try {
            GoogleTokenResponse tokenResponse = exchangeCodeForTokens(authorizationCode);
            String idTokenString = tokenResponse.getIdToken();
            
            return verifyGoogleToken(idTokenString);
        } catch (Exception e) {
            throw new RuntimeException("Failed to get user info from Google: " + e.getMessage());
        }
    }
}
