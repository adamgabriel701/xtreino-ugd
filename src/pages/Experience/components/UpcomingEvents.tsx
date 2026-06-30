import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Users, Zap } from 'lucide-react';
import { MorphingNumber } from '../Effects';

// Dados mockados. Na vida real, virão do seu useExperienceData
const upcomingEvents = [
  { id: 1, title: "XTreino Qualifier #1025", type: "XTreino", targetDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000), participants: 120, maxParticipants: 150 },
  { id: 2, title: "Copa Elite - Fase Final", type: "Campeonato", targetDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000), participants: 16, maxParticipants: 16 },
  { id: 3, title: "Scrim Aberto de Sexta", type: "Scrim", targetDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), participants: 45, maxParticipants: 100 },
];

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="bg-[#0a0a0f] border border-white/10 rounded-lg px-3 py-2 min-w-[60px] mb-1">
        <MorphingNumber value={value} trigger={true} className="text-2xl font-black text-white justify-center" />
      </div>
      <span className="text-[10px] uppercase tracking-wider text-[#5a5a6e]">{label}</span>
    </div>
  );
}

function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}

function getTimeLeft(targetDate: Date) {
  const now = new Date().getTime();
  const distance = targetDate.getTime() - now;
  if (distance < 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((distance % (1000 * 60)) / 1000),
  };
}

function EventCard({ event, index }: { event: typeof upcomingEvents[0]; index: number }) {
  const timeLeft = useCountdown(event.targetDate);
  const isFull = event.participants >= event.maxParticipants;
  const fillPercentage = (event.participants / event.maxParticipants) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group relative bg-[#12121a]/60 backdrop-blur-sm border border-white/5 rounded-2xl p-5 hover:border-emerald-500/30 transition-all duration-300 flex flex-col sm:flex-row gap-5 items-start sm:items-center overflow-hidden"
    >
      {/* Brilho de fundo sutil */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 to-violet-500/0 group-hover:from-emerald-500/5 group-hover:to-violet-500/5 transition-all duration-500" />

      <div className="relative z-10 flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
            event.type === 'Campeonato' ? 'bg-violet-500/20 text-violet-400' : 
            event.type === 'Scrim' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-emerald-500/20 text-emerald-400'
          }`}>
            {event.type}
          </span>
          {isFull && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400">
              Lotado
            </span>
          )}
        </div>
        <h3 className="text-white font-bold text-base truncate mb-2 group-hover:text-emerald-400 transition-colors">
          {event.title}
        </h3>
        
        {/* Barra de progresso de vagas */}
        <div className="flex items-center gap-2 text-xs text-[#5a5a6e]">
          <Users className="w-3.5 h-3.5" />
          <div className="flex-1 h-1.5 bg-[#1a1a2e] rounded-full overflow-hidden max-w-[120px]">
            <motion.div 
              initial={{ width: 0 }} 
              whileInView={{ width: `${fillPercentage}%` }} 
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
              className={`h-full rounded-full ${isFull ? 'bg-red-500' : 'bg-emerald-500'}`} 
            />
          </div>
          <span>{event.participants}/{event.maxParticipants}</span>
        </div>
      </div>

      {/* Countdown */}
      <div className="relative z-10 flex items-center gap-2">
        <div className="flex gap-2">
          <TimeBlock value={timeLeft.days} label="Dias" />
          <span className="text-[#3a3a4e] text-xl font-bold mt-[-10px]">:</span>
          <TimeBlock value={timeLeft.hours} label="Hrs" />
          <span className="text-[#3a3a4e] text-xl font-bold mt-[-10px]">:</span>
          <TimeBlock value={timeLeft.minutes} label="Min" />
          <span className="text-[#3a3a4e] text-xl font-bold mt-[-10px] hidden sm:block">:</span>
          <div className="hidden sm:block">
            <TimeBlock value={timeLeft.seconds} label="Seg" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function UpcomingEvents() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
      className="relative z-20 bg-[#0a0a0f] px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-white/5"
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-[0.2em] uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              Não perca
            </span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            Próximos <span className="text-emerald-400">Eventos</span>
          </h2>
        </div>

        <div className="space-y-4">
          {upcomingEvents.map((event, i) => (
            <EventCard key={event.id} event={event} index={i} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}