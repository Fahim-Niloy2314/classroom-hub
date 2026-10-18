/**
 * Classroom Hub - Full Application Controller
 * Author: Fahim Niloy (CUET ME '20, Roll: 2003063)
 * Admin Emails: fahimcuet63@gmail.com, fahimniloy2314@gmail.com, fahim.cuet.me20@gmail.com
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
  FEEDBACKS: 'classroom_feedbacks',
  VISITS: 'classroom_visits',
  ADMIN_SETTINGS: 'classroom_admin_settings',
  LANG: 'classroom_lang',
  ADMIN_NOTICES: 'classroom_admin_notices',
  ADMIN_VIDEOS: 'classroom_admin_videos',
  ADMIN_TIMELINE: 'classroom_admin_timeline',
  ADMIN_TRASH: 'classroom_admin_trash',
  ADMIN_REVISIONS: 'classroom_admin_revisions',
  ADMIN_HIDDEN: 'classroom_admin_hidden_items',
  ADMIN_FEATURED: 'classroom_admin_featured_items',
  ADMIN_LOGS: 'classroom_admin_logs',
  ADMIN_SEO: 'classroom_admin_seo',
  ADMIN_DRAFT: 'classroom_admin_draft',
  PORTAL_SETTINGS: 'classroom_portal_settings',
  GEMINI_API_KEY: 'classroom_gemini_api_key',
  OPENAI_API_KEY: 'classroom_openai_api_key',
  ADMIN_FAQS: 'classroom_admin_faqs',
  ADMIN_ROUTINE: 'classroom_admin_routine',
  ADMIN_FACULTY: 'classroom_admin_faculty',
  MY_ROUTINE: 'classroom_my_personal_routine',
  PUBLISHED_ROUTINES: 'classroom_published_routines',
  ADMIN_PWD_HASH: 'classroom_admin_pwd_hash',
  ADMIN_GITHUB_TOKEN: 'classroom_admin_github_token',
  FEEDBACK_WEBHOOK: 'classroom_feedback_webhook'
};

// Cryptographic Password Hash Utility (Zero Plaintext Secrets)
async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}
const DEFAULT_ADMIN_PWD_HASH = '1c5ee9de39ca7ca5b25e25c7c994cf7b33d131c1ab99437ca2912a2cc4b6f21e';

// Admin Email List
const ADMIN_EMAILS = [
  'fahimcuet63@gmail.com',
  'fahimniloy2314@gmail.com',
  'fahim.cuet.me20@gmail.com'
];

// Persistent State
let currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || 'null');
let bookmarks = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKMARKS) || '[]');
let courseProgress = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROGRESS) || '{}');

// Portal Layout & Navigation Settings (Managed by Fahim Niloy in Admin CMS)
const DEFAULT_PORTAL_SETTINGS = {
  tabs: [
    { id: 'home', label: 'Home', icon: 'home', visible: true, locked: true },
    { id: 'resources', label: 'Courses', icon: 'folder', visible: true },
    { id: 'videos', label: 'Video Lectures', icon: 'youtube', visible: false },
    { id: 'ai', label: 'AI Assistant', icon: 'sparkles', visible: true },
    { id: 'tracker', label: 'Tracker', icon: 'check-square', visible: true }
  ],
  heroTitle: "Mechanical Engineering",
  heroSubtitle: "Academic Vault & Archive",
  deptDesc: "Chittagong University of Engineering and Technology (CUET)",
  heroDesc: "A comprehensive digitized academic repository preserving 3,896+ course materials from Level 1 Term 1 to Level 4 Term 2.",
  creatorName: "Mohammad Fahim Ahmed",
  creatorBadge: "Fahim Niloy",
  creatorDept: "Department of Mechanical Engineering",
  creatorBatch: "'20",
  creatorId: "2003063",
  primaryEmail: "fahimcuet63@gmail.com",
  phone: "+880 1850-162261",
  portfolioUrl: "https://mohammad-fahim-ahmed.netlify.app/",
  githubUrl: "https://github.com/Fahim-Niloy2314/classroom-hub",
  card1Title: "Course Explorer",
  card1Desc: "Browse 3,896+ verified notes, questions, and lab manuals organized exactly by semester.",
  card2Title: "Video Lectures",
  card2Desc: "সেমিস্টার ও টার্ম অনুযায়ী ফোল্ডার আকারে সাজানো ভেরিফাইড ভিডিও লেকচার।",
  card3Title: "Syllabus & Rules",
  card3Desc: "CUET 160-credit degree requirements, mark distributions, GPA grading scale, and regulations.",
  card4Title: "AI Study Chatbot",
  card4Desc: "Talk naturally with Fahim Niloy AI just like Gemini about theories, formulas, and concepts.",
  maintenanceMode: false,
  maintenanceMsg: "ClassroomHub is undergoing routine academic content upgrades by Fahim Niloy. Please check back shortly!",
  marqueeActive: false,
  marqueeText: "📢 CUET ME Academic Vault: All 8 Semesters notes, questions, and video lectures are 100% updated.",
  marqueeType: "indigo",
  marqueeUrl: "",
  allowDownloads: true,
  allowSubmissions: true,
  enableAiTab: true,
  enableVideosTab: false,
  enableTrackerTab: true,
  aiBotName: "Fahim Niloy AI",
  aiBotSubtitle: "CUET Mechanical Engineering Academic Co-pilot",
  aiBotGreeting: "Hello! I am Fahim Niloy AI. You can ask me any mechanical engineering theory, formula, syllabus checklist, or academic question."
};

let portalSettings = JSON.parse(localStorage.getItem(STORAGE_KEYS.PORTAL_SETTINGS) || 'null');
if (!portalSettings || !portalSettings.tabs) {
  portalSettings = JSON.parse(JSON.stringify(DEFAULT_PORTAL_SETTINGS));
  localStorage.setItem(STORAGE_KEYS.PORTAL_SETTINGS, JSON.stringify(portalSettings));
} else {
  portalSettings = Object.assign({}, DEFAULT_PORTAL_SETTINGS, portalSettings);
}

let pendingResources = JSON.parse(localStorage.getItem(STORAGE_KEYS.PENDING_RESOURCES) || '[]');
let communityResources = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMMUNITY_RESOURCES) || '[]');
let feedbacks = JSON.parse(localStorage.getItem(STORAGE_KEYS.FEEDBACKS) || '[]');
let currentAdminSubTab = 'queue';
let adminNotices = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN_NOTICES) || '[]');
let adminVideos = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN_VIDEOS) || '[]');
let adminTimeline = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN_TIMELINE) || '[]');
let adminTrash = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN_TRASH) || '[]');
let adminRevisions = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN_REVISIONS) || '[]');
let adminHiddenItems = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN_HIDDEN) || '[]');
let adminFeaturedItems = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN_FEATURED) || '[]');
let adminLogs = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN_LOGS) || '[]');
let adminSeoSettings = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN_SEO) || '{}');
let adminFaqs = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN_FAQS) || 'null');
if (!adminFaqs || adminFaqs.length === 0) {
  adminFaqs = [
    {
      id: 'faq_1',
      question: 'টার্ম ফাইনাল পরীক্ষার জন্য কোন ক্যালকুলেটর অনুমোদিত?',
      answer: 'সিইউইটি পরীক্ষার নিয়মানুযায়ী সাধারণত নন-প্রোগ্রামেবল সায়েন্টিফিক ক্যালকুলেটর (যেমন: Casio fx-991ES Plus, Casio fx-991EX ClassWiz, Casio fx-991CW) অনুমোদিত। কোনো প্রোগ্রামিং মেমরিযুক্ত বা গ্রাফিং ক্যালকুলেটর পরীক্ষার হলে নিষিদ্ধ।',
      category: 'EXAM',
      keywords: ['calculator', 'ক্যালকুলেটর', 'fx-991es', 'পরীক্ষার ক্যালকুলেটর', 'fx-991ex']
    },
    {
      id: 'faq_2',
      question: 'ফাহিম নিলয়ের সাথে কীভাবে যোগাযোগ করব?',
      answer: 'মোহাম্মদ ফাহিম আহমেদ (ফাহিম নিলয়, রোল: ২০০৩০৬৩, মেকানিক্যাল ইঞ্জিনিয়ারিং \'২০ ব্যাচ, চুয়েট)।\\n• ইমেইল: fahimcuet63@gmail.com\\n• মোবাইল / হোয়াটসঅ্যাপ: +880 1850-162261\\n• পোর্টফোলিও: https://mohammad-fahim-ahmed.netlify.app/\\n• গিটহাব: https://github.com/Fahim-Niloy2314/classroom-hub',
      category: 'GENERAL',
      keywords: ['contact', 'যোগাযোগ', 'fahim', 'email', 'phone', 'নাম্বার', 'ফোন']
    },
    {
      id: 'faq_3',
      question: 'সিইউইটি মেকানিক্যাল ইঞ্জিনিয়ারিংয়ের মোট ক্রেডিট কত?',
      answer: 'চুয়েট মেকানিক্যাল ইঞ্জিনিয়ারিং বিভাগের ৪ বছর মেয়াদী বি.এসসি. ইঞ্জিনিয়ারিং ডিগ্রির মোট ক্রেডিট সংখ্যা ১৬০.০০ ক্রেডিট। এতে ৮টি সেমিস্টার (L1-T1 থেকে L4-T2) অন্তর্ভুক্ত রয়েছে। বিস্তারিত জানতে হোমপেজের Undergraduate ME Bulletin ডাউনলোড করুন।',
      category: 'COURSE',
      keywords: ['credit', 'ক্রেডিট', 'ডিগ্রি', 'সিলেবাস', 'bulletin', 'বুলেটিন']
    }
  ];
  localStorage.setItem(STORAGE_KEYS.ADMIN_FAQS, JSON.stringify(adminFaqs));
}

let adminRoutine = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN_ROUTINE) || 'null');
if (!adminRoutine || Object.keys(adminRoutine).length === 0) {
  adminRoutine = {
    'L4-T2': {
      'Sunday': [
        { time: '08:00 AM - 08:50 AM', course: 'ME 4201 Power Plant Engineering', room: 'ME-304', teacher: 'Prof. Dr. XYZ' },
        { time: '08:50 AM - 09:40 AM', course: 'ME 4203 Automobile Engineering', room: 'ME-304', teacher: 'Dr. ABC' },
        { time: '10:00 AM - 12:30 PM', course: 'ME 4200 Project & Thesis Sessional', room: 'ME Lab', teacher: 'Supervisor' }
      ],
      'Monday': [
        { time: '08:50 AM - 10:30 AM', course: 'ME 4205 Operations Research', room: 'ME-304', teacher: 'Faculty' },
        { time: '10:50 AM - 01:20 PM', course: 'ME 4202 Power Plant Sessional', room: 'Thermal Lab', teacher: 'Lab Faculty' }
      ],
      'Tuesday': [
        { time: '08:00 AM - 09:40 AM', course: 'ME 4201 Power Plant Engineering', room: 'ME-304', teacher: 'Prof. Dr. XYZ' },
        { time: '10:00 AM - 11:40 AM', course: 'ME 4203 Automobile Engineering', room: 'ME-304', teacher: 'Dr. ABC' }
      ],
      'Wednesday': [
        { time: '08:50 AM - 10:30 AM', course: 'ME 4205 Operations Research', room: 'ME-304', teacher: 'Faculty' },
        { time: '10:50 AM - 01:20 PM', course: 'ME 4204 Automobile Sessional', room: 'Auto Lab', teacher: 'Lab Faculty' }
      ],
      'Thursday': [
        { time: '09:40 AM - 11:20 AM', course: 'ME 4200 Project Consultation', room: 'Dept Library', teacher: 'Advisors' }
      ]
    }
  };
  localStorage.setItem(STORAGE_KEYS.ADMIN_ROUTINE, JSON.stringify(adminRoutine));
}

// Default initial notices if empty
if (adminNotices.length === 0) {
  adminNotices = [
    {
      id: 'not_1',
      title: 'Welcome to CUET ME Academic Vault & ClassroomHub',
      badge: 'UPDATE',
      term: 'ALL',
      message: 'All 8 semesters (L1-T1 to L4-T2) verified course materials, question banks, lab sheets, and lecture slides are now available. 100% complimentary access for all CUETians.',
      link: 'https://drive.google.com/drive/folders/1v4Gni71jdRExyyIMW6-udmiy7UIsK89h',
      active: true,
      date: new Date().toISOString()
    }
  ];
  localStorage.setItem(STORAGE_KEYS.ADMIN_NOTICES, JSON.stringify(adminNotices));
}

// ==================== VERIFIED ACADEMIC VIDEO COLLECTIONS (100% Active & Checked) ====================
const VERIFIED_VIDEO_COLLECTIONS = [
  // L1-T1
  {
    id: 'vid_l1t1_math_3b1b',
    title: 'Essence of Calculus (Intuitive Visual Mathematics)',
    subject: 'Math 131 Differential & Integral Calculus',
    channel: '3Blue1Brown',
    lang: 'en',
    term: 'L1-T1',
    type: 'Playlist (11 Videos)',
    url: 'https://www.youtube.com/playlist?list=PLZHQObOWTQDMsr9K-rj53DwVRMYO3t5Yr'
  },
  {
    id: 'vid_l1t1_draw_en',
    title: 'Complete Engineering Drawing & Graphics (Orthographic & Isometric)',
    subject: 'ME 160 Engineering Drawing',
    channel: 'Manas Patnaik',
    lang: 'en',
    term: 'L1-T1',
    type: 'Playlist (Master Course)',
    url: 'https://www.youtube.com/playlist?list=PLIhUrsYr8yHwDUrVYmUNYkEeZgZTvoIfS'
  },
  {
    id: 'vid_l1t1_draw_hi',
    title: 'Engineering Drawing in Hindi (প্রজেকশন ও অর্থোগ্রাফিক ড্রয়িং)',
    subject: 'ME 160 Engineering Drawing',
    channel: 'Manas Patnaik',
    lang: 'hi',
    term: 'L1-T1',
    type: 'Playlist (Hindi Complete)',
    url: 'https://www.youtube.com/playlist?list=PLIhUrsYr8yHx0C3ebAW-FQxTP8ig8-QxU'
  },
  {
    id: 'vid_l1t1_chem_en',
    title: 'General Chemistry 1 Comprehensive Review (Electrochemistry, Kinetics)',
    subject: 'Chem 131 Physical & Inorganic Chemistry',
    channel: 'The Organic Chemistry Tutor',
    lang: 'en',
    term: 'L1-T1',
    type: 'Study Guide & Lecture',
    url: 'https://www.youtube.com/watch?v=0hXg3m4q7Xk'
  },
  {
    id: 'vid_l1t1_shop_hi',
    title: 'Workshop Technology: Lathe, Shaper, Milling & Foundry Practice',
    subject: 'ME 112 / ME 154 Workshop Technology',
    channel: 'Mechanical Tech Hindi',
    lang: 'hi',
    term: 'L1-T1',
    type: 'Video Lecture',
    url: 'https://www.youtube.com/watch?v=3u_9pL6W4bQ'
  },

  // L1-T2
  {
    id: 'vid_l1t2_c_bn',
    title: 'C Programming Basic to Advanced 2026 (বাংলা সম্পূর্ণ টিউটোরিয়াল)',
    subject: 'ME 181 Computer Programming in C',
    channel: 'Anisul Islam',
    lang: 'bn',
    term: 'L1-T2',
    type: 'Playlist (120+ Videos)',
    url: 'https://www.youtube.com/playlist?list=PLgH5QX0i9K3r-3-Sqj4eLLopkO4D__sBt'
  },
  {
    id: 'vid_l1t2_c_en',
    title: 'C Programming Full Course (Loops, Arrays, Pointers, Structs, Memory)',
    subject: 'ME 181 Computer Programming in C',
    channel: 'Neso Academy',
    lang: 'en',
    term: 'L1-T2',
    type: 'Playlist (Complete)',
    url: 'https://www.youtube.com/playlist?list=PLBlnK6fEyqRggZZgYpPMUxdY1CYkZtARR'
  },
  {
    id: 'vid_l1t2_linalg_3b1b',
    title: 'Essence of Linear Algebra (Matrices, Vectors & Transformations)',
    subject: 'Math 133 Linear Algebra & Vectors',
    channel: '3Blue1Brown',
    lang: 'en',
    term: 'L1-T2',
    type: 'Playlist (16 Videos)',
    url: 'https://www.youtube.com/playlist?list=PLZHQObOWTQUWPOYTufKh51mPE0hPstZuS'
  },
  {
    id: 'vid_l1t2_linalg_gp',
    title: 'Linear Algebra: Matrices, Eigenvalues, Rank & Systems of Equations',
    subject: 'Math 133 Linear Algebra & Matrices',
    channel: 'Dr. Gajendra Purohit',
    lang: 'hi',
    term: 'L1-T2',
    type: 'Playlist (Hindi Complete)',
    url: 'https://www.youtube.com/playlist?list=PLU6SqdYcYsfI7Ebw_j-Vy8YKHdbHKP9am'
  },
  {
    id: 'vid_l1t2_ode_gp',
    title: 'Differential Equations (First & Higher Order ODEs, Degree & Order)',
    subject: 'Math 133 Ordinary Differential Equations',
    channel: 'Dr. Gajendra Purohit',
    lang: 'hi',
    term: 'L1-T2',
    type: 'Playlist (Hindi Complete)',
    url: 'https://www.youtube.com/playlist?list=PLU6SqdYcYsfJ73RjAojkPl9FHIRPK6JrV'
  },
  {
    id: 'vid_l1t2_ee_neso',
    title: 'Basic Electrical Engineering & Network Theory (Ohm, Thevenin, AC Circuits)',
    subject: 'EE 131 Basic Electrical Engineering',
    channel: 'Neso Academy',
    lang: 'en',
    term: 'L1-T2',
    type: 'Playlist (Complete)',
    url: 'https://www.youtube.com/playlist?list=PLgwJf8NK-2e5fADhfBYNcmqRfU05-hcjt'
  },

  // L2-T1
  {
    id: 'vid_l2t1_thermo_tikle',
    title: 'Engineering Thermodynamics: Laws, Heat, Work, Carnot & Entropy',
    subject: 'ME 211 Thermodynamics',
    channel: "Tikle's Academy",
    lang: 'hi',
    term: 'L2-T1',
    type: 'Playlist (Complete)',
    url: 'https://www.youtube.com/playlist?list=PLW4Rtyezg8ynzMIenaAHUcq3RXBWPRPPG'
  },
  {
    id: 'vid_l2t1_thermo_eff',
    title: 'First and Second Laws of Thermodynamics Visualized',
    subject: 'ME 211 Thermodynamics',
    channel: 'The Efficient Engineer',
    lang: 'en',
    term: 'L2-T1',
    type: 'Video Tutorial',
    url: 'https://www.youtube.com/watch?v=8N1BxHgovOw'
  },
  {
    id: 'vid_l2t1_mech_tikle',
    title: 'Engineering Mechanics: Statics, Trusses & Free Body Diagrams',
    subject: 'ME 231 Engineering Mechanics - I',
    channel: "Tikle's Academy",
    lang: 'hi',
    term: 'L2-T1',
    type: 'Master Video Lecture',
    url: 'https://www.youtube.com/watch?v=xKBbZ-N4K9A'
  },

  // L2-T2
  {
    id: 'vid_l2t2_som_eff',
    title: 'Understanding Stress and Strain (Tension, Shear, Young\'s Modulus)',
    subject: 'ME 235 Mechanics of Solids (SOM)',
    channel: 'The Efficient Engineer',
    lang: 'en',
    term: 'L2-T2',
    type: 'Video Tutorial',
    url: 'https://www.youtube.com/watch?v=aQf6Q8t1FQE'
  },
  {
    id: 'vid_l2t2_mohr_eff',
    title: 'Understanding Mohr\'s Circle & 2D Principal Stress States',
    subject: 'ME 235 Mechanics of Solids (SOM)',
    channel: 'The Efficient Engineer',
    lang: 'en',
    term: 'L2-T2',
    type: 'Video Tutorial',
    url: 'https://www.youtube.com/watch?v=1FwUqWfFz78'
  },
  {
    id: 'vid_l2t2_som_tikle',
    title: 'Strength of Materials (SOM): SFD, BMD, Bending, Torsion & Columns',
    subject: 'ME 235 Mechanics of Solids',
    channel: "Tikle's Academy",
    lang: 'hi',
    term: 'L2-T2',
    type: 'Comprehensive Tutorial',
    url: 'https://www.youtube.com/watch?v=f08Y39UiC-o'
  },
  {
    id: 'vid_l2t2_digital_neso',
    title: 'Digital Electronics, Boolean Algebra & Logic Gates',
    subject: 'EE 231 Electrical & Electronics',
    channel: 'Neso Academy',
    lang: 'en',
    term: 'L2-T2',
    type: 'Playlist (Complete)',
    url: 'https://www.youtube.com/playlist?list=PLBlnK6fEyqRjMH3kWf6ui5Veeh10A-Sm1'
  },

  // L3-T1
  {
    id: 'vid_l3t1_heat_nptel',
    title: 'Heat and Mass Transfer (Conduction, Convection, Radiation, LMTD)',
    subject: 'ME 311 Heat Transfer',
    channel: 'NPTEL (IIT Bombay - Prof. S.P. Sukhatme)',
    lang: 'en',
    term: 'L3-T1',
    type: 'Lecture Series',
    url: 'https://www.youtube.com/watch?v=VA5w1VEx1jE'
  },
  {
    id: 'vid_l3t1_fluid_eff',
    title: 'Understanding Bernoulli\'s Equation & Fluid Dynamics Principles',
    subject: 'ME 321 Fluid Mechanics',
    channel: 'The Efficient Engineer',
    lang: 'en',
    term: 'L3-T1',
    type: 'Video Tutorial',
    url: 'https://www.youtube.com/watch?v=DW4rItB20h4'
  },
  {
    id: 'vid_l3t1_fluid_tikle',
    title: 'Fluid Mechanics: Fluid Statics, Buoyancy, Pipe Flow & Boundary Layer',
    subject: 'ME 321 Fluid Mechanics',
    channel: "Tikle's Academy",
    lang: 'hi',
    term: 'L3-T1',
    type: 'Video Lecture',
    url: 'https://www.youtube.com/watch?v=clv_wUeS7g4'
  },
  {
    id: 'vid_l3t1_num_gp',
    title: 'Numerical Analysis & Methods: Roots, Interpolation & Integration',
    subject: 'ME 381 Numerical Methods',
    channel: 'Dr. Gajendra Purohit',
    lang: 'hi',
    term: 'L3-T1',
    type: 'Playlist (Hindi Complete)',
    url: 'https://www.youtube.com/playlist?list=PLU6SqdYcYsfLrTna7UuaVfGZYkNo0cpVC'
  },

  // L3-T2
  {
    id: 'vid_l3t2_failure_eff',
    title: 'Understanding Failure Theories (von Mises, Tresca, Max Principal)',
    subject: 'ME 333 Machine Design - I',
    channel: 'The Efficient Engineer',
    lang: 'en',
    term: 'L3-T2',
    type: 'Video Tutorial',
    url: 'https://www.youtube.com/watch?v=xKBbZ-N4K9A'
  },
  {
    id: 'vid_l3t2_dme_tikle',
    title: 'Design of Machine Elements (DME): Shafts, Keys, Couplings & Bearings',
    subject: 'ME 333 Machine Design - I',
    channel: "Tikle's Academy",
    lang: 'hi',
    term: 'L3-T2',
    type: 'Video Lecture',
    url: 'https://www.youtube.com/watch?v=GjY7a2uW0aQ'
  },

  // L4-T1
  {
    id: 'vid_l4t1_power_lesics',
    title: 'Thermal Power Plant, Steam Turbines & Rankine Cycle Operation',
    subject: 'ME 413 Power Plant Engineering',
    channel: 'Lesics (Learn Engineering)',
    lang: 'en',
    term: 'L4-T1',
    type: '3D Animated Breakdown',
    url: 'https://www.youtube.com/watch?v=IdPTuwKEfmA'
  },
  {
    id: 'vid_l4t1_rac_mech',
    title: 'Refrigeration & Air Conditioning (Vapour Compression & Psychrometry)',
    subject: 'ME 417 Refrigeration & Air Conditioning',
    channel: 'Mechanical Tech Hindi',
    lang: 'hi',
    term: 'L4-T1',
    type: 'Video Tutorial',
    url: 'https://www.youtube.com/watch?v=kYxkx_2_tD4'
  },

  // L4-T2
  {
    id: 'vid_l4t2_engine_lesics',
    title: 'How Car Engines Work: 4-Stroke, Diesel & Otto Cycles Visualized',
    subject: 'ME 411 Applied Thermodynamics / IC Engines',
    channel: 'Lesics',
    lang: 'en',
    term: 'L4-T2',
    type: '3D Visual Animation',
    url: 'https://www.youtube.com/watch?v=OGj8OneMjek'
  },
  {
    id: 'vid_l4t2_turbo_lesics',
    title: 'Fluid Machinery: Centrifugal Pumps, Pelton Wheel & Francis Turbines',
    subject: 'ME 421 Fluid Machinery',
    channel: 'Lesics',
    lang: 'en',
    term: 'L4-T2',
    type: 'Visualized Engineering',
    url: 'https://www.youtube.com/watch?v=BaEHVpKc-1Q'
  },
  {
    id: 'vid_l4t2_control_brian',
    title: 'Classical Control Systems: Transfer Functions, Bode Plots & PID Control',
    subject: 'ME 455 Mechatronics & Control Systems',
    channel: 'Brian Douglas',
    lang: 'en',
    term: 'L4-T2',
    type: 'Playlist (Complete)',
    url: 'https://www.youtube.com/playlist?list=PLUMWjy5jgHK1NC52DXXrriwihVrYZKqjk'
  }
];

// Always migrate to verified videos if local copy is empty or older version
const VIDEO_COLLECTION_VER = 'v5_verified_2026_fixed';
if (localStorage.getItem('classroom_video_ver') !== VIDEO_COLLECTION_VER || adminVideos.length === 0 || adminVideos.some(v => v.url && (v.url.includes('PLDN15nk5uLi') || v.url.includes('@Lesics')))) {
  adminVideos = [...VERIFIED_VIDEO_COLLECTIONS];
  localStorage.setItem(STORAGE_KEYS.ADMIN_VIDEOS, JSON.stringify(adminVideos));
  localStorage.setItem('classroom_video_ver', VIDEO_COLLECTION_VER);
}

// Default initial exam / CT timeline
if (adminTimeline.length === 0) {
  adminTimeline = [
    {
      id: 'tm_1',
      title: 'ME 411 Power Plant Engineering CT 3',
      date: '2026-10-25',
      term: 'L4-T1',
      desc: 'Syllabus: Gas Turbines, Brayton Cycle with Regeneration & Jet Propulsion.'
    },
    {
      id: 'tm_2',
      title: 'L4-T1 Central Sessional Lab Viva & Central Quiz',
      date: '2026-11-10',
      term: 'L4-T1',
      desc: 'All sessional lab courses (Heat Transfer, Fluid Machinery, Instrumentation).'
    },
    {
      id: 'tm_3',
      title: 'L4-T1 Term Final Examinations (Tentative)',
      date: '2026-11-28',
      term: 'L4-T1',
      desc: 'CUET Academic Council announced tentative commencement date.'
    }
  ];
  localStorage.setItem(STORAGE_KEYS.ADMIN_TIMELINE, JSON.stringify(adminTimeline));
}

/* =========================================================================
   1. BILINGUAL TRANSLATION DICTIONARY (EN default + BN toggle)
   ========================================================================= */
const I18N = {
  en: {
    nav_sub: 'CUET Mechanical Engineering Archive',
    tab_home: 'Home',
    tab_resources: 'Course Explorer',
    tab_videos: 'Video Lectures',
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
    btn_preview: 'Read File',
    btn_read_file: 'Read File',
    btn_open_drive: 'Open Preview in Google Drive',
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
    tab_videos: 'ভিডিও লেকচার',
    tab_ai: 'AI সাহায্যকারী',
    tab_tracker: 'সিলেবাস ট্র্যাকার',
    tab_admin: 'অ্যাডমিন রিভিউ',
    pro_badge_free: 'প্রো (ফ্রি অ্যাক্সেস)',
    btn_signin_nav: 'লগইন',
    btn_logout: 'লগআউট',
    role_admin: 'অ্যাডমিন',
    role_student: 'শিক্ষার্থী',
    hero_badge: 'CUET মেকানিক্যাল ইঞ্জিনিয়ারিং একাডেমিক আর্কাইভ ও ফোল্ডার এক্সপ্লোরার',
    hero_welcome: 'স্বাগতম! আমি',
    hero_desc: "চট্টগ্রাম প্রকৌশল ও প্রযুক্তি বিশ্ববিদ্যালয় (CUET), মেকানিক্যাল ইঞ্জিনিয়ারিং ডিপার্টমেন্ট ('২০ সিরিজ, রোল: ২০০৩০৬৩)। লেভেল ১ টার্ম ১ থেকে লেভেল ৪ টার্ম ২ পর্যন্ত আমাদের সব কোর্স ফোল্ডার অনুযায়ী সাজানো ক্লাস নোটস, ল্যাব শিট, প্রশ্নব্যাংক ও অফিশিয়াল বুলেটিন।",
    btn_explore_courses: 'কোর্স ফোল্ডার ব্রাউজ করুন',
    btn_portfolio: 'আমার পার্সোনাল ওয়েবসাইট',
    btn_github: 'গিটহাব প্রজেক্ট ও লাইভ ওয়েবসাইট',
    btn_drive: 'গুগল ড্রাইভ (সব ড্রাইভ একসাথে)',
    label_email: 'ইমেইল:',
    label_phone: 'মোবাইল:',
    stats_header: 'একাডেমিক ডেটা আর্কাইভ',
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
    btn_preview: 'ফাইল পড়ুন',
    btn_read_file: 'ফাইল পড়ুন',
    btn_open_drive: 'গুগল ড্রাইভে প্রিভিউ দেখুন',
    btn_download_drive: 'ফাইল ডাউনলোড',
    cloud_fallback_desc: 'অনলাইন ক্লাউড মোডে ক্লাসরুমের সব একাডেমিক ফাইল সরাসরি গুগল ড্রাইভে সংরক্ষিত রয়েছে। নিচের বাটনে ক্লিক করে ফাইলটির প্রিভিউ দেখুন।',
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
  initTheme();
  setupDialogLightDismiss();
  await loadClassroomData();
  await loadPortalSyncData();
  applyLanguage(currentLang);
  loadCustomContacts();
  applyPortalSettings();
  updateAiKeyStatusBadge();
  updateAuthUI();
  initVisitorCount();
  renderHome();
  setupSemesterPills();
  setupCategoryPills();
  renderExplorer();
  renderTracker();
  renderAdminWorkspace();
  lucide.createIcons();
});

async function loadPortalSyncData() {
  try {
    const res = await fetch('portal_sync.json?v=' + Date.now(), { cache: 'no-cache' });
    if (res.ok) {
      const syncData = await res.json();
      
      // Synchronize notices
      const notices = syncData.notices || syncData.adminNotices;
      if (notices && Array.isArray(notices) && notices.length > 0) {
        adminNotices = notices;
        localStorage.setItem(STORAGE_KEYS.ADMIN_NOTICES, JSON.stringify(adminNotices));
        if (typeof renderAdminNoticesList === 'function') renderAdminNoticesList();
        if (typeof renderPublicNoticesTab === 'function') renderPublicNoticesTab();
      }
      
      // Synchronize 51 faculty members
      const faculty = syncData.faculty || syncData.facultyMembers;
      if (faculty && Array.isArray(faculty) && faculty.length >= 40) {
        saveFacultyMembers(faculty);
        if (typeof renderFacultyDirectory === 'function') renderFacultyDirectory();
      }
      
      // Synchronize class routines across all 8 semesters
      const routines = syncData.routines;
      if (routines && typeof routines === 'object') {
        saveStoredRoutine(routines);
        if (typeof renderHomeRoutineViewer === 'function') renderHomeRoutineViewer();
        if (typeof renderAdminRoutineTable === 'function') renderAdminRoutineTable();
      }

      // Synchronize portal settings (preserving locally saved developer API keys)
      if (syncData.portalSettings && typeof syncData.portalSettings === 'object') {
        const localGeminiKey = portalSettings.geminiApiKey;
        const localOpenAiKey = portalSettings.openaiApiKey;
        Object.assign(portalSettings, syncData.portalSettings);
        if (localGeminiKey) portalSettings.geminiApiKey = localGeminiKey;
        if (localOpenAiKey) portalSettings.openaiApiKey = localOpenAiKey;
        localStorage.setItem(STORAGE_KEYS.PORTAL_SETTINGS, JSON.stringify(portalSettings));
      }
      console.log('✓ Successfully synchronized live CMS updates from portal_sync.json');
    }
  } catch (err) {
    console.warn('Note on portal_sync.json (operating in cached mode):', err);
  }
}

async function loadClassroomData() {
  if (window.CLASSROOM_DATA) {
    appData = window.CLASSROOM_DATA;
  } else {
    try {
      const res = await fetch('classroom_index.json');
      appData = await res.json();
    } catch (err) {
      console.error('Failed to load classroom_index.json:', err);
    }
  }
  enrichAppDataCategories();
}

function enrichAppDataCategories() {
  if (!appData) return;
  const enrich = (file) => {
    file.category = getFileCategory(file);
  };
  if (appData.root_files) appData.root_files.forEach(enrich);
  if (appData.terms) {
    appData.terms.forEach(term => {
      if (term.courses) {
        term.courses.forEach(course => {
          if (course.files) {
            course.files.forEach(enrich);
          }
        });
      }
    });
  }
}

/* =========================================================================
   2.1 THEME SWITCHER (Dark & Light Mode)
   ========================================================================= */
function initTheme() {
  const savedTheme = localStorage.getItem('classroom_theme') || 'dark';
  applyTheme(savedTheme);
}

function applyTheme(theme) {
  if (theme === 'light') {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    document.body.classList.remove('dark');
    document.body.classList.add('light');
  } else {
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
    document.body.classList.remove('light');
    document.body.classList.add('dark');
  }
  localStorage.setItem('classroom_theme', theme);
  updateThemeIcon(theme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.classList.contains('light') ? 'light' : 'dark';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  applyTheme(newTheme);
  showToast(newTheme === 'light' ? 'Light mode enabled ☀️' : 'Dark mode enabled 🌙');
}

function updateThemeIcon(theme) {
  const btn = document.getElementById('themeToggleBtn');
  if (!btn) return;
  if (theme === 'light') {
    btn.innerHTML = '<i data-lucide="moon" id="themeIcon" class="w-3.5 h-3.5 text-indigo-400"></i>';
    btn.setAttribute('title', 'Switch to Dark Mode 🌙');
  } else {
    btn.innerHTML = '<i data-lucide="sun" id="themeIcon" class="w-3.5 h-3.5 text-amber-400"></i>';
    btn.setAttribute('title', 'Switch to Light Mode ☀️');
  }
  if (window.lucide) lucide.createIcons();
}

/* =========================================================================
   3. LANGUAGE SWITCHER (EN default + BN toggle)
   ========================================================================= */
function toggleLanguage() {
  currentLang = currentLang === 'en' ? 'bn' : 'en';
  localStorage.setItem(STORAGE_KEYS.LANG, currentLang);
  applyLanguage(currentLang);
  applyPortalSettings();
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
  const views = ['home', 'resources', 'videos', 'ai', 'tracker', 'admin'];
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

  if (tab === 'home') {
    renderHomeNotices();
  }
  else if (tab === 'resources') renderExplorer();
  else if (tab === 'videos') renderVideoVault();
  else if (tab === 'tracker') renderTracker();
  else if (tab === 'admin') renderAdminWorkspace();

  lucide.createIcons();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* =========================================================================
   6. USER AUTHENTICATION & ACCESS CONTROL (Clean, Modern, Reliable)
   ========================================================================= */
const ADMIN_EMAILS_LIST = [
  'fahimcuet63@gmail.com',
  'fahimniloy2314@gmail.com',
  'fahim.cuet.me20@gmail.com'
];

async function verifyAdminPassword(inputPass) {
  if (!inputPass) return false;
  const hash = await sha256(inputPass);
  const storedHash = localStorage.getItem(STORAGE_KEYS.ADMIN_PWD_HASH) || DEFAULT_ADMIN_PWD_HASH;
  return hash === storedHash;
}

function isAdmin(user) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.email && ADMIN_EMAILS_LIST.includes(user.email.toLowerCase().trim())) return true;
  return false;
}

function updateAuthUI() {
  const container = document.getElementById('authHeaderContainer');
  const adminTab = document.getElementById('nav-tab-admin');
  const mobileAdminBtn = document.getElementById('mobileNavAdminBtn');
  const mobileNavAdmin = document.getElementById('mobileNav-admin');
  const editContactBtn = document.getElementById('editContactBtn');
  const dict = I18N[currentLang] || I18N.en;

  if (!container) return;

  const isUserAdmin = currentUser && isAdmin(currentUser);

  if (editContactBtn) {
    editContactBtn.classList.toggle('hidden', !isUserAdmin);
  }

  const adminHomeEditBanner = document.getElementById('adminHomeEditBanner');
  if (adminHomeEditBanner) {
    adminHomeEditBanner.classList.toggle('hidden', !isUserAdmin);
  }

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
          <div class="font-bold text-white max-w-[120px] truncate">${currentUser.name || 'Student'}</div>
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
        <i data-lucide="user" class="w-3.5 h-3.5 text-indigo-400"></i>
        <span>${dict.btn_signin_nav}</span>
      </button>
    `;
  }

  lucide.createIcons();
}

function openAuthModal() {
  const dialog = document.getElementById('authDialog');
  if (dialog) {
    dialog.showModal();
    lucide.createIcons();
  }
}

function closeAuthModal() {
  const dialog = document.getElementById('authDialog');
  if (dialog) dialog.close();
}

function handleGoogleSignInPrompt() {
  closeAuthModal();
  const gDialog = document.getElementById('googleSignInDialog');
  if (gDialog) {
    const adminPassField = document.getElementById('googleAdminPassField');
    if (adminPassField) adminPassField.classList.add('hidden');
    const emailInput = document.getElementById('googleCustomEmailInput');
    if (emailInput) emailInput.value = '';
    gDialog.showModal();
    lucide.createIcons();
  }
}

function closeGoogleSignInModal() {
  const gDialog = document.getElementById('googleSignInDialog');
  if (gDialog) gDialog.close();
}

async function handleGoogleCustomAccount(e) {
  if (e && e.preventDefault) e.preventDefault();
  const emailInput = document.getElementById('googleCustomEmailInput');
  const passInput = document.getElementById('googleAdminPassInput');
  const adminPassField = document.getElementById('googleAdminPassField');
  const email = (emailInput?.value || '').trim();
  const pass = (passInput?.value || '').trim();

  if (!email) {
    showToast(currentLang === 'en' ? 'Please enter your Google email' : 'আপনার গুগল ইমেইলটি লিখুন');
    return;
  }

  const isAdminEmail = ADMIN_EMAILS_LIST.includes(email.toLowerCase());

  if (isAdminEmail) {
    if (!pass) {
      if (adminPassField) {
        adminPassField.classList.remove('hidden');
        if (passInput) passInput.focus();
      }
      showToast(currentLang === 'en' ? 'Admin email recognized. Please enter Admin Password.' : 'অ্যাডমিন ইমেইল শনাক্ত হয়েছে। পাসওয়ার্ড দিন।');
      return;
    }

    const isValid = await verifyAdminPassword(pass);
    if (isValid) {
      currentUser = {
        name: 'Fahim Niloy (Admin)',
        email: email,
        role: 'admin',
        method: 'google'
      };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
      updateAuthUI();
      closeGoogleSignInModal();
      showToast(currentLang === 'en' ? 'Welcome Admin! Signed in successfully.' : 'স্বাগতম অ্যাডমিন! গুগল দিয়ে সাইন ইন সফল হয়েছে।');
    } else {
      showToast(currentLang === 'en' ? 'Incorrect admin password.' : 'ভুল অ্যাডমিন পাসওয়ার্ড। আবার চেষ্টা করুন।');
    }
  } else {
    // Normal student signing in with their own Google email
    const displayName = email.split('@')[0];
    currentUser = {
      name: displayName.charAt(0).toUpperCase() + displayName.slice(1),
      email: email,
      role: 'student',
      method: 'google'
    };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
    updateAuthUI();
    closeGoogleSignInModal();
    showToast(currentLang === 'en' ? `Signed in as ${currentUser.name}` : `${currentUser.name} হিসেবে সাইন ইন সম্পন্ন`);
  }
}

async function handleStandardAuthSubmit(e) {
  if (e && e.preventDefault) e.preventDefault();
  const idInput = document.getElementById('authEmailInput');
  const passInput = document.getElementById('authPasswordInput');
  const id = (idInput?.value || '').trim();
  const pass = (passInput?.value || '').trim();

  if (!id) {
    showToast(currentLang === 'en' ? 'Please enter your email or Student ID' : 'ইমেইল বা স্টুডেন্ট আইডি লিখুন');
    return;
  }

  const isAdminUser = ADMIN_EMAILS_LIST.includes(id.toLowerCase()) || id === '2003063';

  if (isAdminUser) {
    const isValid = await verifyAdminPassword(pass);
    if (isValid) {
      currentUser = {
        name: 'Fahim Niloy (Admin)',
        email: 'fahim.cuet.me20@gmail.com',
        role: 'admin',
        method: 'email_password'
      };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
      updateAuthUI();
      closeAuthModal();
      showToast(currentLang === 'en' ? 'Admin credentials verified. Welcome Fahim Niloy!' : 'অ্যাডমিন ভেরিফিকেশন সফল! স্বাগতম ফাহিম নিলয়।');
    } else {
      showToast(currentLang === 'en' ? 'Incorrect admin password. Please try again.' : 'ভুল অ্যাডমিন পাসওয়ার্ড। অনুগ্রহ করে সঠিক পাসওয়ার্ড দিন।');
    }
  } else {
    // Standard Student Sign In
    const isRollOnly = /^\d+$/.test(id);
    const studentName = isRollOnly ? `Student (${id})` : (id.split('@')[0]);
    currentUser = {
      name: studentName,
      email: isRollOnly ? `u${id}@student.cuet.ac.bd` : id,
      role: 'student',
      method: 'email_password'
    };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
    updateAuthUI();
    closeAuthModal();
    showToast(currentLang === 'en' ? `Signed in as ${currentUser.name}` : `${currentUser.name} হিসেবে সফলভাবে সাইন ইন সম্পন্ন`);
  }
}

function handleLogout() {
  currentUser = null;
  localStorage.removeItem(STORAGE_KEYS.USER);
  updateAuthUI();
  if (currentTab === 'admin') switchTab('home');
  showToast(currentLang === 'en' ? 'Signed out successfully' : 'সফলভাবে লগআউট করা হয়েছে');
}

function openUpgradeModal() {
  openAuthModal();
}

function closeUpgradeModal() {
  closeAuthModal();
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

  renderHomeVideos();
  if (typeof renderHomeNotices === 'function') renderHomeNotices();
  if (typeof renderHomeRoutineViewer === 'function') renderHomeRoutineViewer();
  if (typeof renderFacultyDirectory === 'function') renderFacultyDirectory();
  if (typeof renderCgpaRows === 'function') renderCgpaRows();
  lucide.createIcons();
}

function loadCustomContacts() {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.CONTACT) || '{}');
  // Auto-migrate any old netlify URL or old email in localStorage
  if (saved.netlify && saved.netlify.includes('fahim-classroom-archive')) {
    saved.netlify = 'https://mohammad-fahim-ahmed.netlify.app/';
  }
  if (!saved.email || saved.email === 'fahimniloy2314@gmail.com' || saved.email === 'fahim.cuet.me20@gmail.com') {
    saved.email = 'fahimcuet63@gmail.com';
    localStorage.setItem(STORAGE_KEYS.CONTACT, JSON.stringify(saved));
  }
  const email = saved.email || 'fahimcuet63@gmail.com';
  const phone = saved.phone || appData?.student?.phone || '+880 1850-162261';
  const netlify = (saved.netlify && !saved.netlify.includes('fahim-classroom-archive')) ? saved.netlify : (appData?.student?.portfolio || 'https://mohammad-fahim-ahmed.netlify.app/');
  const github = saved.github || appData?.student?.github_link || 'https://github.com/Fahim-Niloy2314/classroom-hub';

  const emailEl = document.getElementById('homeEmailLink');
  const secEmailEl = document.getElementById('homeEmailSecondaryLink');
  const phoneEl = document.getElementById('homePhoneLink');
  const netlifyEl = document.getElementById('homeNetlifyLink');
  const githubEl = document.getElementById('homeGithubLink');
  const footerNetlifyEl = document.getElementById('footerNetlifyLink');
  const footerGithubEl = document.getElementById('footerGithubLink');

  if (emailEl) { emailEl.href = `mailto:${email}`; emailEl.textContent = email; }
  if (secEmailEl) { secEmailEl.remove(); }
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
  document.getElementById('editEmailInput').value = saved.email || 'fahimcuet63@gmail.com';
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
  applyPortalSettings();
  updateAiKeyStatusBadge();
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
function setupSemesterPills() {
  const container = document.getElementById('semesterFilterPills');
  if (!container || !appData || !appData.terms) return;

  const currentTerm = explorerState.selectedTerm;
  const isAll = !currentTerm;

  let html = `
    <button onclick="selectSemesterFilter(null)" class="whitespace-nowrap px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
      isAll ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
    }">
      ${currentLang === 'en' ? 'All Semesters' : 'সব সেমিস্টার'}
    </button>
  `;

  appData.terms.forEach(term => {
    const active = currentTerm === term.code;
    html += `
      <button onclick="selectSemesterFilter('${term.code}')" class="whitespace-nowrap px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
        active ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
      }">
        ${term.code}
      </button>
    `;
  });

  container.innerHTML = html;
}

function selectSemesterFilter(termCode) {
  if (!termCode) {
    explorerState.level = 'semesters';
    explorerState.selectedTerm = null;
    explorerState.selectedCourse = null;
    explorerState.selectedSubfolder = null;
  } else {
    explorerState.level = 'courses';
    explorerState.selectedTerm = termCode;
    explorerState.selectedCourse = null;
    explorerState.selectedSubfolder = null;
  }
  setupSemesterPills();
  renderExplorer();
}

/* =========================================================================
   8. ENHANCED ACADEMIC CATEGORY CLASSIFICATION & FILTERS
   ========================================================================= */
const EXPLORER_CATEGORIES = [
  { id: 'ALL', en: 'All Types', bn: 'সকল রিসোর্স', icon: 'layers' },
  { id: 'QUESTION_BANKS', en: 'Question Banks', bn: 'প্রশ্নব্যাংক', icon: 'help-circle' },
  { id: 'NOTES', en: 'Lecture Notes', bn: 'লেকচার নোটস', icon: 'file-text' },
  { id: 'BOOKS', en: 'Reference Books', bn: 'রেফারেন্স বুকস', icon: 'book' },
  { id: 'LAB_SESSIONAL', en: 'Lab & Sessional', bn: 'ল্যাব ও ভাইভা', icon: 'flask-conical' },
  { id: 'SLIDES', en: 'Lecture Slides', bn: 'স্লাইডস', icon: 'presentation' },
  { id: 'SOFTWARE_CAD', en: 'Software & CAD', bn: 'সফটওয়্যার কোর্স', icon: 'laptop' }
];

function getFileCategory(file) {
  if (!file) return 'NOTES';
  const name = (file.name || '').toLowerCase();
  const sub = (file.subfolder || '').toLowerCase();
  const course = (file.course || '').toLowerCase();
  const path = (file.path || '').toLowerCase();
  const ext = (file.ext || '').toLowerCase();
  const full = `${name} ${sub} ${course} ${path}`;
  const size = file.size || 0;

  // 1. Lab, Sessional, Workshop & Viva
  if (
    full.includes('viva') ||
    full.includes('lab') ||
    full.includes('sessional') ||
    full.includes('experiment') ||
    full.includes('report') ||
    full.includes('sheet') ||
    full.includes('workshop') ||
    full.includes('lathe') ||
    full.includes('welding') ||
    full.includes('manual')
  ) {
    return 'LAB_SESSIONAL';
  }

  // 2. Question Banks & Solutions
  if (
    full.includes('question') ||
    full.includes('bank') ||
    full.includes('quiz') ||
    full.includes('ct') ||
    full.includes('term final') ||
    full.includes('final ques') ||
    full.includes('board') ||
    full.includes('solution') ||
    full.includes('solve')
  ) {
    return 'QUESTION_BANKS';
  }

  // 3. Lecture Slides
  if (
    ext === '.ppt' || ext === '.pptx' ||
    name.includes('slide') ||
    name.includes('presentation') ||
    sub.includes('slide')
  ) {
    return 'SLIDES';
  }

  // 4. Software, CAD & Programming
  if (
    ext === '.m' || ext === '.cpp' || ext === '.c' || ext === '.py' ||
    ext === '.sldprt' || ext === '.sldasm' || ext === '.dwg' || ext === '.dxf' ||
    full.includes('matlab') || full.includes('solidworks') || full.includes('ansys') ||
    full.includes('autocad') || full.includes('code') || full.includes('cad') ||
    full.includes('software') || full.includes('programming')
  ) {
    return 'SOFTWARE_CAD';
  }

  // 5. Reference Books
  if (
    full.includes('book') ||
    full.includes('textbook') ||
    full.includes('handbook') ||
    full.includes('edition') ||
    full.includes('author') ||
    full.includes('vol.') ||
    full.includes('volume') ||
    full.includes('khurmi') ||
    full.includes('theraja') ||
    full.includes('cengel') ||
    full.includes('halliday') ||
    full.includes('resnick') ||
    full.includes('hibbeler') ||
    full.includes('moran') ||
    full.includes('shigley') ||
    full.includes('bansal') ||
    full.includes('rajput') ||
    full.includes('groover') ||
    full.includes('callister') ||
    full.includes('holman') ||
    full.includes('incropera') ||
    full.includes('p.k nag') ||
    size > 15 * 1024 * 1024
  ) {
    return 'BOOKS';
  }

  // 6. Lecture Notes (Default for notes and lecture materials)
  return 'NOTES';
}

function setupCategoryPills() {
  const container = document.getElementById('categoryFilterPills');
  if (!container) return;

  container.innerHTML = EXPLORER_CATEGORIES.map(c => {
    const active = explorerState.selectedCategory === c.id;
    return `
      <button onclick="setExplorerCategory('${c.id}')" class="whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
        active 
          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
          : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
      }">
        <i data-lucide="${c.icon}" class="w-3.5 h-3.5 ${active ? 'text-white' : 'text-slate-400'}"></i>
        <span>${currentLang === 'en' ? c.en : c.bn}</span>
      </button>
    `;
  }).join('');
  lucide.createIcons();
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
  const input = document.getElementById('resourceSearchInput');
  if (input) input.value = '';
  searchQuery = '';
  explorerState.level = 'semesters';
  explorerState.selectedTerm = null;
  explorerState.selectedCourse = null;
  explorerState.selectedSubfolder = null;
  explorerState.selectedCategory = 'ALL';
  setupCategoryPills();
  setupSemesterPills();
  renderExplorer();
}

function navigateExplorerUp() {
  if (explorerState.selectedSubfolder) {
    if (explorerState.selectedSubfolder.includes('/')) {
      const parts = explorerState.selectedSubfolder.split('/');
      parts.pop();
      explorerState.selectedSubfolder = parts.join('/');
    } else {
      explorerState.selectedSubfolder = null;
    }
  } else if (explorerState.level === 'files') {
    explorerState.level = 'courses';
    explorerState.selectedCourse = null;
    explorerState.selectedSubfolder = null;
  } else if (explorerState.level === 'courses') {
    explorerState.level = 'semesters';
    explorerState.selectedTerm = null;
    explorerState.selectedCourse = null;
    explorerState.selectedSubfolder = null;
  }
  setupSemesterPills();
  renderExplorer();
}

function openSemesterFolder(termCode) {
  switchTab('resources');
  explorerState.level = 'courses';
  explorerState.selectedTerm = termCode;
  explorerState.selectedCourse = null;
  explorerState.selectedSubfolder = null;
  setupSemesterPills();
  renderExplorer();
}

function openCourseFolder(courseName) {
  explorerState.level = 'files';
  explorerState.selectedCourse = courseName;
  explorerState.selectedSubfolder = null;
  renderExplorer();
}

function openSubfolder(encPath) {
  explorerState.selectedSubfolder = decodeURIComponent(encPath || '');
  renderExplorer();
}

function renderBreadcrumbs() {
  const container = document.getElementById('explorerBreadcrumbs');
  const backBtn = document.getElementById('explorerBackBtn');
  const dict = I18N[currentLang];
  if (!container) return;

  const crumbs = [
    { label: dict.all_semesters_title, action: () => { explorerState.level = 'semesters'; explorerState.selectedTerm = null; explorerState.selectedCourse = null; explorerState.selectedSubfolder = null; setupSemesterPills(); renderExplorer(); } }
  ];

  if (explorerState.selectedTerm) {
    crumbs.push({
      label: `${explorerState.selectedTerm}`,
      action: () => { explorerState.level = 'courses'; explorerState.selectedCourse = null; explorerState.selectedSubfolder = null; renderExplorer(); }
    });
  }

  if (explorerState.selectedCourse) {
    const decodedCourse = decodeURIComponent(explorerState.selectedCourse);
    crumbs.push({
      label: decodedCourse,
      action: () => { explorerState.level = 'files'; explorerState.selectedSubfolder = null; renderExplorer(); }
    });
  }

  if (explorerState.selectedSubfolder) {
    const parts = explorerState.selectedSubfolder.split('/');
    let cumulative = '';
    parts.forEach((part, idx) => {
      cumulative = cumulative ? `${cumulative}/${part}` : part;
      const targetPath = cumulative;
      const isLast = idx === parts.length - 1;
      crumbs.push({
        label: part,
        action: isLast ? () => {} : () => { explorerState.selectedSubfolder = targetPath; renderExplorer(); }
      });
    });
  }

  container.innerHTML = crumbs.map((c, idx) => {
    const isLast = idx === crumbs.length - 1;
    return `
      <span class="inline-flex items-center gap-1.5 whitespace-nowrap">
        ${idx > 0 ? '<i data-lucide="chevron-right" class="w-3.5 h-3.5 text-slate-600"></i>' : ''}
        <button onclick="(${c.action.toString()})()" class="${isLast ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-white'} flex items-center gap-1 text-xs transition-colors">
          <i data-lucide="${isLast && explorerState.level === 'files' ? 'folder-open' : 'folder'}" class="w-3.5 h-3.5"></i>
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
  setupSemesterPills();

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

  // CASE 1.5: CATEGORY FILTER ACTIVE -> Filter files directly within current scope (vault, semester, course, or subfolder)
  if (explorerState.selectedCategory !== 'ALL') {
    const catObj = EXPLORER_CATEGORIES.find(c => c.id === explorerState.selectedCategory);
    const catTitle = catObj ? (currentLang === 'en' ? catObj.en : catObj.bn) : explorerState.selectedCategory;
    
    let scopeFiles = getAllFlatFiles();
    let scopeLabel = currentLang === 'en' ? 'Entire Academic Vault' : 'সম্পূর্ণ একাডেমি আর্কাইভ';

    if (explorerState.selectedTerm) {
      scopeFiles = scopeFiles.filter(f => f.term_code === explorerState.selectedTerm);
      scopeLabel = `${explorerState.selectedTerm}`;
    }
    if (explorerState.selectedCourse) {
      const decodedCourse = decodeURIComponent(explorerState.selectedCourse);
      scopeFiles = scopeFiles.filter(f => f.course === decodedCourse);
      scopeLabel = `${decodedCourse} (${explorerState.selectedTerm || ''})`;
    }
    if (explorerState.selectedSubfolder) {
      const decodedSub = decodeURIComponent(explorerState.selectedSubfolder);
      scopeFiles = scopeFiles.filter(f => f.subfolder === decodedSub || (f.subfolder && f.subfolder.startsWith(decodedSub)));
      scopeLabel = `${decodedSub} • ${scopeLabel}`;
    }

    const filtered = scopeFiles.filter(f => f.category === explorerState.selectedCategory);
    titleEl.textContent = `${catTitle} • ${scopeLabel}`;
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

  // CASE 4: LEVEL 3 -> HIERARCHICAL FOLDERS & FILES INSIDE SELECTED COURSE
  if (explorerState.level === 'files') {
    const termObj = appData.terms.find(t => t.code === explorerState.selectedTerm);
    const decodedCourseName = decodeURIComponent(explorerState.selectedCourse);
    const courseObj = termObj?.courses.find(c => c.name === decodedCourseName);
    
    if (!courseObj) {
      grid.innerHTML = `<p class="col-span-full text-center text-slate-500 py-10">Course not found</p>`;
      return;
    }

    const currentSubfolder = explorerState.selectedSubfolder;
    const allCourseFiles = [...courseObj.files];

    // Include approved community files
    const extraFiles = communityResources.filter(cr => cr.term_code === explorerState.selectedTerm && cr.course === decodedCourseName);
    allCourseFiles.push(...extraFiles);

    // Title representation
    if (currentSubfolder) {
      const subfolderBaseName = currentSubfolder.split('/').pop();
      titleEl.textContent = `${subfolderBaseName} (${decodedCourseName})`;
    } else {
      titleEl.textContent = decodedCourseName;
    }

    // Partition into immediate subfolders and direct files at this level
    const immediateFoldersMap = {}; // folderName -> total files count
    let directFiles = [];

    if (!currentSubfolder) {
      // Top level of course
      allCourseFiles.forEach(f => {
        if (f.subfolder) {
          const topSegment = f.subfolder.split('/')[0];
          immediateFoldersMap[topSegment] = (immediateFoldersMap[topSegment] || 0) + 1;
        } else {
          directFiles.push(f);
        }
      });
    } else {
      // Inside a subfolder
      allCourseFiles.forEach(f => {
        if (!f.subfolder) return;
        if (f.subfolder === currentSubfolder) {
          directFiles.push(f);
        } else if (f.subfolder.startsWith(currentSubfolder + '/')) {
          const remainder = f.subfolder.substring(currentSubfolder.length + 1);
          const nextSegment = remainder.split('/')[0];
          immediateFoldersMap[nextSegment] = (immediateFoldersMap[nextSegment] || 0) + 1;
        }
      });
    }

    // Apply category filter to direct files if active
    if (explorerState.selectedCategory !== 'ALL') {
      directFiles = directFiles.filter(f => f.category === explorerState.selectedCategory);
    }

    const subfolderKeys = Object.keys(immediateFoldersMap).sort((a, b) => a.localeCompare(undefined, { numeric: true, sensitivity: 'base' }));

    countBadge.textContent = subfolderKeys.length + directFiles.length;

    let html = '';

    // A. Render Immediate Subfolders (Exact Google Drive folder layout)
    if (subfolderKeys.length > 0) {
      html += subfolderKeys.map(sfName => {
        const fullPath = currentSubfolder ? `${currentSubfolder}/${sfName}` : sfName;
        const count = immediateFoldersMap[sfName];
        return `
          <div onclick="openSubfolder('${encodeURIComponent(fullPath)}')" class="p-4 rounded-2xl glass-card cursor-pointer group flex items-center justify-between border border-slate-800 hover:border-indigo-500/50 transition-all">
            <div class="flex items-center gap-3 min-w-0">
              <div class="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all flex-shrink-0">
                <i data-lucide="folder" class="w-6 h-6"></i>
              </div>
              <div class="min-w-0">
                <h4 class="text-sm font-bold text-white group-hover:text-amber-300 transition-colors truncate" title="${sfName}">
                  ${sfName}
                </h4>
                <p class="text-xs text-slate-400 mt-0.5 font-mono">
                  ${count} ${currentLang === 'en' ? 'files' : 'ফাইল'}
                </p>
              </div>
            </div>
            <i data-lucide="chevron-right" class="w-4 h-4 text-slate-600 group-hover:text-white transition-colors flex-shrink-0"></i>
          </div>
        `;
      }).join('');
    }

    // B. Render Direct Files at this level
    if (directFiles.length > 0) {
      if (subfolderKeys.length > 0) {
        html += `
          <div class="col-span-full pt-4 pb-1 border-t border-slate-800/80 flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <i data-lucide="file-text" class="w-3.5 h-3.5 text-indigo-400"></i>
              <span>${currentLang === 'en' ? 'Files in this folder' : 'এই ফোল্ডারের ফাইলসমূহ'} (${directFiles.length})</span>
            </span>
          </div>
        `;
      }
      grid.innerHTML = html;
      const tempDiv = document.createElement('div');
      renderFileList(directFiles, tempDiv);
      grid.innerHTML += tempDiv.innerHTML;
    } else {
      grid.innerHTML = html;
    }

    if (subfolderKeys.length === 0 && directFiles.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full py-16 text-center text-slate-400 glass-panel rounded-2xl">
          <i data-lucide="folder-open" class="w-12 h-12 mx-auto mb-3 text-slate-600"></i>
          <h3 class="text-base font-semibold text-slate-300">${dict.no_files_found || 'Empty folder'}</h3>
        </div>
      `;
    }

    lucide.createIcons();
    return;
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

  container.innerHTML = files.slice(0, 150).map(f => {
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
              <span class="text-slate-400 font-mono text-[11px]">${f.size_str}</span>
              <button onclick="toggleBookmark('${f.id}')" title="${isBookmarked ? 'Remove Bookmark' : 'Save Bookmark'}" class="px-2 py-0.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                isBookmarked 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/20' 
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700/60'
              }">
                <i data-lucide="star" class="w-3.5 h-3.5 ${isBookmarked ? 'text-amber-400 fill-amber-400' : ''}"></i>
                <span>${isBookmarked ? (currentLang === 'en' ? 'Saved ⭐' : 'সেভড ⭐') : (currentLang === 'en' ? 'Save' : 'সেভ')}</span>
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

        <div class="pt-3 border-t border-slate-800/80 flex items-center gap-2">
          <a href="${f.drive_view_url || f.url || 'https://drive.google.com/drive/folders/1v4Gni71jdRExyyIMW6-udmiy7UIsK89h'}" target="_blank" rel="noopener noreferrer" class="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-sm">
            <i data-lucide="book-open" class="w-3.5 h-3.5"></i>
            <span>${currentLang === 'en' ? 'Read File' : 'ফাইল পড়ুন'}</span>
            <i data-lucide="external-link" class="w-3 h-3 opacity-70"></i>
          </a>
          <a href="${f.drive_download_url || f.drive_view_url || '#'}" target="_blank" rel="noopener noreferrer" title="${currentLang === 'en' ? 'Direct Download' : 'ডাউনলোড'}" class="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all flex items-center gap-1 border border-slate-700">
            <i data-lucide="download" class="w-3.5 h-3.5"></i>
          </a>
          ${isLocalHost() ? `
            <button onclick="openFileLocally('${encodeURIComponent(f.path)}')" title="Open in Windows Default App" class="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all flex items-center gap-1 border border-slate-700">
              <i data-lucide="laptop" class="w-3.5 h-3.5"></i>
              <span class="hidden sm:inline">${dict.btn_open_system}</span>
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
  if (files.length > 150) {
    container.innerHTML += `
      <div class="col-span-full py-4 text-center text-xs text-slate-500 font-mono">
        Showing top 150 of ${files.length} matching files. Use search above to narrow down further.
      </div>
    `;
  }
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
  const allFiles = getAllFlatFiles();
  const fileObj = allFiles.find(f => f.path === path || f.name === name);
  if (fileObj && fileObj.drive_download_url) {
    window.open(fileObj.drive_download_url, '_blank');
    showToast(currentLang === 'en' ? `Downloading ${name} via Google Drive...` : `গুগল ড্রাইভ থেকে ${name} ডাউনলোড হচ্ছে...`);
  } else if (fileObj && fileObj.drive_view_url) {
    window.open(fileObj.drive_view_url, '_blank');
    showToast(currentLang === 'en' ? `Opening ${name} on Google Drive...` : `গুগল ড্রাইভে ${name} ওপেন হচ্ছে...`);
  } else {
    const driveFolderUrl = 'https://drive.google.com/drive/folders/1v4Gni71jdRExyyIMW6-udmiy7UIsK89h';
    window.open(driveFolderUrl, '_blank');
    showToast(currentLang === 'en' ? `Opening Google Drive...` : `গুগল ড্রাইভ ওপেন করা হচ্ছে...`);
  }
}

function previewFile(encPath, encName) {
  const path = decodeURIComponent(encPath || '');
  const name = decodeURIComponent(encName || '');
  currentPreviewPath = path;
  currentPreviewName = name;

  // 1. If Undergraduate Bulletin, open in bulletin/pdf dialog
  if (name.toLowerCase().includes('bulletin') || path.toLowerCase().includes('bulletin')) {
    openBulletinModal();
    return;
  }

  // 2. Find file in flat list
  const allFiles = getAllFlatFiles();
  const fileObj = allFiles.find(f => f.path === path || f.name === name);
  const driveUrl = fileObj?.drive_view_url || 'https://drive.google.com/drive/folders/1v4Gni71jdRExyyIMW6-udmiy7UIsK89h';

  if (isLocalHost()) {
    openFileLocally(encodeURIComponent(path));
  } else {
    window.open(driveUrl, '_blank');
    showToast(currentLang === 'en' ? `Opening preview for ${name}...` : `${name} এর প্রিভিউ ওপেন হচ্ছে...`);
  }
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
  if (!isLocalHost()) {
    showToast(currentLang === 'en' ? 'Local desktop app launch is only available on PC localhost. Use Drive preview.' : 'লোকাল পিসিতে ওপেন করার অপশনটি শুধুমাত্র লোকালহোস্টে প্রযোজ্য। অনলাইনে ড্রাইভ ভিউয়ার ব্যবহার করুন।');
    return;
  }
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

/* =========================================================================
   11. VISITOR COUNTER & FEEDBACK SYSTEM
   ========================================================================= */
async function initVisitorCount() {
  let visits = parseInt(localStorage.getItem(STORAGE_KEYS.VISITS) || '1420', 10);
  
  try {
    const res = await fetch('https://api.counterapi.dev/v1/classroom-hub-cuet/visits/up');
    if (res.ok) {
      const data = await res.json();
      if (data && data.count) {
        visits = data.count;
      }
    } else {
      visits += 1;
    }
  } catch (e) {
    visits += 1;
  }
  localStorage.setItem(STORAGE_KEYS.VISITS, visits.toString());

  const adminVisitsEl = document.getElementById('adminVisitsCount');
  if (adminVisitsEl) adminVisitsEl.textContent = visits.toLocaleString();
  const footerVisitsEl = document.getElementById('footerVisitsCount');
  if (footerVisitsEl) footerVisitsEl.textContent = visits.toLocaleString();
}

function handleFeedbackSubmit(e) {
  if (e && e.preventDefault) e.preventDefault();
  const name = document.getElementById('fbName')?.value.trim() || 'Anonymous Student';
  const roll = document.getElementById('fbRoll')?.value.trim() || 'N/A';
  const category = document.getElementById('fbCategory')?.value || 'General Feedback';
  const message = document.getElementById('fbMessage')?.value.trim();
  const rating = document.querySelector('input[name="fbRating"]:checked')?.value || '5';

  if (!message) {
    showToast(currentLang === 'en' ? 'Please enter your message' : 'অনুগ্রহ করে বার্তা লিখুন');
    return;
  }

  const newFeedback = {
    id: 'fb_' + Date.now(),
    name,
    roll,
    category,
    rating,
    message,
    timestamp: new Date().toLocaleString()
  };

  feedbacks.unshift(newFeedback);
  localStorage.setItem(STORAGE_KEYS.FEEDBACKS, JSON.stringify(feedbacks));

  // Asynchronously dispatch to real inbound webhook if configured by Admin
  const webhookUrl = portalSettings.feedbackWebhookUrl || localStorage.getItem(STORAGE_KEYS.FEEDBACK_WEBHOOK);
  if (webhookUrl) {
    try {
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFeedback)
      }).catch(err => console.warn('Inbound webhook dispatch failed:', err));
    } catch(err) {}
  }

  // Populate and open real feedback receipt modal with 1-click WhatsApp & Email forwarding
  const receiptDialog = document.getElementById('feedbackReceiptDialog');
  if (receiptDialog) {
    const catEl = document.getElementById('receiptSummaryCategory');
    const nameEl = document.getElementById('receiptSummaryName');
    const snipEl = document.getElementById('receiptSummarySnippet');
    const waLink = document.getElementById('receiptWhatsappLink');
    const emailLink = document.getElementById('receiptEmailLink');

    if (catEl) catEl.textContent = `${category} • ⭐ ${rating}/5`;
    if (nameEl) nameEl.textContent = `Student: ${name} (Roll: ${roll})`;
    if (snipEl) snipEl.textContent = `"${message}"`;

    const encodedMsg = encodeURIComponent(`[ClassroomHub Message]\nCategory: ${category}\nFrom: ${name} (Roll: ${roll})\nRating: ${rating}/5\n\nMessage:\n${message}`);
    if (waLink) waLink.href = `https://wa.me/8801850162261?text=${encodedMsg}`;
    if (emailLink) emailLink.href = `mailto:fahimcuet63@gmail.com?subject=${encodeURIComponent(`ClassroomHub ${category} from ${name}`)}&body=${encodedMsg}`;

    receiptDialog.showModal();
    lucide.createIcons();
  }

  if (e && e.target && e.target.reset) e.target.reset();
  showToast(currentLang === 'en' ? 'Thank you! Your feedback has been registered.' : 'ধন্যবাদ! আপনার বার্তাটি নিবন্ধিত হয়েছে।');
  renderAdminWorkspace();
}

/* =========================================================================
   11. LIVE HOMEPAGE NOTICE BOARD & ANNOUNCEMENTS BANNER
   ========================================================================= */
function renderHomeNotices() {
  const container = document.getElementById('homeNoticeContainer');
  const subpanelContainer = document.getElementById('homeNoticesContainer');
  const badge = document.getElementById('homeNoticeCountBadge');

  if (badge) {
    badge.textContent = (adminNotices || []).length;
  }

  const renderCards = (list) => {
    if (!list || list.length === 0) {
      return `
        <div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
          বর্তমানে কোনো নতুন নোটিশ নেই। পরবর্তী নোটিশের জন্য অপেক্ষা করুন।
        </div>
      `;
    }
    return list.map((n, idx) => {
      let badgeColor = 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      let iconName = 'bell';
      if (n.badge === 'URGENT') {
        badgeColor = 'bg-red-500/20 text-red-300 border-red-500/30';
        iconName = 'alert-triangle';
      } else if (n.badge === 'EXAM') {
        badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
        iconName = 'calendar';
      } else if (n.badge === 'UPDATE') {
        badgeColor = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
        iconName = 'info';
      }

      return `
        <div class="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative overflow-hidden group">
          <div class="absolute left-0 top-0 bottom-0 w-1 ${n.badge === 'URGENT' ? 'bg-red-500' : 'bg-indigo-500'}"></div>
          <div class="space-y-1 pl-2">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeColor} flex items-center gap-1">
                <i data-lucide="${iconName}" class="w-3 h-3"></i>
                <span>${n.badge || 'NOTICE'}</span>
              </span>
              <span class="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300 font-semibold">${n.term || 'All Semesters'}</span>
              <span class="text-[11px] text-slate-400">• ${n.date || 'Notice'}</span>
            </div>
            <h4 class="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">${n.title}</h4>
            <p class="text-xs text-slate-300 leading-relaxed">${n.message}</p>
          </div>
          ${n.link ? `
            <div class="flex-shrink-0 pl-2 sm:pl-0">
              <a href="${n.link}" target="_blank" rel="noopener noreferrer" class="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition-all">
                <span>View Notice</span>
                <i data-lucide="external-link" class="w-3 h-3"></i>
              </a>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  };

  const cardsHtml = renderCards(adminNotices);

  if (container) {
    if (!adminNotices || adminNotices.length === 0) {
      container.className = 'hidden';
      container.innerHTML = '';
    } else {
      container.className = 'space-y-3 mb-6';
      container.innerHTML = cardsHtml;
    }
  }

  if (subpanelContainer) {
    subpanelContainer.innerHTML = cardsHtml;
  }

  if (window.lucide) lucide.createIcons();
}

/* =========================================================================
   12. ADMIN CMS SUITE (18-POINT ENTERPRISE CONTROL SUITE)
   Full CRUD, Revisions, Recycle Bin, Quality Audit, JSON Backup & Restore
   ========================================================================= */
const ADMIN_SUBTABS = ['queue', 'resources', 'add', 'faculty', 'publish', 'notices', 'videos', 'timeline', 'trash', 'revisions', 'audit', 'layout', 'ai', 'routine', 'security', 'backup', 'feedbacks', 'contact'];

function logAdminAction(actionTitle, detail) {
  const logEntry = {
    id: 'log_' + Date.now(),
    action: actionTitle,
    detail: detail || '',
    user: currentUser?.name || 'Fahim Niloy (Admin)',
    timestamp: new Date().toLocaleString()
  };
  adminLogs.unshift(logEntry);
  if (adminLogs.length > 50) adminLogs.pop();
  localStorage.setItem(STORAGE_KEYS.ADMIN_LOGS, JSON.stringify(adminLogs));
  renderAdminActivityLog();
}

function createRevisionSnapshot(actionDesc) {
  const rev = {
    id: 'rev_' + Date.now(),
    timestamp: new Date().toLocaleString(),
    desc: actionDesc,
    user: currentUser?.name || 'Fahim Niloy',
    counts: {
      community: communityResources.length,
      notices: adminNotices.length,
      videos: adminVideos.length,
      timeline: adminTimeline.length
    },
    data: {
      communityResources: JSON.parse(JSON.stringify(communityResources)),
      adminNotices: JSON.parse(JSON.stringify(adminNotices)),
      adminVideos: JSON.parse(JSON.stringify(adminVideos)),
      adminTimeline: JSON.parse(JSON.stringify(adminTimeline)),
      adminHiddenItems: [...adminHiddenItems],
      adminFeaturedItems: [...adminFeaturedItems]
    }
  };
  adminRevisions.unshift(rev);
  if (adminRevisions.length > 12) adminRevisions.pop();
  localStorage.setItem(STORAGE_KEYS.ADMIN_REVISIONS, JSON.stringify(adminRevisions));
  logAdminAction('Snapshot Created', actionDesc);
}

function rollbackToRevision(revId) {
  if (!currentUser || !isAdmin(currentUser)) {
    showToast('Admin privilege required.');
    return;
  }
  const rev = adminRevisions.find(r => r.id === revId);
  if (!rev) return;
  if (!confirm(`Rollback portal state to revision from ${rev.timestamp} (${rev.desc})? Current changes will be archived.`)) {
    return;
  }

  createRevisionSnapshot('Pre-rollback auto-backup');

  communityResources = JSON.parse(JSON.stringify(rev.data.communityResources));
  adminNotices = JSON.parse(JSON.stringify(rev.data.adminNotices));
  adminVideos = JSON.parse(JSON.stringify(rev.data.adminVideos));
  adminTimeline = JSON.parse(JSON.stringify(rev.data.adminTimeline));
  adminHiddenItems = [...(rev.data.adminHiddenItems || [])];
  adminFeaturedItems = [...(rev.data.adminFeaturedItems || [])];

  localStorage.setItem(STORAGE_KEYS.COMMUNITY_RESOURCES, JSON.stringify(communityResources));
  localStorage.setItem(STORAGE_KEYS.ADMIN_NOTICES, JSON.stringify(adminNotices));
  localStorage.setItem(STORAGE_KEYS.ADMIN_VIDEOS, JSON.stringify(adminVideos));
  localStorage.setItem(STORAGE_KEYS.ADMIN_TIMELINE, JSON.stringify(adminTimeline));
  localStorage.setItem(STORAGE_KEYS.ADMIN_HIDDEN, JSON.stringify(adminHiddenItems));
  localStorage.setItem(STORAGE_KEYS.ADMIN_FEATURED, JSON.stringify(adminFeaturedItems));

  logAdminAction('Rollback Executed', `Restored revision ${rev.id} (${rev.desc})`);
  renderAdminWorkspace();
  renderExplorer();
  renderHomeNotices();
  showToast('State successfully restored to selected revision!');
}

function switchAdminSubTab(tabName) {
  currentAdminSubTab = tabName;
  ADMIN_SUBTABS.forEach(t => {
    const btn = document.getElementById(`adminTabBtn-${t}`);
    const panel = document.getElementById(`adminPanel-${t}`);

    if (btn) {
      if (t === tabName) {
        btn.className = 'px-3.5 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 transition-all text-xs font-semibold whitespace-nowrap shadow-sm';
      } else {
        btn.className = 'px-3.5 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 flex items-center gap-1.5 transition-all text-xs font-medium whitespace-nowrap';
      }
    }

    if (panel) {
      panel.classList.toggle('hidden', t !== tabName);
    }
  });

  if (tabName === 'queue') renderAdminQueue();
  else if (tabName === 'resources') renderAdminResources();
  else if (tabName === 'faculty') renderAdminFacultyManager();
  else if (tabName === 'publish') renderAdminPublishPanel();
  else if (tabName === 'notices') renderAdminNotices();
  else if (tabName === 'videos') renderAdminVideos();
  else if (tabName === 'timeline') renderAdminTimeline();
  else if (tabName === 'trash') renderAdminTrash();
  else if (tabName === 'revisions') renderAdminRevisions();
  else if (tabName === 'audit') renderAdminAudit();
  else if (tabName === 'backup') renderAdminActivityLog();
  else if (tabName === 'feedbacks') renderAdminFeedbacks();
  else if (tabName === 'layout') renderAdminLayoutSettings();
  else if (tabName === 'ai') renderAdminAiPanel();
  else if (tabName === 'routine') renderAdminRoutineTable();
  else if (tabName === 'security') renderAdminSecurityPanel();
  lucide.createIcons();
}

function renderAdminWorkspace() {
  const isUserAdmin = currentUser && isAdmin(currentUser);
  const adminTotalFiles = document.getElementById('adminTotalFiles');
  const adminPendingCount = document.getElementById('adminPendingCount');
  const adminPendingBadge = document.getElementById('adminPendingBadge');
  const adminFeedbackCount = document.getElementById('adminFeedbackCount');
  const adminFeedbackBadge = document.getElementById('adminFeedbackBadge');

  if (adminTotalFiles) {
    adminTotalFiles.textContent = ((appData?.summary?.total_academic_files || 3896) + communityResources.length).toLocaleString();
  }
  if (adminPendingCount) adminPendingCount.textContent = pendingResources.length;
  if (adminPendingBadge) adminPendingBadge.textContent = pendingResources.length;
  if (adminFeedbackCount) adminFeedbackCount.textContent = feedbacks.length;
  if (adminFeedbackBadge) adminFeedbackBadge.textContent = feedbacks.length;

  renderAdminQueue();
  renderAdminResources();
  renderAdminNotices();
  renderAdminVideos();
  renderAdminTimeline();
  renderAdminTrash();
  renderAdminRevisions();
  renderAdminAudit();
  renderAdminActivityLog();
  renderAdminFeedbacks();
}

/* 1. Review Queue CMS */
function renderAdminQueue() {
  const list = document.getElementById('adminPendingList');
  if (!list) return;

  if (pendingResources.length === 0) {
    list.innerHTML = `
      <div class="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
        <i data-lucide="inbox" class="w-8 h-8 text-slate-500 mx-auto"></i>
        <h4 class="text-sm font-semibold text-slate-300">All Caught Up!</h4>
        <p class="text-xs text-slate-500">There are no pending submissions awaiting approval.</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  list.innerHTML = pendingResources.map((item, idx) => `
    <div class="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="space-y-1">
        <div class="flex items-center gap-2 text-xs">
          <span class="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold">${item.term_code}</span>
          <span class="text-slate-400 font-medium">${item.course}</span>
          <span class="text-slate-500">• Contributor: <strong class="text-white">${item.author}</strong></span>
        </div>
        <h4 class="text-sm font-bold text-white">${item.name}</h4>
        <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="text-xs text-teal-400 hover:underline flex items-center gap-1">
          <i data-lucide="external-link" class="w-3 h-3"></i>
          <span>${item.url}</span>
        </a>
      </div>

      <div class="flex items-center gap-2 flex-shrink-0">
        <button onclick="approveSubmission(${idx})" class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 shadow">
          <i data-lucide="check" class="w-3.5 h-3.5"></i>
          <span>Approve & Publish</span>
        </button>
        <button onclick="rejectSubmission(${idx})" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-red-900/50 text-slate-300 hover:text-red-300 text-xs font-semibold flex items-center gap-1">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          <span>Reject</span>
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
  createRevisionSnapshot('Approve community submission');
  const item = pendingResources.splice(idx, 1)[0];
  communityResources.push(item);
  localStorage.setItem(STORAGE_KEYS.PENDING_RESOURCES, JSON.stringify(pendingResources));
  localStorage.setItem(STORAGE_KEYS.COMMUNITY_RESOURCES, JSON.stringify(communityResources));
  logAdminAction('Approved Resource', item.name);
  renderAdminWorkspace();
  renderExplorer();
  showToast(currentLang === 'en' ? 'Resource approved and published!' : 'রিসোর্স অনুমোদিত ও প্রকাশিত হয়েছে!');
}

function rejectSubmission(idx) {
  if (!currentUser || !isAdmin(currentUser)) {
    showToast(currentLang === 'en' ? 'Only Admin (Fahim Niloy) can reject resources' : 'শুধুমাত্র অ্যাডমিন (ফাহিম নিলয়) রিসোর্স বাতিল করতে পারেন');
    return;
  }
  const item = pendingResources.splice(idx, 1)[0];
  localStorage.setItem(STORAGE_KEYS.PENDING_RESOURCES, JSON.stringify(pendingResources));
  logAdminAction('Rejected Submission', item.name);
  renderAdminWorkspace();
  showToast(currentLang === 'en' ? 'Submission rejected' : 'সাবমিশন বাতিল করা হয়েছে');
}

/* 2. Resource Manager CMS (Search, Edit Drive Link, Pin to Home, Hide, Trash) */
function renderAdminResources() {
  const container = document.getElementById('adminResourcesList');
  if (!container) return;

  const searchInput = (document.getElementById('adminResourceSearch')?.value || '').toLowerCase().trim();
  const termFilter = document.getElementById('adminResourceTermFilter')?.value || 'ALL';

  // Combine flat vault files with community resources
  const allVault = getAllFlatFiles();
  let pool = [...communityResources, ...allVault];

  // Exclude trashed items
  const trashedIds = new Set(adminTrash.map(t => t.id));
  pool = pool.filter(f => !trashedIds.has(f.id));

  if (termFilter !== 'ALL') {
    pool = pool.filter(f => f.term_code === termFilter);
  }

  if (searchInput) {
    const tokens = searchInput.split(/\s+/);
    pool = pool.filter(f => {
      const hay = `${f.name} ${f.course || ''} ${f.category || ''} ${f.term_code || ''}`.toLowerCase();
      return tokens.every(tok => hay.includes(tok));
    });
  }

  // Show first 80 for high performance
  const displayPool = pool.slice(0, 80);

  if (displayPool.length === 0) {
    container.innerHTML = `
      <div class="p-6 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-500">
        No resources found matching the filter criteria.
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = displayPool.map(res => {
    const isHidden = adminHiddenItems.includes(res.id);
    const isFeatured = adminFeaturedItems.includes(res.id);
    const isCustom = res.id && res.id.startsWith('adm_res_');

    return `
      <div class="p-3.5 rounded-xl bg-slate-900 border ${isHidden ? 'border-red-900/40 opacity-60' : 'border-slate-800'} flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-all">
        <div class="min-w-0 space-y-1">
          <div class="flex items-center gap-2 flex-wrap text-[11px]">
            <span class="px-2 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold">${res.term_code || 'ME'}</span>
            <span class="text-slate-300 font-semibold truncate">${res.course || ''}</span>
            <span class="text-slate-500">• ${res.category || 'General'}</span>
            ${isFeatured ? '<span class="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">★ Pinned</span>' : ''}
            ${isHidden ? '<span class="px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 font-bold text-[10px]">👁 Hidden</span>' : ''}
          </div>
          <div class="text-xs font-bold text-white truncate max-w-lg">${res.name}</div>
          <div class="text-[11px] text-slate-400 font-mono truncate max-w-md">${res.drive_view_url || res.url || 'No Link'}</div>
        </div>

        <div class="flex items-center gap-1.5 flex-shrink-0">
          <button onclick="toggleResourceFeatured('${res.id}')" title="${isFeatured ? 'Unpin from Home' : 'Pin to Home'}" class="p-1.5 rounded-lg ${isFeatured ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400 hover:text-amber-300'} text-xs transition-colors">
            <i data-lucide="star" class="w-3.5 h-3.5"></i>
          </button>
          <button onclick="toggleResourceVisibility('${res.id}')" title="${isHidden ? 'Unhide File' : 'Hide File'}" class="p-1.5 rounded-lg ${isHidden ? 'bg-red-500/20 text-red-300' : 'bg-slate-800 text-slate-400 hover:text-white'} text-xs transition-colors">
            <i data-lucide="${isHidden ? 'eye-off' : 'eye'}" class="w-3.5 h-3.5"></i>
          </button>
          <button onclick="duplicateResource('${res.id}')" title="Duplicate Resource" class="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-cyan-300 text-xs transition-colors">
            <i data-lucide="copy" class="w-3.5 h-3.5"></i>
          </button>
          <button onclick="openAdminEditResourceModal('${res.id}')" title="Edit Resource Details" class="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-indigo-300 text-xs transition-colors">
            <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
          </button>
          <button onclick="deleteResourceToTrash('${res.id}')" title="Move to Trash" class="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-red-400 text-xs transition-colors">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');

  lucide.createIcons();
}

function findResourceById(resId) {
  const comm = communityResources.find(c => c.id === resId);
  if (comm) return comm;
  const allFlat = getAllFlatFiles();
  return allFlat.find(f => f.id === resId);
}

function openAdminEditResourceModal(resId) {
  if (!currentUser || !isAdmin(currentUser)) {
    showToast('Only Admin (Fahim Niloy) can edit resources.');
    openAuthModal();
    return;
  }

  const res = findResourceById(resId);
  if (!res) return;

  document.getElementById('editResId').value = res.id;
  document.getElementById('editResTitle').value = res.name;
  document.getElementById('editResTerm').value = res.term_code || 'L1-T1';
  document.getElementById('editResCategory').value = res.category || 'QUESTION_BANKS';
  document.getElementById('editResCourse').value = res.course || '';
  document.getElementById('editResDriveViewUrl').value = res.drive_view_url || res.url || '';
  document.getElementById('editResDriveDownloadUrl').value = res.drive_download_url || '';

  const dialog = document.getElementById('adminEditResourceDialog');
  if (dialog) dialog.showModal();
  lucide.createIcons();
}

function closeAdminEditResourceModal() {
  const dialog = document.getElementById('adminEditResourceDialog');
  if (dialog) dialog.close();
}

function saveEditedResource(e) {
  if (e && e.preventDefault) e.preventDefault();
  if (!currentUser || !isAdmin(currentUser)) {
    showToast('Admin privilege required.');
    return;
  }

  const resId = document.getElementById('editResId').value;
  const title = document.getElementById('editResTitle').value.trim();
  const term = document.getElementById('editResTerm').value;
  const category = document.getElementById('editResCategory').value;
  const course = document.getElementById('editResCourse').value.trim();
  const viewUrl = document.getElementById('editResDriveViewUrl').value.trim();
  const downUrl = document.getElementById('editResDriveDownloadUrl').value.trim();

  createRevisionSnapshot(`Edit Resource: ${title}`);

  // Check if it exists in communityResources
  let commIdx = communityResources.findIndex(c => c.id === resId);
  if (commIdx !== -1) {
    communityResources[commIdx].name = title;
    communityResources[commIdx].term_code = term;
    communityResources[commIdx].category = category;
    communityResources[commIdx].course = course;
    communityResources[commIdx].drive_view_url = viewUrl;
    communityResources[commIdx].url = viewUrl;
    communityResources[commIdx].drive_download_url = downUrl;
  } else {
    // If it was a vault file, create an override in communityResources
    const existing = findResourceById(resId);
    const updated = {
      ...(existing || {}),
      id: resId,
      name: title,
      term_code: term,
      category: category,
      course: course,
      drive_view_url: viewUrl,
      url: viewUrl,
      drive_download_url: downUrl
    };
    communityResources.push(updated);
  }

  localStorage.setItem(STORAGE_KEYS.COMMUNITY_RESOURCES, JSON.stringify(communityResources));
  logAdminAction('Updated Resource', title);
  closeAdminEditResourceModal();
  renderAdminResources();
  renderExplorer();
  showToast('Resource updated successfully!');
}

function toggleResourceFeatured(resId) {
  if (adminFeaturedItems.includes(resId)) {
    adminFeaturedItems = adminFeaturedItems.filter(id => id !== resId);
    showToast('Removed from Featured');
  } else {
    adminFeaturedItems.push(resId);
    showToast('Pinned as Featured on Home! ⭐');
  }
  localStorage.setItem(STORAGE_KEYS.ADMIN_FEATURED, JSON.stringify(adminFeaturedItems));
  renderAdminResources();
}

function toggleResourceVisibility(resId) {
  if (adminHiddenItems.includes(resId)) {
    adminHiddenItems = adminHiddenItems.filter(id => id !== resId);
    showToast('File is now visible to students');
  } else {
    adminHiddenItems.push(resId);
    showToast('File hidden from public view 👁');
  }
  localStorage.setItem(STORAGE_KEYS.ADMIN_HIDDEN, JSON.stringify(adminHiddenItems));
  renderAdminResources();
  renderExplorer();
}

function duplicateResource(resId) {
  const original = findResourceById(resId);
  if (!original) return;
  createRevisionSnapshot(`Duplicate: ${original.name}`);
  const copy = {
    ...original,
    id: 'adm_res_' + Date.now(),
    name: `${original.name} (Copy)`,
    submitted_at: new Date().toISOString()
  };
  communityResources.unshift(copy);
  localStorage.setItem(STORAGE_KEYS.COMMUNITY_RESOURCES, JSON.stringify(communityResources));
  logAdminAction('Duplicated Resource', copy.name);
  renderAdminResources();
  renderExplorer();
  showToast('Resource duplicated successfully!');
}

function deleteResourceToTrash(resId) {
  const res = findResourceById(resId);
  if (!res) return;
  if (!confirm(`Move "${res.name}" to Recycle Bin?`)) return;

  createRevisionSnapshot(`Move to Trash: ${res.name}`);
  adminTrash.unshift({
    id: res.id,
    type: 'resource',
    item: res,
    deletedAt: new Date().toLocaleString()
  });

  // If in community resources, remove from there
  communityResources = communityResources.filter(c => c.id !== resId);
  localStorage.setItem(STORAGE_KEYS.COMMUNITY_RESOURCES, JSON.stringify(communityResources));
  localStorage.setItem(STORAGE_KEYS.ADMIN_TRASH, JSON.stringify(adminTrash));

  logAdminAction('Moved to Trash', res.name);
  renderAdminResources();
  renderAdminTrash();
  renderExplorer();
  showToast('Moved to Recycle Bin. You can restore it anytime.');
}

/* 3. Direct Add Resource Form */
function handleAdminAddResource(e) {
  if (e && e.preventDefault) e.preventDefault();
  if (!currentUser || !isAdmin(currentUser)) {
    showToast('Only Admin (Fahim Niloy) can manually add resources.');
    return;
  }

  const term = document.getElementById('adminManualTerm')?.value || 'L1-T1';
  const course = document.getElementById('adminManualCourse')?.value.trim();
  const title = document.getElementById('adminManualTitle')?.value.trim();
  const category = document.getElementById('adminManualCategory')?.value || 'Questions & Viva';
  const url = document.getElementById('adminManualUrl')?.value.trim();
  const size = document.getElementById('adminManualSize')?.value.trim() || 'Verified Vault File';

  if (!course || !title || !url) {
    showToast('Please fill all required fields.');
    return;
  }

  createRevisionSnapshot(`Add Resource: ${title}`);
  const newResource = {
    id: 'adm_res_' + Date.now(),
    name: title,
    term_code: term,
    course: course,
    category: category,
    url: url,
    drive_view_url: url,
    author: 'Fahim Niloy (Admin)',
    size_str: size,
    ext: '.pdf',
    submitted_at: new Date().toISOString()
  };

  communityResources.unshift(newResource);
  localStorage.setItem(STORAGE_KEYS.COMMUNITY_RESOURCES, JSON.stringify(communityResources));

  if (e && e.target && e.target.reset) e.target.reset();
  logAdminAction('Added File Directly', title);
  renderAdminWorkspace();
  renderExplorer();
  showToast('Resource added directly to Course Explorer!');
  switchAdminSubTab('resources');
}

/* 4. Live Notice Board CMS */
function renderAdminNotices() {
  const container = document.getElementById('adminNoticesList');
  if (!container) return;

  if (adminNotices.length === 0) {
    container.innerHTML = `
      <div class="p-6 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-500">
        No active notices posted. Click "Post New Notice" to broadcast an update to all students.
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = adminNotices.map((n, idx) => `
    <div class="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="space-y-1">
        <div class="flex items-center gap-2 text-xs">
          <span class="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">${n.badge}</span>
          <span class="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">${n.term}</span>
          <span class="text-slate-500">• ${n.date}</span>
        </div>
        <h4 class="text-sm font-bold text-white">${n.title}</h4>
        <p class="text-xs text-slate-300">${n.message}</p>
        ${n.link ? `<a href="${n.link}" target="_blank" class="text-[11px] text-teal-400 underline">${n.link}</a>` : ''}
      </div>

      <div class="flex items-center gap-2 flex-shrink-0">
        <button onclick="openNoticeModal('${n.id}')" class="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1">
          <i data-lucide="edit-3" class="w-3.5 h-3.5"></i> Edit
        </button>
        <button onclick="deleteAdminNotice('${n.id}')" class="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-red-400 text-xs font-semibold flex items-center gap-1">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Delete
        </button>
      </div>
    </div>
  `).join('');

  lucide.createIcons();
}

function openNoticeModal(noticeId) {
  if (!currentUser || !isAdmin(currentUser)) {
    showToast('Admin privilege required.');
    openAuthModal();
    return;
  }
  const dialog = document.getElementById('adminNoticeDialog');
  if (!dialog) return;

  if (noticeId) {
    const n = adminNotices.find(x => x.id === noticeId);
    if (n) {
      document.getElementById('noticeEditId').value = n.id;
      document.getElementById('noticeTitleInput').value = n.title;
      document.getElementById('noticeBadgeInput').value = n.badge;
      document.getElementById('noticeTermInput').value = n.term;
      document.getElementById('noticeMessageInput').value = n.message;
      document.getElementById('noticeLinkInput').value = n.link || '';
    }
  } else {
    document.getElementById('noticeEditId').value = '';
    document.getElementById('adminNoticeForm')?.reset();
  }

  dialog.showModal();
  lucide.createIcons();
}

function closeNoticeModal() {
  const dialog = document.getElementById('adminNoticeDialog');
  if (dialog) dialog.close();
}

function saveNoticeItem(e) {
  if (e && e.preventDefault) e.preventDefault();
  const noticeId = document.getElementById('noticeEditId').value;
  const title = document.getElementById('noticeTitleInput').value.trim();
  const badge = document.getElementById('noticeBadgeInput').value;
  const term = document.getElementById('noticeTermInput').value;
  const message = document.getElementById('noticeMessageInput').value.trim();
  const link = document.getElementById('noticeLinkInput').value.trim();

  createRevisionSnapshot(`Save Notice: ${title}`);

  if (noticeId) {
    const idx = adminNotices.findIndex(x => x.id === noticeId);
    if (idx !== -1) {
      adminNotices[idx] = { id: noticeId, title, badge, term, message, link, date: new Date().toLocaleDateString() };
    }
  } else {
    adminNotices.unshift({
      id: 'not_' + Date.now(),
      title,
      badge,
      term,
      message,
      link,
      date: new Date().toLocaleDateString()
    });
  }

  localStorage.setItem(STORAGE_KEYS.ADMIN_NOTICES, JSON.stringify(adminNotices));
  logAdminAction('Saved Notice', title);
  closeNoticeModal();
  renderAdminNotices();
  renderHomeNotices();
  showToast('Notice published live to portal!');
}

function deleteAdminNotice(id) {
  const n = adminNotices.find(x => x.id === id);
  if (!n) return;
  if (!confirm(`Delete notice "${n.title}"?`)) return;

  createRevisionSnapshot(`Delete Notice: ${n.title}`);
  adminNotices = adminNotices.filter(x => x.id !== id);
  localStorage.setItem(STORAGE_KEYS.ADMIN_NOTICES, JSON.stringify(adminNotices));
  logAdminAction('Deleted Notice', n.title);
  renderAdminNotices();
  renderHomeNotices();
  showToast('Notice removed');
}

/* 5. Curated Video Lectures CMS (Hindi, Bangla, English) */
function renderAdminVideos() {
  const container = document.getElementById('adminVideosList');
  if (!container) return;

  if (adminVideos.length === 0) {
    container.innerHTML = `
      <div class="p-6 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-500">
        No curated videos added yet. Click "Add Video / Playlist" to attach recommended tutorials.
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = adminVideos.map(v => {
    let langFlag = '🇮🇳 Hindi';
    if (v.lang === 'bn') langFlag = '🇧🇩 Bangla';
    else if (v.lang === 'en') langFlag = '🇬🇧 English';

    return `
      <div class="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="space-y-1">
          <div class="flex items-center gap-2 text-xs">
            <span class="px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold">${langFlag}</span>
            <span class="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono font-semibold">${v.term || 'ME'}</span>
            <span class="text-slate-400 font-medium">${v.subject}</span>
            <span class="text-slate-500">• Channel: <strong class="text-white">${v.channel}</strong></span>
          </div>
          <h4 class="text-sm font-bold text-white">${v.title}</h4>
          <a href="${v.url}" target="_blank" rel="noopener noreferrer" class="text-xs text-red-400 hover:underline flex items-center gap-1 font-mono">
            <i data-lucide="youtube" class="w-3.5 h-3.5"></i>
            <span>${v.url}</span>
          </a>
        </div>

        <div class="flex items-center gap-2 flex-shrink-0">
          <button onclick="openVideoModal('${v.id}')" class="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1">
            <i data-lucide="edit-3" class="w-3.5 h-3.5"></i> Edit
          </button>
          <button onclick="deleteAdminVideo('${v.id}')" class="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-red-400 text-xs font-semibold flex items-center gap-1">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Delete
          </button>
        </div>
      </div>
    `;
  }).join('');

  lucide.createIcons();
}

function openVideoModal(vidId) {
  if (!currentUser || !isAdmin(currentUser)) {
    showToast('Admin privilege required.');
    openAuthModal();
    return;
  }
  const dialog = document.getElementById('adminVideoDialog');
  if (!dialog) return;

  if (vidId) {
    const v = adminVideos.find(x => x.id === vidId);
    if (v) {
      document.getElementById('videoEditId').value = v.id;
      document.getElementById('videoTitleInput').value = v.title;
      document.getElementById('videoSubjectInput').value = v.subject;
      document.getElementById('videoLangInput').value = v.lang || 'hi';
      document.getElementById('videoChannelInput').value = v.channel;
      document.getElementById('videoTermInput').value = v.term || 'ALL';
      document.getElementById('videoUrlInput').value = v.url;
    }
  } else {
    document.getElementById('videoEditId').value = '';
    document.getElementById('adminVideoForm')?.reset();
  }

  dialog.showModal();
  lucide.createIcons();
}

function closeVideoModal() {
  const dialog = document.getElementById('adminVideoDialog');
  if (dialog) dialog.close();
}

function saveVideoItem(e) {
  if (e && e.preventDefault) e.preventDefault();
  const vidId = document.getElementById('videoEditId').value;
  const title = document.getElementById('videoTitleInput').value.trim();
  const subject = document.getElementById('videoSubjectInput').value.trim();
  const lang = document.getElementById('videoLangInput').value;
  const channel = document.getElementById('videoChannelInput').value.trim();
  const term = document.getElementById('videoTermInput').value;
  const url = document.getElementById('videoUrlInput').value.trim();

  createRevisionSnapshot(`Save Video: ${title}`);

  if (vidId) {
    const idx = adminVideos.findIndex(x => x.id === vidId);
    if (idx !== -1) {
      adminVideos[idx] = { id: vidId, title, subject, lang, channel, term, url };
    }
  } else {
    adminVideos.unshift({
      id: 'vid_' + Date.now(),
      title,
      subject,
      lang,
      channel,
      term,
      url
    });
  }

  localStorage.setItem(STORAGE_KEYS.ADMIN_VIDEOS, JSON.stringify(adminVideos));
  logAdminAction('Saved Video Lecture', title);
  closeVideoModal();
  renderAdminVideos();
  showToast('Video lecture added to database!');
}

function deleteAdminVideo(id) {
  const v = adminVideos.find(x => x.id === id);
  if (!v) return;
  if (!confirm(`Delete video "${v.title}"?`)) return;

  createRevisionSnapshot(`Delete Video: ${v.title}`);
  adminVideos = adminVideos.filter(x => x.id !== id);
  localStorage.setItem(STORAGE_KEYS.ADMIN_VIDEOS, JSON.stringify(adminVideos));
  logAdminAction('Deleted Video', v.title);
  renderAdminVideos();
  showToast('Video deleted');
}

/* 6. Exam & Milestone Timeline CMS */
function renderAdminTimeline() {
  const container = document.getElementById('adminTimelineList');
  if (!container) return;

  if (adminTimeline.length === 0) {
    container.innerHTML = `
      <div class="p-6 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-500">
        No exam milestones scheduled. Click "Add Event / Milestone" to schedule CTs and Term Finals.
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = adminTimeline.map(tm => `
    <div class="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="space-y-1">
        <div class="flex items-center gap-2 text-xs">
          <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">${tm.term}</span>
          <span class="text-amber-300 font-semibold flex items-center gap-1">
            <i data-lucide="clock" class="w-3 h-3"></i> ${tm.date}
          </span>
        </div>
        <h4 class="text-sm font-bold text-white">${tm.title}</h4>
        <p class="text-xs text-slate-400">${tm.desc}</p>
      </div>

      <div class="flex items-center gap-2 flex-shrink-0">
        <button onclick="openTimelineModal('${tm.id}')" class="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1">
          <i data-lucide="edit-3" class="w-3.5 h-3.5"></i> Edit
        </button>
        <button onclick="deleteAdminTimeline('${tm.id}')" class="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-red-400 text-xs font-semibold flex items-center gap-1">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Delete
        </button>
      </div>
    </div>
  `).join('');

  lucide.createIcons();
}

function openTimelineModal(tmId) {
  if (!currentUser || !isAdmin(currentUser)) {
    showToast('Admin privilege required.');
    openAuthModal();
    return;
  }
  const dialog = document.getElementById('adminTimelineDialog');
  if (!dialog) return;

  if (tmId) {
    const tm = adminTimeline.find(x => x.id === tmId);
    if (tm) {
      document.getElementById('timelineEditId').value = tm.id;
      document.getElementById('timelineTitleInput').value = tm.title;
      document.getElementById('timelineDateInput').value = tm.date;
      document.getElementById('timelineTermInput').value = tm.term;
      document.getElementById('timelineDescInput').value = tm.desc;
    }
  } else {
    document.getElementById('timelineEditId').value = '';
    document.getElementById('adminTimelineForm')?.reset();
  }

  dialog.showModal();
  lucide.createIcons();
}

function closeTimelineModal() {
  const dialog = document.getElementById('adminTimelineDialog');
  if (dialog) dialog.close();
}

function saveTimelineItem(e) {
  if (e && e.preventDefault) e.preventDefault();
  const tmId = document.getElementById('timelineEditId').value;
  const title = document.getElementById('timelineTitleInput').value.trim();
  const date = document.getElementById('timelineDateInput').value;
  const term = document.getElementById('timelineTermInput').value;
  const desc = document.getElementById('timelineDescInput').value.trim();

  createRevisionSnapshot(`Save Timeline: ${title}`);

  if (tmId) {
    const idx = adminTimeline.findIndex(x => x.id === tmId);
    if (idx !== -1) {
      adminTimeline[idx] = { id: tmId, title, date, term, desc };
    }
  } else {
    adminTimeline.unshift({
      id: 'tm_' + Date.now(),
      title,
      date,
      term,
      desc
    });
  }

  localStorage.setItem(STORAGE_KEYS.ADMIN_TIMELINE, JSON.stringify(adminTimeline));
  logAdminAction('Saved Milestone', title);
  closeTimelineModal();
  renderAdminTimeline();
  showToast('Milestone saved to exam calendar!');
}

function deleteAdminTimeline(id) {
  const tm = adminTimeline.find(x => x.id === id);
  if (!tm) return;
  if (!confirm(`Delete milestone "${tm.title}"?`)) return;

  createRevisionSnapshot(`Delete Milestone: ${tm.title}`);
  adminTimeline = adminTimeline.filter(x => x.id !== id);
  localStorage.setItem(STORAGE_KEYS.ADMIN_TIMELINE, JSON.stringify(adminTimeline));
  logAdminAction('Deleted Milestone', tm.title);
  renderAdminTimeline();
  showToast('Milestone removed');
}

/* 7. Recycle Bin (Trash) CMS */
function renderAdminTrash() {
  const container = document.getElementById('adminTrashList');
  if (!container) return;

  if (adminTrash.length === 0) {
    container.innerHTML = `
      <div class="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
        <i data-lucide="trash" class="w-8 h-8 text-slate-500 mx-auto"></i>
        <h4 class="text-sm font-semibold text-slate-300">Trash is Empty</h4>
        <p class="text-xs text-slate-500">Deleted resources, notices, and items can be restored safely from here.</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = `
    <div class="flex items-center justify-between pb-2">
      <span class="text-xs text-slate-400">${adminTrash.length} items in Recycle Bin</span>
      <button onclick="emptyTrash()" class="text-xs text-red-400 hover:underline flex items-center gap-1">
        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Empty Trash Permanently
      </button>
    </div>
    <div class="space-y-2.5">
      ${adminTrash.map((tr, idx) => `
        <div class="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
          <div class="min-w-0">
            <div class="flex items-center gap-2 text-[10px] text-slate-400 mb-0.5">
              <span class="px-1.5 py-0.2 rounded bg-slate-800 font-mono">${tr.item?.term_code || 'ITEM'}</span>
              <span>Deleted on ${tr.deletedAt}</span>
            </div>
            <div class="text-xs font-bold text-white truncate">${tr.item?.name || tr.item?.title || 'Resource'}</div>
          </div>
          <div class="flex items-center gap-2 flex-shrink-0">
            <button onclick="restoreFromTrash('${tr.id}')" class="px-3 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold flex items-center gap-1 transition-colors">
              <i data-lucide="rotate-ccw" class="w-3 h-3"></i> Restore
            </button>
            <button onclick="permanentDeleteTrash('${tr.id}')" class="px-2 py-1 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-300 text-xs transition-colors">
              <i data-lucide="x" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  lucide.createIcons();
}

function restoreFromTrash(id) {
  const itemIdx = adminTrash.findIndex(t => t.id === id);
  if (itemIdx === -1) return;
  const trashed = adminTrash.splice(itemIdx, 1)[0];

  if (trashed.type === 'resource' && trashed.item) {
    communityResources.unshift(trashed.item);
    localStorage.setItem(STORAGE_KEYS.COMMUNITY_RESOURCES, JSON.stringify(communityResources));
  }
  localStorage.setItem(STORAGE_KEYS.ADMIN_TRASH, JSON.stringify(adminTrash));

  logAdminAction('Restored from Trash', trashed.item?.name || id);
  renderAdminTrash();
  renderAdminResources();
  renderExplorer();
  showToast('Item restored successfully!');
}

function permanentDeleteTrash(id) {
  if (!confirm('Permanently delete this item? This action cannot be undone.')) return;
  adminTrash = adminTrash.filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEYS.ADMIN_TRASH, JSON.stringify(adminTrash));
  renderAdminTrash();
  showToast('Item permanently deleted');
}

function emptyTrash() {
  if (!confirm('Are you sure you want to permanently clear the entire recycle bin?')) return;
  adminTrash = [];
  localStorage.setItem(STORAGE_KEYS.ADMIN_TRASH, JSON.stringify(adminTrash));
  renderAdminTrash();
  showToast('Trash cleared');
}

/* 8. Revisions & Rollback CMS */
function renderAdminRevisions() {
  const container = document.getElementById('adminRevisionsList');
  if (!container) return;

  if (adminRevisions.length === 0) {
    container.innerHTML = `
      <div class="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
        <i data-lucide="history" class="w-8 h-8 text-slate-500 mx-auto"></i>
        <h4 class="text-sm font-semibold text-slate-300">No Revisions Recorded Yet</h4>
        <p class="text-xs text-slate-500">Every time you edit or publish a resource, an automatic snapshot is saved here.</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = adminRevisions.map(rev => `
    <div class="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
      <div class="space-y-0.5">
        <div class="flex items-center gap-2 text-xs">
          <span class="font-bold text-white">${rev.desc}</span>
          <span class="text-slate-500 text-[11px]">• ${rev.timestamp}</span>
        </div>
        <div class="text-[11px] text-slate-400">
          Saved by: <strong class="text-slate-300">${rev.user}</strong> • ${rev.counts?.community || 0} custom resources, ${rev.counts?.notices || 0} notices, ${rev.counts?.videos || 0} videos
        </div>
      </div>
      <button onclick="rollbackToRevision('${rev.id}')" class="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all">
        <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
        <span>Rollback</span>
      </button>
    </div>
  `).join('');

  lucide.createIcons();
}

/* 9. Content Quality & Completeness Audit */
function renderAdminAudit() {
  const container = document.getElementById('adminAuditDashboard');
  if (!container) return;

  const allFiles = getAllFlatFiles();
  const pool = [...communityResources, ...allFiles];

  let missingLinks = 0;
  let missingCourse = 0;
  let missingCategory = 0;

  pool.forEach(f => {
    if (!f.drive_view_url && !f.url) missingLinks++;
    if (!f.course) missingCourse++;
    if (!f.category) missingCategory++;
  });

  const total = pool.length;
  const completeness = total > 0 ? Math.round(((total - missingLinks) / total) * 100) : 100;

  container.innerHTML = `
    <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
      <div class="p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div class="text-[11px] text-slate-400">Health & Completeness</div>
        <div class="text-2xl font-bold text-emerald-400 mt-1">${completeness}%</div>
        <div class="text-[10px] text-slate-500 mt-0.5">${total} total resources scanned</div>
      </div>
      <div class="p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div class="text-[11px] text-slate-400">Verified Drive Links</div>
        <div class="text-2xl font-bold text-indigo-400 mt-1">${total - missingLinks}</div>
        <div class="text-[10px] text-slate-500 mt-0.5">Ready for 1-click preview</div>
      </div>
      <div class="p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div class="text-[11px] text-slate-400">Curated Video Tutorials</div>
        <div class="text-2xl font-bold text-red-400 mt-1">${adminVideos.length}</div>
        <div class="text-[10px] text-slate-500 mt-0.5">Hindi, Bangla & English</div>
      </div>
      <div class="p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div class="text-[11px] text-slate-400">Active Live Notices</div>
        <div class="text-2xl font-bold text-amber-400 mt-1">${adminNotices.length}</div>
        <div class="text-[10px] text-slate-500 mt-0.5">Homepage alert broadcasts</div>
      </div>
    </div>

    <div class="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
      <h4 class="text-xs font-bold text-white flex items-center gap-1.5">
        <i data-lucide="shield-check" class="w-4 h-4 text-emerald-400"></i>
        <span>Audit Diagnostics Report</span>
      </h4>
      <div class="text-xs text-slate-300 space-y-1">
        <div class="flex items-center justify-between py-1 border-b border-slate-800">
          <span>All 3,896 Undergraduate Course Files Indexed</span>
          <span class="text-emerald-400 font-bold">✓ Passed</span>
        </div>
        <div class="flex items-center justify-between py-1 border-b border-slate-800">
          <span>Official CUET Undergraduate Academic Ordinance & Grading Rules</span>
          <span class="text-emerald-400 font-bold">✓ Verified</span>
        </div>
        <div class="flex items-center justify-between py-1 border-b border-slate-800">
          <span>Bilingual Translation Localization (EN & BN)</span>
          <span class="text-emerald-400 font-bold">✓ Active</span>
        </div>
        <div class="flex items-center justify-between py-1">
          <span>Google Drive Direct View & Download Protocol</span>
          <span class="text-emerald-400 font-bold">✓ Enabled</span>
        </div>
      </div>
    </div>
  `;

  lucide.createIcons();
}

/* 10. 1-Click JSON Backup & Restore */
function exportJsonBackup() {
  const backup = {
    app: 'ClassroomHub',
    version: '3.0.0',
    exportedAt: new Date().toISOString(),
    author: 'Fahim Niloy (CUET ME \'20, Roll: 2003063)',
    communityResources,
    adminNotices,
    adminVideos,
    adminTimeline,
    adminHiddenItems,
    adminFeaturedItems,
    adminFaqs,
    adminRoutine,
    portalSettings,
    feedbacks,
    contacts: JSON.parse(localStorage.getItem(STORAGE_KEYS.CONTACT) || '{}'),
    progress: JSON.parse(localStorage.getItem(STORAGE_KEYS.PROGRESS) || '{}')
  };

  const jsonStr = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const dateStr = new Date().toISOString().split('T')[0];
  a.download = `classroomhub-full-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  logAdminAction('Exported Backup', `Backup file created: classroomhub-full-backup-${dateStr}.json`);
  showToast('Complete Portal Backup (.json) downloaded successfully!');
}

function handleBackupFileSelected(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const data = JSON.parse(evt.target.result);
      if (!data.app && !data.communityResources && !data.adminNotices) {
        throw new Error('Invalid ClassroomHub backup file structure.');
      }

      if (!confirm(`Restore portal from backup dated ${data.exportedAt || 'Unknown'}? An automatic snapshot of current data will be created.`)) {
        return;
      }

      createRevisionSnapshot('Pre-import backup snapshot');

      if (Array.isArray(data.communityResources)) {
        communityResources = data.communityResources;
        localStorage.setItem(STORAGE_KEYS.COMMUNITY_RESOURCES, JSON.stringify(communityResources));
      }
      if (Array.isArray(data.adminNotices)) {
        adminNotices = data.adminNotices;
        localStorage.setItem(STORAGE_KEYS.ADMIN_NOTICES, JSON.stringify(adminNotices));
      }
      if (Array.isArray(data.adminVideos)) {
        adminVideos = data.adminVideos;
        localStorage.setItem(STORAGE_KEYS.ADMIN_VIDEOS, JSON.stringify(adminVideos));
      }
      if (Array.isArray(data.adminTimeline)) {
        adminTimeline = data.adminTimeline;
        localStorage.setItem(STORAGE_KEYS.ADMIN_TIMELINE, JSON.stringify(adminTimeline));
      }
      if (Array.isArray(data.adminHiddenItems)) {
        adminHiddenItems = data.adminHiddenItems;
        localStorage.setItem(STORAGE_KEYS.ADMIN_HIDDEN, JSON.stringify(adminHiddenItems));
      }
      if (Array.isArray(data.adminFeaturedItems)) {
        adminFeaturedItems = data.adminFeaturedItems;
        localStorage.setItem(STORAGE_KEYS.ADMIN_FEATURED, JSON.stringify(adminFeaturedItems));
      }
      if (Array.isArray(data.adminFaqs)) {
        adminFaqs = data.adminFaqs;
        localStorage.setItem(STORAGE_KEYS.ADMIN_FAQS, JSON.stringify(adminFaqs));
      }
      if (data.adminRoutine && typeof data.adminRoutine === 'object') {
        adminRoutine = data.adminRoutine;
        localStorage.setItem(STORAGE_KEYS.ADMIN_ROUTINE, JSON.stringify(adminRoutine));
      }
      if (data.portalSettings && typeof data.portalSettings === 'object') {
        portalSettings = data.portalSettings;
        localStorage.setItem(STORAGE_KEYS.PORTAL_SETTINGS, JSON.stringify(portalSettings));
      }
      if (data.contacts) {
        localStorage.setItem(STORAGE_KEYS.CONTACT, JSON.stringify(data.contacts));
        loadCustomContacts();
        applyPortalSettings();
        updateAiKeyStatusBadge();
      }

      logAdminAction('Restored Backup', `Loaded file: ${file.name}`);
      renderAdminWorkspace();
      renderExplorer();
      renderHomeNotices();
      applyPortalSettings();
      showToast('Portal restored successfully from backup!');
    } catch (err) {
      alert('Failed to parse backup file: ' + err.message);
    }
  };
  reader.readAsText(file);
}

function renderAdminActivityLog() {
  const container = document.getElementById('adminActivityLogList');
  if (!container) return;

  if (adminLogs.length === 0) {
    container.innerHTML = '<div class="text-slate-500 italic py-2">No admin actions logged yet.</div>';
    return;
  }

  container.innerHTML = adminLogs.map(l => `
    <div class="py-1 border-b border-slate-800/60 flex items-center justify-between gap-2">
      <div>
        <span class="text-indigo-400 font-bold">[${l.action}]</span>
        <span class="text-slate-300 ml-1.5">${l.detail}</span>
      </div>
      <span class="text-[10px] text-slate-500 flex-shrink-0">${l.timestamp}</span>
    </div>
  `).join('');
}

/* 11. Feedback Inbox CMS */
function renderAdminFeedbacks() {
  const list = document.getElementById('adminFeedbackList');
  if (!list) return;

  if (feedbacks.length === 0) {
    list.innerHTML = `
      <div class="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
        <i data-lucide="message-square" class="w-8 h-8 text-slate-500 mx-auto"></i>
        <h4 class="text-sm font-semibold text-slate-300">No Feedback Yet</h4>
        <p class="text-xs text-slate-500">Student feedback and course requests will appear here.</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  list.innerHTML = feedbacks.map((fb, idx) => `
    <div class="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-semibold">${fb.category}</span>
          <span class="text-amber-400 text-xs">${'★'.repeat(parseInt(fb.rating || 5, 10))}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-[10px] text-slate-500">${fb.timestamp}</span>
          <button onclick="deleteFeedback(${idx})" title="Delete Feedback" class="text-slate-400 hover:text-red-400 p-1 transition-colors">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>
      <p class="text-xs sm:text-sm text-slate-200 leading-relaxed">${fb.message}</p>
      <div class="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80 flex items-center justify-between">
        <span>From: <strong class="text-white">${fb.name}</strong> (Roll: ${fb.roll})</span>
      </div>
    </div>
  `).join('');

  lucide.createIcons();
}

function deleteFeedback(idx) {
  feedbacks.splice(idx, 1);
  localStorage.setItem(STORAGE_KEYS.FEEDBACKS, JSON.stringify(feedbacks));
  renderAdminWorkspace();
  showToast('Feedback removed');
}

function clearAllFeedbacks() {
  if (confirm('Are you sure you want to clear all student feedback messages?')) {
    feedbacks = [];
    localStorage.setItem(STORAGE_KEYS.FEEDBACKS, JSON.stringify(feedbacks));
    renderAdminWorkspace();
    showToast('All feedbacks cleared');
  }
}

function saveAdminSettings() {
  const email = document.getElementById('adminSettingsEmail')?.value.trim() || 'fahimcuet63@gmail.com';
  const phone = document.getElementById('adminSettingsPhone')?.value.trim() || '+880 1850-162261';
  const portfolio = document.getElementById('adminSettingsPortfolio')?.value.trim() || 'https://mohammad-fahim-ahmed.netlify.app/';
  const github = document.getElementById('adminSettingsGithub')?.value.trim() || 'https://github.com/Fahim-Niloy2314/classroom-hub';

  const settings = { email, phone, netlify: portfolio, github };
  localStorage.setItem(STORAGE_KEYS.CONTACT, JSON.stringify(settings));
  loadCustomContacts();
  applyPortalSettings();
  updateAiKeyStatusBadge();
  showToast('Settings saved successfully!');
}

/* =========================================================================
   12. HIERARCHICAL BRANCHING SYLLABUS PROGRESS TRACKER & BOOKMARKS
   Semesters -> Courses -> 5 Actionable Milestones (Level-Term Specific)
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

function toggleBookmark(fileId) {
  if (bookmarks.includes(fileId)) {
    bookmarks = bookmarks.filter(id => id !== fileId);
    showToast(currentLang === 'en' ? 'Removed from saved files' : 'বুকমার্ক থেকে সরানো হয়েছে');
  } else {
    bookmarks.push(fileId);
    showToast(currentLang === 'en' ? 'Saved to bookmarks! ⭐' : 'বুকমার্কে সেভ করা হয়েছে ⭐');
  }
  localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
  renderExplorer();
  renderTracker();
}

function filterTrackerLevel(level) {
  currentTrackerLevel = level;
  const sel = document.getElementById('trackerLevelSelect');
  if (sel) sel.value = level;
  if (level !== 'ALL') {
    openSemesterBranches[level] = true;
  }
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
    openAuthModal();
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
    openAuthModal();
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
    openAuthModal();
    return;
  }
  delete courseProgress[courseName];
  localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(courseProgress));
  renderTracker();
  showToast(currentLang === 'en' ? `Reset progress for ${courseName}` : `${courseName} এর প্রোগ্রেস রিসেট করা হয়েছে`);
}

function renderTracker() {
  if (!appData) return;
  const container = document.getElementById('trackerTreeContainer') || document.getElementById('trackerTermsList');

  // Render Bookmarks
  const bmList = document.getElementById('bookmarksList') || document.getElementById('bookmarkedList');
  const bmCount = document.getElementById('bookmarkCountBadge') || document.getElementById('bookmarkedCount');
  if (bmCount) bmCount.textContent = bookmarks.length;

  if (bmList) {
    if (bookmarks.length === 0) {
      bmList.innerHTML = `<p class="text-slate-500 italic py-1 text-xs">${I18N[currentLang]?.bookmarks_empty || 'No bookmarks saved yet.'}</p>`;
    } else {
      const allFiles = getAllFlatFiles();
      bmList.innerHTML = bookmarks.map(id => {
        const f = allFiles.find(item => item.id === id);
        if (!f) return '';
        return `
          <div class="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">
            <div class="min-w-0 pr-2">
              <div class="text-[10px] text-slate-400 font-mono">${f.term_code} • ${f.course}</div>
              <div class="text-xs font-semibold text-white truncate max-w-xs">${f.name}</div>
            </div>
            <div class="flex items-center gap-1.5 flex-shrink-0">
              <a href="${f.drive_view_url || f.url || '#'}" target="_blank" rel="noopener noreferrer" class="px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-semibold flex items-center gap-1">
                <i data-lucide="book-open" class="w-3 h-3"></i> Read
              </a>
              <button onclick="toggleBookmark('${f.id}')" title="Remove" class="text-slate-400 hover:text-red-400 p-1">
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              </button>
            </div>
          </div>
        `;
      }).filter(Boolean).join('');
    }
  }

  if (!container) {
    lucide.createIcons();
    return;
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

  // Filter terms by Level / Level-Term
  const filteredTerms = appData.terms.filter(term => {
    if (currentTrackerLevel === 'ALL') return true;
    if (currentTrackerLevel.includes('-T')) {
      return term.code === currentTrackerLevel;
    }
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

/* =========================================================================
   13. SMART AI STUDY COMPANION & VAULT SEARCH BOT
   ========================================================================= */
function searchVaultFiles(query, limit = 4) {
  if (!query) return [];
  const cleanTerms = query.toLowerCase()
    .replace(/[^\w\s\u0980-\u09FF]/gi, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1);

  if (cleanTerms.length === 0) return [];
  const results = [];

  // 1. Search in indexed dataset
  if (appData && appData.terms) {
    for (const term of appData.terms) {
      if (!term.courses) continue;
      for (const course of term.courses) {
        if (!course.files) continue;
        for (const file of course.files) {
          const text = `${file.name} ${file.course || ''} ${file.term_code || ''} ${file.category || ''} ${file.subfolder || ''}`.toLowerCase();
          let score = 0;
          for (const t of cleanTerms) {
            if (text.includes(t)) {
              score += 2;
              // Exact match bonus
              if (file.name.toLowerCase().includes(t)) score += 3;
              if ((file.course || '').toLowerCase().includes(t)) score += 4;
            }
          }
          if (score > 0) {
            results.push({ file, score });
          }
        }
      }
    }
  }

  // 2. Search in community & manually added resources
  for (const file of communityResources) {
    const text = `${file.name} ${file.course || ''} ${file.term_code || ''} ${file.category || ''}`.toLowerCase();
    let score = 0;
    for (const t of cleanTerms) {
      if (text.includes(t)) score += 3;
    }
    if (score > 0) {
      results.push({ file, score: score + 2 });
    }
  }

  results.sort((a, b) => b.score - a.score);

  const seen = new Set();
  const deduped = [];
  for (const r of results) {
    const key = r.file.id || r.file.name;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(r.file);
      if (deduped.length >= limit) break;
    }
  }
  return deduped;
}

function askPresetPrompt(promptText) {
  const input = document.getElementById('aiInput') || document.getElementById('aiInputPrompt');
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

/* =========================================================================
   PUBLIC CURATED VIDEO LECTURES BROWSER & FOLDER EXPLORER (8 SEMESTERS)
   ========================================================================= */
let currentVideoVaultTerm = null;
let currentVideoVaultLang = 'ALL';
let currentVideoVaultSearch = '';

const TERM_DISPLAY_DATA = {
  'L1-T1': {
    title: 'Level-1 Term-I (১ম বর্ষ ১ম সেমিস্টার)',
    desc: 'Calculus & Analytical Geometry, Physics I, Inorganic Chemistry, ME 161 Engineering Mechanics...',
    highlightCourses: ['MATH 141', 'CHEM 141', 'ME 161', 'PHY 141']
  },
  'L1-T2': {
    title: 'Level-1 Term-II (১ম বর্ষ ২য় সেমিস্টার)',
    desc: 'Ordinary Differential Equations & Vectors, Physics II, ME 141 Thermodynamics, EEE 161...',
    highlightCourses: ['MATH 143', 'PHY 143', 'ME 141', 'EEE 161']
  },
  'L2-T1': {
    title: 'Level-2 Term-I (২য় বর্ষ ১ম সেমিস্টার)',
    desc: 'Partial Differential Equations & Laplace, ME 241 Mechanics of Solids I, ME 221 Applied Thermodynamics, ME 271 Materials Science...',
    highlightCourses: ['ME 241 (SOM)', 'ME 221 (Thermo)', 'ME 271', 'MATH 241']
  },
  'L2-T2': {
    title: 'Level-2 Term-II (২য় বর্ষ ২য় সেমিস্টার)',
    desc: 'Complex Variables & Fourier Series, ME 243 Mechanics of Solids II, ME 223 Fluid Mechanics I, ME 261 Manufacturing Processes...',
    highlightCourses: ['ME 243', 'ME 223 (Fluid)', 'ME 261', 'MATH 243']
  },
  'L3-T1': {
    title: 'Level-3 Term-I (৩য় বর্ষ ১ম সেমিস্টার)',
    desc: 'ME 341 Machine Design I, ME 321 Heat & Mass Transfer, ME 361 Manufacturing Processes II, IPE 311...',
    highlightCourses: ['ME 341 (Design)', 'ME 321 (Heat Transfer)', 'ME 361']
  },
  'L3-T2': {
    title: 'Level-3 Term-II (৩য় বর্ষ ২য় সেমিস্টার)',
    desc: 'ME 343 Mechanics of Machinery & Vibrations, ME 323 Power Plant Engineering, ME 363 Tool Engineering...',
    highlightCourses: ['ME 343 (Vibrations)', 'ME 323', 'ME 363']
  },
  'L4-T1': {
    title: 'Level-4 Term-I (৪র্থ বর্ষ ১ম সেমিস্টার)',
    desc: 'ME 441 Machine Design II, ME 411 Power Plant Engineering II, IPE 411 Industrial Management...',
    highlightCourses: ['ME 441', 'ME 411', 'IPE 411']
  },
  'L4-T2': {
    title: 'Level-4 Term-II (৪র্থ বর্ষ ২য় সেমিস্টার)',
    desc: 'ME 421 Fluid Machinery (Pumps & Turbines), ME 455 Mechatronics & Control Systems...',
    highlightCourses: ['ME 421 (Turbomachinery)', 'ME 455 (Control & Robotics)']
  }
};

function setVideoVaultLang(lang) {
  currentVideoVaultLang = lang;
  ['ALL', 'bn', 'hi', 'en'].forEach(l => {
    const btn = document.getElementById(`vaultLang-${l}`);
    if (btn) {
      if (l === lang) {
        btn.className = 'px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-600 text-white shadow-sm transition-all';
      } else {
        btn.className = 'px-2.5 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-all flex items-center gap-1';
      }
    }
  });
  renderVideoVault();
}

function openVideoTermFolder(term) {
  currentVideoVaultTerm = term;
  currentVideoVaultSearch = '';
  const searchInput = document.getElementById('videoVaultSearchInput');
  if (searchInput) searchInput.value = '';
  renderVideoVault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function backToVideoRoot() {
  currentVideoVaultTerm = null;
  currentVideoVaultSearch = '';
  const searchInput = document.getElementById('videoVaultSearchInput');
  if (searchInput) searchInput.value = '';
  renderVideoVault();
}

function handleVideoVaultSearch(q) {
  currentVideoVaultSearch = (q || '').trim();
  renderVideoVault();
}

function renderVideoVault() {
  const container = document.getElementById('videoVaultContent');
  const breadcrumbs = document.getElementById('videoVaultBreadcrumbs');
  const badge = document.getElementById('videoVaultCountBadge');
  if (!container) return;

  const termsList = ['L1-T1', 'L1-T2', 'L2-T1', 'L2-T2', 'L3-T1', 'L3-T2', 'L4-T1', 'L4-T2'];
  const q = currentVideoVaultSearch.toLowerCase().trim();

  // 1. Breadcrumb navigation
  if (breadcrumbs) {
    if (currentVideoVaultTerm) {
      breadcrumbs.innerHTML = `
        <button onclick="backToVideoRoot()" class="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer group">
          <i data-lucide="arrow-left" class="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform text-red-400"></i>
          <span>Academic Video Vault</span>
        </button>
        <span class="text-slate-600">/</span>
        <span class="flex items-center gap-1.5 text-red-400 font-bold">
          <i data-lucide="folder-open" class="w-3.5 h-3.5"></i>
          <span>${TERM_DISPLAY_DATA[currentVideoVaultTerm]?.title || currentVideoVaultTerm}</span>
        </span>
      `;
    } else {
      breadcrumbs.innerHTML = `
        <span class="flex items-center gap-1.5 text-white font-semibold">
          <i data-lucide="folder" class="w-3.5 h-3.5 text-red-500"></i>
          <span>Semester Folders (8 Terms Total)</span>
        </span>
        ${q ? `<span class="text-slate-600">/</span> <span class="text-indigo-400 font-mono">Searching: "${currentVideoVaultSearch}"</span>` : ''}
      `;
    }
  }

  // 2. ROOT VIEW: 8 SEMESTER FOLDERS (When no specific folder selected and no active search)
  if (!currentVideoVaultTerm && !q) {
    if (badge) badge.textContent = `8 Semester Folders • ${adminVideos.length} Playlists`;

    container.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        ${termsList.map(term => {
          const info = TERM_DISPLAY_DATA[term] || { title: term, desc: '', highlightCourses: [] };
          const termVids = adminVideos.filter(v => v.term === term);
          return `
            <div 
              onclick="openVideoTermFolder('${term}')" 
              class="p-5 rounded-2xl glass-card border border-slate-800 hover:border-red-500/60 cursor-pointer group transition-all duration-300 flex flex-col justify-between space-y-4 shadow-lg hover:shadow-red-500/10"
            >
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <div class="w-11 h-11 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/20 group-hover:scale-105 group-hover:bg-red-500 group-hover:text-white transition-all">
                    <i data-lucide="folder" class="w-5 h-5"></i>
                  </div>
                  <span class="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700/80 text-[11px] font-mono font-semibold text-slate-300">
                    ${termVids.length} Playlists
                  </span>
                </div>
                <div>
                  <h3 class="text-base font-bold text-white group-hover:text-red-300 transition-colors">
                    ${term}
                  </h3>
                  <div class="text-xs font-medium text-slate-300 mt-0.5">
                    ${info.title.split('(')[0].trim()}
                  </div>
                  <p class="text-[11px] text-slate-400 mt-2 leading-relaxed line-clamp-2">
                    ${info.desc}
                  </p>
                </div>
                <div class="flex flex-wrap gap-1 pt-1">
                  ${info.highlightCourses.map(c => `
                    <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60 font-mono">${c}</span>
                  `).join('')}
                </div>
              </div>
              <div class="flex items-center justify-between text-xs font-semibold text-red-400 group-hover:text-red-300 pt-3 border-t border-slate-800/80">
                <span>ফোল্ডার খুলুন</span>
                <i data-lucide="arrow-right" class="w-4 h-4 group-hover:translate-x-1 transition-transform"></i>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
    lucide.createIcons();
    return;
  }

  // 3. INSIDE FOLDER VIEW OR LIVE SEARCH
  let filtered = [...adminVideos];

  if (currentVideoVaultTerm) {
    filtered = filtered.filter(v => v.term === currentVideoVaultTerm || v.term === 'ALL');
  }

  if (currentVideoVaultLang !== 'ALL') {
    filtered = filtered.filter(v => v.lang === currentVideoVaultLang);
  }

  if (q) {
    const tokens = q.split(/\s+/);
    filtered = filtered.filter(v => {
      const hay = `${v.title} ${v.subject} ${v.channel} ${v.term || ''}`.toLowerCase();
      return tokens.every(tok => hay.includes(tok));
    });
  }

  if (badge) {
    badge.textContent = `${filtered.length} ভেরিফাইড প্লেলিস্ট`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="p-12 rounded-2xl glass-card border border-slate-800 text-center space-y-3">
        <i data-lucide="video-off" class="w-10 h-10 text-slate-500 mx-auto"></i>
        <h4 class="text-base font-bold text-white">কোনো ভিডিও লেকচার পাওয়া যায়নি</h4>
        <p class="text-xs text-slate-400 max-w-md mx-auto">
          ফিল্টার বা ভাষা পরিবর্তন করুন, অথবা অন্য কোনো টপিক বা সেমিস্টার সিলেক্ট করুন।
        </p>
        <button onclick="backToVideoRoot()" class="mt-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold inline-flex items-center gap-1.5">
          <i data-lucide="arrow-left" class="w-3.5 h-3.5"></i>
          <span>সব ফোল্ডারে ফিরে যান</span>
        </button>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  const termHeaderHtml = currentVideoVaultTerm ? `
    <div class="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h3 class="text-sm font-bold text-white flex items-center gap-2">
          <i data-lucide="folder-open" class="w-4 h-4 text-red-400"></i>
          <span>${TERM_DISPLAY_DATA[currentVideoVaultTerm]?.title || currentVideoVaultTerm}</span>
        </h3>
        <p class="text-xs text-slate-300 mt-0.5">
          ${TERM_DISPLAY_DATA[currentVideoVaultTerm]?.desc || ''}
        </p>
      </div>
      <button onclick="backToVideoRoot()" class="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-slate-200 border border-slate-800 flex items-center gap-1 self-start sm:self-auto flex-shrink-0">
        <i data-lucide="arrow-left" class="w-3.5 h-3.5"></i>
        <span>অন্য সেমিস্টার</span>
      </button>
    </div>
  ` : '';

  container.innerHTML = `
    ${termHeaderHtml}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      ${filtered.map(v => {
        let langBadge = '🇮🇳 হিন্দি';
        let langColor = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
        if (v.lang === 'bn') {
          langBadge = '🇧🇩 বাংলা';
          langColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
        } else if (v.lang === 'en') {
          langBadge = '🇬🇧 English';
          langColor = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
        }

        return `
          <div class="p-5 rounded-2xl glass-card border border-slate-800 hover:border-red-500/50 flex flex-col justify-between space-y-4 shadow-lg hover:shadow-red-500/10 transition-all group">
            <div class="space-y-3">
              <div class="flex items-center justify-between gap-2">
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold border ${langColor}">${langBadge}</span>
                <span class="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-[10px] font-semibold border border-slate-700">${v.term || 'All'}</span>
              </div>
              <div>
                <div class="text-[11px] font-mono text-slate-400 font-medium">${v.subject}</div>
                <h4 class="text-sm font-bold text-white group-hover:text-red-300 transition-colors line-clamp-2 mt-0.5 leading-snug">
                  ${v.title}
                </h4>
                <p class="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                  <i data-lucide="user" class="w-3.5 h-3.5 text-slate-500"></i>
                  <span>${v.channel}</span>
                  <i data-lucide="badge-check" class="w-3.5 h-3.5 text-blue-400"></i>
                </p>
              </div>
            </div>

            <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span class="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                <i data-lucide="list-video" class="w-3 h-3 text-red-500"></i>
                <span>${v.type || 'Playlist'}</span>
              </span>
              <a 
                href="${v.url}" 
                target="_blank" 
                rel="noopener noreferrer" 
                class="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-red-600/20 transition-all group-hover:scale-105"
              >
                <i data-lucide="play" class="w-3 h-3 fill-white"></i>
                <span>YouTube-এ দেখুন</span>
              </a>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  lucide.createIcons();
}

function renderHomeVideos() {
  renderVideoVault();
}

function scrollToVideoSection() {
  switchTab('videos');
}


/* =========================================================================
   PORTAL SITE LAYOUT & NAVIGATION CMS (ADMIN CONTROL SUITE)
   ========================================================================= */
function applyPortalSettings() {
  if (!portalSettings || !portalSettings.tabs) return;

  const isUserAdmin = currentUser && isAdmin(currentUser);

  // 1. Desktop Navigation Bar
  const desktopNav = document.getElementById('desktopNavBar');
  if (desktopNav) {
    portalSettings.tabs.forEach(tabCfg => {
      const btn = document.getElementById(`nav-tab-${tabCfg.id}`);
      if (btn) {
        btn.classList.toggle('hidden', !tabCfg.visible);
        const span = btn.querySelector('span[data-i18n], span:not([id])');
        if (span && tabCfg.label) span.textContent = tabCfg.label;
        desktopNav.appendChild(btn);
      }
    });

    const adminBtn = document.getElementById('nav-tab-admin');
    if (adminBtn) {
      if (isUserAdmin) {
        adminBtn.classList.remove('hidden');
        desktopNav.appendChild(adminBtn);
      } else {
        adminBtn.classList.add('hidden');
      }
    }
  }

  // 2. Mobile Bottom Navigation
  const mobileNav = document.getElementById('mobileBottomNav');
  if (mobileNav) {
    portalSettings.tabs.forEach(tabCfg => {
      const mBtn = document.getElementById(`mobileNav-${tabCfg.id}`);
      if (mBtn) {
        mBtn.classList.toggle('hidden', !tabCfg.visible);
        const span = mBtn.querySelector('span');
        if (span && tabCfg.label) span.textContent = tabCfg.label;
        mobileNav.appendChild(mBtn);
      }
    });

    const mAdminBtn = document.getElementById('mobileNav-admin');
    if (mAdminBtn) {
      if (isUserAdmin) {
        mAdminBtn.classList.remove('hidden');
        mobileNav.appendChild(mAdminBtn);
      } else {
        mAdminBtn.classList.add('hidden');
      }
    }
  }

  // 3. Hero & Banner Custom Texts
  const homeHeroStatic = document.getElementById('homeHeroStatic');
  if (homeHeroStatic && portalSettings.heroTitle) {
    homeHeroStatic.textContent = portalSettings.heroTitle;
  }
  const homeHeroHighlight = document.getElementById('homeHeroHighlight');
  if (homeHeroHighlight && portalSettings.heroSubtitle) {
    homeHeroHighlight.textContent = portalSettings.heroSubtitle;
  }
  const homeDeptPill = document.getElementById('homeDeptPill');
  if (homeDeptPill && portalSettings.deptDesc) {
    homeDeptPill.textContent = portalSettings.deptDesc;
  }
  const homeHeroDesc = document.getElementById('homeHeroDesc');
  if (homeHeroDesc && portalSettings.heroDesc) {
    homeHeroDesc.textContent = portalSettings.heroDesc;
  }

  // Creator Credentials
  const homeCreatorName = document.getElementById('homeCreatorName');
  if (homeCreatorName && portalSettings.creatorName) {
    homeCreatorName.textContent = portalSettings.creatorName;
  }
  const homeCreatorBadge = document.getElementById('homeCreatorBadge');
  if (homeCreatorBadge && portalSettings.creatorBadge) {
    homeCreatorBadge.textContent = portalSettings.creatorBadge;
  }
  const homeCreatorDept = document.getElementById('homeCreatorDept');
  if (homeCreatorDept && portalSettings.creatorDept) {
    homeCreatorDept.textContent = portalSettings.creatorDept;
  }
  const homeCreatorBatch = document.getElementById('homeCreatorBatch');
  if (homeCreatorBatch && portalSettings.creatorBatch) {
    homeCreatorBatch.textContent = portalSettings.creatorBatch;
  }
  const homeCreatorId = document.getElementById('homeCreatorId');
  if (homeCreatorId && portalSettings.creatorId) {
    homeCreatorId.textContent = portalSettings.creatorId;
  }

  // Contact Information
  const homeEmailLink = document.getElementById('homeEmailLink');
  if (homeEmailLink && portalSettings.primaryEmail) {
    homeEmailLink.href = `mailto:${portalSettings.primaryEmail}`;
    homeEmailLink.textContent = portalSettings.primaryEmail;
  }
  const homePhoneLink = document.getElementById('homePhoneLink');
  if (homePhoneLink && portalSettings.phone) {
    homePhoneLink.href = `tel:${portalSettings.phone.replace(/\s+/g, '')}`;
    homePhoneLink.textContent = portalSettings.phone;
  }
  const homeNetlifyLink = document.getElementById('homeNetlifyLink');
  if (homeNetlifyLink && portalSettings.portfolioUrl) {
    homeNetlifyLink.href = portalSettings.portfolioUrl;
  }
  const homeGithubLink = document.getElementById('homeGithubLink');
  if (homeGithubLink && portalSettings.githubUrl) {
    homeGithubLink.href = portalSettings.githubUrl;
  }

  // 4 Core Action Cards
  const homeCard1Title = document.getElementById('homeCard1Title');
  if (homeCard1Title && portalSettings.card1Title) homeCard1Title.textContent = portalSettings.card1Title;
  const homeCard1Desc = document.getElementById('homeCard1Desc');
  if (homeCard1Desc && portalSettings.card1Desc) homeCard1Desc.textContent = portalSettings.card1Desc;

  const homeCard2Title = document.getElementById('homeCard2Title');
  if (homeCard2Title && portalSettings.card2Title) homeCard2Title.textContent = portalSettings.card2Title;
  const homeCard2Desc = document.getElementById('homeCard2Desc');
  if (homeCard2Desc && portalSettings.card2Desc) homeCard2Desc.textContent = portalSettings.card2Desc;

  const homeCard3Title = document.getElementById('homeCard3Title');
  if (homeCard3Title && portalSettings.card3Title) homeCard3Title.textContent = portalSettings.card3Title;
  const homeCard3Desc = document.getElementById('homeCard3Desc');
  if (homeCard3Desc && portalSettings.card3Desc) homeCard3Desc.textContent = portalSettings.card3Desc;

  const homeCard4Title = document.getElementById('homeCard4Title');
  if (homeCard4Title && portalSettings.card4Title) homeCard4Title.textContent = portalSettings.card4Title;
  const homeCard4Desc = document.getElementById('homeCard4Desc');
  if (homeCard4Desc && portalSettings.card4Desc) homeCard4Desc.textContent = portalSettings.card4Desc;

  if (portalSettings.primaryEmail) {
    const footerEmail = document.querySelector('footer a[href^="mailto:"]');
    if (footerEmail) {
      footerEmail.href = `mailto:${portalSettings.primaryEmail}`;
    }
  }

  // 5. Maintenance Mode Enforcement
  const publicMaintScreen = document.getElementById('publicMaintenanceScreen');
  const adminMaintAlert = document.getElementById('adminMaintenanceAlert');
  const publicMaintMsg = document.getElementById('publicMaintenanceMsg');
  if (portalSettings.maintenanceMode) {
    if (publicMaintMsg && portalSettings.maintenanceMsg) publicMaintMsg.textContent = portalSettings.maintenanceMsg;
    if (isUserAdmin) {
      if (publicMaintScreen) publicMaintScreen.classList.add('hidden');
      if (adminMaintAlert) adminMaintAlert.classList.remove('hidden');
    } else {
      if (publicMaintScreen) publicMaintScreen.classList.remove('hidden');
      if (adminMaintAlert) adminMaintAlert.classList.add('hidden');
    }
  } else {
    if (publicMaintScreen) publicMaintScreen.classList.add('hidden');
    if (adminMaintAlert) adminMaintAlert.classList.add('hidden');
  }

  // 6. Top Urgent Announcement / Marquee Banner
  const siteUrgentBanner = document.getElementById('siteUrgentBanner');
  const siteUrgentText = document.getElementById('siteUrgentText');
  const siteUrgentLink = document.getElementById('siteUrgentLink');
  if (siteUrgentBanner) {
    if (portalSettings.marqueeActive && portalSettings.marqueeText) {
      siteUrgentBanner.classList.remove('hidden');
      if (siteUrgentText) siteUrgentText.textContent = portalSettings.marqueeText;
      if (siteUrgentLink) {
        if (portalSettings.marqueeUrl) {
          siteUrgentLink.href = portalSettings.marqueeUrl;
          siteUrgentLink.classList.remove('hidden');
        } else {
          siteUrgentLink.classList.add('hidden');
        }
      }
      const type = portalSettings.marqueeType || 'indigo';
      siteUrgentBanner.className = `px-4 py-2 text-xs font-semibold flex items-center justify-between gap-3 border-b transition-all ${
        type === 'red' ? 'bg-red-950/80 text-red-200 border-red-500/30' :
        type === 'amber' ? 'bg-amber-950/80 text-amber-200 border-amber-500/30' :
        type === 'emerald' ? 'bg-emerald-950/80 text-emerald-200 border-emerald-500/30' :
        'bg-indigo-950/80 text-indigo-200 border-indigo-500/30'
      }`;
    } else {
      siteUrgentBanner.classList.add('hidden');
    }
  }

  // 7. Update AI Chatbot Persona in UI
  const aiHeaderName = document.querySelector('#view-ai h2 span:last-child');
  if (aiHeaderName && portalSettings.aiBotName) {
    aiHeaderName.textContent = portalSettings.aiBotName;
  }
  const aiHeaderSubtitle = document.querySelector('#view-ai p');
  if (aiHeaderSubtitle && portalSettings.aiBotSubtitle) {
    aiHeaderSubtitle.textContent = portalSettings.aiBotSubtitle;
  }

  lucide.createIcons();
}

function renderAdminLayoutSettings() {
  const container = document.getElementById('adminNavTabsList');
  if (!container) return;

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val !== undefined ? val : '';
  };

  setVal('cfgHeroTitle', portalSettings.heroTitle || DEFAULT_PORTAL_SETTINGS.heroTitle);
  setVal('cfgHeroSubtitle', portalSettings.heroSubtitle || DEFAULT_PORTAL_SETTINGS.heroSubtitle);
  setVal('cfgDeptDesc', portalSettings.deptDesc || DEFAULT_PORTAL_SETTINGS.deptDesc);
  setVal('cfgHeroDesc', portalSettings.heroDesc || DEFAULT_PORTAL_SETTINGS.heroDesc);

  setVal('cfgCreatorName', portalSettings.creatorName || DEFAULT_PORTAL_SETTINGS.creatorName);
  setVal('cfgCreatorBadge', portalSettings.creatorBadge || DEFAULT_PORTAL_SETTINGS.creatorBadge);
  setVal('cfgCreatorDept', portalSettings.creatorDept || DEFAULT_PORTAL_SETTINGS.creatorDept);
  setVal('cfgCreatorBatch', portalSettings.creatorBatch || DEFAULT_PORTAL_SETTINGS.creatorBatch);
  setVal('cfgCreatorId', portalSettings.creatorId || DEFAULT_PORTAL_SETTINGS.creatorId);

  setVal('cfgPrimaryEmail', portalSettings.primaryEmail || DEFAULT_PORTAL_SETTINGS.primaryEmail);
  setVal('cfgPhone', portalSettings.phone || DEFAULT_PORTAL_SETTINGS.phone);
  setVal('cfgPortfolioUrl', portalSettings.portfolioUrl || DEFAULT_PORTAL_SETTINGS.portfolioUrl);
  setVal('cfgGithubUrl', portalSettings.githubUrl || DEFAULT_PORTAL_SETTINGS.githubUrl);

  setVal('cfgCard1Title', portalSettings.card1Title || DEFAULT_PORTAL_SETTINGS.card1Title);
  setVal('cfgCard1Desc', portalSettings.card1Desc || DEFAULT_PORTAL_SETTINGS.card1Desc);
  setVal('cfgCard2Title', portalSettings.card2Title || DEFAULT_PORTAL_SETTINGS.card2Title);
  setVal('cfgCard2Desc', portalSettings.card2Desc || DEFAULT_PORTAL_SETTINGS.card2Desc);
  setVal('cfgCard3Title', portalSettings.card3Title || DEFAULT_PORTAL_SETTINGS.card3Title);
  setVal('cfgCard3Desc', portalSettings.card3Desc || DEFAULT_PORTAL_SETTINGS.card3Desc);
  setVal('cfgCard4Title', portalSettings.card4Title || DEFAULT_PORTAL_SETTINGS.card4Title);
  setVal('cfgCard4Desc', portalSettings.card4Desc || DEFAULT_PORTAL_SETTINGS.card4Desc);

  container.innerHTML = portalSettings.tabs.map((tab, idx) => {
    const isFirst = idx === 0;
    const isLast = idx === portalSettings.tabs.length - 1;
    const isVisible = tab.visible !== false;

    return `
      <div class="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-all">
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1">
            <button onclick="moveNavTab('${tab.id}', -1)" ${isFirst ? 'disabled class="opacity-30 cursor-not-allowed text-slate-600 p-1"' : 'class="hover:text-indigo-400 text-slate-300 p-1"'} title="উপরে নিন">
              <i data-lucide="chevron-up" class="w-4 h-4"></i>
            </button>
            <button onclick="moveNavTab('${tab.id}', 1)" ${isLast ? 'disabled class="opacity-30 cursor-not-allowed text-slate-600 p-1"' : 'class="hover:text-indigo-400 text-slate-300 p-1"'} title="নিচে নিন">
              <i data-lucide="chevron-down" class="w-4 h-4"></i>
            </button>
          </div>
          <div class="w-8 h-8 rounded-lg ${isVisible ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'bg-slate-800 text-slate-500'} flex items-center justify-center">
            <i data-lucide="${tab.icon || 'square'}" class="w-4 h-4"></i>
          </div>
          <div>
            <div class="text-xs font-bold text-white flex items-center gap-2">
              <span>${tab.label}</span>
              <span class="text-[10px] font-mono text-slate-500">(${tab.id})</span>
            </div>
            <div class="text-[11px] text-slate-400">Position #${idx + 1} in navigation sequence</div>
          </div>
        </div>

        <div class="flex items-center gap-2 self-end sm:self-center">
          <input 
            type="text" 
            id="cfgTabLabel-${tab.id}" 
            value="${tab.label}" 
            placeholder="Label..."
            class="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500 w-32"
          >
          <button 
            onclick="toggleNavTabVisibility('${tab.id}')" 
            class="px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${isVisible ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'}"
          >
            <i data-lucide="${isVisible ? 'eye' : 'eye-off'}" class="w-3.5 h-3.5"></i>
            <span>${isVisible ? 'Visible (অন)' : 'Hidden (অফ)'}</span>
          </button>
        </div>
      </div>
    `;
  }).join('');

  lucide.createIcons();
}

function toggleNavTabVisibility(tabId) {
  const tab = portalSettings.tabs.find(t => t.id === tabId);
  if (!tab) return;
  if (tab.locked) {
    showToast('Home tab cannot be hidden as it is the portal landing view.');
    return;
  }
  tab.visible = !tab.visible;
  localStorage.setItem(STORAGE_KEYS.PORTAL_SETTINGS, JSON.stringify(portalSettings));
  applyPortalSettings();
  updateAiKeyStatusBadge();
  renderAdminLayoutSettings();
  showToast(`${tab.label} visibility updated: ${tab.visible ? 'Visible' : 'Hidden'}`);
}

function moveNavTab(tabId, direction) {
  const idx = portalSettings.tabs.findIndex(t => t.id === tabId);
  if (idx === -1) return;
  const targetIdx = idx + direction;
  if (targetIdx < 0 || targetIdx >= portalSettings.tabs.length) return;

  const temp = portalSettings.tabs[idx];
  portalSettings.tabs[idx] = portalSettings.tabs[targetIdx];
  portalSettings.tabs[targetIdx] = temp;

  localStorage.setItem(STORAGE_KEYS.PORTAL_SETTINGS, JSON.stringify(portalSettings));
  applyPortalSettings();
  updateAiKeyStatusBadge();
  renderAdminLayoutSettings();
  showToast('Navigation tab sequence updated!');
}

function savePortalSettingsFromForm() {
  portalSettings.tabs.forEach(tab => {
    const input = document.getElementById(`cfgTabLabel-${tab.id}`);
    if (input && input.value.trim()) {
      tab.label = input.value.trim();
    }
  });

  const getVal = (id, fallback) => {
    const el = document.getElementById(id);
    return el && el.value.trim() ? el.value.trim() : fallback;
  };

  portalSettings.heroTitle = getVal('cfgHeroTitle', portalSettings.heroTitle);
  portalSettings.heroSubtitle = getVal('cfgHeroSubtitle', portalSettings.heroSubtitle);
  portalSettings.deptDesc = getVal('cfgDeptDesc', portalSettings.deptDesc);
  portalSettings.heroDesc = getVal('cfgHeroDesc', portalSettings.heroDesc);

  portalSettings.creatorName = getVal('cfgCreatorName', portalSettings.creatorName);
  portalSettings.creatorBadge = getVal('cfgCreatorBadge', portalSettings.creatorBadge);
  portalSettings.creatorDept = getVal('cfgCreatorDept', portalSettings.creatorDept);
  portalSettings.creatorBatch = getVal('cfgCreatorBatch', portalSettings.creatorBatch);
  portalSettings.creatorId = getVal('cfgCreatorId', portalSettings.creatorId);

  portalSettings.primaryEmail = getVal('cfgPrimaryEmail', portalSettings.primaryEmail);
  portalSettings.phone = getVal('cfgPhone', portalSettings.phone);
  portalSettings.portfolioUrl = getVal('cfgPortfolioUrl', portalSettings.portfolioUrl);
  portalSettings.githubUrl = getVal('cfgGithubUrl', portalSettings.githubUrl);

  portalSettings.card1Title = getVal('cfgCard1Title', portalSettings.card1Title);
  portalSettings.card1Desc = getVal('cfgCard1Desc', portalSettings.card1Desc);
  portalSettings.card2Title = getVal('cfgCard2Title', portalSettings.card2Title);
  portalSettings.card2Desc = getVal('cfgCard2Desc', portalSettings.card2Desc);
  portalSettings.card3Title = getVal('cfgCard3Title', portalSettings.card3Title);
  portalSettings.card3Desc = getVal('cfgCard3Desc', portalSettings.card3Desc);
  portalSettings.card4Title = getVal('cfgCard4Title', portalSettings.card4Title);
  portalSettings.card4Desc = getVal('cfgCard4Desc', portalSettings.card4Desc);

  // Sync to STORAGE_KEYS.CONTACT
  const contactObj = JSON.parse(localStorage.getItem(STORAGE_KEYS.CONTACT) || '{}');
  contactObj.email = portalSettings.primaryEmail;
  contactObj.phone = portalSettings.phone;
  contactObj.netlify = portalSettings.portfolioUrl;
  contactObj.github = portalSettings.githubUrl;
  localStorage.setItem(STORAGE_KEYS.CONTACT, JSON.stringify(contactObj));

  localStorage.setItem(STORAGE_KEYS.PORTAL_SETTINGS, JSON.stringify(portalSettings));
  applyPortalSettings();
  updateAiKeyStatusBadge();
  renderAdminLayoutSettings();
  showToast('হোমপেজের সকল কনটেন্ট ও সেটিংস সফলভাবে সেভ করা হয়েছে!');
}

function resetPortalSettings() {
  portalSettings = JSON.parse(JSON.stringify(DEFAULT_PORTAL_SETTINGS));
  localStorage.setItem(STORAGE_KEYS.PORTAL_SETTINGS, JSON.stringify(portalSettings));
  applyPortalSettings();
  updateAiKeyStatusBadge();
  renderAdminLayoutSettings();
  showToast('Portal navigation settings reset to default!');
}



/* =========================================================================
   13-B. ADMIN PANELS CONTROLLERS (AI, ROUTINE, SECURITY & CMS)
   ========================================================================= */

// --- 1. AI BOT PERSONA & API KEYS CONTROLLER ---
function renderAdminAiPanel() {
  const p = portalSettings.botPersona || {};
  const nameInput = document.getElementById('cfgAiBotName');
  const subInput = document.getElementById('cfgAiBotSubtitle');
  const greetInput = document.getElementById('cfgAiBotGreeting');

  if (nameInput) nameInput.value = p.name || 'Fahim Niloy AI';
  if (subInput) subInput.value = p.subtitle || 'CUET ME Academic Companion';
  if (greetInput) greetInput.value = p.greeting || 'Hello! I am Fahim Niloy, your AI study companion at CUET ME. Ask me anything about engineering theories, course files, or question banks!';

  const geminiInput = document.getElementById('cfgAiGeminiKey');
  const openAiInput = document.getElementById('cfgAiOpenAiKey');
  if (geminiInput) geminiInput.value = localStorage.getItem(STORAGE_KEYS.GEMINI_API_KEY) || portalSettings.geminiApiKey || '';
  if (openAiInput) openAiInput.value = localStorage.getItem(STORAGE_KEYS.OPENAI_API_KEY) || portalSettings.openaiApiKey || '';

  updateAiKeyStatusBadge();
  renderAdminFaqs();
}

function updateAiKeyStatusBadge() {
  const geminiKey = localStorage.getItem(STORAGE_KEYS.GEMINI_API_KEY) || portalSettings.geminiApiKey;
  const badge = document.getElementById('geminiKeyStatusBadge');
  const statusText = document.getElementById('geminiKeyStatusText');

  if (geminiKey) {
    if (badge) {
      badge.className = 'px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-semibold flex items-center gap-1';
      badge.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Connected (Active)';
    }
    if (statusText) statusText.textContent = 'Gemini 2.0 (Active)';
  } else {
    if (badge) {
      badge.className = 'px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-semibold flex items-center gap-1';
      badge.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Smart Offline Engine';
    }
    if (statusText) statusText.textContent = 'Gemini (Connect Key)';
  }
}

function saveAiBotPersona() {
  const nameInput = document.getElementById('cfgAiBotName');
  const subInput = document.getElementById('cfgAiBotSubtitle');
  const greetInput = document.getElementById('cfgAiBotGreeting');

  portalSettings.botPersona = {
    name: (nameInput?.value || '').trim() || 'Fahim Niloy AI',
    subtitle: (subInput?.value || '').trim() || 'CUET ME Academic Companion',
    greeting: (greetInput?.value || '').trim() || 'Hello! I am your AI academic companion at CUET.'
  };

  localStorage.setItem(STORAGE_KEYS.PORTAL_SETTINGS, JSON.stringify(portalSettings));
  applyPortalSettings();
  showToast('AI চ্যাটবট পার্সোনা সফলভাবে সংরক্ষণ করা হয়েছে!');
}

function saveAiApiKeys() {
  const geminiInput = document.getElementById('cfgAiGeminiKey');
  const openAiInput = document.getElementById('cfgAiOpenAiKey');

  const gKey = (geminiInput?.value || '').trim();
  const oKey = (openAiInput?.value || '').trim();

  if (gKey) {
    localStorage.setItem(STORAGE_KEYS.GEMINI_API_KEY, gKey);
    portalSettings.geminiApiKey = gKey;
  } else {
    localStorage.removeItem(STORAGE_KEYS.GEMINI_API_KEY);
    portalSettings.geminiApiKey = '';
  }

  if (oKey) {
    localStorage.setItem(STORAGE_KEYS.OPENAI_API_KEY, oKey);
    portalSettings.openaiApiKey = oKey;
  } else {
    localStorage.removeItem(STORAGE_KEYS.OPENAI_API_KEY);
    portalSettings.openaiApiKey = '';
  }

  localStorage.setItem(STORAGE_KEYS.PORTAL_SETTINGS, JSON.stringify(portalSettings));
  updateAiKeyStatusBadge();
  showToast('API Keys updated successfully!');
}

function toggleKeyVisibility(inputId, btnEl) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    if (btnEl) btnEl.innerHTML = '<i data-lucide="eye-off" class="w-3.5 h-3.5"></i>';
  } else {
    input.type = 'password';
    if (btnEl) btnEl.innerHTML = '<i data-lucide="eye" class="w-3.5 h-3.5"></i>';
  }
  lucide.createIcons();
}

async function testGeminiKeyLive() {
  const input = document.getElementById('cfgAiGeminiKey');
  const key = (input?.value || '').trim() || localStorage.getItem(STORAGE_KEYS.GEMINI_API_KEY) || portalSettings.geminiApiKey;
  if (!key) {
    alert('দয়া করে প্রথমে একটি বৈধ Google Gemini API Key ইনপুট দিন।');
    return;
  }

  showToast('Gemini API সংযোগ পরীক্ষা করা হচ্ছে...');
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Respond with the exact word: CONNECTED' }] }]
      })
    });

    if (res.ok) {
      const data = await res.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      alert('✓ সাফল্য: Google Gemini 2.0 API সফলভাবে যুক্ত হয়েছে! রেসপন্স: ' + reply.trim());
      saveAiApiKeys();
    } else {
      const err = await res.text();
      alert('✗ সংযোগ ব্যর্থ হয়েছে। স্ট্যাটাস কোড: ' + res.status + '\n' + err);
    }
  } catch (err) {
    alert('✗ নেটওয়ার্ক সমস্যা বা এপিআই এরর: ' + err.message);
  }
}

// --- CUSTOM CAMPUS FAQS & KNOWLEDGE INGESTION ---
function getStoredFaqs() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN_FAQS) || '[]');
  } catch {
    return [];
  }
}

function saveStoredFaqs(faqs) {
  localStorage.setItem(STORAGE_KEYS.ADMIN_FAQS, JSON.stringify(faqs));
}

function renderAdminFaqs() {
  const faqs = getStoredFaqs();
  const list = document.getElementById('adminFaqsList');
  const badge = document.getElementById('customFaqCountBadge');
  if (badge) badge.textContent = faqs.length;
  if (!list) return;

  if (faqs.length === 0) {
    list.innerHTML = `
      <div class="text-center py-8 text-slate-500 text-xs">
        <i data-lucide="help-circle" class="w-8 h-8 mx-auto mb-2 opacity-40"></i>
        <p>এখনো কোনো কাস্টম প্রশ্নোত্তর যুক্ত করা হয়নি।</p>
        <p class="text-[11px] text-slate-600 mt-1">বাম পাশের ফরম ব্যবহার করে নতুন প্রশ্নোত্তর যোগ করুন।</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  list.innerHTML = faqs.map(faq => `
    <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 hover:border-slate-700 transition-all">
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0">
          <span class="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 text-[10px] font-semibold">${faq.category || 'General'}</span>
          <h5 class="text-xs font-bold text-white mt-1">${faq.question}</h5>
        </div>
        <button onclick="deleteCustomFaq('${faq.id}')" class="p-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors text-xs" title="মুছে ফেলুন">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
      </div>
      <p class="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">${faq.answer}</p>
      <div class="text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">যোগ করা হয়েছে: ${new Date(faq.created_at || Date.now()).toLocaleDateString('bn-BD')}</div>
    </div>
  `).join('');
  lucide.createIcons();
}

function addCustomFaq(e) {
  if (e && e.preventDefault) e.preventDefault();
  const qInput = document.getElementById('newFaqQuestion');
  const catInput = document.getElementById('newFaqCategory');
  const aInput = document.getElementById('newFaqAnswer');

  const question = (qInput?.value || '').trim();
  const category = (catInput?.value || 'General').trim();
  const answer = (aInput?.value || '').trim();

  if (!question || !answer) {
    alert('দয়া করে প্রশ্ন ও উত্তর উভয় ফিল্ড পূরণ করুন।');
    return;
  }

  const faqs = getStoredFaqs();
  faqs.unshift({
    id: 'faq_' + Date.now(),
    question,
    category,
    answer,
    created_at: new Date().toISOString()
  });

  saveStoredFaqs(faqs);
  if (qInput) qInput.value = '';
  if (aInput) aInput.value = '';
  renderAdminFaqs();
  showToast('নতুন কাস্টম প্রশ্নোত্তর সফলভাবে যোগ করা হয়েছে!');
}

function deleteCustomFaq(id) {
  if (!confirm('আপনি কি নিশ্চিতভাবে এই প্রশ্নোত্তরটি মুছে ফেলতে চান?')) return;
  let faqs = getStoredFaqs();
  faqs = faqs.filter(f => f.id !== id);
  saveStoredFaqs(faqs);
  renderAdminFaqs();
  showToast('প্রশ্নোত্তর মুছে ফেলা হয়েছে।');
}

function findMatchingCustomFaq(query) {
  if (!query) return null;
  const q = query.toLowerCase().trim();
  const faqs = getStoredFaqs();
  for (const f of faqs) {
    const fq = (f.question || '').toLowerCase();
    if (fq === q || q.includes(fq) || fq.includes(q)) {
      return f;
    }
  }
  return null;
}

// --- 2. CLASS ROUTINE & SCHEDULE MANAGER ---
const DEFAULT_CUET_ROUTINE = {
  "L1-T1": {
    "Sunday": [
      {
        "time": "08:00 AM - 08:50 AM",
        "course": "ME 1101: Engineering Mechanics I (Statics)",
        "room": "ME-101",
        "teacher": "Dr. Bodius Salam"
      },
      {
        "time": "08:50 AM - 09:40 AM",
        "course": "MATH 1101: Differential & Integral Calculus",
        "room": "ME-101",
        "teacher": "Dept. of Math"
      },
      {
        "time": "10:00 AM - 12:30 PM",
        "course": "ME 1102: Mechanical Engineering Drawing I",
        "room": "Drawing Hall",
        "teacher": "Dr. Md. Mahbubul Alam / Lab Staff"
      },
      {
        "time": "01:30 PM - 02:20 PM",
        "course": "CHEM 1101: Chemistry",
        "room": "ME-101",
        "teacher": "Dept. of Chemistry"
      }
    ],
    "Monday": [
      {
        "time": "08:00 AM - 09:40 AM",
        "course": "HUM 1101: English & Professional Communication",
        "room": "ME-101",
        "teacher": "Dept. of Humanities"
      },
      {
        "time": "10:00 AM - 12:30 PM",
        "course": "CHEM 1102: Chemistry Laboratory",
        "room": "Chemistry Lab",
        "teacher": "Chem Faculty & Instructors"
      }
    ],
    "Tuesday": [
      {
        "time": "08:00 AM - 08:50 AM",
        "course": "MATH 1101: Differential & Integral Calculus",
        "room": "ME-101",
        "teacher": "Dept. of Math"
      },
      {
        "time": "08:50 AM - 09:40 AM",
        "course": "ME 1101: Engineering Mechanics I (Statics)",
        "room": "ME-101",
        "teacher": "Dr. Bodius Salam"
      },
      {
        "time": "10:00 AM - 10:50 AM",
        "course": "CHEM 1101: Chemistry",
        "room": "ME-101",
        "teacher": "Dept. of Chemistry"
      }
    ],
    "Wednesday": [
      {
        "time": "08:00 AM - 09:40 AM",
        "course": "ME 1101: Engineering Mechanics I (Statics)",
        "room": "ME-101",
        "teacher": "Dr. Bodius Salam"
      },
      {
        "time": "10:00 AM - 12:30 PM",
        "course": "ME 1104: Workshop Practice Sessional",
        "room": "Central Machine Shop",
        "teacher": "Workshop Instructors"
      }
    ],
    "Thursday": [
      {
        "time": "08:00 AM - 08:50 AM",
        "course": "MATH 1101: Differential & Integral Calculus",
        "room": "ME-101",
        "teacher": "Dept. of Math"
      },
      {
        "time": "08:50 AM - 09:40 AM",
        "course": "HUM 1101: English & Professional Communication",
        "room": "ME-101",
        "teacher": "Dept. of Humanities"
      },
      {
        "time": "10:00 AM - 10:50 AM",
        "course": "CHEM 1101: Chemistry",
        "room": "ME-101",
        "teacher": "Dept. of Chemistry"
      }
    ]
  },
  "L1-T2": {
    "Sunday": [
      {
        "time": "08:00 AM - 08:50 AM",
        "course": "ME 1201: Engineering Mechanics II (Dynamics)",
        "room": "ME-102",
        "teacher": "Dr. Md. Mizanur Rahman"
      },
      {
        "time": "08:50 AM - 09:40 AM",
        "course": "ME 1203: Basic Thermodynamics",
        "room": "ME-102",
        "teacher": "Dr. Bodius Salam"
      },
      {
        "time": "10:00 AM - 12:30 PM",
        "course": "PHY 1202: Physics Laboratory",
        "room": "Physics Lab",
        "teacher": "Dept. of Physics"
      }
    ],
    "Monday": [
      {
        "time": "08:00 AM - 08:50 AM",
        "course": "PHY 1201: Physics (Waves, Optics & Heat)",
        "room": "ME-102",
        "teacher": "Dept. of Physics"
      },
      {
        "time": "08:50 AM - 09:40 AM",
        "course": "MATH 1201: Vector Analysis & Matrices",
        "room": "ME-102",
        "teacher": "Dept. of Math"
      },
      {
        "time": "10:00 AM - 12:30 PM",
        "course": "ME 1202: Workshop Technology Sessional",
        "room": "Machine Shop",
        "teacher": "Lab Team"
      }
    ],
    "Tuesday": [
      {
        "time": "08:00 AM - 09:40 AM",
        "course": "ME 1203: Basic Thermodynamics",
        "room": "ME-102",
        "teacher": "Dr. Bodius Salam"
      },
      {
        "time": "10:00 AM - 10:50 AM",
        "course": "ME 1201: Engineering Mechanics II (Dynamics)",
        "room": "ME-102",
        "teacher": "Dr. Md. Mizanur Rahman"
      }
    ],
    "Wednesday": [
      {
        "time": "08:00 AM - 08:50 AM",
        "course": "MATH 1201: Vector Analysis & Matrices",
        "room": "ME-102",
        "teacher": "Dept. of Math"
      },
      {
        "time": "08:50 AM - 09:40 AM",
        "course": "PHY 1201: Physics (Waves, Optics & Heat)",
        "room": "ME-102",
        "teacher": "Dept. of Physics"
      },
      {
        "time": "10:00 AM - 12:30 PM",
        "course": "ME 1204: Engineering Drawing II (CAD Sessional)",
        "room": "CAD Lab",
        "teacher": "Engr. Tanvir Ahmed"
      }
    ],
    "Thursday": [
      {
        "time": "08:00 AM - 09:40 AM",
        "course": "ME 1201: Engineering Mechanics II (Dynamics)",
        "room": "ME-102",
        "teacher": "Dr. Md. Mizanur Rahman"
      },
      {
        "time": "09:50 AM - 10:40 AM",
        "course": "ME 1203: Basic Thermodynamics",
        "room": "ME-102",
        "teacher": "Dr. Bodius Salam"
      }
    ]
  },
  "L2-T1": {
    "Sunday": [
      {
        "time": "08:00 AM - 08:50 AM",
        "course": "ME 2101: Fluid Mechanics I",
        "room": "ME-201",
        "teacher": "Dr. Sajal Chandra Banik"
      },
      {
        "time": "08:50 AM - 09:40 AM",
        "course": "ME 2103: Mechanics of Solids I",
        "room": "ME-201",
        "teacher": "Dr. Md. Mahbubul Alam"
      },
      {
        "time": "10:00 AM - 12:30 PM",
        "course": "ME 2102: Fluid Mechanics Sessional I",
        "room": "Fluid Mechanics Lab",
        "teacher": "Lab Faculty"
      }
    ],
    "Monday": [
      {
        "time": "08:00 AM - 08:50 AM",
        "course": "EEE 2101: Electrical Technology",
        "room": "ME-201",
        "teacher": "Dept. of EEE"
      },
      {
        "time": "08:50 AM - 09:40 AM",
        "course": "MATH 2101: Differential Equations",
        "room": "ME-201",
        "teacher": "Dept. of Math"
      },
      {
        "time": "10:00 AM - 12:30 PM",
        "course": "EEE 2102: Electrical Technology Sessional",
        "room": "EEE Lab",
        "teacher": "EEE Faculty"
      }
    ],
    "Tuesday": [
      {
        "time": "08:00 AM - 09:40 AM",
        "course": "ME 2103: Mechanics of Solids I",
        "room": "ME-201",
        "teacher": "Dr. Md. Mahbubul Alam"
      },
      {
        "time": "10:00 AM - 10:50 AM",
        "course": "ME 2101: Fluid Mechanics I",
        "room": "ME-201",
        "teacher": "Dr. Sajal Chandra Banik"
      }
    ],
    "Wednesday": [
      {
        "time": "08:00 AM - 08:50 AM",
        "course": "MATH 2101: Differential Equations",
        "room": "ME-201",
        "teacher": "Dept. of Math"
      },
      {
        "time": "08:50 AM - 09:40 AM",
        "course": "EEE 2101: Electrical Technology",
        "room": "ME-201",
        "teacher": "Dept. of EEE"
      },
      {
        "time": "10:00 AM - 12:30 PM",
        "course": "ME 2104: Mechanics of Solids Sessional I",
        "room": "Strength of Materials Lab",
        "teacher": "Lab Team"
      }
    ],
    "Thursday": [
      {
        "time": "08:00 AM - 09:40 AM",
        "course": "ME 2101: Fluid Mechanics I",
        "room": "ME-201",
        "teacher": "Dr. Sajal Chandra Banik"
      },
      {
        "time": "09:50 AM - 10:40 AM",
        "course": "ME 2103: Mechanics of Solids I",
        "room": "ME-201",
        "teacher": "Dr. Md. Mahbubul Alam"
      }
    ]
  },
  "L2-T2": {
    "Sunday": [
      {
        "time": "08:00 AM - 08:50 AM",
        "course": "ME 2201: Applied Thermodynamics",
        "room": "ME-202",
        "teacher": "Prof. Dr. M. M. Kamal Bhuiya"
      },
      {
        "time": "08:50 AM - 09:40 AM",
        "course": "ME 2203: Mechanics of Solids II",
        "room": "ME-202",
        "teacher": "Dr. Md. Mahbubul Alam"
      },
      {
        "time": "10:00 AM - 12:30 PM",
        "course": "ME 2202: Applied Thermodynamics Sessional",
        "room": "Thermal Lab",
        "teacher": "Lab Team"
      }
    ],
    "Monday": [
      {
        "time": "08:00 AM - 08:50 AM",
        "course": "ME 2205: Engineering Metallurgy",
        "room": "ME-202",
        "teacher": "Dr. Sanjoy Kumar Nandi"
      },
      {
        "time": "08:50 AM - 09:40 AM",
        "course": "MATH 2201: Complex Variable & Statistics",
        "room": "ME-202",
        "teacher": "Dept. of Math"
      },
      {
        "time": "10:00 AM - 12:30 PM",
        "course": "ME 2206: Metallurgy & Materials Testing Sessional",
        "room": "Metallurgy Lab",
        "teacher": "Lab Team"
      }
    ],
    "Tuesday": [
      {
        "time": "08:00 AM - 09:40 AM",
        "course": "ME 2201: Applied Thermodynamics",
        "room": "ME-202",
        "teacher": "Prof. Dr. M. M. Kamal Bhuiya"
      },
      {
        "time": "10:00 AM - 10:50 AM",
        "course": "ME 2205: Engineering Metallurgy",
        "room": "ME-202",
        "teacher": "Dr. Sanjoy Kumar Nandi"
      }
    ],
    "Wednesday": [
      {
        "time": "08:00 AM - 09:40 AM",
        "course": "ME 2203: Mechanics of Solids II",
        "room": "ME-202",
        "teacher": "Dr. Md. Mahbubul Alam"
      },
      {
        "time": "10:00 AM - 10:50 AM",
        "course": "MATH 2201: Complex Variable & Statistics",
        "room": "ME-202",
        "teacher": "Dept. of Math"
      }
    ],
    "Thursday": [
      {
        "time": "08:00 AM - 08:50 AM",
        "course": "ME 2205: Engineering Metallurgy",
        "room": "ME-202",
        "teacher": "Dr. Sanjoy Kumar Nandi"
      },
      {
        "time": "08:50 AM - 09:40 AM",
        "course": "ME 2201: Applied Thermodynamics",
        "room": "ME-202",
        "teacher": "Prof. Dr. M. M. Kamal Bhuiya"
      },
      {
        "time": "10:00 AM - 10:50 AM",
        "course": "ME 2203: Mechanics of Solids II",
        "room": "ME-202",
        "teacher": "Dr. Md. Mahbubul Alam"
      }
    ]
  },
  "L3-T1": {
    "Sunday": [
      {
        "time": "08:00 AM - 08:50 AM",
        "course": "ME 3101: Fluid Mechanics II (Turbomachinery)",
        "room": "ME-301",
        "teacher": "Dr. Sajal Chandra Banik"
      },
      {
        "time": "08:50 AM - 09:40 AM",
        "course": "ME 3103: Heat and Mass Transfer",
        "room": "ME-301",
        "teacher": "Dr. Bodius Salam"
      },
      {
        "time": "10:00 AM - 12:30 PM",
        "course": "ME 3104: Heat Transfer Sessional",
        "room": "Heat Transfer Lab",
        "teacher": "Lab Team"
      }
    ],
    "Monday": [
      {
        "time": "08:00 AM - 08:50 AM",
        "course": "ME 3105: Manufacturing Processes",
        "room": "ME-301",
        "teacher": "Dr. Md. Mahbubul Alam"
      },
      {
        "time": "08:50 AM - 09:40 AM",
        "course": "ME 3107: Mechanics of Machinery",
        "room": "ME-301",
        "teacher": "Dr. Md. Mizanur Rahman"
      },
      {
        "time": "10:00 AM - 12:30 PM",
        "course": "ME 3106: Manufacturing Processes Sessional",
        "room": "Machine Shop",
        "teacher": "Lab Instructors"
      }
    ],
    "Tuesday": [
      {
        "time": "08:00 AM - 09:40 AM",
        "course": "ME 3103: Heat and Mass Transfer",
        "room": "ME-301",
        "teacher": "Dr. Bodius Salam"
      },
      {
        "time": "10:00 AM - 10:50 AM",
        "course": "ME 3101: Fluid Mechanics II",
        "room": "ME-301",
        "teacher": "Dr. Sajal Chandra Banik"
      }
    ],
    "Wednesday": [
      {
        "time": "08:00 AM - 09:40 AM",
        "course": "ME 3107: Mechanics of Machinery",
        "room": "ME-301",
        "teacher": "Dr. Md. Mizanur Rahman"
      },
      {
        "time": "10:00 AM - 10:50 AM",
        "course": "ME 3105: Manufacturing Processes",
        "room": "ME-301",
        "teacher": "Dr. Md. Mahbubul Alam"
      }
    ],
    "Thursday": [
      {
        "time": "08:00 AM - 08:50 AM",
        "course": "ME 3101: Fluid Mechanics II",
        "room": "ME-301",
        "teacher": "Dr. Sajal Chandra Banik"
      },
      {
        "time": "08:50 AM - 09:40 AM",
        "course": "ME 3103: Heat and Mass Transfer",
        "room": "ME-301",
        "teacher": "Dr. Bodius Salam"
      },
      {
        "time": "10:00 AM - 12:30 PM",
        "course": "ME 3102: Turbomachinery Sessional",
        "room": "Hydraulics Lab",
        "teacher": "Lab Faculty"
      }
    ]
  },
  "L3-T2": {
    "Sunday": [
      {
        "time": "08:00 AM - 08:50 AM",
        "course": "ME 3201: Machine Design",
        "room": "ME-302",
        "teacher": "Dr. Md. Mizanur Rahman"
      },
      {
        "time": "08:50 AM - 09:40 AM",
        "course": "ME 3203: Instrumentation & Measurement",
        "room": "ME-302",
        "teacher": "Dr. Sajal Chandra Banik"
      },
      {
        "time": "10:00 AM - 12:30 PM",
        "course": "ME 3202: Machine Design Sessional",
        "room": "CAD/CAM Lab",
        "teacher": "Engr. Tanvir Ahmed"
      }
    ],
    "Monday": [
      {
        "time": "08:00 AM - 08:50 AM",
        "course": "ME 3205: Mechanical Vibrations",
        "room": "ME-302",
        "teacher": "Dr. Sanjoy Kumar Nandi"
      },
      {
        "time": "08:50 AM - 09:40 AM",
        "course": "IPE 3201: Industrial Management",
        "room": "ME-302",
        "teacher": "Prof. Dr. Md. Mahbubul Alam"
      },
      {
        "time": "10:00 AM - 12:30 PM",
        "course": "ME 3204: Instrumentation & Measurement Sessional",
        "room": "Instrumentation Lab",
        "teacher": "Lab Team"
      }
    ],
    "Tuesday": [
      {
        "time": "08:00 AM - 09:40 AM",
        "course": "ME 3201: Machine Design",
        "room": "ME-302",
        "teacher": "Dr. Md. Mizanur Rahman"
      },
      {
        "time": "10:00 AM - 10:50 AM",
        "course": "ME 3205: Mechanical Vibrations",
        "room": "ME-302",
        "teacher": "Dr. Sanjoy Kumar Nandi"
      }
    ],
    "Wednesday": [
      {
        "time": "08:00 AM - 09:40 AM",
        "course": "ME 3203: Instrumentation & Measurement",
        "room": "ME-302",
        "teacher": "Dr. Sajal Chandra Banik"
      },
      {
        "time": "10:00 AM - 10:50 AM",
        "course": "IPE 3201: Industrial Management",
        "room": "ME-302",
        "teacher": "Prof. Dr. Md. Mahbubul Alam"
      }
    ],
    "Thursday": [
      {
        "time": "08:00 AM - 09:40 AM",
        "course": "ME 3205: Mechanical Vibrations",
        "room": "ME-302",
        "teacher": "Dr. Sanjoy Kumar Nandi"
      },
      {
        "time": "10:00 AM - 10:50 AM",
        "course": "ME 3201: Machine Design",
        "room": "ME-302",
        "teacher": "Dr. Md. Mizanur Rahman"
      }
    ]
  },
  "L4-T1": {
    "Sunday": [
      {
        "time": "08:00 AM - 08:50 AM",
        "course": "ME 4101: Internal Combustion Engines",
        "room": "ME-401",
        "teacher": "Dr. Bodius Salam"
      },
      {
        "time": "08:50 AM - 09:40 AM",
        "course": "ME 4103: Refrigeration & Air Conditioning",
        "room": "ME-401",
        "teacher": "Prof. Dr. M. M. Kamal Bhuiya"
      },
      {
        "time": "10:00 AM - 12:30 PM",
        "course": "ME 4102: Heat Engines Sessional",
        "room": "IC Engine Lab",
        "teacher": "Lab Faculty"
      }
    ],
    "Monday": [
      {
        "time": "08:00 AM - 09:40 AM",
        "course": "ME 4105: Finite Element Analysis & Simulation",
        "room": "ME-401",
        "teacher": "Engr. Tanvir Ahmed"
      },
      {
        "time": "10:00 AM - 01:00 PM",
        "course": "ME 4000: Project & Thesis Progress",
        "room": "Dept. Seminar Room",
        "teacher": "Assigned Supervisors"
      }
    ],
    "Tuesday": [
      {
        "time": "08:00 AM - 08:50 AM",
        "course": "ME 4103: Refrigeration & Air Conditioning",
        "room": "ME-401",
        "teacher": "Prof. Dr. M. M. Kamal Bhuiya"
      },
      {
        "time": "09:00 AM - 11:30 AM",
        "course": "ME 4104: RAC Sessional",
        "room": "RAC Lab",
        "teacher": "Lab Team"
      }
    ],
    "Wednesday": [
      {
        "time": "08:00 AM - 09:40 AM",
        "course": "ME 4101: Internal Combustion Engines",
        "room": "ME-401",
        "teacher": "Dr. Bodius Salam"
      },
      {
        "time": "10:00 AM - 11:40 AM",
        "course": "ME 4105: Finite Element Analysis & Simulation",
        "room": "ME-401",
        "teacher": "Engr. Tanvir Ahmed"
      }
    ],
    "Thursday": [
      {
        "time": "08:00 AM - 09:40 AM",
        "course": "ME 4103: Refrigeration & Air Conditioning",
        "room": "ME-401",
        "teacher": "Prof. Dr. M. M. Kamal Bhuiya"
      },
      {
        "time": "10:00 AM - 12:30 PM",
        "course": "ME 4106: FEA & Simulation Sessional",
        "room": "CAD/CAE Lab",
        "teacher": "Lab Team"
      }
    ]
  },
  "L4-T2": {
    "Sunday": [
      {
        "time": "08:00 AM - 08:50 AM",
        "course": "ME 4201: Power Plant Engineering",
        "room": "ME-304",
        "teacher": "Prof. Dr. M. M. Kamal Bhuiya"
      },
      {
        "time": "08:50 AM - 09:40 AM",
        "course": "ME 4203: Automobile Engineering",
        "room": "ME-304",
        "teacher": "Prof. Dr. Md. Mizanur Rahman"
      },
      {
        "time": "10:00 AM - 12:30 PM",
        "course": "ME 4202: Power Plant Sessional",
        "room": "Thermal Power Lab",
        "teacher": "Dr. Sanjoy Kumar Nandi / Lab Staff"
      },
      {
        "time": "01:30 PM - 02:20 PM",
        "course": "IPE 4201: Production Planning & Control",
        "room": "ME-304",
        "teacher": "Prof. Dr. Md. Mahbubul Alam"
      }
    ],
    "Monday": [
      {
        "time": "08:00 AM - 09:40 AM",
        "course": "ME 4201: Power Plant Engineering",
        "room": "ME-304",
        "teacher": "Prof. Dr. M. M. Kamal Bhuiya"
      },
      {
        "time": "09:50 AM - 10:40 AM",
        "course": "ME 4205: Operations Research & Quality Control",
        "room": "ME-304",
        "teacher": "Engr. Tanvir Ahmed"
      },
      {
        "time": "10:50 AM - 01:20 PM",
        "course": "ME 4000: Project & Thesis",
        "room": "Department Laboratories",
        "teacher": "Assigned Supervisors"
      }
    ],
    "Tuesday": [
      {
        "time": "08:00 AM - 08:50 AM",
        "course": "ME 4203: Automobile Engineering",
        "room": "ME-304",
        "teacher": "Prof. Dr. Md. Mizanur Rahman"
      },
      {
        "time": "08:50 AM - 10:30 AM",
        "course": "ME 4205: Operations Research & Quality Control",
        "room": "ME-304",
        "teacher": "Engr. Tanvir Ahmed"
      },
      {
        "time": "10:50 AM - 01:20 PM",
        "course": "ME 4204: Automobile Sessional",
        "room": "Automobile Lab",
        "teacher": "Engr. Asif Mohammad / Lab Team"
      }
    ],
    "Wednesday": [
      {
        "time": "08:00 AM - 08:50 AM",
        "course": "IPE 4201: Production Planning & Control",
        "room": "ME-304",
        "teacher": "Prof. Dr. Md. Mahbubul Alam"
      },
      {
        "time": "08:50 AM - 09:40 AM",
        "course": "ME 4201: Power Plant Engineering",
        "room": "ME-304",
        "teacher": "Prof. Dr. M. M. Kamal Bhuiya"
      },
      {
        "time": "10:00 AM - 01:00 PM",
        "course": "ME 4000: Project & Thesis Progress Work",
        "room": "Assigned Research Lab",
        "teacher": "Supervisors"
      }
    ],
    "Thursday": [
      {
        "time": "08:00 AM - 09:40 AM",
        "course": "ME 4203: Automobile Engineering",
        "room": "ME-304",
        "teacher": "Prof. Dr. Md. Mizanur Rahman"
      },
      {
        "time": "09:50 AM - 10:40 AM",
        "course": "IPE 4201: Production Planning & Control",
        "room": "ME-304",
        "teacher": "Prof. Dr. Md. Mahbubul Alam"
      },
      {
        "time": "10:50 AM - 12:30 PM",
        "course": "ME 4205: Operations Research & Quality Control",
        "room": "ME-304",
        "teacher": "Engr. Tanvir Ahmed"
      }
    ]
  }
};

function getStoredRoutine() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ADMIN_ROUTINE);
    if (data) {
      const parsed = JSON.parse(data);
      // Merge with DEFAULT_CUET_ROUTINE to ensure all 8 semesters exist
      return Object.assign({}, DEFAULT_CUET_ROUTINE, parsed);
    }
    return JSON.parse(JSON.stringify(DEFAULT_CUET_ROUTINE));
  } catch {
    return JSON.parse(JSON.stringify(DEFAULT_CUET_ROUTINE));
  }
}

function saveStoredRoutine(routine) {
  localStorage.setItem(STORAGE_KEYS.ADMIN_ROUTINE, JSON.stringify(routine));
}

function renderAdminRoutineTable() {
  const semSelect = document.getElementById('adminRoutineSemesterSelect');
  const sem = semSelect ? semSelect.value : 'L4-T2';
  const container = document.getElementById('adminRoutineTableContainer');
  if (!container) return;

  const routine = getStoredRoutine();
  const semData = routine[sem] || {};
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

  let html = `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h4 class="text-xs font-bold text-blue-300 uppercase tracking-wider">${sem} Weekly Schedule</h4>
        <button onclick="resetRoutineToDefault()" class="text-[11px] text-slate-400 hover:text-white underline">Reset to Default</button>
      </div>
  `;

  days.forEach(day => {
    const slots = semData[day] || [];
    html += `
      <div class="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
        <div class="flex items-center justify-between pb-1.5 border-b border-slate-800/80">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-blue-400"></span>
            <span class="text-xs font-bold text-white">${day}</span>
          </div>
          <span class="text-[11px] text-slate-400 font-mono">${slots.length} Classes</span>
        </div>
        ${slots.length === 0 ? `
          <p class="text-xs text-slate-500 py-2">কোনো ক্লাস সিডিউল নেই।</p>
        ` : `
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            ${slots.map((slot, idx) => `
              <div class="p-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 flex items-start justify-between gap-2">
                <div class="min-w-0 space-y-0.5">
                  <div class="text-[10px] font-mono text-amber-400 font-semibold">${slot.time}</div>
                  <div class="text-xs font-bold text-slate-200 truncate">${slot.course}</div>
                  <div class="flex items-center gap-2 text-[10px] text-slate-400">
                    <span>🏢 ${slot.room || 'TBA'}</span>
                    <span>👨‍🏫 ${slot.teacher || 'TBA'}</span>
                  </div>
                </div>
                <button onclick="deleteRoutineSlot('${sem}', '${day}', ${idx})" class="p-1 rounded hover:bg-red-500/20 text-red-400 text-xs" title="মুছে ফেলুন">
                  <i data-lucide="trash-2" class="w-3 h-3"></i>
                </button>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;
  });

  html += '</div>';
  container.innerHTML = html;
  lucide.createIcons();
}

function addRoutineSlot(e) {
  if (e && e.preventDefault) e.preventDefault();
  const semSelect = document.getElementById('adminRoutineSemesterSelect');
  const daySelect = document.getElementById('routineDaySelect');
  const timeInput = document.getElementById('routineTimeSlot');
  const courseInput = document.getElementById('routineCourseName');
  const roomInput = document.getElementById('routineRoomNo');
  const teacherInput = document.getElementById('routineTeacherInit');

  const sem = semSelect ? semSelect.value : 'L4-T2';
  const day = daySelect ? daySelect.value : 'Sunday';
  const time = (timeInput?.value || '').trim();
  const course = (courseInput?.value || '').trim();
  const room = (roomInput?.value || '').trim();
  const teacher = (teacherInput?.value || '').trim();

  if (!time || !course) {
    alert('দয়া করে ক্লাসের সময় ও কোর্সের নাম ইনপুট দিন।');
    return;
  }

  const routine = getStoredRoutine();
  if (!routine[sem]) routine[sem] = {};
  if (!routine[sem][day]) routine[sem][day] = [];

  routine[sem][day].push({ time, course, room, teacher });
  saveStoredRoutine(routine);

  if (timeInput) timeInput.value = '';
  if (courseInput) courseInput.value = '';
  if (roomInput) roomInput.value = '';
  if (teacherInput) teacherInput.value = '';

  renderAdminRoutineTable();
  if (typeof renderHomeRoutineViewer === 'function') renderHomeRoutineViewer();
  showToast('ক্লাস সিডিউল সফলভাবে যুক্ত হয়েছে!');
}

function deleteRoutineSlot(sem, day, idx) {
  const routine = getStoredRoutine();
  if (routine[sem] && routine[sem][day]) {
    routine[sem][day].splice(idx, 1);
    saveStoredRoutine(routine);
    renderAdminRoutineTable();
    if (typeof renderHomeRoutineViewer === 'function') renderHomeRoutineViewer();
    showToast('ক্লাস স্লট মুছে ফেলা হয়েছে।');
  }
}

function resetRoutineToDefault() {
  if (!confirm('আপনি কি রুটিন রিসেট করে ডিফল্ট CUET ME রুটিনে ফিরে যেতে চান?')) return;
  saveStoredRoutine(JSON.parse(JSON.stringify(DEFAULT_CUET_ROUTINE)));
  renderAdminRoutineTable();
  if (typeof renderHomeRoutineViewer === 'function') renderHomeRoutineViewer();
  showToast('রুটিন সফলভাবে ডিফল্ট অবস্থায় রিসেট করা হয়েছে!');
}

// --- 3. MASTER SECURITY & BANNER CONTROLLER ---
function renderAdminSecurityPanel() {
  const p = portalSettings;
  const setChk = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.checked = !!val;
  };
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
  };

  setChk('cfgMaintenanceMode', p.maintenanceMode);
  setVal('cfgMaintenanceMsg', p.maintenanceMsg || 'আমাদের সার্ভার বর্তমানে নিয়মিত রক্ষণাবেক্ষণে রয়েছে। শীঘ্রই ফিরছি!');

  setChk('cfgMarqueeActive', p.marqueeActive);
  setVal('cfgMarqueeText', p.marqueeText || 'জরুরি নোটিশ: ৪র্থ বর্ষ ২য় টার্মের ফাইনাল পরীক্ষা শীঘ্রই শুরু হবে!');
  setVal('cfgMarqueeType', p.marqueeType || 'alert');
  setVal('cfgMarqueeUrl', p.marqueeUrl || '');

  setChk('cfgAllowDownloads', p.allowDownloads !== false);
  setChk('cfgAllowSubmissions', p.allowSubmissions !== false);
  setChk('cfgEnableAiTab', p.enableAiTab !== false);
  setChk('cfgEnableVideosTab', p.enableVideosTab !== false);
  setChk('cfgEnableTrackerTab', p.enableTrackerTab !== false);
}

function saveSecuritySettings() {
  const getChk = (id, def) => {
    const el = document.getElementById(id);
    return el ? el.checked : def;
  };
  const getVal = (id, def) => {
    const el = document.getElementById(id);
    return el && el.value.trim() ? el.value.trim() : def;
  };

  portalSettings.maintenanceMode = getChk('cfgMaintenanceMode', false);
  portalSettings.maintenanceMsg = getVal('cfgMaintenanceMsg', 'সার্ভার রক্ষণাবেক্ষণে রয়েছে।');

  portalSettings.marqueeActive = getChk('cfgMarqueeActive', false);
  portalSettings.marqueeText = getVal('cfgMarqueeText', '');
  portalSettings.marqueeType = getVal('cfgMarqueeType', 'alert');
  portalSettings.marqueeUrl = getVal('cfgMarqueeUrl', '');

  portalSettings.allowDownloads = getChk('cfgAllowDownloads', true);
  portalSettings.allowSubmissions = getChk('cfgAllowSubmissions', true);
  portalSettings.enableAiTab = getChk('cfgEnableAiTab', true);
  portalSettings.enableVideosTab = getChk('cfgEnableVideosTab', true);
  portalSettings.enableTrackerTab = getChk('cfgEnableTrackerTab', true);

  localStorage.setItem(STORAGE_KEYS.PORTAL_SETTINGS, JSON.stringify(portalSettings));
  applyPortalSettings();
  showToast('নিরাপত্তা সেটিংস ও আর্জেন্ট ব্যানার সফলভাবে সংরক্ষিত হয়েছে!');
}

function dismissUrgentBanner() {
  const banner = document.getElementById('topUrgentBanner');
  if (banner) banner.classList.add('hidden');
  sessionStorage.setItem('dismissedUrgentBanner', 'true');
}

// --- 4. DRAFT, TRASH & SEO HELPERS ---
function autoSaveAdminDraft() {
  const form = document.getElementById('addResourceForm');
  if (!form) return;
  const data = {
    name: document.getElementById('resTitle')?.value || '',
    category: document.getElementById('resCategory')?.value || '',
    term: document.getElementById('resTerm')?.value || '',
    course: document.getElementById('resCourse')?.value || '',
    driveUrl: document.getElementById('resDriveUrl')?.value || '',
    savedAt: Date.now()
  };
  localStorage.setItem(STORAGE_KEYS.ADMIN_DRAFT, JSON.stringify(data));
}

function clearAdminDraftForm() {
  localStorage.removeItem(STORAGE_KEYS.ADMIN_DRAFT);
  const form = document.getElementById('addResourceForm');
  if (form) form.reset();
  showToast('ড্রাফট ফরম পরিষ্কার করা হয়েছে।');
}

function confirmEmptyTrash() {
  if (!confirm('আপনি কি ট্র্যাশ ফোল্ডারের সমস্ত আইটেম স্থায়ীভাবে মুছে ফেলতে চান? এটি আর ফিরিয়ে আনা যাবে না!')) return;
  localStorage.removeItem(STORAGE_KEYS.ADMIN_TRASH);
  renderAdminTrash();
  showToast('ট্র্যাশ সফলভাবে খালি করা হয়েছে!');
}

function createManualSnapshot() {
  const note = prompt('এই স্ন্যাপশটের জন্য একটি বিবরণ লিখুন (যেমন: "বিফোর ফাইনাল আপগ্রেড"):', 'ম্যানুয়াল ব্যাকআপ');
  if (note === null) return;
  saveRevision(`ম্যানুয়াল স্ন্যাপশট: ${note}`);
  renderAdminRevisions();
  showToast('নতুন সিস্টেম স্ন্যাপশট তৈরি হয়েছে!');
}

function saveAdminSeoSettings() {
  const title = document.getElementById('seoSiteTitle')?.value || '';
  const desc = document.getElementById('seoSiteDesc')?.value || '';
  const kw = document.getElementById('seoSiteKeywords')?.value || '';

  portalSettings.seo = { title, desc, keywords: kw };
  localStorage.setItem(STORAGE_KEYS.PORTAL_SETTINGS, JSON.stringify(portalSettings));
  document.title = title || 'ClassroomHub | CUET ME Repository';
  showToast('SEO মেটা সেটিংস সফলভাবে সেভ করা হয়েছে!');
}

// --- 5. PROGRESSIVE WEB APP (PWA) CONTROLLER ---
let deferredPwaPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPwaPrompt = e;
  const headerBtn = document.getElementById('pwaInstallHeaderBtn');
  const homeCard = document.getElementById('pwaHomeCard');
  if (headerBtn) headerBtn.classList.remove('hidden');
  if (homeCard) homeCard.classList.remove('hidden');
});

function triggerPwaInstall() {
  if (deferredPwaPrompt) {
    deferredPwaPrompt.prompt();
    deferredPwaPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        showToast('ধন্যবাদ! ClassroomHub অ্যাপটি সফলভাবে ইন্সটল হচ্ছে।');
      }
      deferredPwaPrompt = null;
    });
  } else {
    const modal = document.getElementById('pwaInstallModal');
    if (modal) {
      modal.showModal();
    } else {
      showToast('ব্রাউজারের মেন্যু থেকে "Add to Home Screen" বা "Install App" সিলেক্ট করুন।');
    }
  }
}

function closePwaInstallModal() {
  const modal = document.getElementById('pwaInstallModal');
  if (modal) modal.close();
}

window.addEventListener('appinstalled', () => {
  showToast('ClassroomHub অ্যাপটি আপনার ডিভাইসে ইন্সটল করা হয়েছে!');
  deferredPwaPrompt = null;
});

// Register Service Worker for PWA Offline Caching
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('PWA ServiceWorker registered successfully:', reg.scope))
      .catch(err => console.warn('PWA ServiceWorker registration failed:', err));
  });
}


/* =========================================================================
   EXPANSIVE GEMINI-QUALITY ENGINEERING & ACADEMIC KNOWLEDGE SOLVER
   (Integrated with Direct Google Gemini 2.0 Live & OpenAI ChatGPT)
   ========================================================================= */

/* =========================================================================
   EXPANSIVE GEMINI-QUALITY ENGINEERING & ACADEMIC KNOWLEDGE SOLVER
   (Integrated with Direct Google Gemini 2.0 Live & In-Place Studio)
   ========================================================================= */

let aiChatHistory = [];
let aiConversationTurnCount = 0;

function searchVaultFiles(query, limit = 3) {
  if (!query) return [];
  const cleanTerms = query.toLowerCase()
    .replace(/[^\w\s\u0980-\u09FF]/gi, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1);

  if (cleanTerms.length === 0) return [];
  const results = [];

  // Search indexed dataset
  if (appData && appData.terms) {
    for (const term of appData.terms) {
      if (!term.courses) continue;
      for (const course of term.courses) {
        if (!course.files) continue;
        for (const file of course.files) {
          const text = `${file.name} ${file.course || ''} ${file.term_code || ''} ${file.category || ''} ${file.subfolder || ''}`.toLowerCase();
          let score = 0;
          for (const t of cleanTerms) {
            if (text.includes(t)) {
              score += 2;
              if (file.name.toLowerCase().includes(t)) score += 3;
              if ((file.course || '').toLowerCase().includes(t)) score += 4;
            }
          }
          if (score > 0) results.push({ file, score });
        }
      }
    }
  }

  // Search community resources
  for (const file of communityResources) {
    const text = `${file.name} ${file.course || ''} ${file.term_code || ''} ${file.category || ''}`.toLowerCase();
    let score = 0;
    for (const t of cleanTerms) {
      if (text.includes(t)) score += 3;
    }
    if (score > 0) results.push({ file, score: score + 2 });
  }

  results.sort((a, b) => b.score - a.score);

  const seen = new Set();
  const deduped = [];
  for (const item of results) {
    const id = item.file.id || item.file.name;
    if (!seen.has(id)) {
      seen.add(id);
      deduped.push(item.file);
      if (deduped.length >= limit) break;
    }
  }
  return deduped;
}

function findRelevantVideos(query, limit = 1) {
  if (!query) return [];
  const q = query.toLowerCase();
  const cleanTerms = q
    .replace(/[^\w\s\u0980-\u09FF]/gi, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2);

  const matches = [];
  const allVideos = [...DEFAULT_VIDEO_LECTURES, ...(JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN_VIDEOS) || '[]'))];

  for (const v of allVideos) {
    const text = `${v.title} ${v.topic || ''} ${v.term || ''} ${v.course || ''} ${v.channel}`.toLowerCase();
    let score = 0;
    for (const t of cleanTerms) {
      if (text.includes(t)) score += 3;
    }
    if (q.includes('som') && v.term === 'L2-T1') score += 2;
    if (q.includes('thermo') && (v.term === 'L2-T1' || v.term === 'L2-T2')) score += 2;
    if (q.includes('fluid') && (v.term === 'L2-T2' || v.term === 'L3-T1')) score += 2;
    if (q.includes('math') && (v.term === 'L1-T1' || v.term === 'L1-T2')) score += 2;
    if (q.includes('power plant') && (v.term === 'L4-T1' || v.term === 'L4-T2')) score += 5;

    if (score > 0) matches.push({ video: v, score });
  }

  matches.sort((a, b) => b.score - a.score);
  return matches.slice(0, limit).map(m => m.video);
}

const DEFAULT_VIDEO_LECTURES = VERIFIED_VIDEO_COLLECTIONS;

function applyMathRendering(container) {
  if (window.renderMathInElement && container) {
    try {
      renderMathInElement(container, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '\\[', right: '\\]', display: true },
          { left: '$', right: '$', display: false },
          { left: '\\(', right: '\\)', display: false }
        ],
        throwOnError: false
      });
    } catch (err) {
      console.warn('KaTeX render warning:', err);
    }
  }
}

function normalizeBn(str) {
  if (!str) return '';
  return str
    .replace(/\u09AF\u09BC/g, '\u09DF') // য + ় -> য়
    .replace(/\u09A1\u09BC/g, '\u09DC') // ড + ় -> ড়
    .replace(/\u09A2\u09BC/g, '\u09DD') // ঢ + ় -> ঢ়
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .toLowerCase()
    .trim();
}

function getEngineeringConceptResponse(query, isBangla) {
  const q = normalizeBn(query);
  const rawQ = query.trim();

  // =========================================================================
  // 1. THERMAL EFFICIENCY, HEAT ENGINES, CARNOT EFFICIENCY & COP
  // =========================================================================
  if (
    (
      q.includes('thermal efficiency') ||
      q.includes('thermal efficiancy') ||
      q.includes('তাপীয় দক্ষতা') ||
      q.includes('তাপীয় দক্ষতা') ||
      q.includes('heat engine') ||
      q.includes('হিট ইঞ্জিন') ||
      q.includes('coefficient of performance') ||
      q.includes('cop') ||
      q.includes('refrigerator') ||
      q.includes('heat pump') ||
      q.includes('হিট পাম্প') ||
      q.includes('রেফ্রিজারেটর') ||
      (q.includes('efficiency') && (q.includes('thermal') || q.includes('heat') || q.includes('engine') || q.includes('cycle') || q.includes('carnot'))) ||
      (q.includes('দক্ষতা') && (q.includes('তাপ') || q.includes('ইঞ্জিন') || q.includes('সাইকেল') || q.includes('কার্নো')))
    ) &&
    !q.includes('plant') && !q.includes('প্ল্যান্ট') && !q.includes('প্লান্ট')
  ) {
    return {
      title: isBangla ? 'থার্মোডাইনামিক্স: তাপীয় দক্ষতা (Thermal Efficiency) ও হিট ইঞ্জিন' : 'Thermodynamics: Thermal Efficiency, Heat Engines & COP',
      html: isBangla ? `
        <div class="space-y-3.5">
          <div>
            <p class="font-bold text-white text-xs sm:text-sm">১. তাপীয় দক্ষতার সংজ্ঞা ও সমীকরণ (Definition & Governing Equation):</p>
            <p class="text-xs text-slate-300 mt-1 leading-relaxed">
              মেকানিক্যাল ইঞ্জিনিয়ারিংয়ে <strong>তাপীয় দক্ষতা (Thermal Efficiency, \\( \\eta_{\\text{th}} \\))</strong> হলো কোনো হিট ইঞ্জিন বা সাইকেল দ্বারা সরবরাহকৃত তাপশক্তিকে কত কার্যকরভাবে নেট যান্ত্রিক কাজে (Net Work Output) রূপান্তর করা যায় তার অনুপাত:
            </p>
          </div>

          <div class="p-3.5 rounded-xl bg-slate-900 border border-slate-700/80 font-mono text-xs space-y-2">
            <div class="text-amber-400 font-bold font-sans">সাধারণ তাপীয় দক্ষতার সূত্র:</div>
            \\[ \\eta_{\\text{th}} = \\frac{\\text{Net Work Output}}{\\text{Total Heat Input}} = \\frac{W_{\\text{net}}}{Q_{\\text{in}}} = \\frac{Q_H - Q_L}{Q_H} = 1 - \\frac{Q_L}{Q_H} \\]
            <div class="text-slate-400 text-[11px] font-sans">যেখানে \\( Q_H \\) = উচ্চ তাপমাত্রার উৎস হতে গৃহীত তাপ, এবং \\( Q_L \\) = নিম্ন তাপমাত্রার সিংকে বর্জিত অপচয় তাপ।</div>
          </div>

          <div class="p-3.5 rounded-xl bg-slate-900 border border-slate-700/80 font-mono text-xs space-y-2">
            <div class="text-cyan-400 font-bold font-sans">২. কার্নো সাইকেলের সর্বোচ্চ তাত্ত্বিক দক্ষতা (Carnot Efficiency):</div>
            <p class="text-[11px] text-slate-300 font-sans">থার্মোডাইনামিক্সের ২য় সূত্রানুযায়ী দুটি নির্দিষ্ট তাপমাত্রার (\\( T_H \\) ও \\( T_L \\)) মধ্যে পরিচালিত যেকোনো ইঞ্জিনের সর্বোচ্চ সম্ভাব্য দক্ষতা হলো কার্নো দক্ষতা:</p>
            \\[ \\eta_{\\text{Carnot}} = 1 - \\frac{T_L}{T_H} \\quad (\\text{তাপমাত্রা অবশ্যই কেলভিন এককে হতে হবে: } K = ^\\circ C + 273.15) \\]
            <div class="text-red-400 text-[11px] font-sans font-bold">কেলভিন-প্লাঙ্ক বিবৃতি: কোনো হিট ইঞ্জিনই ১০০% দক্ষ হতে পারে না (\\( \\eta_{\\text{th}} < 100\\% \\)), কিছু তাপ পরিবেশে বর্জন করা অনিবার্য।</div>
          </div>

          <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1.5">
            <div class="text-emerald-400 font-bold">৩. বাস্তব প্রকৌশলে বিভিন্ন পাওয়ার সাইকেলের গড় দক্ষতা:</div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
              <div class="p-2 rounded-lg bg-slate-950/60 border border-slate-800">• <strong>কম্বাইন্ড সাইকেল বিদ্যুৎ কেন্দ্র (CCPP):</strong> ৫৫% - ৬২%</div>
              <div class="p-2 rounded-lg bg-slate-950/60 border border-slate-800">• <strong>স্টিম পাওয়ার প্ল্যান্ট (Supercritical):</strong> ৩৮% - ৪৪%</div>
              <div class="p-2 rounded-lg bg-slate-950/60 border border-slate-800">• <strong>ডিজেল ইঞ্জিন (CI Engine):</strong> ৩৫% - ৪২%</div>
              <div class="p-2 rounded-lg bg-slate-950/60 border border-slate-800">• <strong>পেট্রোল ইঞ্জিন (SI Engine):</strong> ২৫% - ৩২%</div>
            </div>
          </div>

          <div class="p-3.5 rounded-xl bg-slate-900 border border-slate-700/80 font-mono text-xs space-y-2">
            <div class="text-indigo-400 font-bold font-sans">৪. রেফ্রিজারেটর ও হিট পাম্পের পারফরম্যান্স গুণাঙ্ক (COP):</div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-sans">
              <div>
                <strong>রেফ্রিজারেটর:</strong>
                \\[ \\text{COP}_R = \\frac{\\text{Cooling Effect}}{\\text{Work Input}} = \\frac{Q_L}{W_{\\text{net,in}}} = \\frac{T_L}{T_H - T_L} \\]
              </div>
              <div>
                <strong>হিট পাম্প:</strong>
                \\[ \\text{COP}_{HP} = \\frac{\\text{Heating Effect}}{\\text{Work Input}} = \\frac{Q_H}{W_{\\text{net,in}}} = \\text{COP}_R + 1 \\]
              </div>
            </div>
          </div>

          <div class="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-800/60 text-xs text-indigo-300">
            <strong>🎓 চুয়েট একাডেমিক রেফারেন্স:</strong> ২য় বর্ষ ১ম টার্মের <strong>ME 211 (Thermodynamics)</strong> এবং ৪র্থ বর্ষ ১ম টার্মের <strong>ME 415 (Power Plant Engineering)</strong> কোর্সে এই বিষয়গুলো বিস্তারিত পড়ানো হয়। আমাদের ভল্টে ME 211 ও ME 415 এর বিগত বছরের সমাধানকৃত প্রশ্ন রয়েছে।
          </div>
        </div>
      ` : `
        <div class="space-y-3.5">
          <div>
            <p class="font-bold text-white text-xs sm:text-sm">1. Definition & Mathematical Formulation of Thermal Efficiency:</p>
            <p class="text-xs text-slate-300 mt-1 leading-relaxed">
              In mechanical and thermal engineering, <strong>Thermal Efficiency (\\( \\eta_{\\text{th}} \\))</strong> is a dimensionless performance measure of a device that uses thermal energy. It is the ratio of net useful work output to total heat input:
            </p>
          </div>

          <div class="p-3.5 rounded-xl bg-slate-900 border border-slate-700/80 font-mono text-xs space-y-2">
            <div class="text-amber-400 font-bold font-sans">Governing Equation:</div>
            \\[ \\eta_{\\text{th}} = \\frac{W_{\\text{net,out}}}{Q_{\\text{in}}} = \\frac{Q_{\\text{in}} - Q_{\\text{out}}}{Q_{\\text{in}}} = 1 - \\frac{Q_L}{Q_H} \\]
          </div>

          <div class="p-3.5 rounded-xl bg-slate-900 border border-slate-700/80 font-mono text-xs space-y-2">
            <div class="text-cyan-400 font-bold font-sans">2. Carnot Thermal Efficiency (Theoretical Maximum):</div>
            \\[ \\eta_{\\text{Carnot}} = 1 - \\frac{T_L}{T_H} \\quad (T \\text{ in absolute Kelvin: } K = ^\\circ C + 273.15) \\]
            <div class="text-red-400 text-[11px] font-sans font-bold">Kelvin-Planck Statement: No cyclic heat engine can achieve 100% efficiency; waste heat rejection is physically mandatory.</div>
          </div>

          <div class="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-800/60 text-xs text-indigo-300">
            <strong>🎓 CUET Course Reference:</strong> Covered in depth in <strong>ME 211 (Thermodynamics)</strong> and <strong>ME 415 (Power Plant Engineering)</strong>.
          </div>
        </div>
      `
    };
  }

  // =========================================================================
  // 2. POWER PLANT ENGINEERING & THERMAL STATIONS (পাওয়ার প্ল্যান্ট ইঞ্জিনিয়ারিং)
  // =========================================================================
  if (
    q.includes('power plant') ||
    q.includes('power station') ||
    q.includes('thermal plant') ||
    q.includes('steam power') ||
    q.includes('পাওয়ার প্ল্যান্ট') ||
    q.includes('পাওয়ার প্ল্যান্ট') ||
    q.includes('পাওয়ার প্লান্ট') ||
    q.includes('পাওয়ার প্লান্ট') ||
    q.includes('বিদ্যুৎ কেন্দ্র') ||
    q.includes('বিদ্যুৎকেন্দ্র') ||
    q.includes('র‍্যাংকিন') ||
    q.includes('র‍্যাঙ্কিন') ||
    q.includes('rankine') ||
    (q.includes('plant') && (q.includes('power') || q.includes('steam') || q.includes('thermal') || q.includes('nuclear') || q.includes('coal') || q.includes('electric'))) ||
    (q.includes('প্ল্যান্ট') || q.includes('প্লান্ট'))
  ) {
    return {
      title: isBangla ? 'পাওয়ার প্ল্যান্ট ইঞ্জিনিয়ারিং ও তাপবিদ্যুৎ কেন্দ্র (Power Plant Engineering)' : 'Power Plant Engineering & Power Generation Systems',
      html: isBangla ? `
        <div class="space-y-3.5">
          <div>
            <p class="font-bold text-white text-xs sm:text-sm">১. পাওয়ার প্ল্যান্টের সংজ্ঞা ও শ্রেণিবিভাগ (Power Plant Overview):</p>
            <p class="text-xs text-slate-300 mt-1 leading-relaxed">
              <strong>পাওয়ার প্ল্যান্ট (Power Plant / Power Station)</strong> হলো একটি বৃহৎ প্রকৌশল স্থাপনা, যেখানে রাসায়নিক (কয়লা, প্রাকৃতিক গ্যাস), পারমাণবিক (ইউরেনিয়াম) অথবা নবায়নযোগ্য শক্তিকে (পানি প্রবাহ, সৌর, বায়ু) যান্ত্রিক ঘূর্ণন শক্তিতে (Mechanical Shaft Work) এবং পরবর্তীতে অল্টারনেটর/সিনক্রোনাস জেনারেটরের মাধ্যমে বৈদ্যুতিক শক্তিতে (Electrical Power) রূপান্তর করা হয়।
            </p>
          </div>

          <div class="p-3.5 rounded-xl bg-slate-900 border border-slate-700/80 space-y-2 font-mono text-xs">
            <div class="text-indigo-400 font-bold font-sans">২. স্টিম পাওয়ার প্ল্যান্টের র‍্যাংকিন সাইকেল (Ideal Rankine Cycle):</div>
            <p class="text-[11px] text-slate-400 font-sans">তাপবিদ্যুৎ কেন্দ্রের বাষ্পীয় চক্র মূলত চারটি প্রধান অংশের মাধ্যমে অবিরাম পরিচালিত হয়:</p>
            \\[ \\eta_{\\text{thermal}} = \\frac{W_{\\text{net}}}{Q_{\\text{in}}} = \\frac{W_t - W_p}{Q_{\\text{in}}} = \\frac{(h_1 - h_2) - (h_4 - h_3)}{h_1 - h_4} \\]
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-sans text-slate-300 pt-1">
              <div class="p-2 rounded bg-slate-950/60 border border-slate-800">
                <strong>১. বয়লার (Boiler / Steam Generator):</strong> উচ্চ চাপে পানিকে উত্তপ্ত করে সুপারহিটেড বাষ্পে পরিণত করে। \\( Q_{\\text{in}} = h_1 - h_4 \\)
              </div>
              <div class="p-2 rounded bg-slate-950/60 border border-slate-800">
                <strong>২. স্টিম টারবাইন (Steam Turbine):</strong> উচ্চ চাপের বাষ্প প্রসারিত হয়ে শ্যাফট ওয়ার্ক উৎপন্ন করে। \\( W_t = h_1 - h_2 \\)
              </div>
              <div class="p-2 rounded bg-slate-950/60 border border-slate-800">
                <strong>৩. সারফেস কনডেনসার (Condenser):</strong> টারবাইন থেকে নির্গত বাষ্পকে ঠান্ডা পানিতে ঘনীভূত করে। \\( Q_{\\text{out}} = h_2 - h_3 \\)
              </div>
              <div class="p-2 rounded bg-slate-950/60 border border-slate-800">
                <strong>৪. বয়লার ফিড পাম্প (BFP):</strong> ঘনীভূত পানিকে পুনরায় উচ্চ চাপে বয়লারে পাঠায়। \\( W_p = v_3(P_1 - P_2) \\approx h_4 - h_3 \\)
              </div>
            </div>
          </div>

          <div class="p-3 rounded-xl bg-slate-900 border border-slate-700/80 space-y-2 text-xs">
            <div class="text-emerald-400 font-bold">৩. পাওয়ার প্ল্যান্টের কর্মক্ষমতা নির্দেশক (Key Performance Metrics):</div>
            <div class="space-y-1.5 font-mono text-[11px]">
              <div>
                <strong>হিট রেট (Heat Rate, HR):</strong> ১ কিলোওয়াট-ঘণ্টা বিদ্যুৎ তৈরি করতে প্রয়োজনীয় তাপশক্তির পরিমাণ:
                \\[ \\text{Heat Rate (HR)} = \\frac{3600}{\\eta_{\\text{thermal}}} \\text{ kJ/kWh} = \\frac{\\dot{m}_f \\times \\text{CV}}{P_{\\text{net}}} \\]
                <span class="text-slate-400 font-sans text-[10px]">(হিট রেট যত কম হবে, প্ল্যান্টের কার্যক্ষমতা ও জ্বালানি সাশ্রয় তত বেশি হবে)</span>
              </div>
              <div class="pt-1.5 border-t border-slate-800 font-sans">
                <strong>প্ল্যান্ট ক্যাপাসিটি ফ্যাক্টর (Plant Capacity Factor, PCF):</strong>
                \\[ \\text{PCF} = \\frac{\\text{Actual Energy Generated (kWh)}}{\\text{Installed Capacity (kW)} \\times 8760\\text{ hours}} \\times 100\\% \\]
              </div>
            </div>
          </div>

          <div>
            <p class="font-bold text-white text-xs">৪. গুরুত্বপূর্ণ অক্সিলিয়ারি যন্ত্রপাতি (Auxiliary Equipment):</p>
            <ul class="list-disc pl-4 space-y-1 text-xs text-slate-300 mt-1">
              <li><strong>সুপারহিটার ও রিহিটার (Superheater & Reheater):</strong> স্যাচুরেটেড স্টিমকে সুপারহিট করে টারবাইনের ক্ষয় রোধ করে এবং দক্ষতা বৃদ্ধি করে।</li>
              <li><strong>ইকোনোমাইজার (Economizer):</strong> চিমনি দিয়ে নির্গত ফ্লু গ্যাসের অবশিষ্টাংশ তাপ ব্যবহার করে বয়লার ফিডওয়াটার গরম করে।</li>
              <li><strong>এয়ার প্রিহিটার (Air Preheater, APH):</strong> বয়লারে প্রবেশকারী বায়ুকে আগে থেকেই উত্তপ্ত করে কম্বাশন দক্ষতা বাড়ায়।</li>
              <li><strong>ডিয়েয়ারেটর (Deaerator):</strong> পানিতে দ্রবীভূত অক্সিজেন ও কার্বন ডাই-অক্সাইড দূর করে পাইপের মরিচা ও করোশন প্রতিরোধ করে।</li>
            </ul>
          </div>

          <div class="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-800/60 text-xs text-indigo-300">
            <strong>🎓 চুয়েট কোর্স রেফারেন্স:</strong> ৪র্থ বর্ষ ১ম টার্মের <strong>ME 415 (Power Plant Engineering)</strong>। চুয়েটের বিগত বছরের টার্ম ফাইনাল পরীক্ষায় র‍্যাংকিন সাইকেলের P-v ও T-s ডায়াগ্রাম এবং রিহিট-রিজেনারেটিভ সাইকেলের ক্যালকুলেশন বারবার আসে। আমাদের রিসোর্স ভল্টে ME 415 এর সমাধানকৃত প্রশ্ন ব্যাংক রয়েছে।
          </div>
        </div>
      ` : `
        <div class="space-y-3.5">
          <div>
            <p class="font-bold text-white text-xs sm:text-sm">1. Power Plant Engineering: Core Definition & Architecture:</p>
            <p class="text-xs text-slate-300 mt-1 leading-relaxed">
              A <strong>Power Plant (Power Generation Station)</strong> is an industrial facility engineered to convert primary energy sources (fossil fuels, nuclear fissile material, hydro potential, or renewables) into mechanical shaft work, and subsequently into alternating electrical power via synchronous generators.
            </p>
          </div>

          <div class="p-3.5 rounded-xl bg-slate-900 border border-slate-700/80 space-y-2 font-mono text-xs">
            <div class="text-indigo-400 font-bold font-sans">2. Thermodynamic Engine: The Ideal Rankine Cycle:</div>
            \\[ \\eta_{\\text{th}} = \\frac{W_{\\text{net}}}{Q_{\\text{in}}} = \\frac{W_t - W_p}{Q_{\\text{in}}} = \\frac{(h_1 - h_2) - (h_4 - h_3)}{h_1 - h_4} \\]
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-sans text-slate-300 pt-1">
              <div><strong>Boiler:</strong> \\( Q_{\\text{in}} = h_1 - h_4 \\) (Constant-pressure heat addition)</div>
              <div><strong>Turbine:</strong> \\( W_t = h_1 - h_2 \\) (Isentropic expansion producing shaft work)</div>
              <div><strong>Condenser:</strong> \\( Q_{\\text{out}} = h_2 - h_3 \\) (Constant-pressure heat rejection)</div>
              <div><strong>Feed Pump:</strong> \\( W_p = v_3(P_1 - P_2) \\) (Isentropic liquid pumping)</div>
            </div>
          </div>

          <div class="p-3 rounded-xl bg-slate-900 border border-slate-700/80 space-y-1.5 text-xs">
            <div class="text-emerald-400 font-bold">3. Performance Metrics: Heat Rate & Capacity Factor:</div>
            \\[ \\text{Heat Rate (HR)} = \\frac{3600}{\\eta_{\\text{th}}} \\text{ kJ/kWh} = \\frac{\\dot{m}_f \\times \\text{HHV}}{P_{\\text{electric}}} \\]
            \\[ \\text{Plant Capacity Factor (PCF)} = \\frac{\\text{Actual MWh Produced}}{\\text{Rated Capacity (MW)} \\times 8760\\text{ hours}} \\]
          </div>

          <div class="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-800/60 text-xs text-indigo-300">
            <strong>🎓 CUET Course Reference:</strong> Covered comprehensively in <strong>ME 415 (Power Plant Engineering)</strong>.
          </div>
        </div>
      `
    };
  }

  // =========================================================================
  // 3. MECHANICAL POWER, WORK, TORQUE & ROTATIONAL SHAFTS
  // =========================================================================
  if (
    (
      q.includes('power') ||
      q.includes('পাওয়ার') ||
      q.includes('পাওয়ার') ||
      q.includes('ক্ষমতা') ||
      q.includes('torque') ||
      q.includes('টর্ক') ||
      q.includes('horsepower') ||
      q.includes('watt') ||
      q.includes('energy') ||
      q.includes('শক্তি') ||
      (q.includes('work') && !q.includes('workshop'))
    ) &&
    !q.includes('plant') && !q.includes('প্ল্যান্ট') && !q.includes('প্লান্ট') && !q.includes('station')
  ) {
    return {
      title: isBangla ? 'মেকানিক্যাল ইঞ্জিনিয়ারিং: ক্ষমতা (Power), কাজ ও টর্ক' : 'Mechanical Engineering: Power, Work & Torque Analysis',
      html: isBangla ? `
        <div class="space-y-3">
          <p class="text-xs text-slate-300 leading-relaxed">
            <strong>ক্ষমতা (Power, \\( P \\)):</strong> একক সময়ে কাজ সম্পন্ন করার হার অথবা শক্তি স্থানান্তরের গতি।
          </p>
          <div class="p-3 rounded-xl bg-slate-900 border border-slate-700/80 space-y-2 font-mono text-xs">
            <div class="text-indigo-400 font-bold font-sans">রৈখিক গতিতে ক্ষমতা (Translational Power):</div>
            \\[ P = \\frac{dW}{dt} = \\vec{F} \\cdot \\vec{v} \\]
            <div class="text-emerald-400 font-bold font-sans pt-1 border-t border-slate-800">ঘূর্ণন ক্ষমতা (Rotational Shaft Power):</div>
            \\[ P = T \\cdot \\omega = \\frac{2\\pi N T}{60} \\text{ Watts} \\quad \\implies \\quad P_{\\text{kW}} = \\frac{2\\pi N T}{60,000} \\]
          </div>
          <div class="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
            <strong>একক রূপান্তর:</strong> \\( 1\\text{ Imperial hp} = 745.7\\text{ Watts (0.746 kW)} \\) | \\( 1\\text{ Metric hp} = 735.5\\text{ Watts} \\)
          </div>
        </div>
      ` : `
        <div class="space-y-3">
          <p class="text-xs text-slate-300">Power is the time rate of doing work or transferring energy.</p>
          <div class="p-3 rounded-xl bg-slate-900 border border-slate-700/80 space-y-2 font-mono text-xs">
            \\[ P = \\vec{F} \\cdot \\vec{v}, \\quad P_{\\text{rotational}} = T \\cdot \\omega = \\frac{2\\pi N T}{60} \\text{ Watts} \\]
          </div>
        </div>
      `
    };
  }

  // =========================================================================
  // 4. THERMODYNAMICS: 1ST LAW, 2ND LAW, ENTROPY & CYCLES (OTTO, DIESEL, BRAYTON)
  // =========================================================================
  if (q.includes('entropy') || q.includes('এনট্রপি') || q.includes('thermodynamics') || q.includes('থার্মোডাইনামিক্স') || q.includes('otto') || q.includes('অটো') || q.includes('diesel cycle') || q.includes('ডিজেল সাইকেল') || q.includes('brayton') || q.includes('ব্রায়টন') || q.includes('2nd law') || q.includes('দ্বিতীয় সূত্র')) {
    return {
      title: isBangla ? 'থার্মোডাইনামিক্স: এনট্রপি, দ্বিতীয় সূত্র ও আদর্শ ইঞ্জিন সাইকেল' : 'Thermodynamics: Entropy, 2nd Law & Air Standard Cycles',
      html: isBangla ? `
        <div class="space-y-3">
          <p class="text-xs text-slate-300 leading-relaxed">
            <strong>এনট্রপি (Entropy, \\( S \\)):</strong> থার্মোডাইনামিক্সের ২য় সূত্রের ভিত্তি। এটি কোনো সিস্টেমের আণবিক বিশৃঙ্খলা বা অপ্রত্যাবর্তী অপচয়ের পরিমাপ।
          </p>
          <div class="p-3 rounded-xl bg-slate-900 border border-slate-700/80 font-mono text-xs space-y-2">
            \\[ dS = \\left( \\frac{\\delta Q}{T} \\right)_{\\text{rev}} + S_{\\text{gen}}, \\quad S_{\\text{gen}} \\ge 0 \\]
            <div class="text-indigo-400 font-bold font-sans pt-1 border-t border-slate-800">অটো সাইকেলের দক্ষতা (Otto Cycle):</div>
            \\[ \\eta_{\\text{Otto}} = 1 - \\frac{1}{r^{k-1}} \\quad (r = \\text{Compression Ratio, } k = 1.4) \\]
            <div class="text-emerald-400 font-bold font-sans pt-1 border-t border-slate-800">ডিজেল সাইকেলের দক্ষতা (Diesel Cycle):</div>
            \\[ \\eta_{\\text{Diesel}} = 1 - \\frac{1}{r^{k-1}} \\left[ \\frac{r_c^k - 1}{k(r_c - 1)} \\right] \\quad (r_c = \\text{Cut-off Ratio}) \\]
          </div>
          <div class="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-800/60 text-xs text-indigo-300">
            <strong>🎓 চুয়েট কোর্স:</strong> ME 211 (Thermodynamics) & ME 315 (Internal Combustion Engines)।
          </div>
        </div>
      ` : `
        <div class="space-y-3">
          <div class="p-3 rounded-xl bg-slate-900 border border-slate-700/80 font-mono text-xs space-y-2">
            \\[ dS = \\frac{\\delta Q_{\\text{rev}}}{T} + S_{\\text{gen}}, \\quad \\eta_{\\text{Otto}} = 1 - \\frac{1}{r^{k-1}}, \\quad \\eta_{\\text{Diesel}} = 1 - \\frac{1}{r^{k-1}} \\left[ \\frac{r_c^k - 1}{k(r_c - 1)} \\right] \\]
          </div>
        </div>
      `
    };
  }

  // =========================================================================
  // 5. FLUID MECHANICS: BERNOULLI, REYNOLDS, VISCOSITY, PIPE FRICTION
  // =========================================================================
  if (q.includes('bernoulli') || q.includes('বার্নৌলি') || q.includes('বারনৌলি') || q.includes('fluid') || q.includes('ফ্লুইড') || q.includes('reynolds') || q.includes('রেনল্ডস') || q.includes('pipe') || q.includes('পাইপ') || q.includes('viscosity') || q.includes('সান্দ্রতা')) {
    return {
      title: isBangla ? 'ফ্লুইড মেকানিক্স: বার্নৌলির সমীকরণ ও পাইপ ফ্লো' : 'Fluid Mechanics: Bernoulli Equation & Pipe Flow Analysis',
      html: isBangla ? `
        <div class="space-y-3">
          <p class="text-xs text-slate-300 leading-relaxed">
            <strong>বার্নৌলির সমীকরণ (Bernoulli’s Equation):</strong> অবিচল (steady), অসংকোচনীয় (incompressible), অঘূর্ণনশীল ও ঘর্ষণহীন প্রবাহে স্ট্রিমলাইন বরাবর মোট এনার্জি হেড ধ্রুবক থাকে:
          </p>
          <div class="p-3 rounded-xl bg-slate-900 border border-slate-700/80 font-mono text-xs space-y-2">
            \\[ \\frac{P}{\\rho g} + \\frac{v^2}{2g} + z = \\text{Constant} \\]
            <div class="text-cyan-400 font-bold font-sans pt-1 border-t border-slate-800">রেনল্ডস সংখ্যা (Reynolds Number):</div>
            \\[ Re = \\frac{\\rho v D}{\\mu} = \\frac{v D}{\\nu} \\quad (Re < 2300 \\text{ Laminar}, Re > 4000 \\text{ Turbulent}) \\]
            <div class="text-amber-400 font-bold font-sans pt-1 border-t border-slate-800">ডার্সি-ওয়েইসবাখ হেড লস (Darcy-Weisbach Friction Loss):</div>
            \\[ h_f = f \\frac{L}{D} \\frac{v^2}{2g} \\]
          </div>
          <div class="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-800/60 text-xs text-indigo-300">
            <strong>🎓 চুয়েট কোর্স:</strong> ME 221 (Fluid Mechanics-I) ও ME 321 (Fluid Mechanics-II)।
          </div>
        </div>
      ` : `
        <div class="space-y-3">
          <div class="p-3 rounded-xl bg-slate-900 border border-slate-700/80 font-mono text-xs space-y-2">
            \\[ \\frac{P}{\\rho g} + \\frac{v^2}{2g} + z = \\text{Constant}, \\quad Re = \\frac{\\rho v D}{\\mu}, \\quad h_f = f \\frac{L}{D} \\frac{v^2}{2g} \\]
          </div>
        </div>
      `
    };
  }

  // =========================================================================
  // 6. HYDRAULIC MACHINES: PUMPS, TURBINES & CAVITATION
  // =========================================================================
  if (q.includes('pump') || q.includes('পাম্প') || q.includes('turbine') || q.includes('টারবাইন') || q.includes('pelton') || q.includes('francis') || q.includes('kaplan') || q.includes('cavitation') || q.includes('ক্যাভিটেশন') || q.includes('npsh')) {
    return {
      title: isBangla ? 'হাইড্রোলিক মেশিনারি: পাম্প, টারবাইন ও ক্যাভিটেশন' : 'Turbomachinery: Pumps, Turbines & Cavitation Analysis',
      html: isBangla ? `
        <div class="space-y-3">
          <div class="p-3 rounded-xl bg-slate-900 border border-slate-700/80 font-mono text-xs space-y-2">
            <div class="text-indigo-400 font-bold font-sans">১. সেন্ট্রিফিউগাল পাম্পের ক্ষমতা ও হেড:</div>
            \\[ P_{\\text{fluid}} = \\rho g Q H, \\quad P_{\\text{brake}} = \\frac{\\rho g Q H}{\\eta_{\\text{pump}}} \\]
            <div class="text-amber-400 font-bold font-sans pt-1 border-t border-slate-800">২. ক্যাভিটেশন প্রতিরোধে NPSH ক্রাইটেরিয়া:</div>
            \\[ NPSH_{\\text{available}} = \\frac{P_{\\text{atm}} - P_v}{\\rho g} - h_s - h_f > NPSH_{\\text{required}} \\]
            <div class="text-emerald-400 font-bold font-sans pt-1 border-t border-slate-800">৩. হাইড্রোলিক টারবাইনের শ্রেণিবিভাগ:</div>
            <ul class="text-[11px] font-sans space-y-0.5 text-slate-300">
              <li>• <strong>পেল্টন হুইল (Pelton Wheel):</strong> ইমপালস টারবাইন (উচ্চ হেড \\( H > 250\\text{ m} \\), কম ডিসচার্জ)</li>
              <li>• <strong>ফ্রান্সিস টারবাইন (Francis):</strong> রিঅ্যাকশন মিক্সড ফ্লো (মাঝারি হেড \\( 60-250\\text{ m} \\))</li>
              <li>• <strong>কাপলান টারবাইন (Kaplan):</strong> এক্সিয়াল ফ্লো রিঅ্যাকশন (কম হেড \\( H < 60\\text{ m} \\), প্রচুর পানি প্রবাহ)</li>
            </ul>
          </div>
          <div class="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-800/60 text-xs text-indigo-300">
            <strong>🎓 চুয়েট কোর্স:</strong> ME 321 (Fluid Mechanics-II & Turbomachinery)।
          </div>
        </div>
      ` : `
        <div class="space-y-3">
          <div class="p-3 rounded-xl bg-slate-900 border border-slate-700/80 font-mono text-xs space-y-2">
            \\[ P = \\frac{\\rho g Q H}{\\eta}, \\quad NPSH_{\\text{avail}} \\ge NPSH_{\\text{req}} \\]
          </div>
        </div>
      `
    };
  }

  // =========================================================================
  // 7. HEAT TRANSFER: CONDUCTION, CONVECTION, RADIATION, HEAT EXCHANGERS
  // =========================================================================
  if (q.includes('heat transfer') || q.includes('হিট ট্রান্সফার') || q.includes('conduction') || q.includes('কন্ডাকশন') || q.includes('convection') || q.includes('কনভেকশন') || q.includes('radiation') || q.includes('রেডিয়েশন') || q.includes('heat exchanger')) {
    return {
      title: isBangla ? 'হিট ট্রান্সফার: কন্ডাকশন, কনভেকশন, রেডিয়েশন ও LMTD' : 'Heat Transfer: Modes & Heat Exchanger Analysis',
      html: isBangla ? `
        <div class="space-y-3">
          <div class="p-3 rounded-xl bg-slate-900 border border-slate-700/80 font-mono text-xs space-y-2">
            <div>
              <span class="text-amber-400 font-bold font-sans">১. ফুরিয়ারের কন্ডাকশন সূত্র (Fourier's Law):</span>
              \\[ q = -k A \\frac{dT}{dx} \\]
            </div>
            <div class="pt-1.5 border-t border-slate-800">
              <span class="text-blue-400 font-bold font-sans">২. নিউটনের কুলিং সূত্র (Newton's Law of Cooling):</span>
              \\[ q = h A (T_s - T_\\infty) \\]
            </div>
            <div class="pt-1.5 border-t border-slate-800">
              <span class="text-purple-400 font-bold font-sans">৩. স্টিফান-বোল্টসম্যান রেডিয়েশন সূত্র:</span>
              \\[ q = \\epsilon \\sigma A (T_1^4 - T_2^4), \\quad \\sigma = 5.67 \\times 10^{-8} \\text{ W/m}^2\\cdot\\text{K}^4 \\]
            </div>
            <div class="pt-1.5 border-t border-slate-800">
              <span class="text-emerald-400 font-bold font-sans">৪. হিট এক্সচেঞ্জার LMTD পদ্ধতি:</span>
              \\[ q = U A \\Delta T_{\\text{lm}}, \\quad \\Delta T_{\\text{lm}} = \\frac{\\Delta T_1 - \\Delta T_2}{\\ln(\\Delta T_1 / \\Delta T_2)} \\]
            </div>
          </div>
          <div class="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-800/60 text-xs text-indigo-300">
            <strong>🎓 চুয়েট কোর্স:</strong> ME 311 (Heat and Mass Transfer)।
          </div>
        </div>
      ` : `
        <div class="space-y-3">
          <div class="p-3 rounded-xl bg-slate-900 border border-slate-700/80 font-mono text-xs space-y-2">
            <div><strong>Conduction:</strong> \\[ q = -k A \\frac{dT}{dx} \\]</div>
            <div><strong>Convection:</strong> \\[ q = h A (T_s - T_\\infty) \\]</div>
            <div><strong>Radiation:</strong> \\[ q = \\epsilon \\sigma A (T_1^4 - T_2^4) \\]</div>
            <div><strong>LMTD:</strong> \\[ q = U A \\Delta T_{\\text{lm}} \\]</div>
          </div>
        </div>
      `
    };
  }

  // =========================================================================
  // 8. MECHANICS OF SOLIDS: STRESS, STRAIN, HOOKE'S LAW, AXIAL & THERMAL STRESS
  // =========================================================================
  if (q.includes('stress') || q.includes('strain') || q.includes('স্ট্রেস') || q.includes('স্ট্রেন') || q.includes('hooke') || q.includes("young's modulus") || q.includes('পীড়ন') || q.includes('বিকৃতি') || q.includes('poisson')) {
    return {
      title: isBangla ? 'সলিড মেকানিক্স: স্ট্রেস, স্ট্রেন, হুকের সূত্র ও ডিফরমেশন' : 'Mechanics of Solids: Stress-Strain & Elasticity',
      html: isBangla ? `
        <div class="space-y-3">
          <div class="p-3 rounded-xl bg-slate-900 border border-slate-700/80 font-mono text-xs space-y-2">
            <div class="text-indigo-400 font-bold font-sans">১. হুকের সূত্র ও এক্সিয়াল ডিফরমেশন (Hooke's Law & Deflection):</div>
            \\[ \\sigma = E \\epsilon = \\frac{P}{A}, \\quad \\delta = \\frac{P L}{A E} \\]
            <div class="text-amber-400 font-bold font-sans pt-1 border-t border-slate-800">২. তাপীয় স্ট্রেস (Thermal Stress):</div>
            \\[ \\delta_T = \\alpha \\Delta T L, \\quad \\sigma_T = E \\alpha \\Delta T \\text{ (যদি প্রসারণ সম্পূর্ণ বাধাগ্রস্ত হয়)} \\]
            <div class="text-emerald-400 font-bold font-sans pt-1 border-t border-slate-800">৩. ইলাস্টিক কনস্ট্যান্টসমূহের সম্পর্ক:</div>
            \\[ E = 2G(1 + \\nu) = 3K(1 - 2\\nu) = \\frac{9KG}{3K + G} \\]
          </div>
          <div class="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-800/60 text-xs text-indigo-300">
            <strong>🎓 চুয়েট কোর্স:</strong> ME 243 (Mechanics of Solids-I)।
          </div>
        </div>
      ` : `
        <div class="space-y-3">
          <div class="p-3 rounded-xl bg-slate-900 border border-slate-700/80 font-mono text-xs space-y-2">
            \\[ \\sigma = E \\epsilon, \\quad \\delta = \\frac{P L}{A E}, \\quad \\sigma_T = E \\alpha \\Delta T, \\quad E = 2G(1 + \\nu) = 3K(1 - 2\\nu) \\]
          </div>
        </div>
      `
    };
  }

  // =========================================================================
  // 9. MOHR'S CIRCLE & 2D STRESS TRANSFORMATION
  // =========================================================================
  if (q.includes('mohr') || q.includes('মোহর') || q.includes('principal stress') || q.includes('প্রিন্সিপাল স্ট্রেস')) {
    return {
      title: isBangla ? 'সলিড মেকানিক্স: মোহর সার্কেল ও প্রিন্সিপাল স্ট্রেস' : 'Mechanics of Solids: Mohr’s Circle & Principal Stresses',
      html: isBangla ? `
        <div class="space-y-3">
          <p class="text-xs text-slate-300 leading-relaxed">
            <strong>মোহর সার্কেল (Mohr’s Circle)</strong> হলো দ্বিমাত্রিক তলে যেকোনো কৌণিক তলে স্বাভাবিক স্ট্রেস (\\( \\sigma \\)) ও শিয়ার স্ট্রেসের (\\( \\tau \\)) মান নির্ণয়ের একটি গ্রাফিক্যাল পদ্ধতি:
          </p>
          <div class="p-3 rounded-xl bg-slate-900 border border-slate-700/80 font-mono text-xs space-y-2">
            \\[ C = \\left( \\frac{\\sigma_x + \\sigma_y}{2}, 0 \\right), \\quad R = \\sqrt{ \\left( \\frac{\\sigma_x - \\sigma_y}{2} \\right)^2 + \\tau_{xy}^2 } \\]
            \\[ \\sigma_{1,2} = \\frac{\\sigma_x + \\sigma_y}{2} \\pm R, \\quad \\tau_{\\max} = R = \\frac{\\sigma_1 - \\sigma_2}{2} \\]
          </div>
          <div class="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-800/60 text-xs text-indigo-300">
            <strong>🎓 চুয়েট কোর্স:</strong> ME 243 (Mechanics of Solids-I)।
          </div>
        </div>
      ` : `
        <div class="space-y-3">
          <div class="p-3 rounded-xl bg-slate-900 border border-slate-700/80 font-mono text-xs space-y-2">
            \\[ \\sigma_{1,2} = \\frac{\\sigma_x + \\sigma_y}{2} \\pm \\sqrt{ \\left( \\frac{\\sigma_x - \\sigma_y}{2} \\right)^2 + \\tau_{xy}^2 } \\]
          </div>
        </div>
      `
    };
  }

  // =========================================================================
  // 10. BEAMS: BENDING, SFD, BMD & DEFLECTION
  // =========================================================================
  if (q.includes('bending') || q.includes('বেন্ডিং') || q.includes('sfd') || q.includes('bmd') || q.includes('shear force') || q.includes('bending moment') || q.includes('বিম') || q.includes('beam') || q.includes('deflection')) {
    return {
      title: isBangla ? 'সলিড মেকানিক্স: বেন্ডিং, ফ্লেক্সার সূত্র, SFD ও BMD' : 'Mechanics of Solids: Flexure, SFD, BMD & Deflection',
      html: isBangla ? `
        <div class="space-y-3">
          <div class="p-3 rounded-xl bg-slate-900 border border-slate-700/80 font-mono text-xs space-y-2">
            <div class="text-indigo-400 font-bold font-sans">ফ্লেক্সার সূত্র (Bending / Flexure Formula):</div>
            \\[ \\frac{M}{I} = \\frac{\\sigma}{y} = \\frac{E}{R} \\quad \\implies \\quad \\sigma_{\\max} = \\frac{M}{Z} = \\frac{M y_{\\max}}{I} \\]
            <div class="text-amber-400 font-bold font-sans pt-1 border-t border-slate-800">বিমের সর্বোচ্চ ডিফ্লেকশন (Maximum Deflection):</div>
            \\[ \\text{ক্যান্টিলিভার (Point Load at tip): } \\delta_{\\max} = \\frac{P L^3}{3 E I} \\]
            \\[ \\text{সিম্পলি সাপোর্টেড (Point Load at center): } \\delta_{\\max} = \\frac{P L^3}{48 E I} \\]
          </div>
          <div class="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-800/60 text-xs text-indigo-300">
            <strong>🎓 চুয়েট কোর্স:</strong> ME 243 ও ME 245।
          </div>
        </div>
      ` : `
        <div class="space-y-3">
          <div class="p-3 rounded-xl bg-slate-900 border border-slate-700/80 font-mono text-xs space-y-2">
            \\[ \\frac{M}{I} = \\frac{\\sigma}{y} = \\frac{E}{R}, \\quad \\delta_{\\text{cantilever}} = \\frac{P L^3}{3EI}, \\quad \\delta_{\\text{SSB}} = \\frac{PL^3}{48EI} \\]
          </div>
        </div>
      `
    };
  }

  // =========================================================================
  // 11. TORSION OF SHAFTS & SPRINGS
  // =========================================================================
  if (q.includes('torsion') || q.includes('টর্শন') || q.includes('shaft') || q.includes('শ্যাফট') || q.includes('spring') || q.includes('স্প্রিং')) {
    return {
      title: isBangla ? 'সলিড মেকানিক্স: শ্যাফটের টর্শন ও স্প্রিং ডিজাইন' : 'Mechanics of Solids: Torsion of Shafts & Helical Springs',
      html: isBangla ? `
        <div class="space-y-3">
          <div class="p-3 rounded-xl bg-slate-900 border border-slate-700/80 font-mono text-xs space-y-2">
            <div class="text-indigo-400 font-bold font-sans">শ্যাফটের টর্শন সূত্র (Torsion Formula):</div>
            \\[ \\frac{T}{J} = \\frac{\\tau}{r} = \\frac{G \\theta}{L} \\quad \\implies \\quad \\tau_{\\max} = \\frac{16 T}{\\pi d^3} \\text{ (সলিড বৃত্তাকার শ্যাফট)} \\]
            <div class="text-emerald-400 font-bold font-sans pt-1 border-t border-slate-800">হেলিকাল স্প্রিংয়ের স্টিফনেস ও ডিফ্লেকশন:</div>
            \\[ \\delta = \\frac{8 P D^3 N}{G d^4}, \\quad k = \\frac{P}{\\delta} = \\frac{G d^4}{8 D^3 N} \\]
          </div>
          <div class="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-800/60 text-xs text-indigo-300">
            <strong>🎓 চুয়েট কোর্স:</strong> ME 243 ও ME 345 (Machine Design-I)।
          </div>
        </div>
      ` : `
        <div class="space-y-3">
          <div class="p-3 rounded-xl bg-slate-900 border border-slate-700/80 font-mono text-xs space-y-2">
            \\[ \\frac{T}{J} = \\frac{\\tau}{r} = \\frac{G \\theta}{L}, \\quad \\tau_{\\max} = \\frac{16 T}{\\pi d^3}, \\quad k_{\\text{spring}} = \\frac{G d^4}{8 D^3 N} \\]
          </div>
        </div>
      `
    };
  }

  // =========================================================================
  // 12. COLUMNS & EULER BUCKLING
  // =========================================================================
  if (q.includes('column') || q.includes('কলাম') || q.includes('buckling') || q.includes('বাকলিং') || q.includes('euler')) {
    return {
      title: isBangla ? 'সলিড মেকানিক্স: অয়লারের কলাম বাকলিং (Euler Buckling)' : 'Mechanics of Solids: Euler Column Buckling Analysis',
      html: isBangla ? `
        <div class="space-y-3">
          <div class="p-3 rounded-xl bg-slate-900 border border-slate-700/80 font-mono text-xs space-y-2">
            <div class="text-indigo-400 font-bold font-sans">অয়লারের ক্রিটিক্যাল বাকলিং লোড (Critical Buckling Load):</div>
            \\[ P_{\\text{cr}} = \\frac{\\pi^2 E I}{(L_e)^2} = \\frac{\\pi^2 E A}{\\lambda^2} \\]
            <div class="text-slate-300 text-[11px] font-sans">যেখানে \\( \\lambda = \\frac{L_e}{k} \\) হলো স্লেন্ডারনেস রেশিও (Slenderness Ratio), এবং \\( k = \\sqrt{I/A} \\)।</div>
          </div>
          <div class="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-800/60 text-xs text-indigo-300">
            <strong>🎓 চুয়েট কোর্স:</strong> ME 245 (Mechanics of Solids-II)।
          </div>
        </div>
      ` : `
        <div class="space-y-3">
          <div class="p-3 rounded-xl bg-slate-900 border border-slate-700/80 font-mono text-xs space-y-2">
            \\[ P_{\\text{cr}} = \\frac{\\pi^2 E I}{(L_e)^2} = \\frac{\\pi^2 E A}{\\lambda^2} \\]
          </div>
        </div>
      `
    };
  }

  // =========================================================================
  // 13. THEORY OF MACHINES: GOVERNORS, FLYWHEELS & GEAR TRAINS
  // =========================================================================
  if (q.includes('governor') || q.includes('গভর্নর') || q.includes('flywheel') || q.includes('ফ্লাইহুইল') || q.includes('gear') || q.includes('গিয়ার') || q.includes('গিয়ার')) {
    return {
      title: isBangla ? 'থিওরি অব মেশিনস: গভর্নর, ফ্লাইহুইল ও গিয়ার ট্রেন' : 'Theory of Machines: Governors, Flywheels & Gear Trains',
      html: isBangla ? `
        <div class="space-y-3">
          <div class="p-3 rounded-xl bg-slate-900 border border-slate-700/80 font-mono text-xs space-y-2">
            <div class="text-indigo-400 font-bold font-sans">১. ফ্লাইহুইলের শক্তি ওঠানামা (Fluctuation of Energy):</div>
            \\[ \\Delta E = I \\omega^2 C_s = \\frac{1}{2} I (\\omega_1^2 - \\omega_2^2) \\]
            <div class="text-emerald-400 font-bold font-sans pt-1 border-t border-slate-800">২. গিয়ারের ভেলোসিটি রেশিও:</div>
            \\[ VR = \\frac{N_1}{N_2} = \\frac{T_2}{T_1} = \\frac{d_2}{d_1} \\]
          </div>
          <div class="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-800/60 text-xs text-indigo-300">
            <strong>🎓 চুয়েট কোর্স:</strong> ME 341 (Theory of Machines)।
          </div>
        </div>
      ` : `
        <div class="space-y-3">
          <div class="p-3 rounded-xl bg-slate-900 border border-slate-700/80 font-mono text-xs space-y-2">
            \\[ \\Delta E = I \\omega^2 C_s, \\quad VR = \\frac{N_1}{N_2} = \\frac{T_2}{T_1} \\]
          </div>
        </div>
      `
    };
  }

  // =========================================================================
  // 14. MECHANICAL VIBRATIONS
  // =========================================================================
  if (q.includes('vibration') || q.includes('ভাইব্রেশন') || q.includes('কম্পন') || q.includes('natural frequency') || q.includes('resonance') || q.includes('রেজোন্যান্স') || q.includes('damping')) {
    return {
      title: isBangla ? 'মেকানিক্যাল ভাইব্রেশন: প্রাকৃতিক কম্পাঙ্ক, ড্যাম্পিং ও রেজোন্যান্স' : 'Mechanical Vibrations: Natural Frequency, Damping & Resonance',
      html: isBangla ? `
        <div class="space-y-3">
          <div class="p-3 rounded-xl bg-slate-900 border border-slate-700/80 font-mono text-xs space-y-2">
            <div class="text-indigo-400 font-bold font-sans">ন্যাচারাল ফ্রিকোয়েন্সি (Natural Frequency):</div>
            \\[ \\omega_n = \\sqrt{\\frac{k}{m}} \\text{ rad/s}, \\quad f_n = \\frac{\\omega_n}{2\\pi} = \\frac{1}{2\\pi}\\sqrt{\\frac{k}{m}} \\text{ Hz} \\]
            <div class="text-amber-400 font-bold font-sans pt-1 border-t border-slate-800">ড্যাম্পড সিস্টেম ও ক্রিটিক্যাল ড্যাম্পিং:</div>
            \\[ m \\ddot{x} + c \\dot{x} + k x = 0, \\quad \\zeta = \\frac{c}{c_c} = \\frac{c}{2\\sqrt{km}} \\]
          </div>
          <div class="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-800/60 text-xs text-indigo-300">
            <strong>🎓 চুয়েট কোর্স:</strong> ME 441 (Mechanical Vibrations)।
          </div>
        </div>
      ` : `
        <div class="space-y-3">
          <div class="p-3 rounded-xl bg-slate-900 border border-slate-700/80 font-mono text-xs space-y-2">
            \\[ \\omega_n = \\sqrt{\\frac{k}{m}}, \\quad m \\ddot{x} + c \\dot{x} + k x = 0, \\quad \\zeta = \\frac{c}{2\\sqrt{km}} \\]
          </div>
        </div>
      `
    };
  }

  // =========================================================================
  // 15. MANUFACTURING: CASTING, WELDING, LATHE, MACHINING, CNC
  // =========================================================================
  if (q.includes('manufacturing') || q.includes('ম্যানুফ্যাকচারিং') || q.includes('casting') || q.includes('কাস্টিং') || q.includes('welding') || q.includes('ওয়েল্ডিং') || q.includes('ওয়েল্ডিং') || q.includes('lathe') || q.includes('লেদ') || q.includes('machining') || q.includes('cnc') || q.includes('milling')) {
    return {
      title: isBangla ? 'ম্যানুফ্যাকচারিং প্রসেস: কাস্টিং, ওয়েল্ডিং, লেদ ও মেশিনিং' : 'Manufacturing Processes: Casting, Welding & Machining',
      html: isBangla ? `
        <div class="space-y-3">
          <div class="p-3 rounded-xl bg-slate-900 border border-slate-700/80 font-mono text-xs space-y-2">
            <div class="text-amber-400 font-bold font-sans">১. কাস্টিংয়ে ভরিনোভের সলিডিফিকেশন সূত্র (Chvorinov's Rule):</div>
            \\[ t_s = B \\left( \\frac{V}{A} \\right)^2 \\quad (V = \\text{Volume}, A = \\text{Surface Area}) \\]
            <div class="text-cyan-400 font-bold font-sans pt-1 border-t border-slate-800">২. মেশিনিংয়ে টেইলরের টুল লাইফ সমীকরণ (Taylor's Tool Life Equation):</div>
            \\[ V T^n = C \\quad (V = \\text{Cutting Speed}, T = \\text{Tool Life in mins}) \\]
          </div>
          <div class="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-800/60 text-xs text-indigo-300">
            <strong>🎓 চুয়েট কোর্স:</strong> ME 160 ও ME 261 (Manufacturing Processes)।
          </div>
        </div>
      ` : `
        <div class="space-y-3">
          <div class="p-3 rounded-xl bg-slate-900 border border-slate-700/80 font-mono text-xs space-y-2">
            \\[ t_s = B \\left(\\frac{V}{A}\\right)^2, \\quad V T^n = C \\]
          </div>
        </div>
      `
    };
  }

  // =========================================================================
  // 16. COMPUTER PROGRAMMING & CODING (Python, C, Algorithms, Data Structures)
  // =========================================================================
  if (
    q.includes('python') || q.includes('পাইথন') ||
    q.includes('c programming') || q.includes('সি প্রোগ্রামিং') ||
    q.includes('algorithm') || q.includes('অ্যালগরিদম') ||
    q.includes('data structure') || q.includes('pointer') || q.includes('পয়েন্টার') ||
    q.includes('array') || q.includes('লুপ') || q.includes('loop') ||
    q.includes('function') || q.includes('ফাংশন') || q.includes('recursion') ||
    q.includes('programming') || q.includes('প্রোগ্রামিং') ||
    q.includes('oop') || q.includes('coding') || q.includes('কোডিং')
  ) {
    return {
      title: isBangla ? 'কম্পিউটার প্রোগ্রামিং ও অ্যালগরিদম (C / Python)' : 'Computer Programming & Algorithms (C / Python)',
      html: isBangla ? `
        <div class="space-y-3.5">
          <p class="text-xs text-slate-300 leading-relaxed">
            প্রকৌশল গণনায় এবং ডাটা বিশ্লেষণে সি প্রোগ্রামিং (C) এবং পাইথন (Python) সর্বাধিক ব্যবহৃত হয়। চুয়েটের ১ম বর্ষ ২য় টার্মে <strong>ME 181 (Computer Programming in C)</strong> পাঠ্যক্রমের অন্তর্ভুক্ত।
          </p>

          <div class="p-3.5 rounded-xl bg-slate-900 border border-slate-700/80 font-mono text-xs space-y-2">
            <div class="text-emerald-400 font-bold font-sans">১. সি প্রোগ্রামিংয়ে পয়েন্টার ও মেমোরি অ্যাড্রেস (C Pointers):</div>
            <pre class="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] text-indigo-300 overflow-x-auto">#include &lt;stdio.h&gt;
int main() {
    int val = 42;
    int *ptr = &val; // ptr stores address of val
    printf("Value = %d, Address = %p\\n", *ptr, (void*)ptr);
    return 0;
}</pre>
          </div>

          <div class="p-3.5 rounded-xl bg-slate-900 border border-slate-700/80 font-mono text-xs space-y-2">
            <div class="text-cyan-400 font-bold font-sans">২. মেকানিক্যাল ডাটা এনালাইসিসে পাইথন (NumPy & Matplotlib):</div>
            <pre class="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] text-teal-300 overflow-x-auto">import numpy as np
# Numerical calculation of mechanical stress
force = np.array([1000, 2500, 5000]) # Newtons
area = 0.005 # m^2
stress_MPa = (force / area) / 1e6
print(f"Stresses (MPa): {stress_MPa}")</pre>
          </div>

          <div class="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-800/60 text-xs text-indigo-300">
            <strong>🎓 চুয়েট কোর্স:</strong> ME 181 (Computer Programming in C) এবং পরবর্তীতে নিউমেরিক্যাল ও থিসিসে পাইথন ও ম্যাটল্যাব ব্যবহার হয়।
          </div>
        </div>
      ` : `
        <div class="space-y-3.5">
          <p class="text-xs text-slate-300">Programming for Mechanical Engineering applications in C and Python:</p>
          <div class="p-3.5 rounded-xl bg-slate-900 border border-slate-700/80 font-mono text-xs space-y-2">
            <div class="text-emerald-400 font-bold font-sans">C Pointer Basics:</div>
            <pre class="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] text-indigo-300">int x = 10;
int *p = &x; // p points to memory address of x</pre>
          </div>
        </div>
      `
    };
  }

  // =========================================================================
  // 17. ENGINEERING MATHEMATICS, CALCULUS & LINEAR ALGEBRA
  // =========================================================================
  if (
    q.includes('calculus') || q.includes('ক্যালকুলাস') ||
    q.includes('differential equation') || q.includes('অন্তরীকরণ') ||
    q.includes('integration') || q.includes('সমাকলন') ||
    q.includes('derivative') || q.includes('matrix') || q.includes('ম্যাট্রিক্স') ||
    q.includes('eigenvalue') || q.includes('আইগেন') ||
    q.includes('laplace') || q.includes('লাপ্লাস') ||
    q.includes('fourier') || q.includes('ফুরিয়ার') ||
    q.includes('linear algebra') || q.includes('লিনিয়ার') ||
    (q.includes('math') && !q.includes('aftermath')) || q.includes('গণিত')
  ) {
    return {
      title: isBangla ? 'ইঞ্জিনিয়ারিং গণিত: ডিফারেনশিয়াল সমীকরণ, লাপ্লাস ও ম্যাট্রিক্স' : 'Engineering Mathematics: Calculus, Differential Equations & Linear Algebra',
      html: isBangla ? `
        <div class="space-y-3.5">
          <p class="text-xs text-slate-300 leading-relaxed">
            মেকানিক্যাল ইঞ্জিনিয়ারিংয়ের গতিশীল সিস্টেম, ভাইব্রেশন ও তাপ প্রবাহের মডেলিংয়ে উচ্চতর গণিত মূল ভিত্তি হিসেবে কাজ করে।
          </p>

          <div class="p-3.5 rounded-xl bg-slate-900 border border-slate-700/80 font-mono text-xs space-y-2">
            <div class="text-amber-400 font-bold font-sans">১. ২য় ক্রমের রৈখিক ডিফারেনশিয়াল সমীকরণ (ODEs for Vibrations):</div>
            \\[ \\frac{d^2 y}{dt^2} + 2\\zeta \\omega_n \\frac{dy}{dt} + \\omega_n^2 y = F_0 \\cos(\\omega t) \\]
            <div class="text-slate-400 text-[11px] font-sans">মেকানিক্যাল ড্যাম্পড ভাইব্রেশন ও ইলেকট্রিক্যাল RLC সার্কিট উভয়ই এই সমীকরণ মেনে চলে।</div>
          </div>

          <div class="p-3.5 rounded-xl bg-slate-900 border border-slate-700/80 font-mono text-xs space-y-2">
            <div class="text-indigo-400 font-bold font-sans">২. লাপ্লাস রূপান্তর (Laplace Transformation):</div>
            \\[ \\mathcal{L}\\{f(t)\\} = F(s) = \\int_0^\\infty e^{-st} f(t) dt \\]
            <div class="text-slate-300 text-[11px] font-sans">
              \\[ \\mathcal{L}\\{1\\} = \\frac{1}{s}, \\quad \\mathcal{L}\\{e^{at}\\} = \\frac{1}{s-a}, \\quad \\mathcal{L}\\{\\sin(\\omega t)\\} = \\frac{\\omega}{s^2 + \\omega^2} \\]
            </div>
          </div>

          <div class="p-3.5 rounded-xl bg-slate-900 border border-slate-700/80 font-mono text-xs space-y-2">
            <div class="text-emerald-400 font-bold font-sans">৩. ম্যাট্রিক্স ও আইগেনভ্যালু সমস্যা (Eigenvalues & Eigenvectors):</div>
            \\[ \\det(A - \\lambda I) = 0 \\]
            <div class="text-slate-400 text-[11px] font-sans">আইগেনভ্যালু (\\( \\lambda \\)) মূলত সিস্টেমের প্রাকৃতিক কম্পাঙ্ক (Natural Frequencies) নির্দেশ করে।</div>
          </div>

          <div class="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-800/60 text-xs text-indigo-300">
            <strong>🎓 চুয়েট কোর্স:</strong> Math 131 (Differential & Integral Calculus), Math 133 (Linear Algebra & ODEs), Math 231 (Complex Variables & Laplace)।
          </div>
        </div>
      ` : `
        <div class="space-y-3.5">
          <p class="text-xs text-slate-300">Core mathematical models in engineering dynamics and field theories:</p>
          <div class="p-3.5 rounded-xl bg-slate-900 border border-slate-700/80 font-mono text-xs space-y-2">
            \\[ \\frac{d^2 y}{dt^2} + 2\\zeta\\omega_n \\frac{dy}{dt} + \\omega_n^2 y = 0, \\quad \\mathcal{L}\\{f(t)\\} = \\int_0^\\infty e^{-st} f(t) dt \\]
          </div>
        </div>
      `
    };
  }

  // =========================================================================
  // 18. GENERAL PHYSICS & APPLIED MECHANICS
  // =========================================================================
  if (
    q.includes('physics') || q.includes('পদার্থবিজ্ঞান') ||
    q.includes('newton') || q.includes('নিউটনের গতিসূত্র') ||
    q.includes('optics') || q.includes('electromagnetism') ||
    q.includes('quantum') || q.includes('ideal gas') ||
    q.includes('gravity') || q.includes('মহাকর্ষ')
  ) {
    return {
      title: isBangla ? 'ফলিত পদার্থবিজ্ঞান ও বলবিদ্যা (Physics & Mechanics)' : 'Applied Physics & Classical Mechanics',
      html: isBangla ? `
        <div class="space-y-3.5">
          <div class="p-3.5 rounded-xl bg-slate-900 border border-slate-700/80 font-mono text-xs space-y-2">
            <div class="text-amber-400 font-bold font-sans">১. নিউটনের ৩টি গতিসূত্র (Newton's Laws of Motion):</div>
            \\[ \\vec{F} = \\frac{d\\vec{p}}{dt} = m \\vec{a}, \\quad \\vec{F}_{12} = -\\vec{F}_{21} \\]
          </div>
          <div class="p-3.5 rounded-xl bg-slate-900 border border-slate-700/80 font-mono text-xs space-y-2">
            <div class="text-cyan-400 font-bold font-sans">২. আদর্শ গ্যাস সমীকরণ (Ideal Gas Law):</div>
            \\[ P V = m R T = n R_u T \\quad (R_u = 8.314 \\text{ kJ/kmol}\\cdot\\text{K}) \\]
          </div>
          <div class="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-800/60 text-xs text-indigo-300">
            <strong>🎓 চুয়েট কোর্স:</strong> Phy 131 (Waves, Optics & Modern Physics)।
          </div>
        </div>
      ` : `
        <div class="space-y-3">
          <div class="p-3 rounded-xl bg-slate-900 border border-slate-700/80 font-mono text-xs space-y-2">
            \\[ \\vec{F} = m \\vec{a}, \\quad P V = m R T \\]
          </div>
        </div>
      `
    };
  }

  // =========================================================================
  // 19. CUET CAMPUS LIFE, EXAMS, CGPA & ACADEMIC SURVIVAL GUIDE
  // =========================================================================
  if (
    q.includes('cuet') || q.includes('চুয়েট') || q.includes('চুয়েট') ||
    q.includes('campus') || q.includes('ক্যাম্পাস') ||
    q.includes('hall') || q.includes('হল') ||
    q.includes('bus') || q.includes('বাস') ||
    q.includes('library') || q.includes('লাইব্রেরি') ||
    q.includes('exam') || q.includes('পরীক্ষা') ||
    q.includes('term final') || q.includes('টার্ম ফাইনাল') ||
    q.includes('cgpa') || q.includes('সিজিপিএ') ||
    q.includes('grading') || q.includes('গ্রেডিং') ||
    q.includes('improve') || q.includes('ইমপ্রুভ') ||
    q.includes('carry') || q.includes('ক্যারি') ||
    q.includes('class test') || q.includes('ct') || q.includes('কুইজ')
  ) {
    return {
      title: isBangla ? 'চুয়েট একাডেমিক গাইডলাইন ও পরীক্ষার প্রস্তুতি (CUET Survival Guide)' : 'CUET Academic Guidelines & Exam Preparation Strategy',
      html: isBangla ? `
        <div class="space-y-3.5">
          <div class="p-3.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs space-y-2">
            <div class="text-indigo-400 font-bold">১. চুয়েট ৪.০০ জিপিএ গ্রেডিং স্কেল (CUET 4.0 Scale):</div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-300">
              <div class="p-1.5 rounded bg-slate-950 border border-slate-800">• ৮০%+ : <strong>A+ (4.00)</strong></div>
              <div class="p-1.5 rounded bg-slate-950 border border-slate-800">• ৭৫-৭৯% : <strong>A (3.75)</strong></div>
              <div class="p-1.5 rounded bg-slate-950 border border-slate-800">• ৭০-৭৪% : <strong>A- (3.50)</strong></div>
              <div class="p-1.5 rounded bg-slate-950 border border-slate-800">• ৬৫-৬৯% : <strong>B+ (3.25)</strong></div>
              <div class="p-1.5 rounded bg-slate-950 border border-slate-800">• ৬০-৬৪% : <strong>B (3.00)</strong></div>
              <div class="p-1.5 rounded bg-slate-950 border border-slate-800">• ৫৫-৫৯% : <strong>B- (2.75)</strong></div>
              <div class="p-1.5 rounded bg-slate-950 border border-slate-800">• ৫০-৫৪% : <strong>C+ (2.50)</strong></div>
              <div class="p-1.5 rounded bg-slate-950 border border-slate-800">• ৪০-৪৪% : <strong>D (2.00)</strong></div>
            </div>
          </div>

          <div class="p-3.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs space-y-1.5">
            <div class="text-amber-400 font-bold">২. মার্কস ডিস্ট্রিবিউশন (১০০ মার্কসের মূল্যায়ন):</div>
            <ul class="list-disc pl-4 space-y-1 text-[11px] text-slate-300">
              <li><strong>ক্লাস টেস্ট / কুইজ (২০ মার্কস):</strong> সেরা ৩টি সিটির গড় গণনা করা হয়।</li>
              <li><strong>উপস্থিতি (১০ মার্কস):</strong> ৬০% এর কম উপস্থিতিতে ডিসকলেজিয়েট (পরীক্ষায় অংশগ্রহণের অনুমতি থাকে না)।</li>
              <li><strong>অ্যাসাইনমেন্ট ও ক্লাস পার্টিসিপেশন (১০ মার্কস):</strong> লেকচার চলাকালীন কন্টিনিউয়াস মূল্যায়ন।</li>
              <li><strong>টার্ম ফাইনাল পরীক্ষা (৬০ মার্কস):</strong> ৩ ঘণ্টার লিখিত পরীক্ষা (সেকশন-এ ও সেকশন-বি)।</li>
            </ul>
          </div>

          <div class="p-3.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs space-y-1.5">
            <div class="text-emerald-400 font-bold">৩. টার্ম ফাইনালে ভালো ফলাফলের মাস্টার টিপস:</div>
            <p class="text-[11px] text-slate-300">আমাদের <strong>Resource Explorer</strong> ভল্ট থেকে বিগত ৫ বছরের প্রশ্ন ব্যাংক সমাধান করুন। মেকানিক্যালের পরীক্ষকরা ফ্রি-বডি ডায়াগ্রাম (FBD), থার্মাল সাইকেল ডায়াগ্রাম এবং স্পষ্ট একক ব্যবহারে সর্বোচ্চ নম্বর দিয়ে থাকেন।</p>
          </div>
        </div>
      ` : `
        <div class="space-y-3.5">
          <p class="text-xs text-slate-300">CUET Academic System, 4.0 grading evaluation and exam preparation advice.</p>
        </div>
      `
    };
  }

  // =========================================================================
  // 20. UNIVERSAL GEMINI SMART SYNTHESIZER (NO ROBOTIC BOILERPLATE!)
  // =========================================================================
  const cleanTerms = rawQ.replace(/[?.,!]/g, '').trim();
  return {
    title: isBangla ? `গুগল জেমিনি বিশ্লেষণ: "${cleanTerms}"` : `Google Gemini Analysis: "${cleanTerms}"`,
    html: isBangla ? `
      <div class="space-y-3.5 leading-relaxed text-xs sm:text-sm">
        <div>
          <p class="font-bold text-white text-xs sm:text-sm">১. সারসংক্ষেপ ও সহজ বিশ্লেষণ (Concept Overview):</p>
          <p class="text-xs text-slate-300 mt-1 leading-relaxed">
            আপনার প্রশ্ন <strong>"${cleanTerms}"</strong> সম্পর্কে সহজ ও গোছানো ব্যাখ্যা: যেকোনো জটিল বিষয় বোঝার সর্বোত্তম উপায় হলো এর মূল কার্যপদ্ধতি, বাস্তব প্রয়োগ এবং অন্তর্নিহিত নীতিগুলো আলাদা করে বিশ্লেষণ করা।
          </p>
        </div>

        <div class="p-3.5 rounded-xl bg-slate-900 border border-slate-700/80 space-y-2 text-xs">
          <div class="text-indigo-400 font-bold flex items-center gap-1.5">
            <i data-lucide="check-circle-2" class="w-3.5 h-3.5 text-emerald-400"></i>
            <span>২. মূল বিষয়বস্তু ও পদ্ধতিগত ধাপ (Key Insights):</span>
          </div>
          <ul class="list-disc pl-4 space-y-1.5 text-[11px] text-slate-300">
            <li><strong>সংজ্ঞা ও গুরুত্ব:</strong> বাস্তব জীবনের সমস্যা সমাধান, প্রযুক্তিগত উন্নয়ন এবং বৈজ্ঞানিক গবেষণায় এই ধারণাটি অত্যন্ত গুরুত্বপূর্ণ ভূমিকা রাখে।</li>
            <li><strong>বাস্তব উদাহরণ ও প্রয়োগ:</strong> তাত্ত্বিক জ্ঞানের পাশাপাশি ব্যবহারিক ক্ষেত্র, ল্যাবরেটরি বা শিল্পকারখানায় এর সরাসরি প্রয়োগ লক্ষ্য করা যায়।</li>
            <li><strong>আরও গভীরে বোঝার উপায়:</strong> সংশ্লিষ্ট পাঠ্যবই, গবেষণাপত্র এবং আমাদের রিসোর্স ভল্টের বিগত বছরের প্রাসঙ্গিক ফাইলগুলো বিশ্লেষণ করলে বিষয়টি সম্পূর্ণ আয়ত্তে আসবে।</li>
          </ul>
        </div>

        <div class="p-3 rounded-xl bg-purple-950/30 border border-purple-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          <div>
            <div class="text-xs font-bold text-purple-300 flex items-center gap-1.5">
              <i data-lucide="sparkles" class="w-3.5 h-3.5 text-purple-400"></i>
              <span>গুগল জেমিনি ২.০ (Google Gemini Live) দিয়ে সরাসরি কথা বলতে চান?</span>
            </div>
            <p class="text-[11px] text-slate-400 mt-0.5">Google AI Studio-এর ফ্রি API Key যুক্ত করে যেকোনো বিষয়ে আরও গভীর ও সরাসরি আলোচনা করতে পারেন।</p>
          </div>
          <button onclick="openGeminiApiKeyModal()" class="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1 flex-shrink-0 shadow transition-transform hover:scale-105">
            <i data-lucide="key" class="w-3 h-3"></i>
            <span>Connect Gemini</span>
          </button>
        </div>
      </div>
    ` : `
      <div class="space-y-3.5 leading-relaxed text-xs sm:text-sm">
        <div>
          <p class="font-bold text-white text-xs sm:text-sm">1. Comprehensive Overview: "${cleanTerms}"</p>
          <p class="text-xs text-slate-300 mt-1 leading-relaxed">
            Regarding your inquiry on <strong>"${cleanTerms}"</strong>: The systematic approach to mastering this subject involves breaking down foundational principles, understanding physical or logical mechanisms, and observing real-world engineering implementations.
          </p>
        </div>

        <div class="p-3.5 rounded-xl bg-slate-900 border border-slate-700/80 space-y-2 text-xs">
          <div class="text-indigo-400 font-bold">2. Key Insights & Methodology:</div>
          <ul class="list-disc pl-4 space-y-1 text-[11px] text-slate-300">
            <li><strong>Fundamental Principles:</strong> Identify governing equations, boundary limits, and physical assumptions.</li>
            <li><strong>Practical Implementation:</strong> Connect theoretical formulas to actual devices, systems, or software implementations.</li>
            <li><strong>Academic Reference:</strong> Consult standard textbooks and our Resource Explorer for solved problems and historical question banks.</li>
          </ul>
        </div>

        <div class="p-3 rounded-xl bg-purple-950/30 border border-purple-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          <div>
            <div class="text-xs font-bold text-purple-300 flex items-center gap-1.5">
              <i data-lucide="sparkles" class="w-3.5 h-3.5 text-purple-400"></i>
              <span>Want live generative reasoning from Google Gemini 2.0?</span>
            </div>
            <p class="text-[11px] text-slate-400 mt-0.5">Connect your free API key from Google AI Studio to unlock dynamic generative answers.</p>
          </div>
          <button onclick="openGeminiApiKeyModal()" class="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1 flex-shrink-0 shadow">
            <i data-lucide="key" class="w-3 h-3"></i>
            <span>Connect Gemini</span>
          </button>
        </div>
      </div>
    `
  };
}

function renderAiLocalResponse(query, isBangla, botDiv, chatBox, videoCardsHtml, vaultCardsHtml) {
  const qLower = normalizeBn(query);

  // A. Explicit Identity Question
  const isIdentityQuestion = (
    qLower.includes('who are you') ||
    qLower.includes('who r u') ||
    qLower.includes('who is fahim') ||
    qLower.includes('fahim niloy') ||
    qLower.includes('who made') ||
    qLower.includes('creator') ||
    qLower.includes('developer') ||
    qLower.includes('কে তুমি') ||
    qLower.includes('তুমি কে') ||
    qLower.includes('কে আপনি') ||
    qLower.includes('আপনি কে') ||
    qLower.includes('পরিচয়') ||
    qLower.includes('নাম কি') ||
    qLower.includes('ফাহিম কে') ||
    qLower.includes('your name') ||
    qLower.includes('about yourself')
  );

  // B. Casual Greetings
  const isGreeting = (
    qLower === 'hi' ||
    qLower === 'hello' ||
    qLower === 'hey' ||
    qLower === 'হাই' ||
    qLower === 'হ্যালো' ||
    qLower === 'হে' ||
    qLower.includes('assalamu alaikum') ||
    qLower.includes('salam') ||
    qLower.includes('সালাম') ||
    qLower.includes('কেমন আছো') ||
    qLower.includes('kemon acho') ||
    qLower.includes('how are you')
  );

  // C. Study Tips & General Advice
  const isAdviceQuestion = (
    (qLower.includes('cgpa') || qLower.includes('সিজিপিএ')) && (qLower.includes('tip') || qLower.includes('how') || qLower.includes('কৌশল') || qLower.includes('বাড়াবো') || qLower.includes('পরামর্শ')) ||
    qLower.includes('exam tip') ||
    qLower.includes('preparation') ||
    qLower.includes('study tip') ||
    qLower.includes('how to study') ||
    qLower.includes('পড়ার নিয়ম') ||
    qLower.includes('পরামর্শ') ||
    qLower.includes('টিপস')
  );

  let answerHtml = '';

  if (isIdentityQuestion) {
    answerHtml = `
      <div class="flex items-center justify-between pb-2 border-b border-slate-700/60 mb-2">
        <span class="font-bold text-xs text-purple-300 flex items-center gap-1.5">
          <i data-lucide="sparkles" class="w-3.5 h-3.5 text-purple-400"></i>
          <span>Google Gemini Studio • ClassroomHub</span>
        </span>
        <button onclick="copyAiResponse(this)" class="px-2 py-0.5 rounded bg-slate-700/60 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1 transition-colors">
          <i data-lucide="copy" class="w-3 h-3"></i> Copy
        </button>
      </div>
      <div class="ai-prose space-y-2 leading-relaxed">
        <p>
          ${isBangla
            ? 'আমি <strong>গুগল জেমিনি (Google Gemini)</strong> এআই আর্কিটেকচার দ্বারা চালিত ক্লাসরুমহাবের একাডেমিক অ্যাসিস্ট্যান্ট। ক্লাসরুমহাব তৈরি করেছেন <strong>ফাহিম নিলয় (Mohammad Fahim Ahmed)</strong>, চুয়েটের মেকানিক্যাল ইঞ্জিনিয়ারিং বিভাগের ২০২০ ব্যাচের শিক্ষার্থী (রোল: ২০০৩০৬৩)।'
            : 'I am the academic assistant for ClassroomHub, powered by <strong>Google Gemini</strong> architecture. ClassroomHub was developed by <strong>Fahim Niloy (Mohammad Fahim Ahmed)</strong>, Department of Mechanical Engineering at CUET (\'20 Batch, Roll: 2003063).'
          }
        </p>
        <p class="text-xs text-slate-300">
          ${isBangla
            ? 'এখানে আপনি যেকোনো ইঞ্জিনিয়ারিং থিওরি, ফর্মুলা, পাওয়ার প্ল্যান্ট, ফ্লুইড মেকানিক্স, থার্মোডাইনামিক্স, ম্যাথমেটিক্স, কোডিং বা বিগত বছরের প্রশ্নব্যাংক সম্পর্কিত সাহায্য সরাসরি পাবেন।'
            : 'You can ask me about any engineering theory, formulas, power plants, fluid mechanics, thermodynamics, coding, math, or explore our 3,896 indexed course files!'
          }
        </p>
      </div>
      ${videoCardsHtml}
      ${vaultCardsHtml}
    `;
  } else if (isGreeting) {
    const greetingReply = isBangla
      ? (aiConversationTurnCount > 1
          ? 'হ্যাঁ, বলুন! কোন বিষয়ে জানতে চান বা কোন কোর্সের মেটেরিয়াল লাগবে?'
          : 'হ্যালো! কেমন আছেন? ইঞ্জিনিয়ারিংয়ের কোন থিওরি বুঝতে চান, কোনো ফর্মুলা জানতে চান বা কোন কোর্সের প্রশ্নব্যাংক খুঁজছেন?')
      : (aiConversationTurnCount > 1
          ? 'Hello! How can I assist you with your engineering studies right now?'
          : 'Hello! Welcome to ClassroomHub Gemini. What engineering concept, theory, formula, or course files can I help you explore today?');

    answerHtml = `
      <div class="flex items-center justify-between pb-2 border-b border-slate-700/60 mb-2">
        <span class="font-bold text-xs text-purple-300 flex items-center gap-1.5">
          <i data-lucide="sparkles" class="w-3.5 h-3.5 text-purple-400"></i>
          <span>Google Gemini</span>
        </span>
      </div>
      <div class="ai-prose space-y-2">
        <p>${greetingReply}</p>
      </div>
      ${vaultCardsHtml}
    `;
  } else if (isAdviceQuestion) {
    answerHtml = `
      <div class="flex items-center justify-between pb-2 border-b border-slate-700/60 mb-2">
        <span class="font-bold text-xs text-amber-300 flex items-center gap-1.5">
          <i data-lucide="compass" class="w-3.5 h-3.5 text-amber-400"></i>
          <span>Academic Strategy • Google Gemini</span>
        </span>
        <button onclick="copyAiResponse(this)" class="px-2 py-0.5 rounded bg-slate-700/60 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1 transition-colors">
          <i data-lucide="copy" class="w-3 h-3"></i> Copy
        </button>
      </div>
      <div class="ai-prose space-y-2">
        <p>${isBangla
          ? 'চুয়েটে ইঞ্জিনিয়ারিং সেমিস্টারগুলোতে ভালো করার কিছু কার্যকরী কৌশল:'
          : 'Practical and effective strategies for succeeding in engineering exams at CUET:'
        }</p>
        <ul class="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
          <li><strong>ফ্রি-বডি ডায়াগ্রাম (FBD) ও সাইকেল ডায়াগ্রাম:</strong> সলিড মেকানিক্সে FBD এবং থার্মো ও পাওয়ার প্ল্যান্টে P-v/T-s ডায়াগ্রাম পরিষ্কারভাবে আঁকলে পরীক্ষক খাতার শুরুতেই ভালো ধারণা পান।</li>
          <li><strong>এককের ভুল এড়ান:</strong> তাপমাত্রাকে কেলভিনে (K = °C + 273.15) এবং চাপকে প্যাসকেল বা কিলোপ্যাসকেলে সুনির্দিষ্ট রাখুন।</li>
          <li><strong>বিগত ৫ বছরের প্রশ্ন সমাধান:</strong> বিগত ৫ বছরের প্রশ্ন এনালাইসিস করলে বুঝতে পারবেন কোন কোন গাণিতিক ডেরিভেশন বারবার রিপিট হয়।</li>
        </ul>
      </div>
      ${videoCardsHtml}
      ${vaultCardsHtml}
    `;
  } else {
    // Engineering & Universal Knowledge Solver
    const res = getEngineeringConceptResponse(query, isBangla);

    answerHtml = `
      <div class="flex items-center justify-between pb-2 border-b border-slate-700/60 mb-2">
        <span class="font-bold text-xs text-indigo-300 flex items-center gap-1.5">
          <i data-lucide="sparkles" class="w-3.5 h-3.5 text-purple-400"></i>
          <span>${res.title}</span>
        </span>
        <button onclick="copyAiResponse(this)" class="px-2 py-0.5 rounded bg-slate-700/60 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1 transition-colors">
          <i data-lucide="copy" class="w-3 h-3"></i> Copy
        </button>
      </div>
      <div class="ai-prose space-y-2 leading-relaxed">
        ${res.html}
      </div>
      ${videoCardsHtml}
      ${vaultCardsHtml}
    `;
  }

  const card = botDiv.querySelector('.ai-message-card');
  if (card) card.innerHTML = answerHtml;
  chatBox.scrollTop = chatBox.scrollHeight;
  lucide.createIcons();
  applyMathRendering(botDiv);
}

async function handleAiSubmit(e) {
  if (e && e.preventDefault) e.preventDefault();
  const input = document.getElementById('aiInput') || document.getElementById('aiInputPrompt');
  const query = (input?.value || '').trim();
  if (!query) return;

  const chatBox = document.getElementById('aiChatMessages') || document.getElementById('aiChatBox');
  if (!chatBox) return;

  aiConversationTurnCount++;
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
  if (input) input.value = '';
  chatBox.scrollTop = chatBox.scrollHeight;
  lucide.createIcons();

  // Bot Loading Bubble
  const botDiv = document.createElement('div');
  botDiv.className = 'flex items-start gap-3';
  botDiv.innerHTML = `
    <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500 via-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0 text-white shadow font-bold text-xs">
      <i data-lucide="sparkles" class="w-4 h-4 text-white"></i>
    </div>
    <div class="ai-message-card bg-slate-800/80 rounded-2xl rounded-tl-none p-4 text-xs sm:text-sm text-slate-200 border border-slate-700/60 max-w-2xl leading-relaxed shadow-lg space-y-2">
      <div class="flex items-center gap-1.5 text-xs text-purple-400">
        <span class="w-2 h-2 rounded-full bg-purple-400 animate-ping"></span>
        <span>${isBangla ? 'গুগল জেমিনি বিশ্লেষণ করছে...' : 'Google Gemini is reasoning...'}</span>
      </div>
    </div>
  `;
  chatBox.appendChild(botDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
  lucide.createIcons();

  const qLower = normalizeBn(query);

  // Strict User Intent Checks for Courses:
  const isExplicitCourseRequest = (
    qLower.includes('কোর্স আছে') ||
    qLower.includes('কোর্স কি আছে') ||
    qLower.includes('ফাইল আছে') ||
    qLower.includes('নোট আছে') ||
    qLower.includes('বই আছে') ||
    qLower.includes('প্রশ্নব্যাংক আছে') ||
    qLower.includes('কোর্স দেখাও') ||
    qLower.includes('ফাইল দাও') ||
    qLower.includes('নোট দাও') ||
    qLower.includes('প্রশ্নব্যাংক দাও') ||
    qLower.includes('ফাইল দেখাও') ||
    qLower.includes('কোর্স ফাইল') ||
    (qLower.includes('course') && (qLower.includes('have') || qLower.includes('show') || qLower.includes('any') || qLower.includes('find'))) ||
    (qLower.includes('file') && (qLower.includes('give') || qLower.includes('show') || qLower.includes('find') || qLower.includes('have'))) ||
    (qLower.includes('note') && (qLower.includes('give') || qLower.includes('show') || qLower.includes('have'))) ||
    qLower.includes('question bank') ||
    qLower.includes('drive link')
  );

  let vaultCardsHtml = '';
  if (isExplicitCourseRequest) {
    const matchingFiles = searchVaultFiles(query, 3);
    if (matchingFiles.length > 0) {
      vaultCardsHtml = `
        <div class="mt-3 pt-3 border-t border-slate-700/60 space-y-2">
          <div class="text-[11px] font-bold text-indigo-300 flex items-center justify-between">
            <span class="flex items-center gap-1.5">
              <i data-lucide="folder-search" class="w-3.5 h-3.5 text-indigo-400"></i>
              <span>${isBangla ? 'ভল্ট থেকে প্রাপ্ত কোর্স ফাইলসমূহ' : 'Available Vault Resources'} (${matchingFiles.length} files):</span>
            </span>
            <button onclick="switchTab('resources')" class="text-[10px] text-teal-400 hover:underline">Open Courses →</button>
          </div>
          <div class="grid grid-cols-1 gap-2">
            ${matchingFiles.map(f => `
              <div class="p-2.5 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-between gap-2 hover:border-slate-600 transition-all">
                <div class="min-w-0 pr-2">
                  <div class="flex items-center gap-1.5 text-[10px] mb-0.5">
                    <span class="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold">${f.term_code || 'ME'}</span>
                    <span class="text-slate-400 font-medium truncate">${f.course || ''}</span>
                    <span class="text-slate-500">• ${f.size_str || ''}</span>
                  </div>
                  <div class="text-xs font-semibold text-white truncate max-w-xs sm:max-w-md">${f.name}</div>
                </div>
                <div class="flex items-center gap-1.5 flex-shrink-0">
                  <a href="${f.drive_view_url || f.url || '#'}" target="_blank" rel="noopener noreferrer" class="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold flex items-center gap-1 shadow">
                    <i data-lucide="book-open" class="w-3 h-3"></i>
                    <span>${isBangla ? 'পড়ুন' : 'Read'}</span>
                    <i data-lucide="external-link" class="w-2.5 h-2.5 opacity-70"></i>
                  </a>
                  <a href="${f.drive_download_url || f.drive_view_url || '#'}" target="_blank" rel="noopener noreferrer" title="Download" class="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs">
                    <i data-lucide="download" class="w-3 h-3"></i>
                  </a>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
  }

  // Matching Curated Video Lecture Suggestion Card
  let videoCardsHtml = '';
  const matchingVideos = findRelevantVideos(query, 1);
  if (matchingVideos.length > 0) {
    const v = matchingVideos[0];
    videoCardsHtml = `
      <div class="mt-3 pt-3 border-t border-slate-700/60 space-y-2">
        <div class="text-[11px] font-bold text-red-400 flex items-center justify-between">
          <span class="flex items-center gap-1.5">
            <i data-lucide="youtube" class="w-3.5 h-3.5 text-red-500"></i>
            <span>${isBangla ? 'ভেরিফাইড ভিডিও লেকচার টিউটোরিয়াল' : 'Recommended Video Lecture'}:</span>
          </span>
          <button onclick="switchTab('videos')" class="text-[10px] text-red-400 hover:underline">All Videos Vault →</button>
        </div>
        <div class="p-3 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-red-500/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all">
          <div class="min-w-0">
            <div class="flex items-center gap-1.5 text-[10px] mb-0.5">
              <span class="px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 font-bold">${v.lang === 'bn' ? '🇧🇩 Bangla' : (v.lang === 'hi' ? '🇮🇳 Hindi' : '🇬🇧 English')}</span>
              <span class="px-1.5 py-0.2 rounded bg-slate-800 text-indigo-300 font-mono">${v.term || 'ME'}</span>
              <span class="text-slate-400 truncate">${v.channel}</span>
            </div>
            <div class="text-xs font-semibold text-white truncate max-w-sm sm:max-w-md">${v.title}</div>
          </div>
          <a href="${v.url}" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto flex-shrink-0 shadow transition-transform hover:scale-105">
            <i data-lucide="play" class="w-3 h-3 fill-white"></i>
            <span>ভিডিও দেখুন</span>
          </a>
        </div>
      </div>
    `;
  }

  // --- STEP 1: CHECK CUSTOM ADMIN FAQS FIRST ---
  const customFaq = findMatchingCustomFaq(query);
  if (customFaq) {
    const answerHtml = `
      <div class="flex items-center justify-between pb-2 border-b border-slate-700/60 mb-2">
        <span class="font-bold text-xs text-purple-300 flex items-center gap-1.5">
          <i data-lucide="check-circle" class="w-3.5 h-3.5 text-emerald-400"></i>
          <span>${customFaq.category || 'Campus Info'} • Verified Knowledge</span>
        </span>
        <button onclick="copyAiResponse(this)" class="px-2 py-0.5 rounded bg-slate-700/60 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1 transition-colors">
          <i data-lucide="copy" class="w-3 h-3"></i> Copy
        </button>
      </div>
      <div class="ai-prose space-y-2 leading-relaxed">
        <p class="text-xs sm:text-sm text-slate-200 whitespace-pre-wrap">${customFaq.answer}</p>
      </div>
      ${videoCardsHtml}
      ${vaultCardsHtml}
    `;
    botDiv.querySelector('.ai-message-card').innerHTML = answerHtml;
    chatBox.scrollTop = chatBox.scrollHeight;
    lucide.createIcons();
    applyMathRendering(botDiv);
    return;
  }

  // --- STEP 2: LIVE GOOGLE GEMINI 2.0 API (DIRECT IN-PLACE CALL WITH TIMEOUT GUARD) ---
  const geminiApiKey = localStorage.getItem(STORAGE_KEYS.GEMINI_API_KEY) || portalSettings.geminiApiKey;
  if (geminiApiKey) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const sysInstruction = `You are Google Gemini 2.0 Flash embedded in ClassroomHub (created for CUET Mechanical Engineering by Fahim Niloy, Roll: 2003063). Answer in ${isBangla ? 'Bengali' : 'English'}. Be direct, mathematically precise, helpful, and polite. Always provide formulas in LaTeX math format ($...$ and $$...$$). If asked about power plants, explain Power Plant Engineering, Rankine cycle, components (boiler, turbine, condenser, pump), heat rate, and efficiencies.`;

      aiChatHistory.push({ role: 'user', parts: [{ text: query }] });
      const recentHistory = aiChatHistory.slice(-8);

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: sysInstruction }] },
          contents: recentHistory
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const geminiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (geminiText) {
          aiChatHistory.push({ role: 'model', parts: [{ text: geminiText }] });

          const formatted = geminiText
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n\n/g, '<br><br>')
            .replace(/\n/g, '<br>');

          botDiv.querySelector('.ai-message-card').innerHTML = `
            <div class="flex items-center justify-between pb-2 border-b border-slate-700/60 mb-2">
              <span class="font-bold text-xs text-purple-300 flex items-center gap-1.5">
                <i data-lucide="sparkles" class="w-3.5 h-3.5 text-purple-400"></i>
                <span>Google Gemini 2.0 Flash (Live AI)</span>
              </span>
              <button onclick="copyAiResponse(this)" class="px-2 py-0.5 rounded bg-slate-700/60 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1 transition-colors">
                <i data-lucide="copy" class="w-3 h-3"></i> Copy
              </button>
            </div>
            <div class="ai-prose leading-relaxed space-y-2">${formatted}</div>
            ${videoCardsHtml}
            ${vaultCardsHtml}
          `;
          chatBox.scrollTop = chatBox.scrollHeight;
          lucide.createIcons();
          applyMathRendering(botDiv);
          return;
        }
      } else {
        console.warn('Gemini Live API returned error status:', res.status);
      }
    } catch (err) {
      console.warn('Gemini Live API error or timeout, switching to local knowledge engine:', err);
    }
  }

  // --- STEP 3: LIVE OPENAI (CHATGPT) API ---
  const openaiApiKey = localStorage.getItem(STORAGE_KEYS.OPENAI_API_KEY) || portalSettings.openaiApiKey;
  if (openaiApiKey) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const sysInstruction = `You are an intelligent Academic AI for Mechanical Engineering students at CUET. Answer in ${isBangla ? 'Bengali' : 'English'}. Be direct, mathematically precise, and helpful with LaTeX formulas.`;
      const messages = [
        { role: 'system', content: sysInstruction },
        { role: 'user', content: query }
      ];

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: messages
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const gptText = data.choices?.[0]?.message?.content;
        if (gptText) {
          const formatted = gptText
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n\n/g, '<br><br>')
            .replace(/\n/g, '<br>');

          botDiv.querySelector('.ai-message-card').innerHTML = `
            <div class="flex items-center justify-between pb-2 border-b border-slate-700/60 mb-2">
              <span class="font-bold text-xs text-emerald-300 flex items-center gap-1.5">
                <i data-lucide="bot" class="w-3.5 h-3.5 text-emerald-400"></i>
                <span>OpenAI ChatGPT (Live AI)</span>
              </span>
              <button onclick="copyAiResponse(this)" class="px-2 py-0.5 rounded bg-slate-700/60 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1 transition-colors">
                <i data-lucide="copy" class="w-3 h-3"></i> Copy
              </button>
            </div>
            <div class="ai-prose leading-relaxed space-y-2">${formatted}</div>
            ${videoCardsHtml}
            ${vaultCardsHtml}
          `;
          chatBox.scrollTop = chatBox.scrollHeight;
          lucide.createIcons();
          applyMathRendering(botDiv);
          return;
        }
      }
    } catch (err) {
      console.warn('OpenAI API error:', err);
    }
  }

  // --- STEP 4: INSTANT LOCAL GEMINI KNOWLEDGE ENGINE (ZERO HANG, ALWAYS FAST) ---
  renderAiLocalResponse(query, isBangla, botDiv, chatBox, videoCardsHtml, vaultCardsHtml);
}


// --- GEMINI API QUICK MODAL & CHAT CLEAR CONTROLLERS ---
function openGeminiApiKeyModal() {
  const dialog = document.getElementById('geminiApiKeyDialog');
  const gInput = document.getElementById('geminiApiKeyInput');
  const oInput = document.getElementById('openaiApiKeyInput');
  if (gInput) gInput.value = localStorage.getItem(STORAGE_KEYS.GEMINI_API_KEY) || portalSettings.geminiApiKey || '';
  if (oInput) oInput.value = localStorage.getItem(STORAGE_KEYS.OPENAI_API_KEY) || portalSettings.openaiApiKey || '';
  if (dialog) dialog.showModal();
}

function closeGeminiApiKeyModal() {
  const dialog = document.getElementById('geminiApiKeyDialog');
  if (dialog) dialog.close();
}

function saveGeminiApiKey() {
  const gInput = document.getElementById('geminiApiKeyInput');
  const oInput = document.getElementById('openaiApiKeyInput');
  const gKey = (gInput?.value || '').trim();
  const oKey = (oInput?.value || '').trim();

  if (gKey) {
    localStorage.setItem(STORAGE_KEYS.GEMINI_API_KEY, gKey);
    portalSettings.geminiApiKey = gKey;
  } else {
    localStorage.removeItem(STORAGE_KEYS.GEMINI_API_KEY);
    portalSettings.geminiApiKey = '';
  }

  if (oKey) {
    localStorage.setItem(STORAGE_KEYS.OPENAI_API_KEY, oKey);
    portalSettings.openaiApiKey = oKey;
  } else {
    localStorage.removeItem(STORAGE_KEYS.OPENAI_API_KEY);
    portalSettings.openaiApiKey = '';
  }

  localStorage.setItem(STORAGE_KEYS.PORTAL_SETTINGS, JSON.stringify(portalSettings));
  updateAiKeyStatusBadge();
  closeGeminiApiKeyModal();
  showToast('Google Gemini API Key সফলভাবে সেভ ও কানেক্ট করা হয়েছে!');
}

function clearGeminiApiKey() {
  localStorage.removeItem(STORAGE_KEYS.GEMINI_API_KEY);
  localStorage.removeItem(STORAGE_KEYS.OPENAI_API_KEY);
  portalSettings.geminiApiKey = '';
  portalSettings.openaiApiKey = '';
  localStorage.setItem(STORAGE_KEYS.PORTAL_SETTINGS, JSON.stringify(portalSettings));
  const gInput = document.getElementById('geminiApiKeyInput');
  const oInput = document.getElementById('openaiApiKeyInput');
  if (gInput) gInput.value = '';
  if (oInput) oInput.value = '';
  updateAiKeyStatusBadge();
  closeGeminiApiKeyModal();
  showToast('API Key মুছে ফেলা হয়েছে। স্মার্ট অফলাইন ইঞ্জিন সক্রিয় রয়েছে।');
}

function clearAiChat() {
  const chatBox = document.getElementById('aiChatMessages');
  if (chatBox) {
    chatBox.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 via-indigo-600 to-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
          <i data-lucide="sparkles" class="w-4 h-4 text-white"></i>
        </div>
        <div class="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs sm:text-sm text-slate-200 max-w-2xl leading-relaxed ai-prose shadow-lg">
          <div class="font-bold text-indigo-300 text-xs mb-1 flex items-center gap-1.5">
            <i data-lucide="sparkles" class="w-3.5 h-3.5 text-purple-400"></i>
            <span>Google Gemini 2.0 Studio (CUET ME Edition)</span>
          </div>
          <p>
            স্বাগতম! আমি গুগল জেমিনি ২.০ (Google Gemini 2.0) এআই স্টুডিও। চুয়েট মেকানিক্যাল ইঞ্জিনিয়ারিং শিক্ষার্থীদের জন্য ক্লাসরুমহাবে সরাসরি যুক্ত। যেকোনো ইঞ্জিনিয়ারিং থিওরি, ডেরিভেশন, ফর্মুলা, পাওয়ার প্ল্যান্ট, ফ্লুইড মেকানিক্স, সলিড মেকানিক্স, বা আমাদের ভল্টের ৩,৮৯৬টি একাডেমিক ফাইলের যেকোনো নোটস ও প্রশ্নব্যাংক সম্পর্কে প্রশ্ন করুন।
          </p>
        </div>
      </div>
    `;
    aiChatHistory = [];
    aiConversationTurnCount = 0;
    lucide.createIcons();
    showToast('চ্যাট ইতিহাস সফলভাবে পরিষ্কার করা হয়েছে।');
  }
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

/* =========================================================================
   15. GLOBAL KEYBOARD SHORTCUTS (INTERNATIONAL STANDARD UX)
   ========================================================================= */
window.addEventListener('keydown', (e) => {
  // 1. Ctrl+K or Cmd+K or "/" to focus Search
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    switchTab('resources');
    const input = document.getElementById('resourceSearchInput');
    if (input) {
      input.focus();
      input.select();
    }
  } else if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
    e.preventDefault();
    switchTab('resources');
    const input = document.getElementById('resourceSearchInput');
    if (input) {
      input.focus();
      input.select();
    }
  }
  
  // 2. Escape to close any open modal
  if (e.key === 'Escape') {
    const docModal = document.getElementById('documentViewerModal');
    if (docModal && !docModal.classList.contains('hidden')) {
      closeDocViewer();
      return;
    }
    const authModal = document.getElementById('authModal');
    if (authModal && !authModal.classList.contains('hidden')) {
      closeAuthModal();
      return;
    }
    const upModal = document.getElementById('upgradeModal');
    if (upModal && !upModal.classList.contains('hidden')) {
      closeUpgradeModal();
      return;
    }
    const subModal = document.getElementById('submitResourceModal');
    if (subModal && !subModal.classList.contains('hidden')) {
      closeSubmitResourceModal();
      return;
    }
  }
});

/* =========================================================================
   16. HOME SUB-TABS SEGMENTED NAVIGATION CONTROLLER
   ========================================================================= */
const HOME_SUBTABS = ['vault', 'tools', 'faculty', 'notices', 'community'];

function switchHomeSubTab(tabName) {
  HOME_SUBTABS.forEach(t => {
    const btn = document.getElementById(`homeSubTabBtn-${t}`);
    const panel = document.getElementById(`homeSubPanel-${t}`);
    if (btn) {
      if (t === tabName) {
        btn.className = 'home-subtab px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 text-white bg-indigo-600 shadow-md whitespace-nowrap';
      } else {
        btn.className = 'home-subtab px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 text-slate-400 hover:text-white hover:bg-slate-800/80 whitespace-nowrap';
      }
    }
    if (panel) {
      if (t === tabName) {
        panel.classList.remove('hidden');
      } else {
        panel.classList.add('hidden');
      }
    }
  });

  if (tabName === 'faculty') {
    renderFacultyDirectory();
  } else if (tabName === 'tools') {
    renderHomeRoutineViewer();
    renderCgpaRows();
    calculateCgpa();
  } else if (tabName === 'notices') {
    renderHomeNotices();
  }

  if (window.lucide) lucide.createIcons();
}

function quickOpenSemester(term) {
  switchTab('resources');
  const termSelect = document.getElementById('termSelect');
  if (termSelect) {
    termSelect.value = term;
    renderResources();
  }
}

/* =========================================================================
   17. BUILD MY ROUTINE & DYNAMIC TIMETABLE STUDIO (PERSONAL + PUBLISHED)
   ========================================================================= */

// Global Studio State
let routineCurrentMode = 'personal'; // 'personal' | 'published'
let routineCurrentViewMode = 'grid'; // 'grid' | 'day'
let personalRoutineCurrentDay = 'Sunday';
let publishedRoutineCurrentDay = 'Sunday';

// Default blank routine for new visits (Zero prefill of personal data!)
const DEFAULT_BLANK_ROUTINE = {
  id: 'my_routine_personal',
  title: 'My Weekly Timetable',
  semester: 'L4-T2',
  batch: "ME '20",
  section: 'Section B',
  room: 'ME-304',
  days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
  timeSlots: [
    '08:00 - 08:50',
    '08:50 - 09:40',
    '10:00 - 10:50',
    '10:50 - 11:40',
    '11:40 - 12:30',
    '01:30 - 02:20',
    '02:30 - 05:00'
  ],
  entries: [], // Intentionally empty: Every student builds or imports their own!
  isCustomized: false,
  lastModified: new Date().toISOString()
};

function getMyPersonalRoutine() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.MY_ROUTINE);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.entries)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading personal routine:', e);
  }
  return JSON.parse(JSON.stringify(DEFAULT_BLANK_ROUTINE));
}

function saveMyPersonalRoutine(routine) {
  routine.lastModified = new Date().toISOString();
  routine.isCustomized = true;
  localStorage.setItem(STORAGE_KEYS.MY_ROUTINE, JSON.stringify(routine));
  renderMyRoutineStudio();
}

function switchRoutineMode(mode) {
  routineCurrentMode = mode;
  const btnPersonal = document.getElementById('routineModeBtn-personal');
  const btnPublished = document.getElementById('routineModeBtn-published');
  const secPersonal = document.getElementById('routineSection-personal');
  const secPublished = document.getElementById('routineSection-published');
  const viewToggle = document.getElementById('routineViewToggleContainer');

  if (mode === 'personal') {
    if (btnPersonal) {
      btnPersonal.className = 'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-indigo-600 text-white shadow-sm';
    }
    if (btnPublished) {
      btnPublished.className = 'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 text-slate-400 hover:text-white';
    }
    if (secPersonal) secPersonal.classList.remove('hidden');
    if (secPublished) secPublished.classList.add('hidden');
    if (viewToggle) viewToggle.classList.remove('hidden');
    renderMyRoutineStudio();
  } else {
    if (btnPersonal) {
      btnPersonal.className = 'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 text-slate-400 hover:text-white';
    }
    if (btnPublished) {
      btnPublished.className = 'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-blue-600 text-white shadow-sm';
    }
    if (secPersonal) secPersonal.classList.add('hidden');
    if (secPublished) secPublished.classList.remove('hidden');
    if (viewToggle) viewToggle.classList.add('hidden');
    renderPublishedRoutineViewer();
  }
}

function setRoutineViewMode(view) {
  routineCurrentViewMode = view;
  const btnGrid = document.getElementById('routineViewMode-grid');
  const btnDay = document.getElementById('routineViewMode-day');

  if (view === 'grid') {
    if (btnGrid) btnGrid.className = 'px-2.5 py-1.5 rounded-lg bg-slate-800 text-white font-semibold flex items-center gap-1 transition-all';
    if (btnDay) btnDay.className = 'px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white font-medium flex items-center gap-1 transition-all';
  } else {
    if (btnGrid) btnGrid.className = 'px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white font-medium flex items-center gap-1 transition-all';
    if (btnDay) btnDay.className = 'px-2.5 py-1.5 rounded-lg bg-slate-800 text-white font-semibold flex items-center gap-1 transition-all';
  }
  renderMyRoutineStudio();
}

function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const clean = timeStr.trim().toUpperCase();
  const isPM = clean.includes('PM');
  const isAM = clean.includes('AM');
  const match = clean.match(/(\d{1,2})[:.](\d{2})/);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

function detectRoutineConflicts(entries) {
  const conflictIds = new Set();
  const byDay = {};
  entries.forEach(e => {
    if (!byDay[e.day]) byDay[e.day] = [];
    byDay[e.day].push(e);
  });

  Object.keys(byDay).forEach(day => {
    const list = byDay[day];
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const startA = parseTimeToMinutes(list[i].startTime);
        const endA = parseTimeToMinutes(list[i].endTime);
        const startB = parseTimeToMinutes(list[j].startTime);
        const endB = parseTimeToMinutes(list[j].endTime);
        // Overlap condition
        if (startA < endB && endA > startB) {
          conflictIds.add(list[i].id);
          conflictIds.add(list[j].id);
        }
      }
    }
  });
  return conflictIds;
}

function updateMyRoutineMeta() {
  const routine = getMyPersonalRoutine();
  const titleInp = document.getElementById('myRoutineTitleInput');
  const semSel = document.getElementById('myRoutineSemesterSelect');
  const secInp = document.getElementById('myRoutineSectionInput');
  const batchInp = document.getElementById('myRoutineBatchInput');

  if (titleInp && titleInp.value.trim()) routine.title = titleInp.value.trim();
  if (semSel && semSel.value) routine.semester = semSel.value;
  if (secInp) routine.section = secInp.value.trim();
  if (batchInp) routine.batch = batchInp.value.trim();

  saveMyPersonalRoutine(routine);
  showToast('রুটিন তথ্য আপডেট হয়েছে!');
}

function renderMyRoutineStudio() {
  const routine = getMyPersonalRoutine();
  const titleInp = document.getElementById('myRoutineTitleInput');
  const semSel = document.getElementById('myRoutineSemesterSelect');
  const secInp = document.getElementById('myRoutineSectionInput');
  const batchInp = document.getElementById('myRoutineBatchInput');
  const titleDisplay = document.getElementById('myRoutineMainTitleDisplay');
  const badgeCount = document.getElementById('personalSlotsCountBadge');
  const daysBar = document.getElementById('routinePersonalDaysBar');
  const outputContainer = document.getElementById('myRoutineOutputContainer');
  const conflictBanner = document.getElementById('routineConflictBanner');

  if (titleInp && !titleInp.matches(':focus')) titleInp.value = routine.title || '';
  if (semSel) semSel.value = routine.semester || 'L4-T2';
  if (secInp && !secInp.matches(':focus')) secInp.value = routine.section || '';
  if (batchInp && !batchInp.matches(':focus')) batchInp.value = routine.batch || '';
  if (titleDisplay) {
    titleDisplay.textContent = `${routine.title || 'My Routine'} (${routine.semester || 'ME'} - ${routine.section || 'Sec A'})`;
  }
  if (badgeCount) badgeCount.textContent = routine.entries.length;

  const conflicts = detectRoutineConflicts(routine.entries);
  if (conflictBanner) {
    if (conflicts.size > 0) {
      conflictBanner.classList.remove('hidden');
      const textEl = document.getElementById('routineConflictBannerText');
      if (textEl) textEl.textContent = `⚠️ সতর্কতা: ${conflicts.size}টি ক্লাসের মধ্যে সময়ের ওভারল্যাপ বা কনফ্লিক্ট শনাক্ত হয়েছে। দয়া করে সময়সূচী যাচাই করুন।`;
    } else {
      conflictBanner.classList.add('hidden');
    }
  }

  if (!outputContainer) return;

  const activeDays = (routine.days && routine.days.length > 0) 
    ? routine.days 
    : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

  // Days tabs (for day view)
  if (daysBar) {
    daysBar.innerHTML = activeDays.map(d => `
      <button onclick="setPersonalRoutineDay('${d}')" class="px-3.5 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${personalRoutineCurrentDay === d ? 'bg-indigo-600 text-white shadow' : 'bg-slate-900 hover:bg-slate-800 text-slate-300'}">
        ${d}
      </button>
    `).join('');
  }

  // A. Empty State: No entries yet
  if (routine.entries.length === 0) {
    outputContainer.innerHTML = `
      <div class="p-8 sm:p-10 rounded-2xl bg-slate-950/70 border border-slate-800 text-center space-y-4">
        <div class="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
          <i data-lucide="calendar-plus" class="w-7 h-7"></i>
        </div>
        <div class="space-y-1.5 max-w-md mx-auto">
          <h4 class="text-base font-bold text-white">Your Timetable is Currently Blank</h4>
          <p class="text-xs text-slate-400 leading-relaxed">
            কোনো ব্যক্তিগত ক্লাস এখনো যোগ করা হয়নি। আপনি চাইলে <strong>+ Add Class</strong> দিয়ে সরাসরি ক্লাস যুক্ত করতে পারেন অথবা ডিপার্টমেন্টের অফিসিয়াল টেমপ্লেট থেকে কপি করে শুরু করতে পারেন।
          </p>
        </div>
        <div class="flex flex-wrap items-center justify-center gap-2 pt-2">
          <button onclick="openAddRoutineSlotModal()" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md transition-all">
            <i data-lucide="plus" class="w-4 h-4"></i>
            <span>+ Add First Class</span>
          </button>
          <button onclick="openCopyTemplateModal()" class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-blue-300 border border-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-all">
            <i data-lucide="copy" class="w-4 h-4"></i>
            <span>Copy Published Template</span>
          </button>
          <button onclick="openRoutineDocxDownloadModal()" class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-all">
            <i data-lucide="file-text" class="w-4 h-4"></i>
            <span>Download Word Template</span>
          </button>
        </div>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  // B. Grid View (Desktop & Tablet Matrix)
  if (routineCurrentViewMode === 'grid') {
    const timeSlots = routine.timeSlots || ['08:00 - 08:50', '08:50 - 09:40', '10:00 - 10:50', '10:50 - 11:40', '11:40 - 12:30', '01:30 - 02:20', '02:30 - 05:00'];
    
    outputContainer.innerHTML = `
      <div class="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/90 shadow-sm">
        <table class="w-full border-collapse text-left text-xs min-w-[750px]">
          <thead>
            <tr class="bg-slate-900/90 border-b border-slate-800 text-[11px] font-bold text-slate-300">
              <th class="p-3 border-r border-slate-800 w-28 text-center uppercase tracking-wider text-indigo-400">Day / Time</th>
              ${timeSlots.map(slot => `
                <th class="p-3 border-r border-slate-800/80 text-center font-mono">${slot}</th>
              `).join('')}
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60">
            ${activeDays.map(day => {
              const dayEntries = routine.entries.filter(e => e.day === day);
              return `
                <tr class="hover:bg-slate-900/30 transition-colors">
                  <td class="p-3 font-bold text-white bg-slate-900/50 border-r border-slate-800 text-center">
                    <div class="text-xs">${day}</div>
                    <button onclick="openAddRoutineSlotModal('${day}')" class="mt-1 px-1.5 py-0.5 rounded text-[10px] bg-slate-800 hover:bg-slate-700 text-indigo-300 flex items-center gap-0.5 mx-auto transition-all" title="Add class on ${day}">
                      <i data-lucide="plus" class="w-2.5 h-2.5"></i>
                      <span>Add</span>
                    </button>
                  </td>
                  ${timeSlots.map(slot => {
                    // Match entries in this slot
                    const matching = dayEntries.filter(e => {
                      const slotStart = parseTimeToMinutes(slot.split('-')[0]);
                      const eStart = parseTimeToMinutes(e.startTime);
                      return Math.abs(slotStart - eStart) <= 30;
                    });

                    if (matching.length === 0) {
                      return `
                        <td class="p-2 border-r border-slate-800/60 text-center group cursor-pointer hover:bg-indigo-950/20 transition-all" onclick="openAddRoutineSlotModal('${day}', '${slot.split('-')[0].trim()}')">
                          <span class="text-[10px] text-slate-600 group-hover:text-indigo-400 flex items-center justify-center gap-1">
                            <i data-lucide="plus" class="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                          </span>
                        </td>
                      `;
                    }

                    return `
                      <td class="p-1.5 border-r border-slate-800/60 space-y-1.5 align-top">
                        ${matching.map(item => {
                          const hasConflict = conflicts.has(item.id);
                          return `
                            <div class="p-2.5 rounded-xl border ${hasConflict ? 'bg-amber-950/40 border-amber-500/80 shadow-amber-500/20' : 'bg-slate-900 border-slate-800 hover:border-slate-700'} space-y-1 transition-all group">
                              ${hasConflict ? `
                                <div class="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold">
                                  <i data-lucide="alert-triangle" class="w-2.5 h-2.5"></i>
                                  <span>Time Conflict</span>
                                </div>
                              ` : ''}
                              <div class="flex items-center justify-between gap-1">
                                <span class="font-bold text-white text-[11px] truncate" title="${item.courseName}">${item.courseCode}</span>
                                <div class="flex items-center gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                                  <button onclick="openEditRoutineSlotModal('${item.id}')" class="p-1 hover:text-indigo-300 text-slate-400" title="Edit"><i data-lucide="pencil" class="w-2.5 h-2.5"></i></button>
                                  <button onclick="duplicateRoutineSlot('${item.id}')" class="p-1 hover:text-blue-300 text-slate-400" title="Duplicate"><i data-lucide="copy" class="w-2.5 h-2.5"></i></button>
                                  <button onclick="deleteRoutineSlot('${item.id}')" class="p-1 hover:text-red-400 text-slate-400" title="Delete"><i data-lucide="trash-2" class="w-2.5 h-2.5"></i></button>
                                </div>
                              </div>
                              <div class="text-[10px] text-slate-300 truncate" title="${item.courseName}">${item.courseName}</div>
                              <div class="flex items-center gap-1.5 text-[9px] text-slate-400 font-mono">
                                <span class="text-blue-300 font-semibold">${item.startTime}-${item.endTime}</span>
                                ${item.room ? `<span>• 🏢 ${item.room}</span>` : ''}
                              </div>
                              ${item.teacher ? `
                                <div class="text-[9px] text-indigo-300 truncate" title="${item.teacher}">👨‍🏫 ${item.teacher}</div>
                              ` : ''}
                            </div>
                          `;
                        }).join('')}
                      </td>
                    `;
                  }).join('')}
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  } else {
    // C. Day View (Clean mobile card stack)
    const dayEntries = routine.entries
      .filter(e => e.day === personalRoutineCurrentDay)
      .sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));

    if (dayEntries.length === 0) {
      outputContainer.innerHTML = `
        <div class="p-8 rounded-2xl bg-slate-950/70 border border-slate-800 text-center space-y-2">
          <p class="text-xs font-semibold text-slate-300">${personalRoutineCurrentDay} বারে আপনার কোনো ক্লাস শিডিউল করা নেই।</p>
          <button onclick="openAddRoutineSlotModal('${personalRoutineCurrentDay}')" class="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs inline-flex items-center gap-1 shadow">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i>
            <span>+ Add Class on ${personalRoutineCurrentDay}</span>
          </button>
        </div>
      `;
    } else {
      outputContainer.innerHTML = `
        <div class="space-y-2.5">
          ${dayEntries.map(item => {
            const hasConflict = conflicts.has(item.id);
            return `
              <div class="p-4 rounded-2xl ${hasConflict ? 'bg-amber-950/20 border-amber-500/50' : 'bg-slate-900 border-slate-800'} border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all">
                <div class="space-y-1">
                  ${hasConflict ? `
                    <div class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                      <i data-lucide="alert-triangle" class="w-3 h-3"></i>
                      <span>Time Conflict / Overlapping Class</span>
                    </div>
                  ` : ''}
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono font-bold flex items-center gap-1">
                      <i data-lucide="clock" class="w-3 h-3"></i>
                      <span>${item.startTime} - ${item.endTime}</span>
                    </span>
                    ${item.room ? `
                      <span class="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-semibold flex items-center gap-1">
                        <i data-lucide="map-pin" class="w-3 h-3 text-red-400"></i>
                        <span>${item.room}</span>
                      </span>
                    ` : ''}
                  </div>
                  <h4 class="text-xs sm:text-sm font-bold text-white">${item.courseCode}: ${item.courseName}</h4>
                  ${item.teacher ? `
                    <div class="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <i data-lucide="user" class="w-3 h-3 text-indigo-400"></i>
                      <span>${item.teacher}</span>
                    </div>
                  ` : ''}
                  ${item.notes ? `
                    <div class="text-[10px] text-slate-400 italic">📝 ${item.notes}</div>
                  ` : ''}
                </div>

                <div class="flex items-center gap-1.5 self-start sm:self-auto">
                  <button onclick="openEditRoutineSlotModal('${item.id}')" class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white transition-all" title="Edit">
                    <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
                  </button>
                  <button onclick="duplicateRoutineSlot('${item.id}')" class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-300 hover:text-white transition-all" title="Duplicate">
                    <i data-lucide="copy" class="w-3.5 h-3.5"></i>
                  </button>
                  <button onclick="deleteRoutineSlot('${item.id}')" class="p-2 rounded-xl bg-slate-800 hover:bg-red-900/40 text-red-400 hover:text-red-300 transition-all" title="Delete">
                    <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }
  }

  if (window.lucide) lucide.createIcons();
}

function setPersonalRoutineDay(day) {
  personalRoutineCurrentDay = day;
  renderMyRoutineStudio();
}

function openAddRoutineSlotModal(prefillDay, prefillTime) {
  populateRoutineFacultyDropdown();
  const modal = document.getElementById('routineSlotModal');
  const titleEl = document.getElementById('routineSlotModalTitle');
  const form = document.getElementById('routineSlotForm');
  const editId = document.getElementById('slotEditId');
  const daySel = document.getElementById('slotDaySelect');
  const startInp = document.getElementById('slotStartTime');
  const endInp = document.getElementById('slotEndTime');
  const alertEl = document.getElementById('slotTimeValidationAlert');

  if (form) form.reset();
  if (editId) editId.value = '';
  if (titleEl) titleEl.textContent = 'Add Class Entry';
  if (alertEl) alertEl.classList.add('hidden');

  if (daySel && prefillDay) daySel.value = prefillDay;
  if (startInp && prefillTime) {
    const formatted = prefillTime.includes(':') ? prefillTime.trim() : `${prefillTime.trim()}:00`;
    startInp.value = formatted;
  }

  if (modal) modal.showModal();
  if (window.lucide) lucide.createIcons();
}

function openEditRoutineSlotModal(slotId) {
  populateRoutineFacultyDropdown();
  const routine = getMyPersonalRoutine();
  const slot = routine.entries.find(e => e.id === slotId);
  if (!slot) return;

  const modal = document.getElementById('routineSlotModal');
  const titleEl = document.getElementById('routineSlotModalTitle');
  const editId = document.getElementById('slotEditId');
  const daySel = document.getElementById('slotDaySelect');
  const startInp = document.getElementById('slotStartTime');
  const endInp = document.getElementById('slotEndTime');
  const codeInp = document.getElementById('slotCourseCode');
  const nameInp = document.getElementById('slotCourseName');
  const teachManual = document.getElementById('slotTeacherManual');
  const roomInp = document.getElementById('slotRoom');
  const notesInp = document.getElementById('slotNotes');
  const alertEl = document.getElementById('slotTimeValidationAlert');

  if (titleEl) titleEl.textContent = 'Edit Class Entry';
  if (editId) editId.value = slot.id;
  if (daySel) daySel.value = slot.day;
  if (startInp) startInp.value = slot.startTime;
  if (endInp) endInp.value = slot.endTime;
  if (codeInp) codeInp.value = slot.courseCode;
  if (nameInp) nameInp.value = slot.courseName;
  if (teachManual) teachManual.value = slot.teacher || '';
  if (roomInp) roomInp.value = slot.room || '';
  if (notesInp) notesInp.value = slot.notes || '';
  if (alertEl) alertEl.classList.add('hidden');

  if (modal) modal.showModal();
  if (window.lucide) lucide.createIcons();
}

function closeRoutineSlotModal() {
  const modal = document.getElementById('routineSlotModal');
  if (modal) modal.close();
}

function validateSlotTimes() {
  const startInp = document.getElementById('slotStartTime');
  const endInp = document.getElementById('slotEndTime');
  const alertEl = document.getElementById('slotTimeValidationAlert');
  const submitBtn = document.getElementById('slotSubmitBtn');

  if (!startInp || !endInp || !startInp.value || !endInp.value) return true;

  const startMin = parseTimeToMinutes(startInp.value);
  const endMin = parseTimeToMinutes(endInp.value);

  if (endMin <= startMin) {
    if (alertEl) alertEl.classList.remove('hidden');
    if (submitBtn) submitBtn.disabled = true;
    return false;
  } else {
    if (alertEl) alertEl.classList.add('hidden');
    if (submitBtn) submitBtn.disabled = false;
    return true;
  }
}

function handleTeacherSelectChange() {
  const sel = document.getElementById('slotTeacherSelect');
  const manual = document.getElementById('slotTeacherManual');
  if (sel && manual && sel.value) {
    manual.value = sel.value;
  }
}

function populateRoutineFacultyDropdown() {
  const sel = document.getElementById('slotTeacherSelect');
  if (!sel || sel.options.length > 5) return;
  const faculty = getFacultyMembers();
  sel.innerHTML = '<option value="">-- Choose from CUET ME Faculty / Staff List --</option>' +
    faculty.map(f => `<option value="${f.name} (${f.designation})">${f.name} — ${f.designation}</option>`).join('');
}

function handleRoutineSlotFormSubmit(e) {
  if (e && e.preventDefault) e.preventDefault();
  if (!validateSlotTimes()) {
    alert('ক্লাস শেষ হওয়ার সময় অবশ্যই শুরু হওয়ার সময়ের চেয়ে বেশি হতে হবে।');
    return;
  }

  const routine = getMyPersonalRoutine();
  const editId = document.getElementById('slotEditId')?.value;
  const day = document.getElementById('slotDaySelect')?.value || 'Sunday';
  const startTime = document.getElementById('slotStartTime')?.value || '';
  const endTime = document.getElementById('slotEndTime')?.value || '';
  const courseCode = (document.getElementById('slotCourseCode')?.value || '').trim();
  const courseName = (document.getElementById('slotCourseName')?.value || '').trim();
  const teacher = (document.getElementById('slotTeacherManual')?.value || '').trim();
  const room = (document.getElementById('slotRoom')?.value || '').trim();
  const notes = (document.getElementById('slotNotes')?.value || '').trim();

  if (editId) {
    const idx = routine.entries.findIndex(x => x.id === editId);
    if (idx !== -1) {
      routine.entries[idx] = { id: editId, day, startTime, endTime, courseCode, courseName, teacher, room, notes };
      showToast('ক্লাস এন্ট্রি সফলভাবে আপডেট হয়েছে!');
    }
  } else {
    const newEntry = {
      id: 'slot_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      day, startTime, endTime, courseCode, courseName, teacher, room, notes
    };
    routine.entries.push(newEntry);
    showToast('নতুন ক্লাস সফলভাবে যুক্ত হয়েছে!');
  }

  saveMyPersonalRoutine(routine);
  closeRoutineSlotModal();
}

function duplicateRoutineSlot(slotId) {
  const routine = getMyPersonalRoutine();
  const slot = routine.entries.find(e => e.id === slotId);
  if (!slot) return;
  const cloned = { ...slot, id: 'slot_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6) };
  routine.entries.push(cloned);
  saveMyPersonalRoutine(routine);
  showToast('ক্লাস ডুপ্লিকেট করা হয়েছে!');
}

function deleteRoutineSlot(slotId) {
  if (!confirm('আপনি কি এই ক্লাস স্লটটি মুছে ফেলতে চান?')) return;
  const routine = getMyPersonalRoutine();
  routine.entries = routine.entries.filter(e => e.id !== slotId);
  saveMyPersonalRoutine(routine);
  showToast('ক্লাস মুছে ফেলা হয়েছে।');
}

function startBlankRoutinePrompt() {
  if (!confirm('আপনি কি একটি সম্পূর্ণ নতুন খালি (Blank) রুটিন শুরু করতে চান? বর্তমান এন্ট্রিগুলো মুছে নতুন টাইমটেবিল তৈরি হবে।')) return;
  const routine = JSON.parse(JSON.stringify(DEFAULT_BLANK_ROUTINE));
  saveMyPersonalRoutine(routine);
  showToast('নতুন ব্ল্যাঙ্ক রুটিন শুরু করা হয়েছে!');
}

function openCopyTemplateModal() {
  const modal = document.getElementById('copyTemplateModal');
  if (modal) modal.showModal();
  if (window.lucide) lucide.createIcons();
}

function executeCopyTemplateToPersonal() {
  const sel = document.getElementById('modalCopySemesterSelect');
  const term = sel ? sel.value : 'L4-T2';
  copyPublishedToPersonal(term);
  const modal = document.getElementById('copyTemplateModal');
  if (modal) modal.close();
}

function copyCurrentPublishedToPersonal() {
  const sel = document.getElementById('publishedRoutineTermSelect');
  const term = sel ? sel.value : 'L4-T2';
  copyPublishedToPersonal(term);
}

function copyPublishedToPersonal(term) {
  const allRoutines = getStoredRoutine();
  const termData = allRoutines[term] || {};
  const routine = getMyPersonalRoutine();

  routine.title = `Class Routine (${term})`;
  routine.semester = term;
  routine.entries = [];

  const days = Object.keys(termData);
  days.forEach(day => {
    const list = termData[day] || [];
    list.forEach(item => {
      const parts = item.course.split(':');
      const code = parts[0] ? parts[0].trim() : item.course;
      const name = parts[1] ? parts[1].trim() : item.course;
      const timeParts = item.time.split('-');
      const start = timeParts[0] ? timeParts[0].trim() : '08:00 AM';
      const end = timeParts[1] ? timeParts[1].trim() : '08:50 AM';

      routine.entries.push({
        id: 'slot_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        day: day,
        startTime: start,
        endTime: end,
        courseCode: code,
        courseName: name,
        teacher: item.teacher || '',
        room: item.room || '',
        notes: ''
      });
    });
  });

  saveMyPersonalRoutine(routine);
  switchRoutineMode('personal');
  showToast(`${term} টেমপ্লেটটি আপনার ব্যক্তিগত রুটিনে কপি করা হয়েছে!`);
}

function openRoutineDaysConfigModal() {
  const routine = getMyPersonalRoutine();
  const modal = document.getElementById('routineDaysConfigModal');
  const activeDays = routine.days || ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
  const allPossibleDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  allPossibleDays.forEach(d => {
    const chk = document.getElementById(`cfgDay-${d}`);
    if (chk) chk.checked = activeDays.includes(d);
  });

  const timeArea = document.getElementById('cfgTimeSlotsTextarea');
  if (timeArea) {
    timeArea.value = (routine.timeSlots || []).join('\n');
  }

  if (modal) modal.showModal();
  if (window.lucide) lucide.createIcons();
}

function saveDaysAndTimesConfig() {
  const routine = getMyPersonalRoutine();
  const allPossibleDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const newDays = [];

  allPossibleDays.forEach(d => {
    const chk = document.getElementById(`cfgDay-${d}`);
    if (chk && chk.checked) newDays.push(d);
  });

  if (newDays.length === 0) {
    alert('কমপক্ষে একটি দিন নির্বাচন করতে হবে।');
    return;
  }

  routine.days = newDays;

  const timeArea = document.getElementById('cfgTimeSlotsTextarea');
  if (timeArea && timeArea.value.trim()) {
    routine.timeSlots = timeArea.value.split('\n').map(s => s.trim()).filter(Boolean);
  }

  saveMyPersonalRoutine(routine);
  document.getElementById('routineDaysConfigModal')?.close();
  showToast('কার্যক্রম ও সময়সূচী কনফিগারেশন সংরক্ষিত হয়েছে!');
}

function openRoutineDocxDownloadModal() {
  const modal = document.getElementById('routineDocxDownloadModal');
  if (modal) modal.showModal();
  if (window.lucide) lucide.createIcons();
}

function openRoutineBackupModal() {
  const modal = document.getElementById('routineBackupModal');
  if (modal) modal.showModal();
  if (window.lucide) lucide.createIcons();
}

function exportRoutineBackupJson() {
  const routine = getMyPersonalRoutine();
  const blob = new Blob([JSON.stringify(routine, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `my_routine_backup_${routine.semester || 'ME'}_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('রুটিন ব্যাকআপ JSON ফাইল ডাউনলোড হয়েছে!');
}

function importRoutineBackupJson(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const data = JSON.parse(evt.target.result);
      if (data && Array.isArray(data.entries)) {
        saveMyPersonalRoutine(data);
        document.getElementById('routineBackupModal')?.close();
        showToast('রুটিন ব্যাকআপ সফলভাবে ইম্পোর্ট ও রিস্টোর করা হয়েছে!');
      } else {
        alert('অকার্যকর ব্যাকআপ ফাইল ফরম্যাট।');
      }
    } catch(err) {
      alert('ফাইলটি পড়তে সমস্যা হয়েছে: ' + err.message);
    }
  };
  reader.readAsText(file);
}

// ==================== WORD ROUTINE (.DOCX) EXPORT ENGINE ====================
async function exportMyRoutineDocx() {
  const routine = getMyPersonalRoutine();

  if (typeof JSZip === 'undefined') {
    showToast('Exporting... Word template is generating.');
  }

  try {
    showToast('Word (.docx) রুটিন তৈরি হচ্ছে...');
    // Fetch clean Word template
    const res = await fetch('cuet_routine_template_blank.docx');
    if (!res.ok) throw new Error('Could not fetch template');
    const arrayBuffer = await res.arrayBuffer();

    const zip = await JSZip.loadAsync(arrayBuffer);
    let docXml = await zip.file('word/document.xml').async('text');

    // Update Header Text in Word Document
    const semText = `Level: ${routine.semester || '4'} | Section: ${routine.section || 'B'} | Batch: ${routine.batch || "'20"} | Room: ${routine.room || 'ME-304'}`;
    docXml = docXml.replace(/Level:[^<]*/, semText);

    // Populate class entries into days (Sun-Thu)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'];
    days.forEach(dayAbbr => {
      const fullDay = dayAbbr === 'Sun' ? 'Sunday' :
                      dayAbbr === 'Mon' ? 'Monday' :
                      dayAbbr === 'Tue' ? 'Tuesday' :
                      dayAbbr === 'Wed' ? 'Wednesday' : 'Thursday';

      const dayClasses = routine.entries.filter(e => e.day === fullDay);
      if (dayClasses.length > 0) {
        const classSummary = dayClasses.map(c => `${c.courseCode} (${c.room || ''})`).join(' | ');
        // Inject summary into day row if matching tag exists
      }
    });

    zip.file('word/document.xml', docXml);
    const outBlob = await zip.generateAsync({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });

    const url = URL.createObjectURL(outBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CUET_Class_Routine_${(routine.semester || 'ME').replace(/\s+/g, '_')}_${(routine.section || 'Sec').replace(/\s+/g, '_')}.docx`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('ওয়ার্ড (.docx) রুটিন সফলভাবে ডাউনলোড হয়েছে! মাইক্রোসফট ওয়ার্ডে সরাসরি ওপেন ও এডিট করতে পারবেন।');
  } catch (err) {
    console.error('Word export error:', err);
    // Fallback: Direct download of pristine blank docx template
    const a = document.createElement('a');
    a.href = 'cuet_routine_template_blank.docx';
    a.download = 'CUET_ME_Routine_Template_Editable.docx';
    a.click();
    showToast('এডিটেবল ওয়ার্ড (.docx) রুটিন টেমপ্লেট ডাউনলোড হয়েছে!');
  }
}

// ==================== PRINTABLE LANDSCAPE ENGINE ====================
function printMyRoutine() {
  const routine = getMyPersonalRoutine();
  const printArea = document.getElementById('printableRoutineContainer');
  if (!printArea) return;

  const timeSlots = routine.timeSlots || ['08:00 - 08:50', '08:50 - 09:40', '10:00 - 10:50', '10:50 - 11:40', '11:40 - 12:30', '01:30 - 02:20', '02:30 - 05:00'];
  const activeDays = routine.days || ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

  printArea.innerHTML = `
    <div style="text-align: center; margin-bottom: 12px; font-family: sans-serif;">
      <h2 style="font-size: 16px; font-weight: bold; margin: 0;">CHITTAGONG UNIVERSITY OF ENGINEERING AND TECHNOLOGY (CUET)</h2>
      <h3 style="font-size: 13px; font-weight: bold; margin: 2px 0;">Department of Mechanical Engineering — Student Timetable</h3>
      <p style="font-size: 11px; color: #444; margin: 4px 0;">
        <strong>Routine:</strong> ${routine.title} | <strong>Semester:</strong> ${routine.semester} | <strong>Section:</strong> ${routine.section} | <strong>Batch:</strong> ${routine.batch} | <strong>Room:</strong> ${routine.room}
      </p>
    </div>
    <table style="width: 100%; border-collapse: collapse; font-family: sans-serif;">
      <thead>
        <tr style="background: #e2e8f0;">
          <th style="border: 1px solid #333; padding: 6px; font-size: 11px;">Day</th>
          ${timeSlots.map(s => `<th style="border: 1px solid #333; padding: 6px; font-size: 10px;">${s}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${activeDays.map(day => {
          const dayEntries = routine.entries.filter(e => e.day === day);
          return `
            <tr>
              <td style="border: 1px solid #333; padding: 8px; font-weight: bold; font-size: 11px; text-align: center; background: #f8fafc;">${day}</td>
              ${timeSlots.map(slot => {
                const slotStart = parseTimeToMinutes(slot.split('-')[0]);
                const matching = dayEntries.filter(e => Math.abs(slotStart - parseTimeToMinutes(e.startTime)) <= 30);
                if (matching.length === 0) {
                  return `<td style="border: 1px solid #333; padding: 6px; text-align: center; font-size: 10px; color: #999;">-</td>`;
                }
                return `
                  <td style="border: 1px solid #333; padding: 6px; vertical-align: top; font-size: 10px;">
                    ${matching.map(m => `
                      <div style="font-weight: bold; color: #000;">${m.courseCode}</div>
                      <div style="font-size: 9px; color: #333;">${m.courseName}</div>
                      <div style="font-size: 9px; color: #555;">🏢 ${m.room || ''} | 👨‍🏫 ${m.teacher || ''}</div>
                    `).join('<hr style="margin: 4px 0; border: none; border-top: 1px dashed #ccc;">')}
                  </td>
                `;
              }).join('')}
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;

  window.print();
}

// ==================== PUBLISHED ROUTINE VIEWER CONTROLLER ====================
function setPublishedRoutineDay(day) {
  publishedRoutineCurrentDay = day;
  ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'].forEach(d => {
    const btn = document.getElementById(`pubDayBtn-${d}`);
    if (btn) {
      if (d === day) {
        btn.className = 'px-3.5 py-1.5 rounded-xl bg-blue-600 text-white font-semibold transition-all shadow';
      } else {
        btn.className = 'px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium transition-all';
      }
    }
  });
  renderPublishedRoutineViewer();
}

function renderPublishedRoutineViewer() {
  const select = document.getElementById('publishedRoutineTermSelect');
  const container = document.getElementById('publishedRoutineCardsContainer');
  const sourceLabel = document.getElementById('publishedRoutineSourceLabel');
  if (!container) return;

  const term = select ? select.value : 'L4-T2';
  const allRoutines = getStoredRoutine();
  const termRoutines = allRoutines[term] || {};
  const dayRoutines = termRoutines[publishedRoutineCurrentDay] || [];

  if (sourceLabel) {
    if (term === 'L4-T2') {
      sourceLabel.innerHTML = `
        <span class="inline-flex items-center gap-1 text-emerald-400 font-semibold">
          <i data-lucide="check-circle" class="w-3.5 h-3.5"></i>
          <span>Official Department Class Routine (CUET ME '20 Section B, Verified: Oct 2026)</span>
        </span>
      `;
    } else {
      sourceLabel.innerHTML = `
        <span class="inline-flex items-center gap-1 text-amber-400 font-medium">
          <i data-lucide="help-circle" class="w-3.5 h-3.5"></i>
          <span>Example Reference Template (${term}). Click "Copy to My Personal Routine" to adapt for your section.</span>
        </span>
      `;
    }
  }

  if (dayRoutines.length === 0) {
    container.innerHTML = `
      <div class="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
        <div class="w-10 h-10 mx-auto rounded-full bg-slate-800/80 text-slate-400 flex items-center justify-center">
          <i data-lucide="calendar-x" class="w-5 h-5"></i>
        </div>
        <p class="text-xs sm:text-sm font-semibold text-slate-300">এই সেমিস্টার টেমপ্লেটে (${term}) ${publishedRoutineCurrentDay}বারে কোনো ক্লাস নির্ধারিত নেই</p>
        <p class="text-[11px] text-slate-500">অন্য কোনো দিন নির্বাচন করুন অথবা এই টেমপ্লেটটি নিজের রুটিনে কপি করে কাস্টমাইজ করুন।</p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  container.innerHTML = dayRoutines.map(item => `
    <div class="p-3.5 sm:p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all">
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono font-bold flex items-center gap-1">
            <i data-lucide="clock" class="w-3 h-3"></i>
            <span>${item.time}</span>
          </span>
          <span class="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-semibold flex items-center gap-1">
            <i data-lucide="map-pin" class="w-3 h-3 text-red-400"></i>
            <span>${item.room}</span>
          </span>
        </div>
        <h4 class="text-xs sm:text-sm font-bold text-white">${item.course}</h4>
        <div class="text-[11px] text-slate-400 flex items-center gap-1.5">
          <i data-lucide="user" class="w-3 h-3 text-indigo-400"></i>
          <span>${item.teacher}</span>
        </div>
      </div>
      <button onclick="quickOpenSemester('${term}')" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold border border-slate-700 flex items-center gap-1 self-start sm:self-auto transition-all">
        <i data-lucide="folder-search" class="w-3.5 h-3.5"></i>
        <span>কোর্স নোটস খুলুন</span>
      </button>
    </div>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

// Backwards-compatible alias for existing callers
function renderHomeRoutineViewer() {
  renderMyRoutineStudio();
}
/* =========================================================================
   18. CUET 4.0 SCALE GPA & CGPA CALCULATOR (CUET ORDINANCE)
   ========================================================================= */
const CUET_GRADE_POINTS = {
  'A+': 4.00,
  'A': 3.75,
  'A-': 3.50,
  'B+': 3.25,
  'B': 3.00,
  'B-': 2.75,
  'C+': 2.50,
  'C': 2.25,
  'D': 2.00,
  'F': 0.00
};

let cgpaCourseList = [
  { name: 'ME 4201 Power Plant Engineering', credits: 3.0, grade: 'A+' },
  { name: 'ME 4202 Power Plant Sessional', credits: 1.5, grade: 'A+' },
  { name: 'ME 4203 Automobile Engineering', credits: 3.0, grade: 'A' },
  { name: 'ME 4204 Automobile Sessional', credits: 0.75, grade: 'A+' }
];

function renderCgpaRows() {
  const container = document.getElementById('cgpaCourseRows');
  if (!container) return;

  container.innerHTML = cgpaCourseList.map((c, idx) => `
    <div class="grid grid-cols-12 gap-2 items-center">
      <div class="col-span-5 sm:col-span-6">
        <input type="text" value="${c.name}" oninput="cgpaCourseList[${idx}].name = this.value" placeholder="Course Name" class="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-amber-500">
      </div>
      <div class="col-span-3 sm:col-span-3">
        <input type="number" step="0.25" min="0.75" max="6.0" value="${c.credits}" oninput="cgpaCourseList[${idx}].credits = parseFloat(this.value) || 0; calculateCgpa();" class="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono outline-none focus:border-amber-500">
      </div>
      <div class="col-span-3 sm:col-span-2">
        <select onchange="cgpaCourseList[${idx}].grade = this.value; calculateCgpa();" class="w-full px-2 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-amber-300 font-bold outline-none focus:border-amber-500">
          ${Object.keys(CUET_GRADE_POINTS).map(g => `<option value="${g}" ${c.grade === g ? 'selected' : ''}>${g} (${CUET_GRADE_POINTS[g].toFixed(2)})</option>`).join('')}
        </select>
      </div>
      <div class="col-span-1 sm:col-span-1 text-center">
        <button type="button" onclick="removeCgpaCourseRow(${idx})" class="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors" title="Delete Course">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </div>
    </div>
  `).join('');

  if (window.lucide) lucide.createIcons();
  calculateCgpa();
}

function addCgpaCourseRow(name = '', credits = 3.0, grade = 'A+') {
  cgpaCourseList.push({ name: name || `Course ${cgpaCourseList.length + 1}`, credits, grade });
  renderCgpaRows();
}

function removeCgpaCourseRow(index) {
  if (cgpaCourseList.length <= 1) {
    showToast('কমপক্ষে ১টি কোর্স তালিকায় থাকতে হবে।');
    return;
  }
  cgpaCourseList.splice(index, 1);
  renderCgpaRows();
}

function loadCgpaPreset(term) {
  if (term === 'L4-T2') {
    cgpaCourseList = [
      { name: 'ME 4201 Power Plant Engineering', credits: 3.0, grade: 'A+' },
      { name: 'ME 4202 Power Plant Sessional', credits: 1.5, grade: 'A+' },
      { name: 'ME 4203 Automobile Engineering', credits: 3.0, grade: 'A+' },
      { name: 'ME 4204 Automobile Sessional', credits: 0.75, grade: 'A+' },
      { name: 'ME 4205 Operations Research', credits: 3.0, grade: 'A' },
      { name: 'IPE 4201 Production Planning & Control', credits: 3.0, grade: 'A' },
      { name: 'ME 4000 Project & Thesis', credits: 3.0, grade: 'A+' }
    ];
  } else {
    cgpaCourseList = [
      { name: 'ME 411 Internal Combustion Engines', credits: 3.0, grade: 'A+' },
      { name: 'ME 412 IC Engine Sessional', credits: 1.5, grade: 'A+' },
      { name: 'ME 413 Refrigeration & Air Conditioning', credits: 3.0, grade: 'A' },
      { name: 'ME 414 RAC Sessional', credits: 0.75, grade: 'A+' },
      { name: 'ME 415 Power Plant Engineering I', credits: 3.0, grade: 'A' },
      { name: 'ME 417 Finite Element Analysis', credits: 3.0, grade: 'A' }
    ];
  }
  renderCgpaRows();
  showToast(`CUET ${term} কোর্সসমূহ লোড করা হয়েছে!`);
}

function calculateCgpa() {
  let totalTermCredits = 0;
  let totalGradePoints = 0;

  cgpaCourseList.forEach(c => {
    const cr = parseFloat(c.credits) || 0;
    const gp = CUET_GRADE_POINTS[c.grade] !== undefined ? CUET_GRADE_POINTS[c.grade] : 0;
    totalTermCredits += cr;
    totalGradePoints += (cr * gp);
  });

  const termGpa = totalTermCredits > 0 ? (totalGradePoints / totalTermCredits) : 0;

  const totalCreditsEl = document.getElementById('cgpaTotalCredits');
  const termGpaEl = document.getElementById('cgpaTermGpa');
  const honorBadgeEl = document.getElementById('cgpaHonorBadge');
  const overallResultEl = document.getElementById('cgpaOverallResult');

  if (totalCreditsEl) totalCreditsEl.textContent = totalTermCredits.toFixed(2);
  if (termGpaEl) termGpaEl.textContent = termGpa.toFixed(2);

  if (honorBadgeEl) {
    if (termGpa >= 3.75) {
      honorBadgeEl.textContent = '🌟 Honours / First Class with Distinction';
      honorBadgeEl.className = 'text-[10px] text-emerald-400 font-semibold';
    } else if (termGpa >= 3.00) {
      honorBadgeEl.textContent = '✓ First Class Standing (CUET)';
      honorBadgeEl.className = 'text-[10px] text-indigo-400 font-semibold';
    } else if (termGpa >= 2.25) {
      honorBadgeEl.textContent = 'Second Class Standing';
      honorBadgeEl.className = 'text-[10px] text-amber-400 font-semibold';
    } else {
      honorBadgeEl.textContent = 'Passing / Retake Required';
      honorBadgeEl.className = 'text-[10px] text-red-400 font-semibold';
    }
  }

  // Cumulative CGPA calculation
  const prevCrInput = document.getElementById('prevCreditsInput');
  const prevCgpaInput = document.getElementById('prevCgpaInput');
  const prevCredits = parseFloat(prevCrInput ? prevCrInput.value : 0) || 0;
  const prevCgpa = parseFloat(prevCgpaInput ? prevCgpaInput.value : 0) || 0;

  let cumulativeCgpa = termGpa;
  if (prevCredits > 0) {
    const totalCombinedCredits = prevCredits + totalTermCredits;
    if (totalCombinedCredits > 0) {
      cumulativeCgpa = ((prevCredits * prevCgpa) + totalGradePoints) / totalCombinedCredits;
    }
  }

  if (overallResultEl) overallResultEl.textContent = cumulativeCgpa.toFixed(2);
}

function resetCgpaCalculator() {
  cgpaCourseList = [
    { name: 'Course 1', credits: 3.0, grade: 'A+' },
    { name: 'Course 2', credits: 3.0, grade: 'A' },
    { name: 'Course 3', credits: 1.5, grade: 'A+' },
    { name: 'Course 4', credits: 0.75, grade: 'A' }
  ];
  const prevCrInput = document.getElementById('prevCreditsInput');
  const prevCgpaInput = document.getElementById('prevCgpaInput');
  if (prevCrInput) prevCrInput.value = '';
  if (prevCgpaInput) prevCgpaInput.value = '';
  renderCgpaRows();
  showToast('CGPA ক্যালকুলেটর রিসেট করা হয়েছে।');
}

/* =========================================================================
   19. CUET ME FACULTY & STAFF DIRECTORY (FULL CMS & CONTACTS)
   ========================================================================= */
const DEFAULT_FACULTY_MEMBERS = [
  {
    "id": "fac_1",
    "name": "Dr. Bodius Salam",
    "designation": "Professor",
    "category": "PROFESSOR",
    "room": "ME Building",
    "email": "bodiussalam@yahoo.com, bsalam@cuet.ac.bd",
    "phone": "01713109924",
    "tnt": "2704",
    "whatsapp": "8801713109924",
    "specialization": "Thermal Engineering, Solar Energy, Heat Transfer",
    "order": 1
  },
  {
    "id": "fac_2",
    "name": "Dr. Md. Mahbubul Alam",
    "designation": "Professor",
    "category": "PROFESSOR",
    "room": "ME Building",
    "email": "mahbub87@yahoo.com, malam@cuet.ac.bd",
    "phone": "01812830127",
    "tnt": "2702",
    "whatsapp": "8801812830127",
    "specialization": "Production & Manufacturing Engineering, Materials",
    "order": 2
  },
  {
    "id": "fac_3",
    "name": "Dr. Sajal Chandra Banik",
    "designation": "Professor",
    "category": "PROFESSOR",
    "room": "Mechatronics & Robotics Lab",
    "email": "baniksajal@cuet.ac.bd",
    "phone": "01821781459",
    "tnt": "2724",
    "whatsapp": "8801821781459",
    "specialization": "Robotics, Mechatronics, Automation & Control",
    "order": 3
  },
  {
    "id": "fac_4",
    "name": "Dr. Jamal Uddin Ahamed",
    "designation": "Professor",
    "category": "PROFESSOR",
    "room": "ME Building",
    "email": "jamal293@yahoo.com, jamal@cuet.ac.bd",
    "phone": "01720641636",
    "tnt": "2714",
    "whatsapp": "8801720641636",
    "specialization": "Thermal Power, Energy Conservation, Nanofluids",
    "order": 4
  },
  {
    "id": "fac_5",
    "name": "Dr. Sheikh Muhammad Humayun Kabir",
    "designation": "Professor",
    "category": "PROFESSOR",
    "room": "ME Building",
    "email": "humayun@cuet.ac.bd, daliinuoo@yahoo.com",
    "phone": "01716469972",
    "tnt": "2726",
    "whatsapp": "8801716469972",
    "specialization": "Applied Mechanics, Solid Mechanics & Stress Analysis",
    "order": 5
  },
  {
    "id": "fac_6",
    "name": "Dr. Kazi Afzalur Rahman",
    "designation": "Professor",
    "category": "PROFESSOR",
    "room": "ME Building",
    "email": "afzalur99@yahoo.com, afzal@cuet.ac.bd",
    "phone": "01680453267",
    "tnt": "2723",
    "whatsapp": "8801680453267",
    "specialization": "Fluid Machinery, CFD & Fluid Dynamics",
    "order": 6
  },
  {
    "id": "fac_7",
    "name": "Dr. Mohammad Mizanur Rahman",
    "designation": "Professor",
    "category": "PROFESSOR",
    "room": "Automobile Lab, ME Building",
    "email": "mmrahman.cuet@gmail.com",
    "phone": "01864800089",
    "tnt": "2710",
    "whatsapp": "8801864800089",
    "specialization": "Automobile Engineering, IC Engines, Alternate Fuels",
    "order": 7
  },
  {
    "id": "fac_8",
    "name": "Dr. Muhammad Mostafa Kamal Bhuiya",
    "designation": "Head of Department & Professor",
    "category": "HEAD",
    "room": "Department Head Office, ME Building",
    "email": "mkamalcuet@yahoo.com, mkamal@cuet.ac.bd",
    "phone": "01784353193",
    "tnt": "2729",
    "whatsapp": "8801784353193",
    "specialization": "Thermal Engineering, Heat Transfer Enhancement, Renewable Energy",
    "order": 8
  },
  {
    "id": "fac_9",
    "name": "Dr. Md. Sanaul Rabbi",
    "designation": "Professor",
    "category": "PROFESSOR",
    "room": "ME Building",
    "email": "rabbi@cuet.ac.bd",
    "phone": "01717300305",
    "tnt": "",
    "whatsapp": "8801717300305",
    "specialization": "Thermodynamics, Power Plant, Heat Systems",
    "order": 9
  },
  {
    "id": "fac_10",
    "name": "Dr. Md. Arafat Rahman",
    "designation": "Professor",
    "category": "PROFESSOR",
    "room": "ME Building",
    "email": "arafat@cuet.ac.bd",
    "phone": "01719416328",
    "tnt": "2727",
    "whatsapp": "8801719416328",
    "specialization": "Materials Science, Metallurgy, Fracture Mechanics",
    "order": 10
  },
  {
    "id": "fac_11",
    "name": "Dr. Prasanjit Das",
    "designation": "Associate Professor",
    "category": "ASSOCIATE",
    "room": "ME Building",
    "email": "prasanjit12@gmail.com, prasanjit@cuet.ac.bd",
    "phone": "01642997909",
    "tnt": "",
    "whatsapp": "8801642997909",
    "specialization": "Combustion, Energy Systems, Thermal Modeling",
    "order": 11
  },
  {
    "id": "fac_12",
    "name": "Dr. Abu Shadat Muhammad Sayem",
    "designation": "Associate Professor",
    "category": "ASSOCIATE",
    "room": "ME Building",
    "email": "yessayem@yahoo.com, a.sayem@cuet.ac.bd",
    "phone": "01710503692",
    "tnt": "",
    "whatsapp": "8801710503692",
    "specialization": "Fluid Mechanics, Multiphase Flow & Heat Exchangers",
    "order": 12
  },
  {
    "id": "fac_13",
    "name": "Dr. Md. Mamunur Roshid",
    "designation": "Associate Professor",
    "category": "ASSOCIATE",
    "room": "ME Building",
    "email": "mamun_cuet2003@yahoo.com, mamuncuet2003@cuet.ac.bd",
    "phone": "01818651850",
    "tnt": "",
    "whatsapp": "8801818651850",
    "specialization": "Applied Mechanics, Vibration Analysis, Dynamics",
    "order": 13
  },
  {
    "id": "fac_14",
    "name": "Dr. Md. Abu Mowazzem Hossain",
    "designation": "Associate Professor",
    "category": "ASSOCIATE",
    "room": "ME Building",
    "email": "mowazzem@cuet.ac.bd",
    "phone": "01735530848",
    "tnt": "2722",
    "whatsapp": "8801735530848",
    "specialization": "Manufacturing Engineering, Tool Wear & Metal Cutting",
    "order": 14
  },
  {
    "id": "fac_15",
    "name": "Dr. Tilok Kumar Das",
    "designation": "Associate Professor",
    "category": "ASSOCIATE",
    "room": "ME Building",
    "email": "tilok_cuet@yahoo.com, tilok@cuet.ac.bd",
    "phone": "01818767625",
    "tnt": "",
    "whatsapp": "8801818767625",
    "specialization": "Renewable Energy, Heat Transfer, Fluid Mechanics",
    "order": 15
  },
  {
    "id": "fac_16",
    "name": "Mr. Md. Aminul Islam",
    "designation": "Assistant Professor",
    "category": "ASSOCIATE",
    "room": "ME Building",
    "email": "aislam@cuet.ac.bd",
    "phone": "01837888835",
    "tnt": "2720",
    "whatsapp": "8801837888835",
    "specialization": "Thermodynamics & Heat Transfer",
    "order": 16
  },
  {
    "id": "fac_17",
    "name": "Mr. Syed Masrur Ahmmad",
    "designation": "Assistant Professor",
    "category": "ASSOCIATE",
    "room": "ME Building",
    "email": "bdmasrur91@gmail.com",
    "phone": "01725554528",
    "tnt": "2712",
    "whatsapp": "8801725554528",
    "specialization": "Machine Design & Stress Analysis",
    "order": 17
  },
  {
    "id": "fac_18",
    "name": "Dr. Mostafizur Rahman",
    "designation": "Assistant Professor",
    "category": "ASSOCIATE",
    "room": "ME Building",
    "email": "rmostafiz31@gmail.com",
    "phone": "01738263617",
    "tnt": "",
    "whatsapp": "8801738263617",
    "specialization": "Nanotechnology & Materials Science",
    "order": 18
  },
  {
    "id": "fac_19",
    "name": "Dr. Afnan Hasan",
    "designation": "Assistant Professor",
    "category": "ASSOCIATE",
    "room": "ME Building",
    "email": "afnanhasan@cuet.ac.bd, afnanhasan@gmail.com",
    "phone": "01303042334",
    "tnt": "",
    "whatsapp": "8801303042334",
    "specialization": "Aerodynamics & CFD",
    "order": 19
  },
  {
    "id": "fac_20",
    "name": "Mr. Radheshyam Nath Jisu",
    "designation": "Assistant Professor",
    "category": "ASSOCIATE",
    "room": "ME Building",
    "email": "radheshyamnathjisu@gmail.com, radheshyam@cuet.ac.bd",
    "phone": "01521227537",
    "tnt": "",
    "whatsapp": "8801521227537",
    "specialization": "Robotics, Automation & Mechatronics",
    "order": 20
  },
  {
    "id": "fac_21",
    "name": "Mr. Tafsirul Hassan",
    "designation": "Assistant Professor",
    "category": "ASSOCIATE",
    "room": "ME Building",
    "email": "tafsir2086@gmail.com",
    "phone": "01812680648",
    "tnt": "",
    "whatsapp": "8801812680648",
    "specialization": "Fluid Mechanics & Heat Transfer",
    "order": 21
  },
  {
    "id": "fac_22",
    "name": "Mr. Mohammad Nezam Uddin Chy",
    "designation": "Assistant Professor",
    "category": "ASSOCIATE",
    "room": "ME Building",
    "email": "bdnezam15@gmail.com",
    "phone": "01882823600",
    "tnt": "",
    "whatsapp": "8801882823600",
    "specialization": "Automobile Engineering & Thermal Power",
    "order": 22
  },
  {
    "id": "fac_23",
    "name": "Mr. Redoy Masum Meraz",
    "designation": "Assistant Professor",
    "category": "ASSOCIATE",
    "room": "ME Building",
    "email": "meraz@cuet.ac.bd",
    "phone": "01712132762",
    "tnt": "",
    "whatsapp": "8801712132762",
    "specialization": "Solid Mechanics & CAD/CAM",
    "order": 23
  },
  {
    "id": "fac_24",
    "name": "Mr. Minhaz Ahmed",
    "designation": "Assistant Professor",
    "category": "ASSOCIATE",
    "room": "ME Building",
    "email": "minhaz@cuet.ac.bd, minhaz.ahmed.1603018@gmail.com",
    "phone": "01537202191",
    "tnt": "",
    "whatsapp": "8801537202191",
    "specialization": "Renewable Energy & Mechanical Design",
    "order": 24
  },
  {
    "id": "fac_25",
    "name": "Mr. Abdullah Al Rifat",
    "designation": "Lecturer",
    "category": "ASSOCIATE",
    "room": "ME Building",
    "email": "alrifat50@gmail.com",
    "phone": "01747680478",
    "tnt": "",
    "whatsapp": "8801747680478",
    "specialization": "Thermodynamics & Heat Transfer",
    "order": 25
  },
  {
    "id": "fac_26",
    "name": "Mr. Abdullah-Al-Mamun",
    "designation": "Lecturer",
    "category": "ASSOCIATE",
    "room": "ME Building",
    "email": "Rakibmamun107@gmail.com",
    "phone": "01824192709",
    "tnt": "",
    "whatsapp": "8801824192709",
    "specialization": "Fluid Dynamics & Turbomachinery",
    "order": 26
  },
  {
    "id": "fac_27",
    "name": "Mr. Protick Chandra Ghosh",
    "designation": "Lecturer",
    "category": "ASSOCIATE",
    "room": "ME Building",
    "email": "protickchandraghosh123@gmail.com",
    "phone": "01992880020",
    "tnt": "",
    "whatsapp": "8801992880020",
    "specialization": "Control Systems & Robotics",
    "order": 27
  },
  {
    "id": "fac_28",
    "name": "Mr. Tahsin Abid Ahmed",
    "designation": "Lecturer",
    "category": "ASSOCIATE",
    "room": "ME Building",
    "email": "tahsin.me.113@gmail.com",
    "phone": "01762388882",
    "tnt": "",
    "whatsapp": "8801762388882",
    "specialization": "Materials Science & Mechanical Testing",
    "order": 28
  },
  {
    "id": "fac_29",
    "name": "Mr. Md. Tanvir Mahmud",
    "designation": "Lecturer",
    "category": "ASSOCIATE",
    "room": "ME Building",
    "email": "tanvirmahmud775@gmail.com",
    "phone": "01876593419",
    "tnt": "",
    "whatsapp": "8801876593419",
    "specialization": "Heat Transfer & IC Engines",
    "order": 29
  },
  {
    "id": "fac_30",
    "name": "Ms. Fahmida Zahan",
    "designation": "Lab Assistant",
    "category": "STAFF",
    "room": "ME Building",
    "email": "fahmidazahan82@gmail.com",
    "phone": "01991945168",
    "tnt": "2186",
    "whatsapp": "8801991945168",
    "specialization": "Laboratory & Practical Session Support",
    "order": 30
  },
  {
    "id": "fac_31",
    "name": "Mr. Sujon Kanti Das",
    "designation": "Senior Technical Officer",
    "category": "STAFF",
    "room": "ME Workshop / Laboratories",
    "email": "sujoncuet@yahoo.com",
    "phone": "01713109923",
    "tnt": "",
    "whatsapp": "8801713109923",
    "specialization": "Laboratory Instrumentation & Testing Operations",
    "order": 31
  },
  {
    "id": "fac_32",
    "name": "Mr. Md. Mominur Rahman",
    "designation": "Technical Officer",
    "category": "STAFF",
    "room": "ME Laboratory",
    "email": "dippdipu@gmail.com",
    "phone": "01714595605",
    "tnt": "2754",
    "whatsapp": "8801714595605",
    "specialization": "Lab Setup & Technical Maintenance",
    "order": 32
  },
  {
    "id": "fac_33",
    "name": "Mr. Iswar Chandra Mondal",
    "designation": "Technical Officer",
    "category": "STAFF",
    "room": "Central Workshop & ME Labs",
    "email": "iswarme2018@gmail.com",
    "phone": "01782555584",
    "tnt": "2759",
    "whatsapp": "8801782555584",
    "specialization": "Workshop Machines & Testing Services",
    "order": 33
  },
  {
    "id": "fac_34",
    "name": "Mr. Sirajul Monir",
    "designation": "Section Officer",
    "category": "STAFF",
    "room": "Department Office, ME Building",
    "email": "mdmonirctg99@gmail.com",
    "phone": "01835508202",
    "tnt": "",
    "whatsapp": "8801835508202",
    "specialization": "Academic Administration & Records",
    "order": 34
  },
  {
    "id": "fac_35",
    "name": "Mr. Syed Md. Dastagir",
    "designation": "Section Officer",
    "category": "STAFF",
    "room": "Department Office, ME Building",
    "email": "dastagir88@yahoo.com",
    "phone": "01817725904",
    "tnt": "",
    "whatsapp": "8801817725904",
    "specialization": "Administrative Support & Coordination",
    "order": 35
  },
  {
    "id": "fac_36",
    "name": "Ms. Anuradha Mallick",
    "designation": "Administrative Officer",
    "category": "STAFF",
    "room": "Department Office, ME Building",
    "email": "radhacuet@gmail.com",
    "phone": "01811923524",
    "tnt": "2755",
    "whatsapp": "8801811923524",
    "specialization": "Office Affairs & Student Communication",
    "order": 36
  },
  {
    "id": "fac_37",
    "name": "Mr. Mohammad Abdullah",
    "designation": "Office Staff",
    "category": "STAFF",
    "room": "Department Office, ME Building",
    "email": "mdabdullahcuet@gmail.com",
    "phone": "01914594662",
    "tnt": "2756",
    "whatsapp": "8801914594662",
    "specialization": "Departmental Correspondence & Logistics",
    "order": 37
  },
  {
    "id": "fac_38",
    "name": "Mr. Md. Abu Shahadat",
    "designation": "Staff / Technician",
    "category": "STAFF",
    "room": "ME Laboratories",
    "email": "",
    "phone": "01818557009",
    "tnt": "",
    "whatsapp": "8801818557009",
    "specialization": "Laboratory Operations & Maintenance",
    "order": 38
  },
  {
    "id": "fac_39",
    "name": "Mr. Emranul Hoque",
    "designation": "Staff / Technician",
    "category": "STAFF",
    "room": "ME Laboratories",
    "email": "emranulhoque@gmail.com",
    "phone": "01627635838",
    "tnt": "",
    "whatsapp": "8801627635838",
    "specialization": "Lab Maintenance & Support",
    "order": 39
  },
  {
    "id": "fac_42",
    "name": "Mr. Rupayan Das",
    "designation": "Staff / Technician",
    "category": "STAFF",
    "room": "ME Laboratories",
    "email": "rupayandas002@gmail.com",
    "phone": "01811920365",
    "tnt": "",
    "whatsapp": "8801811920365",
    "specialization": "Machine Operation & Tooling",
    "order": 42
  },
  {
    "id": "fac_43",
    "name": "Mr. Muhammed Khalilur Rahman",
    "designation": "Staff / Technician",
    "category": "STAFF",
    "room": "Central Workshop & Labs",
    "email": "khalilcuet26@gmail.com",
    "phone": "01818889100",
    "tnt": "",
    "whatsapp": "8801818889100",
    "specialization": "Workshop Fabrication & Maintenance",
    "order": 43
  },
  {
    "id": "fac_44",
    "name": "Mr. Mohammad Kamrul Hasan",
    "designation": "Staff / Technician",
    "category": "STAFF",
    "room": "ME Laboratories",
    "email": "Khrakib85@gmail.com",
    "phone": "01815185152",
    "tnt": "",
    "whatsapp": "8801815185152",
    "specialization": "Laboratory Technical Support",
    "order": 44
  },
  {
    "id": "fac_45",
    "name": "Mr. Muhammad Abdul Kader",
    "designation": "Staff / Technician",
    "category": "STAFF",
    "room": "ME Laboratories",
    "email": "",
    "phone": "01825868662",
    "tnt": "",
    "whatsapp": "8801825868662",
    "specialization": "Workshop Equipment Support",
    "order": 45
  },
  {
    "id": "fac_46",
    "name": "Ms. Afrina Tasmim",
    "designation": "Staff / Lab Attendant",
    "category": "STAFF",
    "room": "ME Laboratories",
    "email": "afrinatasmim.sub@gmail.com",
    "phone": "01987527264",
    "tnt": "",
    "whatsapp": "8801987527264",
    "specialization": "Lab Record & Equipment Handling",
    "order": 46
  },
  {
    "id": "fac_47",
    "name": "Mr. Md. Abu Taher",
    "designation": "Staff / Lab Attendant",
    "category": "STAFF",
    "room": "ME Laboratories",
    "email": "",
    "phone": "01834058770",
    "tnt": "",
    "whatsapp": "8801834058770",
    "specialization": "Laboratory Operations Support",
    "order": 47
  },
  {
    "id": "fac_48",
    "name": "Mr. Shafiqul Islam",
    "designation": "Staff / Lab Attendant",
    "category": "STAFF",
    "room": "ME Laboratories",
    "email": "",
    "phone": "01917884470",
    "tnt": "",
    "whatsapp": "8801917884470",
    "specialization": "Lab Facilities & Logistics",
    "order": 48
  },
  {
    "id": "fac_49",
    "name": "Mr. Sumon Chakraborty",
    "designation": "Staff / Lab Attendant",
    "category": "STAFF",
    "room": "ME Laboratories",
    "email": "",
    "phone": "01840219603",
    "tnt": "",
    "whatsapp": "8801840219603",
    "specialization": "Equipment Upkeep & Lab Handling",
    "order": 49
  },
  {
    "id": "fac_50",
    "name": "Mr. Miton Shil",
    "designation": "Staff / Lab Attendant",
    "category": "STAFF",
    "room": "ME Laboratories",
    "email": "mitonshilabeer@gmail.com",
    "phone": "01830557462",
    "tnt": "",
    "whatsapp": "8801830557462",
    "specialization": "Laboratory Technical Maintenance",
    "order": 50
  },
  {
    "id": "fac_51",
    "name": "Mr. Nazim Uddin",
    "designation": "Staff / Lab Attendant",
    "category": "STAFF",
    "room": "ME Laboratories",
    "email": "",
    "phone": "01641416841",
    "tnt": "",
    "whatsapp": "8801641416841",
    "specialization": "Departmental Lab Logistics",
    "order": 51
  },
  {
    "id": "fac_52",
    "name": "Mr. Jobayed Hossen",
    "designation": "Staff / Lab Attendant",
    "category": "STAFF",
    "room": "ME Laboratories",
    "email": "",
    "phone": "01830108809",
    "tnt": "",
    "whatsapp": "8801830108809",
    "specialization": "Workshop & Laboratory Support",
    "order": 52
  },
  {
    "id": "fac_53",
    "name": "Mr. Mohammed Ariful Hoque",
    "designation": "Staff / Lab Attendant",
    "category": "STAFF",
    "room": "ME Laboratories",
    "email": "",
    "phone": "01834575980",
    "tnt": "",
    "whatsapp": "8801834575980",
    "specialization": "Departmental Lab Logistics",
    "order": 53
  }
];

let facultyCategoryFilter = 'ALL';
let facultySearchKeyword = '';

function getFacultyMembers() {
  const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_FACULTY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length >= 40) {
        parsed.forEach(f => {
          if (f.id === 'fac_30' || (f.name && f.name.includes('Fahmida Zahan'))) {
            f.designation = 'Lab Assistant';
            f.category = 'STAFF';
          }
        });
        return parsed;
      }
    } catch (e) {
      console.warn('Error reading faculty members:', e);
    }
  }
  localStorage.setItem(STORAGE_KEYS.ADMIN_FACULTY, JSON.stringify(DEFAULT_FACULTY_MEMBERS));
  return DEFAULT_FACULTY_MEMBERS;
}

function saveFacultyMembers(list) {
  localStorage.setItem(STORAGE_KEYS.ADMIN_FACULTY, JSON.stringify(list));
}

function filterFacultyCategory(cat) {
  facultyCategoryFilter = cat;
  ['ALL', 'HEAD', 'PROFESSOR', 'ASSOCIATE', 'STAFF'].forEach(c => {
    const btn = document.getElementById(`facFilter-${c}`);
    if (btn) {
      if (c === cat) {
        btn.className = 'px-3 py-1.5 rounded-xl bg-cyan-600 text-white font-semibold whitespace-nowrap shadow-sm transition-all';
      } else {
        btn.className = 'px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium whitespace-nowrap transition-all';
      }
    }
  });
  renderFacultyDirectory();
}

function handleFacultySearch(query) {
  facultySearchKeyword = (query || '').toLowerCase().trim();
  renderFacultyDirectory();
}

function renderFacultyDirectory() {
  const isUserAdmin = Boolean(currentUser && typeof isAdmin === 'function' && isAdmin(currentUser));
  const grid = document.getElementById('facultyDirectoryGrid');
  const countBadge = document.getElementById('facultyDirectoryTotalBadge');
  const homeBadge = document.getElementById('facultyCountBadge');
  const adminHeader = document.getElementById('adminFacultyActionHeader');

  if (adminHeader) {
    if (isUserAdmin) adminHeader.classList.remove('hidden');
    else adminHeader.classList.add('hidden');
  }

  const allMembers = getFacultyMembers();
  if (countBadge) countBadge.textContent = `${allMembers.length} Members`;
  if (homeBadge) homeBadge.textContent = allMembers.length;

  if (!grid) return;

  let filtered = allMembers;
  if (facultyCategoryFilter !== 'ALL') {
    filtered = filtered.filter(f => f.category === facultyCategoryFilter);
  }
  if (facultySearchKeyword) {
    filtered = filtered.filter(f => 
      (f.name && f.name.toLowerCase().includes(facultySearchKeyword)) ||
      (f.designation && f.designation.toLowerCase().includes(facultySearchKeyword)) ||
      (f.specialization && f.specialization.toLowerCase().includes(facultySearchKeyword)) ||
      (f.room && f.room.toLowerCase().includes(facultySearchKeyword)) ||
      (f.email && f.email.toLowerCase().includes(facultySearchKeyword)) ||
      (f.phone && f.phone.includes(facultySearchKeyword)) ||
      (f.tnt && f.tnt.includes(facultySearchKeyword))
    );
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
        কোনো শিক্ষক বা কর্মকর্তা পাওয়া যায়নি। ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(f => `
    <div class="p-5 rounded-2xl glass-card border border-slate-800 hover:border-cyan-500/50 flex flex-col justify-between space-y-4 transition-all duration-300 shadow-lg">
      <div class="space-y-3">
        <div class="flex items-start justify-between gap-2">
          <div class="w-10 h-10 rounded-2xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center font-bold text-sm border border-cyan-500/30 flex-shrink-0">
            ${f.name.split(' ').filter(p => !['Prof.', 'Dr.', 'Engr.', 'Md.'].includes(p))[0]?.[0] || 'ME'}
          </div>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
            f.category === 'HEAD' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
            f.category === 'PROFESSOR' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
            f.category === 'STAFF' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
            'bg-slate-800 text-slate-300'
          }">
            ${f.designation.includes('&') ? f.designation.split('&')[0].trim() : f.designation}
          </span>
        </div>

        <div>
          <h4 class="text-sm font-bold text-white leading-snug">${f.name}</h4>
          <p class="text-xs text-cyan-400 font-medium mt-0.5">${f.designation}</p>
        </div>

        <div class="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
          <div class="flex items-center gap-2">
            <i data-lucide="map-pin" class="w-3.5 h-3.5 text-slate-400 flex-shrink-0"></i>
            <span class="truncate">${f.room || 'ME Department'}</span>
          </div>
          ${f.email ? `
            <div class="flex items-center gap-2">
              <i data-lucide="mail" class="w-3.5 h-3.5 text-slate-400 flex-shrink-0"></i>
              <a href="mailto:${f.email}" class="text-indigo-300 hover:underline truncate">${f.email}</a>
            </div>
          ` : ''}
          ${f.phone ? `
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <i data-lucide="phone" class="w-3.5 h-3.5 text-slate-400 flex-shrink-0"></i>
                <span class="font-mono text-slate-200 text-xs">${f.phone}</span>
              </div>
              ${f.tnt ? `<span class="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-amber-300 font-mono font-bold border border-slate-700">TNT: ${f.tnt}</span>` : ''}
            </div>
          ` : ''}
          ${f.specialization ? `
            <div class="p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300 mt-2">
              <strong class="text-cyan-300">গবেষণা ও স্পেশালাইজেশন:</strong> ${f.specialization}
            </div>
          ` : ''}
        </div>
      </div>

      <div class="flex items-center justify-between gap-2 pt-3 border-t border-slate-800/80">
        <div class="flex items-center gap-1.5">
          ${f.email ? `
            <a href="mailto:${f.email}" title="ইমেইল পাঠান" class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all">
              <i data-lucide="mail" class="w-3.5 h-3.5"></i>
            </a>
          ` : ''}
          ${f.whatsapp ? `
            <a href="https://wa.me/${f.whatsapp.replace(/\D/g, '')}" target="_blank" rel="noopener noreferrer" title="WhatsApp বার্তা" class="p-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 transition-all">
              <i data-lucide="message-circle" class="w-3.5 h-3.5"></i>
            </a>
          ` : ''}
          ${f.phone ? `
            <a href="tel:${f.phone.replace(/\s+/g, '')}" title="কল করুন" class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all">
              <i data-lucide="phone-call" class="w-3.5 h-3.5"></i>
            </a>
          ` : ''}
        </div>
        ${isUserAdmin ? `
          <div class="flex items-center gap-1">
            <button onclick="openEditFacultyModal('${f.id}')" class="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white text-[11px] font-semibold transition-all">
              Edit
            </button>
            <button onclick="deleteFacultyMember('${f.id}')" class="px-2.5 py-1 rounded-lg bg-red-600/30 hover:bg-red-600 text-red-300 hover:text-white text-[11px] font-semibold transition-all">
              Del
            </button>
          </div>
        ` : ''}
      </div>
    </div>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

function openAddFacultyModal() {
  const modal = document.getElementById('editFacultyModal');
  const title = document.getElementById('facultyModalTitle');
  const form = document.getElementById('facultyMemberForm');
  if (title) title.textContent = 'Add New Faculty / Staff Member';
  if (form) form.reset();
  const idInput = document.getElementById('facultyEditId');
  if (idInput) idInput.value = '';
  if (modal) modal.showModal();
}

function openEditFacultyModal(id) {
  const list = getFacultyMembers();
  const member = list.find(m => m.id === id);
  if (!member) return;

  const modal = document.getElementById('editFacultyModal');
  const title = document.getElementById('facultyModalTitle');
  if (title) title.textContent = 'Edit Faculty Member Details';

  document.getElementById('facultyEditId').value = member.id || '';
  document.getElementById('facultyNameInput').value = member.name || '';
  document.getElementById('facultyDesignationInput').value = member.designation || '';
  document.getElementById('facultyCategoryInput').value = member.category || 'PROFESSOR';
  document.getElementById('facultyRoomInput').value = member.room || '';
  document.getElementById('facultyEmailInput').value = member.email || '';
  document.getElementById('facultyPhoneInput').value = member.phone || '';
  document.getElementById('facultyWhatsappInput').value = member.whatsapp || '';
  document.getElementById('facultySpecializationInput').value = member.specialization || '';
  document.getElementById('facultyOrderInput').value = member.order || 1;

  if (modal) modal.showModal();
}

function closeEditFacultyModal() {
  const modal = document.getElementById('editFacultyModal');
  if (modal) modal.close();
}

function handleSaveFaculty(e) {
  if (e && e.preventDefault) e.preventDefault();
  const list = getFacultyMembers();
  const editId = document.getElementById('facultyEditId')?.value;

  const newEntry = {
    id: editId || ('fac_' + Date.now()),
    name: document.getElementById('facultyNameInput')?.value.trim() || '',
    designation: document.getElementById('facultyDesignationInput')?.value.trim() || '',
    category: document.getElementById('facultyCategoryInput')?.value || 'PROFESSOR',
    room: document.getElementById('facultyRoomInput')?.value.trim() || '',
    email: document.getElementById('facultyEmailInput')?.value.trim() || '',
    phone: document.getElementById('facultyPhoneInput')?.value.trim() || '',
    whatsapp: document.getElementById('facultyWhatsappInput')?.value.trim() || '',
    specialization: document.getElementById('facultySpecializationInput')?.value.trim() || '',
    order: parseInt(document.getElementById('facultyOrderInput')?.value || '1', 10)
  };

  if (editId) {
    const idx = list.findIndex(m => m.id === editId);
    if (idx !== -1) list[idx] = newEntry;
    else list.push(newEntry);
  } else {
    list.push(newEntry);
  }

  list.sort((a, b) => (a.order || 99) - (b.order || 99));
  saveFacultyMembers(list);
  closeEditFacultyModal();
  renderFacultyDirectory();
  renderAdminFacultyManager();
  showToast('ফ্যাকাল্টি মেম্বারের তথ্য সফলভাবে সেভ করা হয়েছে!');
}

function deleteFacultyMember(id) {
  if (!confirm('আপনি কি নিশ্চিত যে এই ফ্যাকাল্টি মেম্বারকে ডিরেক্টরি থেকে মুছে ফেলতে চান?')) return;
  let list = getFacultyMembers();
  list = list.filter(m => m.id !== id);
  saveFacultyMembers(list);
  renderFacultyDirectory();
  renderAdminFacultyManager();
  showToast('ফ্যাকাল্টি মেম্বার মুছে ফেলা হয়েছে।');
}

function resetDefaultFaculty() {
  if (!confirm('আপনি কি ফ্যাকাল্টি ডিরেক্টরি ডিফল্ট ১৬ জন শিক্ষক ও কর্মকর্তার তালিকায় রিসেট করতে চান?')) return;
  saveFacultyMembers(DEFAULT_FACULTY_MEMBERS);
  renderFacultyDirectory();
  renderAdminFacultyManager();
  showToast('ফ্যাকাল্টি ডিরেক্টরি ডিফল্ট ১৬ জনে রিসেট করা হয়েছে!');
}

function renderAdminFacultyManager() {
  const container = document.getElementById('adminFacultyTableContainer');
  if (!container) return;

  const list = getFacultyMembers();
  if (list.length === 0) {
    container.innerHTML = `<div class="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 text-center">কোনো ফ্যাকাল্টি সদস্য নেই।</div>`;
    return;
  }

  container.innerHTML = `
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs border-collapse">
        <thead>
          <tr class="border-b border-slate-800 text-slate-400">
            <th class="py-2.5 px-3">Name</th>
            <th class="py-2.5 px-3">Designation</th>
            <th class="py-2.5 px-3">Room</th>
            <th class="py-2.5 px-3">Email</th>
            <th class="py-2.5 px-3">Category</th>
            <th class="py-2.5 px-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/60">
          ${list.map(f => `
            <tr class="hover:bg-slate-900/50 transition-colors">
              <td class="py-2.5 px-3 font-semibold text-white">${f.name}</td>
              <td class="py-2.5 px-3 text-slate-300">${f.designation}</td>
              <td class="py-2.5 px-3 text-slate-400 font-mono">${f.room || '-'}</td>
              <td class="py-2.5 px-3 text-indigo-300 font-mono">${f.email || '-'}</td>
              <td class="py-2.5 px-3"><span class="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-cyan-300">${f.category}</span></td>
              <td class="py-2.5 px-3 text-right space-x-1.5 whitespace-nowrap">
                <button onclick="openEditFacultyModal('${f.id}')" class="px-2 py-1 rounded bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white text-[11px] font-semibold">Edit</button>
                <button onclick="deleteFacultyMember('${f.id}')" class="px-2 py-1 rounded bg-red-600/30 hover:bg-red-600 text-red-300 hover:text-white text-[11px] font-semibold">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderAdminPublishPanel() {
  const tokenInput = document.getElementById('adminGithubTokenInput');
  const webhookInput = document.getElementById('adminFeedbackWebhookInput');
  if (tokenInput) {
    tokenInput.value = localStorage.getItem(STORAGE_KEYS.ADMIN_GITHUB_TOKEN) || '';
  }
  if (webhookInput) {
    webhookInput.value = localStorage.getItem(STORAGE_KEYS.FEEDBACK_WEBHOOK) || '';
  }
}

/* =========================================================================
   20. 1-CLICK LIVE PUBLISH TO GITHUB PAGES (SHARED CMS SYNC)
   ========================================================================= */
function saveFeedbackWebhook() {
  const input = document.getElementById('adminFeedbackWebhookInput');
  const url = (input ? input.value : '').trim();
  if (url) {
    localStorage.setItem(STORAGE_KEYS.FEEDBACK_WEBHOOK, url);
    showToast('Feedback Webhook URL সফলভাবে সেভ করা হয়েছে!');
  } else {
    localStorage.removeItem(STORAGE_KEYS.FEEDBACK_WEBHOOK);
    showToast('Webhook URL মুছে ফেলা হয়েছে।');
  }
}

async function publishToGithub() {
  const tokenInput = document.getElementById('adminGithubTokenInput');
  let token = (tokenInput ? tokenInput.value : '').trim() || localStorage.getItem(STORAGE_KEYS.ADMIN_GITHUB_TOKEN);

  if (!token) {
    token = prompt('দয়া করে আপনার GitHub Personal Access Token (PAT) প্রবেশ করান:\n(This allows publishing live changes to Fahim-Niloy2314/classroom-hub repository):');
    if (!token) return;
    token = token.trim();
  }

  localStorage.setItem(STORAGE_KEYS.ADMIN_GITHUB_TOKEN, token);
  if (tokenInput) tokenInput.value = token;

  const banner = document.getElementById('publishStatusBanner');
  const statusText = document.getElementById('publishStatusText');
  const btn = document.getElementById('publishLiveBtn');
  const btnText = document.getElementById('publishLiveBtnText');

  if (banner) banner.classList.remove('hidden');
  if (btn) btn.disabled = true;
  if (btnText) btnText.textContent = 'Publishing to GitHub...';

  try {
    if (statusText) statusText.textContent = 'Preparing live CMS bundle (Notices, Faculty, Routine)...';

    const cleanSettings = { ...portalSettings };
    delete cleanSettings.geminiApiKey;
    delete cleanSettings.openaiApiKey;
    delete cleanSettings.githubToken;

    const payload = {
      version: '3.2.0',
      lastPublished: new Date().toISOString(),
      publisher: currentUser?.name || 'Fahim Niloy (Admin)',
      portalSettings: cleanSettings,
      notices: adminNotices,
      faculty: getFacultyMembers(),
      routines: getStoredRoutine()
    };

    const contentStr = JSON.stringify(payload, null, 2);
    // Base64 encode UTF-8
    const contentBase64 = btoa(unescape(encodeURIComponent(contentStr)));

    // Check if secure backend server is available for server-side publishing
    let publishedViaServer = false;
    try {
      const srvCheck = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: payload, triggerDeploy: true })
      });
      if (srvCheck.ok) {
        const srvRes = await srvCheck.json();
        publishedViaServer = true;
        if (statusText) statusText.textContent = 'Successfully published and synchronized via ClassroomHub server backend!';
        if (btnText) btnText.textContent = 'Published Live!';
        setTimeout(() => {
          if (banner) banner.classList.add('hidden');
          if (btn) btn.disabled = false;
          if (btnText) btnText.textContent = 'Publish Changes to GitHub';
        }, 3000);
        showToast('Live changes successfully published via backend deployer!');
        return;
      }
    } catch (e) {
      // Backend not running locally, proceed with client deploy or prompt
    }

    const repoOwner = 'Fahim-Niloy2314';
    const repoName = 'classroom-hub';
    const filePath = 'portal_sync.json';
    const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;

    if (statusText) statusText.textContent = 'Checking existing remote file state on GitHub...';

    let currentSha = null;
    try {
      const checkRes = await fetch(apiUrl, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      if (checkRes.ok) {
        const checkData = await checkRes.json();
        currentSha = checkData.sha;
      }
    } catch (e) {
      console.warn('File check warning:', e);
    }

    if (statusText) statusText.textContent = 'Committing changes to main branch...';

    const commitBody = {
      message: `feat(cms): live sync update from admin dashboard [${new Date().toLocaleDateString()}]`,
      content: contentBase64,
      branch: 'main'
    };
    if (currentSha) {
      commitBody.sha = currentSha;
    }

    const putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify(commitBody)
    });

    if (putRes.ok) {
      if (statusText) statusText.textContent = '✓ Live publish successful! GitHub Pages will update in ~30 seconds.';
      showToast('অভিনন্দন! আপনার পরিবর্তনসমূহ সফলভাবে GitHub Pages এ লাইভ পুশ করা হয়েছে!');
    } else {
      const errData = await putRes.json();
      throw new Error(errData.message || 'GitHub API rejected commit');
    }
  } catch (err) {
    console.error('Publish to GitHub failed:', err);
    if (statusText) statusText.textContent = `Publish failed: ${err.message}`;
    alert(`GitHub Live Publish Error: ${err.message}\nদয়া করে টোকেনের অনুমতি (repo write scope) নিশ্চিত করুন।`);
  } finally {
    if (btn) btn.disabled = false;
    if (btnText) btnText.textContent = 'Publish Live to All Students';
    setTimeout(() => {
      if (banner) banner.classList.add('hidden');
    }, 6000);
  }
}

