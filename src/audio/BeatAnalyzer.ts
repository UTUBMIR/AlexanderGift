import { detect } from 'beat-detection';

export async function preAnalyzeBeats(url: string): Promise<{ beats: number[]; bpm: number }> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const audioCtx = new AudioContext();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  const samples = audioBuffer.getChannelData(0);
  const result = detect(samples, { fs: audioBuffer.sampleRate });
  audioCtx.close();
  return { beats: Array.from(result.beats), bpm: result.bpm };
}

export function findNearestBeat(beats: number[], targetTime: number): number {
  if (beats.length === 0) return targetTime;
  return beats.reduce((prev, curr) =>
    Math.abs(curr - targetTime) < Math.abs(prev - targetTime) ? curr : prev
  );
}
