export const FINAL_WORD = 'NEBESA';

export const GAME_STEPS = [
  {
    id: 'fridge',
    location: 'Hladilnik',
    word: 'hladilnik',
    letter: 'A',
    clue: 'V hladilniku leži papir. Na njem je zapisano besedo, ki odpre naslednji korak.'
  },
  {
    id: 'backpack',
    location: 'Nahrbtnik',
    word: 'nahrbtnik',
    letter: 'N',
    clue: 'Papir je skrit v nahrbtniku, ki ga je mogoče najti ob stolu.'
  },
  {
    id: 'rack',
    location: 'Vešalnik',
    word: 'vesalnik',
    letter: 'E',
    clue: 'Na vešalniku visi list z napisano vlogo besedo.'
  },
  {
    id: 'bomb',
    location: 'Bomba',
    word: 'bomba',
    letter: 'B',
    clue: 'Na steni za kamnom je malo preoblečen papir z besedo bomba.'
  },
  {
    id: 'trash',
    location: 'Smetnjak',
    word: 'smetnjak',
    letter: 'S',
    clue: 'V spodnjem predalu je skrita skrivnostna beseda smetnjak.'
  },
  {
    id: 'palette',
    location: 'Paleta',
    word: 'paleta',
    letter: 'A',
    clue: 'Na paleti je še zadnji papir s črko, ki jo potrebuješ.'
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
