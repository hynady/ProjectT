import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/commons/components/card';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface SourceData {
  name: string;
  count: number;
}

interface TrafficSourcesChartProps {
  title: string;
  description: string;
  data: SourceData[];
  colors: string[];
}

const TrafficSourcesChart: React.FC<TrafficSourcesChartProps> = ({ 
  title, 
  description, 
  data,
  colors
}) => {
  const total = data.reduce((sum, source) => sum + source.count, 0);

  return (
    <Card className="md:col-span-2 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                innerRadius={45}
                outerRadius={80}
                paddingAngle={2}
                dataKey="count"
              >
                {data.map((_source, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`${value.toLocaleString()} lượt tiếp cận`, 'Số lượt']}
                contentStyle={{ 
                  borderRadius: '8px', 
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  padding: '8px' 
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2 mt-4">
          {data.map((source, index) => (
            <div key={source.name} className="flex items-center justify-between">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="text-sm">{source.name}</span>
              </div>
              <div className="text-sm font-medium">
                <span>{source.count.toLocaleString()}</span>
                <span className="text-muted-foreground ml-1">({((source.count / total) * 100).toFixed(1)}%)</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TrafficSourcesChart;
