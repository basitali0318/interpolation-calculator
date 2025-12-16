import { useMemo } from 'react';
// @ts-expect-error react-plotly.js has no type declarations
import Plot from 'react-plotly.js';
import { useAppContext } from '../../context/AppContext';

export default function Visualization() {
  const { state } = useAppContext();
  const { points, queryX, results } = state;

  // Generate plot data
  const plotData = useMemo(() => {
    if (points.length === 0) return [];

    const data: any[] = [];

    // Original data points
    data.push({
      x: points.map(p => p.x),
      y: points.map(p => p.y),
      mode: 'markers',
      type: 'scatter',
      name: 'Data Points',
      marker: {
        size: 10,
        color: '#0d9488',
        symbol: 'circle'
      }
    });

    // If we have results, plot interpolant curves
    if (results.length > 0 && queryX !== null) {
      // For each method result, plot the interpolated curve
      const colors = ['#f59e0b', '#10b981', '#ef4444', '#0d9488', '#ea580c', '#059669', '#14b8a6'];
      
      results.forEach((result, index) => {
        // For now, just plot the interpolated point
        // (Full curve interpolation would require evaluating formula at all xDense points)
        data.push({
          x: [queryX],
          y: [result.value],
          mode: 'markers',
          type: 'scatter',
          name: `${result.method}: ${result.value.toFixed(4)}`,
          marker: {
            size: 12,
            color: colors[index % colors.length],
            symbol: 'star',
            line: {
              color: 'white',
              width: 2
            }
          }
        });
      });

      // Query point indicator (vertical line)
      if (queryX !== null) {
        const yMin = Math.min(...points.map(p => p.y));
        const yMax = Math.max(...points.map(p => p.y));
        data.push({
          x: [queryX, queryX],
          y: [yMin - (yMax - yMin) * 0.1, yMax + (yMax - yMin) * 0.1],
          mode: 'lines',
          type: 'scatter',
          name: `Query x = ${queryX.toFixed(4)}`,
          line: {
            color: 'gray',
            width: 2,
            dash: 'dash'
          },
          showlegend: true
        });
      }
    }

    return data;
  }, [points, queryX, results]);

  if (points.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Visualization</h2>
        <div className="text-center text-gray-500 py-12">
          <svg
            className="mx-auto h-16 w-16 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <p>No data to visualize. Please provide data points first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Visualization</h2>
      <div className="w-full">
        <Plot
          data={plotData}
          layout={{
            title: 'Interpolation Visualization',
            xaxis: {
              title: 'x',
              gridcolor: '#e5e7eb',
              zeroline: true
            },
            yaxis: {
              title: 'y',
              gridcolor: '#e5e7eb',
              zeroline: true
            },
            hovermode: 'closest',
            showlegend: true,
            legend: {
              x: 1.05,
              y: 1,
              bgcolor: 'rgba(255,255,255,0.9)',
              bordercolor: '#d1d5db',
              borderwidth: 1
            },
            margin: {
              l: 60,
              r: 150,
              t: 60,
              b: 60
            },
            plot_bgcolor: '#f9fafb',
            paper_bgcolor: 'white',
            autosize: true
          }}
          config={{
            responsive: true,
            displayModeBar: true,
            displaylogo: false,
            modeBarButtonsToRemove: ['lasso2d', 'select2d'],
            toImageButtonOptions: {
              format: 'png',
              filename: 'interpolation_plot',
              height: 800,
              width: 1200,
              scale: 2
            }
          }}
          style={{ width: '100%', height: '500px' }}
        />
      </div>
    </div>
  );
}

