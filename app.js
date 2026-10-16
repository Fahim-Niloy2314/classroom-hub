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
    btn_portfolio: 'My Personal Website',
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
    btn_open_drive: 'Open & Read on Google Drive',
    btn_download_drive: 'Download File',
    cloud_fallback_desc: 'In online cloud mode, all 33 GB Academic Vault files are hosted directly on Google Drive. Click below to view or download instantly.',
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
    btn_approve: 'Approve & Publish',
    btn_reject: 'Reject',
    google_portal_title: 'Sign in with Google',
    google_portal_sub: 'Choose an account to continue to CUET ME ClassroomHub',
    google_choose_account: 'Choose an account',
    google_use_another: 'Use another Google account',
    google_use_another_sub: 'Sign in with student Gmail or CUET institutional email',
    google_enter_name: 'Your Name',
    google_enter_email: 'Google Email Address',
    google_btn_continue: 'Continue with this Account',
    google_security_note: '🔒 Authenticated Google portal for CUET ME ClassroomHub. Admin rights are granted exclusively to designated admin accounts.'
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
    btn_portfolio: 'আমার পার্সোনাল ওয়েবসাইট',
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
    btn_open_drive: 'গুগল ড্রাইভে পড়ুন',
    btn_download_drive: 'ফাইল ডাউনলোড',
    cloud_fallback_desc: 'অনলাইন ক্লাউড মোডে ক্লাসরুমের ৩৩ জিবি একাডেমিক ফাইলগুলো সরাসরি গুগল ড্রাইভ ভল্টে সংরক্ষিত রয়েছে। নিচের বাটনে ক্লিক করে ফাইলটি সরাসরি পড়ুন অথবা ডাউনলোড করুন।',
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
    btn_approve: 'অনুমোদন ও প্রকাশ করুন',
    btn_reject: 'বাতিল করুন',
    google_portal_title: 'গুগল দিয়ে সাইন ইন করুন',
    google_portal_sub: 'চুয়েট মেকানিক্যাল ক্লাসরুম হাবে যেতে একটি অ্যাকাউন্ট নির্বাচন করুন',
    google_choose_account: 'একটি অ্যাকাউন্ট নির্বাচন করুন',
    google_use_another: 'অন্য কোনো গুগল অ্যাকাউন্ট ব্যবহার করুন',
    google_use_another_sub: 'যেকোনো জিমেইল বা চুয়েট প্রাতিষ্ঠানিক ইমেইল দিয়ে লগইন করুন',
    google_enter_name: 'আপনার নাম',
    google_enter_email: 'গুগল ইমেইল ঠিকানা',
    google_btn_continue: 'এই অ্যাকাউন্ট দিয়ে প্রবেশ করুন',
    google_security_note: '🔒 ক্লাসরুম হাবের জন্য গুগল সাইন-ইন পোর্টাল। শুধুমাত্র অনুমোদিত অ্যাডমিন ইমেইল পেলেই অ্যাডমিন সুবিধা কার্যকর হবে।'
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

  const isUserAdmin = currentUser && isAdmin(currentUser);

  // Desktop tab active states
  views.forEach(v => {
    const btn = document.getElementById(`nav-tab-${v}`);
    if (btn) {
      if (v === 'admin' && !isUserAdmin) {
        btn.classList.add('hidden');
        return;
      }
      if (v === 'admin') btn.classList.remove('hidden');
      if (v === tab) {
        btn.className = 'nav-tab px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 text-white bg-indigo-600 shadow-sm';
      } else {
        btn.className = 'nav-tab px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50';
      }
    }
  });

  // Mobile bottom navigation active states
  views.forEach(v => {
    const mBtn = document.getElementById(`mobileNav-${v}`);
    if (mBtn) {
      if (v === 'admin' && !isUserAdmin) {
        mBtn.classList.add('hidden');
        return;
      }
      if (v === 'admin') mBtn.classList.remove('hidden');
      if (v === tab) {
        mBtn.className = 'flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all text-indigo-400 font-bold bg-indigo-500/15 shadow-sm';
      } else {
        mBtn.className = 'flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all text-slate-400 hover:text-white';
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
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase().trim())) return true;
  if (user.phone && ['01850162261', '+8801850162261', '1850162261'].includes(user.phone.replace(/[\s\-]/g, ''))) return true;
  return false;
}

function updateAuthUI() {
  const container = document.getElementById('authHeaderContainer');
  const adminTab = document.getElementById('nav-tab-admin');
  const mobileAdminBtn = document.getElementById('mobileNavAdminBtn');
  const mobileNavAdmin = document.getElementById('mobileNav-admin');
  const editContactBtn = document.getElementById('editContactBtn');
  const dict = I18N[currentLang];

  if (!container) return;

  const isUserAdmin = currentUser && isAdmin(currentUser);

  // Strictly guard contact editing button - only visible if Admin
  if (editContactBtn) {
    editContactBtn.classList.toggle('hidden', !isUserAdmin);
  }

  // Show/hide admin tabs
  if (adminTab) adminTab.classList.toggle('hidden', !isUserAdmin);
  if (mobileAdminBtn) mobileAdminBtn.classList.toggle('hidden', !isUserAdmin);
  if (mobileNavAdmin) mobileNavAdmin.classList.toggle('hidden', !isUserAdmin);

  if (currentUser) {
    container.innerHTML = `
      <div class="flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1 text-xs shadow-sm">
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

/* =========================================================================
   6.B MOBILE OTP AUTHENTICATION (DIRECT SIGN-IN)
   ========================================================================= */
let directOtpTimer = null;
let directOtpSecondsLeft = 60;
let currentDirectPhone = '';
let currentDirectName = '';

function requestDirectMobileOtp() {
  const phoneInput = document.getElementById('directOtpPhone');
  const nameInput = document.getElementById('directOtpName');
  let rawPhone = (phoneInput?.value || '').trim().replace(/[\s-]/g, '');

  if (!rawPhone) {
    showToast(currentLang === 'en' ? 'Please enter your mobile number' : 'আপনার মোবাইল নাম্বারটি লিখুন');
    if (phoneInput) phoneInput.focus();
    return;
  }

  // Normalize BD phone number
  if (rawPhone.startsWith('+880')) rawPhone = rawPhone.substring(4);
  else if (rawPhone.startsWith('880')) rawPhone = rawPhone.substring(3);
  if (rawPhone.startsWith('0')) rawPhone = rawPhone.substring(1);

  if (rawPhone.length < 10) {
    showToast(currentLang === 'en' ? 'Please enter a valid 11-digit mobile number' : 'সঠিক ১১ ডিজিটের মোবাইল নাম্বার দিন');
    return;
  }

  const fullPhone = '0' + rawPhone;
  currentDirectPhone = fullPhone;
  currentDirectName = (nameInput?.value || '').trim();

  // Generate 6-digit OTP
  currentGeneratedOtp = Math.floor(100000 + Math.random() * 900000).toString();
  otpTarget = 'direct';

  // Switch to Step 2
  const step1 = document.getElementById('directOtpStep1');
  const step2 = document.getElementById('directOtpStep2');
  const dispPhone = document.getElementById('displayDirectPhone');
  const codeInput = document.getElementById('directOtpCodeInput');

  if (step1) step1.classList.add('hidden');
  if (step2) step2.classList.remove('hidden');
  if (dispPhone) dispPhone.textContent = `+880 ${fullPhone}`;
  if (codeInput) {
    codeInput.value = '';
    setTimeout(() => codeInput.focus(), 100);
  }

  // Start 60s countdown
  startDirectOtpCountdown();

  // Show simulated SMS toast with auto-fill option
  showOtpToast(currentGeneratedOtp);
  showToast(currentLang === 'en' 
    ? `OTP sent to +880 ${fullPhone}` 
    : `+880 ${fullPhone} নাম্বারে ৬ ডিজিটের ওটিপি পাঠানো হয়েছে`);
}

function startDirectOtpCountdown() {
  clearInterval(directOtpTimer);
  directOtpSecondsLeft = 60;
  const countEl = document.getElementById('directOtpCountdown');
  const resendBtn = document.getElementById('directOtpResendBtn');
  if (resendBtn) resendBtn.disabled = true;

  directOtpTimer = setInterval(() => {
    directOtpSecondsLeft--;
    if (countEl) countEl.textContent = `Resend code in ${directOtpSecondsLeft}s`;
    if (directOtpSecondsLeft <= 0) {
      clearInterval(directOtpTimer);
      if (countEl) countEl.textContent = "Didn't receive code?";
      if (resendBtn) resendBtn.disabled = false;
    }
  }, 1000);
}

function resetDirectOtpStep() {
  clearInterval(directOtpTimer);
  const step1 = document.getElementById('directOtpStep1');
  const step2 = document.getElementById('directOtpStep2');
  if (step1) step1.classList.remove('hidden');
  if (step2) step2.classList.add('hidden');
}

function verifyDirectMobileOtp() {
  const codeInput = document.getElementById('directOtpCodeInput');
  const enteredCode = (codeInput?.value || '').trim();

  if (!enteredCode || enteredCode !== currentGeneratedOtp) {
    showToast(currentLang === 'en' ? 'Invalid verification code. Please check SMS OTP.' : 'ভুল ওটিপি কোড। অনুগ্রহ করে সঠিক কোডটি লিখুন।');
    if (codeInput) codeInput.focus();
    return;
  }

  clearInterval(directOtpTimer);

  // Check if owner phone (Fahim Niloy: 01850162261)
  const isOwnerPhone = currentDirectPhone.endsWith('1850162261') || currentDirectPhone === '01850162261';

  if (isOwnerPhone) {
    currentUser = {
      name: currentDirectName || 'Fahim Niloy (Founder)',
      email: 'fahim.cuet.me20@gmail.com',
      phone: currentDirectPhone,
      method: 'mobile_otp',
      role: 'admin'
    };
    showToast(currentLang === 'en' 
      ? 'Welcome Owner & Admin (Fahim Niloy)! Signed in via Mobile OTP.' 
      : 'স্বাগতম অ্যাডমিন ফাহিম নিলয়! মোবাইল ওটিপি দিয়ে সফলভাবে সাইন ইন হয়েছে।');
  } else {
    currentUser = {
      name: currentDirectName || `Student (${currentDirectPhone.slice(-4)})`,
      email: `${currentDirectPhone}@classroom.hub`,
      phone: currentDirectPhone,
      method: 'mobile_otp',
      role: 'student'
    };
    showToast(currentLang === 'en' 
      ? `Signed in as ${currentUser.name}` 
      : `${currentUser.name} হিসেবে সফলভাবে সাইন ইন হয়েছে`);
  }

  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
  updateAuthUI();
  closeAuthModal();
  hideOtpToast();
}

/* =========================================================================
   6.C GOOGLE ACCOUNT SELECTION & AUTHENTICATION
   ========================================================================= */
const VALID_ADMIN_PINS = ['2003063', 'cuetme20', 'me20', '01850162261', '+8801850162261', '1850162261', 'admin', 'fahimniloy'];
let selectedGoogleEmail = '';
let selectedGoogleName = '';

function openGoogleSignInPortal() {
  const gDialog = document.getElementById('googleAccountDialog');
  if (gDialog) {
    showGoogleAccountPickerView();
    gDialog.showModal();
    lucide.createIcons();
  }
}

function closeGoogleSignInPortal() {
  const gDialog = document.getElementById('googleAccountDialog');
  if (gDialog) gDialog.close();
}

function showGoogleAccountPickerView() {
  const pickerView = document.getElementById('googleAccountPickerView');
  const passwordView = document.getElementById('googlePasswordPromptView');
  const customView = document.getElementById('googleCustomAccountView');
  const title = document.getElementById('googleDialogTitle');

  if (pickerView) pickerView.classList.remove('hidden');
  if (passwordView) passwordView.classList.add('hidden');
  if (customView) customView.classList.add('hidden');
  if (title) title.textContent = 'Choose an account';
  lucide.createIcons();
}

function selectGoogleAccount(email, name) {
  selectedGoogleEmail = email.toLowerCase().trim();
  selectedGoogleName = name || email.split('@')[0];

  const pickerView = document.getElementById('googleAccountPickerView');
  const passwordView = document.getElementById('googlePasswordPromptView');
  const nameEl = document.getElementById('googleSelectedName');
  const emailEl = document.getElementById('googleSelectedEmail');
  const avatarEl = document.getElementById('googleSelectedAvatar');
  const passInput = document.getElementById('googleAccountPasswordInput');
  const title = document.getElementById('googleDialogTitle');

  if (pickerView) pickerView.classList.add('hidden');
  if (passwordView) passwordView.classList.remove('hidden');
  if (title) title.textContent = 'Verify your account';

  if (nameEl) nameEl.textContent = selectedGoogleName;
  if (emailEl) emailEl.textContent = selectedGoogleEmail;
  if (avatarEl) avatarEl.textContent = selectedGoogleName.charAt(0).toUpperCase();
  if (passInput) {
    passInput.value = '';
    setTimeout(() => passInput.focus(), 100);
  }
  lucide.createIcons();
}

function handleGooglePasswordSubmit(e) {
  e.preventDefault();
  const passInput = document.getElementById('googleAccountPasswordInput');
  const enteredPass = (passInput?.value || '').trim().toLowerCase();

  const isAdm = ADMIN_EMAILS.includes(selectedGoogleEmail);

  if (isAdm) {
    if (!enteredPass || !VALID_ADMIN_PINS.includes(enteredPass)) {
      showToast(currentLang === 'en' ? 'Wrong password. Try again.' : 'ভুল পাসওয়ার্ড। আবার চেষ্টা করুন।');
      if (passInput) passInput.focus();
      return;
    }
    currentUser = {
      name: selectedGoogleName || 'Fahim Niloy',
      email: selectedGoogleEmail,
      method: 'google',
      role: 'admin'
    };
    showToast(currentLang === 'en' 
      ? `Welcome back, ${currentUser.name}!` 
      : `স্বাগতম ${currentUser.name}! আপনার অ্যাকাউন্টে সফলভাবে সাইন ইন হয়েছে।`);
  } else {
    currentUser = {
      name: selectedGoogleName,
      email: selectedGoogleEmail,
      method: 'google',
      role: 'student'
    };
    showToast(currentLang === 'en' 
      ? `Signed in as ${currentUser.name}` 
      : `${currentUser.name} হিসেবে সফলভাবে সাইন ইন হয়েছে`);
  }

  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
  updateAuthUI();
  closeGoogleSignInPortal();
  closeAuthModal();
}

function showGoogleCustomAccountView() {
  const pickerView = document.getElementById('googleAccountPickerView');
  const customView = document.getElementById('googleCustomAccountView');
  const title = document.getElementById('googleDialogTitle');

  if (pickerView) pickerView.classList.add('hidden');
  if (customView) customView.classList.remove('hidden');
  if (title) title.textContent = 'Sign in with Google';
  lucide.createIcons();
}

function handleGoogleCustomSubmit(e) {
  e.preventDefault();
  const emailInput = document.getElementById('googleCustomEmail');
  const nameInput = document.getElementById('googleCustomName');
  const passInput = document.getElementById('googleCustomPassword');

  const email = (emailInput?.value || '').toLowerCase().trim();
  const name = (nameInput?.value || '').trim() || email.split('@')[0];
  const pass = (passInput?.value || '').trim().toLowerCase();

  if (!email) return;

  const isAdm = ADMIN_EMAILS.includes(email);
  if (isAdm) {
    if (!pass || !VALID_ADMIN_PINS.includes(pass)) {
      showToast(currentLang === 'en' ? 'Wrong password for Admin account.' : 'ভুল পাসওয়ার্ড। আবার চেষ্টা করুন।');
      return;
    }
    currentUser = {
      name: name || 'Fahim Niloy',
      email: email,
      method: 'google',
      role: 'admin'
    };
  } else {
    currentUser = {
      name: name,
      email: email,
      method: 'google',
      role: 'student'
    };
  }

  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
  updateAuthUI();
  closeGoogleSignInPortal();
  closeAuthModal();
  showToast(currentLang === 'en' ? `Signed in as ${currentUser.name}` : `${currentUser.name} হিসেবে সফলভাবে সাইন ইন হয়েছে`);
}

function handleGoogleSignIn() {
  openGoogleSignInPortal();
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
    role: isAdm ? 'admin' : 'student',
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
    role: 'student',
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
    role: 'student',
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
  if (otpTarget === 'direct') {
    const el = document.getElementById('directOtpCodeInput');
    if (el) el.value = currentGeneratedOtp;
  } else if (otpTarget === 'register') {
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
  // Auto-migrate any old dummy netlify URL in localStorage
  if (saved.netlify && saved.netlify.includes('fahim-classroom-archive')) {
    saved.netlify = 'https://mohammad-fahim-ahmed.netlify.app/';
    localStorage.setItem(STORAGE_KEYS.CONTACT, JSON.stringify(saved));
  }
  const email = saved.email || appData?.student?.email || 'fahim.cuet.me20@gmail.com';
  const secEmail = saved.secondary_email || appData?.student?.secondary_email || 'fahimniloy2314@gmail.com';
  const phone = saved.phone || appData?.student?.phone || '+880 1850-162261';
  const netlify = saved.netlify || 'https://mohammad-fahim-ahmed.netlify.app/';
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
  if (!currentUser || !isAdmin(currentUser)) {
    showToast(currentLang === 'en' 
      ? 'Restricted: Only Admin (Fahim Niloy) can edit contact details. Please sign in as Admin.' 
      : 'অনুমতি নেই: শুধুমাত্র অ্যাডমিন (ফাহিম নিলয়) যোগাযোগের তথ্য পরিবর্তন করতে পারবেন।');
    openAuthModal();
    return;
  }
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.CONTACT) || '{}');
  document.getElementById('editEmailInput').value = saved.email || 'fahim.cuet.me20@gmail.com';
  document.getElementById('editEmailSecondaryInput').value = saved.secondary_email || 'fahimniloy2314@gmail.com';
  document.getElementById('editPhoneInput').value = saved.phone || '+880 1850-162261';
  document.getElementById('editNetlifyInput').value = (saved.netlify && !saved.netlify.includes('fahim-classroom-archive')) ? saved.netlify : 'https://mohammad-fahim-ahmed.netlify.app/';
  document.getElementById('editGithubInput').value = saved.github || 'https://github.com/Fahim-Niloy2314/classroom-hub';
  document.getElementById('editContactDialog').showModal();
  lucide.createIcons();
}

function closeEditContactModal() {
  document.getElementById('editContactDialog').close();
}

function saveContactSettings() {
  if (!currentUser || !isAdmin(currentUser)) {
    showToast(currentLang === 'en' 
      ? 'Unauthorized: Admin privileges required to update contact information.' 
      : 'অননুমোদিত: যোগাযোগের তথ্য সংরক্ষণের জন্য অ্যাডমিন অনুমতি প্রয়োজন।');
    closeEditContactModal();
    return;
  }
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

/* Bulletin Modal & Quick Guide Logic */
function openBulletinModal() {
  const dialog = document.getElementById('bulletinDialog');
  if (!dialog) return;
  switchBulletinTab('summary');
  dialog.showModal();
  lucide.createIcons();
}

function closeBulletinModal() {
  const dialog = document.getElementById('bulletinDialog');
  if (dialog) dialog.close();
  const frame = document.getElementById('bulletinPdfFrame');
  if (frame) frame.src = 'about:blank';
}

const BULLETIN_RELEASE_URL = 'https://github.com/Fahim-Niloy2314/classroom-hub/releases/download/v1.0.0/Bulletin_UG_ME.pdf';

function isLocalHost() {
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0';
}

function switchBulletinTab(tab) {
  const tabs = ['summary', 'viewer'];
  tabs.forEach(t => {
    const btn = document.getElementById(`bulletinTabBtn-${t}`);
    const panel = document.getElementById(`bulletinPanel-${t}`);
    if (btn && panel) {
      if (t === tab) {
        btn.className = 'px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white transition-all shadow-sm';
        panel.classList.remove('hidden');
      } else {
        btn.className = 'px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all';
        panel.classList.add('hidden');
      }
    }
  });

  if (tab === 'viewer') {
    const frame = document.getElementById('bulletinPdfFrame');
    if (frame && (frame.src === 'about:blank' || !frame.src || frame.src.endsWith('about:blank'))) {
      if (isLocalHost()) {
        frame.src = 'Bulletin_UG_ME.pdf';
      } else {
        frame.src = `https://docs.google.com/viewer?url=${encodeURIComponent(BULLETIN_RELEASE_URL)}&embedded=true`;
      }
    }
  }
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
      <div onclick="openBulletinModal()" class="p-5 rounded-2xl glass-card cursor-pointer group flex items-start gap-4 hover:border-purple-500/50 transition-all">
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

            <button onclick="handleFileDownload('${encodeURIComponent(f.path)}', '${encodeURIComponent(f.name)}')" title="Download" class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition-all">
              <i data-lucide="download" class="w-3.5 h-3.5"></i>
            </button>
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
   10. PDF VIEWER & RESILIENT FILE DOWNLOAD / STREAMING
   ========================================================================= */
let currentPreviewName = '';

function handleFileDownload(encPath, encName) {
  const path = decodeURIComponent(encPath || '');
  const name = decodeURIComponent(encName || '');

  // 1. If Undergraduate ME Bulletin, use direct binary download from GitHub Releases (v1.0.0)
  if (name.toLowerCase().includes('bulletin') || path.toLowerCase().includes('bulletin')) {
    window.open(BULLETIN_RELEASE_URL, '_blank');
    showToast(currentLang === 'en' ? 'Downloading Undergraduate ME Bulletin (48.9 MB)...' : 'আন্ডারগ্র্যাজুয়েট এমই বুলেটিন ডাউনলোড হচ্ছে (৪৮.৯ মেগাবাইট)...');
    return;
  }

  // 2. If running locally with Python desktop server
  if (isLocalHost()) {
    const downloadUrl = `/api/file?path=${encodeURIComponent(path)}&download=1`;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(currentLang === 'en' ? `Downloading ${name}...` : `${name} ডাউনলোড হচ্ছে...`);
    return;
  }

  // 3. Online mode (GitHub Pages / Netlify / Mobile):
  // Search query on Google Drive vault
  const driveSearchUrl = `https://drive.google.com/drive/u/0/search?q=${encodeURIComponent(name)}`;
  window.open(driveSearchUrl, '_blank');
  showToast(currentLang === 'en' ? `Opening ${name} on Google Drive Vault...` : `গুগল ড্রাইভে ${name} ওপেন হচ্ছে...`);
}

function previewFile(encPath, encName) {
  const path = decodeURIComponent(encPath || '');
  const name = decodeURIComponent(encName || '');
  currentPreviewPath = path;
  currentPreviewName = name;

  const dialog = document.getElementById('pdfViewerDialog');
  if (!dialog) return;

  const title = document.getElementById('pdfViewerTitle');
  const frame = document.getElementById('pdfViewerFrame');
  const dl = document.getElementById('viewerDownloadBtn');
  const localBtn = document.getElementById('viewerOpenLocalBtn');
  const cloudFallback = document.getElementById('viewerCloudFallback');
  const driveBtn = document.getElementById('viewerDriveBtn');
  const fallbackDlBtn = document.getElementById('viewerFallbackDlBtn');
  const fallbackName = document.getElementById('viewerFallbackFilename');

  if (title) title.textContent = name;
  if (fallbackName) fallbackName.textContent = name;

  // Toggle local desktop app launch button based on localhost presence
  if (localBtn) localBtn.classList.toggle('hidden', !isLocalHost());

  // 1. If Undergraduate Bulletin:
  if (name.toLowerCase().includes('bulletin') || path.toLowerCase().includes('bulletin')) {
    if (cloudFallback) cloudFallback.classList.add('hidden');
    if (frame) {
      frame.classList.remove('hidden');
      frame.src = isLocalHost() ? 'Bulletin_UG_ME.pdf' : `https://docs.google.com/viewer?url=${encodeURIComponent(BULLETIN_RELEASE_URL)}&embedded=true`;
    }
    if (dl) {
      dl.onclick = (e) => {
        e.preventDefault();
        handleFileDownload(path, name);
      };
    }
    dialog.showModal();
    lucide.createIcons();
    return;
  }

  // 2. If running locally on localhost
  if (isLocalHost()) {
    if (cloudFallback) cloudFallback.classList.add('hidden');
    if (frame) {
      frame.classList.remove('hidden');
      frame.src = `/api/file?path=${encodeURIComponent(path)}`;
    }
    if (dl) {
      dl.onclick = (e) => {
        e.preventDefault();
        handleFileDownload(path, name);
      };
    }
  } else {
    // 3. Online mode (GitHub Pages / Mobile)
    const driveSearchUrl = `https://drive.google.com/drive/u/0/search?q=${encodeURIComponent(name)}`;
    if (frame) {
      frame.classList.add('hidden');
      frame.src = 'about:blank';
    }
    if (cloudFallback) cloudFallback.classList.remove('hidden');
    if (driveBtn) {
      driveBtn.onclick = () => window.open(driveSearchUrl, '_blank');
    }
    if (fallbackDlBtn) {
      fallbackDlBtn.onclick = () => window.open(driveSearchUrl, '_blank');
    }
    if (dl) {
      dl.onclick = (e) => {
        e.preventDefault();
        window.open(driveSearchUrl, '_blank');
      };
    }
  }

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
  if (!currentUser || !isAdmin(currentUser)) {
    showToast(currentLang === 'en' ? 'Only Admin (Fahim Niloy) can approve resources' : 'শুধুমাত্র অ্যাডমিন (ফাহিম নিলয়) রিসোর্স অনুমোদন করতে পারেন');
    return;
  }
  const item = pendingResources.splice(idx, 1)[0];
  communityResources.push(item);
  localStorage.setItem(STORAGE_KEYS.PENDING_RESOURCES, JSON.stringify(pendingResources));
  localStorage.setItem(STORAGE_KEYS.COMMUNITY_RESOURCES, JSON.stringify(communityResources));
  renderAdminQueue();
  renderExplorer();
  showToast(currentLang === 'en' ? 'Resource approved and published!' : 'রিসোর্স অনুমোদিত ও প্রকাশিত হয়েছে!');
}

function rejectSubmission(idx) {
  if (!currentUser || !isAdmin(currentUser)) {
    showToast(currentLang === 'en' ? 'Only Admin (Fahim Niloy) can reject resources' : 'শুধুমাত্র অ্যাডমিন (ফাহিম নিলয়) রিসোর্স বাতিল করতে পারেন');
    return;
  }
  pendingResources.splice(idx, 1);
  localStorage.setItem(STORAGE_KEYS.PENDING_RESOURCES, JSON.stringify(pendingResources));
  renderAdminQueue();
  showToast(currentLang === 'en' ? 'Submission rejected' : 'সাবমিশন বাতিল করা হয়েছে');
}

/* =========================================================================
   12. BOOKMARKS & SYLLABUS PROGRESS TRACKER
   ========================================================================= */
function toggleBookmark(fileId) {
  if (!currentUser) {
    showToast(currentLang === 'en' 
      ? 'Please sign in to save bookmarks to your account.' 
      : 'রিসোর্স বুকমার্ক করতে অনুগ্রহ করে প্রথমে সাইন ইন করুন।');
    openGoogleSignInPortal();
    return;
  }
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

  // Progress tracker logic is fully handled by renderTracker()
}

/* =========================================================================
   12. HIERARCHICAL BRANCHING SYLLABUS PROGRESS TRACKER
   Semesters -> Courses -> 5 Actionable Milestones
   ========================================================================= */
let currentTrackerLevel = 'ALL';
let openSemesterBranches = { 'L4-T2': true, 'L4-T1': true };
let openCourseBranches = {};

const MILESTONES_DEF = [
  { id: 'lectures', en: 'Class Lectures & Slides', bn: 'লেকচার ও স্লাইডস', icon: 'book-open' },
  { id: 'ct', en: 'Class Tests (CT 1-4) Prep', bn: 'সিটি প্রস্তুতি ও প্র্যাকটিস', icon: 'file-text' },
  { id: 'sessional', en: 'Lab Reports & Viva Voce', bn: 'ল্যাব রিপোর্ট ও ভাইভা', icon: 'flask-conical' },
  { id: 'questions', en: 'Past 5-Year Question Bank', bn: 'বিগত ৫ বছরের প্রশ্ন সমাধান', icon: 'help-circle' },
  { id: 'final', en: 'Term-Final Formulas Revision', bn: 'ফাইনাল রিভিশন ও ফর্মুলা', icon: 'check-circle' }
];

function filterTrackerLevel(level) {
  currentTrackerLevel = level;
  ['ALL', 'L1', 'L2', 'L3', 'L4'].forEach(l => {
    const btn = document.getElementById(`trackerFilterBtn-${l}`);
    if (btn) {
      if (l === level) {
        btn.className = 'px-3 py-1 rounded-xl text-xs font-semibold bg-emerald-600 text-white transition-all shadow-sm';
      } else {
        btn.className = 'px-3 py-1 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all';
      }
    }
  });
  renderTracker();
}

function toggleSemesterBranch(termCode) {
  openSemesterBranches[termCode] = !openSemesterBranches[termCode];
  renderTracker();
}

function toggleCourseBranch(courseName) {
  openCourseBranches[courseName] = !openCourseBranches[courseName];
  renderTracker();
}

function toggleMilestone(courseName, milestoneKey, isDone) {
  if (!currentUser) {
    showToast(currentLang === 'en' 
      ? 'Please sign in to save your progression and track your study milestones.' 
      : 'স্টাডি মাইলস্টোন ও প্রোগ্রেস সেভ করতে অনুগ্রহ করে প্রথমে সাইন ইন করুন।');
    openGoogleSignInPortal();
    renderTracker();
    return;
  }
  if (!courseProgress[courseName] || typeof courseProgress[courseName] !== 'object') {
    courseProgress[courseName] = {};
  }
  if (isDone) {
    courseProgress[courseName][milestoneKey] = true;
  } else {
    delete courseProgress[courseName][milestoneKey];
  }
  localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(courseProgress));
  renderTracker();
}

function markCourseAllDone(courseName) {
  if (!currentUser) {
    showToast(currentLang === 'en' 
      ? 'Please sign in to update course progression.' 
      : 'কোর্সের প্রোগ্রেস পরিবর্তন করতে অনুগ্রহ করে প্রথমে সাইন ইন করুন।');
    openGoogleSignInPortal();
    return;
  }
  if (!courseProgress[courseName] || typeof courseProgress[courseName] !== 'object') {
    courseProgress[courseName] = {};
  }
  MILESTONES_DEF.forEach(m => {
    courseProgress[courseName][m.id] = true;
  });
  localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(courseProgress));
  renderTracker();
  showToast(currentLang === 'en' ? `Course ${courseName} marked 100% complete!` : `${courseName} সম্পূর্ণ সম্পন্ন হয়েছে!`);
}

function resetCourseProgress(courseName) {
  if (!currentUser) {
    showToast(currentLang === 'en' 
      ? 'Please sign in to manage course progression.' 
      : 'কোর্সের প্রোগ্রেস রিসেট করতে অনুগ্রহ করে প্রথমে সাইন ইন করুন।');
    openGoogleSignInPortal();
    return;
  }
  delete courseProgress[courseName];
  localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(courseProgress));
  renderTracker();
  showToast(currentLang === 'en' ? `Reset progress for ${courseName}` : `${courseName} এর প্রোগ্রেস রিসেট করা হয়েছে`);
}

function renderTracker() {
  if (!appData) return;
  const container = document.getElementById('trackerTermsList');
  if (!container) return;

  // Render Bookmarks
  const bmList = document.getElementById('bookmarkedList');
  const bmCount = document.getElementById('bookmarkedCount');
  if (bmCount) bmCount.textContent = bookmarks.length;

  if (bmList) {
    if (bookmarks.length === 0) {
      bmList.innerHTML = `<p class="text-slate-500 italic py-1">${I18N[currentLang].bookmarks_empty}</p>`;
    } else {
      const allFiles = getAllFlatFiles();
      bmList.innerHTML = bookmarks.map(id => {
        const f = allFiles.find(item => item.id === id);
        if (!f) return '';
        return `
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700/80 text-slate-200">
            <i data-lucide="file-text" class="w-3.5 h-3.5 text-indigo-400"></i>
            <span class="max-w-[200px] truncate font-medium text-xs">${f.name}</span>
            <button onclick="previewFile('${encodeURIComponent(f.path)}', '${encodeURIComponent(f.name)}')" class="text-indigo-400 hover:text-indigo-300 p-0.5 ml-1">
              <i data-lucide="eye" class="w-3.5 h-3.5"></i>
            </button>
            <button onclick="toggleBookmark('${f.id}')" title="Remove" class="text-slate-400 hover:text-red-400 p-0.5">
              <i data-lucide="x" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        `;
      }).filter(Boolean).join('');
    }
  }

  // Calculate overall stats across all terms and courses
  let totalCourses = 0;
  let masteredCourses = 0;
  let totalMilestones = 0;
  let completedMilestones = 0;

  appData.terms.forEach(term => {
    term.courses.forEach(course => {
      totalCourses++;
      const cData = courseProgress[course.name];
      let cDone = 0;
      MILESTONES_DEF.forEach(m => {
        totalMilestones++;
        if (cData && typeof cData === 'object' && cData[m.id]) {
          cDone++;
          completedMilestones++;
        }
      });
      if (cDone === MILESTONES_DEF.length) {
        masteredCourses++;
      }
    });
  });

  const overallPct = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
  const pctEl = document.getElementById('trackerProgressPercent');
  const barEl = document.getElementById('trackerProgressBar');
  const cmCountEl = document.getElementById('trackerCompletedCount');
  const tmCountEl = document.getElementById('trackerTotalMilestones');
  const cmCoursesEl = document.getElementById('trackerCompletedCourses');

  if (pctEl) pctEl.textContent = `${overallPct}%`;
  if (barEl) barEl.style.width = `${overallPct}%`;
  if (cmCountEl) cmCountEl.textContent = completedMilestones;
  if (tmCountEl) tmCountEl.textContent = totalMilestones;
  if (cmCoursesEl) cmCoursesEl.textContent = masteredCourses;

  // Filter terms by Level
  const filteredTerms = appData.terms.filter(term => {
    if (currentTrackerLevel === 'ALL') return true;
    return term.code.startsWith(currentTrackerLevel);
  });

  // Render Semester Branches
  container.innerHTML = filteredTerms.map(term => {
    const isTermOpen = !!openSemesterBranches[term.code];
    
    // Semester stats
    let termMilestones = 0;
    let termCompleted = 0;
    let termCoursesDone = 0;

    term.courses.forEach(c => {
      const cd = courseProgress[c.name];
      let cdCount = 0;
      MILESTONES_DEF.forEach(m => {
        termMilestones++;
        if (cd && typeof cd === 'object' && cd[m.id]) {
          termCompleted++;
          cdCount++;
        }
      });
      if (cdCount === MILESTONES_DEF.length) termCoursesDone++;
    });

    const termPct = termMilestones > 0 ? Math.round((termCompleted / termMilestones) * 100) : 0;

    const coursesHtml = term.courses.map(course => {
      const isCourseOpen = !!openCourseBranches[course.name];
      const cData = courseProgress[course.name];
      const doneKeys = (cData && typeof cData === 'object') ? Object.keys(cData).filter(k => cData[k]) : [];
      const coursePct = Math.round((doneKeys.length / MILESTONES_DEF.length) * 100);
      const isMastered = doneKeys.length === MILESTONES_DEF.length;

      const milestonesHtml = MILESTONES_DEF.map(m => {
        const checked = (cData && typeof cData === 'object' && !!cData[m.id]);
        return `
          <label class="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-700/50 cursor-pointer text-xs transition-colors group/item">
            <div class="flex items-center gap-2.5">
              <input type="checkbox" 
                onchange="toggleMilestone('${course.name}', '${m.id}', this.checked)" 
                ${checked ? 'checked' : ''} 
                class="w-4 h-4 rounded text-emerald-500 bg-slate-950 border-slate-600 focus:ring-emerald-500 cursor-pointer">
              <span class="${checked ? 'line-through text-slate-500' : 'text-slate-200'} font-medium">
                ${currentLang === 'en' ? m.en : m.bn}
              </span>
            </div>
            <i data-lucide="${m.icon}" class="w-3.5 h-3.5 text-slate-500 group-hover/item:text-indigo-400 transition-colors"></i>
          </label>
        `;
      }).join('');

      return `
        <div class="rounded-xl border ${isMastered ? 'border-emerald-500/40 bg-emerald-950/15' : 'border-slate-800 bg-slate-900/70'} overflow-hidden transition-all">
          
          <!-- Course Header Bar -->
          <div class="p-3 sm:p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none hover:bg-slate-800/40 transition-colors" onclick="toggleCourseBranch('${course.name}')">
            <div class="flex items-center gap-2.5 min-w-0">
              <button type="button" class="text-slate-400 p-0.5 hover:text-white transition-transform">
                <i data-lucide="${isCourseOpen ? 'chevron-down' : 'chevron-right'}" class="w-4 h-4"></i>
              </button>
              <div class="truncate">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-xs text-white truncate">${course.name}</span>
                  ${isMastered ? '<span class="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-bold">✓ Mastered</span>' : ''}
                </div>
                <div class="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                  <span>${doneKeys.length}/5 milestones</span>
                  <span>•</span>
                  <span>${course.file_count} files</span>
                </div>
              </div>
            </div>

            <!-- Mini Progress Ring / Bar -->
            <div class="flex items-center gap-2.5 flex-shrink-0">
              <div class="w-16 sm:w-20 bg-slate-800 h-2 rounded-full overflow-hidden">
                <div class="${isMastered ? 'bg-emerald-400' : 'bg-gradient-to-r from-indigo-500 to-cyan-400'} h-full transition-all duration-300" style="width: ${coursePct}%"></div>
              </div>
              <span class="text-[11px] font-mono font-bold ${isMastered ? 'text-emerald-400' : 'text-slate-300'} w-7 text-right">${coursePct}%</span>
            </div>
          </div>

          <!-- Expanded Milestones Checklist Branch -->
          <div class="${isCourseOpen ? 'block' : 'hidden'} p-3 pt-1 border-t border-slate-800/80 bg-slate-950/40 space-y-2">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              ${milestonesHtml}
            </div>
            <div class="flex items-center justify-end gap-2 pt-1 text-[11px]">
              <button onclick="markCourseAllDone('${course.name}')" class="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-medium transition-colors">
                Mark 100%
              </button>
              <button onclick="resetCourseProgress('${course.name}')" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-red-300 font-medium transition-colors">
                Reset
              </button>
            </div>
          </div>

        </div>
      `;
    }).join('');

    return `
      <div class="rounded-2xl border border-slate-800/90 bg-slate-900/50 overflow-hidden shadow-lg">
        
        <!-- Semester Branch Header -->
        <div class="p-4 flex items-center justify-between gap-3 cursor-pointer select-none bg-slate-900/90 hover:bg-slate-800/80 transition-colors" onclick="toggleSemesterBranch('${term.code}')">
          <div class="flex items-center gap-3">
            <button type="button" class="p-1 rounded-lg bg-slate-800 text-slate-300">
              <i data-lucide="${isTermOpen ? 'folder-open' : 'folder'}" class="w-4 h-4 text-indigo-400"></i>
            </button>
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold">${term.code}</span>
                <h4 class="text-sm font-bold text-white">${term.title}</h4>
              </div>
              <div class="text-xs text-slate-400 mt-0.5">
                ${termCoursesDone}/${term.course_count} courses mastered (${termCompleted}/${termMilestones} milestones)
              </div>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <div class="hidden sm:flex flex-col items-end">
              <div class="text-xs font-mono font-bold text-emerald-400">${termPct}% Completed</div>
              <div class="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                <div class="bg-gradient-to-r from-emerald-500 to-teal-400 h-full" style="width: ${termPct}%"></div>
              </div>
            </div>
            <i data-lucide="${isTermOpen ? 'chevron-up' : 'chevron-down'}" class="w-4 h-4 text-slate-400"></i>
          </div>
        </div>

        <!-- Semester Courses List (Branch) -->
        <div class="${isTermOpen ? 'block' : 'hidden'} p-4 space-y-2.5 border-t border-slate-800">
          ${coursesHtml}
        </div>

      </div>
    `;
  }).join('');

  lucide.createIcons();
}

/* =========================================================================
   13. COMPREHENSIVE BILINGUAL CUET ME AI STUDY COMPANION
   ========================================================================= */
const ME_KNOWLEDGE_BASE = {
  thermodynamics: {
    title: '🔥 ME 211 / ME 411: Thermodynamics Principles & Laws',
    en: `### 1. First & Second Laws of Thermodynamics
- **First Law (Energy Conservation):** For a closed system: \\( \\delta Q = dU + \\delta W \\). Energy cannot be created or destroyed, only transformed.
- **Kelvin-Planck Statement (2nd Law):** It is impossible for any cyclic device to absorb heat from a single thermal reservoir and convert 100% of it into work.
- **Clausius Statement (2nd Law):** It is impossible to construct a refrigerator that transfers heat from a colder body to a hotter body without external work.

### 2. Carnot Cycle & Efficiency
- Four reversible processes: Isothermal expansion, Isentropic expansion, Isothermal compression, Isentropic compression.
- **Carnot Thermal Efficiency:**
  \\[ \\eta_{\\text{Carnot}} = 1 - \\frac{T_L}{T_H} = \\frac{T_H - T_L}{T_H} \\quad (T \\text{ in Kelvin}) \\]

### 3. Vapor Compression Refrigeration (VCR)
- **COP (Coefficient of Performance):**
  \\[ \\text{COP}_{\\text{ref}} = \\frac{Q_L}{W_{\\text{in}}} = \\frac{h_1 - h_4}{h_2 - h_1} \\]
- Common refrigerants: R-134a, R-410A, Ammonia (R-717).`,
    bn: `### ১. থার্মোডাইনামিক্সের মূল সূত্রসমূহ (CUET ME 211)
- **১ম সূত্র (শক্তির সংরক্ষণশীলতা):** \\( dQ = dU + dW \\) (সরবরাহকৃত তাপ অভ্যন্তরীণ শক্তি বৃদ্ধি ও কাজে ব্যয় হয়)।
- **২য় সূত্র (কেলভিন-প্লাংক বিবৃতি):** কোনো সাইক্লিক ইঞ্জিন একক তাপাধার থেকে সম্পূর্ণ তাপ নিয়ে সমপরিমাণ কাজে রূপান্তর করতে পারে না (দক্ষতা কখনোই ১০০% হতে পারে না)।
- **ক্লসিয়াসের বিবৃতি:** বাহ্যিক কাজ ছাড়া নিম্ন তাপমাত্রার বস্তু থেকে উচ্চ তাপমাত্রার বস্তুতে তাপ প্রবাহিত হতে পারে না।

### ২. কার্নো চক্রের দক্ষতা
\\[ \\eta = 1 - \\frac{T_L}{T_H} \\]
*(এখানে তাপমাত্রা \\(T_H\\) ও \\(T_L\\) অবশ্যই কেলভিনে (Kelvin) হিসাব করতে হবে)।*

### ৩. রেফ্রিজারেশন চক্র ও COP
\\[ \\text{COP} = \\frac{\\text{Refrigeration Effect}}{\\text{Work Input}} = \\frac{h_1 - h_4}{h_2 - h_1} \\]`
  },

  applied_thermo: {
    title: '⚡ ME 411: Applied Thermodynamics, Brayton & Rankine Cycles',
    en: `### 1. Rankine Steam Power Cycle
- **Processes:** 1-2 Isentropic pump compression, 2-3 Constant pressure heat addition (Boiler), 3-4 Isentropic expansion (Turbine), 4-1 Constant pressure heat rejection (Condenser).
- **Thermal Efficiency:** \\( \\eta = \\frac{W_{\\text{turb}} - W_{\\text{pump}}}{Q_{\\text{in}}} = \\frac{(h_3 - h_4) - (h_2 - h_1)}{h_3 - h_2} \\)
- **Methods to increase efficiency:** Superheating steam, Reheating steam, Regeneration (feedwater heaters).

### 2. Brayton Cycle (Gas Turbines & Jet Propulsion)
- **Pressure Ratio (\\(r_p\\)):** \\( r_p = P_2 / P_1 \\)
- **Thermal Efficiency:** \\[ \\eta_{\\text{Brayton}} = 1 - \\frac{1}{r_p^{(\\gamma-1)/\\gamma}} \\]
- Used in aircraft turbojet/turbofan engines and combined cycle power plants.`,
    bn: `### ১. র‍্যাঙ্কিন চক্র (Rankine Cycle - স্টিম পাওয়ার প্ল্যান্ট)
- **চারটি ধাপ:** পাম্প সংকোচন (1-2), বয়লারে তাপ গ্রহণ (2-3), টারবাইনে কাজ (3-4), কনডেন্সারে ঘনীভবন (4-1)।
- **দক্ষতা বৃদ্ধির উপায়:** স্টিম সুপারহিট করা, রি-হিট (Reheat) করা এবং রিজেনারেটিভ ফিডওয়াটার হিটার ব্যবহার করা।

### ২. ব্রেইটন চক্র (Brayton Cycle - গ্যাস টারবাইন ও জেট ইঞ্জিন)
\\[ \\eta = 1 - \\frac{1}{r_p^{(\\gamma-1)/\\gamma}} \\]
- বিমান ইঞ্জিন (Jet Propulsion) এবং কম্বাইন্ড সাইকেল পাওয়ার প্ল্যান্টে ব্যবহৃত হয়।`
  },

  fluid_machinery: {
    title: '💧 ME 421: Hydraulic Turbines & Centrifugal Pumps',
    en: `### 1. Hydraulic Turbines Classification
- **Pelton Wheel (Impulse Turbine):** High head (> 150m), Low discharge. Tangential flow. Uses bucket shaped blades with splitter. Governed by spear needle valve.
- **Francis Turbine (Reaction Turbine):** Medium head (30m - 150m), Medium discharge. Mixed radial-inflow to axial-outflow. Requires draft tube.
- **Kaplan Turbine (Reaction Axial):** Low head (< 30m), Very high discharge. Propeller blades are adjustable in operation.

### 2. Centrifugal Pumps & Cavitation
- **Specific Speed (\\(N_s\\)):**
  \\[ N_s = \\frac{N \\sqrt{Q}}{H^{3/4}} \\]
- **NPSH (Net Positive Suction Head):** To prevent cavitation, \\( \\text{NPSH}_{\\text{available}} > \\text{NPSH}_{\\text{required}} \\).
- **Cavitation:** Formation of vapor bubbles at low pressure regions and their violent collapse causing severe metal surface erosion and vibration.`,
    bn: `### ১. হাইড্রোলিক টারবাইনের শ্রেণিবিভাগ (CUET ME 421)
- **পেল্টন হুইল (Pelton Wheel - ইমপালস):** উচ্চ হেড (> ১৫০ মিটার) ও কম প্রবাহ। স্প্লিটারযুক্ত বাকেট থাকে।
- **ফ্রান্সিস টারবাইন (Francis Turbine - রিঅ্যাকশন):** মাঝারি হেড (৩০ - ১৫০ মিটার) ও মাঝারি প্রবাহ। ড্রাফট টিউব আবশ্যক।
- **কাপলান টারবাইন (Kaplan Turbine - রিঅ্যাকশন অ্যাক্সিয়াল):** কম হেড (< ৩০ মিটার) ও সর্বোচ্চ পানি প্রবাহ।

### ২. সেন্ট্রিফিউগাল পাম্প ও ক্যাভিটেশন (Cavitation)
- **ক্যাভিটেশন কী:** পাম্পের কোনো অংশে পানির চাপ ভেপার প্রেশারের নিচে নেমে গেলে বাষ্পের বুদবুদ তৈরি হয় এবং ব্লেডে ধাক্কা লেগে মেটাল ক্ষয় হয়।
- **প্রতিরোধ:** \\( \\text{NPSH}_{\\text{available}} > \\text{NPSH}_{\\text{required}} \\) নিশ্চিত করতে হবে এবং প্রাইমিং করতে হবে।`
  },

  heat_transfer: {
    title: '♨️ ME 311: Conduction, Convection & Radiation',
    en: `### 1. Three Modes of Heat Transfer
- **Fourier's Conduction Law:**
  \\[ q = -k A \\frac{dT}{dx} \\quad \\implies \\quad R_{\\text{thermal}} = \\frac{L}{k A} \\]
- **Newton's Law of Cooling (Convection):**
  \\[ q = h A (T_s - T_\\infty) \\]
  Dimensionless numbers: Nusselt (\\(Nu = h L / k\\)), Reynolds (\\(Re = \\rho V L / \\mu\\)), Prandtl (\\(Pr = \\nu / \\alpha\\)).
- **Stefan-Boltzmann Law (Radiation):**
  \\[ E = \\epsilon \\sigma A (T_1^4 - T_2^4) \\quad (\\sigma = 5.67 \\times 10^{-8} \\text{ W/m}^2\\text{K}^4) \\]

### 2. Heat Exchangers: LMTD & NTU Method
- **Log Mean Temperature Difference (LMTD):**
  \\[ \\Delta T_{lm} = \\frac{\\Delta T_1 - \\Delta T_2}{\\ln(\\Delta T_1 / \\Delta T_2)} \\]
- Counter-flow heat exchangers achieve higher effectiveness than parallel-flow exchangers for the same surface area.`,
    bn: `### ১. তাপ সঞ্চালনের তিন মোড (ME 311)
- **পরিবহন (Fourier's Law):** \\( q = -kA \\frac{dT}{dx} \\)
- **পরিচলন (Newton's Law):** \\( q = hA(T_s - T_\\infty) \\)
- **বিকিরণ (Stefan-Boltzmann):** \\( q = \\epsilon \\sigma A(T_1^4 - T_2^4) \\) \\((\\sigma = 5.67 \\times 10^{-8} \\text{ W/m}^2\\text{K}^4)\\)

### ২. হিট এক্সচেঞ্জার ও LMTD
\\[ \\Delta T_{lm} = \\frac{\\Delta T_1 - \\Delta T_2}{\\ln(\\Delta T_1 / \\Delta T_2)} \\]
- কাউন্টার-ফ্লো (Counter-flow) হিট এক্সচেঞ্জারের কার্যক্ষমতা প্যারালাল-ফ্লোর চেয়ে বেশি হয়।`
  },

  mechanics_design: {
    title: '⚙️ ME 241 / ME 341: Stress-Strain, Mohr\'s Circle & Shaft Design',
    en: `### 1. Bending & Torsion Formulas
- **Pure Bending Formula:**
  \\[ \\frac{M}{I} = \\frac{\\sigma}{y} = \\frac{E}{R} \\]
- **Pure Torsion Formula:**
  \\[ \\frac{T}{J} = \\frac{\\tau}{r} = \\frac{G \\theta}{L} \\]
  For solid circular shaft of diameter \\(d\\): \\( \\tau = \\frac{16 T}{\\pi d^3} \\)

### 2. Mohr's Circle for Plane Stress
- Center: \\( C = \\left( \\frac{\\sigma_x + \\sigma_y}{2}, 0 \\right) \\)
- Radius: \\( R = \\sqrt{\\left( \\frac{\\sigma_x - \\sigma_y}{2} \\right)^2 + \\tau_{xy}^2} \\)
- Principal Stresses: \\( \\sigma_1, \\sigma_2 = \\frac{\\sigma_x + \\sigma_y}{2} \\pm R \\)
- Max Shear Stress: \\( \\tau_{\\max} = R \\)

### 3. Theories of Failure
- **von Mises (Distortion Energy Theory):** Best for ductile materials subjected to dynamic/static multiaxial loads.
- **Tresca (Max Shear Stress Theory):** Conservative design theory for ductile materials.
- **Rankine (Max Normal Stress Theory):** Best for brittle materials (e.g. Cast Iron).`,
    bn: `### ১. বেন্ডিং ও টরশন সূত্র (CUET ME 241)
- **বেন্ডিং সূত্র:** \\( \\frac{M}{I} = \\frac{\\sigma}{y} = \\frac{E}{R} \\)
- **টরশন সূত্র:** \\( \\frac{T}{J} = \\frac{\\tau}{r} = \\frac{G\\theta}{L} \\)
  বৃত্তাকার শ্যাফটের জন্য: \\( \\tau = \\frac{16T}{\\pi d^3} \\)

### ২. মোরের বৃত্ত (Mohr's Circle)
- কেন্দ্র: \\( \\left( \\frac{\\sigma_x + \\sigma_y}{2}, 0 \\right) \\)
- ব্যাসার্ধ: \\( R = \\sqrt{\\left(\\frac{\\sigma_x - \\sigma_y}{2}\\right)^2 + \\tau_{xy}^2} \\)
- সর্বোচ্চ শিয়ার স্ট্রেস: \\( \\tau_{\\max} = R \\)

### ৩. ফেইলিউর থিওরি (Theories of Failure)
- **ভন মাইসেস (von Mises):** ডাকটাইল ধাতুর জন্য সবচেয়ে নিখুঁত।
- **ম্যাক্সিমাম নরমাল স্ট্রেস (Rankine):** কাস্ট আয়রনের মতো ভঙ্গুর (brittle) পদার্থের জন্য প্রযোজ্য।`
  },

  workshop: {
    title: '🔧 ME 154 / ME 251: Workshop Technology, Lathe & Welding',
    en: `### 1. Lathe Machine
- **Definition:** Machine tool where workpiece rotates and single-point cutting tool moves linearly.
- **Operations:** Facing (perpendicular surface), Turning (reducing diameter), Taper turning, Knurling, Thread cutting.
- **Headstock vs Tailstock:** Headstock drives spindle; Tailstock supports long jobs and holds drill bit.

### 2. Welding Classification
- **SMAW (Shielded Metal Arc Welding):** Flux-coated consumable electrode, AC/DC power source.
- **TIG (GTAW):** Non-consumable tungsten electrode, inert argon shielding gas. Best for aluminum and thin stainless steel.
- **MIG (GMAW):** Continuous spool wire electrode, argon/CO2 shield gas. High productivity.`,
    bn: `### ১. লেদ মেশিন ও ওয়ার্কশপ ভাইভা (ME 154)
- **লেদের কাজ:** ফেসিং, টার্নিং, টেপার টার্নিং, নার্লিং (গ্রিপের জন্য খসখসে প্যাটার্ন), থ্রেডিং বা প্যাঁচ কাটা।
- **হেডস্টক বনাম টেলস্টক:** হেডস্টকে গিয়ার ও স্পিন্ডল থাকে যা জবকে ঘুরায়; টেলস্টক অপর প্রান্ত ধরে রাখে এবং ড্রিল বিট বহন করে।

### ২. ওয়েল্ডিংয়ের প্রকারভেদ
- **SMAW (আর্ক ওয়েল্ডিং):** ফ্লাক্স কোটেড ইলেকট্রোড ব্যবহৃত হয়।
- **TIG (আর্গন ওয়েল্ডিং):** নন-কনজিউমেবল টাংস্টেন ইলেকট্রোড দিয়ে অ্যালুমিনিয়াম ও স্টেইনলেস স্টিল সূক্ষ্মভাবে জোড়া দেওয়া হয়।
- **MIG:** স্পুল ওয়্যার স্বয়ংক্রিয়ভাবে ফিড হয়, দ্রুত কাজ হয়।`
  },

  bulletin_guide: {
    title: '📘 CUET ME Bulletin, Ordinance & Grading Guidelines',
    en: `### 1. Degree Requirements & Credit Distribution
- Total credits required for B.Sc. in Mechanical Engineering: **160.00 Credits**.
- Minimum CGPA required for award of degree: **2.20**.
- 4 Academic Levels (Level 1 to Level 4), 2 Terms per Level (Total 8 Terms).

### 2. Marks Distribution
- **Theory Courses (100%):**
  - Class Attendance: **10%**
  - Class Tests (Best 3 out of 4 CTs): **20%**
  - Term-Final Examination (Section A + Section B, 3 Hours): **70%**
- **Sessional Courses (100%):**
  - Attendance: **10%**
  - Continuous Lab Reports & Performance: **50%**
  - Lab Quiz & Final Viva Voce: **40%**

### 3. Grading Policy Scale
- 80% and above = **A+ (4.00)**
- 75% to <80% = **A (3.75)**
- 70% to <75% = **A- (3.50)**
- 65% to <70% = **B+ (3.25)**
- 60% to <65% = **B (3.00)**
- Less than 40% = **F (0.00)**`,
    bn: `### ১. চুয়েট মেকানিক্যাল সিলেবাস ও ডিগ্রি কারিকুলাম
- মোট ক্রেডিট: **১৬০.০০ ক্রেডিট**।
- ডিগ্রি অর্জনের ন্যূনতম CGPA: **২.২০**।
- ৮টি সেমিস্টার (L1-T1 থেকে L4-T2)।

### ২. নম্বর বণ্টন পদ্ধতি
- **থিওরি কোর্স (১০০%):**
  - উপস্থিতি (Attendance): **১০%**
  - ক্লাস টেস্ট (৪টির মধ্যে সেরা ৩টি সিটি): **২০%**
  - টার্ম ফাইনাল পরীক্ষা (৩ ঘণ্টা): **৭০%**
- **সেশনাল ল্যাব কোর্স (১০০%):**
  - ল্যাব শিট ও পারফরম্যান্স: **৫০%**
  - ল্যাব কুইজ ও ভাইভা: **৪০%**
  - উপস্থিতি: **১০%**

### ৩. জিপিএ গ্রেডিং স্কেল
- ৮০%+ = A+ (৪.০০)
- ৭৫% - ৭৯% = A (৩.৭৫)
- ৭০% - ৭৪% = A- (৩.৫০)
- ৬৫% - ৬৯% = B+ (৩.২৫)
- ৬০% - ৬৪% = B (৩.০০)
- ৪০% এর কম = F (০.০০)`
  }
};

function askPresetPrompt(promptText) {
  const input = document.getElementById('aiInputPrompt');
  if (input) {
    input.value = promptText;
    handleAiSubmit(new Event('submit'));
  }
}

function copyAiResponse(btn) {
  const container = btn.closest('.ai-message-card');
  if (!container) return;
  const text = container.querySelector('.ai-prose').innerText;
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.innerHTML;
    btn.innerHTML = `<i data-lucide="check" class="w-3.5 h-3.5 text-emerald-400"></i> Copied!`;
    lucide.createIcons();
    setTimeout(() => {
      btn.innerHTML = orig;
      lucide.createIcons();
    }, 2000);
  });
}

function handleAiSubmit(e) {
  e.preventDefault();
  const input = document.getElementById('aiInputPrompt');
  const query = input.value.trim();
  if (!query) return;

  const chatBox = document.getElementById('aiChatBox');
  const isBangla = /[\u0980-\u09FF]/.test(query);

  // User Message bubble
  const userDiv = document.createElement('div');
  userDiv.className = 'flex items-start gap-3 justify-end';
  userDiv.innerHTML = `
    <div class="bg-indigo-600 rounded-2xl rounded-tr-none p-3.5 text-xs sm:text-sm text-white max-w-xl leading-relaxed shadow-md">
      ${query}
    </div>
    <div class="w-8 h-8 rounded-xl bg-slate-700 flex items-center justify-center flex-shrink-0 text-white shadow">
      <i data-lucide="user" class="w-4 h-4"></i>
    </div>
  `;
  chatBox.appendChild(userDiv);
  input.value = '';
  chatBox.scrollTop = chatBox.scrollHeight;
  lucide.createIcons();

  // Bot Loading Bubble
  const botDiv = document.createElement('div');
  botDiv.className = 'flex items-start gap-3';
  botDiv.innerHTML = `
    <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center flex-shrink-0 text-white shadow">
      <i data-lucide="sparkles" class="w-4 h-4"></i>
    </div>
    <div class="ai-message-card bg-slate-800/80 rounded-2xl rounded-tl-none p-4 text-xs sm:text-sm text-slate-200 border border-slate-700/60 max-w-2xl leading-relaxed shadow-lg space-y-2">
      <div class="flex items-center gap-1.5 text-xs text-purple-400">
        <span class="w-2 h-2 rounded-full bg-purple-400 animate-ping"></span>
        <span>${isBangla ? 'চুয়েট মেকানিক্যাল কোর্স বিশ্লেষণ করা হচ্ছে...' : 'Analyzing CUET Mechanical Engineering knowledge...'}</span>
      </div>
    </div>
  `;
  chatBox.appendChild(botDiv);
  chatBox.scrollTop = chatBox.scrollHeight;

  setTimeout(() => {
    const qLower = query.toLowerCase();
    let topicKey = null;

    if (qLower.includes('lathe') || qLower.includes('workshop') || qLower.includes('welding') || qLower.includes('লেদ') || qLower.includes('ওয়ার্কশপ')) {
      topicKey = 'workshop';
    } else if (qLower.includes('rankine') || qLower.includes('brayton') || qLower.includes('jet') || qLower.includes('turbine') || qLower.includes('র‍্যাঙ্কিন') || qLower.includes('টারবাইন')) {
      topicKey = 'applied_thermo';
    } else if (qLower.includes('pelton') || qLower.includes('francis') || qLower.includes('kaplan') || qLower.includes('pump') || qLower.includes('cavitation') || qLower.includes('পেল্টন') || qLower.includes('পাম্প')) {
      topicKey = 'fluid_machinery';
    } else if (qLower.includes('heat') || qLower.includes('conduction') || qLower.includes('convection') || qLower.includes('radiation') || qLower.includes('lmtd') || qLower.includes('তাপ')) {
      topicKey = 'heat_transfer';
    } else if (qLower.includes('stress') || qLower.includes('strain') || qLower.includes('mohr') || qLower.includes('bending') || qLower.includes('torsion') || qLower.includes('মোরের') || qLower.includes('স্ট্রেস')) {
      topicKey = 'mechanics_design';
    } else if (qLower.includes('bulletin') || qLower.includes('syllabus') || qLower.includes('grading') || qLower.includes('grade') || qLower.includes('credit') || qLower.includes('বুলেটিন') || qLower.includes('সিলেবাস') || qLower.includes('গ্রেডিং')) {
      topicKey = 'bulletin_guide';
    } else if (qLower.includes('thermodynamic') || qLower.includes('carnot') || qLower.includes('cop') || qLower.includes('refrigeration') || qLower.includes('কার্নো')) {
      topicKey = 'thermodynamics';
    }

    let answerHtml = '';
    if (topicKey && ME_KNOWLEDGE_BASE[topicKey]) {
      const topic = ME_KNOWLEDGE_BASE[topicKey];
      const rawText = isBangla ? topic.bn : topic.en;
      answerHtml = `
        <div class="flex items-center justify-between pb-2 border-b border-slate-700/60 mb-2">
          <span class="font-bold text-xs text-indigo-300">${topic.title}</span>
          <button onclick="copyAiResponse(this)" class="px-2 py-0.5 rounded bg-slate-700/60 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1 transition-colors">
            <i data-lucide="copy" class="w-3 h-3"></i> Copy
          </button>
        </div>
        <div class="ai-prose">${rawText.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>')}</div>
      `;
    } else {
      answerHtml = `
        <div class="flex items-center justify-between pb-2 border-b border-slate-700/60 mb-2">
          <span class="font-bold text-xs text-purple-300">💡 CUET ME Academic Guidance</span>
          <button onclick="copyAiResponse(this)" class="px-2 py-0.5 rounded bg-slate-700/60 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1 transition-colors">
            <i data-lucide="copy" class="w-3 h-3"></i> Copy
          </button>
        </div>
        <div class="ai-prose space-y-2">
          <p><strong>Query:</strong> "${query}"</p>
          <p>${isBangla 
            ? 'এই বিষয়ের সম্পূর্ণ ক্লাস লেকচার নোটস, বিগত বছরের সিটি এবং টার্ম ফাইনাল প্রশ্নব্যাংক দেখতে <strong>Course Explorer</strong> ট্যাবে নির্দিষ্ট সেমিস্টার ফোল্ডারে প্রবেশ করুন।' 
            : 'For comprehensive lecture slides, CT solutions, and term-final question banks on this topic, check the respective semester folder under the <strong>Course Explorer</strong> tab.'}</p>
          <ul class="text-xs text-slate-300 space-y-1">
            <li>📌 <strong>Exam Preparation Tip:</strong> Draw neat schematic diagrams with labelled axes and state your boundary assumptions clearly.</li>
            <li>📌 <strong>Formula Mastery:</strong> Ensure all absolute temperature units are converted to Kelvin (K) and pressure to Pascal (Pa/kPa).</li>
            <li>📌 <strong>Question Bank:</strong> Practice the past 5-year CUET final exam questions available in the Explorer folder.</li>
          </ul>
        </div>
      `;
    }

    botDiv.querySelector('.ai-message-card').innerHTML = answerHtml;
    chatBox.scrollTop = chatBox.scrollHeight;
    lucide.createIcons();
  }, 400);
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
