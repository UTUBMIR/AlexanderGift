import { motion } from 'motion/react';
import { CONFIG } from '../config';

interface Props {
  onNext?: () => void;
  showButton?: boolean;
  name?: string;
  shortName?: string;
  age?: number;
  binaryAge?: string;
  message?: string;
}

export function BirthdayMessage({ onNext, showButton = true, name, shortName, age, binaryAge, message }: Props) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 20,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 20, textAlign: 'center',
    }}>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', delay: 0.5, duration: 0.8 }}
        style={{
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(8px)',
          borderRadius: 24,
          padding: '40px 32px',
          maxWidth: 600,
          border: '1px solid rgba(255,215,0,0.3)',
        }}
      >
        <motion.h1
          className="text-glow"
          style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', marginBottom: 8, color: '#FFD700' }}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
        >
          З Днем Народження, {name ?? CONFIG.brotherName}!
        </motion.h1>

        <motion.p
          style={{
            fontSize: 'clamp(1rem, 3vw, 1.4rem)',
            lineHeight: 1.6,
            color: '#e0e0e0',
            maxWidth: 500,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          {message ?? CONFIG.message}
        </motion.p>

        <motion.p
          style={{
            fontSize: '0.9rem',
            color: '#aaa',
            marginTop: 8,
            fontFamily: 'monospace',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          {(shortName ?? CONFIG.shortName)}, тобі вже {age ?? CONFIG.age} років ({binaryAge ?? CONFIG.binaryAge}₂)
        </motion.p>

        {showButton && onNext && (
          <motion.button
            className="btn-primary"
            onClick={onNext}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ marginTop: 24 }}
          >
            Далі →
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}

export function AgeMessage() {
  return (
    <div style={{
      position: 'fixed', bottom: 40, left: 0, right: 0,
      zIndex: 20, textAlign: 'center',
    }}>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 1 }}
        style={{
          fontSize: 'clamp(1.4rem, 4vw, 2.2rem)',
          color: '#FFD700',
          fontFamily: 'monospace',
          textShadow: '0 0 20px rgba(255,215,0,0.5)',
        }}
      >
        {CONFIG.age} років / {CONFIG.binaryAge}₂
      </motion.p>
    </div>
  );
}
