/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AmbientSoundType } from '../types';

/**
 * Procedural Web Audio Ambient Sound Generator
 * Generates soothing natural soundscapes using pure mathematical synthesis.
 * Zero external audio files required, zero latency, offline-capable.
 */
class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private currentType: AmbientSoundType = 'off';
  private masterGain: GainNode | null = null;
  private nodesToClean: (AudioNode | number)[] = [];

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setSound(type: AmbientSoundType, volume = 0.3) {
    this.stop();
    if (type === 'off') {
      this.currentType = 'off';
      return;
    }

    try {
      this.initContext();
      if (!this.ctx) return;

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.currentType = type;

      switch (type) {
        case 'rain':
          this.createRainSound();
          break;
        case 'ocean':
          this.createOceanSound();
          break;
        case 'forest':
          this.createForestSound();
          break;
        case 'fireplace':
          this.createFireplaceSound();
          break;
        case 'ambient':
          this.createAmbientDrone();
          break;
      }
    } catch (e) {
      console.warn('Procedural sound synth initialization warning:', e);
    }
  }

  public setVolume(volume: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime);
    }
  }

  public stop() {
    // Stop all procedural loops and disconnect nodes
    this.nodesToClean.forEach((item) => {
      if (typeof item === 'number') {
        window.clearInterval(item);
      } else {
        try {
          (item as any).stop?.();
          item.disconnect();
        } catch (_) {}
      }
    });
    this.nodesToClean = [];

    if (this.masterGain) {
      try {
        this.masterGain.disconnect();
      } catch (_) {}
      this.masterGain = null;
    }
    this.currentType = 'off';
  }

  // Helper to generate pink/white noise buffer
  private createNoiseBuffer(duration = 5): AudioBuffer {
    if (!this.ctx) throw new Error('AudioContext missing');
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // 1/f pink noise approximation
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  private createRainSound() {
    if (!this.ctx || !this.masterGain) return;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(6);
    noise.loop = true;

    // Dual filtering for soft rainfall tone
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1100, this.ctx.currentTime);

    const highpass = this.ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(280, this.ctx.currentTime);

    noise.connect(highpass);
    highpass.connect(filter);
    filter.connect(this.masterGain);

    noise.start();
    this.nodesToClean.push(noise, filter, highpass);
  }

  private createOceanSound() {
    if (!this.ctx || !this.masterGain) return;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(8);
    noise.loop = true;

    // Filter modulated by slow LFO for rhythmic waves
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);

    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // ~8 second wave period

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(320, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    noise.connect(filter);
    filter.connect(this.masterGain);

    noise.start();
    lfo.start();
    this.nodesToClean.push(noise, filter, lfo, lfoGain);
  }

  private createForestSound() {
    if (!this.ctx || !this.masterGain) return;
    // Gentle wind backdrop
    const wind = this.ctx.createBufferSource();
    wind.buffer = this.createNoiseBuffer(6);
    wind.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    wind.connect(filter);
    filter.connect(this.masterGain);
    wind.start();
    this.nodesToClean.push(wind, filter);

    // Procedural gentle harmonic chime interval
    const chimeTimer = window.setInterval(() => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const freqs = [528, 660, 792, 1056]; // Solfeggio / pentatonic harmonic notes
      const f = freqs[Math.floor(Math.random() * freqs.length)];
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.015, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 3.5);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 3.6);
    }, 4500);

    this.nodesToClean.push(chimeTimer);
  }

  private createFireplaceSound() {
    if (!this.ctx || !this.masterGain) return;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(5);
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(this.masterGain);
    noise.start();
    this.nodesToClean.push(noise, filter);

    // Pop crackle bursts
    const crackleTimer = window.setInterval(() => {
      if (!this.ctx || !this.masterGain) return;
      const popOsc = this.ctx.createOscillator();
      const popGain = this.ctx.createGain();
      popOsc.type = 'triangle';
      popOsc.frequency.setValueAtTime(80 + Math.random() * 120, this.ctx.currentTime);

      popGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      popGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      popOsc.connect(popGain);
      popGain.connect(this.masterGain);
      popOsc.start();
      popOsc.stop(this.ctx.currentTime + 0.09);
    }, 600);

    this.nodesToClean.push(crackleTimer);
  }

  private createAmbientDrone() {
    if (!this.ctx || !this.masterGain) return;
    // 432Hz harmonic chord drone
    const chord = [216, 324, 432, 648];
    chord.forEach((freq) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      this.nodesToClean.push(osc, gain);
    });
  }
}

export const soundSynthesizer = new SoundSynthesizer();
