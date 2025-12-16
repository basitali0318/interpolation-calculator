import { Point, InterpolationResult, Step } from '../types/interpolation';
import { buildForwardDifferences, getRawForwardDifferences } from './differenceTable';
import { factorial, formatNumber } from '../utils/mathHelpers';

/**
 * Newton Forward Difference Formula
 * y = y₀ + uΔy₀ + u(u-1)/2!·Δ²y₀ + u(u-1)(u-2)/3!·Δ³y₀ + ...
 * where u = (x - x₀)/h
 * 
 * Best for: interpolation near the beginning of the data set
 */
export function forwardFormula(points: Point[], queryX: number): InterpolationResult {
  const startTime = performance.now();
  const steps: Step[] = [];

  const n = points.length;
  const x0 = points[0].x;
  const y0 = points[0].y;

  // Step 1: Compute step size h
  const h = points[1].x - points[0].x;
  steps.push({
    description: `Step 1: Compute step size h = x₁ - x₀ = ${formatNumber(points[1].x, 4)} - ${formatNumber(x0, 4)} = ${formatNumber(h, 4)}`,
    value: h,
    latex: `h = ${formatNumber(h, 4)}`
  });

  // Step 2: Compute u
  const u = (queryX - x0) / h;
  steps.push({
    description: `Step 2: Compute u = (x - x₀)/h = (${formatNumber(queryX, 4)} - ${formatNumber(x0, 4)})/${formatNumber(h, 4)} = ${formatNumber(u, 6)}`,
    value: u,
    latex: `u = \\frac{${formatNumber(queryX, 4)} - ${formatNumber(x0, 4)}}{${formatNumber(h, 4)}} = ${formatNumber(u, 6)}`
  });

  // Step 3: Build forward difference table
  const diffTableFormatted = buildForwardDifferences(points);
  const diffTable = getRawForwardDifferences(points);
  steps.push({
    description: 'Step 3: Build forward difference table:',
    table: diffTableFormatted
  });

  // Step 4: Apply Newton Forward formula
  steps.push({
    description: 'Step 4: Apply Newton Forward formula: y = y₀ + uΔy₀ + u(u-1)/2!·Δ²y₀ + ...',
    latex: `y = y_0 + u\\Delta y_0 + \\frac{u(u-1)}{2!}\\Delta^2 y_0 + \\frac{u(u-1)(u-2)}{3!}\\Delta^3 y_0 + \\cdots`
  });

  // Start with y₀
  let result = y0;
  steps.push({
    description: `Start with y₀ = ${formatNumber(y0, 6)}`,
    value: result,
    latex: `y_0 = ${formatNumber(y0, 6)}`
  });

  // Add each term
  for (let i = 1; i < n; i++) {
    if (diffTable[i] && diffTable[i][0] !== undefined) {
      // Compute u(u-1)(u-2)...(u-(i-1))
      let uProduct = u;
      for (let j = 1; j < i; j++) {
        uProduct *= (u - j);
      }

      const term = (uProduct / factorial(i)) * diffTable[i][0];
      result += term;

      // Build latex for the u product
      let uProductStr = 'u';
      for (let j = 1; j < i; j++) {
        uProductStr += `(u-${j})`;
      }

      steps.push({
        description: `Add term ${i}: ${formatNumber(term, 6)} (current sum: ${formatNumber(result, 6)})`,
        value: result,
        latex: `+ \\frac{${uProductStr}}{${i}!} \\Delta^${i}y_0 = + \\frac{${formatNumber(uProduct, 6)}}{${factorial(i)}} \\times ${formatNumber(diffTable[i][0], 6)} = ${formatNumber(term, 6)}`
      });
    }
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
  } else if (u > 0.5) {
    warning = '💡 Tip: For x values in the middle or end of the data range, consider using Backward or Central formulas for potentially better accuracy.';
  }

  const computationTime = performance.now() - startTime;

  return {
    method: 'Forward Formula',
    value: result,
    steps,
    computationTime,
    warning
  };
}

