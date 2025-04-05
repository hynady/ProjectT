package com.ticket.servermono.ticketcontext.infrastructure.events;

import org.springframework.context.ApplicationEvent;

/**
 * Event được phát ra khi trạng thái thanh toán thay đổi
 */
public class PaymentStatusEvent extends ApplicationEvent {
    
    private static final long serialVersionUID = 1L;
    
    private final String paymentId;
    private final String status;
    private final String jsonData;
    
    public PaymentStatusEvent(String paymentId, String status, String jsonData) {
        super(paymentId);
        this.paymentId = paymentId;
        this.status = status;
        this.jsonData = jsonData;
    }
    
    public String getPaymentId() {
        return paymentId;
    }
    
    public String getStatus() {
        return status;
    }
    
    public String getJsonData() {
        return jsonData;
    }
}