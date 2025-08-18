import { useEffect, useState } from 'react'

type Note = { id: string; title: string; content: string }

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('notes') || '[]')
    } catch {
      return []
    }
  })
  const [draft, setDraft] = useState<Note>({ id: '', title: '', content: '' })

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes))
  }, [notes])

  function saveNote() {
    if (!draft.title.trim() && !draft.content.trim()) return
    const note: Note = { id: crypto.randomUUID(), title: draft.title.trim(), content: draft.content.trim() }
    setNotes([note, ...notes])
    setDraft({ id: '', title: '', content: '' })
  }

  function deleteNote(id: string) {
    setNotes(notes.filter(n => n.id !== id))
  }

  return (
    <div className="container">
      <div className="title">Notes</div>
      <div className="card" style={{ marginTop: 10 }}>
        <input className="input" placeholder="Title" value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} />
        <textarea className="textarea" placeholder="Write your notes..." value={draft.content} onChange={e => setDraft({ ...draft, content: e.target.value })} style={{ marginTop: 8 }} />
        <div className="flex items-center gap-12" style={{ marginTop: 8 }}>
          <button className="btn primary" onClick={saveNote}>Save</button>
          <span className="muted">Autosaves locally</span>
        </div>
      </div>

      <div className="grid" style={{ marginTop: 12 }}>
        {notes.map(n => (
          <div className="card note-item" key={n.id}>
            <div>
              <div style={{ fontWeight: 600 }}>{n.title || 'Untitled'}</div>
              <div className="muted" style={{ marginTop: 4, whiteSpace: 'pre-wrap' }}>{n.content}</div>
            </div>
            <button className="btn" onClick={() => deleteNote(n.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  )
}

