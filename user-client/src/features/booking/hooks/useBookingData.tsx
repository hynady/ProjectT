import { useState, useEffect } from 'react';
import { bookingService } from '../services/booking.service';
import { OccaBookingInfo } from '../internal-types/booking.type';

export const useBookingData = (occaId: string) => {
    const [data, setData] = useState<OccaBookingInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
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
    }, [occaId]);

    return { data, loading, error };
};