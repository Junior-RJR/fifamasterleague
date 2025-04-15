import { useState, useEffect } from "react"
import "./App.css"
import PlayerInput from "./components/js/PlayerInput"
import MatchList from "./components/js/MatchList"
import LeagueTable from "./components/js/LeagueTable"
import Login from "./components/js/Login"
import Playoffs from "./components/js/Playoffs"

function App() {
  const [players, setPlayers] = useState([])
  const [matches, setMatches] = useState([])
  const [playoffMatches, setPlayoffMatches] = useState([])
  const [user, setUser] = useState(null)
  const [view, setView] = useState("input")
  const [playoffsStarted, setPlayoffsStarted] = useState(false)

  useEffect(() => {
    if (user) {
      const savedData = localStorage.getItem(`fifaLeague_${user}`)
      if (savedData) {
        const data = JSON.parse(savedData)
        setPlayers(data.players || [])
        setMatches(data.matches || [])
        setPlayoffMatches(data.playoffMatches || [])
        setPlayoffsStarted(data.playoffsStarted || false)
        if (data.players && data.players.length > 0) {
          setView(data.playoffsStarted ? "playoffs" : "matches")
        }
      }
    }
  }, [user])

  useEffect(() => {
    if (user && (players.length > 0 || matches.length > 0)) {
      localStorage.setItem(
        `fifaLeague_${user}`,
        JSON.stringify({
          players,
          matches,
          playoffMatches,
          playoffsStarted,
        }),
      )
    }
  }, [players, matches, playoffMatches, playoffsStarted, user])

  const generateMatches = (playerList) => {
    if (playerList.length < 2) return []

    const newMatches = []

    for (let i = 0; i < playerList.length; i++) {
      for (let j = i + 1; j < playerList.length; j++) {
        newMatches.push({
          player1: playerList[i],
          player2: playerList[j],
          score1: null,
          score2: null,
          played: false,
        })
      }
    }

    return shuffleMatches(newMatches, playerList)
  }

  const shuffleMatches = (matches, playerList) => {
    const shuffled = [...matches]

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    let validShuffle = false
    let attempts = 0
    const maxAttempts = 50

    while (!validShuffle && attempts < maxAttempts) {
      validShuffle = true

      for (let i = 0; i < playerList.length; i++) {
        const player = playerList[i]
        let consecutiveGames = 0

        for (let j = 0; j < shuffled.length - 1; j++) {
          const isInCurrentGame = shuffled[j].player1 === player || shuffled[j].player2 === player
          const isInNextGame = shuffled[j + 1].player1 === player || shuffled[j + 1].player2 === player

          if (isInCurrentGame && isInNextGame) {
            consecutiveGames++
            if (consecutiveGames >= 2) {
              validShuffle = false
              break
            }
          } else if (!isInCurrentGame) {
            consecutiveGames = 0
          }
        }

        if (!validShuffle) break
      }

      if (!validShuffle) {
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }
        attempts++
      }
    }

    return shuffled
  }

  const handleCreateTournament = (playerNames) => {
    setPlayers(playerNames)
    const newMatches = generateMatches(playerNames)
    setMatches(newMatches)
    setView("matches")
  }

  const handleUpdateMatch = (index, score1, score2) => {
    const updatedMatches = [...matches]
    updatedMatches[index] = {
      ...updatedMatches[index],
      score1,
      score2,
      played: true,
    }
    setMatches(updatedMatches)
  }

  const handleUpdatePlayoffMatch = (index, score1, score2) => {
    const updatedMatches = [...playoffMatches]
    updatedMatches[index] = {
      ...updatedMatches[index],
      score1,
      score2,
      played: true,
    }
    setPlayoffMatches(updatedMatches)
  }

  const handleStartPlayoffs = (topFourPlayers) => {
    const semifinalMatches = [
      {
        player1: topFourPlayers[0],
        player2: topFourPlayers[3],
        score1: null,
        score2: null,
        played: false,
        round: "semifinal",
      },
      {
        player1: topFourPlayers[1],
        player2: topFourPlayers[2],
        score1: null,
        score2: null,
        played: false,
        round: "semifinal",
      },
    ]

    const finalMatch = {
      player1: null,
      player2: null,
      score1: null,
      score2: null,
      played: false,
      round: "final",
    }

    const thirdPlaceMatch = {
      player1: null,
      player2: null,
      score1: null,
      score2: null,
      played: false,
      round: "thirdPlace",
    }

    setPlayoffMatches([...semifinalMatches, finalMatch, thirdPlaceMatch])
    setPlayoffsStarted(true)
    setView("playoffs")
  }

  const handleLogin = (username) => {
    setUser(username)
  }

  const handleLogout = () => {
    setUser(null)
    setPlayers([])
    setMatches([])
    setPlayoffMatches([])
    setPlayoffsStarted(false)
    setView("input")
  }

  const handleReset = () => {
    if (window.confirm("Tem certeza que deseja reiniciar o torneio? Todos os dados serão perdidos.")) {
      setPlayers([])
      setMatches([])
      setPlayoffMatches([])
      setPlayoffsStarted(false)
      setView("input")
      if (user) {
        localStorage.removeItem(`fifaLeague_${user}`)
      }
    }
  }

  const allMatchesPlayed = matches.length > 0 && matches.every((match) => match.played)

  return (
    <div className="app">
      <header>
        <h1>Liga Master FIFA</h1>
        {user ? (
          <div className="user-info">
            <span>Logado como: {user}</span>
            <button onClick={handleLogout} className="logout-btn">
              Sair
            </button>
          </div>
        ) : (
          <Login onLogin={handleLogin} />
        )}
      </header>

      <main>
        {view === "input" && <PlayerInput onCreateTournament={handleCreateTournament} />}

        {view !== "input" && (
          <div className="navigation">
            <button className={view === "matches" ? "active" : ""} onClick={() => setView("matches")}>
              Partidas
            </button>
            <button className={view === "table" ? "active" : ""} onClick={() => setView("table")}>
              Tabela
            </button>
            <button className={view === "playoffs" ? "active" : ""} onClick={() => setView("playoffs")}>
              Pódio
            </button>
            <button onClick={handleReset} className="reset-btn">
              Reiniciar Torneio
            </button>
          </div>
        )}

        {view === "matches" && (
          <MatchList
            matches={matches}
            onUpdateMatch={handleUpdateMatch}
            allMatchesPlayed={allMatchesPlayed}
            onStartPlayoffs={handleStartPlayoffs}
            playoffsStarted={playoffsStarted}
          />
        )}

        {view === "table" && <LeagueTable players={players} matches={matches} />}

        {view === "playoffs" && (
          <Playoffs
            matches={playoffMatches}
            onUpdateMatch={handleUpdatePlayoffMatch}
            allMatchesPlayed={allMatchesPlayed}
            players={players}
            regularMatches={matches}
          />
        )}
      </main>
    </div>
  )
}

export default App
