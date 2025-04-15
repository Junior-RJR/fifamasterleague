import { useState } from "react"
import "../css/KnockoutBracketVisual.css"

function KnockoutBracketVisual({ matches, onUpdateMatch }) {
  const [editingMatch, setEditingMatch] = useState(null)
  const [score1, setScore1] = useState("")
  const [score2, setScore2] = useState("")

  const organizeMatchesByRound = () => {
    const rounds = {}

    matches.forEach((match) => {
      if (!rounds[match.round]) {
        rounds[match.round] = []
      }
      rounds[match.round].push(match)
    })

    return rounds
  }

  const roundsData = organizeMatchesByRound()

  const getRoundDisplayName = (roundName) => {
    switch (roundName) {
      case "preliminary":
        return "Fase Preliminar"
      case "first":
        return "Primeira Fase"
      case "roundOf16":
        return "Oitavas de Final"
      case "quarterfinal":
        return "Quartas de Final"
      case "semifinal":
        return "Semifinal"
      case "final":
        return "Final"
      default:
        return roundName
    }
  }

  const roundOrder = ["preliminary", "first", "roundOf16", "quarterfinal", "semifinal", "final"]
  const sortedRounds = Object.keys(roundsData).sort((a, b) => {
    return roundOrder.indexOf(a) - roundOrder.indexOf(b)
  })

  const handleEditMatch = (match) => {
    setEditingMatch(match)
    setScore1(match.score1 !== null ? match.score1 : "")
    setScore2(match.score2 !== null ? match.score2 : "")
  }

  const handleSaveScore = () => {
    if (!editingMatch) return

    const s1 = Number.parseInt(score1, 10)
    const s2 = Number.parseInt(score2, 10)

    if (isNaN(s1) || isNaN(s2) || s1 < 0 || s2 < 0) {
      alert("Por favor, insira pontuações válidas (números não negativos)")
      return
    }

    if (s1 === s2) {
      alert("Não são permitidos empates no mata-mata. Por favor, defina um vencedor.")
      return
    }

    const matchIndex = matches.indexOf(editingMatch)

    onUpdateMatch(matchIndex, {
      ...editingMatch,
      score1: s1,
      score2: s2,
      played: true,
    })

    setEditingMatch(null)
  }

  const handleCancelEdit = () => {
    setEditingMatch(null)
  }

  const getMatchWinner = (match) => {
    if (!match || !match.played) return null
    return match.score1 > match.score2 ? match.player1 : match.player2
  }

  const renderVisualBracket = () => {
    const hasPreliminary = roundsData.preliminary && roundsData.preliminary.length > 0

    return (
      <div className="visual-bracket">
        {hasPreliminary && (
          <div className="bracket-section preliminary-section">
            <h3 className="bracket-round-title">Fase Preliminar</h3>
            <div className="bracket-matches">
              {roundsData.preliminary.map((match) => (
                <div key={match.matchNumber} className="bracket-match-container">
                  <div className={`bracket-match-card ${match.played ? "played" : "not-played"}`}>
                    <div className="match-number">Partida {match.matchNumber}</div>
                    <div className="match-players">
                      <div className={`player ${match.played && match.score1 > match.score2 ? "winner" : ""}`}>
                        {match.player1}
                      </div>
                      <div className="vs">VS</div>
                      <div className={`player ${match.played && match.score2 > match.score1 ? "winner" : ""}`}>
                        {match.player2}
                      </div>
                    </div>
                    <div className="match-details">
                      {match.played ? (
                        <div className="score">
                          <span>{match.score1}</span>
                          <span>:</span>
                          <span>{match.score2}</span>
                        </div>
                      ) : (
                        <div className="match-status">Ainda não jogada</div>
                      )}
                      <button onClick={() => handleEditMatch(match)} className="edit-btn">
                        {match.played ? "Editar Placar" : "Registrar Placar"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {roundsData.first && (
          <div className="bracket-section first-round-section">
            <h3 className="bracket-round-title">Primeira Fase</h3>
            <div className="bracket-matches">
              {roundsData.first.map((match) => (
                <div key={match.matchNumber} className="bracket-match-container">
                  <div className={`bracket-match-card ${match.played ? "played" : "not-played"}`}>
                    <div className="match-number">Partida {match.matchNumber}</div>
                    <div className="match-players">
                      <div className={`player ${match.played && match.score1 > match.score2 ? "winner" : ""}`}>
                        {match.player1}
                      </div>
                      <div className="vs">VS</div>
                      <div className={`player ${match.played && match.score2 > match.score1 ? "winner" : ""}`}>
                        {match.player2}
                      </div>
                    </div>
                    <div className="match-details">
                      {match.played ? (
                        <div className="score">
                          <span>{match.score1}</span>
                          <span>:</span>
                          <span>{match.score2}</span>
                        </div>
                      ) : (
                        <div className="match-status">Ainda não jogada</div>
                      )}
                      {match.player2 !== "BYE" ? (
                        <button onClick={() => handleEditMatch(match)} className="edit-btn">
                          {match.played ? "Editar Placar" : "Registrar Placar"}
                        </button>
                      ) : (
                        <div className="bye-notice">Classificação automática</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {sortedRounds
          .filter((round) => round !== "preliminary" && round !== "first")
          .map((round) => (
            <div key={round} className={`bracket-section ${round}-section`}>
              <h3 className="bracket-round-title">{getRoundDisplayName(round)}</h3>
              <div className="bracket-matches">
                {roundsData[round].map((match) => (
                  <div key={match.matchNumber} className="bracket-match-container">
                    <div className={`bracket-match-card ${match.played ? "played" : "not-played"}`}>
                      <div className="match-number">Partida {match.matchNumber}</div>
                      <div className="match-players">
                        <div className={`player ${match.played && match.score1 > match.score2 ? "winner" : ""}`}>
                          {match.player1 || "A definir"}
                        </div>
                        <div className="vs">VS</div>
                        <div className={`player ${match.played && match.score2 > match.score1 ? "winner" : ""}`}>
                          {match.player2 || "A definir"}
                        </div>
                      </div>
                      <div className="match-details">
                        {match.played ? (
                          <div className="score">
                            <span>{match.score1}</span>
                            <span>:</span>
                            <span>{match.score2}</span>
                          </div>
                        ) : (
                          <div className="match-status">Ainda não jogada</div>
                        )}
                        {match.player1 &&
                        match.player2 &&
                        match.player1 !== "A definir" &&
                        match.player2 !== "A definir" ? (
                          <button onClick={() => handleEditMatch(match)} className="edit-btn">
                            {match.played ? "Editar Placar" : "Registrar Placar"}
                          </button>
                        ) : (
                          <div className="waiting-notice">Aguardando definição</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>
    )
  }

  const renderEditModal = () => {
    if (!editingMatch) return null

    return (
      <div className="edit-modal-overlay">
        <div className="edit-modal">
          <h3>Registrar Placar</h3>
          <div className="modal-match-players">
            <div className="player">{editingMatch.player1}</div>
            <div className="vs">VS</div>
            <div className="player">{editingMatch.player2}</div>
          </div>

          <div className="modal-score-inputs">
            <input type="number" min="0" value={score1} onChange={(e) => setScore1(e.target.value)} />
            <span>:</span>
            <input type="number" min="0" value={score2} onChange={(e) => setScore2(e.target.value)} />
          </div>

          <div className="modal-buttons">
            <button onClick={handleSaveScore} className="save-btn">
              Salvar
            </button>
            <button onClick={handleCancelEdit} className="cancel-btn">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="knockout-bracket-visual">
      <h2>Chaveamento do Mata-Mata</h2>
      {renderVisualBracket()}
      {renderEditModal()}
    </div>
  )
}

export default KnockoutBracketVisual
