import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { VoiceService } from 'src/app/services/voice.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  });

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  voiceSvc = inject(VoiceService);
  afAuth = inject(AngularFireAuth);

  ngOnInit() {}

  async submit() {
    if (this.form.valid) {
      const loading = await this.utilsSvc.loading();
      await loading.present();

      try {
        const res = await this.afAuth.signInWithEmailAndPassword(
          this.form.value.email,
          this.form.value.password
        );
        const user = res.user;
        if (user && user.emailVerified) {
          this.getUserInfo(user.uid);
          this.voiceSvc.speak('Login successful', 'en-US');
        } else {
          await this.afAuth.signOut();
          this.utilsSvc.presentToast({
            message: 'Please verify your email before logging in.',
            duration: 3000,
            color: 'warning',
            position: 'middle',
            icon: 'alert-circle-outline'
          });
          this.voiceSvc.speak('Please verify your email before logging in.', 'en-US');
        }
      } catch (error) {
        console.log(error);
        this.utilsSvc.presentToast({
          message: error.message,
          duration: 2500,
          color: 'primary',
          position: 'middle',
          icon: 'alert-circle-outline'
        });
        this.voiceSvc.speak(error.message, 'en-US');
      } finally {
        loading.dismiss();
      }
    } else {
      this.voiceSvc.speak('The form is not valid', 'en-US');
    }
  }

  async getUserInfo(uid: string) {
    if (this.form.valid) {
      const loading = await this.utilsSvc.loading();
      await loading.present();

      let path = `users/${uid}`;

      this.firebaseSvc.getDocument(path).then((user: User) => {
        this.utilsSvc.saveInLocalStorage('user', user);
        this.utilsSvc.routerLink('/ejercicios');
        this.form.reset();

        this.utilsSvc.presentToast({
          message: `Te damos la bienvenida a Edublind ${user.name}`,
          duration: 2000,
          color: 'primary',
          position: 'middle',
          icon: 'person-circle-outline'
        });
        this.voiceSvc.speak(`Welcome to Edublind ${user.name}`, 'en-US');
      }).catch(error => {
        console.log(error);
        this.utilsSvc.presentToast({
          message: error.message,
          duration: 2500,
          color: 'primary',
          position: 'middle',
          icon: 'alert-circle-outline'
        });
        this.voiceSvc.speak(error.message, 'en-US');
      }).finally(() => {
        loading.dismiss();
      });
    }
  }

  speakText(text: string, lang: string = 'en-US') {
    this.voiceSvc.speak(text, lang);
  }
}
