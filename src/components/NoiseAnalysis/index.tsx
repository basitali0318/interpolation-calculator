import { useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { getRawForwardDifferences } from '../../algorithms/differenceTable';

export default function NoiseAnalysis() {
  const { state } = useAppContext();
  const { points, queryX } = state;

  const analysis = useMemo(() => {
    if (points.length < 3) return null;

    const differences = getRawForwardDifferences(points);
    const n = points.length;

    // Calculate statistics for each order
    const orderStats: Array<{
      order: number;
      label: string;
      values: number[];
      mean: number;
      variance: number;
      stdDev: number;
      range: number;
      noiseRatio: number;
      usability: 'excellent' | 'good' | 'marginal' | 'unreliable' | 'unusable';
    }> = [];

    // Original values (order 0)
    const yValues = differences[0];
    const yMean = yValues.reduce((a, b) => a + b, 0) / yValues.length;
    const yVariance = yValues.reduce((sum, v) => sum + Math.pow(v - yMean, 2), 0) / yValues.length;
    const yStdDev = Math.sqrt(yVariance);
    const yRange = Math.max(...yValues) - Math.min(...yValues);

    orderStats.push({
      order: 0,
      label: 'Original (y)',
      values: yValues,
      mean: yMean,
      variance: yVariance,
      stdDev: yStdDev,
      range: yRange,
      noiseRatio: 0,
      usability: 'excellent'
    });

    // Calculate for each difference order
    for (let order = 1; order < Math.min(n, 5); order++) {
      if (!differences[order] || differences[order].length === 0) continue;

      const vals = differences[order].filter(v => v !== undefined);
      if (vals.length === 0) continue;

      const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
      const absVals = vals.map(v => Math.abs(v));
      const avgAbsVal = absVals.reduce((a, b) => a + b, 0) / absVals.length;
      const variance = vals.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / vals.length;
      const stdDev = Math.sqrt(variance);
      const range = Math.max(...vals) - Math.min(...vals);

      // Noise ratio: how much the std dev has grown relative to the signal
      // Compare std dev of this order to the original range
      const noiseRatio = yRange > 0 ? (stdDev / yRange) * 100 : 0;

      // Determine usability based on noise characteristics
      let usability: 'excellent' | 'good' | 'marginal' | 'unreliable' | 'unusable';
      if (order === 1) {
        usability = noiseRatio < 50 ? 'excellent' : noiseRatio < 100 ? 'good' : 'marginal';
      } else if (order === 2) {
        usability = noiseRatio < 30 ? 'good' : noiseRatio < 80 ? 'marginal' : 'unreliable';
      } else if (order === 3) {
        usability = noiseRatio < 20 ? 'marginal' : noiseRatio < 60 ? 'unreliable' : 'unusable';
      } else {
        usability = noiseRatio < 10 ? 'unreliable' : 'unusable';
      }

      const labels = ['1st Order (Δy)', '2nd Order (Δ²y)', '3rd Order (Δ³y)', '4th Order (Δ⁴y)'];
      
      orderStats.push({
        order,
        label: labels[order - 1] || `Order ${order}`,
        values: vals,
        mean,
        variance,
        stdDev,
        range,
        noiseRatio,
        usability
      });
    }

    // Calculate overall noise level
    const firstOrderNoise = orderStats.find(s => s.order === 1)?.noiseRatio || 0;
    const secondOrderNoise = orderStats.find(s => s.order === 2)?.noiseRatio || 0;
    
    let overallNoiseLevel: 'low' | 'moderate' | 'high' | 'very-high';
    if (firstOrderNoise < 20 && secondOrderNoise < 40) {
      overallNoiseLevel = 'low';
    } else if (firstOrderNoise < 50 && secondOrderNoise < 80) {
      overallNoiseLevel = 'moderate';
    } else if (firstOrderNoise < 100) {
      overallNoiseLevel = 'high';
    } else {
      overallNoiseLevel = 'very-high';
    }

    // Determine max recommended order
    const maxRecommendedOrder = orderStats.reduce((max, stat) => {
      if (stat.order > 0 && (stat.usability === 'excellent' || stat.usability === 'good' || stat.usability === 'marginal')) {
        return Math.max(max, stat.order);
      }
      return max;
    }, 1);

    return {
      orderStats,
      overallNoiseLevel,
      maxRecommendedOrder,
      dataPoints: points.length
    };
  }, [points]);

  if (!analysis || points.length < 3) {
    return null;
  }

  const getUsabilityBadge = (usability: string) => {
    const styles: Record<string, string> = {
      'excellent': 'bg-green-100 text-green-800 border-green-300',
      'good': 'bg-blue-100 text-blue-800 border-blue-300',
      'marginal': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'unreliable': 'bg-orange-100 text-orange-800 border-orange-300',
      'unusable': 'bg-red-100 text-red-800 border-red-300'
    };
    const icons: Record<string, string> = {
      'excellent': '✓',
      'good': '✓',
      'marginal': '⚠',
      'unreliable': '✗',
      'unusable': '✗'
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded border ${styles[usability]}`}>
        {icons[usability]} {usability.charAt(0).toUpperCase() + usability.slice(1)}
      </span>
    );
  };

  const getNoiseLevelInfo = (level: string) => {
    const info: Record<string, { color: string; icon: string; recommendation: string }> = {
      'low': {
        color: 'bg-green-50 border-green-200 text-green-800',
        icon: '🟢',
        recommendation: 'All interpolation methods should work well. You can use up to 4th-5th order differences.'
      },
      'moderate': {
        color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        icon: '🟡',
        recommendation: 'Use Stirling or Bessel formulas. Limit to 2nd-3rd order differences for best results.'
      },
      'high': {
        color: 'bg-orange-50 border-orange-200 text-orange-800',
        icon: '🟠',
        recommendation: 'Prefer Everett formula for smoothing. Use only 2nd order differences or lower.'
      },
      'very-high': {
        color: 'bg-red-50 border-red-200 text-red-800',
        icon: '🔴',
        recommendation: 'Data is very noisy. Consider linear interpolation only (1st order) or data smoothing preprocessing.'
      }
    };
    return info[level] || info['moderate'];
  };

  const noiseInfo = getNoiseLevelInfo(analysis.overallNoiseLevel);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">📊</span>
        <h2 className="text-2xl font-bold text-gray-800">Noise Analysis</h2>
      </div>

      {/* Overall Noise Level */}
      <div className={`p-4 rounded-lg border mb-6 ${noiseInfo.color}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">{noiseInfo.icon}</span>
          <span className="font-bold text-lg">
            {analysis.overallNoiseLevel.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Noise Level
          </span>
        </div>
        <p className="text-sm">{noiseInfo.recommendation}</p>
        <div className="mt-2 text-xs opacity-75">
          Maximum recommended order: <strong>{analysis.maxRecommendedOrder}</strong>
        </div>
      </div>

      {/* Difference Order Analysis Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left font-medium text-gray-700">Difference Order</th>
              <th className="p-3 text-left font-medium text-gray-700">Std Dev</th>
              <th className="p-3 text-left font-medium text-gray-700">Range</th>
              <th className="p-3 text-left font-medium text-gray-700">Noise %</th>
              <th className="p-3 text-left font-medium text-gray-700">Usability</th>
            </tr>
          </thead>
          <tbody>
            {analysis.orderStats.map((stat, idx) => (
              <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-3 font-medium">{stat.label}</td>
                <td className="p-3 font-mono text-gray-600">
                  {stat.order === 0 ? '-' : stat.stdDev.toFixed(4)}
                </td>
                <td className="p-3 font-mono text-gray-600">
                  {stat.range.toFixed(4)}
                </td>
                <td className="p-3 font-mono text-gray-600">
                  {stat.order === 0 ? '-' : `${stat.noiseRatio.toFixed(1)}%`}
                </td>
                <td className="p-3">
                  {getUsabilityBadge(stat.usability)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Visual noise amplification bar */}
      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Noise Amplification Visualization</h3>
        <div className="space-y-2">
          {analysis.orderStats.filter(s => s.order > 0).map((stat, idx) => {
            const maxNoise = Math.max(...analysis.orderStats.filter(s => s.order > 0).map(s => s.noiseRatio));
            const width = maxNoise > 0 ? (stat.noiseRatio / maxNoise) * 100 : 0;
            const colors = ['bg-green-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500'];
            
            return (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-24 text-xs text-gray-600 text-right">{stat.label}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${colors[Math.min(idx, colors.length - 1)]}`}
                    style={{ width: `${Math.min(width, 100)}%` }}
                  />
                </div>
                <div className="w-16 text-xs text-gray-600">{stat.noiseRatio.toFixed(1)}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Educational note */}
      <div className="mt-6 p-4 bg-teal-50 rounded-lg border border-teal-200">
        <h3 className="text-sm font-bold text-teal-800 mb-2">📚 Key Insight: Noise Amplification</h3>
        <p className="text-xs text-teal-700">
          Noise amplifies exponentially in higher-order differences. While 1st differences typically 
          remain usable, by 3rd-4th order the noise often dominates the actual signal. This is why 
          <strong> Everett's formula</strong> (using only even-order differences) often provides 
          better smoothing for noisy real-world data.
        </p>
      </div>
    </div>
  );
}

