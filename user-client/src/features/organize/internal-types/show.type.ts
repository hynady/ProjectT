import { ShowSaleStatus } from "./organize.type";

export interface ShowInfo {
  id: string;
  date: string;
  time: string;
  saleStatus: ShowSaleStatus;
  tickets: {
    id: string;
    type: string;
    price: number;
    available: number;
    sold?: number;
  }[];
}
