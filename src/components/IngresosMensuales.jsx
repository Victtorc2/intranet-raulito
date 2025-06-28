import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  CartesianGrid,
} from "recharts";
import { obtenerIngresosMensuales } from "../api/reporteService";
import "../styles/IngresosMensuales.css";

const MESES_ORDENADOS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
];

const IngresosMensuales = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const cargar = async () => {
      try {
        const ingresos = await obtenerIngresosMensuales();
        const ingresosMap = {};

        ingresos.forEach((i) => {
          const mesIndex =
            typeof i.mes === "number"
              ? i.mes - 1
              : MESES_ORDENADOS.findIndex(
                  (m) => m.toLowerCase() === String(i.mes).toLowerCase()
                );

          if (mesIndex >= 0 && mesIndex < 12) {
            ingresosMap[MESES_ORDENADOS[mesIndex]] = i.total;
          }
        });

        const finalData = MESES_ORDENADOS.map((mes) => ({
          mes: mes.charAt().toUpperCase() + mes.slice(1), // Nombre completo capitalizado
          total: ingresosMap[mes] || 0,
        }));

        setData(finalData);
      } catch (error) {
        console.error("Error al cargar ingresos mensuales:", error);
      }
    };

    cargar();
  }, []);

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length > 0) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-mes">{label}</p>
          <p className="tooltip-valor">
            Ingresos: <strong>S/. {payload[0].value.toLocaleString("es-PE")}</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="ingresos-mensuales-container">
      
        <ResponsiveContainer width="100%" height={500}>
          <LineChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} horizontal={false} />
            <XAxis
              dataKey="mes"
              tick={{ fill: "#6b7280", fontSize: 12 }}
              interval={0}
            />
            <YAxis
              domain={[0, 30000]}
              tick={{ fill: "#6b7280", fontSize: 12 }}
              tickFormatter={(value) => `S/. ${value.toLocaleString("es-PE")}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="total"
              stroke="none"
              fill="rgba(16, 185, 129, 0.1)"
            />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2, fill: "#10b981", stroke: "#ffffff" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    
  );
};

export default IngresosMensuales;
