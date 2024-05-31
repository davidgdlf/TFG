import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';
import { VoiceService } from 'src/app/services/voice.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  voiceService = inject(VoiceService);

  showEnglishLevelDropdown: boolean = false;

  constructor(private router: Router) { }

  ngOnInit() {
    this.printAvailableVoices();
  }

  async speak(text: string, lang: string = 'en-US') {
    await this.voiceService.speak(text, lang);
  }

  async getVoices(): Promise<SpeechSynthesisVoice[]> {
    return this.voiceService.getVoices();
  }

  async printAvailableVoices() {
    const voices = await this.getVoices();
    console.log(voices);
  }

  goToEj() {
    this.router.navigate(['/ejercicios']);
  }

  goToPerfil() {
    this.router.navigate(['/perfil']);
  }

  goToRanking() {
    this.router.navigate(['/ranking']);
  }

  signOut() {
    this.firebaseSvc.signOut();
  }
}
