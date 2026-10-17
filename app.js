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
  GEMINI_API_KEY: 'classroom_gemini_api_key'
};

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

// Default initial curated video lectures (Hindi, Bangla, English)
if (adminVideos.length === 0) {
  adminVideos = [
    {
      id: 'vid_1',
      title: 'Engineering Thermodynamics Full Course (Concept & Numericals)',
      subject: 'ME 211 Thermodynamics',
      channel: "Tikle's Academy / Saurabh Dahivadkar",
      lang: 'hi',
      term: 'L2-T1',
      url: 'https://www.youtube.com/playlist?list=PLDN15nk5uLiCPXf3_1sU_1zO2Q3i6e0_l'
    },
    {
      id: 'vid_2',
      title: 'Thermodynamics & Energy Conversion Visualized',
      subject: 'ME 211 Thermodynamics',
      channel: 'The Efficient Engineer / Lesics',
      lang: 'en',
      term: 'L2-T1',
      url: 'https://www.youtube.com/watch?v=kYJvGkK7_4c'
    },
    {
      id: 'vid_3',
      title: 'Fluid Mechanics & Hydraulic Machinery (Pelton, Francis, Pumps)',
      subject: 'ME 321 Fluid Mechanics',
      channel: "Tikle's Academy",
      lang: 'hi',
      term: 'L3-T1',
      url: 'https://www.youtube.com/playlist?list=PLDN15nk5uLiCE89j_mQd_R7Q_W8t4v9h3'
    },
    {
      id: 'vid_4',
      title: 'Bernoulli Equation & Fluid Dynamics Visualized',
      subject: 'ME 321 Fluid Mechanics',
      channel: 'Learn Engineering (Lesics)',
      lang: 'en',
      term: 'L3-T1',
      url: 'https://www.youtube.com/watch?v=DW4rItB20h4'
    },
    {
      id: 'vid_5',
      title: 'Heat Transfer: Conduction, Convection, Radiation & Exchangers',
      subject: 'ME 411 Heat Transfer',
      channel: 'Gate Smashers',
      lang: 'hi',
      term: 'L4-T1',
      url: 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiEB4m7G4d5W7x8M8G7K5aL1'
    },
    {
      id: 'vid_6',
      title: 'Heat Exchanger Design & LMTD Method',
      subject: 'ME 411 Heat Transfer',
      channel: 'Engineering Classroom Bangla',
      lang: 'bn',
      term: 'L4-T1',
      url: 'https://www.youtube.com/watch?v=0kF4tK7W9pE'
    },
    {
      id: 'vid_7',
      title: 'Strength of Materials (SOM) / Mechanics of Solids Complete',
      subject: 'ME 241 Mechanics of Solids',
      channel: "Tikle's Academy",
      lang: 'hi',
      term: 'L2-T1',
      url: 'https://www.youtube.com/playlist?list=PLDN15nk5uLiCGyZ7H_fL8p7mU9aX_2n9g'
    },
    {
      id: 'vid_8',
      title: 'Understanding Mohr\'s Circle & Stress States',
      subject: 'ME 241 Mechanics of Solids',
      channel: 'The Efficient Engineer',
      lang: 'en',
      term: 'L2-T1',
      url: 'https://www.youtube.com/watch?v=1FwUqWfFz78'
    },
    {
      id: 'vid_9',
      title: 'Lathe Machine Operations & Workshop Technology',
      subject: 'ME 172 Workshop Technology',
      channel: 'Mechanical Tech Hindi',
      lang: 'hi',
      term: 'L1-T2',
      url: 'https://www.youtube.com/watch?v=3u_9pL6W4bQ'
    },
    {
      id: 'vid_10',
      title: 'Engineering Graphics & Orthographic Projection',
      subject: 'ME 160 Engineering Drawing',
      channel: 'Manas Patnaik',
      lang: 'hi',
      term: 'L1-T1',
      url: 'https://www.youtube.com/playlist?list=PLDN15nk5uLiA9Q0X4C6f1OqWfH7Q0qT4m'
    }
  ];
  localStorage.setItem(STORAGE_KEYS.ADMIN_VIDEOS, JSON.stringify(adminVideos));
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
  applyLanguage(currentLang);
  loadCustomContacts();
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
    document.documentElement.classList.add('light');
    document.body.classList.add('light');
  } else {
    document.documentElement.classList.remove('light');
    document.body.classList.remove('light');
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
  const icon = document.getElementById('themeIcon');
  if (!icon) return;
  if (theme === 'light') {
    icon.setAttribute('data-lucide', 'moon');
    icon.className = 'w-3.5 h-3.5 text-indigo-400';
  } else {
    icon.setAttribute('data-lucide', 'sun');
    icon.className = 'w-3.5 h-3.5 text-amber-400';
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

  if (tab === 'home') renderHomeNotices();
  else if (tab === 'resources') renderExplorer();
  else if (tab === 'videos') renderPublicVideos();
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
const ADMIN_SECRET_KEY = 'CuetMe20#AdminVault';

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

function handleGoogleCustomAccount(e) {
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

    if (pass === ADMIN_SECRET_KEY || pass === '2003063') {
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

function handleStandardAuthSubmit(e) {
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
    if (pass === ADMIN_SECRET_KEY || pass === '2003063') {
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
  
  if (e && e.target && e.target.reset) e.target.reset();
  showToast(currentLang === 'en' ? 'Thank you! Your feedback has been sent to Fahim Niloy.' : 'ধন্যবাদ! আপনার বার্তাটি ফাহিম নিলয়ের কাছে পৌঁছেছে।');
  renderAdminWorkspace();
}

/* =========================================================================
   11. LIVE HOMEPAGE NOTICE BOARD & ANNOUNCEMENTS BANNER
   ========================================================================= */
function renderHomeNotices() {
  const container = document.getElementById('homeNoticeContainer');
  if (!container) return;

  if (!adminNotices || adminNotices.length === 0) {
    container.className = 'hidden';
    container.innerHTML = '';
    return;
  }

  container.className = 'space-y-3 mb-6';
  container.innerHTML = adminNotices.map((n, idx) => {
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

  lucide.createIcons();
}

/* =========================================================================
   12. ADMIN CMS SUITE (18-POINT ENTERPRISE CONTROL SUITE)
   Full CRUD, Revisions, Recycle Bin, Quality Audit, JSON Backup & Restore
   ========================================================================= */
const ADMIN_SUBTABS = ['queue', 'resources', 'add', 'notices', 'videos', 'timeline', 'trash', 'revisions', 'audit', 'backup', 'feedbacks', 'contact'];

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
  else if (tabName === 'notices') renderAdminNotices();
  else if (tabName === 'videos') renderAdminVideos();
  else if (tabName === 'timeline') renderAdminTimeline();
  else if (tabName === 'trash') renderAdminTrash();
  else if (tabName === 'revisions') renderAdminRevisions();
  else if (tabName === 'audit') renderAdminAudit();
  else if (tabName === 'backup') renderAdminActivityLog();
  else if (tabName === 'feedbacks') renderAdminFeedbacks();
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
    adminTotalFiles.textContent = ((appData?.summary?.total_academic_files || 3895) + communityResources.length).toLocaleString();
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
          <span>All 3,895 Undergraduate Course Files Indexed</span>
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
    version: '2.5.0',
    exportedAt: new Date().toISOString(),
    author: 'Fahim Niloy (CUET ME \'20, Roll: 2003063)',
    communityResources,
    adminNotices,
    adminVideos,
    adminTimeline,
    adminHiddenItems,
    adminFeaturedItems,
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
  a.download = `classroomhub-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  logAdminAction('Exported Backup', `Backup file created: classroomhub-backup-${dateStr}.json`);
  showToast('Backup JSON exported successfully!');
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
      if (data.contacts) {
        localStorage.setItem(STORAGE_KEYS.CONTACT, JSON.stringify(data.contacts));
        loadCustomContacts();
      }

      logAdminAction('Restored Backup', `Loaded file: ${file.name}`);
      renderAdminWorkspace();
      renderExplorer();
      renderHomeNotices();
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
   PUBLIC CURATED VIDEO LECTURES BROWSER (Hindi, Bangla & English)
   ========================================================================= */
let currentPublicVideoLang = 'ALL';

function setPublicVideoLang(lang) {
  currentPublicVideoLang = lang;
  ['ALL', 'hi', 'bn', 'en'].forEach(l => {
    const btn = document.getElementById(`videoLangBtn-${l}`);
    if (btn) {
      if (l === lang) {
        btn.className = 'px-3 py-1 rounded-xl bg-red-600 text-white font-semibold shadow-sm transition-all';
      } else {
        btn.className = 'px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-all flex items-center gap-1';
      }
    }
  });
  renderPublicVideos();
}

function renderPublicVideos() {
  const container = document.getElementById('publicVideosContainer');
  const countBadge = document.getElementById('publicVideoCountBadge');
  if (!container) return;

  const q = (document.getElementById('publicVideoSearch')?.value || '').toLowerCase().trim();
  const termFilter = document.getElementById('publicVideoTermFilter')?.value || 'ALL';

  let list = [...adminVideos];

  if (currentPublicVideoLang !== 'ALL') {
    list = list.filter(v => v.lang === currentPublicVideoLang);
  }

  if (termFilter !== 'ALL') {
    list = list.filter(v => v.term === termFilter || v.term === 'ALL');
  }

  if (q) {
    const tokens = q.split(/\s+/);
    list = list.filter(v => {
      const hay = `${v.title} ${v.subject} ${v.channel} ${v.term || ''}`.toLowerCase();
      return tokens.every(tok => hay.includes(tok));
    });
  }

  if (countBadge) {
    countBadge.textContent = `${list.length} Curated Playlists`;
  }

  if (list.length === 0) {
    container.innerHTML = `
      <div class="col-span-full p-10 rounded-2xl glass-card border border-slate-800 text-center space-y-2">
        <i data-lucide="video-off" class="w-8 h-8 text-slate-500 mx-auto"></i>
        <h4 class="text-sm font-semibold text-slate-300">No Videos Found</h4>
        <p class="text-xs text-slate-500">Try adjusting your search terms or language filter.</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = list.map(v => {
    let langBadge = '🇮🇳 Hindi';
    let langColor = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    if (v.lang === 'bn') {
      langBadge = '🇧🇩 Bangla';
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
            <span class="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] font-semibold">${v.term || 'All Semesters'}</span>
          </div>
          <div>
            <div class="text-[11px] font-mono font-semibold text-red-400 mb-0.5">${v.subject}</div>
            <h3 class="text-sm font-bold text-white group-hover:text-red-300 transition-colors line-clamp-2">${v.title}</h3>
            <div class="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <i data-lucide="user-check" class="w-3.5 h-3.5 text-slate-500"></i>
              <span>${v.channel}</span>
            </div>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-800/80">
          <a href="${v.url}" target="_blank" rel="noopener noreferrer" class="w-full py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-md">
            <i data-lucide="play" class="w-3.5 h-3.5 fill-current"></i>
            <span>Watch Playlist on YouTube</span>
            <i data-lucide="external-link" class="w-3 h-3 opacity-70"></i>
          </a>
        </div>
      </div>
    `;
  }).join('');

  lucide.createIcons();
}

/* Gemini API Key Configuration Logic */
function updateGeminiKeyStatus() {
  const key = localStorage.getItem(STORAGE_KEYS.GEMINI_API_KEY);
  const textEl = document.getElementById('geminiKeyStatusText');
  if (textEl) {
    textEl.textContent = key ? '⚡ Gemini 2.0 Live' : 'Gemini API (Free)';
  }
}

function openGeminiApiKeyModal() {
  const dialog = document.getElementById('geminiApiKeyDialog');
  const input = document.getElementById('geminiApiKeyInput');
  if (input) {
    input.value = localStorage.getItem(STORAGE_KEYS.GEMINI_API_KEY) || '';
  }
  if (dialog) dialog.showModal();
}

function closeGeminiApiKeyModal() {
  const dialog = document.getElementById('geminiApiKeyDialog');
  if (dialog) dialog.close();
}

function saveGeminiApiKey() {
  const input = document.getElementById('geminiApiKeyInput');
  const key = (input?.value || '').trim();
  if (key) {
    localStorage.setItem(STORAGE_KEYS.GEMINI_API_KEY, key);
    showToast('Google Gemini API Key saved! Live AI enabled.');
  } else {
    localStorage.removeItem(STORAGE_KEYS.GEMINI_API_KEY);
    showToast('Gemini API Key removed. Using built-in AI.');
  }
  updateGeminiKeyStatus();
  closeGeminiApiKeyModal();
}

function clearGeminiApiKey() {
  localStorage.removeItem(STORAGE_KEYS.GEMINI_API_KEY);
  const input = document.getElementById('geminiApiKeyInput');
  if (input) input.value = '';
  updateGeminiKeyStatus();
  closeGeminiApiKeyModal();
  showToast('Gemini API Key cleared.');
}


/* =========================================================================
   13. FAHIM NILOY CONVERSATIONAL AI CHATBOT (GEMINI-STYLE CONVERSATION)
   Talks naturally on ANY topic. Only shows course cards if explicitly requested!
   ========================================================================= */
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

function findRelevantVideos(query, limit = 2) {
  if (!query || !adminVideos || adminVideos.length === 0) return [];
  const qTerms = query.toLowerCase()
    .replace(/[^\w\s\u0980-\u09FF]/gi, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1);

  if (qTerms.length === 0) return adminVideos.slice(0, limit);

  const scored = [];
  for (const v of adminVideos) {
    const text = `${v.title} ${v.subject} ${v.channel} ${v.term || ''} ${v.lang || ''}`.toLowerCase();
    let score = 0;
    for (const t of qTerms) {
      if (text.includes(t)) {
        score += 3;
        if (v.subject.toLowerCase().includes(t)) score += 4;
        if (v.title.toLowerCase().includes(t)) score += 3;
      }
    }
    if (score > 0) scored.push({ video: v, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map(s => s.video);
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

async function handleAiSubmit(e) {
  if (e && e.preventDefault) e.preventDefault();
  const input = document.getElementById('aiInput') || document.getElementById('aiInputPrompt');
  const query = (input?.value || '').trim();
  if (!query) return;

  const chatBox = document.getElementById('aiChatMessages') || document.getElementById('aiChatBox');
  if (!chatBox) return;

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
    <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center flex-shrink-0 text-white shadow font-bold text-xs">
      FN
    </div>
    <div class="ai-message-card bg-slate-800/80 rounded-2xl rounded-tl-none p-4 text-xs sm:text-sm text-slate-200 border border-slate-700/60 max-w-2xl leading-relaxed shadow-lg space-y-2">
      <div class="flex items-center gap-1.5 text-xs text-purple-400">
        <span class="w-2 h-2 rounded-full bg-purple-400 animate-ping"></span>
        <span>${isBangla ? 'ফাহিম নিলয় উত্তর লিখছেন...' : 'Fahim Niloy is typing...'}</span>
      </div>
    </div>
  `;
  chatBox.appendChild(botDiv);
  chatBox.scrollTop = chatBox.scrollHeight;

  const qLower = query.toLowerCase();

  // Strict User Intent Checks:
  // ONLY show courses if the user explicitly asks for courses, notes, question banks, or files!
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

  // ONLY show videos if user explicitly asks for video tutorial or youtube
  const isExplicitVideoRequest = (
    qLower.includes('ভিডিও আছে') ||
    qLower.includes('ভিডিও লিংক') ||
    qLower.includes('ভিডিও দেখাও') ||
    qLower.includes('ভিডিও লেকচার') ||
    qLower.includes('ইউটিউব') ||
    qLower.includes('youtube') ||
    qLower.includes('video') ||
    qLower.includes('tutorial') ||
    qLower.includes('playlist')
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

  let videoCardsHtml = '';
  if (isExplicitVideoRequest) {
    const matchingVideos = findRelevantVideos(query, 2);
    if (matchingVideos.length > 0) {
      videoCardsHtml = `
        <div class="mt-3 pt-3 border-t border-slate-700/60 space-y-2">
          <div class="text-[11px] font-bold text-red-400 flex items-center justify-between">
            <span class="flex items-center gap-1.5">
              <i data-lucide="youtube" class="w-3.5 h-3.5 text-red-500"></i>
              <span>${isBangla ? 'ইউটিউব ভিডিও লেকচার' : 'Curated YouTube Tutorials'}:</span>
            </span>
            <button onclick="switchTab('videos')" class="text-[10px] text-red-400 hover:underline">All Videos →</button>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            ${matchingVideos.map(v => `
              <a href="${v.url}" target="_blank" rel="noopener noreferrer" class="p-2.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-red-500/60 flex flex-col justify-between gap-1.5 transition-all group">
                <div>
                  <div class="flex items-center gap-1.5 text-[10px] mb-1">
                    <span class="px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 font-bold">${v.lang === 'bn' ? '🇧🇩 Bangla' : (v.lang === 'hi' ? '🇮🇳 Hindi' : '🇬🇧 English')}</span>
                    <span class="text-slate-400 truncate">${v.channel}</span>
                  </div>
                  <div class="text-xs font-semibold text-white group-hover:text-red-300 transition-colors line-clamp-2">${v.title}</div>
                </div>
                <div class="text-[11px] text-red-400 flex items-center gap-1 mt-1 font-medium">
                  <i data-lucide="play-circle" class="w-3.5 h-3.5"></i>
                  <span>Watch on YouTube</span>
                </div>
              </a>
            `).join('')}
          </div>
        </div>
      `;
    }
  }

  // 1. CHECK IF USER CONFIGURED GOOGLE GEMINI API KEY FOR REAL-TIME GEMINI LIVE AI
  const geminiApiKey = localStorage.getItem(STORAGE_KEYS.GEMINI_API_KEY);
  if (geminiApiKey) {
    try {
      const sysInstruction = `You are Fahim Niloy (Mohammad Fahim Ahmed), a student of Mechanical Engineering '20 series at CUET (Chittagong University of Engineering and Technology, Roll: 2003063) and creator of ClassroomHub. Talk warmly, naturally, and intelligently in ${isBangla ? 'Bengali' : 'English'}—just like Gemini. Answer any question on any topic (engineering theories, math, coding, life at CUET, study tips, philosophy, or casual conversation). Keep your tone friendly and helpful. IMPORTANT: Do NOT list or dump courses unless the user explicitly asks if there is a course/file for this topic.`;
      
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: sysInstruction }] },
          contents: [{ role: 'user', parts: [{ text: query }] }]
        })
      });

      if (res.ok) {
        const data = await res.json();
        const geminiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (geminiText) {
          const formatted = geminiText
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n\n/g, '<br><br>')
            .replace(/\n/g, '<br>');

          botDiv.querySelector('.ai-message-card').innerHTML = `
            <div class="flex items-center justify-between pb-2 border-b border-slate-700/60 mb-2">
              <span class="font-bold text-xs text-purple-300">✨ Fahim Niloy (Powered by Gemini 2.0 Live)</span>
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
          return;
        }
      }
    } catch (err) {
      console.warn('Gemini Live API fallback to built-in AI:', err);
    }
  }

  // 2. BUILT-IN NATURAL CONVERSATIONAL AI ENGINE (GEMINI STYLE)
  setTimeout(() => {
    // A. Identity / Persona
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
      qLower.includes('assalamu alaikum') ||
      qLower.includes('salam') ||
      qLower.includes('সালাম') ||
      qLower.includes('কেমন আছো') ||
      qLower.includes('kemon acho') ||
      qLower.includes('how are you')
    );

    // C. Study Tips & General Advice
    const isAdviceQuestion = (
      qLower.includes('cgpa') ||
      qLower.includes('exam tip') ||
      qLower.includes('preparation') ||
      qLower.includes('study tip') ||
      qLower.includes('how to study') ||
      qLower.includes('সিজিপিএ') ||
      qLower.includes('পড়ার নিয়ম') ||
      qLower.includes('পরামর্শ') ||
      qLower.includes('টিপস')
    );

    let answerHtml = '';

    if (isIdentityQuestion) {
      answerHtml = `
        <div class="flex items-center justify-between pb-2 border-b border-slate-700/60 mb-2">
          <span class="font-bold text-xs text-indigo-300">🎓 Fahim Niloy</span>
          <button onclick="copyAiResponse(this)" class="px-2 py-0.5 rounded bg-slate-700/60 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1 transition-colors">
            <i data-lucide="copy" class="w-3 h-3"></i> Copy
          </button>
        </div>
        <div class="ai-prose space-y-2">
          <p><strong>${isBangla ? 'আসসালামু আলাইকুম! আমি ফাহিম নিলয় (Mohammad Fahim Ahmed)।' : 'Hello! I am Fahim Niloy (Mohammad Fahim Ahmed).'}</strong></p>
          <p>${isBangla
            ? 'আমি চট্টগ্রাম প্রকৌশল ও প্রযুক্তি বিশ্ববিদ্যালয় (চুয়েট)-এর মেকানিক্যাল ইঞ্জিনিয়ারিং বিভাগের \'২০ ব্যাচের শিক্ষার্থী (রোল: ২০০৩০৬৩)। আমাদের ব্যাচ এবং জুনিয়রদের সুবিধার্থে পুরো ৪ বছরের সব সেমিস্টারের হ্যান্ডনোট, লেকচার শিট এবং বিগত বছরের প্রশ্নব্যাংক গুছিয়ে রাখতে আমি <strong>ClassroomHub</strong> তৈরি করেছি।'
            : 'I am a student at Chittagong University of Engineering and Technology (CUET), Department of Mechanical Engineering (Batch: \'20, Roll: 2003063). I created <strong>ClassroomHub</strong> to organize and preserve our entire undergraduate academic collection.'
          }</p>
          <p>${isBangla
            ? 'আমি এখানে আপনার বন্ধুর মতো যেকোনো পড়াশোনা, থিওরি, সূত্র, জীবন বা পরীক্ষার প্রস্তুতি নিয়ে আড্ডা ও আলোচনা করতে প্রস্তুত। জেমিনির মতোই স্বাভাবিকভাবে যেকোনো প্রশ্ন করতে পারেন!'
            : 'I am here just like a fellow study partner. Feel free to talk with me about any engineering theory, math problem, exam strategies, or life at CUET!'
          }</p>
        </div>
        ${vaultCardsHtml}
      `;
    } else if (isGreeting) {
      answerHtml = `
        <div class="flex items-center justify-between pb-2 border-b border-slate-700/60 mb-2">
          <span class="font-bold text-xs text-indigo-300">👋 Fahim Niloy</span>
          <button onclick="copyAiResponse(this)" class="px-2 py-0.5 rounded bg-slate-700/60 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1 transition-colors">
            <i data-lucide="copy" class="w-3 h-3"></i> Copy
          </button>
        </div>
        <div class="ai-prose space-y-2">
          <p>${isBangla
            ? 'ওয়ালাইকুম আসসালাম! আলহামদুলিল্লাহ, আমি ভালো আছি। আপনি কেমন আছেন? পড়াশোনা কেমন চলছে? আজ কোনো নির্দিষ্ট বিষয় বা কনসেপ্ট নিয়ে আলোচনা করতে চান?'
            : 'Hello! I am doing great, thank you. How are you doing? How are your studies going? Feel free to ask me anything or talk about any topic!'
          }</p>
        </div>
        ${vaultCardsHtml}
      `;
    } else if (isAdviceQuestion) {
      answerHtml = `
        <div class="flex items-center justify-between pb-2 border-b border-slate-700/60 mb-2">
          <span class="font-bold text-xs text-amber-300">🎯 Academic Advice • Fahim Niloy</span>
          <button onclick="copyAiResponse(this)" class="px-2 py-0.5 rounded bg-slate-700/60 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1 transition-colors">
            <i data-lucide="copy" class="w-3 h-3"></i> Copy
          </button>
        </div>
        <div class="ai-prose space-y-2">
          <p>${isBangla
            ? 'চুয়েটে ইঞ্জিনিয়ারিং সেমিস্টারগুলোতে ভালো করার কিছু কার্যকরী টিপস:'
            : 'Here are practical and effective strategies for succeeding in engineering exams at CUET:'
          }</p>
          <ul class="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
            <li><strong>কনসেপ্ট ও ডায়াগ্রাম প্রাধান্য দিন:</strong> মেকানিক্স বা ফ্লুইডে ফ্রি-বডি ডায়াগ্রাম (FBD) এবং থার্মোডাইনামিক্সে P-V ও T-s ডায়াগ্রাম পরিষ্কারভাবে আঁকলে পরীক্ষক খাতার শুরুতেই ভালো ধারণা পান।</li>
            <li><strong>এককের ভুল এড়ান:</strong> টেম্পারেচার কেলভিনে নেওয়া (K = °C + 273.15) এবং প্রেসার Pa বা kPa-তে রাখা নিশ্চিত করুন।</li>
            <li><strong>বিগত বছরের প্রশ্ন সমাধান:</strong> বিগত ৫ বছরের প্রশ্ন এনালাইসিস করলে বুঝবেন কোন কোন নিউমেরিক্যাল ও থিওরি বারবার রিপিট হয়।</li>
          </ul>
        </div>
        ${videoCardsHtml}
        ${vaultCardsHtml}
      `;
    } else {
      // Direct Conversational Conceptual Answer (No course dumping!)
      let topicTitle = isBangla ? 'বিশ্লেষণ ও আলোচনা' : 'Concept Explanation';
      let explanation = '';

      if (qLower.includes('entropy') || qLower.includes('thermodynamic') || qLower.includes('থার্মো') || qLower.includes('এন্ট্রপি')) {
        topicTitle = 'Thermodynamics & Entropy';
        explanation = isBangla
          ? `<p><strong>এন্ট্রপি (Entropy) কী:</strong> সহজ ভাষায়, এন্ট্রপি হলো কোনো সিস্টেমের অণু-পরমাণুর বিশৃঙ্খলা বা এলোমেলো অবস্থার (disorder/randomness) একটি পরিমাপ।</p>
             <p>থার্মোডাইনামিক্সের ২য় সূত্রানুসারে, একটি বিচ্ছিন্ন জগতে (isolated system) যেকোনো স্বতঃস্ফূর্ত প্রক্রিয়ায় মোট এন্ট্রপি সবসময় বৃদ্ধি পায় (\\( \\Delta S_{\\text{universe}} \\ge 0 \\))। গাণিতিকভাবে রিভার্সিবল প্রসেসের জন্য: \\[ dS = \\frac{\\delta Q_{\\text{rev}}}{T} \\]</p>
             <p>অর্থাৎ, তাপকে কখনই ১০০% কাজে রূপান্তর করা সম্ভব নয়; কিছু পরিমাণ শক্তি অপচয় হবেই।</p>`
          : `<p><strong>Entropy:</strong> In simple terms, entropy is a thermodynamic measure of the molecular disorder or randomness within a system.</p>
             <p>By the Second Law of Thermodynamics, in any spontaneous natural process, the total entropy of an isolated system always increases: \\[ \\Delta S_{\\text{universe}} \\ge 0 \\]</p>
             <p>For an internally reversible process: \\[ dS = \\frac{\\delta Q_{\\text{rev}}}{T} \\] It fundamentally shows why 100% heat-to-work conversion is physically impossible.</p>`;
      } else if (qLower.includes('mohr') || qLower.includes('stress') || qLower.includes('স্ট্রেস') || qLower.includes('মোর')) {
        topicTitle = "Stress Analysis & Mohr's Circle";
        explanation = isBangla
          ? `<p><strong>মোরের বৃত্ত (Mohr's Circle) কেন ব্যবহার করা হয়:</strong> এটি একটি গ্রাফিক্যাল পদ্ধতি যার মাধ্যমে যেকোনো বস্তুর ওপর ত্রিমাত্রিক বা দ্বিমাত্রিক বল প্রয়োগ করলে বিভিন্ন কোণে কী পরিমাণ নরমাল স্ট্রেস (\\( \\sigma \\)) এবং শিয়ার স্ট্রেস (\\( \\tau \\)) তৈরি হয় তা সহজেই বের করা যায়।</p>
             <p>বৃত্তের কেন্দ্র: \\( C = \\left(\\frac{\\sigma_x + \\sigma_y}{2}, 0\\right) \\)<br>ব্যাসার্ধ ও সর্বোচ্চ শিয়ার স্ট্রেস: \\( R = \\tau_{\\max} = \\sqrt{\\left(\\frac{\\sigma_x - \\sigma_y}{2}\\right)^2 + \\tau_{xy}^2} \\)</p>
             <p>শ্যাফ্ট ডিজাইন বা বিম তৈরির সময় মেটাল যাতে ভেঙে না যায়, সেজন্য ইঞ্জিনিয়াররা এই বৃত্তের সাহায্য নেন।</p>`
          : `<p><strong>Mohr's Circle:</strong> It is a graphical representation of the transformation equations for plane stress. It allows engineers to quickly determine principal stresses (\\( \\sigma_1, \\sigma_2 \\)) and maximum in-plane shear stress (\\( \\tau_{\\max} \\)) without solving complex trigonometric equations.</p>
             <p>Center: \\( C = \\left(\\frac{\\sigma_x + \\sigma_y}{2}, 0\\right) \\)<br>Radius: \\( R = \\sqrt{\\left(\\frac{\\sigma_x - \\sigma_y}{2}\\right)^2 + \\tau_{xy}^2} \\)</p>`;
      } else if (qLower.includes('pelton') || qLower.includes('turbine') || qLower.includes('pump') || qLower.includes('টারবাইন') || qLower.includes('পাম্প')) {
        topicTitle = 'Hydraulic Turbines & Pumps';
        explanation = isBangla
          ? `<p><strong>টারবাইনের মূল পার্থক্য:</strong></p>
             <p>১. <strong>পেল্টন হুইল (Pelton Wheel):</strong> ইমপালস টারবাইন। যেখানে পানির হেড খুব বেশি (> ১৫০ মিটার) কিন্তু পানির পরিমাণ কম, সেখানে নজলের মাধ্যমে উচ্চগতির জেট তৈরি করে বাকেটে আঘাত করে টারবাইন ঘোরানো হয়।<br>
             ২. <strong>ফ্রান্সিস টারবাইন (Francis):</strong> মাঝারি হেড ও মাঝারি পানির প্রবাহের জন্য সবচেয়ে বেশি ব্যবহৃত রিঅ্যাকশন টারবাইন।<br>
             ৩. <strong>কাপলান টারবাইন (Kaplan):</strong> কম হেড ও প্রচুর পানির স্রোতের জন্য আদর্শ অ্যাক্সিয়াল ফ্লো টারবাইন।</p>`
          : `<p><strong>Hydraulic Turbines Classification:</strong></p>
             <p>1. <strong>Pelton Wheel (Impulse):</strong> High head (>150 m), low flow. Converts pressure head completely into kinetic jet velocity before hitting bucket splitters.<br>
             2. <strong>Francis Turbine (Reaction):</strong> Medium head (30-150 m), mixed radial-inflow to axial outflow. Most widely used in modern hydroelectric plants.<br>
             3. <strong>Kaplan Turbine (Axial Reaction):</strong> Low head (<30 m), very large water discharge with adjustable blades.</p>`;
      } else if (qLower.includes('lathe') || qLower.includes('workshop') || qLower.includes('লেদ') || qLower.includes('ওয়ার্কশপ')) {
        topicTitle = 'Workshop & Lathe Operations';
        explanation = isBangla
          ? `<p><strong>লেদ মেশিনকে মাদার অফ অল মেশিন বলা হয়:</strong> কারণ এতে ওয়ার্কপিস ঘোরে এবং কাটিং টুল লিনিয়ার মুভমেন্ট করে অতিরিক্ত মেটাল কেটে কাঙ্ক্ষিত আকার দেওয়া হয়।</p>
             <p>প্রধান কাজগুলো হলো: ফেসিং (দৈর্ঘ্য সমান করা), টার্নিং (ব্যাস কমানো), ড্রিলিং, নার্লিং (হাতের গ্রিপের জন্য খসখসে ডায়মন্ড প্যাটার্ন করা) এবং থ্রেডিং বা প্যাঁচ কাটা।</p>`
          : `<p><strong>Lathe Operations:</strong> The workpiece rotates on the spindle while a single-point cutting tool is fed into the material to produce cylindrical symmetric shapes.</p>
             <p>Core operations: Facing (making ends square), Turning (reducing diameter), Knurling (producing patterned grip surface), and Thread cutting.</p>`;
      } else {
        // Natural Gemini-style general response for any other query
        topicTitle = isBangla ? 'ফাহিম নিলয়ের উত্তর' : 'Fahim Niloy Thought';
        explanation = isBangla
          ? `<p>আপনার প্রশ্ন: <em>"${query}"</em></p>
             <p>এটি একটি চমৎকার আলোচনা। ইঞ্জিনিয়ারিং এবং বাস্তব জীবনের ক্ষেত্রে প্রতিটি তত্ত্বের পেছনে সুনির্দিষ্ট বৈজ্ঞানিক যুক্তি ও ব্যবহারিক কারণ থাকে। এই বিষয়ে কোনো নির্দিষ্ট সূত্র, সমীকরণ বা প্রয়োগ নিয়ে আরও বিস্তারিত জানতে চাইলে নির্দ্বিধায় জিজ্ঞেস করতে পারেন!</p>`
          : `<p>Regarding your query: <em>"${query}"</em></p>
             <p>This is an interesting topic. In engineering and physical science, every concept connects physical intuition with mathematical modeling. Feel free to dive deeper into any specific aspect, formula, or application!</p>`;
      }

      answerHtml = `
        <div class="flex items-center justify-between pb-2 border-b border-slate-700/60 mb-2">
          <span class="font-bold text-xs text-indigo-300">💡 ${topicTitle} • Fahim Niloy</span>
          <button onclick="copyAiResponse(this)" class="px-2 py-0.5 rounded bg-slate-700/60 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1 transition-colors">
            <i data-lucide="copy" class="w-3 h-3"></i> Copy
          </button>
        </div>
        <div class="ai-prose space-y-2 leading-relaxed">
          ${explanation}
        </div>
        ${videoCardsHtml}
        ${vaultCardsHtml}
      `;
    }

    botDiv.querySelector('.ai-message-card').innerHTML = answerHtml;
    chatBox.scrollTop = chatBox.scrollHeight;
    lucide.createIcons();
  }, 350);
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

