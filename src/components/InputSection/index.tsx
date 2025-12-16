import { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { parseNaturalLanguage, validateParsedInput } from '../../parsers/nlpParser';
import { exampleProblems, getRealWorldExamples } from '../../parsers/exampleTemplates';
import { preprocessPoints } from '../../algorithms/preprocessing';
import { Point } from '../../types/interpolation';
import Papa from 'papaparse';

export default function InputSection() {
  const { setPoints, setQueryX, setError, setEqualSpacing } = useAppContext();
  const [activeTab, setActiveTab] = useState<'nlp' | 'table' | 'file'>('nlp');
  const [nlpInput, setNlpInput] = useState('');
  const [tableData, setTableData] = useState<Point[]>([{ x: 0, y: 0 }]);
  const [queryInput, setQueryInput] = useState('');

  // Handle NLP parsing
  const handleNLPParse = () => {
    const parsed = parseNaturalLanguage(nlpInput);
    const validation = validateParsedInput(parsed);

    if (!validation.valid) {
      setError(validation.error || 'Invalid input');
      return;
    }

    const preprocessed = preprocessPoints(parsed.points);
    if (!preprocessed.isValid) {
      setError(preprocessed.error || 'Invalid points');
      return;
    }

    setPoints(preprocessed.sortedPoints);
    setQueryX(parsed.queryX);
    setEqualSpacing(preprocessed.equallySpaced, preprocessed.stepSize);
    
    // Check for multiple query points
    const multiplePointsPattern = /(?:points?\s+)(\d+\.?\d*)\s*,\s*(\d+\.?\d*)\s*(?:and|,)\s*(\d+\.?\d*)/i;
    const multiMatch = nlpInput.match(multiplePointsPattern);
    if (multiMatch) {
      setError(`ℹ️ Note: Multiple query points detected (${multiMatch[1]}, ${multiMatch[2]}, ${multiMatch[3]}). Using first point: ${parsed.queryX}. Run again for other points.`);
    } else {
      setError(null);
    }
  };

  // Handle table submission
  const handleTableSubmit = () => {
    const filteredData = tableData.filter(p => !isNaN(p.x) && !isNaN(p.y));
    
    if (filteredData.length < 2) {
      setError('At least 2 valid data points are required');
      return;
    }

    const queryValue = parseFloat(queryInput);
    if (isNaN(queryValue)) {
      setError('Please enter a valid query x value');
      return;
    }

    const preprocessed = preprocessPoints(filteredData);
    if (!preprocessed.isValid) {
      setError(preprocessed.error || 'Invalid points');
      return;
    }

    setPoints(preprocessed.sortedPoints);
    setQueryX(queryValue);
    setEqualSpacing(preprocessed.equallySpaced, preprocessed.stepSize);
    setError(null);
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (results) => {
        try {
          const points: Point[] = [];
          const data = results.data as string[][];
          
          // Skip header row if present
          const startRow = (data[0] && (data[0][0].toLowerCase() === 'x' || isNaN(parseFloat(data[0][0])))) ? 1 : 0;
          
          for (let i = startRow; i < data.length; i++) {
            if (data[i].length >= 2) {
              const x = parseFloat(data[i][0]);
              const y = parseFloat(data[i][1]);
              if (!isNaN(x) && !isNaN(y)) {
                points.push({ x, y });
              }
            }
          }

          if (points.length < 2) {
            setError('CSV file must contain at least 2 valid data points');
            return;
          }

          const preprocessed = preprocessPoints(points);
          if (!preprocessed.isValid) {
            setError(preprocessed.error || 'Invalid points');
            return;
          }

          setPoints(preprocessed.sortedPoints);
          setEqualSpacing(preprocessed.equallySpaced, preprocessed.stepSize);
          setError(null);
        } catch (error) {
          setError('Error parsing CSV file');
        }
      },
      error: () => {
        setError('Error reading CSV file');
      }
    });
  };

  // Load example
  const loadExample = (exampleInput: string) => {
    setNlpInput(exampleInput);
    setActiveTab('nlp');
  };

  // Add/remove table rows
  const addTableRow = () => {
    setTableData([...tableData, { x: 0, y: 0 }]);
  };

  const removeTableRow = (index: number) => {
    if (tableData.length > 1) {
      setTableData(tableData.filter((_, i) => i !== index));
    }
  };

  const updateTableRow = (index: number, field: 'x' | 'y', value: string) => {
    const newData = [...tableData];
    newData[index][field] = parseFloat(value) || 0;
    setTableData(newData);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Input Data</h2>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'nlp'
              ? 'text-teal-600 border-b-2 border-teal-600'
              : 'text-gray-600 hover:text-teal-600'
          }`}
          onClick={() => setActiveTab('nlp')}
        >
          Natural Language
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'table'
              ? 'text-teal-600 border-b-2 border-teal-600'
              : 'text-gray-600 hover:text-teal-600'
          }`}
          onClick={() => setActiveTab('table')}
        >
          Table Input
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'file'
              ? 'text-teal-600 border-b-2 border-teal-600'
              : 'text-gray-600 hover:text-teal-600'
          }`}
          onClick={() => setActiveTab('file')}
        >
          File Upload
        </button>
      </div>

      {/* NLP Tab */}
      {activeTab === 'nlp' && (
        <div>
          <textarea
            className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="Enter your problem in natural language, e.g., 'Given f(0)=1, f(1)=2, f(2)=4 estimate f(1.5)'"
            value={nlpInput}
            onChange={(e) => setNlpInput(e.target.value)}
          />
          <button
            className="mt-3 w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 transition shadow-md"
            onClick={handleNLPParse}
          >
            Parse & Validate
          </button>

          {/* Examples */}
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">🌍 Real-World Problems:</p>
            <div className="space-y-1 max-h-32 overflow-y-auto mb-3">
              {getRealWorldExamples().slice(0, 5).map((example) => (
                <button
                  key={example.id}
                  className="w-full text-left text-sm text-amber-700 hover:bg-amber-50 p-2 rounded border border-amber-200 bg-amber-50/50"
                  onClick={() => loadExample(example.input)}
                >
                  {example.title}
                  <span className="text-xs text-amber-500 block">{example.description}</span>
                </button>
              ))}
            </div>
            
            <p className="text-sm font-medium text-gray-700 mb-2">📚 Classic Examples:</p>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {exampleProblems.filter(e => e.category !== 'real-world').slice(0, 4).map((example) => (
                <button
                  key={example.id}
                  className="w-full text-left text-sm text-teal-600 hover:bg-teal-50 p-2 rounded"
                  onClick={() => loadExample(example.input)}
                >
                  {example.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Table Tab */}
      {activeTab === 'table' && (
        <div>
          <div className="max-h-64 overflow-y-auto mb-3">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">x</th>
                  <th className="p-2 text-left">y</th>
                  <th className="p-2 w-16"></th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((point, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">
                      <input
                        type="number"
                        step="any"
                        className="w-full p-1 border border-gray-300 rounded"
                        value={point.x}
                        onChange={(e) => updateTableRow(index, 'x', e.target.value)}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        step="any"
                        className="w-full p-1 border border-gray-300 rounded"
                        value={point.y}
                        onChange={(e) => updateTableRow(index, 'y', e.target.value)}
                      />
                    </td>
                    <td className="p-2">
                      <button
                        className="text-red-600 hover:text-red-800"
                        onClick={() => removeTableRow(index)}
                        disabled={tableData.length <= 1}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            className="w-full mb-3 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition"
            onClick={addTableRow}
          >
            + Add Row
          </button>
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Query x value:
            </label>
            <input
              type="number"
              step="any"
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter x value to interpolate"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
            />
          </div>
          <button
            className="w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 transition shadow-md"
            onClick={handleTableSubmit}
          >
            Submit Data
          </button>
        </div>
      )}

      {/* File Upload Tab */}
      {activeTab === 'file' && (
        <div>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer text-teal-600 hover:text-teal-700"
            >
              <div className="text-4xl mb-2">📁</div>
              <div className="font-medium">Click to upload CSV file</div>
              <div className="text-sm text-gray-500 mt-1">
                File should have two columns: x, y
              </div>
            </label>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p className="font-medium mb-1">CSV Format:</p>
            <pre className="bg-gray-100 p-2 rounded">
              x,y{'\n'}
              0,1{'\n'}
              1,2{'\n'}
              2,4
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

