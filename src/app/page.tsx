// app/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

/**
 * Place your friend's image at: /public/friend.jpg
 * Replace the filename if needed.
 */

export default function BirthdayLanding() {
  // lock target time once (10 seconds from first render)
  const targetRef = useRef<number>(Date.now() + 10_000);
  const [timeLeftMs, setTimeLeftMs] = useState<number>(
    Math.max(0, targetRef.current - Date.now())
  );
  const [celebrate, setCelebrate] = useState(false);

  // countdown ticker
  useEffect(() => {
    const tick = () => {
      const diff = targetRef.current - Date.now();
      if (diff <= 0) {
        setTimeLeftMs(0);
        setCelebrate(true);
        return true;
      }
      setTimeLeftMs(diff);
      return false;
    };

    // immediate tick + interval
    if (tick()) return;
    const id = setInterval(() => {
      if (tick()) clearInterval(id);
    }, 250); // 250ms gives smoother transitions for seconds display

    return () => clearInterval(id);
  }, []);

  const totalSeconds = Math.max(0, Math.floor(timeLeftMs / 1000));
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-b from-[#020111] via-[#04041a] to-[#050505] flex items-center justify-center overflow-hidden text-white">
      {!celebrate ? (
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 160, damping: 14 }}
          className="flex flex-col items-center gap-6"
        >
          <h2 className="text-xl md:text-2xl text-white/70">Countdown to the celebration</h2>
          <div className="bg-black/50 backdrop-blur-md px-8 py-6 rounded-2xl shadow-xl border border-white/5">
            <div className="text-6xl md:text-8xl font-extrabold font-mono tracking-widest">
              {hours} : {minutes} : {seconds}
            </div>
          </div>
          <p className="text-sm text-white/60 mt-2">Get ready — fireworks and surprises coming!</p>
        </motion.div>
      ) : (
        <Celebration />
      )}
    </div>
  );
}

/* --- Celebration component: image animation + canvas fireworks --- */
function Celebration() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const stop = startRealisticFireworks(canvasRef);
    return () => stop && stop();
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden
      />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Animated friend picture */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 110, damping: 12, delay: 0.15 }}
          className="rounded-full ring-4 ring-white/10 shadow-2xl overflow-hidden"
          style={{ width: 170, height: 170 }}
        >
          {/* Replace '/friend.jpg' in public/ with your friend's photo */}
          <motion.img
            src="/img5.jpg"
            alt="Friend"
            className="w-full h-full object-cover"
            initial={{ rotate: -1, filter: "grayscale(0.2) contrast(1)" }}
            animate={{
              rotate: [ -1, 2, -2, 1, 0 ],
              scale: [1, 1.02, 1, 1.01],
              filter: [
                "grayscale(0.2) contrast(1)",
                "grayscale(0) contrast(1.05) saturate(1.05)",
                "grayscale(0.05) contrast(1.02)",
              ]
            }}
            transition={{ duration: 6, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
          />
        </motion.div>

        {/* Shiny gradient heading */}
        <motion.h1
          initial={{ opacity: 0, y: 10, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.25, duration: 0.9, type: "spring", stiffness: 100 }}
          className="mt-6 text-4xl md:text-6xl font-extrabold text-center bg-clip-text text-transparent"
          style={{
            backgroundImage:
              "linear-gradient(90deg, #ff9a9e 0%, #fad0c4 20%, #fbc2eb 40%, #a1c4fd 60%, #c2e9fb 100%)",
          }}
        >
          🎉 Happy Birthday — <span className="text-white/95">Noor</span> 🎂
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          transition={{ delay: 0.7 }}
          className="mt-4 text-center text-white/80 max-w-2xl"
        >
          Keep shining like your name,Noor ✨
        </motion.p>
      </div>
    </>
  );
}

/* ---------- Fireworks Engine (thin trails, shining wave on blast) ---------- */
function startRealisticFireworks(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Resize with DPR
  function fitCanvas() {
    if (!canvas || !ctx) return;
    
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  fitCanvas();
  window.addEventListener("resize", fitCanvas);

  // Storage
  type Trail = { x: number; y: number; alpha: number };
  type Rocket = {
    x: number; y: number;
    vx: number; vy: number;
    hue: number;
    trail: Trail[];
    explodeAtY: number;
    thinness: number;
  };
  type Spark = {
    x: number; y: number;
    vx: number; vy: number;
    life: number; lifespan: number;
    hue: number; size: number;
    shine: number;
  };
  type Wave = { x:number; y:number; r:number; alpha:number; hue:number };

  const rockets: Rocket[] = [];
  const sparks: Spark[] = [];
  const waves: Wave[] = [];

  // Constants
  const gravity = 0.06;
  const drag = 0.998;
  const spawnIntervalInitial = 600; // initial volley time
  let lastSpawn = performance.now();
  let initialVolleyDone = false;

  const rand = (a:number,b:number) => Math.random()*(b-a)+a;

  // Thin trailing rocket spawn (rises then explodes into thin spark wave)
  function spawnRocket(x?: number, opts?: Partial<Rocket>) {
    if (!canvas) return;
    
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const startX = x ?? rand(0.08*w, 0.92*w);
    const r: Rocket = {
      x: startX,
      y: h + 10,
      vx: rand(-0.6, 0.6),
      vy: rand(-11.2, -13.8),
      hue: rand(0, 360),
      trail: [],
      explodeAtY: rand(h * 0.20, h * 0.36),
      thinness: rand(0.6, 1.2),
      ...opts,
    };
    rockets.push(r);
  }

  // initial crossing volley for dramatic opening
  function initialVolley() {
    if (!canvas) return;
    
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    for (let i=0;i<5;i++){
      spawnRocket(rand(0.02*w,0.16*w), { vx: rand(2.1,3.2), vy: rand(-12.8,-14.2), explodeAtY: rand(h*0.16,h*0.28) });
      spawnRocket(rand(0.84*w,0.98*w), { vx: rand(-3.2,-2.1), vy: rand(-12.8,-14.2), explodeAtY: rand(h*0.16,h*0.28) });
    }
    // some center quick shots
    for (let i=0;i<3;i++){
      spawnRocket(rand(w*0.40,w*0.60), { vx: rand(-0.6,0.6), vy: rand(-13.1,-14.4), explodeAtY: rand(h*0.12,h*0.26) });
    }
  }

  // Explosion: create many thin sparks + a bright shining wave
  function explodeRocket(r: Rocket) {
    const count = Math.floor(rand(70,140));
    const baseSpeed = rand(2.4,5.2);
    for (let i=0;i<count;i++){
      const ang = rand(0, Math.PI*2);
      const speed = baseSpeed * (0.6 + Math.random()*0.9);
      const s: Spark = {
        x: r.x,
        y: r.y,
        vx: Math.cos(ang)*speed + rand(-0.25,0.25),
        vy: Math.sin(ang)*speed + rand(-0.25,0.25),
        life: 0,
        lifespan: rand(60,110),
        hue: r.hue + rand(-14,14),
        size: rand(0.9,1.8),
        shine: Math.random(), // flicker factor
      };
      sparks.push(s);
    }

    // shining wave (thin radial glow)
    waves.push({ x: r.x, y: r.y, r: 2, alpha: 0.85, hue: r.hue });
  }

  // draw helpers
  function drawBackground() {
    if (!canvas || !ctx) return;
    
    // keep a subtle dark gradient / faint stars look by drawing semi transparent rectangle
    ctx.fillStyle = "rgba(1,1,2,0.12)";
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  }

  function drawRocket(r: Rocket) {
    if (!ctx) return;
    
    // add current position to trail array
    r.trail.push({ x: r.x, y: r.y, alpha: 1 });
    if (r.trail.length > 10) r.trail.shift();

    // draw thin trail lines (faint)
    ctx.lineWidth = 1.1 * r.thinness;
    for (let i=0;i<r.trail.length-1;i++){
      const p1 = r.trail[i];
      const p2 = r.trail[i+1];
      const a = (i / r.trail.length) * 0.9;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = `hsla(${r.hue}, 85%, 65%, ${0.9 * a})`;
      ctx.stroke();
    }

    // rocket head: tiny bright point
    ctx.beginPath();
    ctx.fillStyle = `hsl(${r.hue}, 90%, 75%)`;
    ctx.arc(r.x, r.y, 2.2 * r.thinness, 0, Math.PI*2);
    ctx.fill();
  }

  function drawSpark(s: Spark) {
    if (!ctx) return;
    
    // spark flicker and glow
    const lifeRatio = Math.max(0, 1 - s.life / s.lifespan);
    const alpha = lifeRatio * (0.95 - Math.abs(Math.sin(s.shine * 8))) ;
    // thin spark (smaller radius)
    ctx.beginPath();
    ctx.fillStyle = `hsla(${s.hue}, 92%, 60%, ${alpha})`;
    ctx.arc(s.x, s.y, s.size, 0, Math.PI*2);
    ctx.fill();

    // subtle outer glow by drawing radial gradient
    const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, Math.max(10, s.size*8));
    grad.addColorStop(0, `hsla(${s.hue}, 100%, 70%, ${alpha*0.35})`);
    grad.addColorStop(1, `hsla(${s.hue}, 100%, 70%, 0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(s.x, s.y, Math.max(10, s.size*8), 0, Math.PI*2);
    ctx.fill();
  }

  function drawWave(w: Wave) {
    if (!ctx || !canvas) return;
    
    // thin luminous ring that expands and fades
    ctx.beginPath();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = `hsla(${w.hue}, 90%, 70%, ${w.alpha})`;
    ctx.arc(w.x, w.y, w.r, 0, Math.PI*2);
    ctx.stroke();

    // subtle radial soft glow for big radius
    const rg = ctx.createRadialGradient(w.x, w.y, w.r * 0.2, w.x, w.y, w.r * 1.6);
    rg.addColorStop(0, `hsla(${w.hue}, 90%, 70%, ${w.alpha*0.26})`);
    rg.addColorStop(1, `hsla(${w.hue}, 90%, 70%, 0)`);
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.arc(w.x, w.y, Math.min(canvas.clientWidth, canvas.clientHeight), 0, Math.PI*2);
    ctx.fill();
  }

  // animation loop
  let raf = 0;
  let lastTime = performance.now();
  function frame(time: number) {
    if (!canvas || !ctx) return;
    
    const dt = Math.min(1.8, (time - lastTime) / (1000/60));
    lastTime = time;

    // slightly transparent background to create motion trails
    drawBackground();

    // update rockets
    for (let i = rockets.length - 1; i >= 0; i--) {
      const r = rockets[i];
      r.vy += gravity * dt;
      r.vx *= drag;
      r.vy *= drag;
      r.x += r.vx * dt;
      r.y += r.vy * dt;

      drawRocket(r);

      // if reached apex or nearer to explodeY, explode
      if (r.y <= r.explodeAtY || r.vy >= -0.4) {
        explodeRocket(r);
        rockets.splice(i, 1);
      } else if (r.x < -50 || r.x > canvas.clientWidth + 50) {
        rockets.splice(i, 1);
      }
    }

    // update sparks
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      // integrate physics
      s.vx *= 0.995;
      s.vy *= 0.995;
      s.vy += gravity * 0.02 * dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.life += dt;

      drawSpark(s);

      if (s.life > s.lifespan) sparks.splice(i, 1);
    }

    // update waves
    for (let i = waves.length - 1; i >= 0; i--) {
      const w = waves[i];
      w.r += 2.6 * (1 + Math.random()*0.4) * dt; // expand
      w.alpha -= 0.010 * dt;
      if (w.alpha <= 0) waves.splice(i, 1);
      else drawWave(w);
    }

    // spawn logic
    // first big crossing volley (one-time) for spectacle
    if (!initialVolleyDone && time - lastSpawn > 80) {
      initialVolley();
      initialVolleyDone = true;
      lastSpawn = time;
    }

    // subsequent staggered launches
    if (time - lastSpawn > spawnIntervalInitial) {
      // sometimes launch pairs or one
      const launches = Math.random() < 0.28 ? 2 : 1;
      for (let i=0;i<launches;i++){
        spawnRocket();
      }
      lastSpawn = time + rand(120, 400);
    }

    raf = requestAnimationFrame(frame);
  }

  raf = requestAnimationFrame(frame);

  // Return stop function
  return function stop() {
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", fitCanvas);
  };
}
























// export default function Practice(){
//   return(
//     <div className="min-w-screen min-h-screen  bg-gradient-to-b from-blue-200 via-blue-300 to-blue-500  mask-r-from-80% pt-80">
//         <div className="max-w-5xl bg-black min-h-1 mx-auto"></div>
//     </div>
//   )
// }
