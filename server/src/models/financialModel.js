import { getPool } from '../config/db.js';

export const saveFinancialModel = async ({
  startup_id,
  model_name = 'Base Scenario',
  pricing_model = 'SaaS',
  default_price = 49.0,
  cac = 120.0,
  ltv = 650.0,
  monthly_churn_rate = 4.0,
  monthly_burn_rate = 5000.0,
  inputs = null,
  results = null,
  scenarios = null,
  projections_data = null,
}) => {
  const pool = getPool();
  const [res] = await pool.execute(
    `INSERT INTO financial_models 
     (startup_id, model_name, pricing_model, default_price, cac, ltv, monthly_churn_rate, monthly_burn_rate, inputs, results, scenarios, projections_data)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      startup_id,
      model_name,
      pricing_model,
      default_price,
      cac,
      ltv,
      monthly_churn_rate,
      monthly_burn_rate,
      inputs ? JSON.stringify(inputs) : null,
      results ? JSON.stringify(results) : null,
      scenarios ? JSON.stringify(scenarios) : null,
      projections_data ? JSON.stringify(projections_data) : (results ? JSON.stringify(results.forecasts) : null),
    ]
  );
  return { id: res.insertId };
};

const safeParse = (val) => {
  if (!val) return null;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch {
    return null;
  }
};

export const getFinancialModelsByStartup = async (startup_id) => {
  const pool = getPool();
  const [rows] = await pool.execute(
    `SELECT * FROM financial_models WHERE startup_id = ? ORDER BY id DESC`,
    [startup_id]
  );
  return rows.map((r) => ({
    ...r,
    inputs: safeParse(r.inputs),
    results: safeParse(r.results),
    scenarios: safeParse(r.scenarios),
    projections_data: safeParse(r.projections_data),
  }));
};

export const getLatestFinancialModelByStartup = async (startup_id) => {
  const pool = getPool();
  const [rows] = await pool.execute(
    `SELECT * FROM financial_models WHERE startup_id = ? ORDER BY id DESC LIMIT 1`,
    [startup_id]
  );
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    ...r,
    inputs: safeParse(r.inputs),
    results: safeParse(r.results),
    scenarios: safeParse(r.scenarios),
    projections_data: safeParse(r.projections_data),
  };
};

export const deleteFinancialModelById = async (model_id, startup_id) => {
  const pool = getPool();
  const [res] = await pool.execute(
    `DELETE FROM financial_models WHERE id = ? AND startup_id = ?`,
    [model_id, startup_id]
  );
  return res.affectedRows > 0;
};
