import { useState, useEffect } from 'react';
import { bookingService } from '../services/booking.service';
import { OccaBookingInfo } from '../internal-types/booking.type';

export const useBookingData = (occaId: string, shouldFetch: boolean = true) => {
    const [data, setData] = useState<OccaBookingInfo | null>(null);
    const [loading, setLoading] = useState(shouldFetch);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!shouldFetch) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                const bookingInfo = await bookingService.getOccaBookingInfo(occaId);
                setData(bookingInfo);
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [occaId, shouldFetch]);

    return { data, loading, error, setData };
};