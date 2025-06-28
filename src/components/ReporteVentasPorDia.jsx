import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { CalendarDays, TrendingUp } from "lucide-react";
import { obtenerVentasPorDia } from "../api/reporteService";
import "../styles/ReporteVentasPorDia.css";

const diasSemana = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const ReporteVentasPorDia = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalSemanal, setTotalSemanal] = useState(0);

  const obtenerNombreDia = (fecha) => {
    const date = new Date(fecha + "T00:00:00");
    const diaSemana = date.getDay();
    return diasSemana[diaSemana === 0 ? 6 : diaSemana - 1];
  };

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const ventas = await obtenerVentasPorDia();

        const agrupado = {};
        ventas.forEach((v) => {
          const fecha = v.fecha.substring(0, 10);
          agrupado[fecha] = (agrupado[fecha] || 0) + v.total;
        });

        const fechas = Object.keys(agrupado).sort().slice(-7);

        const datosPorDia = {};
        fechas.forEach((fecha) => {
          const dia = obtenerNombreDia(fecha);
          datosPorDia[dia] = {
            dia,
            total: agrupado[fecha],
            fecha,
          };
        });

        const datosCompletos = diasSemana.map((dia) => ({
          dia,
          total: datosPorDia[dia]?.total || 0,
          fecha: datosPorDia[dia]?.fecha || "",
        }));

        setData(datosCompletos);
        const total = datosCompletos.reduce((sum, item) => sum + item.total, 0);
        setTotalSemanal(total);
      } catch (error) {
        console.error("Error al cargar ventas:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length > 0) {
      const item = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="custom-tooltip-total">
            Total: S/. {item.total.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
          </p>
          <p className="custom-tooltip-fecha">
            {item.fecha ? new Date(item.fecha + "T00:00:00").toLocaleDateString("es-PE") : ""}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="reporte-ventas-container">
      <div className="total-semanal-box">
        <TrendingUp className="reporte-subicon" />
        <span>
          Total semanal: <span className="total-semanal-monto">
            S/. {totalSemanal.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
          </span>

        </span>
      </div>

      {loading ? (
        <div className="reporte-loading">
          <div className="reporte-spinner"></div>
        </div>
      ) : (
        <div className="reporte-chart">
          <BarChart
            data={data}
            width={460}
            height={400}
            margin={{ top: 20, right: 0, left: 0, bottom: 5 }}
            barCategoryGap={25}
          >
            <CartesianGrid stroke="transparent" />
            <XAxis dataKey="dia" tick={{ fontSize: 12 }} />
            <YAxis
  domain={[0, 1000]}
  ticks={[0, 250, 500, 750, 950]}
  tick={{ fontSize: 12 }}
  tickFormatter={(value) =>
    `S/. ${value.toLocaleString("es-PE", {
      minimumFractionDigits: 0,
    })}`
  }
/>


            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="total"
              fill="#10b981"
              barSize={26}
              radius={[4, 4, 0, 0]}
              className="bar-hover"
            />
          </BarChart>
        </div>
      )}
    </div>
  );
};

export default ReporteVentasPorDia;
