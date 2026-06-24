// ==================== SOBRE PAGE ====================
import { Link } from "react-router";
import {
  Users,
  Shield,
  Crown,
  Palette,
  Heart,
  Target,
  Trophy,
  Star,
  ChevronRight,
  Gamepad2,
  Zap,
  Globe,
  Award,
  Handshake,
  Code2,
  Sparkles,
  Flame,
  Eye,
  Rocket,
  ShieldCheck,
  UsersRound,
  type LucideProps,
} from "lucide-react";
import MainLayout from "@/layout/MainLayout";
import type { ForwardRefExoticComponent, RefAttributes } from "react";

type LucideIcon = ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;

interface TeamMember {
  name: string;
  role: string;
  description: string;
  icon: LucideIcon;
  color: string;
  tiktok?: string;
  youtube?: string;
  clan?: string;
  nick?: string;
}

interface Partner {
  name: string;
  type: string;
  status: "ativo" | "em_breve";
}

// ==================== COMPONENTES DE UI ====================

const RoleCard = ({ member, featured = false }: { member: TeamMember; featured?: boolean }) => {
  const Icon = member.icon;
  return (
    <div className={`relative rounded-xl border p-6 transition-all duration-300 hover:-translate-y-1 group overflow-hidden ${
      featured
        ? "bg-gradient-to-br from-[#12121a] to-[#0f0f16] border-emerald-500/30 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10"
        : "bg-[#12121a] border-[#2a2a3a] hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5"
    }`}>
      {/* Efeito de brilho no hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:to-transparent transition-all duration-500 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-14 h-14 rounded-xl ${member.color} flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[#f0f0f5] font-bold text-lg truncate">{member.name}</h3>
            <p className="text-emerald-400 text-sm font-medium">{member.role}</p>
          </div>
        </div>
        <p className="text-[#8a8a9e] text-sm leading-relaxed">{member.description}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {member.nick && (
            <span className="text-xs px-2.5 py-1 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#8a8a9e]">
              🎮 {member.nick}
            </span>
          )}
          {member.clan && (
            <span className="text-xs px-2.5 py-1 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-[#8a8a9e]">
              🏴 {member.clan}
            </span>
          )}
          {member.tiktok && (
            <a
              href={`https://tiktok.com/${member.tiktok}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-2.5 py-1 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-colors"
            >
              🎵 TT: {member.tiktok}
            </a>
          )}
          {member.youtube && (
            <a
              href={`https://youtube.com/${member.youtube}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-2.5 py-1 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-colors"
            >
              🎬 YT: {member.youtube}
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

const StatHighlight = ({ value, label, icon: Icon, suffix = "" }: { value: string; label: string; icon: LucideIcon; suffix?: string }) => (
  <div className="text-center group">
    <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all duration-300">
      <Icon className="w-6 h-6 text-emerald-400" />
    </div>
    <p className="text-3xl font-bold text-[#f0f0f5] mb-1 tabular-nums">{value}<span className="text-emerald-400">{suffix}</span></p>
    <p className="text-[#8a8a9e] text-sm">{label}</p>
  </div>
);

const PartnerCard = ({ partner }: { partner: Partner }) => (
  <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-5 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1 group">
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all duration-300">
        <Handshake className="w-6 h-6 text-emerald-400" />
      </div>
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
        partner.status === "ativo"
          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          : "bg-[#1a1a24] text-[#5a5a6e] border border-[#2a2a3a]"
      }`}>
        {partner.status === "ativo" ? "✓ Ativo" : "⏳ Em Breve"}
      </span>
    </div>
    <h4 className="text-[#f0f0f5] font-bold text-sm group-hover:text-emerald-400 transition-colors">{partner.name}</h4>
    <p className="text-[#5a5a6e] text-xs mt-1">{partner.type}</p>
  </div>
);

// ==================== PÁGINA SOBRE ====================

export default function Sobre() {
  const teamMembers: TeamMember[] = [
    {
      name: "Edgar Lira (Ed)",
      role: "Fundador & Dono da Underground",
      description: "Responsável pela direção estratégica e visão geral da UGD. Gerencia as inscrições das equipes nos xtreinos e garante que tudo funcione perfeitamente.",
      icon: Crown,
      color: "bg-gradient-to-br from-amber-500 to-amber-700",
      nick: "A-Train da UGD",
      tiktok: "@edgarlira9",
    },
    {
      name: "Sant",
      role: "CEO da Underground",
      description: "CEO da UGD, responsável pela organização das equipes nos xtreinos e pela gestão estratégica das operações do clã.",
      icon: Shield,
      color: "bg-gradient-to-br from-emerald-500 to-emerald-700",
      tiktok: "@playersnt",
    },
    {
      name: "Kaze",
      role: "Administrador & Tabelas",
      description: "Um dos administradores da UGD. Especialista na criação e manutenção das tabelas dos xtreinos, garantindo organização nos resultados.",
      icon: Target,
      color: "bg-gradient-to-br from-blue-500 to-blue-700",
      tiktok: "@ugdkaze",
      youtube: "@KazeFpsBloodStrike",
    },
    {
      name: "Neto Aguiar",
      role: "Administrador & Designer",
      description: "Administrador da K4F. Responsável pela identidade visual, arte, banners e thumbnails da organização.",
      icon: Palette,
      color: "bg-gradient-to-br from-purple-500 to-purple-700",
      clan: "K4F",
      tiktok: "@netinhoaguiar0",
    },
    {
      name: "Adam (Ares/Cool)",
      role: "Líder UGD Threat & Desenvolvedor",
      description: "Líder da line UGD Threat, administrador da Underground, organizador de xtreinos, desenvolvedor e mantenedor do site, designer web e patrocinador da organização.",
      icon: Code2,
      color: "bg-gradient-to-br from-rose-500 to-rose-700",
      nick: "Ares/Cool",
      tiktok: "@aresz.bs0",
    },
  ];

  const futureRoles: TeamMember[] = [
    {
      name: "Patrocinadores",
      role: "Apoio Financeiro",
      description: "Empresas e marcas que acreditam no nosso projeto e apoiam com recursos para premiações, infraestrutura e crescimento da comunidade.",
      icon: Award,
      color: "bg-gradient-to-br from-blue-500 to-blue-700",
    },
    {
      name: "Clãs Parceiros",
      role: "Colaboração",
      description: "Outras organizações e comunidades que colaboram conosco em eventos, trocam experiências e fortalecem o cenário mobile competitivo.",
      icon: Users,
      color: "bg-gradient-to-br from-rose-500 to-rose-700",
    },
  ];

  const partners: Partner[] = [
    { name: "UGD Esports", type: "Clã Principal", status: "ativo" },
    { name: "K4F", type: "Clã Parceiro", status: "ativo" },
    { name: "Em Breve", type: "Patrocinador", status: "em_breve" },
  ];

  const values = [
    { icon: ShieldCheck, title: "Transparência", description: "Todos os resultados e decisões são públicos e acessíveis." },
    { icon: Flame, title: "Competitividade", description: "Buscamos sempre o nível mais alto de competição." },
    { icon: UsersRound, title: "Comunidade", description: "Construímos um ambiente acolhedor para todos." },
    { icon: Rocket, title: "Inovação", description: "Sempre buscando melhorar nossas ferramentas e processos." },
    { icon: Eye, title: "Profissionalismo", description: "Organização séria e comprometida com o cenário." },
    { icon: Heart, title: "Paixão", description: "Amamos o que fazemos e isso se reflete em tudo." },
  ];

  const timeline = [
    { title: "O Início", description: "Grupo de amigos começou a organizar salinhas competitivas.", phase: "Fase 1" },
    { title: "Fundação da UGD", description: "A Underground foi oficialmente criada com estrutura e regras.", phase: "Fase 2" },
    { title: "Primeiros XTreinos", description: "Início dos xtreinos regulares com tabelas e resultados.", phase: "Fase 3" },
    { title: "Expansão", description: "Novos clãs parceiros e crescimento da comunidade.", phase: "Fase 4" },
    { title: "Temporada 2026", description: "Campeonatos, site próprio e profissionalização total.", phase: "Atual" },
  ];

  return (
    <MainLayout>
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        @keyframes shimmer-text {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
      `}</style>

      {/* Hero Section */}
      <section className="relative min-h-[45vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/20 via-transparent to-[#0a0a0f]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.1)_0%,_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(16,185,129,0.05)_0%,_transparent_50%)]" />

        {/* Partículas */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[
            { top: "20%", left: "15%", size: 3, delay: 0, dur: 5 },
            { top: "30%", right: "20%", size: 2, delay: 1, dur: 4 },
            { top: "60%", left: "30%", size: 2.5, delay: 2, dur: 6 },
            { top: "50%", right: "10%", size: 1.5, delay: 0.5, dur: 4.5 },
            { top: "70%", left: "50%", size: 2, delay: 1.5, dur: 5.5 },
          ].map((p, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-emerald-400/20"
              style={{
                top: p.top, left: p.left, right: p.right,
                width: p.size, height: p.size,
                animation: `float ${p.dur}s ease-in-out ${p.delay}s infinite`,
              }}
            />
          ))}
          <style>{`
            @keyframes float {
              0%, 100% { transform: translateY(0px) scale(1); opacity: 0.2; }
              50% { transform: translateY(-12px) scale(1.4); opacity: 0.6; }
            }
          `}</style>
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6 backdrop-blur-sm">
            <Sparkles className="w-4 h-4" />
            Conheça nossa história
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white via-emerald-100 to-emerald-400 bg-clip-text text-transparent">
              Underground
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-[#8a8a9e] mb-4 max-w-2xl mx-auto leading-relaxed">
            Somos uma organização dedicada ao cenário competitivo mobile.
          </p>
          <p className="text-base text-[#6a6a7e] max-w-xl mx-auto">
            Nosso objetivo é criar o melhor ambiente para xtreinos, campeonatos e scrims
            com profissionalismo e paixão pelo game.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-[#2a2a3a] bg-[#12121a]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatHighlight value="50+" label="XTreinos Realizados" icon={Gamepad2} />
            <StatHighlight value="20+" label="Equipes Ativas" icon={Users} />
            <StatHighlight value="100+" label="Jogadores" icon={Star} />
            <StatHighlight value="10+" label="Campeonatos" icon={Trophy} />
          </div>
        </div>
      </section>

      {/* Nossa História com Timeline */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-8 bg-emerald-500 rounded-full" />
              <h2 className="text-2xl font-bold text-[#f0f0f5]">Nossa História</h2>
            </div>
            <div className="space-y-5 text-[#8a8a9e] leading-relaxed">
              <p>
                A <span className="text-emerald-400 font-semibold">Underground (UGD)</span> nasceu da paixão de um grupo de jogadores
                que queriam levar o cenário mobile a sério. O que começou como salinhas entre amigos
                evoluiu para uma organização completa de xtreinos e campeonatos.
              </p>
              <p>
                Hoje, somos referência em organização de eventos competitivos mobile,
                oferecendo uma plataforma completa para equipes e jogadores acompanharem
                seus resultados, rankings e evolução no cenário.
              </p>
              <p>
                Nosso compromisso é com a <span className="text-emerald-400 font-semibold">transparência</span>,
                <span className="text-emerald-400 font-semibold"> competitividade</span> e
                <span className="text-emerald-400 font-semibold"> diversão</span>.
                Acreditamos que o cenário mobile tem potencial enorme e trabalhamos todos os dias
                para torná-lo cada vez mais profissional.
              </p>
            </div>
          </div>

          {/* Timeline Visual */}
          <div className="bg-[#12121a] rounded-2xl border border-[#2a2a3a] p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Rocket className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-[#f0f0f5]">Nossa Jornada</h3>
            </div>
            <div className="space-y-0">
              {timeline.map((item, idx) => {
                const isLast = idx === timeline.length - 1;
                const isCurrent = item.phase === "Atual";
                return (
                  <div key={idx} className="flex gap-4 group">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                        isCurrent
                          ? "bg-emerald-500/20 border-2 border-emerald-500 shadow-lg shadow-emerald-500/20"
                          : "bg-[#1a1a24] border-2 border-[#2a2a3a] group-hover:border-emerald-500/30"
                      }`}>
                        {isCurrent ? (
                          <Sparkles className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <span className="text-xs font-bold text-[#5a5a6e] group-hover:text-emerald-400 transition-colors">{idx + 1}</span>
                        )}
                      </div>
                      {!isLast && <div className={`w-px flex-1 my-1 min-h-[24px] ${isCurrent ? "bg-emerald-500/30" : "bg-[#2a2a3a]"}`} />}
                    </div>
                    <div className={`pb-6 ${isLast ? "pb-0" : ""}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-bold text-sm ${isCurrent ? "text-emerald-400" : "text-[#f0f0f5] group-hover:text-emerald-400"} transition-colors`}>{item.title}</h4>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isCurrent ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-[#1a1a24] text-[#5a5a6e] border border-[#2a2a3a]"
                        }`}>
                          {item.phase}
                        </span>
                      </div>
                      <p className="text-[#5a5a6e] text-sm leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Nossos Valores */}
      <section className="border-y border-[#2a2a3a] bg-[#0d0d14]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-16">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-4">
              <Heart className="w-4 h-4" />
              O que nos move
            </div>
            <h2 className="text-2xl font-bold text-[#f0f0f5]">Nossos Valores</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <div key={value.title} className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-6 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1 group">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all duration-300">
                    <Icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-[#f0f0f5] font-bold text-base mb-2 group-hover:text-emerald-400 transition-colors">{value.title}</h3>
                  <p className="text-[#5a5a6e] text-sm leading-relaxed">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Nossos Objetivos */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1 h-8 bg-emerald-500 rounded-full" />
          <h2 className="text-2xl font-bold text-[#f0f0f5]">Nossos Objetivos</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { text: "Ser a principal referência de xtreinos mobile do cenário", icon: Target },
            { text: "Criar um ambiente justo e competitivo para todas as equipes", icon: ShieldCheck },
            { text: "Desenvolver talentos e ajudar jogadores a evoluírem", icon: Rocket },
            { text: "Profissionalizar a organização de eventos mobile", icon: Award },
            { text: "Construir uma comunidade forte e unida", icon: UsersRound },
            { text: "Expandir para novos jogos e modalidades", icon: Gamepad2 },
          ].map((goal, idx) => {
            const Icon = goal.icon;
            return (
              <div key={idx} className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-5 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-0.5 group flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                  <Icon className="w-5 h-5 text-emerald-400" />
                </div>
                <p className="text-[#8a8a9e] text-sm leading-relaxed pt-2">{goal.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Equipe */}
      <section className="border-t border-[#2a2a3a] bg-[#0d0d14]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-16">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-4">
              <Crown className="w-4 h-4" />
              A equipe por trás de tudo
            </div>
            <h2 className="text-2xl font-bold text-[#f0f0f5]">Nossa Equipe</h2>
          </div>

          {/* Fundador em destaque */}
          <div className="mb-8 max-w-lg mx-auto">
            <RoleCard member={teamMembers[0]} featured />
          </div>

          {/* Restante da equipe */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
            {teamMembers.slice(1).map((member) => (
              <RoleCard key={member.name} member={member} />
            ))}
          </div>

          {/* Em Breve */}
          <div className="flex items-center gap-3 mb-8 mt-12">
            <div className="w-1 h-8 bg-amber-500/50 rounded-full" />
            <h2 className="text-xl font-bold text-[#f0f0f5]">Vagas Abertas</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">Recrutando</span>
          </div>

          <div className="grid md:grid-cols-2 gap-5 mb-16">
            {futureRoles.map((member) => (
              <RoleCard key={member.name} member={member} />
            ))}
          </div>

          {/* Parceiros */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-8 bg-emerald-500 rounded-full" />
            <h2 className="text-2xl font-bold text-[#f0f0f5]">Parceiros & Colaboradores</h2>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {partners.map((partner) => (
              <PartnerCard key={partner.name} partner={partner} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-emerald-900/20 via-[#12121a] to-emerald-900/20 rounded-2xl border border-emerald-500/20 p-8 md:p-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.1)_0%,_transparent_70%)]" />
          <div className="absolute top-0 right-1/3 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-36 h-36 bg-emerald-500/5 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6 animate-float-slow">
              <Zap className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#f0f0f5] mb-3">
              Quer fazer parte da UGD?
            </h2>
            <p className="text-[#8a8a9e] mb-8 max-w-lg mx-auto leading-relaxed">
              Seja como jogador, organizador ou parceiro, temos espaço para quem
              quer ajudar a construir o melhor cenário mobile competitivo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/clans"
                className="px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-all duration-200 hover:scale-[1.03] shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
              >
                <Users className="w-4 h-4" />
                Junte-se a uma Equipe
              </Link>
              <Link
                to="/xtreinos"
                className="px-8 py-3.5 rounded-xl bg-[#1a1a24] border border-[#3a3a4e] text-[#f0f0f5] font-semibold hover:border-emerald-500/50 hover:text-emerald-400 hover:bg-[#12121a] transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Gamepad2 className="w-4 h-4" />
                Participar de XTreinos
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}