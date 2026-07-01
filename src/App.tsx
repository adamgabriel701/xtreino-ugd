import { Routes, Route } from "react-router";
import { Toaster } from "sonner";
import Home from "./pages/Home/page";
import Campeonatos from "./pages/Campeonatos";
import XTreinos from "./pages/XTreinos";
import Scrims from "./pages/Scrims/page";
import MatchResult from "./pages/Scrims/match/[id]/page";
import Rankings from "./pages/Rankings";
import RankingScrims from "./pages/components/RankingScrims"; // NOVO

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
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/campeonatos" element={<Campeonatos />} />
        <Route path="/xtreinos" element={<XTreinos />} />

        <Route path="/scrims" element={<Scrims />} />
        <Route path="/scrims/match/:id" element={<MatchResult />} />

        {/* Rankings */}
        <Route path="/rankings" element={<Rankings />}>
          <Route path=":tab" element={<Rankings />} />
        </Route>
        
        {/* NOVA ROTA ISOLADA PARA O RANKING DE SCRIMS */}
        <Route path="/rankings/scrims/:tab" element={<RankingScrims />} />

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

        {/* Salinha Routes */}
        <Route path="/salinhas/perlotti" element={<SalinhaPerlotti />} />
      </Routes>
    </>
  );
}