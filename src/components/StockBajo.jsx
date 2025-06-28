"use client"

import { useEffect, useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from "recharts"
import { obtenerStockBajo } from "../api/reporteService"
import "../styles/StockBajo.css"

const StockBajo = () => {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const cargarDatos = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await obtenerStockBajo()
      setProductos(data)
    } catch (error) {
      console.error("Error al cargar productos:", error)
      setError("Error al cargar productos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const getBarColor = (stock) => {
    if (stock <= 5) return "#ef4444"
    if (stock <= 10) return "#f59e0b"
    return "#10b981"
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip-stock">
          <p className="tooltip-label">Producto: {label}</p>
          <p className="tooltip-value">Stock: {payload[0].value} unidades</p>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="stock-bajo">
        <div className="loading">
          <div className="spinner"></div>
          <p>Cargando productos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="stock-bajo">
        <div className="error">
          <p>{error}</p>
          <button onClick={cargarDatos}>Reintentar</button>
        </div>
      </div>
    )
  }

  if (!productos.length) {
    return (
      <div className="stock-bajo">
        <div className="empty">
          <div className="empty-icon">✅</div>
          <p>¡Excelente! No hay productos con stock bajo</p>
        </div>
      </div>
    )
  }

  return (
    <div className="stock-bajo">
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={Math.max(280, productos.length * 50)}>
          <BarChart
            data={productos}
            layout="vertical"
            margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
          >
            <XAxis
              type="number"
              domain={[1, 11]}
              ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
              tick={{ fontSize: 12, fill: "#6b7280" }}
              axisLine={true}
              tickLine={true}
            />
            <YAxis
              type="category"
              dataKey="nombre"
              tick={{ fontSize: 13, fill: "#374151", fontWeight: 500 }}
              axisLine={true}
              tickLine={true}
              width={100}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
            <Bar dataKey="stock" radius={[0, 6, 6, 0]} barSize={22}>
              {productos.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.stock)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="legend">
        <div className="legend-item">
          <div className="legend-color critical"></div>
          <span>Crítico (≤ 5)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color warning"></div>
          <span>Bajo (≤ 10)</span>
        </div>
      </div>
    </div>
  )
}

export default StockBajo
