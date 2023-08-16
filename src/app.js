import express from 'express'
import { pool } from './db.js'
import {PORT} from './config.js'

const app = express()




app.get('/prueba', async (req, res) => {
  try {
    
    // Consulta sencilla para obtener el número total de registros en la tabla 'nayax_transacciones'
    const query = `
      SELECT COUNT(*) AS TotalRegistros
      FROM nayax_transacciones;
    `;

    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Error executing query:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/consulta-dinamica', async (req, res) => {
  const {
    fechaInicio,
    fechaFin,
    horaInicio,
    horaFin,
    cliente_id,
  } = req.query;

  const query = `
    SELECT 
      A.ProductCodeInMap,
      COUNT(*) AS TotalRegistros,
      SUM(CASE WHEN A.PaymentMethodId = 1 THEN 1 ELSE 0 END) AS TotalRegistrosTarjetaCredito,
      SUM(CASE WHEN A.PaymentMethodId = 3 THEN 1 ELSE 0 END) AS TotalRegistrosEfectivo,
      SUM(CASE WHEN A.PaymentMethodId = 1 THEN SeValue ELSE 0 END) AS TotalGastadoTarjetaCredito,
      SUM(CASE WHEN A.PaymentMethodId = 3 THEN SeValue ELSE 0 END) AS TotalGastadoEfectivo,
      SUM(SeValue) AS TotalCosto
    FROM nayax_transacciones A 
    JOIN nayax_temp B ON B.id= A.cliente_id
    WHERE A.MachineSeTimeDateOnly BETWEEN ? AND ?
      AND A.MachineSeTimeTimeOnly BETWEEN ? AND ? 
      AND B.nombre = ? 
    GROUP BY A.ProductCodeInMap;
  `;

  try {
    const [rows] = await pool.query(query, [fechaInicio, fechaFin, horaInicio, horaFin, cliente_id]);
    res.json(rows);
  } catch (err) {
    console.error('Error executing query:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/', async (req, res) => {
  try {
    const {
      fechaInicio,
      fechaFin,
      horaInicio,
      horaFin,
      nombreMaquinaFiltro,
      codeProductFiltro,
    } = req.query;

    const queryTotalPiezasVendidas = `
      SELECT COUNT(*) AS TotalPiezasVendidas
      FROM nayax_transacciones A
      JOIN nayax_temp B ON B.id = A.cliente_id
      WHERE A.MachineSeTimeDateOnly BETWEEN ? AND ?
      AND A.MachineSeTimeTimeOnly BETWEEN ? AND ?
      AND B.nombre LIKE ?
      AND A.ProductCodeInMap LIKE ?
    `;

    const queryTotalGastadoTarjetaCredito = `
      SELECT SUM(A.SeValue) AS TotalGastadoTarjetaCredito
      FROM nayax_transacciones A
      JOIN nayax_temp B ON B.id = A.cliente_id
      WHERE A.MachineSeTimeDateOnly BETWEEN ? AND ?
      AND A.MachineSeTimeTimeOnly BETWEEN ? AND ?
      AND B.nombre LIKE ?
      AND A.ProductCodeInMap LIKE ?
      AND A.PaymentMethodId = 1
    `;

    const queryTotalGastadoEfectivo = `
      SELECT SUM(A.SeValue) AS TotalGastadoEfectivo
      FROM nayax_transacciones A
      JOIN nayax_temp B ON B.id = A.cliente_id
      WHERE A.MachineSeTimeDateOnly BETWEEN ? AND ?
      AND A.MachineSeTimeTimeOnly BETWEEN ? AND ?
      AND B.nombre LIKE ?
      AND A.ProductCodeInMap LIKE ?
      AND A.PaymentMethodId = 3
    `;

    const queryTarjetaCredito = `
      SELECT COUNT(*) AS TotalTarjetaCredito
      FROM nayax_transacciones A
      JOIN nayax_temp B ON B.id = A.cliente_id
      WHERE A.MachineSeTimeDateOnly BETWEEN ? AND ?
      AND A.MachineSeTimeTimeOnly BETWEEN ? AND ?
      AND B.nombre LIKE ?
      AND A.ProductCodeInMap LIKE ?
      AND A.PaymentMethodId = 1
    `;

    const queryEfectivo = `
      SELECT COUNT(*) AS TotalEfectivo
      FROM nayax_transacciones A
      JOIN nayax_temp B ON B.id = A.cliente_id
      WHERE A.MachineSeTimeDateOnly BETWEEN ? AND ?
      AND A.MachineSeTimeTimeOnly BETWEEN ? AND ?
      AND B.nombre LIKE ?
      AND A.ProductCodeInMap LIKE ?
      AND A.PaymentMethodId = 3
    `;

    const queryTotalGastado = `
      SELECT SUM(A.SeValue) AS TotalGastado
      FROM nayax_transacciones A
      JOIN nayax_temp B ON B.id = A.cliente_id
      WHERE A.MachineSeTimeDateOnly BETWEEN ? AND ?
      AND A.MachineSeTimeTimeOnly BETWEEN ? AND ?
      AND B.nombre LIKE ?
      AND A.ProductCodeInMap LIKE ?
    `;

    console.log('Query Total Piezas Vendidas:', queryTotalPiezasVendidas);
    console.log('Query Tarjeta Crédito:', queryTarjetaCredito);
    console.log('Query Efectivo:', queryEfectivo);
    console.log('Query Total Gastado:', queryTotalGastado);
    console.log('Query Total Gastado Tarjeta Crédito:', queryTotalGastadoTarjetaCredito);
    console.log('Query Total Gastado Efectivo:', queryTotalGastadoEfectivo);

    const rowsTotalPiezasVendidas = await pool.query(queryTotalPiezasVendidas, [
      fechaInicio,
      fechaFin,
      horaInicio,
      horaFin,
      `%${nombreMaquinaFiltro}%`,
      `%${codeProductFiltro}%`,
    ]);

    const rowsTarjetaCredito = await pool.query(queryTarjetaCredito, [
      fechaInicio,
      fechaFin,
      horaInicio,
      horaFin,
      `%${nombreMaquinaFiltro}%`,
      `%${codeProductFiltro}%`,
    ]);

    const rowsEfectivo = await pool.query(queryEfectivo, [
      fechaInicio,
      fechaFin,
      horaInicio,
      horaFin,
      `%${nombreMaquinaFiltro}%`,
      `%${codeProductFiltro}%`,
    ]);

    const rowsTotalGastado = await pool.query(queryTotalGastado, [
      fechaInicio,
      fechaFin,
      horaInicio,
      horaFin,
      `%${nombreMaquinaFiltro}%`,
      `%${codeProductFiltro}%`,
    ]);

    const rowsTotalGastadoTarjetaCredito = await pool.query(queryTotalGastadoTarjetaCredito, [
      fechaInicio,
      fechaFin,
      horaInicio,
      horaFin,
      `%${nombreMaquinaFiltro}%`,
      `%${codeProductFiltro}%`,
    ]);

    const rowsTotalGastadoEfectivo = await pool.query(queryTotalGastadoEfectivo, [
      fechaInicio,
      fechaFin,
      horaInicio,
      horaFin,
      `%${nombreMaquinaFiltro}%`,
      `%${codeProductFiltro}%`,
    ]);

    const totalTarjetaCredito = rowsTarjetaCredito[0].TotalTarjetaCredito;
    const totalEfectivo = rowsEfectivo[0].TotalEfectivo;
    const totalPiezasVendidas = rowsTotalPiezasVendidas[0].TotalPiezasVendidas;
    const totalGastado = rowsTotalGastado[0].TotalGastado;
    const totalGastadoTarjetaCredito = rowsTotalGastadoTarjetaCredito[0].TotalGastadoTarjetaCredito;
    const totalGastadoEfectivo = rowsTotalGastadoEfectivo[0].TotalGastadoEfectivo;

    const resultadoFinal = {
      TotalTarjetaCredito: totalTarjetaCredito,
      TotalEfectivo: totalEfectivo,
      TotalPiezasVendidas: totalPiezasVendidas,
      TotalGastado: totalGastado,
      TotalGastadoTarjetaCredito: totalGastadoTarjetaCredito,
      TotalGastadoEfectivo: totalGastadoEfectivo,
    };
    res.json(resultadoFinal);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.listen(PORT)
console.log('Server on port', PORT)