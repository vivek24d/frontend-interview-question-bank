/* app.js — TechPrep Interview Questions App */
const TOPICS = [
  { id: 'all', label: 'All Topics', color: '#6c63ff' },
  { id: 'javascript', label: 'JavaScript', color: '#f7df1e' },
  { id: 'angular', label: 'Angular', color: '#dd0031' },
  { id: 'react', label: 'React', color: '#61dafb' },
  { id: 'aws', label: 'AWS', color: '#ff9900' },
  { id: 'dsa', label: 'DSA', color: '#a78bfa' },
  { id: 'debugging', label: 'Debugging', color: '#34d399' },
  { id: 'systemdesign', label: 'System Design', color: '#60a5fa' },
  { id: 'security', label: 'Security', color: '#f87171' },
  { id: 'performance', label: 'Performance', color: '#fb923c' },
];

const PAGE_SIZE = 20;
let state = {
  topic: 'all', diff: 'all', search: '', page: 1,
  view: 'list', modalIdx: -1, filtered: []
};

const ALL_QUESTIONS = () => [
  ...(window.JS_QUESTIONS || []),
  ...(window.ANGULAR_QUESTIONS || []),
  ...(window.REACT_QUESTIONS || []),
  ...(window.AWS_QUESTIONS || []),
  ...(window.DSA_QUESTIONS || []),
  ...(window.DEBUGGING_QUESTIONS || []),
  ...(window.SYSTEMDESIGN_QUESTIONS || []),
  ...(window.SECURITY_QUESTIONS || []),
  ...(window.PERFORMANCE_QUESTIONS || []),
];

// ---- DOM refs ----
const $navTopics = document.getElementById('navTopics');
const $topicTabs = document.getElementById('topicTabs');
const $diffPills = document.getElementById('difficultyPills');
const $qList = document.getElementById('questionsList');
const $pagination = document.getElementById('pagination');
const $resultsMeta = document.getElementById('resultsMeta');
const $heroStats = document.getElementById('heroStats');
const $modalOverlay = document.getElementById('modalOverlay');
const $modal = document.getElementById('modal');
const $searchBar = document.getElementById('searchBar');
const $searchInput = document.getElementById('searchInput');
const $toast = document.getElementById('toast');

// ---- Init ----
function init() {
  buildNav();
  buildTopicTabs();
  buildHeroStats();
  render();

  // Difficulty pills
  $diffPills.addEventListener('click', e => {
    const btn = e.target.closest('.pill');
    if (!btn) return;
    state.diff = btn.dataset.diff;
    state.page = 1;
    $diffPills.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    render();
  });

  // Search
  document.getElementById('searchToggle').addEventListener('click', () => {
    $searchBar.classList.toggle('open');
    if ($searchBar.classList.contains('open')) $searchInput.focus();
  });
  $searchInput.addEventListener('input', () => {
    state.search = $searchInput.value.toLowerCase();
    state.page = 1;
    render();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeModal(); $searchBar.classList.remove('open'); }
  });

  // View toggle
  document.getElementById('listView').addEventListener('click', () => setView('list'));
  document.getElementById('gridView').addEventListener('click', () => setView('grid'));

  // Theme
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);

  // Modal nav
  document.getElementById('prevQuestion').addEventListener('click', () => navigateModal(-1));
  document.getElementById('nextQuestion').addEventListener('click', () => navigateModal(1));
  document.getElementById('modalClose').addEventListener('click', closeModal);
  $modalOverlay.addEventListener('click', e => { if (e.target === $modalOverlay) closeModal(); });
}

function buildNav() {
  $navTopics.innerHTML = TOPICS.map(t =>
    `<button class="nav-topic-btn${t.id === 'all' ? ' active' : ''}" data-topic="${t.id}">${t.label}</button>`
  ).join('');
  $navTopics.addEventListener('click', e => {
    const btn = e.target.closest('.nav-topic-btn');
    if (!btn) return;
    selectTopic(btn.dataset.topic);
    $navTopics.querySelectorAll('.nav-topic-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('questions').scrollIntoView({ behavior: 'smooth' });
  });
}

function buildTopicTabs() {
  const all = ALL_QUESTIONS();
  $topicTabs.innerHTML = TOPICS.map(t => {
    const cnt = t.id === 'all' ? all.length : all.filter(q => q.topic === t.id).length;
    return `<button class="topic-tab${t.id === state.topic ? ' active' : ''}" data-topic="${t.id}">
      <span class="tab-dot" style="background:${t.color}"></span>
      ${t.label}
      <span class="tab-count">${cnt}</span>
    </button>`;
  }).join('');
  $topicTabs.addEventListener('click', e => {
    const btn = e.target.closest('.topic-tab');
    if (!btn) return;
    selectTopic(btn.dataset.topic);
    $topicTabs.querySelectorAll('.topic-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
}

function buildHeroStats() {
  const all = ALL_QUESTIONS();
  const topics = TOPICS.filter(t => t.id !== 'all');
  $heroStats.innerHTML = [
    { num: all.length + '+', lbl: 'Questions' },
    { num: topics.length, lbl: 'Topics' },
    { num: '3', lbl: 'Difficulty Levels' },
  ].map(s => `<div class="stat-item"><div class="stat-num">${s.num}</div><div class="stat-lbl">${s.lbl}</div></div>`).join('');
}

function selectTopic(topic) {
  state.topic = topic;
  state.page = 1;
  render();
}

function setView(v) {
  state.view = v;
  $qList.classList.toggle('grid-mode', v === 'grid');
  document.getElementById('listView').classList.toggle('active', v === 'list');
  document.getElementById('gridView').classList.toggle('active', v === 'grid');
}

// ---- Render ----
function render() {
  const all = ALL_QUESTIONS();
  state.filtered = all.filter(q => {
    if (state.topic !== 'all' && q.topic !== state.topic) return false;
    if (state.diff !== 'all' && q.difficulty !== state.diff) return false;
    if (state.search && !q.question.toLowerCase().includes(state.search) && !q.answer.toLowerCase().includes(state.search)) return false;
    return true;
  });

  const total = state.filtered.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  state.page = Math.min(state.page, Math.max(1, totalPages));
  const start = (state.page - 1) * PAGE_SIZE;
  const pageItems = state.filtered.slice(start, start + PAGE_SIZE);

  $resultsMeta.textContent = `Showing ${start + 1}–${Math.min(start + PAGE_SIZE, total)} of ${total} questions`;

  if (total === 0) {
    $qList.innerHTML = `<div class="empty-state"><div class="empty-icon">🔍</div><h3>No questions found</h3><p>Try adjusting your filters or search term.</p></div>`;
    $pagination.innerHTML = '';
    return;
  }

  $qList.innerHTML = pageItems.map((q, i) => {
    const topic = TOPICS.find(t => t.id === q.topic);
    return `<div class="q-card" data-idx="${start + i}" role="button" tabindex="0" aria-label="${q.question}">
      <span class="q-number">#${start + i + 1}</span>
      <div class="q-body">
        <div class="q-text">${escHtml(q.question)}</div>
        <div class="q-tags">
          <span class="q-topic-tag" style="color:${topic?.color}">${topic?.label || q.topic}</span>
          <span class="q-diff-badge ${q.difficulty}">${q.difficulty}</span>
        </div>
      </div>
      <svg class="q-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
    </div>`;
  }).join('');

  // Card click
  $qList.querySelectorAll('.q-card').forEach(card => {
    const open = () => openModal(parseInt(card.dataset.idx));
    card.addEventListener('click', open);
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') open(); });
  });

  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  if (totalPages <= 1) { $pagination.innerHTML = ''; return; }
  const p = state.page;
  let btns = [];
  btns.push(`<button class="page-btn" data-p="${p - 1}" ${p === 1 ? 'disabled' : ''}>← Prev</button>`);
  const pages = paginationRange(p, totalPages);
  pages.forEach(pg => {
    if (pg === '...') btns.push(`<span style="color:var(--text3);padding:0 4px">…</span>`);
    else btns.push(`<button class="page-btn${pg === p ? ' active' : ''}" data-p="${pg}">${pg}</button>`);
  });
  btns.push(`<button class="page-btn" data-p="${p + 1}" ${p === totalPages ? 'disabled' : ''}>Next →</button>`);
  $pagination.innerHTML = btns.join('');
  $pagination.querySelectorAll('.page-btn:not(:disabled)').forEach(btn => {
    btn.addEventListener('click', () => {
      state.page = parseInt(btn.dataset.p);
      render();
      document.getElementById('questions').scrollIntoView({ behavior: 'smooth' });
    });
  });
}

function paginationRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
}

// ---- Modal ----
function openModal(idx) {
  state.modalIdx = idx;
  renderModal();
  $modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  $modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

function navigateModal(dir) {
  const newIdx = state.modalIdx + dir;
  if (newIdx < 0 || newIdx >= state.filtered.length) return;
  state.modalIdx = newIdx;
  renderModal();
}

function renderModal() {
  const q = state.filtered[state.modalIdx];
  if (!q) return;
  const topic = TOPICS.find(t => t.id === q.topic);
  document.getElementById('modalTopic').textContent = topic?.label || q.topic;
  const badge = document.getElementById('modalDiff');
  badge.textContent = q.difficulty;
  badge.className = `modal-badge ${q.difficulty}`;
  document.getElementById('modalQuestion').textContent = q.question;
  document.getElementById('modalAnswer').textContent = q.answer;
  const codeSection = document.getElementById('modalCodeSection');
  const codeEl = document.getElementById('modalCode');
  if (q.code) { codeSection.style.display = 'block'; codeEl.textContent = q.code; }
  else { codeSection.style.display = 'none'; }
  document.getElementById('modalCounter').textContent = `${state.modalIdx + 1} / ${state.filtered.length}`;
  document.getElementById('prevQuestion').disabled = state.modalIdx === 0;
  document.getElementById('nextQuestion').disabled = state.modalIdx === state.filtered.length - 1;
}

// ---- Theme ----
function toggleTheme() {
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  document.documentElement.setAttribute('data-theme', isLight ? 'dark' : 'light');
  document.querySelector('.icon-moon').classList.toggle('hidden', !isLight);
  document.querySelector('.icon-sun').classList.toggle('hidden', isLight);
  localStorage.setItem('theme', isLight ? 'dark' : 'light');
}

// ---- Utils ----
function escHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Load saved theme
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
if (savedTheme === 'light') {
  document.querySelector('.icon-moon').classList.add('hidden');
  document.querySelector('.icon-sun').classList.remove('hidden');
}

window.addEventListener('DOMContentLoaded', init);
