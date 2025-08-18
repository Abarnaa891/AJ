export default function Books() {
  const books = [
    { title: 'The Web Application Hacker’s Handbook', by: 'Stuttard & Pinto', why: 'Deep practical web security testing.' },
    { title: 'Practical Malware Analysis', by: 'Sikorski & Honig', why: 'Hands-on malware reverse engineering.' },
    { title: 'Serious Cryptography', by: 'Jean-Philippe Aumasson', why: 'Modern crypto explained clearly.' },
    { title: 'The Art of Memory Forensics', by: 'Ligh, Case, Levy, Walter', why: 'Memory analysis for incident response.' },
    { title: 'Security Engineering', by: 'Ross Anderson', why: 'Systems security at scale.' },
  ]
  return (
    <div className="container">
      <div className="title">Recommended Books</div>
      <div className="grid" style={{ marginTop: 10 }}>
        {books.map(b => (
          <div className="card" key={b.title}>
            <div className="subtitle">{b.by}</div>
            <div style={{ fontWeight: 600, marginTop: 4 }}>{b.title}</div>
            <p style={{ marginTop: 8 }}>{b.why}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

