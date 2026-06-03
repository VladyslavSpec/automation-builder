import { useEffect, useRef } from 'react';

const SPACING = 34;
const DOT_R = 1.4;
const REPEL_RADIUS = 95;
const REPEL_STRENGTH = 22;
const LERP = 0.06;

export default function DotBackground() {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const dots = useRef([]);
  const raf = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const initDots = () => {
      const list = [];
      const cols = Math.ceil(canvas.width / SPACING) + 2;
      const rows = Math.ceil(canvas.height / SPACING) + 2;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const hx = c * SPACING;
          const hy = r * SPACING;
          list.push({ hx, hy, x: hx, y: hy });
        }
      }
      dots.current = list;
    };

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initDots();
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const { x: mx, y: my } = mouse.current;

      for (const d of dots.current) {
        const dx = d.x - mx;
        const dy = d.y - my;
        const dist = Math.hypot(dx, dy);

        if (dist < REPEL_RADIUS && dist > 0.1) {
          const force = (1 - dist / REPEL_RADIUS) * REPEL_STRENGTH;
          d.x += (dx / dist) * force * 0.2;
          d.y += (dy / dist) * force * 0.2;
        }

        d.x += (d.hx - d.x) * LERP;
        d.y += (d.hy - d.y) * LERP;

        const curDist = Math.hypot(d.x - mx, d.y - my);
        const proximity = curDist < REPEL_RADIUS ? 1 - curDist / REPEL_RADIUS : 0;
        const alpha = 0.11 + proximity * 0.50;

        ctx.beginPath();
        ctx.arc(d.x, d.y, DOT_R, 0, Math.PI * 2);
        ctx.fillStyle = proximity > 0
          ? `rgba(99,102,241,${alpha.toFixed(2)})`
          : `rgba(255,255,255,${alpha.toFixed(2)})`;
        ctx.fill();
      }

      raf.current = requestAnimationFrame(draw);
    };

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onLeave = () => { mouse.current = { x: -9999, y: -9999 }; };

    resize();
    draw();

    window.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', onLeave);

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
