import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ls } from '../utils/storage'

const WINS = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]

function checkWinner(b) {
  for (const [a,c,d] of WINS) if (b[a] && b[a]===b[c] && b[a]===b[d]) return { winner: b[a], line: [a,c,d] }
  if (b.every(Boolean)) return { winner: 'draw', line: [] }
  return null
}

export default function TicTacToe() {
  const navigate = useNavigate()
  const [board, setBoard] = useState(Array(9).fill(''))
  const [turn, setTurn] = useState('X')
  const [result, setResult] = useState(null)
  const [stats, setStats] = useState({ x: ls.get('ttt_xwins',0), o: ls.get('ttt_owins',0), d: ls.get('ttt_draws',0) })

  const move = (i) => {
    if (board[i] || result) return
    const nb = [...board]; nb[i] = turn
    setBoard(nb)
    const r = checkWinner(nb)
    if (r) {
      setResult(r)
      if (r.winner === 'X') { const s = {...stats, x: stats.x+1}; setStats(s); ls.set('ttt_xwins', s.x) }
      else if (r.winner === 'O') { const s = {...stats, o: stats.o+1}; setStats(s); ls.set('ttt_owins', s.o) }
      else { const s = {...stats, d: stats.d+1}; setStats(s); ls.set('ttt_draws', s.d) }
    } else setTurn(turn === 'X' ? 'O' : 'X')
  }

  const reset = () => { setBoard(Array(9).fill('')); setTurn('X'); setResult(null) }

  const getColor = (cell) => cell === 'X' ? 'var(--cyan)' : 'var(--magenta)'

  return (
    <div className="game-page">
      <div className="game-header" style={{maxWidth:420}}>
        <button className="back-btn" onClick={() => navigate('/')}>◀ BACK</button>
        <h1 className="neon-magenta">TIC TAC TOE</h1>
      </div>

      <div style={{display:'flex', gap:20, marginBottom:20, flexWrap:'wrap', justifyContent:'center'}}>
        {[['X', stats.x, 'var(--cyan)'], ['DRAW', stats.d, 'var(--text-dim)'], ['O', stats.o, 'var(--magenta)']].map(([k,v,c]) => (
          <div key={k} style={{textAlign:'center', border:'1px solid var(--border)', padding:'10px 20px', minWidth:70}}>
            <div style={{fontSize:'clamp(16px,3vw,22px)', color:c, textShadow:`0 0 10px ${c}`}}>{v}</div>
            <div style={{fontSize:7, color:'var(--text-dim)', marginTop:4}}>{k} WINS</div>
          </div>
        ))}
      </div>

      {!result && (
        <div style={{fontSize:10, marginBottom:16, color: getColor(turn), textShadow:`0 0 10px ${getColor(turn)}`}}>
          PLAYER {turn}'S TURN
        </div>
      )}
      {result && (
        <div style={{fontSize:10, marginBottom:16, color:'var(--yellow)', textShadow:'0 0 10px var(--yellow)', animation:'slideIn 0.3s ease'}}>
          {result.winner === 'draw' ? '🤝 DRAW!' : `🏆 PLAYER ${result.winner} WINS!`}
        </div>
      )}

      <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6, width:'min(320px,90vw)', marginBottom:20}}>
        {board.map((cell, i) => {
          const isWin = result?.line?.includes(i)
          return (
            <button
              key={i}
              onClick={() => move(i)}
              style={{
                height: 'min(100px,28vw)',
                background: isWin ? (cell==='X'?'rgba(0,255,255,0.15)':'rgba(255,0,255,0.15)') : 'var(--card-bg)',
                border: isWin ? `2px solid ${getColor(cell)}` : '1px solid var(--border)',
                borderRadius: 2,
                fontSize: 'clamp(22px,6vw,36px)',
                cursor: cell || result ? 'default' : 'pointer',
                color: cell ? getColor(cell) : 'transparent',
                textShadow: cell ? `0 0 20px ${getColor(cell)}` : 'none',
                fontFamily: "'Press Start 2P', monospace",
                transition: 'all 0.15s',
                boxShadow: isWin ? `0 0 20px ${getColor(cell)}` : 'none',
              }}
            >
              {cell || ((!result && !board[i]) ? '·' : '')}
            </button>
          )
        })}
      </div>

      <button className="btn-magenta btn" onClick={reset}>↺ NEW GAME</button>
    </div>
  )
}
