// Photo manifest. Photos live in public/photos/ as WebP (max 1200px, metadata stripped).
// `position` is the CSS object-position used where a photo is cropped to a fixed frame.
import type { Lang } from '../i18n';

export type Category = 'dogs' | 'walks' | 'lessons' | 'home';

export interface Photo {
  src: string;
  category: Category;
  width: number;
  height: number;
  alt: Record<Lang, string>;
  position?: string;
  placeholder?: boolean;
}

const portrait = { width: 900, height: 1200 };
const landscape = { width: 1200, height: 900 };
const phone = { width: 677, height: 1200 };

export const heroPhoto: Photo = {
  src: '/photos/hero.webp', category: 'walks', width: 1050, height: 1400, position: 'center 70%',
  alt: { en: 'Gökçen and Monti by the Great Mill in Gdańsk', pl: 'Gökçen i Monti przy Wielkim Młynie w Gdańsku', tr: 'Gökçen ve Monti, Gdańsk’taki Büyük Değirmen’in yanında' },
};

export const aboutPhoto: Photo = {
  src: '/photos/about.webp', category: 'walks', width: 1050, height: 1400, position: 'center 62%',
  alt: { en: 'Gökçen holding Monti on the beach', pl: 'Gökçen z Montim na plaży', tr: 'Gökçen sahilde Monti’yi kucağında tutuyor' },
};

export const gallery: Photo[] = [
  { src: '/photos/dogs-forest-pair.webp', category: 'dogs', ...portrait, alt: { en: 'Forest walk with two guest dogs', pl: 'Leśny spacer z dwoma psimi gośćmi', tr: 'İki misafir köpekle orman yürüyüşü' } },
  { src: '/photos/walks-granaries.webp', category: 'walks', width: 1050, height: 1400, alt: { en: 'Gökçen and Monti by the Motława river in Gdańsk', pl: 'Gökçen i Monti nad Motławą w Gdańsku', tr: 'Gökçen ve Monti, Gdańsk’ta Motława nehri kıyısında' } },
  { src: '/photos/home-living-room.webp', category: 'home', ...portrait, alt: { en: 'Dogs relaxing in the living room', pl: 'Psy odpoczywają w salonie', tr: 'Oturma odasında dinlenen köpekler' } },
  { src: '/photos/dogs-dachshund.webp', category: 'dogs', ...portrait, alt: { en: 'Cuddles with a dachshund guest', pl: 'Przytulanie z jamnikiem', tr: 'Bir dachshund misafirle sarılma' } },
  { src: '/photos/walks-paddleboard.webp', category: 'walks', width: 1200, height: 677, alt: { en: 'Monti on a paddleboard on the lake', pl: 'Monti na desce SUP na jeziorze', tr: 'Monti gölde SUP tahtasında' } },
  { src: '/photos/dogs-forest-kneel.webp', category: 'dogs', ...portrait, alt: { en: 'A happy guest dog in the forest', pl: 'Szczęśliwy psi gość w lesie', tr: 'Ormanda mutlu bir misafir köpek' } },
  { src: '/photos/walks-porch.webp', category: 'walks', ...portrait, alt: { en: 'Gökçen and Monti in front of an old wooden house with flowers', pl: 'Gökçen i Monti przed starym drewnianym domem w kwiatach', tr: 'Gökçen ve Monti, çiçekli eski ahşap bir evin önünde' } },
  { src: '/photos/dogs-lake.webp', category: 'dogs', ...portrait, alt: { en: 'A guest dog saying hello by the lake', pl: 'Psi gość wita się nad jeziorem', tr: 'Göl kenarında merhaba diyen bir misafir köpek' } },
  { src: '/photos/walks-forest-lake.webp', category: 'walks', ...landscape, alt: { en: 'Gökçen carrying Monti in a pine forest by a lake', pl: 'Gökçen niesie Montiego w sosnowym lesie nad jeziorem', tr: 'Gökçen, göl kenarındaki çam ormanında Monti’yi taşıyor' } },
  { src: '/photos/dogs-sunbeams.webp', category: 'dogs', ...portrait, alt: { en: 'Morning sunbeams on a forest walk with the dogs', pl: 'Poranne promienie słońca na leśnym spacerze z psami', tr: 'Köpeklerle orman yürüyüşünde sabah güneşi' } },
  { src: '/photos/home-chair.webp', category: 'home', ...portrait, alt: { en: 'Monti sitting on a chair at home', pl: 'Monti siedzi na krześle w domu', tr: 'Monti evde bir sandalyede oturuyor' } },
  { src: '/photos/walks-malbork.webp', category: 'walks', width: 902, height: 1200, alt: { en: 'Monti at Malbork Castle', pl: 'Monti przy zamku w Malborku', tr: 'Monti, Malbork Kalesi’nde' } },
  { src: '/photos/dogs-black-closeup.webp', category: 'dogs', ...portrait, alt: { en: 'A guest dog smiling on a walk', pl: 'Uśmiechnięty psi gość na spacerze', tr: 'Yürüyüşte gülümseyen bir misafir köpek' } },
  { src: '/photos/walks-grass.webp', category: 'walks', ...landscape, alt: { en: 'A sunny afternoon in the park with Monti', pl: 'Słoneczne popołudnie w parku z Montim', tr: 'Monti ile parkta güneşli bir öğleden sonra' } },
  { src: '/photos/dogs-forest-walk.webp', category: 'dogs', ...portrait, alt: { en: 'A walk in the woods with two dogs', pl: 'Spacer po lesie z dwoma psami', tr: 'İki köpekle ormanda yürüyüş' } },
  { src: '/photos/walks-jump.webp', category: 'walks', ...portrait, alt: { en: 'Monti jumping up for a hug', pl: 'Monti skacze, żeby się przytulić', tr: 'Monti sarılmak için zıplıyor' } },
  { src: '/photos/dogs-yellow-boots.webp', category: 'dogs', ...portrait, alt: { en: 'An evening walk with a guest dog', pl: 'Wieczorny spacer z psim gościem', tr: 'Misafir bir köpekle akşam yürüyüşü' } },
  { src: '/photos/walks-seaside.webp', category: 'walks', ...portrait, alt: { en: 'Resting by the sea with a furry friend', pl: 'Odpoczynek nad morzem z futrzanym przyjacielem', tr: 'Tüylü bir dostla deniz kenarında mola' } },
  { src: '/photos/dogs-car-selfie.webp', category: 'dogs', ...portrait, alt: { en: 'Car selfie with Dost, the dog Gökçen rescued in Turkey', pl: 'Selfie w samochodzie z Dostem, psem uratowanym przez Gökçen w Turcji', tr: 'Gökçen’in Türkiye’de kurtardığı Dost ile araba selfiesi' } },
  { src: '/photos/walks-winter.webp', category: 'walks', ...portrait, alt: { en: 'Winter walk — Monti in his hi-vis jacket', pl: 'Zimowy spacer — Monti w odblaskowej kurtce', tr: 'Kış yürüyüşü — Monti reflektörlü montunda' } },
  { src: '/photos/monti-family.webp', category: 'home', ...phone, alt: { en: 'Family selfie — Monti sticking his tongue out', pl: 'Rodzinne selfie — Monti pokazuje język', tr: 'Aile selfiesi — Monti dilini çıkarıyor' } },
  { src: '/photos/home-sofa.webp', category: 'home', ...phone, alt: { en: 'Lazy evening on the sofa with Monti', pl: 'Leniwy wieczór na kanapie z Montim', tr: 'Monti ile kanepede tembel bir akşam' } },
  { src: '/photos/walks-summer.webp', category: 'walks', ...portrait, alt: { en: 'Summer walk with Monti', pl: 'Letni spacer z Montim', tr: 'Monti ile yaz yürüyüşü' } },
  { src: '/photos/dogs-night-walk.webp', category: 'dogs', ...landscape, alt: { en: 'Late-night walk and ice cream with Dost in Turkey', pl: 'Nocny spacer i lody z Dostem w Turcji', tr: 'Türkiye’de Dost ile gece yürüyüşü ve dondurma' } },
];

export interface Guest {
  name: string;
  src: string;
  word?: string;
  position?: string;
  // Shown on the site only once the dog's owner has said OK.
  ownerOk: boolean;
}

// "Meet the guests" — dogs she has looked after.
export const guests: Guest[] = [
  { name: 'Dost', src: '/photos/dogs-car-selfie.webp', word: 'dost (“friend” in Turkish)', position: 'center 45%', ownerOk: true },
  { name: 'Daisy', src: '/photos/guest-daisy.webp', ownerOk: true },
  // TODO: ask Majla's and Majster's owners, then set ownerOk: true.
  { name: 'Majla', src: '/photos/dogs-dachshund.webp', position: 'center 60%', ownerOk: false },
  { name: 'Majster', src: '/photos/dogs-black-closeup.webp', position: 'center 40%', ownerOk: false },
];

// Monti, our own dog. First photo is the big one.
export const montiPhotos: Photo[] = [
  { src: '/photos/monti-stick.webp', category: 'walks', width: 675, height: 1200, position: 'center 45%', alt: { en: 'Monti proudly carrying a stick', pl: 'Monti dumnie niesie patyk', tr: 'Monti gururla bir sopa taşıyor' } },
  { src: '/photos/monti-car.webp', category: 'walks', ...phone, position: 'center 30%', alt: { en: 'Monti resting his head on Gökçen’s shoulder', pl: 'Monti opiera głowę na ramieniu Gökçen', tr: 'Monti başını Gökçen’in omzuna yaslamış' } },
  { src: '/photos/monti-closeup.webp', category: 'home', width: 900, height: 1200, position: 'center 50%', alt: { en: 'Monti smiling into the camera', pl: 'Monti uśmiecha się do aparatu', tr: 'Monti kameraya gülümsüyor' } },
];
