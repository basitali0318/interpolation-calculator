import katex from 'katex';

/**
 * Render LaTeX string to HTML using KaTeX
 */
export function renderLatex(latex: string): string {
  try {
    return katex.renderToString(latex, {
      throwOnError: false,
      displayMode: false
    });
  } catch (error) {
    console.error('LaTeX rendering error:', error);
    return latex;
  }
}

/**
 * Render LaTeX in display mode (block)
 */
export function renderLatexDisplay(latex: string): string {
  try {
    return katex.renderToString(latex, {
      throwOnError: false,
      displayMode: true
    });
  } catch (error) {
    console.error('LaTeX rendering error:', error);
    return latex;
  }
}

/**
 * Generate LaTeX for difference table
 */
export function generateDifferenceTableLatex(table: (string | number)[][]): string {
  if (table.length === 0) return '';

  let latex = '\\begin{array}{' + 'c'.repeat(table[0].length) + '}\n';
  
  // Header row
  latex += table[0].map(cell => String(cell)).join(' & ') + ' \\\\\n\\hline\n';
  
  // Data rows
  for (let i = 1; i < table.length; i++) {
    latex += table[i].map(cell => cell === '' ? '' : String(cell)).join(' & ') + ' \\\\\n';
  }
  
  latex += '\\end{array}';
  
  return latex;
}

/**
 * Generate full LaTeX document from results
 */
export function generateFullLatex(
  points: { x: number; y: number }[],
  queryX: number,
  results: any[]
): string {
  let latex = '\\documentclass{article}\n';
  latex += '\\usepackage{amsmath}\n';
  latex += '\\usepackage{array}\n';
  latex += '\\title{Interpolation Results}\n';
  latex += '\\begin{document}\n';
  latex += '\\maketitle\n\n';
  
  // Data points
  latex += '\\section{Given Data Points}\n';
  latex += '\\begin{align*}\n';
  points.forEach((p, i) => {
    latex += `(${p.x}, ${p.y})${i < points.length - 1 ? ', ' : ''}\n`;
  });
  latex += '\\end{align*}\n\n';
  
  latex += `Query Point: $x = ${queryX}$\n\n`;
  
  // Results for each method
  results.forEach(result => {
    latex += `\\section{${result.method}}\n`;
    latex += `Interpolated Value: $y(${queryX}) = ${result.value.toFixed(6)}$\\\\\n`;
    latex += `Computation Time: ${result.computationTime.toFixed(2)} ms\n\n`;
    
    if (result.warning) {
      latex += `\\textbf{Note:} ${result.warning}\n\n`;
    }
    
    // Steps
    if (result.steps && result.steps.length > 0) {
      latex += '\\subsection{Step-by-Step Solution}\n';
      latex += '\\begin{enumerate}\n';
      result.steps.forEach((step: any) => {
        latex += `\\item ${step.description}\n`;
        if (step.latex) {
          latex += `\\[ ${step.latex} \\]\n`;
        }
      });
      latex += '\\end{enumerate}\n\n';
    }
  });
  
  latex += '\\end{document}';
  
  return latex;
}

