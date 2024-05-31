import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { VoiceService } from 'src/app/services/voice.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-sing-up',
  templateUrl: './sing-up.page.html',
  styleUrls: ['./sing-up.page.scss'],
})
export class SingUpPage implements OnInit {

  form = new FormGroup({
    uid: new FormControl(''),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
    name: new FormControl('', [Validators.required, Validators.minLength(3)])
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
        const res = await this.afAuth.createUserWithEmailAndPassword(
          this.form.value.email,
          this.form.value.password
        );
        const user = res.user;
        if (user) {
          await user.updateProfile({ displayName: this.form.value.name });
          await user.sendEmailVerification();

          this.firebaseSvc.setDocument(`users/${user.uid}`, {
            uid: user.uid,
            email: user.email,
            name: this.form.value.name,
          });

          this.utilsSvc.saveInLocalStorage('user', { ...this.form.value, uid: user.uid });
          this.utilsSvc.presentToast({
            message: 'Please check your email for verification.',
            duration: 3000,
            color: 'success'
          });
          this.voiceSvc.speak('Please check your email for verification.', 'en-US');
          
          // Redirigir a la página de autenticación
          this.utilsSvc.routerLink('/auth');
          this.form.reset();
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

  speakText(text: string, lang: string = 'en-US') {
    this.voiceSvc.speak(text, lang);
  }
}
