import { Point, InterpolationResult, Step } from '../types/interpolation';
import { buildCentralDifferences, getRawForwardDifferences } from './differenceTable';
import { factorial, formatNumber } from '../utils/mathHelpers';

/**
 * Stirling's Interpolation Formula
 * y = y₀ + p·(Δy₀ + Δy₋₁)/2 + p²/2!·Δ²y₋₁ + p(p²-1)/3!·(Δ³y₋₁ + Δ³y₋₂)/2 + ...
 * where p = (x - x₀)/h and x₀ is the central point
 * 
 * Best for: Central interpolation with odd number of points
 * Derived by averaging Gauss forward and backward formulas
 */
export function stirlingFormula(points: Point[], queryX: number): InterpolationResult {
  const startTime = performance.now();
  const steps: Step[] = [];

  const n = points.length;
  
  // Find central point (for odd n, it's the middle point)
  const midIndex = Math.floor(n / 2);
  const x0 = points[midIndex].x;
  const y0 = points[midIndex].y;

  // Step 1: Compute step size h
  const h = points[1].x - points[0].x;
  steps.push({
    description: `Step 1: Compute step size h = ${formatNumber(h, 4)}`,
    value: h,
    latex: `h = ${formatNumber(h, 4)}`
  });

  // Step 2: Identify central point
  steps.push({
    description: `Step 2: Central point is x₀ = ${formatNumber(x0, 4)}, y₀ = ${formatNumber(y0, 6)} (index ${midIndex})`,
    value: y0,
    latex: `x_0 = ${formatNumber(x0, 4)}, \\quad y_0 = ${formatNumber(y0, 6)}`
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

  // Step 5: Apply Stirling's formula
  steps.push({
    description: 'Step 5: Apply Stirling\'s formula (average of forward and backward):',
    latex: `y = y_0 + p\\frac{\\Delta y_0 + \\Delta y_{-1}}{2} + \\frac{p^2}{2!}\\Delta^2 y_{-1} + \\frac{p(p^2-1)}{3!}\\frac{\\Delta^3 y_{-1} + \\Delta^3 y_{-2}}{2} + \\cdots`
  });

  // Start with y₀
  let result = y0;
  steps.push({
    description: `Start with y₀ = ${formatNumber(y0, 6)}`,
    value: result,
    latex: `y_0 = ${formatNumber(y0, 6)}`
  });

  // Term 1: p·(Δy₀ + Δy₋₁)/2
  if (midIndex > 0 && midIndex < n - 1 && diffTable[1]) {
    const delta_y0 = diffTable[1][midIndex] || 0;
    const delta_y_minus1 = diffTable[1][midIndex - 1] || 0;
    const term1 = p * (delta_y0 + delta_y_minus1) / 2;
    result += term1;
    steps.push({
      description: `Add 1st order term: ${formatNumber(term1, 6)} (current sum: ${formatNumber(result, 6)})`,
      value: result,
      latex: `+ p\\frac{\\Delta y_0 + \\Delta y_{-1}}{2} = ${formatNumber(p, 6)} \\times \\frac{${formatNumber(delta_y0, 6)} + ${formatNumber(delta_y_minus1, 6)}}{2} = ${formatNumber(term1, 6)}`
    });
  }

  // Term 2: p²/2!·Δ²y₋₁
  if (midIndex > 0 && diffTable[2] && diffTable[2][midIndex - 1] !== undefined) {
    const term2 = (p * p / factorial(2)) * diffTable[2][midIndex - 1];
    result += term2;
    steps.push({
      description: `Add 2nd order term: ${formatNumber(term2, 6)} (current sum: ${formatNumber(result, 6)})`,
      value: result,
      latex: `+ \\frac{p^2}{2!}\\Delta^2 y_{-1} = \\frac{${formatNumber(p * p, 6)}}{2} \\times ${formatNumber(diffTable[2][midIndex - 1], 6)} = ${formatNumber(term2, 6)}`
    });
  }

  // Term 3: p(p²-1)/3!·(Δ³y₋₁ + Δ³y₋₂)/2
  if (midIndex > 1 && midIndex < n - 1 && diffTable[3]) {
    const delta3_y_minus1 = diffTable[3][midIndex - 1] || 0;
    const delta3_y_minus2 = diffTable[3][midIndex - 2] || 0;
    const term3 = (p * (p * p - 1) / factorial(3)) * (delta3_y_minus1 + delta3_y_minus2) / 2;
    result += term3;
    steps.push({
      description: `Add 3rd order term: ${formatNumber(term3, 6)} (current sum: ${formatNumber(result, 6)})`,
      value: result,
      latex: `+ \\frac{p(p^2-1)}{3!}\\frac{\\Delta^3 y_{-1} + \\Delta^3 y_{-2}}{2} = ${formatNumber(term3, 6)}`
    });
  }

  // Additional higher-order terms can be added similarly

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
  } else if (Math.abs(p) > 0.5) {
    warning = '💡 Tip: Stirling\'s formula is most accurate for points very close to the center. For points far from center, consider Forward or Backward formulas.';
  }

  const computationTime = performance.now() - startTime;

  return {
    method: 'Stirling\'s Formula',
    value: result,
    steps,
    computationTime,
    warning
  };
}

