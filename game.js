export const FINAL_WORD = 'NEBESA';

export const GAME_STEPS = [
  {
    id: 'fridge',
    location: 'hladilnik',
    word: 'mleko',
    letter: 'N',
    clue: 'Ne gremo v tujino. Ostaneva doma, v Sloveniji. Notri je vedno zima, tudi poleti, luč se prižge, ko vrata odpreš, mleko in sir tam čakata, da ju vzameš.'
  },
  {
    id: 'pillow',
    location: 'pod blazino',
    word: 'sanj',
    letter: 'E',
    clue: 'Greva proti zahodu, ampak tam, kjer so gore višje od valov. Vsako noč nosim tvojo glavo, mehka sem, a tvojih sanj ne povem nikomur.'
  },
  {
    id: 'shoe',
    location: 'v čevlju',
    word: 'par',
    letter: 'B',
    clue: 'Tam teče reka tako zelena in modra, da ji pravijo smaragdna lepotica. Par naju je, vedno skupaj hodiva, čez dan te nosiva, ponoči pri vratih spiva.'
  },
  {
    id: 'mirror',
    location: 'ogledalo v kopalnici',
    word: 'odsev',
    letter: 'E',
    clue: 'Nad dolino bdi gora, visoka 2244 metrov. Pokažem ti tvoj obraz, a nisem slika, zjutraj me pogledaš, preden greš od doma.'
  },
  {
    id: 'car',
    location: 'v avtu',
    word: 'kolesa',
    letter: 'S',
    clue: 'Mesto ob tej reki je znano po muzeju prve svetovne vojne, slapu Kozjak in kobariških štrukljah. Imam štiri kolesa, a nisem voziček, z mano bova kmalu na poti, moj ptiček.'
  },
  {
    id: 'finale',
    location: 'pripravljena kuverta',
    word: 'sanj',
    letter: 'A',
    clue: 'Ne bova spala v mestu, ampak visoko nad njim, nad oblaki, s pogledom na celo dolino in gore. Kraj je tako lep, da mu niso mogli dati drugega imena kot: ' + FINAL_WORD + '.'
  }
];

export function normalizeLetterInput(value) {
  return String(value || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 1);
}

export function normalizeAnswer(value) {
  return String(value || '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .split('')
    .sort()
    .join('');
}

export function isCorrectWordGuess(guess, index = 0) {
  const expected = GAME_STEPS[index]?.word ?? '';
  return String(guess).trim().toLowerCase() === expected.toLowerCase();
}

export function isCorrectLetterGuess(guess, index = 0) {
  const expected = GAME_STEPS[index]?.letter ?? '';
  return normalizeLetterInput(guess) === expected;
}

export function checkFinalWord(guess) {
  return normalizeAnswer(guess) === normalizeAnswer(FINAL_WORD);
}
