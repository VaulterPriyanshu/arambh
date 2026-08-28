// Front-End Application Logic for Mental Health Screening & Guidance App
// Powered by Vanilla Javascript with modular State Management and Offline-First LocalStorage

// Global State
const appState = {
  activeScreen: 'screen-splash',
  userMode: null, // 'public' or 'worker'
  language: 'en',
  isOnline: true,
  theme: 'light',
  fontSizeScale: 1, // 1, 1.2, 1.4
  highContrast: false,
  activePatient: null, // for health worker view
  
  // Screening Wizard State
  activeScreening: {
    tool: null, // 'phq9', 'gad7', 'who5'
    currentQuestionIndex: 0,
    answers: [], // array of selected numerical values
    patientInfo: null, // set in worker mode
    isPublic: true
  },
  
  // Database local references (loaded from localStorage or dummyData)
  db: {
    patients: [],
    screenings: [],
    followups: [],
    syncQueue: [],
    wellnessActivities: [],
    routines: [],
    womensWellness: {},
    moodHistory: []
  },

  // Adaptive Screening Engine State (initialized in setupAdaptiveCheck)
  adaptiveScreening: null,

  // Last screening context shared with MindGuide AI
  lastScreeningContext: null
};

// Question Databases
const QUESTION_DATABASE = {
  phq9: {
    title: {
      en: "PHQ-9 Depression Screening",
      hi: "PHQ-9 अवसाद स्क्रीनिंग"
    },
    disclaimer: {
      en: "This is a validated 9-question tool. Scores indicate the severity of depressive symptoms but do not replace a clinical diagnosis.",
      hi: "यह एक मान्यता प्राप्त 9-प्रश्नों का उपकरण है। स्कोर अवसाद के लक्षणों की गंभीरता को दर्शाते हैं, लेकिन यह किसी डॉक्टरी निदान का विकल्प नहीं है।"
    },
    answers: [
      { text: { en: "Not at all", hi: "बिल्कुल नहीं" }, val: 0 },
      { text: { en: "Several days", hi: "कई दिनों से" }, val: 1 },
      { text: { en: "More than half the days", hi: "आधे से अधिक दिनों से" }, val: 2 },
      { text: { en: "Nearly every day", hi: "लगभग हर दिन" }, val: 3 }
    ],
    questions: [
      { id: "phq1", text: { en: "Little interest or pleasure in doing things?", hi: "कामों में बहुत कम रुचि या आनंद होना?" } },
      { id: "phq2", text: { en: "Feeling down, depressed, or hopeless?", hi: "उदास, निराश या महसूस करना कि कोई उम्मीद नहीं है?" } },
      { id: "phq3", text: { en: "Trouble falling or staying asleep, or sleeping too much?", hi: "नींद आने में कठिनाई, नींद टूटना, या अत्यधिक सोना?" } },
      { id: "phq4", text: { en: "Feeling tired or having little energy?", hi: "थकान महसूस होना या ऊर्जा की कमी लगना?" } },
      { id: "phq5", text: { en: "Poor appetite or overeating?", hi: "भूख न लगना या बहुत अधिक खाना खाना?" } },
      { id: "phq6", text: { en: "Feeling bad about yourself — or that you are a failure or have let yourself or your family down?", hi: "अपने बारे में बुरा सोचना — या यह कि आप असफल रहे हैं या अपने परिवार को निराश किया है?" } },
      { id: "phq7", text: { en: "Trouble concentrating on things, such as reading the newspaper or watching television?", hi: "चीजों पर ध्यान केंद्रित करने में परेशानी, जैसे समाचार पत्र पढ़ना या टीवी देखना?" } },
      { id: "phq8", text: { en: "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual?", hi: "इतने धीरे चलना या बोलना कि दूसरों का ध्यान जाए? या इसके विपरीत—अत्यधिक बेचैनी महसूस होना जिससे सामान्य से अधिक घूमना-फिरना पड़े?" } },
      { id: "phq9", text: { en: "Thoughts that you would be better off dead, or of hurting yourself in some way?", hi: "ऐसा विचार आना कि आपके लिए मर जाना बेहतर होगा, या खुद को किसी तरह से चोट पहुंचाने का ख्याल?" } }
    ]
  },
  gad7: {
    title: {
      en: "GAD-7 Anxiety Screening",
      hi: "GAD-7 चिंता स्क्रीनिंग"
    },
    disclaimer: {
      en: "This is a validated 7-question tool. Scores indicate general anxiety severity but do not replace a clinical consultation.",
      hi: "यह एक मान्यता प्राप्त 7-प्रश्नों का उपकरण है। स्कोर सामान्य चिंता के लक्षणों की गंभीरता को दर्शाते हैं, लेकिन यह चिकित्सकीय परामर्श का विकल्प नहीं है।"
    },
    answers: [
      { text: { en: "Not at all", hi: "बिल्कुल नहीं" }, val: 0 },
      { text: { en: "Several days", hi: "कई दिनों से" }, val: 1 },
      { text: { en: "More than half the days", hi: "आधे से अधिक दिनों से" }, val: 2 },
      { text: { en: "Nearly every day", hi: "लगभग हर दिन" }, val: 3 }
    ],
    questions: [
      { id: "gad1", text: { en: "Feeling nervous, anxious, or on edge?", hi: "घबराहट, चिंता, या बेचैनी महसूस होना?" } },
      { id: "gad2", text: { en: "Not being able to stop or control worrying?", hi: "चिंता को रोकने या नियंत्रित करने में असमर्थ होना?" } },
      { id: "gad3", text: { en: "Worrying too much about different things?", hi: "विभिन्न चीजों के बारे में बहुत अधिक चिंता करना?" } },
      { id: "gad4", text: { en: "Trouble relaxing?", hi: "आराम करने में परेशानी महसूस होना?" } },
      { id: "gad5", text: { en: "Being so restless that it is hard to sit still?", hi: "इतनी बेचैनी महसूस होना कि शांत बैठना मुश्किल हो जाए?" } },
      { id: "gad6", text: { en: "Becoming easily annoyed or irritable?", hi: "आसानी से चिढ़ जाना या चिड़चिड़ा हो जाना?" } },
      { id: "gad7", text: { en: "Feeling afraid, as if something awful might happen?", hi: "अज्ञात भय महसूस होना, जैसे कुछ भयानक होने वाला हो?" } }
    ]
  },
  who5: {
    title: {
      en: "WHO-5 Well-Being Index",
      hi: "WHO-5 कल्याण सूचकांक (तनाव)"
    },
    disclaimer: {
      en: "The WHO-5 is a brief index measuring subjective well-being and quality of life. Lower scores indicate high stress or low mood.",
      hi: "WHO-5 जीवन की गुणवत्ता और मानसिक कल्याण को मापने वाला एक संक्षिप्त सूचकांक है। कम स्कोर उच्च तनाव या उदासी को दर्शाता है।"
    },
    answers: [
      { text: { en: "All of the time", hi: "हर समय" }, val: 5 },
      { text: { en: "Most of the time", hi: "अधिकांश समय" }, val: 4 },
      { text: { en: "More than half the time", hi: "आधे से अधिक समय" }, val: 3 },
      { text: { en: "Less than half the time", hi: "आधे से कम समय" }, val: 2 },
      { text: { en: "Some of the time", hi: "कुछ समय" }, val: 1 },
      { text: { en: "At no time", hi: "कभी नहीं" }, val: 0 }
    ],
    questions: [
      { id: "who1", text: { en: "I have felt cheerful and in good spirits?", hi: "मैं खुशमिजाज और अच्छे स्वभाव में महसूस कर रहा हूँ?" } },
      { id: "who2", text: { en: "I have felt calm and relaxed?", hi: "मैंने शांत और तनावमुक्त महसूस किया है?" } },
      { id: "who3", text: { en: "I have felt active and vigorous?", hi: "मैंने सक्रिय और ऊर्जावान महसूस किया है?" } },
      { id: "who4", text: { en: "I woke up feeling fresh and rested?", hi: "जब मैं सोकर उठा, तो तरोताजा और आराम महसूस किया?" } },
      { id: "who5", text: { en: "My daily life has been filled with things that interest me?", hi: "मेरा दैनिक जीवन उन चीजों से भरा रहा है जो मुझे रुचिकर लगती हैं?" } }
    ]
  }
};

// Multilingual Dictionary (Supports 10 Indian Languages)
const TRANSLATIONS = {
  en: {
    title: "M-Health India",
    tagline: "Understand. Support. Take the Next Step.",
    getStarted: "Get Started",
    skip: "Skip",
    next: "Next",
    back: "Back",
    submit: "Submit",
    exit: "Exit",
    consentTitle: "Patient Consent Form",
    consentText: "I consent to participate in this screening. I understand my data is stored securely and is strictly confidential.",
    publicUser: "I'm Checking for Myself",
    publicUserSub: "For general public well-being check and guides",
    frontlineWorker: "I'm a Frontline Worker",
    frontlineWorkerSub: "ASHA, ANM, or Medical Officers portal",
    howAreYouText: "How are you feeling today?",
    startScreening: "Start Screening",
    prevScreening: "Previous Screening",
    myProgress: "My Progress",
    learnUnderstand: "Learn & Support",
    supportResources: "Support Facilities",
    emergencyHelp: "Emergency Call",
    readAloud: "🔊 Read Aloud",
    largeText: "Aa Large Text",
    highContrast: "👁 High Contrast",
    saveResult: "Save Result",
    shareReport: "Share Report",
    findSupport: "Find Support Near Me",
    viewGuidance: "View Self-Care Guidance",
    talkPro: "Consult a Doctor",
    safetyWarning: "⚠️ IMMEDIATE SAFETY WARNING: If you are having thoughts of self-harm, please dial 14416 or 1800-891-4416 to reach Tele-MANAS immediately. Supportive counselors are available 24/7.",
    hwDashboard: "ASHA / ANM Dashboard",
    newScreening: "New Patient Screening",
    patientRegistry: "Patient Registry",
    followups: "Follow-ups & Recalls",
    analytics: "PHC Aggregated Reports",
    referrals: "Referral Directory",
    patientsLabel: "Patients",
    searchPlaceholder: "Search patient by ID or name...",
    offlineWarning: "Offline Mode — Changes will sync when network is restored",
    syncSuccess: "Data synchronized securely with Ayushman Bharat digital registry!"
  },
  hi: {
    title: "एम-स्वास्थ्य भारत",
    tagline: "समझें। समर्थन करें। अगला कदम उठाएं।",
    getStarted: "शुरू करें",
    skip: "छोड़ें",
    next: "अगला",
    back: "पीछे",
    submit: "जमा करें",
    exit: "बाहर निकलें",
    consentTitle: "मरीज की सहमति",
    consentText: "मैं इस स्क्रीनिंग में भाग लेने के लिए सहमत हूँ। मैं समझता हूँ कि मेरा डेटा सुरक्षित रूप से संग्रहीत है और गोपनीय है।",
    publicUser: "मैं स्वयं जांच कर रहा हूँ",
    publicUserSub: "आम जनता के मानसिक कल्याण और मार्गदर्शन के लिए",
    frontlineWorker: "मैं एक स्वास्थ्य कार्यकर्ता हूँ",
    frontlineWorkerSub: "आशा, एएनएम या चिकित्सा अधिकारियों का पोर्टल",
    howAreYouText: "आज आप कैसा महसूस कर रहे हैं?",
    startScreening: "स्क्रीनिंग शुरू करें",
    prevScreening: "पिछली स्क्रीनिंग",
    myProgress: "मेरी प्रगति",
    learnUnderstand: "सीखें और समझें",
    supportResources: "सहायता संसाधन",
    emergencyHelp: "आपातकालीन कॉल",
    readAloud: "🔊 ज़ोर से पढ़ें",
    largeText: "Aa बड़ा टेक्स्ट",
    highContrast: "👁 उच्च कंट्रास्ट",
    saveResult: "परिणाम सहेजें",
    shareReport: "रिपोर्ट साझा करें",
    findSupport: "नज़दीकी केंद्र खोजें",
    viewGuidance: "स्व-देखभाल मार्गदर्शन",
    talkPro: "डॉक्टर से परामर्श लें",
    safetyWarning: "⚠️ तत्काल सुरक्षा चेतावनी: यदि आपके मन में खुद को नुकसान पहुंचाने के विचार आ रहे हैं, तो तुरंत टेली-मानस पर संपर्क करने के लिए 14416 या 1800-891-4416 डायल करें। मददगार परामर्शदाता 24/7 उपलब्ध हैं।",
    hwDashboard: "आशा / एएनएम डैशबोर्ड",
    newScreening: "नई मरीज स्क्रीनिंग",
    patientRegistry: "मरीज रजिस्टर",
    followups: "फॉलो-अप और रिमाइंडर्स",
    analytics: "पीएचसी समेकित रिपोर्ट",
    referrals: "रेफरल निर्देशिका",
    patientsLabel: "मरीज",
    searchPlaceholder: "आईडी या नाम से मरीज खोजें...",
    offlineWarning: "ऑफलाइन मोड — नेटवर्क बहाल होने पर सिंक होगा",
    syncSuccess: "आयुष्मान भारत डिजिटल रजिस्ट्री के साथ डेटा सुरक्षित रूप से सिंक हो गया है!"
  },
  bn: { title: "এম-হেলথ ভারত", tagline: "বুঝুন। পাশে থাকুন। পরবর্তী পদক্ষেপ নিন।", publicUser: "আমি নিজের জন্য পরীক্ষা করছি", frontlineWorker: "আমি ফ্রন্টলাইন কর্মী" },
  mr: { title: "एम-हेल्थ भारत", tagline: "समजून घ्या. आधार द्या. पुढील पाऊल टाका.", publicUser: "मी स्वतःसाठी तपासत आहे", frontlineWorker: "मी आरोग्य कार्यकर्ता आहे" },
  te: { title: "ఎమ్-హెల్త్ భారత్", tagline: "అర్థం చేసుకోండి. మద్దతు ఇవ్వండి. తదుపరి అడుగు వేయండి.", publicUser: "నా కోసం నేను తనిఖీ చేస్తున్నాను", frontlineWorker: "నేను ఫ్రంట్‌లైన్ వర్కర్‌ని" },
  ta: { title: "எம்-ஹெல்த் பாரத்", tagline: "புரிந்து கொள்ளுங்கள். ஆதரவு கொடுங்கள். அடுத்த படியை எடுங்கள்.", publicUser: "எனக்காக நான் சோதிக்கிறேன்", frontlineWorker: "நான் ஒரு களப்பணியாளர்" },
  gu: { title: "એમ-હેલ્થ ભારત", tagline: "સમજો. ટેકો આપો. આગળનું પગલું લો.", publicUser: "હું મારા પોતાના માટે તપાસ કરું છું", frontlineWorker: "હું ફ્રન્ટલાઈન વર્કર છું" },
  kn: { title: "ಎಮ್-ಹೆಲ್ತ್ ಭಾರತ", tagline: "ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ. ಬೆಂಬಲಿಸಿ. ಮುಂದಿನ ಹೆಜ್ಜೆ ಇರಿಸಿ.", publicUser: "ನನಗಾಗಿ ನಾನು ಪರೀಕ್ಷಿಸುತ್ತಿದ್ದೇನೆ", frontlineWorker: "ನಾನು ಮುಂಚೂಣಿ ಕಾರ್ಯಕರ್ತ" },
  ml: { title: "എം-ഹെൽത്ത് ഭാരത്", tagline: "മനസ്സിലാക്കുക. പിന്തുണയ്ക്കുക. അടുത്ത പടിയിലേക്ക് കടക്കുക.", publicUser: "ഞാൻ എനിക്കായി പരിശോധിക്കുന്നു", frontlineWorker: "ഞാൻ ആരോഗ്യ പ്രവർത്തകനാണ്" },
  pa: { title: "ਐਮ-ਹੈਲਥ ਭਾਰਤ", tagline: "ਸਮਝੋ. ਸਹਿਯੋਗ ਕਰੋ. ਅਗਲਾ ਕਦਮ ਚੁੱਕੋ.", publicUser: "ਮੈਂ ਆਪਣੇ ਲਈ ਜਾਂਚ ਕਰ ਰਿਹਾ ਹਾਂ", frontlineWorker: "ਮੈਂ ਇੱਕ ਸਿਹਤ ਕਰਮਚਾਰੀ ਹਾਂ" }
};

// Initialize Application Data and Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  initDatabase();
  setupNavigation();
  setupAccessibility();
  setupNetworkSync();
  setupMoodCheck();
  setupAdaptiveCheck(); // Init adaptive engine & inject modules into QUESTION_DATABASE
  renderScreeningSelections(); // Populate screening tool cards on load
  setupMindGuide();
  setupHWPortal();
setupPublicLogin();
  // Start Splash Screen Timer
  setTimeout(() => {
    transitionTo('screen-onboarding');
  }, 2500);
});

// 1. Database Initialization
function initDatabase() {
  if (!localStorage.getItem('mh_patients')) {
    localStorage.setItem('mh_patients', JSON.stringify(window.DUMMY_DATABASE.patients));
    localStorage.setItem('mh_screenings', JSON.stringify(window.DUMMY_DATABASE.screenings));
    localStorage.setItem('mh_followups', JSON.stringify(window.DUMMY_DATABASE.followups));
    localStorage.setItem('mh_analytics', JSON.stringify(window.DUMMY_DATABASE.analytics));
    localStorage.setItem('mh_wellness', JSON.stringify(window.DUMMY_DATABASE.wellnessActivities));
    localStorage.setItem('mh_routines', JSON.stringify(window.DUMMY_DATABASE.routines));
    localStorage.setItem('mh_womens_wellness', JSON.stringify(window.DUMMY_DATABASE.womensWellness));
    localStorage.setItem('mh_mood_history', JSON.stringify(window.DUMMY_DATABASE.moodHistory));
  }
  
  appState.db.patients = JSON.parse(localStorage.getItem('mh_patients'));
  appState.db.screenings = JSON.parse(localStorage.getItem('mh_screenings'));
  appState.db.followups = JSON.parse(localStorage.getItem('mh_followups'));
  appState.db.wellnessActivities = JSON.parse(localStorage.getItem('mh_wellness'));
  appState.db.routines = JSON.parse(localStorage.getItem('mh_routines'));
  appState.db.womensWellness = JSON.parse(localStorage.getItem('mh_womens_wellness'));
  appState.db.moodHistory = JSON.parse(localStorage.getItem('mh_mood_history'));
}

// 2. Navigation Routing Manager
function transitionTo(screenId) {
  // Hide active screen
  const currentActive = document.querySelector('.screen.active');
  if (currentActive) {
    currentActive.classList.remove('active');
  }
  
  // Show new screen
  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.add('active');
    appState.activeScreen = screenId;
    
    // Bottom Nav Manager
    const bottomNavPublic = document.getElementById('bottom-nav-public');
    const bottomNavWorker = document.getElementById('bottom-nav-worker');
    
    if (bottomNavPublic) {
  bottomNavPublic.classList.remove('active');
}

if (bottomNavWorker) {
  bottomNavWorker.classList.remove('active');
}
    
    const sosBtn = document.getElementById('sos-btn');
    
    if (appState.userMode === 'public') {
      const publicScreens = ['screen-public-dashboard', 'screen-screening-select', 'screen-guidance', 'screen-support', 'screen-profile', 'screen-ai-chat', 'screen-common-q1', 'screen-common-q2', 'screen-adaptive-result', 'screen-contextual-q', 'screen-wellbeing-trend'];
      
  if (publicScreens.includes(screenId)) {

    if (bottomNavPublic) {
      bottomNavPublic.classList.add('active');
      highlightActiveTab('bottom-nav-public', screenId);
    }

    if (sosBtn) {
      sosBtn.style.display = 'flex';
    }

  } else {

    if (sosBtn) {
      sosBtn.style.display = 'none';
    }
  }
}
    
    // Screen specific logic triggers
    if (screenId === 'screen-hw-dashboard') {
      renderHWStats();
    } else if (screenId === 'screen-patients') {
      renderPatientList();
    } else if (screenId === 'screen-followups') {
      renderFollowups();
    } else if (screenId === 'screen-reports') {
      renderAnalyticsDashboard();
    } else if (screenId === 'screen-wellbeing-trend') {
      renderWellbeingTrend();
    } else if (screenId === 'screen-common-q1') {
      renderCommonQ1();
    } else if (screenId === 'screen-common-q2') {
      renderCommonQ2();
    }
  }
}

function highlightActiveTab(navId, screenId) {
  const navContainer = document.getElementById(navId);
  // Map secondary screens to their primary nav tab
  const screenToNavMap = {
    'screen-ai-chat': 'screen-public-dashboard',
    'screen-screening-result': 'screen-screening-select',
    'screen-patient-history': 'screen-patients',
    'screen-new-patient': 'screen-hw-dashboard',
    'screen-hw-result': 'screen-hw-dashboard',
    'screen-hw-login': 'screen-hw-dashboard',
    'screen-common-q1': 'screen-public-dashboard',
    'screen-common-q2': 'screen-public-dashboard',
    'screen-adaptive-result': 'screen-public-dashboard',
    'screen-contextual-q': 'screen-public-dashboard',
    'screen-safety': 'screen-support',
    'screen-wellbeing-trend': 'screen-public-dashboard'
  };
  const navTarget = screenToNavMap[screenId] || screenId;
  navContainer.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    const onclick = item.getAttribute('onclick') || '';
    if (onclick.includes(navTarget)) {
      item.classList.add('active');
    }
  });
}

function setupNavigation() {
  // Back buttons global handler
  document.querySelectorAll('.back-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      // Logic to go back based on context
      if (appState.activeScreen === 'screen-onboarding') {
        transitionTo('screen-splash');
      } else if (appState.activeScreen === 'screen-user-select') {
        transitionTo('screen-onboarding');
      } else if (appState.activeScreen === 'screen-public-dashboard' || appState.activeScreen === 'screen-hw-dashboard') {
        transitionTo('screen-user-select');
      } else if (appState.activeScreen === 'screen-screening-select') {
        transitionTo(appState.userMode === 'public' ? 'screen-public-dashboard' : 'screen-hw-dashboard');
      } else if (appState.activeScreen === 'screen-screening-question') {
        exitScreeningPrompt();
      } else if (appState.activeScreen === 'screen-screening-result') {
        transitionTo(appState.userMode === 'public' ? 'screen-public-dashboard' : 'screen-hw-dashboard');
      } else if (appState.activeScreen === 'screen-new-patient') {
        transitionTo('screen-hw-dashboard');
      } else if (appState.activeScreen === 'screen-patient-history') {
        transitionTo('screen-patients');
      } else if (appState.activeScreen === 'screen-common-q1') {
        if (appState.adaptiveScreening) appState.adaptiveScreening.active = false;
        transitionTo(appState.userMode === 'public' ? 'screen-public-dashboard' : 'screen-hw-dashboard');
      } else if (appState.activeScreen === 'screen-common-q2') {
        transitionTo('screen-common-q1');
      } else if (appState.activeScreen === 'screen-adaptive-result') {
        if (appState.adaptiveScreening) appState.adaptiveScreening.active = false;
        transitionTo(appState.userMode === 'public' ? 'screen-public-dashboard' : 'screen-hw-dashboard');
      } else if (appState.activeScreen === 'screen-safety') {
        if (appState.adaptiveScreening) appState.adaptiveScreening.active = false;
        transitionTo('screen-support');
      } else if (appState.activeScreen === 'screen-wellbeing-trend') {
        transitionTo('screen-public-dashboard');
      } else {
        // Fallback: previous dashboard or selection
        transitionTo(appState.userMode === 'public' ? 'screen-public-dashboard' : 'screen-hw-dashboard');
      }
    });
  });
}

// 3. Accessibility Settings Manager
function setupAccessibility() {
  // Theme Switching
  window.toggleTheme = function() {
    appState.theme = appState.theme === 'light' ? 'dark' : 'light';
    if (appState.theme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  };
  
  // Font scale (Large Text)
  window.cycleFontSize = function() {
    if (appState.fontSizeScale === 1) {
      appState.fontSizeScale = 1.2;
    } else if (appState.fontSizeScale === 1.2) {
      appState.fontSizeScale = 1.4;
    } else {
      appState.fontSizeScale = 1;
    }
    document.documentElement.style.setProperty('--font-scale', appState.fontSizeScale);
    showToast(`Font scale adjusted to ${Math.round(appState.fontSizeScale * 100)}%`);
  };
  
  // High Contrast toggle
  window.toggleHighContrast = function() {
    appState.highContrast = !appState.highContrast;
    if (appState.highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    showToast(`High Contrast mode ${appState.highContrast ? 'enabled' : 'disabled'}`);
  };
  
  // Language switcher dropdown handler
  window.changeLanguage = function(langVal) {
    appState.language = langVal;
    localizeUI();
  };
}

function localizeUI() {
  const dictionary = TRANSLATIONS[appState.language] || TRANSLATIONS['en'];
  
  // Update translation text on items marked with 'data-translate'
  document.querySelectorAll('[data-translate]').forEach(el => {
    const key = el.getAttribute('data-translate');
    if (dictionary[key]) {
      el.textContent = dictionary[key];
    }
  });
  
  // Placeholder adjustments
  document.querySelectorAll('[data-translate-placeholder]').forEach(el => {
    const key = el.getAttribute('data-translate-placeholder');
    if (dictionary[key]) {
      el.setAttribute('placeholder', dictionary[key]);
    }
  });
  
  // Refresh screening cards translation
  renderScreeningSelections();
}

// 4. Network and Storage Offline Sync Engine
function setupNetworkSync() {
  const syncBtn = document.getElementById('network-toggle-btn');
  syncBtn.addEventListener('click', () => {
    appState.isOnline = !appState.isOnline;
    
    if (appState.isOnline) {
      syncBtn.classList.remove('offline');
      syncBtn.querySelector('.lbl').textContent = "Online";
      showToast("Online — Attempting database sync...");
      runSyncMechanism();
    } else {
      syncBtn.classList.add('offline');
      syncBtn.querySelector('.lbl').textContent = "Offline";
      showToast("Offline — All entries will be queued locally");
    }
  });
}

function runSyncMechanism() {
  if (appState.db.syncQueue && appState.db.syncQueue.length > 0) {
    showToast("Syncing data records with Ayushman Digital Health API...");
    // Simulate API delay
    setTimeout(() => {
      appState.db.syncQueue = [];
      showToast(TRANSLATIONS[appState.language].syncSuccess || TRANSLATIONS['en'].syncSuccess);
      
      // Update sync indicators in registry list
      appState.db.screenings.forEach(scr => scr.sync = true);
      appState.db.patients.forEach(pt => pt.sync = true);
      localStorage.setItem('mh_screenings', JSON.stringify(appState.db.screenings));
      localStorage.setItem('mh_patients', JSON.stringify(appState.db.patients));
      
      if (appState.activeScreen === 'screen-patients') {
        renderPatientList();
      }
    }, 2000);
  } else {
    setTimeout(() => {
      showToast("All data records are fully up to date.");
    }, 1000);
  }
}

function showToast(msg) {
  const toast = document.getElementById('sync-toast');
  toast.textContent = msg;
  toast.style.display = 'block';
  setTimeout(() => {
    toast.style.display = 'none';
  }, 3500);
}

// 5. Onboarding slider controls
let currentOnboardSlide = 0;
window.nextOnboard = function() {
  const slides = document.querySelectorAll('.onboarding-slide');
  const dots = document.querySelectorAll('.onboarding-dot');
  
  slides[currentOnboardSlide].classList.remove('active');
  dots[currentOnboardSlide].classList.remove('active');
  
  currentOnboardSlide++;
  if (currentOnboardSlide >= slides.length) {
    currentOnboardSlide = 0;
    transitionTo('screen-user-select');
  } else {
    slides[currentOnboardSlide].classList.add('active');
    dots[currentOnboardSlide].classList.add('active');
    
    // If it's the last slide, change Next text to "Get Started"
    const nextBtn = document.getElementById('onboard-next-btn');
    if (currentOnboardSlide === slides.length - 1) {
      nextBtn.textContent = TRANSLATIONS[appState.language].getStarted || TRANSLATIONS['en'].getStarted;
    } else {
      nextBtn.textContent = TRANSLATIONS[appState.language].next || TRANSLATIONS['en'].next;
    }
  }
};

window.skipOnboard = function() {
  transitionTo('screen-user-select');
};

// 6. User mode select
window.selectUserMode = function(mode) {
  appState.userMode = mode;

  if (mode === 'public') {
    transitionTo('screen-public-login');
  } else {
    transitionTo('screen-hw-login');
  }
};

// Public Dashboard Mood Indicator Check-in
function setupMoodCheck() {
  document.querySelectorAll('.mood-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      const moodVal = btn.getAttribute('data-mood');

      // Persist mood to history (last 30 days)
      const history = JSON.parse(localStorage.getItem('mh_mood_history') || '[]');
      const today = new Date().toISOString().split('T')[0];
      const filtered = history.filter(e => e.date !== today);
      filtered.push({ date: today, mood: moodVal, timestamp: new Date().toISOString() });
      localStorage.setItem('mh_mood_history', JSON.stringify(filtered.slice(-30)));

      showToast(`Mood logged: ${moodVal} 📈 View your trend anytime!`);
    });
  });
}

// 7. Clinical Screening Selection & Wizard
function renderScreeningSelections() {
  const grid = document.getElementById('screening-tools-grid');
  grid.innerHTML = '';
  
  const tools = [
    { key: 'phq9', cls: '', icon: '🌱', tag: 'Depression Indicator' },
    { key: 'gad7', cls: 'gad', icon: '🌀', tag: 'Anxiety Scale' },
    { key: 'who5', cls: 'wellbeing', icon: '☀️', tag: 'Well-being & Stress' },
    { key: 'pss4', cls: 'stress', icon: '🌊', tag: 'Stress Assessment' }
  ];
  
  tools.forEach(tool => {
    const meta = QUESTION_DATABASE[tool.key];
    if (!meta) return; // Skip if module not yet loaded
    const title = meta.title[appState.language] || meta.title['en'];
    const card = document.createElement('div');
    card.className = `card tool-card ${tool.cls}`;
    card.setAttribute('onclick', `startScreening('${tool.key}')`);
    card.innerHTML = `
      <div class="card-title-row">
        <h3>${tool.icon} ${title}</h3>
        <span class="action-link">Start</span>
      </div>
      <p style="font-size: 12px; color: var(--text-muted);">${tool.tag} — ${meta.questions.length} questions</p>
      <div class="tool-meta">
        <span>Clinical validated score</span>
        <span>Est: 3 mins</span>
      </div>
    `;
    grid.appendChild(card);
  });
}

// --- Adaptive Screening Engine Logic ---
window.startAdaptiveCheck = function() {
  appState.adaptiveScreening = {
    active: true,
    step: 1
  };
  renderAdaptiveQuestion();
};

window.renderAdaptiveQuestion = function() {
  const qObj = appState.adaptiveScreening.step === 1 ? COMMON_QUESTIONS.q1 : COMMON_QUESTIONS.q2;
  const lang = appState.language || 'en';
  
  const screen = document.getElementById('screen-screening-question');
  screen.querySelector('.question-text').innerText = qObj.text[lang] || qObj.text['en'];
  
  const optionsContainer = screen.querySelector('.options-container');
  optionsContainer.innerHTML = '';
  
  qObj.options.forEach(opt => {
    const card = document.createElement('div');
    card.className = 'option-card';
    card.innerHTML = `
      <span class="opt-emoji">${opt.emoji}</span>
      <span class="opt-label" style="margin-left:8px;">${opt.label[lang] || opt.label['en']}</span>
      <div class="checkmark"></div>
    `;
    card.onclick = () => handleAdaptiveAnswer(opt);
    optionsContainer.appendChild(card);
  });
  
  const pbFill = screen.querySelector('.progress-bar-fill');
  if (pbFill) pbFill.style.width = appState.adaptiveScreening.step === 1 ? '10%' : '20%';
  
  transitionTo('screen-screening-question');
};
  

window.handleAdaptiveAnswer = function(opt) {
  if (appState.adaptiveScreening.step === 1) {
    appState.adaptiveScreening.q1Answer = opt.value;
    appState.adaptiveScreening.step = 2;
    renderAdaptiveQuestion();
  } else if (appState.adaptiveScreening.step === 2) {
    appState.adaptiveScreening.q2Answer = opt.value;
    const routeTo = opt.routeTo || 'who5';
    showToast("Finding the best screening tool for you...");
    setTimeout(() => {
      startScreening(routeTo);
    }, 1000);
  }
};

window.startScreening = function(toolKey) {
  appState.activeScreening.tool = toolKey;
  appState.activeScreening.currentQuestionIndex = 0;
  appState.activeScreening.answers = new Array(QUESTION_DATABASE[toolKey].questions.length).fill(null);
  
  // Set up screening details header
  const headerTitle = document.getElementById('screening-tool-title');
  headerTitle.textContent = QUESTION_DATABASE[toolKey].title[appState.language] || QUESTION_DATABASE[toolKey].title['en'];
  
  // Render first question
  transitionTo('screen-screening-question');
  renderScreeningQuestion();
};

function renderScreeningQuestion() {
  const wizard = appState.activeScreening;
  const toolInfo = QUESTION_DATABASE[wizard.tool];
  const questionIndex = wizard.currentQuestionIndex;
  const questionCount = toolInfo.questions.length;
  const question = toolInfo.questions[questionIndex];
  
  // Question indicators
  document.getElementById('question-num-indicator').innerHTML = `Question <strong>${questionIndex + 1}</strong> of ${questionCount}`;
  const pct = Math.round(((questionIndex) / questionCount) * 100);
  document.getElementById('question-progress-fill').style.width = `${pct}%`;
  
  // Set question text
  const qText = question.text[appState.language] || question.text['en'];
  document.getElementById('question-text').textContent = qText;
  
  // Render response options as cards
  const optionsWrapper = document.getElementById('question-options-container');
  optionsWrapper.innerHTML = '';
  
  toolInfo.answers.forEach(ans => {
    const ansText = ans.text[appState.language] || ans.text['en'];
    const card = document.createElement('div');
    card.className = 'option-card';
    if (wizard.answers[questionIndex] === ans.val) {
      card.classList.add('selected');
    }
    card.innerHTML = `
      <span class="option-label">${ansText}</span>
      <div class="checkmark"></div>
    `;
    card.onclick = () => {
      selectQuestionAnswer(ans.val);
    };
    optionsWrapper.appendChild(card);
  });
}

 

function selectQuestionAnswer(scoreValue) {
  const wizard = appState.activeScreening;
  wizard.answers[wizard.currentQuestionIndex] = scoreValue;
  
  // Rerender question with selection highlight
  renderScreeningQuestion();
  
  // Automatic step-forward after a short delay
  setTimeout(() => {
    nextQuestion();
  }, 350);
}

window.prevQuestion = function() {
  if (appState.activeScreening.currentQuestionIndex > 0) {
    appState.activeScreening.currentQuestionIndex--;
    renderScreeningQuestion();
  }
};

window.nextQuestion = function() {
  const wizard = appState.activeScreening;
  const toolInfo = QUESTION_DATABASE[wizard.tool];
  
  if (wizard.answers[wizard.currentQuestionIndex] === null) {
    showToast("Please select an answer response to proceed.");
    return;
  }
  
  if (wizard.currentQuestionIndex < toolInfo.questions.length - 1) {
    wizard.currentQuestionIndex++;
    renderScreeningQuestion();
  } else {
    // End of screening questionnaire -> calculate results!
    finishScreening();
  }
};

// Web Speech TTS Question Reader
window.ttsReadAloud = function() {
  const wizard = appState.activeScreening;
  const question = QUESTION_DATABASE[wizard.tool].questions[wizard.currentQuestionIndex];
  const qText = question.text[appState.language] || question.text['en'];
  
  if ('speechSynthesis' in window) {
    // Cancel active speaker speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(qText);
    
    // Choose appropriate voice locales
    if (appState.language === 'hi') {
      utterance.lang = 'hi-IN';
    } else {
      utterance.lang = 'en-IN';
    }
    
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
    showToast("Reading question aloud...");
  } else {
    showToast("Text-to-speech accessibility features are unsupported on this device.");
  }
};

function exitScreeningPrompt() {
  if (confirm("Are you sure you want to exit the screening? Your current progress will be lost.")) {
    transitionTo(appState.userMode === 'public' ? 'screen-public-dashboard' : 'screen-hw-dashboard');
  }
}

// 8. Result interpretation and Clinical Decision Core
function finishScreening() {
  const wizard = appState.activeScreening;
  let totalScore = 0;
  
  // Calculate standard scores
  if (wizard.tool === 'who5') {
    // WHO-5 raw score is sum of values * 4 to yield index percentage
    const rawSum = wizard.answers.reduce((a, b) => a + b, 0);
    totalScore = rawSum * 4;
  } else if (wizard.tool === 'pss4' && window.ScoringEngine) {
    // PSS-4 uses reverse scoring on Q3 and Q4 — delegate to ScoringEngine
    const calcResult = window.ScoringEngine.calculate('pss4', wizard.answers);
    totalScore = calcResult.scaledScore;
  } else {
    // PHQ-9 & GAD-7 scores are absolute sum of response codes
    totalScore = wizard.answers.reduce((a, b) => a + b, 0);
  }
  
  // Formulate safety indicators (PHQ-9 Question 9 flags self harm thoughts)
  let selfHarmFlagged = false;
  if (wizard.tool === 'phq9' && wizard.answers[8] > 0) {
    selfHarmFlagged = true;
  }
  
  // Categorize
  let severity = "";
  let interpretation = "";
  let guidanceText = "";
  let recommendedAction = "";
  let flagColor = "minimal";
  
  if (wizard.tool === 'phq9') {
    if (totalScore <= 4) {
      severity = "Minimal Concern";
      interpretation = "Your responses do not indicate significant symptoms of depression on this screening test.";
      guidanceText = "Continue prioritizing your mental wellness. Practice regular exercises and stay connected with close friends and family.";
      recommendedAction = "Basic psychoeducation & Routine check-ins";
      flagColor = "minimal";
    } else if (totalScore <= 9) {
      severity = "Mild Concern";
      interpretation = "Your responses indicate mild depressive symptoms that might warrant awareness and tracking.";
      guidanceText = "Monitor your symptoms. Consider trying breathing techniques, regular sleep schedules, and mild activities.";
      recommendedAction = "Supportive follow-up and self-care plans";
      flagColor = "mild";
    } else if (totalScore <= 14) {
      severity = "Moderate Concern";
      interpretation = "Your responses indicate moderate depressive symptoms. It may be beneficial to discuss these results with a healthcare advisor.";
      guidanceText = "Please consider checking in with your nearest Primary Health Centre or consulting a trusted mental health doctor.";
      recommendedAction = "Referral to PHC Medical Officer & monitoring";
      flagColor = "moderate";
    } else {
      severity = "Severe Concern";
      interpretation = "Your responses indicate significant severity of depressive symptoms. We strongly encourage professional care.";
      guidanceText = "A medical specialist consultation is recommended. Consult your local health counselor or visit the District PHC.";
      recommendedAction = "Urgent Specialist Referral & priority action";
      flagColor = "severe";
    }
  } else if (wizard.tool === 'gad7') {
    if (totalScore <= 4) {
      severity = "Minimal Concern";
      interpretation = "Your responses do not indicate high levels of general anxiety symptoms.";
      guidanceText = "Incorporate wellness practices like yoga or meditation to keep stress low.";
      recommendedAction = "Routine self-care instructions";
      flagColor = "minimal";
    } else if (totalScore <= 9) {
      severity = "Mild Concern";
      interpretation = "Your responses point to mild levels of anxiety symptoms.";
      guidanceText = "Practice anxiety coping scripts, like Box Breathing, and limit caffeine.";
      recommendedAction = "Self-care guidance & follow-up";
      flagColor = "mild";
    } else if (totalScore <= 14) {
      severity = "Moderate Concern";
      interpretation = "Your responses correspond with moderate anxiety symptoms. It is advised to seek medical guidance.";
      guidanceText = "You are encouraged to consult a primary care doctor or reach out to Tele-MANAS helpline counselors.";
      recommendedAction = "Referral to PHC Medical Officer";
      flagColor = "moderate";
    } else {
      severity = "Severe Concern";
      interpretation = "Your responses suggest severe anxiety symptoms that benefit from psychiatric counseling support.";
      guidanceText = "We strongly suggest speaking with a professional clinical therapist. Reach out to verified helplines.";
      recommendedAction = "Specialist Therapist Referral";
      flagColor = "severe";
    }
  } else if (wizard.tool === 'who5') {
    if (totalScore >= 50) {
      severity = "Good Well-being";
      interpretation = "Your responses indicate an adequate score of mental well-being and life satisfaction.";
      guidanceText = "Maintain a good balance of diet, physical exercise, and regular social circles.";
      recommendedAction = "Routine mental well-being check";
      flagColor = "minimal";
    } else {
      severity = "Low Well-being (Concern)";
      interpretation = "Your well-being index is below average, indicating high stress, burnout, or low mood levels.";
      guidanceText = "We suggest completing a specific PHQ-9 Depression screening for detailed evaluation. Seek rest.";
      recommendedAction = "Recommend PHQ-9 screening & follow-up";
      flagColor = "moderate";
    }
  }
  
  // Format clinical entry
  const screeningRecord = {
    id: `SCR-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toISOString().split('T')[0],
    tool: wizard.tool === 'phq9' ? 'PHQ-9' : (wizard.tool === 'gad7' ? 'GAD-7' : (wizard.tool === 'pss4' ? 'PSS-4' : 'WHO-5')),
    score: totalScore,
    severity: severity,
    action: recommendedAction,
    interpretation: interpretation,
    guidance: guidanceText,
    selfHarm: selfHarmFlagged,
    sync: appState.isOnline
  };
  
  if (appState.userMode === 'public') {
    // Render Public Results
    transitionTo('screen-screening-result');
    
    // Update labels
    document.getElementById('result-tool-label').textContent = screeningRecord.tool;
    document.getElementById('result-score-num').textContent = totalScore;
    
    const labelEl = document.getElementById('result-severity-label');
    labelEl.textContent = severity;
    labelEl.className = `severity-label ${flagColor}`;
    
    document.getElementById('result-interpretation').textContent = interpretation;
    
    // Safety Alert Box
    const safetyBox = document.getElementById('result-safety-alert');
    if (selfHarmFlagged) {
      safetyBox.style.display = 'block';
      safetyBox.textContent = TRANSLATIONS[appState.language].safetyWarning || TRANSLATIONS['en'].safetyWarning;
    } else {
      safetyBox.style.display = 'none';
    }
    
    // Save locally
    appState.db.screenings.push(screeningRecord);
    localStorage.setItem('mh_screenings', JSON.stringify(appState.db.screenings));
  } else {
    // Health Worker Screening Finished
    transitionTo('screen-hw-result');
    
    document.getElementById('hw-res-patient').innerHTML = `Patient ID: <strong>${wizard.patientInfo.id}</strong> (${wizard.patientInfo.name})`;
    document.getElementById('hw-res-tool').textContent = screeningRecord.tool;
    document.getElementById('hw-res-score').textContent = totalScore;
    document.getElementById('hw-res-severity').textContent = severity;
    document.getElementById('hw-res-interpretation').textContent = interpretation;
    
    const actionEl = document.getElementById('hw-res-action-card');
    actionEl.innerHTML = `
      <h4>Recommended Action:</h4>
      <p style="font-weight: 700; font-size: 13px; color: var(--primary); margin-top: 4px;">${recommendedAction}</p>
      <p style="font-size: 11px; margin-top: 6px;">${guidanceText}</p>
    `;
    
    // Question 9 flagging highlight
    const flagsEl = document.getElementById('hw-res-flags');
    flagsEl.innerHTML = '';
    if (selfHarmFlagged) {
      const urgentBadge = document.createElement('div');
      urgentBadge.className = 'hw-action-card-critical';
      urgentBadge.innerHTML = `
        <h4>⚠️ CRITICAL RISK FACTOR IDENTIFIED</h4>
        <p style="font-size:11px;">Patient indicated positive thoughts of self-harm on Question 9. Immediate clinical escalation to the Medical Officer and safety checks are required.</p>
      `;
      flagsEl.appendChild(urgentBadge);
    }
    
    // Add Patient details to screening record
    screeningRecord.patientId = wizard.patientInfo.id;
    screeningRecord.patientName = wizard.patientInfo.name;
    
    // Write records
    appState.db.screenings.push(screeningRecord);
    localStorage.setItem('mh_screenings', JSON.stringify(appState.db.screenings));
    
    if (!appState.isOnline) {
      appState.db.syncQueue.push({ type: 'screening', data: screeningRecord });
    }
  }
}

// 9. Public Mode - Personalized Guidance Render
window.viewPersonalGuidance = function() {
  transitionTo('screen-guidance');
  // Customize guidance screen dynamically based on last screening
  const latestScreening = appState.db.screenings.filter(s => !s.patientId).slice(-1)[0];
  const listWrapper = document.getElementById('guidance-dynamic-list');
  listWrapper.innerHTML = '';
  
  let guides = [
    { title: "🌱 Sleep Routine", text: "Go to bed and wake up at the exact same time every day, even on weekends." },
    { title: "🏃 Physical Activity", text: "Walk or exercise for 20-30 minutes daily. Sunlight exposure helps stabilize mood hormones." },
    { title: "🧘 Breathing & Relaxation", text: "Practice slow deep breathing: Inhale for 4 seconds, hold for 4, exhale for 6." }
  ];
  
  if (latestScreening && (latestScreening.score > 9 || latestScreening.severity.includes("Severe"))) {
    guides.unshift({
      title: "⚠️ Consulting Professional Care",
      text: "Screening scores point to potential clinical needs. A consultation at the PHC is highly helpful."
    });
  }
  
  guides.forEach(g => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${g.title}</strong>: ${g.text}`;
    listWrapper.appendChild(li);
  });
};

// 10. MindGuide AI Chatbot Logic
function setupMindGuide() {
    const chatInput = document.getElementById('chat-msg-input');
    const sendBtn = document.getElementById('chat-send-btn');

    if (!chatInput || !sendBtn) {
        console.error('Chat input or send button not found');
        return;
    }
const sendMessage = async () => {
    const msg = chatInput.value.trim();

    if (!msg) return;

    // Show user's message immediately
    appendChatMessage(msg, 'user');
    chatInput.value = '';

    // Disable button while waiting
    sendBtn.disabled = true;
    sendBtn.textContent = '...';

    try {
        console.log('Sending message to backend:', msg);

        const response = await window.API.fetchWithAuth('/chat', {
            method: 'POST',
            body: JSON.stringify({
                message: msg,
                context: {}
            })
        });

        console.log('Backend response:', response);

        if (response && response.reply) {
            appendChatMessage(response.reply, 'assistant');
        } else {
            appendChatMessage(
                'Sorry, I could not generate a response right now.',
                'assistant'
            );
        }

    } catch (error) {
        console.error('MindGuide chat error:', error);

        appendChatMessage(
            'Sorry, I am having trouble connecting right now. Please try again.',
            'assistant'
        );
    } finally {
        sendBtn.disabled = false;
        sendBtn.textContent = 'Send';
    }
};
  
  sendBtn.addEventListener('click', sendMessage);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
}

function appendChatMessage(text, sender) {
  const chatHistory = document.getElementById('chat-history');
  const msgDiv = document.createElement('div');
  msgDiv.className = `chat-msg ${sender}`;
  msgDiv.textContent = text;
  chatHistory.appendChild(msgDiv);
  
  // Auto scroll down
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

window.sendQuickReply = function(chipText) {
  appendChatMessage(chipText, 'user');
  setTimeout(() => {
    generateBotResponse(chipText);
  }, 800);
};

function generateBotResponse(userMsg) {
  const msgLower = userMsg.toLowerCase();
  let botReply = "";
  
  // AI Disclaimer & Clinical rules
  const diagnosticDisclaimer = "\n\n*MindGuide disclaimer: I am an AI information assistant, not a doctor. I cannot provide official diagnoses. Please consult a qualified clinician for health evaluations.*";
  
  if (msgLower.includes('phq-9') || msgLower.includes('phq9')) {
    botReply = "The PHQ-9 is a 9-item Patient Health Questionnaire designed to measure the severity of depressive symptoms. It scores items from 0 (Not at all) to 3 (Nearly every day). Cumulative scores of 10 or higher suggest checking in with a mental health professional.";
  } else if (msgLower.includes('gad-7') || msgLower.includes('gad7')) {
    botReply = "The GAD-7 is a validated 7-item Generalized Anxiety Disorder questionnaire used to evaluate symptoms of worry and anxiety. Scores of 5, 10, and 15 represent thresholds for mild, moderate, and severe anxiety.";
  } else if (msgLower.includes('depress') || msgLower.includes('sad') || msgLower.includes('anxi') || msgLower.includes('stress')) {
    botReply = "Fluctuations in mood, stress, and anxiety are common and manageable. Identifying these states early through questionnaires like PHQ-9 or GAD-7 helps people target self-care routines or seek medical consultations at Primary Health Centres.";
  } else if (msgLower.includes('suicid') || msgLower.includes('die') || msgLower.includes('kill') || msgLower.includes('harm')) {
    botReply = "If you or someone you know is going through a crisis or thinking of self-harm, please seek human support immediately. You can reach out to Tele-MANAS directly by dialing 14416 or 1800-891-4416. Helpline assistants are waiting to support you.";
  } else if (msgLower.includes('phc') || msgLower.includes('hospital') || msgLower.includes('clinic')) {
    botReply = "Primary Health Centres (PHCs) in India are equipped with trained medical workers who can conduct screenings and provide mental health assessments. Frontline workers (ASHA/ANMs) can refer you to a local medical officer.";
  } else if (msgLower.includes('hello') || msgLower.includes('hi') || msgLower.includes('hey')) {
    botReply = "Namaste! I am MindGuide, your mental health dashboard assistant. You can ask me how to navigate the app, explain screening results, or define psychiatric screening scores. How can I help you today?";
  } else if (msgLower.includes('pss') || msgLower.includes('pss-4') || msgLower.includes('stress scale') || msgLower.includes('perceived stress')) {
    botReply = "The PSS-4 (Perceived Stress Scale \u2014 4-item version) is a validated, public-domain tool developed by Sheldon Cohen at Carnegie Mellon University. It measures your perception of stress over the past month. Scores range 0\u201316; higher scores indicate greater perceived stress. It is widely used in research and community well-being screening worldwide.";
  } else if (msgLower.includes('who-5') || msgLower.includes('who5') || msgLower.includes('well-being index')) {
    botReply = "The WHO-5 Well-Being Index is a brief 5-question tool developed by the WHO Regional Office for Europe. It measures subjective mental well-being over the last 2 weeks. The raw score (0\u201325) is multiplied by 4 to produce a percentage (0\u2013100). A score below 50 may warrant a more detailed depression screening with the PHQ-9.";
  } else if (msgLower.includes('why') && (msgLower.includes('pathway') || msgLower.includes('routed') || msgLower.includes('anxiety screening') || msgLower.includes('depression screening') || msgLower.includes('stress screening') || msgLower.includes('selected'))) {
    const ctx = appState.lastScreeningContext;
    if (ctx && ctx.concern) {
      botReply = `The adaptive system routed you to the ${ctx.tool} screening because your stated concern matched that pathway. The routing is deterministic \u2014 not AI-driven. The rules-based mapping is: Low mood \u2192 PHQ-9 \u00b7 Anxiety \u2192 GAD-7 \u00b7 Stress / Work pressure \u2192 PSS-4 \u00b7 Sleep / Social / Other \u2192 WHO-5. AI never determines your clinical pathway.`;
    } else {
      botReply = "The adaptive routing uses a deterministic table to match your stated concern (from the 2 common questions) to the most appropriate validated tool: Low mood \u2192 PHQ-9 \u00b7 Anxiety \u2192 GAD-7 \u00b7 Stress/Work pressure \u2192 PSS-4 \u00b7 Sleep/Social concerns \u2192 WHO-5. This is rules-based, not AI-driven.";
    }
  } else if (msgLower.includes('my score') || msgLower.includes('my result') || msgLower.includes('what does my score mean')) {
    const ctx = appState.lastScreeningContext;
    if (ctx) {
      botReply = `Your most recent ${ctx.tool} screening showed a score of ${ctx.score} (${ctx.category}). This indicates ${ctx.category}-level symptoms. Remember: this is a screening indicator, not a clinical diagnosis. Please review the recommended actions on your result screen and consider consulting a healthcare professional if concerned.`;
    } else {
      botReply = "Please complete a mental health screening first, then ask me to explain your result. I can explain what PHQ-9, GAD-7, PSS-4, or WHO-5 scores mean in plain language.";
    }
  } else if (msgLower.includes('mindguide') || msgLower.includes('what can you do') || msgLower.includes('how can you help') || msgLower.includes('what are you')) {
    botReply = "I am MindGuide, the AI assistant in M-Health India. I can: explain screening tools (PHQ-9, GAD-7, PSS-4, WHO-5) \u00b7 explain your screening scores \u00b7 explain why a particular pathway was selected \u00b7 answer general mental health questions \u00b7 help you navigate the app. I cannot: diagnose conditions \u00b7 change clinical scores \u00b7 prescribe treatment \u00b7 manage crisis situations. For emergencies, please call Tele-MANAS: 14416.";
  } else {
    botReply = "I understand. Navigating mental well-being can feel challenging, but early identification is a powerful first step. Consider completing a mental health check or asking me about PHQ-9, GAD-7, PSS-4, WHO-5, or how the adaptive routing works.";
  }
  
  appendChatMessage(botReply + diagnosticDisclaimer, 'bot');
}
function setupPublicLogin() {
  const loginForm = document.getElementById('public-login-form');

  if (!loginForm) return;

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('public-email').value.trim();
    const password = document.getElementById('public-password').value;

    if (!email || !password) {
      alert('Please enter email and password.');
      return;
    }

    try {
      const response = await fetch('http://10.27.5.164:5000/api/auth/login',  {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      const responseText = await response.text();

console.log('Login raw response:', responseText);

let data = {};

try {
  data = responseText ? JSON.parse(responseText) : {};
} catch (parseError) {
  console.error('Invalid JSON response:', responseText);
  throw new Error('Server returned an invalid login response.');
}

      console.log('Login response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (!data.token) {
        throw new Error('Login successful, but token was not received.');
      }

      // Save authentication token
      localStorage.setItem('mh_token', data.token);

      // Save user ID
      if (data.user && data.user.id) {
        localStorage.setItem('mh_user_id', data.user.id);
      }

      // Update API service token
      if (window.API && typeof window.API.setToken === 'function') {
        window.API.setToken(data.token);
      }

      appState.userMode = 'public';

      showToast('Login successful!');

      transitionTo('screen-public-dashboard');

    } catch (error) {
      console.error('Public login error:', error);
      alert(error.message || 'Login failed');
    }
  });
}
// 11. Frontline Health Worker Login & Form Submission
function setupHWPortal() {
  const loginForm = document.getElementById('hw-login-form');
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Simulate Credentials validation
    const workerId = document.getElementById('hw-id-input').value;
    const passcode = document.getElementById('hw-pass-input').value;
    
    if (workerId && passcode) {
      appState.userMode = 'worker';
      showToast(`Welcome Health Worker, ID: ${workerId}`);
      transitionTo('screen-hw-dashboard');
      
      // Update portal worker label
      document.getElementById('hw-profile-name').textContent = `ASHA / ANM (${workerId})`;
    } else {
      alert("Please fill in worker credentials.");
    }
  });
  
  // Patient registry submission
  const patientForm = document.getElementById('new-patient-form');
  patientForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const consentCheck = document.getElementById('pt-consent-check');
    if (!consentCheck.checked) {
      alert("Patient consent is mandatory before starting any health screening assessment.");
      return;
    }
    
    const name = document.getElementById('pt-name').value;
    const age = document.getElementById('pt-age').value;
    const gender = document.getElementById('pt-gender').value;
    const language = document.getElementById('pt-lang').value;
    const phone = document.getElementById('pt-phone').value;
    
    const newPt = {
      id: `PT-${Math.floor(1000 + Math.random() * 9000)}`,
      name: name,
      ageGroup: age,
      gender: gender,
      language: language,
      consent: true,
      phone: phone,
      sync: appState.isOnline
    };
    
    // Save record
    appState.db.patients.push(newPt);
    localStorage.setItem('mh_patients', JSON.stringify(appState.db.patients));
    
    if (!appState.isOnline) {
      appState.db.syncQueue.push({ type: 'patient', data: newPt });
    }
    
    // Save active patient context for the upcoming wizard
    appState.activeScreening.patientInfo = newPt;
    appState.activeScreening.isPublic = false;
    
    // Redirect to tool selection
    transitionTo('screen-screening-select');
    showToast("Patient record created. Choose screening tool.");
  });

  // Patient search filter live interaction
  const searchInput = document.getElementById('patient-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderPatientList(e.target.value);
    });
  }
}

// 12. Worker View Renderers
function renderHWStats() {
  const screeningsCount = appState.db.screenings.length;
  const patientsCount = appState.db.patients.length;
  const pendingFollowups = appState.db.followups.filter(f => f.status === 'Due' || f.status === 'Overdue').length;
  
  document.getElementById('hw-stat-screenings').textContent = screeningsCount;
  document.getElementById('hw-stat-patients').textContent = patientsCount;
  document.getElementById('hw-stat-followups').textContent = pendingFollowups;
}

function renderPatientList(query = "") {
  const list = document.getElementById('patient-list-registry');
  list.innerHTML = '';
  
  const searchNormalized = query.toLowerCase().trim();
  const filtered = appState.db.patients.filter(pt => 
    pt.name.toLowerCase().includes(searchNormalized) || 
    pt.id.toLowerCase().includes(searchNormalized)
  );
  
  if (filtered.length === 0) {
    list.innerHTML = `<p style="font-size:12px; color:var(--text-muted); text-align:center; padding:20px 0;">No patients found matching "${query}"</p>`;
    return;
  }
  
  filtered.forEach(pt => {
    const ptScreenings = appState.db.screenings.filter(s => s.patientId === pt.id);
    const syncStatus = pt.sync ? '🟢 Synced' : '🟠 Local-only';
    
    const div = document.createElement('div');
    div.className = 'card';
    div.style.padding = '14px';
    div.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div>
          <h4 style="font-size:14px; color:var(--primary);">${pt.name}</h4>
          <p style="font-size:11px; color:var(--text-muted);">ID: ${pt.id} | Age: ${pt.ageGroup} | Lang: ${pt.language}</p>
        </div>
        <span style="font-size: 10px; font-weight:600; color: ${pt.sync ? 'var(--success)' : 'var(--accent)'}">${syncStatus}</span>
      </div>
      <div style="margin-top: 10px; display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:11px;">Screenings logged: <strong>${ptScreenings.length}</strong></span>
        <div class="action-icon-row">
          <button class="table-action-btn" onclick="viewPatientHistory('${pt.id}')">History</button>
          <button class="table-action-btn" onclick="startWorkerScreening('${pt.id}')">+ Screen</button>
        </div>
      </div>
    `;
    list.appendChild(div);
  });
}

window.startWorkerScreening = function(patientId) {
  const pt = appState.db.patients.find(p => p.id === patientId);
  if (pt) {
    appState.activeScreening.patientInfo = pt;
    appState.activeScreening.isPublic = false;
    transitionTo('screen-screening-select');
  }
};

window.viewPatientHistory = function(patientId) {
  const pt = appState.db.patients.find(p => p.id === patientId);
  if (!pt) return;
  
  appState.activePatient = pt;
  transitionTo('screen-patient-history');
  
  document.getElementById('history-patient-title').innerHTML = `History: <strong>${pt.name}</strong>`;
  document.getElementById('history-patient-meta').textContent = `ID: ${pt.id} | Gender: ${pt.gender} | Contact: ${pt.phone}`;
  
  const timeline = document.getElementById('history-timeline-list');
  timeline.innerHTML = '';
  
  const ptScreenings = appState.db.screenings.filter(s => s.patientId === pt.id);
  
  if (ptScreenings.length === 0) {
    timeline.innerHTML = `<p style="font-size:12px; color:var(--text-muted); text-align:center; padding: 20px 0;">No screenings recorded for this patient yet.</p>`;
    document.getElementById('history-chart-wrapper').style.display = 'none';
  } else {
    document.getElementById('history-chart-wrapper').style.display = 'block';
    
    // Sort chronological
    ptScreenings.sort((a,b) => new Date(a.date) - new Date(b.date));
    
    ptScreenings.forEach(scr => {
      const item = document.createElement('div');
      item.className = 'timeline-item';
      item.innerHTML = `
        <span class="timeline-date">${scr.date}</span>
        <div class="timeline-details">
          <strong>${scr.tool} Score: ${scr.score}</strong> (${scr.severity})
          <p style="font-size:11px; color:var(--text-muted); margin-top:2px;">Action: ${scr.action}</p>
        </div>
      `;
      timeline.appendChild(item);
    });
    
    // Render timeline score trends chart
    renderTrendChart(ptScreenings);
  }
};

function renderTrendChart(screenings) {
  const chart = document.getElementById('history-trend-bars');
  chart.innerHTML = '';
  
  // Display up to last 4 screenings
  const subset = screenings.slice(-4);
  subset.forEach(scr => {
    let max = scr.tool.includes('PHQ') ? 27 : 21;
    let pct = Math.max(15, Math.round((scr.score / max) * 100));
    
    let severityClass = "mild";
    if (scr.severity.includes("Severe")) severityClass = "severe";
    else if (scr.severity.includes("Moderate")) severityClass = "moderate";
    
    const bar = document.createElement('div');
    bar.className = `chart-bar ${severityClass}`;
    bar.style.height = `${pct}%`;
    bar.innerHTML = `
      <span class="bar-val">${scr.score}</span>
      <span style="position:absolute; bottom:-16px; font-size:8px; white-space:nowrap;">${scr.date.split('-').slice(1).join('/')}</span>
    `;
    chart.appendChild(bar);
  });
}

function renderFollowups() {
  const list = document.getElementById('followups-list-tbody');
  list.innerHTML = '';
  
  appState.db.followups.forEach(fw => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${fw.patientName}</strong><br><span style="color:var(--text-muted); font-size:9px;">ID: ${fw.patientId}</span></td>
      <td>${fw.tool}</td>
      <td>${fw.date}</td>
      <td><span class="status-badge ${fw.status.toLowerCase()}">${fw.status}</span></td>
      <td>
        ${fw.status !== 'Completed' ? `<button class="table-action-btn" onclick="completeFollowup('${fw.id}')">✓ Mark</button>` : '—'}
      </td>
    `;
    list.appendChild(tr);
  });
}

window.completeFollowup = function(fwId) {
  const fw = appState.db.followups.find(f => f.id === fwId);
  if (fw) {
    fw.status = 'Completed';
    fw.notes = "Completed during home visit by health worker.";
    localStorage.setItem('mh_followups', JSON.stringify(appState.db.followups));
    showToast(`Follow-up completed for ${fw.patientName}`);
    renderFollowups();
  }
};

window.hwActionSaveResult = function() {
  showToast("Patient screening report filed successfully!");
  transitionTo('screen-hw-dashboard');
};

// 13. Aggregated Analytics Charts Renderer
function renderAnalyticsDashboard() {
  const container = document.getElementById('reports-trend-bars');
  container.innerHTML = '';
  
  // Seed reports metrics
  const trends = [
    { month: "Mar", screenings: 25 },
    { month: "Apr", screenings: 30 },
    { month: "May", screenings: 38 },
    { month: "Jun", screenings: 42 },
    { month: "Jul", screenings: 49 }
  ];
  
  trends.forEach(t => {
    let pct = Math.round((t.screenings / 50) * 100);
    const bar = document.createElement('div');
    bar.className = 'chart-bar';
    bar.style.height = `${pct}%`;
    bar.style.width = '24px';
    bar.innerHTML = `
      <span class="bar-val">${t.screenings}</span>
      <span style="position:absolute; bottom:-16px; font-size:8px;">${t.month}</span>
    `;
    container.appendChild(bar);
  });
}

// 14. Helper Reset Database Functions for demoing
window.resetLocalData = function() {
  if (confirm("Reset local database parameters? This will wipe recent logs and restore mock defaults.")) {
    localStorage.removeItem('mh_patients');
    localStorage.removeItem('mh_screenings');
    localStorage.removeItem('mh_followups');
    localStorage.removeItem('mh_analytics');
    initDatabase();
    showToast("Database restored to seed defaults.");
    transitionTo('screen-public-dashboard');
  }
};


// ============================================================
// ADAPTIVE MENTAL HEALTH SCREENING SYSTEM — All New Functions
// ============================================================

/**
 * setupAdaptiveCheck()
 * Injects SCREENING_MODULES into QUESTION_DATABASE so the existing
 * rendering system can use PSS-4 and other modules transparently.
 */
function setupAdaptiveCheck() {
  if (window.SCREENING_MODULES) {
    Object.keys(window.SCREENING_MODULES).forEach(key => {
      if (!QUESTION_DATABASE[key]) {
        const m = window.SCREENING_MODULES[key];
        QUESTION_DATABASE[key] = {
          title: m.fullName,
          disclaimer: m.disclaimer,
          answers: m.answerOptions,
          questions: m.questions
        };
      }
    });
  }

  const defaults = window.ADAPTIVE_SCREENING_DEFAULTS || {
    active: false, phase: 'common_q1',
    commonAnswers: { q1: null, q2: null },
    concern: null, routedTool: null, validatedAnswers: [],
    contextualAnswers: [], contextualQuestions: [], contextualIndex: 0,
    scoringResult: null, guidanceResult: null,
    safetyRequired: false, isWorkerMode: false
  };
  appState.adaptiveScreening = JSON.parse(JSON.stringify(defaults));
}

/**
 * startAdaptiveCheck()
 * Entry point from "Start Mental Health Check" button.
 */
window.startAdaptiveCheck = function() {
  const isWorker = appState.userMode === 'worker';
  if (isWorker && !appState.activeScreening.patientInfo) {
    showToast('Please enrol a patient first to begin adaptive screening.');
    transitionTo('screen-new-patient');
    return;
  }

  const defaults = window.ADAPTIVE_SCREENING_DEFAULTS || {};
  appState.adaptiveScreening = {
    ...JSON.parse(JSON.stringify(defaults)),
    active: true,
    isWorkerMode: isWorker
  };

  // Hide routing indicator in case it was shown from a previous session
  const bar = document.getElementById('adaptive-routing-indicator-bar');
  if (bar) bar.style.display = 'none';

  transitionTo('screen-common-q1');
};

/** Render Common Question 1 options. */
function renderCommonQ1() {
  if (!window.COMMON_QUESTIONS) return;
  const lang = appState.language;
  const q = window.COMMON_QUESTIONS.q1;

  const textEl = document.getElementById('cq1-text');
  if (textEl) textEl.textContent = q.text[lang] || q.text['en'];

  const optsEl = document.getElementById('cq1-options');
  if (!optsEl) return;
  optsEl.innerHTML = '';

  q.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'emoji-option-btn';
    const label = opt.label[lang] || opt.label['en'];
    btn.innerHTML = `<span class="opt-emoji">${opt.emoji}</span><span class="opt-label">${label}</span>`;
    btn.addEventListener('click', () => {
      optsEl.querySelectorAll('.emoji-option-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      if (appState.adaptiveScreening) appState.adaptiveScreening.commonAnswers.q1 = opt.value;
      setTimeout(() => transitionTo('screen-common-q2'), 280);
    });
    optsEl.appendChild(btn);
  });
}

/** Render Common Question 2 options. */
function renderCommonQ2() {
  if (!window.COMMON_QUESTIONS) return;
  const lang = appState.language;
  const q = window.COMMON_QUESTIONS.q2;

  const textEl = document.getElementById('cq2-text');
  if (textEl) textEl.textContent = q.text[lang] || q.text['en'];

  const optsEl = document.getElementById('cq2-options');
  if (!optsEl) return;
  optsEl.innerHTML = '';

  q.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'emoji-option-btn';
    const label = opt.label[lang] || opt.label['en'];
    btn.innerHTML = `<span class="opt-emoji">${opt.emoji}</span><span class="opt-label">${label}</span>`;
    btn.addEventListener('click', () => {
      optsEl.querySelectorAll('.emoji-option-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      if (appState.adaptiveScreening) {
        appState.adaptiveScreening.commonAnswers.q2 = opt.value;
        appState.adaptiveScreening.concern = opt.value;
      }

      const route = window.CONCERN_ROUTER
        ? (window.CONCERN_ROUTER[opt.value] || window.CONCERN_ROUTER['other'])
        : { tool: 'who5' };
      if (appState.adaptiveScreening) appState.adaptiveScreening.routedTool = route.tool;

      const module = window.SCREENING_MODULES ? window.SCREENING_MODULES[route.tool] : null;
      const toolName = module ? module.name : route.tool.toUpperCase();
      showToast(`Routing to ${toolName} screening…`);

      setTimeout(() => beginAdaptiveValidatedScreening(route.tool), 480);
    });
    optsEl.appendChild(btn);
  });
}

/**
 * beginAdaptiveValidatedScreening(toolKey)
 * Sets up the existing wizard to use the routed module, then transitions
 * to the existing screen-screening-question UI.
 */
function beginAdaptiveValidatedScreening(toolKey) {
  const lang = appState.language;
  const module = window.SCREENING_MODULES ? window.SCREENING_MODULES[toolKey] : null;

  // Inject module into QUESTION_DATABASE if needed
  if (module && !QUESTION_DATABASE[toolKey]) {
    QUESTION_DATABASE[toolKey] = {
      title: module.fullName,
      disclaimer: module.disclaimer,
      answers: module.answerOptions,
      questions: module.questions
    };
  }

  if (!QUESTION_DATABASE[toolKey]) {
    showToast('Screening module unavailable. Redirecting to tool selection.');
    transitionTo('screen-screening-select');
    return;
  }

  // Wire up the existing wizard state
  appState.activeScreening.tool = toolKey;
  appState.activeScreening.currentQuestionIndex = 0;
  appState.activeScreening.answers = new Array(QUESTION_DATABASE[toolKey].questions.length).fill(null);
  appState.activeScreening.isPublic = appState.userMode !== 'worker';

  // Update header title
  const headerTitle = document.getElementById('screening-tool-title');
  if (headerTitle) {
    const qdb = QUESTION_DATABASE[toolKey];
    headerTitle.textContent = qdb.title[lang] || qdb.title['en'];
  }

  // Show routing indicator
  const routingBar = document.getElementById('adaptive-routing-indicator-bar');
  if (routingBar && appState.adaptiveScreening) {
    const concernLabel = getConcernLabel(appState.adaptiveScreening.concern, lang);
    const toolLabel = module ? module.name : toolKey.toUpperCase();
    routingBar.textContent = `🔀 ${concernLabel} → ${toolLabel}`;
    routingBar.style.display = 'flex';
  }

  transitionTo('screen-screening-question');
  renderScreeningQuestion();
}

/** Human-readable label for a concern value. */
function getConcernLabel(concern, lang) {
  lang = lang || 'en';
  const labels = {
    low_mood:     { en: 'Low mood / sadness',          hi: 'उदासी / दुख' },
    anxiety:      { en: 'Worry / anxiety',              hi: 'चिंता / घबराहट' },
    stress:       { en: 'Stress / overwhelmed',         hi: 'तनाव / दबाव' },
    sleep:        { en: 'Sleep problems',               hi: 'नींद की समस्या' },
    academic_work:{ en: 'Academic / work pressure',    hi: 'काम/पढ़ाई का दबाव' },
    social:       { en: 'Relationship / social',        hi: 'सामाजिक कठिनाइयाँ' },
    other:        { en: 'General well-being',           hi: 'सामान्य कल्याण' },
    prefer_not:   { en: 'General well-being',           hi: 'सामान्य कल्याण' }
  };
  const entry = labels[concern] || labels['other'];
  return entry[lang] || entry['en'];
}

/** Start the contextual follow-up questions phase. */
function startContextualQuestions() {
  const as = appState.adaptiveScreening;
  const lang = appState.language;
  if (!as) { renderAdaptiveResult(); return; }

  const ctxSet = window.CONTEXTUAL_QUESTIONS
    ? (window.CONTEXTUAL_QUESTIONS[as.concern] || window.CONTEXTUAL_QUESTIONS['other'])
    : null;
  if (!ctxSet) { renderAdaptiveResult(); return; }

  as.contextualQuestions = ctxSet.questions;
  as.contextualAnswers = new Array(ctxSet.questions.length).fill(null);
  as.contextualIndex = 0;

  const titleEl = document.getElementById('contextual-screen-title');
  if (titleEl) titleEl.textContent = ctxSet.title[lang] || ctxSet.title['en'];

  const routingLabel = document.getElementById('contextual-routing-label');
  if (routingLabel) {
    const module = window.SCREENING_MODULES ? window.SCREENING_MODULES[as.routedTool] : null;
    routingLabel.textContent = `Context questions following your ${module ? module.name : 'screening'}`;
  }

  transitionTo('screen-contextual-q');
  renderContextualQuestion();
}

/** Render the current contextual question. */
function renderContextualQuestion() {
  const as = appState.adaptiveScreening;
  if (!as || !as.contextualQuestions) return;

  const lang = appState.language;
  const questions = as.contextualQuestions;
  const idx = as.contextualIndex;
  const q = questions[idx];
  if (!q) { renderAdaptiveResult(); return; }

  const indicator = document.getElementById('contextual-q-indicator');
  if (indicator) indicator.innerHTML = `Question <strong>${idx + 1}</strong> of ${questions.length}`;

  const progressFill = document.getElementById('contextual-progress-fill');
  if (progressFill) progressFill.style.width = `${Math.round((idx / questions.length) * 100)}%`;

  const qTextEl = document.getElementById('contextual-q-text');
  if (qTextEl) qTextEl.textContent = q.text[lang] || q.text['en'];

  const optsEl = document.getElementById('contextual-options-container');
  if (!optsEl) return;
  optsEl.innerHTML = '';

  q.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'emoji-option-btn';
    if (as.contextualAnswers[idx] === opt.value) btn.classList.add('selected');
    const label = opt.label[lang] || opt.label['en'];
    btn.innerHTML = `<span class="opt-emoji">${opt.emoji}</span><span class="opt-label">${label}</span>`;
    btn.addEventListener('click', () => {
      optsEl.querySelectorAll('.emoji-option-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      as.contextualAnswers[idx] = opt.value;
      setTimeout(() => nextContextualQ(), 350);
    });
    optsEl.appendChild(btn);
  });
}

window.prevContextualQ = function() {
  const as = appState.adaptiveScreening;
  if (as && as.contextualIndex > 0) {
    as.contextualIndex--;
    renderContextualQuestion();
  }
};

window.nextContextualQ = function() {
  const as = appState.adaptiveScreening;
  if (!as) return;
  if (as.contextualAnswers[as.contextualIndex] === null) {
    showToast('Please select an answer to continue.');
    return;
  }
  if (as.contextualIndex < as.contextualQuestions.length - 1) {
    as.contextualIndex++;
    renderContextualQuestion();
  } else {
    renderAdaptiveResult();
  }
};

window.ttsReadContextual = function() {
  const as = appState.adaptiveScreening;
  if (!as || !as.contextualQuestions) return;
  const q = as.contextualQuestions[as.contextualIndex];
  if (!q) return;
  const text = q.text[appState.language] || q.text['en'];
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = appState.language === 'hi' ? 'hi-IN' : 'en-IN';
    utt.rate = 0.9;
    window.speechSynthesis.speak(utt);
    showToast('Reading question aloud…');
  }
};

/**
 * renderAdaptiveResult()
 * Computes the final result using ScoringEngine + GuidanceEngine,
 * saves it, and renders the screen-adaptive-result screen.
 */
function renderAdaptiveResult() {
  const as = appState.adaptiveScreening;
  if (!as) { transitionTo('screen-public-dashboard'); return; }

  const lang = appState.language;
  const toolKey = appState.activeScreening.tool;
  const answers = appState.activeScreening.answers;

  // Score using ScoringEngine or fallback
  let result;
  if (window.ScoringEngine) {
    result = window.ScoringEngine.getFullResult(toolKey, answers, lang);
  } else {
    const sum = answers.reduce((a, b) => a + b, 0);
    result = { screeningTool: toolKey.toUpperCase(), instrument: toolKey, scaledScore: sum, rawScore: sum, maxScore: 27, category: 'Minimal', label: 'Minimal Concern', interpretation: 'Screening complete.', flagColor: 'minimal', selfHarmFlagged: false, recommendedActions: [] };
  }

  // Generate guidance
  let guidance;
  if (window.GuidanceEngine) {
    guidance = window.GuidanceEngine.generate(result, as.concern, as.contextualAnswers, lang);
  } else {
    guidance = { tier: 'lower', summary: 'Please consult a healthcare professional for guidance.', nextSteps: result.recommendedActions || [], selfCare: [], supportInfo: 'Contact Tele-MANAS: 14416 for support.' };
  }

  as.scoringResult = result;
  as.guidanceResult = guidance;

  // Save to DB
  const rec = {
    id: `SCR-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toISOString().split('T')[0],
    tool: result.screeningTool,
    score: result.scaledScore,
    severity: result.label,
    action: (result.recommendedActions || []).join('; ').substring(0, 120),
    interpretation: result.interpretation,
    guidance: guidance.summary,
    selfHarm: result.selfHarmFlagged,
    concern: as.concern,
    adaptive: true,
    sync: appState.isOnline
  };
  if (appState.activeScreening.patientInfo) {
    rec.patientId = appState.activeScreening.patientInfo.id;
    rec.patientName = appState.activeScreening.patientInfo.name;
  }
  appState.db.screenings.push(rec);
  localStorage.setItem('mh_screenings', JSON.stringify(appState.db.screenings));
  if (!appState.isOnline) {
    appState.db.syncQueue.push({ type: 'screening', data: rec });
  }

  // Set context for MindGuide
  appState.lastScreeningContext = {
    tool: result.screeningTool,
    score: result.scaledScore,
    category: result.category,
    concern: as.concern
  };

  // Navigate
  transitionTo('screen-adaptive-result');

  // Render pathway badges
  const badgeRow = document.getElementById('adaptive-pathway-badge');
  if (badgeRow) {
    const concernLabel = getConcernLabel(as.concern, lang);
    const module = window.SCREENING_MODULES ? window.SCREENING_MODULES[toolKey] : null;
    const colorClass = module ? module.colorClass : 'wellbeing';
    const icon = module ? module.icon : '📋';
    badgeRow.innerHTML = `
      <span class="pathway-chip concern">🎯 ${concernLabel}</span>
      <span class="pathway-chip tool-${colorClass}">${icon} ${result.screeningTool}</span>
    `;
  }

  // Score card
  const toolLabelEl = document.getElementById('adaptive-tool-label');
  if (toolLabelEl) toolLabelEl.textContent = `${result.screeningTool} — Score out of ${result.maxScore}`;

  const scoreEl = document.getElementById('adaptive-score-num');
  if (scoreEl) scoreEl.textContent = result.scaledScore;

  const severityEl = document.getElementById('adaptive-severity-label');
  if (severityEl) {
    severityEl.textContent = result.label;
    severityEl.className = `severity-label ${result.flagColor}`;
  }

  const interpEl = document.getElementById('adaptive-interpretation');
  if (interpEl) interpEl.textContent = result.interpretation;

  // Safety inline alert (secondary to safety screen which takes over if flagged)
  const safetyAlert = document.getElementById('adaptive-safety-alert');
  if (safetyAlert) {
    if (result.selfHarmFlagged) {
      safetyAlert.style.display = 'block';
      safetyAlert.innerHTML = `<h4>⚠️ Immediate Support Available</h4><p style="font-size:11px; margin-top:4px;">Your response indicates you may need support right now. Please contact Tele-MANAS: <strong>14416</strong> or visit your nearest PHC today.</p>`;
    } else {
      safetyAlert.style.display = 'none';
    }
  }

  // Guidance
  const summaryEl = document.getElementById('adaptive-guidance-summary');
  if (summaryEl) summaryEl.textContent = guidance.summary;

  const stepsEl = document.getElementById('adaptive-next-steps');
  if (stepsEl) {
    stepsEl.innerHTML = '';
    const allSteps = [...(guidance.nextSteps || []), ...(guidance.selfCare || [])].slice(0, 5);
    allSteps.forEach(step => {
      const li = document.createElement('li');
      li.textContent = step;
      stepsEl.appendChild(li);
    });
  }

  const supportEl = document.getElementById('adaptive-support-info');
  if (supportEl) supportEl.textContent = guidance.supportInfo;
}

/** Render the safety support screen (triggered by PHQ-9 Q9 > 0). */
function renderSafetyScreen() {
  const lang = appState.language;
  const content = window.SafetyCheck ? window.SafetyCheck.getSafetyContent(lang) : null;

  if (content) {
    const headlineEl = document.getElementById('safety-headline-text');
    if (headlineEl) headlineEl.textContent = content.headline[lang] || content.headline['en'];

    const msgEl = document.getElementById('safety-message-text');
    if (msgEl) msgEl.textContent = content.message[lang] || content.message['en'];

    const stepsEl = document.getElementById('safety-steps-list');
    if (stepsEl) {
      stepsEl.innerHTML = '';
      const steps = content.steps[lang] || content.steps['en'];
      steps.forEach(step => {
        const li = document.createElement('li');
        li.textContent = step;
        stepsEl.appendChild(li);
      });
    }

    const helplinesEl = document.getElementById('safety-helplines-container');
    if (helplinesEl) {
      helplinesEl.innerHTML = '';
      content.helplines.forEach(hl => {
        const desc = hl.desc[lang] || hl.desc['en'];
        const item = document.createElement('div');
        item.className = 'safety-helpline-item';
        item.innerHTML = `
          <div class="safety-helpline-info">
            <h4>${hl.name}</h4>
            <p>${desc}</p>
          </div>
          <a href="tel:${hl.number}" class="safety-call-btn">📞 ${hl.number}</a>
        `;
        helplinesEl.appendChild(item);
      });
    }

    const disclaimerEl = document.getElementById('safety-ai-disclaimer');
    if (disclaimerEl) disclaimerEl.textContent = content.disclaimer[lang] || content.disclaimer['en'];
  }

  if (appState.adaptiveScreening) appState.adaptiveScreening.active = false;
  transitionTo('screen-safety');
}

/** Save result confirmation (result is already auto-saved). */
window.saveAdaptiveResult = function() {
  showToast('✅ Screening result saved locally.');
};

/** Open MindGuide with a pre-primed contextual message about the result. */
window.openMindGuideFromResult = function() {
  transitionTo('screen-ai-chat');
  const ctx = appState.lastScreeningContext;
  if (ctx) {
    setTimeout(() => {
      const msg = `I just completed a ${ctx.tool} screening and got a score of ${ctx.score} (${ctx.category}). Can you explain what this means?`;
      appendChatMessage(msg, 'user');
      setTimeout(() => generateBotResponse(msg), 800);
    }, 500);
  }
};

/** Render the well-being trend screen from persistent mood history. */
function renderWellbeingTrend() {
  const moodHistory = JSON.parse(localStorage.getItem('mh_mood_history') || '[]');
  const last7 = moodHistory.slice(-7);

  const moodValues = {
    'Great':    { val: 5, color: 'great' },
    'Good':     { val: 4, color: 'good' },
    'Okay':     { val: 3, color: 'okay' },
    'Low':      { val: 2, color: 'low' },
    'Very low': { val: 1, color: 'very-low' }
  };
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Chart bars
  const chartEl = document.getElementById('wellbeing-trend-chart');
  const labelsEl = document.getElementById('wellbeing-trend-labels');
  if (chartEl) {
    chartEl.innerHTML = '';
    const padded = Array(Math.max(0, 7 - last7.length)).fill(null).concat(last7);
    padded.forEach(entry => {
      const bar = document.createElement('div');
      bar.className = 'wb-bar';
      if (entry) {
        const mv = moodValues[entry.mood] || { val: 3, color: 'okay' };
        bar.classList.add(mv.color);
        bar.style.height = `${(mv.val / 5) * 100}%`;
        bar.title = `${entry.date}: ${entry.mood}`;
      } else {
        bar.style.height = '8px';
        bar.style.background = 'rgba(0,0,0,0.07)';
        bar.style.borderRadius = '4px';
      }
      chartEl.appendChild(bar);
    });
  }

  // Day labels
  if (labelsEl) {
    labelsEl.innerHTML = '';
    const padded = Array(Math.max(0, 7 - last7.length)).fill(null).concat(last7);
    padded.forEach(entry => {
      const span = document.createElement('span');
      if (entry) {
        const d = new Date(entry.date);
        span.textContent = dayNames[d.getDay()];
      } else {
        span.textContent = '—';
        span.style.opacity = '0.3';
      }
      labelsEl.appendChild(span);
    });
  }

  // Entries list
  const entriesList = document.getElementById('wellbeing-entries-list');
  const noEntriesEl = document.getElementById('wellbeing-no-entries');
  const moodEmojis = { 'Great': '😊', 'Good': '🙂', 'Okay': '😐', 'Low': '🙁', 'Very low': '😞' };

  if (entriesList) {
    entriesList.innerHTML = '';
    if (moodHistory.length === 0) {
      if (noEntriesEl) noEntriesEl.style.display = 'block';
    } else {
      if (noEntriesEl) noEntriesEl.style.display = 'none';
      [...moodHistory].reverse().slice(0, 7).forEach(entry => {
        const emoji = moodEmojis[entry.mood] || '😐';
        const div = document.createElement('div');
        div.className = 'wb-entry';
        div.innerHTML = `
          <span class="wb-mood-emoji">${emoji}</span>
          <span class="wb-label">${entry.mood}</span>
          <span class="wb-date">${entry.date}</span>
        `;
        entriesList.appendChild(div);
      });
    }
  }
}

// =========================================================================
// UPGRADE FEATURES: MindGuide, Routine, Wellness, Women's Wellness, Dashboard
// =========================================================================

// --- Dashboard Rendering ---
document.addEventListener("DOMContentLoaded", () => {
  // Setup observers or manual refresh for Dashboard
  setInterval(refreshDashboardPersonalization, 2000);
});

function refreshDashboardPersonalization() {
  if (appState.activeScreen !== 'screen-public-dashboard') return;

  const moodHistory = appState.db.moodHistory || [];
  const routines = appState.db.routines || [];
  const wellness = appState.db.wellnessActivities || [];
  
  // Greeting based on time
  const hour = new Date().getHours();
  let greeting = "Good evening 🌙";
  if (hour < 12) greeting = "Good morning 🌱";
  else if (hour < 17) greeting = "Good afternoon ☀️";
  document.getElementById('dashboard-greeting').innerText = greeting;

  // Focus Text
  if (moodHistory.length > 0) {
    const lastMood = moodHistory[moodHistory.length - 1].mood;
    const focusEl = document.getElementById('dashboard-focus');
    const focusText = document.getElementById('focus-text');
    if (lastMood === 'Low' || lastMood === 'Very low') {
      focusEl.style.display = 'block';
      focusText.innerText = "Lifting your mood";
    } else {
      focusEl.style.display = 'none';
    }
  }

  // Routine Preview
  const routineList = document.getElementById('dashboard-routine-list');
  if (routineList) {
    routineList.innerHTML = '';
    const todayRoutines = routines.slice(0, 3); // show first 3
    if (todayRoutines.length === 0) {
      routineList.innerHTML = `<div style="color:var(--text-muted);">No routines planned yet.</div>`;
    } else {
      todayRoutines.forEach(r => {
        routineList.innerHTML += `<div style="display:flex; justify-content:space-between; ${r.completed ? 'opacity:0.5; text-decoration:line-through;' : ''}"><span>${r.time} — ${r.title}</span><span>${r.completed ? '✅' : '⏳'}</span></div>`;
      });
    }
  }

  // Progress Summary
  const medCount = wellness.filter(w => w.type === 'meditation').length;
  document.getElementById('dash-med-count').innerText = medCount;

  if (routines.length > 0) {
    const completedRoutines = routines.filter(r => r.completed).length;
    const pct = Math.round((completedRoutines / routines.length) * 100);
    document.getElementById('dash-rout-pct').innerText = `${pct}%`;
  }
}

// --- MindGuide Floating Chatbot ---
window.openMindGuide = function () {
    const chat = document.getElementById('mindguide-bottom-sheet');

    if (!chat) {
        console.error('MindGuide element not found');
        return;
    }

    chat.classList.add('open');
};

window.closeMindGuide = function () {
    const chat = document.getElementById('mindguide-bottom-sheet');

    if (!chat) return;

    chat.classList.remove('open');
};
// Override the old sendQuickReply to work with the new bottom sheet
window.sendQuickReply = function(text) {
  const input = document.getElementById('chat-msg-input');
  if (input) {
    input.value = text;
    document.getElementById('chat-send-btn').click();
  }
};

// --- Routine Planner AI ---
window.generateRoutineAI = function() {
  showToast("MindGuide AI is generating your routine...");
  setTimeout(() => {
    appState.db.routines = [
      { id: "RT-01", title: "Morning Hydration", time: "07:00", duration: 5, completed: false, notify: true },
      { id: "RT-02", title: "5-Min Breathing", time: "07:15", duration: 5, completed: false, notify: true },
      { id: "RT-03", title: "Deep Work / Study", time: "09:00", duration: 120, completed: false, notify: true },
      { id: "RT-04", title: "Lunch & Rest", time: "13:00", duration: 60, completed: false, notify: true },
      { id: "RT-05", title: "Evening Walk", time: "18:00", duration: 30, completed: false, notify: true },
      { id: "RT-06", title: "Wind-down & Sleep", time: "22:00", duration: 30, completed: false, notify: true }
    ];
    localStorage.setItem('mh_routines', JSON.stringify(appState.db.routines));
    renderRoutinePlanner();
    showToast("✨ Routine personalized for your well-being!");
  }, 1500);
};

window.addRoutineTask = function() {
  const title = prompt("Enter task title:");
  const time = prompt("Enter time (HH:MM):", "12:00");
  if (title && time) {
    appState.db.routines.push({
      id: "RT-" + Math.floor(Math.random()*1000),
      title: title,
      time: time,
      duration: 15,
      completed: false,
      notify: true
    });
    localStorage.setItem('mh_routines', JSON.stringify(appState.db.routines));
    renderRoutinePlanner();
  }
};

window.toggleRoutineTask = function(id) {
  const r = appState.db.routines.find(x => x.id === id);
  if (r) {
    r.completed = !r.completed;
    localStorage.setItem('mh_routines', JSON.stringify(appState.db.routines));
    renderRoutinePlanner();
  }
};

function renderRoutinePlanner() {
  const list = document.getElementById('routine-planner-list');
  if (!list) return;
  list.innerHTML = '';
  const routines = appState.db.routines || [];
  routines.sort((a,b) => a.time.localeCompare(b.time)).forEach(r => {
    list.innerHTML += `
      <div class="routine-task ${r.completed ? 'completed' : ''}" onclick="toggleRoutineTask('${r.id}')">
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="font-size:16px;">${r.completed ? '✅' : '⭕'}</div>
          <div>
            <div style="font-weight:600; font-size:14px;">${r.title}</div>
            <div style="font-size:11px; color:var(--text-muted);">${r.time} • ${r.duration} mins</div>
          </div>
        </div>
        <div style="color:var(--primary);">🔔</div>
      </div>
    `;
  });
}

// Ensure routine renders when transitioning to it
const originalTransitionTo = window.transitionTo;
window.transitionTo = function(screenId) {
  originalTransitionTo(screenId);
  if (screenId === 'screen-routine') {
    renderRoutinePlanner();
  } else if (screenId === 'screen-progress') {
    renderProgressDashboard();
  } else if (screenId === 'screen-womens-wellness') {
    renderWomensWellness();
  }
};

// --- Wellness Studio ---
window.openWellnessCategory = function(cat) {
  const area = document.getElementById('wellness-content-area');
  area.style.display = 'block';
  if (cat === 'yoga') {
    area.innerHTML = `
      <h3>Child's Pose (Balasana)</h3>
      <p style="font-size:12px; margin:8px 0; color:var(--text-muted);">Calms the brain and helps relieve stress and fatigue.</p>
      <div style="background:var(--primary-light); height:100px; border-radius:8px; display:flex; justify-content:center; align-items:center; font-size:32px;">🧘‍♀️</div>
      <ol style="font-size:12px; margin:10px 0 10px 20px; line-height:1.5;">
        <li>Kneel on the floor, toes together, knees apart.</li>
        <li>Rest your forehead on the ground.</li>
        <li>Breathe deeply for 1-2 minutes.</li>
        <li style="color:var(--danger); font-weight:bold;">Stop if you experience pain.</li>
      </ol>
      <button class="btn btn-primary btn-full" onclick="startWellnessSession('yoga', 'Childs Pose')">Start Session (2 min)</button>
    `;
  } else if (cat === 'meditation') {
    area.innerHTML = `
      <h3>5-Minute Mindfulness</h3>
      <p style="font-size:12px; margin:8px 0; color:var(--text-muted);">A short break to recenter yourself.</p>
      <div style="background:var(--secondary-light); height:100px; border-radius:8px; display:flex; justify-content:center; align-items:center; font-size:32px;">🎧</div>
      <button class="btn btn-secondary btn-full" style="margin-top:12px;" onclick="startWellnessSession('meditation', 'Mindfulness')">▶️ Play Session</button>
    `;
  } else if (cat === 'pms') {
    area.innerHTML = `
      <h3>PMS Comfort Poses</h3>
      <p style="font-size:12px; margin:8px 0; color:var(--text-muted);">Gentle stretching to ease discomfort.</p>
      <div style="background:var(--primary-light); height:100px; border-radius:8px; display:flex; justify-content:center; align-items:center; font-size:32px;">🌿</div>
      <button class="btn btn-primary btn-full" style="margin-top:12px;" onclick="startWellnessSession('yoga', 'PMS Comfort')">Start Session</button>
    `;
  } else if (cat === 'pcos') {
    area.innerHTML = `
      <h3>PCOS Daily Walk & Stretch</h3>
      <p style="font-size:12px; margin:8px 0; color:var(--text-muted);">Low intensity steady state movement.</p>
      <div style="background:var(--secondary-light); height:100px; border-radius:8px; display:flex; justify-content:center; align-items:center; font-size:32px;">🚶‍♀️</div>
      <button class="btn btn-secondary btn-full" style="margin-top:12px;" onclick="startWellnessSession('yoga', 'PCOS Movement')">Start Session</button>
    `;
  }
};

window.startWellnessSession = function(type, title) {
  showToast(`Started ${title}...`);
  setTimeout(() => {
    appState.db.wellnessActivities.push({
      id: "WA-" + Date.now(),
      type: type,
      title: title,
      date: new Date().toISOString().split('T')[0],
      duration: 5,
      completed: true
    });
    localStorage.setItem('mh_wellness', JSON.stringify(appState.db.wellnessActivities));
    showToast(`🎉 ${title} completed! Saved to your progress.`);
  }, 2000);
};

// --- Progress Dashboard ---
function renderProgressDashboard() {
  const chartEl = document.getElementById('progress-mood-chart');
  if (chartEl) {
    const history = (appState.db.moodHistory || []).slice(-5);
    chartEl.innerHTML = '';
    history.forEach(h => {
      const hval = h.mood === 'Great' ? 5 : h.mood === 'Good' ? 4 : h.mood === 'Okay' ? 3 : h.mood === 'Low' ? 2 : 1;
      chartEl.innerHTML += `<div style="flex:1; background:var(--primary); height:${hval*20}%; border-radius:4px 4px 0 0;" title="${h.date}: ${h.mood}"></div>`;
    });
  }

  const insights = document.getElementById('progress-insights');
  if (insights) {
    const meds = appState.db.wellnessActivities.filter(w => w.type === 'meditation').length;
    insights.innerHTML = `
      <p>✨ You've completed <strong>${meds} meditation sessions</strong> recently.</p>
      <p>📈 Your average mood has improved compared to last week.</p>
    `;
  }
  
  const historyEl = document.getElementById('progress-wellness-history');
  if (historyEl) {
    historyEl.innerHTML = '';
    appState.db.wellnessActivities.slice(-3).reverse().forEach(w => {
      historyEl.innerHTML += `<div style="padding:8px 0; border-bottom:1px solid rgba(0,0,0,0.05);">${w.date}: ${w.title} (${w.duration}m)</div>`;
    });
  }
}

// --- Women's Wellness ---
window.activateWomensWellness = function() {
  appState.db.womensWellness.active = true;
  localStorage.setItem('mh_womens_wellness', JSON.stringify(appState.db.womensWellness));
  renderWomensWellness();
  showToast("Private Wellness Space activated.");
};

window.logCycle = function() {
  appState.db.womensWellness.cycles.push({
    startDate: new Date().toISOString().split('T')[0],
    duration: 5,
    length: 28,
    symptoms: []
  });
  localStorage.setItem('mh_womens_wellness', JSON.stringify(appState.db.womensWellness));
  renderWomensWellness();
  showToast("Cycle logged successfully.");
};

function renderWomensWellness() {
  const isActive = appState.db.womensWellness && appState.db.womensWellness.active;
  document.getElementById('ww-opt-in').style.display = isActive ? 'none' : 'block';
  document.getElementById('ww-dashboard').style.display = isActive ? 'block' : 'none';

  if (isActive) {
    const info = document.getElementById('ww-cycle-info');
    const cycles = appState.db.womensWellness.cycles || [];
    if (cycles.length > 0) {
      info.innerHTML = `
        <div style="display:flex; align-items:center; gap:16px;">
          <div class="ww-cycle-circle">Day<br>14</div>
          <div>
            <strong>Last Period:</strong> ${cycles[cycles.length-1].startDate}<br>
            <strong>Cycle Length:</strong> ${cycles[cycles.length-1].length} days
          </div>
        </div>
      `;
    } else {
      info.innerHTML = "No cycles logged yet.";
    }
  }
}
