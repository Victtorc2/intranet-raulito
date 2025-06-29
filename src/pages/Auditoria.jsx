
import { useEffect, useState } from "react"
import { obtenerRegistrosAuditoria } from "../api/auditoriaService"
import { Activity, User, Calendar } from "lucide-react"
import "../styles/Auditoria.css";

const Auditoria = () => {
  const [auditoriaData, setAuditoriaData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchAuditoriaData = async () => {
      try {
        const data = await obtenerRegistrosAuditoria()
        setAuditoriaData(data)
        setLoading(false)
      } catch (err) {
        setError("Error al obtener los registros de auditoría.")
        setLoading(false)
      }
    }

    fetchAuditoriaData()
  }, [])

  if (loading) {
    return (
      <div className="auditoria-container">
        <div className="loading-card">
          <div className="loading-spinner"></div>
          <p className="loading-text">Cargando registros de auditoría...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="auditoria-container">
        <div className="error-card">
          <div className="error-icon">⚠️</div>
          <p className="error-text">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="auditoria-container">
      <div className="auditoria-card">
        <div className="card-header">
          <h2 className="card-title">
            <Activity className="title-icon" />
            Registros de Auditoría
          </h2>
          <p className="card-subtitle">Historial completo de actividades del sistema    </p>
        </div>

        <div className="card-content">
          <div className="table-wrapper">
            <table className="auditoria-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>
                    <div className="th-content">
                      <User className="th-icon" />
                      Usuario
                    </div>
                  </th>
                  <th>Módulo</th>
                  <th>Acción</th>
                  <th>Descripción</th>
                  <th>
                    <div className="th-content">
                      <Calendar className="th-icon" />
                      Fecha y Hora
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {auditoriaData.map((registro) => (
                  <tr key={registro.id} className="table-row">
                    <td className="id-cell">{registro.id}</td>
                    <td className="user-cell">{registro.usuario}</td>
                    <td>
                      <span className="module-badge">{registro.modulo}</span>
                    </td>
                    <td>
                      <span className={`action-badge action-${registro.accion?.toLowerCase()}`}>{registro.accion}</span>
                    </td>
                    <td className="description-cell">{registro.descripcion}</td>
                    <td className="date-cell">{new Date(registro.fechaHora).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {auditoriaData.length > 0 && (
            <div className="table-footer">
              <span>Total de registros: {auditoriaData.length}</span>
              <span>Última actualización: {new Date().toLocaleTimeString()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
export default Auditoria;