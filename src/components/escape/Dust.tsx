import { useEffect, useRef } from "react";

type Mote = { x: number; y: number; r: number; v: number; a: number; gold: boolean };
type Spark = { x: number; y: number; vx: number; vy: number; life: number };

export function Dust({ burst }: { burst: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const burstRef = useRef(burst);
  burstRef.current = burst;

  useEffect(() => {
    const canvas = ref.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let motes: Mote[] = [];
    let sparks: Spark[] = [];
    let seen = burstRef.current;
    let last = performance.now();
    let frame = 0;
    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const seed = () => {
      motes = Array.from({ length: 32 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.3 + 0.4,
        v: Math.random() * 8 + 3,
        a: Math.random() * 0.28 + 0.08,
        gold: Math.random() > 0.4,
      }));
    };

    resize();
    seed();
    const observer = new ResizeObserver(() => {
      resize();
      seed();
    });
    observer.observe(parent);

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (burstRef.current !== seen) {
        seen = burstRef.current;
        for (let i = 0; i < 26; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 90 + 24;
          sparks.push({
            x: width * 0.5,
            y: height * 0.42,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1,
          });
        }
      }
      ctx.clearRect(0, 0, width, height);
      for (const mote of motes) {
        mote.y -= mote.v * dt;
        mote.x += Math.sin(now / 900 + mote.y) * 6 * dt;
        if (mote.y < -4) {
          mote.y = height + 4;
          mote.x = Math.random() * width;
        }
        ctx.beginPath();
        ctx.fillStyle = mote.gold
          ? `rgba(201,161,91,${mote.a})`
          : `rgba(243,234,220,${mote.a})`;
        ctx.arc(mote.x, mote.y, mote.r, 0, Math.PI * 2);
        ctx.fill();
      }
      sparks = sparks.filter((spark) => spark.life > 0);
      for (const spark of sparks) {
        spark.life -= dt * 0.85;
        spark.x += spark.vx * dt;
        spark.y += spark.vy * dt;
        spark.vy += 36 * dt;
        ctx.beginPath();
        ctx.fillStyle = `rgba(228,200,138,${Math.max(0, spark.life)})`;
        ctx.arc(spark.x, spark.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return <canvas ref={ref} className="dust" aria-hidden />;
}
