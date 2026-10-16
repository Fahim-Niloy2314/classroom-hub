/**
 * Classroom Hub - Full Application Controller
 * Author: Fahim Niloy (CUET ME '20, Roll: 2003063)
 * Admin Emails: fahim.cuet.me20@gmail.com, fahimniloy2314@gmail.com
 */

// Application State
let appData = null;
let currentTab = 'home';
let currentLang = localStorage.getItem('classroom_lang') || 'en'; // Default English
let searchQuery = '';
let currentPreviewPath = '';
let currentGeneratedOtp = null;
let otpTarget = null; // 'register' or 'forgot'

// Hierarchical Folder Explorer State
let explorerState = {
  level: 'semesters', // 'semesters' | 'courses' | 'files'
  selectedTerm: null,
  selectedCourse: null,
  selectedSubfolder: null,
  selectedCategory: 'ALL'
};

// LocalStorage Keys
const STORAGE_KEYS = {
  USER: 'classroom_user',
  BOOKMARKS: 'classroom_bookmarks',
  PROGRESS: 'classroom_progress',
  CONTACT: 'classroom_custom_contact',
  PENDING_RESOURCES: 'classroom_pending_resources',
  COMMUNITY_RESOURCES: 'classroom_community_resources',
  LANG: 'classroom_lang'
};

// Admin Email List
const ADMIN_EMAILS = [
  'fahim.cuet.me20@gmail.com',
  'fahimniloy2314@gmail.com'
];

// Persistent State
let currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || 'null');
let bookmarks = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKMARKS) || '[]');
let courseProgress = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROGRESS) || '{}');
let pendingResources = JSON.parse(localStorage.getItem(STORAGE_KEYS.PENDING_RESOURCES) || '[]');
let communityResources = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMMUNITY_RESOURCES) || '[]');

/* =========================================================================
   1. BILINGUAL TRANSLATION DICTIONARY (EN default + BN toggle)
   ========================================================================= */
const I18N = {
  en: {
    nav_sub: 'CUET Mechanical Engineering Archive',
    tab_home: 'Home',
    tab_resources: 'Course Explorer',
    tab_ai: 'AI Assistant',
    tab_tracker: 'Progress Tracker',
    tab_admin: 'Admin Review',
    pro_badge_free: 'Pro (Free Access)',
    btn_signin_nav: 'Sign In',
    btn_logout: 'Logout',
    role_admin: 'Admin',
    role_student: 'Student',
    hero_badge: 'CUET Mechanical Engineering Academic Vault & Folder Explorer',
    hero_welcome: 'Welcome! I am',
    hero_desc: "Chittagong University of Engineering and Technology (CUET), Department of Mechanical Engineering ('20 Batch, Roll: 2003063). Complete digital academic repository from Level 1 Term 1 to Level 4 Term 2, organized exactly like our course folders with lecture notes, lab sheets, question banks, and the undergraduate bulletin.",
    btn_explore_courses: 'Browse Course Folders',
    btn_portfolio: 'My Netlify Portfolio',
    btn_github: 'GitHub Project & Live Page',
    btn_drive: 'Google Drive',
    label_email: 'Email:',
    label_phone: 'Phone:',
    stats_header: 'Academic Data Vault',
    stat_files: 'Total Academic Files',
    stat_pdfs: 'PDFs & Lecture Notes',
    stat_semesters: 'Semesters (L1-T1 to L4-T2)',
    stat_courses: 'Courses & Sessionals',
    bulletin_sub: 'Official Syllabus & Curriculum (46.7 MB)',
    semesters_header: 'Semester Folders',
    semesters_sub: 'Click any semester folder to browse its course folders',
    pro_banner_badge: 'All Features Unlocked — 100% Free for Everyone',
    pro_banner_title: 'Full Academic Access for All CUETians',
    pro_banner_desc: 'Paid subscription is currently under development. All 8 semesters, question banks, lecture slides, CAD models, and AI study assistant are completely open and complimentary!',
    btn_pro_details: 'Pro Access Details',
    btn_contribute: '+ Share Resource',
    btn_reset: 'Reset',
    btn_back: 'Back',
    explorer_hint: 'Click folders to drill down into courses and files',
    ai_header: 'Mechanical Engineering AI Study Companion',
    ai_sub: 'Ask any question regarding your CUET ME courses, viva questions, thermodynamics formulas, fluid mechanics, or exam tips.',
    ai_popular: 'Popular questions (Click to ask):',
    ai_greeting: 'Hello! I am your <strong>ClassroomHub AI</strong> study partner. Ask me any question about your Mechanical Engineering courses, theories, lab calculations, or viva questions!',
    btn_send: 'Send',
    tracker_header: 'Syllabus & Preparation Tracker',
    tracker_sub: 'Mark courses and topics you have completed to monitor your academic readiness',
    tracker_label: 'Overall Progress:',
    bookmarks_header: 'Bookmarked Resources',
    bookmarks_empty: 'No files bookmarked yet. Click the star icon on any file to bookmark it for quick revision.',
    admin_header: 'Community Resource Review Queue',
    admin_sub: 'Review resources submitted by students before publishing them to the public archive.',
    modal_auth_title: 'Account Sign In',
    btn_google_signin: 'Continue with Google',
    label_or_email: 'OR EMAIL / PHONE',
    field_email_phone: 'Email or Mobile Number',
    field_password: 'Password',
    link_forgot: 'Forgot?',
    btn_signin: 'Sign In',
    otp_register_hint: 'Enter your mobile number to receive a 6-digit OTP code, then set your account password.',
    field_fullname: 'Full Name',
    field_mobile: 'Mobile Number (+880)',
    btn_send_otp: 'Send OTP Code',
    field_otp: '6-Digit OTP Code',
    field_set_password: 'Set New Password',
    btn_verify_complete: 'Verify & Create Account',
    forgot_hint: 'Enter your registered mobile or email to receive a password reset code.',
    btn_send_reset: 'Send Reset Code',
    field_new_password: 'New Password',
    btn_update_signin: 'Update Password & Sign In',
    pro_modal_title: 'Pro Access Status',
    pro_modal_sub: 'All features are currently unlocked & complimentary',
    pro_modal_notice_title: 'Premium Service Notice:',
    pro_modal_notice_body: 'The paid subscription / payment gateway has not been launched yet. All users currently enjoy full Pro access with unlimited downloads, full folder exploration, and AI study tools completely free of charge!',
    pro_feat_1: 'Full access to all 8 semesters & 50+ course folders',
    pro_feat_2: 'Past year CT, quiz, and term-final question banks',
    pro_feat_3: 'Sessional MATLAB codes, lab reports, and CAD parts',
    pro_feat_4: 'Unlimited Gemini AI study companion Q&A',
    btn_understood: 'Got it! Continue Learning',
    btn_open_system: 'Open in Windows',
    btn_download: 'Download',
    btn_preview: 'Read',
    modal_contrib_title: 'Share / Submit Academic Resource',
    modal_contrib_sub: 'Your submitted notes, question solutions, or lab manuals will be sent to Fahim Niloy for review and published upon acceptance.',
    field_res_title: 'Resource Title / Topic',
    field_res_term: 'Semester',
    field_res_category: 'Category',
    field_res_course: 'Course Name / Code',
    field_res_url: 'Google Drive Link / File URL',
    field_res_contributor: 'Your Name & Roll',
    btn_submit_for_review: 'Submit for Review',
    modal_contact_title: 'Update Contacts & Links',
    field_primary_email: 'Primary Email',
    field_secondary_email: 'Secondary Email (Admin)',
    field_phone: 'Phone Number',
    field_portfolio: 'Netlify Portfolio Link',
    field_github: 'GitHub Repository Link',
    btn_save: 'Save Settings',
    all_semesters_title: 'All Semesters',
    courses_in: 'Courses in',
    files_in: 'Files in',
    no_files_found: 'No resources found in this folder.',
    pending_empty: 'No pending submissions right now. All clear!',
    btn_approve: 'Approve & Publish',
    btn_reject: 'Reject'
  },
  bn: {
    nav_sub: 'চুয়েট মেকানিক্যাল ইঞ্জিনিয়ারিং আর্কাইভ',
    tab_home: 'হোম',
    tab_resources: 'কোর্স এক্সপ্লোরার',
    tab_ai: 'AI সাহায্যকারী',
    tab_tracker: 'সিলেবাস ট্র্যাকার',
    tab_admin: 'অ্যাডমিন রিভিউ',
    pro_badge_free: 'প্রো (ফ্রি অ্যাক্সেস)',
    btn_signin_nav: 'লগইন',
    btn_logout: 'লগআউট',
    role_admin: 'অ্যাডমিন',
    role_student: 'শিক্ষার্থী',
    hero_badge: 'CUET মেকানিক্যাল ইঞ্জিনিয়ারিং একাডেমিক ভল্ট ও ফোল্ডার এক্সপ্লোরার',
    hero_welcome: 'স্বাগতম! আমি',
    hero_desc: "চট্টগ্রাম প্রকৌশল ও প্রযুক্তি বিশ্ববিদ্যালয় (CUET), মেকানিক্যাল ইঞ্জিনিয়ারিং ডিপার্টমেন্ট ('২০ সিরিজ, রোল: ২০০৩০৬৩)। লেভেল ১ টার্ম ১ থেকে লেভেল ৪ টার্ম ২ পর্যন্ত আমাদের সব কোর্স ফোল্ডার অনুযায়ী সাজানো ক্লাস নোটস, ল্যাব শিট, প্রশ্নব্যাংক ও অফিশিয়াল বুলেটিন।",
    btn_explore_courses: 'কোর্স ফোল্ডার ব্রাউজ করুন',
    btn_portfolio: 'আমার নেটলিফাই পোর্টফোলিও',
    btn_github: 'গিটহাব প্রজেক্ট ও লাইভ ওয়েবসাইট',
    btn_drive: 'গুগল ড্রাইভ',
    label_email: 'ইমেইল:',
    label_phone: 'মোবাইল:',
    stats_header: 'একাডেমিক ডেটা ভল্ট',
    stat_files: 'মোট একাডেমিক ফাইল',
    stat_pdfs: 'পিডিএফ ও লেকচার নোট',
    stat_semesters: 'সেমিস্টার (L1-T1 থেকে L4-T2)',
    stat_courses: 'কোর্স ও সেশনাল ল্যাব',
    bulletin_sub: 'অফিসিয়াল সিলেবাস ও কারিকুলাম (৪৬.৭ মেগাবাইট)',
    semesters_header: 'সেমিস্টার ফোল্ডারসমূহ',
    semesters_sub: 'যেকোনো সেমিস্টার ফোল্ডারে ক্লিক করে তার কোর্সসমূহ দেখুন',
    pro_banner_badge: 'সব ফিচার উন্মুক্ত — সবার জন্য ১০০% ফ্রি',
    pro_banner_title: 'সব চুয়েটিয়ানদের জন্য সম্পূর্ণ একাডেমিক সুবিধা',
    pro_banner_desc: 'পেইড সাবস্ক্রিপশন সার্ভিস বর্তমানে প্রক্রিয়াধীন। সব ৮টি সেমিস্টার, প্রশ্নব্যাংক, স্লাইডস, CAD মডেল এবং AI স্টাডি অ্যাসিস্ট্যান্ট সবার জন্য সম্পূর্ণ ফ্রি!',
    btn_pro_details: 'প্রো অ্যাক্সেস বিবরণ',
    btn_contribute: '+ রিসোর্স যুক্ত করুন',
    btn_reset: 'রিসেট',
    btn_back: 'পেছনে যান',
    explorer_hint: 'ফোল্ডারে ক্লিক করে নির্দিষ্ট কোর্স ও ফাইলগুলোতে প্রবেশ করুন',
    ai_header: 'মেকানিক্যাল ইঞ্জিনিয়ারিং AI স্টাডি পার্টনার',
    ai_sub: 'চুয়েট ME কোর্সের যেকোনো বিষয়, ভাইভা প্রশ্ন, থার্মোডাইনামিক্স সূত্র বা পরীক্ষার প্রস্তুতি নিয়ে প্রশ্ন করুন।',
    ai_popular: 'জনপ্রিয় প্রশ্নসমূহ (ক্লিক করুন):',
    ai_greeting: 'আসসালামু আলাইকুম! আমি আপনার <strong>ClassroomHub AI</strong> পার্টনার। আপনার মেকানিক্যাল কোর্স, ল্যাব বা কুইজের যেকোনো প্রশ্ন করতে পারেন!',
    btn_send: 'পাঠান',
    tracker_header: 'সিলেবাস ও পড়ালেখার প্রোগ্রেস ট্র্যাকার',
    tracker_sub: 'পড়া শেষ হওয়া কোর্স ও বিষয়গুলো টিক দিয়ে পরীক্ষার প্রস্তুতি ট্র্যাক করুন',
    tracker_label: 'সম্পূর্ণ প্রোগ্রেস:',
    bookmarks_header: 'বুকমার্ক করা ফাইলসমূহ',
    bookmarks_empty: 'কোনো ফাইল এখনো বুকমার্ক করা হয়নি। ফাইলের তারা চিহ্নে ক্লিক করে বুকমার্ক করুন।',
    admin_header: 'কমিউনিটি রিসোর্স রিভিউ কিউ',
    admin_sub: 'শিক্ষার্থীদের জমা দেওয়া নোটস বা রিসোর্স পাবলিক আর্কাইভে প্রকাশের আগে রিভিউ করুন।',
    modal_auth_title: 'অ্যাকাউন্ট লগইন',
    btn_google_signin: 'গুগল দিয়ে লগইন করুন',
    label_or_email: 'অথবা ইমেইল / মোবাইল',
    field_email_phone: 'ইমেইল বা মোবাইল নাম্বার',
    field_password: 'পাসওয়ার্ড',
    link_forgot: 'ভুলে গেছেন?',
    btn_signin: 'লগইন করুন',
    otp_register_hint: 'আপনার মোবাইল নাম্বার দিলে ৬-সংখ্যার OTP কোড যাবে, কোড দিয়ে পাসওয়ার্ড সেট করুন।',
    field_fullname: 'পূর্ণ নাম',
    field_mobile: 'মোবাইল নাম্বার (+880)',
    btn_send_otp: 'OTP কোড পাঠান',
    field_otp: '৬-সংখ্যার OTP কোড',
    field_set_password: 'নতুন পাসওয়ার্ড সেট করুন',
    btn_verify_complete: 'যাচাই ও অ্যাকাউন্ট সম্পন্ন করুন',
    forgot_hint: 'পাসওয়ার্ড রিসেটের জন্য রেজিস্টার্ড মোবাইল বা ইমেইল লিখুন।',
    btn_send_reset: 'রিসেট কোড পাঠান',
    field_new_password: 'নতুন পাসওয়ার্ড দিন',
    btn_update_signin: 'পাসওয়ার্ড পরিবর্তন ও লগইন',
    pro_modal_title: 'প্রো মেম্বারশিপ স্ট্যাটাস',
    pro_modal_sub: 'বর্তমানে সবার জন্য সম্পূর্ণ আনলক ও ফ্রি',
    pro_modal_notice_title: 'প্রিমিয়াম সার্ভিস সংক্রান্ত নোটিশ:',
    pro_modal_notice_body: 'পেমেন্ট গেটওয়ে বা পেইড প্রিমিয়াম সার্ভিস এখনও চালু করা হয়নি। পড়াশোনার স্বার্থে সব সেমিস্টার, প্রশ্নব্যাংক, অফলাইন ডাউনলোড ও এআই অ্যাসিস্ট্যান্ট বর্তমানে সবার জন্য সম্পূর্ণ ফ্রিতে চালু রাখা হয়েছে!',
    pro_feat_1: '৮টি সেমিস্টার ও ৫০+ কোর্স ফোল্ডারে সম্পূর্ণ অ্যাক্সেস',
    pro_feat_2: 'বিগত বছরের সিটি, কুইজ ও ফাইনাল প্রশ্নব্যাংক',
    pro_feat_3: 'সেশনাল ম্যাটল্যাব কোড, ল্যাব রিপোর্ট ও CAD ফাইলস',
    pro_feat_4: 'আনলিমিটেড জেমিনাই এআই স্টাডি অ্যাসিস্ট্যান্ট প্রশ্ন সমাধান',
    btn_understood: 'বুঝেছি! পড়াশোনা চালিয়ে যান',
    btn_open_system: 'Windows-এ খুলুন',
    btn_download: 'ডাউনলোড',
    btn_preview: 'পড়ুন',
    modal_contrib_title: 'একাডেমিক রিসোর্স শেয়ার / জমা দিন',
    modal_contrib_sub: 'আপনার শেয়ার করা নোটস বা ফাইল ফাহিম নিলয়ের রিভিউয়ের পর আর্কাইভে লাইভ যুক্ত হবে।',
    field_res_title: 'রিসোর্স শিরোনাম / বিষয়',
    field_res_term: 'সেমিস্টার',
    field_res_category: 'ক্যাটাগরি',
    field_res_course: 'কোর্স নাম বা কোড',
    field_res_url: 'গুগল ড্রাইভ লিংক বা ফাইল লিংক',
    field_res_contributor: 'আপনার নাম ও রোল',
    btn_submit_for_review: 'রিভিউয়ের জন্য জমা দিন',
    modal_contact_title: 'যোগাযোগ ও লিংক পরিবর্তন করুন',
    field_primary_email: 'মূল ইমেইল',
    field_secondary_email: 'বিকল্প ইমেইল (অ্যাডমিন)',
    field_phone: 'মোবাইল নাম্বার',
    field_portfolio: 'নেটলিফাই পোর্টফোলিও লিংক',
    field_github: 'গিটহাব রিপোজিটরি লিংক',
    btn_save: 'সংরক্ষণ করুন',
    all_semesters_title: 'সব সেমিস্টার',
    courses_in: 'এর কোর্সসমূহ',
    files_in: 'এর ফাইলসমূহ',
    no_files_found: 'এই ফোল্ডারে কোনো ফাইল পাওয়া যায়নি।',
    pending_empty: 'কোনো পেন্ডিং রিসোর্স নেই। সব রিভিউ সম্পন্ন!',
    btn_approve: 'অনুমোদন ও প্রকাশ করুন',
    btn_reject: 'বাতিল করুন'
  }
};

/* =========================================================================
   2. INITIALIZATION
   ========================================================================= */
document.addEventListener('DOMContentLoaded', async () => {
  setupDialogLightDismiss();
  await loadClassroomData();
  applyLanguage(currentLang);
  loadCustomContacts();
  updateAuthUI();
  renderHome();
  setupCategoryPills();
  renderExplorer();
  renderTracker();
  renderAdminQueue();
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
   3. LANGUAGE SWITCHER (EN default + BN toggle)
   ========================================================================= */
function toggleLanguage() {
  currentLang = currentLang === 'en' ? 'bn' : 'en';
  localStorage.setItem(STORAGE_KEYS.LANG, currentLang);
  applyLanguage(currentLang);
  renderHome();
  renderExplorer();
  renderTracker();
  renderAdminQueue();
  updateAuthUI();
  showToast(currentLang === 'en' ? 'Language changed to English' : 'ভাষা পরিবর্তন করে বাংলা করা হয়েছে');
}

function applyLanguage(lang) {
  const dict = I18N[lang] || I18N.en;
  
  // Update all [data-i18n] elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      el.innerHTML = dict[key];
    }
  });

  // Update language toggle button label
  const langLabel = document.getElementById('langLabel');
  if (langLabel) {
    langLabel.textContent = lang === 'en' ? 'EN / বাং' : 'বাং / EN';
  }

  // Update search input placeholder
  const searchInput = document.getElementById('resourceSearchInput');
  if (searchInput) {
    searchInput.placeholder = lang === 'en' 
      ? 'Search by course code, topic, or file name (e.g. ME 411, ME 154, Lathe)...' 
      : 'কোর্স কোড, টপিক বা ফাইলের নাম দিয়ে খুঁজুন (যেমন: ME 411, ME 154, Lathe)...';
  }

  lucide.createIcons();
}

/* =========================================================================
   4. DIALOG LIGHT-DISMISS ENFORCEMENT
   ========================================================================= */
function setupDialogLightDismiss() {
  const dialogs = document.querySelectorAll('dialog');
  dialogs.forEach(dialog => {
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
   5. TAB NAVIGATION
   ========================================================================= */
function switchTab(tab) {
  currentTab = tab;
  const views = ['home', 'resources', 'ai', 'tracker', 'admin'];
  views.forEach(v => {
    const el = document.getElementById(`view-${v}`);
    if (el) el.classList.toggle('hidden', v !== tab);
  });

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

  if (tab === 'resources') renderExplorer();
  else if (tab === 'tracker') renderTracker();
  else if (tab === 'admin') renderAdminQueue();

  lucide.createIcons();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* =========================================================================
   6. USER AUTHENTICATION, ADMIN IDENTIFICATION & SIGN OUT
   ========================================================================= */
function isAdmin(user) {
  if (!user || !user.email) return false;
  const em = user.email.toLowerCase().trim();
  return ADMIN_EMAILS.includes(em);
}

function updateAuthUI() {
  const container = document.getElementById('authHeaderContainer');
  const adminTab = document.getElementById('nav-tab-admin');
  const mobileAdminBtn = document.getElementById('mobileNavAdminBtn');
  const dict = I18N[currentLang];

  if (!container) return;

  if (currentUser) {
    const isUserAdmin = isAdmin(currentUser);
    
    // Show/hide admin tabs
    if (adminTab) adminTab.classList.toggle('hidden', !isUserAdmin);
    if (mobileAdminBtn) mobileAdminBtn.classList.toggle('hidden', !isUserAdmin);

    container.innerHTML = `
      <div class="flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1 text-xs">
        <div class="w-6 h-6 rounded-full ${isUserAdmin ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-indigo-600 text-white'} flex items-center justify-center font-bold text-[10px]">
          ${isUserAdmin ? '👑' : (currentUser.name || 'U').charAt(0).toUpperCase()}
        </div>
        <div class="hidden sm:block text-left leading-tight">
          <div class="font-bold text-white max-w-[110px] truncate">${currentUser.name || 'Student'}</div>
          <div class="text-[10px] ${isUserAdmin ? 'text-amber-400 font-semibold' : 'text-slate-400'}">
            ${isUserAdmin ? dict.role_admin : dict.role_student}
          </div>
        </div>
        <button onclick="handleLogout()" title="${dict.btn_logout}" class="ml-1 text-slate-400 hover:text-red-400 p-1 rounded transition-colors flex items-center gap-1">
          <i data-lucide="log-out" class="w-3.5 h-3.5"></i>
          <span class="hidden md:inline">${dict.btn_logout}</span>
        </button>
      </div>
    `;
  } else {
    if (adminTab) adminTab.classList.add('hidden');
    if (mobileAdminBtn) mobileAdminBtn.classList.add('hidden');

    container.innerHTML = `
      <button onclick="openAuthModal()" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 text-xs font-semibold transition-all shadow-sm">
        <i data-lucide="user" class="w-3.5 h-3.5 text-slate-400"></i>
        <span>${dict.btn_signin_nav}</span>
      </button>
    `;
  }

  lucide.createIcons();
}

function handleLogout() {
  currentUser = null;
  localStorage.removeItem(STORAGE_KEYS.USER);
  updateAuthUI();
  if (currentTab === 'admin') switchTab('home');
  showToast(currentLang === 'en' ? 'Signed out successfully' : 'সফলভাবে লগআউট করা হয়েছে');
}

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
  // Demo Google Sign In: prompt or defaults to owner
  currentUser = {
    name: 'Fahim Niloy (Owner)',
    email: 'fahim.cuet.me20@gmail.com',
    method: 'google'
  };
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
  updateAuthUI();
  closeAuthModal();
  showToast(currentLang === 'en' ? 'Signed in as Admin / Owner' : 'অ্যাডমিন হিসেবে লগইন সফল হয়েছে!');
}

function handleEmailLogin(e) {
  e.preventDefault();
  const id = document.getElementById('loginIdentifier').value.trim();
  const pass = document.getElementById('loginPassword').value.trim();
  if (!id || !pass) return;

  const isAdm = ADMIN_EMAILS.includes(id.toLowerCase());
  currentUser = {
    name: isAdm ? 'Fahim Niloy' : (id.includes('@') ? id.split('@')[0] : `User-${id.slice(-4)}`),
    email: id,
    method: 'password'
  };
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
  updateAuthUI();
  closeAuthModal();
  showToast(isAdm ? 'Welcome Owner / Admin!' : 'Signed in successfully!');
}

function sendRegisterOtp() {
  const name = document.getElementById('regName').value.trim();
  const phone = document.getElementById('regPhone').value.trim();
  if (!phone || phone.length < 10) {
    showToast(currentLang === 'en' ? 'Please enter a valid mobile number' : 'সঠিক মোবাইল নাম্বার দিন');
    return;
  }
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
    showToast(currentLang === 'en' ? 'Invalid OTP code' : 'ভুল OTP কোড');
    return;
  }
  if (!newPass || newPass.length < 6) {
    showToast(currentLang === 'en' ? 'Password must be at least 6 characters' : 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
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
  showToast(currentLang === 'en' ? 'Account created and signed in!' : 'অ্যাকাউন্ট তৈরি ও লগইন সম্পন্ন হয়েছে!');
}

function sendForgotOtp() {
  const id = document.getElementById('forgotIdentifier').value.trim();
  if (!id) {
    showToast(currentLang === 'en' ? 'Enter your mobile or email' : 'মোবাইল বা ইমেইল লিখুন');
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
    showToast(currentLang === 'en' ? 'Invalid OTP' : 'ভুল OTP কোড');
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
  showToast(currentLang === 'en' ? 'Password updated & signed in!' : 'পাসওয়ার্ড পরিবর্তন ও লগইন সফল হয়েছে!');
}

function showOtpToast(code) {
  const toast = document.getElementById('otpToast');
  document.getElementById('otpToastCode').textContent = code;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.remove('translate-y-4', 'opacity-0'), 50);
}

function hideOtpToast() {
  const toast = document.getElementById('otpToast');
  toast.classList.add('translate-y-4', 'opacity-0');
  setTimeout(() => toast.classList.add('hidden'), 300);
}

function autoFillOtp() {
  if (otpTarget === 'register') {
    const el = document.getElementById('regOtpInput');
    if (el) el.value = currentGeneratedOtp;
  } else if (otpTarget === 'forgot') {
    const el = document.getElementById('forgotOtpInput');
    if (el) el.value = currentGeneratedOtp;
  }
  showToast(currentLang === 'en' ? 'OTP auto-filled!' : 'OTP অটো-ফিল করা হয়েছে!');
}

/* =========================================================================
   7. PRO / COMPLIMENTARY MODAL
   ========================================================================= */
function openUpgradeModal() {
  document.getElementById('upgradeDialog').showModal();
  lucide.createIcons();
}
function closeUpgradeModal() {
  document.getElementById('upgradeDialog').close();
}

/* =========================================================================
   8. HOME TAB RENDERING & CONTACT MANAGEMENT
   ========================================================================= */
function renderHome() {
  if (!appData) return;
  const dict = I18N[currentLang];

  document.getElementById('statFilesCount').textContent = (appData.summary?.total_academic_files || 3896).toLocaleString();
  document.getElementById('statPdfCount').textContent = (appData.summary?.pdf_count || 2986).toLocaleString();
  document.getElementById('statTermsCount').textContent = appData.terms?.length || 8;
  document.getElementById('statCoursesCount').textContent = `${appData.summary?.total_courses || 50}+`;

  const grid = document.getElementById('homeSemestersGrid');
  if (!grid) return;
  grid.innerHTML = '';

  appData.terms.forEach(term => {
    const card = document.createElement('div');
    card.className = 'p-5 rounded-2xl glass-card cursor-pointer group flex flex-col justify-between';
    card.onclick = () => {
      openSemesterFolder(term.code);
    };

    card.innerHTML = `
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <span class="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 font-bold font-mono text-xs border border-indigo-500/30">
            ${term.code}
          </span>
          <span class="text-xs text-slate-500 font-medium">Level ${term.code[1]} Term ${term.code[4]}</span>
        </div>
        <h4 class="text-base font-bold text-white group-hover:text-indigo-400 transition-colors flex items-center gap-2">
          <i data-lucide="folder" class="w-4 h-4 text-indigo-400"></i>
          <span>${term.code} Semester</span>
        </h4>
        <p class="text-xs text-slate-400 line-clamp-2">
          ${term.courses.map(c => c.name).slice(0, 3).join(', ')}...
        </p>
      </div>

      <div class="pt-4 mt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span>${term.course_count} ${currentLang === 'en' ? 'Courses' : 'টি কোর্স'}</span>
        <span class="text-indigo-400 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
          ${term.total_files} ${currentLang === 'en' ? 'Files' : 'ফাইল'} →
        </span>
      </div>
    `;
    grid.appendChild(card);
  });

  lucide.createIcons();
}

function loadCustomContacts() {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.CONTACT) || '{}');
  const email = saved.email || appData?.student?.email || 'fahim.cuet.me20@gmail.com';
  const secEmail = saved.secondary_email || appData?.student?.secondary_email || 'fahimniloy2314@gmail.com';
  const phone = saved.phone || appData?.student?.phone || '+880 1700-000000';
  const netlify = saved.netlify || 'https://fahim-classroom-archive.netlify.app';
  const github = saved.github || appData?.student?.github_link || 'https://github.com/Fahim-Niloy2314/classroom-hub';

  const emailEl = document.getElementById('homeEmailLink');
  const secEmailEl = document.getElementById('homeEmailSecondaryLink');
  const phoneEl = document.getElementById('homePhoneLink');
  const netlifyEl = document.getElementById('homeNetlifyLink');
  const githubEl = document.getElementById('homeGithubLink');
  const footerNetlifyEl = document.getElementById('footerNetlifyLink');
  const footerGithubEl = document.getElementById('footerGithubLink');

  if (emailEl) { emailEl.href = `mailto:${email}`; emailEl.textContent = email; }
  if (secEmailEl) { secEmailEl.href = `mailto:${secEmail}`; secEmailEl.textContent = secEmail; }
  if (phoneEl) { phoneEl.href = `tel:${phone.replace(/\s+/g, '')}`; phoneEl.textContent = phone; }
  if (netlifyEl) netlifyEl.href = netlify;
  if (githubEl) githubEl.href = github;
  if (footerNetlifyEl) footerNetlifyEl.href = netlify;
  if (footerGithubEl) footerGithubEl.href = github;
}

function openEditContactModal() {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.CONTACT) || '{}');
  document.getElementById('editEmailInput').value = saved.email || 'fahim.cuet.me20@gmail.com';
  document.getElementById('editEmailSecondaryInput').value = saved.secondary_email || 'fahimniloy2314@gmail.com';
  document.getElementById('editPhoneInput').value = saved.phone || '+880 1700-000000';
  document.getElementById('editNetlifyInput').value = saved.netlify || 'https://fahim-classroom-archive.netlify.app';
  document.getElementById('editGithubInput').value = saved.github || 'https://github.com/Fahim-Niloy2314/classroom-hub';
  document.getElementById('editContactDialog').showModal();
  lucide.createIcons();
}
function closeEditContactModal() {
  document.getElementById('editContactDialog').close();
}
function saveContactSettings() {
  const updated = {
    email: document.getElementById('editEmailInput').value.trim(),
    secondary_email: document.getElementById('editEmailSecondaryInput').value.trim(),
    phone: document.getElementById('editPhoneInput').value.trim(),
    netlify: document.getElementById('editNetlifyInput').value.trim(),
    github: document.getElementById('editGithubInput').value.trim()
  };
  localStorage.setItem(STORAGE_KEYS.CONTACT, JSON.stringify(updated));
  loadCustomContacts();
  closeEditContactModal();
  showToast(currentLang === 'en' ? 'Contacts updated successfully' : 'যোগাযোগের তথ্য সংরক্ষিত হয়েছে');
}

/* =========================================================================
   9. HIERARCHICAL FOLDER EXPLORER (Exact Google Drive Structure)
   Level 1: Semesters -> Level 2: Course Folders -> Level 3: Files inside Course
   ========================================================================= */
function setupCategoryPills() {
  const container = document.getElementById('categoryFilterPills');
  if (!container) return;
  const categories = [
    { id: 'ALL', en: 'All Types', bn: 'সব ফরম্যাট' },
    { id: 'Lecture Notes & Books', en: 'Notes & Books', bn: 'নোটস ও বুকস' },
    { id: 'Questions & Viva', en: 'Question Banks & Viva', bn: 'কুইজ ও ভাইভা' },
    { id: 'Lab & Sessional', en: 'Lab & Sessional', bn: 'ল্যাব ও সেশনাল' },
    { id: 'Lecture Slides', en: 'Slides', bn: 'স্লাইডস' },
    { id: 'Codes & CAD Models', en: 'CAD & Code', bn: 'কোড ও CAD' }
  ];
  container.innerHTML = categories.map(c => {
    const active = explorerState.selectedCategory === c.id;
    return `
      <button onclick="setExplorerCategory('${c.id}')" class="whitespace-nowrap px-3 py-1 rounded-lg text-xs font-medium transition-all ${
        active ? 'bg-indigo-600 text-white shadow' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
      }">
        ${currentLang === 'en' ? c.en : c.bn}
      </button>
    `;
  }).join('');
}

function setExplorerCategory(cat) {
  explorerState.selectedCategory = cat;
  setupCategoryPills();
  renderExplorer();
}

function handleSearch(q) {
  searchQuery = q.trim().toLowerCase();
  renderExplorer();
}

function clearSearch() {
  document.getElementById('resourceSearchInput').value = '';
  searchQuery = '';
  explorerState.level = 'semesters';
  explorerState.selectedTerm = null;
  explorerState.selectedCourse = null;
  explorerState.selectedSubfolder = null;
  explorerState.selectedCategory = 'ALL';
  setupCategoryPills();
  renderExplorer();
}

function navigateExplorerUp() {
  if (explorerState.selectedSubfolder) {
    explorerState.selectedSubfolder = null;
  } else if (explorerState.level === 'files') {
    explorerState.level = 'courses';
    explorerState.selectedCourse = null;
  } else if (explorerState.level === 'courses') {
    explorerState.level = 'semesters';
    explorerState.selectedTerm = null;
  }
  renderExplorer();
}

function openSemesterFolder(termCode) {
  switchTab('resources');
  explorerState.level = 'courses';
  explorerState.selectedTerm = termCode;
  explorerState.selectedCourse = null;
  explorerState.selectedSubfolder = null;
  renderExplorer();
}

function openCourseFolder(courseName) {
  explorerState.level = 'files';
  explorerState.selectedCourse = courseName;
  explorerState.selectedSubfolder = null;
  renderExplorer();
}

function renderBreadcrumbs() {
  const container = document.getElementById('explorerBreadcrumbs');
  const backBtn = document.getElementById('explorerBackBtn');
  const dict = I18N[currentLang];
  if (!container) return;

  const crumbs = [
    { label: dict.all_semesters_title, action: () => { explorerState.level = 'semesters'; explorerState.selectedTerm = null; explorerState.selectedCourse = null; explorerState.selectedSubfolder = null; renderExplorer(); } }
  ];

  if (explorerState.selectedTerm) {
    crumbs.push({
      label: `${explorerState.selectedTerm}`,
      action: () => { explorerState.level = 'courses'; explorerState.selectedCourse = null; explorerState.selectedSubfolder = null; renderExplorer(); }
    });
  }

  if (explorerState.selectedCourse) {
    crumbs.push({
      label: `${explorerState.selectedCourse}`,
      action: () => { explorerState.level = 'files'; explorerState.selectedSubfolder = null; renderExplorer(); }
    });
  }

  if (explorerState.selectedSubfolder) {
    crumbs.push({
      label: `${explorerState.selectedSubfolder}`,
      action: () => {}
    });
  }

  container.innerHTML = crumbs.map((c, idx) => {
    const isLast = idx === crumbs.length - 1;
    return `
      <span class="inline-flex items-center gap-1.5 whitespace-nowrap">
        ${idx > 0 ? '<i data-lucide="chevron-right" class="w-3.5 h-3.5 text-slate-600"></i>' : ''}
        <button onclick="(${c.action.toString()})()" class="${isLast ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-white'} flex items-center gap-1">
          <i data-lucide="${idx === crumbs.length - 1 && explorerState.level === 'files' ? 'folder-open' : 'folder'}" class="w-3.5 h-3.5"></i>
          <span>${c.label}</span>
        </button>
      </span>
    `;
  }).join('');

  if (backBtn) {
    backBtn.classList.toggle('hidden', explorerState.level === 'semesters' && !searchQuery);
  }
}

function getAllFlatFiles() {
  if (!appData) return [];
  const list = [];
  if (appData.root_files) list.push(...appData.root_files);

  appData.terms.forEach(term => {
    term.courses.forEach(course => {
      course.files.forEach(f => list.push(f));
    });
  });

  // Append approved community resources
  communityResources.forEach(cr => list.push(cr));

  return list;
}

function renderExplorer() {
  if (!appData) return;
  const grid = document.getElementById('explorerGrid');
  const titleEl = document.getElementById('explorerViewTitle');
  const countBadge = document.getElementById('filteredCountBadge');
  const dict = I18N[currentLang];
  if (!grid) return;

  renderBreadcrumbs();

  // CASE 1: SEARCH ACTIVE -> Global search across all 3,896 files
  if (searchQuery) {
    titleEl.textContent = currentLang === 'en' ? `Search Results for "${searchQuery}"` : `"${searchQuery}" এর সার্চ ফলাফল`;
    const allFiles = getAllFlatFiles();
    const filtered = allFiles.filter(f => {
      if (explorerState.selectedCategory !== 'ALL' && f.category !== explorerState.selectedCategory) return false;
      const target = `${f.name} ${f.course} ${f.term_code} ${f.category}`.toLowerCase();
      return searchQuery.split(/\s+/).every(token => target.includes(token));
    });
    countBadge.textContent = filtered.length;
    renderFileList(filtered, grid);
    lucide.createIcons();
    return;
  }

  // CASE 2: LEVEL 1 -> SEMESTERS VIEW
  if (explorerState.level === 'semesters') {
    titleEl.textContent = dict.all_semesters_title;
    countBadge.textContent = appData.terms.length;

    grid.innerHTML = appData.terms.map(term => `
      <div onclick="openSemesterFolder('${term.code}')" class="p-5 rounded-2xl glass-card cursor-pointer group flex items-start gap-4 hover:border-indigo-500/50 transition-all">
        <div class="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
          <i data-lucide="folder" class="w-8 h-8"></i>
        </div>
        <div class="flex-1">
          <div class="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span class="font-mono font-bold text-indigo-400">${term.code}</span>
            <span>Level ${term.code[1]} Term ${term.code[4]}</span>
          </div>
          <h4 class="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
            ${term.title}
          </h4>
          <p class="text-xs text-slate-400 mt-1">
            ${term.course_count} ${currentLang === 'en' ? 'Course Folders' : 'টি কোর্স ফোল্ডার'} • ${term.total_files} ${currentLang === 'en' ? 'Files' : 'ফাইল'}
          </p>
        </div>
      </div>
    `).join('') + `
      <!-- UG Bulletin Folder Card -->
      <div onclick="previewFileByName('Bulletin _ UG _ ME.pdf')" class="p-5 rounded-2xl glass-card cursor-pointer group flex items-start gap-4 hover:border-purple-500/50 transition-all">
        <div class="p-3 rounded-2xl bg-purple-500/10 text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-all">
          <i data-lucide="book" class="w-8 h-8"></i>
        </div>
        <div class="flex-1">
          <div class="text-xs text-purple-400 font-mono font-bold mb-1">CURRICULUM</div>
          <h4 class="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
            Undergraduate ME Bulletin
          </h4>
          <p class="text-xs text-slate-400 mt-1">
            CUET Official Syllabus, Course Structures & Rules
          </p>
        </div>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  // CASE 3: LEVEL 2 -> COURSE FOLDERS IN SELECTED SEMESTER
  if (explorerState.level === 'courses') {
    const termObj = appData.terms.find(t => t.code === explorerState.selectedTerm);
    titleEl.textContent = `${dict.courses_in} ${explorerState.selectedTerm}`;
    if (!termObj) { grid.innerHTML = `<p class="col-span-full text-center text-slate-500">Term not found</p>`; return; }

    countBadge.textContent = termObj.courses.length;

    grid.innerHTML = termObj.courses.map(course => `
      <div onclick="openCourseFolder('${encodeURIComponent(course.name)}')" class="p-5 rounded-2xl glass-card cursor-pointer group flex items-start gap-4 hover:border-indigo-500/50 transition-all">
        <div class="p-3 rounded-2xl bg-indigo-950/60 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
          <i data-lucide="folder" class="w-7 h-7"></i>
        </div>
        <div class="flex-1 overflow-hidden">
          <div class="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span class="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-[11px] font-bold">
              ${explorerState.selectedTerm}
            </span>
            <span class="font-mono text-slate-400">${course.file_count} ${currentLang === 'en' ? 'files' : 'ফাইল'}</span>
          </div>
          <h4 class="text-sm sm:text-base font-bold text-white group-hover:text-indigo-300 transition-colors truncate" title="${course.name}">
            ${course.name}
          </h4>
          ${course.subfolders && course.subfolders.length > 0 ? `
            <div class="flex flex-wrap gap-1 mt-2">
              ${course.subfolders.slice(0, 3).map(sf => `<span class="px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 text-[10px] truncate max-w-[120px]">${sf}</span>`).join('')}
              ${course.subfolders.length > 3 ? `<span class="text-[10px] text-slate-500">+${course.subfolders.length - 3}</span>` : ''}
            </div>
          ` : ''}
        </div>
      </div>
    `).join('');
    lucide.createIcons();
    return;
  }

  // CASE 4: LEVEL 3 -> FILES INSIDE SELECTED COURSE
  if (explorerState.level === 'files') {
    const termObj = appData.terms.find(t => t.code === explorerState.selectedTerm);
    const decodedCourseName = decodeURIComponent(explorerState.selectedCourse);
    const courseObj = termObj?.courses.find(c => c.name === decodedCourseName);
    
    titleEl.textContent = `${decodedCourseName}`;
    
    let files = courseObj ? [...courseObj.files] : [];
    
    // Include approved community files for this course
    const extraFiles = communityResources.filter(cr => cr.term_code === explorerState.selectedTerm && cr.course === decodedCourseName);
    files.push(...extraFiles);

    // Apply category filter
    if (explorerState.selectedCategory !== 'ALL') {
      files = files.filter(f => f.category === explorerState.selectedCategory);
    }

    countBadge.textContent = files.length;
    renderFileList(files, grid);
    lucide.createIcons();
  }
}

function renderFileList(files, container) {
  const dict = I18N[currentLang];
  if (files.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 text-center text-slate-400 glass-panel rounded-2xl">
        <i data-lucide="folder-search" class="w-12 h-12 mx-auto mb-3 text-slate-600"></i>
        <h3 class="text-base font-semibold text-slate-300">${dict.no_files_found}</h3>
      </div>
    `;
    return;
  }

  container.innerHTML = files.slice(0, 100).map(f => {
    const isBookmarked = bookmarks.includes(f.id);
    const iconName = getFileIcon(f.ext);
    
    return `
      <div class="p-4 rounded-2xl glass-card flex flex-col justify-between space-y-3 group">
        <div>
          <div class="flex items-center justify-between text-[11px] mb-2">
            <span class="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 font-mono font-medium border border-indigo-500/20">
              ${f.term_code || 'ME'}
            </span>
            <div class="flex items-center gap-1.5">
              <span class="text-slate-400 font-mono">${f.size_str}</span>
              <button onclick="toggleBookmark('${f.id}')" title="Bookmark" class="p-1 text-slate-500 hover:text-amber-400 transition-colors">
                <i data-lucide="star" class="w-4 h-4 ${isBookmarked ? 'text-amber-400 fill-amber-400' : ''}"></i>
              </button>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <div class="p-2 rounded-xl bg-slate-800 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all flex-shrink-0">
              <i data-lucide="${iconName}" class="w-5 h-5"></i>
            </div>
            <div class="overflow-hidden">
              <h4 class="text-sm font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-2" title="${f.name}">
                ${f.name}
              </h4>
              <p class="text-[11px] text-slate-400 truncate mt-0.5">
                ${f.course} ${f.subfolder ? `<span class="text-slate-500">📁 ${f.subfolder}</span>` : ''}
              </p>
            </div>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
          ${f.url ? `
            <a href="${f.url}" target="_blank" rel="noopener noreferrer" class="flex-1 py-1.5 px-2 rounded-lg bg-teal-600/20 hover:bg-teal-600 text-teal-300 hover:text-white text-xs font-medium transition-all flex items-center justify-center gap-1">
              <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
              <span>${dict.btn_preview} (Drive)</span>
            </a>
          ` : `
            <button onclick="previewFile('${encodeURIComponent(f.path)}', '${encodeURIComponent(f.name)}')" class="flex-1 py-1.5 px-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-medium transition-all flex items-center justify-center gap-1">
              <i data-lucide="eye" class="w-3.5 h-3.5"></i>
              <span>${dict.btn_preview}</span>
            </button>
            
            <button onclick="openFileLocally('${encodeURIComponent(f.path)}')" title="Open in System Default App" class="py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all flex items-center gap-1">
              <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
              <span class="hidden sm:inline">${dict.btn_open_system}</span>
            </button>

            <a href="/api/file?path=${encodeURIComponent(f.path)}&download=1" download title="Download" class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition-all">
              <i data-lucide="download" class="w-3.5 h-3.5"></i>
            </a>
          `}
        </div>
      </div>
    `;
  }).join('');
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
   10. PDF VIEWER & LOCAL LAUNCHER
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
    showToast(`File ${filename} not found`);
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
      showToast(currentLang === 'en' ? 'Opened in Windows default application!' : 'কম্পিউটারের অ্যাপে খোলা হয়েছে!');
    } else {
      showToast(`Error: ${data.error || 'Failed to open'}`);
    }
  } catch (err) {
    showToast(currentLang === 'en' ? 'Local desktop server not connected. Use browser preview.' : 'লোকাল সার্ভার চালু নেই। প্রিভিউ ব্যবহার করুন।');
  }
}

function openCurrentFileLocally() {
  if (currentPreviewPath) openFileLocally(encodeURIComponent(currentPreviewPath));
}

/* =========================================================================
   11. STUDENT RESOURCE SUBMISSION & ADMIN REVIEW QUEUE
   ========================================================================= */
function openSubmitResourceModal() {
  if (!currentUser) {
    showToast(currentLang === 'en' ? 'Please sign in first to share a resource' : 'রিসোর্স শেয়ার করতে অনুগ্রহ করে প্রথমে সাইন ইন করুন');
    openAuthModal();
    return;
  }
  document.getElementById('contribAuthor').value = currentUser.name || '';
  document.getElementById('submitResourceDialog').showModal();
  lucide.createIcons();
}
function closeSubmitResourceModal() {
  document.getElementById('submitResourceDialog').close();
}

function handleResourceSubmission(e) {
  e.preventDefault();
  const title = document.getElementById('contribTitle').value.trim();
  const term = document.getElementById('contribTerm').value;
  const category = document.getElementById('contribCategory').value;
  const course = document.getElementById('contribCourse').value.trim();
  const url = document.getElementById('contribUrl').value.trim();
  const author = document.getElementById('contribAuthor').value.trim();

  const newResource = {
    id: `contrib_${Date.now()}`,
    name: title,
    term_code: term,
    course: course,
    category: category,
    url: url,
    author: author,
    size_str: 'Cloud Resource',
    ext: '.pdf',
    submitted_at: new Date().toISOString()
  };

  pendingResources.push(newResource);
  localStorage.setItem(STORAGE_KEYS.PENDING_RESOURCES, JSON.stringify(pendingResources));

  closeSubmitResourceModal();
  renderAdminQueue();
  showToast(currentLang === 'en' 
    ? 'Resource submitted! Fahim Niloy will review it shortly.' 
    : 'রিসোর্স জমা হয়েছে! ফাহিম নিলয় রিভিউ করে দ্রুত অনুমোদন করবেন।'
  );
}

function renderAdminQueue() {
  const badge = document.getElementById('adminPendingBadge');
  const list = document.getElementById('adminPendingList');
  const dict = I18N[currentLang];
  if (badge) badge.textContent = pendingResources.length;
  if (!list) return;

  if (pendingResources.length === 0) {
    list.innerHTML = `<p class="text-slate-400 italic py-6 text-center">${dict.pending_empty}</p>`;
    return;
  }

  list.innerHTML = pendingResources.map((item, idx) => `
    <div class="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="space-y-1">
        <div class="flex items-center gap-2 text-xs">
          <span class="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold">${item.term_code}</span>
          <span class="text-slate-400 font-medium">${item.course}</span>
          <span class="text-slate-500">• Submitted by: <strong class="text-white">${item.author}</strong></span>
        </div>
        <h4 class="text-sm font-bold text-white">${item.name}</h4>
        <a href="${item.url}" target="_blank" class="text-xs text-teal-400 hover:underline flex items-center gap-1">
          <i data-lucide="external-link" class="w-3 h-3"></i>
          <span>${item.url}</span>
        </a>
      </div>

      <div class="flex items-center gap-2">
        <button onclick="approveSubmission(${idx})" class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 shadow">
          <i data-lucide="check" class="w-3.5 h-3.5"></i>
          <span>${dict.btn_approve}</span>
        </button>
        <button onclick="rejectSubmission(${idx})" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-red-900/50 text-slate-300 hover:text-red-300 text-xs font-semibold flex items-center gap-1">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          <span>${dict.btn_reject}</span>
        </button>
      </div>
    </div>
  `).join('');

  lucide.createIcons();
}

function approveSubmission(idx) {
  const item = pendingResources.splice(idx, 1)[0];
  communityResources.push(item);
  localStorage.setItem(STORAGE_KEYS.PENDING_RESOURCES, JSON.stringify(pendingResources));
  localStorage.setItem(STORAGE_KEYS.COMMUNITY_RESOURCES, JSON.stringify(communityResources));
  renderAdminQueue();
  renderExplorer();
  showToast(currentLang === 'en' ? 'Resource approved and published!' : 'রিসোর্স অনুমোদিত ও প্রকাশিত হয়েছে!');
}

function rejectSubmission(idx) {
  pendingResources.splice(idx, 1);
  localStorage.setItem(STORAGE_KEYS.PENDING_RESOURCES, JSON.stringify(pendingResources));
  renderAdminQueue();
  showToast(currentLang === 'en' ? 'Submission rejected' : 'সাবমিশন বাতিল করা হয়েছে');
}

/* =========================================================================
   12. BOOKMARKS & SYLLABUS PROGRESS TRACKER
   ========================================================================= */
function toggleBookmark(fileId) {
  if (bookmarks.includes(fileId)) {
    bookmarks = bookmarks.filter(id => id !== fileId);
    showToast(currentLang === 'en' ? 'Removed from bookmarks' : 'বুকমার্ক থেকে সরানো হয়েছে');
  } else {
    bookmarks.push(fileId);
    showToast(currentLang === 'en' ? 'Bookmarked! ⭐' : 'বুকমার্কে যোগ করা হয়েছে ⭐');
  }
  localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
  renderExplorer();
  renderTracker();
}

function renderTracker() {
  if (!appData) return;
  const allFiles = getAllFlatFiles();
  const bookmarkedFiles = allFiles.filter(f => bookmarks.includes(f.id));
  const bmCount = document.getElementById('bookmarkedCount');
  const bmList = document.getElementById('bookmarkedList');
  const dict = I18N[currentLang];

  if (bmCount) bmCount.textContent = bookmarkedFiles.length;
  if (bmList) {
    if (bookmarkedFiles.length === 0) {
      bmList.innerHTML = `<p class="text-slate-500 italic">${dict.bookmarks_empty}</p>`;
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
          <span class="text-slate-400 font-mono">${course.file_count}</span>
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
          <span class="text-xs text-slate-400">${term.course_count} Courses</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          ${coursesHtml}
        </div>
      </div>
    `;
  }).join('');

  const pct = totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0;
  document.getElementById('trackerProgressPercent').textContent = `${pct}%`;
  document.getElementById('trackerProgressBar').style.width = `${pct}%`;

  lucide.createIcons();
}

function toggleCourseProgress(courseName, isDone) {
  if (isDone) courseProgress[courseName] = true;
  else delete courseProgress[courseName];
  localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(courseProgress));
  renderTracker();
}

/* =========================================================================
   13. AI STUDY ASSISTANT (Gemini Knowledge Hub)
   ========================================================================= */
const ME_KNOWLEDGE_BASE = {
  'lathe': `### 🔧 Workshop ME 154: Lathe Machine Viva & Quiz Guide
1. **Definition:** A machine tool which rotates the workpiece about an axis of rotation to perform various operations such as cutting, sanding, knurling, drilling, and facing.
2. **Major Components:**
   - **Headstock:** Houses the spindle and speed change gears.
   - **Tailstock:** Supports the free end of long workpieces and holds cutting tools like drill bits.
   - **Carriage:** Transports the cutting tool along the bedways. Includes saddle, cross-slide, compound rest, and tool post.
   - **Bed:** Heavy rigid base made of Grey Cast Iron for vibration damping.
3. **Core Operations:** Facing, Straight Turning, Taper Turning, Threading, Knurling, Parting Off.`,

  'thermodynamics': `### 🔥 ME 211 Thermodynamics: Second Law & Carnot Efficiency
1. **Kelvin-Planck Statement:** Impossible to construct a device operating in a cycle that produces no effect other than the transfer of heat from a single thermal reservoir and the performance of an equivalent amount of work.
2. **Clausius Statement:** Impossible to construct a device that transfers heat from a cooler body to a hotter body without requiring external work.
3. **Carnot Thermal Efficiency:**
   \\[ \\eta_{th} = 1 - \\frac{T_L}{T_H} \\]
   *(Note: Temperatures \\(T_H\\) and \\(T_L\\) must always be in absolute units, Kelvin).*`,

  'bernoulli': `### 💧 ME 321 Fluid Mechanics: Bernoulli Equation
1. **Equation:**
   \\[ \\frac{P}{\\rho g} + \\frac{V^2}{2g} + z = \\text{Constant} \\]
2. **Key Assumptions:**
   - Steady flow
   - Incompressible fluid (\\(\\rho = \\text{const}\\))
   - Inviscid (frictionless / zero viscosity)
   - Flow along a single streamline
3. **Applications:** Venturimeter, Orifice Meter, Pitot tube for velocity measurement, aircraft wing lift generation.`,

  'heat transfer': `### ♨️ ME 311 Heat Transfer: Core Laws & Formulas
1. **Conduction (Fourier's Law):**
   \\[ q = -k A \\frac{dT}{dx} \\]
2. **Convection (Newton's Law of Cooling):**
   \\[ q = h A (T_s - T_\\infty) \\]
3. **Radiation (Stefan-Boltzmann Law):**
   \\[ q = \\epsilon \\sigma A (T_s^4 - T_{surr}^4) \\quad (\\sigma = 5.67 \\times 10^{-8} \\text{ W/m}^2\\text{K}^4) \\]`
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

  const botDiv = document.createElement('div');
  botDiv.className = 'flex items-start gap-3';
  botDiv.innerHTML = `
    <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center flex-shrink-0 text-white">
      <i data-lucide="bot" class="w-4 h-4"></i>
    </div>
    <div class="bg-slate-800/80 rounded-2xl rounded-tl-none p-3.5 text-sm text-slate-200 border border-slate-700/60 max-w-2xl leading-relaxed">
      <div class="flex items-center gap-1.5 text-xs text-purple-400">
        <span class="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
        <span>Analyzing academic course knowledge...</span>
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
    } else {
      answer = `### 💡 Course Reference & Exam Insights
Your Query: **"${query}"**

1. **Course Vault:** You can find the full slides, lecture notes, and past question bank in the respective semester course folder in the **Course Explorer** tab.
2. **Exam Preparation Tip:**
   - Always draw a clear, labeled schematic diagram.
   - Explicitly list the boundary conditions and assumptions.
   - Solve previous year term-final questions for this specific topic.`;
    }

    botDiv.querySelector('.bg-slate-800\\/80').innerHTML = answer.replace(/\n/g, '<br>');
    chatBox.scrollTop = chatBox.scrollHeight;
    lucide.createIcons();
  }, 500);
}

/* =========================================================================
   14. TOAST NOTIFICATION HELPER
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
  setTimeout(() => toast.classList.add('-translate-y-2', 'opacity-0'), 3000);
}
