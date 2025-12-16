import { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { renderLatex } from '../../utils/formatters';

export default function OutputSection() {
  const { state } = useAppContext();
  const { results } = state;
  const [expandedResults, setExpandedResults] = useState<Set<number>>(new Set());

  if (results.length === 0) {
    return null;
  }

  const toggleExpand = (index: number) => {
    const newExpanded = new Set(expandedResults);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedResults(newExpanded);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Results</h2>

      {results.map((result, index) => {
        const isExpanded = expandedResults.has(index);

        return (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-4 text-white">
              <h3 className="text-xl font-bold">{result.method}</h3>
              <p className="text-sm opacity-90 mt-1">
                Computation time: {result.computationTime.toFixed(2)} ms
              </p>
            </div>

            {/* Result Value */}
            <div className="p-6 bg-teal-50">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Interpolated Value:</div>
                <div className="text-4xl font-bold text-teal-700">
                  {result.value.toFixed(6)}
                </div>
              </div>
            </div>

            {/* Warning */}
            {result.warning && (
              <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400">
                <p className="text-sm text-yellow-800">{result.warning}</p>
              </div>
            )}

            {/* Toggle Steps Button */}
            <div className="p-4 border-t border-gray-200">
              <button
                className="w-full flex items-center justify-between py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-md transition"
                onClick={() => toggleExpand(index)}
              >
                <span className="font-medium text-gray-700">
                  {isExpanded ? 'Hide' : 'Show'} Step-by-Step Solution
                </span>
                <svg
                  className={`w-5 h-5 transform transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>

            {/* Steps */}
            {isExpanded && (
              <div className="p-6 bg-gray-50 border-t border-gray-200">
                <div className="space-y-4">
                  {result.steps.map((step, stepIndex) => (
                    <div key={stepIndex} className="bg-white p-4 rounded-md shadow-sm">
                      <p className="text-gray-800 mb-2">{step.description}</p>

                      {/* LaTeX rendering */}
                      {step.latex && (
                        <div
                          className="my-2 overflow-x-auto"
                          dangerouslySetInnerHTML={{ __html: renderLatex(step.latex) }}
                        />
                      )}

                      {/* Table rendering */}
                      {step.table && step.table.length > 0 && (
                        <div className="overflow-x-auto mt-3">
                          <table className="difference-table min-w-full text-sm">
                            <thead>
                              <tr>
                                {step.table[0].map((header, i) => (
                                  <th key={i}>{header}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {step.table.slice(1).map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                  {row.map((cell, cellIndex) => (
                                    <td key={cellIndex}>{cell}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Numeric value */}
                      {step.value !== undefined && !step.table && (
                        <div className="text-sm text-gray-600 mt-2">
                          Value: <strong>{step.value.toFixed(6)}</strong>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

