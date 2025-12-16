// Compute factorial of n
export function factorial(n: number): number {
  if (n < 0) return 0;
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

// Compute binomial coefficient C(n, k)
export function binomialCoeff(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  
  // Use the more efficient formula: C(n,k) = n! / (k! * (n-k)!)
  // But optimize by using: C(n,k) = C(n,k-1) * (n-k+1) / k
  let result = 1;
  for (let i = 1; i <= k; i++) {
    result = result * (n - i + 1) / i;
  }
  return result;
}

// Format number with specified precision
export function formatNumber(num: number, precision: number = 6): string {
  if (Math.abs(num) < 1e-10) return '0';
  
  // For very large or very small numbers, use exponential notation
  if (Math.abs(num) >= 1e6 || (Math.abs(num) < 1e-3 && num !== 0)) {
    return num.toExponential(precision);
  }
  
  return num.toFixed(precision);
}

// Format number for display with appropriate significant figures
export function formatDisplay(num: number, sigFigs: number = 4): string {
  if (Math.abs(num) < 1e-10) return '0';
  
  // Convert to string with specified significant figures
  const str = num.toPrecision(sigFigs);
  
  // Remove trailing zeros and unnecessary decimal point
  return parseFloat(str).toString();
}

// Compute product of (u - i) for i = 0 to n-1
export function computeUProduct(u: number, n: number): number {
  let product = 1;
  for (let i = 0; i < n; i++) {
    product *= (u - i);
  }
  return product;
}

// Compute product of (u + i) for i = 0 to n-1
export function computeUProductBackward(u: number, n: number): number {
  let product = 1;
  for (let i = 0; i < n; i++) {
    product *= (u + i);
  }
  return product;
}

// Round to specified decimal places
export function roundTo(num: number, decimals: number): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(num * multiplier) / multiplier;
}

