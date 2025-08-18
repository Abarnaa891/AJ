export default function Tools() {
  const tools = [
    { name: 'Wireshark', type: 'Network', use: 'Capture and analyze network traffic.' },
    { name: 'Nmap', type: 'Recon/Scanning', use: 'Discover hosts, ports, and services.' },
    { name: 'Burp Suite', type: 'Web', use: 'Intercept and test web requests.' },
    { name: 'Metasploit', type: 'Exploitation', use: 'Exploit framework for pentesting.' },
    { name: 'OSQuery', type: 'Visibility', use: 'Query your endpoints like a database.' },
    { name: 'Volatility', type: 'Forensics', use: 'Analyze memory dumps.' },
    { name: 'Hashcat', type: 'Cracking', use: 'Recover passwords from hashes.' },
  ]
  return (
    <div className="container">
      <div className="title">Security Tools</div>
      <div className="grid" style={{ marginTop: 10 }}>
        {tools.map(t => (
          <div className="card" key={t.name}>
            <div className="subtitle">{t.type}</div>
            <div style={{ fontWeight: 600, marginTop: 4 }}>{t.name}</div>
            <p style={{ marginTop: 8 }}>{t.use}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

