import { useMemo, useState } from 'react'
import { Search, Save, Info } from 'lucide-react'
import { useSavedStore } from '../store/saved'
import { TERMS } from '../data/terms'

export default function Dictionary() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string>('All')
  const { savedIds, toggleSaved } = useSavedStore()

  const categories = useMemo(() => ['All', ...Array.from(new Set(TERMS.map(t => t.category)))], [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return TERMS.filter(t => {
      const matchesQuery = !q || t.term.toLowerCase().includes(q) || t.simpleDefinition.toLowerCase().includes(q)
      const matchesCat = category === 'All' || t.category === category
      return matchesQuery && matchesCat
    })
  }, [query, category])

  return (
    <div className="container">
      <div className="toolbar">
        <div className="search">
          <Search className="icon" size={16} />
          <input placeholder="Search terms..." value={query} onChange={e => setQuery(e.target.value)} />
        </div>
        <div className="flex items-center gap-12">
          <select className="select" value={category} onChange={e => setCategory(e.target.value)}>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="grid">
        {filtered.map(item => (
          <div key={item.id} className="card">
            <div className="flex items-center justify-between">
              <div className="title">{item.term}</div>
              <button className="btn" onClick={() => toggleSaved(item.id)} title="Save">
                <Save size={14} /> {savedIds.has(item.id) ? 'Saved' : 'Save'}
              </button>
            </div>
            <div className="subtitle" style={{ marginTop: 6 }}>{item.category}</div>
            <p style={{ marginTop: 10 }}>{item.simpleDefinition}</p>
            <div className="viz" style={{ marginTop: 10 }}>Visualization idea: {item.visualizationHint}</div>
            <div className="flex items-center gap-8" style={{ marginTop: 10 }}>
              <span className="chip"><Info size={12} /> Example</span>
              <span className="muted">{item.realWorldExample}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

