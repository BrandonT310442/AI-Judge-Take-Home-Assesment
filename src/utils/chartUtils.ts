import { format, subDays, startOfDay, isAfter } from 'date-fns';
import type { Evaluation, Judge } from '@/types';

export const chartUtils = {
  groupByDate: (evaluations: Evaluation[], timeRange: '24h' | '7d' | '30d' | 'all' = 'all') => {
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case '24h':
        startDate = subDays(now, 1);
        break;
      case '7d':
        startDate = subDays(now, 7);
        break;
      case '30d':
        startDate = subDays(now, 30);
        break;
      default:
        startDate = new Date(0);
    }
    
    const filteredEvaluations = evaluations.filter(evaluation => 
      isAfter(new Date(evaluation.createdAt), startDate)
    );
    
    const grouped = filteredEvaluations.reduce((acc, evaluation) => {
      const date = format(new Date(evaluation.createdAt), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = { pass: 0, fail: 0, inconclusive: 0 };
      }
      acc[date][evaluation.verdict]++;
      return acc;
    }, {} as Record<string, { pass: number; fail: number; inconclusive: number }>);
    
    const results = Object.entries(grouped)
      .map(([date, counts]) => {
        const total = counts.pass + counts.fail + counts.inconclusive;
        return {
          date: date, // Keep original date for sorting
          displayDate: format(new Date(date), 'MMM dd'),
          passRate: total > 0 ? (counts.pass / total) * 100 : 0,
          passCount: counts.pass,
          failCount: counts.fail,
          totalCount: total
        };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(item => ({
        date: item.displayDate,
        passRate: item.passRate,
        passCount: item.passCount,
        failCount: item.failCount,
        totalCount: item.totalCount
      }));
    
    return results;
  },

  judgeMetrics: (evaluations: Evaluation[], judges: Judge[]) => {
    return judges
      .map(judge => {
        const judgeEvals = evaluations.filter(e => e.judgeId === judge.id);
        const passCount = judgeEvals.filter(e => e.verdict === 'pass').length;
        const totalCount = judgeEvals.length;
        
        return {
          judgeName: judge.name,
          passRate: totalCount > 0 ? (passCount / totalCount) * 100 : 0,
          totalEvaluations: totalCount,
          avgResponseTime: undefined
        };
      })
      .filter(judge => judge.totalEvaluations > 0);
  },

  verdictCounts: (evaluations: Evaluation[]) => {
    const total = evaluations.length;
    
    if (total === 0) {
      return [
        { verdict: 'pass' as const, count: 0, percentage: 0 },
        { verdict: 'fail' as const, count: 0, percentage: 0 },
        { verdict: 'inconclusive' as const, count: 0, percentage: 0 }
      ];
    }
    
    return (['pass', 'fail', 'inconclusive'] as const).map(verdict => {
      const count = evaluations.filter(e => e.verdict === verdict).length;
      return {
        verdict,
        count,
        percentage: (count / total) * 100
      };
    });
  },

  fillMissingDates: (data: any[], days: number) => {
    if (data.length === 0) return [];
    
    const endDate = new Date();
    const startDate = subDays(endDate, days - 1);
    const filledData = [];
    
    for (let d = startDate; d <= endDate; d = new Date(d.getTime() + 86400000)) {
      const dateStr = format(d, 'MMM dd');
      const existing = data.find(item => item.date === dateStr);
      
      if (existing) {
        filledData.push(existing);
      } else {
        filledData.push({
          date: dateStr,
          passRate: 0,
          passCount: 0,
          failCount: 0,
          totalCount: 0
        });
      }
    }
    
    return filledData;
  }
};