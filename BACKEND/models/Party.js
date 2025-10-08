const mongoose = require('mongoose');

const partySchema = new mongoose.Schema({
  cedula: { type: String, required: true },
  invitados: { type: Number, required: true, min: 1 },
  horas: { type: Number, required: true, min: 1 },
  montoInvitados: { type: Number, default: 0 },
  montoHoras: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// cálculo según reglas del enunciado
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

partySchema.pre('save', function(next) {
  const vals = calcularMontos(this.invitados, this.horas);
  this.montoInvitados = vals.montoInvitados;
  this.montoHoras = vals.montoHoras;
  this.total = vals.total;
  next();
});

module.exports = { Party: mongoose.model('Party', partySchema), calcularMontos };
