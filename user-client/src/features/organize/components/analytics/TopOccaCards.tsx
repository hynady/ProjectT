import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/commons/components/card';
import { Button } from '@/commons/components/button';
import { 
  Search,
  ExternalLink,
} from 'lucide-react';

interface OccaData {
  id: string;
  title: string;
  reach: number;
  revenue?: number;
  fillRate?: number;
}

interface TopOccaCardsProps {
  title: string;
  description: string;
  occas: OccaData[];
  colors: string[];
  onViewDetails: (id: string) => void;
  totalReach?: number;
}

const TopOccaCards: React.FC<TopOccaCardsProps> = ({
  title,
  description,
  occas: occas,
  colors,
  onViewDetails,
  totalReach,
}) => {
  // Show only top 5 events
  const topOccas = occas.slice(0, 5);

  return (
    <Card className="shadow-sm col-span-7">
      <CardHeader className="flex flex-row items-center justify-between pb-5">
        <div>
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {topOccas.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {topOccas.map((occa, index) => (
              <Card key={occa.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="h-2" style={{ backgroundColor: colors[index % colors.length] }}></div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div 
                        className="h-9 w-9 rounded-md flex items-center justify-center"
                        style={{ 
                          backgroundColor: `${colors[index % colors.length]}15`,
                          color: colors[index % colors.length] 
                        }}
                      >
                        {index + 1}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-base truncate" title={occa.title}>
                        {occa.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">ID: {occa.id}</p>
                    </div>                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Lượt tiếp cận</p>
                        <p className="font-medium">{occa.reach.toLocaleString()}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1">
                          <p className="text-xs text-muted-foreground">So với tổng tiếp cận</p>
                        </div>
                        <p className="font-medium">
                          {totalReach ? ((occa.reach / totalReach) * 100).toFixed(1) : '0'}%
                        </p>
                      </div>
                    </div>

                    {occa.revenue !== undefined && (
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Doanh thu</p>
                          <p className="font-medium">{occa.revenue.toLocaleString()} ₫</p>
                        </div>
                        {occa.fillRate !== undefined && (
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Tỉ lệ lấp đầy</p>
                            <p className="font-medium">{occa.fillRate}%</p>
                          </div>
                        )}
                      </div>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => onViewDetails(occa.id)}
                    >
                      <span>Chi tiết</span>
                      <ExternalLink className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">Không tìm thấy sự kiện</h3>
            <p className="text-muted-foreground mt-1">Thử tìm kiếm với từ khóa khác</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TopOccaCards;
