import { useEffect, useState } from 'react'

export default function Profile() {
  const [name, setName] = useState<string>('')
  const [role, setRole] = useState<string>('Learner')
  const [bio, setBio] = useState<string>('')

  useEffect(() => {
    const raw = localStorage.getItem('profile')
    if (raw) {
      try {
        const p = JSON.parse(raw)
        setName(p.name || '')
        setRole(p.role || 'Learner')
        setBio(p.bio || '')
      } catch {}
    }
  }, [])

  function save() {
    localStorage.setItem('profile', JSON.stringify({ name, role, bio }))
  }

  return (
    <div className="container">
      <div className="title">Profile</div>
      <div className="grid" style={{ marginTop: 10 }}>
        <div className="card">
          <label className="subtitle">Display Name</label>
          <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
          <label className="subtitle" style={{ marginTop: 8 }}>Role</label>
          <select className="select" value={role} onChange={e => setRole(e.target.value)}>
            {['Learner', 'Student', 'Analyst', 'Engineer', 'Researcher'].map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <label className="subtitle" style={{ marginTop: 8 }}>Bio</label>
          <textarea className="textarea" value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell us about your interests..." />
          <div className="flex items-center gap-12" style={{ marginTop: 10 }}>
            <button className="btn primary" onClick={save}>Save</button>
            <span className="muted">Saved locally</span>
          </div>
        </div>
        <div className="card">
          <div className="subtitle">Your Theme</div>
          <p style={{ marginTop: 6 }}>
            Toggle theme via the sidebar. The app remembers your choice on this device.
          </p>
        </div>
        <div className="card">
          <div className="subtitle">Preview</div>
          <div style={{ fontWeight: 700, marginTop: 6 }}>{name || 'Anonymous'}</div>
          <div className="chip" style={{ marginTop: 6 }}>{role}</div>
          <p style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>{bio || 'No bio'}</p>
        </div>
      </div>
    </div>
  )
}

