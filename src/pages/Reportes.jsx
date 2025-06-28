import ReporteVentasPorDia from "../components/ReporteVentasPorDia";
import ProductosTop from "../components/ProductosTop";
import StockBajo from "../components/StockBajo";
import IngresosMensuales from "../components/IngresosMensuales";
import HistorialMovimientos from "../components/HistorialMovimientos";
import "../styles/Reportes.css";

const Reportes = () => {
  return (
    <div className="reportes-container">

      <div className="reportes-grid">
        <Card title="Ventas por Día">
          <ReporteVentasPorDia />
        </Card>

        <Card title="Productos Más Vendidos">
          <ProductosTop />
        </Card>

        <Card title="Productos con Stock Bajo">
          <StockBajo />
        </Card>

        <Card title="Ingresos Mensuales">
          <IngresosMensuales />
        </Card>

        <Card title="Historial de Movimientos">
          <HistorialMovimientos />
        </Card>
      </div>
    </div>
  );
};

// Usamos <div> en lugar de <h2> para evitar estilos predefinidos de encabezados
const Card = ({ title, children }) => (
  <section className="card">
    <div className="card-title">{title}</div>
    <div className="card-content">{children}</div>
  </section>
);

export default Reportes;
