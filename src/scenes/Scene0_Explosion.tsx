import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ConfettiLayer } from '../effects/ConfettiLayer';
import { ExplosionLayer, type ExplosionLayerHandle } from '../effects/ExplosionLayer';
import { BirthdayMessage } from '../ui/BirthdayMessage';
import { audioEngine } from '../audio/AudioEngine';

interface Props {
  onNext: () => void;
}

export function Scene0_Explosion({ onNext }: Props) {
  const [phase, setPhase] = useState<'black' | 'explosion' | 'show'>('black');
  const explosionRef = useRef<ExplosionLayerHandle>(null);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setPhase('explosion');
      explosionRef.current?.explode();
      audioEngine.playBirthdayMelody();
    }, 500);
    const t2 = setTimeout(() => setPhase('show'), 1500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const handleNext = useCallback(() => {
    audioEngine.playTransition();
    onNext();
  }, [onNext]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 1 }}
      >
        {phase !== 'black' && (
          <>
            <ExplosionLayer ref={explosionRef} />
            <ConfettiLayer />
          </>
        )}
        {phase === 'show' && (
          <BirthdayMessage onNext={handleNext} />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
