import API from './axios';

export const getCategories = (params) => API.get('/categories', { params });
export const getCategory = (id) => API.get(`/categories/${id}`);
export const createCategory = (data) => API.post('/categories', data);
export const updateCategory = (id, data) => API.patch(`/categories/${id}`, data);
