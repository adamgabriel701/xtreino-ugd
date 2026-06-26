import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { useCallback, useMemo } from "react";

export function useClanNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // CORREÇÃO: Desestruturando a tupla [searchParams, setSearchParams] do React Router v7
  const [searchParams] = useSearchParams();

  const selectedClan = useMemo(() => searchParams.get("clan") ? parseInt(searchParams.get("clan")!) : null, [searchParams]);
  const selectedTeam = useMemo(() => searchParams.get("team") ? parseInt(searchParams.get("team")!) : null, [searchParams]);
  const selectedPlayer = useMemo(() => searchParams.get("player"), [searchParams]);

  const updateParams = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    navigate(`${location.pathname}?${params.toString()}`, { replace: false });
  }, [navigate, location.pathname, searchParams]);

  const navigateToClan = (clanId: number) => updateParams({ clan: clanId.toString(), team: null, player: null });
  const navigateToTeam = (teamId: number) => updateParams({ team: teamId.toString(), player: null });
  const navigateToPlayer = (playerNickname: string) => updateParams({ player: playerNickname });

  const goBack = () => {
    if (selectedPlayer) updateParams({ player: null });
    else if (selectedTeam) updateParams({ team: null });
    else if (selectedClan) updateParams({ clan: null });
  };

  const reset = () => navigate(location.pathname);

  return { selectedClan, selectedTeam, selectedPlayer, navigateToClan, navigateToTeam, navigateToPlayer, goBack, reset };
}