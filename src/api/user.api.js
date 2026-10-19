import API from './axios';

export const getUsers = (params) => API.get('/users', { params });
export const updateUserRole = (id, role) => API.patch(`/users/${id}/role`, { role });
export const toggleUserActive = (id) => API.patch(`/users/${id}/toggle-active`);
