import { useEffect } from "react"
import "../css/KnockoutBracket.css"
import KnockoutBracketVisual from "./KnockoutBracketVisual"

function KnockoutBracket({ matches, onUpdateMatch }) {
  const hasPreliminary = matches.some((match) => match.round === "preliminary")

  const isPreliminaryComplete =
    !hasPreliminary || matches.filter((match) => match.round === "preliminary").every((match) => match.played)

  useEffect(() => {
    matches.forEach((match) => {
      if (match.played && match.nextMatch) {
        const nextMatch = matches.find((m) => m.matchNumber === match.nextMatch)

        if (nextMatch) {
          const winner = match.score1 > match.score2 ? match.player1 : match.player2

          const isOdd = match.matchNumber % 2 !== 0

          if (isOdd && nextMatch.player1 === null) {
            onUpdateMatch(matches.indexOf(nextMatch), {
              ...nextMatch,
              player1: winner,
            })
          } else if (!isOdd && nextMatch.player2 === null) {
            onUpdateMatch(matches.indexOf(nextMatch), {
              ...nextMatch,
              player2: winner,
            })
          }
        }
      }
    })
  }, [matches, onUpdateMatch])

  return (
    <div className="knockout-bracket-container">
      {hasPreliminary && !isPreliminaryComplete ? (
        <div className="preliminary-only">
          <h2>Fase Preliminar</h2>
          <p className="preliminary-info">Complete a fase preliminar para avançar para o chaveamento principal.</p>
          <div className="preliminary-matches">
            {matches
              .filter((match) => match.round === "preliminary")
              .map((match, index) => (
                <div key={index} className={`match-card ${match.played ? "played" : "not-played"}`}>
                  <div className="match-header">Partida {match.matchNumber}</div>
                  <div className="match-players">
                    <div className="player">{match.player1}</div>
                    <div className="vs">VS</div>
                    <div className="player">{match.player2}</div>
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
                    <button
                      onClick={() => {
                        const score1 = prompt(`Placar para ${match.player1}:`, "0")
                        const score2 = prompt(`Placar para ${match.player2}:`, "0")

                        if (score1 !== null && score2 !== null) {
                          const s1 = Number.parseInt(score1)
                          const s2 = Number.parseInt(score2)

                          if (!isNaN(s1) && !isNaN(s2) && s1 >= 0 && s2 >= 0) {
                            if (s1 === s2) {
                              alert("Não são permitidos empates no mata-mata. Por favor, defina um vencedor.")
                              return
                            }

                            onUpdateMatch(matches.indexOf(match), {
                              ...match,
                              score1: s1,
                              score2: s2,
                              played: true,
                            })
                          } else {
                            alert("Por favor, insira pontuações válidas (números não negativos)")
                          }
                        }
                      }}
                      className="edit-btn"
                    >
                      {match.played ? "Editar Placar" : "Registrar Placar"}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ) : (
        <KnockoutBracketVisual matches={matches} onUpdateMatch={onUpdateMatch} />
      )}
    </div>
  )
}

export default KnockoutBracket
