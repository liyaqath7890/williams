import { useCallback, useRef } from 'react';

export function useEmergencySiren() {
  const contextRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainRef = useRef(null);
  const intervalRef = useRef(null);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    oscillatorRef.current?.stop();
    oscillatorRef.current?.disconnect();
    gainRef.current?.disconnect();
    oscillatorRef.current = null;
    gainRef.current = null;
  }, []);

  const start = useCallback(() => {
    stop();

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const context = contextRef.current || new AudioContext();
    contextRef.current = context;

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sawtooth';
    oscillator.frequency.value = 620;
    gain.gain.value = 0.045;

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();

    let high = false;
    intervalRef.current = window.setInterval(() => {
      high = !high;
      oscillator.frequency.setTargetAtTime(high ? 920 : 520, context.currentTime, 0.08);
    }, 420);

    oscillatorRef.current = oscillator;
    gainRef.current = gain;
  }, [stop]);

  return { start, stop };
}
