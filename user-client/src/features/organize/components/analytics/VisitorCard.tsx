import React from 'react';
import { CardContent } from '@/commons/components/card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface VisitorCardProps {
  title: string;
  value: number;
  subtitle?: string;
  trend?: number;
}

const VisitorCard: React.FC<VisitorCardProps> = ({ 
  title, 
  value, 
  subtitle,
  trend
}) => {
  return (
    <CardContent className="p-6">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold">{value.toLocaleString()}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>
      </div>
      {trend !== undefined && (
        <div className="mt-3 flex items-center text-sm">
          <div className={`flex items-center font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {trend >= 0 ? (
              <ArrowUpRight className="h-3 w-3 mr-1" />
            ) : (
              <ArrowDownRight className="h-3 w-3 mr-1" />
            )}
            <span>{Math.abs(trend)}%</span>
          </div>
          <span className="text-muted-foreground ml-1">so với tuần trước</span>
        </div>
      )}
    </CardContent>
  );
};

export default VisitorCard;
