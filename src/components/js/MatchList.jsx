import { useState } from "react"
import "../css/MatchList.css"

function MatchList({ matches, onUpdateMatch, allMatchesPlayed, onStartPlayoffs, playoffsStarted }) {
  const [editingIndex, setEditingIndex] = useState(null)
  const [score1, setScore1] = useState("")
  const [score2, setScore2] = useState("")

  const handleEditMatch = (index) => {
    setEditingIndex(index)
    setScore1(matches[index].score1 !== null ? matches[index].score1 : "")
    setScore2(matches[index].score2 !== null ? matches[index].score2 : "")
  }

  const handleSaveScore = (index) => {
    const s1 = Number.parseInt(score1, 10)
    const s2 = Number.parseInt(score2, 10)

    if (isNaN(s1) || isNaN(s2) || s1 < 0 || s2 < 0) {
      alert("Por favor, insira pontuações válidas (números não negativos)")
      return
    }

    onUpdateMatch(index, s1, s2)
    setEditingIndex(null)
  }

  const handleCancelEdit = () => {
    setEditingIndex(null)
  }

  const completedMatches = matches.filter((match) => match.played).length
  const completionPercentage = matches.length > 0 ? Math.round((completedMatches / matches.length) * 100) : 0

  const calculateStandings = () => {
    const players = [...new Set(matches.flatMap((match) => [match.player1, match.player2]))]
    const standings = players.map((player) => ({
      name: player,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    }))

    matches.forEach((match) => {
      if (!match.played) return

      const player1Index = standings.findIndex((p) => p.name === match.player1)
      const player2Index = standings.findIndex((p) => p.name === match.player2)

      if (player1Index === -1 || player2Index === -1) return

      standings[player1Index].played++
      standings[player2Index].played++

      standings[player1Index].goalsFor += match.score1
      standings[player1Index].goalsAgainst += match.score2
      standings[player2Index].goalsFor += match.score2
      standings[player2Index].goalsAgainst += match.score1

      if (match.score1 > match.score2) {
        standings[player1Index].won++
        standings[player1Index].points += 3
        standings[player2Index].lost++
      } else if (match.score1 < match.score2) {
        standings[player2Index].won++
        standings[player2Index].points += 3
        standings[player1Index].lost++
      } else {
        standings[player1Index].drawn++
        standings[player1Index].points += 1
        standings[player2Index].drawn++
        standings[player2Index].points += 1
      }
    })

    standings.forEach((player) => {
      player.goalDifference = player.goalsFor - player.goalsAgainst
    })

    return standings.sort((a, b) => {
      if (a.points !== b.points) return b.points - a.points
      if (a.goalDifference !== b.goalDifference) return b.goalDifference - a.goalDifference
      return b.goalsFor - a.goalsFor
    })
  }

  const handleStartPlayoffs = () => {
    const standings = calculateStandings()
    const topFourPlayers = standings.slice(0, 4).map((player) => player.name)

    if (topFourPlayers.length < 4) {
      alert("Não há jogadores suficientes para iniciar os playoffs. São necessários pelo menos 4 jogadores.")
      return
    }

    onStartPlayoffs(topFourPlayers)
  }

  return (
    <div className="match-list">
      <h2>Partidas</h2>

      <div className="progress-bar">
        <div className="progress" style={{ width: `${completionPercentage}%` }}></div>
        <span>
          {completionPercentage}% Concluído ({completedMatches}/{matches.length})
        </span>
      </div>

      {allMatchesPlayed && !playoffsStarted && (
        <div className="playoffs-alert">
          <p>Todas as partidas foram concluídas! Você pode iniciar os playoffs agora.</p>
          <button onClick={handleStartPlayoffs} className="start-playoffs-btn">
            Iniciar Playoffs (Semifinais e Final)
          </button>
        </div>
      )}

      {matches.length === 0 ? (
        <p className="no-matches">Nenhuma partida gerada ainda.</p>
      ) : (
        <div className="matches">
          {matches.map((match, index) => (
            <div key={index} className={`match-card ${match.played ? "played" : ""}`}>
              <div className="match-header">Partida {index + 1}</div>
              <div className="match-players">
                <div className="player">{match.player1}</div>
                <div className="vs">VS</div>
                <div className="player">{match.player2}</div>
              </div>

              {editingIndex === index ? (
                <div className="score-editor">
                  <div className="score-inputs">
                    <input type="number" min="0" value={score1} onChange={(e) => setScore1(e.target.value)} />
                    <span>:</span>
                    <input type="number" min="0" value={score2} onChange={(e) => setScore2(e.target.value)} />
                  </div>
                  <div className="editor-buttons">
                    <button onClick={() => handleSaveScore(index)}>Salvar</button>
                    <button onClick={handleCancelEdit}>Cancelar</button>
                  </div>
                </div>
              ) : (
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
                  <button onClick={() => handleEditMatch(index)} className="edit-btn">
                    {match.played ? "Editar Placar" : "Registrar Placar"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MatchList
