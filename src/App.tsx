import { useState, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence } from 'motion/react';
import { Scene0_Explosion } from './scenes/Scene0_Explosion';
import { Scene2_Wormhole } from './scenes/Scene2_Wormhole';
import { Scene3_Grass } from './scenes/Scene3_Grass';
import { Scene4_EarthApproach } from './scenes/Scene4_EarthApproach';
import { Scene5_Forest } from './scenes/Scene5_Forest';
import { WhiteoutTransition } from './components/WhiteoutTransition';
import { audioEngine } from './audio/AudioEngine';
import { preAnalyzeBeats } from './audio/BeatAnalyzer';

type Scene = 'start' | 'loading' | 'explosion' | 'whiteout1' | 'grass' | 'earth' | 'whiteout2' | 'forest';

export default function App() {
  const [scene, setScene] = useState<Scene>('start');
  const [loadingStatus, setLoadingStatus] = useState('Ініціалізація...');
  const initRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleStart = useCallback(async () => {
    try {
      await audioEngine.startAudioContext();
    } catch { }
    setScene('loading');

    if (initRef.current) return;
    initRef.current = true;

    setLoadingStatus('Завантаження аудіо...');

    (async () => {
      try {
        await audioEngine.init();
      } catch {
      }

      try {
        setLoadingStatus('Завантаження аудіо...');
        await audioEngine.loadRoyalty('./royalty.mp3');

        const cacheKey = 'beatcache_royalty';
        const cached = localStorage.getItem(cacheKey);
        let beats: number[] | null = null;

        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed.beats)) beats = parsed.beats;
          } catch { localStorage.removeItem(cacheKey); }
        }

        if (beats) {
          audioEngine.setBeatTimestamps(beats);
        } else {
          setLoadingStatus('Аналіз музики...');
          const beatInfo = await preAnalyzeBeats('./royalty.mp3');
          audioEngine.setBeatTimestamps(beatInfo.beats);
          try {
            localStorage.setItem(cacheKey, JSON.stringify({ beats: beatInfo.beats, bpm: beatInfo.bpm }));
          } catch {}
        }
      } catch {
      }

      setLoadingStatus('Майже готово...');
      timeoutRef.current = setTimeout(() => {
        setScene('explosion');
      }, 500);
    })();
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleExplosionNext = useCallback(() => {
    audioEngine.playTransition();
    audioEngine.startMusic();
    setScene('whiteout1');
  }, []);

  const handleWhiteout1Complete = useCallback(() => {
    // whiteout overlay done — wormhole continues underneath
  }, []);

  const handleWormholeComplete = useCallback(() => {
    setScene('grass');
  }, []);

  const handleGrassComplete = useCallback(() => {
    setScene('earth');
  }, []);

  const handleEarthComplete = useCallback(() => {
    setScene('whiteout2');
  }, []);

  const handleWhiteout2Complete = useCallback(() => {
    audioEngine.setVolumeRamp(-6, 5);
    setScene('forest');
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden', background: '#000' }}>
      <AnimatePresence mode="wait">
        {scene === 'start' && (
          <div key="start" style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#000', zIndex: 100, gap: 24 }}>
            <div style={{ color: '#FFD700', fontSize: '1.8rem', fontFamily: 'Georgia, serif', textShadow: '0 0 20px #FFD700AA' }}>
              🎂
            </div>
            <button
              onClick={handleStart}
              className="btn-primary"
              style={{ fontSize: '1.3rem', padding: '14px 40px', cursor: 'pointer' }}
            >
              Натисни, щоб почати
            </button>
            <div style={{ color: '#888', fontSize: '0.8rem', fontFamily: 'monospace' }}>
              (потрібен звук)
            </div>
          </div>
        )}

        {scene === 'loading' && (
          <div key="loading" style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#000', zIndex: 100, gap: 16 }}>
            <div style={{ color: '#FFD700', fontSize: '1.2rem', fontFamily: 'monospace' }}>{loadingStatus}</div>
            <div style={{ width: 200, height: 3, background: '#333', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: '60%', height: '100%', background: '#FFD700', borderRadius: 2, animation: 'loadingPulse 1.5s ease-in-out infinite' }} />
            </div>
            <style>{`@keyframes loadingPulse { 50% { width: 90% } }`}</style>
          </div>
        )}

        {scene === 'explosion' && (
          <Scene0_Explosion key="explosion" onNext={handleExplosionNext} />
        )}

        {scene === 'whiteout1' && (
          <div key="whiteout1" style={{ position: 'fixed', inset: 0 }}>
            <Scene2_Wormhole onComplete={handleWormholeComplete} />
            <WhiteoutTransition onComplete={handleWhiteout1Complete} />
          </div>
        )}

        {scene === 'grass' && (
          <Scene3_Grass key="grass" onComplete={handleGrassComplete} />
        )}

        {scene === 'earth' && (
          <Scene4_EarthApproach key="earth" onComplete={handleEarthComplete} />
        )}

        {scene === 'whiteout2' && (
          <WhiteoutTransition key="whiteout2" onComplete={handleWhiteout2Complete} />
        )}

        {scene === 'forest' && (
          <Scene5_Forest key="forest" />
        )}
      </AnimatePresence>
    </div>
  );
}
