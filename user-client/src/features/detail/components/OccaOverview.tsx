import { Card } from '@/commons/components/card.tsx';
import { Building2 } from 'lucide-react';
import { SlateContentRenderer } from '@/commons/components/rich-text-editor/slate-content-renderer';

interface OccaOverviewProps {
  details: string;
  organizer: string;
}

export const OccaOverview = ({ details, organizer }: OccaOverviewProps) => {
  return (
    <div className="space-y-8">
      <Card className="prose prose-invert max-w-none p-6 transition-colors">
        <SlateContentRenderer content={details} />
      </Card>
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-card-foreground mb-4 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-blue-500"/>
          Nhà tổ chức
        </h2>
        <div className="flex items-center gap-4">
          <div>
            <h3 className="text-primary font-medium">{organizer}</h3>
            <p className="text-muted-foreground text-sm">Đơn vị tổ chức sự kiện</p>
          </div>
        </div>
      </Card>
    </div>
  );
};