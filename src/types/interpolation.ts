// Point in 2D space
export interface Point {
  x: number;
  y: number;
}

// Step in the interpolation process
export interface Step {
  description: string;
  latex?: string;
  table?: (string | number)[][];
  value?: number;
}

// Result of an interpolation computation
export interface InterpolationResult {
  method: string;
  value: number;
  steps: Step[];
  error?: number;
  rmse?: number;
  computationTime: number;
  warning?: string;
}

// Types of interpolation methods
export type MethodType = 
  | 'forward' 
  | 'backward' 
  | 'stirling' 
  | 'bessel' 
  | 'everett' 
  | 'gaussian-forward' 
  | 'gaussian-backward';

// Method information for UI
export interface MethodInfo {
  id: MethodType;
  name: string;
  description: string;
  bestFor: string;
  requiresEqualSpacing: boolean;
}

// Application state
export interface AppState {
  points: Point[];
  queryX: number | null;
  selectedMethods: MethodType[];
  results: InterpolationResult[];
  isComputing: boolean;
  error: string | null;
  equallySpaced: boolean;
  stepSize: number | null;
}

// Action types for reducer
export type AppAction =
  | { type: 'SET_POINTS'; payload: Point[] }
  | { type: 'SET_QUERY_X'; payload: number | null }
  | { type: 'TOGGLE_METHOD'; payload: MethodType }
  | { type: 'SELECT_ALL_METHODS' }
  | { type: 'CLEAR_ALL_METHODS' }
  | { type: 'SET_RESULTS'; payload: InterpolationResult[] }
  | { type: 'SET_COMPUTING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_EQUAL_SPACING'; payload: { equallySpaced: boolean; stepSize: number | null } }
  | { type: 'RESET' };

// Parsed result from NLP
export interface ParsedInput {
  points: Point[];
  queryX: number | null;
  suggestedMethod: MethodType | null;
}

// Preprocessing result
export interface PreprocessingResult {
  isValid: boolean;
  error?: string;
  sortedPoints: Point[];
  equallySpaced: boolean;
  stepSize: number | null;
}

// Difference table types
export type DifferenceTable = (string | number)[][];

// Method constants
export const METHOD_INFO: Record<MethodType, MethodInfo> = {
  'forward': {
    id: 'forward',
    name: 'Forward Formula',
    description: 'Newton Forward Difference Formula',
    bestFor: 'Points near the beginning of data set',
    requiresEqualSpacing: true
  },
  'backward': {
    id: 'backward',
    name: 'Backward Formula',
    description: 'Newton Backward Difference Formula',
    bestFor: 'Points near the end of data set',
    requiresEqualSpacing: true
  },
  'stirling': {
    id: 'stirling',
    name: 'Stirling\'s Formula',
    description: 'Central difference formula for odd number of points',
    bestFor: 'Central interpolation with odd number of points',
    requiresEqualSpacing: true
  },
  'bessel': {
    id: 'bessel',
    name: 'Bessel\'s Formula',
    description: 'Central difference formula for even number of points',
    bestFor: 'Central interpolation with even number of points',
    requiresEqualSpacing: true
  },
  'everett': {
    id: 'everett',
    name: 'Everett\'s Formula',
    description: 'Uses only even-order differences',
    bestFor: 'Central interpolation with simplified computation',
    requiresEqualSpacing: true
  },
  'gaussian-forward': {
    id: 'gaussian-forward',
    name: 'Gaussian Forward',
    description: 'Gaussian forward interpolation formula',
    bestFor: 'Points slightly before center',
    requiresEqualSpacing: true
  },
  'gaussian-backward': {
    id: 'gaussian-backward',
    name: 'Gaussian Backward',
    description: 'Gaussian backward interpolation formula',
    bestFor: 'Points slightly after center',
    requiresEqualSpacing: true
  }
};

