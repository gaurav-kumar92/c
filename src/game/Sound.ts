export class Sound {
  private static audioContext: AudioContext | null = null;
  private static sounds: { [key: string]: AudioBuffer } = {};

  static async init() {
    if (this.audioContext) return;
    try {
      this.audioContext = new AudioContext();
      // Load all sounds
      await Promise.all([
        this.loadSound("splash", "/sounds/splash.mp3"),
        this.loadSound("object", "/sounds/object.mp3"),
        this.loadSound("blast", "/sounds/blast.mp3"),
        this.loadSound("level-up", "/sounds/level-up.mp3"),
      ]);
    } catch (e) {
      console.error("Error initializing audio context", e);
    }
  }

  private static async loadSound(name: string, url: string) {
    if (!this.audioContext) return;
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      this.sounds[name] = await this.audioContext.decodeAudioData(arrayBuffer);
    } catch (e) {
      console.error(`Error loading sound: ${name}`, e);
    }
  }

  static play(name: string) {
    if (!this.audioContext || !this.sounds[name]) {
      return;
    }

    const gainNode = this.audioContext.createGain();
    if (name === 'blast') {
      gainNode.gain.value = 0.4;
    } else {
      gainNode.gain.value = 1;
    }

    const source = this.audioContext.createBufferSource();
    source.buffer = this.sounds[name];
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    source.start(0);
  }
}
