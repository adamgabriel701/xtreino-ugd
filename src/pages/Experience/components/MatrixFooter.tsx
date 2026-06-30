import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Shield, Globe } from 'lucide-react';

export function MatrixFooter() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const words = ['KILL', 'WIN', 'TOP 1', 'ACE', 'DATA', 'RANK', '1337', '01100', 'XTREINO', '#FF0000'];
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = 'rgba(10, 10, 15, 0.1)'; // Rastro que some
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#10b981'; // Cor esmeralda
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = words[Math.floor(Math.random() * words.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 50);

    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <footer className="relative z-20 bg-[#080810] border-t border-white/5 overflow-hidden h-[300px] sm:h-[400px]">
      {/* Canvas de Fundo */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-30" />
      
      {/* Gradiente escuro para sobrepor o canvas e permitir leitura */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#080810] via-transparent to-[#080810]/80 pointer-events-none" />

      {/* Conteúdo do Footer */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-4">
            Construído para <span className="text-emerald-400">Dominar.</span>
          </h3>
          <p className="text-[#5a5a6e] text-sm max-w-md mx-auto mb-8">
            Infraestrutura de ponta, dados incontestáveis e a comunidade mais competitiva do cenário mobile.
          </p>
          
          <div className="flex items-center justify-center gap-6 text-[#3a3a4e]">
            <div className="flex items-center gap-2 text-xs hover:text-emerald-400 transition-colors cursor-pointer">
              <Shield className="w-4 h-4" />
              <span>Termos</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-[#2a2a3e]" />
            <div className="flex items-center gap-2 text-xs hover:text-emerald-400 transition-colors cursor-pointer">
              <Globe className="w-4 h-4" />
              <span>Contato</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-[#2a2a3e]" />
            <span className="text-xs">© 2024 Xtreino UGD</span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}