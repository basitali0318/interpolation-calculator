import { Point, InterpolationResult, Step } from '../types/interpolation';
import { buildCentralDifferences, getRawForwardDifferences } from './differenceTable';
import { formatNumber } from '../utils/mathHelpers';

/**
 * Everett's Interpolation Formula
 * y = qy₀ + py₁ + q(q²-1)/3!·Δ²y₋₁ + p(p²-1)/3!·Δ²y₀ + ...
 * where p = (x - x₀)/h and q = 1 - p
 * 
 * Best for: Central interpolation with simplified computation (uses only even-order differences)
 * Advantage: No odd differences needed; symmetric
 */
export function everettFormula(points: Point[], queryX: number): InterpolationResult {
  const startTime = performance.now();
  const steps: Step[] = [];

  const n = points.length;
  
  // Use the point just before the query
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
    description: `Step 2: Using points: x₀ = ${formatNumber(x0, 4)}, y₀ = ${formatNumber(y0, 6)}, y₁ = ${formatNumber(y1, 6)}`,
    value: y0,
    latex: `x_0 = ${formatNumber(x0, 4)}, \\quad y_0 = ${formatNumber(y0, 6)}, \\quad y_1 = ${formatNumber(y1, 6)}`
  });

  // Step 3: Compute p and q
  const p = (queryX - x0) / h;
  const q = 1 - p;
  steps.push({
    description: `Step 3: Compute p = (x - x₀)/h = ${formatNumber(p, 6)}, and q = 1 - p = ${formatNumber(q, 6)}`,
    value: p,
    latex: `p = ${formatNumber(p, 6)}, \\quad q = 1 - p = ${formatNumber(q, 6)}`
  });

  // Step 4: Build central difference table
  const diffTableFormatted = buildCentralDifferences(points);
  const diffTable = getRawForwardDifferences(points);
  steps.push({
    description: 'Step 4: Build central difference table (note: Everett uses only even-order differences):',
    table: diffTableFormatted
  });

  // Step 5: Apply Everett's formula
  steps.push({
    description: 'Step 5: Apply Everett\'s formula (only even differences):',
    latex: `y = qy_0 + py_1 + \\frac{q(q^2-1)}{3!}\\Delta^2 y_{-1} + \\frac{p(p^2-1)}{3!}\\Delta^2 y_0 + \\cdots`
  });

  // Start with qy₀ + py₁
  let result = q * y0 + p * y1;
  steps.push({
    description: `Start with qy₀ + py₁ = ${formatNumber(result, 6)}`,
    value: result,
    latex: `qy_0 + py_1 = ${formatNumber(q, 6)} \\times ${formatNumber(y0, 6)} + ${formatNumber(p, 6)} \\times ${formatNumber(y1, 6)} = ${formatNumber(result, 6)}`
  });

  // Term 1: q(q²-1)/3!·Δ²y₋₁ (2nd order with q)
  if (midIndex > 0 && diffTable[2] && diffTable[2][midIndex - 1] !== undefined) {
    const term1 = (q * (q * q - 1) / 6) * diffTable[2][midIndex - 1];
    result += term1;
    steps.push({
      description: `Add even-order term with q: ${formatNumber(term1, 6)} (current sum: ${formatNumber(result, 6)})`,
      value: result,
      latex: `+ \\frac{q(q^2-1)}{3!}\\Delta^2 y_{-1} = \\frac{${formatNumber(q, 6)}(${formatNumber(q * q - 1, 6)})}{6} \\times ${formatNumber(diffTable[2][midIndex - 1], 6)} = ${formatNumber(term1, 6)}`
    });
  }

  // Term 2: p(p²-1)/3!·Δ²y₀ (2nd order with p)
  if (diffTable[2] && diffTable[2][midIndex] !== undefined) {
    const term2 = (p * (p * p - 1) / 6) * diffTable[2][midIndex];
    result += term2;
    steps.push({
      description: `Add even-order term with p: ${formatNumber(term2, 6)} (current sum: ${formatNumber(result, 6)})`,
      value: result,
      latex: `+ \\frac{p(p^2-1)}{3!}\\Delta^2 y_0 = \\frac{${formatNumber(p, 6)}(${formatNumber(p * p - 1, 6)})}{6} \\times ${formatNumber(diffTable[2][midIndex], 6)} = ${formatNumber(term2, 6)}`
    });
  }

  // Term 3: 4th order terms with Δ⁴
  // q(q²-1)(q²-4)/5!·Δ⁴y₋₂
  if (midIndex > 1 && diffTable[4] && diffTable[4][midIndex - 2] !== undefined) {
    const term3 = (q * (q * q - 1) * (q * q - 4) / 120) * diffTable[4][midIndex - 2];
    result += term3;
    steps.push({
      description: `Add 4th-order term with q: ${formatNumber(term3, 6)} (current sum: ${formatNumber(result, 6)})`,
      value: result,
      latex: `+ \\frac{q(q^2-1)(q^2-4)}{5!}\\Delta^4 y_{-2} = ${formatNumber(term3, 6)}`
    });
  }

  // p(p²-1)(p²-4)/5!·Δ⁴y₀
  if (midIndex + 4 < n && diffTable[4] && diffTable[4][midIndex] !== undefined) {
    const term4 = (p * (p * p - 1) * (p * p - 4) / 120) * diffTable[4][midIndex];
    result += term4;
    steps.push({
      description: `Add 4th-order term with p: ${formatNumber(term4, 6)} (current sum: ${formatNumber(result, 6)})`,
      value: result,
      latex: `+ \\frac{p(p^2-1)(p^2-4)}{5!}\\Delta^4 y_0 = ${formatNumber(term4, 6)}`
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
  }

  const computationTime = performance.now() - startTime;

  return {
    method: 'Everett\'s Formula',
    value: result,
    steps,
    computationTime,
    warning
  };
}

