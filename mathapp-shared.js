// ════════════════════════════════════════════════
// mathapp-shared.js — shared utilities
// כלול בכל דף משחק:
// <script src="mathapp-shared.js"></script>
// ════════════════════════════════════════════════

const AVATARS = [‘⭐’,‘🦁’,‘🐯’,‘🦊’,‘🐺’,‘🦅’,‘🐬’,‘🦋’,‘🌟’,‘🔥’];

// ── Storage ───────────────────────────────────────
function getPlayers() {
try { return JSON.parse(localStorage.getItem(‘mathapp_players’) || ‘{}’); } catch { return {}; }
}
function savePlayers(p) { localStorage.setItem(‘mathapp_players’, JSON.stringify(p)); }
function getPlayerName()  { return localStorage.getItem(‘mathapp_current’) || ‘’; }

function getPlayerData(name) {
const p = getPlayers();
if (!p[name]) {
p[name] = { avatar: AVATARS[Object.keys(p).length % AVATARS.length], totalScore: 0, games: 0, correct: 0, wrong: 0, bestStreak: 0, sessions: [], tableStats: {}, mistakeMap: {} };
savePlayers(p);
}
[‘sessions’].forEach(k => { if (!Array.isArray(p[name][k])) p[name][k] = []; });
[‘tableStats’,‘mistakeMap’].forEach(k => { if (typeof p[name][k] !== ‘object’ || Array.isArray(p[name][k])) p[name][k] = {}; });
return p[name];
}

// ── Save a completed session ──────────────────────
// sessionData: { game, mode, topic, score, correct, wrong, bestStreak }
function saveSession(sessionData) {
const name = getPlayerName();
if (!name) return;
const p = getPlayers();
const d = getPlayerData(name);

d.totalScore  = (d.totalScore  || 0) + (sessionData.score  || 0);
d.games       = (d.games       || 0) + 1;
d.correct     = (d.correct     || 0) + (sessionData.correct || 0);
d.wrong       = (d.wrong       || 0) + (sessionData.wrong   || 0);
if ((sessionData.bestStreak || 0) > (d.bestStreak || 0)) d.bestStreak = sessionData.bestStreak;

// per-topic stats
const tKey = sessionData.topic || ‘general’;
if (!d.tableStats[tKey]) d.tableStats[tKey] = { correct: 0, wrong: 0 };
d.tableStats[tKey].correct += (sessionData.correct || 0);
d.tableStats[tKey].wrong   += (sessionData.wrong   || 0);

d.sessions.push({ ts: Date.now(), …sessionData });
if (d.sessions.length > 200) d.sessions = d.sessions.slice(-200);

p[name] = d;
savePlayers(p);
}

// ── Record a single mistake ───────────────────────
function recordMistake(questionKey, topic) {
const name = getPlayerName();
if (!name) return;
const p = getPlayers();
const d = getPlayerData(name);
const key = `[${topic || '?'}] ${questionKey}`;
d.mistakeMap[key] = (d.mistakeMap[key] || 0) + 1;
p[name] = d;
savePlayers(p);
}

// ── Init header display on a game page ───────────
// Expects: element id=“player-label” and id=“total-score”
function initGameHeader() {
const name = getPlayerName();
if (!name) return;
const d = getPlayerData(name);
const lbl = document.getElementById(‘player-label’);
const scr = document.getElementById(‘total-score’);
if (lbl) lbl.textContent = name;
if (scr) scr.textContent = d.totalScore || 0;
}
