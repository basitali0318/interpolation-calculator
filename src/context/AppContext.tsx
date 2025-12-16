import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, AppAction, Point, MethodType, InterpolationResult } from '../types/interpolation';

// Initial state
const initialState: AppState = {
  points: [],
  queryX: null,
  selectedMethods: [],
  results: [],
  isComputing: false,
  error: null,
  equallySpaced: false,
  stepSize: null
};

// Reducer function
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_POINTS':
      return {
        ...state,
        points: action.payload,
        results: [] // Clear results when points change
      };

    case 'SET_QUERY_X':
      return {
        ...state,
        queryX: action.payload,
        results: [] // Clear results when query changes
      };

    case 'TOGGLE_METHOD':
      const method = action.payload;
      const isSelected = state.selectedMethods.includes(method);
      return {
        ...state,
        selectedMethods: isSelected
          ? state.selectedMethods.filter(m => m !== method)
          : [...state.selectedMethods, method],
        results: [] // Clear results when methods change
      };

    case 'SELECT_ALL_METHODS':
      const allMethods: MethodType[] = [
        'forward',
        'backward',
        'stirling',
        'bessel',
        'everett',
        'gaussian-forward',
        'gaussian-backward'
      ];
      return {
        ...state,
        selectedMethods: allMethods,
        results: []
      };

    case 'CLEAR_ALL_METHODS':
      return {
        ...state,
        selectedMethods: [],
        results: []
      };

    case 'SET_RESULTS':
      return {
        ...state,
        results: action.payload,
        isComputing: false
      };

    case 'SET_COMPUTING':
      return {
        ...state,
        isComputing: action.payload
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isComputing: false
      };

    case 'SET_EQUAL_SPACING':
      return {
        ...state,
        equallySpaced: action.payload.equallySpaced,
        stepSize: action.payload.stepSize
      };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

// Context type
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  setPoints: (points: Point[]) => void;
  setQueryX: (queryX: number | null) => void;
  toggleMethod: (method: MethodType) => void;
  selectAllMethods: () => void;
  clearAllMethods: () => void;
  setResults: (results: InterpolationResult[]) => void;
  setComputing: (computing: boolean) => void;
  setError: (error: string | null) => void;
  setEqualSpacing: (equallySpaced: boolean, stepSize: number | null) => void;
  reset: () => void;
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Helper functions
  const setPoints = (points: Point[]) => {
    dispatch({ type: 'SET_POINTS', payload: points });
  };

  const setQueryX = (queryX: number | null) => {
    dispatch({ type: 'SET_QUERY_X', payload: queryX });
  };

  const toggleMethod = (method: MethodType) => {
    dispatch({ type: 'TOGGLE_METHOD', payload: method });
  };

  const selectAllMethods = () => {
    dispatch({ type: 'SELECT_ALL_METHODS' });
  };

  const clearAllMethods = () => {
    dispatch({ type: 'CLEAR_ALL_METHODS' });
  };

  const setResults = (results: InterpolationResult[]) => {
    dispatch({ type: 'SET_RESULTS', payload: results });
  };

  const setComputing = (computing: boolean) => {
    dispatch({ type: 'SET_COMPUTING', payload: computing });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const setEqualSpacing = (equallySpaced: boolean, stepSize: number | null) => {
    dispatch({ type: 'SET_EQUAL_SPACING', payload: { equallySpaced, stepSize } });
  };

  const reset = () => {
    dispatch({ type: 'RESET' });
  };

  const value: AppContextType = {
    state,
    dispatch,
    setPoints,
    setQueryX,
    toggleMethod,
    selectAllMethods,
    clearAllMethods,
    setResults,
    setComputing,
    setError,
    setEqualSpacing,
    reset
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Custom hook to use the context
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

