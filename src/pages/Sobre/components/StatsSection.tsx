import { Gamepad2, Users, Star, Trophy } from "lucide-react";

const stats = [
  { value: "50+", label: "XTreinos Realizados", icon: Gamepad2, suffix: "" },
  { value: "20+", label: "Equipes Ativas", icon: Users, suffix: "" },
  { value: "100+", label: "Jogadores", icon: Star, suffix: "" },
  { value: "10+", label: "Campeonatos", icon: Trophy, suffix: "" },
];

export default function StatsSection() {
  return (
    <section className="border-y border-[#2a2a3a] bg-[#12121a]">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="text-center group">
                <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all duration-300">
                  <Icon className="w-6 h-6 text-emerald-400" />
                </div>
                <p className="text-3xl font-bold text-[#f0f0f5] mb-1 tabular-nums">
                  {stat.value}<span className="text-emerald-400">{stat.suffix}</span>
                </p>
                <p className="text-[#8a8a9e] text-sm">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}