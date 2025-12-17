import { useMemo, useState } from 'react';
// @ts-expect-error react-plotly.js has no type declarations
import Plot from 'react-plotly.js';
import { useAppContext } from '../../context/AppContext';
import { Point } from '../../types/interpolation';
import { getRawForwardDifferences, getRawBackwardDifferences } from '../../algorithms/differenceTable';
import { factorial } from '../../utils/mathHelpers';

// Interpolation evaluators for curve generation
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
  
  if (fwdDiff[1] && midIndex > 0 && midIndex < n) {
    const avgDelta1 = (fwdDiff[1][midIndex - 1] + fwdDiff[1][midIndex]) / 2;
    result += u * avgDelta1;
  }
  
  if (fwdDiff[2] && midIndex > 0) {
    result += (u * u / 2) * fwdDiff[2][midIndex - 1];
  }
  
  if (fwdDiff[3] && midIndex > 1 && midIndex < n - 1) {
    const avgDelta3 = (fwdDiff[3][midIndex - 2] + fwdDiff[3][midIndex - 1]) / 2;
    result += (u * (u * u - 1) / 6) * avgDelta3;
  }
  
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
  
  let result = (points[midIndex].y + points[midIndex + 1].y) / 2;
  
  if (fwdDiff[1] && midIndex < n - 1) {
    result += (u - 0.5) * fwdDiff[1][midIndex];
  }
  
  if (fwdDiff[2] && midIndex > 0 && midIndex < n - 1) {
    const avgDelta2 = (fwdDiff[2][midIndex - 1] + fwdDiff[2][midIndex]) / 2;
    result += (u * (u - 1) / 2) * avgDelta2;
  }
  
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
  
  let result = w * points[midIndex].y + u * points[midIndex + 1].y;
  
  if (fwdDiff[2] && midIndex > 0 && midIndex < n - 1) {
    const E2_0 = fwdDiff[2][midIndex - 1] || 0;
    const E2_1 = fwdDiff[2][midIndex] || 0;
    result += (u * (u - 1) * (u + 1) / 6) * E2_0;
    result += (w * (w - 1) * (w + 1) / 6) * E2_1;
  }
  
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
  
  if (fwdDiff[1] && midIndex < n - 1) {
    result += u * fwdDiff[1][midIndex];
  }
  
  if (fwdDiff[2] && midIndex > 0) {
    result += (u * (u - 1) / 2) * fwdDiff[2][midIndex - 1];
  }
  
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
  
  if (fwdDiff[1] && midIndex > 0) {
    result += u * fwdDiff[1][midIndex - 1];
  }
  
  if (fwdDiff[2] && midIndex > 0 && midIndex < n - 1) {
    result += (u * (u + 1) / 2) * fwdDiff[2][midIndex - 1];
  }
  
  if (fwdDiff[3] && midIndex > 1) {
    result += (u * (u + 1) * (u - 1) / 6) * fwdDiff[3][midIndex - 2];
  }
  
  return result;
}

const METHOD_CONFIG: Record<string, { evaluate: (p: Point[], x: number, h: number) => number; color: string }> = {
  'Forward Formula': { evaluate: evaluateForward, color: '#f59e0b' },
  'Backward Formula': { evaluate: evaluateBackward, color: '#ef4444' },
  "Stirling's Formula": { evaluate: evaluateStirling, color: '#8b5cf6' },
  "Bessel's Formula": { evaluate: evaluateBessel, color: '#3b82f6' },
  "Everett's Formula": { evaluate: evaluateEverett, color: '#10b981' },
  'Gaussian Forward': { evaluate: evaluateGaussianForward, color: '#ec4899' },
  'Gaussian Backward': { evaluate: evaluateGaussianBackward, color: '#14b8a6' },
};

export default function Visualization() {
  const { state } = useAppContext();
  const { points, queryX, results, stepSize } = state;
  const [showCurves, setShowCurves] = useState(true);
  const [showInterpolatedPoints, setShowInterpolatedPoints] = useState(true);

  // Generate plot data
  const plotData = useMemo(() => {
    if (points.length === 0) return [];

    const data: any[] = [];
    const h = stepSize || (points.length > 1 ? points[1].x - points[0].x : 1);
    const xMin = points[0].x;
    const xMax = points[points.length - 1].x;
    const numCurvePoints = 100;
    const xStep = (xMax - xMin) / (numCurvePoints - 1);

    // Original data points - make them prominent
    data.push({
      x: points.map(p => p.x),
      y: points.map(p => p.y),
      mode: 'markers',
      type: 'scatter',
      name: 'Original Data',
      marker: {
        size: 14,
        color: '#1f2937',
        symbol: 'circle',
        line: {
          color: '#ffffff',
          width: 2
        }
      },
      hovertemplate: 'x: %{x:.4f}<br>y: %{y:.4f}<extra>Original</extra>'
    });

    // If we have results, plot interpolant curves and points
    if (results.length > 0 && queryX !== null) {
      // Plot full curves for each method
      if (showCurves) {
        results.forEach((result) => {
          const config = METHOD_CONFIG[result.method];
          if (!config) return;

          const curveX: number[] = [];
          const curveY: number[] = [];

          for (let i = 0; i < numCurvePoints; i++) {
            const x = xMin + i * xStep;
            try {
              const y = config.evaluate(points, x, h);
              if (isFinite(y) && !isNaN(y) && Math.abs(y) < 1e10) {
                curveX.push(x);
                curveY.push(y);
              }
            } catch {
              // Skip problematic points
            }
          }

          if (curveX.length > 0) {
            data.push({
              x: curveX,
              y: curveY,
              mode: 'lines',
              type: 'scatter',
              name: `${result.method} curve`,
              line: {
                color: config.color,
                width: 2.5,
                shape: 'spline'
              },
              opacity: 0.7,
              hovertemplate: `${result.method}<br>x: %{x:.4f}<br>y: %{y:.4f}<extra></extra>`
            });
          }
        });
      }

      // Plot interpolated points at queryX
      if (showInterpolatedPoints) {
        results.forEach((result) => {
          const config = METHOD_CONFIG[result.method];
          data.push({
            x: [queryX],
            y: [result.value],
            mode: 'markers',
            type: 'scatter',
            name: `${result.method}: ${result.value.toFixed(6)}`,
            marker: {
              size: 16,
              color: config?.color || '#6b7280',
              symbol: 'star',
              line: {
                color: 'white',
                width: 2
              }
            },
            hovertemplate: `<b>${result.method}</b><br>x: ${queryX.toFixed(4)}<br>y: ${result.value.toFixed(6)}<extra></extra>`
          });
        });
      }

      // Query point indicator (vertical line)
      const yMin = Math.min(...points.map(p => p.y), ...results.map(r => r.value));
      const yMax = Math.max(...points.map(p => p.y), ...results.map(r => r.value));
      const yRange = yMax - yMin;
      
      data.push({
        x: [queryX, queryX],
        y: [yMin - yRange * 0.15, yMax + yRange * 0.15],
        mode: 'lines',
        type: 'scatter',
        name: `Query x = ${queryX.toFixed(4)}`,
        line: {
          color: '#9ca3af',
          width: 2,
          dash: 'dash'
        },
        showlegend: true,
        hoverinfo: 'skip'
      });
    }

    return data;
  }, [points, queryX, results, stepSize, showCurves, showInterpolatedPoints]);

  if (points.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-3xl">📈</span> Visualization
        </h2>
        <div className="text-center text-gray-500 py-12 bg-gradient-to-br from-stone-50 to-stone-100 rounded-xl">
          <svg
            className="mx-auto h-20 w-20 text-teal-300 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
            />
          </svg>
          <p className="text-lg font-medium text-stone-600">No data to visualize</p>
          <p className="text-sm text-stone-400 mt-1">Load data in Section 1 to see the plot</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <span className="text-3xl">📈</span> Visualization
        </h2>
        
        {results.length > 0 && (
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showCurves}
                onChange={(e) => setShowCurves(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
              />
              <span className="text-sm text-gray-600">Show Curves</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showInterpolatedPoints}
                onChange={(e) => setShowInterpolatedPoints(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
              />
              <span className="text-sm text-gray-600">Show Points</span>
            </label>
          </div>
        )}
      </div>

      <div className="bg-gradient-to-br from-stone-50 to-stone-100 rounded-xl p-4">
        <Plot
          data={plotData}
          layout={{
            title: {
              text: results.length > 0 
                ? `Interpolation at x = ${queryX?.toFixed(4) ?? 'N/A'}` 
                : 'Data Points',
              font: { size: 14, color: '#374151', family: 'system-ui' },
              x: 0.02,
              xanchor: 'left'
            },
            xaxis: {
              title: { text: 'x', font: { size: 14, color: '#6b7280' } },
              gridcolor: '#e5e7eb',
              gridwidth: 1,
              zeroline: true,
              zerolinecolor: '#9ca3af',
              zerolinewidth: 1,
              showspikes: true,
              spikecolor: '#0d9488',
              spikethickness: 1,
              spikedash: 'dot',
              spikemode: 'across'
            },
            yaxis: {
              title: { text: 'y', font: { size: 14, color: '#6b7280' } },
              gridcolor: '#e5e7eb',
              gridwidth: 1,
              zeroline: true,
              zerolinecolor: '#9ca3af',
              zerolinewidth: 1,
              showspikes: true,
              spikecolor: '#0d9488',
              spikethickness: 1,
              spikedash: 'dot',
              spikemode: 'across'
            },
            hovermode: 'closest',
            showlegend: true,
            legend: {
              orientation: 'h',
              x: 0.5,
              xanchor: 'center',
              y: -0.2,
              bgcolor: 'rgba(255,255,255,0.95)',
              bordercolor: '#e5e7eb',
              borderwidth: 1,
              font: { size: 10, family: 'system-ui' },
              itemsizing: 'constant',
              tracegroupgap: 5
            },
            margin: { l: 50, r: 50, t: 40, b: 90 },
            plot_bgcolor: 'rgba(255,255,255,0.9)',
            paper_bgcolor: 'transparent',
            autosize: true,
            dragmode: 'zoom'
          }}
          config={{
            responsive: true,
            displayModeBar: true,
            displaylogo: false,
            scrollZoom: true,
            modeBarButtonsToAdd: [],
            modeBarButtonsToRemove: ['lasso2d', 'select2d', 'autoScale2d', 'hoverClosestCartesian', 'hoverCompareCartesian', 'toggleSpikelines', 'pan2d', 'zoomIn2d', 'zoomOut2d'],
            toImageButtonOptions: {
              format: 'png',
              filename: 'interpolation_plot',
              height: 800,
              width: 1200,
              scale: 2
            }
          }}
          style={{ width: '100%', height: '450px', minHeight: '350px' }}
          useResizeHandler={true}
        />
      </div>

      {/* Legend explanation */}
      {results.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-4 justify-center">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="w-4 h-4 rounded-full bg-stone-800 border-2 border-white shadow"></span>
            <span>Original Data Points</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="text-lg">⭐</span>
            <span>Interpolated Values at Query Point</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="w-8 h-0.5 bg-gray-400" style={{ borderStyle: 'dashed', borderWidth: '1px 0 0 0' }}></span>
            <span>Query Position (x = {queryX?.toFixed(4)})</span>
          </div>
        </div>
      )}
    </div>
  );
}
