import API from './axios';

export const getReportSummary = (params) => API.get('/reports/summary', { params });
export const getValuation = (params) => API.get('/reports/valuation', { params });
export const getStockMovements = (params) => API.get('/reports/stock-movements', { params });
export const getExpiryReport = () => API.get('/reports/expiry');
export const getLowStockReport = () => API.get('/reports/low-stock');

export const downloadCSV = async (endpoint, filename, params) => {
  const res = await API.get(`/reports/${endpoint}`, { params: { ...params, format: 'csv' }, responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};
