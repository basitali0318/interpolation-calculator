# 📐 InterpolateTutor

An interactive web application for learning numerical interpolation methods using **real-world data from live APIs**. Built with React, TypeScript, and modern web technologies.

> 📖 **New to InterpolateTutor?** Check out the complete [User Guide](USER_GUIDE.md) for step-by-step instructions!

## ✨ What's New

- 🌐 **Real-World Data**: Fetch live data from CoinGecko, Open-Meteo, and World Bank APIs
- 📊 **Noise Analysis**: See how noise amplifies in higher-order differences
- 🎯 **Smart Recommendations**: AI-powered method suggestions based on your data
- 🎨 **Modern UI**: Fresh teal/emerald + amber color scheme

## Features

### 📊 Six Interpolation Methods

1. **Forward Formula** (Newton Forward Difference) - Best for points near the beginning
2. **Backward Formula** (Newton Backward Difference) - Best for points near the end
3. **Stirling's Formula** - Central interpolation for odd number of points
4. **Bessel's Formula** - Central interpolation for even number of points
5. **Everett's Formula** - Simplified central interpolation (even differences only)
6. **Gaussian Formulas** (Forward & Backward) - Near-central interpolation

### 🌐 Real-World Data Sources

| Category | Datasets | API |
|----------|----------|-----|
| 💰 Cryptocurrency | Bitcoin, Ethereum prices | CoinGecko |
| 🌡️ Weather | London, New York, Tokyo temps | Open-Meteo |
| 👥 Population | World & USA growth | World Bank |
| 💵 Economic | World GDP | World Bank |

### 🎯 Key Capabilities

- **Real-World Data**: Fetch live data from public APIs with one click
- **Natural Language Input**: Type problems in plain English (e.g., "Given f(0)=1, f(1)=2, estimate f(0.5)")
- **Noise Analysis**: Visualize how noise affects each difference order
- **Smart Recommendations**: Get method suggestions based on noise level and query position
- **Multiple Input Methods**: NLP, manual table entry, or CSV file upload
- **Step-by-Step Solutions**: Detailed explanations with LaTeX-rendered formulas
- **Interactive Visualization**: Plotly charts with data points and interpolated values
- **Method Comparison**: Side-by-side comparison of all selected methods
- **Multiple Export Options**: LaTeX, PDF, CSV, and PNG formats

## Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Usage

### 1. Input Data

Choose one of three input methods:

**Natural Language Tab:**
```
Given f(0)=1, f(0.5)=1.5, f(1)=2.5, f(1.5)=4.0, f(2)=6.0, estimate f(0.7)
```

**Table Input Tab:**
- Manually enter x and y values
- Add/remove rows as needed
- Specify query x value

**File Upload Tab:**
- Upload CSV file with x,y columns
- Format: Two columns (x, y) with or without headers

### 2. Select Methods

**Automatic Selection:**
The app automatically selects the most appropriate method(s) based on your query point position:
- Query near start (0-25%) → Forward Formula
- Query before center (25-40%) → Gaussian Forward + Stirling
- Query at center (40-60%) → Stirling + Bessel (+ Everett)
- Query after center (60-75%) → Gaussian Backward + Bessel
- Query near end (75-100%) → Backward Formula

**Manual Control:**
- Check/uncheck any methods to customize
- Use "Select All" or "Clear All" for convenience
- View method descriptions and recommendations

### 3. Compute

Click "Compute Interpolation" to:
- Validate equal spacing (required for all methods)
- Calculate interpolated values
- Generate step-by-step solutions
- Display results with warnings

### 4. Analyze Results

- **Output Section**: View detailed steps for each method (collapsible)
- **Visualization**: Interactive plot with data points and query markers
- **Comparison Table**: Sort and compare methods by value, time, or accuracy

### 5. Export

- **Copy LaTeX**: Full LaTeX document to clipboard
- **Download PDF**: Complete results as PDF
- **Export CSV**: Comparison table or raw data
- **Save Plot**: Use Plotly's built-in PNG export

## Example Problems

The app includes 12 example problems covering:
- Simple polynomials
- Temperature/time data
- Distance-time problems
- Trigonometric functions
- Method-specific examples

Click any example to load it into the input area.

## Technical Details

### Requirements

- **Data**: Minimum 2 points, must be equally spaced
- **Query Point**: Single x value for interpolation
- **Methods**: All 6 methods require equal spacing (constant h)

### Algorithms Implemented

Each method:
- Builds appropriate difference table (forward, backward, or central)
- Computes u or p parameter
- Evaluates polynomial terms with proper coefficients
- Tracks computation steps for educational display
- Provides accuracy warnings based on query position

### Technologies

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Math Rendering**: KaTeX
- **Visualization**: Plotly.js
- **PDF Generation**: jsPDF + html2canvas
- **CSV Parsing**: PapaParse

## Project Structure

```
src/
├── algorithms/        # Interpolation method implementations
├── components/        # React components
├── context/           # State management
├── parsers/           # NLP and example templates
├── types/             # TypeScript definitions
└── utils/             # Helper functions and formatters
```

## Mathematical Background

### Forward Formula
Uses forward differences (Δ) from the first point:
- Formula: y = y₀ + uΔy₀ + u(u-1)/2!·Δ²y₀ + ...
- Parameter: u = (x - x₀)/h

### Backward Formula
Uses backward differences (∇) from the last point:
- Formula: y = yₙ + u∇yₙ + u(u+1)/2!·∇²yₙ + ...
- Parameter: u = (x - xₙ)/h

### Stirling's Formula
Averages Gauss forward and backward, uses central differences:
- Best for odd number of points
- Symmetric around central point

### Bessel's Formula
For even number of points or between two central values:
- Starts with (y₀ + y₁)/2
- Uses averaged second differences

### Everett's Formula
Simplified method using only even-order differences:
- Formula: y = qy₀ + py₁ + even-difference terms
- Parameters: p = (x - x₀)/h, q = 1 - p

### Gaussian Formulas
Bridge between forward/backward and central methods:
- **Forward**: For points slightly before center
- **Backward**: For points slightly after center

## Automatic Method Selection Guide

The app intelligently selects methods based on query position:

```
Data Range:    |-------|-------|-------|-------|
Position:      0%     25%     50%     75%    100%
               
Selected:      Forward  Gauss-F Stirling Gauss-B Backward
                       +Stirling +Bessel  +Bessel
```

**Example**: Given data from x=0 to x=10:
- Query at x=2 (20%) → Selects **Forward** (near start)
- Query at x=5 (50%) → Selects **Stirling + Bessel** (center)
- Query at x=8 (80%) → Selects **Backward** (near end)

## Tips for Best Results

1. **Method Selection**:
   - Methods are auto-selected intelligently
   - Manually add/remove methods to compare
   - Central methods generally more accurate
   - Compare multiple methods for validation

2. **Data Quality**:
   - Ensure equal spacing between points
   - Use at least 4-5 points for accuracy
   - Avoid extrapolation when possible

3. **Interpretation**:
   - Check computation warnings
   - Compare results across methods
   - Review difference tables for patterns

## Contributing

This is an educational tool. Contributions welcome for:
- Additional example problems
- UI/UX improvements
- Documentation enhancements
- Bug fixes

## License

MIT License - Free for educational and commercial use.

## Author

Built as a comprehensive interpolation learning tool for numerical analysis students.

---

**Note**: All methods require equally spaced data points. For unequally spaced data, consider Lagrange or Newton's divided differences (not implemented in this version).

