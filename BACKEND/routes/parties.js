const express = require('express');
const router = express.Router();
const { Party } = require('../models/Party');
const mongoose = require('mongoose');

// Crear una fiesta (POST /api/parties)
router.post('/', async (req, res) => {
  try {
    const { cedula, invitados, horas } = req.body;
    if (!cedula || !invitados || !horas) {
      return res.status(400).json({ error: 'cedula, invitados y horas son obligatorios' });
    }
    const p = new Party({ cedula, invitados, horas });
    await p.save();
    res.status(201).json(p);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'error creando fiesta' });
  }
});

// Listar todas las fiestas (GET /api/parties)
router.get('/', async (req, res) => {
  try {
    const parties = await Party.find().sort({ createdAt: -1 });
    res.json(parties);
  } catch (err) {
    res.status(500).json({ error: 'error obteniendo fiestas' });
  }
});

// Reporte mensual
router.get('/report', async (req, res) => {
  try {
    const { year, month } = req.query;
    let match = {};
    if (year && month) {
      const y = parseInt(year, 10);
      const m = parseInt(month, 10); // 1..12
      const start = new Date(y, m - 1, 1);
      const end = new Date(y, m, 1);
      match = { createdAt: { $gte: start, $lt: end } };
    }

    const totalsAgg = await Party.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalInvitados: { $sum: "$invitados" },
          totalHoras: { $sum: "$horas" },
          totalAmount: { $sum: "$total" },
          count: { $sum: 1 }
        }
      }
    ]);

    const totals = totalsAgg[0] || { totalInvitados: 0, totalHoras: 0, totalAmount: 0, count: 0 };

    const rangesAgg = await Party.aggregate([
      { $match: match },
      {
        $project: {
          range: {
            $switch: {
              branches: [
                { case: { $lte: ["$horas", 3] }, then: "1-3" },
                { case: { $and: [{ $gte: ["$horas", 4] }, { $lte: ["$horas", 6] }] }, then: "4-6" },
                { case: { $gt: ["$horas", 6] }, then: "7+" }
              ],
              default: "unknown"
            }
          }
        }
      },
      { $group: { _id: "$range", count: { $sum: 1 } } }
    ]);

    const ranges = { '1-3': 0, '4-6': 0, '7+': 0 };
    rangesAgg.forEach(r => { ranges[r._id] = r.count; });

    res.json({
      totals: {
        totalInvitados: totals.totalInvitados,
        totalHoras: totals.totalHoras,
        totalAmount: totals.totalAmount,
        partiesCount: totals.count
      },
      ranges
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'error generando reporte' });
  }
});

// Eliminar todas las fiestas (DELETE /api/parties)
router.delete('/', async (req, res) => {
  try {
    await Party.deleteMany({});
    res.json({ message: 'Todas las fiestas fueron eliminadas correctamente.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error eliminando los registros' });
  }
});

module.exports = router;
