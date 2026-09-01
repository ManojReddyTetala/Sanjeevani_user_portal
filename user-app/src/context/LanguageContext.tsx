import React, { createContext, useContext, useState } from 'react';
import { LanguageCode } from '../types';

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  isTribal?: boolean;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  { code: 'mai', name: 'Maithili', nativeName: 'मैथिली' },
  { code: 'sat', name: 'Santali (Tribal)', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', isTribal: true },
  { code: 'brx', name: 'Bodo (Tribal)', nativeName: 'बड़ो', isTribal: true },
  { code: 'doi', name: 'Dogri', nativeName: 'डोगरी' },
  { code: 'ks', name: 'Kashmiri', nativeName: 'कॉशुर' },
  { code: 'kok', name: 'Konkani', nativeName: 'कोंकणी' },
  { code: 'mni', name: 'Manipuri / Meitei', nativeName: 'ꯃꯩꯇꯩꯂꯣᓐ' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्' },
  { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي' },
  { code: 'gon', name: 'Gondi (Tribal)', nativeName: 'गोण्डी', isTribal: true },
  { code: 'bhi', name: 'Bhili (Tribal)', nativeName: 'भीली', isTribal: true },
  { code: 'grt', name: 'Garo (Tribal)', nativeName: 'गारो', isTribal: true },
  { code: 'kha', name: 'Khasi (Tribal)', nativeName: 'खासी', isTribal: true },
  { code: 'lus', name: 'Mizo (Tribal)', nativeName: 'मिज़ो', isTribal: true },
  { code: 'hoc', name: 'Ho (Tribal)', nativeName: 'हो', isTribal: true },
  { code: 'unr', name: 'Mundari (Tribal)', nativeName: 'मुंडारी', isTribal: true },
  { code: 'kru', name: 'Kurukh (Tribal)', nativeName: 'कुड़ुख़', isTribal: true }
];

interface Translations {
  [key: string]: Record<string, string>;
}

const translations: Translations = {
  app_title: {
    en: 'Sanjeevani Citizen Healthcare Portal',
    hi: 'संजीवनी नागरिक स्वास्थ्य सेवा पोर्टल',
    te: 'సంజీవని పౌర ఆరోగ్య పోర్టల్',
    ta: 'சஞ்சீவனி குடிமக்கள் சுகாதார போர்டல்',
    kn: 'ಸಂಜೀವನಿ ನಾಗರಿಕ ರಕ್ಷಣೆ ಪೋರ್ಟಲ್',
    ml: 'സഞ്ജീവനി പൗര ആരോഗ്യ പോർട്ടൽ',
    mr: 'संजीवनी नागरिक आरोग्य पोर्टल',
    bn: 'সঞ্জীবনী নাগরিক স্বাস্থ্য সেবা পোর্টাল',
    gu: 'સંજીવની નાગરિક સ્વાસ્થ્ય પોર્ટલ',
    pa: 'ਸੰਜੀਵਨੀ ਨਾਗਰਿਕ ਸਿਹਤ ਪੋਰਟਲ'
  },
  citizen_portal: {
    en: 'Citizen Portal',
    hi: 'नागरिक पोर्टल',
    te: 'పౌరుల పోర్టల్',
    ta: 'குடிமக்கள் தளம் (Citizen Portal)',
    kn: 'ನಾಗರಿಕ ಪೋರ್ಟಲ್',
    ml: 'പൗര പോർട്ടൽ',
    mr: 'नागरिक पोर्टल',
    bn: 'নাগরিক পোর্টাল'
  },
  national_health_stack: {
    en: 'National Health Stack • Official Public Service',
    hi: 'राष्ट्रीय स्वास्थ्य स्टैक • आधिकारिक सार्वजनिक सेवा',
    te: 'జాతీయ ఆరోగ్య స్టాక్ • అధికారిక ప్రజా సేవ',
    ta: 'தேசிய சுகாதார அமைப்பு • அதிகாரப்பூர்வ பொது சேவை',
    kn: 'ರಾಷ್ಟ್ರೀಯ ಆರೋಗ್ಯ ಸೇವೆ • ಅಧಿಕೃತ ಸಾರ್ವಜನಿಕ ಸೇವೆ',
    ml: 'ദേശീയ ആരോഗ്യ സേവനം • ഔദ്യോഗിക പൊതുജന സേവനം'
  },
  greeting_afternoon: {
    en: 'Good afternoon',
    hi: 'शुभ दोपहर',
    te: 'శుభ మధ్యాహ్నం',
    ta: 'வணக்கம் (இனிய பிற்பகல்)',
    kn: 'ಶುಭ ಮಧ್ಯಾಹ್ನ',
    ml: 'ഉച്ചവന്ദനം',
    mr: 'शुभ दुपार',
    bn: 'শুভ অপরাহ্ন'
  },
  sanjeevani_health_id: {
    en: 'Sanjeevani Health ID',
    hi: 'संजीवनी स्वास्थ्य कार्ड (ID)',
    te: 'సంజీవని హెల్త్ ఐడి',
    ta: 'சஞ்சீவனி சுகாதார அடையாள அட்டை (Health ID)',
    kn: 'ಸಂಜೀವನಿ ಆರೋಗ್ಯ ಐಡಿ',
    ml: 'സഞ്ജീവനി ഹെൽത്ത് ഐഡി',
    mr: 'संजीवनी आरोग्य आयडी',
    bn: 'সঞ্জীবনী হেলথ আইডি'
  },
  search_placeholder_global: {
    en: 'Search hospitals, doctors, diagnostics, ICU beds...',
    hi: 'अस्पताल, डॉक्टर, जांच टेस्ट, आईसीयू बेड खोजें...',
    te: 'ఆసుపత్రులు, వైద్యులు, పరీక్షలు, ఐసియు బెడ్లు వెతకండి...',
    ta: 'மருத்துவமனைகள், மருத்துவர்கள், பரிசோதனைகள், ஐசியூ படுக்கைகளைத் தேடுங்கள்...',
    kn: 'ಆಸ್ಪತ್ರೆಗಳು, ವೈದ್ಯರು, ಪರೀಕ್ಷೆಗಳು, ಐಸಿಯು ಹಾಸಿಗೆಗಳನ್ನು ಹುಡುಕಿ...',
    ml: 'ആശുപത്രികൾ, ഡോക്ടർമാർ, പരിശോധനകൾ, ഐസിയു ബെഡുകൾ തിരയുക...'
  },
  online_mode_status: {
    en: 'ONLINE MODE',
    hi: 'ऑनलाइन मोड',
    te: 'ఆన్‌లైన్ మోడ్',
    ta: 'ஆன்லைன் முறை (ONLINE MODE)',
    kn: 'ಆನ್‌ಲೈನ್ ಮೋಡ್',
    ml: 'ഓൺലൈൻ മോഡ്'
  },
  offline_mode_status: {
    en: 'OFFLINE MODE ACTIVE',
    hi: 'ऑफ़लाइन मोड सक्रिय',
    te: 'ఆఫ్‌లైన్ మోడ్ సక్రియంగా ఉంది',
    ta: 'ஆஃப்லைன் முறை செயலில் ఉంది (OFFLINE MODE)',
    kn: 'ಆಫ್‌ಲೈನ್ ಮೋಡ್ ಸಕ್ರಿಯವಾಗಿದೆ',
    ml: 'ഓഫ്‌ലൈൻ മോഡ് സജീവമാണ്'
  },
  realtime_sync_banner: {
    en: 'Real-time bed availability, specialist search & inter-facility referrals connected.',
    hi: 'वास्तविक समय बिस्तर उपलब्धता, विशेषज्ञ खोज और अंतर-सुविधा रेफरल जुड़े हुए हैं।',
    te: 'నిజ-సమయ బెడ్ లభ్యత, నిపుణుల శోధన మరియు సౌకర్యాల మధ్య సూచనలు అనుసంధానించబడ్డాయి.',
    ta: 'நிகழ்நேர படுக்கை வசதி, நிபுணர் தேடல் மற்றும் மருத்துவமனை பரிந்துரைகள் இணைக்கப்பட்டுள்ளன.',
    kn: 'ನೈಜ-ಸಮಯದ ಹಾಸಿಗೆ ಲಭ್ಯತೆ, ತಜ್ಞರ ಹುಡುಕಾಟ ಮತ್ತು ಉಲ್ಲೇಖಗಳನ್ನು ಸಂಪರ್ಕಿಸಲಾಗಿದೆ.'
  },
  offline_active_banner: {
    en: 'Internet Disconnected — All online modules hidden. Accessing Emergency Assistance (108) & Health ID QR Portal Only.',
    hi: 'इंटरनेट डिस्कनेक्ट हुआ — सभी ऑनलाइन मॉड्यूल छिपा दिए गए। केवल आपातकालीन सहायता (108) और स्वास्थ्य कार्ड क्यूआर पोर्टल उपलब्ध है।',
    te: 'ఇంటర్నెట్ డిస్‌కనెక్ట్ అయింది — అన్ని ఆన్‌లైన్ మాడ్యూల్‌లు దాచబడ్డాయి. అత్యవసర సేవలు (108) మరియు హెల్త్ కార్డ్ QR పోర్టల్ మాత్రమే అందుబాటులో ఉన్నాయి.',
    ta: 'இணைய இணைப்பு துண்டிக்கப்பட்டது — ஆன்லைன் சேவைகள் மறைக்கப்பட்டுள்ளன. அவசர உதவி (108) மற்றும் ஹெல்த் ஐடி QR தளம் மட்டுமே இயங்கும்.'
  },
  last_synced: {
    en: 'Last Synced',
    hi: 'अंतिम सिंक',
    te: 'చివరిగా సమకాలీకరించబడింది',
    ta: 'கடைசியாக ஒத்திசைக்கப்பட்டது',
    kn: 'ಕೊನೆಯದಾಗಿ ಸಿಂಕ್ ಮಾಡಲಾಗಿದೆ'
  },
  live: {
    en: 'LIVE',
    hi: 'लाइव',
    te: 'లైవ్',
    ta: 'நேரலை (LIVE)',
    kn: 'ಲೈವ್'
  },
  simulate_online: {
    en: 'SWITCH TO ONLINE',
    hi: 'ऑनलाइन मोड पर स्विच करें',
    te: 'ఆన్‌లైన్‌కి మారండి',
    ta: 'ஆன்லைனுக்கு மாறவும் (SWITCH TO ONLINE)',
    kn: 'ಆನ್‌ಲೈನ್‌ಗೆ ಬದಲಾಯಿಸಿ'
  },
  simulate_offline: {
    en: 'SIMULATE OFFLINE',
    hi: 'ऑफ़लाइन मोड सिमुलेट करें',
    te: 'ఆఫ్‌లైన్‌ను సిమ్యులేట్ చేయండి',
    ta: 'ஆஃப்லைன் நிலையை அனுகவும் (SIMULATE OFFLINE)',
    kn: 'ಆಫ್‌ಲೈನ್‌ ಸೈಮ್ಯುಲೇಟ್ ಮಾಡಿ'
  },
  manual_location_badge: {
    en: 'MANUAL LOCATION',
    hi: 'मैनुअल स्थान',
    te: 'మాన్యువల్ ప్రాంతం',
    ta: 'கையேடு இருப்பிடம் (MANUAL LOCATION)',
    kn: 'ಮ್ಯಾನ್ಯುವಲ್ ಸ್ಥಳ'
  },
  gps_active_badge: {
    en: 'GPS ACTIVE',
    hi: 'जीपीएस सक्रिय',
    te: 'జిపిఎస్ సక్రియంగా ఉంది',
    ta: 'ஜிபிஎஸ் செயல்படுகிறது (GPS ACTIVE)',
    kn: 'ಜಿಪಿಎಸ್ ಸಕ್ರಿಯವಾಗಿದೆ'
  },
  home: {
    en: 'Home',
    hi: 'मुख्य पृष्ठ',
    te: 'హోమ్',
    ta: 'முகப்பு (Home)',
    kn: 'ಮುಖಪುಟ'
  },
  find_hospitals: {
    en: 'Find Healthcare',
    hi: 'अस्पताल खोजें',
    te: 'ఆరోగ్య సేవలను కనుగొనండి',
    ta: 'சுகாதார மையங்களை கண்டறியவும் (Find Healthcare)',
    kn: 'ಆಸ್ಪತ್ರೆ ಹುಡುಕಿ'
  },
  find_doctor: {
    en: 'Find Doctor',
    hi: 'डॉक्टर खोजें',
    te: 'వైద్యుడిని కనుగొనండి',
    ta: 'மருத்துவர் கண்டறியவும் (Find Doctor)',
    kn: 'ವೈದ್ಯರನ್ನು ಹುಡುಕಿ'
  },
  find_test: {
    en: 'Diagnostics',
    hi: 'जांच टेस्ट',
    te: 'పరీక్షల కేంద్రాలు',
    ta: 'பரிசோதனை மையம் (Diagnostics)',
    kn: 'ಪರೀಕ್ಷಾ ಕೇಂದ್ರ'
  },
  health_track: {
    en: 'Health Track',
    hi: 'हेल्थ ट्रैक',
    te: 'హెల్త్ ట్రాక్',
    ta: 'சுகாதார பாதை (Health Track)',
    kn: 'ಆರೋಗ್ಯ ಟ್ರ್ಯಾಕ್'
  },
  health_records: {
    en: 'Medical Records',
    hi: 'मेडिकल रिकॉर्ड्स',
    te: 'వైద్య రికార్డులు',
    ta: 'மருத்துவ பதிவுகள் (Medical Records)',
    kn: 'ವೈದ್ಯಕೀಯ ದಾಖಲೆಗಳು'
  },
  health_id: {
    en: 'My Health ID',
    hi: 'मेरा स्वास्थ्य कार्ड',
    te: 'నా ఆరోగ్య కార్డ్',
    ta: 'எனது சுகாதார அட்டை (My Health ID)',
    kn: 'ನನ್ನ ಆರೋಗ್ಯ ಕಾರ್ಡ್'
  },
  referrals: {
    en: 'Referrals',
    hi: 'रेफरल्स',
    te: 'రెఫరల్స్',
    ta: 'பரிந்துரைகள் (Referrals)',
    kn: 'ಉಲ್ಲೇಖಗಳು'
  },
  statistics: {
    en: 'Health Statistics',
    hi: 'स्वास्थ्य आंकड़े',
    te: 'ఆరోగ్య గణాంకాలు',
    ta: 'சுகாதார புள்ளிவிவரங்கள் (Statistics)',
    kn: 'ಆರೋಗ್ಯ ಅಂಕಿಅಂಶಗಳು'
  },
  emergency: {
    en: 'Emergency 108',
    hi: 'आपातकालीन सेवा 108',
    te: 'అత్యవసర సేవ 108',
    ta: 'அவசர சேவை 108 (Emergency 108)',
    kn: 'ತುರ್ತು ಸೇವೆ 108'
  },
  view_details: {
    en: 'View Details',
    hi: 'विवरण देखें',
    te: 'వివరాలు చూడండి',
    ta: 'விவரங்களை காண்க (View Details)',
    kn: 'ವಿವರಗಳನ್ನು ನೋಡಿ'
  },
  get_directions: {
    en: 'Get Directions',
    hi: 'दिशा-निर्देश प्राप्त करें',
    te: 'దిశలను పొందండి',
    ta: 'வழிமுறைகளைப் பெறுங்கள் (Get Directions)',
    kn: 'ದಿಕ್ಕುಗಳನ್ನು ಪಡೆಯಿರಿ'
  },
  call_facility: {
    en: 'Call Facility',
    hi: 'अस्पताल को कॉल करें',
    te: 'ఆసుపత్రికి కాల్ చేయండి',
    ta: 'மருத்துவமனைக்கு அழைக்கவும் (Call Facility)',
    kn: 'ಆಸ್ಪತ್ರೆಗೆ ಕರೆ ಮಾಡಿ'
  },
  download_pdf: {
    en: 'Download PDF Report',
    hi: 'पीडीएफ रिपोर्ट डाउनलोड करें',
    te: 'పిడిఎఫ్ నివేదికను డౌన్‌లోడ్ చేయండి',
    ta: 'PDF அறிக்கையைப் பதிவிறக்கவும் (Download PDF)',
    kn: 'PDF ವರದಿಯನ್ನು ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ'
  },
  back_to_dashboard: {
    en: 'Back to Dashboard',
    hi: 'डैशबोर्ड पर वापस जाएं',
    te: 'డాష్‌బోర్డ్‌కు తిరిగి వెళ్లండి',
    ta: 'டாஷ்போர்டிற்குத் திரும்பு (Back to Dashboard)',
    kn: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹಿಂತಿರುಗಿ'
  },
  change_location: {
    en: 'Change Location',
    hi: 'स्थान बदलें',
    te: 'ప్రాంతం మార్చండి',
    ta: 'இருப்பிடத்தை மாற்றவும் (Change Location)',
    kn: 'ಸ್ಥಳವನ್ನು ಬದಲಾಯಿಸಿ'
  },
  current_location: {
    en: 'Current Location',
    hi: 'वर्तमान स्थान',
    te: 'ప్రస్తుత ప్రాంతం',
    ta: 'தற்போதைய இருப்பிடம் (Current Location)',
    kn: 'ಪ್ರಸ್ತುತ ಸ್ಥಳ'
  },
  selected_location: {
    en: 'Selected Location',
    hi: 'चयनित स्थान',
    te: 'ఎంచుకున్న ప్రాంతం',
    ta: 'தேர்ந்தெடுக்கப்பட்ட இருப்பிடம் (Selected Location)',
    kn: 'ಆಯ್ಕೆಮಾಡಿದ ಸ್ಥಳ'
  },
  completed: {
    en: 'COMPLETED',
    hi: 'पूर्ण हुआ',
    te: 'పూర్తయింది',
    ta: 'முடிந்தது (COMPLETED)',
    kn: 'ಪೂರ್ಣಗೊಂಡಿದೆ'
  },
  action_required: {
    en: 'ACTION REQUIRED',
    hi: 'कार्रवाई आवश्यक',
    te: 'చర్య అవసరం',
    ta: 'நடவடிக்கை தேவை (ACTION REQUIRED)',
    kn: 'ಕ್ರಮ ಅಗತ್ಯವಿದೆ'
  },
  in_progress: {
    en: 'IN PROGRESS',
    hi: 'प्रगति पर है',
    te: 'పురోగతిలో ఉంది',
    ta: 'செயல்பாட்டில் உள்ளது (IN PROGRESS)',
    kn: 'ಪ್ರಗತಿಯಲ್ಲಿದೆ'
  },
  upcoming: {
    en: 'UPCOMING',
    hi: 'आगामी चरण',
    te: 'రాబోయే చర్య',
    ta: 'வரவிருக்கும் (UPCOMING)',
    kn: 'ಮುಂಬರುವ'
  },
  online_mode: {
    en: 'Online',
    hi: 'ऑनलाइन सिस्टम',
    te: 'ఆన్‌లైన్',
    ta: 'ஆன்லைன் (Online)',
    kn: 'ಆನ್‌ಲೈನ್'
  },
  offline_mode: {
    en: 'Offline Mode',
    hi: 'ऑफ़लाइन मोड',
    te: 'ఆఫ్‌లైన్ మోడ్',
    ta: 'ஆஃப்லைன் முறை (Offline Mode)',
    kn: 'ಆಫ್‌ಲೈನ್ ಮೋಡ್'
  },
  welcome_prompt: {
    en: 'What healthcare service do you need today?',
    hi: 'आज आपको किस स्वास्थ्य सेवा की आवश्यकता है?',
    te: 'ఈరోజు మీకు ఏ ఆరోగ్య సేవ అవసరం?',
    ta: 'இன்று உங்களுக்கு என்ன சுகாதார சேவை தேவை?'
  },
  phc_portal_title: {
    en: 'Primary Health Centre (PHC) Portal',
    hi: 'प्राथमिक स्वास्थ्य केंद्र (PHC) पोर्टल',
    te: 'ప్రాథమిక ఆరోగ్య కేంద్రం (PHC) పోర్టల్',
    ta: 'ஆரம்ப சுகாதார நிலையம் (PHC) தளம்',
    kn: 'ಪ್ರಾಥಮಿಕ ಆರೋಗ್ಯ ಕೇಂದ್ರ (PHC) ಪೋರ್ಟಲ್',
    ml: 'പ്രാഥമിക ആരോഗ്യ കേന്ദ്രം (PHC) പോർട്ടൽ',
    mr: 'प्राथमिक आरोग्य केंद्र (PHC) पोर्टल',
    bn: 'প্রাথমিক স্বাস্থ্য কেন্দ্র (PHC) পোর্টাল'
  },
  phc_dashboard: {
    en: 'PHC Dashboard',
    hi: 'पीएचसी डैशबोर्ड',
    te: 'PHC డాష్‌బోర్డ్',
    ta: 'PHC டாஷ்போர்டு',
    kn: 'PHC ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    mr: 'PHC डॅशबोर्ड',
    bn: 'PHC ড্যাশবোর্ড'
  },
  update_beds: {
    en: 'Update Beds',
    hi: 'बिस्तर अपडेट करें',
    te: 'బెడ్స్ అప్‌డేట్ చేయండి',
    ta: 'படுக்கைகளை புதுப்பிக்கவும்',
    kn: 'ಹಾಸಿಗೆಗಳನ್ನು ನವೀಕರಿಸಿ',
    mr: 'बेड्स अपडेट करा',
    bn: 'বেড আপডেট করুন'
  },
  doctors_duty: {
    en: 'Doctors on Duty',
    hi: 'ड्यूटी पर डॉक्टर',
    te: 'డ్యూటీలో ఉన్న వైద్యులు',
    ta: 'பணியில் உள்ள மருத்துவர்கள்',
    kn: 'ಕರ್ತವ್ಯದಲ್ಲಿರುವ ವೈದ್ಯರು',
    mr: 'ड्युटीवरील डॉक्टर',
    bn: 'দায়িত্বপ্রাপ্ত ডাক্তার'
  },
  nurses_duty: {
    en: 'Nurses on Duty',
    hi: 'ड्यूटी पर नर्सें',
    te: 'డ్యూటీలో ఉన్న నర్సులు',
    ta: 'பணியில் உள்ள செவிலியர்கள்',
    kn: 'ಕರ್ತವ್ಯದಲ್ಲಿರುವ ದಾದಿಯರು',
    mr: 'ड्युटीवरील परिचारिका',
    bn: 'দায়িত্বপ্রাপ্ত নার্স'
  },
  medicines_stock: {
    en: 'Medicines & Supplies',
    hi: 'दवाइयां और आपूर्ति',
    te: 'మందులు & సరఫరా',
    ta: 'மருந்துகள் & விநியோகம்',
    kn: 'ಔಷಧಿಗಳು ಮತ್ತು ಸರಬರಾಜು',
    mr: 'औषधे आणि पुरवठा',
    bn: 'ওষুধ ও সরবরাহ'
  },
  diagnostic_tests: {
    en: 'Diagnostic Tests',
    hi: 'जांच एवं टेस्ट सेवाएँ',
    te: 'రోగ నిర్ధారణ పరీక్షలు',
    ta: 'பரிசோதனை சேவைகள்',
    kn: 'ರೋಗನಿರ್ಣಯ ಪರೀಕ್ಷೆಗಳು',
    mr: 'निदान चाचण्या',
    bn: 'ডায়াগনস্টিক টেস্ট'
  },
  opd_queue: {
    en: 'OPD Patient Queue',
    hi: 'ओपीडी मरीज कतार',
    te: 'OPD రోగుల క్యూ',
    ta: 'OPD நோயாளி வரிசை',
    kn: 'OPD ರೋಗಿಗಳ ಸಾಲು',
    mr: 'OPD रुग्ण रांग',
    bn: 'OPD রোগী সারি'
  },
  status_available: {
    en: 'AVAILABLE',
    hi: 'उपलब्ध',
    te: 'అందుబాటులో ఉంది',
    ta: 'கிடைக்கிறது (AVAILABLE)',
    kn: 'ಲಭ್ಯವಿದೆ',
    mr: 'उपलब्ध',
    bn: 'উপলব্ধ'
  },
  status_limited: {
    en: 'LIMITED',
    hi: 'सीमित उपलब्धता',
    te: 'పరిమితం',
    ta: 'குறைவாக உள்ளது (LIMITED)',
    kn: 'ಸೀಮಿತ',
    mr: 'मर्यादित',
    bn: 'সীমিত'
  },
  status_unavailable: {
    en: 'UNAVAILABLE',
    hi: 'अनुपलब्ध',
    te: 'అందుబాటులో లేదు',
    ta: 'கிடைக்கவில்லை (UNAVAILABLE)',
    kn: 'ಲಭ್ಯವಿಲ್ಲ',
    mr: 'अनुपलब्ध',
    bn: 'অনুপলব্ধ'
  },
  voice_assistant: {
    en: 'Voice Assistant',
    hi: 'आवाज सहायक (Voice)',
    te: 'వాయిస్ అసిస్టెంట్',
    ta: 'குரல் உதவியாளர் (Voice)',
    kn: 'ಧ್ವನಿ ಸಹಾಯಕ',
    mr: 'व्हॉइस असिस्टंट',
    bn: 'ভয়েস সহকারী'
  },
  high_contrast_mode: {
    en: 'High Contrast Mode',
    hi: 'उच्च कंट्रास्ट मोड',
    te: 'హై కాంట్రాస్ట్ మోడ్',
    ta: 'அதிக மாறுபட்ட திரை (High Contrast)',
    kn: 'ಹೈ ಕಾಂಟ್ರಾಸ್ಟ್ ಮೋಡ್'
  },
  save_changes: {
    en: 'SAVE CHANGES',
    hi: 'परिवर्तन सहेजें',
    te: 'మార్పులను సేవ్ చేయండి',
    ta: 'மாற்றங்களை சேமிக்கவும்',
    kn: 'ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ',
    mr: 'बदल जतन करा',
    bn: 'সংরক্ষণ করুন'
  }
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('sih_language');
    return (saved as LanguageCode) || 'en';
  });

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem('sih_language', lang);
  };

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
