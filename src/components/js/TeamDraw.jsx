import { useEffect, useState } from "react"
import "../css/TeamDraw.css"

// Jogadores que sempre ficam juntos no Time 2
const FIXED_GROUP = ["junior", "lucas", "willian", "william", "wilian"]
const FIXED_TEAM_INDEX = 1

const SPIN_MS = 1500
const HOLD_MS = 900

// Separa uma lista colada (linhas, vírgulas, ponto e vírgula) e limpa numeração/marcadores
const parseNames = (text) =>
  text
    .split(/[\n,;]+/)
    .map((n) => n.replace(/^\s*(\d+\s*[.)\-:º°]?|[-–—•*·>])\s*/, "").trim())
    .filter((n) => n !== "")

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
  const [players, setPlayers] = useState([])
  const [input, setInput] = useState("")
  const [teamCount, setTeamCount] = useState(2)
  const [perTeam, setPerTeam] = useState(3)
  const [finalTeams, setFinalTeams] = useState([])
  const [sequence, setSequence] = useState([])
  const [step, setStep] = useState(0)
  const [rolling, setRolling] = useState(null)
  const [landed, setLanded] = useState(false)
  const [running, setRunning] = useState(false)

  const addNames = (list) => {
    if (list.length === 0) return
    setPlayers((prev) => {
      const seen = new Set(prev.map(normalize))
      const next = [...prev]
      for (const name of list) {
        if (!seen.has(normalize(name))) {
          seen.add(normalize(name))
          next.push(name)
        }
      }
      return next
    })
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    // Se tiver separador, já transforma o que estiver completo em nomes
    if (/[\n,;]/.test(value)) {
      const parts = value.split(/[\n,;]/)
      const last = parts.pop()
      addNames(parseNames(parts.join("\n")))
      setInput(last)
    } else {
      setInput(value)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addNames(parseNames(input))
      setInput("")
    }
  }

  const removePlayer = (index) => {
    setPlayers((prev) => prev.filter((_, i) => i !== index))
  }

  // Suspense: para cada nome, gira a roleta e depois revela
  useEffect(() => {
    if (!running) return
    if (step >= sequence.length) {
      setRunning(false)
      setRolling(null)
      return
    }
    const pool = sequence.slice(step).map((s) => s.name)
    setLanded(false)
    const flicker = setInterval(() => {
      setRolling(pool[Math.floor(Math.random() * pool.length)])
    }, 80)
    const land = setTimeout(() => {
      clearInterval(flicker)
      setRolling(sequence[step].name)
      setLanded(true)
    }, SPIN_MS)
    const next = setTimeout(() => setStep((s) => s + 1), SPIN_MS + HOLD_MS)
    return () => {
      clearInterval(flicker)
      clearTimeout(land)
      clearTimeout(next)
    }
  }, [running, step, sequence])

  const handleDraw = () => {
    const all = [...players]
    const pending = parseNames(input)
    for (const n of pending) if (!all.some((p) => normalize(p) === normalize(n))) all.push(n)
    if (pending.length) {
      setPlayers(all)
      setInput("")
    }
    if (all.length < 2) {
      alert("Coloque pelo menos 2 nomes")
      return
    }
    const teams = drawTeams(all, teamCount, perTeam)
    // Revela alternando entre os times (1º do Time 1, 1º do Time 2, ...)
    const seq = []
    const maxSize = Math.max(...teams.map((t) => t.length))
    for (let r = 0; r < maxSize; r++) {
      teams.forEach((team, t) => {
        if (team[r] !== undefined) seq.push({ team: t, name: team[r] })
      })
    }
    setFinalTeams(teams)
    setSequence(seq)
    setStep(0)
    setRolling(null)
    setRunning(true)
  }

  const handleSkip = () => {
    setRunning(false)
    setStep(sequence.length)
    setRolling(null)
  }

  const handleClear = () => {
    setRunning(false)
    setPlayers([])
    setInput("")
    setFinalTeams([])
    setSequence([])
    setStep(0)
    setRolling(null)
  }

  const revealed = sequence.slice(0, step)
  const current = running && step < sequence.length ? sequence[step] : null
  const finished = finalTeams.length > 0 && !running && step >= sequence.length

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
            disabled={running}
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
            disabled={running}
            onChange={(e) => setPerTeam(Math.max(1, Number.parseInt(e.target.value, 10) || 1))}
          />
        </div>
      </div>

      <div className="team-draw-field">
        <label htmlFor="names">Nomes — cole a lista ou digite e aperte Enter</label>
        <textarea
          id="names"
          rows="3"
          value={input}
          disabled={running}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={"Cole aqui a lista de nomes\n1. Fulano\n2. Ciclano"}
        />
      </div>

      {players.length > 0 && (
        <div className="team-draw-players">
          <div className="team-draw-players-header">
            <span>{players.length} jogador(es)</span>
          </div>
          <div className="team-draw-chips">
            {players.map((name, index) => (
              <span key={name + index} className="team-draw-chip">
                {name}
                {!running && (
                  <button type="button" onClick={() => removePlayer(index)} aria-label={`Remover ${name}`}>
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="team-draw-actions">
        {running ? (
          <button className="team-draw-btn secondary" onClick={handleSkip}>
            Pular suspense
          </button>
        ) : (
          <>
            <button className="team-draw-btn" onClick={handleDraw}>
              {finalTeams.length ? "Sortear de novo" : "Sortear Times"}
            </button>
            <button className="team-draw-btn secondary" onClick={handleClear}>
              Limpar
            </button>
          </>
        )}
      </div>

      {current && (
        <div className={`team-draw-roulette ${landed ? "landed" : ""}`}>
          <div className="roulette-label">
            Sorteando {step + 1} de {sequence.length}
          </div>
          <div className="roulette-name">{rolling || "..."}</div>
          <div className="roulette-target">{landed ? `➜ Time ${current.team + 1}` : "🎲"}</div>
        </div>
      )}

      {finished && <div className="team-draw-done">Times definidos! ⚽</div>}

      {finalTeams.length > 0 && (
        <div className="team-draw-results">
          {finalTeams.map((team, t) => {
            const members = revealed.filter((r) => r.team === t).map((r) => r.name)
            const isTarget = current && current.team === t && landed
            return (
              <div key={t} className={`team-card ${isTarget ? "target" : ""}`}>
                <h3>
                  Time {t + 1}
                  {t >= teamCount && <span className="extra-tag">extra</span>}
                </h3>
                {team.length === 0 ? (
                  <p className="empty-team">Sem jogadores</p>
                ) : (
                  <ul>
                    {team.map((_, i) =>
                      i < members.length ? (
                        <li key={i} className="revealed">
                          {members[i]}
                        </li>
                      ) : (
                        <li key={i} className="pending">
                          ?
                        </li>
                      ),
                    )}
                  </ul>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default TeamDraw
