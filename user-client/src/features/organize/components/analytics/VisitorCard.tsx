import React from 'react';
import { CardContent } from '@/commons/components/card';

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
    </CardContent>
  );
};

export default VisitorCard;
