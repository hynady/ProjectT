import { Button } from '@/commons/components/button.tsx';
import {OccaShowUnit} from "@/features/detail/components/OccaShowSelection.tsx";

interface OccaBottomCTAProps {
  shows: OccaShowUnit[];
}

export const OccaBottomCTA = ({ shows }: OccaBottomCTAProps) => {
  const minPrice = Math.min(...shows.flatMap(show => show.prices.map(p => p.price)));

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-muted p-4 lg:hidden">
      <div className="container flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Giá từ</p>
          <p className="text-xl font-semibold text-primary">
            {minPrice.toLocaleString('vi-VN')}đ
          </p>
        </div>
        <Button size="lg" className="flex-1">
          Đặt vé ngay
        </Button>
      </div>
    </div>
  );
};