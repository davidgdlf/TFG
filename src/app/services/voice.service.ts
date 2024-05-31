import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Plugins } from '@capacitor/core';

const { SpeechSynthesis: CapacitorSpeechSynthesis } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class VoiceService {
  private lastSpokenText: string | null = null;
  private canSpeak: boolean = true;
  private isCapacitorAvailable: boolean;

  constructor() {
    this.isCapacitorAvailable = Capacitor.isNativePlatform();
  }

  // Reproduce el texto proporcionado usando la síntesis de voz
  async speak(text: string, lang: string = 'en-US') {
    if (!this.canSpeak) {
      return; // Si no se puede hablar, salir de la función
    }

    if (this.lastSpokenText === text) {
      return; // Si el texto ya se ha dicho recientemente, salir de la función
    }

    try {
      if (this.isCapacitorAvailable) {
        // Usar plugin de Capacitor
        await CapacitorSpeechSynthesis['speak']({
          text,
          lang,
          rate: 0.8,
          pitch: 1.0,
          volume: 1.0,
          category: 'ambient'
        });
      } else {
        // Usar API de síntesis de voz del navegador
        this.speakWithBrowser(text, lang);
      }

      this.lastSpokenText = text;
      this.canSpeak = false;

      // Esperar 1 segundos antes de permitir hablar nuevamente
      setTimeout(() => {
        this.canSpeak = true;
      }, 1000);
    } catch (error) {
      console.error('Error al sintetizar la voz:', error);
    }
  }

  // Método para usar la síntesis de voz del navegador
  private speakWithBrowser(text: string, lang: string) {
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    utterance.lang = lang;
    window.speechSynthesis.speak(utterance);
  }

  // Obtener las voces disponibles
  async getVoices(): Promise<SpeechSynthesisVoice[]> {
    return new Promise<SpeechSynthesisVoice[]>((resolve) => {
      const voices = speechSynthesis.getVoices();
      if (voices.length) {
        resolve(voices);
      } else {
        speechSynthesis.onvoiceschanged = () => {
          resolve(speechSynthesis.getVoices());
        };
      }
    });
  }
}
