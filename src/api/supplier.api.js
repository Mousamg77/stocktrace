import API from './axios';

export const getSuppliers = (params) => API.get('/suppliers', { params });
export const getSupplier = (id) => API.get(`/suppliers/${id}`);
export const createSupplier = (data) => API.post('/suppliers', data);
export const updateSupplier = (id, data) => API.patch(`/suppliers/${id}`, data);
