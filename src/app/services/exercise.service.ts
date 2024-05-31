import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ExerciseService {
  constructor(
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth
  ) { }

  getExercises() {
    return this.firestore.collection('exercises').doc('levels').valueChanges().pipe(
      map((data: any) => data.levels)
    );
  }

  getUserProgress(userId: string) {
    return this.firestore.collection('userProgress').doc(userId).valueChanges();
  }

  saveUserProgress(userId: string, progress: any) {
    return this.firestore.collection('userProgress').doc(userId).set(progress);
  }

  resetUserProgress(userId: string) {
    const initialProgress = {
      currentLevelIndex: 0,
      completedExercises: 0
    };
    return this.saveUserProgress(userId, initialProgress);
  }

  resetExerciseResponses(exercises: any[]) {
    for (let level of exercises) {
      for (let exercise of level.exercises) {
        exercise.userAnswer = '';
        exercise.correct = false;
      }
    }
  }
}
