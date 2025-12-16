import { jsPDF } from 'jspdf';
import Papa from 'papaparse';
import { InterpolationResult, Point } from '../types/interpolation';

/**
 * Export results as properly formatted PDF document with ALL steps
 */
export function exportToPDF(
  points: Point[],
  queryX: number,
  results: InterpolationResult[]
): void {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  let y = 20;

  // Helper function to add new page if needed
  const checkNewPage = (requiredSpace: number) => {
    if (y + requiredSpace > 280) {
      pdf.addPage();
      y = 20;
    }
  };

  // Title
  pdf.setFontSize(22);
  pdf.setTextColor(13, 148, 136); // Teal color
  pdf.text('InterpolateTutor', margin, y);
  y += 8;
  
  pdf.setFontSize(12);
  pdf.setTextColor(100);
  pdf.text('Interpolation Analysis Report', margin, y);
  y += 5;
  
  pdf.setFontSize(10);
  pdf.text(`Generated: ${new Date().toLocaleString()}`, margin, y);
  y += 15;

  // Section: Data Points
  pdf.setFontSize(14);
  pdf.setTextColor(0);
  pdf.text('1. Input Data Points', margin, y);
  y += 8;

  pdf.setFontSize(10);
  pdf.setTextColor(50);
  
  // Data table header
  pdf.setFillColor(240, 240, 240);
  pdf.rect(margin, y - 4, contentWidth, 8, 'F');
  pdf.setTextColor(0);
  pdf.text('Index', margin + 5, y);
  pdf.text('X', margin + 30, y);
  pdf.text('Y', margin + 70, y);
  y += 8;

  // Data rows
  points.forEach((point, index) => {
    checkNewPage(6);
    pdf.setTextColor(50);
    pdf.text(`${index + 1}`, margin + 5, y);
    pdf.text(`${point.x.toFixed(4)}`, margin + 30, y);
    pdf.text(`${point.y.toFixed(6)}`, margin + 70, y);
    y += 6;
  });
  y += 10;

  // Section: Query Point
  checkNewPage(20);
  pdf.setFontSize(14);
  pdf.setTextColor(0);
  pdf.text('2. Query Point', margin, y);
  y += 8;

  pdf.setFontSize(12);
  pdf.setTextColor(50);
  pdf.text(`Interpolate at x = ${queryX}`, margin, y);
  y += 15;

  // Section: Results Summary
  checkNewPage(30);
  pdf.setFontSize(14);
  pdf.setTextColor(0);
  pdf.text('3. Results Summary', margin, y);
  y += 10;

  // Results table header
  pdf.setFillColor(13, 148, 136);
  pdf.rect(margin, y - 4, contentWidth, 8, 'F');
  pdf.setTextColor(255);
  pdf.setFontSize(10);
  pdf.text('Method', margin + 5, y);
  pdf.text('Interpolated Value', margin + 60, y);
  pdf.text('Time (ms)', margin + 120, y);
  y += 8;

  // Results rows
  results.forEach((result, index) => {
    checkNewPage(8);
    
    if (index % 2 === 0) {
      pdf.setFillColor(248, 248, 248);
      pdf.rect(margin, y - 4, contentWidth, 8, 'F');
    }
    
    pdf.setTextColor(0);
    pdf.text(result.method, margin + 5, y);
    pdf.setTextColor(13, 148, 136);
    pdf.text(result.value.toFixed(6), margin + 60, y);
    pdf.setTextColor(100);
    pdf.text(result.computationTime.toFixed(2), margin + 120, y);
    y += 8;
  });
  y += 10;

  // Section: Statistics
  if (results.length > 1) {
    checkNewPage(40);
    pdf.setFontSize(14);
    pdf.setTextColor(0);
    pdf.text('4. Statistical Summary', margin, y);
    y += 10;

    const values = results.map(r => r.value);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    pdf.setFontSize(11);
    const stats = [
      { label: 'Average Value:', value: avg.toFixed(6) },
      { label: 'Minimum Value:', value: min.toFixed(6) },
      { label: 'Maximum Value:', value: max.toFixed(6) },
      { label: 'Standard Deviation:', value: stdDev.toFixed(6) },
      { label: 'Range:', value: (max - min).toFixed(6) },
    ];

    stats.forEach(stat => {
      pdf.setTextColor(80);
      pdf.text(stat.label, margin, y);
      pdf.setTextColor(0);
      pdf.text(stat.value, margin + 50, y);
      y += 7;
    });
    y += 10;
  }

  // Section: Method Details with ALL Steps
  results.forEach((result, index) => {
    checkNewPage(30);
    
    pdf.setFontSize(12);
    pdf.setTextColor(0);
    pdf.text(`${5 + index}. ${result.method} - Complete Solution`, margin, y);
    y += 8;

    pdf.setFontSize(10);
    pdf.setTextColor(13, 148, 136);
    pdf.text(`Final Result: ${result.value.toFixed(6)}`, margin, y);
    y += 6;

    if (result.warning) {
      pdf.setTextColor(200, 100, 0);
      const warningLines = pdf.splitTextToSize(`Warning: ${result.warning}`, contentWidth);
      warningLines.forEach((line: string) => {
        checkNewPage(5);
        pdf.text(line, margin, y);
        y += 5;
      });
    }

    y += 3;
    pdf.setTextColor(80);
    
    // Show ALL steps (not just 5)
    result.steps.forEach((step, stepIndex) => {
      checkNewPage(12);
      
      // Step description
      const stepText = `Step ${stepIndex + 1}: ${step.description}`;
      const lines = pdf.splitTextToSize(stepText, contentWidth - 5);
      lines.forEach((line: string) => {
        checkNewPage(5);
        pdf.setTextColor(50);
        pdf.text(line, margin, y);
        y += 5;
      });
      
      // Step value if available
      if (step.value !== undefined) {
        checkNewPage(5);
        pdf.setTextColor(13, 148, 136);
        pdf.text(`= ${step.value.toFixed(6)}`, margin + 10, y);
        y += 5;
      }
      
      // Step table if available (difference tables)
      if (step.table && step.table.length > 0) {
        checkNewPage(step.table.length * 5 + 10);
        pdf.setFontSize(8);
        step.table.forEach((row, rowIndex) => {
          checkNewPage(5);
          const rowText = row.map(cell => 
            typeof cell === 'number' ? cell.toFixed(4) : String(cell)
          ).join('    ');
          pdf.setTextColor(rowIndex === 0 ? 0 : 80);
          pdf.text(rowText, margin + 5, y);
          y += 4;
        });
        pdf.setFontSize(10);
        y += 3;
      }
      
      y += 2;
    });

    y += 10;
  });

  // Footer on all pages
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(150);
    pdf.text(
      `InterpolateTutor | Page ${i} of ${pageCount}`,
      pageWidth / 2,
      290,
      { align: 'center' }
    );
  }

  pdf.save('interpolation_report.pdf');
}

/**
 * Export to Excel format (.xlsx simulation using CSV with proper formatting)
 * Creates a proper Excel-compatible file
 */
export function exportToExcel(
  points: Point[],
  queryX: number,
  results: InterpolationResult[]
): void {
  // Create Excel-compatible CSV with multiple sections
  let content = '';
  
  // BOM for Excel UTF-8 compatibility
  content += '\uFEFF';
  
  // Title Section
  content += 'INTERPOLATION ANALYSIS REPORT\n';
  content += `Generated:,${new Date().toLocaleString()}\n`;
  content += '\n';
  
  // Data Points Section
  content += 'INPUT DATA POINTS\n';
  content += 'Index,X Value,Y Value\n';
  points.forEach((point, index) => {
    content += `${index + 1},${point.x},${point.y}\n`;
  });
  content += '\n';
  
  // Query Point
  content += 'QUERY POINT\n';
  content += `X Value:,${queryX}\n`;
  content += '\n';
  
  // Results Summary
  content += 'INTERPOLATION RESULTS\n';
  content += 'Method,Interpolated Value,Computation Time (ms),Warning\n';
  results.forEach(result => {
    const warning = result.warning ? `"${result.warning}"` : '';
    content += `${result.method},${result.value.toFixed(6)},${result.computationTime.toFixed(2)},${warning}\n`;
  });
  content += '\n';
  
  // Statistics
  if (results.length > 1) {
    const values = results.map(r => r.value);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    content += 'STATISTICAL SUMMARY\n';
    content += `Average,${avg.toFixed(6)}\n`;
    content += `Minimum,${min.toFixed(6)}\n`;
    content += `Maximum,${max.toFixed(6)}\n`;
    content += `Standard Deviation,${stdDev.toFixed(6)}\n`;
    content += `Range,${(max - min).toFixed(6)}\n`;
    content += '\n';
  }
  
  // Detailed Steps for each method
  results.forEach(result => {
    content += `\n${result.method.toUpperCase()} - DETAILED STEPS\n`;
    content += `Final Result:,${result.value.toFixed(6)}\n`;
    
    result.steps.forEach((step, index) => {
      content += `Step ${index + 1}:,"${step.description}"`;
      if (step.value !== undefined) {
        content += `,= ${step.value.toFixed(6)}`;
      }
      content += '\n';
      
      // Include table data if present
      if (step.table && step.table.length > 0) {
        step.table.forEach(row => {
          content += row.map(cell => 
            typeof cell === 'number' ? cell.toFixed(6) : `"${cell}"`
          ).join(',') + '\n';
        });
      }
    });
  });

  // Download as .csv (Excel compatible)
  downloadFile(content, 'interpolation_report.csv', 'text/csv;charset=utf-8');
}

/**
 * Export comparison table as enhanced CSV
 */
export function exportComparisonToCSV(results: InterpolationResult[]): void {
  let content = '\uFEFF'; // BOM for Excel
  
  content += 'METHOD COMPARISON TABLE\n';
  content += `Generated:,${new Date().toLocaleString()}\n\n`;
  
  // Header
  content += 'Rank,Method,Interpolated Value,Computation Time (ms),Steps Count,Warning\n';
  
  // Sort by value for ranking
  const sorted = [...results].sort((a, b) => a.value - b.value);
  
  sorted.forEach((result, index) => {
    const warning = result.warning ? `"${result.warning}"` : '';
    content += `${index + 1},${result.method},${result.value.toFixed(6)},${result.computationTime.toFixed(2)},${result.steps.length},${warning}\n`;
  });
  
  // Add statistics
  if (results.length > 1) {
    const values = results.map(r => r.value);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    content += '\nSTATISTICS\n';
    content += `Average Value,${avg.toFixed(6)}\n`;
    content += `Minimum Value,${min.toFixed(6)}\n`;
    content += `Maximum Value,${max.toFixed(6)}\n`;
    content += `Value Range,${(max - min).toFixed(6)}\n`;
  }

  downloadFile(content, 'comparison_table.csv', 'text/csv;charset=utf-8');
}

/**
 * Export complete data as enhanced CSV
 */
export function exportValuesToCSV(
  points: Point[],
  queryX: number,
  results: InterpolationResult[]
): void {
  let content = '\uFEFF'; // BOM for Excel
  
  // Header
  content += 'INTERPOLATION DATA EXPORT\n';
  content += `Generated:,${new Date().toLocaleString()}\n\n`;
  
  // Original Data Points
  content += 'ORIGINAL DATA POINTS\n';
  content += 'Point #,X,Y\n';
  points.forEach((p, i) => {
    content += `${i + 1},${p.x},${p.y}\n`;
  });
  
  content += '\n';
  
  // Query and Results
  content += 'INTERPOLATION QUERY\n';
  content += `Query X Value,${queryX}\n\n`;
  
  content += 'RESULTS BY METHOD\n';
  content += 'Method,Result Value\n';
  results.forEach(r => {
    content += `${r.method},${r.value.toFixed(6)}\n`;
  });
  
  // Horizontal format for easy comparison
  content += '\nALL RESULTS (HORIZONTAL FORMAT)\n';
  content += 'Query X,' + results.map(r => r.method).join(',') + '\n';
  content += `${queryX},` + results.map(r => r.value.toFixed(6)).join(',') + '\n';

  downloadFile(content, 'interpolation_data.csv', 'text/csv;charset=utf-8');
}

/**
 * Download file helper
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
