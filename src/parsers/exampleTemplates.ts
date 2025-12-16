/**
 * Example problems for users to try
 * Real-world interpolation problems from engineering, science, and everyday life
 */
export interface ExampleProblem {
  id: number;
  title: string;
  description: string;
  input: string;
  category: 'simple' | 'moderate' | 'advanced' | 'real-world';
}

export const exampleProblems: ExampleProblem[] = [
  // ============ REAL-WORLD PROBLEMS ============
  {
    id: 101,
    title: '🚗 Car Fuel Consumption',
    description: 'Estimate fuel usage between recorded odometer readings',
    input: 'Odometer: 1000 2000 3000 4000 5000, Fuel: 50 100 152 205 260. Estimate at 2500 km.',
    category: 'real-world'
  },
  {
    id: 102,
    title: '📈 Stock Price Analysis',
    description: 'Estimate stock price between trading days',
    input: 'Day 1 = 150.25, Day 2 = 152.50, Day 3 = 148.75, Day 4 = 155.00, Day 5 = 158.25, Day 6 = 160.50. Estimate at 3.5.',
    category: 'real-world'
  },
  {
    id: 103,
    title: '🌡️ Weather Temperature',
    description: 'Estimate temperature between hourly readings',
    input: 'Hour 6 = 18, Hour 9 = 22, Hour 12 = 28, Hour 15 = 32, Hour 18 = 26, Hour 21 = 20. Estimate at 10.5.',
    category: 'real-world'
  },
  {
    id: 104,
    title: '👥 Pakistan Census',
    description: 'Estimate population between census years',
    input: 'Year: 1951 1961 1972 1981 1998 2017, Population: 33.7 42.9 65.3 84.3 132.4 207.8. Estimate for 1990.',
    category: 'real-world'
  },
  {
    id: 105,
    title: '⚡ Electricity Usage',
    description: 'Estimate monthly electricity consumption',
    input: 'Month: 1 2 3 4 5 6, Units: 250 230 280 350 450 520. Estimate at 4.5.',
    category: 'real-world'
  },
  {
    id: 106,
    title: '🏏 Cricket Run Rate',
    description: 'Estimate runs at specific over',
    input: 'Over 5 = 35, Over 10 = 68, Over 15 = 95, Over 20 = 128, Over 25 = 165, Over 30 = 198. Estimate at 17.',
    category: 'real-world'
  },
  {
    id: 107,
    title: '🏥 Patient Recovery',
    description: 'Estimate recovery percentage over days',
    input: 'Day 0 = 0, Day 3 = 15, Day 6 = 35, Day 9 = 58, Day 12 = 78, Day 15 = 92. Estimate at 7.',
    category: 'real-world'
  },
  {
    id: 108,
    title: '🌾 Crop Yield',
    description: 'Estimate agricultural yield based on fertilizer',
    input: 'Fertilizer: 0 25 50 75 100, Yield: 2000 2800 3400 3800 4000. Estimate at 60.',
    category: 'real-world'
  },
  {
    id: 109,
    title: '💰 USD to PKR Rate',
    description: 'Estimate exchange rate between dates',
    input: 'Day 1 = 278, Day 8 = 280, Day 15 = 282, Day 22 = 279, Day 29 = 281. Estimate at 18.',
    category: 'real-world'
  },
  {
    id: 110,
    title: '🚰 Water Tank Filling',
    description: 'Estimate water level over time',
    input: 'Time: 0 10 20 30 40, Level: 100 350 580 790 980. Estimate at 25.',
    category: 'real-world'
  },
  {
    id: 111,
    title: '📱 Mobile Data Usage',
    description: 'Estimate data consumption pattern',
    input: 'Day: 1 5 10 15 20 25, Data: 0.5 2.3 4.8 7.2 9.5 11.8. Estimate at 12.',
    category: 'real-world'
  },
  {
    id: 112,
    title: '🏭 Factory Output',
    description: 'Estimate production over time',
    input: 'Hour: 1 2 3 4 5 6, Output: 50 95 135 170 200 225. Estimate at 3.5.',
    category: 'real-world'
  },

  // ============ SIMPLE PROBLEMS ============
  {
    id: 1,
    title: 'Simple Polynomial',
    description: 'Basic polynomial interpolation',
    input: 'f(0)=1, f(0.5)=1.5, f(1)=2.5, f(1.5)=4.0, f(2)=6.0. Estimate at 0.7.',
    category: 'simple'
  },
  {
    id: 2,
    title: 'Temperature Data',
    description: 'Temperature measurements',
    input: '(0, 20), (1, 22.5), (2, 25), (3, 27.5), (4, 30). Estimate at 2.3.',
    category: 'simple'
  },
  {
    id: 4,
    title: 'Cubic Function',
    description: 'f(x) = x³ interpolation',
    input: 'f(0)=0, f(1)=1, f(2)=8, f(3)=27, f(4)=64. Estimate at 0.5.',
    category: 'simple'
  },
  {
    id: 5,
    title: 'Quadratic Data',
    description: 'x² + 1 interpolation',
    input: '(1, 2), (2, 5), (3, 10), (4, 17), (5, 26). Estimate at 4.5.',
    category: 'simple'
  },
  {
    id: 6,
    title: 'Square Numbers',
    description: 'Perfect squares',
    input: 'x: 0 1 2 3 4, y: 0 1 4 9 16. Estimate at 2.5.',
    category: 'simple'
  },

  // ============ MODERATE PROBLEMS ============
  {
    id: 7,
    title: 'Stirling Formula',
    description: 'Central interpolation',
    input: 'x: 0 1 2 3 4, y: 1 4 9 16 25. Estimate at 2.2 using Stirling.',
    category: 'moderate'
  },
  {
    id: 8,
    title: 'Exponential Data',
    description: 'e^x interpolation',
    input: 'f(0)=1.0, f(0.5)=1.6487, f(1.0)=2.7183, f(1.5)=4.4817, f(2.0)=7.3891, f(2.5)=12.1825. Estimate at 1.25.',
    category: 'moderate'
  },
  {
    id: 9,
    title: 'Sine Function',
    description: 'Trigonometric interpolation',
    input: 'f(0)=0, f(0.5)=0.4794, f(1.0)=0.8415, f(1.5)=0.9975, f(2.0)=0.9093. Estimate at 0.8.',
    category: 'moderate'
  },
  {
    id: 10,
    title: 'Logarithm Table',
    description: 'Log values interpolation',
    input: 'x: 1 2 3 4 5, y: 0 0.301 0.477 0.602 0.699. Estimate at 2.5.',
    category: 'moderate'
  },
  {
    id: 13,
    title: 'Population Growth',
    description: 'Census data',
    input: 'Year: 1951 1961 1971 1981 1991, Population: 46 66 81 93 101. Estimate at 1975.',
    category: 'moderate'
  },

  // ============ ADVANCED PROBLEMS ============
  {
    id: 11,
    title: 'Gaussian Forward',
    description: 'Point before center',
    input: '(0,0), (1,1), (2,4), (3,9), (4,16), (5,25), (6,36). Estimate at 2.8 using Gaussian forward.',
    category: 'advanced'
  },
  {
    id: 12,
    title: 'Gaussian Backward',
    description: 'Point after center',
    input: 'f(0)=1, f(1)=2, f(2)=4, f(3)=8, f(4)=16, f(5)=32. Estimate at 3.2 using Gaussian backward.',
    category: 'advanced'
  },
  {
    id: 14,
    title: 'Compare All Methods',
    description: 'Central point comparison',
    input: '(0,0), (0.5,0.25), (1.0,1.00), (1.5,2.25), (2.0,4.00), (2.5,6.25), (3.0,9.00). Estimate at 1.5.',
    category: 'advanced'
  },
  {
    id: 15,
    title: 'Everett Formula',
    description: 'Even-order differences only',
    input: '(10,100), (15,225), (20,400), (25,625), (30,900). Estimate at 22 using Everett.',
    category: 'advanced'
  },
  {
    id: 201,
    title: '🔧 Pressure-Volume',
    description: 'Gas behavior (PV=constant)',
    input: 'P: 1 2 3 4 5, V: 10 5 3.33 2.5 2. Estimate at 2.5.',
    category: 'advanced'
  },
  {
    id: 202,
    title: '⚙️ Stress-Strain',
    description: 'Material engineering',
    input: 'Strain: 0 0.1 0.2 0.3 0.4 0.5, Stress: 0 70 130 175 200 210. Estimate at 0.25.',
    category: 'advanced'
  }
];

/**
 * Get example by ID
 */
export function getExampleById(id: number): ExampleProblem | undefined {
  return exampleProblems.find(ex => ex.id === id);
}

/**
 * Get examples by category
 */
export function getExamplesByCategory(category: 'simple' | 'moderate' | 'advanced' | 'real-world'): ExampleProblem[] {
  return exampleProblems.filter(ex => ex.category === category);
}

/**
 * Get real-world examples (featured)
 */
export function getRealWorldExamples(): ExampleProblem[] {
  return exampleProblems.filter(ex => ex.category === 'real-world');
}
