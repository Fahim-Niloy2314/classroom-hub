/**
 * Classroom Hub - Main Application Logic
 * Author: Fahim Niloy (CUET ME '20, Roll: 2003063)
 */

// Application State
let appData = null;
let currentTab = 'home';
let selectedTerm = 'ALL';
let selectedCategory = 'ALL';
let searchQuery = '';
let currentPreviewPath = '';
let currentGeneratedOtp = null;
let otpTarget = null; // 'register' or 'forgot'

// LocalStorage Keys
const STORAGE_KEYS = {
  USER: 'classroom_user',
  PRO: 'classroom_pro_status',
  BOOKMARKS: 'classroom_bookmarks',
  PROGRESS: 'classroom_progress',
  CONTACT: 'classroom_custom_contact'
};

// Default User State
let currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || 'null');
let isPro = localStorage.getItem(STORAGE_KEYS.PRO) === 'true';
let bookmarks = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKMARKS) || '[]');
let courseProgress = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROGRESS) || '{}');

/* =========================================================================
   1. INITIALIZATION & DATA LOADING
   ========================================================================= */
document.addEventListener('DOMContentLoaded', async () => {
  setupDialogLightDismiss();
  await loadClassroomData();
  loadCustomContacts();
  updateAuthUI();
  updateProUI();
  renderHome();
  setupFilterPills();
  renderResources();
  renderTracker();
  lucide.createIcons();
});

async function loadClassroomData() {
  if (window.CLASSROOM_DATA) {
    appData = window.CLASSROOM_DATA;
    return;
  }
  try {
    const res = await fetch('classroom_index.json');
    appData = await res.json();
  } catch (err) {
    console.error('Failed to load classroom_index.json:', err);
  }
}

/* =========================================================================
   2. DIALOG LIGHT-DISMISS ENFORCEMENT (Modern Web Guidance)
   ========================================================================= */
function setupDialogLightDismiss() {
  const dialogs = document.querySelectorAll('dialog');
  dialogs.forEach(dialog => {
    // Fallback for browsers without native closedby support
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      dialog.addEventListener('click', (event) => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const isDialogContent = (
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width
        );
        if (!isDialogContent) {
          dialog.close();
        }
      });
    }
  });
}

/* =========================================================================
   3. TAB SWITCHING
   ========================================================================= */
function switchTab(tab) {
  currentTab = tab;
  
  // Views
  const views = ['home', 'resources', 'ai', 'tracker'];
  views.forEach(v => {
    const el = document.getElementById(`view-${v}`);
    if (el) el.classList.toggle('hidden', v !== tab);
  });

  // Top Nav Buttons
  views.forEach(v => {
    const btn = document.getElementById(`nav-tab-${v}`);
    if (btn) {
      if (v === tab) {
        btn.className = 'nav-tab px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 text-white bg-indigo-600 shadow-sm';
      } else {
        btn.className = 'nav-tab px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50';
      }
    }
  });

  if (tab === 'resources') {
    renderResources();
  } else if (tab === 'tracker') {
    renderTracker();
  }

  lucide.createIcons();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* =========================================================================
   4. HOME TAB RENDERING & CONTACT SETTINGS
   ========================================================================= */
function renderHome() {
  if (!appData) return;

  // Stats
  document.getElementById('statFilesCount').textContent = (appData.summary?.total_academic_files || 3896).toLocaleString();
  document.getElementById('statPdfCount').textContent = (appData.summary?.pdf_count || 2986).toLocaleString();
  document.getElementById('statTermsCount').textContent = appData.terms?.length || 8;
  document.getElementById('statCoursesCount').textContent = `${appData.summary?.total_courses || 50}+`;

  // Semesters Grid
  const grid = document.getElementById('homeSemestersGrid');
  if (!grid) return;
  grid.innerHTML = '';

  appData.terms.forEach(term => {
    const card = document.createElement('div');
    card.className = 'p-5 rounded-2xl glass-card cursor-pointer group flex flex-col justify-between';
    card.onclick = () => {
      selectedTerm = term.code;
      switchTab('resources');
      setupFilterPills();
    };

    card.innerHTML = `
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <span class="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 font-bold font-mono text-xs border border-indigo-500/30">
            ${term.code}
          </span>
          <span class="text-xs text-slate-500 font-medium">Level ${term.code[1]} Term ${term.code[4]}</span>
        </div>
        <h4 class="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">
          ${term.code} Semester
        </h4>
        <p class="text-xs text-slate-400 line-clamp-2">
          ${term.courses.map(c => c.name).slice(0, 3).join(', ')}...
        </p>
      </div>

      <div class="pt-4 mt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span>${term.course_count} টি কোর্স</span>
        <span class="text-indigo-400 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
          ${term.total_files} ফাইল →
        </span>
      </div>
    `;
    grid.appendChild(card);
  });
}

function loadCustomContacts() {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.CONTACT) || '{}');
  const email = saved.email || appData?.student?.email || 'fahimniloy2003063@gmail.com';
  const phone = saved.phone || appData?.student?.phone || '+880 1700-000000';
  const github = saved.github || appData?.student?.github_link || 'https://github.com/Fahim-Niloy2314/classroom-hub';
  const google = saved.google || appData?.student?.google_link || 'https://drive.google.com';

  const emailEl = document.getElementById('homeEmailLink');
  const phoneEl = document.getElementById('homePhoneLink');
  const githubEl = document.getElementById('homeGithubLink');
  const footerGithubEl = document.getElementById('footerGithubLink');
  const googleEl = document.getElementById('homeGoogleLink');

  if (emailEl) {
    emailEl.href = `mailto:${email}`;
    emailEl.textContent = email;
  }
  if (phoneEl) {
    phoneEl.href = `tel:${phone.replace(/\s+/g, '')}`;
    phoneEl.textContent = phone;
  }
  if (githubEl) {
    githubEl.href = github;
  }
  if (footerGithubEl) {
    footerGithubEl.href = github;
  }
  if (googleEl) {
    googleEl.href = google;
  }
}

function openEditContactModal() {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.CONTACT) || '{}');
  document.getElementById('editEmailInput').value = saved.email || appData?.student?.email || 'fahimniloy2003063@gmail.com';
  document.getElementById('editPhoneInput').value = saved.phone || appData?.student?.phone || '+880 1700-000000';
  document.getElementById('editGithubInput').value = saved.github || appData?.student?.github_link || 'https://github.com/Fahim-Niloy2314/classroom-hub';
  document.getElementById('editGoogleInput').value = saved.google || appData?.student?.google_link || 'https://drive.google.com';
  
  const dialog = document.getElementById('editContactDialog');
  dialog.showModal();
  lucide.createIcons();
}

function closeEditContactModal() {
  document.getElementById('editContactDialog').close();
}

function saveContactSettings() {
  const newContacts = {
    email: document.getElementById('editEmailInput').value.trim(),
    phone: document.getElementById('editPhoneInput').value.trim(),
    github: document.getElementById('editGithubInput').value.trim(),
    google: document.getElementById('editGoogleInput').value.trim(),
  };
  localStorage.setItem(STORAGE_KEYS.CONTACT, JSON.stringify(newContacts));
  loadCustomContacts();
  closeEditContactModal();
  showToast('যোগাযোগ ও গিটহাব লিংক সফলভাবে আপডেট হয়েছে!');
}

/* =========================================================================
   5. RESOURCE EXPLORER & ADVANCED SEARCH
   ========================================================================= */
function setupFilterPills() {
  if (!appData) return;

  // Term Pills
  const termContainer = document.getElementById('termFilterPills');
  if (termContainer) {
    const terms = ['ALL', ...appData.terms.map(t => t.code), 'BULLETIN'];
    termContainer.innerHTML = terms.map(t => {
      const active = selectedTerm === t;
      const label = t === 'ALL' ? 'সব সেমিস্টার' : t === 'BULLETIN' ? 'UG বুলেটিন' : t;
      return `
        <button onclick="setTermFilter('${t}')" class="whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
          active ? 'bg-indigo-600 text-white shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
        }">
          ${label}
        </button>
      `;
    }).join('');
  }

  // Category Pills
  const catContainer = document.getElementById('categoryFilterPills');
  if (catContainer) {
    const categories = [
      { id: 'ALL', label: 'সব ফরম্যাট' },
      { id: 'Lecture Notes & Books', label: 'নোটস ও বুকস' },
      { id: 'Questions & Viva', label: 'কুইজ ও ভাইভা' },
      { id: 'Lab & Sessional', label: 'ল্যাব ও সেশনাল' },
      { id: 'Lecture Slides', label: 'স্লাইডস' },
      { id: 'Codes & CAD Models', label: 'কোড ও CAD' },
    ];
    catContainer.innerHTML = categories.map(c => {
      const active = selectedCategory === c.id;
      return `
        <button onclick="setCategoryFilter('${c.id}')" class="whitespace-nowrap px-3 py-1 rounded-lg text-xs font-medium transition-all ${
          active ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
        }">
          ${c.label}
        </button>
      `;
    }).join('');
  }
}

function setTermFilter(t) {
  selectedTerm = t;
  setupFilterPills();
  renderResources();
}

function setCategoryFilter(c) {
  selectedCategory = c;
  setupFilterPills();
  renderResources();
}

function handleSearch(q) {
  searchQuery = q.trim().toLowerCase();
  renderResources();
}

function clearSearch() {
  document.getElementById('resourceSearchInput').value = '';
  searchQuery = '';
  selectedTerm = 'ALL';
  selectedCategory = 'ALL';
  setupFilterPills();
  renderResources();
}

function getAllFlatFiles() {
  if (!appData) return [];
  const list = [];
  
  // Root files like Bulletin
  if (appData.root_files) {
    list.push(...appData.root_files);
  }

  // Term courses
  appData.terms.forEach(term => {
    term.courses.forEach(course => {
      course.files.forEach(f => list.push(f));
    });
  });

  return list;
}

function renderResources() {
  const grid = document.getElementById('resourcesGrid');
  if (!grid || !appData) return;

  const allFiles = getAllFlatFiles();

  const filtered = allFiles.filter(f => {
    // Term filter
    if (selectedTerm === 'BULLETIN') {
      if (f.course !== 'Undergraduate Bulletin') return false;
    } else if (selectedTerm !== 'ALL') {
      if (f.term_code !== selectedTerm) return false;
    }

    // Category filter
    if (selectedCategory !== 'ALL') {
      if (f.category !== selectedCategory) return false;
    }

    // Search query
    if (searchQuery) {
      const target = `${f.name} ${f.course} ${f.term_code} ${f.category}`.toLowerCase();
      const tokens = searchQuery.split(/\s+/);
      return tokens.every(token => target.includes(token));
    }

    return true;
  });

  document.getElementById('filteredCountBadge').textContent = filtered.length.toLocaleString();

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full py-16 text-center text-slate-400 glass-panel rounded-2xl">
        <i data-lucide="folder-search" class="w-12 h-12 mx-auto mb-3 text-slate-600"></i>
        <h3 class="text-base font-semibold text-slate-300">কোনো ফাইল পাওয়া যায়নি</h3>
        <p class="text-xs text-slate-500 mt-1">অন্য কোনো কি-ওয়ার্ড দিয়ে খুঁজুন অথবা ফিল্টার রিসেট করুন।</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  // Limit rendering for ultra-fast performance if large
  const displayFiles = filtered.slice(0, 150);

  grid.innerHTML = displayFiles.map(f => {
    const isBookmarked = bookmarks.includes(f.id);
    const iconName = getFileIcon(f.ext);
    
    return `
      <div class="p-4 rounded-2xl glass-card flex flex-col justify-between space-y-3 group">
        <div>
          <!-- Header tags -->
          <div class="flex items-center justify-between text-[11px] mb-2">
            <span class="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 font-mono font-medium border border-indigo-500/20">
              ${f.term_code || 'ME'}
            </span>
            <div class="flex items-center gap-1.5">
              <span class="text-slate-400 font-mono">${f.size_str}</span>
              <button onclick="toggleBookmark('${f.id}')" title="বুকমার্ক" class="p-1 text-slate-500 hover:text-amber-400 transition-colors">
                <i data-lucide="star" class="w-4 h-4 ${isBookmarked ? 'text-amber-400 fill-amber-400' : ''}"></i>
              </button>
            </div>
          </div>

          <!-- File Name & Course -->
          <div class="flex items-start gap-3">
            <div class="p-2 rounded-xl bg-slate-800 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all flex-shrink-0">
              <i data-lucide="${iconName}" class="w-5 h-5"></i>
            </div>
            <div class="overflow-hidden">
              <h4 class="text-sm font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-2" title="${f.name}">
                ${f.name}
              </h4>
              <p class="text-[11px] text-slate-400 truncate mt-0.5">
                ${f.course}
              </p>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <button onclick="previewFile('${encodeURIComponent(f.path)}', '${encodeURIComponent(f.name)}')" class="flex-1 py-1.5 px-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-medium transition-all flex items-center justify-center gap-1">
            <i data-lucide="eye" class="w-3.5 h-3.5"></i>
            <span>পড়ুন</span>
          </button>
          
          <button onclick="openFileLocally('${encodeURIComponent(f.path)}')" title="কম্পিউটারের ডিফল্ট অ্যাপে খুলুন" class="py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all flex items-center gap-1">
            <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
            <span class="hidden sm:inline">Windows-এ খুলুন</span>
          </button>

          <a href="/api/file?path=${encodeURIComponent(f.path)}&download=1" download title="ডাউনলোড" class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition-all">
            <i data-lucide="download" class="w-3.5 h-3.5"></i>
          </a>
        </div>
      </div>
    `;
  }).join('');

  if (filtered.length > 150) {
    grid.innerHTML += `
      <div class="col-span-full py-4 text-center text-xs text-slate-400">
        আরও ${(filtered.length - 150).toLocaleString()} টি ফাইল দেখতে সার্চ বক্সে নির্দিষ্ট কোর্স বা ফাইলের নাম লিখুন।
      </div>
    `;
  }

  lucide.createIcons();
}

function getFileIcon(ext) {
  switch (ext) {
    case '.pdf': return 'file-text';
    case '.ppt':
    case '.pptx': return 'presentation';
    case '.doc':
    case '.docx': return 'file-edit';
    case '.xlsx': return 'sheet';
    case '.m':
    case '.cpp':
    case '.c': return 'code-2';
    case '.sldprt':
    case '.sldasm': return 'box';
    case '.jpg':
    case '.jpeg':
    case '.png': return 'image';
    default: return 'file';
  }
}

/* =========================================================================
   6. PDF VIEWER & NATIVE LAUNCHER
   ========================================================================= */
function previewFile(encPath, encName) {
  const path = decodeURIComponent(encPath);
  const name = decodeURIComponent(encName);
  currentPreviewPath = path;

  const dialog = document.getElementById('pdfViewerDialog');
  const title = document.getElementById('pdfViewerTitle');
  const frame = document.getElementById('pdfViewerFrame');
  const dl = document.getElementById('viewerDownloadBtn');

  title.textContent = name;
  frame.src = `/api/file?path=${encodeURIComponent(path)}`;
  dl.href = `/api/file?path=${encodeURIComponent(path)}&download=1`;

  dialog.showModal();
  lucide.createIcons();
}

function previewFileByName(filename) {
  const allFiles = getAllFlatFiles();
  const found = allFiles.find(f => f.name === filename || f.path.endsWith(filename));
  if (found) {
    previewFile(encodeURIComponent(found.path), encodeURIComponent(found.name));
  } else {
    showToast(`ফাইল ${filename} পাওয়া যায়নি`);
  }
}

function closePdfViewer() {
  const dialog = document.getElementById('pdfViewerDialog');
  const frame = document.getElementById('pdfViewerFrame');
  frame.src = 'about:blank';
  dialog.close();
}

async function openFileLocally(encPath) {
  const path = decodeURIComponent(encPath);
  try {
    const res = await fetch(`/api/open-local?path=${encodeURIComponent(path)}`);
    const data = await res.json();
    if (data.success) {
      showToast(`আপনার কম্পিউটারে ওপেন করা হয়েছে!`);
    } else {
      showToast(`ব্যর্থ: ${data.error || 'অজানা ত্রুটি'}`);
    }
  } catch (err) {
    // If running purely client-side without local server
    showToast('লোকাল সার্ভারে কানেক্টেড নয়। প্রিভিউ বাটন ব্যবহার করুন।');
  }
}

function openCurrentFileLocally() {
  if (currentPreviewPath) {
    openFileLocally(encodeURIComponent(currentPreviewPath));
  }
}

/* =========================================================================
   7. BOOKMARKS & SYLLABUS PROGRESS TRACKER
   ========================================================================= */
function toggleBookmark(fileId) {
  if (bookmarks.includes(fileId)) {
    bookmarks = bookmarks.filter(id => id !== fileId);
    showToast('বুকমার্ক থেকে সরানো হয়েছে');
  } else {
    bookmarks.push(fileId);
    showToast('বুকমার্কে যোগ করা হয়েছে ⭐');
  }
  localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
  renderResources();
  renderTracker();
}

function renderTracker() {
  if (!appData) return;

  // Bookmarks List
  const allFiles = getAllFlatFiles();
  const bookmarkedFiles = allFiles.filter(f => bookmarks.includes(f.id));
  const bmCount = document.getElementById('bookmarkedCount');
  const bmList = document.getElementById('bookmarkedList');

  if (bmCount) bmCount.textContent = bookmarkedFiles.length;
  if (bmList) {
    if (bookmarkedFiles.length === 0) {
      bmList.innerHTML = `<p class="text-slate-500 italic">কোনো ফাইল এখনো বুকমার্ক করা হয়নি।</p>`;
    } else {
      bmList.innerHTML = bookmarkedFiles.map(f => `
        <div class="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 flex items-center gap-2">
          <span class="text-indigo-300 font-medium truncate max-w-xs">${f.name}</span>
          <button onclick="previewFile('${encodeURIComponent(f.path)}', '${encodeURIComponent(f.name)}')" class="text-slate-400 hover:text-white">
            <i data-lucide="eye" class="w-3.5 h-3.5"></i>
          </button>
          <button onclick="toggleBookmark('${f.id}')" class="text-amber-400 hover:text-red-400">
            <i data-lucide="x" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      `).join('');
    }
  }

  // Progress Checklist per Term
  const trackerContainer = document.getElementById('trackerTermsList');
  if (!trackerContainer) return;

  let totalCourses = 0;
  let completedCourses = 0;

  trackerContainer.innerHTML = appData.terms.map(term => {
    const coursesHtml = term.courses.map(course => {
      totalCourses++;
      const isDone = !!courseProgress[course.name];
      if (isDone) completedCourses++;

      return `
        <label class="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/40 cursor-pointer text-xs transition-colors">
          <div class="flex items-center gap-2.5">
            <input type="checkbox" onchange="toggleCourseProgress('${course.name}', this.checked)" ${isDone ? 'checked' : ''} class="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-600 focus:ring-emerald-500">
            <span class="${isDone ? 'line-through text-slate-500' : 'text-slate-200'} font-medium">
              ${course.name}
            </span>
          </div>
          <span class="text-slate-400 font-mono">${course.file_count} ফাইল</span>
        </label>
      `;
    }).join('');

    return `
      <div class="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div class="flex items-center justify-between">
          <h4 class="text-sm font-bold text-white flex items-center gap-2">
            <span class="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-xs">${term.code}</span>
            <span>${term.title}</span>
          </h4>
          <span class="text-xs text-slate-400">${term.course_count} টি কোর্স</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          ${coursesHtml}
        </div>
      </div>
    `;
  }).join('');

  // Update progress bar
  const pct = totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0;
  document.getElementById('trackerProgressPercent').textContent = `${pct}%`;
  document.getElementById('trackerProgressBar').style.width = `${pct}%`;

  lucide.createIcons();
}

function toggleCourseProgress(courseName, isDone) {
  if (isDone) {
    courseProgress[courseName] = true;
  } else {
    delete courseProgress[courseName];
  }
  localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(courseProgress));
  renderTracker();
}

/* =========================================================================
   8. AUTHENTICATION & MOBILE OTP REGISTRATION & FORGOT PASSWORD
   ========================================================================= */
function openAuthModal() {
  const dialog = document.getElementById('authDialog');
  switchAuthTab('login');
  dialog.showModal();
  lucide.createIcons();
}

function closeAuthModal() {
  document.getElementById('authDialog').close();
}

function switchAuthTab(tab) {
  const tabs = ['login', 'register', 'forgot'];
  tabs.forEach(t => {
    const btn = document.getElementById(`authTabBtn-${t}`);
    const panel = document.getElementById(`authPanel-${t}`);
    if (btn && panel) {
      if (t === tab) {
        btn.className = 'flex-1 py-1.5 rounded-lg text-white bg-indigo-600 transition-all';
        panel.classList.remove('hidden');
      } else {
        btn.className = 'flex-1 py-1.5 rounded-lg hover:text-white transition-all';
        panel.classList.add('hidden');
      }
    }
  });
}

function handleGoogleSignIn() {
  currentUser = {
    name: 'Fahim Niloy (CUET ME)',
    email: 'fahimniloy@cuet.ac.bd',
    method: 'google',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
  };
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
  updateAuthUI();
  closeAuthModal();
  showToast('গুগল অ্যাকাউন্ট দিয়ে সফলভাবে লগইন হয়েছে! 🎉');
}

function handleEmailLogin(e) {
  e.preventDefault();
  const id = document.getElementById('loginIdentifier').value.trim();
  const pass = document.getElementById('loginPassword').value.trim();

  if (!id || !pass) return;

  currentUser = {
    name: id.includes('@') ? id.split('@')[0] : `User-${id.slice(-4)}`,
    email: id,
    method: 'password'
  };
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
  updateAuthUI();
  closeAuthModal();
  showToast('লগইন সফল হয়েছে! স্বাগতম।');
}

// Mobile OTP Registration
function sendRegisterOtp() {
  const name = document.getElementById('regName').value.trim();
  const phone = document.getElementById('regPhone').value.trim();

  if (!phone || phone.length < 10) {
    showToast('অনুগ্রহ করে সঠিক মোবাইল নাম্বার প্রদান করুন');
    return;
  }

  // Generate 6 digit code
  currentGeneratedOtp = Math.floor(100000 + Math.random() * 900000).toString();
  otpTarget = 'register';

  document.getElementById('displayRegPhone').textContent = phone;
  document.getElementById('registerStep1').classList.add('hidden');
  document.getElementById('registerStep2').classList.remove('hidden');

  showOtpToast(currentGeneratedOtp);
}

function verifyOtpAndRegister() {
  const enteredOtp = document.getElementById('regOtpInput').value.trim();
  const newPass = document.getElementById('regNewPassword').value.trim();
  const name = document.getElementById('regName').value.trim() || 'Classroom User';
  const phone = document.getElementById('regPhone').value.trim();

  if (enteredOtp !== currentGeneratedOtp) {
    showToast('ভুল OTP কোড! পুনরায় চেষ্টা করুন।');
    return;
  }
  if (!newPass || newPass.length < 6) {
    showToast('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
    return;
  }

  currentUser = {
    name: name,
    phone: phone,
    email: `${phone}@classroom.hub`,
    method: 'phone_otp'
  };
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
  updateAuthUI();
  closeAuthModal();
  hideOtpToast();
  showToast('অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে এবং লগইন করা হয়েছে! 🚀');
}

// Forgot Password Flow
function sendForgotOtp() {
  const id = document.getElementById('forgotIdentifier').value.trim();
  if (!id) {
    showToast('মোবাইল নাম্বার বা ইমেইল লিখুন');
    return;
  }
  currentGeneratedOtp = Math.floor(100000 + Math.random() * 900000).toString();
  otpTarget = 'forgot';

  document.getElementById('forgotStep1').classList.add('hidden');
  document.getElementById('forgotStep2').classList.remove('hidden');

  showOtpToast(currentGeneratedOtp);
}

function resetPasswordWithOtp() {
  const enteredOtp = document.getElementById('forgotOtpInput').value.trim();
  const newPass = document.getElementById('forgotNewPassword').value.trim();

  if (enteredOtp !== currentGeneratedOtp) {
    showToast('ভুল OTP কোড!');
    return;
  }
  if (!newPass || newPass.length < 6) {
    showToast('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
    return;
  }

  currentUser = {
    name: 'Verified User',
    email: document.getElementById('forgotIdentifier').value.trim(),
    method: 'password_reset'
  };
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
  updateAuthUI();
  closeAuthModal();
  hideOtpToast();
  showToast('পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে এবং লগইন সম্পন্ন হয়েছে! 🎉');
}

function updateAuthUI() {
  const btn = document.getElementById('authBtnLabel');
  if (currentUser) {
    btn.textContent = currentUser.name || 'আমার প্রোফাইল';
  } else {
    btn.textContent = 'লগইন';
  }
}

// Floating OTP Notification Simulator
function showOtpToast(code) {
  const toast = document.getElementById('otpToast');
  document.getElementById('otpToastCode').textContent = code;
  toast.classList.remove('hidden');
  setTimeout(() => {
    toast.classList.remove('translate-y-4', 'opacity-0');
  }, 50);
}

function hideOtpToast() {
  const toast = document.getElementById('otpToast');
  toast.classList.add('translate-y-4', 'opacity-0');
  setTimeout(() => toast.classList.add('hidden'), 300);
}

function autoFillOtp() {
  if (otpTarget === 'register') {
    const input = document.getElementById('regOtpInput');
    if (input) input.value = currentGeneratedOtp;
  } else if (otpTarget === 'forgot') {
    const input = document.getElementById('forgotOtpInput');
    if (input) input.value = currentGeneratedOtp;
  }
  showToast('OTP কোড স্বয়ংক্রিয়ভাবে ইনপুট করা হয়েছে!');
}

/* =========================================================================
   9. LIFETIME PRO & MONETIZATION SYSTEM
   ========================================================================= */
function openUpgradeModal() {
  const dialog = document.getElementById('upgradeDialog');
  dialog.showModal();
  lucide.createIcons();
}

function closeUpgradeModal() {
  document.getElementById('upgradeDialog').close();
}

function handlePaymentGateway(method) {
  showToast(`${method} পেমেন্ট গেটওয়েতে সংযোগ করা হচ্ছে...`);
  setTimeout(() => {
    // Simulated successful instant activation
    isPro = true;
    localStorage.setItem(STORAGE_KEYS.PRO, 'true');
    updateProUI();
    closeUpgradeModal();
    showToast(`অভিনন্দন! ${method} সফল হয়েছে। আজীবন প্রো এক্টিভেটেড! 👑`);
  }, 1200);
}

function redeemActivationKey() {
  const key = document.getElementById('activationKeyInput').value.trim().toUpperCase();
  const validKeys = ['ME20-LIFETIME', 'PRO2026', '2003063', 'FAHIM-PRO'];

  if (validKeys.includes(key)) {
    isPro = true;
    localStorage.setItem(STORAGE_KEYS.PRO, 'true');
    updateProUI();
    closeUpgradeModal();
    showToast('প্রো কী গৃহীত হয়েছে! লাইফটাইম অ্যাক্সেস সক্রিয়! 🌟');
  } else {
    showToast('অবৈধ অ্যাক্টিভেশন কী! দয়া করে সঠিক কী দিন।');
  }
}

function updateProUI() {
  const badge = document.getElementById('proBadgeBtn');
  const text = document.getElementById('proBadgeText');

  if (isPro) {
    badge.className = 'px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 badge-pro text-white shadow-lg';
    text.textContent = 'Lifetime Pro 👑';
    badge.querySelector('span:last-child').style.display = 'none';
  } else {
    badge.className = 'px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 shadow-sm';
    text.textContent = 'Free Access';
  }
}

/* =========================================================================
   10. AI STUDY ASSISTANT (Gemini Knowledge Hub)
   ========================================================================= */
const ME_KNOWLEDGE_BASE = {
  'lathe': `### 🔧 Workshop ME 154: Lathe Machine ভাইভা প্রস্তুতি
1. **Lathe Machine এর সংজ্ঞা:**
   - Lathe হলো এমন একটি মেশিন টুল যাতে ওয়ার্কপিসকে তার অক্ষের চারদিকে ঘোরানো হয় এবং কাটিং টুল ওয়ার্কপিসে ফিড করিয়ে উপাদান অপসারণ করা হয়।
2. **প্রধান অংশসমূহ:**
   - **Headstock:** স্পিন্ডল এবং গিয়ারবক্স ধারণ করে।
   - **Tailstock:** দীর্ঘ ওয়ার্কপিস সাপোর্ট দিতে ও ড্রিলিং টুলের জন্য ব্যবহৃত হয়।
   - **Carriage:** স্যাডল, ক্রস-স্লাইড, কম্পাউন্ড রেস্ট ও টুলপোস্ট ধারণ করে কাটিং টুলকে মুভ করায়।
   - **Bed:** উচ্চ ড্যাম্পিং ক্ষমতার জন্য ঢালাই লোহা (Cast Iron) দিয়ে তৈরি।
3. **গুরুত্বপূর্ণ অপারেশন:**
   - Facing, Straight Turning, Taper Turning, Thread Cutting, Knurling, Boring, Parting-off.
4. **টুল জিওমেট্রি টিপস:**
   - High-Speed Steel (HSS) বা Single Point Carbide Tool ব্যবহার করা হয়। র্যাক অ্যাঙ্গেল ও ক্লিয়ারেন্স অ্যাঙ্গেলের পরিমাপ ভাইভায় বেশি ধরা হয়।`,

  'thermodynamics': `### 🔥 ME 211 Thermodynamics: Second Law & Formulas
1. **Kelvin-Planck Statement:**
   - এমন কোনো ইঞ্জিন তৈরি সম্ভব নয় যা একটি তাপ উৎস থেকে তাপ গ্রহণ করে সম্পূর্ণটা সমপরিমাণ কাজে রূপান্তর করবে কোনো তাপ বর্জন না করে (Thermal Efficiency < 100%)।
2. **Clausius Statement:**
   - বাহ্যিক কাজ ছাড়া কোনো সিস্টেমের পক্ষে নিম্ন তাপমাত্রার বস্তু থেকে উচ্চ তাপমাত্রার বস্তুতে তাপ স্থানান্তর করা অসম্ভব।
3. **Carnot Efficiency:**
   \\[ \\eta_{Carnot} = 1 - \\frac{T_L}{T_H} = \\frac{T_H - T_L}{T_H} \\]
   *(যেখানে \\(T_H\\) ও \\(T_L\\) পরম তাপমাত্রা বা কেলভিনে হিসেব করতে হবে)*
4. **এনট্রপি পরিবর্তন (\\(\\Delta S\\)):**
   \\[ dS = \\left(\\frac{\\delta Q}{T}\\right)_{rev} \\]
   - যেকোনো বাস্তব অপরিবর্তনীয় প্রক্রিয়ায় বিশ্বজগতের এনট্রপি সর্বদা বৃদ্ধি পায় (\\(\\Delta S_{gen} \\ge 0\\))।`,

  'bernoulli': `### 💧 ME 321 Fluid Mechanics: Bernoulli's Equation
1. **Bernoulli সমীকরণ:**
   \\[ \\frac{P}{\\rho g} + \\frac{V^2}{2g} + z = \\text{Constant} \\]
   - \\(\\frac{P}{\\rho g}\\) = Pressure Head
   - \\(\\frac{V^2}{2g}\\) = Velocity Head
   - \\(z\\) = Elevation / Potential Head
2. **শর্তসমূহ (Assumptions):**
   - প্রবাহ স্টেডি (Steady) হতে হবে।
   - প্রবাহ ইনকম্প্রেসিবল (Incompressible - ঘনত্ব স্থির)।
   - প্রবাহ ইনভিসিড বা ঘর্ষণহীন (Inviscid - \\(\\mu = 0\\))।
   - প্রবাহ একটি একক স্ট্রিমলাইনের সাথে হতে হবে।
3. **ব্যবহারিক ক্ষেত্র:**
   - Venturimeter ও Orifice Meter (ফ্লোরেট পরিমাপ)
   - Pitot Tube (স্থানীয় তরল বেগ পরিমাপ)
   - বিমানের ডানায় লিফট তৈরি ও কার্বুরেটর।`,

  'heat transfer': `### ♨️ ME 311 Heat Transfer: প্রধান সূত্র ও মেকানিজম
1. **Conduction (Fourier's Law):**
   \\[ q = -k A \\frac{dT}{dx} \\]
   *(যেখানে \\(k\\) হলো উপাদানের Thermal Conductivity)*
2. **Convection (Newton's Law of Cooling):**
   \\[ q = h A (T_s - T_\\infty) \\]
   *(যেখানে \\(h\\) হলো Convective Heat Transfer Coefficient)*
3. **Radiation (Stefan-Boltzmann Law):**
   \\[ q = \\epsilon \\sigma A (T_s^4 - T_{surr}^4) \\]
   *(যেখানে \\(\\sigma = 5.67 \\times 10^{-8} \\text{ W/m}^2\\text{K}^4\\))*`,

  'bulletin': `### 📘 Undergraduate Mechanical Engineering কারিকুলাম
- **মোট সময়কাল:** ৪ বছর (৮টি সেমিস্টার: L1-T1 থেকে L4-T2)
- **মোট ক্রেডিট আওয়ার:** আনুমানিক ১৬০ ক্রেডিট
- **কোর ডিপার্টমেন্টাল এরিয়া:**
  1. Thermal & Fluid Engineering (ME 211, 311, 321, 411, 413, 421)
  2. Solid Mechanics & Machine Design (ME 231, 235, 331, 333, 431)
  3. Manufacturing & Materials (ME 154, 251, 351, 451)
  4. Automation & Mechatronics (ME 455)
  5. Industrial & Production Management (ME 461, 463)`
};

function askPresetPrompt(promptText) {
  document.getElementById('aiInputPrompt').value = promptText;
  handleAiSubmit(new Event('submit'));
}

function handleAiSubmit(e) {
  e.preventDefault();
  const input = document.getElementById('aiInputPrompt');
  const query = input.value.trim();
  if (!query) return;

  const chatBox = document.getElementById('aiChatBox');

  // User Message bubble
  const userDiv = document.createElement('div');
  userDiv.className = 'flex items-start gap-3 justify-end';
  userDiv.innerHTML = `
    <div class="bg-purple-600 rounded-2xl rounded-tr-none p-3.5 text-sm text-white max-w-2xl leading-relaxed shadow-md">
      ${query}
    </div>
    <div class="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0 text-white">
      <i data-lucide="user" class="w-4 h-4"></i>
    </div>
  `;
  chatBox.appendChild(userDiv);
  input.value = '';
  chatBox.scrollTop = chatBox.scrollHeight;
  lucide.createIcons();

  // Bot Thinking Simulation
  const botDiv = document.createElement('div');
  botDiv.className = 'flex items-start gap-3';
  botDiv.innerHTML = `
    <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center flex-shrink-0 text-white">
      <i data-lucide="bot" class="w-4 h-4"></i>
    </div>
    <div class="bg-slate-800/80 rounded-2xl rounded-tl-none p-3.5 text-sm text-slate-200 border border-slate-700/60 max-w-2xl leading-relaxed">
      <div class="flex items-center gap-1.5 text-xs text-purple-400">
        <span class="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
        <span>তথ্য বিশ্লেষণ করা হচ্ছে...</span>
      </div>
    </div>
  `;
  chatBox.appendChild(botDiv);
  chatBox.scrollTop = chatBox.scrollHeight;

  setTimeout(() => {
    let answer = '';
    const qLower = query.toLowerCase();

    if (qLower.includes('lathe') || qLower.includes('me 154') || qLower.includes('workshop')) {
      answer = ME_KNOWLEDGE_BASE['lathe'];
    } else if (qLower.includes('thermodynamic') || qLower.includes('carnot') || qLower.includes('me 211')) {
      answer = ME_KNOWLEDGE_BASE['thermodynamics'];
    } else if (qLower.includes('bernoulli') || qLower.includes('fluid') || qLower.includes('me 321')) {
      answer = ME_KNOWLEDGE_BASE['bernoulli'];
    } else if (qLower.includes('heat') || qLower.includes('conduction') || qLower.includes('me 311')) {
      answer = ME_KNOWLEDGE_BASE['heat transfer'];
    } else if (qLower.includes('bulletin') || qLower.includes('syllabus') || qLower.includes('credit')) {
      answer = ME_KNOWLEDGE_BASE['bulletin'];
    } else {
      answer = `### 💡 আপনার প্রশ্নের সমাধান ও স্টাডি গাইড
আপনার প্রশ্ন: **"${query}"**

1. **কোর্স রেফারেন্স:** আপনি আপনার ফোল্ডারের সংশ্লিষ্ট টার্মের নোটস ও ল্যাব শিটে এ সংক্রান্ত বিস্তারিত উপাদান পাবেন।
2. **পরীক্ষার জন্য গুরুত্বপূর্ণ পয়েন্ট:**
   - যেকোনো মেকানিক্যাল থিওরি উত্তরে প্রথমে পরিস্কার ডায়াগ্রাম আঁকবেন।
   - মূল ফর্মুলা এবং প্রতিপাদনের সীমার শর্তাবলী (Assumptions) স্পষ্টভাবে উল্লেখ করবেন।
   - বিগত বছরের প্রশ্নব্যাংকে এই টপিকের ম্যাথগুলো সলভ করে নিন।
3. **সম্পর্কিত ফাইল:** উপরের 'রিসোর্স আর্কাইভ' ট্যাবে গিয়ে কি-ওয়ার্ড দিয়ে সার্চ করলে সরাসরি স্লাইড বা শিট পেয়ে যাবেন।`;
    }

    botDiv.querySelector('.bg-slate-800\\/80').innerHTML = answer.replace(/\n/g, '<br>');
    chatBox.scrollTop = chatBox.scrollHeight;
    lucide.createIcons();
  }, 600);
}

/* =========================================================================
   11. TOAST HELPER
   ========================================================================= */
function showToast(msg) {
  let toast = document.getElementById('appGlobalToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'appGlobalToast';
    toast.className = 'fixed top-20 right-6 z-50 bg-slate-900 border border-indigo-500/50 text-white text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-2xl transition-all duration-300 transform -translate-y-2 opacity-0 flex items-center gap-2';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<i data-lucide="info" class="w-4 h-4 text-indigo-400"></i> <span>${msg}</span>`;
  lucide.createIcons();
  toast.classList.remove('-translate-y-2', 'opacity-0');

  setTimeout(() => {
    toast.classList.add('-translate-y-2', 'opacity-0');
  }, 3000);
}
