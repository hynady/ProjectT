import { parseISO, isAfter } from 'date-fns';
import {TicketDisplay} from "@/app/myticket/components/fragments/TicketList.tsx";

export const isTicketCheckedIn = (ticket: TicketDisplay): boolean => {
  return !!ticket.ticket.checkedInAt;
};

export const isTicketExpired = (ticket: TicketDisplay, currentDate: Date): boolean => {
  const showDateTime = parseISO(`${ticket.show.date}T${ticket.show.time}`);
  return isAfter(currentDate, showDateTime);
};