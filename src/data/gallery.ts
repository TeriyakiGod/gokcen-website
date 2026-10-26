// Photo manifest. To use real photos, put them in public/photos/ and change `src`
// (e.g. '/photos/dogs-1.jpg'), then set `placeholder: false`.
import type { Lang } from '../i18n';

export type Category = 'dogs' | 'lessons' | 'home';

export interface Photo {
  src: string;
  category: Category;
  width: number;
  height: number;
  alt: Record<Lang, string>;
  placeholder?: boolean;
}

const wide = { width: 1200, height: 800 };
const tall = { width: 800, height: 1100 };
const square = { width: 900, height: 900 };

export const heroPhoto: Photo = {
  src: '/photos/hero.svg', category: 'dogs', ...tall, placeholder: true,
  alt: { en: 'Gökçen hugging a happy dog', pl: 'Gökçen przytula szczęśliwego psa', tr: 'Gökçen mutlu bir köpeğe sarılıyor' },
};

export const aboutPhoto: Photo = {
  src: '/photos/about.svg', category: 'dogs', ...square, placeholder: true,
  alt: { en: 'Portrait of Gökçen', pl: 'Portret Gökçen', tr: 'Gökçen’in portresi' },
};

export const gallery: Photo[] = [
  { src: '/photos/dogs-1.svg', category: 'dogs', ...wide, placeholder: true, alt: { en: 'Forest walk with two dogs', pl: 'Spacer po lesie z dwoma psami', tr: 'İki köpekle orman yürüyüşü' } },
  { src: '/photos/lessons-1.svg', category: 'lessons', ...wide, placeholder: true, alt: { en: 'Gökçen teaching an online lesson', pl: 'Gökçen prowadzi lekcję online', tr: 'Gökçen online ders veriyor' } },
  { src: '/photos/dogs-2.svg', category: 'dogs', ...tall, placeholder: true, alt: { en: 'A puppy napping on Gökçen’s lap', pl: 'Szczeniak śpi na kolanach Gökçen', tr: 'Gökçen’in kucağında uyuyan yavru köpek' } },
  { src: '/photos/home-1.svg', category: 'home', ...wide, placeholder: true, alt: { en: 'The garden where dogs play', pl: 'Ogród, w którym bawią się psy', tr: 'Köpeklerin oynadığı bahçe' } },
  { src: '/photos/dogs-3.svg', category: 'dogs', ...square, placeholder: true, alt: { en: 'Selfie with a golden retriever', pl: 'Selfie z golden retrieverem', tr: 'Golden retriever ile selfie' } },
  { src: '/photos/lessons-2.svg', category: 'lessons', ...square, placeholder: true, alt: { en: 'Notebook and flashcards for a lesson', pl: 'Zeszyt i fiszki do lekcji', tr: 'Ders için defter ve kartlar' } },
  { src: '/photos/dogs-4.svg', category: 'dogs', ...wide, placeholder: true, alt: { en: 'Dogs running on the beach', pl: 'Psy biegają po plaży', tr: 'Sahilde koşan köpekler' } },
  { src: '/photos/home-2.svg', category: 'home', ...square, placeholder: true, alt: { en: 'Cosy dog bed in the living room', pl: 'Wygodne posłanie w salonie', tr: 'Oturma odasında rahat köpek yatağı' } },
  { src: '/photos/dogs-5.svg', category: 'dogs', ...tall, placeholder: true, alt: { en: 'Gökçen and a dog in autumn leaves', pl: 'Gökçen i pies w jesiennych liściach', tr: 'Sonbahar yapraklarında Gökçen ve bir köpek' } },
  { src: '/photos/lessons-3.svg', category: 'lessons', ...tall, placeholder: true, alt: { en: 'A dog “helping” with lesson prep', pl: 'Pies „pomaga” przygotować lekcję', tr: 'Ders hazırlığına “yardım eden” köpek' } },
  { src: '/photos/home-3.svg', category: 'home', ...tall, placeholder: true, alt: { en: 'Morning coffee with a sleepy dog', pl: 'Poranna kawa z zaspanym psem', tr: 'Uykulu bir köpekle sabah kahvesi' } },
  { src: '/photos/dogs-6.svg', category: 'dogs', ...square, placeholder: true, alt: { en: 'Treat time!', pl: 'Czas na przysmak!', tr: 'Ödül zamanı!' } },
];

export interface Guest {
  name: string;
  src: string;
  word: string;
  placeholder?: boolean;
}

// "Meet the guests" — dogs she has looked after.
export const guests: Guest[] = [
  { name: 'Luna', src: '/photos/guest-luna.svg', word: 'walkies', placeholder: true },
  { name: 'Bruno', src: '/photos/guest-bruno.svg', word: 'snack', placeholder: true },
  { name: 'Biscuit', src: '/photos/guest-biscuit.svg', word: 'ball', placeholder: true },
  { name: 'Maks', src: '/photos/guest-maks.svg', word: 'cuddle', placeholder: true },
];
