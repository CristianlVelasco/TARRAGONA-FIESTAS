import React, { useEffect, useState } from 'react';
import { fetchParties, createParty, fetchReport, clearParties } from './api';

function App() {
  const [parties, setParties] = useState([]);
  const [report, setReport] = useState(null);
  const [form, setForm] = useState({ cedula: '', invitados: '', horas: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    const ps = await fetchParties();
    setParties(ps);
    const r = await fetchReport();
    setReport(r);
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.cedula || !form.invitados || !form.horas) {
      return alert('Completa todos los campos');
    }
    const payload = { cedula: form.cedula, invitados: Number(form.invitados), horas: Number(form.horas) };
    try {
      await createParty(payload);
      setForm({ cedula: '', invitados: '', horas: '' });
      await loadAll();
    } catch (err) {
      console.error(err);
      alert('Error creando fiesta');
    }
  }

  async function handleClear() {
    if (confirm('¿Estás seguro de eliminar todos los registros?')) {
      await clearParties();
      await loadAll();
      alert('Registros eliminados correctamente');
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto', fontFamily: 'Arial, sans-serif' }}>
      <h1>Tarragona — Registro de fiestas</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: '1rem', display: 'grid', gap: 8 }}>
        <input placeholder="Cédula" value={form.cedula} onChange={e => setForm({ ...form, cedula: e.target.value })} />
        <input placeholder="Cantidad de invitados" type="number" value={form.invitados} onChange={e => setForm({ ...form, invitados: e.target.value })} />
        <input placeholder="Número de horas" type="number" value={form.horas} onChange={e => setForm({ ...form, horas: e.target.value })} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit">Crear fiesta</button>
          <button type="button" onClick={handleClear}>Limpiar datos</button>
        </div>
      </form>

      <section>
        <h2>Reporte</h2>
        {loading && <div>Cargando...</div>}
        {report && (
          <div>
            <p>Total fiestas: {report.totals.partiesCount}</p>
            <p>Total invitados: {report.totals.totalInvitados}</p>
            <p>Total horas: {report.totals.totalHoras}</p>
            <p>Total recaudado: {report.totals.totalAmount.toFixed(2)}</p>
            <p>Fiestas por rango de horas:</p>
            <ul>
              <li>1-3 horas: {report.ranges['1-3']}</li>
              <li>4-6 horas: {report.ranges['4-6']}</li>
              <li>7+ horas: {report.ranges['7+']}</li>
            </ul>
          </div>
        )}
      </section>

      <section style={{ marginTop: '1rem' }}>
        <h2>Últimas fiestas</h2>
        <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th>Cédula</th>
              <th>Invitados</th>
              <th>Horas</th>
              <th>Monto invitados</th>
              <th>Monto horas</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {parties.map(p => (
              <tr key={p._id}>
                <td>{p.cedula}</td>
                <td>{p.invitados}</td>
                <td>{p.horas}</td>
                <td>{p.montoInvitados.toFixed(2)}</td>
                <td>{p.montoHoras.toFixed(2)}</td>
                <td>{p.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default App;
