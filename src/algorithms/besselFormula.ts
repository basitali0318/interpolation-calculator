import { Point, InterpolationResult, Step } from '../types/interpolation';
import { buildCentralDifferences, getRawForwardDifferences } from './differenceTable';
import { factorial, formatNumber } from '../utils/mathHelpers';

/**
 * Bessel's Interpolation Formula
 * y = (y₀ + y₁)/2 + p·Δy₀ + (p² - 0.25)/2!·(Δ²y₀ + Δ²y₋₁)/2 + ...
 * where p = (x - x₀)/h
 * 
 * Best for: Central interpolation with even number of points or between two values
 * Averages Gauss forward and modified backward formulas
 */
export function besselFormula(points: Point[], queryX: number): InterpolationResult {
  const startTime = performance.now();
  const steps: Step[] = [];

  const n = points.length;
  
  // For Bessel's, we use the point just before the middle
  const midIndex = Math.floor((n - 1) / 2);
  const x0 = points[midIndex].x;
  const y0 = points[midIndex].y;
  const y1 = points[midIndex + 1].y;

  // Step 1: Compute step size h
  const h = points[1].x - points[0].x;
  steps.push({
    description: `Step 1: Compute step size h = ${formatNumber(h, 4)}`,
    value: h,
    latex: `h = ${formatNumber(h, 4)}`
  });

  // Step 2: Identify reference points
  steps.push({
    description: `Step 2: Using points around center: x₀ = ${formatNumber(x0, 4)}, y₀ = ${formatNumber(y0, 6)}, y₁ = ${formatNumber(y1, 6)}`,
    value: y0,
    latex: `x_0 = ${formatNumber(x0, 4)}, \\quad y_0 = ${formatNumber(y0, 6)}, \\quad y_1 = ${formatNumber(y1, 6)}`
  });

  // Step 3: Compute p
  const p = (queryX - x0) / h;
  steps.push({
    description: `Step 3: Compute p = (x - x₀)/h = (${formatNumber(queryX, 4)} - ${formatNumber(x0, 4)})/${formatNumber(h, 4)} = ${formatNumber(p, 6)}`,
    value: p,
    latex: `p = \\frac{${formatNumber(queryX, 4)} - ${formatNumber(x0, 4)}}{${formatNumber(h, 4)}} = ${formatNumber(p, 6)}`
  });

  // Step 4: Build central difference table
  const diffTableFormatted = buildCentralDifferences(points);
  const diffTable = getRawForwardDifferences(points);
  steps.push({
    description: 'Step 4: Build central difference table:',
    table: diffTableFormatted
  });

  // Step 5: Apply Bessel's formula
  steps.push({
    description: 'Step 5: Apply Bessel\'s formula:',
    latex: `y = \\frac{y_0 + y_1}{2} + p\\Delta y_0 + \\frac{p^2 - 0.25}{2!}\\frac{\\Delta^2 y_0 + \\Delta^2 y_{-1}}{2} + \\cdots`
  });

  // Start with (y₀ + y₁)/2
  let result = (y0 + y1) / 2;
  steps.push({
    description: `Start with (y₀ + y₁)/2 = ${formatNumber(result, 6)}`,
    value: result,
    latex: `\\frac{y_0 + y_1}{2} = \\frac{${formatNumber(y0, 6)} + ${formatNumber(y1, 6)}}{2} = ${formatNumber(result, 6)}`
  });

  // Term 1: p·Δy₀
  if (diffTable[1] && diffTable[1][midIndex] !== undefined) {
    const term1 = p * diffTable[1][midIndex];
    result += term1;
    steps.push({
      description: `Add 1st order term: ${formatNumber(term1, 6)} (current sum: ${formatNumber(result, 6)})`,
      value: result,
      latex: `+ p\\Delta y_0 = ${formatNumber(p, 6)} \\times ${formatNumber(diffTable[1][midIndex], 6)} = ${formatNumber(term1, 6)}`
    });
  }

  // Term 2: (p² - 0.25)/2!·(Δ²y₀ + Δ²y₋₁)/2
  if (midIndex > 0 && diffTable[2]) {
    const delta2_y0 = diffTable[2][midIndex] || 0;
    const delta2_y_minus1 = diffTable[2][midIndex - 1] || 0;
    const term2 = ((p * p - 0.25) / factorial(2)) * (delta2_y0 + delta2_y_minus1) / 2;
    result += term2;
    steps.push({
      description: `Add 2nd order term: ${formatNumber(term2, 6)} (current sum: ${formatNumber(result, 6)})`,
      value: result,
      latex: `+ \\frac{p^2 - 0.25}{2!}\\frac{\\Delta^2 y_0 + \\Delta^2 y_{-1}}{2} = ${formatNumber(term2, 6)}`
    });
  }

  // Term 3: p(p-0.5)(p²-0.25)/3!·Δ³y₋₁
  if (midIndex > 0 && diffTable[3] && diffTable[3][midIndex - 1] !== undefined) {
    const term3 = (p * (p - 0.5) * (p * p - 0.25) / factorial(3)) * diffTable[3][midIndex - 1];
    result += term3;
    steps.push({
      description: `Add 3rd order term: ${formatNumber(term3, 6)} (current sum: ${formatNumber(result, 6)})`,
      value: result,
      latex: `+ \\frac{p(p-0.5)(p^2-0.25)}{3!}\\Delta^3 y_{-1} = ${formatNumber(term3, 6)}`
    });
  }

  // Final answer
  steps.push({
    description: `Final Answer: y(${formatNumber(queryX, 4)}) = ${formatNumber(result, 6)}`,
    value: result,
    latex: `y(${formatNumber(queryX, 4)}) = ${formatNumber(result, 6)}`
  });

  // Add warning if needed
  let warning: string | undefined;
  if (queryX < points[0].x || queryX > points[n - 1].x) {
    warning = '⚠️ Warning: Extrapolation detected. Results may be less accurate outside the data range.';
  } else if (Math.abs(p - 0.5) > 0.5) {
    warning = '💡 Tip: Bessel\'s formula is most accurate for points between the two central values (p ≈ 0.5).';
  }

  const computationTime = performance.now() - startTime;

  return {
    method: 'Bessel\'s Formula',
    value: result,
    steps,
    computationTime,
    warning
  };
}

