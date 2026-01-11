export class Sound {
  private static audioContext: AudioContext | null = null;
  private static sounds: { [key: string]: AudioBuffer } = {};

  static async init() {
    if (this.audioContext) return;
    try {
      this.audioContext = new AudioContext();
      console.log("Audio context initialized");
      // Load both sounds
      await Promise.all([
        this.loadSound("splash", "/sounds/splash.mp3"),
        this.loadSound("object", "/sounds/object.mp3"),
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
      console.log(`Sound loaded: ${name}`);
    } catch (e) {
      console.error(`Error loading sound: ${name}`, e);
    }
  }

  static play(name: string) {
    if (!this.audioContext || !this.sounds[name]) {
      console.error(`Sound not ready to play: ${name}`);
      return;
    }
    const source = this.audioContext.createBufferSource();
    source.buffer = this.sounds[name];
    source.connect(this.audioContext.destination);
    source.start(0);
    console.log(`Playing sound: ${name}`);
  }
}
