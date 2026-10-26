// Very short placement quiz. Questions get harder; the score maps to a CEFR level.
export interface QuizQuestion {
  q: string;
  options: string[];
  answer: number;
}

export const quiz: QuizQuestion[] = [
  { q: 'My dog ___ very friendly.', options: ['am', 'is', 'are'], answer: 1 },
  { q: 'Yesterday we ___ to the forest.', options: ['go', 'goes', 'went'], answer: 2 },
  { q: 'Have you ever ___ a puppy?', options: ['had', 'have', 'having'], answer: 0 },
  { q: 'If it rains, we ___ stay at home.', options: ['would', 'will', 'did'], answer: 1 },
  { q: 'The dog, ___ owner lives in Gdańsk, is called Luna.', options: ['who', 'which', 'whose'], answer: 2 },
  { q: 'By the time you arrive, I ___ the dogs for a walk.', options: ['will have taken', 'have taken', 'take'], answer: 0 },
  { q: 'I’d rather you ___ the dog on the sofa.', options: ["don't let", "didn't let", "won't let"], answer: 1 },
  { q: 'Hardly ___ the door when the dog started barking.', options: ['I had opened', 'had I opened', 'I opened'], answer: 1 },
];

export const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

export function scoreToLevel(score: number): (typeof levels)[number] {
  if (score <= 1) return 'A1';
  if (score <= 3) return 'A2';
  if (score <= 4) return 'B1';
  if (score <= 5) return 'B2';
  if (score <= 6) return 'C1';
  return 'C2';
}
