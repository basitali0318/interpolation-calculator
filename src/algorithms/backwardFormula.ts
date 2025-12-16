import { Point, InterpolationResult, Step } from '../types/interpolation';
import { buildBackwardDifferences, getRawBackwardDifferences } from './differenceTable';
import { factorial, formatNumber } from '../utils/mathHelpers';

/**
 * Newton Backward Difference Formula
 * y = yₙ + u∇yₙ + u(u+1)/2!·∇²yₙ + u(u+1)(u+2)/3!·∇³yₙ + ...
 * where u = (x - xₙ)/h
 * 
 * Best for: interpolation near the end of the data set
 */
export function backwardFormula(points: Point[], queryX: number): InterpolationResult {
  const startTime = performance.now();
  const steps: Step[] = [];

  const n = points.length;
  const xn = points[n - 1].x;
  const yn = points[n - 1].y;

  // Step 1: Compute step size h
  const h = points[1].x - points[0].x;
  steps.push({
    description: `Step 1: Compute step size h = ${formatNumber(h, 4)}`,
    value: h,
    latex: `h = ${formatNumber(h, 4)}`
  });

  // Step 2: Compute u
  const u = (queryX - xn) / h;
  steps.push({
    description: `Step 2: Compute u = (x - xₙ)/h = (${formatNumber(queryX, 4)} - ${formatNumber(xn, 4)})/${formatNumber(h, 4)} = ${formatNumber(u, 6)}`,
    value: u,
    latex: `u = \\frac{${formatNumber(queryX, 4)} - ${formatNumber(xn, 4)}}{${formatNumber(h, 4)}} = ${formatNumber(u, 6)}`
  });

  // Step 3: Build backward difference table
  const diffTableFormatted = buildBackwardDifferences(points);
  const diffTable = getRawBackwardDifferences(points);
  steps.push({
    description: 'Step 3: Build backward difference table:',
    table: diffTableFormatted
  });

  // Step 4: Apply Newton Backward formula
  steps.push({
    description: 'Step 4: Apply Newton Backward formula: y = yₙ + u∇yₙ + u(u+1)/2!·∇²yₙ + ...',
    latex: `y = y_n + u\\nabla y_n + \\frac{u(u+1)}{2!}\\nabla^2 y_n + \\frac{u(u+1)(u+2)}{3!}\\nabla^3 y_n + \\cdots`
  });

  // Start with yₙ
  let result = yn;
  steps.push({
    description: `Start with yₙ = ${formatNumber(yn, 6)}`,
    value: result,
    latex: `y_n = ${formatNumber(yn, 6)}`
  });

  // Add each term
  for (let i = 1; i < n; i++) {
    if (diffTable[i] && diffTable[i][n - 1] !== undefined) {
      // Compute u(u+1)(u+2)...(u+(i-1))
      let uProduct = u;
      for (let j = 1; j < i; j++) {
        uProduct *= (u + j);
      }

      const term = (uProduct / factorial(i)) * diffTable[i][n - 1];
      result += term;

      // Build latex for the u product
      let uProductStr = 'u';
      for (let j = 1; j < i; j++) {
        uProductStr += `(u+${j})`;
      }

      steps.push({
        description: `Add term ${i}: ${formatNumber(term, 6)} (current sum: ${formatNumber(result, 6)})`,
        value: result,
        latex: `+ \\frac{${uProductStr}}{${i}!} \\nabla^${i}y_n = + \\frac{${formatNumber(uProduct, 6)}}{${factorial(i)}} \\times ${formatNumber(diffTable[i][n - 1], 6)} = ${formatNumber(term, 6)}`
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
  } else if (u < -0.5) {
    warning = '💡 Tip: For x values in the beginning or middle of the data range, consider using Forward or Central formulas for potentially better accuracy.';
  }

  const computationTime = performance.now() - startTime;

  return {
    method: 'Backward Formula',
    value: result,
    steps,
    computationTime,
    warning
  };
}

