import { useState, useEffect, useRef } from "react"
import "../css/KnockoutDraw.css"

function KnockoutDraw({ players, onDrawComplete }) {
  const [currentStep, setCurrentStep] = useState("intro") // intro, drawing, complete
  const [remainingPlayers, setRemainingPlayers] = useState([])
  const [drawnPlayers, setDrawnPlayers] = useState([])
  const [currentPlayer, setCurrentPlayer] = useState(null)
  const [currentPosition, setCurrentPosition] = useState(null)
  const [drawComplete, setDrawComplete] = useState(false)
  const [hasPreliminary, setHasPreliminary] = useState(false)
  const [preliminaryScore1, setPreliminaryScore1] = useState("")
  const [preliminaryScore2, setPreliminaryScore2] = useState("")
  const [preliminaryPlayed, setPreliminaryPlayed] = useState(false)

  const drumRef = useRef(null)
  const ballRef = useRef(null)

  useEffect(() => {
    if (currentStep === "drawing" && remainingPlayers.length === 0) {
      const needsPreliminary = players.length % 2 !== 0
      setHasPreliminary(needsPreliminary)

      const shuffled = [...players].sort(() => Math.random() - 0.5)
      setRemainingPlayers(shuffled)
    }
  }, [currentStep, players])

  useEffect(() => {
    let timer

    if (currentStep === "drawing" && remainingPlayers.length > 0) {
      if (drumRef.current) {
        drumRef.current.classList.add("spinning")
      }

      timer = setTimeout(() => {
        const nextPlayer = remainingPlayers[0]
        const updatedPlayers = remainingPlayers.slice(1)

        const position = drawnPlayers.length + 1

        setCurrentPlayer(nextPlayer)
        setCurrentPosition(position)

        if (ballRef.current) {
          ballRef.current.classList.add("drawn")
        }

        if (drumRef.current) {
          drumRef.current.classList.remove("spinning")
        }

        setTimeout(() => {
          setDrawnPlayers([...drawnPlayers, nextPlayer])
          setRemainingPlayers(updatedPlayers)

          if (ballRef.current) {
            ballRef.current.classList.remove("drawn")
          }

          if (updatedPlayers.length === 0) {
            setTimeout(() => {
              setDrawComplete(true)
              setCurrentStep("complete")
            }, 1000)
          }
        }, 1500)
      }, 2000)
    }

    return () => clearTimeout(timer)
  }, [currentStep, remainingPlayers, drawnPlayers])

  const handleStartDraw = () => {
    setCurrentStep("drawing")
  }

  const handleSavePreliminaryScore = () => {
    const s1 = Number.parseInt(preliminaryScore1, 10)
    const s2 = Number.parseInt(preliminaryScore2, 10)

    if (isNaN(s1) || isNaN(s2) || s1 < 0 || s2 < 0) {
      alert("Por favor, insira pontuações válidas (números não negativos)")
      return
    }

    if (s1 === s2) {
      alert("Não são permitidos empates no mata-mata. Por favor, defina um vencedor.")
      return
    }

    setPreliminaryPlayed(true)
  }

  const handleFinishDraw = () => {
    if (hasPreliminary && !preliminaryPlayed) {
      alert("Por favor, complete a fase preliminar antes de continuar.")
      return
    }

    const matches = generateKnockoutMatches(drawnPlayers, hasPreliminary, preliminaryScore1, preliminaryScore2)
    onDrawComplete(matches, hasPreliminary)
  }

  const generateKnockoutMatches = (sortedPlayers, hasPreliminary, prelimScore1, prelimScore2) => {
    const matches = []
    const totalPlayers = sortedPlayers.length

    let preliminaryWinner = null
    if (hasPreliminary) {
      preliminaryWinner =
        Number.parseInt(prelimScore1, 10) > Number.parseInt(prelimScore2, 10) ? sortedPlayers[0] : sortedPlayers[1]
    }

    let leftSidePlayers = []
    let rightSidePlayers = []

    if (hasPreliminary) {
      leftSidePlayers = [preliminaryWinner, ...sortedPlayers.slice(2, Math.ceil((totalPlayers + 1) / 2))]
      rightSidePlayers = sortedPlayers.slice(Math.ceil((totalPlayers + 1) / 2))
    } else {
      const midpoint = Math.ceil(totalPlayers / 2)
      leftSidePlayers = sortedPlayers.slice(0, midpoint)
      rightSidePlayers = sortedPlayers.slice(midpoint)
    }

    if (hasPreliminary) {
      matches.push({
        player1: sortedPlayers[0],
        player2: sortedPlayers[1],
        score1: Number.parseInt(prelimScore1, 10),
        score2: Number.parseInt(prelimScore2, 10),
        played: true,
        round: "preliminary",
        matchNumber: 1,
        nextMatch: null,
        winner: preliminaryWinner,
        side: "preliminary",
      })
    }

    let matchNumber = hasPreliminary ? 2 : 1
    const leftSideMatches = generateSideMatches(leftSidePlayers, matchNumber, "left")
    matches.push(...leftSideMatches)

    matchNumber = leftSideMatches.length + (hasPreliminary ? 2 : 1)
    const rightSideMatches = generateSideMatches(rightSidePlayers, matchNumber, "right")
    matches.push(...rightSideMatches)

    const finalMatchNumber = matches.length + 1
    matches.push({
      player1: null, 
      player2: null, 
      score1: null,
      score2: null,
      played: false,
      round: "final",
      matchNumber: finalMatchNumber,
      nextMatch: null,
      side: "center",
    })

    return matches
  }

  const generateSideMatches = (players, startMatchNumber, side) => {
    const matches = []
    const rounds = Math.ceil(Math.log2(players.length))

    // Primeira rodada
    let matchNumber = startMatchNumber
    let roundMatches = []

    for (let i = 0; i < players.length; i += 2) {
      const player1 = i < players.length ? players[i] : null
      const player2 = i + 1 < players.length ? players[i + 1] : "BYE"

      const match = {
        player1,
        player2,
        score1: player2 === "BYE" ? 1 : null,
        score2: player2 === "BYE" ? 0 : null,
        played: player2 === "BYE",
        round: "first",
        matchNumber,
        nextMatch: calculateNextMatch(matchNumber, side),
        side,
      }

      if (player2 === "BYE") {
        match.winner = player1
      }

      roundMatches.push(match)
      matchNumber++
    }

    matches.push(...roundMatches)

    let prevRoundMatches = roundMatches
    for (let round = 2; round <= rounds; round++) {
      const roundName = getRoundName(round, rounds)
      roundMatches = []

      for (let i = 0; i < prevRoundMatches.length; i += 2) {
        const match = {
          player1: null,
          player2: null,
          score1: null,
          score2: null,
          played: false,
          round: roundName,
          matchNumber,
          nextMatch: round < rounds ? calculateNextMatch(matchNumber, side) : calculateFinalMatch(side),
          side,
        }

        roundMatches.push(match)
        matchNumber++
      }

      matches.push(...roundMatches)
      prevRoundMatches = roundMatches
    }

    return matches
  }

  const calculateNextMatch = (currentMatch, side) => {
    return Math.floor(currentMatch / 2) + Math.ceil(currentMatch % 2) + Math.floor(currentMatch / 2)
  }

  const calculateFinalMatch = (side) => {
    return Number.MAX_SAFE_INTEGER 
  }

  const getRoundName = (round, totalRounds) => {
    if (round === totalRounds) return "semifinal"
    if (round === totalRounds - 1) return "quarterfinal"
    if (round === totalRounds - 2) return "roundOf16"
    if (round === totalRounds - 3) return "roundOf32"
    return `round${round}`
  }

  return (
    <div className="knockout-draw">
      {currentStep === "intro" && (
        <div className="draw-intro">
          <h2>Sorteio do Mata-Mata</h2>
          <p>Os {players.length} jogadores serão sorteados para definir as chaves do torneio.</p>
          {players.length % 2 !== 0 && (
            <p className="preliminary-notice">
              Como há um número ímpar de jogadores ({players.length}), os dois primeiros sorteados disputarão uma fase
              preliminar.
            </p>
          )}
          <button className="start-draw-btn" onClick={handleStartDraw}>
            Iniciar Sorteio
          </button>
        </div>
      )}

      {currentStep === "drawing" && (
        <div className="draw-ceremony">
          <h2>Sorteio em Andamento</h2>

          <div className="draw-animation">
            <div className="draw-drum" ref={drumRef}>
              {remainingPlayers.length > 0 && (
                <div className="draw-ball" ref={ballRef}>
                  <span className="ball-content">?</span>
                </div>
              )}
            </div>

            {currentPlayer && (
              <div className="draw-result">
                <div className="player-drawn">
                  <span className="player-name">{currentPlayer}</span>
                  <span className="position-badge">Posição {currentPosition}</span>
                </div>
              </div>
            )}
          </div>

          <div className="drawn-players">
            <h3>Jogadores Sorteados</h3>
            <div className="players-list">
              {drawnPlayers.map((player, index) => (
                <div key={index} className="drawn-player">
                  <span className="position">{index + 1}</span>
                  <span className="name">{player}</span>
                  {index < 2 && hasPreliminary && <span className="preliminary-badge">Preliminar</span>}
                </div>
              ))}
              {Array(players.length - drawnPlayers.length)
                .fill(null)
                .map((_, index) => (
                  <div key={`empty-${index}`} className="drawn-player empty">
                    <span className="position">{drawnPlayers.length + index + 1}</span>
                    <span className="name">...</span>
                  </div>
                ))}
            </div>
          </div>

          <div className="draw-status">
            {remainingPlayers.length > 0 ? (
              <p>Sorteando... {remainingPlayers.length} jogadores restantes</p>
            ) : (
              <p>Sorteio concluído!</p>
            )}
          </div>
        </div>
      )}

      {currentStep === "complete" && (
        <div className="draw-complete">
          <h2>Sorteio Concluído!</h2>

          <div className="final-draw">
            <h3>Chaves do Mata-Mata</h3>

            {hasPreliminary && (
              <div className="preliminary-info">
                <h4>Fase Preliminar</h4>
                <div className="preliminary-match">
                  <span className="player">{drawnPlayers[0]}</span>
                  <span className="vs">VS</span>
                  <span className="player">{drawnPlayers[1]}</span>
                </div>

                {!preliminaryPlayed ? (
                  <div className="preliminary-score-input">
                    <p>Insira o resultado da partida preliminar:</p>
                    <div className="score-inputs">
                      <input
                        type="number"
                        min="0"
                        value={preliminaryScore1}
                        onChange={(e) => setPreliminaryScore1(e.target.value)}
                        placeholder="0"
                      />
                      <span>:</span>
                      <input
                        type="number"
                        min="0"
                        value={preliminaryScore2}
                        onChange={(e) => setPreliminaryScore2(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    <button
                      className="save-score-btn"
                      onClick={handleSavePreliminaryScore}
                      disabled={!preliminaryScore1 || !preliminaryScore2 || preliminaryScore1 === preliminaryScore2}
                    >
                      Registrar Placar
                    </button>
                  </div>
                ) : (
                  <div className="preliminary-result">
                    <p>
                      Resultado: {preliminaryScore1} : {preliminaryScore2}
                    </p>
                    <p>
                      Vencedor:{" "}
                      <strong>
                        {Number.parseInt(preliminaryScore1, 10) > Number.parseInt(preliminaryScore2, 10)
                          ? drawnPlayers[0]
                          : drawnPlayers[1]}
                      </strong>
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="bracket-preview">
              <h4>Chaveamento</h4>
              <div className="bracket-sides">
                <div className="bracket-side">
                  <h5>Lado A</h5>
                  <div className="side-players">
                    {hasPreliminary ? (
                      <>
                        <div className="bracket-player winner-preliminary">
                          {preliminaryPlayed ? (
                            <span>
                              {Number.parseInt(preliminaryScore1, 10) > Number.parseInt(preliminaryScore2, 10)
                                ? drawnPlayers[0]
                                : drawnPlayers[1]}
                            </span>
                          ) : (
                            <span>Vencedor da Preliminar</span>
                          )}
                        </div>
                        {drawnPlayers.slice(2, Math.ceil((drawnPlayers.length + 1) / 2)).map((player, index) => (
                          <div key={index} className="bracket-player">
                            {player}
                          </div>
                        ))}
                      </>
                    ) : (
                      drawnPlayers
                        .slice(0, Math.ceil(drawnPlayers.length / 2))
                        .map((player, index) => (
                          <div key={index} className="bracket-player">
                            {player}
                          </div>
                        ))
                    )}
                  </div>
                </div>

                <div className="bracket-side">
                  <h5>Lado B</h5>
                  <div className="side-players">
                    {hasPreliminary
                      ? drawnPlayers.slice(Math.ceil((drawnPlayers.length + 1) / 2)).map((player, index) => (
                          <div key={index} className="bracket-player">
                            {player}
                          </div>
                        ))
                      : drawnPlayers.slice(Math.ceil(drawnPlayers.length / 2)).map((player, index) => (
                          <div key={index} className="bracket-player">
                            {player}
                          </div>
                        ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button className="continue-btn" onClick={handleFinishDraw} disabled={hasPreliminary && !preliminaryPlayed}>
            Continuar para o Torneio
          </button>
        </div>
      )}
    </div>
  )
}

export default KnockoutDraw
