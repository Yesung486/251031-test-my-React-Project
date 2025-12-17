// 파일 위치: components/aivoca/types.ts

// 이 코드는 네가 필요한 ViewState, UserStats, Word, VocabBook 이라는
// 4가지 설계도를 모두 가지고 있어!

export interface Word {
  id: string;
  term: string; // 이전 코드에서는 'word'였지만, 네 진짜 설계도는 'term'이었어!
  definition: string;
  exampleSentence: string;
  exampleTranslation: string;
  tags: string[];
  masteryLevel: number;
  lastReviewed?: Date;
  incorrectCount: number;
  userNote?: string;
  isFavorite: boolean;
}

export interface VocabBook {
  id: string;
  title: string;
  createdAt: string;
  words: Word[];
}

export interface UserStats {
  level: number;
  xp: number;
  streak: number;
  totalWordsLearned: number;
  quizAccuracy: number;
  dailyGoal: number;
  dailyProgress: number;
}

export type ViewState = 'DASHBOARD' | 'WORDLIST' | 'QUIZ';

export enum QuizType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  SPELLING = 'SPELLING',
  FILL_BLANK = 'FILL_BLANK',
}

export interface QuizQuestion {
  word: Word;
  type: QuizType;
  options?: string[];
  correctAnswer: string;
}