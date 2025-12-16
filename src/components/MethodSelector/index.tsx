import { useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { METHOD_INFO, MethodType } from '../../types/interpolation';
import { forwardFormula } from '../../algorithms/forwardFormula';
import { backwardFormula } from '../../algorithms/backwardFormula';
import { stirlingFormula } from '../../algorithms/stirlingFormula';
import { besselFormula } from '../../algorithms/besselFormula';
import { everettFormula } from '../../algorithms/everettFormula';
import { gaussianForwardFormula, gaussianBackwardFormula } from '../../algorithms/gaussianFormula';
import { validateEqualSpacing } from '../../algorithms/preprocessing';

export default function MethodSelector() {
  const {
    state,
    toggleMethod,
    selectAllMethods,
    clearAllMethods,
    setResults,
    setComputing,
    setError,
    dispatch
  } = useAppContext();

  const { points, queryX, selectedMethods, equallySpaced } = state;

  // Auto-select appropriate methods based on query position
  useEffect(() => {
    if (points.length >= 2 && queryX !== null && equallySpaced && selectedMethods.length === 0) {
      const minX = Math.min(...points.map(p => p.x));
      const maxX = Math.max(...points.map(p => p.x));
      const range = maxX - minX;
      const relativePosition = (queryX - minX) / range;

      const recommendedMethods: MethodType[] = [];

      if (relativePosition < 0.25) {
        // Near the beginning - recommend Forward
        recommendedMethods.push('forward');
      } else if (relativePosition > 0.75) {
        // Near the end - recommend Backward
        recommendedMethods.push('backward');
      } else if (relativePosition >= 0.4 && relativePosition <= 0.6) {
        // Central region - recommend Stirling and Bessel
        recommendedMethods.push('stirling', 'bessel');
        if (points.length % 2 === 0) {
          recommendedMethods.push('everett');
        }
      } else if (relativePosition < 0.5) {
        // Slightly before center - recommend Gaussian Forward and Stirling
        recommendedMethods.push('gaussian-forward', 'stirling');
      } else {
        // Slightly after center - recommend Gaussian Backward and Bessel
        recommendedMethods.push('gaussian-backward', 'bessel');
      }

      // Auto-select the recommended methods
      recommendedMethods.forEach(method => {
        if (!selectedMethods.includes(method)) {
          dispatch({ type: 'TOGGLE_METHOD', payload: method });
        }
      });
    }
  }, [points, queryX, equallySpaced, selectedMethods.length, dispatch]);

  const methodsToShow: MethodType[] = [
    'forward',
    'backward',
    'stirling',
    'bessel',
    'everett',
    'gaussian-forward',
    'gaussian-backward'
  ];

  const handleCompute = async () => {
    if (points.length < 2) {
      setError('Please provide at least 2 data points');
      return;
    }

    if (queryX === null) {
      setError('Please provide a query x value');
      return;
    }

    if (selectedMethods.length === 0) {
      setError('Please select at least one interpolation method');
      return;
    }

    // Validate equal spacing
    const validation = validateEqualSpacing(points);
    if (!validation.valid) {
      setError(validation.error || 'Data must be equally spaced');
      return;
    }

    setComputing(true);
    setError(null);

    try {
      const results = [];

      for (const method of selectedMethods) {
        let result;
        switch (method) {
          case 'forward':
            result = forwardFormula(points, queryX);
            break;
          case 'backward':
            result = backwardFormula(points, queryX);
            break;
          case 'stirling':
            result = stirlingFormula(points, queryX);
            break;
          case 'bessel':
            result = besselFormula(points, queryX);
            break;
          case 'everett':
            result = everettFormula(points, queryX);
            break;
          case 'gaussian-forward':
            result = gaussianForwardFormula(points, queryX);
            break;
          case 'gaussian-backward':
            result = gaussianBackwardFormula(points, queryX);
            break;
          default:
            continue;
        }
        results.push(result);
      }

      setResults(results);
    } catch (error) {
      setError(`Computation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setComputing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Select Methods</h2>

      {/* Data Status */}
      {points.length === 0 ? (
        <div className="mb-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg text-sm border-2 border-amber-300 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⬆️</span>
            <div>
              <p className="font-semibold text-amber-800">No data loaded yet</p>
              <p className="text-amber-600 text-xs mt-1">
                Use "Real-World Data" above to fetch live API data, or enter data manually in "Input Data"
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-4 p-4 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-lg text-sm border-2 border-teal-200 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <span className="text-teal-500">📊</span>
              <span><strong className="text-gray-700">Data Points:</strong> <span className="font-mono text-teal-700 font-bold">{points.length}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500">🎯</span>
              <span><strong className="text-gray-700">Query X:</strong> <span className="font-mono text-amber-700 font-bold">{queryX !== null ? queryX.toFixed(4) : 'Not set'}</span></span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-teal-200">
            <div className="flex items-center gap-2">
              <strong className="text-gray-700">Equal Spacing:</strong>{' '}
              {equallySpaced ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                  ✓ Yes - Ready!
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full text-xs font-medium">
                  ✗ No (required)
                </span>
              )}
            </div>
          </div>
          {selectedMethods.length > 0 && (
            <div className="mt-2 pt-2 border-t border-teal-200 text-teal-700">
              💡 <strong>{selectedMethods.length} method(s)</strong> selected based on query position
            </div>
          )}
        </div>
      )}

      {/* Method Checkboxes */}
      <div className="space-y-3 mb-4">
        {methodsToShow.map((methodId) => {
          const method = METHOD_INFO[methodId];
          const isSelected = selectedMethods.includes(methodId);

          return (
            <div key={methodId} className="border border-gray-200 rounded-md p-3 hover:bg-gray-50">
              <label className="flex items-start cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleMethod(methodId)}
                  className="mt-1 mr-3 h-5 w-5 text-teal-600 rounded focus:ring-teal-500"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{method.name}</div>
                  <div className="text-sm text-gray-600">{method.description}</div>
                  <div className="text-xs text-amber-600 mt-1">
                    💡 {method.bestFor}
                  </div>
                </div>
              </label>
            </div>
          );
        })}
      </div>

      {/* Select All / Clear All */}
      <div className="flex gap-2 mb-4">
        <button
          className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition text-sm"
          onClick={selectAllMethods}
        >
          Select All
        </button>
        <button
          className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition text-sm"
          onClick={clearAllMethods}
        >
          Clear All
        </button>
      </div>

      {/* Compute Button */}
      <button
        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 px-4 rounded-md hover:from-amber-600 hover:to-orange-600 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg"
        onClick={handleCompute}
        disabled={
          state.isComputing ||
          points.length < 2 ||
          queryX === null ||
          selectedMethods.length === 0 ||
          !equallySpaced
        }
      >
        {state.isComputing ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin h-5 w-5 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Computing...
          </span>
        ) : (
          'Compute Interpolation'
        )}
      </button>

      {/* Error Display */}
      {state.error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          <strong>Error:</strong> {state.error}
        </div>
      )}
    </div>
  );
}

