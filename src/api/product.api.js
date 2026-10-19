import API from './axios';

export const getProducts = (params) => API.get('/products', { params });
export const getProduct = (id) => API.get(`/products/${id}`);
export const getProductByQr = (qrId) => API.get(`/products/qr/${qrId}`);
export const createProduct = (data) => API.post('/products', data);
export const updateProduct = (id, data) => API.patch(`/products/${id}`, data);
export const archiveProduct = (id) => API.patch(`/products/${id}/archive`);
