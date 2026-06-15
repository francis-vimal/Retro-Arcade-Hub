import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ls } from '../utils/storage'

const ANIMALS = [
  { emoji: '🐶', name: 'DOG' },
  { emoji: '🐱', name: 'CAT' },
  { emoji: '🐭', name: 'MOUSE' },
  { emoji: '🐹', name: 'HAMSTER' },
  { emoji: '🐰', name: 'RABBIT' },
  { emoji: '🦊', name: 'FOX' },
  { emoji: '🐻', name: 'BEAR' },
  { emoji: '🐼', name: 'PANDA' },
  { emoji: '🐨', name: 'KOALA' },
  { emoji: '🐯', name: 'TIGER' },
  { emoji: '🦁', name: 'LION' },
  { emoji: '🐮', name: 'COW' },
]

const DIFFICULTIES = [
  { label: 'EASY', interval: 1200, rounds: 10 },
  { label: 'NORMAL', interval: 700, rounds: 15 },
  { label: 'HARD', interval: 400, rounds: 20 },
]

export default function AnimalStop() {
  const navigate = useNavigate()
  const [diff, setDiff] = useState(1)
  const [phase, setPhase] = useState('idle') // idle, countdown, playing, result
  const [target, setTarget] = useState(null)
  const [current, setCurrent] = useState(null)
  const [score, setScore] = useState(0)
  const [round, setRound] = useState(0)
  const [countdown, setCountdown] = useState(3)
  const [feedback, setFeedback] = useState(null)
  const [bestScore, setBestScore] = useState(ls.get('animalstop_best', 0))
  const intervalRef = useRef(null)
  const scoreRef = useRef(0)
  const roundRef = useRef(0)

  const nextAnimal = useCallback(() => {
    setCurrent(ANIMALS[Math.floor(Math.random() * ANIMALS.length)])
  }, [])

  const startRound = useCallback((diffIdx) => {
    const d = DIFFICULTIES[diffIdx]
    const tgt = ANIMALS[Math.floor(Math.random() * ANIMALS.length)]
    setTarget(tgt)
    setScore(0); setRound(0); setFeedback(null)
    scoreRef.current = 0; roundRef.current = 0
    setCountdown(3)
    setPhase('countdown')
    let cd = 3
    const cdInt = setInterval(() => {
      cd--
      setCountdown(cd)
      if (cd === 0) {
        clearInterval(cdInt)
        setPhase('playing')
        intervalRef.current = setInterval(() => {
          roundRef.current++
          setRound(roundRef.current)
          if (roundRef.current >= d.rounds) {
            clearInterval(intervalRef.current)
            setPhase('result')
          } else {
            nextAnimal()
          }
        }, d.interval)
        nextAnimal()
      }
    }, 1000)
  }, [nextAnimal])

  const stop = () => {
    if (phase !== 'playing' || !current || !target) return
    clearInterval(intervalRef.current)
    const correct = current.name === target.name
    setFeedback(correct ? 'correct' : 'wrong')
    if (correct) {
      const ns = scoreRef.current + 1
      scoreRef.current = ns
      setScore(ns)
      if (ns > bestScore) { setBestScore(ns); ls.set('animalstop_best', ns) }
      // continue
      setTimeout(() => {
        setFeedback(null)
        intervalRef.current = setInterval(() => {
          roundRef.current++
          setRound(roundRef.current)
          if (roundRef.current >= DIFFICULTIES[diff].rounds) {
            clearInterval(intervalRef.current)
            setPhase('result')
          } else {
            nextAnimal()
          }
        }, DIFFICULTIES[diff].interval)
        nextAnimal()
      }, 600)
    } else {
      setTimeout(() => setPhase('result'), 1000)
    }
  }

  useEffect(() => () => clearInterval(intervalRef.current), [])

  return (
    <div className="game-page">
      <div className="game-header" style={{maxWidth:500}}>
        <button className="back-btn" onClick={() => navigate('/')}>◀ BACK</button>
        <h1 style={{color:'var(--red)', textShadow:'0 0 10px var(--red)'}}>ANIMAL STOP</h1>
        <div className="score-badge">BEST: {bestScore}</div>
      </div>

      {phase === 'idle' && (
        <div style={{textAlign:'center', maxWidth:440}}>
          <div style={{fontSize:48, marginBottom:16}}>🐾</div>
          <p style={{fontSize:8, color:'var(--text-dim)', lineHeight:2, marginBottom:24}}>
            ANIMALS FLASH ON SCREEN.<br/>PRESS STOP WHEN YOU SEE THE TARGET!
          </p>
          <div style={{display:'flex', gap:10, justifyContent:'center', marginBottom:24, flexWrap:'wrap'}}>
            {DIFFICULTIES.map((d,i) => (
              <button
                key={i}
                onClick={() => setDiff(i)}
                style={{
                  fontFamily:"'Press Start 2P',monospace", fontSize:8,
                  padding:'10px 16px',
                  background: diff===i ? 'var(--red)' : 'transparent',
                  border:`2px solid var(--red)`,
                  color: diff===i ? '#000' : 'var(--red)',
                  cursor:'pointer',
                }}
              >
                {d.label}
              </button>
            ))}
          </div>
          <button className="btn-red btn" onClick={() => startRound(diff)}>▶ START</button>
        </div>
      )}

      {phase === 'countdown' && (
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:'clamp(48px,10vw,80px)', color:'var(--cyan)', textShadow:'0 0 30px var(--cyan)', animation:'pulse 0.9s ease-in-out infinite'}}>
            {countdown || 'GO!'}
          </div>
          {target && <div style={{fontSize:9, color:'var(--text-dim)', marginTop:16}}>FIND: <span style={{color:'var(--red)'}}>{target.emoji} {target.name}</span></div>}
        </div>
      )}

      {(phase === 'playing' || feedback) && (
        <div style={{textAlign:'center'}}>
          <div style={{marginBottom:16, display:'flex', gap:20, justifyContent:'center', fontSize:9, flexWrap:'wrap'}}>
            <span>FIND: <span style={{color:'var(--red)'}}>{target?.emoji} {target?.name}</span></span>
            <span style={{color:'var(--yellow)'}}>SCORE: {score}</span>
            <span style={{color:'var(--text-dim)'}}>ROUND: {round}/{DIFFICULTIES[diff].rounds}</span>
          </div>
          <div style={{
            fontSize:'clamp(80px,20vw,140px)',
            marginBottom:24,
            transition:'all 0.1s',
            filter: feedback === 'correct' ? 'drop-shadow(0 0 30px #00ff88)' : feedback === 'wrong' ? 'drop-shadow(0 0 30px #ff3366)' : 'none',
          }}>
            {current?.emoji || '?'}
          </div>
          {feedback && (
            <div style={{fontSize:12, color: feedback==='correct' ? 'var(--green)' : 'var(--red)', marginBottom:16}}>
              {feedback === 'correct' ? '✅ CORRECT!' : '❌ WRONG!'}
            </div>
          )}
          {!feedback && <button className="btn-red btn" onClick={stop} style={{fontSize:14, padding:'16px 32px'}}>⏹ STOP!</button>}
        </div>
      )}

      {phase === 'result' && (
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:48, marginBottom:12}}>{score > 0 ? '🏆' : '💀'}</div>
          <div style={{fontSize:'clamp(20px,4vw,32px)', color:'var(--yellow)', marginBottom:8}}>{score}/{DIFFICULTIES[diff].rounds}</div>
          <div style={{fontSize:8, color:'var(--text-dim)', marginBottom:20}}>CORRECT STOPS</div>
          {score >= bestScore && score > 0 && <div style={{fontSize:9, color:'var(--green)', marginBottom:16}}>🏆 NEW HIGH SCORE!</div>}
          <button className="btn-red btn" onClick={() => setPhase('idle')}>↺ PLAY AGAIN</button>
        </div>
      )}
    </div>
  )
}
