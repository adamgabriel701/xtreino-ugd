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
  ChevronDown,
  Gamepad2,
  Crown,
} from "lucide-react";
import { useIsMobile } from "../hooks/use-mobile"; // Ajuste o caminho se necessário

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

  // Lógica para saber qual seção do mobile está ativa baseada na URL
  const isEventosActive = eventosGroup.items.some((item) => isActive(item.to));
  const isComunidadeActive = comunidadeGroup.items.some((item) => isActive(item.to));

  const DropdownMenu = ({ group }: { group: NavGroup }) => {
    const hasActiveChild = group.items.some((item) => isActive(item.to));
    const GroupIcon = group.icon;

    return (
      /* 
        Usamos um data-attribute com :has() no CSS puro do Tailwind.
        Isso evita qualquer "pulo" de layout causado pelo details nativo.
      */
      <div className="relative dropdown-group" data-dropdown={group.label}>
        <button
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
            hasActiveChild
              ? "text-emerald-400 bg-emerald-500/10"
              : "text-[#8a8a9e] hover:text-[#f0f0f5] hover:bg-[#1a1a24]"
          }`}
        >
          <GroupIcon className="w-4 h-4" />
          <span>{group.label}</span>
          <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 dropdown-arrow" />
        </button>

        {/* Desktop Dropdown */}
        <div className="dropdown-content absolute top-full right-0 mt-2 w-56 bg-[#12121a] border border-[#2a2a3a] rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50">
          <div className="p-1.5">
            {group.items.map((item) => {
              const ItemIcon = item.icon;
              const active = isActive(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                    active
                      ? "bg-emerald-500/10 text-emerald-400 font-semibold"
                      : "text-[#8a8a9e] hover:text-[#f0f0f5] hover:bg-[#1a1a24]"
                  }`}
                >
                  <ItemIcon className={`w-4 h-4 ${active ? "text-emerald-400" : "text-[#5a5a6e]"}`} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Estilos CSS para controlar o dropdown sem JavaScript e sem empurrar a tela */}
      <style>{`
        .dropdown-content {
          opacity: 0;
          transform: translateY(-10px);
          pointer-events: none;
          transition: opacity 0.2s ease, transform 0.2s ease;
        }

        /* Quando o container pai tiver a classe 'is-open', abre o menu */
        .dropdown-group.is-open .dropdown-content {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }

        /* Gira a setinha */
        .dropdown-group.is-open .dropdown-arrow {
          transform: rotate(180deg);
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

                <DropdownMenu group={eventosGroup} />
                <DropdownMenu group={comunidadeGroup} />
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobile && (
          <div className="border-t border-[#2a2a3a] bg-[#0a0a0f]/95 backdrop-blur-xl">
            <div className="px-4 py-3 space-y-1">
              {/* Links Principais sempre visíveis no mobile */}
              {mainLinks.map((link) => {
                const LinkIcon = link.icon;
                const active = isActive(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
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

              {/* Grupo Eventos - Abre automaticamente se a rota atual for de Eventos */}
              {isEventosActive && (
                <>
                  <div className="my-2 border-t border-[#2a2a3a]" />
                  <div className="px-4 py-2">
                    <p className="text-[#5a5a6e] text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Trophy className="w-3.5 h-3.5" />
                      Eventos
                    </p>
                    <div className="space-y-1 pl-2">
                      {eventosGroup.items.map((item) => {
                        const ItemIcon = item.icon;
                        const active = isActive(item.to);
                        return (
                          <Link
                            key={item.to}
                            to={item.to}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                              active
                                ? "text-emerald-400 bg-emerald-500/5 font-semibold"
                                : "text-[#8a8a9e] hover:text-[#f0f0f5]"
                            }`}
                          >
                            <ItemIcon className="w-4 h-4" />
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* Grupo Comunidade - Abre automaticamente se a rota atual for de Comunidade */}
              {isComunidadeActive && (
                <>
                  <div className="my-2 border-t border-[#2a2a3a]" />
                  <div className="px-4 py-2">
                    <p className="text-[#5a5a6e] text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Users className="w-3.5 h-3.5" />
                      Comunidade
                    </p>
                    <div className="space-y-1 pl-2">
                      {comunidadeGroup.items.map((item) => {
                        const ItemIcon = item.icon;
                        const active = isActive(item.to);
                        return (
                          <Link
                            key={item.to}
                            to={item.to}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                              active
                                ? "text-emerald-400 bg-emerald-500/5 font-semibold"
                                : "text-[#8a8a9e] hover:text-[#f0f0f5]"
                            }`}
                          >
                            <ItemIcon className="w-4 h-4" />
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Script ultra leve para alternar a classe 'is-open' sem usar estados do React */}
      <script>{`
        document.addEventListener('click', (e) => {
          // Fecha todos os dropdowns primeiro
          document.querySelectorAll('.dropdown-group.is-open').forEach(el => {
            el.classList.remove('is-open');
          });

          // Se clicou em um botão de dropdown, abre ele
          const btn = (e.target).closest('.dropdown-group button');
          if (btn) {
            e.stopPropagation();
            btn.closest('.dropdown-group').classList.toggle('is-open');
          }
        });
      `}</script>
    </>
  );
}