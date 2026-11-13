/**
 * Currency & Exchange Rate Service
 * Base currency: INR (₹)
 * Target currencies supported: INR (₹), USD ($), EUR (€), GBP (£)
 */

const FALLBACK_RATES = {
  base: 'INR',
  rates: {
    INR: 1,
    USD: 0.01063, // Approx ₹94.07 per USD
    EUR: 0.00961, // Approx ₹104.05 per EUR
    GBP: 0.00803, // Approx ₹124.53 per GBP
  },
  lastUpdated: '2026-11-13',
  source: 'fallback',
};

export const SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

let cachedRates = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

export const getExchangeRates = async () => {
  const now = Date.now();

  // Return cached rates if fresh
  if (cachedRates && now - lastFetchTime < CACHE_TTL_MS) {
    return { ...cachedRates, source: 'cache' };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch('https://open.er-api.com/v6/latest/INR', {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`Exchange rate provider returned HTTP ${res.status}`);
    }

    const data = await res.json();
    if (data && data.result === 'success' && data.rates) {
      cachedRates = {
        base: 'INR',
        rates: {
          INR: 1,
          USD: Number(data.rates.USD) || FALLBACK_RATES.rates.USD,
          EUR: Number(data.rates.EUR) || FALLBACK_RATES.rates.EUR,
          GBP: Number(data.rates.GBP) || FALLBACK_RATES.rates.GBP,
        },
        lastUpdated: data.time_last_update_utc
          ? new Date(data.time_last_update_utc).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
          : new Date().toLocaleDateString('en-GB'),
        source: 'live',
      };
      lastFetchTime = now;
      console.log('✅ Live exchange rates refreshed successfully (Base: INR).');
      return cachedRates;
    }
  } catch (err) {
    console.warn(`⚠️ Exchange rate fetch failed (${err.message}). Using fallback cached rates.`);
  }

  // Fallback to previous cache or predefined fallback
  if (!cachedRates) {
    cachedRates = { ...FALLBACK_RATES };
  }
  return cachedRates;
};

/**
 * Converts an INR base amount into target currency
 */
export const convertCurrency = (inrAmount, targetCurrency = 'INR', rates = null) => {
  if (inrAmount === null || inrAmount === undefined || isNaN(inrAmount)) return 0;
  const curr = targetCurrency?.toUpperCase() || 'INR';
  if (curr === 'INR') return Number(inrAmount);

  const activeRates = rates || (cachedRates ? cachedRates.rates : FALLBACK_RATES.rates);
  const rate = activeRates[curr] || 1;
  return Number(inrAmount) * rate;
};

/**
 * Format currency with proper locale grouping (en-IN for INR, en-US/en-GB for others)
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
 * Format compact currency (₹1.5 Cr, ₹50 L, $1.5M, $150k)
 */
export const formatCompactCurrency = (inrAmount, targetCurrency = 'INR', rates = null) => {
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

  // Western currency formatting (M, B, k)
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

export default {
  getExchangeRates,
  convertCurrency,
  formatCurrency,
  formatCompactCurrency,
  SYMBOLS,
};
