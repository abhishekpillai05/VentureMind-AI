import { getPool } from '../config/db.js';

export const saveMarketResearch = async ({
  startup_id,
  tam_usd = 0,
  sam_usd = 0,
  som_usd = 0,
  tam_explanation = null,
  sam_explanation = null,
  som_explanation = null,
  customer_segments = null,
  growth_drivers = null,
  barriers_to_entry = null,
  market_trends = null,
  market_opportunities = null,
  full_report = null,
}) => {
  const pool = getPool();
  const [result] = await pool.execute(
    `INSERT INTO market_research 
     (startup_id, tam_usd, sam_usd, som_usd, tam_explanation, sam_explanation, som_explanation, customer_segments, growth_drivers, barriers_to_entry, market_trends, market_opportunities, full_report)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      startup_id,
      tam_usd,
      sam_usd,
      som_usd,
      tam_explanation,
      sam_explanation,
      som_explanation,
      customer_segments ? JSON.stringify(customer_segments) : null,
      growth_drivers ? JSON.stringify(growth_drivers) : null,
      barriers_to_entry ? JSON.stringify(barriers_to_entry) : null,
      market_trends ? JSON.stringify(market_trends) : null,
      market_opportunities ? JSON.stringify(market_opportunities) : null,
      full_report ? JSON.stringify(full_report) : null,
    ]
  );
  return { id: result.insertId };
};

export const saveCompetitors = async (startup_id, competitors = []) => {
  if (!competitors || competitors.length === 0) return;
  const pool = getPool();

  // Clear previous competitors for this startup to avoid stale duplicate records
  await pool.execute('DELETE FROM competitors WHERE startup_id = ?', [startup_id]);

  for (const c of competitors) {
    await pool.execute(
      `INSERT INTO competitors (startup_id, competitor_name, market_tier, target_audience, pricing_info, key_features, strengths, weaknesses, differentiator, possible_gaps)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        startup_id,
        c.competitorName || c.competitor_name || 'Competitor',
        c.marketTier || c.market_tier || 'Direct',
        c.targetAudience || c.target_audience || null,
        c.pricingInfo || c.pricing_info || null,
        c.keyFeatures ? JSON.stringify(c.keyFeatures) : null,
        c.strengths || null,
        c.weaknesses || null,
        c.differentiator || null,
        c.possibleGaps || c.possible_gaps || null,
      ]
    );
  }
};

export const getLatestMarketResearchByStartup = async (startup_id) => {
  const pool = getPool();
  const [rows] = await pool.execute(
    `SELECT * FROM market_research WHERE startup_id = ? ORDER BY id DESC LIMIT 1`,
    [startup_id]
  );
  if (rows.length === 0) return null;
  const row = rows[0];
  return {
    ...row,
    customer_segments: typeof row.customer_segments === 'string' ? JSON.parse(row.customer_segments) : row.customer_segments,
    growth_drivers: typeof row.growth_drivers === 'string' ? JSON.parse(row.growth_drivers) : row.growth_drivers,
    barriers_to_entry: typeof row.barriers_to_entry === 'string' ? JSON.parse(row.barriers_to_entry) : row.barriers_to_entry,
    market_trends: typeof row.market_trends === 'string' ? JSON.parse(row.market_trends) : row.market_trends,
    market_opportunities: typeof row.market_opportunities === 'string' ? JSON.parse(row.market_opportunities) : row.market_opportunities,
    full_report: typeof row.full_report === 'string' ? JSON.parse(row.full_report) : row.full_report,
  };
};

export const getCompetitorsByStartup = async (startup_id) => {
  const pool = getPool();
  const [rows] = await pool.execute(
    `SELECT * FROM competitors WHERE startup_id = ? ORDER BY id ASC`,
    [startup_id]
  );
  return rows.map((r) => ({
    ...r,
    key_features: typeof r.key_features === 'string' ? JSON.parse(r.key_features) : r.key_features,
  }));
};

export const getMarketResearchHistoryByStartup = async (startup_id) => {
  const pool = getPool();
  const [rows] = await pool.execute(
    `SELECT id, startup_id, tam_usd, sam_usd, som_usd, created_at 
     FROM market_research WHERE startup_id = ? ORDER BY id DESC`,
    [startup_id]
  );
  return rows;
};
