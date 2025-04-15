import { useState } from "react"
import "../css/PasswordModal.css"

function PasswordModal({ onClose, onSuccess }) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const validPasswords = [
    "rjr", 
    "rogeriojunior", 
    "2612", 
    "4365", 
    "marrentinha",
    "seila", 
    "seilaah", 
    "980921", 
    "rebequinha", 
    "valentosa", 
    "saopaulo", 
    "tricolor", 
  ]

  const handleSubmit = (e) => {
    e.preventDefault()

    if (validPasswords.includes(password.trim().toLowerCase())) {
      onSuccess()
    } else {
      setError("Senha incorreta. Tente novamente.")
      setPassword("")
    }
  }

  return (
    <div className="password-modal-overlay">
      <div className="password-modal">
        <h3>Verificação de Acesso</h3>
        <p>Digite a senha para continuar:</p>

        <form onSubmit={handleSubmit}>
          <div className="password-input-container">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite a senha"
              autoFocus
            />
          </div>

          {error && <div className="password-error">{error}</div>}

          <div className="password-buttons">
            <button type="submit" className="confirm-btn">
              Confirmar
            </button>
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PasswordModal
