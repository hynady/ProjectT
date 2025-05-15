package com.ticket.servermono.occacontext.adapters.dtos.Show;

import lombok.Data;

/**
 * Payload for adding a new show to an occasion
 */
@Data
public class AddShowPayload {
    private String date;      // Ngày của suất diễn (yyyy-MM-dd)
    private String time;      // Giờ của suất diễn (HH:mm)
    private String saleStatus; // Trạng thái bán vé (upcoming, on_sale, sold_out, ended)
    private Boolean autoUpdateStatus; // Tự động cập nhật trạng thái (true/false)
}