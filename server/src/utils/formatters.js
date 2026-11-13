import {
  convertCurrency,
  formatCurrency,
  formatCompactCurrency,
  getExchangeRates,
  SYMBOLS,
} from '../services/currencyService.js';

export { convertCurrency, formatCurrency, formatCompactCurrency, getExchangeRates, SYMBOLS };

// Backwards-compatible legacy helpers defaulting to INR
export const formatINR = (amount, includeDecimals = false) => {
  return formatCurrency(amount, 'INR', includeDecimals);
};

export const formatCompactINR = (amount) => {
  return formatCompactCurrency(amount, 'INR');
};

export default {
  convertCurrency,
  formatCurrency,
  formatCompactCurrency,
  formatINR,
  formatCompactINR,
  getExchangeRates,
  SYMBOLS,
};
