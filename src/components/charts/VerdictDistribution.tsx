import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface VerdictDistributionData {
  verdict: 'pass' | 'fail' | 'inconclusive';
  count: number;
  percentage: number;
}

interface VerdictDistributionProps {
  data: VerdictDistributionData[];
  onSegmentClick?: (verdict: string) => void;
}

const COLORS = {
  pass: '#10b981',
  fail: '#ef4444',
  inconclusive: '#6b7280'
};

export function VerdictDistribution({ data, onSegmentClick }: VerdictDistributionProps) {
  const totalCount = data.reduce((sum, d) => sum + d.count, 0);
  const passRate = data.find(d => d.verdict === 'pass')?.percentage || 0;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium capitalize">{data.verdict}</p>
          <p className="text-sm">Count: {data.count}</p>
          <p className="text-sm">Percentage: {data.percentage.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ cx, cy, viewBox }: any) => {
    // Use viewBox dimensions if available, otherwise fallback to cx/cy
    const centerX = viewBox?.cx || cx;
    const centerY = viewBox?.cy || cy;
    
    return (
      <g>
        <text 
          x={centerX} 
          y={centerY - 10} 
          fill="currentColor" 
          textAnchor="middle" 
          dominantBaseline="middle"
          className="font-bold"
          style={{ fontSize: '24px', pointerEvents: 'none' }}
        >
          {passRate.toFixed(0)}%
        </text>
        <text 
          x={centerX} 
          y={centerY + 10} 
          fill="currentColor" 
          textAnchor="middle" 
          dominantBaseline="middle"
          className="fill-muted-foreground"
          style={{ fontSize: '12px', pointerEvents: 'none' }}
        >
          Pass Rate
        </text>
      </g>
    );
  };

  const handleClick = (data: any) => {
    if (onSegmentClick && data) {
      onSegmentClick(data.verdict);
    }
  };

  const CustomLegend = () => {
    return (
      <div className="flex justify-center gap-4 mt-4">
        {data.map((entry) => (
          <div key={entry.verdict} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded"
              style={{ backgroundColor: COLORS[entry.verdict] }}
            />
            <span className="text-sm capitalize">
              {entry.verdict} ({entry.percentage.toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verdict Distribution</CardTitle>
        <CardDescription>Overall evaluation outcomes</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 && totalCount > 0 ? (
          <>
            <div className="relative">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="count"
                    onClick={handleClick}
                    style={{ cursor: onSegmentClick ? 'pointer' : 'default' }}
                    isAnimationActive={false}
                  >
                    {data.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[entry.verdict]}
                        className="hover:opacity-80 transition-opacity"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Overlay the percentage text as absolute positioned element */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <div className="text-2xl font-bold">{passRate.toFixed(0)}%</div>
                  <div className="text-xs text-muted-foreground">Pass Rate</div>
                </div>
              </div>
            </div>
            <CustomLegend />
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Total Evaluations</span>
                <span className="font-semibold">{totalCount}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No evaluation data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}