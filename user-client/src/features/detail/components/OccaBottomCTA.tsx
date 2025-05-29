import { Button } from '@/commons/components/button.tsx';
import { OccaShowUnit } from '@/features/detail/internal-types/detail.type';
import { PreviewShowWithPrices } from '@/features/organize/internal-types/preview.type';

interface OccaBottomCTAProps {
  shows: OccaShowUnit[] | PreviewShowWithPrices[];
}

export const OccaBottomCTA = ({ shows }: OccaBottomCTAProps) => {
  // Filter shows that are on sale and have available tickets
  const availableShows = shows.filter(show => {
    const saleStatus = 'saleStatus' in show ? show.saleStatus : 'on_sale'; // Default for preview
    return saleStatus === 'on_sale' && 
      show.prices.some(price => price.available > 0);
  });
  
  const minPrice = availableShows.length > 0 
    ? Math.min(...availableShows.flatMap(show => show.prices.map(p => p.price)))
    : 0;

  const hasAvailableTickets = availableShows.length > 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-muted p-4 lg:hidden">
      <div className="container flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {hasAvailableTickets ? "Giá từ" : "Không có vé"}
          </p>
          <p className="text-xl font-semibold text-primary">
            {hasAvailableTickets 
              ? `${minPrice.toLocaleString('vi-VN')}đ`
              : "Hết vé"
            }
          </p>
        </div>
        <Button size="lg" className="flex-1" disabled={!hasAvailableTickets}>
          {hasAvailableTickets ? "Đặt vé ngay" : "Hết vé"}
        </Button>
      </div>
    </div>
  );
};