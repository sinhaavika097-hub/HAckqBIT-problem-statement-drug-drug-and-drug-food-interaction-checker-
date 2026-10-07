/**
 * Localization & Text-to-Speech (TTS) Architecture
 * Bio-Pharma Safety / Polypharmacy Management
 * Supports English (en), Hindi (hi), and Bengali (bn)
 */

import {
  SupportedLanguage,
  PatientExplanation,
  DrugDrugInteraction,
  DrugFoodInteraction,
} from '../types/interactions';

export interface TranslationDictionary {
  appTitle: string;
  appSubtitle: string;
  safetyDisclaimer: string;
  clinicianReviewNotice: string;
  searchPlaceholder: string;
  searchButton: string;
  searchingText: string;
  noInteractionsFound: string;
  drugDrugTab: string;
  drugFoodTab: string;
  graphTab: string;
  patientViewTab: string;
  doctorViewTab: string;
  ocrTab: string;
  severityLabel: string;
  severityLow: string;
  severityModerate: string;
  severityHigh: string;
  severityCritical: string;
  listenExplanation: string;
  listenDoctorSummary: string;
  stopVoice: string;
  ttsNotSupported: string;
  possibleAlternatives: string;
  uploadPrescription: string;
  confirmMedications: string;
  emptyStatePrompt: string;
}

export const TRANSLATIONS: Record<SupportedLanguage, TranslationDictionary> = {
  en: {
    appTitle: 'PolySafe',
    appSubtitle: 'Drug-Drug & Drug-Food Interaction Checker for Polypharmacy Patients',
    safetyDisclaimer:
      'Medical Safety Notice: This system is a clinical decision-support prototype. Never alter or discontinue medications without consulting your prescribing physician.',
    clinicianReviewNotice: 'Possible alternatives for clinician review only. Do not self-medicate.',
    searchPlaceholder: 'Search medicine by name or generic name (e.g. Warfarin, Aspirin, Atorvastatin)...',
    searchButton: 'Analyze Interactions',
    searchingText: 'Checking interaction database...',
    noInteractionsFound: 'No significant interactions detected for this medicine in current records.',
    drugDrugTab: 'Drug-Drug Interactions',
    drugFoodTab: 'Drug-Food Interactions',
    graphTab: 'Interactive Graph',
    patientViewTab: 'Patient-Friendly Explanation',
    doctorViewTab: 'Doctor-Facing Summary',
    ocrTab: 'Scan Prescription',
    severityLabel: 'Interaction Severity',
    severityLow: 'Low Severity',
    severityModerate: 'Moderate Severity',
    severityHigh: 'High Severity',
    severityCritical: 'Critical Severity',
    listenExplanation: 'Listen to Explanation (Voice)',
    listenDoctorSummary: 'Listen to Clinical Summary (Voice)',
    stopVoice: 'Stop Audio',
    ttsNotSupported: 'Speech synthesis is not supported on this browser.',
    possibleAlternatives: 'Possible alternatives for clinician review',
    uploadPrescription: 'Upload Prescription Image (Handwritten / Printed)',
    confirmMedications: 'Confirm & Check Interactions',
    emptyStatePrompt: 'Enter a medicine above or upload a prescription to explore potential safety interactions.',
  },
  hi: {
    appTitle: 'पॉली-सेफ (PolySafe)',
    appSubtitle: 'पॉलीफार्मेसी मरीजों के लिए दवा-दवा और दवा-भोजन परस्पर प्रभाव जांच प्रणाली',
    safetyDisclaimer:
      'चिकित्सा सुरक्षा सूचना: यह प्रणाली केवल एक प्रोटोटाइप है। अपने डॉक्टर से परामर्श किए बिना कभी भी दवा बंद या शुरू न करें।',
    clinicianReviewNotice: 'केवल डॉक्टर की समीक्षा के लिए संभावित विकल्प। स्वयं दवा न बदलें।',
    searchPlaceholder: 'दवा का नाम खोजें (जैसे: वारफेरिन, एस्पिरिन, एटोरवास्टेटिन)...',
    searchButton: 'प्रभाव की जांच करें',
    searchingText: 'डेटाबेस में जांच की जा रही है...',
    noInteractionsFound: 'वर्तमान रिकॉर्ड में इस दवा के लिए कोई महत्वपूर्ण दुष्प्रभाव नहीं पाया गया।',
    drugDrugTab: 'दवा-दवा परस्पर प्रभाव',
    drugFoodTab: 'दवा-भोजन परस्पर प्रभाव',
    graphTab: 'इंटरैक्टिव ग्राफ',
    patientViewTab: 'सरल भाषा में समझें (मरीज़ के लिए)',
    doctorViewTab: 'डॉक्टर सारांश',
    ocrTab: 'पर्चा (Rx) स्कैन करें',
    severityLabel: 'गंभीरता स्तर',
    severityLow: 'कम जोखिम (Low)',
    severityModerate: 'मध्यम जोखिम (Moderate)',
    severityHigh: 'उच्च जोखिम (High)',
    severityCritical: 'अत्यंत गंभीर जोखिम (Critical)',
    listenExplanation: 'आवाज़ में सुनें (Voice)',
    listenDoctorSummary: 'डॉक्टर का सारांश सुनें (Voice)',
    stopVoice: 'आवाज़ रोकें',
    ttsNotSupported: 'इस ब्राउज़र में बोलने की सुविधा उपलब्ध नहीं है।',
    possibleAlternatives: 'डॉक्टर की समीक्षा हेतु सुरक्षित विकल्प',
    uploadPrescription: 'पर्चे की फोटो अपलोड करें (हस्तलिखित / प्रिंटेड)',
    confirmMedications: 'दवाइयों की पुष्टि करें और जांचें',
    emptyStatePrompt: 'संभावित दुष्प्रभावों की जांच करने के लिए ऊपर दवा का नाम लिखें या पर्चा अपलोड करें।',
  },
  bn: {
    appTitle: 'পলি-সেফ (PolySafe)',
    appSubtitle: 'পলিফার্মেসি রোগীদের জন্য ওষুধ-ওষুধ এবং ওষুধ-খাবার মিথস্ক্রিয়া পরীক্ষক',
    safetyDisclaimer:
      'চিকিৎসা সতর্কতা: এই সিস্টেমটি কেবল একটি পরীক্ষামূলক সহায়ক। ডাক্তারের পরামর্শ ছাড়া কোনো ওষুধ বন্ধ বা পরিবর্তন করবেন না।',
    clinicianReviewNotice: 'কেবলমাত্র ডাক্তারের পর্যালোচনার জন্য সম্ভাব্য বিকল্প। নিজে ওষুধ পরিবর্তন করবেন না।',
    searchPlaceholder: 'ওষুধের নাম দিয়ে খুঁজুন (যেমন: ওয়ারফারিন, অ্যাসপিরিন)...',
    searchButton: 'পরীক্ষা করুন',
    searchingText: 'তথ্য যাচাই করা হচ্ছে...',
    noInteractionsFound: 'বর্তমান তথ্যে এই ওষুধের কোনো বিপজ্জনক মিথস্ক্রিয়া পাওয়া যায়নি।',
    drugDrugTab: 'ওষুধ-ওষুধ মিথস্ক্রিয়া',
    drugFoodTab: 'ওষুধ-খাবার মিথস্ক্রিয়া',
    graphTab: 'ইন্টারেক্টিভ গ্রাফ',
    patientViewTab: 'রোগীবান্ধব ব্যাখ্যা',
    doctorViewTab: 'ডাক্তারের সারাংশ',
    ocrTab: 'প্রেসক্রিপশন স্ক্যান করুন',
    severityLabel: 'ঝুঁকির মাত্রা',
    severityLow: 'স্বল্প ঝুঁকি (Low)',
    severityModerate: 'মাঝারি ঝুঁকি (Moderate)',
    severityHigh: 'উচ্চ ঝুঁকি (High)',
    severityCritical: 'মারাত্মক ঝুঁকি (Critical)',
    listenExplanation: 'ব্যাখ্যা শুনুন (ভয়েস)',
    listenDoctorSummary: 'ডাক্তারের সারাংশ শুনুন (ভয়েস)',
    stopVoice: 'অডিও বন্ধ করুন',
    ttsNotSupported: 'আপনার ব্রাউজারে ভয়েস সাপোর্ট নেই।',
    possibleAlternatives: 'ডাক্তারের পর্যালোচনার জন্য সম্ভাব্য বিকল্প',
    uploadPrescription: 'প্রেসক্রিপশনের ছবি আপলোড করুন',
    confirmMedications: 'ওষুধ নিশ্চিত করুন এবং পরীক্ষা করুন',
    emptyStatePrompt: 'ওষুধের সুরক্ষা ও পার্শ্বপ্রতিক্রিয়া দেখতে উপরে নাম অনুসন্ধান করুন বা প্রেসক্রিপশন আপলোড করুন।',
  },
};

/**
 * Helper to fetch localized string by key
 */
export function t(key: keyof TranslationDictionary, lang: SupportedLanguage = 'en'): string {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
  return dict[key] || TRANSLATIONS.en[key] || key;
}

/**
 * Text-to-Speech Controller with language mapping and graceful fallbacks
 */
export function speakText(
  text: string,
  lang: SupportedLanguage = 'en',
  onEnd?: () => void,
  onError?: (error: string) => void
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onError?.('Speech synthesis not supported');
    return false;
  }

  // Cancel any ongoing speech before starting new utterance
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const langCodeMap: Record<SupportedLanguage, string> = {
    en: 'en-US',
    hi: 'hi-IN',
    bn: 'bn-IN',
  };

  utterance.lang = langCodeMap[lang] || 'en-US';
  utterance.rate = 0.9; // Slightly slower for elderly patient clarity

  utterance.onend = () => onEnd?.();
  utterance.onerror = (e) => onError?.(e.error);

  window.speechSynthesis.speak(utterance);
  return true;
}

/**
 * Stops any ongoing audio speech
 */
export function stopSpeech(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Localized patient explanations for primary polypharmacy interactions
 */
export const LOCALIZED_INTERACTION_EXPLANATIONS: Record<
  string,
  Partial<Record<SupportedLanguage, PatientExplanation>>
> = {
  'ddi-warfarin-aspirin': {
    hi: {
      summary: 'वारफेरिन और एस्पिरिन को एक साथ लेने से आपके शरीर में गंभीर आंतरिक रक्तस्राव (ब्लीडिंग) का खतरा काफी बढ़ जाता है।',
      whatItMeans: 'ये दोनों दवाएं अलग-अलग तरीकों से आपके खून को पतला करती हैं। दोनों को साथ लेने से खून का थक्का जमने की क्षमता अत्यधिक कम हो जाती है।',
      whyItMatters: 'मामूली चोट लगने या पेट में बिना दिखे अल्सर होने पर भी जानलेवा रक्तस्राव हो सकता है।',
      actionAdvice: 'दवा को अचानक बंद न करें, लेकिन तुरंत अपने डॉक्टर से संपर्क करें और पूछें कि क्या दोनों दवाएं एक साथ लेना आवश्यक है।',
    },
    bn: {
      summary: 'ওয়ারফারিন এবং অ্যাসপিরিন একসাথে গ্রহণ করলে মারাত্মক অভ্যন্তরীণ রক্তক্ষরণের ঝুঁকি উল্লেখযোগ্যভাবে বৃদ্ধি পায়।',
      whatItMeans: 'উভয় ওষুধই রক্ত পাতলা করে। এদের সমন্বয়ে রক্ত জমাট বাঁধার ক্ষমতা অত্যন্ত কমে যায়।',
      whyItMatters: 'ছোটখাটো আঘাত বা পেটের আলসার থেকেও বিপজ্জনক রক্তক্ষরণ হতে পারে।',
      actionAdvice: 'হঠাৎ ওষুধ বন্ধ করবেন না, তবে অবিলম্বে আপনার প্রেসক্রিপশন প্রদানকারী চিকিৎসকের সাথে পরামর্শ করুন।',
    },
  },
  'dfi-atorvastatin-grapefruit': {
    hi: {
      summary: 'चकोतरा (ग्रेपफ्रूट) आपके शरीर को एटोरवास्टेटिन को पचाने से रोकता है, जिससे दवा की मात्रा खून में खतरनाक स्तर तक बढ़ सकती है।',
      whatItMeans: 'ग्रेपफ्रूट के तत्व लीवर के एंजाइम को रोकते हैं, जिससे कोलेस्ट्रॉल की यह दवा शरीर से बाहर नहीं निकल पाती।',
      whyItMatters: 'दवा की अत्यधिक मात्रा से मांसपेशियों में तेज दर्द, मांसपेशियों का टूटना और गुर्दे (किडनी) पर बुरा असर पड़ सकता है।',
      actionAdvice: 'एटोरवास्टेटिन लेते समय चकोतरा खाने या उसका जूस पीने से बचें।',
    },
    bn: {
      summary: 'বাতাবি লেবু (গ্রেপফ্রুট) অ্যাটোরভাস্ট্যাটিন ভাঙতে বাধা দেয়, যার ফলে রক্তে ওষুধের বিষাক্ত মাত্রা তৈরি হতে পারে।',
      whatItMeans: 'বাতাবি লেবুর উপাদান লিভারের এনজাইম ব্লক করে ওষুধ পরিষ্কার হতে বাধা দেয়।',
      whyItMatters: 'অতিরিক্ত ওষুধ জমা হলে পেশীর মারাত্মক ক্ষতি এবং কিডনির সমস্যা হতে পারে।',
      actionAdvice: 'অ্যাটোরভাস্ট্যাটিন খাওয়ার সময় বাতাবি লেবু বা এর জুস খাওয়া থেকে বিরত থাকুন।',
    },
  },
  'dfi-metformin-alcohol': {
    hi: {
      summary: 'मेटफॉर्मिन के साथ शराब पीने से लैक्टिक एसिडोसिस नामक दुर्लभ लेकिन गंभीर बीमारी का खतरा बढ़ जाता है।',
      whatItMeans: 'शराब लीवर की लैक्टेट को साफ करने की क्षमता को धीमा कर देती है, और मेटफॉर्मिन भी लैक्टिक एसिड को बढ़ाता है।',
      whyItMatters: 'इससे अत्यधिक थकान, मांसपेशियों में ऐंठन और सांस लेने में कठिनाई हो सकती है।',
      actionAdvice: 'मेटफॉर्मिन लेते समय अत्यधिक शराब पीने से बचें।',
    },
    bn: {
      summary: 'মেটফর্মিনের সাথে অ্যালকোহল পান করলে ল্যাকটিক অ্যাসিডোসিসের মারাত্মক ঝুঁকি বাড়ে।',
      whatItMeans: 'অ্যালকোহল লিভারের ল্যাকটেট অপসারণে বাধা দেয় এবং মেটফর্মিন ল্যাকটিক অ্যাসিড বৃদ্ধি করে।',
      whyItMatters: 'এর ফলে তীব্র ক্লান্তি এবং শ্বাসকষ্ট হতে পারে যা জরুরি চিকিৎসার প্রয়োজন তৈরি করে।',
      actionAdvice: 'মেটফর্মিন চলাকালীন অতিরিক্ত মদ্যপান সম্পূর্ণ পরিহার করুন।',
    },
  },
  'dfi-ciprofloxacin-dairy': {
    hi: {
      summary: 'दूध और दही में मौजूद कैल्शियम सिप्रोफ्लोक्सासिन के साथ बंध जाता है, जिससे आपका शरीर एंटीबायोटिक को ठीक से सोख नहीं पाता।',
      whatItMeans: 'कैल्शियम पेट में दवा के साथ मिलकर एक ऐसा यौगिक बनाता है जिसे शरीर सोख नहीं सकता।',
      whyItMatters: 'यदि दवा शरीर में अवशोषित नहीं होगी, तो संक्रमण (इन्फेक्शन) ठीक नहीं हो पाएगा।',
      actionAdvice: 'दूध, दही या कैल्शियम सप्लीमेंट लेने से कम से कम 2 घंटे पहले या 4 घंटे बाद सिप्रोफ्लोक्सासिन लें।',
    },
    bn: {
      summary: 'দুধ ও দইয়ের ক্যালসিয়াম সিপ্রোফ্লক্সাসিনের সাথে যুক্ত হয় এবং অ্যান্টিবায়োটিক শোষণে বাধা দেয়।',
      whatItMeans: 'ক্যালসিয়াম পেটে এমন একটি যৌগ গঠন করে যা শরীর গ্রহণ করতে পারে না।',
      whyItMatters: 'ওষুধ শরীরে শোষিত না হলে সংক্রমণ নিরাময় হবে না।',
      actionAdvice: 'দুধ বা দুগ্ধজাত খাবার খাওয়ার ২ ঘণ্টা আগে বা ৪ ঘণ্টা পরে এই ওষুধ সেবন করুন।',
    },
  },
};

/**
 * Returns localized patient explanation, falling back to English defaults
 */
export function getLocalizedPatientExplanation(
  interactionId: string,
  lang: SupportedLanguage,
  fallback: PatientExplanation
): PatientExplanation {
  if (lang === 'en') return fallback;
  const match = LOCALIZED_INTERACTION_EXPLANATIONS[interactionId]?.[lang];
  return match || fallback;
}

/**
 * Localized clinical doctor summaries for speech synthesis
 */
export const LOCALIZED_DOCTOR_SUMMARIES: Record<
  string,
  Partial<Record<SupportedLanguage, string>>
> = {
  'ddi-warfarin-aspirin': {
    hi: 'वारफेरिन और एस्पिरिन का क्लिनिकल सारांश। गंभीरता स्तर: क्रिटिकल। औषधीय क्रियाविधि: दोनों दवाएं अलग-अलग तंत्र से काम करती हैं। एस्पिरिन प्लेटलेट साइक्लोऑक्सीजिनेज को रोकती है और वारफेरिन विटामिन के-निर्भर क्लॉटिंग कारकों को बाधित करती है। संयुक्त उपयोग से जानलेवा रक्तस्राव का जोखिम 3 से 5 गुना बढ़ जाता है। सुझाई गई नैदानिक कार्रवाई: दोनों दवाओं के समवर्ती उपयोग के औचित्य की दोबारा समीक्षा करें। यदि अपरिहार्य हो, तो पीटी और आईएनआर की सख्त निगरानी करें और गैस्ट्रोप्रोटेक्शन के लिए पीपीआई जोड़ने पर विचार करें। चिकित्सक समीक्षा हेतु विकल्प: क्लोपिडोग्रेल या आवश्यकतानुसार कम खुराक।',
    bn: 'ওয়ারফারিন এবং অ্যাসপিরিনের ক্লিনিকাল সারাংশ। ঝুঁকির মাত্রা: মারাত্মক বা ক্রিটিক্যাল। ফার্মাকোলজিকাল মেকানিজম: উভয় ওষুধ স্বাধীন পদ্ধতিতে রক্ত পাতলা করে। অ্যাসপিরিন প্লেটলেট ফাংশন বাধা দেয় এবং ওয়ারফারিন ভিটামিন কে জমাট বাঁধার কারণগুলিকে রোধ করে, যা অভ্যন্তরীণ রক্তক্ষরণের ঝুঁকি ৩ থেকে ৫ গুণ বাড়িয়ে দেয়। প্রস্তাবিত ক্লিনিকাল পদক্ষেপ: উভয় ওষুধ একসাথে ব্যবহারের প্রয়োজনীয়তা পুনর্বিবেচনা করুন। অনিবার্য হলে পিটি এবং আইএনআর কঠোরভাবে পর্যবেক্ষণ করুন এবং গ্যাস্ট্রিক সুরক্ষার জন্য পিপিআই বিবেচনা করুন। পর্যালোচনার বিকল্প: ক্লোপিডোগ্রেল বা নির্দেশিত একক থেরাপি।',
  },
  'ddi-warfarin-ciprofloxacin': {
    hi: 'वारफेरिन और सिप्रोफ्लोक्सासिन का क्लिनिकल सारांश। गंभीरता स्तर: उच्च या हाई। औषधीय क्रियाविधि: सिप्रोफ्लोक्सासिन सीवाईपी1ए2 और सीवाईपी3ए4 एंजाइम को रोकता है तथा आंतों के विटामिन के उत्पन्न करने वाले बैक्टीरिया को नष्ट करता है, जिससे वारफेरिन का प्रभाव अचानक अनियंत्रित होकर आईएनआर खतरनाक स्तर तक बढ़ सकता है। सुझाई गई कार्रवाई: सिप्रोफ्लोक्सासिन शुरू करने के तीसरे दिन आईएनआर की जांच करें और वारफेरिन की खुराक 30 से 50 प्रतिशत तक कम करने पर विचार करें।',
    bn: 'ওয়ারফারিন এবং সিপ্রোফ্লক্সাসিনের ক্লিনিকাল সারাংশ। ঝুঁকির মাত্রা: উচ্চ। মেকানিজম: সিপ্রোফ্লক্সাসিন হেপাটিক সাইটোক্রোম এনজাইম বাধা দেয় এবং অন্ত্রের ভিটামিন কে সংশ্লেষণকারী মাইক্রোবায়োটা হ্রাস করে, যার ফলে ওয়ারফারিনের ক্ষমতা ও আইএনআর বিপজ্জনকভাবে বৃদ্ধি পায়। পদক্ষেপ: সিপ্রোফ্লক্সাসিন চলাকালীন ঘন ঘন আইএনআর পরীক্ষা করুন এবং সাময়িকভাবে ওয়ারফারিনের ডোজ হ্রাস বিবেচনা করুন।',
  },
  'dfi-atorvastatin-grapefruit': {
    hi: 'एटोरवास्टेटिन और चकोतरा (ग्रेपफ्रूट) का क्लिनिकल सारांश। गंभीरता स्तर: मध्यम। औषधीय क्रियाविधि: ग्रेपफ्रूट में मौजूद फुरानोकॉउमारिन आंतों के सीवाईपी3ए4 एंजाइम को बाधित करते हैं, जिससे एटोरवास्टेटिन का फर्स्ट-पास मेटाबॉलिज्म घट जाता है और सीरम कंसंट्रेशन कई गुना बढ़ जाती है। कार्रवाई: मरीज को सलाह दें कि स्टैटिन थेरेपी के दौरान ग्रेपफ्रूट और उसके जूस का सेवन न करें, ताकि मायोपैथी और रबडोमायोलिसिस का जोखिम न हो।',
    bn: 'অ্যাটোরভাস্ট্যাটিন এবং গ্রেপফ্রুটের ক্লিনিকাল সারাংশ। ঝুঁকির মাত্রা: মাঝারি। ফার্মাকোলজি: বাতাবি লেবুর উপাদান অন্ত্রের সিওয়াইপি৩এ৪ এনজাইম নিষ্ক্রিয় করে রক্তে অ্যাটোরভাস্ট্যাটিনের ঘনত্ব বৃদ্ধি করে, যা মায়োপ্যাথি এবং পেশী ভাঙার ঝুঁকি বাড়ায়। সুপারিশ: এই ওষুধ চলাকালীন বাতাবি লেবু বা এর রস গ্রহণ সম্পূর্ণরূপে বন্ধ রাখতে রোগীকে নির্দেশ দিন।',
  },
  'dfi-metformin-alcohol': {
    hi: 'मेटफॉर्मिन और अल्कोहल का क्लिनिकल सारांश। गंभीरता स्तर: उच्च। औषधीय क्रियाविधि: अत्यधिक अल्कोहल हेपेटिक ग्लूकोनियोजेनेसिस को बाधित करता है और लैक्टेट क्लीयरेंस को धीमा करता है, जिससे मेटफॉर्मिन-संबद्ध लैक्टिक एसिडोसिस का तीव्र जोखिम उत्पन्न होता है। कार्रवाई: रोगी को मेटफॉर्मिन के साथ शराब का अत्यधिक सेवन न करने की सख्त सलाह दें और रीनल फंक्शन की नियमित निगरानी करें।',
    bn: 'মেটফর্মিন এবং অ্যালকোহলের ক্লিনিকাল সারাংশ। ঝুঁকির মাত্রা: উচ্চ। মেকানিজম: অ্যালকোহল লিভারের ল্যাকটেট ক্লিয়ারেন্স বাধাগ্রস্ত করে, যা মেটফর্মিনের সাথে বিপজ্জনক ল্যাকটিক অ্যাসিডোসিস ঘটাতে পারে। পদক্ষেপ: মেটফর্মিন গ্রহণকারী রোগীদের অ্যালকোহল এড়িয়ে চলার জোরালো পরামর্শ দিন এবং কিডনির কার্যকারিতা পর্যবেক্ষণ করুন।',
  },
  'dfi-ciprofloxacin-dairy': {
    hi: 'सिप्रोफ्लोक्सासिन और डेयरी उत्पादों का क्लिनिकल सारांश। गंभीरता स्तर: मध्यम। औषधीय क्रियाविधि: दूध और दही में उपस्थित डाइवलेंट कैल्शियम आयन सिप्रोफ्लोक्सासिन के साथ चिलेट कॉम्पलेक्स बनाते हैं, जिससे एंटीबायोटिक का बायोएवेलेबिलिटी 70 प्रतिशत तक घट जाता है और संक्रमण का इलाज विफल हो सकता है। कार्रवाई: डेयरी उत्पादों और सिप्रोफ्लोक्सासिन के सेवन में कम से कम 2 से 4 घंटे का अंतर रखें।',
    bn: 'সিপ্রোফ্লক্সাসিন এবং দুগ্ধজাত খাবারের ক্লিনিকাল সারাংশ। ঝুঁকির মাত্রা: মাঝারি। মেকানিজম: দুধের ক্যালসিয়াম সিপ্রোফ্লক্সাসিনের সাথে চিলেশন তৈরি করে ওষুধ শোষণ ৭০% পর্যন্ত কমিয়ে দেয়, যার ফলে সংক্রমণ চিকিৎসায় ব্যর্থতা আসতে পারে। সুপারিশ: দুগ্ধজাত খাবারের কমপক্ষে ২ ঘণ্টা আগে অথবা ৪ ঘণ্টা পরে অ্যান্টিবায়োটিক সেবন নিশ্চিত করুন।',
  },
};

/**
 * Returns localized text string for Doctor Speech synthesis
 */
export function getLocalizedDoctorSpeech(
  interaction: DrugDrugInteraction | DrugFoodInteraction,
  lang: SupportedLanguage
): string {
  const isDrugDrug = interaction.type === 'DRUG_DRUG';
  const primaryName = isDrugDrug ? interaction.primaryDrug.name : interaction.drug.name;
  const targetName = isDrugDrug ? interaction.interactingDrug.name : interaction.food.name;

  if (lang === 'en') {
    const monitoringText = interaction.doctorSummary.monitoringParameters?.length
      ? `Key monitoring parameters: ${interaction.doctorSummary.monitoringParameters.join(', ')}.`
      : '';
    const alternativesText = interaction.doctorSummary.alternativesForReview?.length
      ? `Possible clinician review alternatives: ${interaction.doctorSummary.alternativesForReview.map((a) => a.medicineName).join(', ')}.`
      : '';

    return `Clinical doctor summary for ${primaryName} and ${targetName}. Severity: ${interaction.severity}. Evidence level: ${interaction.doctorSummary.evidenceLevel}. Pharmacological mechanism: ${interaction.doctorSummary.clinicalMechanism}. Suggested clinical action: ${interaction.doctorSummary.suggestedAction}. ${monitoringText} ${alternativesText}`;
  }

  // Check tailored regional summary dictionary
  const tailored = LOCALIZED_DOCTOR_SUMMARIES[interaction.id]?.[lang];
  if (tailored) return tailored;

  // Fallback programmatic regional synthesizer
  if (lang === 'hi') {
    const monitoringText = interaction.doctorSummary.monitoringParameters?.length
      ? `निगरानी पैरामीटर: ${interaction.doctorSummary.monitoringParameters.join(', ')}।`
      : '';
    return `${primaryName} और ${targetName} का डॉक्टर सारांश। गंभीरता: ${interaction.severity}। औषधीय क्रियाविधि: ${interaction.doctorSummary.clinicalMechanism}। सुझाई गई नैदानिक कार्रवाई: ${interaction.doctorSummary.suggestedAction}। ${monitoringText}`;
  }

  if (lang === 'bn') {
    const monitoringText = interaction.doctorSummary.monitoringParameters?.length
      ? `পর্যবেক্ষণ নির্দেশিকা: ${interaction.doctorSummary.monitoringParameters.join(', ')}।`
      : '';
    return `${primaryName} এবং ${targetName}-এর জন্য ক্লিনিকাল সারাংশ। ঝুঁকির মাত্রা: ${interaction.severity}। মেকানিজম: ${interaction.doctorSummary.clinicalMechanism}। প্রস্তাবিত পদক্ষেপ: ${interaction.doctorSummary.suggestedAction}। ${monitoringText}`;
  }

  return interaction.doctorSummary.clinicalMechanism;
}


