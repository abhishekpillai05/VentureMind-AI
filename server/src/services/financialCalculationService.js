/**
 * Deterministic Financial Simulation Engine
 * Rigorous backend arithmetic without AI hallucination
 */
export const calculateFinancialModel = (inputs) => {
  const productName = inputs.productName || 'Primary Offering';
  const price = Math.max(0, inputs.price !== undefined ? Number(inputs.price) : 2999);
  const startingCustomers = Math.max(0, inputs.startingCustomers !== undefined ? Number(inputs.startingCustomers) : 100);
  const monthlyGrowthRate = Math.max(-50, Math.min(200, Number(inputs.monthlyGrowthRate) || 8)) / 100;
  const cac = Math.max(0, inputs.cac !== undefined ? Number(inputs.cac) : 4500);
  const variableCostPerCustomer = Math.max(0, inputs.variableCostPerCustomer !== undefined ? Number(inputs.variableCostPerCustomer) : 350);
  
  // Expenses breakdown (in INR)
  const marketingExpenses = Math.max(0, inputs.marketingExpenses !== undefined ? Number(inputs.marketingExpenses) : 50000);
  const employeeExpenses = Math.max(0, inputs.employeeExpenses !== undefined ? Number(inputs.employeeExpenses) : 150000);
  const infrastructureExpenses = Math.max(0, inputs.infrastructureExpenses !== undefined ? Number(inputs.infrastructureExpenses) : 25000);
  const otherExpenses = Math.max(0, inputs.otherExpenses !== undefined ? Number(inputs.otherExpenses) : 15000);

  // Total baseline fixed operating costs
  const fixedMonthlyCosts = marketingExpenses + employeeExpenses + infrastructureExpenses + otherExpenses;
  const initialInvestment = Math.max(0, inputs.initialInvestment !== undefined ? Number(inputs.initialInvestment) : 1000000);

  // Customer retention & LTV assumptions
  const monthlyChurnRate = Math.max(0.5, Math.min(50, Number(inputs.monthlyChurnRate) || 4)) / 100;
  const averageCustomerLifespanMonths = 1 / monthlyChurnRate; // e.g. 1 / 0.04 = 25 months

  // 1. Contribution Margin Per Customer
  const contributionMarginPerCustomer = price - variableCostPerCustomer;
  const contributionMarginRatio = price > 0 ? (contributionMarginPerCustomer / price) : 0;

  // 2. Break-Even Volume
  let breakEvenCustomers = null;
  let breakEvenRevenue = null;
  if (contributionMarginPerCustomer > 0) {
    breakEvenCustomers = Math.ceil(fixedMonthlyCosts / contributionMarginPerCustomer);
    breakEvenRevenue = Math.round(breakEvenCustomers * price);
  }

  // 3. CAC & LTV Metrics
  // LTV = Average lifespan * (Price - Variable Cost) OR Revenue LTV
  const grossLtv = Math.round(price * averageCustomerLifespanMonths);
  const netLtv = Math.round(contributionMarginPerCustomer * averageCustomerLifespanMonths);
  const ltvCacRatio = cac > 0 ? Number((netLtv / cac).toFixed(2)) : 0;
  
  // Payback period (months to recoup CAC from customer contribution margin)
  const paybackMonths = contributionMarginPerCustomer > 0
    ? Number((cac / contributionMarginPerCustomer).toFixed(1))
    : null;

  // 4. Generate 12-Month Forecasts for 3 Scenarios
  const generateScenarioForecast = (growthMultiplier) => {
    const effectiveGrowth = monthlyGrowthRate * growthMultiplier;
    const months = [];
    let currentCustomers = startingCustomers;

    for (let m = 1; m <= 12; m++) {
      // Net new customers factoring monthly growth
      if (m > 1) {
        currentCustomers = Math.round(currentCustomers * (1 + effectiveGrowth));
      }

      const revenue = Math.round(currentCustomers * price);
      const totalVariableCosts = Math.round(currentCustomers * variableCostPerCustomer);
      const totalExpenses = Math.round(fixedMonthlyCosts + totalVariableCosts);
      const grossProfit = Math.round(revenue - totalVariableCosts);
      const netProfit = Math.round(revenue - totalExpenses);
      const profitMargin = revenue > 0 ? Number(((netProfit / revenue) * 100).toFixed(1)) : 0;

      months.push({
        month: `M${m}`,
        monthNumber: m,
        customers: currentCustomers,
        revenue,
        fixedCosts: fixedMonthlyCosts,
        variableCosts: totalVariableCosts,
        totalExpenses,
        grossProfit,
        netProfit,
        profitMargin,
      });
    }
    return months;
  };

  const conservativeForecast = generateScenarioForecast(0.5); // 50% of expected growth
  const realisticForecast = generateScenarioForecast(1.0);    // 100% of expected growth
  const optimisticForecast = generateScenarioForecast(1.5);   // 150% of expected growth

  // Baseline Month 1 Snapshot
  const m1 = realisticForecast[0];

  return {
    currency: 'INR',
    currencySymbol: '₹',
    productName,
    price,
    startingCustomers,
    monthlyGrowthRate: Number((monthlyGrowthRate * 100).toFixed(1)),
    monthlyChurnRate: Number((monthlyChurnRate * 100).toFixed(1)),
    cac,
    variableCostPerCustomer,
    fixedMonthlyCosts,
    breakdownCosts: {
      marketing: marketingExpenses,
      payroll: employeeExpenses,
      infrastructure: infrastructureExpenses,
      other: otherExpenses,
    },
    initialInvestment,
    contributionMarginPerCustomer: Number(contributionMarginPerCustomer.toFixed(2)),
    contributionMarginRatio: Number((contributionMarginRatio * 100).toFixed(1)),
    breakEvenCustomers,
    breakEvenRevenue,
    grossLtv,
    netLtv,
    ltvCacRatio,
    paybackMonths,
    averageCustomerLifespanMonths: Number(averageCustomerLifespanMonths.toFixed(1)),
    month1Snapshot: {
      revenue: m1.revenue,
      expenses: m1.totalExpenses,
      netProfit: m1.netProfit,
      profitMargin: m1.profitMargin,
    },
    forecasts: {
      conservative: conservativeForecast,
      realistic: realisticForecast,
      optimistic: optimisticForecast,
    },
  };
};
