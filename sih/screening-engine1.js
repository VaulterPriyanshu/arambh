/**
 * Adaptive Mental Health Screening Engine
 * Arambh — SIH Prototype
 * 
 * ARCHITECTURE:
 *   COMMON_QUESTIONS → CONCERN_ROUTER → SCREENING_MODULES → ScoringEngine → GuidanceEngine
 *
 * CLINICAL NOTE:
 *   - PHQ-9 © Pfizer Inc. — Free to use, validated for clinical research
 *   - GAD-7 © Pfizer Inc. — Free to use, validated for clinical research
 *   - PSS-4 © Sheldon Cohen — Public domain, widely used research tool
 *   - WHO-5 © WHO Regional Office for Europe — Free to reproduce with attribution
 *   - No question wording has been modified from validated versions.
 *   - This engine does NOT provide clinical diagnoses.
 */

// ============================================================
// 1. COMMON QUESTIONS (Shown to EVERY user before routing)
// ============================================================
const COMMON_QUESTIONS = {
    q1: {
        id: 'cq1',
        text: {
            en: 'How have you been feeling recently?',
            hi: 'हाल ही में आप कैसा महसूस कर रहे हैं?',
            bn: 'সম্প্রতি আপনি কেমন অনুভব করছেন?',
            mr: 'अलीकडे तुम्ही कसे वाटत आहात?',
            te: 'ఇటీవల మీరు ఎలా అనుభవిస్తున్నారు?',
            ta: 'சமீபத்தில் நீங்கள் எப்படி உணர்கிறீர்கள்?',
            gu: 'તાજેતરમાં તમે કેવું અનુભવો છો?',
            kn: 'ಇತ್ತೀಚೆಗೆ ನೀವು ಹೇಗೆ ಅನುಭವಿಸುತ್ತಿದ್ದೀರಿ?',
            ml: 'അടുത്തിടെ നിങ്ങൾ എങ്ങനെ അനുഭവപ്പെടുന്നു?',
            pa: 'ਹਾਲ ਹੀ ਵਿੱਚ ਤੁਸੀਂ ਕਿਵੇਂ ਮਹਿਸੂਸ ਕਰ ਰਹੇ ਹੋ?'
        },
        options: [
            { emoji: '😊', label: { en: 'Mostly good', hi: 'ज़्यादातर अच्छा' }, value: 'mostly_good' },
            { emoji: '🙂', label: { en: 'Okay / mixed', hi: 'ठीक / मिलाजुला' }, value: 'okay_mixed' },
            { emoji: '🙁', label: { en: 'Not very good', hi: 'बहुत अच्छा नहीं' }, value: 'not_good' },
            { emoji: '😞', label: { en: 'Very difficult lately', hi: 'हाल ही में बहुत कठिन' }, value: 'very_difficult' }
        ]
    },
    q2: {
        id: 'cq2',
        text: {
            en: 'What has been troubling you the most?',
            hi: 'आपको सबसे अधिक क्या परेशान कर रहा है?',
            bn: 'আপনাকে সবচেয়ে বেশি কী কষ্ট দিচ্ছে?',
            mr: 'तुम्हाला सर्वात जास्त कशाचा त्रास आहे?',
            te: 'మీకు అత్యంత ఇబ్బంది కలిగిస్తున్నది ఏమిటి?',
            ta: 'உங்களை அதிகமாக தொந்தரவு செய்வது என்ன?',
            gu: 'તમને સૌથી વધુ શું તકલીફ આપી રહ્યું છે?',
            kn: 'ನಿಮ್ಮನ್ನು ಅತ್ಯಂತ ತೊಂದರೆಗೊಳಿಸುತ್ತಿರುವುದು ಏನು?',
            ml: 'നിങ്ങളെ ഏറ്റവും കൂടുതൽ ബുദ്ധിമുട്ടിക്കുന്നത് എന്താണ്?',
            pa: 'ਤੁਹਾਨੂੰ ਸਭ ਤੋਂ ਵੱਧ ਕੀ ਪਰੇਸ਼ਾਨ ਕਰ ਰਿਹਾ ਹੈ?'
        },
        options: [
            { emoji: '😔', label: { en: 'Low mood / sadness', hi: 'उदासी / दुख' }, value: 'low_mood', routeTo: 'phq9' },
            { emoji: '😰', label: { en: 'Worry / anxiety', hi: 'चिंता / घबराहट' }, value: 'anxiety', routeTo: 'gad7' },
            { emoji: '😫', label: { en: 'Stress / feeling overwhelmed', hi: 'तनाव / दबाव में होना' }, value: 'stress', routeTo: 'pss4' },
            { emoji: '😴', label: { en: 'Sleep problems', hi: 'नींद की समस्या' }, value: 'sleep', routeTo: 'who5' },
            { emoji: '🎓', label: { en: 'College / school / work pressure', hi: 'कॉलेज / स्कूल / काम का दबाव' }, value: 'academic_work', routeTo: 'pss4' },
            { emoji: '👥', label: { en: 'Relationship / social difficulties', hi: 'रिश्ते / सामाजिक कठिनाइयाँ' }, value: 'social', routeTo: 'who5' },
            { emoji: '💭', label: { en: 'Something else', hi: 'कुछ और' }, value: 'other', routeTo: 'who5' },
            { emoji: '🤐', label: { en: 'Prefer not to say', hi: 'बताना नहीं चाहता' }, value: 'prefer_not', routeTo: 'who5' }
        ]
    }
};

// ============================================================
// 2. VALIDATED SCREENING MODULES
// ============================================================
const SCREENING_MODULES = {
    // PHQ-9: Patient Health Questionnaire — Depression
    // © Pfizer Inc. Reproduced with permission. Free to use.
    phq9: {
        id: 'phq9',
        name: 'PHQ-9',
        fullName: { en: 'PHQ-9 Depression Screening', hi: 'PHQ-9 अवसाद स्क्रीनिंग' },
        instrument: 'Patient Health Questionnaire-9',
        concern: 'low_mood',
        icon: '🌱',
        colorClass: 'depression',
        disclaimer: {
            en: 'Validated 9-item tool measuring depressive symptom severity. Scores do not constitute a clinical diagnosis.',
            hi: 'अवसाद के लक्षणों की गंभीरता मापने के लिए मान्यता प्राप्त 9-प्रश्नों का उपकरण। स्कोर चिकित्सीय निदान नहीं है।'
        },
        answerOptions: [
            { text: { en: 'Not at all', hi: 'बिल्कुल नहीं' }, val: 0 },
            { text: { en: 'Several days', hi: 'कई दिनों से' }, val: 1 },
            { text: { en: 'More than half the days', hi: 'आधे से अधिक दिनों से' }, val: 2 },
            { text: { en: 'Nearly every day', hi: 'लगभग हर दिन' }, val: 3 }
        ],
        questions: [
            { id: 'phq1', text: { en: 'Little interest or pleasure in doing things?', hi: 'कामों में बहुत कम रुचि या आनंद होना?' } },
            { id: 'phq2', text: { en: 'Feeling down, depressed, or hopeless?', hi: 'उदास, निराश या महसूस करना कि कोई उम्मीद नहीं है?' } },
            { id: 'phq3', text: { en: 'Trouble falling or staying asleep, or sleeping too much?', hi: 'नींद आने में कठिनाई, नींद टूटना, या अत्यधिक सोना?' } },
            { id: 'phq4', text: { en: 'Feeling tired or having little energy?', hi: 'थकान महसूस होना या ऊर्जा की कमी लगना?' } },
            { id: 'phq5', text: { en: 'Poor appetite or overeating?', hi: 'भूख न लगना या बहुत अधिक खाना खाना?' } },
            { id: 'phq6', text: { en: 'Feeling bad about yourself — or that you are a failure or have let yourself or your family down?', hi: 'अपने बारे में बुरा सोचना — या यह कि आप असफल रहे हैं या अपने परिवार को निराश किया है?' } },
            { id: 'phq7', text: { en: 'Trouble concentrating on things, such as reading the newspaper or watching television?', hi: 'चीजों पर ध्यान केंद्रित करने में परेशानी, जैसे समाचार पत्र पढ़ना या टीवी देखना?' } },
            { id: 'phq8', text: { en: 'Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual?', hi: 'इतने धीरे चलना या बोलना कि दूसरों का ध्यान जाए? या इसके विपरीत — अत्यधिक बेचैनी?' } },
            { id: 'phq9', text: { en: 'Thoughts that you would be better off dead, or of hurting yourself in some way?', hi: 'ऐसा विचार आना कि मर जाना बेहतर होगा, या खुद को किसी तरह से चोट पहुंचाने का ख्याल?' }, isSafetyQuestion: true }
        ],
        scoringRules: {
            maxScore: 27,
            method: 'sum' // sum all answers
        },
        interpretationRules: [
            {
                min: 0, max: 4, category: 'Minimal', label: { en: 'Minimal Concern', hi: 'न्यूनतम चिंता' }, flagColor: 'minimal',
                interpretation: { en: 'Your responses do not indicate significant symptoms of depression at this time.', hi: 'आपके उत्तर अभी अवसाद के महत्वपूर्ण लक्षण नहीं दर्शाते हैं।' }
            },
            {
                min: 5, max: 9, category: 'Mild', label: { en: 'Mild Concern', hi: 'हल्की चिंता' }, flagColor: 'mild',
                interpretation: { en: 'Your responses indicate mild depressive symptoms that may benefit from awareness and self-care.', hi: 'आपके उत्तर हल्के अवसाद के लक्षण दर्शाते हैं जिनसे स्व-देखभाल मदद कर सकती है।' }
            },
            {
                min: 10, max: 14, category: 'Moderate', label: { en: 'Moderate Concern', hi: 'मध्यम चिंता' }, flagColor: 'moderate',
                interpretation: { en: 'Your responses indicate moderate depressive symptoms. Discussing these with a healthcare advisor may be beneficial.', hi: 'आपके उत्तर मध्यम अवसाद के लक्षण दर्शाते हैं। किसी स्वास्थ्य सलाहकार से बात करना उपयोगी हो सकता है।' }
            },
            {
                min: 15, max: 19, category: 'Moderately Severe', label: { en: 'Moderately Severe', hi: 'मध्यम-गंभीर' }, flagColor: 'moderate',
                interpretation: { en: 'Your responses indicate moderately severe depressive symptoms. Professional support is recommended.', hi: 'आपके उत्तर मध्यम-गंभीर अवसाद के लक्षण दर्शाते हैं। पेशेवर सहायता की सिफारिश की जाती है।' }
            },
            {
                min: 20, max: 27, category: 'Severe', label: { en: 'Severe Concern', hi: 'गंभीर चिंता' }, flagColor: 'severe',
                interpretation: { en: 'Your responses indicate severe depressive symptoms. We strongly encourage professional care and support.', hi: 'आपके उत्तर गंभीर अवसाद के लक्षण दर्शाते हैं। हम दृढ़ता से पेशेवर देखभाल की सलाह देते हैं।' }
            }
        ],
        recommendedActions: {
            Minimal: {
                en: ['Continue regular self-care routines', 'Practice mindfulness and physical activity', 'Stay connected with friends and family', 'Optional: Check in again in 2-4 weeks'],
                hi: ['नियमित स्व-देखभाल जारी रखें', 'माइंडफुलनेस और शारीरिक गतिविधि का अभ्यास करें', 'दोस्तों और परिवार से जुड़े रहें']
            },
            Mild: {
                en: ['Monitor your mood daily', 'Try structured breathing exercises', 'Maintain a regular sleep schedule', 'Consider speaking with a trusted person', 'Follow up in 2 weeks'],
                hi: ['प्रतिदिन अपने मूड पर नज़र रखें', 'संरचित श्वास अभ्यास करें', 'नियमित नींद का समय बनाए रखें', '2 सप्ताह बाद दोबारा जांचें']
            },
            Moderate: {
                en: ['Consult your nearest Primary Health Centre', 'Reach out to Tele-MANAS (14416) for guidance', 'Practice daily self-care and mindfulness', 'Follow up within 1-2 weeks'],
                hi: ['नजदीकी प्राथमिक स्वास्थ्य केंद्र से परामर्श करें', 'टेली-मानस (14416) से संपर्क करें', '1-2 सप्ताह के भीतर फॉलो-अप करें']
            },
            'Moderately Severe': {
                en: ['Strongly recommended: Professional consultation at PHC', 'Contact Tele-MANAS helpline: 14416', 'Do not manage this alone — seek human support', 'Priority follow-up within 1 week'],
                hi: ['दृढ़ता से अनुशंसित: PHC पर पेशेवर परामर्श', 'टेली-मानस से संपर्क करें: 14416', '1 सप्ताह के भीतर प्राथमिकता से फॉलो-अप करें']
            },
            Severe: {
                en: ['Urgent: Please seek professional support today', 'Contact Tele-MANAS: 14416 or iCall: 9152987821', 'Visit your nearest PHC or hospital', 'Inform a trusted person about how you are feeling'],
                hi: ['तत्काल: कृपया आज पेशेवर सहायता लें', 'टेली-मानस: 14416 से संपर्क करें', 'नजदीकी PHC या अस्पताल जाएं']
            }
        }
    },

    // GAD-7: Generalized Anxiety Disorder scale
    // © Pfizer Inc. Reproduced with permission. Free to use.
    gad7: {
        id: 'gad7',
        name: 'GAD-7',
        fullName: { en: 'GAD-7 Anxiety Screening', hi: 'GAD-7 चिंता स्क्रीनिंग' },
        instrument: 'Generalized Anxiety Disorder-7',
        concern: 'anxiety',
        icon: '🌀',
        colorClass: 'anxiety',
        disclaimer: {
            en: 'Validated 7-item tool measuring anxiety symptom severity. Scores do not constitute a clinical diagnosis.',
            hi: 'चिंता के लक्षणों की गंभीरता मापने के लिए मान्यता प्राप्त 7-प्रश्नों का उपकरण।'
        },
        answerOptions: [
            { text: { en: 'Not at all', hi: 'बिल्कुल नहीं' }, val: 0 },
            { text: { en: 'Several days', hi: 'कई दिनों से' }, val: 1 },
            { text: { en: 'More than half the days', hi: 'आधे से अधिक दिनों से' }, val: 2 },
            { text: { en: 'Nearly every day', hi: 'लगभग हर दिन' }, val: 3 }
        ],
        questions: [
            { id: 'gad1', text: { en: 'Feeling nervous, anxious, or on edge?', hi: 'घबराहट, चिंता, या बेचैनी महसूस होना?' } },
            { id: 'gad2', text: { en: 'Not being able to stop or control worrying?', hi: 'चिंता को रोकने या नियंत्रित करने में असमर्थ होना?' } },
            { id: 'gad3', text: { en: 'Worrying too much about different things?', hi: 'विभिन्न चीजों के बारे में बहुत अधिक चिंता करना?' } },
            { id: 'gad4', text: { en: 'Trouble relaxing?', hi: 'आराम करने में परेशानी महसूस होना?' } },
            { id: 'gad5', text: { en: 'Being so restless that it is hard to sit still?', hi: 'इतनी बेचैनी महसूस होना कि शांत बैठना मुश्किल हो जाए?' } },
            { id: 'gad6', text: { en: 'Becoming easily annoyed or irritable?', hi: 'आसानी से चिढ़ जाना या चिड़चिड़ा हो जाना?' } },
            { id: 'gad7', text: { en: 'Feeling afraid, as if something awful might happen?', hi: 'अज्ञात भय महसूस होना, जैसे कुछ भयानक होने वाला हो?' } }
        ],
        scoringRules: { maxScore: 21, method: 'sum' },
        interpretationRules: [
            {
                min: 0, max: 4, category: 'Minimal', label: { en: 'Minimal Concern', hi: 'न्यूनतम चिंता' }, flagColor: 'minimal',
                interpretation: { en: 'Your responses do not indicate significant anxiety symptoms at this time.', hi: 'आपके उत्तर अभी महत्वपूर्ण चिंता के लक्षण नहीं दर्शाते हैं।' }
            },
            {
                min: 5, max: 9, category: 'Mild', label: { en: 'Mild Concern', hi: 'हल्की चिंता' }, flagColor: 'mild',
                interpretation: { en: 'Your responses point to mild anxiety symptoms. Self-care strategies can be helpful.', hi: 'आपके उत्तर हल्की चिंता के लक्षण दर्शाते हैं। स्व-देखभाल रणनीतियां मददगार हो सकती हैं।' }
            },
            {
                min: 10, max: 14, category: 'Moderate', label: { en: 'Moderate Concern', hi: 'मध्यम चिंता' }, flagColor: 'moderate',
                interpretation: { en: 'Your responses indicate moderate anxiety symptoms. Medical guidance is advisable.', hi: 'आपके उत्तर मध्यम चिंता के लक्षण दर्शाते हैं। चिकित्सीय मार्गदर्शन उचित है।' }
            },
            {
                min: 15, max: 21, category: 'Severe', label: { en: 'Severe Concern', hi: 'गंभीर चिंता' }, flagColor: 'severe',
                interpretation: { en: 'Your responses suggest severe anxiety symptoms that benefit from professional counseling.', hi: 'आपके उत्तर गंभीर चिंता के लक्षण दर्शाते हैं जिनके लिए पेशेवर परामर्श आवश्यक है।' }
            }
        ],
        recommendedActions: {
            Minimal: {
                en: ['Practice daily mindfulness or yoga', 'Limit caffeine and screen time before bed', 'Stay connected with supportive people'],
                hi: ['दैनिक माइंडफुलनेस या योग का अभ्यास करें', 'कैफीन और सोने से पहले स्क्रीन समय सीमित करें']
            },
            Mild: {
                en: ['Practice Box Breathing (4-4-6 technique)', 'Keep a worry journal to identify triggers', 'Reduce caffeine intake', 'Consider a follow-up check in 2 weeks'],
                hi: ['बॉक्स ब्रीदिंग तकनीक का अभ्यास करें', 'चिंता जर्नल रखें', '2 सप्ताह में दोबारा जांच करें']
            },
            Moderate: {
                en: ['Consult a doctor at your nearest PHC', 'Contact Tele-MANAS counselors: 14416', 'Try guided relaxation sessions', 'Follow-up within 1-2 weeks'],
                hi: ['नजदीकी PHC पर डॉक्टर से परामर्श करें', 'टेली-मानस: 14416 से संपर्क करें']
            },
            Severe: {
                en: ['Urgent: Please seek professional support', 'Contact Tele-MANAS: 14416 or iCall: 9152987821', 'Visit PHC or hospital today', 'Tell a trusted person how you feel'],
                hi: ['तत्काल: कृपया पेशेवर सहायता लें', 'टेली-मानस: 14416 से संपर्क करें']
            }
        }
    },

    // PSS-4: Perceived Stress Scale (4-item version)
    // © Sheldon Cohen, Carnegie Mellon University. Public domain. Widely used globally.
    pss4: {
        id: 'pss4',
        name: 'PSS-4',
        fullName: { en: 'PSS-4 Stress Assessment', hi: 'PSS-4 तनाव मूल्यांकन' },
        instrument: 'Perceived Stress Scale-4',
        concern: 'stress',
        icon: '🌊',
        colorClass: 'stress',
        disclaimer: {
            en: 'Validated 4-item tool measuring perceived stress levels. Scores do not constitute a clinical diagnosis.',
            hi: 'अनुभव किए गए तनाव के स्तर को मापने वाला मान्यता प्राप्त 4-प्रश्नों का उपकरण।'
        },
        answerOptions: [
            { text: { en: 'Never', hi: 'कभी नहीं' }, val: 0 },
            { text: { en: 'Almost never', hi: 'लगभग कभी नहीं' }, val: 1 },
            { text: { en: 'Sometimes', hi: 'कभी-कभी' }, val: 2 },
            { text: { en: 'Fairly often', hi: 'काफी अक्सर' }, val: 3 },
            { text: { en: 'Very often', hi: 'बहुत बार' }, val: 4 }
        ],
        questions: [
            { id: 'pss1', text: { en: 'In the last month, how often have you felt unable to control the important things in your life?', hi: 'पिछले महीने में, आप कितनी बार अपने जीवन की महत्वपूर्ण चीज़ों को नियंत्रित करने में असमर्थ महसूस करते थे?' } },
            { id: 'pss2', text: { en: 'In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?', hi: 'पिछले महीने में, आप कितनी बार महसूस करते थे कि कठिनाइयाँ इतनी बढ़ गई हैं कि आप उन्हें दूर नहीं कर सकते?' } },
            { id: 'pss3', text: { en: 'In the last month, how often have you been able to control irritations in your life?', hi: 'पिछले महीने में, आप कितनी बार अपने जीवन की परेशानियों को नियंत्रित करने में सक्षम थे?', isReversed: true } },
            { id: 'pss4', text: { en: 'In the last month, how often have you felt confident about your ability to handle your personal problems?', hi: 'पिछले महीने में, आप कितनी बार अपनी व्यक्तिगत समस्याओं को संभालने की अपनी क्षमता के बारे में आश्वस्त महसूस करते थे?', isReversed: true } }
        ],
        scoringRules: {
            maxScore: 16,
            method: 'sum_with_reversal', // Q3, Q4 are reverse scored
            reversedQuestions: ['pss3', 'pss4'],
            reversalMap: { 0: 4, 1: 3, 2: 2, 3: 1, 4: 0 }
        },
        interpretationRules: [
            {
                min: 0, max: 5, category: 'Low Stress', label: { en: 'Low Stress', hi: 'कम तनाव' }, flagColor: 'minimal',
                interpretation: { en: 'Your responses suggest you are managing stress well at this time.', hi: 'आपके उत्तर बताते हैं कि आप इस समय तनाव को अच्छी तरह से संभाल रहे हैं।' }
            },
            {
                min: 6, max: 10, category: 'Moderate Stress', label: { en: 'Moderate Stress', hi: 'मध्यम तनाव' }, flagColor: 'mild',
                interpretation: { en: 'Your responses indicate moderate levels of perceived stress. Self-care practices can help.', hi: 'आपके उत्तर मध्यम तनाव का संकेत देते हैं। स्व-देखभाल अभ्यास मदद कर सकते हैं।' }
            },
            {
                min: 11, max: 16, category: 'High Stress', label: { en: 'High Stress', hi: 'उच्च तनाव' }, flagColor: 'moderate',
                interpretation: { en: 'Your responses indicate high levels of perceived stress. It would be beneficial to speak with a healthcare advisor.', hi: 'आपके उत्तर उच्च तनाव का संकेत देते हैं। किसी स्वास्थ्य सलाहकार से बात करना फायदेमंद होगा।' }
            }
        ],
        recommendedActions: {
            'Low Stress': {
                en: ['Continue your current stress management practices', 'Maintain work-life balance', 'Stay connected with your support network'],
                hi: ['अपनी वर्तमान तनाव प्रबंधन प्रथाओं को जारी रखें', 'कार्य-जीवन संतुलन बनाए रखें']
            },
            'Moderate Stress': {
                en: ['Practice structured relaxation daily (Box Breathing, Yoga)', 'Identify and limit key stress triggers', 'Take regular short breaks during study/work', 'Talk to a trusted friend or mentor'],
                hi: ['दैनिक संरचित विश्राम का अभ्यास करें', 'मुख्य तनाव कारणों को पहचानें और सीमित करें']
            },
            'High Stress': {
                en: ['Consult your nearest PHC for stress management support', 'Contact Tele-MANAS counselors: 14416', 'Consider speaking with a counselor at college/workplace', 'Prioritize sleep and limit workload where possible'],
                hi: ['नजदीकी PHC पर तनाव प्रबंधन सहायता के लिए परामर्श करें', 'टेली-मानस: 14416 से संपर्क करें']
            }
        }
    },

    // WHO-5: Well-Being Index
    // © WHO Regional Office for Europe. Free to reproduce with attribution.
    who5: {
        id: 'who5',
        name: 'WHO-5',
        fullName: { en: 'WHO-5 Well-Being Index', hi: 'WHO-5 कल्याण सूचकांक' },
        instrument: 'WHO-5 Well-Being Index',
        concern: 'general',
        icon: '☀️',
        colorClass: 'wellbeing',
        disclaimer: {
            en: 'WHO-5 is a brief 5-item index of current mental well-being. Scores do not constitute a clinical diagnosis.',
            hi: 'WHO-5 वर्तमान मानसिक कल्याण का एक संक्षिप्त 5-प्रश्नों का सूचकांक है।'
        },
        answerOptions: [
            { text: { en: 'All of the time', hi: 'हर समय' }, val: 5 },
            { text: { en: 'Most of the time', hi: 'अधिकांश समय' }, val: 4 },
            { text: { en: 'More than half the time', hi: 'आधे से अधिक समय' }, val: 3 },
            { text: { en: 'Less than half the time', hi: 'आधे से कम समय' }, val: 2 },
            { text: { en: 'Some of the time', hi: 'कुछ समय' }, val: 1 },
            { text: { en: 'At no time', hi: 'कभी नहीं' }, val: 0 }
        ],
        questions: [
            { id: 'who1', text: { en: 'Over the last two weeks — I have felt cheerful and in good spirits', hi: 'पिछले दो हफ्तों में — मैं प्रसन्न और अच्छे मूड में रहा हूँ' } },
            { id: 'who2', text: { en: 'Over the last two weeks — I have felt calm and relaxed', hi: 'पिछले दो हफ्तों में — मैंने शांत और तनावमुक्त महसूस किया है' } },
            { id: 'who3', text: { en: 'Over the last two weeks — I have felt active and vigorous', hi: 'पिछले दो हफ्तों में — मैंने सक्रिय और ऊर्जावान महसूस किया है' } },
            { id: 'who4', text: { en: 'Over the last two weeks — I woke up feeling fresh and rested', hi: 'पिछले दो हफ्तों में — मैं सोकर तरोताजा और आराम महसूस करके उठा' } },
            { id: 'who5', text: { en: 'Over the last two weeks — my daily life has been filled with things that interest me', hi: 'पिछले दो हफ्तों में — मेरा दैनिक जीवन उन चीजों से भरा रहा है जो मुझे रुचिकर लगती हैं' } }
        ],
        scoringRules: {
            maxScore: 100,
            method: 'sum_multiply', // raw sum × 4 = percentage index
            multiplier: 4
        },
        interpretationRules: [
            {
                min: 0, max: 28, category: 'Low Well-being', label: { en: 'Low Well-being', hi: 'कम कल्याण' }, flagColor: 'moderate',
                interpretation: { en: 'Your well-being index is low, suggesting possible high stress, burnout, or low mood. A more specific screening is recommended.', hi: 'आपका कल्याण सूचकांक कम है, जो उच्च तनाव, थकान या कम मूड का संकेत दे सकता है।' }
            },
            {
                min: 29, max: 49, category: 'Below Average', label: { en: 'Below Average', hi: 'औसत से कम' }, flagColor: 'mild',
                interpretation: { en: 'Your well-being index is below average. Self-care and monitoring are suggested.', hi: 'आपका कल्याण सूचकांक औसत से कम है। स्व-देखभाल और निगरानी का सुझाव दिया जाता है।' }
            },
            {
                min: 50, max: 100, category: 'Good Well-being', label: { en: 'Good Well-being', hi: 'अच्छा कल्याण' }, flagColor: 'minimal',
                interpretation: { en: 'Your responses indicate adequate mental well-being and life satisfaction.', hi: 'आपके उत्तर पर्याप्त मानसिक कल्याण और जीवन संतुष्टि का संकेत देते हैं।' }
            }
        ],
        recommendedActions: {
            'Low Well-being': {
                en: ['Consider a detailed PHQ-9 screening for low mood', 'Talk to a trusted person about how you feel', 'Visit your nearest PHC for a well-being check', 'Contact Tele-MANAS: 14416'],
                hi: ['कम मूड के लिए PHQ-9 स्क्रीनिंग पर विचार करें', 'अपनी भावनाओं के बारे में किसी विश्वसनीय व्यक्ति से बात करें']
            },
            'Below Average': {
                en: ['Increase physical activity and outdoor time', 'Maintain a regular sleep schedule', 'Reconnect with hobbies and social activities', 'Monitor well-being weekly'],
                hi: ['शारीरिक गतिविधि और बाहरी समय बढ़ाएं', 'नियमित नींद का समय बनाए रखें']
            },
            'Good Well-being': {
                en: ['Maintain your current wellness practices', 'Continue social connections and hobbies', 'Check in monthly to track your well-being'],
                hi: ['अपनी वर्तमान कल्याण प्रथाओं को बनाए रखें', 'सामाजिक संबंध और शौक जारी रखें']
            }
        }
    }
};

// ============================================================
// 3. CONTEXTUAL QUESTIONS (Per concern area — non-diagnostic)
// ============================================================
const CONTEXTUAL_QUESTIONS = {
    anxiety: {
        title: { en: 'A few more questions about anxiety', hi: 'चिंता के बारे में कुछ और प्रश्न' },
        questions: [
            {
                id: 'ctx_anx_1',
                text: { en: 'When do you tend to feel most anxious?', hi: 'आप सबसे अधिक चिंतित कब महसूस करते हैं?' },
                options: [
                    { emoji: '🌅', label: { en: 'In the morning', hi: 'सुबह' }, value: 'morning' },
                    { emoji: '🌆', label: { en: 'In the evening', hi: 'शाम को' }, value: 'evening' },
                    { emoji: '🌙', label: { en: 'At night / bedtime', hi: 'रात को / सोते समय' }, value: 'night' },
                    { emoji: '⏰', label: { en: 'Before important events', hi: 'महत्वपूर्ण घटनाओं से पहले' }, value: 'events' },
                    { emoji: '🌊', label: { en: 'All the time / unpredictably', hi: 'हर समय / अप्रत्याशित रूप से' }, value: 'always' }
                ]
            },
            {
                id: 'ctx_anx_2',
                text: { en: 'How is your anxiety affecting daily life?', hi: 'आपकी चिंता दैनिक जीवन को कैसे प्रभावित कर रही है?' },
                options: [
                    { emoji: '😴', label: { en: 'Disrupting sleep', hi: 'नींद में बाधा डाल रही है' }, value: 'sleep' },
                    { emoji: '🎯', label: { en: 'Affecting concentration', hi: 'एकाग्रता प्रभावित हो रही है' }, value: 'concentration' },
                    { emoji: '👥', label: { en: 'Avoiding social situations', hi: 'सामाजिक परिस्थितियों से बच रहे हैं' }, value: 'social' },
                    { emoji: '💼', label: { en: 'Affecting work/study', hi: 'काम/पढ़ाई प्रभावित हो रही है' }, value: 'work' },
                    { emoji: '✅', label: { en: 'Managing okay overall', hi: 'कुल मिलाकर ठीक है' }, value: 'managing' }
                ]
            }
        ]
    },
    low_mood: {
        title: { en: 'A few more questions about your mood', hi: 'आपके मूड के बारे में कुछ और प्रश्न' },
        questions: [
            {
                id: 'ctx_mood_1',
                text: { en: 'How long have you been feeling this way?', hi: 'आप कब से इस तरह महसूस कर रहे हैं?' },
                options: [
                    { emoji: '📅', label: { en: 'A few days', hi: 'कुछ दिनों से' }, value: 'days' },
                    { emoji: '📆', label: { en: 'A few weeks', hi: 'कुछ हफ्तों से' }, value: 'weeks' },
                    { emoji: '🗓️', label: { en: 'A month or more', hi: 'एक महीने या अधिक से' }, value: 'month' },
                    { emoji: '🌙', label: { en: 'Several months', hi: 'कई महीनों से' }, value: 'months' }
                ]
            },
            {
                id: 'ctx_mood_2',
                text: { en: 'Which of these is most affecting you?', hi: 'इनमें से कौन सी चीज़ आपको सबसे ज़्यादा प्रभावित कर रही है?' },
                options: [
                    { emoji: '😶', label: { en: 'Feeling empty or numb', hi: 'खालीपन या सुन्नता महसूस करना' }, value: 'empty' },
                    { emoji: '😰', label: { en: 'Loss of interest in things I used to enjoy', hi: 'जो चीज़ें मुझे पहले अच्छी लगती थीं उनमें रुचि खोना' }, value: 'anhedonia' },
                    { emoji: '😔', label: { en: 'Feeling worthless or hopeless', hi: 'बेकार या निराश महसूस करना' }, value: 'hopeless' },
                    { emoji: '😴', label: { en: 'Very low energy or fatigue', hi: 'बहुत कम ऊर्जा या थकान' }, value: 'fatigue' },
                    { emoji: '👥', label: { en: 'Withdrawing from people', hi: 'लोगों से दूर होना' }, value: 'withdrawal' }
                ]
            }
        ]
    },
    stress: {
        title: { en: 'A few more questions about your stress', hi: 'आपके तनाव के बारे में कुछ और प्रश्न' },
        questions: [
            {
                id: 'ctx_stress_1',
                text: { en: 'What is contributing most to your stress?', hi: 'आपके तनाव में सबसे अधिक क्या योगदान दे रहा है?' },
                options: [
                    { emoji: '📚', label: { en: 'Workload / Exams / Deadlines', hi: 'काम का बोझ / परीक्षा / समयसीमा' }, value: 'workload' },
                    { emoji: '💰', label: { en: 'Financial concerns', hi: 'वित्तीय चिंताएं' }, value: 'financial' },
                    { emoji: '👨‍👩‍👧', label: { en: 'Family expectations', hi: 'परिवार की अपेक्षाएं' }, value: 'family' },
                    { emoji: '🔮', label: { en: 'Future / career uncertainty', hi: 'भविष्य / करियर की अनिश्चितता' }, value: 'future' },
                    { emoji: '👥', label: { en: 'Relationships', hi: 'रिश्ते' }, value: 'relationships' },
                    { emoji: '💭', label: { en: 'Other', hi: 'अन्य' }, value: 'other' }
                ]
            },
            {
                id: 'ctx_stress_2',
                text: { en: 'How is stress affecting your daily life?', hi: 'तनाव आपके दैनिक जीवन को कैसे प्रभावित कर रहा है?' },
                options: [
                    { emoji: '😴', label: { en: 'Sleep', hi: 'नींद' }, value: 'sleep' },
                    { emoji: '🎯', label: { en: 'Concentration', hi: 'एकाग्रता' }, value: 'concentration' },
                    { emoji: '⚡', label: { en: 'Energy levels', hi: 'ऊर्जा स्तर' }, value: 'energy' },
                    { emoji: '📋', label: { en: 'Attendance / Work output', hi: 'उपस्थिति / काम का उत्पादन' }, value: 'attendance' },
                    { emoji: '👥', label: { en: 'Social life', hi: 'सामाजिक जीवन' }, value: 'social' },
                    { emoji: '✅', label: { en: 'Not significantly', hi: 'बहुत अधिक नहीं' }, value: 'not_much' }
                ]
            }
        ]
    },
    academic_work: {
        title: { en: 'A few more questions about work/study pressure', hi: 'काम/पढ़ाई के दबाव के बारे में कुछ और प्रश्न' },
        questions: [
            {
                id: 'ctx_work_1',
                text: { en: 'What is contributing most to your stress?', hi: 'आपके तनाव में सबसे अधिक क्या योगदान दे रहा है?' },
                options: [
                    { emoji: '📚', label: { en: 'Workload / Exams / Deadlines', hi: 'काम का बोझ / परीक्षा / समयसीमा' }, value: 'workload' },
                    { emoji: '💰', label: { en: 'Financial concerns', hi: 'वित्तीय चिंताएं' }, value: 'financial' },
                    { emoji: '👨‍👩‍👧', label: { en: 'Family expectations', hi: 'परिवार की अपेक्षाएं' }, value: 'family' },
                    { emoji: '🔮', label: { en: 'Future / career uncertainty', hi: 'भविष्य / करियर की अनिश्चितता' }, value: 'future' },
                    { emoji: '👥', label: { en: 'Relationships', hi: 'रिश्ते' }, value: 'relationships' }
                ]
            },
            {
                id: 'ctx_work_2',
                text: { en: 'How is this affecting your daily life?', hi: 'यह आपके दैनिक जीवन को कैसे प्रभावित कर रहा है?' },
                options: [
                    { emoji: '😴', label: { en: 'Sleep', hi: 'नींद' }, value: 'sleep' },
                    { emoji: '🎯', label: { en: 'Concentration', hi: 'एकाग्रता' }, value: 'concentration' },
                    { emoji: '⚡', label: { en: 'Energy', hi: 'ऊर्जा' }, value: 'energy' },
                    { emoji: '📋', label: { en: 'Attendance / Work output', hi: 'उपस्थिति / काम' }, value: 'attendance' },
                    { emoji: '👥', label: { en: 'Social life', hi: 'सामाजिक जीवन' }, value: 'social' },
                    { emoji: '✅', label: { en: 'Not significantly', hi: 'बहुत अधिक नहीं' }, value: 'not_much' }
                ]
            }
        ]
    },
    sleep: {
        title: { en: 'A few more questions about sleep', hi: 'नींद के बारे में कुछ और प्रश्न' },
        questions: [
            {
                id: 'ctx_sleep_1',
                text: { en: 'What kind of sleep difficulty are you experiencing?', hi: 'आप किस प्रकार की नींद की कठिनाई का अनुभव कर रहे हैं?' },
                options: [
                    { emoji: '🛏️', label: { en: 'Trouble falling asleep', hi: 'नींद न आना' }, value: 'falling' },
                    { emoji: '🌙', label: { en: 'Waking up during the night', hi: 'रात में जागना' }, value: 'waking' },
                    { emoji: '⏰', label: { en: 'Waking too early', hi: 'बहुत जल्दी जागना' }, value: 'early' },
                    { emoji: '😴', label: { en: 'Sleeping too much', hi: 'बहुत अधिक सोना' }, value: 'oversleeping' },
                    { emoji: '🌀', label: { en: 'Unrefreshing / poor quality sleep', hi: 'असंतोषजनक नींद' }, value: 'quality' }
                ]
            },
            {
                id: 'ctx_sleep_2',
                text: { en: 'How long have you had this sleep issue?', hi: 'यह नींद की समस्या आपको कब से है?' },
                options: [
                    { emoji: '📅', label: { en: 'Less than a week', hi: 'एक हफ्ते से कम' }, value: 'days' },
                    { emoji: '📆', label: { en: '1–4 weeks', hi: '1-4 हफ्ते' }, value: 'weeks' },
                    { emoji: '🗓️', label: { en: '1–3 months', hi: '1-3 महीने' }, value: 'month' },
                    { emoji: '🌙', label: { en: 'More than 3 months', hi: '3 महीने से अधिक' }, value: 'chronic' }
                ]
            }
        ]
    },
    social: {
        title: { en: 'A few more questions about relationships', hi: 'रिश्तों के बारे में कुछ और प्रश्न' },
        questions: [
            {
                id: 'ctx_social_1',
                text: { en: 'What is the main area of difficulty?', hi: 'मुख्य कठिनाई का क्षेत्र क्या है?' },
                options: [
                    { emoji: '👫', label: { en: 'Romantic relationship', hi: 'प्रेम संबंध' }, value: 'romantic' },
                    { emoji: '👨‍👩‍👧', label: { en: 'Family conflict', hi: 'परिवार में संघर्ष' }, value: 'family' },
                    { emoji: '👥', label: { en: 'Friendships / peer group', hi: 'मित्रता / साथियों का समूह' }, value: 'friends' },
                    { emoji: '💼', label: { en: 'Work/study relationships', hi: 'काम/पढ़ाई के रिश्ते' }, value: 'work' },
                    { emoji: '🌍', label: { en: 'Feeling isolated / lonely', hi: 'अकेलापन महसूस करना' }, value: 'isolation' }
                ]
            },
            {
                id: 'ctx_social_2',
                text: { en: 'How has this been affecting you?', hi: 'इसने आपको कैसे प्रभावित किया है?' },
                options: [
                    { emoji: '😔', label: { en: 'Feeling sad or withdrawn', hi: 'उदास या पीछे हटना' }, value: 'sad' },
                    { emoji: '😰', label: { en: 'Feeling anxious about social situations', hi: 'सामाजिक परिस्थितियों से चिंता' }, value: 'anxious' },
                    { emoji: '😤', label: { en: 'Feeling angry or resentful', hi: 'गुस्सा या नाराज़गी' }, value: 'angry' },
                    { emoji: '😴', label: { en: 'Affecting sleep and energy', hi: 'नींद और ऊर्जा प्रभावित' }, value: 'tired' },
                    { emoji: '🎯', label: { en: 'Difficulty concentrating', hi: 'ध्यान केंद्रित करने में कठिनाई' }, value: 'concentration' }
                ]
            }
        ]
    },
    other: {
        title: { en: 'A little more about what you are experiencing', hi: 'आप जो अनुभव कर रहे हैं उसके बारे में थोड़ा और' },
        questions: [
            {
                id: 'ctx_other_1',
                text: { en: 'How is your overall energy and motivation?', hi: 'आपकी समग्र ऊर्जा और प्रेरणा कैसी है?' },
                options: [
                    { emoji: '⚡', label: { en: 'Normal / Good', hi: 'सामान्य / अच्छी' }, value: 'good' },
                    { emoji: '🙂', label: { en: 'Slightly lower than usual', hi: 'सामान्य से थोड़ा कम' }, value: 'slightly_low' },
                    { emoji: '😔', label: { en: 'Noticeably lower', hi: 'काफी कम' }, value: 'low' },
                    { emoji: '😞', label: { en: 'Very low / exhausted', hi: 'बहुत कम / थका हुआ' }, value: 'very_low' }
                ]
            },
            {
                id: 'ctx_other_2',
                text: { en: 'Is there anything specific that triggered these feelings?', hi: 'क्या कुछ विशेष घटना ने इन भावनाओं को जन्म दिया?' },
                options: [
                    { emoji: '💔', label: { en: 'A loss or grief', hi: 'कोई हानि या दुख' }, value: 'grief' },
                    { emoji: '🔄', label: { en: 'A major life change', hi: 'जीवन में बड़ा बदलाव' }, value: 'change' },
                    { emoji: '⚕️', label: { en: 'A health issue', hi: 'स्वास्थ्य समस्या' }, value: 'health' },
                    { emoji: '💰', label: { en: 'Financial difficulty', hi: 'वित्तीय कठिनाई' }, value: 'financial' },
                    { emoji: '🤷', label: { en: "I'm not sure / nothing specific", hi: 'मुझे पता नहीं / कुछ विशेष नहीं' }, value: 'unsure' }
                ]
            }
        ]
    },
    prefer_not: {
        title: { en: 'A little about how things have been', hi: 'चीज़ें कैसी रही हैं इसके बारे में थोड़ा' },
        questions: [
            {
                id: 'ctx_pref_1',
                text: { en: 'How has your sleep been recently?', hi: 'हाल ही में आपकी नींद कैसी रही है?' },
                options: [
                    { emoji: '😴', label: { en: 'Good — getting enough rest', hi: 'अच्छी — पर्याप्त आराम मिल रहा है' }, value: 'good' },
                    { emoji: '🙂', label: { en: 'Okay — some nights better than others', hi: 'ठीक — कुछ रातें बेहतर होती हैं' }, value: 'okay' },
                    { emoji: '🙁', label: { en: 'Not great — often tired', hi: 'अच्छी नहीं — अक्सर थका हुआ' }, value: 'poor' },
                    { emoji: '😞', label: { en: 'Very poor — severely disrupted', hi: 'बहुत खराब — बहुत बाधित' }, value: 'very_poor' }
                ]
            },
            {
                id: 'ctx_pref_2',
                text: { en: 'How are you managing day-to-day activities?', hi: 'आप दिन-प्रतिदिन की गतिविधियों को कैसे प्रबंधित कर रहे हैं?' },
                options: [
                    { emoji: '✅', label: { en: 'Managing well', hi: 'अच्छी तरह से प्रबंधित' }, value: 'well' },
                    { emoji: '🙂', label: { en: 'Managing with some effort', hi: 'कुछ प्रयास से प्रबंधित' }, value: 'effort' },
                    { emoji: '😔', label: { en: 'Struggling somewhat', hi: 'कुछ हद तक संघर्ष कर रहे हैं' }, value: 'struggling' },
                    { emoji: '😞', label: { en: 'Significantly struggling', hi: 'काफी संघर्ष कर रहे हैं' }, value: 'significant' }
                ]
            }
        ]
    }
};

// ============================================================
// 4. CONCERN ROUTER — Deterministic mapping
// ============================================================
const CONCERN_ROUTER = {
    low_mood: { tool: 'phq9', hasContextual: true, contextualKey: 'low_mood' },
    anxiety: { tool: 'gad7', hasContextual: true, contextualKey: 'anxiety' },
    stress: { tool: 'pss4', hasContextual: true, contextualKey: 'stress' },
    sleep: { tool: 'who5', hasContextual: true, contextualKey: 'sleep' },
    academic_work: { tool: 'pss4', hasContextual: true, contextualKey: 'academic_work' },
    social: { tool: 'who5', hasContextual: true, contextualKey: 'social' },
    other: { tool: 'who5', hasContextual: true, contextualKey: 'other' },
    prefer_not: { tool: 'who5', hasContextual: true, contextualKey: 'prefer_not' }
};

// ============================================================
// 5. SCORING ENGINE — Pure deterministic functions
// ============================================================
const ScoringEngine = {
    /**
     * Calculate score from answers array using the module's scoring rules.
     * @param {string} moduleId - e.g. 'phq9'
     * @param {number[]} answers - Array of raw answer values
     * @returns {{ rawScore, scaledScore, maxScore }}
     */
    calculate(moduleId, answers) {
        const module = SCREENING_MODULES[moduleId];
        const rules = module.scoringRules;

        let rawScore = 0;

        if (rules.method === 'sum') {
            rawScore = answers.reduce((a, b) => a + b, 0);
        } else if (rules.method === 'sum_with_reversal') {
            rawScore = answers.reduce((sum, val, idx) => {
                const qId = module.questions[idx].id;
                const isReversed = rules.reversedQuestions.includes(qId);
                return sum + (isReversed ? rules.reversalMap[val] : val);
            }, 0);
        } else if (rules.method === 'sum_multiply') {
            const rawSum = answers.reduce((a, b) => a + b, 0);
            rawScore = rawSum * rules.multiplier;
        }

        return {
            rawScore,
            scaledScore: rawScore,
            maxScore: rules.maxScore
        };
    },

    /**
     * Interpret a score against the module's interpretation rules.
     * @param {string} moduleId
     * @param {number} score
     * @param {string} lang - language code
     * @returns {{ category, label, interpretation, flagColor }}
     */
    interpret(moduleId, score, lang = 'en') {
        const module = SCREENING_MODULES[moduleId];
        const rule = module.interpretationRules.find(r => score >= r.min && score <= r.max)
            || module.interpretationRules[module.interpretationRules.length - 1];

        return {
            category: rule.category,
            label: rule.label[lang] || rule.label['en'],
            interpretation: rule.interpretation[lang] || rule.interpretation['en'],
            flagColor: rule.flagColor
        };
    },

    /**
     * Check for safety concerns (PHQ-9 Q9).
     * @param {string} moduleId
     * @param {number[]} answers
     * @returns {boolean}
     */
    checkSafety(moduleId, answers) {
        if (moduleId === 'phq9' && answers.length >= 9) {
            return answers[8] > 0; // PHQ-9 Question 9 index is 8
        }
        return false;
    },

    /**
     * Full scoring result object.
     * @returns {{ screeningTool, rawScore, scaledScore, maxScore, category, label, interpretation, flagColor, selfHarmFlagged, recommendedActions }}
     */
    getFullResult(moduleId, answers, lang = 'en') {
        const { rawScore, scaledScore, maxScore } = this.calculate(moduleId, answers);
        const interp = this.interpret(moduleId, scaledScore, lang);
        const selfHarmFlagged = this.checkSafety(moduleId, answers);
        const module = SCREENING_MODULES[moduleId];
        const rawActions = module.recommendedActions[interp.category] || {};
        const actions = rawActions[lang] || rawActions['en'] || [];

        return {
            screeningTool: module.name,
            instrument: module.instrument,
            rawScore,
            scaledScore,
            maxScore,
            category: interp.category,
            label: interp.label,
            interpretation: interp.interpretation,
            flagColor: interp.flagColor,
            selfHarmFlagged,
            recommendedActions: actions
        };
    }
};

// ============================================================
// 6. GUIDANCE ENGINE
// ============================================================
const GuidanceEngine = {
    /**
     * Generate personalized guidance from scoring result + contextual answers.
     * @param {object} scoringResult - from ScoringEngine.getFullResult()
     * @param {string} concern - from Q2 (e.g. 'low_mood', 'anxiety')
     * @param {object[]} contextualAnswers - [{questionId, value}]
     * @param {string} lang
     * @returns {{ tier, summary, nextSteps, selfCare, supportInfo }}
     */
    generate(scoringResult, concern, contextualAnswers = [], lang = 'en') {
        const { category, flagColor, recommendedActions } = scoringResult;

        // Determine tier
        let tier = 'lower'; // lower / moderate / higher
        if (flagColor === 'moderate' || flagColor === 'mild') tier = 'moderate';
        if (flagColor === 'severe') tier = 'higher';

        const summaries = {
            lower: {
                en: 'Your responses suggest you are managing your well-being reasonably well. Keeping up with self-care is the most important next step.',
                hi: 'आपके उत्तर बताते हैं कि आप अपने मानसिक स्वास्थ्य को उचित रूप से प्रबंधित कर रहे हैं। स्व-देखभाल जारी रखना सबसे महत्वपूर्ण है।'
            },
            moderate: {
                en: 'Your responses indicate some areas that would benefit from attention. Self-care practices and speaking with a trusted person or healthcare worker are recommended.',
                hi: 'आपके उत्तर कुछ ऐसे क्षेत्रों का संकेत देते हैं जिन पर ध्यान देने की आवश्यकता है। स्व-देखभाल और किसी विश्वसनीय व्यक्ति से बात करना अनुशंसित है।'
            },
            higher: {
                en: 'Your responses indicate significant symptoms that would benefit from professional support. Please consider reaching out to a healthcare worker or calling a helpline.',
                hi: 'आपके उत्तर महत्वपूर्ण लक्षणों का संकेत देते हैं जिनके लिए पेशेवर सहायता की आवश्यकता है। कृपया किसी स्वास्थ्य कार्यकर्ता से संपर्क करें।'
            }
        };

        const selfCareByTier = {
            lower: {
                en: ['Maintain a regular sleep schedule (7–9 hours)', 'Daily physical activity for 20–30 minutes', 'Stay connected with friends and family', 'Practice mindfulness or breathing exercises'],
                hi: ['नियमित नींद का समय बनाए रखें (7-9 घंटे)', 'प्रतिदिन 20-30 मिनट शारीरिक गतिविधि', 'मित्रों और परिवार से जुड़े रहें', 'माइंडफुलनेस या श्वास अभ्यास करें']
            },
            moderate: {
                en: ['Practice Box Breathing (4-hold-6 technique) daily', 'Keep a daily mood and sleep journal', 'Limit caffeine and screen time after 8 PM', 'Speak with a trusted person about your feelings', 'Explore iCall or Tele-MANAS for free counseling'],
                hi: ['प्रतिदिन बॉक्स ब्रीदिंग तकनीक का अभ्यास करें', 'दैनिक मूड और नींद जर्नल रखें', 'शाम 8 बजे के बाद कैफीन और स्क्रीन समय सीमित करें']
            },
            higher: {
                en: ['Prioritize speaking with a healthcare professional', 'Contact Tele-MANAS: 14416 (available 24/7)', 'Visit your nearest Primary Health Centre', 'Tell a trusted person how you are feeling today', 'Avoid isolating yourself — stay in contact with others'],
                hi: ['स्वास्थ्य पेशेवर से बात करना प्राथमिकता दें', 'टेली-मानस से संपर्क करें: 14416 (24/7 उपलब्ध)', 'नजदीकी PHC जाएं', 'किसी विश्वसनीय व्यक्ति को आज बताएं कि आप कैसा महसूस कर रहे हैं']
            }
        };

        const supportInfo = {
            lower: { en: 'If your feelings worsen, do not hesitate to reach out to Tele-MANAS (14416) or your local PHC.', hi: 'यदि आपकी भावनाएं बिगड़ती हैं, तो टेली-मानस (14416) या अपने स्थानीय PHC से संपर्क करें।' },
            moderate: { en: 'Free counseling is available through Tele-MANAS (14416) and iCall (9152987821). Your local PHC can also provide guidance.', hi: 'टेली-मानस (14416) और iCall (9152987821) के माध्यम से मुफ्त परामर्श उपलब्ध है।' },
            higher: { en: 'Please reach out for support today: Tele-MANAS 14416 · Kiran Helpline 1800-599-0019 · iCall 9152987821 · Visit your nearest PHC.', hi: 'कृपया आज सहायता के लिए संपर्क करें: टेली-मानस 14416 · किरण हेल्पलाइन 1800-599-0019 · iCall 9152987821' }
        };

        return {
            tier,
            summary: summaries[tier][lang] || summaries[tier]['en'],
            nextSteps: recommendedActions,
            selfCare: selfCareByTier[tier][lang] || selfCareByTier[tier]['en'],
            supportInfo: supportInfo[tier][lang] || supportInfo[tier]['en']
        };
    }
};

// ============================================================
// 7. SAFETY CHECK
// ============================================================
const SafetyCheck = {
    /**
     * Check if safety screen should be shown.
     * Returns true if PHQ-9 Q9 was answered with any value > 0.
     */
    isRequired(moduleId, answers) {
        return ScoringEngine.checkSafety(moduleId, answers);
    },

    getSafetyContent(lang = 'en') {
        return {
            headline: {
                en: 'Your response suggests you may need support right now.',
                hi: 'आपका उत्तर बताता है कि आपको अभी सहायता की आवश्यकता हो सकती है।'
            },
            message: {
                en: 'You are not alone. If you are having thoughts of hurting yourself or feel unable to cope, please reach out to a real person for support right now.',
                hi: 'आप अकेले नहीं हैं। यदि आपके मन में खुद को नुकसान पहुंचाने के विचार आ रहे हैं, तो कृपया अभी किसी वास्तविक व्यक्ति से सहायता के लिए संपर्क करें।'
            },
            steps: {
                en: ['Tell a trusted friend, family member, or teacher how you are feeling right now.', 'Call a verified helpline — trained counselors are waiting.', 'Visit your nearest hospital or PHC emergency unit.', 'You do not have to face this alone.'],
                hi: ['किसी विश्वसनीय मित्र, परिवार के सदस्य या शिक्षक को बताएं कि आप अभी कैसा महसूस कर रहे हैं।', 'एक सत्यापित हेल्पलाइन पर कॉल करें — प्रशिक्षित परामर्शदाता इंतजार कर रहे हैं।', 'नजदीकी अस्पताल या PHC आपातकालीन इकाई में जाएं।']
            },
            helplines: [
                { name: 'Tele-MANAS', number: '14416', desc: { en: 'Govt. mental health network — 24/7', hi: 'सरकारी मानसिक स्वास्थ्य नेटवर्क — 24/7' } },
                { name: 'Kiran Helpline', number: '1800-599-0019', desc: { en: 'Ministry of Social Justice — Toll free', hi: 'सामाजिक न्याय मंत्रालय — टोल फ्री' } },
                { name: 'iCall', number: '9152987821', desc: { en: 'TISS trained counselors', hi: 'TISS प्रशिक्षित परामर्शदाता' } }
            ],
            disclaimer: {
                en: 'MindGuide AI does not manage crisis situations. Please contact a human support resource above.',
                hi: 'MindGuide AI संकट स्थितियों को प्रबंधित नहीं करता। कृपया ऊपर दिए गए मानव सहायता संसाधन से संपर्क करें।'
            }
        };
    }
};

// ============================================================
// 8. ADAPTIVE FLOW STATE (Extends appState in app.js)
// ============================================================
const ADAPTIVE_SCREENING_DEFAULTS = {
    active: false,
    phase: 'common_q1', // common_q1 | common_q2 | validated | contextual | result
    commonAnswers: { q1: null, q2: null },
    concern: null,          // from Q2 option value
    routedTool: null,       // 'phq9' | 'gad7' | 'pss4' | 'who5'
    validatedAnswers: [],
    contextualAnswers: [],
    scoringResult: null,
    guidanceResult: null,
    safetyRequired: false,
    isWorkerMode: false
};

// Export to window for access in app.js
window.SCREENING_MODULES = SCREENING_MODULES;
window.COMMON_QUESTIONS = COMMON_QUESTIONS;
window.CONTEXTUAL_QUESTIONS = CONTEXTUAL_QUESTIONS;
window.CONCERN_ROUTER = CONCERN_ROUTER;
window.ScoringEngine = ScoringEngine;
window.GuidanceEngine = GuidanceEngine;
window.SafetyCheck = SafetyCheck;
window.ADAPTIVE_SCREENING_DEFAULTS = ADAPTIVE_SCREENING_DEFAULTS;
