import { useState, useEffect } from 'react';
import {OccaShowUnit} from "@/app/bookingpage/components/fragments/ShowSelection.tsx";

// Mock data
const MOCK_OCCA = {
  id: "1",
  title: "LIVE CONCERT 2025 - THE HARMONY",
  location: "Nhà hát Hòa Bình",
  address: "240-242 Đường 3/2, Phường 12, Quận 10, TP.HCM",
  duration: "120 phút",
  shows: [
    {
      date: '2025-01-20',
      time: '19:00',
      prices: [
        { type: 'Hạng VIP', price: '2,000,000₫', available: 50 },
        { type: 'Hạng Thường', price: '1,000,000₫', available: 100 },
        { type: 'Hạng Phổ thông', price: '500,000₫', available: 200 },
      ],
    },
    {
      date: '2025-01-20',
      time: '21:00',
      prices: [
        { type: 'Hạng VIP', price: '2,000,000₫', available: 50 },
        { type: 'Hạng Thường', price: '1,000,000₫', available: 100 },
        { type: 'Hạng Phổ thông', price: '500,000₫', available: 200 },
      ],
    },
    {
      date: '2025-01-21',
      time: '19:00',
      prices: [
        { type: 'Hạng VIP', price: '2,000,000₫', available: 50 },
        { type: 'Hạng Thường', price: '1,000,000₫', available: 100 },
        { type: 'Hạng Phổ thông', price: '500,000₫', available: 200 },
      ],
    },
  ] as OccaShowUnit[],
};

export const useOccaData = (occaId: string) => {
  const [data, setData] = useState<typeof MOCK_OCCA | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setData(MOCK_OCCA);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [occaId]);

  return { data, loading, error };
};