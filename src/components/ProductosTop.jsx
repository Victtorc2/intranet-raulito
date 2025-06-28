import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { obtenerHistorialVentas } from "../api/reporteService";
import "../styles/ProductosTop.css";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length > 0) {
    const p = payload[0].payload;
    return (
      <div className="custom-tooltip">
        <p className="tooltip-title">{p.productoNombre}</p>
        <p className="tooltip-line">Veces Vendido: {p.vecesVendido}</p>
        <p className="tooltip-line">Unidades: {p.unidadesVendidas}</p>
        <p className="tooltip-line">P. Unitario: S/. {p.precioUnitario.toFixed(2)}</p>
        <p className="tooltip-line">Subtotal: S/. {p.subtotal.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

const ProductosTop = () => {
  const [resumenProductos, setResumenProductos] = useState([]);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const ventas = await obtenerHistorialVentas();
        const resumen = {};

        ventas.forEach((venta) => {
          venta.detalles.forEach((detalle) => {
            const nombre = detalle.productoNombre;

            if (!resumen[nombre]) {
              resumen[nombre] = {
                productoNombre: nombre,
                vecesVendido: 0,
                unidadesVendidas: 0,
                precioUnitario: detalle.precioUnitario,
                subtotal: 0,
              };
            }

            resumen[nombre].vecesVendido += 1;
            resumen[nombre].unidadesVendidas += detalle.cantidad;
            resumen[nombre].subtotal += detalle.subtotal;
          });
        });

        const resumenArray = Object.values(resumen).sort(
          (a, b) => b.unidadesVendidas - a.unidadesVendidas
        );

        setResumenProductos(resumenArray.slice(0, 10)); // Top 10
      } catch (error) {
        console.error("Error al obtener resumen de productos:", error);
      }
    };

    cargarDatos();
  }, []);

  return (
    <div className="productos-top-wrapper">
      <ResponsiveContainer width="100%" height={520}>
        <BarChart
          data={resumenProductos}
          margin={{ top: 10, right: 10, left: 0, bottom: 40 }}
        >
          <XAxis
            dataKey="productoNombre"
            height={60}
            tick={{ fontSize: 12, fill: "#4b5563", fontWeight: 500 }}
            axisLine={true}
            tickLine={true}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#4b5563" }}
            axisLine={true}
            tickLine={true}
            allowDecimals={false} // <-- fuerza solo enteros
            label={{
              value: "Veces Vendido",
              angle: -90,
              position: "insideLeft",
              style: { textAnchor: "middle", fill: "#4b5563", fontSize: 12 },
            }}
          />


          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="vecesVendido" radius={[6, 6, 0, 0]} barSize={26}>

            {resumenProductos.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill="#22c55e"
                className="bar-cell"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProductosTop;
