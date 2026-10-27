const API = import.meta.env.VITE_API || 'http://localhost:5000';
export const getUser = () => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } };
export const api = async (path, method = 'GET', body) => {
  const token = localStorage.getItem('token');
  const r = await fetch(API + path, { method, headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) }, body: body && JSON.stringify(body) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.message || 'Request failed');
  return d;
};
