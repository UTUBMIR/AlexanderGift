import * as Tone from 'tone';

export class AudioEngine {
  player: Tone.Player | null = null;
  fft: Tone.FFT | null = null;
  private _isInitialized = false;
  private _isMusicStarted = false;
  private _beatTimestamps: number[] = [];
  private _volumeRampTarget = -5;
  private _volumeRampDuration = 4;

  async init(): Promise<void> {
    if (this._isInitialized) return;
    this._isInitialized = true;
  }

  async startAudioContext(): Promise<void> {
    await Tone.start();
  }

  async loadRoyalty(url: string): Promise<void> {
    this.player = new Tone.Player({ url, loop: true });
    this.fft = new Tone.FFT(256);
    this._isMusicStarted = false;
    this.player.connect(this.fft);
    this.player.toDestination();
    await Tone.loaded();
  }

  startMusic(): void {
    if (!this.player || this._isMusicStarted) return;
    this._isMusicStarted = true;
    this.player.volume.value = -14;
    this.player.start();
    this.player.volume.rampTo(this._volumeRampTarget, this._volumeRampDuration);
  }

  setVolumeRamp(target: number, duration: number): void {
    this._volumeRampTarget = target;
    this._volumeRampDuration = duration;
    if (this.player) {
      this.player.volume.rampTo(target, duration);
    }
  }

  getVolume(): number {
    return this.player?.volume.value ?? -Infinity;
  }

  playTransition(): void {
    const sfx = new Tone.Player({ url: '/transition.mp3', autostart: true }).toDestination();
    sfx.volume.value = -6;
  }

  playBirthdayMelody(): void {
    try {
      const synth = new Tone.Synth().toDestination();
      const now = Tone.now();
      const notes = ['C4', 'E4', 'G4', 'C5', 'B4', 'G4', 'E4', 'C4'];
      notes.forEach((note, i) => {
        synth.triggerAttackRelease(note, '8n', now + i * 0.2);
      });
    } catch {
    }
  }

  setBeatTimestamps(beats: number[]): void {
    this._beatTimestamps = beats;
  }

  getNearestBeat(targetTime: number): number {
    if (this._beatTimestamps.length === 0) return targetTime;
    return this._beatTimestamps.reduce((prev, curr) =>
      Math.abs(curr - targetTime) < Math.abs(prev - targetTime) ? curr : prev
    );
  }

  getFrequencyData(): Float32Array {
    return this.fft?.getValue() ?? new Float32Array(256);
  }

  getEnergy(): number {
    const data = this.getFrequencyData();
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += Math.pow(10, data[i] / 20);
    }
    return sum / data.length;
  }

  getBassEnergy(): number {
    const data = this.getFrequencyData();
    let sum = 0;
    const bassRange = Math.min(20, data.length);
    for (let i = 0; i < bassRange; i++) {
      sum += Math.pow(10, data[i] / 20);
    }
    return sum / bassRange;
  }

  getParticleCount(max: number): number {
    const energy = this.getEnergy();
    return Math.max(50, Math.floor(energy * max));
  }

  getCurrentTime(): number {
    return this.player ? this.player.now() : 0;
  }

  dispose(): void {
    this.player?.dispose();
    this.fft?.dispose();
  }
}

export const audioEngine = new AudioEngine();
