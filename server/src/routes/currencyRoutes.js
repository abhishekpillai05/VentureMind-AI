import { Router } from 'express';
import { getExchangeRates } from '../services/currencyService.js';

const router = Router();

router.get('/rates', async (req, res, next) => {
  try {
    const rateData = await getExchangeRates();
    res.status(200).json({
      success: true,
      ...rateData,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
