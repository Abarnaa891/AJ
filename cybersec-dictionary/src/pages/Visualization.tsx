export default function Visualization() {
  return (
    <div className="container">
      <div className="title">Visualizations</div>
      <div className="grid" style={{ marginTop: 10 }}>
        <div className="card">
          <div className="subtitle">Network Layers</div>
          <div className="viz" style={{ marginTop: 8 }}>OSI stack with packet flow (placeholder)</div>
        </div>
        <div className="card">
          <div className="subtitle">Password Strength</div>
          <div className="viz" style={{ marginTop: 8 }}>Entropy bars vs common patterns (placeholder)</div>
        </div>
        <div className="card">
          <div className="subtitle">Threat Modeling</div>
          <div className="viz" style={{ marginTop: 8 }}>STRIDE bubbles (placeholder)</div>
        </div>
      </div>
    </div>
  )
}

