// src/app/scrims/index.ts

export * from "../../types/scrims";
export { useScrimData } from "../../hooks/useScrimData";
export { formatDate, getRankStyle, getPosColor, getPosBg } from "../../utils/formatters";

// Components
export { EmptyState } from "../../components/Scrims/EmptyState";
export { RankBadge } from "../../components/Scrims/RankBadge";
export { DateFilter } from "../../components/Scrims/DateFilter";
export { HistorySummary } from "../../components/Scrims/HistorySummary";
export { LoadingState } from "../../components/Scrims/LoadingState";
export { ScrimTable } from "../../components/Scrims/tables/ScrimTable";

// Tabs
export { AgendadosTab } from "../../components/Scrims/tabs/AgendadosTab";
export { HistoricoTimesTab } from "../../components/Scrims/tabs/HistoricoTimesTab";
export { HistoricoJogadoresTab } from "../../components/Scrims/tabs/HistoricoJogadoresTab";

// Modals
export { ScrimDetailModal } from "../../components/Scrims/modals/ScrimDetailModal";
export { TeamStatsModal } from "../../components/Scrims/modals/TeamStatsModal";
export { PlayerStatsModal } from "../../components/Scrims/modals/PlayerStatsModal";
export { ScrimFormModal } from "../../components/Scrims/modals/ScrimFormModal"; // <-- NOVO