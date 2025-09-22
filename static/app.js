const API = {
  emojis: () => fetch('/api/emojis').then(r => r.json()),
  register: (username, emojis) => fetch('/api/register', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, emojis })
  }).then(r => {
    if (!r.ok) return r.json().then(j => { throw new Error(j.detail || 'Register failed'); });
    return r.json();
  }),
  start: (username) => fetch('/api/login/start', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username })
  }).then(r => r.json()),
  submitRound: (session_id, selections) => fetch('/api/login/round', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id, selections })
  }).then(r => r.json()),
};

const state = {
  library: [],
  secretSize: 4,
  gridSize: 16,
  rounds: 3,
  selectedRegister: new Set(),
  session: null,
  currentGridSelections: new Set(),
};

function el(id) { return document.getElementById(id); }

function renderEmojiGrid(container, emojis, selectable = true, selectedSet = new Set()) {
  container.innerHTML = '';
  emojis.forEach((emoji, idx) => {
    const cell = document.createElement('button');
    cell.className = 'cell';
    cell.textContent = emoji;
    if (selectable) {
      if (selectedSet.has(emoji)) cell.classList.add('selected');
      cell.addEventListener('click', () => {
        if (selectedSet.has(emoji)) selectedSet.delete(emoji); else selectedSet.add(emoji);
        if (selectedSet.size > state.secretSize) {
          // keep constraint: at most secretSize selections
          const first = selectedSet.values().next().value;
          selectedSet.delete(first);
        }
        renderEmojiGrid(container, emojis, selectable, selectedSet);
      });
    } else {
      cell.disabled = true;
    }
    container.appendChild(cell);
  });
}

function showStatus(id, msg, ok = true) {
  const s = el(id);
  s.textContent = msg;
  s.className = 'status ' + (ok ? 'ok' : 'err');
}

async function init() {
  const meta = await API.emojis();
  state.library = meta.library;
  state.secretSize = meta.secret_size;
  state.gridSize = meta.grid_size;
  state.rounds = meta.rounds;
  const picker = el('emoji-picker');
  renderEmojiGrid(picker, state.library, true, state.selectedRegister);
}

el('btn-register').addEventListener('click', async () => {
  const username = el('reg-username').value.trim();
  if (!username) return showStatus('register-status', 'Username required', false);
  if (state.selectedRegister.size !== state.secretSize) return showStatus('register-status', `Pick exactly ${state.secretSize} emojis`, false);
  try {
    await API.register(username, Array.from(state.selectedRegister));
    showStatus('register-status', 'Registered');
  } catch (e) {
    showStatus('register-status', e.message, false);
  }
});

function renderRound(round) {
  el('challenge').classList.remove('hidden');
  el('round-title').textContent = `Round ${round.round_index + 1}`;
  state.currentGridSelections = new Set();
  renderEmojiGrid(el('grid'), round.grid, true, state.currentGridSelections);
}

el('btn-start').addEventListener('click', async () => {
  const username = el('login-username').value.trim();
  if (!username) return showStatus('login-status', 'Username required', false);
  const res = await API.start(username);
  state.session = res;
  renderRound(res.round);
});

el('btn-submit').addEventListener('click', async () => {
  const selections = Array.from(state.currentGridSelections);
  const res = await API.submitRound(state.session.session_id, selections);
  if (!res.success) {
    showStatus('login-status', res.message || 'Incorrect', false);
    return;
  }
  if (res.completed) {
    el('result').textContent = `JWT: ${res.token}`;
    showStatus('login-status', 'Success!');
    return;
  }
  state.session.current_round = res.current_round;
  renderRound(res.round);
});

init();

