import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/commons/components/card';
import { Badge } from '@/commons/components/badge';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface TrendData {
  date: string;
  visitors: number;
}

interface TrendChartProps {
  title: string;
  description: string;
  data: TrendData[];
  dateRange: {
    from: Date;
    to: Date;
  };
}

const TrendChart: React.FC<TrendChartProps> = ({ 
  title, 
  description, 
  data,
  dateRange
}) => {
  return (
    <Card className="md:col-span-5 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-8">
        <div>
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/10 text-primary cursor-default">
            {format(dateRange.from, 'dd/MM/yyyy', { locale: vi })} - {format(dateRange.to, 'dd/MM/yyyy', { locale: vi })}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 0,
              right: 20,
              left: 10,
              bottom: 10,
            }}
          >
            <defs>
              <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false}
              minTickGap={20}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tickFormatter={(value) => value.toLocaleString()}
              tick={{ fontSize: 12 }}
              width={50}
            />
            <RechartsTooltip 
              formatter={(value: number) => [value.toLocaleString(), 'Lượt truy cập']} 
              contentStyle={{ 
                borderRadius: '8px', 
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)', 
                padding: '8px' 
              }}
              cursor={{ stroke: '#8884d8', strokeWidth: 1, strokeDasharray: '4' }}
            />
            <Area 
              type="monotone" 
              dataKey="visitors" 
              stroke="#8884d8" 
              fillOpacity={1}
              fill="url(#colorVisitors)"
              strokeWidth={2}
              activeDot={{ r: 6, fill: '#8884d8', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default TrendChart;
