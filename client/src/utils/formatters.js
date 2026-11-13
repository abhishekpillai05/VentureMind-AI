/**
 * Global Currency Formatting & Conversion Utilities (Frontend)
 * Base currency across VentureMind AI: INR (₹)
 * Supported currencies: INR (₹), USD ($), EUR (€), GBP (£)
 */

export const DEFAULT_RATES = {
  INR: 1,
  USD: 0.01063, // Approx ₹94.07 per USD
  EUR: 0.00961, // Approx ₹104.05 per EUR
  GBP: 0.00803, // Approx ₹124.53 per GBP
};

export const SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

export const CURRENCY_NAMES = {
  INR: 'Indian Rupee (INR)',
  USD: 'US Dollar (USD)',
  EUR: 'Euro (EUR)',
  GBP: 'British Pound (GBP)',
};

/**
 * Converts a base INR amount to target currency using provided or default exchange rates
 */
export const convertCurrency = (inrAmount, targetCurrency = 'INR', rates = null) => {
  if (inrAmount === null || inrAmount === undefined || isNaN(inrAmount)) return 0;
  const curr = targetCurrency?.toUpperCase() || 'INR';
  if (curr === 'INR') return Number(inrAmount);

  const activeRates = rates || DEFAULT_RATES;
  const rate = activeRates[curr] || 1;
  return Number(inrAmount) * rate;
};

/**
 * Converts an amount from target currency BACK to base INR
 */
export const convertToINR = (amountInTargetCurrency, sourceCurrency = 'INR', rates = null) => {
  if (amountInTargetCurrency === null || amountInTargetCurrency === undefined || isNaN(amountInTargetCurrency)) return 0;
  const curr = sourceCurrency?.toUpperCase() || 'INR';
  if (curr === 'INR') return Number(amountInTargetCurrency);

  const activeRates = rates || DEFAULT_RATES;
  const rate = activeRates[curr] || 1;
  return Number(amountInTargetCurrency) / rate;
};

/**
 * Formats full currency with appropriate locale grouping:
 * - INR: ₹1,00,000 (Indian grouping: lakhs and crores)
 * - USD: $1,200 or $100,000 (US grouping)
 * - EUR: €1,200 (European grouping)
 * - GBP: £1,200 (UK grouping)
 */
export const formatCurrency = (
  inrAmount,
  targetCurrency = 'INR',
  includeDecimals = false,
  rates = null
) => {
  if (inrAmount === null || inrAmount === undefined || isNaN(inrAmount)) {
    const sym = SYMBOLS[targetCurrency?.toUpperCase()] || '₹';
    return `${sym}0`;
  }

  const curr = targetCurrency?.toUpperCase() || 'INR';
  const converted = convertCurrency(inrAmount, curr, rates);
  const abs = Math.abs(converted);
  const sign = converted < 0 ? '-' : '';
  const sym = SYMBOLS[curr] || '₹';

  if (curr === 'INR') {
    const formatted = new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: includeDecimals ? 2 : 0,
      minimumFractionDigits: includeDecimals ? 2 : 0,
    }).format(abs);
    return `${sign}${sym}${formatted}`;
  }

  const locale = curr === 'EUR' ? 'en-IE' : curr === 'GBP' ? 'en-GB' : 'en-US';
  const formatted = new Intl.NumberFormat(locale, {
    maximumFractionDigits: includeDecimals ? 2 : 0,
    minimumFractionDigits: includeDecimals ? 2 : 0,
  }).format(abs);

  return `${sign}${sym}${formatted}`;
};

/**
 * Formats compact numbers for charts, badges, and headers:
 * - INR: ₹1.5 Cr, ₹25 L, ₹15k
 * - USD / EUR / GBP: $1.5B, $1.5M, $15k
 */
export const formatCompactCurrency = (
  inrAmount,
  targetCurrency = 'INR',
  rates = null
) => {
  if (inrAmount === null || inrAmount === undefined || isNaN(inrAmount)) {
    const sym = SYMBOLS[targetCurrency?.toUpperCase()] || '₹';
    return `${sym}0`;
  }

  const curr = targetCurrency?.toUpperCase() || 'INR';
  const converted = convertCurrency(inrAmount, curr, rates);
  const abs = Math.abs(converted);
  const sign = converted < 0 ? '-' : '';
  const sym = SYMBOLS[curr] || '₹';

  if (curr === 'INR') {
    if (abs >= 10000000) {
      const cr = (abs / 10000000).toFixed(abs % 10000000 === 0 ? 0 : 1);
      return `${sign}${sym}${cr} Cr`;
    }
    if (abs >= 100000) {
      const lk = (abs / 100000).toFixed(abs % 100000 === 0 ? 0 : 1);
      return `${sign}${sym}${lk} L`;
    }
    if (abs >= 1000) {
      const k = (abs / 1000).toFixed(abs % 1000 === 0 ? 0 : 1);
      return `${sign}${sym}${k}k`;
    }
    return `${sign}${sym}${Math.round(abs).toLocaleString('en-IN')}`;
  }

  // Western currencies (B, M, k)
  if (abs >= 1000000000) {
    const b = (abs / 1000000000).toFixed(1);
    return `${sign}${sym}${b}B`;
  }
  if (abs >= 1000000) {
    const m = (abs / 1000000).toFixed(1);
    return `${sign}${sym}${m}M`;
  }
  if (abs >= 1000) {
    const k = (abs / 1000).toFixed(abs % 1000 === 0 ? 0 : 1);
    return `${sign}${sym}${k}k`;
  }
  return `${sign}${sym}${Math.round(abs).toLocaleString('en-US')}`;
};

/**
 * Format plain non-monetary numbers (user counts, milestones)
 */
export const formatNumberIN = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '0';
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(Number(val));
};

// Backwards-compatible aliases
export const formatINR = (amount, includeDecimals = false) =>
  formatCurrency(amount, 'INR', includeDecimals);

export const formatCompactINR = (amount) =>
  formatCompactCurrency(amount, 'INR');

export default {
  convertCurrency,
  convertToINR,
  formatCurrency,
  formatCompactCurrency,
  formatNumberIN,
  formatINR,
  formatCompactINR,
  DEFAULT_RATES,
  SYMBOLS,
  CURRENCY_NAMES,
};
