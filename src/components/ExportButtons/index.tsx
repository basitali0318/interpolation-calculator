import { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import {
  exportToPDF,
  exportToExcel,
  exportComparisonToCSV,
  exportValuesToCSV
} from '../../utils/exporters';

export default function ExportButtons() {
  const { state } = useAppContext();
  const { points, queryX, results } = state;
  const [exportMessage, setExportMessage] = useState('');

  if (results.length === 0 || queryX === null) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Export Results</h2>
        <div className="text-center py-8 text-gray-500">
          <span className="text-4xl mb-3 block">📥</span>
          <p>Complete the interpolation first to export results</p>
        </div>
      </div>
    );
  }

  const showMessage = (message: string, isSuccess: boolean) => {
    setExportMessage(message);
    setTimeout(() => setExportMessage(''), 3000);
  };

  const handleExportExcel = () => {
    try {
      exportToExcel(points, queryX, results);
      showMessage('✓ Excel file downloaded!', true);
    } catch (error) {
      console.error('Excel export error:', error);
      showMessage('✗ Failed to export Excel', false);
    }
  };

  const handleExportPDF = () => {
    try {
      exportToPDF(points, queryX, results);
      showMessage('✓ PDF report downloaded!', true);
    } catch (error) {
      console.error('PDF export error:', error);
      showMessage('✗ Failed to export PDF', false);
    }
  };

  const handleExportComparison = () => {
    try {
      exportComparisonToCSV(results);
      showMessage('✓ Comparison table downloaded!', true);
    } catch (error) {
      console.error('CSV export error:', error);
      showMessage('✗ Failed to export', false);
    }
  };

  const handleExportData = () => {
    try {
      exportValuesToCSV(points, queryX, results);
      showMessage('✓ Data file downloaded!', true);
    } catch (error) {
      console.error('Data export error:', error);
      showMessage('✗ Failed to export data', false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Export Results</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Excel Export */}
        <button
          className="flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-green-600 to-emerald-700 text-white py-4 px-4 rounded-lg hover:from-green-700 hover:to-emerald-800 transition shadow-lg"
          onClick={handleExportExcel}
        >
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/>
            <path d="M8 12h2l1.5 2.5L13 12h2l-2.5 3.5L15 19h-2l-1.5-2.5L10 19H8l2.5-3.5L8 12z"/>
          </svg>
          <span className="font-semibold">Excel Report</span>
          <span className="text-xs opacity-80">Complete with all steps</span>
        </button>

        {/* PDF Export */}
        <button
          className="flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-rose-600 to-red-700 text-white py-4 px-4 rounded-lg hover:from-rose-700 hover:to-red-800 transition shadow-lg"
          onClick={handleExportPDF}
        >
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/>
            <path d="M9 13h1.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5H10v2H9v-5zm1.5 2c.28 0 .5-.22.5-.5s-.22-.5-.5-.5H10v1h.5zM13 13h1.5c.83 0 1.5.67 1.5 1.5V16c0 .83-.67 1.5-1.5 1.5H13v1h-1v-5h1v-.5zm1.5 3c.28 0 .5-.22.5-.5v-1c0-.28-.22-.5-.5-.5H14v2h.5z"/>
          </svg>
          <span className="font-semibold">PDF Report</span>
          <span className="text-xs opacity-80">Formatted document</span>
        </button>

        {/* CSV Comparison */}
        <button
          className="flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-amber-500 to-orange-600 text-white py-4 px-4 rounded-lg hover:from-amber-600 hover:to-orange-700 transition shadow-lg"
          onClick={handleExportComparison}
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="font-semibold">Comparison</span>
          <span className="text-xs opacity-80">Methods comparison</span>
        </button>

        {/* CSV Data */}
        <button
          className="flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-teal-500 to-cyan-600 text-white py-4 px-4 rounded-lg hover:from-teal-600 hover:to-cyan-700 transition shadow-lg"
          onClick={handleExportData}
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span className="font-semibold">Raw Data</span>
          <span className="text-xs opacity-80">Points & results</span>
        </button>
      </div>

      {/* Export message */}
      {exportMessage && (
        <div className={`mt-4 p-3 rounded-lg text-center font-medium ${
          exportMessage.includes('✓')
            ? 'bg-green-100 text-green-700 border border-green-300'
            : 'bg-red-100 text-red-700 border border-red-300'
        }`}>
          {exportMessage}
        </div>
      )}

      {/* Format descriptions */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div className="bg-gray-50 p-3 rounded-lg">
          <span className="font-semibold text-green-700">📊 Excel Report:</span>
          <p className="text-gray-600 mt-1">Complete report with data points, all results, statistics, and step-by-step solutions. Opens in Microsoft Excel.</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <span className="font-semibold text-rose-700">📄 PDF Report:</span>
          <p className="text-gray-600 mt-1">Formatted document with complete analysis, all calculation steps, and difference tables.</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <span className="font-semibold text-amber-700">📈 Comparison:</span>
          <p className="text-gray-600 mt-1">Side-by-side method comparison with rankings and statistics.</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <span className="font-semibold text-teal-700">📁 Raw Data:</span>
          <p className="text-gray-600 mt-1">Original data points and interpolation results for further analysis.</p>
        </div>
      </div>

      {/* Tip */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-700">
          💡 <strong>Tip:</strong> Use the camera icon 📷 in the visualization chart to download the graph as PNG image.
        </p>
      </div>
    </div>
  );
}
