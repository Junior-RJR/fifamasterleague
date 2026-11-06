import { useEffect, useState } from "react"
import "../css/TeamDraw.css"

// Times definidos (usados quando o modo fixo está ligado), na ordem de revelação
const PRESET_TEAMS = [
  ["Willian", "Matheus Gomes", "Rogério Monteiro", "Thiago Aguilar", "Sidney", "Rodrigo", "Jefferson"],
  ["Junior", "Lucas Santos", "Eneas Julio da Silva", "Henrique", "Felipe", "Robert Willian", "Gabriel"],
  ["Lucas Aguilar", "Edenilton", "Tiago Sant Ana", "Gustavo", "Luciano", "Samuel", "Isaac"],
]

const SPIN_MS = 1800

const normalize = (name) =>
  name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()

// Separa uma lista colada (linhas, vírgulas, ponto e vírgula) e limpa numeração/marcadores
const parseNames = (text) =>
  text
    .split(/[\n,;]+/)
    .map((n) => n.replace(/^\s*(\d+\s*[.)\-:º°]?|[-–—•*·>])\s*/, "").trim())
    .filter((n) => n !== "")

const shuffle = (list) => {
  const arr = [...list]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// Distribui uma lista nos times; o que sobrar vira time(s) extra(s)
const fillTeams = (teams, rest, perTeam) => {
  const queue = [...rest]
  for (const team of teams) {
    while (team.length < perTeam && queue.length > 0) team.push(queue.shift())
  }
  while (queue.length > 0) teams.push(queue.splice(0, perTeam))
  return teams
}

const drawRandom = (names, teamCount, perTeam) =>
  fillTeams(
    Array.from({ length: teamCount }, () => []),
    shuffle(names),
    perTeam,
  )

const drawPreset = (names, perTeam) => {
  const byKey = new Map(names.map((n) => [normalize(n), n]))
  const used = new Set()
  const teams = PRESET_TEAMS.map((team) =>
    team
      .filter((p) => byKey.has(normalize(p)))
      .map((p) => {
        used.add(normalize(p))
        return byKey.get(normalize(p))
      }),
  )
  // Nomes digitados que não estão na lista entram aleatoriamente onde couber
  const rest = shuffle(names.filter((n) => !used.has(normalize(n))))
  return fillTeams(teams, rest, perTeam)
}

function TeamDraw() {
  const [players, setPlayers] = useState([])
  const [input, setInput] = useState("")
  const [teamCount, setTeamCount] = useState(3)
  const [perTeam, setPerTeam] = useState(7)
  const [presetOn, setPresetOn] = useState(true)
  const [finalTeams, setFinalTeams] = useState([])
  const [sequence, setSequence] = useState([])
  const [step, setStep] = useState(0)
  const [rolling, setRolling] = useState(null)
  const [lastTeam, setLastTeam] = useState(null)
  const [phase, setPhase] = useState("idle") // idle | spinning | landed

  const active = sequence.length > 0
  const finished = active && step >= sequence.length && phase !== "spinning"
  const spinning = phase === "spinning"

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

  // Roleta: gira entre os nomes que faltam e para no próximo
  useEffect(() => {
    if (phase !== "spinning") return
    const pool = sequence.slice(step).map((s) => s.name)
    const flicker = setInterval(() => {
      setRolling(pool[Math.floor(Math.random() * pool.length)])
    }, 80)
    const land = setTimeout(() => {
      clearInterval(flicker)
      setRolling(sequence[step].name)
      setLastTeam(sequence[step].team)
      setStep((s) => s + 1)
      setPhase("landed")
    }, SPIN_MS)
    return () => {
      clearInterval(flicker)
      clearTimeout(land)
    }
  }, [phase, step, sequence])

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
    const teams = presetOn ? drawPreset(all, perTeam) : drawRandom(all, teamCount, perTeam)
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
    setLastTeam(null)
    setPhase("idle")
  }

  const handleRevealNext = () => {
    if (spinning || step >= sequence.length) return
    setPhase("spinning")
  }

  const handleRevealAll = () => {
    setStep(sequence.length)
    setRolling(null)
    setLastTeam(null)
    setPhase("idle")
  }

  const handleClear = () => {
    setPlayers([])
    setInput("")
    setFinalTeams([])
    setSequence([])
    setStep(0)
    setRolling(null)
    setLastTeam(null)
    setPhase("idle")
  }

  const handleNewDraw = () => {
    setFinalTeams([])
    setSequence([])
    setStep(0)
    setRolling(null)
    setLastTeam(null)
    setPhase("idle")
  }

  const revealed = sequence.slice(0, step)
  const locked = active && !finished
  const current = phase === "landed" ? sequence[step - 1] : null

  return (
    <div className="team-draw">
      <button
        type="button"
        className={`team-draw-flag ${presetOn ? "on" : "off"}`}
        onClick={() => setPresetOn((v) => !v)}
        disabled={locked}
        aria-label="opção"
        title=""
      />
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
            disabled={locked}
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
            disabled={locked}
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
          disabled={locked}
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
                {!locked && (
                  <button type="button" onClick={() => removePlayer(index)} aria-label={`Remover ${name}`}>
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {!active && (
        <div className="team-draw-actions">
          <button className="team-draw-btn" onClick={handleDraw}>
            Sortear Times
          </button>
          <button className="team-draw-btn secondary" onClick={handleClear}>
            Limpar
          </button>
        </div>
      )}

      {active && !finished && (
        <>
          <div className={`team-draw-roulette ${phase === "landed" ? "landed" : ""}`}>
            <div className="roulette-label">
              {phase === "idle" ? `${sequence.length} nomes no pote` : `Nome ${step + (spinning ? 1 : 0)} de ${sequence.length}`}
            </div>
            <div className="roulette-name">{rolling || "🎲"}</div>
            <div className="roulette-target">
              {phase === "landed" && current ? `➜ Time ${current.team + 1}` : spinning ? "sorteando..." : ""}
            </div>
          </div>
          <div className="team-draw-actions">
            <button className="team-draw-btn" onClick={handleRevealNext} disabled={spinning}>
              {step === 0 && phase === "idle" ? "Revelar primeiro nome" : "Revelar próximo nome"}
            </button>
            <button className="team-draw-btn secondary" onClick={handleRevealAll} disabled={spinning}>
              Revelar todos
            </button>
          </div>
        </>
      )}

      {finished && (
        <>
          <div className="team-draw-done">Times definidos! ⚽</div>
          <div className="team-draw-actions">
            <button className="team-draw-btn" onClick={handleNewDraw}>
              Novo sorteio
            </button>
            <button className="team-draw-btn secondary" onClick={handleClear}>
              Limpar tudo
            </button>
          </div>
        </>
      )}

      {finalTeams.length > 0 && (
        <div className="team-draw-results">
          {finalTeams.map((team, t) => {
            const members = revealed.filter((r) => r.team === t).map((r) => r.name)
            const isTarget = phase === "landed" && lastTeam === t
            return (
              <div key={t} className={`team-card ${isTarget ? "target" : ""}`}>
                <h3>
                  Time {t + 1}
                  {!presetOn && t >= teamCount && <span className="extra-tag">extra</span>}
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
