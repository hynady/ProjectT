import { TicketRevenueByClass } from "../../internal-types/ticket.type";
import { OccaFormData, ShowResponse, ShowSaleStatus } from "../../internal-types/organize.type";
import { Badge } from "@/commons/components/badge";
import React from "react";

// Type for props shared across components
export interface TicketManagementSharedProps {
  occaInfo: OccaFormData | null;
  showInfo: ShowResponse | null;
  totalSoldTickets: number;
  revenueByClass: TicketRevenueByClass[];
}

// Utility functions
export const formatShowDateTime = (date?: string, time?: string) => {
  if (!date) return "";
  try {
    const dateObj = new Date(date);
    const dateStr = dateObj.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    return time ? `${dateStr} ${time}` : dateStr;
  } catch {
    return date;
  }
};

// Statistics calculations
export const getTotalTickets = (showInfo: ShowResponse | null): number => {
  if (!showInfo) return 0;
  return showInfo.tickets.reduce((sum, ticket) => sum + ticket.available, 0);
};

export const getTotalSoldTickets = (showInfo: ShowResponse | null, totalSoldTickets: number): number => {
  // Sử dụng totalSoldTickets từ API nếu có
  if (totalSoldTickets > 0) return totalSoldTickets;
  
  // Fallback: sử dụng sold từ showInfo
  if (!showInfo) return 0;
  return showInfo.tickets.reduce((sum, ticket) => sum + (ticket.sold || 0), 0);
};

export const getSoldPercentage = (showInfo: ShowResponse | null, totalSoldTickets: number): number => {
  const total = getTotalTickets(showInfo);
  if (total === 0) return 0;
  return Math.round((getTotalSoldTickets(showInfo, totalSoldTickets) / total) * 100);
};

export const getTotalRevenue = (showInfo: ShowResponse | null, revenueByClass: TicketRevenueByClass[]): number => {
  // Sử dụng revenueByTicketClass nếu có
  if (revenueByClass.length > 0) {
    return revenueByClass.reduce((sum, item) => sum + item.totalRevenue, 0);
  }
  
  // Fallback: sử dụng cách tính cũ
  if (!showInfo) return 0;
  return showInfo.tickets.reduce(
    (sum, ticket) => sum + (ticket.price * (ticket.sold || 0)), 
    0
  );
};

// UI helpers
export const getShowSaleStatusBadge = (status?: ShowSaleStatus) => {
  if (!status) return null;
  
  switch (status) {
    case 'on_sale':
      return React.createElement(Badge, { variant: "success" }, "Đang bán");
    case 'sold_out':
      return React.createElement(Badge, { variant: "destructive" }, "Đã bán hết");
    case 'upcoming':
      return React.createElement(Badge, { variant: "warning" }, "Sắp mở bán");
    case 'ended':
      return React.createElement(Badge, { variant: "outline" }, "Đã kết thúc");
    default:
      return React.createElement(Badge, { variant: "secondary" }, status);
  }
};
