"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  el: HTMLDivElement;
  life: number;
  maxLife: number;
}

export function MouseTrail() {
  const trailRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const lastRef = useRef(0);

  useEffect(() => {
    const container = document.createElement("div");
    container.style.cssText =
      "position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden";
    document.body.appendChild(container);

    const colors = ["#e11d48", "#d4a017", "#0891b2", "#22c55e", "#f43f5e"];

    function spawn(x: number, y: number) {
      const el = document.createElement("div");
      const size = 6 + Math.random() * 8;
      const color = colors[Math.floor(Math.random() * colors.length)];
      el.style.cssText = `
        position:absolute;
        left:${x}px; top:${y}px;
        width:${size}px; height:${size}px;
        border-radius:50%;
        background:${color};
        opacity:0.7;
        transform:translate(-50%,-50%) scale(0);
        transition:all 0.6s ease-out;
      `;
      container.appendChild(el);

      // Animate in
      requestAnimationFrame(() => {
        el.style.transform = "translate(-50%,-50%) scale(1)";
        el.style.opacity = "0.3";
      });

      trailRef.current.push({
        x,
        y,
        el,
        life: 0,
        maxLife: 30 + Math.random() * 20,
      });
    }

    function animate() {
      trailRef.current = trailRef.current.filter((p) => {
        p.life++;
        const progress = p.life / p.maxLife;
        p.el.style.opacity = String(0.7 * (1 - progress));
        p.el.style.transform = `translate(-50%,-50%) scale(${1 - progress * 0.3})`;

        if (p.life >= p.maxLife) {
          p.el.remove();
          return false;
        }
        return true;
      });
      rafRef.current = requestAnimationFrame(animate);
    }

    function onMove(e: MouseEvent) {
      const now = Date.now();
      if (now - lastRef.current < 40) return; // throttle
      lastRef.current = now;
      spawn(e.clientX, e.clientY);
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
      trailRef.current.forEach((p) => p.el.remove());
      container.remove();
    };
  }, []);

  return null;
}

