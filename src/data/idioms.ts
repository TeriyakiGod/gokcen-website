// Dog-themed English idioms for "Word of the day" and the dogs' speech bubbles.
export interface Idiom {
  phrase: string;
  meaning: string;
  example: string;
  hint: { pl: string; tr: string };
}

export const idioms: Idiom[] = [
  {
    phrase: 'Barking up the wrong tree',
    meaning: 'Blaming the wrong person or looking in the wrong place.',
    example: 'If you think I ate your sandwich, you’re barking up the wrong tree!',
    hint: { pl: 'szukać winnego nie tam, gdzie trzeba', tr: 'yanlış kapıyı çalmak' },
  },
  {
    phrase: 'It’s raining cats and dogs',
    meaning: 'It’s raining very heavily.',
    example: 'Take an umbrella — it’s raining cats and dogs.',
    hint: { pl: 'leje jak z cebra', tr: 'bardaktan boşanırcasına yağıyor' },
  },
  {
    phrase: 'Let sleeping dogs lie',
    meaning: 'Don’t bring up an old problem that could cause trouble.',
    example: 'They had a fight years ago, so let sleeping dogs lie.',
    hint: { pl: 'nie rozdrapywać starych ran', tr: 'eski defterleri açmamak' },
  },
  {
    phrase: 'Every dog has its day',
    meaning: 'Everyone gets a moment of success eventually.',
    example: 'Don’t give up — every dog has its day.',
    hint: { pl: 'każdy ma swoje pięć minut', tr: 'her köpeğin bir günü vardır' },
  },
  {
    phrase: 'Dog-tired',
    meaning: 'Extremely tired.',
    example: 'After the long walk, we were both dog-tired.',
    hint: { pl: 'padnięty, wykończony', tr: 'çok yorgun, bitkin' },
  },
  {
    phrase: 'The top dog',
    meaning: 'The most important or successful person in a group.',
    example: 'She’s the top dog in her company now.',
    hint: { pl: 'najważniejsza osoba, szef', tr: 'en önemli kişi, patron' },
  },
  {
    phrase: 'Puppy love',
    meaning: 'A sweet, innocent first love.',
    example: 'At fourteen, it was just puppy love.',
    hint: { pl: 'szczenięca miłość', tr: 'ilk gençlik aşkı' },
  },
  {
    phrase: 'In the doghouse',
    meaning: 'In trouble because someone is annoyed with you.',
    example: 'He forgot her birthday, so he’s in the doghouse.',
    hint: { pl: 'mieć przechlapane', tr: 'birinin gözünden düşmek' },
  },
  {
    phrase: 'Work like a dog',
    meaning: 'To work very hard.',
    example: 'I worked like a dog to pass that exam.',
    hint: { pl: 'harować jak wół', tr: 'köle gibi çalışmak' },
  },
  {
    phrase: 'You can’t teach an old dog new tricks',
    meaning: 'It’s hard to change someone’s habits — though our students prove it wrong!',
    example: 'My grandpa learned to use a smartphone — so you CAN teach an old dog new tricks.',
    hint: { pl: 'starych drzew się nie przesadza', tr: 'eski köye yeni adet getirilmez' },
  },
  {
    phrase: 'A dog’s breakfast',
    meaning: 'A complete mess.',
    example: 'My first essay was a dog’s breakfast.',
    hint: { pl: 'kompletny bałagan', tr: 'tam bir karmaşa' },
  },
  {
    phrase: 'Sick as a dog',
    meaning: 'Very ill.',
    example: 'I was sick as a dog all weekend.',
    hint: { pl: 'bardzo chory', tr: 'çok hasta' },
  },
];

export function idiomOfTheDay(date = new Date()): Idiom {
  const day = Math.floor(date.getTime() / 86_400_000);
  return idioms[day % idioms.length];
}
