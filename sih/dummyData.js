// Mock data for Mental Health Screening and Guidance Application
// Representative of Indian Public Health Frontline Workers (ASHA/ANM)

const INITIAL_PATIENTS = [
  { id: "PT-8291", name: "Ramesh Kumar", ageGroup: "36-45", gender: "Male", language: "Hindi", consent: true, phone: "9876543210" },
  { id: "PT-1042", name: "Amina Bibi", ageGroup: "56-65", gender: "Female", language: "Bengali", consent: true, phone: "8765432109" },
  { id: "PT-3921", name: "Siddharth Rao", ageGroup: "18-25", gender: "Male", language: "Telugu", consent: true, phone: "7654321098" },
  { id: "PT-7712", name: "Priya Pillai", ageGroup: "26-35", gender: "Female", language: "Tamil", consent: true, phone: "6543210987" },
  { id: "PT-5489", name: "Gurbaksh Singh", ageGroup: "65+", gender: "Male", language: "Punjabi", consent: true, phone: "9012345678" }
];

const INITIAL_SCREENINGS = [
  { id: "SCR-001", patientId: "PT-8291", patientName: "Ramesh Kumar", tool: "PHQ-9", date: "2026-08-01", score: 8, severity: "Mild Concern", action: "Provide basic psychoeducation & Routine Follow-up", sync: true },
  { id: "SCR-002", patientId: "PT-1042", patientName: "Amina Bibi", tool: "PHQ-9", date: "2026-08-03", score: 14, severity: "Moderate Concern", action: "Referral to PHC Medical Officer & Follow-up in 2 weeks", sync: true },
  { id: "SCR-003", patientId: "PT-3921", patientName: "Siddharth Rao", tool: "GAD-7", date: "2026-08-05", score: 5, severity: "Mild Concern", action: "Provide basic psychoeducation & Self-care suggestions", sync: true },
  { id: "SCR-004", patientId: "PT-7712", patientName: "Priya Pillai", tool: "PHQ-9", date: "2026-08-07", score: 19, severity: "Severe Concern", action: "Priority Referral to Psychiatrist/Specialist & Immediate Support", sync: true },
  { id: "SCR-005", patientId: "PT-5489", patientName: "Gurbaksh Singh", tool: "GAD-7", date: "2026-08-10", score: 11, severity: "Moderate Concern", action: "Referral to PHC Medical Officer & Follow-up in 2 weeks", sync: true },
  { id: "SCR-006", patientId: "PT-8291", patientName: "Ramesh Kumar", tool: "GAD-7", date: "2026-08-11", score: 4, severity: "Minimal Concern", action: "Provide routine self-care guidance", sync: true }
];

const INITIAL_FOLLOW_UPS = [
  { id: "FW-001", patientId: "PT-8291", patientName: "Ramesh Kumar", tool: "GAD-7", date: "2026-08-15", status: "Due", notes: "Check anxiety levels after mindfulness exercises", sync: true },
  { id: "FW-002", patientId: "PT-1042", patientName: "Amina Bibi", tool: "PHQ-9", date: "2026-08-10", status: "Completed", notes: "Patient referred to PHC Doctor. Undergoing guidance.", sync: true },
  { id: "FW-003", patientId: "PT-3921", patientName: "Siddharth Rao", tool: "GAD-7", date: "2026-08-20", status: "Due", notes: "Review self-care plans and breathing exercises progress.", sync: true },
  { id: "FW-004", patientId: "PT-7712", patientName: "Priya Pillai", tool: "PHQ-9", date: "2026-08-14", status: "Due", notes: "Urgent follow-up on specialist referral appointment.", sync: true },
  { id: "FW-005", patientId: "PT-5489", patientName: "Gurbaksh Singh", tool: "GAD-7", date: "2026-08-09", status: "Overdue", notes: "Follow-up due for medication compliance check at PHC.", sync: true }
];

const ANALYTICS_METRICS = {
  totalScreenings: 184,
  completionRate: 94.2,
  pendingFollowups: 8,
  referralsMade: 27,
  severityDistribution: {
    minimal: 42,
    mild: 78,
    moderate: 48,
    severe: 16
  },
  trends: [
    { month: "Mar", screenings: 25 },
    { month: "Apr", screenings: 30 },
    { month: "May", screenings: 38 },
    { month: "Jun", screenings: 42 },
    { month: "Jul", screenings: 49 }
  ],
  ageGroupDistribution: {
    "18-25": 45,
    "26-35": 62,
    "36-45": 40,
    "46-55": 22,
    "56-65": 11,
    "65+": 4
  }
};

const WELLNESS_ACTIVITIES = [
  { id: "WA-01", type: "meditation", title: "5-Minute Breathing", date: "2026-08-14", duration: 5, completed: true },
  { id: "WA-02", type: "yoga", title: "Morning Stretch", date: "2026-08-15", duration: 15, completed: true },
  { id: "WA-03", type: "meditation", title: "Sleep Relaxation", date: "2026-08-15", duration: 10, completed: true }
];

const ROUTINES = [
  { id: "RT-01", title: "Hydration", time: "08:00", duration: 5, completed: true, notify: true },
  { id: "RT-02", title: "Study Session", time: "10:00", duration: 120, completed: true, notify: true },
  { id: "RT-03", title: "Meditation Break", time: "14:00", duration: 10, completed: false, notify: true },
  { id: "RT-04", title: "Evening Walk", time: "18:00", duration: 30, completed: false, notify: true },
  { id: "RT-05", title: "Wind-down", time: "22:00", duration: 15, completed: false, notify: true }
];

const WOMENS_WELLNESS = {
  active: false,
  cycles: [
    { startDate: "2026-07-20", duration: 5, length: 28, symptoms: ["cramps", "fatigue"] }
  ]
};

const MOOD_HISTORY = [
  { date: "2026-08-10", mood: "Okay", timestamp: "2026-08-10T10:00:00.000Z" },
  { date: "2026-08-11", mood: "Good", timestamp: "2026-08-11T09:30:00.000Z" },
  { date: "2026-08-12", mood: "Great", timestamp: "2026-08-12T08:15:00.000Z" },
  { date: "2026-08-13", mood: "Okay", timestamp: "2026-08-13T11:20:00.000Z" },
  { date: "2026-08-14", mood: "Low", timestamp: "2026-08-14T10:45:00.000Z" },
  { date: "2026-08-15", mood: "Good", timestamp: "2026-08-15T09:10:00.000Z" }
];

// Export to window object for access inside the web SPA
window.DUMMY_DATABASE = {
  patients: INITIAL_PATIENTS,
  screenings: INITIAL_SCREENINGS,
  followups: INITIAL_FOLLOW_UPS,
  analytics: ANALYTICS_METRICS,
  wellnessActivities: WELLNESS_ACTIVITIES,
  routines: ROUTINES,
  womensWellness: WOMENS_WELLNESS,
  moodHistory: MOOD_HISTORY
};
