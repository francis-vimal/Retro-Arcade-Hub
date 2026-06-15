import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ls } from '../utils/storage'

const COLORS = [
  { id: 0, label: 'RED', bg: '#ff3333', glow: '#ff0000' },
  { id: 1, label: 'BLUE', bg: '#3333ff', glow: '#0000ff' },
  { id: 2, label: 'GREEN', bg: '#00cc44', glow: '#00ff44' },
  { id: 3, label: 'YELLOW', bg: '#ffcc00', glow: '#ffff00' },
]

export default function SimonSays() {
  const navigate = useNavigate()
  const [seq, setSeq] = useState([])
  const [userSeq, setUserSeq] = useState([])
  const [phase, setPhase] = useState('idle') // idle, showing, input, gameover
  const [activeColor, setActiveColor] = useState(null)
  const [level, setLevel] = useState(0)
  const [bestLevel, setBestLevel] = useState(ls.get('simon_best', 0))
  const [status, setStatus] = useState('PRESS START TO BEGIN')
  const timeouts = useRef([])

  const clearTimeouts = () => { timeouts.current.forEach(clearTimeout); timeouts.current = []; }

  const flashColor = (colorId, duration = 500) => new Promise(res => {
    setActiveColor(colorId)
    const t = setTimeout(() => { setActiveColor(null); setTimeout(res, 100); }, duration)
    timeouts.current.push(t)
  })

  const playSequence = async (sequence) => {
    setPhase('showing')
    setStatus(`WATCH LEVEL ${sequence.length}`)
    await new Promise(r => setTimeout(r, 600))
    for (const c of sequence) {
      await flashColor(c, 500)
    }
    setPhase('input')
    setStatus(`YOUR TURN — ${sequence.length} STEPS`)
    setUserSeq([])
  }

  const startGame = () => {
    clearTimeouts()
    const first = Math.floor(Math.random() * 4)
    const newSeq = [first]
    setSeq(newSeq)
    setLevel(1)
    playSequence(newSeq)
  }

  const handleColorPress = async (colorId) => {
    if (phase !== 'input') return
    const newUser = [...userSeq, colorId]
    setUserSeq(newUser)
    await flashColor(colorId, 200)

    const idx = newUser.length - 1
    if (newUser[idx] !== seq[idx]) {
      setPhase('gameover')
      const lv = seq.length
      setStatus(`GAME OVER! REACHED LEVEL ${lv}`)
      if (lv > bestLevel) { setBestLevel(lv); ls.set('simon_best', lv) }
      return
    }

    if (newUser.length === seq.length) {
      setStatus('CORRECT! GET READY...')
      setPhase('showing')
      const nextSeq = [...seq, Math.floor(Math.random() * 4)]
      setSeq(nextSeq)
      setLevel(nextSeq.length)
      const t = setTimeout(() => playSequence(nextSeq), 1000)
      timeouts.current.push(t)
    }
  }

  useEffect(() => () => clearTimeouts(), [])

  return (
    <div className="game-page">
      <div className="game-header" style={{maxWidth:500}}>
        <button className="back-btn" onClick={() => navigate('/')}>◀ BACK</button>
        <h1 className="neon-text">SIMON SAYS</h1>
        <div className="score-badge">BEST: LV {bestLevel}</div>
      </div>

      <div style={{textAlign:'center', marginBottom:20}}>
        <div style={{fontSize:'clamp(8px,1.5vw,11px)', color:'#8888bb', marginBottom:8}}>
          {status}
        </div>
        {phase !== 'idle' && phase !== 'gameover' && (
          <div style={{fontSize:'clamp(14px,3vw,20px)', color:'var(--cyan)', textShadow:'0 0 15px var(--cyan)'}}>
            LEVEL {level}
          </div>
        )}
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, width:'min(400px,90vw)'}}>
        {COLORS.map(c => (
          <button
            key={c.id}
            onClick={() => handleColorPress(c.id)}
            disabled={phase !== 'input'}
            style={{
              height: 'min(160px,40vw)',
              background: activeColor === c.id ? c.bg : `${c.bg}44`,
              border: `3px solid ${c.bg}`,
              borderRadius: 4,
              cursor: phase === 'input' ? 'pointer' : 'default',
              boxShadow: activeColor === c.id ? `0 0 40px ${c.glow}, inset 0 0 30px ${c.glow}` : 'none',
              transition: 'all 0.1s',
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 9,
              color: activeColor === c.id ? '#000' : c.bg,
              letterSpacing: 1,
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div style={{marginTop:30, display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center'}}>
        {(phase === 'idle' || phase === 'gameover') && (
          <button className="btn" onClick={startGame}>
            {phase === 'idle' ? '▶ START' : '↺ RETRY'}
          </button>
        )}
        {phase === 'showing' && (
          <div style={{fontSize:9, color:'var(--text-dim)', padding:'10px 20px', border:'1px solid var(--border)'}}>
            WATCH CAREFULLY...
          </div>
        )}
      </div>

      <div style={{marginTop:24, fontSize:8, color:'var(--text-dim)', textAlign:'center', lineHeight:2}}>
        MEMORIZE THE SEQUENCE • REPEAT IT BACK • EACH ROUND ADDS ONE MORE
      </div>
    </div>
  )
}
