import { Point, PreprocessingResult } from '../types/interpolation';

// Tolerance for floating point comparisons
const EPSILON = 0.0001;

/**
 * Validate and preprocess input data points
 */
export function preprocessPoints(points: Point[]): PreprocessingResult {
  // Check if we have at least 2 points
  if (points.length < 2) {
    return {
      isValid: false,
      error: 'At least 2 data points are required for interpolation.',
      sortedPoints: [],
      equallySpaced: false,
      stepSize: null
    };
  }

  // Check for duplicate or invalid x-values
  const xValues = points.map(p => p.x);
  const uniqueX = new Set(xValues);
  
  if (uniqueX.size !== xValues.length) {
    return {
      isValid: false,
      error: 'Duplicate x-values detected. Each x must be unique.',
      sortedPoints: [],
      equallySpaced: false,
      stepSize: null
    };
  }

  // Check for NaN or Infinity
  for (const point of points) {
    if (!isFinite(point.x) || !isFinite(point.y)) {
      return {
        isValid: false,
        error: 'Invalid data: points contain NaN or Infinity values.',
        sortedPoints: [],
        equallySpaced: false,
        stepSize: null
      };
    }
  }

  // Sort points by x value
  const sortedPoints = [...points].sort((a, b) => a.x - b.x);

  // Check if points are equally spaced
  const { equallySpaced, stepSize } = checkEqualSpacing(sortedPoints);

  return {
    isValid: true,
    sortedPoints,
    equallySpaced,
    stepSize
  };
}

/**
 * Check if points are equally spaced
 */
function checkEqualSpacing(sortedPoints: Point[]): { equallySpaced: boolean; stepSize: number | null } {
  if (sortedPoints.length < 2) {
    return { equallySpaced: false, stepSize: null };
  }

  const firstStep = sortedPoints[1].x - sortedPoints[0].x;
  
  // Check all consecutive differences
  for (let i = 1; i < sortedPoints.length - 1; i++) {
    const step = sortedPoints[i + 1].x - sortedPoints[i].x;
    
    // If difference is more than epsilon, not equally spaced
    if (Math.abs(step - firstStep) > EPSILON) {
      return { equallySpaced: false, stepSize: null };
    }
  }

  return { equallySpaced: true, stepSize: firstStep };
}

/**
 * Validate that data is equally spaced (required for the 6 methods)
 */
export function validateEqualSpacing(points: Point[]): { valid: boolean; error?: string; h?: number } {
  const result = preprocessPoints(points);
  
  if (!result.isValid) {
    return { valid: false, error: result.error };
  }

  if (!result.equallySpaced) {
    return { 
      valid: false, 
      error: 'Data points must be equally spaced for Forward, Backward, Stirling, Bessel, Everett, and Gaussian formulas.' 
    };
  }

  return { valid: true, h: result.stepSize! };
}

/**
 * Check if query point is within data range (interpolation) or outside (extrapolation)
 */
export function checkInterpolationRange(queryX: number, points: Point[]): {
  isInterpolation: boolean;
  position: 'start' | 'center' | 'end' | 'outside';
} {
  const minX = Math.min(...points.map(p => p.x));
  const maxX = Math.max(...points.map(p => p.x));
  
  if (queryX < minX || queryX > maxX) {
    return { isInterpolation: false, position: 'outside' };
  }

  const range = maxX - minX;
  const relativePosition = (queryX - minX) / range;

  if (relativePosition < 0.33) {
    return { isInterpolation: true, position: 'start' };
  } else if (relativePosition > 0.67) {
    return { isInterpolation: true, position: 'end' };
  } else {
    return { isInterpolation: true, position: 'center' };
  }
}

