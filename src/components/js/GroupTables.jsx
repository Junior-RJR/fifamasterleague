import "../css/GroupTables.css"

function GroupTables({ groups, matches }) {
  const calculateGroupStandings = (groupPlayers) => {
    const standings = groupPlayers.map((player) => ({
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

      const player1Index = groupPlayers.indexOf(match.player1)
      const player2Index = groupPlayers.indexOf(match.player2)

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

  const groupAStandings = calculateGroupStandings(groups.A)
  const groupBStandings = calculateGroupStandings(groups.B)

  const renderGroupTable = (groupName, standings) => {
    return (
      <div className="group-table">
        <h3>Grupo {groupName}</h3>

        {standings.length === 0 ? (
          <p className="no-data">Nenhum dado disponível.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Pos</th>
                <th className="player-name">Jogador</th>
                <th>J</th>
                <th>V</th>
                <th>E</th>
                <th>D</th>
                <th>GP</th>
                <th>GC</th>
                <th>SG</th>
                <th>Pts</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((player, index) => (
                <tr key={player.name} className={index < 2 ? "qualified" : ""}>
                  <td>{index + 1}</td>
                  <td className="player-name">
                    {player.name}
                    {index < 2 && <span className="qualification-badge">Classificado</span>}
                  </td>
                  <td>{player.played}</td>
                  <td>{player.won}</td>
                  <td>{player.drawn}</td>
                  <td>{player.lost}</td>
                  <td>{player.goalsFor}</td>
                  <td>{player.goalsAgainst}</td>
                  <td>{player.goalDifference}</td>
                  <td className="points">{player.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    )
  }

  return (
    <div className="group-tables">
      <h2>Tabelas de Classificação</h2>

      <div className="tables-container">
        {renderGroupTable("A", groupAStandings)}
        {renderGroupTable("B", groupBStandings)}
      </div>

      <div className="table-legend">
        <div className="legend-item">
          <span>J: Jogos</span>
          <span>V: Vitórias</span>
          <span>E: Empates</span>
          <span>D: Derrotas</span>
        </div>
        <div className="legend-item">
          <span>GP: Gols Pró</span>
          <span>GC: Gols Contra</span>
          <span>SG: Saldo de Gols</span>
          <span>Pts: Pontos</span>
        </div>
      </div>
    </div>
  )
}

export default GroupTables
