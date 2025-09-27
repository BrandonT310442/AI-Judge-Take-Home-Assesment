import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface JudgePerformanceData {
  judgeName: string;
  passRate: number;
  totalEvaluations: number;
  avgResponseTime?: number;
}

interface JudgePerformanceProps {
  data: JudgePerformanceData[];
  onJudgeClick?: (judgeName: string) => void;
}

export function JudgePerformance({ data, onJudgeClick }: JudgePerformanceProps) {
  const [sortBy, setSortBy] = useState<'passRate' | 'volume' | 'name'>('passRate');
  const [showInactive, setShowInactive] = useState(true);

  const getBarColor = (passRate: number) => {
    if (passRate >= 70) return '#10b981';
    if (passRate >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const sortedData = [...data].sort((a, b) => {
    switch (sortBy) {
      case 'passRate':
        return b.passRate - a.passRate;
      case 'volume':
        return b.totalEvaluations - a.totalEvaluations;
      case 'name':
        return a.judgeName.localeCompare(b.judgeName);
      default:
        return 0;
    }
  });

  const averagePassRate = data.length > 0
    ? data.reduce((sum, d) => sum + d.passRate, 0) / data.length
    : 0;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.judgeName}</p>
          <p className="text-sm">Pass Rate: {data.passRate.toFixed(1)}%</p>
          <p className="text-sm text-muted-foreground">Total Evaluations: {data.totalEvaluations}</p>
          {data.avgResponseTime && (
            <p className="text-sm text-muted-foreground">Avg Response Time: {data.avgResponseTime}ms</p>
          )}
        </div>
      );
    }
    return null;
  };

  const handleBarClick = (data: any) => {
    if (onJudgeClick && data) {
      onJudgeClick(data.judgeName);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Judge Performance Comparison</CardTitle>
            <CardDescription>Compare effectiveness across all judges</CardDescription>
          </div>
          <div className="flex gap-2">
            <div className="flex gap-1">
              <Button
                variant={sortBy === 'passRate' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('passRate')}
              >
                Pass Rate
              </Button>
              <Button
                variant={sortBy === 'volume' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('volume')}
              >
                Volume
              </Button>
              <Button
                variant={sortBy === 'name' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('name')}
              >
                Name
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {sortedData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={sortedData} 
              layout="horizontal"
              margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                type="number"
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tick={{ fill: 'currentColor', fontSize: 12 }}
              />
              <YAxis 
                type="category"
                dataKey="judgeName" 
                tick={{ fill: 'currentColor', fontSize: 12 }}
                width={70}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine 
                x={averagePassRate} 
                stroke="#6b7280" 
                strokeDasharray="5 5"
                label={{ value: "Average", position: "top", fontSize: 10 }}
              />
              <Bar 
                dataKey="passRate"
                fill="#3b82f6"
                onClick={handleBarClick}
                style={{ cursor: onJudgeClick ? 'pointer' : 'default' }}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No judge performance data available
          </div>
        )}
        {sortedData.length > 0 && (
          <div className="mt-4 flex items-center justify-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded" />
              <span>Good (&gt;70%)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded" />
              <span>Average (40-70%)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded" />
              <span>Poor (&lt;40%)</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}