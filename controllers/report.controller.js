const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const reportService = require('../services/report.service');
const { stringify } = require('csv-stringify/sync');

const getInventorySummary = asyncHandler(async (req, res) => {
  const summary = await reportService.getInventorySummary(req.query);
  return success(res, { summary });
});

const getValuation = asyncHandler(async (req, res) => {
  const data = await reportService.getValuationReport(req.query);
  if (req.query.format === 'csv') {
    const csv = stringify(data.map(p => ({
      Name: p.name, SKU: p.sku, Category: p.category,
      Quantity: p.quantity, Unit: p.unit,
      CostPrice: p.costPrice, InventoryValue: p.inventoryValue,
    })), { header: true });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=valuation.csv');
    return res.send(csv);
  }
  return success(res, { data });
});

const getStockMovements = asyncHandler(async (req, res) => {
  const result = await reportService.getStockMovementsReport(req.query);
  if (req.query.format === 'csv') {
    const csv = stringify(result.movements.map(m => ({
      Date: m.createdAt.toISOString(), Type: m.type,
      Product: m.product?.name, SKU: m.product?.sku,
      Quantity: m.quantity, Unit: m.product?.unit,
      PrevQty: m.previousQuantity, NewQty: m.newQuantity,
      Reference: m.referenceNo || '', Notes: m.notes || '',
      PerformedBy: m.performedBy?.name,
    })), { header: true });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=stock-movements.csv');
    return res.send(csv);
  }
  return success(res, result);
});

const getExpiryReport = asyncHandler(async (req, res) => {
  const data = await reportService.getExpiryReport();
  return success(res, { data });
});

const getLowStockReport = asyncHandler(async (req, res) => {
  const data = await reportService.getLowStockReport();
  return success(res, { data });
});

module.exports = { getInventorySummary, getValuation, getStockMovements, getExpiryReport, getLowStockReport };
