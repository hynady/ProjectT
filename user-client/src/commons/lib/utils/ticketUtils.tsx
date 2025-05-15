import { parseISO, isAfter } from 'date-fns';
import { TicketDisplayUnit } from "@/features/my-ticket/internal-types/ticket.type";

/**
 * Check if a ticket has been checked in
 */
export const isTicketCheckedIn = (ticket: TicketDisplayUnit): boolean => {
  return !!ticket.ticket.checkedInAt;
};

/**
 * Check if a ticket is expired (show date has passed)
 */
export const isTicketExpired = (ticket: TicketDisplayUnit, currentDate: Date): boolean => {
  const showDate = parseISO(`${ticket.show.date}T${ticket.show.time}`);
  return isAfter(currentDate, showDate);
};

/**
 * Get ticket status text for display
 */
export const getTicketStatusText = (ticket: TicketDisplayUnit, currentDate: Date): string => {
  if (isTicketCheckedIn(ticket)) {
    return 'Đã check-in';
  } 
  
  if (isTicketExpired(ticket, currentDate)) {
    return 'Hết hạn';
  }
  
  return 'Hoạt động';
};