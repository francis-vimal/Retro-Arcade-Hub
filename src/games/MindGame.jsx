import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ls } from '../utils/storage'

const COLOR_LIST = [
  { name: 'RED', hex: '#ff3344' },
  { name: 'BLUE', hex: '#3366ff' },
  { name: 'GREEN', hex: '#00cc44' },
  { name: 'YELLOW', hex: '#ffcc00' },
  { name: 'PURPLE', hex: '#aa44ff' },
  { name: 'ORANGE', hex: '#ff8800' },
]

function pick(arr, exclude = null) {
  let r; do { r = arr[Math.floor(Math.random() * arr.length)] } while (r === exclude)
  return r
}

export default function MindGame() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState('idle')
  const [score, setScore] = useState(0)
  const [bestScore, setBestScore] = useState(ls.get('mindgame_best', 0))
  const [timeLeft, setTimeLeft] = useState(30)
  const [challenge, setChallenge] = useState(null)
  const [feedback, setFeedback] = useState(null) // 'correct' | 'wrong'
  const [streak, setStreak] = useState(0)
  const timerRef = useRef(null)

  const nextChallenge = useCallback(() => {
    const displayColor = pick(COLOR_LIST)
    const textColor = pick(COLOR_LIST, displayColor)
    // shuffle answer options (4 options)
    const options = [displayColor, ...COLOR_LIST.filter(c=>c!==displayColor).sort(()=>Math.random()-0.5).slice(0,3)].sort(()=>Math.random()-0.5)
    setChallenge({ displayColor, textColor, options })
    setFeedback(null)
  }, [])

  useEffect(() => {
    if (phase === 'playing') {
      nextChallenge()
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(timerRef.current); setPhase('over'); return 0 }
          return t - 1
        })
      }, 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [phase, nextChallenge])

  const answer = (opt) => {
    if (feedback) return
    const correct = opt === challenge.displayColor
    setFeedback(correct ? 'correct' : 'wrong')
    if (correct) {
      const newScore = score + Math.max(1, Math.floor(streak / 3) + 1)
      setScore(newScore)
      setStreak(s => s + 1)
      if (newScore > bestScore) { setBestScore(newScore); ls.set('mindgame_best', newScore) }
    } else {
      setStreak(0)
    }
    setTimeout(nextChallenge, 500)
  }

  const start = () => { setScore(0); setTimeLeft(30); setStreak(0); setPhase('playing') }

  const timerPct = (timeLeft / 30) * 100
  const timerColor = timeLeft > 15 ? 'var(--green)' : timeLeft > 8 ? 'var(--yellow)' : 'var(--red)'

  return (
    <div className="game-page">
      <div className="game-header" style={{maxWidth:500}}>
        <button className="back-btn" onClick={() => navigate('/')}>◀ BACK</button>
        <h1 style={{color:'#ff6600', textShadow:'0 0 10px #ff6600'}}>MIND GAME</h1>
        <div className="score-badge">BEST: {bestScore}</div>
      </div>

      {phase === 'idle' && (
        <div style={{textAlign:'center', maxWidth:400}}>
          <div style={{fontSize:'40px', marginBottom:20}}>🎭</div>
          <p style={{fontSize:8, color:'var(--text-dim)', lineHeight:2, marginBottom:20}}>
            THE WORD SAYS ONE COLOR,<br/>
            BUT IT'S SHOWN IN ANOTHER.<br/>
            CLICK THE COLOR YOU SEE — NOT WHAT YOU READ!
          </p>
          <button className="btn" onClick={start}>▶ START</button>
        </div>
      )}

      {phase === 'over' && (
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:'clamp(24px,5vw,40px)', color:'var(--yellow)', marginBottom:12, textShadow:'0 0 20px var(--yellow)'}}>
            {score}
          </div>
          <div style={{fontSize:9, color:'var(--text-dim)', marginBottom:20}}>FINAL SCORE</div>
          {score >= bestScore && score > 0 && <div style={{fontSize:9, color:'var(--green)', marginBottom:16}}>🏆 NEW HIGH SCORE!</div>}
          <button className="btn" onClick={start}>↺ PLAY AGAIN</button>
        </div>
      )}

      {phase === 'playing' && challenge && (
        <div style={{textAlign:'center', width:'min(400px,90vw)'}}>
          {/* Timer */}
          <div style={{marginBottom:16}}>
            <div style={{height:6, background:'#1a1a3a', borderRadius:3, overflow:'hidden', marginBottom:8}}>
              <div style={{height:'100%', width:`${timerPct}%`, background:timerColor, transition:'width 1s linear', boxShadow:`0 0 8px ${timerColor}`}}/>
            </div>
            <div style={{fontSize:'clamp(10px,2vw,14px)', color:timerColor}}>{timeLeft}s</div>
          </div>

          {/* Score & streak */}
          <div style={{display:'flex', justifyContent:'space-between', marginBottom:24, fontSize:9}}>
            <span style={{color:'var(--yellow)'}}>SCORE: {score}</span>
            {streak > 1 && <span style={{color:'var(--orange)', textShadow:'0 0 10px #ff8800'}}>🔥 x{streak}</span>}
          </div>

          {/* Stroop word */}
          <div style={{
            fontSize:'clamp(28px,7vw,48px)',
            fontFamily:"'Press Start 2P', monospace",
            color: challenge.textColor.hex,
            textShadow: `0 0 20px ${challenge.textColor.hex}`,
            marginBottom:32,
            letterSpacing:2,
          }}>
            {challenge.displayColor.name}
          </div>

          <div style={{fontSize:8, color:'var(--text-dim)', marginBottom:16}}>CLICK THE COLOR YOU SEE ↑</div>

          {/* Options */}
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
            {challenge.options.map(opt => (
              <button
                key={opt.name}
                onClick={() => answer(opt)}
                style={{
                  fontFamily:"'Press Start 2P',monospace",
                  fontSize: 9,
                  padding: '14px 10px',
                  background: opt === challenge.displayColor && feedback === 'correct' ? opt.hex + '33' :
                               opt === challenge.displayColor && feedback === 'wrong' ? '#00ff4433' :
                               feedback && opt !== challenge.displayColor ? '#ff333322' : '#1a1a3a',
                  border: `2px solid ${opt.hex}`,
                  color: opt.hex,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  boxShadow: `0 0 8px ${opt.hex}44`,
                }}
              >
                {opt.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
