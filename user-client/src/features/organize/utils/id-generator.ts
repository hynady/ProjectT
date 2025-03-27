/**
 * Utilities for generating consistent temporary IDs across the application
 */

/**
 * Tạo ID duy nhất cho show
 * @returns string ID có định dạng nhất quán
 */
export const generateTempShowId = (): string => {
  const timestamp = Date.now();
  const uniquePart = Math.random().toString(36).substring(2, 8);
  return `temp-show-${timestamp}-${uniquePart}`;
};

/**
 * Tạo ID duy nhất cho ticket
 * @returns string ID có định dạng nhất quán
 */
export const generateTempTicketId = (): string => {
  const timestamp = Date.now();
  const uniquePart = Math.random().toString(36).substring(2, 8);
  return `temp-ticket-${timestamp}-${uniquePart}`;
};

/**
 * Kiểm tra xem ID có đúng định dạng temporary ID không
 * Hữu ích khi cần phân biệt giữa ID tạm và ID thực từ database
 * @param id ID cần kiểm tra
 * @returns boolean
 */
export const isTemporaryId = (id: string | undefined): boolean => {
  if (!id) return false;
  return id.startsWith('temp-');
};

/**
 * Lấy prefix từ ID để xác định loại object
 * @param id ID cần phân tích
 * @returns string loại object ('show', 'ticket', hoặc '')
 */
export const getEntityTypeFromId = (id: string | undefined): string => {
  if (!id || !isTemporaryId(id)) return '';
  
  const parts = id.split('-');
  if (parts.length >= 2) {
    return parts[1]; // 'show' hoặc 'ticket'
  }
  
  return '';
};