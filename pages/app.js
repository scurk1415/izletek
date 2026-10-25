import {
  FINAL_WORD,
  GAME_STEPS,
  MAX_FINAL_ATTEMPTS,
  isCorrectWordGuess,
  normalizeWord,
  scoreGuess
} from '../game.js';

const app = document.querySelector('#app');
const WORD_LENGTH = FINAL_WORD.length;
const KEYBOARD_ROWS = ['QWERTZUIOP', 'ASDFGHJKL', 'YXCVBNM'];
const STATE_RANK = { absent: 1, present: 2, correct: 3 };

const state = {
  step: 0,
  phase: 'word',
  foundLetters: [],
  error: '',
  guesses: [],
  current: '',
  justSubmitted: false
};

let lastScreen = '';

function progressDots() {
  return `
    <div class="progress" aria-label="Napredek">
      ${GAME_STEPS.map((_, i) => {
        const cls = i < state.step ? 'done' : i === state.step ? 'active' : '';
        return `<span class="dot ${cls}"></span>`;
      }).join('')}
    </div>
  `;
}

function letterSlots() {
  return `
    <div class="letters">
      ${GAME_STEPS.map((_, i) => {
        const letter = state.foundLetters[i];
        return letter
          ? `<span class="letter-pill">${letter}</span>`
          : '<span class="letter-pill empty">?</span>';
      }).join('')}
    </div>
  `;
}

function render() {
  if (!app) {
    return;
  }

  const screen = `${state.phase}:${state.step}`;
  app.classList.toggle('animate', screen !== lastScreen);
  lastScreen = screen;

  if (state.phase === 'final') {
    renderFinal();
    return;
  }

  if (state.phase === 'success') {
    renderSuccess();
    return;
  }

  const current = GAME_STEPS[state.step];
  const stepNumber = state.step + 1;

  app.innerHTML = `
    <header class="hero">
      <div class="badge">Korak ${stepNumber} / ${GAME_STEPS.length}</div>
      <h1>Lov na zaklad</h1>
      ${progressDots()}
    </header>

    <section class="card trip-card">
      <div class="card-label">🧭 Kam greva?</div>
      <p class="trip-text">${current.trip}</p>
    </section>

    <section class="card riddle-card">
      <div class="card-label">🔎 Uganka</div>
      <p class="riddle-text">${current.riddle}</p>
      ${state.phase === 'word'
        ? `
          <form id="word-form" class="form-grid">
            <div>
              <label for="word-input">Kaj piše na skrivnem listku?</label>
              <input id="word-input" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="skrivna beseda" />
            </div>
            <button type="submit">Preveri besedo</button>
          </form>
          ${state.error ? `<div class="error">${state.error}</div>` : ''}
        `
        : `
          <div class="reveal">
            <p>Pravilno! Tvoja skrita črka je</p>
            <span class="reveal-letter">${current.letter}</span>
          </div>
          <button type="button" id="next-step" class="wide">
            ${state.step + 1 < GAME_STEPS.length ? 'Naprej na naslednjo uganko' : 'Na zadnji izziv'}
          </button>
        `}
    </section>

    <section class="card">
      <div class="card-label">✉️ Zbrane črke</div>
      ${letterSlots()}
    </section>
  `;

  document.querySelector('#word-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const guess = document.querySelector('#word-input')?.value ?? '';
    if (isCorrectWordGuess(guess, state.step)) {
      state.phase = 'reveal';
      state.error = '';
      state.foundLetters.push(current.letter);
    } else {
      state.error = 'Beseda ni pravilna. Poskusi znova.';
    }
    render();
  });

  document.querySelector('#next-step')?.addEventListener('click', () => {
    state.step += 1;
    state.phase = state.step >= GAME_STEPS.length ? 'final' : 'word';
    render();
  });

  document.querySelector('#word-input')?.focus();
}

function keyStates() {
  const states = {};
  state.guesses.forEach((guess) => {
    scoreGuess(guess).forEach((result, i) => {
      const char = guess[i];
      if (!states[char] || STATE_RANK[result] > STATE_RANK[states[char]]) {
        states[char] = result;
      }
    });
  });
  return states;
}

function renderFinal() {
  const rows = [];
  for (let r = 0; r < MAX_FINAL_ATTEMPTS; r += 1) {
    const guess = state.guesses[r];
    const isCurrent = r === state.guesses.length;
    const scores = guess ? scoreGuess(guess) : [];
    const text = guess ?? (isCurrent ? state.current : '');
    const tiles = Array.from({ length: WORD_LENGTH }, (_, i) => {
      const char = text[i] ?? '';
      const cls = guess ? scores[i] : char ? 'filled' : '';
      return `<span class="tile ${cls}" style="--i:${i}">${char}</span>`;
    }).join('');
    const rowClass = isCurrent && state.error
      ? 'shake'
      : state.justSubmitted && r === state.guesses.length - 1 ? 'just-revealed' : '';
    rows.push(`<div class="tile-row ${rowClass}">${tiles}</div>`);
  }

  const keys = keyStates();
  const keyboard = KEYBOARD_ROWS.map((row, rowIndex) => {
    const letterKeys = row.split('').map((char) =>
      `<button type="button" class="key ${keys[char] ?? ''}" data-key="${char}">${char}</button>`
    ).join('');
    const extra = rowIndex === KEYBOARD_ROWS.length - 1
      ? `<button type="button" class="key wide-key" data-key="ENTER">Vnesi</button>${letterKeys}<button type="button" class="key wide-key" data-key="BACKSPACE" aria-label="Briši">⌫</button>`
      : letterKeys;
    return `<div class="key-row">${extra}</div>`;
  }).join('');

  const outOfTries = state.guesses.length >= MAX_FINAL_ATTEMPTS;

  app.innerHTML = `
    <header class="hero">
      <div class="badge">Zadnji izziv</div>
      <h1>Kam greva?</h1>
      <p class="subtitle">Zbrane črke so pomešane. Sestavi iz njih ime kraja. Imaš ${MAX_FINAL_ATTEMPTS} poskusov.</p>
    </header>

    <section class="card">
      <div class="card-label">✉️ Tvoje črke</div>
      ${letterSlots()}
    </section>

    <section class="card wordle-card">
      <div class="board">${rows.join('')}</div>
      ${state.error ? `<div class="error">${state.error}</div>` : ''}
      ${outOfTries
        ? '<button type="button" id="retry" class="wide">Poskusi znova</button>'
        : `<div class="keyboard">${keyboard}</div>`}
      <p class="legend">
        <span><span class="tile mini correct"></span> pravo mesto</span>
        <span><span class="tile mini present"></span> napačno mesto</span>
        <span><span class="tile mini absent"></span> ni v besedi</span>
      </p>
    </section>
  `;

  app.querySelectorAll('.key').forEach((button) => {
    button.addEventListener('click', () => handleKey(button.dataset.key));
  });

  document.querySelector('#retry')?.addEventListener('click', () => {
    state.guesses = [];
    state.current = '';
    state.error = '';
    state.justSubmitted = false;
    render();
  });
}

function handleKey(key) {
  if (state.phase !== 'final' || state.guesses.length >= MAX_FINAL_ATTEMPTS) {
    return;
  }

  state.error = '';
  state.justSubmitted = false;

  if (key === 'ENTER') {
    if (state.current.length < WORD_LENGTH) {
      state.error = `Beseda mora imeti ${WORD_LENGTH} črk.`;
    } else {
      const guess = state.current;
      state.guesses.push(guess);
      state.current = '';
      state.justSubmitted = true;
      if (guess === FINAL_WORD) {
        render();
        setTimeout(() => {
          state.phase = 'success';
          render();
        }, 1600);
        return;
      }
      if (state.guesses.length >= MAX_FINAL_ATTEMPTS) {
        state.error = 'Zmanjkalo je poskusov. Premešaj črke in poskusi znova.';
      }
    }
  } else if (key === 'BACKSPACE') {
    state.current = state.current.slice(0, -1);
  } else if (state.current.length < WORD_LENGTH) {
    state.current += normalizeWord(key).slice(0, 1);
  }

  render();
}

document.addEventListener('keydown', (event) => {
  if (state.phase !== 'final' || event.ctrlKey || event.metaKey || event.altKey) {
    return;
  }
  if (event.key === 'Enter') {
    event.preventDefault();
    handleKey('ENTER');
  } else if (event.key === 'Backspace') {
    handleKey('BACKSPACE');
  } else if (/^[a-zA-Z]$/.test(event.key)) {
    handleKey(event.key.toUpperCase());
  }
});

function renderSuccess() {
  const images = [
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80'
  ];

  app.innerHTML = `
    <header class="hero success">
      <div class="badge">Cilj dosežen 🎉</div>
      <h1 class="final-word">${FINAL_WORD.split('').map((char, i) => `<span style="--i:${i}">${char}</span>`).join('')}</h1>
      <p class="subtitle">Bravo! Greva v <strong>Nebesa Chalets</strong> nad Kobaridom – visoko nad oblaki, s pogledom na dolino Soče in Krn.</p>
    </header>

    <section class="card">
      <div class="gallery">
        ${images.map((src) => `<img src="${src}" alt="Gorska pokrajina" loading="lazy" />`).join('')}
      </div>
      <button class="secondary wide" type="button" id="play-again">Začni znova</button>
    </section>
  `;

  document.querySelector('#play-again')?.addEventListener('click', () => {
    state.step = 0;
    state.phase = 'word';
    state.foundLetters = [];
    state.error = '';
    state.guesses = [];
    state.current = '';
    render();
  });
}

render();
