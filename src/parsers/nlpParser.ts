import { ParsedInput, MethodType } from '../types/interpolation';

/**
 * Parse natural language input to extract data points, query point, and method hints
 */
export function parseNaturalLanguage(input: string): ParsedInput {
  const result: ParsedInput = {
    points: [],
    queryX: null,
    suggestedMethod: null
  };

  // Clean input: normalize whitespace
  let cleanInput = input.replace(/\s+/g, ' ').trim();
  // Remove degree symbols and units that might interfere
  cleanInput = cleanInput.replace(/°C|°F|°/g, '');
  
  // ============ PATTERN 1: f(x)=y format ============
  // "f(0)=1, f(1)=2, f(2)=4" or "f(0) = 1"
  const funcPattern = /f\s*\(\s*([+-]?\d+\.?\d*)\s*\)\s*=\s*([+-]?\d+\.?\d*)/gi;
  let match;
  while ((match = funcPattern.exec(cleanInput)) !== null) {
    result.points.push({
      x: parseFloat(match[1]),
      y: parseFloat(match[2])
    });
  }

  // ============ PATTERN 2: (x,y) coordinate format ============
  // "(0,1), (1,2), (2,4)" or "(0, 1)"
  if (result.points.length === 0) {
    const coordPattern = /\(\s*([+-]?\d+\.?\d*)\s*,\s*([+-]?\d+\.?\d*)\s*\)/g;
    while ((match = coordPattern.exec(cleanInput)) !== null) {
      const x = parseFloat(match[1]);
      const y = parseFloat(match[2]);
      if (!result.points.some(p => p.x === x && p.y === y)) {
        result.points.push({ x, y });
      }
    }
  }

  // ============ PATTERN 3: "Label X = Y" format ============
  // "Day 1 = 150.25, Day 2 = 152.50" or "Hour 6 = 18, Hour 9 = 22"
  // "Year 1951 = 33.7" or "Step 1 = 100"
  if (result.points.length === 0) {
    const labelValuePattern = /(?:day|hour|step|week|month|year|point|over|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s*(\d+\.?\d*)\s*=\s*(\d+\.?\d*)/gi;
    while ((match = labelValuePattern.exec(cleanInput)) !== null) {
      const x = parseFloat(match[1]);
      const y = parseFloat(match[2]);
      if (!result.points.some(p => p.x === x)) {
        result.points.push({ x, y });
      }
    }
  }

  // ============ PATTERN 4: "at X km used/consumed Y" format ============
  // "at 1000 km used 50 liters, at 2000 km used 100 liters"
  if (result.points.length === 0) {
    const usagePattern = /at\s+(\d+\.?\d*)\s*(?:km|m|miles?)?\s+(?:used|consumed|spent)\s+(\d+\.?\d*)/gi;
    while ((match = usagePattern.exec(cleanInput)) !== null) {
      result.points.push({
        x: parseFloat(match[1]),
        y: parseFloat(match[2])
      });
    }
  }

  // ============ PATTERN 5: "X = Y liters/units/etc" with context ============
  // "1000 km = 50 liters" or "2000 = 100"
  if (result.points.length === 0) {
    const simpleEqualPattern = /(\d+\.?\d*)\s*(?:km|m|hours?|days?|weeks?|months?|years?)?\s*=\s*(\d+\.?\d*)/gi;
    while ((match = simpleEqualPattern.exec(cleanInput)) !== null) {
      const x = parseFloat(match[1]);
      const y = parseFloat(match[2]);
      // Avoid query point patterns
      if (!cleanInput.toLowerCase().includes(`estimate at ${x}`) && 
          !cleanInput.toLowerCase().includes(`find at ${x}`)) {
        if (!result.points.some(p => p.x === x)) {
          result.points.push({ x, y });
        }
      }
    }
  }

  // ============ PATTERN 6: Paired data with labels ============
  // "Odometer: 1000 2000 3000, Fuel: 50 100 150" or 
  // "x: 0 1 2 3, y: 1 4 9 16"
  if (result.points.length === 0) {
    // Find X values after labels
    const xLabels = /(?:x|odometer|distance|time|year|day|hour|over|month|index|fertilizer|strain|depth)\s*(?:readings?|values?|data)?[:=]?\s*([\d.,\s]+)/i;
    const yLabels = /(?:y|fuel|liters?|consumption|population|temp|temperature|score|runs|recovery|yield|rate|flow|stress|value|output|units?|data|used|gb|price|pkr|usd)[:=]?\s*([\d.,\s]+)/i;
    
    const xMatch = cleanInput.match(xLabels);
    const yMatch = cleanInput.match(yLabels);
    
    if (xMatch && yMatch) {
      const xValues = xMatch[1].split(/[,\s]+/).filter(v => v && !isNaN(parseFloat(v))).map(v => parseFloat(v));
      const yValues = yMatch[1].split(/[,\s]+/).filter(v => v && !isNaN(parseFloat(v))).map(v => parseFloat(v));
      
      const minLen = Math.min(xValues.length, yValues.length);
      for (let i = 0; i < minLen; i++) {
        result.points.push({ x: xValues[i], y: yValues[i] });
      }
    }
  }

  // ============ PATTERN 7: Context sentences ============
  // "covered 100 km in 2 h" or "reached 150 at 3.5 hours"
  if (result.points.length === 0) {
    const contextPattern = /(\d+\.?\d*)\s*(?:km|m|miles?|liters?|units?|runs?|%)?\s+(?:in|at|after)\s+(\d+\.?\d*)\s*(?:h|hrs?|hours?|days?|mins?|minutes?|overs?)?/gi;
    while ((match = contextPattern.exec(cleanInput)) !== null) {
      const y = parseFloat(match[1]);
      const x = parseFloat(match[2]);
      if (!result.points.some(p => p.x === x)) {
        result.points.push({ x, y });
      }
    }
  }

  // ============ PATTERN 8: Simple number pairs ============
  // When we see clear patterns like "1951 = 33.7, 1961 = 42.9"
  if (result.points.length === 0) {
    const pairPattern = /(\d{4})\s*=\s*(\d+\.?\d*)/g;
    while ((match = pairPattern.exec(cleanInput)) !== null) {
      result.points.push({
        x: parseFloat(match[1]),
        y: parseFloat(match[2])
      });
    }
  }

  // ============ PATTERN 9: Inline data with various separators ============
  // "P=1.0 V=10.0, P=2.0 V=5.0" or similar paired data
  if (result.points.length === 0) {
    const inlinePattern = /(?:P|X|T|N)\s*=\s*(\d+\.?\d*)\s*(?:V|Y|S|M)\s*=\s*(\d+\.?\d*)/gi;
    while ((match = inlinePattern.exec(cleanInput)) !== null) {
      result.points.push({
        x: parseFloat(match[1]),
        y: parseFloat(match[2])
      });
    }
  }

  // ============ PATTERN 10: Log/table format ============
  // "log(x): 0 0.301 0.477" combined with "x: 1 2 3"
  if (result.points.length === 0) {
    const logPattern = /(\d+\.?\d*)\s*[,\s]\s*(\d+\.?\d*)/g;
    const allNumbers: number[] = [];
    let numMatch;
    while ((numMatch = logPattern.exec(cleanInput)) !== null) {
      allNumbers.push(parseFloat(numMatch[1]), parseFloat(numMatch[2]));
    }
    
    // If we have an even number of numbers, pair them
    if (allNumbers.length >= 4 && allNumbers.length % 2 === 0) {
      const half = allNumbers.length / 2;
      for (let i = 0; i < half; i++) {
        result.points.push({ x: allNumbers[i], y: allNumbers[i + half] });
      }
    }
  }

  // ============ EXTRACT QUERY POINT ============
  const queryPatterns = [
    // Most specific patterns first
    /estimate\s+(?:at|for)\s+([+-]?\d+\.?\d*)/i,
    /find\s+(?:at|for|value\s+at)\s+([+-]?\d+\.?\d*)/i,
    /estimate\s+f\s*\(\s*([+-]?\d+\.?\d*)\s*\)/i,
    /find\s+f\s*\(\s*([+-]?\d+\.?\d*)\s*\)/i,
    /interpolate\s+(?:at\s+)?([+-]?\d+\.?\d*)/i,
    /(?:query|target)\s*[:=]?\s*([+-]?\d+\.?\d*)/i,
    
    // "Estimate at X km" or "Estimate at X."
    /estimate\s+at\s+([+-]?\d+\.?\d*)\s*(?:km|m|hours?|days?|years?|minutes?|overs?|liters?|units?)?\.?/i,
    /find\s+at\s+([+-]?\d+\.?\d*)\s*(?:km|m|hours?|days?|years?|minutes?|overs?|liters?|units?)?\.?/i,
    
    // "for year 1990" or "for 1990"
    /for\s+(?:year\s+)?(\d{4})(?:\s|$|\.)/i,
    /for\s+(?:day\s+|hour\s+|month\s+)?([+-]?\d+\.?\d*)(?:\s|$|\.)/i,
    
    // End of sentence patterns: "at X." or "at X km."
    /(?:at|for)\s+([+-]?\d+\.?\d*)\s*(?:km|hours?|days?|years?|minutes?|overs?)?\.?\s*$/i,
    
    // Simple "at X" anywhere (less specific)
    /\.\s*(?:estimate|find)?\s*(?:at|for)\s+([+-]?\d+\.?\d*)/i,
    
    // Fallback: just "Estimate X" or "Find X"
    /estimate\s+([+-]?\d+\.?\d*)/i,
    
    // Mid-month patterns
    /mid[- ]?(\w+)/i,
  ];

  for (const pattern of queryPatterns) {
    const m = cleanInput.match(pattern);
    if (m && m[1]) {
      const val = parseFloat(m[1]);
      if (!isNaN(val)) {
        result.queryX = val;
        break;
      }
    }
  }

  // Special case: "mid-April" → estimate around 4.5 (April is month 4)
  if (result.queryX === null) {
    const midMatch = cleanInput.match(/mid[- ]?(january|february|march|april|may|june|july|august|september|october|november|december)/i);
    if (midMatch) {
      const months: Record<string, number> = {
        'january': 1.5, 'february': 2.5, 'march': 3.5, 'april': 4.5,
        'may': 5.5, 'june': 6.5, 'july': 7.5, 'august': 8.5,
        'september': 9.5, 'october': 10.5, 'november': 11.5, 'december': 12.5
      };
      result.queryX = months[midMatch[1].toLowerCase()] || null;
    }
  }

  // ============ EXTRACT METHOD HINTS ============
  const methodHints: Array<{ pattern: RegExp; method: MethodType }> = [
    { pattern: /forward/i, method: 'forward' },
    { pattern: /backward/i, method: 'backward' },
    { pattern: /stirling/i, method: 'stirling' },
    { pattern: /bessel/i, method: 'bessel' },
    { pattern: /everett/i, method: 'everett' },
    { pattern: /gauss(?:ian)?\s+forward/i, method: 'gaussian-forward' },
    { pattern: /gauss(?:ian)?\s+backward/i, method: 'gaussian-backward' },
    { pattern: /gauss(?:ian)?/i, method: 'gaussian-forward' }
  ];

  for (const hint of methodHints) {
    if (hint.pattern.test(cleanInput)) {
      result.suggestedMethod = hint.method;
      break;
    }
  }

  // Debug logging
  console.log('NLP Parse Result:', {
    input: cleanInput.substring(0, 100),
    pointsFound: result.points.length,
    queryX: result.queryX,
    points: result.points.slice(0, 5)
  });

  return result;
}

/**
 * Validate parsed input
 */
export function validateParsedInput(parsed: ParsedInput): { valid: boolean; error?: string } {
  if (parsed.points.length < 2) {
    return { 
      valid: false, 
      error: `At least 2 data points are required. Found ${parsed.points.length} point(s). Try a different format like "f(0)=1, f(1)=2, f(2)=4" or "(0,1), (1,2), (2,4)"` 
    };
  }

  if (parsed.queryX === null) {
    return { 
      valid: false, 
      error: 'Query point (x value) not found. Add "estimate at X" or "find at X" to your input.' 
    };
  }

  // Check for duplicate x values
  const xValues = parsed.points.map(p => p.x);
  const uniqueX = new Set(xValues);
  if (uniqueX.size !== xValues.length) {
    return { valid: false, error: 'Duplicate x values detected. Each x must be unique.' };
  }

  return { valid: true };
}
