import { trpc } from "@/providers/trpc";
import MainLayout from "@/layout/MainLayout";
import ClanList from "./components/ClanList";
import { Outlet } from "react-router-dom"; // Importante para rotas aninhadas

export default function Clans() {
  const { data: clansList, isLoading: clansLoading } = trpc.clans.list.useQuery();

  return (
    <MainLayout>
      {/* O Outlet renderiza o ClanDetail, TeamDetail ou PlayerDetail 
          dependendo da URL atual. Se for só /clas, ele não renderiza nada */}
      <Outlet />
      
      {/* A lista só é exibida se não houver um ID de clã na URL */}
      {!window.location.pathname.includes("/clas/") && (
        <ClanList 
          clans={clansList ?? []} 
          isLoading={clansLoading} 
          onClanClick={(id) => window.location.href = `/clas/${id}`} 
        />
      )}
    </MainLayout>
  );
}