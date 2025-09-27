import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { format } from 'date-fns';

interface PassRateTrendData {
  date: string;
  passRate: number;
  passCount: number;
  failCount: number;
  totalCount: number;
}

interface PassRateTrendProps {
  data: PassRateTrendData[];
  onTimeRangeChange?: (range: '24h' | '7d' | '30d' | 'all') => void;
}

export function PassRateTrend({ data, onTimeRangeChange }: PassRateTrendProps) {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('7d');

  const handleTimeRangeChange = (range: '24h' | '7d' | '30d' | 'all') => {
    setTimeRange(range);
    onTimeRangeChange?.(range);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-green-600">Pass Rate: {data.passRate.toFixed(1)}%</p>
          <p className="text-sm text-muted-foreground">Pass: {data.passCount}</p>
          <p className="text-sm text-muted-foreground">Fail: {data.failCount}</p>
          <p className="text-sm text-muted-foreground">Total: {data.totalCount}</p>
        </div>
      );
    }
    return null;
  };

  const isPositiveTrend = () => {
    if (data.length < 2) return true;
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));
    const firstAvg = firstHalf.reduce((sum, d) => sum + d.passRate, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, d) => sum + d.passRate, 0) / secondHalf.length;
    return secondAvg >= firstAvg;
  };

  const trendColor = isPositiveTrend() ? '#10b981' : '#ef4444';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Pass Rate Trend</CardTitle>
            <CardDescription>Track evaluation performance over time</CardDescription>
          </div>
          <div className="flex gap-1">
            <Button
              variant={timeRange === '24h' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleTimeRangeChange('24h')}
            >
              24h
            </Button>
            <Button
              variant={timeRange === '7d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleTimeRangeChange('7d')}
            >
              7d
            </Button>
            <Button
              variant={timeRange === '30d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleTimeRangeChange('30d')}
            >
              30d
            </Button>
            <Button
              variant={timeRange === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleTimeRangeChange('all')}
            >
              All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                className="text-xs"
                tick={{ fill: 'currentColor' }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: 'currentColor' }}
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="passRate" 
                stroke={trendColor}
                strokeWidth={2}
                dot={{ fill: trendColor, r: 4 }}
                activeDot={{ r: 6 }}
                name="Pass Rate (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No data available for the selected time range
          </div>
        )}
      </CardContent>
    </Card>
  );
}