import React, { createContext, useContext, useState } from 'react';
import { LanguageCode } from '../types';

interface Translations {
  [key: string]: Record<LanguageCode, string>;
}

const translations: Translations = {
  app_title: {
    en: 'SIH Healthcare Citizen App',
    hi: 'एसआईएच स्वास्थ्य सेवा नागरिक ऐप',
    bn: 'এসআইএইচ নাগরিক অ্যাপ',
    ta: 'SIH சுகாதார தளம்',
    te: 'SIH పౌర వేదిక',
    mr: 'SIH नागरिक ॲप',
    gu: 'SIH નાગરિક એપ્લિકેશન',
    kn: 'SIH ನಾಗರಿಕ ಅಪ್ಲಿಕೇಶನ್'
  },
  find_hospitals: {
    en: 'Find Hospital',
    hi: 'अस्पताल खोजें',
    bn: 'হাসপাতাল খুঁজুন',
    ta: 'மருத்துவமனை கண்டறியவும்',
    te: 'ఆసుపత్రిని కనుగొనండి',
    mr: 'रुग्णालय शोधा',
    gu: 'હોસ્પિટલ શોધો',
    kn: 'ಆಸ್ಪತ್ರೆ ಹುಡುಕಿ'
  },
  find_doctor: {
    en: 'Find Doctor',
    hi: 'डॉक्टर खोजें',
    bn: 'ডাক্তার খুঁজুন',
    ta: 'மருத்துவர் கண்டறியவும்',
    te: 'వైద్యుడిని కనుగొనండి',
    mr: 'डॉक्टर शोधा',
    gu: 'ડૉક્ટર શોધો',
    kn: 'ವೈದ್ಯರನ್ನು ಹುಡುಕಿ'
  },
  find_test: {
    en: 'Find Diagnostic Test',
    hi: 'जांच टेस्ट खोजें',
    bn: 'পরীক্ষা খুঁজুন',
    ta: 'பரிசோதனை கண்டறியவும்',
    te: 'పరీక్షను కనుగొనండి',
    mr: 'तपासणी शोधा',
    gu: 'ટેસ્ટ શોધો',
    kn: 'ಪರೀಕ್ಷೆ ಹುಡುಕಿ'
  },
  health_records: {
    en: 'My Health Records',
    hi: 'मेरी मेडिकल हिस्ट्री',
    bn: 'স্বাস্থ্য রেকর্ড',
    ta: 'சுகாதார பதிவுகள்',
    te: 'నా ఆరోగ్య రికార్డులు',
    mr: 'माझे आरोग्य रेकॉर्ड',
    gu: 'મારું સ્વાસ્થ્ય રેકોર્ડ',
    kn: 'ನನ್ನ ರಕ್ಷಣೆ ದಾಖಲೆಗಳು'
  },
  health_id: {
    en: 'My Health ID & QR',
    hi: 'मेरा स्वास्थ्य कार्ड QR',
    bn: 'ডিজিটাল আইডি QR',
    ta: 'சுகாதார அட்டை QR',
    te: 'ఆరోగ్య కార్డ్ QR',
    mr: 'आरोग्य आयडी QR',
    gu: 'હેલ્થ કાર્ડ QR',
    kn: 'ಆರೋಗ್ಯ ಕಾರ್ಡ್ QR'
  },
  voice_assistant: {
    en: 'Speak / AI Assistant',
    hi: 'बोलें / AI सहायक',
    bn: 'কথা বলুন / সহকারী',
    ta: 'பேசவும் / உதவி',
    te: 'మాట్లాడండి / అసిస్టెంట్',
    mr: 'बोला / AI सहाय्यक',
    gu: 'બોલો / AI આસિસ્ટન્ટ',
    kn: 'ಮಾತನಾಡಿ / ಅಸಿಸ್ಟೆಂಟ್'
  }
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<LanguageCode>('en');

  const t = (key: string): string => {
    if (translations[key] && translations[key][language]) {
      return translations[key][language];
    }
    if (translations[key] && translations[key]['en']) {
      return translations[key]['en'];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
