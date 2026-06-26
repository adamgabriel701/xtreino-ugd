import { motion, type Variants } from 'framer-motion';
import { Shield, Crosshair, Globe, Cpu } from 'lucide-react';

const features = [
  { icon: Crosshair, title: "Precisão Cirúrgica", desc: "Estatísticas milimétricas que revelam o verdadeiro potencial de cada jogador e equipe." },
  { icon: Shield, title: "Infraestrutura Sólida", desc: "Tecnologia de ponta garantindo estabilidade, velocidade e segurança de dados." },
  { icon: Globe, title: "Cenário Conectado", desc: "Uma rede unindo jogadores, times e organizações em um ecossistema vivo." },
  { icon: Cpu, title: "Inteligência Aplicada", desc: "Algoritmos próprios para pontuação, ranking e análise de desempenho evolutiva." },
];

// CORREÇÃO: Usamos "as const" para o TypeScript aceitar a string do 'ease'
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: "easeOut" as const } 
  }
};

export function HeroText() {
  return (
    <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" as const }}
        className="mb-6"
      >
        <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
          A Nova Era do E-sports Mobile
        </span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2, ease: "easeOut" as const }}
        className="text-5xl sm:text-7xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter mb-8"
        style={{ textShadow: "0 0 60px rgba(16, 185, 129, 0.4)" }}
      >
        MAIS QUE UM <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-500">
          JOGO.
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" as const }}
        className="text-lg md:text-xl text-[#6a6a7e] max-w-2xl mx-auto"
      >
        Uma experiência imersiva onde dados, competição e tecnologia se encontram para redefinir o cenário competitivo.
      </motion.p>

      {/* Indicador de scroll animado */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-[-80px] left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[#3a3a4e] text-xs tracking-widest uppercase">Explore</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" as const }}
          className="w-5 h-8 border-2 border-[#3a3a4e] rounded-full flex justify-center pt-1.5"
        >
          <div className="w-1 h-2 bg-emerald-500 rounded-full" />
        </motion.div>
      </motion.div>
    </div>
  );
}

export function FeaturesGrid() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {features.map((feature) => {
        const Icon = feature.icon;
        return (
          <motion.div
            key={feature.title}
            variants={itemVariants}
            className="group relative bg-[#12121a]/60 backdrop-blur-sm border border-white/5 rounded-2xl p-6 hover:border-emerald-500/40 transition-all duration-500 hover:shadow-[0_0_40px_rgba(16,185,129,0.1)] overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-transparent group-hover:from-emerald-500/5 transition-all duration-500" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-300">
                <Icon className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-[#f0f0f5] font-bold text-lg mb-2 group-hover:text-emerald-400 transition-colors">{feature.title}</h3>
              <p className="text-[#5a5a6e] text-sm leading-relaxed">{feature.desc}</p>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

export function MantraSection() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" as const }}
      viewport={{ once: true }}
      className="text-center py-24 relative"
    >
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <h2 className="text-[10vw] md:text-[8vw] font-black text-[#12121a] select-none" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.05)' }}>
          EVOLUÇÃO
        </h2>
      </div>
      <div className="relative z-10">
        <p className="text-3xl md:text-5xl font-bold text-[#f0f0f5] leading-tight max-w-4xl mx-auto">
          Não acompanhamos tendências. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-white">
          Nós criamos o futuro.</span>
        </p>
      </div>
    </motion.div>
  );
}