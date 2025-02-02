package com.ticket.userserver.features.auth.services.interfaces;


public interface EndUserServices {
    void newEndUser(String email, String password);
    String login(String email, String password);
    void resetPassword(String email, String password);
}
