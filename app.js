/* TechPrep App Logic */

const TOPICS = [
  { id: 'all', label: 'All Topics', color: '#6366f1' },
  { id: 'javascript', label: 'JavaScript', color: '#f7df1e' },
  { id: 'typescript', label: 'TypeScript', color: '#3178c6' },
  { id: 'api', label: 'API & Web', color: '#0ea5e9' },
  { id: 'react', label: 'React.js', color: '#61dafb' },
  { id: 'angular', label: 'Angular', color: '#dd0031' },
  { id: 'aws', label: 'AWS Cloud', color: '#ff9900' },
  { id: 'systemdesign', label: 'System Design', color: '#a855f7' },
  { id: 'dsa', label: 'Data Structures', color: '#ec4899' },
  { id: 'security', label: 'Security', color: '#ef4444' },
  { id: 'performance', label: 'Performance', color: '#f59e0b' },
  { id: 'debugging', label: 'Debugging', color: '#10b981' }
];

const PAGE_SIZE = 24;

let state = {
  topic: 'all',
  diff: 'all',
  type: 'all',
  search: '',
  page: 1,
  modalIdx: -1,
  filtered: [],
  selected: new Set()
};

// safely aggregate all data
const getQuestions = () => [
  ...(window.JAVASCRIPT_QUESTIONS || []),
  ...(window.TYPESCRIPT_QUESTIONS || []),
  ...(window.API_QUESTIONS || []),
  ...(window.REACT_QUESTIONS || []),
  ...(window.ANGULAR_QUESTIONS || []),
  ...(window.AWS_QUESTIONS || []),
  ...(window.SYSTEMDESIGN_QUESTIONS || []),
  ...(window.DSA_QUESTIONS || []),
  ...(window.SECURITY_QUESTIONS || []),
  ...(window.PERFORMANCE_QUESTIONS || []),
  ...(window.DEBUGGING_QUESTIONS || [])
];

// DOM
const $navTopics = document.getElementById('navTopics');
const $diffFilters = document.getElementById('diffFilters');
const $typeFilters = document.getElementById('typeFilters');
const $qGrid = document.getElementById('qGrid');
const $pagination = document.getElementById('pagination');
const $searchInput = document.getElementById('searchInput');
const $statsRow = document.getElementById('statsRow');
const $pageTitle = document.getElementById('pageTitle');
const $pageDesc = document.getElementById('pageDesc');

const $modalOverlay = document.getElementById('modalOverlay');
const $modalClose = document.getElementById('modalClose');
const $modalTopic = document.getElementById('modalTopic');
const $modalDiff = document.getElementById('modalDiff');
const $modalQ = document.getElementById('modalQ');
const $modalA = document.getElementById('modalA');
const $prevBtn = document.getElementById('prevBtn');
const $nextBtn = document.getElementById('nextBtn');
const $modalCounter = document.getElementById('modalCounter');

const $selectionBar = document.getElementById('selectionBar');
const $selCount = document.getElementById('selCount');
const $exportCandBtn = document.getElementById('exportCandBtn');
const $exportIntBtn = document.getElementById('exportIntBtn');

function init() {
  buildNav();
  updateStats();
  render();

  // Search
  $searchInput.addEventListener('input', e => {
    state.search = e.target.value.toLowerCase();
    state.page = 1;
    render();
  });

  // Diff
  $diffFilters.addEventListener('click', e => {
    if (!e.target.classList.contains('diff-pill')) return;
    $diffFilters.querySelectorAll('.diff-pill').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    state.diff = e.target.dataset.diff;
    state.page = 1;
    render();
  });

  // Type
  $typeFilters.addEventListener('click', e => {
    if (!e.target.classList.contains('diff-pill')) return;
    $typeFilters.querySelectorAll('.diff-pill').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    state.type = e.target.dataset.type;
    state.page = 1;
    render();
  });

  // Theme
  document.getElementById('btnDark').addEventListener('click', () => setTheme('dark'));
  document.getElementById('btnLight').addEventListener('click', () => setTheme('light'));

  const savedTheme = localStorage.getItem('theme') || 'dark';
  setTheme(savedTheme);

  // Modal
  $modalClose.addEventListener('click', closeModal);
  $modalOverlay.addEventListener('click', e => { if(e.target === $modalOverlay) closeModal(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
    if ($modalOverlay.classList.contains('open')) {
      if (e.key === 'ArrowLeft') navModal(-1);
      if (e.key === 'ArrowRight') navModal(1);
    }
  });

  $prevBtn.addEventListener('click', () => navModal(-1));
  $nextBtn.addEventListener('click', () => navModal(1));

  // Export
  $exportCandBtn.addEventListener('click', () => exportDoc(false));
  $exportIntBtn.addEventListener('click', () => exportDoc(true));
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  document.getElementById('btnDark').classList.toggle('active', theme === 'dark');
  document.getElementById('btnLight').classList.toggle('active', theme === 'light');
}

function buildNav() {
  const allQ = getQuestions();
  $navTopics.innerHTML = TOPICS.map(t => {
    const count = t.id === 'all' ? allQ.length : allQ.filter(q => q.topic === t.id).length;
    return `
      <button class="topic-btn ${t.id === state.topic ? 'active' : ''}" data-topic="${t.id}">
        <div class="topic-btn-content">
          <span class="topic-dot" style="background-color: ${t.color}"></span>
          ${t.label}
        </div>
        <span style="font-size:0.75rem; opacity:0.8">${count}</span>
      </button>
    `;
  }).join('');

  $navTopics.addEventListener('click', e => {
    const btn = e.target.closest('.topic-btn');
    if (!btn) return;
    $navTopics.querySelectorAll('.topic-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    state.topic = btn.dataset.topic;
    state.page = 1;
    
    const tData = TOPICS.find(t => t.id === state.topic);
    $pageTitle.textContent = tData.label;
    $pageDesc.textContent = state.topic === 'all' ? 'Explore thousands of high-quality, real-world technical scenarios.' : `Deep dive into advanced ${tData.label} interview questions.`;
    
    updateStats();
    render();
  });
}

function updateStats() {
  const qList = getQuestions().filter(q => state.topic === 'all' || q.topic === state.topic);
  $statsRow.innerHTML = `
    <div class="stat"><span class="stat-num">${qList.length}</span><span class="stat-lbl">Questions</span></div>
    <div class="stat"><span class="stat-num">${qList.filter(q=>q.difficulty==='hard').length}</span><span class="stat-lbl">Hard Scenarios</span></div>
  `;
}

function hashStr(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return 'id_' + Math.abs(hash).toString(36);
}

function render() {
  let list = getQuestions();

  if (state.topic !== 'all') {
    list = list.filter(q => q.topic === state.topic);
  }
  if (state.diff !== 'all') {
    list = list.filter(q => q.difficulty === state.diff);
  }
  if (state.type !== 'all') {
    list = list.filter(q => {
      const isScenario = q.question.startsWith('Scenario:') || q.question.startsWith('Machine Coding:') || q.question.startsWith('Design architecture') || q.question.startsWith('You are debugging');
      return state.type === 'scenario' ? isScenario : !isScenario;
    });
  }
  if (state.search) {
    list = list.filter(q => 
      q.question.toLowerCase().includes(state.search) || 
      q.answer.toLowerCase().includes(state.search)
    );
  }

  state.filtered = list;
  const total = list.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  state.page = Math.min(state.page, Math.max(1, totalPages));

  if (total === 0) {
    $qGrid.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto; color: var(--text-muted)"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <h3>No matches found</h3>
        <p>Try adjusting your search or filters.</p>
      </div>`;
    $pagination.innerHTML = '';
    return;
  }

  const start = (state.page - 1) * PAGE_SIZE;
  const pageItems = list.slice(start, start + PAGE_SIZE);

  $qGrid.innerHTML = pageItems.map((q, i) => {
    const tData = TOPICS.find(t => t.id === q.topic);
    const qId = hashStr(q.topic + q.question);
    q._id = qId; // store temporarily
    
    return `
      <div class="q-card" data-idx="${start + i}">
        <input type="checkbox" class="q-checkbox" data-id="${qId}" ${state.selected.has(qId) ? 'checked' : ''}>
        <div class="q-content">
          <div class="q-text">${escapeHtml(q.question)}</div>
          <div class="q-meta">
            <span class="q-topic" style="color:${tData?.color}">
              <span class="topic-dot" style="background-color:${tData?.color}"></span>
              ${tData?.label || q.topic}
            </span>
          </div>
        </div>
        <div class="q-tags">
          <span class="q-diff ${q.difficulty}">${q.difficulty}</span>
        </div>
      </div>
    `;
  }).join('');

  $qGrid.querySelectorAll('.q-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if(e.target.classList.contains('q-checkbox')) {
        const id = e.target.dataset.id;
        if(e.target.checked) state.selected.add(id);
        else state.selected.delete(id);
        updateSelection();
        return;
      }
      openModal(parseInt(card.dataset.idx));
    });
  });

  renderPagination(totalPages);
}

function updateSelection() {
  $selCount.textContent = state.selected.size;
  if(state.selected.size > 0) {
    $selectionBar.classList.add('show');
  } else {
    $selectionBar.classList.remove('show');
  }
}

document.getElementById('clearSelBtn').addEventListener('click', () => {
  state.selected.clear();
  updateSelection();
  render(); // re-render to uncheck all checkboxes
});

function exportDoc(withAnswers) {
  const allQ = getQuestions();
  allQ.forEach(q => {
    q._id = hashStr(q.topic + q.question);
  });
  
  const selectedQs = allQ.filter(q => state.selected.has(q._id));
  
  let html = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>Interview Questions</title>
    <style>
      body { font-family: 'Calibri', sans-serif; }
      h2 { color: #2c3e50; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
      .question { font-weight: bold; font-size: 14pt; margin-top: 20pt; }
      .meta { color: #7f8c8d; font-size: 10pt; margin-bottom: 10pt; }
      .answer { color: #34495e; margin-top: 10pt; font-style: italic; }
    </style>
    </head><body>
    <h1>TechPrep Interview Questions</h1>
    <p>Generated on ${new Date().toLocaleDateString()}</p>
  `;
  
  selectedQs.forEach((q, idx) => {
    html += `<div class="question">${idx + 1}. ${escapeHtml(q.question)}</div>`;
    html += `<div class="meta">Topic: ${q.topic.toUpperCase()} | Difficulty: ${q.difficulty.toUpperCase()}</div>`;
    if(withAnswers) {
      html += `<div class="answer"><strong>Expected Answer:</strong><br/>${escapeHtml(q.answer)}</div>`;
    }
  });
  
  html += `</body></html>`;
  
  const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `TechPrep_${withAnswers ? 'Interviewer' : 'Candidate'}_Questions.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function renderPagination(totalPages) {
  if (totalPages <= 1) { $pagination.innerHTML = ''; return; }
  
  let btns = [];
  btns.push(`<button class="page-btn" data-p="${state.page - 1}" ${state.page === 1 ? 'disabled' : ''}>Prev</button>`);
  
  let pgs = [];
  if (totalPages <= 7) {
    for(let i=1; i<=totalPages; i++) pgs.push(i);
  } else {
    if (state.page <= 4) pgs = [1,2,3,4,5,'...',totalPages];
    else if (state.page >= totalPages - 3) pgs = [1,'...',totalPages-4,totalPages-3,totalPages-2,totalPages-1,totalPages];
    else pgs = [1,'...',state.page-1,state.page,state.page+1,'...',totalPages];
  }

  pgs.forEach(p => {
    if (p === '...') btns.push(`<span style="color:var(--text-muted); align-self:center;">...</span>`);
    else btns.push(`<button class="page-btn ${p === state.page ? 'active' : ''}" data-p="${p}">${p}</button>`);
  });

  btns.push(`<button class="page-btn" data-p="${state.page + 1}" ${state.page === totalPages ? 'disabled' : ''}>Next</button>`);
  $pagination.innerHTML = btns.join('');
  
  $pagination.querySelectorAll('.page-btn:not(:disabled)').forEach(b => {
    b.addEventListener('click', () => {
      state.page = parseInt(b.dataset.p);
      render();
      document.querySelector('.content').scrollTo({top: 0, behavior: 'smooth'});
    });
  });
}

function openModal(idx) {
  state.modalIdx = idx;
  updateModal();
  $modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  $modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

function navModal(dir) {
  const newIdx = state.modalIdx + dir;
  if (newIdx >= 0 && newIdx < state.filtered.length) {
    state.modalIdx = newIdx;
    updateModal();
  }
}

function updateModal() {
  const q = state.filtered[state.modalIdx];
  const tData = TOPICS.find(t => t.id === q.topic);
  
  $modalTopic.textContent = tData?.label || q.topic;
  $modalTopic.style.color = tData?.color;
  $modalDiff.textContent = q.difficulty;
  $modalDiff.className = `q-diff ${q.difficulty}`;
  
  $modalQ.textContent = q.question;
  $modalA.textContent = q.answer;
  
  $modalCounter.textContent = `Question ${state.modalIdx + 1} of ${state.filtered.length}`;
  $prevBtn.disabled = state.modalIdx === 0;
  $nextBtn.disabled = state.modalIdx === state.filtered.length - 1;
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[m]);
}

window.addEventListener('DOMContentLoaded', () => {
  init();

  // Mobile sidebar drawer
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const hamburger = document.getElementById('hamburgerBtn');
  const closeBtnEl = document.getElementById('sidebarClose');

  function openSidebar() {
    sidebar.classList.add('open');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (hamburger) hamburger.addEventListener('click', openSidebar);
  if (closeBtnEl) closeBtnEl.addEventListener('click', closeSidebar);
  if (overlay) overlay.addEventListener('click', closeSidebar);

  // Close sidebar when a topic is selected on mobile
  if (sidebar) {
    sidebar.addEventListener('click', (e) => {
      if (e.target.closest('.topic-btn') && window.innerWidth <= 600) {
        closeSidebar();
      }
    });
  }
});
