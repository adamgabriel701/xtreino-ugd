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
  Menu,
  X,
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

  const isEventosActive = eventosGroup.items.some((item) => isActive(item.to));
  const isComunidadeActive = comunidadeGroup.items.some((item) => isActive(item.to));

  return (
    <>
      {/* CSS Necessário para o menu lateral funcionar sem bugs de layout */}
      <style>{`
        /* Esconde o checkbox original */
        #mobile-menu-toggle {
          display: none;
        }

        /* Estilo base da tela lateral (escondida fora da tela) */
        .mobile-menu-screen {
          position: fixed;
          top: 0;
          right: 0;
          width: 100%;
          max-width: 300px;
          height: 100dvh; /* 100% da altura visível no celular */
          background-color: #0a0a0f;
          border-left: 1px solid #2a2a3a;
          z-index: 100;
          transform: translateX(100%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow-y: auto;
          padding-top: 1rem;
        }

        /* Fundo escuro atrás do menu */
        .mobile-menu-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          z-index: 99;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }

        /* Quando o checkbox está marcado, abre tudo */
        #mobile-menu-toggle:checked ~ .mobile-menu-overlay {
          opacity: 1;
          pointer-events: auto;
        }

        #mobile-menu-toggle:checked ~ .mobile-menu-screen {
          transform: translateX(0);
        }
      `}</style>

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

            {/* Desktop Navigation */}
            {!isMobile && (
              <div className="flex items-center gap-1">
                {mainLinks.map((link) => {
                  const LinkIcon = link.icon;
                  const active = isActive(link.to);
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        active
                          ? "text-emerald-400 bg-emerald-500/10"
                          : "text-[#8a8a9e] hover:text-[#f0f0f5] hover:bg-[#1a1a24]"
                      }`}
                    >
                      <LinkIcon className="w-4 h-4" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}

                <div className="w-px h-6 bg-[#2a2a3a] mx-1" />

                {eventosGroup.items.map((item) => {
                  const ItemIcon = item.icon;
                  const active = isActive(item.to);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        active
                          ? "text-emerald-400 bg-emerald-500/10"
                          : "text-[#8a8a9e] hover:text-[#f0f0f5] hover:bg-[#1a1a24]"
                      }`}
                    >
                      <ItemIcon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}

                <div className="w-px h-6 bg-[#2a2a3a] mx-1" />

                {comunidadeGroup.items.map((item) => {
                  const ItemIcon = item.icon;
                  const active = isActive(item.to);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        active
                          ? "text-emerald-400 bg-emerald-500/10"
                          : "text-[#8a8a9e] hover:text-[#f0f0f5] hover:bg-[#1a1a24]"
                      }`}
                    >
                      <ItemIcon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Botão Direita para o Mobile */}
            {isMobile && (
              <label
                htmlFor="mobile-menu-toggle"
                className="flex items-center justify-center w-10 h-10 rounded-lg text-[#8a8a9e] hover:text-[#f0f0f5] hover:bg-[#1a1a24] transition-colors cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </label>
            )}
          </div>
        </div>
      </nav>

      {/* Estrutura do Menu Lateral Mobile (Fora da nav para não bugear o site) */}
      {isMobile && (
        <div>
          {/* Checkbox invisível que controla tudo */}
          <input type="checkbox" id="mobile-menu-toggle" />

          {/* Fundo escuro que fecha o menu ao clicar */}
          <label htmlFor="mobile-menu-toggle" className="mobile-menu-overlay" />

          {/* Tela lateral que desliza da direita */}
          <div className="mobile-menu-screen">
            <div className="flex items-center justify-between px-4 pb-4 mb-2 border-b border-[#2a2a3a]">
              <span className="font-bold text-[#f0f0f5]">Menu</span>
              <label
                htmlFor="mobile-menu-toggle"
                className="flex items-center justify-center w-8 h-8 rounded-lg text-[#8a8a9e] hover:text-[#f0f0f5] hover:bg-[#1a1a24] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </label>
            </div>

            <div className="px-4 py-2 space-y-1">
              {mainLinks.map((link) => {
                const LinkIcon = link.icon;
                const active = isActive(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => {
                      // Fecha o menu ao clicar no link
                      const checkbox = document.getElementById('mobile-menu-toggle') as HTMLInputElement;
                      if (checkbox) checkbox.checked = false;
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "text-[#8a8a9e] hover:text-[#f0f0f5] hover:bg-[#1a1a24]"
                    }`}
                  >
                    <LinkIcon className="w-5 h-5" />
                    {link.label}
                  </Link>
                );
              })}

              {/* Grupo Eventos */}
              <>
                <div className="my-3 border-t border-[#2a2a3a]" />
                <p className="text-[#5a5a6e] text-xs font-semibold uppercase tracking-wider mb-2 px-4 flex items-center gap-2">
                  <Trophy className="w-3.5 h-3.5" />
                  Eventos
                </p>
                {eventosGroup.items.map((item) => {
                  const ItemIcon = item.icon;
                  const active = isActive(item.to);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => {
                        const checkbox = document.getElementById('mobile-menu-toggle') as HTMLInputElement;
                        if (checkbox) checkbox.checked = false;
                      }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        active
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "text-[#8a8a9e] hover:text-[#f0f0f5] hover:bg-[#1a1a24]"
                      }`}
                    >
                      <ItemIcon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </>

              {/* Grupo Comunidade */}
              <>
                <div className="my-3 border-t border-[#2a2a3a]" />
                <p className="text-[#5a5a6e] text-xs font-semibold uppercase tracking-wider mb-2 px-4 flex items-center gap-2">
                  <Users className="w-3.5 h-3.5" />
                  Comunidade
                </p>
                {comunidadeGroup.items.map((item) => {
                  const ItemIcon = item.icon;
                  const active = isActive(item.to);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => {
                        const checkbox = document.getElementById('mobile-menu-toggle') as HTMLInputElement;
                        if (checkbox) checkbox.checked = false;
                      }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        active
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "text-[#8a8a9e] hover:text-[#f0f0f5] hover:bg-[#1a1a24]"
                      }`}
                    >
                      <ItemIcon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </>
            </div>
          </div>
        </div>
      )}
    </>
  );
}