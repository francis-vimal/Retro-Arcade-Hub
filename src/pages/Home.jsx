import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ls } from '../utils/storage'
import styles from './Home.module.css'

const GAMES = [
  { id: 'simon', title: 'Simon Says', icon: '🎨', path: '/simon', desc: 'Follow the color sequence', color: '#00ffff' },
  { id: 'tictactoe', title: 'Tic Tac Toe', icon: '❌', path: '/tictactoe', desc: 'Classic 2-player battle', color: '#ff00ff' },
  { id: 'wordle', title: 'Wordle', icon: '📝', path: '/wordle', desc: 'Guess the 5-letter word', color: '#ffff00' },
  { id: 'memory', title: 'Memory Match', icon: '🧠', path: '/memory', desc: 'Match all the pairs', color: '#00ff88' },
  { id: 'mindgame', title: 'Mind Game', icon: '🎭', path: '/mindgame', desc: 'Color vs word challenge', color: '#ff6600' },
  { id: 'animalstop', title: 'Animal Stop', icon: '🐾', path: '/animalstop', desc: 'Stop on the right animal', color: '#ff3366' },
  { id: 'hangman', title: 'Hangman', icon: '🪢', path: '/hangman', desc: 'Save the figure, guess words', color: '#aa00ff' },
  { id: 'snake', title: 'Snake', icon: '🐍', path: '/snake', desc: 'Eat, grow, survive', color: '#00ff44' },
]

const ACHIEVEMENTS = [
  { icon: '🏆', title: 'First Win', desc: 'Win any game', key: 'simon_best', check: v => v > 0 },
  { icon: '🔥', title: 'Streak Master', desc: 'Hangman 5+ streak', key: 'hangman_streak', check: v => v >= 5 },
  { icon: '🧠', title: 'Mind Bender', desc: 'MindGame 20+ score', key: 'mindgame_best', check: v => v >= 20 },
  { icon: '🐍', title: 'Snake Charmer', desc: 'Snake 100+ score', key: 'snake_best', check: v => v >= 100 },
  { icon: '💡', title: 'Wordle Wizard', desc: 'Win Wordle in 3 tries', key: 'wordle_best_tries', check: v => v > 0 && v <= 3 },
  { icon: '⚡', title: 'Speed Demon', desc: 'Memory in <20 moves', key: 'memory_best', check: v => v > 0 && v <= 20 },
]

export default function Home() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [stats, setStats] = useState({})
  const [achievements, setAchievements] = useState([])

  useEffect(() => {
    const s = {
      simon_best: ls.get('simon_best', 0),
      ttt_xwins: ls.get('ttt_xwins', 0),
      ttt_owins: ls.get('ttt_owins', 0),
      wordle_wins: ls.get('wordle_wins', 0),
      memory_best: ls.get('memory_best', 0),
      mindgame_best: ls.get('mindgame_best', 0),
      snake_best: ls.get('snake_best', 0),
      hangman_streak: ls.get('hangman_streak', 0),
      wordle_best_tries: ls.get('wordle_best_tries', 0),
    }
    setStats(s)
    setAchievements(ACHIEVEMENTS.filter(a => a.check(s[a.key])))
  }, [])

  const filtered = GAMES.filter(g => {
    const q = search.toLowerCase()
    return g.title.toLowerCase().includes(q) || g.desc.toLowerCase().includes(q)
  })

  const totalGamesPlayed = stats.simon_best > 0 || stats.ttt_xwins > 0 || stats.wordle_wins > 0 || stats.snake_best > 0

  return (
    <div className={styles.home}>
      {/* Hero */}
      <header className={styles.hero}>
        <div className={styles.scanlines}></div>
        <div className={styles.heroInner}>
          <div className={styles.arcade}>
            <span className={styles.arcadeIcon}>🕹️</span>
          </div>
          <h1 className={styles.title}>
            <span className="neon-text">RETRO</span>
            <br/>
            <span className="neon-magenta">ARCADE</span>
            <br/>
            <span className="neon-yellow">HUB</span>
          </h1>
          <p className={styles.subtitle}>INSERT COIN TO PLAY</p>
          <div className={styles.blinkDot}></div>
        </div>
      </header>

      <main className={styles.main}>
        {/* Stats bar */}
        <div className={styles.statsBar}>
          <div className={styles.statItem}>
            <span className="neon-cyan">{stats.simon_best || 0}</span>
            <span>SIMON LV</span>
          </div>
          <div className={styles.statItem}>
            <span className="neon-magenta">{(stats.ttt_xwins || 0) + (stats.ttt_owins || 0)}</span>
            <span>TTT WINS</span>
          </div>
          <div className={styles.statItem}>
            <span className="neon-yellow">{stats.wordle_wins || 0}</span>
            <span>WORDLE W</span>
          </div>
          <div className={styles.statItem}>
            <span className="neon-green">{stats.snake_best || 0}</span>
            <span>SNAKE HI</span>
          </div>
          <div className={styles.statItem}>
            <span style={{color:'#ff6600', textShadow:'0 0 10px #ff6600'}}>{achievements.length}</span>
            <span>TROPHIES</span>
          </div>
        </div>

        {/* Search & Filter */}
        <div className={styles.controls}>
          <div className={styles.searchBox}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              className={styles.searchInput}
              placeholder="SEARCH GAMES..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Game Grid */}
        <h2 className={styles.sectionTitle}><span className="neon-cyan">▶</span> SELECT GAME</h2>
        <div className={styles.grid}>
          {filtered.map(g => (
            <div
              key={g.id}
              className={styles.card}
              style={{ '--card-accent': g.color }}
              onClick={() => navigate(g.path)}
            >
              <div className={styles.cardGlow}></div>
              <div className={styles.cardIcon}>{g.icon}</div>
              <h3 className={styles.cardTitle} style={{ color: g.color }}>{g.title}</h3>
              <p className={styles.cardDesc}>{g.desc}</p>
              <button className={styles.playBtn} style={{ borderColor: g.color, color: g.color }}>
                ▶ PLAY
              </button>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className={styles.noResults}>NO GAMES FOUND</div>
          )}
        </div>

        {/* Achievements */}
        <h2 className={styles.sectionTitle}><span className="neon-yellow">★</span> ACHIEVEMENTS</h2>
        <div className={styles.achievementsGrid}>
          {ACHIEVEMENTS.map(a => {
            const unlocked = a.check(stats[a.key])
            return (
              <div key={a.key} className={`${styles.achievement} ${unlocked ? styles.unlocked : styles.locked}`}>
                <span className={styles.achIcon}>{unlocked ? a.icon : '🔒'}</span>
                <div>
                  <div className={styles.achTitle}>{a.title}</div>
                  <div className={styles.achDesc}>{a.desc}</div>
                </div>
              </div>
            )
          })}
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span className="neon-cyan">🕹️ RETRO ARCADE HUB</span>
          <span className={styles.footerText}>8 GAMES • BUILT WITH REACT • PIXEL PERFECT</span>
          <span className="neon-magenta">© 2026</span>
        </div>
      </footer>
    </div>
  )
}
