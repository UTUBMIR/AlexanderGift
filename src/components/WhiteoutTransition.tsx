import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  onComplete: () => void;
  holdDuration?: number;
  fadeDuration?: number;
}

export function WhiteoutTransition({ onComplete, holdDuration = 1.5, fadeDuration = 1 }: Props) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShow(false), holdDuration * 1000);
    return () => clearTimeout(t);
  }, [holdDuration]);

  useEffect(() => {
    if (!show) {
      const t = setTimeout(onComplete, fadeDuration * 1000);
      return () => clearTimeout(t);
    }
  }, [show, onComplete, fadeDuration]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: '#fff',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: fadeDuration }}
        />
      )}
    </AnimatePresence>
  );
}
