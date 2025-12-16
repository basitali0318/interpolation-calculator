import { Point } from '../types/interpolation';

export interface DatasetInfo {
  id: string;
  name: string;
  description: string;
  category: 'stock' | 'weather' | 'population' | 'crypto' | 'economic';
  source: string;
}

export const AVAILABLE_DATASETS: DatasetInfo[] = [
  // Cryptocurrency
  {
    id: 'btc-usd',
    name: 'Bitcoin Price (BTC/USD)',
    description: 'Last 10 days Bitcoin closing prices',
    category: 'crypto',
    source: 'CoinGecko API'
  },
  {
    id: 'eth-usd',
    name: 'Ethereum Price (ETH/USD)',
    description: 'Last 10 days Ethereum closing prices',
    category: 'crypto',
    source: 'CoinGecko API'
  },
  {
    id: 'btc-pkr',
    name: 'Bitcoin Price (BTC/PKR)',
    description: 'Last 10 days Bitcoin in Pakistani Rupees',
    category: 'crypto',
    source: 'CoinGecko API'
  },
  {
    id: 'eth-pkr',
    name: 'Ethereum Price (ETH/PKR)',
    description: 'Last 10 days Ethereum in Pakistani Rupees',
    category: 'crypto',
    source: 'CoinGecko API'
  },
  // Pakistan Weather
  {
    id: 'weather-karachi',
    name: '🇵🇰 Karachi Temperature',
    description: '5-day temperature forecast for Karachi',
    category: 'weather',
    source: 'Open-Meteo API'
  },
  {
    id: 'weather-islamabad',
    name: '🇵🇰 Islamabad Temperature',
    description: '5-day temperature forecast for Islamabad',
    category: 'weather',
    source: 'Open-Meteo API'
  },
  {
    id: 'weather-lahore',
    name: '🇵🇰 Lahore Temperature',
    description: '5-day temperature forecast for Lahore',
    category: 'weather',
    source: 'Open-Meteo API'
  },
  {
    id: 'weather-peshawar',
    name: '🇵🇰 Peshawar Temperature',
    description: '5-day temperature forecast for Peshawar',
    category: 'weather',
    source: 'Open-Meteo API'
  },
  {
    id: 'weather-quetta',
    name: '🇵🇰 Quetta Temperature',
    description: '5-day temperature forecast for Quetta',
    category: 'weather',
    source: 'Open-Meteo API'
  },
  // International Weather
  {
    id: 'weather-london',
    name: 'London Temperature',
    description: '5-day temperature forecast for London',
    category: 'weather',
    source: 'Open-Meteo API'
  },
  {
    id: 'weather-newyork',
    name: 'New York Temperature',
    description: '5-day temperature forecast for New York',
    category: 'weather',
    source: 'Open-Meteo API'
  },
  {
    id: 'weather-tokyo',
    name: 'Tokyo Temperature',
    description: '5-day temperature forecast for Tokyo',
    category: 'weather',
    source: 'Open-Meteo API'
  },
  // Population
  {
    id: 'population-pakistan',
    name: '🇵🇰 Pakistan Population',
    description: 'Pakistan population by decade (1960-2020)',
    category: 'population',
    source: 'World Bank API'
  },
  {
    id: 'population-world',
    name: 'World Population Growth',
    description: 'World population by decade (1960-2020)',
    category: 'population',
    source: 'World Bank API'
  },
  {
    id: 'population-usa',
    name: 'USA Population Growth',
    description: 'US population by decade (1960-2020)',
    category: 'population',
    source: 'World Bank API'
  },
  // Economic
  {
    id: 'gdp-pakistan',
    name: '🇵🇰 Pakistan GDP',
    description: 'Pakistan GDP by year (2015-2022)',
    category: 'economic',
    source: 'World Bank API'
  },
  {
    id: 'gdp-world',
    name: 'World GDP Growth',
    description: 'World GDP by year (2015-2022)',
    category: 'economic',
    source: 'World Bank API'
  }
];

interface FetchResult {
  success: boolean;
  points: Point[];
  error?: string;
  metadata?: {
    source: string;
    fetchedAt: string;
    unit?: string;
    description?: string;
  };
}

/**
 * Fetch cryptocurrency price data from CoinGecko API
 */
async function fetchCryptoData(coinId: string, currency: string = 'usd'): Promise<FetchResult> {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=${currency}&days=10&interval=daily`
    );
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    const prices = data.prices as [number, number][];
    
    // Convert to points (day index, price)
    const points: Point[] = prices.slice(0, 10).map((item, index) => ({
      x: index,
      y: parseFloat(item[1].toFixed(2))
    }));
    
    const currencySymbol = currency === 'pkr' ? 'PKR' : 'USD';
    
    return {
      success: true,
      points,
      metadata: {
        source: 'CoinGecko API',
        fetchedAt: new Date().toISOString(),
        unit: currencySymbol,
        description: `${coinId.toUpperCase()} closing prices in ${currencySymbol} (Day 0 = oldest)`
      }
    };
  } catch (error) {
    return {
      success: false,
      points: [],
      error: error instanceof Error ? error.message : 'Failed to fetch crypto data'
    };
  }
}

/**
 * Fetch weather forecast data from Open-Meteo API (free, no API key needed)
 */
async function fetchWeatherData(city: string): Promise<FetchResult> {
  const cities: Record<string, { lat: number; lon: number; name: string }> = {
    // Pakistan Cities
    'karachi': { lat: 24.8607, lon: 67.0011, name: 'Karachi' },
    'islamabad': { lat: 33.6844, lon: 73.0479, name: 'Islamabad' },
    'lahore': { lat: 31.5204, lon: 74.3587, name: 'Lahore' },
    'peshawar': { lat: 34.0151, lon: 71.5249, name: 'Peshawar' },
    'quetta': { lat: 30.1798, lon: 66.9750, name: 'Quetta' },
    // International Cities
    'london': { lat: 51.5074, lon: -0.1278, name: 'London' },
    'newyork': { lat: 40.7128, lon: -74.0060, name: 'New York' },
    'tokyo': { lat: 35.6762, lon: 139.6503, name: 'Tokyo' }
  };
  
  const coords = cities[city];
  if (!coords) {
    return { success: false, points: [], error: 'Unknown city' };
  }
  
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&hourly=temperature_2m&forecast_days=5`
    );
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    const temps = data.hourly.temperature_2m as number[];
    
    // Get temperatures at 6-hour intervals (morning, noon, evening, night)
    const points: Point[] = [];
    for (let i = 0; i < Math.min(12, Math.floor(temps.length / 6)); i++) {
      points.push({
        x: i * 6, // Hours
        y: parseFloat(temps[i * 6].toFixed(1))
      });
    }
    
    return {
      success: true,
      points,
      metadata: {
        source: 'Open-Meteo API',
        fetchedAt: new Date().toISOString(),
        unit: '°C',
        description: `Temperature readings every 6 hours (x = hours from now)`
      }
    };
  } catch (error) {
    return {
      success: false,
      points: [],
      error: error instanceof Error ? error.message : 'Failed to fetch weather data'
    };
  }
}

/**
 * Fetch population data from World Bank API
 */
async function fetchPopulationData(country: string): Promise<FetchResult> {
  const countryCodes: Record<string, string> = {
    'world': 'WLD',
    'usa': 'USA',
    'pakistan': 'PAK'
  };
  const countryCode = countryCodes[country] || 'WLD';
  
  try {
    const response = await fetch(
      `https://api.worldbank.org/v2/country/${countryCode}/indicator/SP.POP.TOTL?format=json&date=1960:2020&per_page=100`
    );
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data[1]) {
      throw new Error('No data available');
    }
    
    // Get data by decade
    const decadeYears = [1960, 1970, 1980, 1990, 2000, 2010, 2020];
    const points: Point[] = [];
    
    for (const year of decadeYears) {
      const entry = data[1].find((d: any) => d.date === year.toString());
      if (entry && entry.value) {
        points.push({
          x: year,
          y: parseFloat((entry.value / 1000000).toFixed(2)) // In millions
        });
      }
    }
    
    // Sort by year ascending
    points.sort((a, b) => a.x - b.x);
    
    return {
      success: true,
      points,
      metadata: {
        source: 'World Bank API',
        fetchedAt: new Date().toISOString(),
        unit: 'Millions',
        description: `Population in millions (x = year)`
      }
    };
  } catch (error) {
    return {
      success: false,
      points: [],
      error: error instanceof Error ? error.message : 'Failed to fetch population data'
    };
  }
}

/**
 * Fetch GDP data from World Bank API
 */
async function fetchGDPData(country: string = 'world'): Promise<FetchResult> {
  const countryCodes: Record<string, string> = {
    'world': 'WLD',
    'pakistan': 'PAK'
  };
  const countryCode = countryCodes[country] || 'WLD';
  
  try {
    const response = await fetch(
      `https://api.worldbank.org/v2/country/${countryCode}/indicator/NY.GDP.MKTP.CD?format=json&date=2015:2022&per_page=100`
    );
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data[1]) {
      throw new Error('No data available');
    }
    
    // For smaller economies like Pakistan, use billions instead of trillions
    const divisor = country === 'pakistan' ? 1e9 : 1e12;
    const unitLabel = country === 'pakistan' ? 'Billion USD' : 'Trillion USD';
    const countryLabel = country === 'pakistan' ? 'Pakistan' : 'World';
    
    const points: Point[] = data[1]
      .filter((d: any) => d.value !== null)
      .map((d: any) => ({
        x: parseInt(d.date),
        y: parseFloat((d.value / divisor).toFixed(2))
      }))
      .sort((a: Point, b: Point) => a.x - b.x);
    
    return {
      success: true,
      points,
      metadata: {
        source: 'World Bank API',
        fetchedAt: new Date().toISOString(),
        unit: unitLabel,
        description: `${countryLabel} GDP in ${unitLabel.toLowerCase()} (x = year)`
      }
    };
  } catch (error) {
    return {
      success: false,
      points: [],
      error: error instanceof Error ? error.message : 'Failed to fetch GDP data'
    };
  }
}

/**
 * Main function to fetch dataset by ID
 */
export async function fetchDataset(datasetId: string): Promise<FetchResult> {
  switch (datasetId) {
    // Cryptocurrency - USD
    case 'btc-usd':
      return fetchCryptoData('bitcoin', 'usd');
    case 'eth-usd':
      return fetchCryptoData('ethereum', 'usd');
    // Cryptocurrency - PKR
    case 'btc-pkr':
      return fetchCryptoData('bitcoin', 'pkr');
    case 'eth-pkr':
      return fetchCryptoData('ethereum', 'pkr');
    // Pakistan Weather
    case 'weather-karachi':
      return fetchWeatherData('karachi');
    case 'weather-islamabad':
      return fetchWeatherData('islamabad');
    case 'weather-lahore':
      return fetchWeatherData('lahore');
    case 'weather-peshawar':
      return fetchWeatherData('peshawar');
    case 'weather-quetta':
      return fetchWeatherData('quetta');
    // International Weather
    case 'weather-london':
      return fetchWeatherData('london');
    case 'weather-newyork':
      return fetchWeatherData('newyork');
    case 'weather-tokyo':
      return fetchWeatherData('tokyo');
    // Population
    case 'population-pakistan':
      return fetchPopulationData('pakistan');
    case 'population-world':
      return fetchPopulationData('world');
    case 'population-usa':
      return fetchPopulationData('usa');
    // GDP
    case 'gdp-pakistan':
      return fetchGDPData('pakistan');
    case 'gdp-world':
      return fetchGDPData('world');
    default:
      return {
        success: false,
        points: [],
        error: `Unknown dataset: ${datasetId}`
      };
  }
}

/**
 * Generate suggested query point based on the dataset
 */
export function getSuggestedQueryPoint(datasetId: string, points: Point[]): number | null {
  if (points.length < 2) return null;
  
  const minX = Math.min(...points.map(p => p.x));
  const maxX = Math.max(...points.map(p => p.x));
  const range = maxX - minX;
  
  // Suggest a point roughly in the middle-ish area
  switch (datasetId) {
    case 'btc-usd':
    case 'eth-usd':
      return parseFloat((minX + range * 0.65).toFixed(1)); // Day 6.5
    case 'weather-london':
    case 'weather-newyork':
    case 'weather-tokyo':
      return parseFloat((minX + range * 0.5).toFixed(0)); // Middle hour
    case 'population-world':
    case 'population-usa':
      return 1975; // Interpolate between decades
    case 'gdp-world':
      return 2019; // Recent year
    default:
      return parseFloat((minX + range * 0.5).toFixed(2));
  }
}

