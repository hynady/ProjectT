import { Card } from '@/components/ui/card';
import { Users } from 'lucide-react';
import MarkdownContent from '@/components/global/MarkdownRenderer';

interface OccaOverviewProps {
  details: string;
  organizer: string;
}

export const OccaOverview = ({ details, organizer }: OccaOverviewProps) => {
  return (
    <div className="space-y-8">
      <Card className="prose prose-invert max-w-none p-6 transition-colors">
        <MarkdownContent content={details}/>
      </Card>
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-card-foreground mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-500"/>
          Nhà tổ chức
        </h2>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-muted rounded-lg"/>
          <div>
            <h3 className="text-primary font-medium">{organizer}</h3>
            <p className="text-muted-foreground text-sm">Đơn vị tổ chức sự kiện</p>
          </div>
        </div>
      </Card>
    </div>
  );
};