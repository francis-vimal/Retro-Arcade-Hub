import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ls } from '../utils/storage'

const WORDS = ['CRANE','LIGHT','PLANT','STORE','BRAVE','FLAME','GHOST','PRIZE','SWORD','TRACK','BLAST','CLOUD','DRAPE','FEAST','GLOOM','HAVEN','IVORY','JOKER','KNIFE','LODGE','MAPLE','NINJA','OCEAN','PLUCK','QUEST','RAVEN','SHOUT','TROUT','UMBRA','VENOM','WALTZ','YACHT','ZESTY','ADORE','BLINK','CHESS','DELTA','EAGLE','FROST','GROVE','HASTE','INFER','JEWEL','KNACK','LUNAR','MIRTH','NOBLE','OLIVE','PHASE','QUEEN','RIDER','SPIRE','THORN','ULCER','VIGOR','WEDGE','XENON','YIELD','ZIPPY']
const ALPHA = 'QWERTYUIOPASDFGHJKLZXCVBNM'.split('')

function getResult(guess, answer) {
  const res = Array(5).fill('absent')
  const ansArr = answer.split('')
  const guessArr = guess.split('')
  const used = Array(5).fill(false)
  // correct pass
  for (let i = 0; i < 5; i++) if (guessArr[i] === ansArr[i]) { res[i] = 'correct'; used[i] = true }
  // present pass
  for (let i = 0; i < 5; i++) {
    if (res[i] === 'correct') continue
    const j = ansArr.findIndex((c,k) => c === guessArr[i] && !used[k])
    if (j !== -1) { res[i] = 'present'; used[j] = true }
  }
  return res
}

const COLORS = { correct: '#00aa44', present: '#ccaa00', absent: '#333355', empty: '#0f0f2e' }
const BORDER_COLORS = { correct: '#00ff66', present: '#ffcc00', absent: '#555577', empty: 'var(--border)' }

export default function Wordle() {
  const navigate = useNavigate()
  const [answer] = useState(() => WORDS[Math.floor(Math.random() * WORDS.length)])
  const [guesses, setGuesses] = useState(Array(6).fill(''))
  const [results, setResults] = useState(Array(6).fill(null))
  const [current, setCurrent] = useState(0)
  const [phase, setPhase] = useState('playing') // playing, won, lost
  const [letterMap, setLetterMap] = useState({})
  const [shake, setShake] = useState(false)
  const [wins, setWins] = useState(ls.get('wordle_wins', 0))
  const [bestTries, setBestTries] = useState(ls.get('wordle_best_tries', 0))

  const submit = useCallback(() => {
    const guess = guesses[current]
    if (guess.length < 5) { setShake(true); setTimeout(()=>setShake(false),400); return }
    const res = getResult(guess, answer)
    const nr = [...results]; nr[current] = res
    setResults(nr)
    const nm = {...letterMap}
    guess.split('').forEach((c,i) => {
      const s = res[i]
      if (!nm[c] || s === 'correct' || (s === 'present' && nm[c] === 'absent')) nm[c] = s
    })
    setLetterMap(nm)
    if (guess === answer) {
      setPhase('won')
      const newWins = wins + 1; setWins(newWins); ls.set('wordle_wins', newWins)
      const tries = current + 1
      if (!bestTries || tries < bestTries) { setBestTries(tries); ls.set('wordle_best_tries', tries) }
    } else if (current === 5) {
      setPhase('lost')
    } else {
      setCurrent(current + 1)
    }
  }, [guesses, current, results, answer, letterMap, wins, bestTries])

  const press = useCallback((key) => {
    if (phase !== 'playing') return
    if (key === 'ENTER') { submit(); return }
    if (key === 'BACK') {
      const ng = [...guesses]; ng[current] = ng[current].slice(0,-1); setGuesses(ng); return
    }
    if (guesses[current].length < 5 && /^[A-Z]$/.test(key)) {
      const ng = [...guesses]; ng[current] += key; setGuesses(ng)
    }
  }, [phase, guesses, current, submit])

  useEffect(() => {
    const handler = (e) => {
      const k = e.key.toUpperCase()
      if (k === 'ENTER') press('ENTER')
      else if (k === 'BACKSPACE') press('BACK')
      else if (/^[A-Z]$/.test(k)) press(k)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [press])

  const kbRows = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM']

  return (
    <div className="game-page">
      <div className="game-header" style={{maxWidth:400}}>
        <button className="back-btn" onClick={() => navigate('/')}>◀ BACK</button>
        <h1 className="neon-yellow">WORDLE</h1>
        <div className="score-badge">WINS: {wins}</div>
      </div>

      {phase !== 'playing' && (
        <div style={{fontSize:10, marginBottom:16, color: phase==='won'?'var(--green)':'var(--red)', animation:'slideIn 0.3s ease', textAlign:'center'}}>
          {phase === 'won' ? `🏆 CORRECT IN ${current+1} TRIES!` : `💀 ANSWER: ${answer}`}
        </div>
      )}

      {/* Grid */}
      <div style={{display:'grid', gridTemplateRows:'repeat(6,1fr)', gap:5, marginBottom:16}}>
        {guesses.map((g, row) => {
          const isCurrentRow = row === current && phase === 'playing'
          return (
            <div key={row} style={{display:'flex', gap:5, animation: shake && isCurrentRow ? 'shake 0.4s ease' : 'none'}}>
              {Array(5).fill(0).map((_, col) => {
                const letter = row < current || phase !== 'playing' ? g[col] : (row === current ? g[col] : '')
                const state = results[row] ? results[row][col] : 'empty'
                const isActive = row === current && phase === 'playing'
                return (
                  <div key={col} style={{
                    width: 'min(54px,13vw)', height: 'min(54px,13vw)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    background: COLORS[state],
                    border: `2px solid ${isActive && g[col] ? 'var(--cyan)' : BORDER_COLORS[state]}`,
                    fontSize: 'clamp(12px,2.5vw,18px)',
                    fontFamily: "'Press Start 2P', monospace",
                    color: '#fff',
                    transition: 'all 0.2s',
                    boxShadow: state === 'correct' ? '0 0 10px #00ff66' : state === 'present' ? '0 0 10px #ffcc00' : 'none',
                  }}>
                    {letter}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
      <style>{`@keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }`}</style>

      {/* Keyboard */}
      <div style={{display:'flex', flexDirection:'column', gap:5, alignItems:'center'}}>
        {kbRows.map(row => (
          <div key={row} style={{display:'flex', gap:4}}>
            {row === 'ZXCVBNM' && <button onClick={() => press('ENTER')} style={{fontFamily:"'Press Start 2P',monospace",fontSize:6,padding:'10px 6px',background:'var(--cyan)',color:'var(--bg)',border:'none',cursor:'pointer'}}>ENTER</button>}
            {row.split('').map(l => {
              const st = letterMap[l]
              return (
                <button key={l} onClick={() => press(l)} style={{
                  fontFamily:"'Press Start 2P',monospace", fontSize:'clamp(7px,1.5vw,9px)',
                  width:'clamp(24px,6vw,34px)', height: 36,
                  background: st ? COLORS[st] : '#1a1a3a',
                  border: `1px solid ${st ? BORDER_COLORS[st] : 'var(--border)'}`,
                  color:'#fff', cursor:'pointer',
                }}>
                  {l}
                </button>
              )
            })}
            {row === 'ZXCVBNM' && <button onClick={() => press('BACK')} style={{fontFamily:"'Press Start 2P',monospace",fontSize:6,padding:'10px 6px',background:'#333',color:'#fff',border:'1px solid var(--border)',cursor:'pointer'}}>⌫</button>}
          </div>
        ))}
      </div>

      {phase !== 'playing' && (
        <button className="btn" style={{marginTop:20}} onClick={() => window.location.reload()}>↺ NEW GAME</button>
      )}
    </div>
  )
}
