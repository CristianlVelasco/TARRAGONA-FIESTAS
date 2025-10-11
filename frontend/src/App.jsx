import React, { useEffect, useState } from 'react';
import { fetchParties, createParty, fetchReport } from './api';
import './App.css';

function App() {
  const [parties, setParties] = useState([]);
  const [report, setReport] = useState(null);
  const [form, setForm] = useState({ cedula: '', invitados: '', horas: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    const ps = await fetchParties();
    setParties(ps);
    const r = await fetchReport();
    setReport(r);
    setLoading(false);
  }

  function calcularMontos(invitados, horas) {
    let precioPorInvitado;
    if (invitados <= 100) precioPorInvitado = 8000;
    else if (invitados <= 500) precioPorInvitado = 6000;
    else precioPorInvitado = 4000;

    let cuotaHoras;
    if (horas <= 3) cuotaHoras = 100000;
    else if (horas <= 6) cuotaHoras = 200000;
    else cuotaHoras = 300000;

    const montoInvitados = invitados * precioPorInvitado;
    const montoHoras = cuotaHoras;
    const total = montoInvitados + montoHoras;
    return { montoInvitados, montoHoras, total };
  }

  function validarFormulario() {
    const errs = {};
    const cedula = form.cedula.trim();
    const invitados = Number(form.invitados);
    const horas = Number(form.horas);

    if (!cedula) errs.cedula = '🫣 Ups, parece que falta la cédula.';
    else if (!/^\d+$/.test(cedula)) errs.cedula = 'Parece que hay un número raro ahí, dale una mirada 👀.';
    else if (cedula.length < 6) errs.cedula = 'Revisa que tu cédula tenga al menos 6 dígitos.';

    if (!form.invitados) errs.invitados = '¿A cuántas personas vas a invitar a la fiesta? 🥳';
    else if (isNaN(invitados) || invitados <= 0 ) errs.invitados = 'Más de cero, por favor 😅 nadie quiere una fiesta vacía.”';
    else if (!Number.isInteger(invitados)) errs.invitados = 'Tus invitados deben ir completos, no por partes 😂';

    if (!form.horas) errs.horas = '¿Cuánto durará la diversión? 🕺';
    else if (isNaN(horas) || horas <= 0 || !Number.isInteger(horas))
      errs.horas = 'Más horas, más rumba 🎶 (pero necesitamos un número válido).';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMensaje(null);
    if (!validarFormulario()) return;

    const { total } = calcularMontos(Number(form.invitados), Number(form.horas));
    const payload = { ...form, invitados: Number(form.invitados), horas: Number(form.horas) };

    try {
      await createParty(payload);
      setForm({ cedula: '', invitados: '', horas: '' });
      await loadAll();

      setMensaje({
        tipo: 'exito',
        texto: `🎉 El monto total a cancelar es $${total.toLocaleString('es-CO')}`
      });

      setTimeout(() => setMensaje(null), 4000);
    } catch (err) {
      console.error(err);
      setMensaje({ tipo: 'error', texto: '❌ Error creando fiesta.' });
    }
  }

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  };

  const fiestasRango = { '1-3': 0, '4-6': 0, '6+': 0 };
  parties.forEach(p => {
    if (p.horas <= 3) fiestasRango['1-3']++;
    else if (p.horas <= 6) fiestasRango['4-6']++;
    else fiestasRango['6+']++;
  });

  return (
    <div className="app-container">
      <header className="main-header">
        <div className="logo">🎉 Tarragona</div>
        <nav className="nav-menu">
          <button onClick={() => scrollToSection('registrar')}>Registrar Fiesta</button>
          <button onClick={() => scrollToSection('reporte')}>Reporte</button>
          <button onClick={() => scrollToSection('listado')}>Listado</button>
        </nav>
      </header>

      <section id="registrar">
        <h1>Registro de fiestas</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <h3>Número de cedula:</h3>
            <input
              placeholder="Cédula (ej: 12345678)"
              value={form.cedula}
              onChange={e => setForm({ ...form, cedula: e.target.value })}
            />
            {errors.cedula && <span className="error-text">{errors.cedula}</span>}
          </div>

          <div className="input-group">
            <h3>Cantidad de invitados:</h3>
            <input
              placeholder="Cantidad de invitados (ej: 100)"
              type="number"
              value={form.invitados}
              onChange={e => setForm({ ...form, invitados: e.target.value })}
            />
            {errors.invitados && <span className="error-text">{errors.invitados}</span>}
          </div>

          <div className="input-group">
            <h3>Número de horas:</h3>
            <input
              placeholder="Número de horas (ej: 5)"
              type="number"
              value={form.horas}
              onChange={e => setForm({ ...form, horas: e.target.value })}
            />
            {errors.horas && <span className="error-text">{errors.horas}</span>}
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit">Crear fiesta</button>
          </div>
        </form>

        {mensaje && (
          <div className={`mensaje ${mensaje.tipo}`}>
            {mensaje.texto}
          </div>
        )}
      </section>

      <section id="reporte">
        <h1>Reporte</h1>
        {loading && <p>Cargando...</p>}
        {report && (
          <div className="resumen-grid">
            <div className="resumen-card"><h3>Total Fiestas</h3><p>{report.totals.partiesCount}</p></div>
            <div className="resumen-card"><h3>Total Invitados</h3><p>{report.totals.totalInvitados}</p></div>
            <div className="resumen-card"><h3>Total Horas</h3><p>{report.totals.totalHoras}</p></div>
            <div className="resumen-card"><h3>Total Recaudado</h3><p>${report.totals.totalAmount.toLocaleString('es-CO')}</p></div>
            <div className="resumen-card"><h3>Fiestas 1–3 horas</h3><p>{fiestasRango['1-3']}</p></div>
            <div className="resumen-card"><h3>Fiestas 4–6 horas</h3><p>{fiestasRango['4-6']}</p></div>
            <div className="resumen-card"><h3>Fiestas más de 6 horas</h3><p>{fiestasRango['6+']}</p></div>
          </div>
        )}
      </section>

      <section id="listado">
        <h1>Últimas fiestas</h1>
        <table>
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
                <td>${p.montoInvitados.toLocaleString('es-CO')}</td>
                <td>${p.montoHoras.toLocaleString('es-CO')}</td>
                <td>${p.total.toLocaleString('es-CO')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default App;