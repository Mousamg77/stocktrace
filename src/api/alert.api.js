import API from './axios';

export const getAlerts = (params) => API.get('/alerts', { params });
export const resolveAlert = (id) => API.patch(`/alerts/${id}/resolve`);
export const getAlertCounts = () => API.get('/alerts/counts');
