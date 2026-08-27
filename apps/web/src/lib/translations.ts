export const translations = {
  english: {
    // Navigation
    home: "Home",
    explore: "Explore",
    history: "History",
    profile: "Profile",
    notifications: "Notifications",

    // Dashboard
    dashboardTitle: "Sanjeevani Dashboard",
    dashboardSubtitle: "Your personal spiritual wellness and music healing space",
    recommendedSession: "Recommended Session",
    playNow: "Play Now",
    pause: "Pause",
    resume: "Resume",
    minute: "min",
    trimester: "Trimesters",
    ailments: "Ailments",
    corporateWellness: "Corporate Wellness",
    choosePathway: "Choose Pathway",
    discoverPathway: "Discover your pathway to well-being",
    activeSub: "Active Subscriptions",
    noSubs: "No active Surawali subscriptions yet.",
    cancelSub: "Cancel",
    play: "Play",

    // Preferences
    preferences: "Preferences",
    sessionReminders: "Session reminders",
    theme: "Theme",
    language: "Language",
    logout: "Log out",

    // Support
    support: "Support",
    privacyPolicy: "Privacy policy",
    termsOfUse: "Terms of use",
    helpContact: "Help & contact",

    // Onboarding
    chooseSanjeevani: "Choose Your Sanjeevani",
    sanjeevaniSub: "Select a pathway dedicated to your specific physical or spiritual well-being",
  },
  hindi: {
    // Navigation
    home: "मुख्य पृष्ठ",
    explore: "खोजें",
    history: "इतिहास",
    profile: "प्रोफ़ाइल",
    notifications: "सूचनाएं",

    // Dashboard
    dashboardTitle: "सजीवनी डैशबोर्ड",
    dashboardSubtitle: "आपका व्यक्तिगत आध्यात्मिक कल्याण और संगीत उपचार स्थान",
    recommendedSession: "अनुशंसित सत्र",
    playNow: "अभी चलाएं",
    pause: "रोकें",
    resume: "चलाएं",
    minute: "मिनट",
    trimester: "गर्भावस्था तिमाही",
    ailments: "शारीरिक विकार",
    corporateWellness: "कॉर्पोरेट कल्याण",
    choosePathway: "मार्ग चुनें",
    discoverPathway: "अपने कल्याण का मार्ग खोजें",
    activeSub: "सक्रिय सदस्यताएं",
    noSubs: "अभी तक कोई सक्रिय सुरावली सदस्यता नहीं है।",
    cancelSub: "रद्द करें",
    play: "चलाएं",

    // Preferences
    preferences: "प्राथमिकताएं",
    sessionReminders: "सत्र अनुस्मारक",
    theme: "थीम",
    language: "भाषा",
    logout: "लॉग आउट",

    // Support
    support: "सहायता",
    privacyPolicy: "गोपनीयता नीति",
    termsOfUse: "उपयोग की शर्तें",
    helpContact: "सहायता और संपर्क",

    // Onboarding
    chooseSanjeevani: "अपनी संजीवनी चुनें",
    sanjeevaniSub: "अपने विशिष्ट शारीरिक या आध्यात्मिक कल्याण के लिए समर्पित मार्ग चुनें",
  },
  sanskrit: {
    // Navigation
    home: "मुख्यपुटम्",
    explore: "अन्वेषणम्",
    history: "इतिहासः",
    profile: "विवरणिका",
    notifications: "सूचनाः",

    // Dashboard
    dashboardTitle: "संजीवनी फलकम्",
    dashboardSubtitle: "भवतः व्यक्तिगतं आध्यात्मिककल्याणं सङ्गीतोपचारस्थानञ्च",
    recommendedSession: "अनुशंसितः पाठः",
    playNow: "अधुना वाद्यताम्",
    pause: "विरामो भवतु",
    resume: "पुनः वाद्यताम्",
    minute: "क्षणः",
    trimester: "गर्भावस्थाकालः",
    ailments: "शारीरिकव्याधयः",
    corporateWellness: "उद्योगकल्याणम्",
    choosePathway: "मार्गं चिनोतु",
    discoverPathway: "स्वस्य कल्याणमार्गम् अन्वेषयतु",
    activeSub: "सक्रियग्राहकाः",
    noSubs: "अद्यापि कोऽपि सुरावलीग्राहको नास्ति।",
    cancelSub: "रद्दं करोतु",
    play: "वाद्यताम्",

    // Preferences
    preferences: "इष्टविकल्पाः",
    sessionReminders: "स्मरणकारिकाः",
    theme: "वर्णसङ्गतिः",
    language: "भाषा",
    logout: "बहिर्गमनम्",

    // Support
    support: "सहायता",
    privacyPolicy: "गोपनीयतानीतिः",
    termsOfUse: "नियमशर्ताः",
    helpContact: "सम्पर्कः",

    // Onboarding
    chooseSanjeevani: "स्व संजीवनीं चिनोतु",
    sanjeevaniSub: "शारीरिकमानसिककल्याणाय उत्तमं मार्गं चिनोतु",
  },
} as const;

export type TranslationKey = keyof typeof translations.english;

export function getTranslation(lang: "english" | "hindi" | "sanskrit", key: TranslationKey): string {
  const dict = translations[lang] || translations.english;
  return dict[key] || translations.english[key] || String(key);
}
