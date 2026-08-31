export interface AiResponse {
  query: string;
  response: string;
  actions: Array<{ type: string; target?: string; key?: string; value?: string | number }>;
  timestamp: string;
}

export function processAiMessage(message: string, lat?: number, lng?: number): AiResponse {
  const text = message.toLowerCase().trim();
  let responseText = '';
  let actions: Array<{ type: string; target?: string; key?: string; value?: string | number }> = [];

  if (text === 'hi' || text === 'hello' || text === 'hey') {
    responseText = 'Hello! I am your SIH Healthcare Assistant. How can I help you today? You can ask me to find hospitals near you, search for cardiologists, or locate diagnostic labs.';
  } else if (text.includes('hospital near me') || text.includes('nearest hospital') || text.includes('find hospital')) {
    responseText = `Searching nearby real-world healthcare facilities around your location (${lat?.toFixed(4) || '16.9891'}°, ${lng?.toFixed(4) || '82.2475'}°). Navigating to Healthcare Discovery...`;
    actions = [{ type: 'navigate', target: 'hospitals' }];
  } else if (text.includes('take me to') || text.includes('directions')) {
    responseText = 'Navigating to Healthcare Discovery. Click the "Directions" button on any facility to open Google Maps navigation immediately!';
    actions = [{ type: 'navigate', target: 'hospitals' }];
  } else if (text.includes('cardiologist') || text.includes('doctor')) {
    responseText = 'Filtering on-duty cardiologists and specialist doctors near you...';
    actions = [
      { type: 'navigate', target: 'doctors' },
      { type: 'set_filter', key: 'specialty', value: 'Cardiologist' }
    ];
  } else if (text.includes('mri') || text.includes('scan') || text.includes('ct scan') || text.includes('x-ray')) {
    responseText = 'Searching diagnostic centers providing MRI 3T & CT Scans near your active location...';
    actions = [
      { type: 'navigate', target: 'diagnostics' },
      { type: 'set_filter', key: 'test', value: 'MRI' }
    ];
  } else if (text.includes('phc') || text.includes('primary health')) {
    responseText = 'Locating nearby Primary Health Centres (PHCs) and Community Health Centres (CHCs)...';
    actions = [{ type: 'navigate', target: 'hospitals' }];
  } else if (text.includes('statistic') || text.includes('stat') || text.includes('vitals') || text.includes('analysis')) {
    responseText = 'Opening your Health Statistics dashboard based exclusively on your authorized medical records...';
    actions = [{ type: 'navigate', target: 'statistics' }];
  } else if (text.includes('how many consultation') || text.includes('consultation count')) {
    responseText = 'Navigating to your Health Statistics. Your medical records contain documented consultations from authorized health centers.';
    actions = [{ type: 'navigate', target: 'statistics' }];
  } else if (text.includes('when was my last mri') || text.includes('mri date')) {
    responseText = 'Navigating to Health Statistics and Medical History. Your diagnostic radiology reports are cataloged chronologically in your medical timeline.';
    actions = [{ type: 'navigate', target: 'statistics' }];
  } else if (text.includes('record') || text.includes('prescription') || text.includes('history')) {
    responseText = 'Opening your centralized medical history timeline and prescriptions...';
    actions = [{ type: 'navigate', target: 'records' }];
  } else if (text.includes('health id') || text.includes('qr') || text.includes('uid')) {
    responseText = 'Displaying your Permanent SIH Health ID and QR token...';
    actions = [{ type: 'navigate', target: 'identity' }];
  } else if (text.includes('25 km') || text.includes('radius')) {
    responseText = 'Setting healthcare discovery search radius to 25 KM...';
    actions = [
      { type: 'navigate', target: 'hospitals' },
      { type: 'set_radius', value: 25 }
    ];
  } else {
    responseText = `I understand your query regarding "${message}". You can ask me to find hospitals with ICU beds, locate specialists, search for MRI scans, or view your medical records.`;
  }

  return {
    query: message,
    response: responseText,
    actions,
    timestamp: new Date().toISOString()
  };
}
