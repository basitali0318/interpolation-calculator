import { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';

type SortField = 'method' | 'value' | 'time';
type SortDirection = 'asc' | 'desc';

export default function ComparisonTable() {
  const { state } = useAppContext();
  const { results } = state;
  const [sortField, setSortField] = useState<SortField>('method');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const sortedResults = useMemo(() => {
    if (results.length === 0) return [];

    const sorted = [...results];
    sorted.sort((a, b) => {
      let compareValue = 0;

      switch (sortField) {
        case 'method':
          compareValue = a.method.localeCompare(b.method);
          break;
        case 'value':
          compareValue = a.value - b.value;
          break;
        case 'time':
          compareValue = a.computationTime - b.computationTime;
          break;
      }

      return sortDirection === 'asc' ? compareValue : -compareValue;
    });

    return sorted;
  }, [results, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  if (results.length === 0) {
    return null;
  }

  // Calculate statistics
  const values = results.map(r => r.value);
  const avgValue = values.reduce((a, b) => a + b, 0) / values.length;
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const variance = values.reduce((sum, val) => sum + Math.pow(val - avgValue, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Method Comparison</h2>

      {/* Statistics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-teal-50 p-3 rounded-md border border-teal-200">
          <div className="text-sm text-gray-600">Average</div>
          <div className="text-lg font-bold text-teal-700">{avgValue.toFixed(6)}</div>
        </div>
        <div className="bg-emerald-50 p-3 rounded-md border border-emerald-200">
          <div className="text-sm text-gray-600">Min Value</div>
          <div className="text-lg font-bold text-emerald-700">{minValue.toFixed(6)}</div>
        </div>
        <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
          <div className="text-sm text-gray-600">Max Value</div>
          <div className="text-lg font-bold text-amber-700">{maxValue.toFixed(6)}</div>
        </div>
        <div className="bg-orange-50 p-3 rounded-md border border-orange-200">
          <div className="text-sm text-gray-600">Std Dev</div>
          <div className="text-lg font-bold text-orange-700">{stdDev.toFixed(6)}</div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('method')}
              >
                <div className="flex items-center">
                  Method
                  {sortField === 'method' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('value')}
              >
                <div className="flex items-center">
                  Interpolated Value
                  {sortField === 'value' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('time')}
              >
                <div className="flex items-center">
                  Time (ms)
                  {sortField === 'time' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Notes
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedResults.map((result, index) => {
              const isClosestToAvg = Math.abs(result.value - avgValue) === Math.min(...values.map(v => Math.abs(v - avgValue)));
              const isFastest = result.computationTime === Math.min(...results.map(r => r.computationTime));

              return (
                <tr
                  key={index}
                  className={isClosestToAvg ? 'bg-green-50' : ''}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {result.method}
                    {isClosestToAvg && (
                      <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                        Closest to avg
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                    {result.value.toFixed(6)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {result.computationTime.toFixed(2)}
                    {isFastest && (
                      <span className="ml-2 text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">
                        Fastest
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {result.warning || '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

