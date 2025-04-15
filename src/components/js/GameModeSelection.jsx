import { useState } from "react"
import "../css/GameModeSelection.css"

function GameModeSelection({ onSelectMode }) {
  const [selectedMode, setSelectedMode] = useState(null)

  const handleSelectMode = (mode) => {
    setSelectedMode(mode)
  }

  const handleContinue = () => {
    if (selectedMode) {
      onSelectMode(selectedMode)
    }
  }

  return (
    <div className="game-mode-selection">
      <h2>Selecione o Modo de Jogo</h2>

      <div className="mode-cards">
        <div
          className={`mode-card ${selectedMode === "all-vs-all" ? "selected" : ""}`}
          onClick={() => handleSelectMode("all-vs-all")}
        >
          <div className="mode-icon">🏆</div>
          <h3>Todos Contra Todos</h3>
          <p>Todos os jogadores se enfrentam. Os 4 melhores avançam para os playoffs.</p>
          <ul>
            <li>Fase de grupos com todos os jogadores</li>
            <li>Tabela única de classificação</li>
            <li>4 melhores avançam para semifinais</li>
          </ul>
          {selectedMode === "all-vs-all" && <div className="selected-check">✓</div>}
        </div>

        <div
          className={`mode-card ${selectedMode === "two-groups" ? "selected" : ""}`}
          onClick={() => handleSelectMode("two-groups")}
        >
          <div className="mode-icon">⚔️</div>
          <h3>Dois Grupos</h3>
          <p>Jogadores são divididos em dois grupos. Os 2 melhores de cada grupo avançam.</p>
          <ul>
            <li>Sorteio estilo Champions League</li>
            <li>Duas tabelas de classificação</li>
            <li>2 melhores de cada grupo avançam</li>
          </ul>
          {selectedMode === "two-groups" && <div className="selected-check">✓</div>}
        </div>
      </div>

      <button
        className={`continue-btn ${!selectedMode ? "disabled" : ""}`}
        onClick={handleContinue}
        disabled={!selectedMode}
      >
        Continuar
      </button>
    </div>
  )
}

export default GameModeSelection
