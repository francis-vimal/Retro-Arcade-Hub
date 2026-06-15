import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ls } from '../utils/storage'

const EMOJIS = ['🌟','🎮','🚀','🦄','🎯','🔥','⚡','🌈','🎸','🐉','🍀','💎']

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }

function createCards() {
  return shuffle([...EMOJIS, ...EMOJIS].map((e, i) => ({ id: i, emoji: e, flipped: false, matched: false })))
}

export default function MemoryMatch() {
  const navigate = useNavigate()
  const [cards, setCards] = useState(createCards)
  const [flipped, setFlipped] = useState([])
  const [moves, setMoves] = useState(0)
  const [matched, setMatched] = useState(0)
  const [time, setTime] = useState(0)
  const [phase, setPhase] = useState('idle') // idle, playing, won
  const [bestMoves, setBestMoves] = useState(ls.get('memory_best', 0))
  const [checking, setChecking] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (phase === 'playing') {
      timerRef.current = setInterval(() => setTime(t => t + 1), 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [phase])

  const startGame = () => {
    setCards(createCards()); setFlipped([]); setMoves(0); setMatched(0); setTime(0); setPhase('playing'); setChecking(false)
  }

  const flipCard = (id) => {
    if (checking || phase !== 'playing') return
    const card = cards.find(c => c.id === id)
    if (!card || card.flipped || card.matched || flipped.length === 2) return

    const newCards = cards.map(c => c.id === id ? {...c, flipped: true} : c)
    setCards(newCards)
    const newFlipped = [...flipped, id]
    setFlipped(newFlipped)

    if (newFlipped.length === 2) {
      const [a, b] = newFlipped.map(fid => newCards.find(c => c.id === fid))
      const newMoves = moves + 1
      setMoves(newMoves)
      setChecking(true)
      if (a.emoji === b.emoji) {
        setTimeout(() => {
          const matched2 = cards.map(c => newFlipped.includes(c.id) ? {...c, matched: true} : c)
          setCards(matched2)
          setFlipped([])
          setChecking(false)
          const newMatched = matched + 1
          setMatched(newMatched)
          if (newMatched === EMOJIS.length) {
            clearInterval(timerRef.current)
            setPhase('won')
            if (!bestMoves || newMoves < bestMoves) { setBestMoves(newMoves); ls.set('memory_best', newMoves) }
          }
        }, 600)
      } else {
        setTimeout(() => {
          setCards(cards2 => cards2.map(c => newFlipped.includes(c.id) ? {...c, flipped: false} : c))
          setFlipped([])
          setChecking(false)
        }, 900)
      }
    }
  }

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  return (
    <div className="game-page">
      <div className="game-header" style={{maxWidth:600}}>
        <button className="back-btn" onClick={() => navigate('/')}>◀ BACK</button>
        <h1 className="neon-green">MEMORY MATCH</h1>
        <div className="score-badge">BEST: {bestMoves || '--'} MOVES</div>
      </div>

      <div style={{display:'flex', gap:20, marginBottom:16, flexWrap:'wrap', justifyContent:'center'}}>
        {[['MOVES', moves, 'var(--yellow)'], ['TIME', fmt(time), 'var(--cyan)'], ['PAIRS', `${matched}/${EMOJIS.length}`, 'var(--green)']].map(([l,v,c]) => (
          <div key={l} style={{textAlign:'center', border:'1px solid var(--border)', padding:'10px 20px', minWidth:80}}>
            <div style={{fontSize:'clamp(14px,2.5vw,20px)', color:c}}>{v}</div>
            <div style={{fontSize:7, color:'var(--text-dim)', marginTop:4}}>{l}</div>
          </div>
        ))}
      </div>

      {phase === 'won' && (
        <div style={{fontSize:10, color:'var(--green)', marginBottom:16, animation:'slideIn 0.3s ease', textShadow:'0 0 20px var(--green)', textAlign:'center'}}>
          🏆 YOU WIN! {moves} MOVES IN {fmt(time)}
        </div>
      )}

      <div style={{display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:'clamp(4px,1.5vw,8px)', width:'min(560px,95vw)', marginBottom:20}}>
        {cards.map(card => (
          <div
            key={card.id}
            onClick={() => flipCard(card.id)}
            style={{
              aspectRatio: '1',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize: 'clamp(18px,4vw,28px)',
              cursor: card.matched || card.flipped || phase !== 'playing' ? 'default' : 'pointer',
              background: card.matched ? 'rgba(0,255,136,0.15)' : card.flipped ? 'rgba(0,255,255,0.1)' : '#1a1a3a',
              border: card.matched ? '2px solid var(--green)' : card.flipped ? '2px solid var(--cyan)' : '1px solid var(--border)',
              borderRadius: 4,
              transition: 'all 0.2s',
              boxShadow: card.matched ? '0 0 10px var(--green)' : 'none',
              transform: card.flipped || card.matched ? 'scale(1)' : 'scale(0.95)',
              userSelect: 'none',
            }}
          >
            {card.flipped || card.matched ? card.emoji : '?'}
          </div>
        ))}
      </div>

      <button className="btn-green btn" onClick={startGame}>
        {phase === 'idle' ? '▶ START' : '↺ RESTART'}
      </button>
    </div>
  )
}
