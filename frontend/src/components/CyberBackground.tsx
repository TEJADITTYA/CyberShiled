import React from 'react';

export const CyberBackground: React.FC = () => {
  const [particles, setParticles] = React.useState<Array<{
    id: number;
    left: string;
    top: string;
    size: string;
    delay: string;
    duration: string;
    opacity: number;
  }>>([]);

  React.useEffect(() => {
    // Generate 45 cyber dust particles
    const list = Array.from({ length: 45 }, (_, i) => ({
      id: i,
      left: `${(Math.random() * 100).toFixed(1)}%`,
      top: `${(Math.random() * 100).toFixed(1)}%`,
      size: `${(2 + Math.random() * 4).toFixed(1)}px`,
      delay: `${(Math.random() * 6).toFixed(1)}s`,
      duration: `${(6 + Math.random() * 8).toFixed(1)}s`,
      opacity: Number((0.35 + Math.random() * 0.55).toFixed(2)),
    }));
    setParticles(list);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* Moving overlay grid */}
      <div className="overlay-grid" />

      {/* Radial scan rings */}
      <div className="scan-rings">
        <span className="ring ring-one" />
        <span className="ring ring-two" />
        <span className="ring ring-three" />
      </div>

      {/* Cyber glows */}
      <div className="dashboard-glow glow-one" />
      <div className="dashboard-glow glow-two" />
      <div className="dashboard-glow glow-three" />

      {/* Animated particle layer */}
      <div className="particle-layer">
        {particles.map((p) => (
          <span
            key={p.id}
            className="particle"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              animationDelay: p.delay,
              animationDuration: p.duration,
              opacity: p.opacity,
            }}
          />
        ))}
      </div>
    </div>
  );
};
