import API from './axios';

export const stockIn = (data) => API.post('/inventory/stock-in', data);
export const stockOut = (data) => API.post('/inventory/stock-out', data);
export const createAdjustment = (data) => API.post('/inventory/adjustments', data);
export const getHistory = (params) => API.get('/inventory/history', { params });
export const getInventorySummary = () => API.get('/inventory/summary');
export const reverseMovement = (id) => API.post(`/inventory/reverse/${id}`);
