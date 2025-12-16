import { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { AVAILABLE_DATASETS, fetchDataset, getSuggestedQueryPoint, DatasetInfo } from '../../services/datasetApi';
import { preprocessPoints } from '../../algorithms/preprocessing';

export default function RealWorldDataSelector() {
  const { setPoints, setQueryX, setError, setEqualSpacing } = useAppContext();
  const [selectedDataset, setSelectedDataset] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [metadata, setMetadata] = useState<{
    source: string;
    fetchedAt: string;
    unit?: string;
    description?: string;
  } | null>(null);
  const [loadedPoints, setLoadedPoints] = useState<{ x: number; y: number }[]>([]);

  const categories = [
    { id: 'crypto', name: '💰 Cryptocurrency (USD & PKR)' },
    { id: 'weather', name: '🌡️ Weather (🇵🇰 Pakistan & International)' },
    { id: 'population', name: '👥 Population Data' },
    { id: 'economic', name: '💵 Economic (GDP)' }
  ];

  const handleFetchData = async () => {
    if (!selectedDataset) {
      setError('Please select a dataset first');
      return;
    }

    setIsLoading(true);
    setError(null);
    setMetadata(null);

    try {
      const result = await fetchDataset(selectedDataset);

      if (!result.success) {
        setError(result.error || 'Failed to fetch data');
        setIsLoading(false);
        return;
      }

      if (result.points.length < 2) {
        setError('Not enough data points received from API');
        setIsLoading(false);
        return;
      }

      // Preprocess the points
      const preprocessed = preprocessPoints(result.points);
      if (!preprocessed.isValid) {
        setError(preprocessed.error || 'Invalid data received');
        setIsLoading(false);
        return;
      }

      // Set the data
      setPoints(preprocessed.sortedPoints);
      setLoadedPoints(preprocessed.sortedPoints);
      setEqualSpacing(preprocessed.equallySpaced, preprocessed.stepSize);
      
      // Suggest a query point
      const suggestedX = getSuggestedQueryPoint(selectedDataset, preprocessed.sortedPoints);
      if (suggestedX !== null) {
        setQueryX(suggestedX);
      }

      // Set metadata for display
      if (result.metadata) {
        setMetadata(result.metadata);
      }

      setError(null);
    } catch (err) {
      setError('Network error: Please check your internet connection');
    } finally {
      setIsLoading(false);
    }
  };

  const getDatasetsByCategory = (category: string): DatasetInfo[] => {
    return AVAILABLE_DATASETS.filter(d => d.category === category);
  };

  const selectedInfo = AVAILABLE_DATASETS.find(d => d.id === selectedDataset);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🌐</span>
        <h2 className="text-2xl font-bold text-gray-800">Real-World Data</h2>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        Fetch live data from public APIs to see how interpolation works with real, noisy datasets.
      </p>

      {/* Category-based dropdown */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Dataset:
          </label>
          <select
            value={selectedDataset}
            onChange={(e) => {
              setSelectedDataset(e.target.value);
              setMetadata(null);
              setLoadedPoints([]);
            }}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
          >
            <option value="">-- Choose a real-world dataset --</option>
            {categories.map(category => (
              <optgroup key={category.id} label={category.name}>
                {getDatasetsByCategory(category.id).map(dataset => (
                  <option key={dataset.id} value={dataset.id}>
                    {dataset.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Dataset info */}
        {selectedInfo && (
          <div className="bg-teal-50 p-3 rounded-md border border-teal-200">
            <div className="text-sm font-medium text-teal-800">{selectedInfo.name}</div>
            <div className="text-xs text-teal-600 mt-1">{selectedInfo.description}</div>
            <div className="text-xs text-teal-500 mt-1">Source: {selectedInfo.source}</div>
          </div>
        )}

        {/* Fetch button */}
        <button
          onClick={handleFetchData}
          disabled={!selectedDataset || isLoading}
          className={`w-full py-3 px-4 rounded-md font-medium transition flex items-center justify-center gap-2 ${
            !selectedDataset || isLoading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700 shadow-lg'
          }`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Fetching Live Data...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Fetch Data from API
            </>
          )}
        </button>
      </div>

      {/* Loaded data display */}
      {metadata && loadedPoints.length > 0 && (
        <div className="mt-6 border-t pt-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-green-500">✓</span>
            <span className="font-medium text-gray-800">Data Loaded Successfully</span>
          </div>
          
          {/* Metadata */}
          <div className="bg-gray-50 p-3 rounded-md mb-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-gray-500">Source:</span>
                <span className="ml-2 font-medium">{metadata.source}</span>
              </div>
              <div>
                <span className="text-gray-500">Unit:</span>
                <span className="ml-2 font-medium">{metadata.unit || 'N/A'}</span>
              </div>
            </div>
            {metadata.description && (
              <div className="mt-2 text-gray-600 text-xs">{metadata.description}</div>
            )}
            <div className="mt-2 text-xs text-gray-400">
              Fetched: {new Date(metadata.fetchedAt).toLocaleString()}
            </div>
          </div>

          {/* Data preview */}
          <div className="max-h-48 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="p-2 text-left font-medium text-gray-700">x</th>
                  <th className="p-2 text-left font-medium text-gray-700">y ({metadata.unit || 'value'})</th>
                </tr>
              </thead>
              <tbody>
                {loadedPoints.map((point, idx) => (
                  <tr key={idx} className="border-b border-gray-100">
                    <td className="p-2 font-mono text-gray-800">{point.x}</td>
                    <td className="p-2 font-mono text-gray-800">{point.y}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Noise indicator */}
          <div className="mt-3 p-3 bg-yellow-50 rounded-md border border-yellow-200">
            <div className="flex items-center gap-2 text-yellow-800 text-sm font-medium">
              <span>⚠️</span>
              <span>Real-World Data Notice</span>
            </div>
            <p className="text-xs text-yellow-700 mt-1">
              This is live data with natural noise and variations. Higher-order differences 
              may show significant amplification. Try different interpolation methods to 
              compare their smoothing behavior!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

