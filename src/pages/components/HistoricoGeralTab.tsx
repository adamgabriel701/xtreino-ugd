import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Swords,
  Dumbbell,
  Calendar,
  ArrowRight,
  Filter,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import {
  FilterBar,
  SelectFilter,
  LoadingSpinner,
  EmptyState,
} from "./xtreino";

// ============================================================
// TIPOS
// ============================================================

interface HistoryEvent {
  id: number;
  type: "xtreino" | "scrim";
  date: string;
  title: string;
  team1Name: string | null;
  team2Name: string | null;
  details: string;
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function HistoricoGeralTab() {
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [limit, setLimit] = useState<number>(50);

  const { data: historyData, isLoading } = trpc.unified.listGeneralHistory.useQuery({
    limit: limit,
  });

  const filteredHistory = useMemo(() => {
    if (!historyData) return [];
    if (!typeFilter) return historyData;
    return historyData.filter((event) => event.type === typeFilter);
  }, [historyData, typeFilter]);

  const handleClear = () => {
    setTypeFilter("");
  };

  const hasFilters = !!typeFilter;

  // Agrupa os eventos por data (formato YYYY-MM-DD)
  const groupedByDate = useMemo(() => {
    const groups = new Map<string, HistoryEvent[]>();
    filteredHistory.forEach((event) => {
      const dayKey = event.date.split("T")[0]; // Garante que pega só a data
      if (!groups.has(dayKey)) {
        groups.set(dayKey, []);
      }
      groups.get(dayKey)!.push(event);
    });
    return Array.from(groups.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filteredHistory]);

  const loadMore = () => {
    setLimit((prev) => prev + 50);
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <FilterBar hasFilters={hasFilters} onClear={handleClear}>
        <SelectFilter
          icon={<Filter className="w-4 h-4 text-[#5a5a6e]" />}
          value={typeFilter}
          onChange={(v) => setTypeFilter(v || "")}
          placeholder="Todos os Eventos"
          options={[
            { value: "xtreino", label: "X-Treinos" },
            { value: "scrim", label: "Scrims (MME)" },
          ]}
          minWidth="160px"
        />
        <span className="text-xs text-[#5a5a6e]">
          Mostrando {filteredHistory.length} eventos
        </span>
      </FilterBar>

      {isLoading && <LoadingSpinner text="Carregando histórico unificado..." />}

      {/* Lista Agrupada por Dia */}
      {!isLoading && groupedByDate.length > 0 && (
        <div className="space-y-6">
          {groupedByDate.map(([date, events]) => {
            // Formata a data para exibição (ex: 12 de Outubro de 2023)
            const dateObj = new Date(date + "T00:00:00");
            const formattedDate = dateObj.toLocaleDateString("pt-BR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            });

            return (
              <div key={date} className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
                {/* Header do Dia */}
                <div className="bg-[#0a0a0f] px-6 py-3 border-b border-[#2a2a3a] flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-[#5a5a6e]" />
                  <h3 className="text-sm font-bold text-[#f0f0f5] capitalize">
                    {formattedDate}
                  </h3>
                  <div className="ml-auto flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {events.filter(e => e.type === 'xtreino').length} XTs
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                      {events.filter(e => e.type === 'scrim').length} Scrims
                    </span>
                  </div>
                </div>

                {/* Eventos do Dia */}
                <div className="divide-y divide-[#2a2a3a]">
                  {events.map((event) => (
                    <EventRow key={`${event.type}-${event.id}`} event={event} />
                  ))}
                </div>
              </div>
            );
          })}

          {/* Botão Carregar Mais */}
          <div className="flex justify-center pt-4">
            <button
              onClick={loadMore}
              className="px-6 py-2.5 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-sm font-medium text-[#8a8a9e] hover:text-[#f0f0f5] hover:border-[#5a5a6e] transition-all"
            >
              Carregar mais eventos
            </button>
          </div>
        </div>
      )}

      {/* Estado Vazio */}
      {!isLoading && groupedByDate.length === 0 && (
        <EmptyState
          icon={<Calendar className="w-12 h-12" />}
          title="Nenhum evento encontrado"
          subtitle="Não há registros de X-Treinos ou Scrims com os filtros selecionados."
        />
      )}
    </div>
  );
}

// ============================================================
// COMPONENTES AUXILIARES
// ============================================================

function EventRow({ event }: { event: HistoryEvent }) {
  const isXT = event.type === "xtreino";
  
  // Define o link de destino baseado no tipo
  const linkTo = isXT 
    ? `/rankings/xtreinos` 
    : `/rankings/scrims`; // Ajuste se tiver uma rota de detalhes de scrim específica

  return (
    <Link
      to={linkTo}
      className="flex items-center justify-between px-6 py-4 hover:bg-[#1a1a24] transition-colors group"
    >
      <div className="flex items-center gap-4">
        {/* Ícone do Tipo */}
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          isXT 
            ? "bg-blue-500/10 group-hover:bg-blue-500/20" 
            : "bg-red-500/10 group-hover:bg-red-500/20"
        } transition-colors`}>
          {isXT ? (
            <Dumbbell className="w-5 h-5 text-blue-400" />
          ) : (
            <Swords className="w-5 h-5 text-red-400" />
          )}
        </div>

        {/* Informações Principais */}
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
              isXT 
                ? "bg-blue-500/10 text-blue-400" 
                : "bg-red-500/10 text-red-400"
            }`}>
              {isXT ? "XT" : "SCRIM"}
            </span>
            <h4 className="text-sm font-bold text-[#f0f0f5] group-hover:text-green-400 transition-colors">
              {event.title}
            </h4>
          </div>
          
          {/* Subtítulo (Times no Scrim) */}
          {event.team1Name && event.team2Name && (
            <p className="text-xs text-[#5a5a6e] mt-0.5">
              {event.team1Name} <span className="text-[#2a2a3a] mx-1">vs</span> {event.team2Name}
            </p>
          )}
        </div>
      </div>

      {/* Lado Direito (Detalhes / Seta) */}
      <div className="flex items-center gap-3">
        {!event.team1Name && (
          <span className="text-xs text-[#5a5a6e] hidden sm:block">
            {event.details}
          </span>
        )}
        <ArrowRight className="w-4 h-4 text-[#5a5a6e] group-hover:text-green-400 transition-colors" />
      </div>
    </Link>
  );
}