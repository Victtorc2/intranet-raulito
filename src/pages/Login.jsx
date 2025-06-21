"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Swal from "sweetalert2"
import { useAuth } from "../auth/AuthContext"
import "../styles/Login.css"

const Login = () => {
  const { login } = useAuth()
  const [correo, setCorreo] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await login({ correo, password })

      Swal.fire({
        title: "¡Éxito!",
        text: "Inicio de sesión exitoso",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        navigate("/inicio", { replace: true })
      })
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "Credenciales incorrectas",
        icon: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-background">
        <div className="login-shape shape-1"></div>
        <div className="login-shape shape-2"></div>
        <div className="login-shape shape-3"></div>
      </div>

      <div className="login-container">
        <div className="login-header">
          <div className="login-logo">
            <div className="logo-icon">🛒</div>
            <h1>Supermercado Raulito</h1>
            <p>Tu supermercado de confianza desde 1985</p>
          </div>
        </div>

        <div className="login-welcome">
          <h2>¡Bienvenido de vuelta!</h2>
          <p>Inicia sesión para acceder a tu cuenta</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <div className="input-icon">📧</div>
            <input
              type="email"
              placeholder="Correo electrónico"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              className="login-input"
            />
          </div>

          <div className="input-group">
            <div className="input-icon">🔒</div>
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="login-input"
            />
          </div>

          <button type="submit" disabled={isLoading} className="login-button">
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                Cargando...
              </>
            ) : (
              "Ingresar"
            )}
          </button>
        </form>

        <div className="login-footer">
          <a href="#" className="forgot-password">
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        <div className="demo-credentials">
          <p>
            <strong>Credenciales de prueba:</strong>
          </p>
          <p>Email: admin@raulito.com</p>
          <p>Password: password</p>
        </div>
      </div>
    </div>
  )
}

export default Login
