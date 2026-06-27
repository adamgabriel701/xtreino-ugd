import { Link, useLocation } from "react-router";
import {
  type LucideIcon,
  Home,
  Trophy,
  Dumbbell,
  Swords,
  Users,
  UserCircle,
  BarChart3,
  Shield,
  Gamepad2,
  Crown,
} from "lucide-react";
import { useIsMobile } from "../hooks/use-mobile";

interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

interface NavGroup {
  label: string;
  icon: LucideIcon;
  items: NavItem[];
}

export default function Navbar() {
  const location = useLocation();
  const isMobile = useIsMobile();

  const isActive = (path: string) => location.pathname === path;

  const mainLinks: NavItem[] = [
    { label: "Home", to: "/", icon: Home },
    { label: "Rankings", to: "/rankings", icon: BarChart3 },
    { label: "Sobre", to: "/sobre", icon: Shield },
  ];

  const eventosGroup: NavGroup = {
    label: "Eventos",
    icon: Trophy,
    items: [
      { label: "Campeonatos", to: "/campeonatos", icon: Trophy },
      { label: "XTreinos", to: "/xtreinos", icon: Dumbbell },
      { label: "Scrims", to: "/scrims", icon: Swords },
      { label: "Salinhas Premiadas", to: "/salinhas", icon: Gamepad2 },
    ],
  };

  const comunidadeGroup: NavGroup = {
    label: "Comunidade",
    icon: Users,
    items: [
      { label: "Clans", to: "/clans", icon: Crown },
      { label: "Jogadores", to: "/jogadores", icon: UserCircle },
    ],
  };

  // Verifica se algum item do grupo está ativo
  const isEventosActive = eventosGroup.items.some((item) => isActive(item.to));
  const isComunidadeActive = comunidadeGroup.items.some((item) => isActive(item.to));

  // Componente simples para renderizar os links (sem dropdown)
  const NavLink = ({ item }: { item: NavItem }) => {
    const ItemIcon = item.icon;
    const active = isActive(item.to);
    
    const classes = `flex items-center gap-2 text-sm font-medium transition-all duration-200 ${
      active
        ? "text-emerald-400 bg-emerald-500/10"
        : "text-[#8a8a9e] hover:text-[#f0f0f5] hover:bg-[#1a1a24]"
    }`;

    return (
      <Link to={item.to} className={isMobile ? `${classes} gap-3 px-4 py-3 rounded-xl` : `${classes} px-3 py-2 rounded-lg`}>
        <ItemIcon className={isMobile ? "w-5 h-5" : "w-4 h-4"} />
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-[#2a2a3a]">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <img
              src="/logo-xtreino.jpg"
              alt="XTreinos Logo"
              className="w-9 h-9 rounded-lg object-cover shadow-lg shadow-emerald-500/20"
              draggable={false}
              loading="eager"
            />
            <span className="font-bold text-lg text-[#f0f0f5] tracking-tight">
              Underground
            </span>
          </Link>

          {/* Desktop Navigation (Apenas links em linha) */}
          {!isMobile && (
            <div className="flex items-center gap-1">
              {mainLinks.map((link) => (
                <NavLink key={link.to} item={link} />
              ))}

              <div className="w-px h-6 bg-[#2a2a3a] mx-1" />

              {/* Eventos no Desktop */}
              {eventosGroup.items.map((item) => (
                <NavLink key={item.to} item={item} />
              ))}

              <div className="w-px h-6 bg-[#2a2a3a] mx-1" />

              {/* Comunidade no Desktop */}
              {comunidadeGroup.items.map((item) => (
                <NavLink key={item.to} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation (Lista simples sem botão) */}
      {isMobile && (
        <div className="border-t border-[#2a2a3a] bg-[#0a0a0f]/95 backdrop-blur-xl">
          <div className="px-4 py-3 space-y-1">
            {/* Links Principais */}
            {mainLinks.map((link) => (
              <NavLink key={link.to} item={link} />
            ))}

            {/* Sub-links de Eventos (Aparece apenas se a rota for de eventos) */}
            {isEventosActive && (
              <>
                <div className="my-2 border-t border-[#2a2a3a]" />
                <div className="px-4 py-2">
                  <p className="text-[#5a5a6e] text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Trophy className="w-3.5 h-3.5" />
                    Eventos
                  </p>
                  <div className="space-y-1 pl-2">
                    {eventosGroup.items.map((item) => (
                      <NavLink key={item.to} item={item} />
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Sub-links de Comunidade (Aparece apenas se a rota for de comunidade) */}
            {isComunidadeActive && (
              <>
                <div className="my-2 border-t border-[#2a2a3a]" />
                <div className="px-4 py-2">
                  <p className="text-[#5a5a6e] text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" />
                    Comunidade
                  </p>
                  <div className="space-y-1 pl-2">
                    {comunidadeGroup.items.map((item) => (
                      <NavLink key={item.to} item={item} />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}