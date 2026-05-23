import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  onComplete: () => void;
  duration?: number;
}

export function PulseTransition({ onComplete, duration = 1.5 }: Props) {
  const [phase, setPhase] = useState<'white' | 'black' | 'done'>('white');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('black'), 100);
    const t2 = setTimeout(() => setPhase('done'), duration * 1000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [duration]);

  useEffect(() => {
    if (phase === 'done') onComplete();
  }, [phase, onComplete]);

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: phase === 'white' ? '#fff' : '#000',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </AnimatePresence>
  );
}
