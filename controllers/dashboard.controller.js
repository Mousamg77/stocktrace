const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const dashboardService = require('../services/dashboard.service');

const getKPIs = asyncHandler(async (req, res) => {
  const kpis = await dashboardService.getDashboardKPIs();
  return success(res, { kpis });
});

const getStockChart = asyncHandler(async (req, res) => {
  const data = await dashboardService.getStockChart(req.query.days || 30);
  return success(res, { data });
});

const getCategoryDistribution = asyncHandler(async (req, res) => {
  const data = await dashboardService.getCategoryDistribution();
  return success(res, { data });
});

const getTopMovedProducts = asyncHandler(async (req, res) => {
  const data = await dashboardService.getTopMovedProducts();
  return success(res, { data });
});

const getRecentMovements = asyncHandler(async (req, res) => {
  const data = await dashboardService.getRecentMovements();
  return success(res, { data });
});

const getRecentProducts = asyncHandler(async (req, res) => {
  const data = await dashboardService.getRecentProducts();
  return success(res, { data });
});

module.exports = { getKPIs, getStockChart, getCategoryDistribution, getTopMovedProducts, getRecentMovements, getRecentProducts };
