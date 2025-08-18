import { useMemo, useState } from 'react'
import { Search, Save, Info } from 'lucide-react'
import { useSavedStore } from '../store/saved'

type Term = {
  id: string
  term: string
  aka?: string[]
  simpleDefinition: string
  realWorldExample: string
  visualizationHint: string
  category: 'Network' | 'Web' | 'Malware' | 'Cryptography' | 'Risk' | 'Forensics' | 'Identity'
}

const TERMS: Term[] = [
  {
    id: 'phishing',
    term: 'Phishing',
    aka: ['Email Scam'],
    simpleDefinition: 'Tricking you into giving up secrets (like passwords) by pretending to be someone you trust.',
    realWorldExample: 'An email looks like your bank asking you to “verify your account.” The link goes to a fake page that steals your login.',
    visualizationHint: 'Hook catching a password fish in a mailbox sea.',
    category: 'Risk',
  },
  {
    id: '2fa',
    term: 'Two-Factor Authentication (2FA)',
    simpleDefinition: 'A second lock on your account. Even if a thief knows your password, they still need a code from your phone.',
    realWorldExample: 'Logging into Instagram and entering a 6-digit code sent to your phone.',
    visualizationHint: 'Door with two locks: key (password) + phone code.',
    category: 'Identity',
  },
  {
    id: 'firewall',
    term: 'Firewall',
    simpleDefinition: 'A security gate that decides which network traffic is allowed or blocked.',
    realWorldExample: 'Your home router blocks unsolicited incoming connections from the internet.',
    visualizationHint: 'Brick wall filtering glowing packets.',
    category: 'Network',
  },
  {
    id: 'ransomware',
    term: 'Ransomware',
    simpleDefinition: 'Malware that locks your files and demands money to unlock them.',
    realWorldExample: 'A hospital’s systems get encrypted and attackers demand Bitcoin to restore patient records.',
    visualizationHint: 'Locked folder with timer and coin icon.',
    category: 'Malware',
  },
  {
    id: 'sql-injection',
    term: 'SQL Injection (SQLi)',
    simpleDefinition: 'Typing sneaky database commands into a website input to read or change data you should not access.',
    realWorldExample: 'Putting `\' OR 1=1 --` into a login field to bypass authentication.',
    visualizationHint: 'Syringe injecting code into a database cylinder.',
    category: 'Web',
  },
  {
    id: 'xss',
    term: 'Cross-Site Scripting (XSS)',
    simpleDefinition: 'Running malicious JavaScript in another user’s browser by abusing a website’s input.',
    realWorldExample: 'Posting a script in a comment that steals other users’ cookies when they view it.',
    visualizationHint: 'Speech bubble emitting code sparks into another screen.',
    category: 'Web',
  },
  {
    id: 'hashing',
    term: 'Hashing',
    simpleDefinition: 'Turning data into a fixed-length fingerprint. Good for checks, not for getting the original back.',
    realWorldExample: 'Websites store the hash of your password, not the password itself.',
    visualizationHint: 'Meat grinder turning long text into identical-size pellets.',
    category: 'Cryptography',
  },
  {
    id: 'encryption',
    term: 'Encryption',
    simpleDefinition: 'Scrambling data so only people with the key can read it.',
    realWorldExample: 'WhatsApp messages are encrypted end-to-end; only you and your friend can read them.',
    visualizationHint: 'Lock and key over scrambled letters.',
    category: 'Cryptography',
  },
]

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

