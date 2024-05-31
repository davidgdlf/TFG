import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  voices: SpeechSynthesisVoice[] = [];

  constructor(private router: Router) {
    this.speak('Edublind is loading.'); // Hablar el mensaje al cargar la página por primera vez
  }

  ngOnInit() {
    this.loadVoices(); // Cargar las voces una vez al inicio de la aplicación

    setTimeout(() => {
      this.router.navigate(['auth']);
    }, 5000); 
  }

  async speak(text: string) {
    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.rate = 0.8; 
  
    if (this.voices.length > 0) {
      const selectedVoice = this.voices.find(voice => voice.name === 'Google US English');
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      } else {
        console.error('La voz seleccionada no está definida.');
      }
    } else {
      console.error('No se encontraron voces disponibles.');
    }
  
    speechSynthesis.speak(utterance);
  }
  
  loadVoices() {
    this.voices = speechSynthesis.getVoices(); // Obtener las voces disponibles
    if (!this.voices || this.voices.length === 0) {
      // Esperar a que las voces estén disponibles
      speechSynthesis.onvoiceschanged = () => {
        this.voices = speechSynthesis.getVoices();
        // Verificar si hay voces disponibles después de que el evento se dispare
        if (!this.voices || this.voices.length === 0) {
          console.error('No se encontraron voces disponibles después del evento onvoiceschanged.');
        }
      };
    }
  }
}
