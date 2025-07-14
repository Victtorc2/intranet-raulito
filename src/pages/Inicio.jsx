import { useAuth } from "../auth/AuthContext";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { ventaService } from "../api/ventaService.js";
import { generarPDFVentasDelDia } from "../api/inicioService.js";
import "../styles/Iniciocomponent.css";

const Inicio = () => {
  const { getRole } = useAuth();
  const role = getRole();

  console.log('Rol en Inicio:', role);  // Verifica el rol aquí

  const [ventasHoy, setVentasHoy] = useState([]);
  const [estadisticasHoy, setEstadisticasHoy] = useState({
    totalVentas: 0,
    totalIngresos: 0,
    promedioVenta: 0,
    ventasEfectivo: 0,
    ventasTarjeta: 0,
  });
  const [loading, setLoading] = useState(false);
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const [usuario, setUsuario] = useState("");
  const [fechaActual, setFechaActual] = useState("");
  const [horaActual, setHoraActual] = useState("");

  // Helper para formatear fecha+hora con zona Lima
  const formatHora = (fechaISO, horaStr) => {
    const iso = `${fechaISO}T${horaStr}-05:00`;
    return new Date(iso).toLocaleTimeString("es-PE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    cargarDatosIniciales();
    actualizarFechaHora();
  }, []);

  const cargarDatosIniciales = async () => {
    setLoading(true);
    try {
      const raw = localStorage.getItem("usuario");
      let usuarioStr = "Usuario";
      if (raw) {
        try {
          const obj = JSON.parse(raw);
          usuarioStr = obj.nombre || obj.correo || raw;
        } catch {
          usuarioStr = raw;
        }
      }
      setUsuario(usuarioStr);
      await cargarVentasDelDia();
    } catch (error) {
      console.error("Error al cargar datos iniciales:", error);
      Swal.fire("Error", "No se pudieron cargar los datos del día", "error");
    } finally {
      setLoading(false);
    }
  };

  const { obtenerHistorial } = ventaService;
  const cargarVentasDelDia = async () => {
    try {
      const todasLasVentas = await obtenerHistorial();
      const hoy = new Date().toDateString();
      const ventasDelDia = todasLasVentas.filter((venta) => {
        const fechaLocal = new Date(venta.fecha.replace(/-/g, "/"));
        return fechaLocal.toDateString() === hoy;
      });
      setVentasHoy(ventasDelDia);
      calcularEstadisticasDelDia(ventasDelDia);
    } catch (error) {
      console.error("Error al cargar ventas del día:", error);
      setVentasHoy([]);
    }
  };

  const calcularEstadisticasDelDia = (ventas) => {
    const totalVentas = ventas.length;
    const totalIngresos = ventas.reduce((sum, v) => sum + v.total, 0);
    const promedioVenta = totalVentas > 0 ? totalIngresos / totalVentas : 0;
    const ventasEfectivo = ventas.filter((v) => v.metodoPago === "EFECTIVO").length;
    const ventasTarjeta = ventas.filter((v) => v.metodoPago === "TARJETA").length;
    setEstadisticasHoy({
      totalVentas,
      totalIngresos,
      promedioVenta,
      ventasEfectivo,
      ventasTarjeta,
    });
  };

  const actualizarFechaHora = () => {
    const ahora = new Date();
    setFechaActual(
      ahora.toLocaleDateString("es-PE", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );
    setHoraActual(
      ahora.toLocaleTimeString("es-PE", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    );
  };

  const exportarPDF = async () => {
    if (ventasHoy.length === 0) {
      Swal.fire("Sin Datos", "No hay ventas del día para exportar", "warning");
      return;
    }
    setGenerandoPDF(true);
    try {
      Swal.fire({
        title: "Generando PDF...",
        text: "Por favor espere mientras se genera el reporte",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      const resultado = await generarPDFVentasDelDia(ventasHoy, estadisticasHoy, usuario);
      Swal.close();
      if (resultado.success) {
        Swal.fire({
          title: "¡PDF Generado!",
          text: `Reporte de ventas del día descargado exitosamente`,
          icon: "success",
          timer: 3000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Error al generar PDF:", error);
      Swal.fire("Error", "No se pudo generar el PDF: " + error.message, "error");
    } finally {
      setGenerandoPDF(false);
    }
  };

  const refrescarDatos = async () => {
    await cargarVentasDelDia();
    Swal.fire({
      title: "Datos Actualizados",
      text: "Los datos del día han sido actualizados",
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const verDetalleVenta = (venta) => {
    const fechaStr = new Date(`${venta.fecha}T${venta.hora}-05:00`)
      .toLocaleDateString("es-PE", { day: "numeric", month: "numeric", year: "numeric" });
    const horaStr = formatHora(venta.fecha, venta.hora);

    const productosHtml = venta.detalles
      ?.map((item) => {
        const nombre = item.productoNombre ?? "—";
        const cantidad = item.cantidad ?? 0;
        const precio = item.precioUnitario ?? 0;
        const subtotal = item.subtotal ?? 0;
        return `
          <tr>
            <td style="padding:8px; border-bottom:1px solid #eee;">${nombre}</td>
            <td style="padding:8px; border-bottom:1px solid #eee; text-align:center;">${cantidad}</td>
            <td style="padding:8px; border-bottom:1px solid #eee; text-align:right;">S/ ${precio.toFixed(2)}</td>
            <td style="padding:8px; border-bottom:1px solid #eee; text-align:right;">S/ ${subtotal.toFixed(2)}</td>
          </tr>
        `;
      })
      .join("");

    Swal.fire({
      title: `Venta #${venta.id}`,
      html: `
        <div style="text-align:left; margin-bottom:16px;">
          <p><strong>📅 Fecha:</strong> ${fechaStr}</p>
          <p><strong>🕐 Hora:</strong> ${horaStr}</p>
          <p><strong>💳 Método:</strong> ${venta.metodoPago}</p>
          <p><strong>💰 Total:</strong> <span style="color:#28a745;">S/ ${venta.total.toFixed(2)}</span></p>
        </div>
        <h4 style="margin-bottom:8px;">📦 Productos:</h4>
        <table style="width:100%; border-collapse:collapse; font-size:14px;">
          <thead>
            <tr style="background:#f8f9fa;">
              <th style="padding:10px; border-bottom:2px solid #dee2e6; text-align:left;">Producto</th>
              <th style="padding:10px; border-bottom:2px solid #dee2e6; text-align:center;">Cant.</th>
              <th style="padding:10px; border-bottom:2px solid #dee2e6; text-align:right;">Precio</th>
              <th style="padding:10px; border-bottom:2px solid #dee2e6; text-align:right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${productosHtml ||
              `<tr><td colspan="4" style="text-align:center; padding:20px;">No hay productos</td></tr>`}
          </tbody>
        </table>
      `,
      icon: "info",
      confirmButtonText: "Cerrar",
      width: "600px",
    });
  };

  const obtenerSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return "Buenos días";
    if (hora < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  return (
    <div className="inicio-container">
      <div className="inicio-wrapper">
        {/* Header de Bienvenida */}
        <div className="welcome-section">
          <div className="welcome-content">
            <div className="welcome-text">
              <h1 className="welcome-title">
                {obtenerSaludo()}, {usuario}! 👋
              </h1>
              <p className="welcome-subtitle">Bienvenido al sistema de gestión de ventas</p>
              <div className="datetime-info">
                <div className="date-info">
                  <span className="date-icon">📅</span>
                  <span className="date-text">{fechaActual}</span>
                </div>
                <div className="time-info">
                  <span className="time-icon">🕐</span>
                  <span className="time-text">{horaActual}</span>
                </div>
              </div>
            </div>
            <div className="welcome-actions">
              <button onClick={refrescarDatos} className="btn btn-primary" disabled={loading}>
                {loading ? "⏳" : "🔄"} Actualizar
              </button>
              <button
                onClick={exportarPDF}
                className="btn btn-success"
                disabled={loading || generandoPDF || ventasHoy.length === 0}
              >
                {generandoPDF ? "⏳ Generando..." : "📄 Exportar PDF"}
              </button>
            </div>
          </div>
        </div>

        {/* Estadísticas del Día */}
        <div className="stats-section">
          <h2 className="section-title">📊 Resumen del Día</h2>
          <div className="stats-grid">
            <div className="stat-card blue">
              <div className="stat-icon">🛒</div>
              <div className="stat-info">
                <h3 className="stat-value">{estadisticasHoy.totalVentas}</h3>
                <p className="stat-label">Ventas Realizadas</p>
              </div>
            </div>
            <div className="stat-card green">
              <div className="stat-icon">💰</div>
              <div className="stat-info">
                <h3 className="stat-value">S/ {estadisticasHoy.totalIngresos.toFixed(2)}</h3>
                <p className="stat-label">Ingresos Totales</p>
              </div>
            </div>
            <div className="stat-card purple">
              <div className="stat-icon">📈</div>
              <div className="stat-info">
                <h3 className="stat-value">S/ {estadisticasHoy.promedioVenta.toFixed(2)}</h3>
                <p className="stat-label">Promedio por Venta</p>
              </div>
            </div>
            <div className="stat-card orange">
              <div className="stat-icon">💳</div>
              <div className="stat-info">
                <h3 className="stat-value">
                  {estadisticasHoy.ventasEfectivo}/{estadisticasHoy.ventasTarjeta}
                </h3>
                <p className="stat-label">Efectivo/Tarjeta</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ventas del Día */}
        <div className="ventas-section">
          <div className="section-header">
            <h2 className="section-title">🗂️ Ventas de Hoy</h2>
            <div className="section-actions">
              <span className="ventas-count">
                {ventasHoy.length} venta{ventasHoy.length !== 1 ? "s" : ""} registrada{ventasHoy.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="loading-section">
              <div className="loading-spinner">⏳</div>
              <p>Cargando ventas del día...</p>
            </div>
          ) : ventasHoy.length > 0 ? (
            <div className="ventas-grid">
              {ventasHoy.map((venta) => (
                <div key={venta.id} className="venta-card" onClick={() => verDetalleVenta(venta)}>
                  <div className="venta-header">
                    <span className="venta-id">#{venta.id}</span>
                    <span className="venta-hora">{formatHora(venta.fecha, venta.hora)}</span>
                  </div>

                  <div className="venta-body">
                    <div className="venta-total">
                      <span className="total-label">Total:</span>
                      <span className="total-amount">S/ {venta.total.toFixed(2)}</span>
                    </div>

                    <div className="venta-details">
                      <div className="detail-item">
                        <span className="detail-icon">{venta.metodoPago === "EFECTIVO" ? "💵" : "💳"}</span>
                        <span className="detail-text">{venta.metodoPago}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-icon">📦</span>
                        <span className="detail-text">
                          {venta.detalles?.length || 0} producto{(venta.detalles?.length || 0) !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    {venta.observaciones && (
                      <div className="venta-observaciones">
                        <span className="obs-icon">📝</span>
                        <span className="obs-text">{venta.observaciones}</span>
                      </div>
                    )}
                  </div>

                  <div className="venta-footer">
                    <span className="ver-detalle">👁️ Ver detalle</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-ventas">
              <div className="empty-icon">📋</div>
              <h3 className="empty-title">No hay ventas registradas hoy</h3>
              <p className="empty-subtitle">Las ventas que realices durante el día aparecerán aquí</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="footer-section">
          <div className="footer-content">
            <p className="footer-text">
              💡 <strong>Tip:</strong> Los datos se actualizan automáticamente. Usa el botón "Actualizar" para refrescar manualmente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inicio;
