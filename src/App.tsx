import { Routes, Route } from "react-router";
import { Toaster } from "sonner";
import Home from "./pages/Home/page";
import Campeonatos from "./pages/Campeonatos";
import XTreinos from "./pages/XTreinos";
import MatchResult from "./pages/Scrims/match/[id]/page";
import Rankings from "./pages/Rankings";
import ScrimsHub from "./pages/Scrims/ScrimsHub"; // NOVO: O Super Componente

import Clans from "./pages/Clans";
import ClanDetail from "./pages/Clans/components/ClanDetail";
import TeamDetail from "./pages/Clans/components/TeamDetail";
import PlayerDetail from "./pages/Clans/components/PlayerDetail";

import Jogadores from "./pages/Jogadores/page";
import JogadorDetalhe from "./pages/Jogadores/JogadorDetalhe";

import Inscricoes from "./pages/Inscricoes";
import Salinhas from "./pages/Salinhas";
import Sobre from "./pages/Sobre/page";
import ExperiencePage from "./pages/Experience/page";
import SalinhaPerlotti from "./pages/salinhas/SalinhaPerlotti";

export default function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ style: { background: "#12121a", color: "#f0f0f5", border: "1px solid #2a2a3a" } }} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/campeonatos" element={<Campeonatos />} />
        <Route path="/xtreinos" element={<XTreinos />} />

        {/* SCRIMS UNIFICADO: O Hub cuida de /scrims, /scrims/agendados, /rankings/scrims/* */}
        <Route path="/scrims/*" element={<ScrimsHub />} />
        <Route path="/rankings/scrims/*" element={<ScrimsHub />} />
        <Route path="/scrims/match/:id" element={<MatchResult />} />

        {/* Rankings (X-Treinos) */}
        <Route path="/rankings" element={<Rankings />}>
          <Route path=":tab" element={<Rankings />} />
        </Route>

        <Route path="/clans" element={<Clans />}>
          <Route path=":clanId" element={<ClanDetail />} />
          <Route path=":clanId/line/:teamId" element={<TeamDetail />} />
          <Route path=":clanId/line/:teamId/jogador/:playerId" element={<PlayerDetail />} />
        </Route>

        <Route path="/jogadores" element={<Jogadores />} />
        <Route path="/jogador/:id" element={<JogadorDetalhe />} />

        <Route path="/inscricoes" element={<Inscricoes />} />
        <Route path="/salinhas" element={<Salinhas />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/experience" element={<ExperiencePage />} />
        <Route path="/salinhas/perlotti" element={<SalinhaPerlotti />} />
      </Routes>
    </>
  );
}