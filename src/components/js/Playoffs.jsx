import { useState, useEffect } from "react"
import "../css/Playoffs.css"

function Playoffs({ matches, onUpdateMatch, allMatchesPlayed, players, regularMatches }) {
  const [editingIndex, setEditingIndex] = useState(null)
  const [score1, setScore1] = useState("")
  const [score2, setScore2] = useState("")

  const semifinalMatches = matches.filter((match) => match.round === "semifinal")
  const finalMatch = matches.find((match) => match.round === "final")
  const thirdPlaceMatch = matches.find((match) => match.round === "thirdPlace")

  useEffect(() => {
    if (semifinalMatches.length === 2 && semifinalMatches.every((match) => match.played)) {
      const winners = []
      const losers = []

      semifinalMatches.forEach((match) => {
        if (match.score1 > match.score2) {
          winners.push(match.player1)
          losers.push(match.player2)
        } else {
          winners.push(match.player2)
          losers.push(match.player1)
        }
      })

      if (finalMatch && !finalMatch.player1) {
        finalMatch.player1 = winners[0]
        finalMatch.player2 = winners[1]

        const finalIndex = matches.findIndex((match) => match.round === "final")
        if (finalIndex !== -1) {
          onUpdateMatch(finalIndex, null, null)
        }
      }

      if (thirdPlaceMatch && !thirdPlaceMatch.player1) {
        thirdPlaceMatch.player1 = losers[0]
        thirdPlaceMatch.player2 = losers[1]

        const thirdPlaceIndex = matches.findIndex((match) => match.round === "thirdPlace")
        if (thirdPlaceIndex !== -1) {
          onUpdateMatch(thirdPlaceIndex, null, null)
        }
      }
    }
  }, [semifinalMatches, finalMatch, thirdPlaceMatch, matches, onUpdateMatch])

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

    if (s1 === s2) {
      alert("Não são permitidos empates nas fases eliminatórias. Por favor, defina um vencedor.")
      return
    }

    onUpdateMatch(index, s1, s2)
    setEditingIndex(null)
  }

  const handleCancelEdit = () => {
    setEditingIndex(null)
  }

  const determineChampion = () => {
    if (finalMatch && finalMatch.played) {
      const champion = finalMatch.score1 > finalMatch.score2 ? finalMatch.player1 : finalMatch.player2
      const runnerUp = finalMatch.score1 > finalMatch.score2 ? finalMatch.player2 : finalMatch.player1
      return { champion, runnerUp }
    }
    return { champion: null, runnerUp: null }
  }

  const determineThirdPlace = () => {
    if (thirdPlaceMatch && thirdPlaceMatch.played) {
      return thirdPlaceMatch.score1 > thirdPlaceMatch.score2 ? thirdPlaceMatch.player1 : thirdPlaceMatch.player2
    }
    return null
  }

  const { champion, runnerUp } = determineChampion()
  const thirdPlace = determineThirdPlace()

  const calculateStandings = () => {
    if (!players || players.length === 0 || !regularMatches || regularMatches.length === 0) {
      return []
    }

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

    regularMatches.forEach((match) => {
      if (!match.played) return

      const player1Index = players.indexOf(match.player1)
      const player2Index = players.indexOf(match.player2)

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

  const standings = calculateStandings()
  const topFourPlayers = standings.slice(0, 4).map((player) => player.name)

  const playoffsStarted = matches && matches.length > 0

  const allRegularMatchesPlayed =
    regularMatches && regularMatches.length > 0 && regularMatches.every((match) => match.played)

  return (
    <div className="playoffs">
      <h2>Pódio do Campeonato</h2>

      {champion && (
        <div className="champions-podium">
          <div className="champion">
            <div className="trophy">🏆</div>
            <h3>Campeão</h3>
            <div className="player-name">{champion}</div>
          </div>
          <div className="runner-up">
            <div className="medal">🥈</div>
            <h3>Vice-Campeão</h3>
            <div className="player-name">{runnerUp}</div>
          </div>
          {thirdPlace && (
            <div className="third-place">
              <div className="medal">🥉</div>
              <h3>Terceiro Lugar</h3>
              <div className="player-name">{thirdPlace}</div>
            </div>
          )}
        </div>
      )}

      {!playoffsStarted && allRegularMatchesPlayed && topFourPlayers.length >= 4 && (
        <div className="playoffs-info">
          <p>Todas as partidas da fase de grupos foram concluídas!</p>
          <p>Os quatro primeiros colocados se classificaram para os playoffs:</p>
          <div className="qualified-players">
            {topFourPlayers.map((player, index) => (
              <div key={index} className="qualified-player">
                <span className="position">{index + 1}º</span>
                <span className="name">{player}</span>
              </div>
            ))}
          </div>
          <p>Vá para a aba "Partidas" para iniciar os playoffs.</p>
        </div>
      )}

      {!playoffsStarted && !allRegularMatchesPlayed && (
        <div className="playoffs-info">
          <p>O pódio será exibido após a conclusão dos playoffs.</p>
          <p>Primeiro, termine todas as partidas da fase de grupos.</p>
        </div>
      )}

      {playoffsStarted && (
        <div className="bracket">
          <div className="round">
            <h3>Semifinais</h3>
            <div className="matches">
              {semifinalMatches.map((match, idx) => {
                const matchIndex = matches.findIndex((m) => m === match)
                return (
                  <div key={idx} className={`match-card ${match.played ? "played" : "not-played"}`}>
                    <div className="match-players">
                      <div className="player">{match.player1}</div>
                      <div className="vs">VS</div>
                      <div className="player">{match.player2}</div>
                    </div>

                    {editingIndex === matchIndex ? (
                      <div className="score-editor">
                        <div className="score-inputs">
                          <input type="number" min="0" value={score1} onChange={(e) => setScore1(e.target.value)} />
                          <span>:</span>
                          <input type="number" min="0" value={score2} onChange={(e) => setScore2(e.target.value)} />
                        </div>
                        <div className="editor-buttons">
                          <button onClick={() => handleSaveScore(matchIndex)}>Salvar</button>
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
                        <button onClick={() => handleEditMatch(matchIndex)} className="edit-btn">
                          {match.played ? "Editar Placar" : "Registrar Placar"}
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="round">
            <h3>Disputa de 3º Lugar</h3>
            <div className="matches">
              {thirdPlaceMatch && thirdPlaceMatch.player1 && (
                <div className={`match-card ${thirdPlaceMatch.played ? "played" : "not-played"}`}>
                  <div className="match-players">
                    <div className="player">{thirdPlaceMatch.player1}</div>
                    <div className="vs">VS</div>
                    <div className="player">{thirdPlaceMatch.player2}</div>
                  </div>

                  {editingIndex === matches.findIndex((m) => m === thirdPlaceMatch) ? (
                    <div className="score-editor">
                      <div className="score-inputs">
                        <input type="number" min="0" value={score1} onChange={(e) => setScore1(e.target.value)} />
                        <span>:</span>
                        <input type="number" min="0" value={score2} onChange={(e) => setScore2(e.target.value)} />
                      </div>
                      <div className="editor-buttons">
                        <button onClick={() => handleSaveScore(matches.findIndex((m) => m === thirdPlaceMatch))}>
                          Salvar
                        </button>
                        <button onClick={handleCancelEdit}>Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <div className="match-details">
                      {thirdPlaceMatch.played ? (
                        <div className="score">
                          <span>{thirdPlaceMatch.score1}</span>
                          <span>:</span>
                          <span>{thirdPlaceMatch.score2}</span>
                        </div>
                      ) : (
                        <div className="match-status">Ainda não jogada</div>
                      )}
                      <button
                        onClick={() => handleEditMatch(matches.findIndex((m) => m === thirdPlaceMatch))}
                        className="edit-btn"
                      >
                        {thirdPlaceMatch.played ? "Editar Placar" : "Registrar Placar"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="round">
            <h3>Final</h3>
            <div className="matches">
              {finalMatch && finalMatch.player1 && (
                <div className={`match-card ${finalMatch.played ? "played" : "not-played"} final-match`}>
                  <div className="match-players">
                    <div className="player">{finalMatch.player1}</div>
                    <div className="vs">VS</div>
                    <div className="player">{finalMatch.player2}</div>
                  </div>

                  {editingIndex === matches.findIndex((m) => m === finalMatch) ? (
                    <div className="score-editor">
                      <div className="score-inputs">
                        <input type="number" min="0" value={score1} onChange={(e) => setScore1(e.target.value)} />
                        <span>:</span>
                        <input type="number" min="0" value={score2} onChange={(e) => setScore2(e.target.value)} />
                      </div>
                      <div className="editor-buttons">
                        <button onClick={() => handleSaveScore(matches.findIndex((m) => m === finalMatch))}>
                          Salvar
                        </button>
                        <button onClick={handleCancelEdit}>Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <div className="match-details">
                      {finalMatch.played ? (
                        <div className="score">
                          <span>{finalMatch.score1}</span>
                          <span>:</span>
                          <span>{finalMatch.score2}</span>
                        </div>
                      ) : (
                        <div className="match-status">Ainda não jogada</div>
                      )}
                      <button
                        onClick={() => handleEditMatch(matches.findIndex((m) => m === finalMatch))}
                        className="edit-btn"
                      >
                        {finalMatch.played ? "Editar Placar" : "Registrar Placar"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Playoffs
