import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Crosshair, Shield, Globe, Cpu } from 'lucide-react';
import { ScrambleText } from '../../pages/Experience/Effects';

const features = [
  { icon: Crosshair, title: "Precisão Cirúrgica", desc: "Estatísticas milimétricas que revelam o verdadeiro potencial de cada jogador e equipe no cenário competitivo." },
  { icon: Shield, title: "Infraestrutura Sólida", desc: "Tecnologia de ponta garantindo estabilidade, velocidade e segurança absoluta dos dados." },
  { icon: Globe, title: "Cenário Conectado", desc: "Uma rede unindo jogadores, times e organizações em um ecossistema vivo e integrado." },
  { icon: Cpu, title: "Inteligência Aplicada", desc: "Algoritmos próprios para pontuação, ranking e análise de desempenho evolutiva." },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
};

export function FeaturesGridAnimated() {
  const [scrambleTriggers, setScrambleTriggers] = useState<boolean[]>(new Array(features.length).fill(false));

  return (
    <motion.div 
      variants={containerVariants} initial="hidden" whileInView="show" 
      viewport={{ once: true, amount: 0.2 }} 
      onViewportEnter={() => features.forEach((_, i) => setTimeout(() => setScrambleTriggers(prev => { const n = [...prev]; n[i] = true; return n; }), i * 150))} 
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
    >
      {features.map((f, i) => {
        const Icon = f.icon;
        return (
          <motion.div key={f.title} variants={itemVariants} whileHover={{ y: -5 }} className="group relative h-full">
            <div className="absolute -inset-[1px] rounded-2xl bg-conic-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-spin-slow blur-[1px]" />
            <div className="relative h-full bg-[#0a0a0f] rounded-2xl p-5 sm:p-6 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-transparent group-hover:from-emerald-500/5 transition-all duration-500" />
              <div className="relative z-10">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-300">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
                </div>
                <h3 className="text-[#f0f0f5] font-bold text-base sm:text-lg mb-2 group-hover:text-emerald-400 transition-colors font-mono">
                  <ScrambleText text={f.title} trigger={scrambleTriggers[i]} />
                </h3>
                <p className="text-[#5a5a6e] text-xs sm:text-sm leading-relaxed">{f.desc}</p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}