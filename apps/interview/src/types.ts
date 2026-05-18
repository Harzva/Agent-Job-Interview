export interface Job {
  id: string;
  title: string;
  location: string;
  category: string;
  salary: string;
  summary: string;
  requirements: string[];
  bonuses: string[];
  skills: string[];
  level: string;
  relatedQuestionCategories: string[];
  relatedQuestionCount: number;
  relatedProjects: string[];
  learningPath: string;
  difficulty: string;
}

export interface GitHubProject {
  name: string;
  owner: string;
  stars: string;
  forks: string;
  category: string;
  description: string;
  tasks: string[];
}

export interface SkillLayer {
  name: string;
  title: string;
  description: string;
  skills: string[];
  color: string;
}

export interface SkillModel {
  layers: SkillLayer[];
}

export interface LearningStep {
  name: string;
  duration: string;
  resources: string[];
}

export interface LearningPath {
  title: string;
  steps: LearningStep[];
}

export interface InterviewMode {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export interface JobSource {
  company: string;
  sourceName: string;
  sourceUrl?: string;
  evidenceUrl?: string;
  firstSeenAt?: string;
  snapshotDate?: string;
  status?: string;
  note?: string;
}

export interface CompanyJob {
  id: string;
  title: string;
  salary: string;
  location: string;
  level: string;
  tags: string[];
  description: string;
  source?: JobSource;
  questionCategories?: string[];
  questionFocus?: string[];
}

export interface Company {
  id: string;
  name: string;
  logo: string;
  logoUrl?: string;
  description: string;
  color: string;
  gradient: string;
  jobs: CompanyJob[];
  questionCount: number;
}

export interface Question {
  id: string;
  number: number;
  title: string;
  question: string;
  answer: string;
  followUp: string;
  category: string;
  options: string[] | null;
  correctOption: number | null;
  isChoice: boolean;
}

export interface ChoiceQuestion {
  id: string;
  question: string;
  options: string[];
  correctOption: number;
  answer: string;
  category: string;
}

export interface AppData {
  jobs: Job[];
  githubProjects: GitHubProject[];
  skillModel: SkillModel;
  learningPaths: LearningPath[];
  interviewModes: InterviewMode[];
  questions: Record<string, Question[]>;
  choiceQuestions: ChoiceQuestion[];
}
