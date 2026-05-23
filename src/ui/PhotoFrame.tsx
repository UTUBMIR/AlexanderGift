import { useEffect, useRef } from 'react';

export function PhotoFrame() {
  const ref = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: 100, y: 100 });
  const velRef = useRef({ x: 3, y: 2 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf: number;
    const tick = () => {
      const pw = window.innerWidth;
      const ph = window.innerHeight;
      const sz = 160;
      const p = posRef.current;
      const v = velRef.current;
      p.x += v.x;
      p.y += v.y;
      if (p.x + sz > pw) { p.x = pw - sz; v.x = -v.x; }
      if (p.x < 0) { p.x = 0; v.x = -v.x; }
      if (p.y + sz > ph) { p.y = ph - sz; v.y = -v.y; }
      if (p.y < 0) { p.y = 0; v.y = -v.y; }
      el.style.left = `${p.x}px`;
      el.style.top = `${p.y}px`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        zIndex: 25,
        width: 160,
        height: 160,
        borderRadius: '50%',
        overflow: 'hidden',
        border: '4px solid rgba(255,215,0,0.6)',
        boxShadow: '0 0 40px rgba(255,215,0,0.3), 0 0 80px rgba(255,215,0,0.1)',
      }}
    >
      <img
        src="/avatar.jpg"
        alt="Айлександр"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    </div>
  );
}
