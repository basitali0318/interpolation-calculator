import { Point, InterpolationResult, Step } from '../types/interpolation';
import { buildCentralDifferences, getRawForwardDifferences } from './differenceTable';
import { factorial, formatNumber } from '../utils/mathHelpers';

/**
 * Gaussian Forward Interpolation Formula
 * y = y₀ + pΔy₀ + p(p-1)/2!·Δ²y₋₁ + p(p-1)(p+1)/3!·Δ³y₋₁ + ...
 * where p = (x - x₀)/h and x₀ is near center
 * 
 * Best for: points slightly before the center
 */
export function gaussianForwardFormula(points: Point[], queryX: number): InterpolationResult {
  const startTime = performance.now();
  const steps: Step[] = [];

  const n = points.length;
  
  // Use point slightly before center
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
    description: `Step 2: Reference point (near center): x₀ = ${formatNumber(x0, 4)}, y₀ = ${formatNumber(y0, 6)} (index ${midIndex})`,
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

  // Step 5: Apply Gaussian Forward formula
  steps.push({
    description: 'Step 5: Apply Gaussian Forward formula:',
    latex: `y = y_0 + p\\Delta y_0 + \\frac{p(p-1)}{2!}\\Delta^2 y_{-1} + \\frac{p(p-1)(p+1)}{3!}\\Delta^3 y_{-1} + \\cdots`
  });

  // Start with y₀
  let result = y0;
  steps.push({
    description: `Start with y₀ = ${formatNumber(y0, 6)}`,
    value: result,
    latex: `y_0 = ${formatNumber(y0, 6)}`
  });

  // Term 1: pΔy₀
  if (diffTable[1] && diffTable[1][midIndex] !== undefined) {
    const term1 = p * diffTable[1][midIndex];
    result += term1;
    steps.push({
      description: `Add 1st order term: ${formatNumber(term1, 6)} (current sum: ${formatNumber(result, 6)})`,
      value: result,
      latex: `+ p\\Delta y_0 = ${formatNumber(p, 6)} \\times ${formatNumber(diffTable[1][midIndex], 6)} = ${formatNumber(term1, 6)}`
    });
  }

  // Term 2: p(p-1)/2!·Δ²y₋₁
  if (midIndex > 0 && diffTable[2] && diffTable[2][midIndex - 1] !== undefined) {
    const term2 = (p * (p - 1) / factorial(2)) * diffTable[2][midIndex - 1];
    result += term2;
    steps.push({
      description: `Add 2nd order term: ${formatNumber(term2, 6)} (current sum: ${formatNumber(result, 6)})`,
      value: result,
      latex: `+ \\frac{p(p-1)}{2!}\\Delta^2 y_{-1} = ${formatNumber(term2, 6)}`
    });
  }

  // Term 3: p(p-1)(p+1)/3!·Δ³y₋₁
  if (midIndex > 0 && diffTable[3] && diffTable[3][midIndex - 1] !== undefined) {
    const term3 = (p * (p - 1) * (p + 1) / factorial(3)) * diffTable[3][midIndex - 1];
    result += term3;
    steps.push({
      description: `Add 3rd order term: ${formatNumber(term3, 6)} (current sum: ${formatNumber(result, 6)})`,
      value: result,
      latex: `+ \\frac{p(p-1)(p+1)}{3!}\\Delta^3 y_{-1} = ${formatNumber(term3, 6)}`
    });
  }

  // Term 4: p(p-1)(p+1)(p-2)/4!·Δ⁴y₋₂
  if (midIndex > 1 && diffTable[4] && diffTable[4][midIndex - 2] !== undefined) {
    const term4 = (p * (p - 1) * (p + 1) * (p - 2) / factorial(4)) * diffTable[4][midIndex - 2];
    result += term4;
    steps.push({
      description: `Add 4th order term: ${formatNumber(term4, 6)} (current sum: ${formatNumber(result, 6)})`,
      value: result,
      latex: `+ \\frac{p(p-1)(p+1)(p-2)}{4!}\\Delta^4 y_{-2} = ${formatNumber(term4, 6)}`
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
  } else if (p > 0.5) {
    warning = '💡 Tip: For points after the center (p > 0.5), consider using Gaussian Backward for better accuracy.';
  }

  const computationTime = performance.now() - startTime;

  return {
    method: 'Gaussian Forward',
    value: result,
    steps,
    computationTime,
    warning
  };
}

/**
 * Gaussian Backward Interpolation Formula
 * y = y₀ + pΔy₋₁ + p(p+1)/2!·Δ²y₋₁ + p(p+1)(p-1)/3!·Δ³y₋₂ + ...
 * where p = (x - x₀)/h and x₀ is near center
 * 
 * Best for: points slightly after the center
 */
export function gaussianBackwardFormula(points: Point[], queryX: number): InterpolationResult {
  const startTime = performance.now();
  const steps: Step[] = [];

  const n = points.length;
  
  // Use point slightly after center
  const midIndex = Math.ceil(n / 2);
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
    description: `Step 2: Reference point (near center): x₀ = ${formatNumber(x0, 4)}, y₀ = ${formatNumber(y0, 6)} (index ${midIndex})`,
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

  // Step 5: Apply Gaussian Backward formula
  steps.push({
    description: 'Step 5: Apply Gaussian Backward formula:',
    latex: `y = y_0 + p\\Delta y_{-1} + \\frac{p(p+1)}{2!}\\Delta^2 y_{-1} + \\frac{p(p+1)(p-1)}{3!}\\Delta^3 y_{-2} + \\cdots`
  });

  // Start with y₀
  let result = y0;
  steps.push({
    description: `Start with y₀ = ${formatNumber(y0, 6)}`,
    value: result,
    latex: `y_0 = ${formatNumber(y0, 6)}`
  });

  // Term 1: pΔy₋₁
  if (midIndex > 0 && diffTable[1] && diffTable[1][midIndex - 1] !== undefined) {
    const term1 = p * diffTable[1][midIndex - 1];
    result += term1;
    steps.push({
      description: `Add 1st order term: ${formatNumber(term1, 6)} (current sum: ${formatNumber(result, 6)})`,
      value: result,
      latex: `+ p\\Delta y_{-1} = ${formatNumber(p, 6)} \\times ${formatNumber(diffTable[1][midIndex - 1], 6)} = ${formatNumber(term1, 6)}`
    });
  }

  // Term 2: p(p+1)/2!·Δ²y₋₁
  if (midIndex > 0 && diffTable[2] && diffTable[2][midIndex - 1] !== undefined) {
    const term2 = (p * (p + 1) / factorial(2)) * diffTable[2][midIndex - 1];
    result += term2;
    steps.push({
      description: `Add 2nd order term: ${formatNumber(term2, 6)} (current sum: ${formatNumber(result, 6)})`,
      value: result,
      latex: `+ \\frac{p(p+1)}{2!}\\Delta^2 y_{-1} = ${formatNumber(term2, 6)}`
    });
  }

  // Term 3: p(p+1)(p-1)/3!·Δ³y₋₂
  if (midIndex > 1 && diffTable[3] && diffTable[3][midIndex - 2] !== undefined) {
    const term3 = (p * (p + 1) * (p - 1) / factorial(3)) * diffTable[3][midIndex - 2];
    result += term3;
    steps.push({
      description: `Add 3rd order term: ${formatNumber(term3, 6)} (current sum: ${formatNumber(result, 6)})`,
      value: result,
      latex: `+ \\frac{p(p+1)(p-1)}{3!}\\Delta^3 y_{-2} = ${formatNumber(term3, 6)}`
    });
  }

  // Term 4: p(p+1)(p-1)(p+2)/4!·Δ⁴y₋₂
  if (midIndex > 1 && diffTable[4] && diffTable[4][midIndex - 2] !== undefined) {
    const term4 = (p * (p + 1) * (p - 1) * (p + 2) / factorial(4)) * diffTable[4][midIndex - 2];
    result += term4;
    steps.push({
      description: `Add 4th order term: ${formatNumber(term4, 6)} (current sum: ${formatNumber(result, 6)})`,
      value: result,
      latex: `+ \\frac{p(p+1)(p-1)(p+2)}{4!}\\Delta^4 y_{-2} = ${formatNumber(term4, 6)}`
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
  } else if (p < -0.5) {
    warning = '💡 Tip: For points before the center (p < -0.5), consider using Gaussian Forward for better accuracy.';
  }

  const computationTime = performance.now() - startTime;

  return {
    method: 'Gaussian Backward',
    value: result,
    steps,
    computationTime,
    warning
  };
}

