import { useEffect, useRef, useState } from 'react';

// ============================================================================
// 1. MOUSE TRAIL GLOW PARTICLES
// ============================================================================
interface TrailParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

export function MouseTrailGlow() {
  const particlesRef = useRef<TrailParticle[]>([]);
  const [tick, setTick] = useState(0);
  const idRef = useRef(0);
  const lastSpawnRef = useRef(0);
  const sphereCenterRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const updateCenter = () => {
      sphereCenterRef.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    };
    updateCenter();
    window.addEventListener('resize', updateCenter);
    return () => window.removeEventListener('resize', updateCenter);
  }, []);

  useEffect(() => {
    let animId: number;
    const animate = () => {
      const arr = particlesRef.current;
      if (arr.length > 0) {
        for (let i = arr.length - 1; i >= 0; i--) {
          const p = arr[i];
          const dx = sphereCenterRef.current.x - p.x;
          const dy = sphereCenterRef.current.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const isNearSphere = dist < 250;

          if (isNearSphere && p.color === '#10b981') {
            p.vx += (dx / dist) * 0.6;
            p.vy += (dy / dist) * 0.6;
          } else {
            p.vy += 0.12;
          }

          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.96;
          p.vy *= 0.96;
          p.life -= 1 / p.maxLife;
          if (p.life <= 0) arr.splice(i, 1);
        }
        setTick(t => t + 1);
      }
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      const dx = e.clientX - sphereCenterRef.current.x;
      const dy = e.clientY - sphereCenterRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const isNearSphere = dist < 250;
      const spawnRate = isNearSphere ? 20 : 40;

      if (now - lastSpawnRef.current > spawnRate) {
        lastSpawnRef.current = now;
        const angle = Math.random() * Math.PI * 2;
        const isGreen = Math.random() > 0.3 || isNearSphere;

        particlesRef.current.push({
          id: idRef.current++,
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * (isNearSphere ? 0.3 : 0.8),
          vy: Math.sin(angle) * (isNearSphere ? 0.3 : 0.8) + (isNearSphere ? -1 : 0.5),
          life: 1,
          maxLife: isNearSphere ? 50 + Math.random() * 20 : 30 + Math.random() * 20,
          size: isNearSphere ? 3 + Math.random() * 3 : 2 + Math.random() * 2,
          color: isGreen ? '#10b981' : '#ffffff',
        });

        if (isNearSphere) {
          particlesRef.current.push({
            id: idRef.current++,
            x: e.clientX + (Math.random() - 0.5) * 15,
            y: e.clientY + (Math.random() - 0.5) * 15,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            life: 1,
            maxLife: 40 + Math.random() * 20,
            size: 2 + Math.random() * 2,
            color: '#10b981',
          });
        }

        if (particlesRef.current.length > 120) {
          particlesRef.current = particlesRef.current.slice(-120);
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const now = Date.now();
      if (now - lastSpawnRef.current > 50) {
        lastSpawnRef.current = now;
        const angle = Math.random() * Math.PI * 2;
        particlesRef.current.push({
          id: idRef.current++,
          x: touch.clientX,
          y: touch.clientY,
          vx: Math.cos(angle) * 0.5,
          vy: Math.sin(angle) * 0.5 + 0.5,
          life: 1,
          maxLife: 30 + Math.random() * 20,
          size: 2 + Math.random() * 2,
          color: Math.random() > 0.5 ? '#10b981' : '#ffffff',
        });
        if (particlesRef.current.length > 120) {
          particlesRef.current = particlesRef.current.slice(-120);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[5] overflow-hidden">
      {particlesRef.current.map(p => (
        <div
          key={`${p.id}-${tick}`}
          className="absolute rounded-full"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: p.color === '#10b981'
              ? `0 0 ${p.size * 3}px ${p.color}, 0 0 ${p.size * 6}px ${p.color}40`
              : `0 0 ${p.size * 2}px ${p.color}60`,
            opacity: p.life,
            transform: 'translate(-50%, -50%)',
            transition: 'none',
          }}
        />
      ))}
    </div>
  );
}

// ============================================================================
// 2. SCRAMBLE TEXT EFFECT (Matrix/Cyberpunk)
// ============================================================================
const CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`\\';

export function ScrambleText({ text, trigger, className = '' }: { text: string; trigger: boolean; className?: string }) {
  const [displayText, setDisplayText] = useState(text);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!trigger) {
      setDisplayText(text);
      return;
    }
    const startTime = Date.now();
    const textLength = text.length;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / 600, 1);
      let result = '';
      for (let i = 0; i < textLength; i++) {
        const charProgress = Math.max(0, (progress * textLength - i));
        if (charProgress >= 1) {
          result += text[i];
        } else if (charProgress > 0) {
          result += CHARS[Math.floor(Math.random() * CHARS.length)];
        } else {
          result += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      }
      setDisplayText(result);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [trigger, text]);

  return <span className={className}>{displayText}</span>;
}

// ============================================================================
// 3. ORGANIC MORPHING NUMBERS (Slot Machine Style)
// ============================================================================
function MorphingDigit({ digit, delay = 0, trigger }: { digit: string; delay?: number; trigger: boolean }) {
  const [currentDigit, setCurrentDigit] = useState('0');
  const [isGlowing, setIsGlowing] = useState(false);

  useEffect(() => {
    if (!trigger) {
      setCurrentDigit('0');
      return;
    }
    const target = parseInt(digit);
    if (isNaN(target)) {
      setCurrentDigit(digit);
      return;
    }

    const timeout = setTimeout(() => {
      let steps = 0;
      const maxSteps = 12 + Math.floor(Math.random() * 8);
      const interval = setInterval(() => {
        steps++;
        if (steps >= maxSteps) {
          setCurrentDigit(digit);
          setIsGlowing(true);
          setTimeout(() => setIsGlowing(false), 500);
          clearInterval(interval);
        } else {
          setCurrentDigit(String(Math.floor(Math.random() * 10)));
        }
      }, 40 + Math.random() * 25);
      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [trigger, digit, delay]);

  return (
    <span className={`inline-block font-mono font-black tabular-nums ${isGlowing ? 'text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.8)]' : 'text-white'}`}>
      {currentDigit}
    </span>
  );
}

export function MorphingNumber({
  value,
  trigger,
  prefix = '',
  suffix = '',
  className = '',
}: {
  value: number;
  trigger: boolean;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const digits = value.toLocaleString('pt-BR').split('');

  return (
    <div className={`inline-flex items-baseline ${className}`}>
      {prefix && <span className="text-emerald-500 mr-1 text-lg">{prefix}</span>}
      {digits.map((digit, i) => (
        digit === ',' || digit === '.' ? (
          <span key={i} className="text-white font-mono font-black">{digit}</span>
        ) : (
          <MorphingDigit key={i} digit={digit} delay={i * 60} trigger={trigger} />
        )
      ))}
      {suffix && <span className="text-emerald-500 ml-1 text-lg font-bold">{suffix}</span>}
    </div>
  );
}