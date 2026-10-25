export const FINAL_WORD = 'NEBESA';
export const MAX_FINAL_ATTEMPTS = 6;

// Letters are deliberately handed out out of order (S, A, E, N, B, E),
// so the final word has to be unscrambled.
export const GAME_STEPS = [
  {
    id: 'fridge',
    word: 'mleko',
    letter: 'S',
    trip: 'Ne greva v tujino. Ostaneva doma, v Sloveniji.',
    riddle: [
      'Ves dan tiho brnim, a v meni je mraz,',
      'lučka zasveti, ko pokažeš obraz.',
      'Ko te ponoči lakota k meni privabi,',
      'vzemi, kar želiš, le vrat zapreti ne pozabi!'
    ].join('\n')
  },
  {
    id: 'pillow',
    word: 'sanje',
    aliases: ['sanj'],
    letter: 'A',
    trip: 'Greva proti zahodu, tja, kjer so gore višje od valov.',
    riddle: [
      'Ko luna posveti in dan se poslovi,',
      'na meni tvoja glava sladko zaspi.',
      'Vse tvoje sanje poznam, a sem tiha kot miš,',
      'in vem, na kateri strani najraje ležiš.'
    ].join('\n')
  },
  {
    id: 'shoe',
    word: 'par',
    letter: 'E',
    trip: 'Tam teče reka tako zelenomodra, da ji pravijo smaragdna lepotica.',
    riddle: [
      'Dvojčka sva, a nikoli ne govoriva,',
      'čeprav vsak svoj jeziček imava.',
      'Čez dan te zvesto po svetu nosiva,',
      'ponoči pri vratih utrujena spiva.'
    ].join('\n')
  },
  {
    id: 'mirror',
    word: 'odsev',
    letter: 'N',
    trip: 'Nad dolino bdi gora, visoka 2244 metrov.',
    riddle: [
      'Vsako jutro te vidim, ko si še zaspana,',
      'kuštrava, smešna in malo zmečkana.',
      'Kar narediš ti, ponovim tudi jaz,',
      'le levo in desno zamenjam vsak čas.'
    ].join('\n')
  },
  {
    id: 'car',
    word: 'kolesa',
    letter: 'B',
    trip: 'Mesto ob tej reki slovi po muzeju prve svetovne vojne, slapu Kozjak in kobariških štrukljih.',
    riddle: [
      'Štiri okrogle noge imam, a nikoli ne hodim,',
      'ko me napojiš, daleč po svetu te vodim.',
      'Pred hišo potrpežljivo čakam ves dan,',
      'da ključ obrneš in te odpeljem drugam.'
    ].join('\n')
  },
  {
    id: 'coffee',
    word: 'jutro',
    letter: 'E',
    trip: 'Ne bova spala v mestu, ampak visoko nad njim, nad oblaki, s pogledom na vso dolino in gore. Kraj je tako lep, da so ga poimenovali po raju.',
    riddle: [
      'Vsako jutro zabrnim, zasikam, zadišim,',
      'z vročim napojem zaspanost ti zbrišem.',
      'Brez mene je jutro kot dan brez sonca —',
      'podstavi skodelico in pij do konca!'
    ].join('\n')
  }
];

function stripDiacritics(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function normalizeLetterInput(value) {
  return stripDiacritics(value).toUpperCase().replace(/[^A-Z]/g, '').slice(0, 1);
}

export function normalizeWord(value) {
  return stripDiacritics(value).toUpperCase().replace(/[^A-Z]/g, '');
}

export function normalizeAnswer(value) {
  return normalizeWord(value).split('').sort().join('');
}

export function isCorrectWordGuess(guess, index = 0) {
  const step = GAME_STEPS[index];
  if (!step) {
    return false;
  }
  const normalized = normalizeWord(guess);
  return [step.word, ...(step.aliases ?? [])].some((word) => normalizeWord(word) === normalized);
}

export function isCorrectLetterGuess(guess, index = 0) {
  const expected = GAME_STEPS[index]?.letter ?? '';
  return normalizeLetterInput(guess) === expected;
}

export function checkFinalWord(guess) {
  return normalizeWord(guess) === FINAL_WORD;
}

// Wordle-style scoring: 'correct' (right spot), 'present' (elsewhere), 'absent'.
export function scoreGuess(guess, target = FINAL_WORD) {
  const letters = normalizeWord(guess).split('');
  const answer = normalizeWord(target).split('');
  const result = letters.map(() => 'absent');
  const remaining = {};

  answer.forEach((char, i) => {
    if (letters[i] === char) {
      result[i] = 'correct';
    } else {
      remaining[char] = (remaining[char] ?? 0) + 1;
    }
  });

  letters.forEach((char, i) => {
    if (result[i] !== 'correct' && remaining[char] > 0) {
      result[i] = 'present';
      remaining[char] -= 1;
    }
  });

  return result;
}
