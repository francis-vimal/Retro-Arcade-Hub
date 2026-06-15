import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ls } from '../utils/storage'

const WORDS = [
  {word:'JAVASCRIPT', hint:'A PROGRAMMING LANGUAGE'},
  {word:'KEYBOARD', hint:'YOU TYPE ON THIS'},
  {word:'GALAXY', hint:'SPACE SYSTEM'},
  {word:'PYTHON', hint:'A CODING SNAKE'},
  {word:'MONITOR', hint:'DISPLAY SCREEN'},
  {word:'ARCADE', hint:'GAMING VENUE'},
  {word:'QUANTUM', hint:'PHYSICS TERM'},
  {word:'BINARY', hint:'0S AND 1S'},
  {word:'ROCKET', hint:'SPACE VEHICLE'},
  {word:'CRYSTAL', hint:'GEMSTONE TYPE'},
  {word:'NETWORK', hint:'CONNECTED SYSTEMS'},
  {word:'PHANTOM', hint:'A GHOST'},
  {word:'VOLTAGE', hint:'ELECTRICAL MEASURE'},
  {word:'HORIZON', hint:'WHERE SKY MEETS EARTH'},
  {word:'MAGNET', hint:'ATTRACTS METAL'},
]

const MAX_WRONG = 6

function HangmanSVG({ wrong }) {
  const parts = [
    // head
    wrong > 0 && <circle key="h" cx="100" cy="30" r="14" stroke="#ff00ff" strokeWidth="3" fill="none"/>,
    // body
    wrong > 1 && <line key="b" x1="100" y1="44" x2="100" y2="100" stroke="#00ffff" strokeWidth="3"/>,
    // left arm
    wrong > 2 && <line key="la" x1="100" y1="60" x2="70" y2="85" stroke="#00ffff" strokeWidth="3"/>,
    // right arm
    wrong > 3 && <line key="ra" x1="100" y1="60" x2="130" y2="85" stroke="#00ffff" strokeWidth="3"/>,
    // left leg
    wrong > 4 && <line key="ll" x1="100" y1="100" x2="70" y2="130" stroke="#ff00ff" strokeWidth="3"/>,
    // right leg
    wrong > 5 && <line key="rl" x1="100" y1="100" x2="130" y2="130" stroke="#ff00ff" strokeWidth="3"/>,
  ].filter(Boolean)

  return (
    <svg width="160" height="160" viewBox="0 0 160 160" style={{display:'block', margin:'0 auto'}}>
      {/* Gallows */}
      <line x1="20" y1="150" x2="140" y2="150" stroke="#555577" strokeWidth="3"/>
      <line x1="60" y1="150" x2="60" y2="10" stroke="#555577" strokeWidth="3"/>
      <line x1="60" y1="10" x2="100" y2="10" stroke="#555577" strokeWidth="3"/>
      <line x1="100" y1="10" x2="100" y2="16" stroke="#555577" strokeWidth="3"/>
      {parts}
    </svg>
  )
}

export default function Hangman() {
  const navigate = useNavigate()
  const [wordObj, setWordObj] = useState(null)
  const [guessed, setGuessed] = useState(new Set())
  const [phase, setPhase] = useState('idle') // idle, playing, won, lost
  const [streak, setStreak] = useState(ls.get('hangman_streak', 0))

  const newGame = useCallback(() => {
    const w = WORDS[Math.floor(Math.random() * WORDS.length)]
    setWordObj(w)
    setGuessed(new Set())
    setPhase('playing')
  }, [])

  const wrongCount = wordObj ? [...guessed].filter(l => !wordObj.word.includes(l)).length : 0
  const allGuessed = wordObj ? wordObj.word.split('').every(l => guessed.has(l)) : false

  useEffect(() => {
    if (!wordObj || phase !== 'playing') return
    if (allGuessed) {
      const ns = streak + 1; setStreak(ns); ls.set('hangman_streak', ns)
      setPhase('won')
    } else if (wrongCount >= MAX_WRONG) {
      ls.set('hangman_streak', 0); setStreak(0)
      setPhase('lost')
    }
  }, [guessed, wordObj, allGuessed, wrongCount, streak, phase])

  const guess = useCallback((l) => {
    if (phase !== 'playing' || guessed.has(l)) return
    setGuessed(g => new Set([...g, l]))
  }, [phase, guessed])

  useEffect(() => {
    const handler = (e) => {
      const k = e.key.toUpperCase()
      if (/^[A-Z]$/.test(k)) guess(k)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [guess])

  const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

  return (
    <div className="game-page">
      <div className="game-header" style={{maxWidth:600}}>
        <button className="back-btn" onClick={() => navigate('/')}>◀ BACK</button>
        <h1 style={{color:'var(--purple)', textShadow:'0 0 10px var(--purple)'}}>HANGMAN</h1>
        <div className="score-badge">STREAK: {streak}</div>
      </div>

      {phase === 'idle' && (
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:48, marginBottom:20}}>🪢</div>
          <p style={{fontSize:8, color:'var(--text-dim)', lineHeight:2, marginBottom:20}}>GUESS THE WORD BEFORE THE FIGURE IS COMPLETE!</p>
          <button className="btn" onClick={newGame}>▶ START GAME</button>
        </div>
      )}

      {(phase === 'playing' || phase === 'won' || phase === 'lost') && wordObj && (
        <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:16, width:'100%', maxWidth:560}}>
          {/* Status */}
          {phase === 'won' && <div style={{fontSize:10, color:'var(--green)', textShadow:'0 0 15px var(--green)', animation:'slideIn 0.3s'}}>🎉 YOU WIN!</div>}
          {phase === 'lost' && <div style={{fontSize:10, color:'var(--red)', textShadow:'0 0 15px var(--red)', animation:'slideIn 0.3s'}}>💀 GAME OVER!</div>}

          <div style={{display:'flex', gap:40, alignItems:'flex-start', flexWrap:'wrap', justifyContent:'center'}}>
            <HangmanSVG wrong={wrongCount} />
            <div>
              {/* Hint */}
              <div style={{fontSize:7, color:'var(--text-dim)', marginBottom:8}}>HINT: {wordObj.hint}</div>
              {/* Wrong attempts */}
              <div style={{fontSize:8, color: wrongCount >= 4 ? 'var(--red)' : 'var(--yellow)', marginBottom:16}}>
                WRONG: {wrongCount}/{MAX_WRONG}
              </div>
              {/* Word display */}
              <div style={{display:'flex', gap:8, flexWrap:'wrap', justifyContent:'center'}}>
                {wordObj.word.split('').map((l, i) => (
                  <div key={i} style={{
                    width:32, height:40,
                    borderBottom: `3px solid ${guessed.has(l) ? 'var(--cyan)' : 'var(--text-dim)'}`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:16,
                    color: guessed.has(l) ? 'var(--cyan)' : (phase === 'lost' ? 'var(--red)' : 'transparent'),
                    textShadow: guessed.has(l) ? '0 0 10px var(--cyan)' : 'none',
                  }}>
                    {(guessed.has(l) || phase === 'lost') ? l : ''}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Keyboard */}
          <div style={{display:'flex', flexWrap:'wrap', gap:5, justifyContent:'center', maxWidth:500}}>
            {ALPHA.map(l => {
              const isGuessed = guessed.has(l)
              const isWrong = isGuessed && !wordObj.word.includes(l)
              const isCorrect = isGuessed && wordObj.word.includes(l)
              return (
                <button
                  key={l}
                  onClick={() => guess(l)}
                  disabled={isGuessed || phase !== 'playing'}
                  style={{
                    fontFamily:"'Press Start 2P',monospace", fontSize:9,
                    width:36, height:36,
                    background: isWrong ? '#330011' : isCorrect ? '#003322' : '#1a1a3a',
                    border: `1px solid ${isWrong ? 'var(--red)' : isCorrect ? 'var(--green)' : 'var(--border)'}`,
                    color: isWrong ? 'var(--red)' : isCorrect ? 'var(--green)' : 'var(--text)',
                    cursor: isGuessed || phase !== 'playing' ? 'default' : 'pointer',
                    opacity: isGuessed ? 0.5 : 1,
                  }}
                >
                  {l}
                </button>
              )
            })}
          </div>

          {(phase === 'won' || phase === 'lost') && (
            <button className="btn" onClick={newGame}>↺ NEXT WORD</button>
          )}
        </div>
      )}
    </div>
  )
}
