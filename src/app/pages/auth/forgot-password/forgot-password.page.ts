import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { VoiceService } from 'src/app/services/voice.service'; // Importa el servicio

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  voiceSvc = inject(VoiceService); // Inyecta el servicio de voz

  ngOnInit() {}

  async submit() {
    if (this.form.valid) {
      const loading = await this.utilsSvc.loading();
      await loading.present();

      this.firebaseSvc.sendRecoveryEmail(this.form.value.email).then(res => {
        console.log(res);
        this.utilsSvc.presentToast({
          message: 'Mail sent to the email address',
          duration: 2500,
          color: 'primary',
          position: 'middle',
          icon: 'checkmark-circle-outline'
        });
        this.voiceSvc.speak('Mail sent to the email address', 'en-US');
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
    } else {
      this.voiceSvc.speak('The form is not valid', 'en-US');
    }
  }

  speakText(text: string, lang: string = 'es-ES') {
    this.voiceSvc.speak(text, lang);
  }
}
