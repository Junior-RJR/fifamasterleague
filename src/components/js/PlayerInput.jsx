import { useState } from "react"
import "../css/PlayerInput.css"

function PlayerInput({ onCreateTournament }) {
  const [playerCount, setPlayerCount] = useState(4)
  const [playerNames, setPlayerNames] = useState(Array(4).fill(""))

  const handlePlayerCountChange = (e) => {
    const count = Number.parseInt(e.target.value, 10)
    if (count > 0 && count <= 20) {
      setPlayerCount(count)
      if (count > playerNames.length) {
        setPlayerNames([...playerNames, ...Array(count - playerNames.length).fill("")])
      } else {
        setPlayerNames(playerNames.slice(0, count))
      }
    }
  }

  const handlePlayerNameChange = (index, name) => {
    const newPlayerNames = [...playerNames]
    newPlayerNames[index] = name
    setPlayerNames(newPlayerNames)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const validPlayers = playerNames.filter((name) => name.trim() !== "")
    if (validPlayers.length >= 2) {
      onCreateTournament(validPlayers)
    } else {
      alert("Por favor, insira pelo menos 2 nomes de jogadores")
    }
  }

  return (
    <div className="player-input">
      <h2>Criar Torneio</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="playerCount">Número de Jogadores:</label>
          <input
            type="number"
            id="playerCount"
            min="2"
            max="20"
            value={playerCount}
            onChange={handlePlayerCountChange}
          />
        </div>

        <div className="player-names">
          <h3>Digite os Nomes dos Jogadores:</h3>
          {playerNames.map((name, index) => (
            <div key={index} className="player-name-input">
              <label htmlFor={`player${index + 1}`}>Jogador {index + 1}:</label>
              <input
                type="text"
                id={`player${index + 1}`}
                value={name}
                onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                placeholder={`Jogador ${index + 1}`}
              />
            </div>
          ))}
        </div>

        <button type="submit" className="create-btn">
          Criar Torneio
        </button>
      </form>
    </div>
  )
}

export default PlayerInput
