import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { createBlackHoleScene } from '../singularity/blackhole.js';

interface Props {
  onComplete: () => void;
}

export function Scene1_BlackHole({ onComplete }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let disposed = false;
    createBlackHoleScene(containerRef.current, () => {
      setTimeout(() => {
        if (!disposed) {
          if (cleanupRef.current) {
            cleanupRef.current();
            cleanupRef.current = null;
          }
          onComplete();
        }
      }, 8000);
    }).then((instance) => {
      if (disposed) {
        instance.dispose();
        return;
      }
      cleanupRef.current = instance.dispose;
    });

    return () => {
      disposed = true;
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, zIndex: 1, background: '#000' }}
      >
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      </motion.div>
    </AnimatePresence>
  );
}
