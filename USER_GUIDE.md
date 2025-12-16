# 📐 InterpolateTutor - User Guide

Welcome to **InterpolateTutor**, an interactive educational tool for learning numerical interpolation methods using real-world data from live APIs.

---

## 🎯 How the App Works

The app is organized into **4 simple steps**. You'll see a progress bar at the top showing where you are:

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Step 1      │───►│ Step 2      │───►│ Step 3      │───►│ Step 4      │
│ 📊 Load Data│    │ ⚙️ Methods  │    │ 📈 Results  │    │ 💾 Export   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

- **Click any step** in the progress bar to jump to that section
- Use **Next →** and **← Back** buttons to navigate
- Completed steps show a ✓ checkmark

---

## 📊 Step 1: Load Data

This is where you input your data points. You have **two options**:

### Option A: Fetch Real-World Data from API (Left Panel)

Click the dropdown and select a dataset:

#### 🇵🇰 Pakistan Data
| Category | Datasets Available |
|----------|-------------------|
| **💰 Crypto (PKR)** | Bitcoin in PKR, Ethereum in PKR |
| **🌡️ Weather** | Karachi, Islamabad, Lahore, Peshawar, Quetta |
| **👥 Population** | Pakistan Population Growth (1960-2020) |
| **💵 Economic** | Pakistan GDP |

#### 🌍 International Data
| Category | Datasets Available |
|----------|-------------------|
| **💰 Crypto (USD)** | Bitcoin in USD, Ethereum in USD |
| **🌡️ Weather** | London, New York, Tokyo |
| **👥 Population** | World, USA |
| **💵 Economic** | World GDP |

**How to use:**
1. Select a dataset from the dropdown
2. Click **"Fetch Data from API"**
3. Wait for data to load (shows loading spinner)
4. Data appears in the table below

### Option B: Enter Data Manually (Right Panel)

Three ways to enter your own data:

#### Natural Language Tab
Type your problem in plain English:
```
Given f(0)=1, f(1)=2, f(2)=4, f(3)=8 estimate f(1.5)
```

**🌍 Real-World Example Problems Available:**
- 🚗 Car Fuel Consumption
- 📈 Stock Price Analysis
- 🌡️ Weather Prediction
- 👥 Pakistan Census Data
- ⚡ Electricity Bill Estimation
- 🏏 Cricket Run Rate
- 🏥 Patient Recovery Rate
- 🌾 Crop Yield Prediction
- 💰 Currency Exchange Rate
- 🚰 Water Tank Filling
- 📱 Mobile Data Usage
- 🏭 Industrial Production

#### Table Input Tab
- Enter x and y values row by row
- Click "+ Add Row" for more points
- Enter your query x value
- Click "Submit Data"

#### File Upload Tab
- Upload a CSV file with x,y columns
- Format: Two columns (x, y)

**After loading data → Click "Continue to Step 2"**

---

## ⚙️ Step 2: Select Methods

Choose which interpolation formulas to use.

### Left Panel: Smart Recommendations 🎯

The app analyzes your data and recommends the best methods:
- **Score %** shows how suitable each method is
- **✓ Green** = positive reasons
- **⚠ Orange** = warnings
- **Click a method** to select/deselect it

### Right Panel: Method Selection ☑️

- Check/uncheck methods manually
- See data status (points loaded, query x, equal spacing)
- Click **"Compute Interpolation"** to calculate

### The 6 Interpolation Methods

| Method | Best For | Smoothing |
|--------|----------|-----------|
| **Newton Forward** | Query near START of data | Low |
| **Newton Backward** | Query near END of data | Low |
| **Stirling** | Query at CENTER (odd points) | Moderate |
| **Bessel** | Query at CENTER (even points) | Moderate |
| **Everett** | NOISY data (best smoothing) | High |
| **Gaussian** | Slightly OFF-CENTER queries | Moderate |

**After selecting methods and computing → Click "Continue to Step 3"**

---

## 📈 Step 3: View Results

See your interpolation results with visualizations.

### Visualization (Top)
- **Teal dots** = Your original data points
- **Star markers** = Interpolated values from each method
- **Dashed line** = Query point location
- Hover over points for exact values
- Use plot toolbar to zoom, pan, or download as PNG

### Noise Analysis (Left)
- Shows noise level in your data (Low/Moderate/High/Very High)
- Displays how noise amplifies in each difference order
- Color-coded usability ratings
- Recommends maximum usable order

### Comparison Table (Right)
- Side-by-side comparison of all methods
- Statistics: Average, Min, Max, Standard Deviation
- Click column headers to sort
- Highlights fastest method and closest to average

### Results Section (Bottom)
- Detailed results for each method
- Click **"Show Step-by-Step Solution"** to see:
  - Difference tables
  - Formula derivation
  - Mathematical steps (LaTeX rendered)

**After reviewing results → Click "Continue to Step 4"**

---

## 💾 Step 4: Export

Download your results in various formats.

| Button | What it does |
|--------|--------------|
| **📄 Copy LaTeX** | Copies complete solution as LaTeX document |
| **📕 Download PDF** | Saves entire page as PDF report |
| **📊 Export Comparison (CSV)** | Downloads method comparison table |
| **📈 Export Data (CSV)** | Downloads raw data and results |

**Tip:** Use the camera icon 📷 in the plot (Step 3) to save graph as PNG!

**Want to try new data? → Click "Start Over with New Data"**

---

## 🇵🇰 Pakistani Data Examples

### Example 1: Karachi Temperature
1. Go to **Step 1**
2. Select **"🇵🇰 Karachi Temperature"** from dropdown
3. Click **"Fetch Data from API"**
4. Go to **Step 2**, select methods, compute
5. View results in **Step 3**

### Example 2: Bitcoin in PKR
1. Go to **Step 1**
2. Select **"Bitcoin Price (BTC/PKR)"**
3. Click **"Fetch Data from API"**
4. See Bitcoin prices in Pakistani Rupees!

### Example 3: Pakistan GDP
1. Select **"🇵🇰 Pakistan GDP"**
2. Fetch data to see GDP growth from 2015-2022
3. Interpolate to estimate values between years

---

## ⚠️ Important Notes

### Equal Spacing Required
All methods need equally spaced x values:
- ✅ Good: x = 0, 1, 2, 3, 4
- ❌ Bad: x = 0, 1, 3, 5, 9

### Minimum Data Points
- At least **2 points** required
- For best results: **5-7 points**

### Noise in Real-World Data
- Weather and crypto data has natural noise
- Check Noise Analysis panel for guidance
- Use Everett for noisy data (best smoothing)

---

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| "No data loaded" | Go to Step 1 and load data first |
| "Equal spacing required" | Your x values must be evenly spaced |
| "API fetch failed" | Check internet connection, try again |
| Can't see results | Make sure you clicked "Compute Interpolation" in Step 2 |

---

## 🎓 Quick Reference

### Step-by-Step Workflow
```
1️⃣ LOAD DATA      → Choose API dataset OR enter manually
2️⃣ SELECT METHODS → Pick formulas, click Compute
3️⃣ VIEW RESULTS   → See graph, noise analysis, comparison
4️⃣ EXPORT         → Download PDF, CSV, or LaTeX
```

### Navigation Tips
- **Progress bar** at top shows all 4 steps
- **Click any step** to jump there directly
- **Next/Back buttons** for sequential navigation
- Completed steps show **✓ checkmark**

---

**Happy Learning! 📐✨**

*InterpolateTutor - Making Numerical Methods Accessible*
