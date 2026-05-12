export interface ChoiceQuestion {
  question: string;
  choices: string[];
  correct: number;
  explanation: string;
}

export type GlobalMode = 'topic' | 'draw';

export interface InterviewQuestion {
  id: number;
  question: string;
  answer: string;
  /** 面试官考察目的（可选） */
  purpose?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  choice: ChoiceQuestion;
}

export interface Topic {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  questions: InterviewQuestion[];
}
