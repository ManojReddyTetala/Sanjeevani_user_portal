import PDFDocument from 'pdfkit';

export function generateMedicalRecordPDF(patient: any, records: any[], referrals: any[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      const addFooter = (pageNum: number) => {
        doc.fillColor('#94a3b8').fontSize(8).font('Helvetica');
        doc.text('DEMO / SAMPLE — NOT A REAL MEDICAL RECORD', 40, doc.page.height - 25, { continued: true });
        doc.text(`Page ${pageNum}`, { align: 'right' });
      };

      // ==========================================
      // PAGE 1: HEALTHCARE RECORD (OVERVIEW & VITALS)
      // ==========================================
      doc.fillColor('#000000').fontSize(22).font('Helvetica-Bold').text('HEALTHCARE RECORD', { align: 'center' });
      doc.moveDown(0.2);
      doc.fillColor('#dc2626').fontSize(10).font('Helvetica-Bold').text('DEMO / SAMPLE DOCUMENT\nNOT A REAL MEDICAL RECORD', { align: 'center' });
      doc.moveDown(1);

      // Patient Identity Table
      const patientRows = [
        ['Patient Name', patient.name || 'Manoj'],
        ['Health ID', 'DEMO-HEALTH-9842'],
        ['Record ID', 'DEMO-REC-2026-001'],
        ['Date of Birth', '12 May 1998 (DEMO)'],
        ['Age', `${patient.age || 28} years (as of 30 Aug 2026)`],
        ['Sex', `${patient.gender || 'Male'} (DEMO)`],
        ['Blood Group', `${patient.blood_group || 'O Positive'} (DEMO)`],
        ['Known Allergies', 'No known drug allergies reported in this sample'],
        ['Emergency Contact', `Demo Contact — ${patient.emergency_contact || '+91-90000-00000'}`],
        ['Primary Care Facility', 'Sample Medical Centre'],
        ['Record Status', 'Active demo longitudinal record']
      ];

      patientRows.forEach(([k, v]) => {
        const y = doc.y;
        doc.rect(40, y, 160, 18).fillAndStroke('#f8fafc', '#e2e8f0');
        doc.rect(200, y, 355, 18).stroke('#e2e8f0');
        doc.fillColor('#1e293b').fontSize(8.5).font('Helvetica-Bold').text(k, 45, y + 4);
        doc.fillColor('#334155').fontSize(8.5).font('Helvetica').text(v, 205, y + 4);
        doc.y = y + 18;
      });

      doc.moveDown(1);

      // Banner 1: Vitals
      doc.fillColor('#1e3a8a').rect(40, doc.y, 515, 20).fill();
      doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold').text('CURRENT VITAL STATISTICS — 30 AUG 2026', 45, doc.y - 15);
      doc.moveDown(0.5);

      const vitalsRows = [
        ['Blood Pressure', '120/80 mmHg'],
        ['Heart Rate', '72 bpm'],
        ['SpO2', '98 %'],
        ['Temperature', '36.7 °C'],
        ['Height', '172 cm'],
        ['Weight', '68 kg'],
        ['BMI', '23.0 kg/m²']
      ];

      vitalsRows.forEach(([k, v]) => {
        const y = doc.y;
        doc.rect(40, y, 160, 16).fillAndStroke('#f8fafc', '#e2e8f0');
        doc.rect(200, y, 355, 16).stroke('#e2e8f0');
        doc.fillColor('#1e293b').fontSize(8).font('Helvetica-Bold').text(k, 45, y + 3);
        doc.fillColor('#334155').fontSize(8).font('Helvetica').text(v, 205, y + 3);
        doc.y = y + 16;
      });

      doc.moveDown(1);

      // Banner 2: Problems
      doc.fillColor('#1e3a8a').rect(40, doc.y, 515, 20).fill();
      doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold').text('ACTIVE / HISTORICAL PROBLEM LIST', 45, doc.y - 15);
      doc.moveDown(0.5);

      const probHeaderY = doc.y;
      doc.rect(40, probHeaderY, 515, 16).fill('#f1f5f9');
      doc.fillColor('#0f172a').fontSize(8).font('Helvetica-Bold');
      doc.text('Condition / Problem', 45, probHeaderY + 3);
      doc.text('First Recorded', 180, probHeaderY + 3);
      doc.text('Status', 260, probHeaderY + 3);
      doc.text('Notes', 330, probHeaderY + 3);
      doc.y = probHeaderY + 16;

      const probRows = [
        ['Seasonal allergic rhinitis', '18 May 2025', 'Intermittent', 'Symptoms mainly during seasonal exposure'],
        ['Vitamin D insufficiency', '22 Jun 2025', 'Historical', 'Improved on follow-up sample'],
        ['Acute viral upper respiratory infection', '09 Nov 2025', 'Resolved', 'Supportive treatment only'],
        ['Routine preventive health review', '30 Aug 2026', 'Current', 'No acute concerns documented']
      ];

      probRows.forEach(([c, f, s, n]) => {
        const y = doc.y;
        doc.rect(40, y, 515, 18).stroke('#e2e8f0');
        doc.fillColor('#334155').fontSize(8).font('Helvetica');
        doc.text(c, 45, y + 4);
        doc.text(f, 180, y + 4);
        doc.text(s, 260, y + 4);
        doc.text(n, 330, y + 4);
        doc.y = y + 18;
      });

      doc.moveDown(1);

      // Banner 3: Medications
      doc.fillColor('#1e3a8a').rect(40, doc.y, 515, 20).fill();
      doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold').text('CURRENT MEDICATION SUMMARY', 45, doc.y - 15);
      doc.moveDown(0.5);

      const medHeaderY = doc.y;
      doc.rect(40, medHeaderY, 515, 16).fill('#f1f5f9');
      doc.fillColor('#0f172a').fontSize(8).font('Helvetica-Bold');
      doc.text('Medication', 45, medHeaderY + 3);
      doc.text('Dose', 160, medHeaderY + 3);
      doc.text('Frequency', 230, medHeaderY + 3);
      doc.text('Status', 320, medHeaderY + 3);
      doc.text('Indication', 410, medHeaderY + 3);
      doc.y = medHeaderY + 16;

      const medRows = [
        ['Cetirizine', '10 mg', 'As needed', 'PRN / historical', 'Allergic rhinitis'],
        ['Cholecalciferol', '1,000 IU', 'Daily', 'Historical', 'Vitamin D support'],
        ['Paracetamol', '500 mg', 'As needed', 'Historical', 'Fever / pain during prior illness']
      ];

      medRows.forEach(([m, d, fr, s, i]) => {
        const y = doc.y;
        doc.rect(40, y, 515, 16).stroke('#e2e8f0');
        doc.fillColor('#334155').fontSize(8).font('Helvetica');
        doc.text(m, 45, y + 3);
        doc.text(d, 160, y + 3);
        doc.text(fr, 230, y + 3);
        doc.text(s, 320, y + 3);
        doc.text(i, 410, y + 3);
        doc.y = y + 16;
      });

      addFooter(1);

      // ==========================================
      // PAGE 2: LONGITUDINAL MEDICAL TIMELINE
      // ==========================================
      doc.addPage();
      doc.fillColor('#000000').fontSize(20).font('Helvetica-Bold').text('LONGITUDINAL MEDICAL TIMELINE', { align: 'center' });
      doc.moveDown(0.2);
      doc.fillColor('#dc2626').fontSize(9).font('Helvetica-Bold').text('All names, identifiers, dates, measurements, reports, and clinical findings below are fictional demo data.', { align: 'center' });
      doc.moveDown(1);

      // Visit 1
      doc.fillColor('#1e3a8a').rect(40, doc.y, 515, 20).fill();
      doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold').text('18 MAY 2025 — OUTPATIENT VISIT', 45, doc.y - 15);
      doc.moveDown(0.5);

      const v1Rows = [
        ['Reason for Visit', 'Sneezing, nasal congestion and intermittent watery eyes'],
        ['Vitals', 'BP 118/76 mmHg · HR 74 bpm · Temp 36.8 °C · SpO2 99%'],
        ['Assessment', 'Sample diagnosis: seasonal allergic rhinitis'],
        ['Plan', 'Trigger avoidance, hydration and symptomatic treatment discussed'],
        ['Prescription', 'Cetirizine 10 mg once daily as needed for 14 days'],
        ['Follow-up', 'Return if symptoms persist or worsen']
      ];

      v1Rows.forEach(([k, v]) => {
        const y = doc.y;
        doc.rect(40, y, 140, 18).fillAndStroke('#f8fafc', '#e2e8f0');
        doc.rect(180, y, 375, 18).stroke('#e2e8f0');
        doc.fillColor('#1e293b').fontSize(8).font('Helvetica-Bold').text(k, 45, y + 4);
        doc.fillColor('#334155').fontSize(8).font('Helvetica').text(v, 185, y + 4);
        doc.y = y + 18;
      });

      doc.moveDown(1);

      // Lab Follow-up
      doc.fillColor('#1e3a8a').rect(40, doc.y, 515, 20).fill();
      doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold').text('22 JUN 2025 — LABORATORY FOLLOW-UP', 45, doc.y - 15);
      doc.moveDown(0.5);

      const labHeaderY = doc.y;
      doc.rect(40, labHeaderY, 515, 16).fill('#f1f5f9');
      doc.fillColor('#0f172a').fontSize(8).font('Helvetica-Bold');
      doc.text('Test', 45, labHeaderY + 3);
      doc.text('Result', 200, labHeaderY + 3);
      doc.text('Unit', 280, labHeaderY + 3);
      doc.text('Reference / Comment', 360, labHeaderY + 3);
      doc.y = labHeaderY + 16;

      const labRows = [
        ['25-OH Vitamin D', '24', 'ng/mL', 'Sample reference: 30–100'],
        ['Hemoglobin', '14.5', 'g/dL', 'Sample reference: 13–17'],
        ['WBC', '7.1', '×10³/L', 'Sample reference: 4–11'],
        ['Creatinine', '0.9', 'mg/dL', 'Sample reference: 0.7–1.3']
      ];

      labRows.forEach(([t, r, u, ref]) => {
        const y = doc.y;
        doc.rect(40, y, 515, 16).stroke('#e2e8f0');
        doc.fillColor('#334155').fontSize(8).font('Helvetica');
        doc.text(t, 45, y + 3);
        doc.text(r, 200, y + 3);
        doc.text(u, 280, y + 3);
        doc.text(ref, 360, y + 3);
        doc.y = y + 16;
      });

      doc.moveDown(1);

      // Visit 2
      doc.fillColor('#1e3a8a').rect(40, doc.y, 515, 20).fill();
      doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold').text('09 NOV 2025 — URGENT / WALK-IN VISIT', 45, doc.y - 15);
      doc.moveDown(0.5);

      const v2Rows = [
        ['Reason for Visit', 'Low-grade fever, sore throat and cough for 2 days'],
        ['Vitals', 'BP 116/74 mmHg · HR 82 bpm · Temp 37.8 °C · SpO2 98%'],
        ['Assessment', 'Sample diagnosis: uncomplicated viral upper respiratory infection'],
        ['Treatment', 'Supportive care; paracetamol 500 mg as needed for fever/pain'],
        ['Medication', 'Paracetamol 500 mg, up to three times daily as needed, maximum 3 days'],
        ['Outcome', 'Symptoms documented as resolved at subsequent routine review']
      ];

      v2Rows.forEach(([k, v]) => {
        const y = doc.y;
        doc.rect(40, y, 140, 18).fillAndStroke('#f8fafc', '#e2e8f0');
        doc.rect(180, y, 375, 18).stroke('#e2e8f0');
        doc.fillColor('#1e293b').fontSize(8).font('Helvetica-Bold').text(k, 45, y + 4);
        doc.fillColor('#334155').fontSize(8).font('Helvetica').text(v, 185, y + 4);
        doc.y = y + 18;
      });

      addFooter(2);

      // ==========================================
      // PAGE 3: DIAGNOSTIC IMAGING
      // ==========================================
      doc.addPage();
      doc.fillColor('#000000').fontSize(20).font('Helvetica-Bold').text('DIAGNOSTIC IMAGING', { align: 'center' });
      doc.moveDown(0.2);
      doc.fillColor('#dc2626').fontSize(9).font('Helvetica-Bold').text('SAMPLE REPORTS — NOT FOR CLINICAL USE', { align: 'center' });
      doc.moveDown(1);

      // MRI Brain
      doc.fillColor('#1e3a8a').rect(40, doc.y, 515, 20).fill();
      doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold').text('14 AUG 2026 — MRI BRAIN', 45, doc.y - 15);
      doc.moveDown(0.5);

      const mriRows = [
        ['Examination', 'MRI Brain — SAMPLE'],
        ['Clinical Information', 'Illustrative history of intermittent headache; no acute neurological deficit documented'],
        ['Technique', 'Multiplanar, multisequence MRI of the brain performed without contrast — fictional description'],
        ['Findings', 'Cerebral hemispheres demonstrate preserved signal characteristics and gray-white differentiation. No focal mass, acute hemorrhage, or restricted diffusion is identified in this fictional sample.'],
        ['Ventricles / CSF Spaces', 'Within illustrative normal limits. No midline shift or hydrocephalus.'],
        ['Posterior Fossa', 'Brainstem and cerebellum appear unremarkable in this sample.'],
        ['Impression', 'No acute intracranial abnormality identified in this fictional sample report.'],
        ['Reporting Clinician', 'DEMO RADIOLOGIST']
      ];

      mriRows.forEach(([k, v]) => {
        const y = doc.y;
        doc.rect(40, y, 140, 22).fillAndStroke('#f8fafc', '#e2e8f0');
        doc.rect(180, y, 375, 22).stroke('#e2e8f0');
        doc.fillColor('#1e293b').fontSize(8).font('Helvetica-Bold').text(k, 45, y + 4);
        doc.fillColor('#334155').fontSize(7.5).font('Helvetica').text(v, 185, y + 3, { width: 365 });
        doc.y = y + 22;
      });

      doc.moveDown(1);

      // CT Head
      doc.fillColor('#1e3a8a').rect(40, doc.y, 515, 20).fill();
      doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold').text('16 AUG 2026 — CT HEAD', 45, doc.y - 15);
      doc.moveDown(0.5);

      const ctRows = [
        ['Examination', 'CT Head — SAMPLE'],
        ['Technique', 'Non-contrast CT head, axial acquisition with multiplanar reformats — fictional description'],
        ['Findings', 'No acute intracranial hemorrhage, large territorial infarction, mass effect, or extra-axial collection in this sample.'],
        ['Impression', 'No acute abnormality identified in this fictional sample.'],
        ['Reporting Clinician', 'DEMO RADIOLOGIST']
      ];

      ctRows.forEach(([k, v]) => {
        const y = doc.y;
        doc.rect(40, y, 140, 20).fillAndStroke('#f8fafc', '#e2e8f0');
        doc.rect(180, y, 375, 20).stroke('#e2e8f0');
        doc.fillColor('#1e293b').fontSize(8).font('Helvetica-Bold').text(k, 45, y + 4);
        doc.fillColor('#334155').fontSize(7.5).font('Helvetica').text(v, 185, y + 3, { width: 365 });
        doc.y = y + 20;
      });

      doc.moveDown(1);

      // Chest X-Ray
      doc.fillColor('#1e3a8a').rect(40, doc.y, 515, 20).fill();
      doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold').text('20 AUG 2026 — CHEST X-RAY', 45, doc.y - 15);
      doc.moveDown(0.5);

      const xrayRows = [
        ['Examination', 'Chest radiograph, PA view — SAMPLE'],
        ['Findings', 'Cardiomediastinal silhouette within illustrative normal limits. No focal air-space consolidation or pleural effusion in this sample.'],
        ['Impression', 'No acute cardiopulmonary abnormality in this fictional sample.']
      ];

      xrayRows.forEach(([k, v]) => {
        const y = doc.y;
        doc.rect(40, y, 140, 20).fillAndStroke('#f8fafc', '#e2e8f0');
        doc.rect(180, y, 375, 20).stroke('#e2e8f0');
        doc.fillColor('#1e293b').fontSize(8).font('Helvetica-Bold').text(k, 45, y + 4);
        doc.fillColor('#334155').fontSize(7.5).font('Helvetica').text(v, 185, y + 3, { width: 365 });
        doc.y = y + 20;
      });

      addFooter(3);

      // ==========================================
      // PAGE 4: LABORATORY HISTORY & IMMUNIZATIONS
      // ==========================================
      doc.addPage();
      doc.fillColor('#000000').fontSize(20).font('Helvetica-Bold').text('LABORATORY HISTORY', { align: 'center' });
      doc.moveDown(1);

      // Panel 1
      doc.fillColor('#1e3a8a').rect(40, doc.y, 515, 20).fill();
      doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold').text('22 JUN 2025 — BASELINE / FOLLOW-UP PANEL', 45, doc.y - 15);
      doc.moveDown(0.5);

      const labP1HeaderY = doc.y;
      doc.rect(40, labP1HeaderY, 515, 16).fill('#f1f5f9');
      doc.fillColor('#0f172a').fontSize(8).font('Helvetica-Bold');
      doc.text('Test', 45, labP1HeaderY + 3);
      doc.text('Result', 200, labP1HeaderY + 3);
      doc.text('Unit', 300, labP1HeaderY + 3);
      doc.text('Reference', 400, labP1HeaderY + 3);
      doc.y = labP1HeaderY + 16;

      const labP1 = [
        ['Hemoglobin', '14.5', 'g/dL', '13–17'],
        ['WBC', '7.1', '×10³/L', '4–11'],
        ['Platelets', '238', '×10³/L', '150–450'],
        ['Glucose (fasting)', '89', 'mg/dL', '70–99'],
        ['HbA1c', '5.3', '%', '4–5.6'],
        ['Creatinine', '0.9', 'mg/dL', '0.7–1.3'],
        ['ALT', '24', 'U/L', '7–56'],
        ['TSH', '2.1', 'mIU/L', '0.4–4.0'],
        ['25-OH Vitamin D', '24', 'ng/mL', '30–100']
      ];

      labP1.forEach(([t, r, u, ref]) => {
        const y = doc.y;
        doc.rect(40, y, 515, 15).stroke('#e2e8f0');
        doc.fillColor('#334155').fontSize(8).font('Helvetica');
        doc.text(t, 45, y + 3);
        doc.text(r, 200, y + 3);
        doc.text(u, 300, y + 3);
        doc.text(ref, 400, y + 3);
        doc.y = y + 15;
      });

      doc.moveDown(1);

      // Panel 2
      doc.fillColor('#1e3a8a').rect(40, doc.y, 515, 20).fill();
      doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold').text('30 AUG 2026 — ROUTINE HEALTH PANEL', 45, doc.y - 15);
      doc.moveDown(0.5);

      const labP2HeaderY = doc.y;
      doc.rect(40, labP2HeaderY, 515, 16).fill('#f1f5f9');
      doc.fillColor('#0f172a').fontSize(8).font('Helvetica-Bold');
      doc.text('Test', 45, labP2HeaderY + 3);
      doc.text('Result', 200, labP2HeaderY + 3);
      doc.text('Unit', 300, labP2HeaderY + 3);
      doc.text('Reference', 400, labP2HeaderY + 3);
      doc.y = labP2HeaderY + 16;

      const labP2 = [
        ['Hemoglobin', '14.2', 'g/dL', '13–17'],
        ['WBC', '7.2', '×10³/L', '4–11'],
        ['Platelets', '245', '×10³/L', '150–450'],
        ['Glucose (fasting)', '92', 'mg/dL', '70–99'],
        ['HbA1c', '5.4', '%', '4–5.6'],
        ['Creatinine', '0.9', 'mg/dL', '0.7–1.3'],
        ['ALT', '22', 'U/L', '7–56'],
        ['TSH', '2.0', 'mIU/L', '0.4–4.0'],
        ['25-OH Vitamin D', '36', 'ng/mL', '30–100']
      ];

      labP2.forEach(([t, r, u, ref]) => {
        const y = doc.y;
        doc.rect(40, y, 515, 15).stroke('#e2e8f0');
        doc.fillColor('#334155').fontSize(8).font('Helvetica');
        doc.text(t, 45, y + 3);
        doc.text(r, 200, y + 3);
        doc.text(u, 300, y + 3);
        doc.text(ref, 400, y + 3);
        doc.y = y + 15;
      });

      doc.moveDown(1);

      // Immunizations
      doc.fillColor('#1e3a8a').rect(40, doc.y, 515, 20).fill();
      doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold').text('IMMUNIZATION HISTORY — SAMPLE', 45, doc.y - 15);
      doc.moveDown(0.5);

      const immHeaderY = doc.y;
      doc.rect(40, immHeaderY, 515, 16).fill('#f1f5f9');
      doc.fillColor('#0f172a').fontSize(8).font('Helvetica-Bold');
      doc.text('Vaccine', 45, immHeaderY + 3);
      doc.text('Date', 200, immHeaderY + 3);
      doc.text('Dose / Note', 360, immHeaderY + 3);
      doc.y = immHeaderY + 16;

      const immRows = [
        ['Influenza', '10 Oct 2025', 'Annual dose — demo'],
        ['COVID-19', '15 Jan 2026', 'Booster — demo'],
        ['Td/Tdap', '12 Mar 2024', 'Booster — demo'],
        ['Hepatitis B', 'Historical', 'Series completed — demo']
      ];

      immRows.forEach(([v, d, n]) => {
        const y = doc.y;
        doc.rect(40, y, 515, 15).stroke('#e2e8f0');
        doc.fillColor('#334155').fontSize(8).font('Helvetica');
        doc.text(v, 45, y + 3);
        doc.text(d, 200, y + 3);
        doc.text(n, 360, y + 3);
        doc.y = y + 15;
      });

      addFooter(4);

      // ==========================================
      // PAGE 5: MEDICATION & PRESCRIPTION HISTORY
      // ==========================================
      doc.addPage();
      doc.fillColor('#000000').fontSize(20).font('Helvetica-Bold').text('MEDICATION & PRESCRIPTION HISTORY', { align: 'center' });
      doc.moveDown(1);

      doc.fillColor('#1e3a8a').rect(40, doc.y, 515, 20).fill();
      doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold').text('MEDICATION HISTORY', 45, doc.y - 15);
      doc.moveDown(0.5);

      const medHistHeaderY = doc.y;
      doc.rect(40, medHistHeaderY, 515, 16).fill('#f1f5f9');
      doc.fillColor('#0f172a').fontSize(8).font('Helvetica-Bold');
      doc.text('Medication', 45, medHistHeaderY + 3);
      doc.text('Dose', 140, medHistHeaderY + 3);
      doc.text('Frequency', 210, medHistHeaderY + 3);
      doc.text('Start', 300, medHistHeaderY + 3);
      doc.text('End / Status', 380, medHistHeaderY + 3);
      doc.text('Reason', 470, medHistHeaderY + 3);
      doc.y = medHistHeaderY + 16;

      const medHistRows = [
        ['Cetirizine', '10 mg', 'Once daily PRN', '18 May 2025', 'Historical / PRN', 'Allergic rhinitis'],
        ['Cholecalciferol', '1,000 IU', 'Once daily', '22 Jun 2025', 'Completed / historical', 'Vitamin D support'],
        ['Paracetamol', '500 mg', 'Up to TID PRN', '09 Nov 2025', 'Completed', 'Viral illness symptoms']
      ];

      medHistRows.forEach(([m, d, fr, st, en, r]) => {
        const y = doc.y;
        doc.rect(40, y, 515, 16).stroke('#e2e8f0');
        doc.fillColor('#334155').fontSize(7.5).font('Helvetica');
        doc.text(m, 45, y + 3);
        doc.text(d, 140, y + 3);
        doc.text(fr, 210, y + 3);
        doc.text(st, 300, y + 3);
        doc.text(en, 380, y + 3);
        doc.text(r, 470, y + 3);
        doc.y = y + 16;
      });

      doc.moveDown(1);

      // Prescriptions
      const rxBlocks = [
        { date: '18 MAY 2025', med: 'Cetirizine 10 mg tablet', dir: 'Take one tablet once daily as needed for allergy symptoms', dur: '14 days', ref: 'None — sample' },
        { date: '22 JUN 2025', med: 'Cholecalciferol 1,000 IU', dir: 'Take one capsule once daily', dur: '90 days', ref: 'One — sample' },
        { date: '09 NOV 2025', med: 'Paracetamol 500 mg', dir: 'Take one tablet as needed for fever/pain; do not exceed sample instructions', dur: 'Up to 3 days', ref: 'None — sample' }
      ];

      rxBlocks.forEach((rx) => {
        doc.fillColor('#1e3a8a').rect(40, doc.y, 515, 18).fill();
        doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold').text(`PRESCRIPTION — ${rx.date}`, 45, doc.y - 13);
        doc.moveDown(0.4);

        const items = [
          ['Medicine', rx.med],
          ['Directions', rx.dir],
          ['Duration', rx.dur],
          ['Refills', rx.ref]
        ];

        items.forEach(([k, v]) => {
          const y = doc.y;
          doc.rect(40, y, 120, 15).fillAndStroke('#f8fafc', '#e2e8f0');
          doc.rect(160, y, 395, 15).stroke('#e2e8f0');
          doc.fillColor('#1e293b').fontSize(7.5).font('Helvetica-Bold').text(k, 45, y + 3);
          doc.fillColor('#334155').fontSize(7.5).font('Helvetica').text(v, 165, y + 3);
          doc.y = y + 15;
        });

        doc.moveDown(0.8);
      });

      addFooter(5);

      // ==========================================
      // PAGE 6: RECORD CONTROL & QR DEPLOYMENT PAGE
      // ==========================================
      doc.addPage();
      doc.fillColor('#000000').fontSize(20).font('Helvetica-Bold').text('RECORD CONTROL & QR DEPLOYMENT PAGE', { align: 'center' });
      doc.moveDown(0.2);
      doc.fillColor('#dc2626').fontSize(10).font('Helvetica-Bold').text('DEMO / SAMPLE — NOT A REAL MEDICAL RECORD', { align: 'center' });
      doc.moveDown(1);

      doc.fillColor('#1e3a8a').rect(40, doc.y, 515, 20).fill();
      doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold').text('RECORD METADATA', 45, doc.y - 15);
      doc.moveDown(0.5);

      const metaRows = [
        ['Patient', patient.name || 'Manoj'],
        ['Health ID', 'DEMO-HEALTH-9842'],
        ['Record ID', 'DEMO-REC-2026-001'],
        ['Version', '1.0 — fictional sample'],
        ['Last Updated', '30 Aug 2026'],
        ['Data Type', 'Synthetic / demonstration data']
      ];

      metaRows.forEach(([k, v]) => {
        const y = doc.y;
        doc.rect(40, y, 140, 16).fillAndStroke('#f8fafc', '#e2e8f0');
        doc.rect(180, y, 375, 16).stroke('#e2e8f0');
        doc.fillColor('#1e293b').fontSize(8).font('Helvetica-Bold').text(k, 45, y + 3);
        doc.fillColor('#334155').fontSize(8).font('Helvetica').text(v, 185, y + 3);
        doc.y = y + 16;
      });

      doc.moveDown(1);

      doc.fillColor('#1e3a8a').rect(40, doc.y, 515, 20).fill();
      doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold').text('DOCUMENT CONTENTS', 45, doc.y - 15);
      doc.moveDown(0.5);

      const docContHeaderY = doc.y;
      doc.rect(40, docContHeaderY, 515, 16).fill('#f1f5f9');
      doc.fillColor('#0f172a').fontSize(8).font('Helvetica-Bold');
      doc.text('Section', 45, docContHeaderY + 3);
      doc.text('Included', 400, docContHeaderY + 3);
      doc.y = docContHeaderY + 16;

      const docContRows = [
        'Patient demographics',
        'Current vitals',
        'Medical timeline',
        'Diagnoses / problems',
        'Medication history',
        'Prescription history',
        'Laboratory history',
        'Imaging reports',
        'Immunization history',
        'Procedures / hospitalization summary',
        'Current status / follow-up'
      ];

      docContRows.forEach((sec) => {
        const y = doc.y;
        doc.rect(40, y, 515, 15).stroke('#e2e8f0');
        doc.fillColor('#334155').fontSize(8).font('Helvetica').text(sec, 45, y + 3);
        doc.fillColor('#059669').fontSize(8).font('Helvetica-Bold').text('Yes', 400, y + 3);
        doc.y = y + 15;
      });

      doc.moveDown(1);

      doc.fillColor('#1e3a8a').rect(40, doc.y, 515, 20).fill();
      doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold').text('QR CODE USE', 45, doc.y - 15);
      doc.moveDown(0.5);

      doc.fillColor('#334155').fontSize(8).font('Helvetica').text(
        'This PDF is suitable as the document destination for a QR-code prototype. When you create the QR code, encode a secure URL that points to this PDF or to a protected document viewer—not the patient\'s raw medical information inside the QR itself.'
      );
      doc.moveDown(0.5);
      doc.fillColor('#dc2626').fontSize(8.5).font('Helvetica-Bold').text(
        'Important: For a real healthcare deployment, use authentication, access control, encryption, audit logging, consent/authorization controls, and a secure patient portal or document server. Do not place personal health information directly into a publicly readable QR code.'
      );

      doc.moveDown(1.5);
      doc.fillColor('#dc2626').fontSize(11).font('Helvetica-Bold').text('DEMO / SAMPLE DATA\nNOT A REAL MEDICAL RECORD', { align: 'center' });
      doc.moveDown(0.5);
      doc.fillColor('#7f1d1d').fontSize(9).font('Helvetica-Bold').text(
        'This document is intentionally fictional and must not be used for diagnosis, treatment, identification, insurance, employment, legal, or other real-world medical purposes.',
        { align: 'center' }
      );

      addFooter(6);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
