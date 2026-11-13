import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  DEFAULT_RATES,
  SYMBOLS,
  convertCurrency,
  convertToINR,
  formatCurrency,
  formatCompactCurrency,
} from '../utils/formatters';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CurrencyContext = createContext(null);

const STORAGE_KEY_CURRENCY = 'venturemind_currency';
const STORAGE_KEY_RATES = 'venturemind_rates';
const STORAGE_KEY_RATE_DATE = 'venturemind_rate_date';

export const CurrencyProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  // Selected Currency (Default: INR)
  const [currency, setCurrencyState] = useState(() => {
    return localStorage.getItem(STORAGE_KEY_CURRENCY) || 'INR';
  });

  // Rates & Metadata
  const [rates, setRates] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_RATES);
    try {
      return saved ? JSON.parse(saved) : DEFAULT_RATES;
    } catch {
      return DEFAULT_RATES;
    }
  });

  const [rateDate, setRateDate] = useState(() => {
    return localStorage.getItem(STORAGE_KEY_RATE_DATE) || '13 Nov 2026';
  });

  const [isFallback, setIsFallback] = useState(false);
  const [loadingRates, setLoadingRates] = useState(false);

  // Sync with user's saved preferences from database upon login or user change
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      // Fetch latest preferences from API
      api
        .get('/users/preferences')
        .then((res) => {
          if (res.data?.success && res.data.preferences?.currency) {
            const savedCurr = res.data.preferences.currency.toUpperCase();
            if (SYMBOLS[savedCurr] && savedCurr !== currency) {
              setCurrencyState(savedCurr);
              localStorage.setItem(STORAGE_KEY_CURRENCY, savedCurr);
            }
          }
        })
        .catch(() => {
          // If offline or error, continue with local preference
        });
    }
  }, [isAuthenticated, user?.id]);

  // Fetch live exchange rates from backend service on mount
  useEffect(() => {
    const fetchRates = async () => {
      setLoadingRates(true);
      try {
        const res = await api.get('/currency/rates');
        if (res.data?.success && res.data.rates) {
          setRates(res.data.rates);
          setRateDate(res.data.lastUpdated || new Date().toLocaleDateString('en-GB'));
          setIsFallback(res.data.source === 'fallback');

          localStorage.setItem(STORAGE_KEY_RATES, JSON.stringify(res.data.rates));
          if (res.data.lastUpdated) {
            localStorage.setItem(STORAGE_KEY_RATE_DATE, res.data.lastUpdated);
          }
        }
      } catch (err) {
        console.warn('Using cached / fallback exchange rates:', err.message);
        setIsFallback(true);
      } finally {
        setLoadingRates(false);
      }
    };

    fetchRates();
  }, []);

  // Update Currency function
  const setCurrency = async (newCurrency) => {
    const upper = newCurrency?.toUpperCase() || 'INR';
    if (!SYMBOLS[upper]) return;

    setCurrencyState(upper);
    localStorage.setItem(STORAGE_KEY_CURRENCY, upper);

    // If user is authenticated, persist to user_preferences table in MySQL
    if (isAuthenticated) {
      try {
        await api.put('/users/preferences', {
          currency: upper,
          currency_symbol: SYMBOLS[upper] || '₹',
        });
      } catch (err) {
        console.error('Failed to sync currency preference to database:', err);
      }
    }
  };

  // Conversion & Formatting Helpers bound to active currency and rates
  const format = (inrAmount, includeDecimals = false) => {
    return formatCurrency(inrAmount, currency, includeDecimals, rates);
  };

  const formatCompact = (inrAmount) => {
    return formatCompactCurrency(inrAmount, currency, rates);
  };

  const convert = (inrAmount) => {
    return convertCurrency(inrAmount, currency, rates);
  };

  const convertInputToINR = (amountInActiveCurrency) => {
    return convertToINR(amountInActiveCurrency, currency, rates);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        currencySymbol: SYMBOLS[currency] || '₹',
        rates,
        rateDate,
        isFallback,
        loadingRates,
        setCurrency,
        format,
        formatCompact,
        convert,
        convertInputToINR,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export default CurrencyContext;
