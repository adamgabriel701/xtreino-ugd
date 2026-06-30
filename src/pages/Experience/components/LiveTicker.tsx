import { useEffect, useState } from 'react';
import { Swords, Trophy, Users, TrendingUp } from 'lucide-react';

const fakeLiveActions = [
  { text: "Time Fúria dominou o Scrim #842 com 45 kills.", icon: Trophy, color: "text-yellow-400" },
  { text: "PlayerNinja acabou de alcançar 1.000 kills na temporada.", icon: Swords, color: "text-emerald-400" },
  { text: "Nova equipe 'Sentinelas' ingressou no ranking.", icon: Users, color: "text-cyan-400" },
  { text: "XTreino #1024 começou com 20 equipes.", icon: Swords, color: "text-emerald-400" },
  { text: "Ranking atualizado: Top 5 sofreu alterações.", icon: TrendingUp, color: "text-violet-400" },
];

export function LiveTicker() {
  const [actions, setActions] = useState(fakeLiveActions);

  // Simula novas ações entrando ao vivo (a cada 5 segundos)
  useEffect(() => {
    const interval = setInterval(() => {
      const randomAction = fakeLiveActions[Math.floor(Math.random() * fakeLiveActions.length)];
      setActions(prev => [randomAction, ...prev].slice(0, 10)); // Mantém apenas 10 no estado
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative z-20 bg-[#080810] border-y border-white/5 py-2.5 overflow-hidden">
      <div className="flex items-center">
        {/* Badge FIXO "AO VIVO" */}
        <div className="relative z-10 shrink-0 mx-4 flex items-center gap-2 bg-[#0a0a0f] px-3 py-1 rounded-full border border-white/10">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="text-[10px] font-bold tracking-widest uppercase text-white">Ao Vivo</span>
        </div>

        {/* Texto Rolante */}
        <div className="relative flex-1 overflow-hidden">
          <div className="flex animate-ticker-scroll whitespace-nowrap">
            {[...actions, ...actions].map((action, i) => {
              const Icon = action.icon;
              return (
                <div key={i} className="inline-flex items-center gap-2 mx-8 text-xs text-[#5a5a6e]">
                  <Icon className={`w-3.5 h-3.5 ${action.color} shrink-0`} />
                  <span>{action.text}</span>
                  <span className="text-[#2a2a3e]">•</span>
                </div>
              );
            })}
          </div>
          {/* Efeito de Fade nas bordas */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#080810] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#080810] to-transparent z-10 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}