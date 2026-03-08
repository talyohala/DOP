class SoundEngine {
  context: AudioContext | null = null;

  init() {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.context.state === 'suspended') {
      this.context.resume();
    }
  }

  playZap() {
    this.init();
    if (!this.context) return;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = 'sawtooth';
    osc.connect(gain);
    gain.connect(this.context.destination);
    osc.frequency.setValueAtTime(800, this.context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.context.currentTime + 0.2);
    gain.gain.setValueAtTime(0.1, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.2);
    osc.start();
    osc.stop(this.context.currentTime + 0.2);
  }

  playCoin() {
    this.init();
    if (!this.context) return;
    const playTone = (freq: number, startTime: number) => {
      const osc = this.context!.createOscillator();
      const gain = this.context!.createGain();
      osc.type = 'sine';
      osc.connect(gain);
      gain.connect(this.context!.destination);
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.1, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);
      osc.start(startTime);
      osc.stop(startTime + 0.1);
    };
    playTone(1200, this.context.currentTime);
    playTone(1600, this.context.currentTime + 0.1);
  }

  playTick() {
    this.init();
    if (!this.context) return;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = 'square';
    osc.connect(gain);
    gain.connect(this.context.destination);
    osc.frequency.setValueAtTime(150, this.context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.context.currentTime + 0.05);
    gain.gain.setValueAtTime(0.05, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.05);
    osc.start();
    osc.stop(this.context.currentTime + 0.05);
  }

  playError() {
    this.init();
    if (!this.context) return;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = 'sawtooth';
    osc.connect(gain);
    gain.connect(this.context.destination);
    osc.frequency.setValueAtTime(100, this.context.currentTime);
    gain.gain.setValueAtTime(0.1, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.3);
    osc.start();
    osc.stop(this.context.currentTime + 0.3);
  }
}

export const sounds = new SoundEngine();
