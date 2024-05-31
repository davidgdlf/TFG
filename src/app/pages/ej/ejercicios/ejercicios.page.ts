import { Component, OnInit, NgZone } from '@angular/core';
import { ExerciseService } from 'src/app/services/exercise.service';
import { ToastController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { VoiceService } from 'src/app/services/voice.service';

@Component({
  selector: 'app-ejercicios',
  templateUrl: './ejercicios.page.html',
  styleUrls: ['./ejercicios.page.scss'],
})
export class EjerciciosPage implements OnInit {
  exercises: any[];
  currentLevel: any;
  userProgress: any = {
    currentLevelIndex: 0,
    completedExercises: 0
  };
  recognition: any;
  recognizing: boolean = false;
  currentExerciseIndex: number | null = null;

  constructor(
    private exerciseService: ExerciseService,
    private toastController: ToastController,
    private afAuth: AngularFireAuth,
    private ngZone: NgZone,
    public voiceService: VoiceService
  ) { }

  ngOnInit() {
    this.initializeAuthState();
    this.initializeVoiceRecognition();
  }

  // Inicializa el estado de autenticación y carga el progreso del usuario y los ejercicios
  initializeAuthState() {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        const userId = user.uid;
        this.loadExercises();
        this.loadUserProgress(userId);
      }
    });
  }

  // Carga los ejercicios desde el servicio
  loadExercises() {
    this.exerciseService.getExercises().subscribe((data: any[]) => {
      this.exercises = data;
      this.loadCurrentLevel();
    });
  }

  // Carga el progreso del usuario desde el servicio
  loadUserProgress(userId: string) {
    this.exerciseService.getUserProgress(userId).subscribe((data: any) => {
      if (data) {
        this.userProgress = data;
        this.loadCurrentLevel();
      }
    });
  }

  // Inicializa el reconocimiento de voz
  initializeVoiceRecognition() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.lang = 'en-US';
      this.recognition.interimResults = false;

      this.recognition.onstart = () => {
        this.recognizing = true;
      };

      this.recognition.onend = () => {
        this.recognizing = false;
      };

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        this.ngZone.run(() => {
          if (this.currentExerciseIndex !== null && this.currentExerciseIndex !== undefined) {
            this.exercises[this.userProgress.currentLevelIndex].exercises[this.currentExerciseIndex].userAnswer = transcript;
            this.voiceService.speak(transcript, 'en-US'); // Leer la respuesta del usuario en inglés
          }
        });
      };
    }
  }

  // Carga el nivel actual del usuario
  loadCurrentLevel() {
    if (this.exercises && this.exercises.length > 0) {
      if (this.userProgress.currentLevelIndex < this.exercises.length) {
        this.currentLevel = this.exercises[this.userProgress.currentLevelIndex];
        // comento lalinea de abajo porque da varios problemas
        // this.voiceService.speak('You are on level ' + (this.userProgress.currentLevelIndex + 1) + ': ' + this.currentLevel.title, 'en-US');
      } else {
        this.currentLevel = null;
      }
    }
  }

  // Verifica si la respuesta es correcta
  checkAnswer(answer: string, correctAnswer: string): boolean {
    return answer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
  }

  // Muestra un mensaje toast y lo lee en voz alta
  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'middle',
      color: color
    });
    toast.present();
    this.voiceService.speak(message, 'en-US');
  }

  // Avanza al siguiente ejercicio o nivel
  async nextExercise() {
    if (this.userProgress.completedExercises === this.currentLevel.exercises.length) {
      const nextLevelIndex = this.userProgress.currentLevelIndex + 1;
      if (nextLevelIndex < this.exercises.length) {
        this.userProgress.currentLevelIndex = nextLevelIndex;
        this.userProgress.completedExercises = 0;
        await this.saveUserProgress();
        this.presentToast('You have reached the next level!', 'success');
        this.loadCurrentLevel();
      } else {
        this.presentToast('You have completed all the levels! More updates coming soon.', 'success');
        this.currentLevel = null;
      }
    } else {
      this.presentToast('Correct answer! Please complete the next exercise', 'success');
    }
  }

  // Guarda el progreso del usuario
  async saveUserProgress() {
    const user = this.afAuth.currentUser;
    if (user) {
      const userId = (await user).uid;
      try {
        await this.exerciseService.saveUserProgress(userId, this.userProgress);
      } catch (error) {
        console.error('Error al guardar el progreso del usuario:', error);
      }
    }
  }

  // Verifica la respuesta y avanza al siguiente ejercicio si es correcta
  checkAndNext(exercise: any, index: number) {
    if (this.checkAnswer(exercise.userAnswer, exercise.answer)) {
      exercise.correct = true;
      this.userProgress.completedExercises++;
      this.saveUserProgress();
      this.nextExercise();
    } else {
      this.presentToast('Wrong answer. Please, try again', 'danger');
    }
  }

  // Reinicia el progreso del usuario
  async resetProgress() {
    const user = this.afAuth.currentUser;
    if (user) {
      const userId = (await user).uid;
      try {
        await this.exerciseService.resetUserProgress(userId);
        this.exerciseService.resetExerciseResponses(this.exercises);
        this.userProgress = {
          currentLevelIndex: 0,
          completedExercises: 0
        };
        this.presentToast('Progress has been reset.', 'success');
        this.loadCurrentLevel();
      } catch (error) {
        console.error('Error al reiniciar el progreso del usuario:', error);
      }
    }
  }

  // Inicia el reconocimiento de voz para un ejercicio específico
  startVoiceRecognition(index: number) {
    this.currentExerciseIndex = index;
    if (this.recognition && !this.recognizing) {
      this.recognition.start();
    }
  }
}
