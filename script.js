// Simple card rendering + preview/download (pure JS)
(function(){
  const sample = [
    { id: 'sem1', branch: 'CSE', year: 1, semester:1, title: 'Sem 1 Structured Format', description: 'Structured syllabus for Semester 1 (PDF).', addedAt: '2025-12-15', pdf: 'assets/pdfs/sem1-structured.pdf' },
    { id: 'sem2', branch: 'CSE', year: 1, semester:2, title: 'Sem 2 Structured Format', description: 'Structured syllabus for Semester 2 (PDF).', addedAt: '2025-12-15', pdf: 'assets/pdfs/sem2-structured.pdf' },
    { id: 'sem4', branch: 'CSE', year: 2, semester:4, title: 'Sem 4 Structured Format', description: 'Structured syllabus for Semester 4 (PDF).', addedAt: '2025-12-15', pdf: 'assets/pdfs/sem4-structured.pdf' },
    { id: 'sem5', branch: 'CSE', year: 3, semester:5, title: 'Sem 5 Structured Format', description: 'Structured syllabus for Semester 5 (PDF).', addedAt: '2025-12-15', pdf: 'assets/pdfs/sem5-structured.pdf' }
  ];

  // DOM refs
  const cardsRoot = document.getElementById('cards');
  const resultCount = document.getElementById('resultCount');
  const statTotal = document.getElementById('statTotal');
  const statBranches = document.getElementById('statBranches');
  const statUpdated = document.getElementById('statUpdated');
  const branchEl = document.getElementById('branch');
  const yearEl = document.getElementById('year');
  const semEl = document.getElementById('semester');
  const searchEl = document.getElementById('search');
  const applyBtn = document.getElementById('apply');
  const resetBtn = document.getElementById('reset');
  const sortEl = document.getElementById('sort');
  const mainPreview = document.getElementById('main-preview');
  const mainDownload = document.getElementById('main-download');

  let currentList = sample.slice();

  function formatDate(iso){
    if(!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString();
  }

  function render(list){
    currentList = list.slice();
    cardsRoot.innerHTML = '';
    if(!list.length){
      cardsRoot.innerHTML = '<div class="muted">No results found.</div>';
      resultCount.textContent = 'Showing 0 results';
      statTotal.textContent = '0';
      return;
    }

    list.forEach(item => {
      const card = document.createElement('article');
      card.className = 'card';
      card.innerHTML = `
        <div class="meta">
          <div class="chip chip-soft">${item.branch}</div>
          <div class="chip">Y${item.year} • Sem ${item.semester}</div>
          <div style="margin-left:auto" class="muted">${formatDate(item.addedAt)}</div>
        </div>
        <h3 class="title">${item.title}</h3>
        <div class="desc">${item.description}</div>
        <div class="actions">
          <a class="download" href="${item.pdf}" download="${item.id}.pdf">Download</a>
          <button class="preview" data-href="${item.pdf}">Preview</button>
        </div>
      `;
      cardsRoot.appendChild(card);
    });

    resultCount.textContent = `Showing ${list.length} result${list.length>1?'s':''}`;
    statTotal.textContent = String(sample.length);
    statBranches.textContent = String(new Set(sample.map(s=>s.branch)).size);
    const latest = sample.slice().sort((a,b)=>new Date(b.addedAt)-new Date(a.addedAt))[0];
    statUpdated.textContent = latest ? formatDate(latest.addedAt) : '—';

    // attach events
    cardsRoot.querySelectorAll('.preview').forEach(btn=>{
      btn.addEventListener('click', (e)=>{
        const href = e.currentTarget.dataset.href;
        if(href) window.open(href, '_blank', 'noopener');
      });
    });
    // download anchors already have download attribute
  }

  // filtering
  function applyFilters(){
    const b = branchEl.value;
    const y = yearEl.value;
    const s = semEl.value;
    const q = (searchEl.value||'').trim().toLowerCase();
    let list = sample.slice();
    if(b) list = list.filter(x=>x.branch===b);
    if(y) list = list.filter(x=>String(x.year)===String(y));
    if(s) list = list.filter(x=>String(x.semester)===String(s));
    if(q) list = list.filter(x=> (x.title+' '+x.description).toLowerCase().includes(q));

    // sort
    const mode = sortEl.value;
    if(mode==='branch') list.sort((a,b)=> (a.branch||'').localeCompare(b.branch||''));
    else if(mode==='year') list.sort((a,b)=> (a.year||0)-(b.year||0));
    else list.sort((a,b)=> new Date(b.addedAt)-new Date(a.addedAt));

    render(list);
  }

  // main controls
  applyBtn.addEventListener('click', applyFilters);
  resetBtn.addEventListener('click', ()=>{ branchEl.value=''; yearEl.value=''; semEl.value=''; searchEl.value=''; sortEl.value='recent'; applyFilters(); });
  sortEl.addEventListener('change', applyFilters);
  [branchEl, yearEl, semEl].forEach(el=>el.addEventListener('change', applyFilters));
  searchEl.addEventListener('input', ()=>{ setTimeout(applyFilters, 250); });

  // main page preview/download operate on first result
  if(mainPreview) mainPreview.addEventListener('click', ()=>{ if(currentList[0]) window.open(currentList[0].pdf, '_blank', 'noopener'); else alert('No results to preview'); });
  if(mainDownload) mainDownload.addEventListener('click', ()=>{ if(currentList[0]){ const a=document.createElement('a'); a.href=currentList[0].pdf; a.download=currentList[0].id+'.pdf'; document.body.appendChild(a); a.click(); a.remove(); } else alert('No results to download'); });

  // year quick actions
  for(let y=1;y<=4;y++){
    const p = document.getElementById('preview-year-'+y);
    const d = document.getElementById('download-year-'+y);
    if(p) p.addEventListener('click', ()=>{ const s=sample.find(x=>Number(x.year)===y); if(s) window.open(s.pdf,'_blank','noopener'); else alert('No syllabus found for Year '+y); });
    if(d) d.addEventListener('click', ()=>{ const s=sample.find(x=>Number(x.year)===y); if(s){ const a=document.createElement('a'); a.href=s.pdf; a.download=s.id+'.pdf'; document.body.appendChild(a); a.click(); a.remove(); } else alert('No PDF for Year '+y); });
  }

  // initial render
  render(sample);
})();
// Single dataset used by the app (includes attached PDFs)
const syllabi = [
  {
    id: 'sem1-structured-format',
    title: 'Sem 1 Structured Format',
    branch: 'CSE',
    year: 1,
    semester: 1,
    filename: 'Sem1_Structured_Format.pdf',
    path: 'pdf/Sem1_Structured_Format.pdf',
    description: 'Structured syllabus for Semester 1 (PDF).',
    addedAt: '2025-12-15'
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
    addedAt: '2025-12-15'
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
    addedAt: '2025-12-15'
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
    addedAt: '2025-12-15'
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
    addedAt: '2025-12-15'
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
    addedAt: '2025-12-15'
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
    addedAt: '2025-12-15'
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
    addedAt: '2025-12-15'
  },
];

// DOMContentLoaded initialization moved to bottom; app uses the unified handlers below

/* sampleSyllabi removed — app now uses single `syllabi` dataset above */

/* ---------- DOM refs ---------- */
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
const activeFiltersEl = document.getElementById('activeFilters'); // optional (if present in HTML)
const mainPreviewBtn = document.getElementById('main-preview');
const mainDownloadBtn = document.getElementById('main-download');

/* ---------- Utility functions ---------- */
function formatDate(iso){
  if(!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString();
}
function unique(arr){
  return Array.from(new Set(arr));
}

/* Build a human-readable filters summary */
function getFilterSummary() {
  const parts = [];
  if (branchEl.value) parts.push(`Branch: ${branchEl.value}`);
  if (yearEl.value) parts.push(`Year: ${yearEl.options[yearEl.selectedIndex].text}`);
  if (semEl.value) parts.push(`Sem: ${semEl.options[semEl.selectedIndex].text}`);
  if ((searchEl.value || '').trim()) parts.push(`Search: "${searchEl.value.trim()}"`);
  if (!parts.length) return "No filters applied.";
  return parts.join(" • ");
}

function updateActiveFiltersSummary(){
  if (!activeFiltersEl) return; // if not in HTML, safely skip
  activeFiltersEl.textContent = getFilterSummary();
}

/* Enable/disable steps logically */
function syncStepState(){
  const hasBranch = !!branchEl.value;
  const hasYear = !!yearEl.value;

  yearEl.disabled = !hasBranch;
  semEl.disabled = !hasYear;
}

/* Use a real PDF if available, otherwise show alert */
function downloadSimulated(syllabus){
  const href = syllabus.path || syllabus.pdf;
  if (!href){
    alert("No PDF uploaded yet for this subject.");
    return;
  }
  // Open PDF in a new tab/window (_blank) so user can view or use browser's download
  window.open(href, '_blank', 'noopener,noreferrer');
}

// Open a PDF in a new tab for previewing
function openPdfInNewTab(syllabus){
  const href = syllabus.path || syllabus.pdf;
  if (!href){
    alert("No PDF available for preview.");
    return;
  }
  window.open(href, '_blank', 'noopener,noreferrer');
}

/* ---------- Render logic ---------- */
function renderCards(list){
  cardsEl.innerHTML = '';
  // remember current rendered list for main-page actions
  currentList = list.slice();
  if(!list.length){
    cardsEl.innerHTML = '<div class="muted">No syllabi found. Try different filters.</div>';
    resultCountEl.textContent = 'Showing 0 results';
    return;
  }
  resultCountEl.textContent = `Showing ${list.length} result${list.length>1?'s':''}`;
  list.forEach(s => {
    const card = document.createElement('article');
    card.className = 'card';
    const added = s.addedAt || s.added || '';
    const desc = s.description || s.short || '';
    card.innerHTML = `
      <div class="meta">
        <div class="chip">${s.branch || ''}</div>
        <div class="chip">Y${s.year || ''} • Sem ${s.semester || ''}</div>
        ${s.code ? `<div class="chip chip-soft">${s.code}</div>` : ''}
        <div style="margin-left:auto" class="muted">${formatDate(added)}</div>
      </div>
      <h3 class="title">${s.title}</h3>
      <div class="desc">${desc}</div>
      <div class="muted" style="font-size:12px;margin-bottom:8px;">
        ${s.level ? `Level: <strong>${s.level}</strong>` : ''} 
        ${s.credits ? `• Credits: <strong>${s.credits}</strong>` : ''}
      </div>
      <div class="actions">
        <button class="download" data-id="${s.id}">Download</button>
        <button class="preview" data-id="${s.id}">Preview</button>
      </div>
    `;
    cardsEl.appendChild(card);
  });

  // attach listeners
  cardsEl.querySelectorAll('.download').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const id = e.currentTarget.dataset.id;
      const s = syllabi.find(x=>String(x.id)===String(id));
      if(s) downloadSimulated(s);
    });
  });
  cardsEl.querySelectorAll('.preview').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const id = e.currentTarget.dataset.id;
      const s = syllabi.find(x=>String(x.id)===String(id));
      if(s) openPdfInNewTab(s);
    });
  });
}

// track last rendered list
let currentList = [];

/* ---------- Filtering & sorting ---------- */
function applyFilters(){
  const branch = branchEl.value;
  const year = yearEl.value;
  const sem = semEl.value;
  const q = (searchEl.value||'').trim().toLowerCase();
  let list = syllabi.slice();

  if(branch) list = list.filter(x => x.branch === branch);
  if(year) list = list.filter(x => String(x.year) === String(year));
  if(sem) list = list.filter(x => String(x.semester) === String(sem));
  if(q) list = list.filter(x => (x.title + ' ' + x.short).toLowerCase().includes(q));

  // sorting
  const sort = sortEl.value;
  if(sort === 'branch') list.sort((a,b)=> (a.branch||'').localeCompare(b.branch||''));
  else if(sort === 'year') list.sort((a,b)=> (a.year||0) - (b.year||0));
  else list.sort((a,b)=> new Date(b.addedAt || b.added || 0) - new Date(a.addedAt || a.added || 0)); // recent first

  renderCards(list);
  updateStats(list);
  updateActiveFiltersSummary();
}

/* Reset all filters + state */
function resetFilters(){
  branchEl.value = '';
  yearEl.value = '';
  semEl.value = '';
  searchEl.value = '';
  sortEl.value = 'recent';
  syncStepState();
  applyFilters();
}

/* ---------- Stats ---------- */
function updateStats(currentList){
  statTotal.textContent = syllabi.length;
  statBranches.textContent = unique(syllabi.map(s=>s.branch)).length;

  const latest = syllabi.slice().sort((a,b)=> new Date(b.addedAt || b.added || 0) - new Date(a.addedAt || a.added || 0))[0];
  statUpdated.textContent = latest ? formatDate(latest.addedAt || latest.added) : '—';
}

/* ---------- Modal ---------- */
function openModal(syllabus){
  modalRoot.innerHTML = `
    <div class="modal-backdrop" role="dialog" aria-modal="true">
      <div class="modal">
        <div class="modal-head">
          <div>
            <strong>${syllabus.title}</strong>
            <div class="muted" style="margin-top:6px">
              ${syllabus.code ? syllabus.code + " • " : ""}${syllabus.branch} • Year ${syllabus.year} • Sem ${syllabus.semester}
            </div>
          </div>
          <div>
            <button id="modalDownload" class="download">Download</button>
            <button id="modalClose" class="btn ghost">Close</button>
          </div>
        </div>
        <pre id="modalContent">Loading syllabus preview...</pre>
      </div>
    </div>
  `;
  modalRoot.setAttribute('aria-hidden','false');

  const lines = [
    `Syllabus — ${syllabus.title}`,
    syllabus.code ? `Course Code: ${syllabus.code}` : "",
    `Branch: ${syllabus.branch}`,
    `Year: ${syllabus.year} • Semester: ${syllabus.semester}`,
    syllabus.level ? `Level: ${syllabus.level}` : "",
    syllabus.credits ? `Credits: ${syllabus.credits}` : "",
    "",
    "Course Overview:",
    syllabus.short,
    ""
  ];

  if (syllabus.topics && syllabus.topics.length){
    lines.push("Major Topics:");
    syllabus.topics.forEach(t => lines.push("- " + t));
    lines.push("");
  }

  lines.push(
    "Assessment (example):",
    "- Midterm: 30%",
    "- End-term: 50%",
    "- Practicals / Project: 20%",
    "",
    "Note:",
    "For full official syllabus and unit-wise breakdown, please refer to the attached PDF."
  );

  document.getElementById('modalContent').textContent = lines.join('\n');

  document.getElementById('modalDownload').addEventListener('click', ()=>downloadSimulated(syllabus));
  document.getElementById('modalClose').addEventListener('click', closeModal);

  modalRoot.querySelector('.modal-backdrop').addEventListener('click', (ev)=>{
    if(ev.target.classList.contains('modal-backdrop')) closeModal();
  });

  document.addEventListener('keydown', onEsc);
}

function closeModal(){
  modalRoot.innerHTML = '';
  modalRoot.setAttribute('aria-hidden','true');
  document.removeEventListener('keydown', onEsc);
}

function onEsc(e){
  if(e.key === 'Escape') closeModal();
}

/* ---------- Init & dynamic behaviour ---------- */

// auto-apply when filters change (more dynamic)
branchEl.addEventListener('change', () => {
  syncStepState();
  applyFilters();
});
yearEl.addEventListener('change', () => {
  syncStepState();
  applyFilters();
});
semEl.addEventListener('change', applyFilters);

let searchTimeout;
searchEl.addEventListener('input', () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(applyFilters, 300); // debounce typing
});

applyBtn.addEventListener('click', applyFilters);
resetBtn.addEventListener('click', resetFilters);
sortEl.addEventListener('change', applyFilters);

// initial state
syncStepState();
updateStats(syllabi);
applyFilters();

// Year quick-action buttons (Preview first match, Download first match)
for (let y = 1; y <= 4; y++) {
  const prev = document.getElementById(`preview-year-${y}`);
  const dl = document.getElementById(`download-year-${y}`);
  if (prev) prev.addEventListener('click', () => {
    const s = syllabi.find(x => Number(x.year) === y);
    if (s) openModal(s);
    else alert(`No syllabus found for Year ${y}`);
  });
  if (dl) dl.addEventListener('click', () => {
    const s = syllabi.find(x => Number(x.year) === y);
    if (s) downloadSimulated(s);
    else alert(`No PDF found for Year ${y}`);
  });
}
// Ensure year preview opens in new tab as well
for (let y = 1; y <= 4; y++) {
  const prev = document.getElementById(`preview-year-${y}`);
  if (prev) prev.addEventListener('click', () => {
    const s = syllabi.find(x => Number(x.year) === y);
    if (s) openPdfInNewTab(s);
    else alert(`No syllabus found for Year ${y}`);
  });
}

// Main-page Preview/Download buttons act on the first result in the current list
if (mainPreviewBtn) mainPreviewBtn.addEventListener('click', ()=>{
  const s = currentList && currentList[0];
  if (s) openPdfInNewTab(s);
  else alert('No results to preview.');
});
if (mainDownloadBtn) mainDownloadBtn.addEventListener('click', ()=>{
  const s = currentList && currentList[0];
  if (s) downloadSimulated(s);
  else alert('No results to download.');
});
