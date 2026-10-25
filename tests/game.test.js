import test from 'node:test';
import assert from 'node:assert/strict';

import {
  FINAL_WORD,
  GAME_STEPS,
  checkFinalWord,
  isCorrectLetterGuess,
  isCorrectWordGuess,
  normalizeAnswer,
  normalizeLetterInput,
  scoreGuess
} from '../game.js';

test('word checks ignore case, whitespace and accept aliases', () => {
  assert.equal(isCorrectWordGuess('mleko', 0), true);
  assert.equal(isCorrectWordGuess('  MLEKO ', 0), true);
  assert.equal(isCorrectWordGuess('hladilnik', 0), false);
  assert.equal(isCorrectWordGuess('sanje', 1), true);
  assert.equal(isCorrectWordGuess('sanj', 1), true);
  assert.equal(isCorrectWordGuess('mleko', 99), false);
  assert.equal(GAME_STEPS.length, 6);
});

test('hidden letters form the final word but are not handed out in order', () => {
  const letters = GAME_STEPS.map((step) => step.letter).join('');
  assert.equal(normalizeAnswer(letters), normalizeAnswer(FINAL_WORD));
  assert.notEqual(letters, FINAL_WORD);
  assert.equal(isCorrectLetterGuess('s', 0), true);
  assert.equal(normalizeLetterInput('??a!!'), 'A');
});

test('clues never give away the final word', () => {
  GAME_STEPS.forEach((step) => {
    assert.equal(`${step.trip} ${step.riddle}`.toUpperCase().includes(FINAL_WORD), false);
  });
});

test('final word must be spelled in the right order', () => {
  assert.equal(checkFinalWord('nebesa'), true);
  assert.equal(checkFinalWord('N E B E S A'), true);
  assert.equal(checkFinalWord('ANESEB'), false);
});

test('scoreGuess marks letters like Wordle, handling duplicates', () => {
  assert.deepEqual(scoreGuess('NEBESA'), Array(6).fill('correct'));
  assert.deepEqual(scoreGuess('SEBANE'), ['present', 'correct', 'correct', 'present', 'present', 'present']);
  assert.deepEqual(scoreGuess('EEEEEE'), ['absent', 'correct', 'absent', 'correct', 'absent', 'absent']);
  assert.deepEqual(scoreGuess('KOLESA'), ['absent', 'absent', 'absent', 'correct', 'correct', 'correct']);
});
