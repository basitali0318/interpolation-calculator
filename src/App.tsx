import { useEffect, useRef, useState } from 'react'
import { AppProvider, useAppContext } from './context/AppContext'
import InputSection from './components/InputSection'
import MethodSelector from './components/MethodSelector'
import OutputSection from './components/OutputSection'
import Visualization from './components/Visualization'
import ComparisonTable from './components/ComparisonTable'
import ExportButtons from './components/ExportButtons'
import RealWorldDataSelector from './components/RealWorldData'
import NoiseAnalysis from './components/NoiseAnalysis'
import MethodRecommendations from './components/MethodRecommendations'
import SmoothingAnalysis from './components/SmoothingAnalysis'

function AppContent() {
  const { state } = useAppContext();
  const methodsRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [blinkMethods, setBlinkMethods] = useState(false);
  const [blinkResults, setBlinkResults] = useState(false);
  
  // Track previous values to detect changes
  const prevPointsLength = useRef(0);
  const prevResultsLength = useRef(0);

  // When data is loaded, scroll to methods section and blink
  useEffect(() => {
    if (state.points.length >= 2 && prevPointsLength.current < 2) {
      // Data just became valid - scroll to methods
      setBlinkMethods(true);
      setTimeout(() => {
        methodsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      setTimeout(() => setBlinkMethods(false), 4000);
    }
    prevPointsLength.current = state.points.length;
  }, [state.points.length]);

  // When results are computed, scroll to results section and blink
  useEffect(() => {
    if (state.results.length > 0 && prevResultsLength.current === 0) {
      // Results just computed - scroll to results
      setBlinkResults(true);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      setTimeout(() => setBlinkResults(false), 4000);
    }
    prevResultsLength.current = state.results.length;
  }, [state.results.length]);

  return (
      <div className="min-h-screen bg-gradient-to-br from-stone-100 to-stone-200">
        {/* Header */}
        <header className="bg-gradient-to-r from-teal-700 via-emerald-600 to-teal-700 shadow-xl border-b-4 border-amber-400">
          <div className="container mx-auto px-4 py-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-amber-400 rounded-xl flex items-center justify-center shadow-lg transform -rotate-3">
                <span className="text-3xl">📐</span>
              </div>
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight">
                  InterpolateTutor
                </h1>
                <p className="text-emerald-100 text-sm">
                  Learn interpolation with 6 classic formulas • <span className="text-amber-300 font-medium">Live API Data</span>
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6">
          
          {/* SECTION 1: DATA INPUT */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center text-white font-bold shadow">
                1
              </div>
              <h2 className="text-2xl font-bold text-stone-800">Load Your Data</h2>
              <div className="flex-1 h-px bg-teal-300 ml-4"></div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="bg-teal-600 text-white px-4 py-2 rounded-t-lg font-semibold text-sm">
                  Option A: Fetch from Live API
                </div>
                <div className="border-2 border-t-0 border-teal-200 rounded-b-lg">
                  <RealWorldDataSelector />
                </div>
              </div>
              <div>
                <div className="bg-amber-500 text-white px-4 py-2 rounded-t-lg font-semibold text-sm">
                  Option B: Enter Manually / Upload CSV
                </div>
                <div className="border-2 border-t-0 border-amber-200 rounded-b-lg">
                  <InputSection />
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: SELECT METHODS */}
          <section className="mb-8" ref={methodsRef}>
            <div className={`flex items-center gap-3 mb-4 p-2 rounded-lg transition-all ${
              blinkMethods ? 'bg-amber-100 animate-pulse ring-2 ring-amber-400' : ''
            }`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shadow transition-all ${
                blinkMethods ? 'bg-amber-600 scale-110' : 'bg-amber-500'
              }`}>
                2
              </div>
              <h2 className="text-2xl font-bold text-stone-800">
                Select Methods & Compute
                {blinkMethods && <span className="ml-2 text-amber-600 text-lg">👈 Next step!</span>}
              </h2>
              <div className="flex-1 h-px bg-amber-300 ml-4"></div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="bg-teal-600 text-white px-4 py-2 rounded-t-lg font-semibold text-sm">
                  🎯 Smart Recommendations
                </div>
                <div className="border-2 border-t-0 border-teal-200 rounded-b-lg">
                  <MethodRecommendations />
                </div>
              </div>
              <div>
                <div className="bg-amber-500 text-white px-4 py-2 rounded-t-lg font-semibold text-sm">
                  ☑️ Method Selection
                </div>
                <div className="border-2 border-t-0 border-amber-200 rounded-b-lg">
                  <MethodSelector />
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3: VIEW RESULTS */}
          <section className="mb-8" ref={resultsRef}>
            <div className={`flex items-center gap-3 mb-4 p-2 rounded-lg transition-all ${
              blinkResults ? 'bg-rose-100 animate-pulse ring-2 ring-rose-400' : ''
            }`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shadow transition-all ${
                blinkResults ? 'bg-rose-600 scale-110' : 'bg-rose-500'
              }`}>
                3
              </div>
              <h2 className="text-2xl font-bold text-stone-800">
                View Results
                {blinkResults && <span className="ml-2 text-rose-600 text-lg">✨ Results ready!</span>}
              </h2>
              <div className="flex-1 h-px bg-rose-300 ml-4"></div>
            </div>
            
            <div className="space-y-6">
              <Visualization />
              
              {/* Smoothing Behavior Analysis - Full Width */}
              <SmoothingAnalysis />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <NoiseAnalysis />
                <ComparisonTable />
              </div>
              
              <OutputSection />
            </div>
          </section>

          {/* SECTION 4: EXPORT */}
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-violet-500 rounded-lg flex items-center justify-center text-white font-bold shadow">
                4
              </div>
              <h2 className="text-2xl font-bold text-stone-800">Export Results</h2>
              <div className="flex-1 h-px bg-violet-300 ml-4"></div>
            </div>
            
            <ExportButtons />
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-stone-800 py-6 border-t-4 border-teal-600">
          <div className="container mx-auto px-4 text-center">
            <p className="text-stone-300">
              <span className="text-amber-400 font-semibold">InterpolateTutor</span> - Educational tool for numerical interpolation
            </p>
            <p className="text-xs mt-2 text-stone-500">
              Data: <span className="text-teal-400">CoinGecko</span> • <span className="text-teal-400">Open-Meteo</span> • <span className="text-teal-400">World Bank</span>
            </p>
          </div>
        </footer>
      </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

export default App
