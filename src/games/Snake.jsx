import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ls } from '../utils/storage'

const COLS = 20, ROWS = 20, CELL = 20
const DIR = { ArrowUp:{x:0,y:-1}, ArrowDown:{x:0,y:1}, ArrowLeft:{x:-1,y:0}, ArrowRight:{x:1,y:0}, w:{x:0,y:-1}, s:{x:0,y:1}, a:{x:-1,y:0}, d:{x:1,y:0} }
function randFood(snake) {
  let p
  do { p = { x: Math.floor(Math.random()*COLS), y: Math.floor(Math.random()*ROWS) } }
  while (snake.some(s => s.x===p.x && s.y===p.y))
  return p
}

export default function Snake() {
  const navigate = useNavigate()
  const [snake, setSnake] = useState([{x:10,y:10},{x:9,y:10},{x:8,y:10}])
  const [food, setFood] = useState({x:5,y:5})
  const [phase, setPhase] = useState('idle') // idle, playing, paused, over
  const [score, setScore] = useState(0)
  const [bestScore, setBestScore] = useState(ls.get('snake_best', 0))
  const stateRef = useRef({ snake:[{x:10,y:10},{x:9,y:10},{x:8,y:10}], dir:{x:1,y:0}, food:{x:5,y:5}, score:0, speed:150 })
  const loopRef = useRef(null)
  const phaseRef = useRef('idle')

  const resetGame = () => {
    const s = [{x:10,y:10},{x:9,y:10},{x:8,y:10}]
    const f = randFood(s)
    stateRef.current = { snake:s, dir:{x:1,y:0}, food:f, score:0, speed:150 }
    setSnake(s); setFood(f); setScore(0)
  }

  const tick = useCallback(() => {
    const { snake, dir, food, speed } = stateRef.current
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y }
    if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
      phaseRef.current = 'over'; setPhase('over'); return
    }
    if (snake.some(s => s.x===head.x && s.y===head.y)) {
      phaseRef.current = 'over'; setPhase('over'); return
    }
    const ateFood = head.x===food.x && head.y===food.y
    const newSnake = ateFood ? [head, ...snake] : [head, ...snake.slice(0,-1)]
    const newScore = ateFood ? stateRef.current.score + 10 : stateRef.current.score
    const newFood = ateFood ? randFood(newSnake) : food
    const newSpeed = ateFood ? Math.max(60, speed - 3) : speed
    stateRef.current = { snake:newSnake, dir, food:newFood, score:newScore, speed:newSpeed }
    setSnake([...newSnake]); setFood({...newFood}); setScore(newScore)
    if (ateFood) {
      if (newScore > ls.get('snake_best', 0)) { setBestScore(newScore); ls.set('snake_best', newScore) }
    }
  }, [])

  useEffect(() => {
    if (phase !== 'playing') return
    let alive = true
    const loop = () => {
      if (!alive || phaseRef.current !== 'playing') return
      tick()
      setTimeout(loop, stateRef.current.speed)
    }
    setTimeout(loop, stateRef.current.speed)
    return () => { alive = false }
  }, [phase, tick])

  useEffect(() => {
    const handler = (e) => {
      if (DIR[e.key]) {
        e.preventDefault()
        const nd = DIR[e.key]
        const cur = stateRef.current.dir
        if (nd.x !== -cur.x || nd.y !== -cur.y) {
          stateRef.current.dir = nd   // ← just write to ref, no setDir
        }
      }
      if (e.key === ' ') {
        if (phaseRef.current === 'playing') { phaseRef.current = 'paused'; setPhase('paused') }
        else if (phaseRef.current === 'paused') { phaseRef.current = 'playing'; setPhase('playing') }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const start = () => { resetGame(); phaseRef.current = 'playing'; setPhase('playing') }
  const handleDir = (key) => {
    if (phase !== 'playing') return
    const nd = DIR[key]
    if (nd) {
      const cur = stateRef.current.dir
      if (nd.x !== -cur.x || nd.y !== -cur.y) { stateRef.current.dir = nd; }
    }
  }

  const level = Math.floor(score / 50) + 1

  return (
    <div className="game-page">
      <div className="game-header" style={{maxWidth:480}}>
        <button className="back-btn" onClick={() => navigate('/')}>◀ BACK</button>
        <h1 className="neon-green">SNAKE</h1>
        <div className="score-badge">BEST: {bestScore}</div>
      </div>

      <div style={{display:'flex', gap:16, marginBottom:12, fontSize:9, flexWrap:'wrap', justifyContent:'center'}}>
        <span style={{color:'var(--yellow)'}}>SCORE: {score}</span>
        <span style={{color:'var(--cyan)'}}>LV: {level}</span>
        <span style={{color:'var(--text-dim)'}}>LEN: {snake.length}</span>
        {phase === 'paused' && <span style={{color:'var(--magenta)', animation:'blink 1s infinite'}}>⏸ PAUSED</span>}
      </div>

      {/* Canvas */}
      <div style={{
        position:'relative', width:COLS*CELL, height:ROWS*CELL,
        border:'2px solid var(--green)', boxShadow:'0 0 20px #00ff44',
        background:'#050510', marginBottom:16,
        maxWidth:'95vw', overflow:'hidden',
      }}>
        {/* Grid lines */}
        <svg width="100%" height="100%" style={{position:'absolute',top:0,left:0,opacity:0.1}}>
          {Array(COLS).fill(0).map((_,i)=><line key={`v${i}`} x1={i*CELL} y1={0} x2={i*CELL} y2={ROWS*CELL} stroke="#00ff44" strokeWidth="0.5"/>)}
          {Array(ROWS).fill(0).map((_,i)=><line key={`h${i}`} x1={0} y1={i*CELL} x2={COLS*CELL} y2={i*CELL} stroke="#00ff44" strokeWidth="0.5"/>)}
        </svg>
        {/* Food */}
        <div style={{
          position:'absolute',
          left: food.x*CELL+2, top: food.y*CELL+2,
          width:CELL-4, height:CELL-4,
          background:'var(--red)',
          boxShadow:'0 0 8px var(--red)',
          borderRadius:2,
          animation:'pulse 0.8s infinite',
        }}/>
        {/* Snake */}
        {snake.map((seg, i) => (
          <div key={i} style={{
            position:'absolute',
            left: seg.x*CELL+1, top: seg.y*CELL+1,
            width:CELL-2, height:CELL-2,
            background: i === 0 ? '#00ff44' : `hsl(${140 - i*2}, 100%, ${50 - i*0.5}%)`,
            boxShadow: i === 0 ? '0 0 10px #00ff44' : 'none',
            borderRadius: i === 0 ? 3 : 1,
          }}/>
        ))}
        {/* Overlay messages */}
        {(phase === 'idle' || phase === 'over') && (
          <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.7)'}}>
            {phase === 'over' && <div style={{fontSize:10,color:'var(--red)',marginBottom:8,textShadow:'0 0 15px var(--red)'}}>GAME OVER</div>}
            {phase === 'over' && <div style={{fontSize:8,color:'var(--yellow)',marginBottom:12}}>SCORE: {score}</div>}
            <button className="btn-green btn" onClick={start}>{phase==='idle'?'▶ START':'↺ RETRY'}</button>
          </div>
        )}
      </div>

      {/* Mobile controls */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(3,44px)', gridTemplateRows:'repeat(3,44px)', gap:4, justifyContent:'center', marginBottom:12}}>
        {[['','ArrowUp',''],['ArrowLeft','','ArrowRight'],['','ArrowDown','']].map((row,ri) =>
          row.map((key,ci) => (
            <button
              key={`${ri}-${ci}`}
              onClick={() => handleDir(key)}
              disabled={!key}
              style={{
                fontFamily:"'Press Start 2P',monospace", fontSize:10,
                background: key ? '#1a1a3a' : 'transparent',
                border: key ? '1px solid var(--green)' : 'none',
                color:'var(--green)', cursor:key?'pointer':'default',
                display:'flex',alignItems:'center',justifyContent:'center',
              }}
            >
              {key==='ArrowUp'?'▲':key==='ArrowDown'?'▼':key==='ArrowLeft'?'◀':key==='ArrowRight'?'▶':''}
            </button>
          ))
        )}
      </div>

      <div style={{fontSize:7, color:'var(--text-dim)', textAlign:'center'}}>
        WASD / ARROW KEYS • SPACE TO PAUSE
      </div>
    </div>
  )
}
