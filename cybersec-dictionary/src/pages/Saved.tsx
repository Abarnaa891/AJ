import { useSavedStore } from '../store/saved'
import { Link } from 'react-router-dom'
import { TERMS } from '../data/terms'

export default function Saved() {
  const { savedIds } = useSavedStore()
  const list = TERMS.filter(t => savedIds.has(t.id))
  return (
    <div className="container">
      <div className="title">Saved Terms</div>
      {list.length === 0 ? (
        <p className="muted" style={{ marginTop: 8 }}>No saved terms yet. Go to <Link to="/">Dictionary</Link> and save some.</p>
      ) : (
        <div className="grid" style={{ marginTop: 10 }}>
          {list.map(item => (
            <div key={item.id} className="card">
              <div className="title">{item.term}</div>
              <div className="subtitle" style={{ marginTop: 6 }}>{item.category}</div>
              <p style={{ marginTop: 8 }}>{item.simpleDefinition}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

