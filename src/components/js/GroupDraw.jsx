import { useState, useEffect, useRef } from "react"
import "../css/GroupDraw.css"

function GroupDraw({ players, onDrawComplete }) {
  const [currentStep, setCurrentStep] = useState("intro")
  const [remainingPlayers, setRemainingPlayers] = useState([])
  const [groupA, setGroupA] = useState([])
  const [groupB, setGroupB] = useState([])
  const [currentPlayer, setCurrentPlayer] = useState(null)
  const [currentGroup, setCurrentGroup] = useState(null)
  const [drawComplete, setDrawComplete] = useState(false)

  const drumRef = useRef(null)
  const ballRef = useRef(null)

  useEffect(() => {
    if (currentStep === "drawing" && remainingPlayers.length === 0) {
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
        const nextGroup = groupA.length <= groupB.length ? "A" : "B"

        const nextPlayer = remainingPlayers[0]
        const updatedPlayers = remainingPlayers.slice(1)

        setCurrentPlayer(nextPlayer)
        setCurrentGroup(nextGroup)

        if (ballRef.current) {
          ballRef.current.classList.add("drawn")
        }

        if (drumRef.current) {
          drumRef.current.classList.remove("spinning")
        }

        setTimeout(() => {
          if (nextGroup === "A") {
            setGroupA([...groupA, nextPlayer])
          } else {
            setGroupB([...groupB, nextPlayer])
          }

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
  }, [currentStep, remainingPlayers, groupA, groupB])

  const handleStartDraw = () => {
    setCurrentStep("drawing")
  }

  const handleFinishDraw = () => {
    const groups = {
      A: groupA,
      B: groupB,
    }

    onDrawComplete(groups)
  }

  return (
    <div className="group-draw">
      {currentStep === "intro" && (
        <div className="draw-intro">
          <h2>Sorteio dos Grupos</h2>
          <p>Os {players.length} jogadores serão divididos em dois grupos.</p>
          <p>Prepare-se para o sorteio estilo Champions League!</p>
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
                  <span>{remainingPlayers[0]?.charAt(0)}</span>
                </div>
              )}
            </div>

            {currentPlayer && (
              <div className="draw-result">
                <div className="player-drawn">
                  <span className="player-name">{currentPlayer}</span>
                  <span className="group-name">Grupo {currentGroup}</span>
                </div>
              </div>
            )}
          </div>

          <div className="groups-preview">
            <div className="group">
              <h3>Grupo A</h3>
              <ul>
                {groupA.map((player, index) => (
                  <li key={index} className="player-item">
                    {player}
                  </li>
                ))}
                {Array(Math.max(0, Math.ceil(players.length / 2) - groupA.length))
                  .fill(null)
                  .map((_, index) => (
                    <li key={`empty-a-${index}`} className="empty-slot">
                      ...
                    </li>
                  ))}
              </ul>
            </div>

            <div className="group">
              <h3>Grupo B</h3>
              <ul>
                {groupB.map((player, index) => (
                  <li key={index} className="player-item">
                    {player}
                  </li>
                ))}
                {Array(Math.max(0, Math.floor(players.length / 2) - groupB.length))
                  .fill(null)
                  .map((_, index) => (
                    <li key={`empty-b-${index}`} className="empty-slot">
                      ...
                    </li>
                  ))}
              </ul>
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

          <div className="final-groups">
            <div className="group">
              <h3>Grupo A</h3>
              <ul>
                {groupA.map((player, index) => (
                  <li key={index}>{player}</li>
                ))}
              </ul>
            </div>

            <div className="group">
              <h3>Grupo B</h3>
              <ul>
                {groupB.map((player, index) => (
                  <li key={index}>{player}</li>
                ))}
              </ul>
            </div>
          </div>

          <p>Os dois melhores de cada grupo avançarão para os playoffs.</p>

          <button className="continue-btn" onClick={handleFinishDraw}>
            Continuar para o Torneio
          </button>
        </div>
      )}
    </div>
  )
}

export default GroupDraw
