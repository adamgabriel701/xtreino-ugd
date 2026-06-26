import type { LucideIcon } from "../types";

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

export default function RoleCard({ member, featured = false }: { member: TeamMember; featured?: boolean }) {
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
}