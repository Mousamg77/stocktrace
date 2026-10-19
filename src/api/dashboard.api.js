import API from './axios';

export const getDashboardKPIs = () => API.get('/dashboard/kpis');
export const getStockChart = (days) => API.get('/dashboard/stock-chart', { params: { days } });
export const getCategoryDistribution = () => API.get('/dashboard/category-distribution');
export const getTopProducts = () => API.get('/dashboard/top-products');
export const getRecentMovements = () => API.get('/dashboard/recent-movements');
export const getRecentProducts = () => API.get('/dashboard/recent-products');
