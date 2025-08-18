import { useEffect, useRef, useState } from 'react'

type Target = { id: number; x: number; y: number; kind: 'safe' | 'phish' }

export default function Game() {
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [targets, setTargets] = useState<Target[]>([])
  const nextId = useRef(1)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (timeLeft <= 0) return
    const t = window.setInterval(() => setTimeLeft(t => t - 1), 1000)
    return () => clearInterval(t)
  }, [timeLeft])

  useEffect(() => {
    const spawn = window.setInterval(() => {
      setTargets(prev => {
        const kind: Target['kind'] = Math.random() < 0.5 ? 'phish' : 'safe'
        const x = Math.random() * 90
        const y = Math.random() * 60
        return [...prev, { id: nextId.current++, x, y, kind }].slice(-8)
      })
    }, 800)
    return () => clearInterval(spawn)
  }, [])

  function clickTarget(id: number, kind: Target['kind']) {
    setTargets(ts => ts.filter(t => t.id !== id))
    setScore(s => s + (kind === 'phish' ? 2 : -1))
  }

  function start() {
    setScore(0); setTimeLeft(30); setTargets([])
    if (timerRef.current) window.clearInterval(timerRef.current)
  }

  const gameOver = timeLeft <= 0

  return (
    <div className="container">
      <div className="title">Spot the Phish</div>
      <div className="subtitle" style={{ marginTop: 4 }}>Click on phishing bubbles, avoid legit ones. Time: {timeLeft}s — Score: {score}</div>
      <div className="card" style={{ marginTop: 10, position: 'relative', height: 260, overflow: 'hidden' }}>
        <div className="viz" style={{ position: 'absolute', inset: 8 }}>
          {gameOver ? 'Game over. Press Start to play again.' : 'Click the suspicious ones (phish)!'}
        </div>
        {!gameOver && targets.map(t => (
          <button
            key={t.id}
            onClick={() => clickTarget(t.id, t.kind)}
            className="btn"
            style={{
              position: 'absolute',
              left: `${t.x}%`,
              top: `${t.y}%`,
              transform: 'translate(-50%, -50%)',
              background: t.kind === 'phish' ? 'rgba(255,107,107,0.25)' : 'rgba(56,211,159,0.18)'
            }}
          >{t.kind === 'phish' ? 'Phish' : 'Legit'}</button>
        ))}
      </div>
      <div className="flex items-center gap-12" style={{ marginTop: 10 }}>
        <button className="btn primary" onClick={start}>Start</button>
      </div>
    </div>
  )
}

