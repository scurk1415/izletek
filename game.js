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
    riddle: 'Notri je vedno zima, tudi poleti. Luč se prižge, ko odpreš vrata, mleko in sir pa čakata, da ju vzameš.'
  },
  {
    id: 'pillow',
    word: 'sanje',
    aliases: ['sanj'],
    letter: 'A',
    trip: 'Greva proti zahodu, tja, kjer so gore višje od valov.',
    riddle: 'Vsako noč nosim tvojo glavo. Mehka sem, a tvojih sanj ne izdam nikomur.'
  },
  {
    id: 'shoe',
    word: 'par',
    letter: 'E',
    trip: 'Tam teče reka tako zelenomodra, da ji pravijo smaragdna lepotica.',
    riddle: 'Midva sva par in vedno hodiva skupaj. Čez dan te nosiva, ponoči spiva pri vratih.'
  },
  {
    id: 'mirror',
    word: 'odsev',
    letter: 'N',
    trip: 'Nad dolino bdi gora, visoka 2244 metrov.',
    riddle: 'Pokažem ti tvoj obraz, a nisem slika. Zjutraj me pogledaš, preden greš od doma.'
  },
  {
    id: 'car',
    word: 'kolesa',
    letter: 'B',
    trip: 'Mesto ob tej reki slovi po muzeju prve svetovne vojne, slapu Kozjak in kobariških štrukljih.',
    riddle: 'Imam štiri kolesa, a nisem voziček. Z mano bosta kmalu na poti, ptiček moj.'
  },
  {
    id: 'envelope',
    word: 'oblak',
    aliases: ['oblaki'],
    letter: 'E',
    trip: 'Ne bova spala v mestu, ampak visoko nad njim, nad oblaki, s pogledom na vso dolino in gore. Kraj je tako lep, da so ga poimenovali po raju.',
    riddle: 'Sem iz papirja, zaprta in zalepljena. V meni čaka zadnje presenečenje.'
  }
];

function stripDiacritics(value) {
  return String(value || '').normalize('NFD').replace(/[̀-ͯ]/g, '');
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
