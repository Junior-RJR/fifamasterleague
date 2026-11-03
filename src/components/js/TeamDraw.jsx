import { useState } from "react"
import "../css/TeamDraw.css"

// Jogadores que sempre ficam juntos no Time 2
const FIXED_GROUP = ["junior", "lucas", "willian", "william", "wilian"]
const FIXED_TEAM_INDEX = 1

const normalize = (name) =>
  name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")

const shuffle = (list) => {
  const arr = [...list]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

const drawTeams = (names, teamCount, perTeam) => {
  const fixed = names.filter((n) => FIXED_GROUP.includes(normalize(n)))
  const others = shuffle(names.filter((n) => !FIXED_GROUP.includes(normalize(n))))

  const teams = Array.from({ length: teamCount }, () => [])
  const fixedIndex = Math.min(FIXED_TEAM_INDEX, teamCount - 1)
  teams[fixedIndex].push(...fixed)

  // Preenche os times definidos
  for (const team of teams) {
    while (team.length < perTeam && others.length > 0) {
      team.push(others.shift())
    }
  }

  // O que sobrar vira time(s) extra(s)
  while (others.length > 0) {
    teams.push(others.splice(0, perTeam))
  }

  return teams.map((t) => shuffle(t))
}

function TeamDraw() {
  const [namesText, setNamesText] = useState("")
  const [teamCount, setTeamCount] = useState(2)
  const [perTeam, setPerTeam] = useState(3)
  const [teams, setTeams] = useState([])
  const [drawing, setDrawing] = useState(false)

  const names = namesText
    .split(/[\n,;]+/)
    .map((n) => n.trim())
    .filter((n) => n !== "")

  const handleDraw = () => {
    if (names.length < 2) {
      alert("Coloque pelo menos 2 nomes")
      return
    }
    if (teamCount < 1 || perTeam < 1) {
      alert("Quantidade de times e de pessoas por time precisa ser pelo menos 1")
      return
    }
    setDrawing(true)
    setTeams([])
    setTimeout(() => {
      setTeams(drawTeams(names, teamCount, perTeam))
      setDrawing(false)
    }, 1200)
  }

  const handleClear = () => {
    setTeams([])
    setNamesText("")
  }

  return (
    <div className="team-draw">
      <h2>Sorteador de Times</h2>

      <div className="team-draw-config">
        <div className="team-draw-field">
          <label htmlFor="teamCount">Quantidade de times</label>
          <input
            id="teamCount"
            type="number"
            min="1"
            max="20"
            value={teamCount}
            onChange={(e) => setTeamCount(Math.max(1, Number.parseInt(e.target.value, 10) || 1))}
          />
        </div>
        <div className="team-draw-field">
          <label htmlFor="perTeam">Pessoas por time</label>
          <input
            id="perTeam"
            type="number"
            min="1"
            max="20"
            value={perTeam}
            onChange={(e) => setPerTeam(Math.max(1, Number.parseInt(e.target.value, 10) || 1))}
          />
        </div>
      </div>

      <div className="team-draw-field">
        <label htmlFor="names">Nomes (um por linha ou separados por vírgula) — {names.length} pessoa(s)</label>
        <textarea
          id="names"
          rows="6"
          value={namesText}
          onChange={(e) => setNamesText(e.target.value)}
          placeholder={"Fulano\nCiclano\nBeltrano"}
        />
      </div>

      <div className="team-draw-actions">
        <button className="team-draw-btn" onClick={handleDraw} disabled={drawing}>
          {drawing ? "Sorteando..." : teams.length ? "Sortear de novo" : "Sortear Times"}
        </button>
        <button className="team-draw-btn secondary" onClick={handleClear} disabled={drawing}>
          Limpar
        </button>
      </div>

      {drawing && <div className="team-draw-loading">🎲</div>}

      {teams.length > 0 && (
        <div className="team-draw-results">
          {teams.map((team, index) => (
            <div key={index} className="team-card" style={{ animationDelay: `${index * 0.25}s` }}>
              <h3>
                Time {index + 1}
                {index >= teamCount && <span className="extra-tag">extra</span>}
              </h3>
              {team.length === 0 ? (
                <p className="empty-team">Sem jogadores</p>
              ) : (
                <ul>
                  {team.map((name, i) => (
                    <li key={i}>{name}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TeamDraw
