import { useState, useEffect } from "react"
import "../css/WorldCupBracket.css"

function WorldCupBracket({ matches, onUpdateMatch }) {
  const [editingMatch, setEditingMatch] = useState(null)
  const [score1, setScore1] = useState("")
  const [score2, setScore2] = useState("")

  const organizeMatches = () => {
    const organized = {
      preliminary: [],
      left: {
        first: [],
        roundOf16: [],
        quarterfinal: [],
        semifinal: [],
      },
      right: {
        first: [],
        roundOf16: [],
        quarterfinal: [],
        semifinal: [],
      },
      final: [],
    }

    matches.forEach((match) => {
      if (match.round === "preliminary") {
        organized.preliminary.push(match)
      } else if (match.round === "final") {
        organized.final.push(match)
      } else if (match.side === "left") {
        organized.left[match.round].push(match)
      } else if (match.side === "right") {
        organized.right[match.round].push(match)
      }
    })

    return organized
  }

  const organizedMatches = organizeMatches()

  useEffect(() => {
    matches.forEach((match) => {
      if (match.played && match.nextMatch) {
        const nextMatchIndex = matches.findIndex((m) => m.matchNumber === match.nextMatch)

        if (nextMatchIndex !== -1) {
          const nextMatch = matches[nextMatchIndex]

          const winner = match.score1 > match.score2 ? match.player1 : match.player2

          const isOdd = match.matchNumber % 2 !== 0

          const updatedNextMatch = { ...nextMatch }

          if (isOdd && nextMatch.player1 === null) {
            updatedNextMatch.player1 = winner
            onUpdateMatch(nextMatchIndex, updatedNextMatch)
          } else if (!isOdd && nextMatch.player2 === null) {
            updatedNextMatch.player2 = winner
            onUpdateMatch(nextMatchIndex, updatedNextMatch)
          }
        }
      }
    })
  }, [matches, onUpdateMatch])

  useEffect(() => {
    const leftSemifinal = matches.find((m) => m.round === "semifinal" && m.side === "left")
    const rightSemifinal = matches.find((m) => m.round === "semifinal" && m.side === "right")
    const final = matches.find((m) => m.round === "final")

    if (leftSemifinal && rightSemifinal && final && leftSemifinal.played && rightSemifinal.played) {
      const leftWinner = leftSemifinal.score1 > leftSemifinal.score2 ? leftSemifinal.player1 : leftSemifinal.player2
      const rightWinner =
        rightSemifinal.score1 > rightSemifinal.score2 ? rightSemifinal.player1 : rightSemifinal.player2

      const finalIndex = matches.indexOf(final)
      onUpdateMatch(finalIndex, {
        ...final,
        player1: leftWinner,
        player2: rightWinner,
      })
    }
  }, [matches, onUpdateMatch])

  const handleEditMatch = (match) => {
    setEditingMatch(match)
    setScore1(match.score1 !== null ? match.score1.toString() : "")
    setScore2(match.score2 !== null ? match.score2.toString() : "")
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

  const renderMatchCard = (match) => {
    if (!match) return null

    return (
      <div key={match.matchNumber} className={`bracket-match-card ${match.played ? "played" : "not-played"}`}>
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
          match.player2 !== "A definir" &&
          match.player2 !== "BYE" ? (
            <button onClick={() => handleEditMatch(match)} className="edit-btn">
              {match.played ? "Editar Placar" : "Registrar Placar"}
            </button>
          ) : match.player2 === "BYE" ? (
            <div className="bye-notice">Classificação automática</div>
          ) : (
            <div className="waiting-notice">Aguardando definição</div>
          )}
        </div>
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

  const renderPreliminary = () => {
    if (organizedMatches.preliminary.length === 0) return null

    return (
      <div className="bracket-section preliminary-section">
        <h3 className="bracket-round-title">Fase Preliminar</h3>
        <div className="bracket-matches">{organizedMatches.preliminary.map((match) => renderMatchCard(match))}</div>
      </div>
    )
  }

  const renderSide = (side, title) => {
    const rounds = ["first", "roundOf16", "quarterfinal", "semifinal"]

    return (
      <div className={`bracket-side ${side}-side`}>
        <h3 className="side-title">{title}</h3>
        {rounds.map((round) => {
          if (organizedMatches[side][round] && organizedMatches[side][round].length > 0) {
            return (
              <div key={round} className={`bracket-round ${round}-round`}>
                <h4 className="round-title">{getRoundDisplayName(round)}</h4>
                <div className="round-matches">
                  {organizedMatches[side][round].map((match) => renderMatchCard(match))}
                </div>
              </div>
            )
          }
          return null
        })}
      </div>
    )
  }

  const renderFinal = () => {
    if (organizedMatches.final.length === 0) return null

    return (
      <div className="bracket-section final-section">
        <h3 className="bracket-round-title">Final</h3>
        <div className="bracket-matches">{organizedMatches.final.map((match) => renderMatchCard(match))}</div>
      </div>
    )
  }

  return (
    <div className="world-cup-bracket">
      <h2>Chaveamento do Mata-Mata</h2>

      {renderPreliminary()}

      <div className="main-bracket">
        <div className="bracket-sides">
          {renderSide("left", "Lado A")}

          {renderFinal()}

          {renderSide("right", "Lado B")}
        </div>
      </div>

      {renderEditModal()}
    </div>
  )
}

export default WorldCupBracket
