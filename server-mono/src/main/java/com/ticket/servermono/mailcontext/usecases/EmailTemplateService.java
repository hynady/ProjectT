package com.ticket.servermono.mailcontext.usecases;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.ByteArrayResource;

import org.springframework.stereotype.Service;
import org.springframework.util.FileCopyUtils;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.text.NumberFormat;
import java.util.Locale;


@Service
public class EmailTemplateService {    
    private String readEmailTemplate(String templatePath) {
        try {
            ClassPathResource resource = new ClassPathResource(templatePath);
            // Đảm bảo sử dụng UTF-8 cho việc đọc file
            InputStreamReader reader = new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8);
            String content = FileCopyUtils.copyToString(reader);
            
            // Kiểm tra và log nội dung để debug
            if (content.contains("?") && !templatePath.contains("otp")) {
                System.out.println("WARNING: Template có thể bị lỗi encoding: " + templatePath);
            }
            
            return content;
        } catch (IOException e) {
            throw new RuntimeException("Could not read template file: " + templatePath, e);
        }
    }

    public String getRegisterOtpTemplate(String otp) {
        String template = readEmailTemplate("templates/email/register-otp.html");
        return String.format(template, otp, LocalDateTime.now()+ " (UTC+7)");
    }

    public String getResetPasswordOtpTemplate(String otp) {
        String template = readEmailTemplate("templates/email/reset-password-otp.html");
        return String.format(template, otp, LocalDateTime.now()+ " (UTC+7)");
    }    /**
     * Đã được thay thế bởi phương thức mới getPurchaseSuccessTemplateWithAttachments để hỗ trợ QR code PNG đính kèm
     * Giữ lại để đảm bảo tương thích ngược
     * 
     * @see #getPurchaseSuccessTemplateWithAttachments
     */
    
    /**
     * Format số tiền theo định dạng tiền tệ Việt Nam
     */
    private String formatCurrency(double amount) {
        NumberFormat currencyFormat = NumberFormat.getNumberInstance(new Locale("vi", "VN"));
        return currencyFormat.format(amount);
    }    /**
     * Tạo mã QR SVG từ dữ liệu đầu vào sử dụng thư viện ZXing
     * Phương thức này không còn được sử dụng vì chúng ta đã chuyển sang dùng PNG đính kèm
     * nhưng được giữ lại để đảm bảo tương thích ngược
     * 
     * @param data Dữ liệu để mã hóa thành QR code
     * @return Chuỗi SVG đại diện cho mã QR
     */
    @SuppressWarnings("unused")  // Suppress warning about unused method
    private String generateSVGQRCode(String data) {
        try {
            int size = 150; // Kích thước SVG
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            
            // Thiết lập các tùy chọn cho QR code
            Map<EncodeHintType, Object> hints = new HashMap<>();
            hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.L);
            hints.put(EncodeHintType.MARGIN, 1); // Margin nhỏ hơn để mã QR lớn hơn trong SVG
            
            // Tạo BitMatrix từ dữ liệu
            BitMatrix bitMatrix = qrCodeWriter.encode(data, BarcodeFormat.QR_CODE, size, size, hints);
            
            // Tạo SVG từ BitMatrix
            return generateSVGFromBitMatrix(bitMatrix, size, data);
        } catch (WriterException e) {
            // Log lỗi và trả về một SVG đơn giản khi có lỗi
            System.err.println("Lỗi khi tạo QR code: " + e.getMessage());
            return "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"150\" height=\"150\" viewBox=\"0 0 150 150\">" +
                   "<rect width=\"100%\" height=\"100%\" fill=\"#f5f5f5\"/>" +
                   "<text x=\"75\" y=\"75\" font-family=\"Arial\" font-size=\"12\" text-anchor=\"middle\" fill=\"#555555\">" +
                   "QR Code lỗi</text></svg>";
        }
    }
    
    /**
     * Tạo SVG từ BitMatrix
     * Phương thức này không còn được sử dụng vì chúng ta đã chuyển sang dùng PNG đính kèm
     * nhưng được giữ lại để đảm bảo tương thích ngược
     */
    @SuppressWarnings("unused")  // Suppress warning about unused method
    private String generateSVGFromBitMatrix(BitMatrix bitMatrix, int size, String data) {
        StringBuilder svg = new StringBuilder();
        svg.append("<svg xmlns=\"http://www.w3.org/2000/svg\" ")
           .append("width=\"150\" height=\"150\" ")
           .append("viewBox=\"0 0 ").append(size).append(" ").append(size).append("\" ")
           .append("shape-rendering=\"crispEdges\">\n");
           
        // Nền trắng
        svg.append("<rect width=\"100%\" height=\"100%\" fill=\"white\"/>\n");
        
        // Vẽ các ô đen
        for (int y = 0; y < size; y++) {
            for (int x = 0; x < size; x++) {
                if (bitMatrix.get(x, y)) {
                    svg.append("<rect x=\"").append(x)
                       .append("\" y=\"").append(y)
                       .append("\" width=\"1\" height=\"1\" fill=\"black\"/>\n");
                }
            }
        }
        
        svg.append("</svg>");
        return svg.toString();
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

    /**
     * Class representing an email attachment
     */
    public static class EmailAttachment {
        private final String filename;
        private final byte[] data;
        private final String contentType;
        
        public EmailAttachment(String filename, byte[] data, String contentType) {
            this.filename = filename;
            this.data = data;
            this.contentType = contentType;
        }
        
        public String getFilename() {
            return filename;
        }
        
        public byte[] getData() {
            return data;
        }
        
        public String getContentType() {
            return contentType;
        }
    }
    
    /**
     * Class representing email template result with HTML content and attachments
     */
    public static class EmailTemplateResult {
        private final String htmlContent;
        private final List<EmailAttachment> attachments;
        
        public EmailTemplateResult(String htmlContent, List<EmailAttachment> attachments) {
            this.htmlContent = htmlContent;
            this.attachments = attachments;
        }
        
        public String getHtmlContent() {
            return htmlContent;
        }
        
        public List<EmailAttachment> getAttachments() {
            return attachments;
        }
    }

    /**
     * Tạo template email thông báo đặt vé thành công với QR code dưới dạng file đính kèm
     *
     * @param userId Id của người dùng đặt vé
     * @param showId Id của show/buổi diễn
     * @param paymentId Id của thanh toán/đơn hàng
     * @param userName Tên người dùng
     * @param eventName Tên sự kiện
     * @param eventDate Ngày diễn ra sự kiện
     * @param eventLocation Địa điểm tổ chức sự kiện
     * @param ticketItems Danh sách vé đã mua (loại vé, số lượng, giá từng vé, ticketIds)
     * @param totalAmount Tổng tiền thanh toán
     * @param ticketUrl URL để người dùng xem vé
     * @return EmailTemplateResult chứa nội dung HTML và danh sách các file QR code đính kèm
     */
    public EmailTemplateResult getPurchaseSuccessTemplateWithAttachments(
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
        
        // Đọc template và escape các ký tự % trong CSS thành %%
        String template = readEmailTemplate("templates/email/purchase-success.html");
        // Escape % ký tự trong CSS bằng cách thay %width thành %%width
        template = template.replace("width: 100%;", "width: 100%%;");
        template = template.replace("height: 100%;", "height: 100%%;");
                          
        // Thêm CSS cho phần hiển thị vé có QR code
        String additionalCSS = 
            ".ticket-info-container {" +
            "  display: flex;" +
            "  align-items: center;" +
            "  justify-content: space-between;" +
            "  padding: 10px;" +
            "}" +
            ".ticket-qr-code {" +
            "  flex: 0 0 150px;" +
            "}" +
            ".ticket-details {" +
            "  flex: 1;" +
            "  padding-left: 15px;" +
            "  text-align: left;" +
            "}" +
            ".ticket-type-label {" +
            "  margin-bottom: 10px;" +
            "  font-size: 15px;" +
            "  color: #334155;" +
            "}" +
            ".ticket-id-label {" +
            "  font-size: 13px;" +
            "  color: #64748b;" +
            "}" +
            ".ticket-id {" +
            "  font-family: monospace;" +
            "  color: #7c3aed;" +
            "}";
            
        // Chèn thêm CSS vào phần head của template
        template = template.replace("</style>", additionalCSS + "\n</style>");
        
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
        
        // Generate QR codes HTML và tạo danh sách file đính kèm
        StringBuilder qrCodesHtml = new StringBuilder();
        List<EmailAttachment> attachments = new ArrayList<>();
        boolean hasQrCodes = false;
        
        for (Map<String, Object> item : ticketItems) {
            String type = (String) item.get("type");
            @SuppressWarnings("unchecked")
            List<String> ticketIds = (List<String>) item.get("ticketIds");
            
            if (ticketIds != null && !ticketIds.isEmpty()) {
                hasQrCodes = true;
                for (String ticketId : ticketIds) {                    // Tạo tên file duy nhất cho QR code, bao gồm cả thông tin hạng vé
                    String safeTypeName = type.replaceAll("[^a-zA-Z0-9]", "-"); // Đảm bảo tên hạng vé an toàn cho tên file
                    String qrFilename = "qrcode-" + safeTypeName + "-" + ticketId + ".png";
                      // Tạo file QR code PNG để đính kèm với tên hạng vé
                    try {
                        // Tạo QR code với tên hạng vé hiển thị trên ảnh
                        ByteArrayResource qrImageResource = generatePNGQRCode(ticketId, type);
                        // Thêm vào danh sách file đính kèm
                        attachments.add(new EmailAttachment(qrFilename, qrImageResource.getByteArray(), "image/png"));
                        
                        // Thêm thông tin vé và tham chiếu đến file QR code đính kèm vào email
                        qrCodesHtml.append("<div class=\"ticket-qr-item\">")
                                  .append("<div class=\"ticket-qr-header\">").append(type).append("</div>")
                                  .append("<div class=\"ticket-info-container\">")
                                  .append("<div class=\"ticket-details\">")
                                  .append("<div class=\"ticket-type-label\">Loại vé: <strong>").append(type).append("</strong></div>")
                                  .append("<div class=\"ticket-id-label\">ID vé: <span class=\"ticket-id\">").append(ticketId).append("</span></div>")
                                  .append("<div style=\"margin-top: 10px;\">")
                                  .append("<em>Mã QR code cho vé này được đính kèm với tên file: <strong>").append(qrFilename).append("</strong></em>")
                                  .append("</div>")
                                  .append("<div style=\"margin-top: 5px;\">")
                                  .append("<em>Hình ảnh QR code đã có tên hạng vé \"<strong>").append(type).append("</strong>\" hiển thị trên ảnh.</em>")
                                  .append("</div>")
                                  .append("</div>")
                                  .append("</div>")
                                  .append("</div>");
                    } catch (Exception e) {
                        System.err.println("Lỗi khi tạo QR code PNG: " + e.getMessage());
                        qrCodesHtml.append("<div class=\"ticket-qr-item\">")
                                  .append("<div class=\"ticket-qr-header\">").append(type).append("</div>")
                                  .append("<div class=\"ticket-info-container\">")
                                  .append("<div class=\"ticket-details\">")
                                  .append("<div class=\"ticket-type-label\">Loại vé: <strong>").append(type).append("</strong></div>")
                                  .append("<div class=\"ticket-id-label\">ID vé: <span class=\"ticket-id\">").append(ticketId).append("</span></div>")
                                  .append("<div style=\"color: #e11d48; margin-top: 10px;\">")
                                  .append("<em>Không thể tạo mã QR code cho vé này.</em>")
                                  .append("</div>")
                                  .append("</div>")
                                  .append("</div>")
                                  .append("</div>");
                    }
                }
            }
        }
        
        // Nếu không có QR codes nào, hiển thị thông báo
        if (!hasQrCodes) {
            qrCodesHtml.append("<div style=\"text-align: center; padding: 20px; color: #64748b;\">")
                       .append("Vé sẽ được hiển thị tại đây sau khi xử lý hoàn tất.")
                       .append("</div>");
        }
        
        String htmlContent = String.format(template, 
                paymentId, 
                userName, 
                eventName, 
                eventDate, 
                eventLocation, 
                ticketItemsHtml.toString(),
                formattedTotal,
                qrCodesHtml.toString(), // QR codes HTML
                ticketUrl,
                userId,
                showId,
                paymentId,
                timestamp);
                
        return new EmailTemplateResult(htmlContent, attachments);
    }    /**
     * Tạo QR code dưới dạng file PNG để đính kèm vào email, với tên hạng vé hiển thị trên hình ảnh
     * @param data Dữ liệu để mã hóa thành QR code
     * @param ticketType Tên hạng vé để hiển thị trên QR code
     * @return ByteArrayResource chứa dữ liệu hình ảnh QR code
     * @throws WriterException Nếu có lỗi khi tạo QR code
     * @throws IOException Nếu có lỗi khi xử lý dữ liệu
     */
    private ByteArrayResource generatePNGQRCode(String data, String ticketType) throws WriterException, IOException {
        int size = 300; // Kích thước QR code
        int margin = 50; // Thêm margin để chứa text
        int imageWidth = size + 2 * margin;
        int imageHeight = size + 3 * margin; // Thêm không gian phía dưới cho tên hạng vé
        
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        
        // Thiết lập các tùy chọn cho QR code
        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H); // Mức độ sửa lỗi cao
        hints.put(EncodeHintType.MARGIN, 0); // Không cần margin trong QR vì chúng ta sẽ thêm margin thủ công
        
        // Tạo BitMatrix từ dữ liệu
        BitMatrix bitMatrix = qrCodeWriter.encode(data, BarcodeFormat.QR_CODE, size, size, hints);
        
        // Tạo hình ảnh với background trắng
        java.awt.image.BufferedImage image = new java.awt.image.BufferedImage(
                imageWidth, imageHeight, java.awt.image.BufferedImage.TYPE_INT_RGB);
        java.awt.Graphics2D graphics = image.createGraphics();
        
        // Thiết lập chất lượng rendering
        graphics.setRenderingHint(java.awt.RenderingHints.KEY_TEXT_ANTIALIASING, 
                               java.awt.RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
        graphics.setRenderingHint(java.awt.RenderingHints.KEY_RENDERING, 
                               java.awt.RenderingHints.VALUE_RENDER_QUALITY);
        
        // Vẽ background trắng
        graphics.setColor(java.awt.Color.WHITE);
        graphics.fillRect(0, 0, imageWidth, imageHeight);
        
        // Vẽ QR code vào giữa ảnh
        for (int y = 0; y < size; y++) {
            for (int x = 0; x < size; x++) {
                if (bitMatrix.get(x, y)) {
                    graphics.setColor(java.awt.Color.BLACK);
                    graphics.fillRect(x + margin, y + margin, 1, 1);
                }
            }
        }
        
        // Font cho tên hạng vé
        int fontSize = 24;
        java.awt.Font font = new java.awt.Font("Arial", java.awt.Font.BOLD, fontSize);
        graphics.setFont(font);
        graphics.setColor(java.awt.Color.BLACK);
        
        // Vẽ tên hạng vé ở dưới QR code
        // Tính toán vị trí để canh giữa text
        java.awt.FontMetrics metrics = graphics.getFontMetrics(font);
        String displayText = "VÉ: " + ticketType;
        int textWidth = metrics.stringWidth(displayText);
        int textX = (imageWidth - textWidth) / 2;
        int textY = size + 2 * margin + metrics.getAscent(); // Vị trí bên dưới QR code
        
        graphics.drawString(displayText, textX, textY);
        
        // Thêm ID vé ở dưới tên hạng vé với font nhỏ hơn
        int smallerFontSize = 14;
        java.awt.Font smallerFont = new java.awt.Font("Arial", java.awt.Font.PLAIN, smallerFontSize);
        graphics.setFont(smallerFont);
        graphics.setColor(new java.awt.Color(100, 100, 100)); // Màu xám đậm
        
        String idText = "ID: " + data;
        metrics = graphics.getFontMetrics(smallerFont);
        textWidth = metrics.stringWidth(idText);
        textX = (imageWidth - textWidth) / 2;
        textY += metrics.getHeight() + 10; // Thêm khoảng cách từ tên hạng vé
        
        graphics.drawString(idText, textX, textY);
        
        // Giải phóng tài nguyên
        graphics.dispose();
        
        // Chuyển BufferedImage thành byte array
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        javax.imageio.ImageIO.write(image, "PNG", outputStream);
        
        // Trả về ByteArrayResource để có thể đính kèm vào email
        return new ByteArrayResource(outputStream.toByteArray());
    }
      /**
     * Overload của phương thức generatePNGQRCode để duy trì tương thích ngược với mã đã có
     * Giữ lại phương thức này cho trường hợp code cũ vẫn đang gọi
     */
    @SuppressWarnings("unused")  // Suppress warning about unused method
    private ByteArrayResource generatePNGQRCode(String data) throws WriterException, IOException {
        return generatePNGQRCode(data, "Vé Tack Ticket");
    }

    // Giữ lại phương thức cũ để đảm bảo tương thích ngược
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
        
        // Gọi phương thức mới và chỉ trả về phần HTML
        return getPurchaseSuccessTemplateWithAttachments(
                userId, showId, paymentId, userName, eventName, 
                eventDate, eventLocation, ticketItems, totalAmount, ticketUrl)
                .getHtmlContent();
    }
}