import { Dumbbell, Trophy, Swords } from "lucide-react";

export default function DetailedStats({ xtreinoStats, championshipStats, scrimStats, xtreinoRealStats, scrimRealStats }: {
  xtreinoStats: { total: number; abertos: number; emAndamento: number; fechados: number };
  championshipStats: { total: number; ativos: number; inscricoes: number; encerrados: number };
  scrimStats: { total: number; agendados: number; emAndamento: number; finalizados: number };
  xtreinoRealStats: { totalTeams: number; totalKills: number; totalPoints: number; totalXtreinos: number };
  scrimRealStats: { totalTeams: number; totalKills: number; totalPoints: number; totalScrims: number };
}) {
  return (
    <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-14">
      <div className="flex items-center gap-3 mb-8 animate-fade-up">
        <div className="w-1 h-8 bg-emerald-500 rounded-full" />
        <h2 className="text-2xl font-bold text-[#f0f0f5]">Estatísticas Detalhadas</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Card XTreinos - NEON VERDE */}
        <div className="animate-fade-up delay-100 group relative bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden hover:border-emerald-500/40 transition-all duration-500 hover:-translate-y-1 neon-emerald">
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 z-10 pointer-events-none" />
          <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3 relative z-20">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center"><Dumbbell className="w-5 h-5 text-emerald-400" /></div>
            <div>
              <h3 className="font-bold text-[#f0f0f5]">XTreinos</h3>
              <p className="text-[#5a5a6e] text-xs">{xtreinoStats.total} eventos · {xtreinoRealStats.totalXtreinos} resultados</p>
            </div>
          </div>
          <div className="p-6 grid grid-cols-3 gap-4 relative z-20">
            {[{ value: xtreinoStats.abertos, label: "Abertos", color: "text-emerald-400" }, { value: xtreinoStats.emAndamento, label: "Em Andamento", color: "text-amber-400" }, { value: xtreinoStats.fechados, label: "Fechados", color: "text-red-400" }].map((item) => (
              <div key={item.label} className="text-center"><p className={`text-2xl font-bold ${item.color} tabular-nums`}>{item.value}</p><p className="text-[#5a5a6e] text-xs mt-1">{item.label}</p></div>
            ))}
          </div>
          {xtreinoRealStats.totalTeams > 0 && (
            <div className="px-6 pb-5 border-t border-white/5 relative z-20">
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="text-center p-2 rounded-lg bg-white/5 border border-white/5"><p className="text-lg font-bold text-emerald-400 tabular-nums">{xtreinoRealStats.totalTeams}</p><p className="text-[#5a5a6e] text-[10px]">Times</p></div>
                <div className="text-center p-2 rounded-lg bg-white/5 border border-white/5"><p className="text-lg font-bold text-green-400 tabular-nums">{xtreinoRealStats.totalKills}</p><p className="text-[#5a5a6e] text-[10px]">Kills Totais</p></div>
                <div className="text-center p-2 rounded-lg bg-white/5 border border-white/5"><p className="text-lg font-bold text-yellow-400 tabular-nums">{xtreinoRealStats.totalPoints}</p><p className="text-[#5a5a6e] text-[10px]">Pontos Totais</p></div>
              </div>
            </div>
          )}
        </div>

        {/* Card Campeonatos - NEON AMARELO */}
        <div className="animate-fade-up delay-200 group relative bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden hover:border-amber-500/40 transition-all duration-500 hover:-translate-y-1 neon-amber">
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 z-10 pointer-events-none" />
          <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3 relative z-20">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center"><Trophy className="w-5 h-5 text-amber-400" /></div>
            <div>
              <h3 className="font-bold text-[#f0f0f5]">Campeonatos</h3>
              <p className="text-[#5a5a6e] text-xs">{championshipStats.total} total</p>
            </div>
          </div>
          <div className="p-6 grid grid-cols-3 gap-4 relative z-20">
            {[{ value: championshipStats.ativos, label: "Ativos", color: "text-emerald-400" }, { value: championshipStats.inscricoes, label: "Inscrições", color: "text-amber-400" }, { value: championshipStats.encerrados, label: "Encerrados", color: "text-red-400" }].map((item) => (
              <div key={item.label} className="text-center"><p className={`text-2xl font-bold ${item.color} tabular-nums`}>{item.value}</p><p className="text-[#5a5a6e] text-xs mt-1">{item.label}</p></div>
            ))}
          </div>
        </div>

        {/* Card Scrims - NEON AZUL */}
        <div className="animate-fade-up delay-300 group relative bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden hover:border-blue-500/40 transition-all duration-500 hover:-translate-y-1 neon-blue">
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 z-10 pointer-events-none" />
          <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3 relative z-20">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center"><Swords className="w-5 h-5 text-blue-400" /></div>
            <div>
              <h3 className="font-bold text-[#f0f0f5]">Scrims</h3>
              <p className="text-[#5a5a6e] text-xs">{scrimStats.total} eventos · {scrimRealStats.totalScrims} resultados</p>
            </div>
          </div>
          <div className="p-6 grid grid-cols-3 gap-4 relative z-20">
            {[{ value: scrimStats.agendados, label: "Agendados", color: "text-blue-400" }, { value: scrimStats.emAndamento, label: "Em Andamento", color: "text-amber-400" }, { value: scrimStats.finalizados, label: "Finalizados", color: "text-red-400" }].map((item) => (
              <div key={item.label} className="text-center"><p className={`text-2xl font-bold ${item.color} tabular-nums`}>{item.value}</p><p className="text-[#5a5a6e] text-xs mt-1">{item.label}</p></div>
            ))}
          </div>
          {scrimRealStats.totalTeams > 0 && (
            <div className="px-6 pb-5 border-t border-white/5 relative z-20">
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="text-center p-2 rounded-lg bg-white/5 border border-white/5"><p className="text-lg font-bold text-blue-400 tabular-nums">{scrimRealStats.totalTeams}</p><p className="text-[#5a5a6e] text-[10px]">Times</p></div>
                <div className="text-center p-2 rounded-lg bg-white/5 border border-white/5"><p className="text-lg font-bold text-green-400 tabular-nums">{scrimRealStats.totalKills}</p><p className="text-[#5a5a6e] text-[10px]">Kills Totais</p></div>
                <div className="text-center p-2 rounded-lg bg-white/5 border border-white/5"><p className="text-lg font-bold text-yellow-400 tabular-nums">{scrimRealStats.totalPoints}</p><p className="text-[#5a5a6e] text-[10px]">Pontos Totais</p></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}