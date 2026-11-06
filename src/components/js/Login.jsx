import { useState } from "react"
import "../css/Login.css"

function Login({ onLogin }) {
  const [username, setUsername] = useState("")
  const [showLogin, setShowLogin] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (username.trim()) {
      onLogin(username.trim())
      setShowLogin(false)
    }
  }

  return (
    <div className="login-container">
      {showLogin ? (
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Digite seu nome de usuário"
            autoFocus
          />
          <button type="submit">Entrar</button>
          <button type="button" className="cancel-btn" onClick={() => setShowLogin(false)}>
            Cancelar
          </button>
        </form>
      ) : (
        <button onClick={() => setShowLogin(true)} className="login-btn">
          Entrar<span className="login-btn-extra"> para Salvar Dados</span>
        </button>
      )}
    </div>
  )
}

export default Login
