package com.ticket.servermono.mailcontext.usecases;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.util.FileCopyUtils;

import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.text.NumberFormat;
import java.util.Locale;

@Service
public class EmailTemplateService {

    private String readEmailTemplate(String templatePath) {
        try {
            ClassPathResource resource = new ClassPathResource(templatePath);
            InputStreamReader reader = new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8);
            return FileCopyUtils.copyToString(reader);
        } catch (IOException e) {
            throw new RuntimeException("Could not read template file", e);
        }
    }

    public String getRegisterOtpTemplate(String otp) {
        String template = readEmailTemplate("templates/email/register-otp.html");
        return String.format(template, otp, LocalDateTime.now()+ " (UTC+7)");
    }

    public String getResetPasswordOtpTemplate(String otp) {
        String template = readEmailTemplate("templates/email/reset-password-otp.html");
        return String.format(template, otp, LocalDateTime.now()+ " (UTC+7)");
    }
      /**
     * Tạo template email xác nhận đặt vé thành công
     * 
     * @param userId Id của người dùng đặt vé
     * @param showId Id của show/buổi diễn
     * @param paymentId Id của thanh toán/đơn hàng
     * @param userName Tên người dùng
     * @param eventName Tên sự kiện
     * @param eventDate Ngày diễn ra sự kiện
     * @param eventLocation Địa điểm tổ chức sự kiện
     * @param ticketItems Danh sách vé đã mua (loại vé, số lượng, giá từng vé)
     * @param totalAmount Tổng tiền thanh toán
     * @param ticketUrl URL để người dùng xem vé
     * @return Nội dung HTML của email
     */
    public String getPurchaseSuccessTemplate(
            String userId,
            String showId,
            String paymentId, 
            String userName, 
            String eventName, 
            String eventDate, 
            String eventLocation, 
            List<Map<String, Object>> ticketItems,
            double totalAmount,
            String ticketUrl) {
        
        String template = readEmailTemplate("templates/email/purchase-success.html");
        
        // Format ticket items HTML
        StringBuilder ticketItemsHtml = new StringBuilder();
        for (Map<String, Object> item : ticketItems) {
            String type = (String) item.get("type");
            int quantity = (int) item.get("quantity");
            double price = (double) item.get("price");
            
            ticketItemsHtml.append("<div class=\"ticket-item\">")
                          .append("<div class=\"ticket-type\">").append(type).append("</div>")
                          .append("<div class=\"ticket-quantity-price\">")
                          .append("<div>Số lượng: ").append(quantity).append("</div>")
                          .append("<div>Giá: ").append(formatCurrency(price)).append(" VND</div>")
                          .append("</div>")
                          .append("</div>");
        }
        
        // Format timestamp
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")) + " (UTC+7)";
        
        // Format total amount
        String formattedTotal = formatCurrency(totalAmount);
        
        // Debugging log to verify the template content
        System.out.println("Template content before formatting: " + template);
        
        return String.format(template, 
                paymentId, 
                userName, 
                eventName, 
                eventDate, 
                eventLocation, 
                ticketItemsHtml.toString(),
                formattedTotal,
                ticketUrl,
                userId,
                showId,
                paymentId,
                timestamp);
    }
    
    /**
     * Format số tiền theo định dạng tiền tệ Việt Nam
     */
    private String formatCurrency(double amount) {
        NumberFormat currencyFormat = NumberFormat.getNumberInstance(new Locale("vi", "VN"));
        return currencyFormat.format(amount);
    }
    
    /**
     * Tạo template email xác nhận đăng ký tài khoản thành công
     * 
     * @param userName Tên người dùng
     * @param userEmail Email của người dùng
     * @param registrationDate Ngày đăng ký tài khoản
     * @param websiteUrl URL của trang web Tack Ticket
     * @return Nội dung HTML của email
     */
    public String getRegisterSuccessTemplate(
            String userName,
            String userEmail,
            String registrationDate,
            String websiteUrl) {
        
        String template = readEmailTemplate("templates/email/register-success.html");
        
        // Format timestamp
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")) + " (UTC+7)";
        
        return String.format(template, 
                userName,
                userEmail,
                userName,
                registrationDate,
                websiteUrl,
                timestamp);
    }
}