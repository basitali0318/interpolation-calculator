import { useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { getRawForwardDifferences } from '../../algorithms/differenceTable';
import { MethodType } from '../../types/interpolation';

interface Recommendation {
  method: MethodType;
  name: string;
  score: number;
  reasons: string[];
  warnings: string[];
  smoothingLevel: 'low' | 'moderate' | 'high';
}

export default function MethodRecommendations() {
  const { state, toggleMethod, selectAllMethods } = useAppContext();
  const { points, queryX, selectedMethods, equallySpaced } = state;

  const recommendations = useMemo((): Recommendation[] => {
    if (points.length < 3 || queryX === null) return [];

    const n = points.length;
    const minX = Math.min(...points.map(p => p.x));
    const maxX = Math.max(...points.map(p => p.x));
    const range = maxX - minX;
    
    // Calculate query position (0 = start, 0.5 = middle, 1 = end)
    const queryPosition = range > 0 ? (queryX - minX) / range : 0.5;
    
    // Calculate noise level
    const differences = getRawForwardDifferences(points);
    const yValues = differences[0];
    const yRange = Math.max(...yValues) - Math.min(...yValues);
    
    let noiseLevel: 'low' | 'moderate' | 'high' | 'very-high' = 'low';
    if (differences[1] && differences[1].length > 0) {
      const firstOrderVals = differences[1];
      const firstOrderStdDev = Math.sqrt(
        firstOrderVals.reduce((sum, v) => {
          const mean = firstOrderVals.reduce((a, b) => a + b, 0) / firstOrderVals.length;
          return sum + Math.pow(v - mean, 2);
        }, 0) / firstOrderVals.length
      );
      const noiseRatio = yRange > 0 ? (firstOrderStdDev / yRange) * 100 : 0;
      
      if (noiseRatio > 80) noiseLevel = 'very-high';
      else if (noiseRatio > 40) noiseLevel = 'high';
      else if (noiseRatio > 15) noiseLevel = 'moderate';
    }

    const recs: Recommendation[] = [];

    // Newton Forward
    {
      let score = 50;
      const reasons: string[] = [];
      const warnings: string[] = [];
      
      if (queryPosition < 0.35) {
        score += 30;
        reasons.push('Query point is near the beginning of data');
      } else if (queryPosition < 0.5) {
        score += 10;
        reasons.push('Query point is in the first half');
      } else {
        score -= 20;
        warnings.push('Query point is not near the beginning');
      }
      
      if (noiseLevel === 'high' || noiseLevel === 'very-high') {
        score -= 15;
        warnings.push('Limited smoothing for noisy data');
      }
      
      if (!equallySpaced) {
        score -= 30;
        warnings.push('Requires equally spaced data');
      } else {
        reasons.push('Data is equally spaced ✓');
      }
      
      recs.push({
        method: 'forward',
        name: "Newton's Forward",
        score: Math.max(0, Math.min(100, score)),
        reasons,
        warnings,
        smoothingLevel: 'low'
      });
    }

    // Newton Backward
    {
      let score = 50;
      const reasons: string[] = [];
      const warnings: string[] = [];
      
      if (queryPosition > 0.65) {
        score += 30;
        reasons.push('Query point is near the end of data');
      } else if (queryPosition > 0.5) {
        score += 10;
        reasons.push('Query point is in the second half');
      } else {
        score -= 20;
        warnings.push('Query point is not near the end');
      }
      
      if (noiseLevel === 'high' || noiseLevel === 'very-high') {
        score -= 15;
        warnings.push('Limited smoothing for noisy data');
      }
      
      if (!equallySpaced) {
        score -= 30;
        warnings.push('Requires equally spaced data');
      } else {
        reasons.push('Data is equally spaced ✓');
      }
      
      recs.push({
        method: 'backward',
        name: "Newton's Backward",
        score: Math.max(0, Math.min(100, score)),
        reasons,
        warnings,
        smoothingLevel: 'low'
      });
    }

    // Stirling
    {
      let score = 60;
      const reasons: string[] = [];
      const warnings: string[] = [];
      
      if (queryPosition >= 0.35 && queryPosition <= 0.65) {
        score += 25;
        reasons.push('Query point is near the center');
      } else {
        score -= 15;
        warnings.push('Works best for central interpolation');
      }
      
      if (n % 2 === 1) {
        score += 10;
        reasons.push('Odd number of points (optimal for Stirling)');
      }
      
      if (noiseLevel === 'moderate') {
        score += 10;
        reasons.push('Good smoothing for moderate noise');
      } else if (noiseLevel === 'high' || noiseLevel === 'very-high') {
        score -= 5;
        warnings.push('Consider Everett for very noisy data');
      }
      
      if (!equallySpaced) {
        score -= 30;
        warnings.push('Requires equally spaced data');
      } else {
        reasons.push('Data is equally spaced ✓');
      }
      
      recs.push({
        method: 'stirling',
        name: "Stirling's Formula",
        score: Math.max(0, Math.min(100, score)),
        reasons,
        warnings,
        smoothingLevel: 'moderate'
      });
    }

    // Bessel
    {
      let score = 60;
      const reasons: string[] = [];
      const warnings: string[] = [];
      
      if (queryPosition >= 0.35 && queryPosition <= 0.65) {
        score += 25;
        reasons.push('Query point is near the center');
      } else {
        score -= 15;
        warnings.push('Works best for central interpolation');
      }
      
      if (n % 2 === 0) {
        score += 10;
        reasons.push('Even number of points (optimal for Bessel)');
      }
      
      if (noiseLevel === 'moderate') {
        score += 10;
        reasons.push('Good smoothing for moderate noise');
      }
      
      if (!equallySpaced) {
        score -= 30;
        warnings.push('Requires equally spaced data');
      } else {
        reasons.push('Data is equally spaced ✓');
      }
      
      recs.push({
        method: 'bessel',
        name: "Bessel's Formula",
        score: Math.max(0, Math.min(100, score)),
        reasons,
        warnings,
        smoothingLevel: 'moderate'
      });
    }

    // Everett
    {
      let score = 55;
      const reasons: string[] = [];
      const warnings: string[] = [];
      
      if (queryPosition >= 0.25 && queryPosition <= 0.75) {
        score += 15;
        reasons.push('Query point is within interpolation range');
      }
      
      if (noiseLevel === 'high' || noiseLevel === 'very-high') {
        score += 30;
        reasons.push('Best smoothing for noisy data (uses only even-order differences)');
      } else if (noiseLevel === 'moderate') {
        score += 15;
        reasons.push('Good noise filtering through even-order differences');
      }
      
      reasons.push('Natural low-pass filtering effect');
      
      if (!equallySpaced) {
        score -= 30;
        warnings.push('Requires equally spaced data');
      } else {
        reasons.push('Data is equally spaced ✓');
      }
      
      recs.push({
        method: 'everett',
        name: "Everett's Formula",
        score: Math.max(0, Math.min(100, score)),
        reasons,
        warnings,
        smoothingLevel: 'high'
      });
    }

    // Gaussian Forward
    {
      let score = 55;
      const reasons: string[] = [];
      const warnings: string[] = [];
      
      if (queryPosition >= 0.35 && queryPosition < 0.5) {
        score += 25;
        reasons.push('Query point slightly before center (optimal)');
      } else if (queryPosition >= 0.25 && queryPosition < 0.6) {
        score += 10;
        reasons.push('Query point in acceptable range');
      } else {
        score -= 15;
        warnings.push('Works best for points just before center');
      }
      
      if (!equallySpaced) {
        score -= 30;
        warnings.push('Requires equally spaced data');
      } else {
        reasons.push('Data is equally spaced ✓');
      }
      
      recs.push({
        method: 'gaussian-forward',
        name: 'Gaussian Forward',
        score: Math.max(0, Math.min(100, score)),
        reasons,
        warnings,
        smoothingLevel: 'moderate'
      });
    }

    // Gaussian Backward
    {
      let score = 55;
      const reasons: string[] = [];
      const warnings: string[] = [];
      
      if (queryPosition > 0.5 && queryPosition <= 0.65) {
        score += 25;
        reasons.push('Query point slightly after center (optimal)');
      } else if (queryPosition > 0.4 && queryPosition <= 0.75) {
        score += 10;
        reasons.push('Query point in acceptable range');
      } else {
        score -= 15;
        warnings.push('Works best for points just after center');
      }
      
      if (!equallySpaced) {
        score -= 30;
        warnings.push('Requires equally spaced data');
      } else {
        reasons.push('Data is equally spaced ✓');
      }
      
      recs.push({
        method: 'gaussian-backward',
        name: 'Gaussian Backward',
        score: Math.max(0, Math.min(100, score)),
        reasons,
        warnings,
        smoothingLevel: 'moderate'
      });
    }

    // Sort by score
    return recs.sort((a, b) => b.score - a.score);
  }, [points, queryX, equallySpaced]);

  if (points.length < 3 || queryX === null) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600 bg-green-100';
    if (score >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getSmoothingBadge = (level: string) => {
    const styles: Record<string, string> = {
      'low': 'bg-blue-100 text-blue-700',
      'moderate': 'bg-purple-100 text-purple-700',
      'high': 'bg-green-100 text-green-700'
    };
    return (
      <span className={`px-2 py-0.5 text-xs rounded ${styles[level]}`}>
        {level} smoothing
      </span>
    );
  };

  const topRecommendation = recommendations[0];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          <h2 className="text-2xl font-bold text-gray-800">Method Recommendations</h2>
        </div>
        <button
          onClick={selectAllMethods}
          className="text-sm text-teal-600 hover:text-teal-800 underline"
        >
          Select All
        </button>
      </div>

      {/* Top Recommendation Highlight */}
      {topRecommendation && (
        <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-300">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">⭐</span>
            <span className="font-bold text-amber-800">Best Match: {topRecommendation.name}</span>
            <span className={`ml-auto px-2 py-1 rounded font-bold ${getScoreColor(topRecommendation.score)}`}>
              {topRecommendation.score}%
            </span>
          </div>
          <div className="text-sm text-amber-700">
            {topRecommendation.reasons.slice(0, 2).join(' • ')}
          </div>
        </div>
      )}

      {/* All Recommendations */}
      <div className="space-y-3">
        {recommendations.map((rec, idx) => {
          const isSelected = selectedMethods.includes(rec.method);
          
          return (
            <div
              key={rec.method}
              className={`p-4 rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? 'border-teal-400 bg-teal-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => toggleMethod(rec.method)}
            >
              <div className="flex items-center gap-3">
                {/* Checkbox */}
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  isSelected ? 'bg-teal-600 border-teal-600' : 'border-gray-300'
                }`}>
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                    </svg>
                  )}
                </div>
                
                {/* Rank */}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                  idx === 1 ? 'bg-gray-300 text-gray-700' :
                  idx === 2 ? 'bg-orange-300 text-orange-800' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {idx + 1}
                </div>
                
                {/* Method name */}
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{rec.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    {getSmoothingBadge(rec.smoothingLevel)}
                  </div>
                </div>
                
                {/* Score */}
                <div className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(rec.score)}`}>
                  {rec.score}%
                </div>
              </div>
              
              {/* Reasons and Warnings */}
              <div className="mt-3 ml-14 space-y-1">
                {rec.reasons.slice(0, 2).map((reason, i) => (
                  <div key={i} className="text-xs text-green-700 flex items-center gap-1">
                    <span>✓</span> {reason}
                  </div>
                ))}
                {rec.warnings.slice(0, 1).map((warning, i) => (
                  <div key={i} className="text-xs text-orange-600 flex items-center gap-1">
                    <span>⚠</span> {warning}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
        <div className="font-medium mb-2">Smoothing Levels:</div>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-1">
            {getSmoothingBadge('low')} - Follows data closely
          </div>
          <div className="flex items-center gap-1">
            {getSmoothingBadge('moderate')} - Balanced
          </div>
          <div className="flex items-center gap-1">
            {getSmoothingBadge('high')} - Filters noise
          </div>
        </div>
      </div>
    </div>
  );
}

