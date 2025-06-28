"use client"

import { useEffect, useState } from "react"
import { obtenerMovimientos } from "../api/reporteService"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import "../styles/HistorialMovimientos.css"

const agruparMovimientos = (movs) => {
  const agr = {}
  movs.forEach(({ fecha, tipo, cantidad }) => {
    if (!agr[fecha]) agr[fecha] = { fecha, ingreso: 0, salida: 0 }
    agr[fecha][tipo.toLowerCase()] += cantidad
  })
  return Object.values(agr)
}

const HistorialMovimientos = () => {
  const [datos, setDatos] = useState([]),
    [cargando, setCargando] = useState(true),
    [error, setError] = useState(null)

  const cargarDatos = async () => {
    setCargando(true)
    try {
      const res = await obtenerMovimientos()
      setDatos(agruparMovimientos(res))
      setError(null)
    } catch {
      setError("Error al cargar movimientos")
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  if (cargando)
    return (
      <div className="historial">
        <div className="spinner"></div>
      </div>
    )

  if (error)
    return (
      <div className="historial state">
        <p>{error}</p>
        <button onClick={cargarDatos}>Reintentar</button>
      </div>
    )

  if (!datos.length)
    return (
      <div className="historial state">
        <p>No hay datos</p>
      </div>
    )

  const ingresos = datos.reduce((sum, d) => sum + d.ingreso, 0)
  const salidas = datos.reduce((sum, d) => sum + d.salida, 0)

  return (
    <div className="historial">
      {/* Estadísticas en formato tabla */}
      <div className="stats-table">
        <table>
          <thead>
            <tr>
              <th>Períodos</th>
              <th>Total Ingresos</th>
              <th>Total Salidas</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{datos.length}</td>
              <td className="green">{ingresos}</td>
              <td className="red">{salidas}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Gráfico */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={datos}
          margin={{ top: 20, right: 20, left: 20, bottom: 40 }}
        >
          <XAxis
            dataKey="fecha"
            tick={{ fontSize: 12, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            domain={[0, "dataMax + 15"]}
          />
          <Tooltip
            cursor={{ fill: "#f3f4f6" }}
            contentStyle={{
              backgroundColor: "#fff",
              borderRadius: "6px",
              fontSize: "0.8rem",
              border: "1px solid #e5e7eb",
            }}
          />
          <Bar dataKey="ingreso" fill="#4ade80" maxBarSize={20} />
          <Bar dataKey="salida" fill="#ef4444" maxBarSize={20} />
        </BarChart>
      </ResponsiveContainer>

      {/* Leyenda */}
      <div className="legend">
        <span>
          <span className="dot green"></span>Ingresos
        </span>
        <span>
          <span className="dot red"></span>Salidas
        </span>
      </div>
    </div>
  )
}

export default HistorialMovimientos
