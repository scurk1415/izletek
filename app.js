import {
  GAME_STEPS,
  checkFinalWord,
  isCorrectLetterGuess,
  isCorrectWordGuess,
  normalizeLetterInput,
  normalizeAnswer
} from './game.js';

const app = document.querySelector('#app');

const state = {
  step: 0,
  phase: 'word',
  foundLetters: [],
  error: '',
  info: '',
  finalSolved: false
};

function titleCase(value) {
  return String(value || '').replace(/\b\w/g, (char) => char.toUpperCase());
}

function render() {
  if (!app) {
    return;
  }

  const totalSteps = GAME_STEPS.length;
  const current = GAME_STEPS[state.step] ?? null;

  if (!current && state.phase !== 'final') {
    state.phase = 'final';
  }

  if (state.phase === 'final') {
    app.innerHTML = `
      <section class="card">
        <div class="badge">Zaključek</div>
        <h1>Čestitke!</h1>
        <p class="subtitle">Zbral(a) si vse skrite črke: <strong>${state.foundLetters.join(', ')}</strong>.</p>
        <p class="subtitle">Sestavi jih v pravo besedo — vrstni red ni pomemben, samo da je rezultat <strong>NEBESA</strong>.</p>
        <form id="final-form" class="form-grid">
          <div>
            <label for="final-answer">Vnesi geslo</label>
            <input id="final-answer" name="final-answer" type="text" autocomplete="off" placeholder="npr. S E B A N A" />
          </div>
          <button type="submit">Preveri geslo</button>
        </form>
        ${state.error ? `<div class="error">${state.error}</div>` : ''}
        ${state.info ? `<div class="flash" style="margin-top: 16px;">${state.info}</div>` : ''}
      </section>
    `;

    const finalForm = document.querySelector('#final-form');
    finalForm?.addEventListener('submit', (event) => {
      event.preventDefault();
      const answer = document.querySelector('#final-answer')?.value ?? '';
      if (checkFinalWord(answer)) {
        state.finalSolved = true;
        state.error = '';
        state.info = 'Pravilno! Uspelo ti je sestaviti besedo NEBESA.';
        renderSuccess();
      } else {
        state.error = 'To geslo še ni pravilno. Poskusi znova.';
        state.info = '';
        render();
      }
    });

    return;
  }

  app.innerHTML = `
    <section class="card">
      <div class="badge">Korak ${Math.min(state.step + 1, totalSteps)} / ${totalSteps}</div>
      <h1>Lov na zaklad</h1>
      <p class="subtitle">${current.clue}</p>
      <p class="muted">Skrivališče: <strong>${titleCase(current.location)}</strong></p>
      ${state.phase === 'word'
        ? `
          <form id="word-form" class="form-grid">
            <div>
              <label for="word-input">Vnesi skrivnostno besedo</label>
              <input id="word-input" type="text" autocomplete="off" placeholder="npr. hladilnik" />
            </div>
            <button type="submit">Preveri besedo</button>
          </form>
        `
        : `
          <div class="flash">Prav! V tej uganki je skrita črka <strong>${current.letter}</strong>. Vpiši jo.</div>
          <form id="letter-form" class="form-grid">
            <div>
              <label for="letter-input">Vnesi skrito črko</label>
              <input id="letter-input" type="text" maxlength="1" autocomplete="off" placeholder="A" />
            </div>
            <button type="submit">Shrani črko</button>
          </form>
        `}
      <div class="letters">
        ${state.foundLetters.length
          ? state.foundLetters.map((letter) => `<span class="letter-pill">${letter}</span>`).join('')
          : '<span class="muted">Še ni najdenih črk.</span>'}
      </div>
      ${state.error ? `<div class="error" style="margin-top: 16px;">${state.error}</div>` : ''}
      ${state.info ? `<div class="flash" style="margin-top: 16px;">${state.info}</div>` : ''}
    </section>
  `;

  const wordForm = document.querySelector('#word-form');
  if (wordForm) {
    wordForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = document.querySelector('#word-input');
      const guess = input?.value ?? '';
      if (isCorrectWordGuess(guess, state.step)) {
        state.phase = 'letter';
        state.error = '';
        state.info = '';
        render();
      } else {
        state.error = 'Beseda ni pravilna. Poskusi znova.';
        state.info = '';
        render();
      }
    });
  }

  const letterForm = document.querySelector('#letter-form');
  if (letterForm) {
    letterForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = document.querySelector('#letter-input');
      const guess = normalizeLetterInput(input?.value ?? '');
      if (isCorrectLetterGuess(guess, state.step)) {
        state.foundLetters.push(current.letter);
        state.error = '';
        state.info = `Črka ${current.letter} je pravilna. Nadaljujemo na naslednjo lokacijo.`;
        state.step += 1;
        state.phase = state.step >= totalSteps ? 'final' : 'word';
        render();
      } else {
        state.error = 'Ta črka ni pravilna. Preveri skrivnostni znak.';
        state.info = '';
        render();
      }
    });
  }
}

function renderSuccess() {
  const images = [
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80'
  ];

  app.innerHTML = `
    <section class="card">
      <div class="badge">Nebo je bilo doseženo</div>
      <h1>NEBESA</h1>
      <p class="subtitle">Pravilno si sestavil(a) skrito besedo. Tukaj so nekaj slik iz Nebesa Challets, da si ob njih zatrdimo doživetje.</p>
      <div class="gallery">
        ${images.map((src) => `<img src="${src}" alt="Nebesa Challets" />`).join('')}
      </div>
      <div class="letters" style="margin-top: 20px;">
        ${state.foundLetters.map((letter) => `<span class="letter-pill">${letter}</span>`).join('')}
      </div>
      <div style="margin-top: 20px;">
        <button class="secondary" type="button" id="play-again">Začni znova</button>
      </div>
    </section>
  `;

  document.querySelector('#play-again')?.addEventListener('click', () => {
    state.step = 0;
    state.phase = 'word';
    state.foundLetters = [];
    state.error = '';
    state.info = '';
    state.finalSolved = false;
    render();
  });
}

render();
