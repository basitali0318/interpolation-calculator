import { useMemo, useState } from 'react';
// @ts-expect-error react-plotly.js has no type declarations
import Plot from 'react-plotly.js';
import { useAppContext } from '../../context/AppContext';
import { Point } from '../../types/interpolation';
import { getRawForwardDifferences, getRawBackwardDifferences } from '../../algorithms/differenceTable';
import { factorial } from '../../utils/mathHelpers';

interface SmoothingMetrics {
  method: string;
  smoothingLevel: 'low' | 'moderate' | 'high';
  varianceReduction: number;
  maxDeviation: number;
  avgDeviation: number;
  color: string;
  curvePoints: { x: number; y: number }[];
}

// Simplified interpolation evaluators for curve generation
function evaluateForward(points: Point[], x: number, h: number): number {
  const n = points.length;
  const x0 = points[0].x;
  const u = (x - x0) / h;
  const diffTable = getRawForwardDifferences(points);
  
  let result = points[0].y;
  for (let i = 1; i < n; i++) {
    if (diffTable[i] && diffTable[i][0] !== undefined) {
      let uProduct = u;
      for (let j = 1; j < i; j++) {
        uProduct *= (u - j);
      }
      result += (uProduct / factorial(i)) * diffTable[i][0];
    }
  }
  return result;
}

function evaluateBackward(points: Point[], x: number, h: number): number {
  const n = points.length;
  const xn = points[n - 1].x;
  const u = (x - xn) / h;
  const diffTable = getRawBackwardDifferences(points);
  
  let result = points[n - 1].y;
  for (let i = 1; i < n; i++) {
    if (diffTable[i] && diffTable[i][n - 1] !== undefined) {
      let uProduct = u;
      for (let j = 1; j < i; j++) {
        uProduct *= (u + j);
      }
      result += (uProduct / factorial(i)) * diffTable[i][n - 1];
    }
  }
  return result;
}

function evaluateStirling(points: Point[], x: number, h: number): number {
  const n = points.length;
  const midIndex = Math.floor(n / 2);
  const x0 = points[midIndex].x;
  const u = (x - x0) / h;
  
  const fwdDiff = getRawForwardDifferences(points);
  
  let result = points[midIndex].y;
  
  // First order: u * (delta_-1 + delta_0) / 2
  if (fwdDiff[1] && midIndex > 0 && midIndex < n) {
    const avgDelta1 = (fwdDiff[1][midIndex - 1] + fwdDiff[1][midIndex]) / 2;
    result += u * avgDelta1;
  }
  
  // Second order: u^2/2! * delta^2_-1
  if (fwdDiff[2] && midIndex > 0) {
    result += (u * u / 2) * fwdDiff[2][midIndex - 1];
  }
  
  // Third order
  if (fwdDiff[3] && midIndex > 1 && midIndex < n - 1) {
    const avgDelta3 = (fwdDiff[3][midIndex - 2] + fwdDiff[3][midIndex - 1]) / 2;
    result += (u * (u * u - 1) / 6) * avgDelta3;
  }
  
  // Fourth order
  if (fwdDiff[4] && midIndex > 1) {
    result += (u * u * (u * u - 1) / 24) * fwdDiff[4][midIndex - 2];
  }
  
  return result;
}

function evaluateBessel(points: Point[], x: number, h: number): number {
  const n = points.length;
  const midIndex = Math.floor((n - 1) / 2);
  const x0 = (points[midIndex].x + points[midIndex + 1].x) / 2;
  const u = (x - x0) / h;
  
  const fwdDiff = getRawForwardDifferences(points);
  
  // Average of y values around center
  let result = (points[midIndex].y + points[midIndex + 1].y) / 2;
  
  // First order term
  if (fwdDiff[1] && midIndex < n - 1) {
    result += (u - 0.5) * fwdDiff[1][midIndex];
  }
  
  // Second order term
  if (fwdDiff[2] && midIndex > 0 && midIndex < n - 1) {
    const avgDelta2 = (fwdDiff[2][midIndex - 1] + fwdDiff[2][midIndex]) / 2;
    result += (u * (u - 1) / 2) * avgDelta2;
  }
  
  // Third order term
  if (fwdDiff[3] && midIndex > 0 && midIndex < n - 2) {
    result += (u * (u - 1) * (u - 0.5) / 6) * fwdDiff[3][midIndex - 1];
  }
  
  return result;
}

function evaluateEverett(points: Point[], x: number, h: number): number {
  const n = points.length;
  const midIndex = Math.floor((n - 1) / 2);
  const x0 = points[midIndex].x;
  const u = (x - x0) / h;
  const w = 1 - u;
  
  const fwdDiff = getRawForwardDifferences(points);
  
  // Everett uses only even-order differences - provides best smoothing
  let result = w * points[midIndex].y + u * points[midIndex + 1].y;
  
  // Second order terms
  if (fwdDiff[2] && midIndex > 0 && midIndex < n - 1) {
    const E2_0 = fwdDiff[2][midIndex - 1] || 0;
    const E2_1 = fwdDiff[2][midIndex] || 0;
    result += (u * (u - 1) * (u + 1) / 6) * E2_0;
    result += (w * (w - 1) * (w + 1) / 6) * E2_1;
  }
  
  // Fourth order terms
  if (fwdDiff[4] && midIndex > 1 && midIndex < n - 2) {
    const E4_0 = fwdDiff[4][midIndex - 2] || 0;
    const E4_1 = fwdDiff[4][midIndex - 1] || 0;
    result += (u * (u * u - 1) * (u * u - 4) / 120) * E4_0;
    result += (w * (w * w - 1) * (w * w - 4) / 120) * E4_1;
  }
  
  return result;
}

function evaluateGaussianForward(points: Point[], x: number, h: number): number {
  const n = points.length;
  const midIndex = Math.floor(n / 2);
  const x0 = points[midIndex].x;
  const u = (x - x0) / h;
  
  const fwdDiff = getRawForwardDifferences(points);
  
  let result = points[midIndex].y;
  
  // First order
  if (fwdDiff[1] && midIndex < n - 1) {
    result += u * fwdDiff[1][midIndex];
  }
  
  // Second order
  if (fwdDiff[2] && midIndex > 0) {
    result += (u * (u - 1) / 2) * fwdDiff[2][midIndex - 1];
  }
  
  // Third order
  if (fwdDiff[3] && midIndex > 0 && midIndex < n - 2) {
    result += (u * (u - 1) * (u + 1) / 6) * fwdDiff[3][midIndex - 1];
  }
  
  return result;
}

function evaluateGaussianBackward(points: Point[], x: number, h: number): number {
  const n = points.length;
  const midIndex = Math.floor(n / 2);
  const x0 = points[midIndex].x;
  const u = (x - x0) / h;
  
  const fwdDiff = getRawForwardDifferences(points);
  
  let result = points[midIndex].y;
  
  // First order (backward)
  if (fwdDiff[1] && midIndex > 0) {
    result += u * fwdDiff[1][midIndex - 1];
  }
  
  // Second order
  if (fwdDiff[2] && midIndex > 0 && midIndex < n - 1) {
    result += (u * (u + 1) / 2) * fwdDiff[2][midIndex - 1];
  }
  
  // Third order
  if (fwdDiff[3] && midIndex > 1) {
    result += (u * (u + 1) * (u - 1) / 6) * fwdDiff[3][midIndex - 2];
  }
  
  return result;
}

export default function SmoothingAnalysis() {
  const { state } = useAppContext();
  const { points, results, stepSize } = state;
  const [selectedMethods, setSelectedMethods] = useState<string[]>(['all']);
  const [viewMode, setViewMode] = useState<'overlay' | 'sideBySide'>('overlay');

  const smoothingData = useMemo((): SmoothingMetrics[] => {
    if (points.length < 3 || !stepSize || results.length === 0) return [];

    const h = stepSize;
    const xMin = points[0].x;
    const xMax = points[points.length - 1].x;
    const numCurvePoints = 50;
    const xStep = (xMax - xMin) / (numCurvePoints - 1);

    const methods: { name: string; evaluate: (p: Point[], x: number, h: number) => number; level: 'low' | 'moderate' | 'high'; color: string }[] = [
      { name: 'Newton Forward', evaluate: evaluateForward, level: 'low', color: '#f59e0b' },
      { name: 'Newton Backward', evaluate: evaluateBackward, level: 'low', color: '#ef4444' },
      { name: 'Stirling', evaluate: evaluateStirling, level: 'moderate', color: '#8b5cf6' },
      { name: 'Bessel', evaluate: evaluateBessel, level: 'moderate', color: '#3b82f6' },
      { name: 'Everett', evaluate: evaluateEverett, level: 'high', color: '#10b981' },
      { name: 'Gaussian Forward', evaluate: evaluateGaussianForward, level: 'moderate', color: '#ec4899' },
      { name: 'Gaussian Backward', evaluate: evaluateGaussianBackward, level: 'moderate', color: '#14b8a6' },
    ];

    const metricsArray: SmoothingMetrics[] = [];

    // Calculate original data variance
    const yValues = points.map(p => p.y);
    const yMean = yValues.reduce((a, b) => a + b, 0) / yValues.length;
    const originalVariance = yValues.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0) / yValues.length;

    for (const method of methods) {
      const curvePoints: { x: number; y: number }[] = [];
      const interpolatedAtData: number[] = [];

      // Generate curve points
      for (let i = 0; i < numCurvePoints; i++) {
        const x = xMin + i * xStep;
        try {
          const y = method.evaluate(points, x, h);
          if (isFinite(y) && !isNaN(y)) {
            curvePoints.push({ x, y });
          }
        } catch {
          // Skip problematic points
        }
      }

      // Calculate interpolated values at original x points
      for (const point of points) {
        try {
          const y = method.evaluate(points, point.x, h);
          if (isFinite(y) && !isNaN(y)) {
            interpolatedAtData.push(y);
          }
        } catch {
          interpolatedAtData.push(point.y);
        }
      }

      // Calculate metrics
      if (curvePoints.length > 0 && interpolatedAtData.length === points.length) {
        const curveMean = interpolatedAtData.reduce((a, b) => a + b, 0) / interpolatedAtData.length;
        const curveVariance = interpolatedAtData.reduce((sum, y) => sum + Math.pow(y - curveMean, 2), 0) / interpolatedAtData.length;
        
        const varianceReduction = originalVariance > 0 
          ? ((originalVariance - curveVariance) / originalVariance) * 100 
          : 0;

        const deviations = points.map((p, i) => Math.abs(p.y - interpolatedAtData[i]));
        const maxDeviation = Math.max(...deviations);
        const avgDeviation = deviations.reduce((a, b) => a + b, 0) / deviations.length;

        metricsArray.push({
          method: method.name,
          smoothingLevel: method.level,
          varianceReduction,
          maxDeviation,
          avgDeviation,
          color: method.color,
          curvePoints
        });
      }
    }

    return metricsArray;
  }, [points, results, stepSize]);

  if (points.length < 3 || results.length === 0) {
    return null;
  }

  const toggleMethod = (methodName: string) => {
    if (methodName === 'all') {
      setSelectedMethods(['all']);
    } else {
      const newSelection = selectedMethods.filter(m => m !== 'all');
      if (newSelection.includes(methodName)) {
        const filtered = newSelection.filter(m => m !== methodName);
        setSelectedMethods(filtered.length === 0 ? ['all'] : filtered);
      } else {
        setSelectedMethods([...newSelection, methodName]);
      }
    }
  };

  const visibleMethods = selectedMethods.includes('all') 
    ? smoothingData 
    : smoothingData.filter(m => selectedMethods.includes(m.method));

  // Generate plot data
  const plotData: any[] = [
    // Original data points
    {
      x: points.map(p => p.x),
      y: points.map(p => p.y),
      mode: 'markers',
      type: 'scatter',
      name: 'Original Data',
      marker: {
        size: 12,
        color: '#1f2937',
        symbol: 'circle',
        line: { color: 'white', width: 2 }
      }
    }
  ];

  // Add curves for each visible method
  for (const methodData of visibleMethods) {
    if (methodData.curvePoints.length > 0) {
      plotData.push({
        x: methodData.curvePoints.map(p => p.x),
        y: methodData.curvePoints.map(p => p.y),
        mode: 'lines',
        type: 'scatter',
        name: methodData.method,
        line: {
          color: methodData.color,
          width: 3,
          shape: 'spline'
        }
      });
    }
  }

  const getLevelBadge = (level: 'low' | 'moderate' | 'high') => {
    const styles = {
      low: 'bg-amber-100 text-amber-800 border-amber-300',
      moderate: 'bg-blue-100 text-blue-800 border-blue-300',
      high: 'bg-emerald-100 text-emerald-800 border-emerald-300'
    };
    const labels = {
      low: '🔶 Low',
      moderate: '🔷 Moderate',
      high: '🟢 High'
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded border ${styles[level]}`}>
        {labels[level]}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-3xl">📊</span> Smoothing Behavior Analysis
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Compare how different methods smooth the interpolation curve
          </p>
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('overlay')}
            className={`px-3 py-1.5 text-sm font-medium rounded transition-all ${
              viewMode === 'overlay' 
                ? 'bg-teal-600 text-white shadow' 
                : 'text-stone-600 hover:bg-stone-200'
            }`}
          >
            Overlay
          </button>
          <button
            onClick={() => setViewMode('sideBySide')}
            className={`px-3 py-1.5 text-sm font-medium rounded transition-all ${
              viewMode === 'sideBySide' 
                ? 'bg-teal-600 text-white shadow' 
                : 'text-stone-600 hover:bg-stone-200'
            }`}
          >
            Side by Side
          </button>
        </div>
      </div>

      {/* Method Filter */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => toggleMethod('all')}
          className={`px-3 py-1.5 text-sm font-medium rounded-full border-2 transition-all ${
            selectedMethods.includes('all')
              ? 'bg-stone-800 text-white border-stone-800'
              : 'bg-white text-stone-600 border-stone-300 hover:border-stone-500'
          }`}
        >
          All Methods
        </button>
        {smoothingData.map(m => (
          <button
            key={m.method}
            onClick={() => toggleMethod(m.method)}
            className={`px-3 py-1.5 text-sm font-medium rounded-full border-2 transition-all flex items-center gap-1.5`}
            style={{
              backgroundColor: selectedMethods.includes(m.method) || selectedMethods.includes('all') ? m.color : 'white',
              color: selectedMethods.includes(m.method) || selectedMethods.includes('all') ? 'white' : m.color,
              borderColor: m.color
            }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedMethods.includes(m.method) || selectedMethods.includes('all') ? 'white' : m.color }}></span>
            {m.method}
          </button>
        ))}
      </div>

      {/* Visualization */}
      {viewMode === 'overlay' ? (
        <div className="bg-gradient-to-br from-stone-50 to-stone-100 rounded-xl p-4 mb-6">
          <Plot
            data={plotData}
            layout={{
              title: {
                text: 'Interpolation Curves Comparison',
                font: { size: 14, color: '#374151' },
                x: 0.02,
                xanchor: 'left'
              },
              xaxis: {
                title: 'x',
                gridcolor: '#e5e7eb',
                zeroline: true,
                zerolinecolor: '#9ca3af'
              },
              yaxis: {
                title: 'y',
                gridcolor: '#e5e7eb',
                zeroline: true,
                zerolinecolor: '#9ca3af'
              },
              hovermode: 'closest',
              showlegend: true,
              legend: {
                orientation: 'h',
                x: 0.5,
                xanchor: 'center',
                y: -0.22,
                bgcolor: 'rgba(255,255,255,0.95)',
                bordercolor: '#e5e7eb',
                borderwidth: 1,
                font: { size: 10 },
                tracegroupgap: 5
              },
              margin: { l: 50, r: 50, t: 40, b: 110 },
              plot_bgcolor: 'rgba(249, 250, 251, 0.8)',
              paper_bgcolor: 'transparent',
              autosize: true
            }}
            config={{
              responsive: true,
              displayModeBar: true,
              displaylogo: false,
              scrollZoom: true,
              modeBarButtonsToRemove: ['lasso2d', 'select2d', 'autoScale2d', 'hoverClosestCartesian', 'hoverCompareCartesian', 'toggleSpikelines', 'pan2d', 'zoomIn2d', 'zoomOut2d'],
              toImageButtonOptions: {
                format: 'png',
                filename: 'smoothing_comparison',
                height: 800,
                width: 1200,
                scale: 2
              }
            }}
            style={{ width: '100%', height: '420px', minHeight: '320px' }}
            useResizeHandler={true}
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {visibleMethods.map(methodData => (
            <div key={methodData.method} className="bg-gradient-to-br from-stone-50 to-stone-100 rounded-xl p-3">
              <Plot
                data={[
                  {
                    x: points.map(p => p.x),
                    y: points.map(p => p.y),
                    mode: 'markers',
                    type: 'scatter',
                    name: 'Data',
                    marker: { size: 8, color: '#1f2937' }
                  },
                  {
                    x: methodData.curvePoints.map(p => p.x),
                    y: methodData.curvePoints.map(p => p.y),
                    mode: 'lines',
                    type: 'scatter',
                    name: methodData.method,
                    line: { color: methodData.color, width: 3 }
                  }
                ]}
                layout={{
                  title: {
                    text: methodData.method,
                    font: { size: 13, color: '#374151' }
                  },
                  xaxis: { showticklabels: true, gridcolor: '#e5e7eb' },
                  yaxis: { showticklabels: true, gridcolor: '#e5e7eb' },
                  showlegend: false,
                  margin: { l: 40, r: 20, t: 35, b: 30 },
                  plot_bgcolor: 'transparent',
                  paper_bgcolor: 'transparent',
                  autosize: true
                }}
                config={{ responsive: true, displayModeBar: false }}
                style={{ width: '100%', height: '200px' }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Smoothing Metrics Table */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <span>📈</span> Smoothing Metrics Comparison
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-teal-600 to-emerald-600">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Method</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Smoothing Level</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Avg Deviation</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Max Deviation</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Behavior</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {smoothingData.sort((a, b) => {
                const order = { high: 0, moderate: 1, low: 2 };
                return order[a.smoothingLevel] - order[b.smoothingLevel];
              }).map((metric, index) => (
                <tr key={metric.method} className={index % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: metric.color }}></span>
                      <span className="font-medium text-gray-900">{metric.method}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {getLevelBadge(metric.smoothingLevel)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-700">
                    {metric.avgDeviation.toExponential(3)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-700">
                    {metric.maxDeviation.toExponential(3)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {metric.smoothingLevel === 'high' && 'Best noise filtering'}
                    {metric.smoothingLevel === 'moderate' && 'Balanced approach'}
                    {metric.smoothingLevel === 'low' && 'Follows data closely'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200">
        <h3 className="text-lg font-semibold text-amber-900 mb-3 flex items-center gap-2">
          <span>💡</span> Understanding Smoothing Behavior
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white/60 rounded-lg p-3 border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span className="font-semibold text-amber-800">Low Smoothing</span>
            </div>
            <p className="text-sm text-amber-900">
              <strong>Forward/Backward</strong>: Follow data points closely. Good for clean data but propagate noise directly.
            </p>
          </div>
          <div className="bg-white/60 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span className="font-semibold text-blue-800">Moderate Smoothing</span>
            </div>
            <p className="text-sm text-blue-900">
              <strong>Stirling/Bessel/Gaussian</strong>: Central methods offer balanced behavior - moderate smoothing while preserving trends.
            </p>
          </div>
          <div className="bg-white/60 rounded-lg p-3 border border-emerald-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-semibold text-emerald-800">High Smoothing</span>
            </div>
            <p className="text-sm text-emerald-900">
              <strong>Everett</strong>: Uses only even-order differences, providing natural low-pass filtering. Best for noisy data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

