import { Point, DifferenceTable } from '../types/interpolation';
import { formatNumber } from '../utils/mathHelpers';

/**
 * Build forward difference table
 * Δy₀ = y₁ - y₀
 * Δ²y₀ = Δy₁ - Δy₀
 * etc.
 */
export function buildForwardDifferences(points: Point[]): DifferenceTable {
  const n = points.length;
  const table: number[][] = [];

  // Initialize first column with y values
  table[0] = points.map(p => p.y);

  // Build subsequent difference columns
  for (let col = 1; col < n; col++) {
    table[col] = [];
    for (let row = 0; row < n - col; row++) {
      table[col][row] = table[col - 1][row + 1] - table[col - 1][row];
    }
  }

  // Format for display
  return formatDifferenceTable(table, points, 'forward');
}

/**
 * Build backward difference table
 * ∇yₙ = yₙ - yₙ₋₁
 * ∇²yₙ = ∇yₙ - ∇yₙ₋₁
 * etc.
 */
export function buildBackwardDifferences(points: Point[]): DifferenceTable {
  const n = points.length;
  const table: number[][] = [];

  // Initialize first column with y values
  table[0] = points.map(p => p.y);

  // Build subsequent difference columns (working backwards)
  for (let col = 1; col < n; col++) {
    table[col] = [];
    for (let row = col; row < n; row++) {
      table[col][row] = table[col - 1][row] - table[col - 1][row - 1];
    }
  }

  // Format for display
  return formatDifferenceTable(table, points, 'backward');
}

/**
 * Build central difference table
 * Used for Stirling, Bessel, Everett, Gaussian formulas
 */
export function buildCentralDifferences(points: Point[]): DifferenceTable {
  const n = points.length;
  const table: number[][] = [];

  // Initialize first column with y values
  table[0] = points.map(p => p.y);

  // Build difference columns
  for (let col = 1; col < n; col++) {
    table[col] = [];
    for (let row = 0; row < n - col; row++) {
      table[col][row] = table[col - 1][row + 1] - table[col - 1][row];
    }
  }

  // Format for display with central differences notation
  return formatDifferenceTable(table, points, 'central');
}

/**
 * Format difference table for display
 */
function formatDifferenceTable(
  table: number[][],
  points: Point[],
  type: 'forward' | 'backward' | 'central'
): DifferenceTable {
  const n = points.length;
  const formattedTable: DifferenceTable = [];

  // Header row
  const header: string[] = ['x', 'y'];
  for (let i = 1; i < n; i++) {
    if (type === 'forward') {
      header.push(i === 1 ? 'Δy' : `Δ${toSuperscript(i)}y`);
    } else if (type === 'backward') {
      header.push(i === 1 ? '∇y' : `∇${toSuperscript(i)}y`);
    } else {
      header.push(i === 1 ? 'δy' : `δ${toSuperscript(i)}y`);
    }
  }
  formattedTable.push(header);

  // Data rows
  for (let row = 0; row < n; row++) {
    const dataRow: (string | number)[] = [
      formatNumber(points[row].x, 4),
      formatNumber(table[0][row], 6)
    ];

    // Add difference values
    for (let col = 1; col < n; col++) {
      if (type === 'backward') {
        // For backward, only show values at appropriate rows
        if (row >= col && table[col][row] !== undefined) {
          dataRow.push(formatNumber(table[col][row], 6));
        } else {
          dataRow.push('');
        }
      } else {
        // For forward and central
        if (row < n - col && table[col][row] !== undefined) {
          dataRow.push(formatNumber(table[col][row], 6));
        } else {
          dataRow.push('');
        }
      }
    }

    formattedTable.push(dataRow);
  }

  return formattedTable;
}

/**
 * Get raw difference table (unformatted numbers)
 */
export function getRawForwardDifferences(points: Point[]): number[][] {
  const n = points.length;
  const table: number[][] = [];

  table[0] = points.map(p => p.y);

  for (let col = 1; col < n; col++) {
    table[col] = [];
    for (let row = 0; row < n - col; row++) {
      table[col][row] = table[col - 1][row + 1] - table[col - 1][row];
    }
  }

  return table;
}

/**
 * Get raw backward difference table
 */
export function getRawBackwardDifferences(points: Point[]): number[][] {
  const n = points.length;
  const table: number[][] = [];

  table[0] = points.map(p => p.y);

  for (let col = 1; col < n; col++) {
    table[col] = [];
    for (let row = col; row < n; row++) {
      table[col][row] = table[col - 1][row] - table[col - 1][row - 1];
    }
  }

  return table;
}

/**
 * Convert number to superscript for display
 */
function toSuperscript(n: number): string {
  const superscripts: { [key: string]: string } = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
  };
  
  return n.toString().split('').map(digit => superscripts[digit] || digit).join('');
}

