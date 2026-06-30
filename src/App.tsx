import { Routes, Route } from "react-router";
import { Toaster } from "sonner";
import Home from "./pages/Home/page";
import Campeonatos from "./pages/Campeonatos";
import XTreinos from "./pages/XTreinos";
import Scrims from "./pages/Scrims/page";
import MatchResult from "./pages/Scrims/match/[id]/page"; // <-- NOVO IMPORT
import Rankings from "./pages/Rankings";
import Clans from "./pages/Clans";

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
        <Route path="/scrims/match/:id" element={<MatchResult />} /> {/* <-- NOVA ROTA */}
        <Route path="/rankings" element={<Rankings />} />
        <Route path="/clans" element={<Clans />} />

        <Route path="/jogadores" element={<Jogadores />} />
        <Route path="jogador/:id" element={<JogadorDetalhe />} />

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