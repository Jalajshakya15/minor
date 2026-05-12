/**
 * SyllabusHub — single entry, no duplicate listeners.
 * Canonical catalog when using `npm start`: `data/syllabi.json` (also served at GET /api/syllabi).
 * Bundled `SYLLABI` below is the offline fallback when opening index.html over file://.
 */
(function () {
  'use strict';

  const SYLLABI = [
    {
      id: 'sem1-structured-format',
      title: 'Sem 1 Structured Format',
      branch: 'CSE',
      year: 1,
      semester: 1,
      filename: 'Sem1_Structured_Format.pdf',
      path: 'pdf/Sem1_Structured_Format.pdf',
      description: 'Structured syllabus for Semester 1 (PDF).',
      addedAt: '2025-12-15',
    },
    {
      id: 'sem6-structured-format',
      title: 'Sem 6 Structured Format',
      branch: 'CSE',
      year: 3,
      semester: 6,
      filename: 'Sem6_Structured_Format.pdf',
      path: 'pdf/Sem6_Structured_Format.pdf',
      description: 'Structured syllabus for Semester 6 (PDF).',
      addedAt: '2025-12-15',
    },
    {
      id: 'sem7-structured-format',
      title: 'Sem 7 Structured Format',
      branch: 'CSE',
      year: 4,
      semester: 7,
      filename: 'Sem7_Structured_Format.pdf',
      path: 'pdf/Sem7_Structured_Format.pdf',
      description: 'Structured syllabus for Semester 7 (PDF).',
      addedAt: '2025-12-15',
    },
    {
      id: 'sem8-structured-format',
      title: 'Sem 8 Structured Format',
      branch: 'CSE',
      year: 4,
      semester: 8,
      filename: 'Sem8_Structured_Format.pdf',
      path: 'pdf/Sem8_Structured_Format.pdf',
      description: 'Structured syllabus for Semester 8 (PDF).',
      addedAt: '2025-12-15',
    },
    {
      id: 'sem4-structured-format',
      title: 'Sem 4 Structured Format',
      branch: 'CSE',
      year: 2,
      semester: 4,
      filename: 'Sem4_Structured_Format.pdf',
      path: 'pdf/Sem4_Structured_Format.pdf',
      description: 'Structured syllabus for Semester 4 (PDF).',
      addedAt: '2025-12-15',
    },
    {
      id: 'sem5-structured-format',
      title: 'Sem 5 Structured Format',
      branch: 'CSE',
      year: 3,
      semester: 5,
      filename: 'Sem5_Structured_Format.pdf',
      path: 'pdf/Sem5_Structured_Format.pdf',
      description: 'Structured syllabus for Semester 5 (PDF).',
      addedAt: '2025-12-15',
    },
    {
      id: 'sem2-structured-format',
      title: 'Sem 2 Structured Format',
      branch: 'CSE',
      year: 1,
      semester: 2,
      filename: 'Sem2_Structured_Format.pdf',
      path: 'pdf/Sem2_Structured_Format.pdf',
      description: 'Structured syllabus for Semester 2 (PDF).',
      addedAt: '2025-12-15',
    },
    {
      id: 'sem3-structured-format',
      title: 'Sem 3 Structured Format',
      branch: 'CSE',
      year: 2,
      semester: 3,
      filename: 'Sem3_Structured_Format.pdf',
      path: 'pdf/Sem3_Structured_Format.pdf',
      description: 'Structured syllabus for Semester 3 (PDF).',
      addedAt: '2025-12-15',
    },
  ];

  /** @type {typeof SYLLABI} */
  let syllabi = SYLLABI.slice();
  let currentList = [];

  const branchEl = document.getElementById('branch');
  const yearEl = document.getElementById('year');
  const semEl = document.getElementById('semester');
  const searchEl = document.getElementById('search');
  const cardsEl = document.getElementById('cards');
  const resultCountEl = document.getElementById('resultCount');
  const statTotal = document.getElementById('statTotal');
  const statBranches = document.getElementById('statBranches');
  const statUpdated = document.getElementById('statUpdated');
  const sortEl = document.getElementById('sort');
  const applyBtn = document.getElementById('apply');
  const resetBtn = document.getElementById('reset');
  const modalRoot = document.getElementById('modalRoot');
  const activeFiltersEl = document.getElementById('activeFilters');
  const mainPreviewBtn = document.getElementById('main-preview');
  const mainDownloadBtn = document.getElementById('main-download');
  const themeToggle = document.getElementById('themeToggle');
  const dataStatusEl = document.getElementById('dataStatus');

  function formatDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
  }

  function unique(arr) {
    return Array.from(new Set(arr));
  }

  function pdfHref(s) {
    return s.path || s.pdf || '';
  }

  function searchHaystack(x) {
    const parts = [x.title, x.description, x.short, x.code, x.branch]
      .filter(Boolean)
      .join(' ');
    return parts.toLowerCase();
  }

  function getFilterSummary() {
    const parts = [];
    if (branchEl.value) parts.push(`Branch: ${branchEl.value}`);
    if (yearEl.value) parts.push(`Year: ${yearEl.options[yearEl.selectedIndex].text}`);
    if (semEl.value) parts.push(`Sem: ${semEl.options[semEl.selectedIndex].text}`);
    if ((searchEl.value || '').trim()) parts.push(`Search: "${searchEl.value.trim()}"`);
    if (!parts.length) return 'No filters applied.';
    return parts.join(' • ');
  }

  function updateActiveFiltersSummary() {
    if (activeFiltersEl) activeFiltersEl.textContent = getFilterSummary();
  }

  function syncStepState() {
    const hasBranch = !!branchEl.value;
    const hasYear = !!yearEl.value;
    yearEl.disabled = !hasBranch;
    semEl.disabled = !hasYear;
  }

  function downloadPdf(syllabus) {
    const href = pdfHref(syllabus);
    if (!href) {
      window.alert('No PDF path is configured for this syllabus.');
      return;
    }
    window.open(href, '_blank', 'noopener,noreferrer');
  }

  function openPdfInNewTab(syllabus) {
    downloadPdf(syllabus);
  }

  function renderCards(list) {
    cardsEl.innerHTML = '';
    currentList = list.slice();
    if (!list.length) {
      cardsEl.innerHTML = '<div class="muted">No syllabi found. Try different filters.</div>';
      resultCountEl.textContent = 'Showing 0 results';
      return;
    }
    resultCountEl.textContent = `Showing ${list.length} result${list.length > 1 ? 's' : ''}`;
    list.forEach((s) => {
      const card = document.createElement('article');
      card.className = 'card';
      const added = s.addedAt || s.added || '';
      const desc = s.description || s.short || '';
      card.innerHTML = `
        <div class="meta">
          <div class="chip">${escapeHtml(s.branch || '')}</div>
          <div class="chip">Y${s.year || ''} • Sem ${s.semester || ''}</div>
          ${s.code ? `<div class="chip chip-soft">${escapeHtml(s.code)}</div>` : ''}
          <div style="margin-left:auto" class="muted">${formatDate(added)}</div>
        </div>
        <h3 class="title">${escapeHtml(s.title)}</h3>
        <div class="desc">${escapeHtml(desc)}</div>
        <div class="muted" style="font-size:12px;margin-bottom:8px;">
          ${s.level ? `Level: <strong>${escapeHtml(String(s.level))}</strong>` : ''}
          ${s.credits ? ` • Credits: <strong>${escapeHtml(String(s.credits))}</strong>` : ''}
        </div>
        <div class="actions">
          <button type="button" class="download">Download</button>
          <button type="button" class="preview">Preview</button>
        </div>
      `;
      const downloadBtn = card.querySelector('.download');
      const previewBtn = card.querySelector('.preview');
      if (downloadBtn) downloadBtn.addEventListener('click', () => downloadPdf(s));
      if (previewBtn) previewBtn.addEventListener('click', () => openModal(s));
      cardsEl.appendChild(card);
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function applyFilters() {
    const branch = branchEl.value;
    const year = yearEl.value;
    const sem = semEl.value;
    const q = (searchEl.value || '').trim().toLowerCase();
    let list = syllabi.slice();

    if (branch) list = list.filter((x) => x.branch === branch);
    if (year) list = list.filter((x) => String(x.year) === String(year));
    if (sem) list = list.filter((x) => String(x.semester) === String(sem));
    if (q) list = list.filter((x) => searchHaystack(x).includes(q));

    const sort = sortEl.value;
    if (sort === 'branch') list.sort((a, b) => (a.branch || '').localeCompare(b.branch || ''));
    else if (sort === 'year') list.sort((a, b) => (a.year || 0) - (b.year || 0));
    else list.sort((a, b) => new Date(b.addedAt || b.added || 0) - new Date(a.addedAt || a.added || 0));

    renderCards(list);
    updateStats();
    updateActiveFiltersSummary();
  }

  function resetFilters() {
    branchEl.value = '';
    yearEl.value = '';
    semEl.value = '';
    searchEl.value = '';
    sortEl.value = 'recent';
    syncStepState();
    applyFilters();
  }

  function updateStats() {
    statTotal.textContent = String(syllabi.length);
    statBranches.textContent = String(unique(syllabi.map((s) => s.branch)).length);
    const latest = syllabi
      .slice()
      .sort((a, b) => new Date(b.addedAt || b.added || 0) - new Date(a.addedAt || a.added || 0))[0];
    statUpdated.textContent = latest ? formatDate(latest.addedAt || latest.added) : '—';
  }

  function openModal(syllabus) {
    const overview = syllabus.description || syllabus.short || 'No description provided.';
    modalRoot.innerHTML = `
      <div class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
        <div class="modal">
          <div class="modal-head">
            <div>
              <strong id="modalTitle">${escapeHtml(syllabus.title)}</strong>
              <div class="muted" style="margin-top:6px">
                ${syllabus.code ? `${escapeHtml(syllabus.code)} • ` : ''}${escapeHtml(syllabus.branch)} • Year ${syllabus.year} • Sem ${syllabus.semester}
              </div>
            </div>
            <div class="modal-actions">
              <button type="button" id="modalOpenPdf" class="btn ghost">Open PDF</button>
              <button type="button" id="modalDownload" class="download">Download</button>
              <button type="button" id="modalClose" class="btn ghost">Close</button>
            </div>
          </div>
          <pre id="modalContent"></pre>
        </div>
      </div>
    `;
    modalRoot.setAttribute('aria-hidden', 'false');

    const lines = [
      `Syllabus — ${syllabus.title}`,
      syllabus.code ? `Course Code: ${syllabus.code}` : '',
      `Branch: ${syllabus.branch}`,
      `Year: ${syllabus.year} • Semester: ${syllabus.semester}`,
      syllabus.level ? `Level: ${syllabus.level}` : '',
      syllabus.credits ? `Credits: ${syllabus.credits}` : '',
      '',
      'Course overview:',
      overview,
      '',
    ];

    if (syllabus.topics && syllabus.topics.length) {
      lines.push('Major topics:');
      syllabus.topics.forEach((t) => lines.push(`- ${t}`));
      lines.push('');
    }

    lines.push(
      'Assessment (example):',
      '- Midterm: 30%',
      '- End-term: 50%',
      '- Practicals / project: 20%',
      '',
      'Note:',
      'For the full official syllabus, open the PDF using the buttons above.',
    );

    const pre = document.getElementById('modalContent');
    if (pre) pre.textContent = lines.filter(Boolean).join('\n');

    document.getElementById('modalDownload')?.addEventListener('click', () => downloadPdf(syllabus));
    document.getElementById('modalOpenPdf')?.addEventListener('click', () => openPdfInNewTab(syllabus));
    document.getElementById('modalClose')?.addEventListener('click', closeModal);

    modalRoot.querySelector('.modal-backdrop')?.addEventListener('click', (ev) => {
      if (ev.target.classList.contains('modal-backdrop')) closeModal();
    });

    document.addEventListener('keydown', onEsc);
  }

  function closeModal() {
    modalRoot.innerHTML = '';
    modalRoot.setAttribute('aria-hidden', 'true');
    document.removeEventListener('keydown', onEsc);
  }

  function onEsc(e) {
    if (e.key === 'Escape') closeModal();
  }

  let searchTimeout;
  function wireEvents() {
    branchEl.addEventListener('change', () => {
      syncStepState();
      applyFilters();
    });
    yearEl.addEventListener('change', () => {
      syncStepState();
      applyFilters();
    });
    semEl.addEventListener('change', applyFilters);

    searchEl.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(applyFilters, 280);
    });

    applyBtn.addEventListener('click', applyFilters);
    resetBtn.addEventListener('click', resetFilters);
    sortEl.addEventListener('change', applyFilters);

    for (let y = 1; y <= 4; y++) {
      const prev = document.getElementById(`preview-year-${y}`);
      const dl = document.getElementById(`download-year-${y}`);
      if (prev) {
        prev.addEventListener('click', () => {
          const first = syllabi.find((x) => Number(x.year) === y);
          if (first) openModal(first);
          else window.alert(`No syllabus found for year ${y}.`);
        });
      }
      if (dl) {
        dl.addEventListener('click', () => {
          const first = syllabi.find((x) => Number(x.year) === y);
          if (first) downloadPdf(first);
          else window.alert(`No PDF found for year ${y}.`);
        });
      }
    }

    if (mainPreviewBtn) {
      mainPreviewBtn.addEventListener('click', () => {
        const s = currentList[0];
        if (s) openModal(s);
        else window.alert('No results to preview.');
      });
    }
    if (mainDownloadBtn) {
      mainDownloadBtn.addEventListener('click', () => {
        const s = currentList[0];
        if (s) downloadPdf(s);
        else window.alert('No results to download.');
      });
    }
  }

  const THEME_KEY = 'syllabushub-theme';

  function applyTheme(theme) {
    const t = theme === 'light' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem(THEME_KEY, t);
    if (themeToggle) {
      themeToggle.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      themeToggle.textContent = t === 'dark' ? 'Light mode' : 'Dark mode';
    }
  }

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') {
      applyTheme(saved);
      return;
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      applyTheme('light');
    } else {
      applyTheme('dark');
    }
  }

  function initThemeToggle() {
    if (!themeToggle) return;
    themeToggle.addEventListener('click', () => {
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
    });
  }

  async function tryLoadRemoteData() {
    if (window.location.protocol === 'file:') return;
    const urls = ['/api/syllabi', 'data/syllabi.json'];
    for (const path of urls) {
      try {
        const res = await fetch(path, { headers: { Accept: 'application/json' } });
        if (!res.ok) continue;
        const data = await res.json();
        if (Array.isArray(data) && data.length) {
          syllabi = data;
          if (dataStatusEl) {
            dataStatusEl.textContent = path.startsWith('/api') ? 'Live catalog (API)' : 'Live catalog (JSON)';
            dataStatusEl.hidden = false;
          }
          return;
        }
      } catch (_) {
        /* use bundled data */
      }
    }
  }

  async function bootstrap() {
    initTheme();
    initThemeToggle();
    await tryLoadRemoteData();
    wireEvents();
    syncStepState();
    updateStats();
    applyFilters();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
