import { Component, OnInit, inject } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { ExerciseService } from 'src/app/services/exercise.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router, NavigationEnd } from '@angular/router';
import { VoiceService } from 'src/app/services/voice.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {
  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  exerciseService = inject(ExerciseService);
  afAuth = inject(AngularFireAuth);
  router = inject(Router);
  voiceService = inject(VoiceService);

  currentLevelTitle: string = '';
  currentLevelIndex: number = 0;
  noProgressFound: boolean = false;

  ngOnInit() {
    this.printAvailableVoices();
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd && event.url === '/perfil') {
        this.loadUserProgress();
      }
    });
  }

  user(): User {
    return this.utilsSvc.getFromLocalStorage('user');
  }

  async loadUserProgress() {
    const user = await this.afAuth.currentUser;
    if (user) {
      const userId = user.uid;
      this.exerciseService.getUserProgress(userId).subscribe((progress: any) => {
        if (progress) {
          this.currentLevelIndex = progress.currentLevelIndex;
          this.exerciseService.getExercises().subscribe((levels: any[]) => {
            if (levels && levels[this.currentLevelIndex]) {
              this.currentLevelTitle = levels[this.currentLevelIndex].title;
              this.noProgressFound = false;
            } else {
              this.noProgressFound = true;
            }
          });
        } else {
          this.noProgressFound = true;
        }
      });
    }
  }

  async takeImage() {
    let user = this.user();
    let path = `users/${user.uid}`;
    const DataUrl = (await this.utilsSvc.takePicture('Imagen de perfil')).dataUrl;
    const loading = await this.utilsSvc.loading();
    await loading.present();
    let imagePath = `${user.uid}/perfil`;
    user.image = await this.firebaseSvc.uploadImage(imagePath, DataUrl);

    this.firebaseSvc.updateDocument(path, { image: user.image }).then(async res => {
      this.utilsSvc.saveInLocalStorage('user', user);
      this.utilsSvc.presentToast({
        message: 'Foto actualizada exitosamente',
        duration: 1500,
        color: 'success',
        position: 'middle',
        icon: 'checkmark-circle-outline'
      });
    }).catch(error => {
      console.log(error);
      this.utilsSvc.presentToast({
        message: error.message,
        duration: 2500,
        color: 'primary',
        position: 'middle',
        icon: 'alert-circle-outline'
      });
    }).finally(() => {
      loading.dismiss();
    });
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
}
