import { Component, OnInit, inject } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { VoiceService } from 'src/app/services/voice.service';
import { combineLatest } from 'rxjs';

interface User {
  id: string;
  uid: string;
  name: string;
  email: string;
  image?: string;
}

interface UserProgress {
  id: string;
  currentLevelIndex: number;
  completedExercises: number;
}

@Component({
  selector: 'app-ranking',
  templateUrl: './ranking.page.html',
  styleUrls: ['./ranking.page.scss'],
})
export class RankingPage implements OnInit {
  firebaseSvc = inject(FirebaseService);
  voiceSvc = inject(VoiceService);
  rankedUsers: (User & { currentLevelIndex: number })[] = [];

  ngOnInit() {
    this.loadRankedUsers();
  }

  loadRankedUsers() {
    const users$ = this.firebaseSvc.getCollection<User>('users');
    const userProgress$ = this.firebaseSvc.getCollection<UserProgress>('userProgress');

    combineLatest([users$, userProgress$]).subscribe(([users, userProgress]) => {
      this.rankedUsers = users.map(user => {
        const progress = userProgress.find(p => p.id === user.uid);
        return {
          ...user,
          currentLevelIndex: progress ? progress.currentLevelIndex + 1 : 1
        };
      }).sort((a, b) => b.currentLevelIndex - a.currentLevelIndex);
    });
  }

  getMedalIcon(index: number): string {
    if (index === 0) return 'medal';
    if (index === 1) return 'medal';
    if (index === 2) return 'medal';
    return '';
  }

  getMedalColor(index: number): string {
    if (index === 0) return '#FFD700'; // Oro
    if (index === 1) return '#C0C0C0'; // Plata
    if (index === 2) return '#CD7F32'; // Bronce
    return '';
  }

  getProgressPercentage(level: number): number {
    const maxLevel = 20;
    return (level / maxLevel) * 100;
  }

  speak(text: string, lang: string = 'en-US') {
    this.voiceSvc.speak(text, lang);
  }
}
