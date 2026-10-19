import API from './axios';

export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);
export const logout = () => API.post('/auth/logout');
export const getMe = () => API.get('/auth/me');
export const changePassword = (data) => API.patch('/auth/me/password', data);
export const updateProfile = (data) => API.patch('/auth/me/profile', data);
