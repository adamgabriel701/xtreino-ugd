import { useEffect, useRef, useState } from "react";
import { Gamepad2, Users, Star, Trophy } from "lucide-react";
import type { LucideIcon } from "../../types/sobre";

function useAnimatedCounter(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const start = performance.now();
          const step = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const newCount = Math.round(eased * target);
            setCount(newCount);
            if (progress >= 1 && ref.current) {
              ref.current.style.transform = "scale(1.15)";
              setTimeout(() => { if(ref.current) ref.current.style.transform = "scale(1)"; }, 200);
            }
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

const stats = [
  { value: 50, label: "XTreinos Realizados", icon: Gamepad2, suffix: "+" },
  { value: 20, label: "Equipes Ativas", icon: Users, suffix: "+" },
  { value: 100, label: "Jogadores", icon: Star, suffix: "+" },
  { value: 10, label: "Campeonatos", icon: Trophy, suffix: "+" },
];

export default function StatsSection() {
  return (
    <section className="border-y border-[#2a2a3a] bg-[#12121a]/80 backdrop-blur-sm">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return <StatCard key={stat.label} stat={stat} Icon={Icon} delay={idx} />;
          })}
        </div>
      </div>
    </section>
  );
}

function StatCard({ stat, Icon, delay }: { stat: typeof stats[0]; Icon: LucideIcon; delay: number }) {
  const { count, ref } = useAnimatedCounter(stat.value, 1500 + delay * 200);
  return (
    <div ref={ref} className={`counter-bounce text-center group animate-fade-up delay-${(delay + 1) * 100}`}>
      <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all duration-300">
        <Icon className="w-6 h-6 text-emerald-400" />
      </div>
      <p className="text-3xl font-bold text-[#f0f0f5] mb-1 tabular-nums">
        {count}<span className="text-emerald-400">{stat.suffix}</span>
      </p>
      <p className="text-[#8a8a9e] text-sm">{stat.label}</p>
    </div>
  );
}