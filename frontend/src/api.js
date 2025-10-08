const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

export async function fetchParties() {
  const r = await fetch(`${API_BASE}/parties`);
  return r.json();
}

export async function createParty(data) {
  const r = await fetch(`${API_BASE}/parties`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return r.json();
}

export async function fetchReport(year, month) {
  const params = year && month ? `?year=${year}&month=${month}` : '';
  const r = await fetch(`${API_BASE}/parties/report${params}`);
  return r.json();
}

export async function clearParties() {
  const r = await fetch(`${API_BASE}/parties`, { method: 'DELETE' });
  return r.json();
}
