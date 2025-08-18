import { useSavedStore } from '../store/saved'
import { Link } from 'react-router-dom'

export default function Saved() {
  const { savedIds } = useSavedStore()
  const list = Array.from(savedIds)
  return (
    <div className="container">
      <div className="title">Saved Terms</div>
      {list.length === 0 ? (
        <p className="muted" style={{ marginTop: 8 }}>No saved terms yet. Go to <Link to="/">Dictionary</Link> and save some.</p>
      ) : (
        <ul style={{ marginTop: 10 }}>
          {list.map(id => (
            <li key={id} className="card" style={{ marginBottom: 8 }}>{id}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

