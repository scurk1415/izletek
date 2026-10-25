import test from 'node:test';
import assert from 'node:assert/strict';

import {
  GAME_STEPS,
  checkFinalWord,
  isCorrectLetterGuess,
  isCorrectWordGuess,
  normalizeAnswer,
  normalizeLetterInput
} from '../game.js';

test('correct word and letter checks use the configured clue sequence', () => {
  assert.equal(isCorrectWordGuess('mleko', 0), true);
  assert.equal(isCorrectWordGuess('hladilnik', 0), false);
  assert.equal(isCorrectLetterGuess('n', 0), true);
  assert.equal(isCorrectLetterGuess('a', 0), false);
  assert.equal(GAME_STEPS.length, 6);
  assert.equal(GAME_STEPS[1].word, 'sanj');
});

test('final answer accepts the hidden letters in any order and ignores non-letter characters', () => {
  assert.equal(checkFinalWord('NEBESA'), true);
  assert.equal(checkFinalWord('A N E S E B'), true);
  assert.equal(checkFinalWord('NEBES'), false);
  assert.equal(normalizeAnswer('a-n-e-b-e-s-a'), 'AABEENS');
  assert.equal(normalizeLetterInput('??a!!'), 'A');
});
