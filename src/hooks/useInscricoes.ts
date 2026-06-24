import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import type { InscricaoEquipe, XtreinoEvento, SeedXtreinoData } from "@/types/inscricoes";

const API_BASE = "/api/trpc";

async function trpcFetch<T>(path: string, input?: unknown): Promise<T> {
  const url = input !== undefined
    ? `${API_BASE}/${path}?input=${encodeURIComponent(JSON.stringify({ json: input }))}`
    : `${API_BASE}/${path}`;
  const res = await fetch(url, { headers: { "Content-Type": "application/json" } });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: "Erro desconhecido" } }));
    throw new Error(err.error?.message || `HTTP ${res.status}`);
  }
  const data = await res.json();
  return (data.result?.data?.json ?? data) as T;
}

async function trpcMutate<T>(path: string, input: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input: { json: input } }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: "Erro desconhecido" } }));
    throw new Error(err.error?.message || `HTTP ${res.status}`);
  }
  const data = await res.json();
  return (data.result?.data?.json ?? data) as T;
}

export function useInscricoes(xtreinoId: number) {
  const [xtreino, setXtreino] = useState<XtreinoEvento | null>(null);
  const [inscricoes, setInscricoes] = useState<InscricaoEquipe[]>([]);
  const [fixedTeams, setFixedTeams] = useState<string[]>([]);
  const [allTeams, setAllTeams] = useState<Array<{ id: number; name: string; tag: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const loadData = useCallback(async () => {
    if (!xtreinoId) return;
    setIsLoading(true);
    try {
      const xt = await trpcFetch<XtreinoEvento>("xtreinoInscricoes.getXtreino", { id: xtreinoId });
      const ins = await trpcFetch<InscricaoEquipe[]>("xtreinoInscricoes.listByXtreino", { xtreinoId });
      const ft = await trpcFetch<string[]>("xtreinoInscricoes.getFixedTeams");
      const at = await trpcFetch<Array<{ id: number; name: string; tag: string }>>("xtreinoInscricoes.getAllTeams");

      setXtreino(xt);
      setInscricoes(ins ?? []);
      setFixedTeams(ft ?? []);
      setAllTeams(at ?? []);
    } catch (err: any) {
      toast.error(err.message || "Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  }, [xtreinoId]);

  const register = useCallback(async (data: { teamName: string; players: string[]; isReserve: boolean }) => {
    setIsPending(true);
    try {
      await trpcMutate<{ success: boolean; id: number }>("xtreinoInscricoes.register", { ...data, xtreinoId });
      toast.success("Time inscrito com sucesso!");
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Erro ao inscrever time");
    } finally {
      setIsPending(false);
    }
  }, [xtreinoId, loadData]);

  const cancel = useCallback(async (teamName: string) => {
    setIsPending(true);
    try {
      await trpcMutate<{ success: boolean }>("xtreinoInscricoes.cancel", { xtreinoId, teamName });
      toast.success("Inscrição cancelada!");
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Erro ao cancelar");
    } finally {
      setIsPending(false);
    }
  }, [xtreinoId, loadData]);

  const reactivate = useCallback(async (teamName: string) => {
    setIsPending(true);
    try {
      await trpcMutate<{ success: boolean }>("xtreinoInscricoes.reactivate", { xtreinoId, teamName });
      toast.success("Inscrição reativada!");
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Erro ao reativar");
    } finally {
      setIsPending(false);
    }
  }, [xtreinoId, loadData]);

  const remove = useCallback(async (teamName: string) => {
    setIsPending(true);
    try {
      await trpcMutate<{ success: boolean }>("xtreinoInscricoes.unregister", { xtreinoId, teamName });
      toast.success("Time removido!");
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Erro ao remover");
    } finally {
      setIsPending(false);
    }
  }, [xtreinoId, loadData]);

  const fixedSet = useMemo(() => new Set(fixedTeams.map(t => t.toLowerCase())), [fixedTeams]);

  const confirmedTeams = useMemo(() =>
    inscricoes.filter(r => r.status === "confirmada").sort((a, b) => (a.slotNumber ?? 0) - (b.slotNumber ?? 0)),
    [inscricoes]
  );

  const cancelledTeams = useMemo(() =>
    inscricoes.filter(r => r.status === "cancelada"),
    [inscricoes]
  );

  // Gerar mensagem WhatsApp
  const generateWhatsAppMessage = useCallback(() => {
    if (!xtreino) return "";
    const dateParts = xtreino.date.split("-");
    const formattedDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}` : xtreino.date;

    const [h, m] = (xtreino.timeBr || "21:00").split(":").map(Number);
    const times = {
      brAr: `${String(h).padStart(2, "0")}:${String(m || 0).padStart(2, "0")}`,
      boCl: `${String(h - 1).padStart(2, "0")}:${String(m || 0).padStart(2, "0")}`,
      coPe: `${String(h - 2).padStart(2, "0")}:${String(m || 0).padStart(2, "0")}`,
      mxNi: `${String(h - 3).padStart(2, "0")}:${String(m || 0).padStart(2, "0")}`,
      us: `${String(h - 4).padStart(2, "0")}:${String(m || 0).padStart(2, "0")}`,
    };

    let teamsList = "";
    for (let i = 1; i <= xtreino.maxTeams; i++) {
      const team = confirmedTeams.find(t => t.slotNumber === i);
      const isFixed = team ? fixedSet.has(team.teamName.toLowerCase()) : false;
      const isCancelled = cancelledTeams.find(t => t.slotNumber === i);
      const emoji = isFixed ? "📌" : "🎫";
      const pos = String(i).padStart(2, "0");

      if (isCancelled) {
        teamsList += `❌ ${pos} - ~${isCancelled.teamName}~\n`;
      } else if (team) {
        teamsList += `${emoji} ${pos} - ${team.teamName}\n`;
      } else {
        teamsList += `${emoji} ${pos} -\n`;
      }
    }

    return `𝙐𝙉𝘿𝙀𝙍𝙂𝙍𝙊𝙐𝙉𝘿 - 𝙓𝙏𝙍𝙀𝙄𝙉𝙊𝙎 𝙈𝙊𝘽𝙄𝙇𝙀 (${formattedDate})


⚔️ 𝙈𝙊𝘿𝙊 ${(xtreino.modality || "squad").toUpperCase()} 
⛳ 3 𝙌𝙐𝙀𝘿𝘼𝙎 
🌴 𝙄𝙇𝙃𝘼 𝘿𝙊 𝙈𝙀𝘿𝙊


🇧🇷🇦🇷 ${times.brAr}
🇧🇴🇨🇱 ${times.boCl}
🇨🇴🇵🇪 ${times.coPe}
🇲🇽🇳🇮 ${times.mxNi}
🇺🇸 ${times.us} (GMT-7)

FIXO 📌
TEMPORÁRIO 🎫

${teamsList}
\`Regras:\`

🚨 SEM AUXÍLIO DE MIRA
🚫 LANÇA GRANADA E LANÇA CHAMAS
🚫 LANÇA GRANADAS
🚫 LANÇA CHAMAS
🚫 MUNIÇÃO INCENDIÁRIA
🚫 M1887 LOADOUT
🚫 ORIGIN - 12 LOADOUT
🚫 M82 INCENDIÁRIA

_em caso de uso dessas armas será penalizado em -40 pontos_


Grupo do Whatsapp: ${xtreino.whatsappLink || "https://chat.whatsapp.com/Ks4fDFnA7eBHk9ULHuHyzm"}`;
  }, [xtreino, confirmedTeams, cancelledTeams, fixedSet]);

  // Gerar mensagem de inscrições
  const generateInscricoesMessage = useCallback(() => {
    return `📝INSCRIÇÕES:

🛡️ NOME DA EQUIPE:

PLAYER 1:
PLAYER 2:
PLAYER 3:
PLAYER 4:
RESERVAS:

@todos`;
  }, []);

  // Gerar seed TypeScript
  const generateSeed = useCallback((): SeedXtreinoData | null => {
    if (!xtreino) return null;

    const colocacoes: Array<[string, number, number, number]> = confirmedTeams.map(team => [
      team.teamName,
      0, // Q1
      0, // Q2
      0, // Q3
    ]);

    const jogadores: Array<[string, string, number, number, number]> = [];
    for (const team of confirmedTeams) {
      for (const player of team.players) {
        jogadores.push([team.teamName, player, 0, 0, 0]);
      }
    }

    return {
      id: xtreino.id,
      date: xtreino.date,
      colocacoes,
      jogadores,
    };
  }, [xtreino, confirmedTeams]);

  return {
    xtreino,
    inscricoes,
    fixedTeams,
    allTeams,
    confirmedTeams,
    cancelledTeams,
    isLoading,
    isPending,
    loadData,
    register,
    cancel,
    reactivate,
    remove,
    generateWhatsAppMessage,
    generateInscricoesMessage,
    generateSeed,
  };
}