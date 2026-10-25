import {
  FINAL_WORD,
  GAME_STEPS,
  MAX_FINAL_ATTEMPTS,
  isCorrectWordGuess,
  scoreGuess
} from '../game.js';

const app = document.querySelector('#app');
const WORD_LENGTH = FINAL_WORD.length;

const state = {
  step: 0,
  phase: 'word',
  foundLetters: [],
  error: '',
  guesses: [],
  picked: [],
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

function currentGuess() {
  return state.picked.map((index) => state.foundLetters[index]).join('');
}

function renderFinal() {
  const rows = [];
  for (let r = 0; r < MAX_FINAL_ATTEMPTS; r += 1) {
    const guess = state.guesses[r];
    const isCurrent = r === state.guesses.length;
    const scores = guess ? scoreGuess(guess) : [];
    const tiles = Array.from({ length: WORD_LENGTH }, (_, i) => {
      if (guess) {
        return `<span class="tile ${scores[i]}" style="--i:${i}">${guess[i]}</span>`;
      }
      if (isCurrent && state.picked[i] !== undefined) {
        return `<button type="button" class="tile filled" data-action="unpick" data-pos="${i}" aria-label="Odstrani črko">${state.foundLetters[state.picked[i]]}</button>`;
      }
      return '<span class="tile"></span>';
    }).join('');
    const rowClass = isCurrent && state.error
      ? 'shake'
      : state.justSubmitted && r === state.guesses.length - 1 ? 'just-revealed' : '';
    rows.push(`<div class="tile-row ${rowClass}">${tiles}</div>`);
  }

  const solved = state.guesses.includes(FINAL_WORD);
  const outOfTries = !solved && state.guesses.length >= MAX_FINAL_ATTEMPTS;
  const full = state.picked.length === WORD_LENGTH;

  const tray = state.foundLetters.map((letter, index) => {
    const used = state.picked.includes(index);
    return `<button type="button" class="tray-letter" data-action="pick" data-index="${index}" ${used ? 'disabled' : ''}>${letter}</button>`;
  }).join('');

  app.innerHTML = `
    <header class="hero">
      <div class="badge">Zadnji izziv</div>
      <h1>Kam greva?</h1>
      <p class="subtitle">Zbrane črke so pomešane. Tapni jih v pravem vrstnem redu in sestavi ime kraja. Imaš ${MAX_FINAL_ATTEMPTS} poskusov.</p>
    </header>

    <section class="card wordle-card">
      <div class="board">${rows.join('')}</div>
      ${state.error ? `<div class="error">${state.error}</div>` : ''}
      ${solved
        ? ''
        : outOfTries
          ? '<button type="button" class="wide" data-action="retry">Poskusi znova</button>'
          : `
            <div class="tray">${tray}</div>
            <div class="tray-actions">
              <button type="button" class="secondary" data-action="clear" ${state.picked.length ? '' : 'disabled'}>Pobriši</button>
              <button type="button" data-action="submit" ${full ? '' : 'disabled'}>Preveri</button>
            </div>
          `}
      <p class="legend">
        <span><span class="tile mini correct"></span> pravo mesto</span>
        <span><span class="tile mini present"></span> napačno mesto</span>
      </p>
    </section>
  `;
}

function pick(index) {
  if (state.picked.length < WORD_LENGTH && !state.picked.includes(index) && state.foundLetters[index]) {
    state.picked.push(index);
  }
}

function submitGuess() {
  if (state.picked.length < WORD_LENGTH) {
    state.error = 'Uporabi vse zbrane črke.';
    return;
  }
  const guess = currentGuess();
  state.guesses.push(guess);
  state.picked = [];
  state.justSubmitted = true;
  if (guess === FINAL_WORD) {
    setTimeout(() => {
      state.phase = 'success';
      render();
    }, 1600);
  } else if (state.guesses.length >= MAX_FINAL_ATTEMPTS) {
    state.error = 'Zmanjkalo je poskusov. Poskusi znova.';
  }
}

function handleFinalAction(action, data = {}) {
  if (state.phase !== 'final' || state.guesses.includes(FINAL_WORD)) {
    return;
  }

  state.error = '';
  state.justSubmitted = false;

  if (action === 'retry') {
    state.guesses = [];
    state.picked = [];
  } else if (state.guesses.length >= MAX_FINAL_ATTEMPTS) {
    return;
  } else if (action === 'pick') {
    pick(Number(data.index));
  } else if (action === 'unpick') {
    state.picked.splice(Number(data.pos), 1);
  } else if (action === 'clear') {
    state.picked = [];
  } else if (action === 'submit') {
    submitGuess();
  }

  render();
}

// One delegated listener survives every re-render of #app.
app?.addEventListener('click', (event) => {
  const target = event.target.closest('[data-action]');
  if (target && !target.disabled) {
    handleFinalAction(target.dataset.action, target.dataset);
  }
});

// Physical keyboard: only the collected letters can be typed.
document.addEventListener('keydown', (event) => {
  if (state.phase !== 'final' || event.ctrlKey || event.metaKey || event.altKey) {
    return;
  }
  if (event.key === 'Enter') {
    event.preventDefault();
    handleFinalAction('submit');
  } else if (event.key === 'Backspace') {
    handleFinalAction('unpick', { pos: state.picked.length - 1 });
  } else if (/^[a-zA-Z]$/.test(event.key)) {
    const letter = event.key.toUpperCase();
    const index = state.foundLetters.findIndex((char, i) => char === letter && !state.picked.includes(i));
    if (index !== -1) {
      handleFinalAction('pick', { index });
    }
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
    state.picked = [];
    state.justSubmitted = false;
    render();
  });
}

render();
