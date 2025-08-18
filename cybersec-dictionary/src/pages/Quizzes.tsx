import { useMemo, useState } from 'react'

type Q = { id: string; question: string; options: string[]; answerIdx: number; explain: string }

export default function Quizzes() {
  const questions: Q[] = useMemo(() => ([
    { id: 'q1', question: 'What is the safest response to a suspicious email link?', options: ['Click quickly', 'Hover to inspect URL', 'Reply to confirm', 'Forward to friends'], answerIdx: 1, explain: 'Hover to preview the destination; avoid clicking or entering creds.' },
    { id: 'q2', question: 'Which protects against MITM on public Wi-Fi?', options: ['HTTP', 'Using 123456 password', 'VPN', 'Turning off screen'], answerIdx: 2, explain: 'A VPN encrypts traffic and authenticates the tunnel.' },
    { id: 'q3', question: 'Hashing is best described as:', options: ['Reversible encryption', 'One-way fingerprinting', 'Compression', 'Noise'], answerIdx: 1, explain: 'Hashes are one-way fingerprints used for integrity.' },
  ]), [])

  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)

  const q = questions[idx]
  const isDone = idx >= questions.length

  function submit() {
    if (selected === null) return
    if (selected === q.answerIdx) setScore(s => s + 1)
    setIdx(i => i + 1)
    setSelected(null)
  }

  function restart() {
    setIdx(0); setSelected(null); setScore(0)
  }

  if (isDone) {
    return (
      <div className="container">
        <div className="card">
          <div className="title">Quiz complete</div>
          <p style={{ marginTop: 8 }}>Score: {score} / {questions.length}</p>
          <button className="btn" onClick={restart} style={{ marginTop: 8 }}>Try again</button>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="card">
        <div className="subtitle">Question {idx + 1} / {questions.length}</div>
        <div className="title" style={{ marginTop: 4 }}>{q.question}</div>
        <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
          {q.options.map((opt, i) => (
            <label key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 10, cursor: 'pointer' }}>
              <input type="radio" checked={selected === i} onChange={() => setSelected(i)} />
              <span>{opt}</span>
            </label>
          ))}
        </div>
        {selected !== null && (
          <div className="muted" style={{ marginTop: 8 }}>Tip: {q.explain}</div>
        )}
        <div className="flex items-center gap-12" style={{ marginTop: 10 }}>
          <button className="btn primary" onClick={submit}>Submit</button>
        </div>
      </div>
    </div>
  )
}

