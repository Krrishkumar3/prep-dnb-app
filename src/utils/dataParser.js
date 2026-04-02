// ─── CSV Parser ────────────────────────────────────────────────
// Handles Google Sheets CSV: Subject | Year | Session | ExamType | PaperNumber | QuestionText | Marks

export function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = parseCSVRow(lines[0]).map(h => h.trim().toLowerCase().replace(/\s+/g, ''));

  return lines.slice(1).map(line => {
    const values = parseCSVRow(line);
    const row = {};
    headers.forEach((h, i) => { row[h] = (values[i] || '').trim(); });
    return {
      subject: row['subject'] || '',
      year: row['year'] || '',
      session: row['session'] || '',
      examType: row['examtype'] || row['exam_type'] || 'DNB',
      paperNumber: parseInt(row['papernumber'] || row['paper_number'] || row['paper'] || '1', 10),
      questionText: row['questiontext'] || row['question_text'] || row['question'] || '',
      marks: parseInt(row['marks'] || '5', 10),
      pdfLink: row['pdf_link'] || row['pdflink'] || '',
    };
  }).filter(r => r.subject && (r.questionText || r.pdfLink));
}

function parseCSVRow(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

// ─── Data Organizer ────────────────────────────────────────────

export function organizeData(rows) {
  // Returns: { [subject]: { [examType]: { [year]: { [session]: { [paperNumber]: { questions: [], pdfLink: '' } } } } } }
  const tree = {};
  rows.forEach(row => {
    const { subject, examType, year, session, paperNumber, questionText, marks, pdfLink } = row;
    if (!tree[subject]) tree[subject] = {};
    if (!tree[subject][examType]) tree[subject][examType] = {};
    if (!tree[subject][examType][year]) tree[subject][examType][year] = {};
    if (!tree[subject][examType][year][session]) tree[subject][examType][year][session] = {};
    if (!tree[subject][examType][year][session][paperNumber]) {
      tree[subject][examType][year][session][paperNumber] = { questions: [], pdfLink: pdfLink || '' };
    }
    // Store pdfLink at paper level (first non-empty wins)
    if (pdfLink && !tree[subject][examType][year][session][paperNumber].pdfLink) {
      tree[subject][examType][year][session][paperNumber].pdfLink = pdfLink;
    }
    if (questionText) {
      tree[subject][examType][year][session][paperNumber].questions.push({ questionText, marks });
    }
  });
  return tree;
}

export function getSessions(tree, subject, examType) {
  // Returns sorted array: [{ year, session, papers: [1,2,3,4] }]
  const subjectData = tree?.[subject]?.[examType] || {};
  const sessions = [];
  Object.entries(subjectData).forEach(([year, yearData]) => {
    Object.entries(yearData).forEach(([session, sessionData]) => {
      sessions.push({
        year: parseInt(year, 10),
        session,
        papers: Object.keys(sessionData).map(Number).sort(),
        label: `${session} ${year}`,
      });
    });
  });
  return sessions.sort((a, b) => b.year - a.year || a.session.localeCompare(b.session));
}

export function getQuestions(tree, subject, examType, year, session, paper) {
  const paperData = tree?.[subject]?.[examType]?.[year]?.[session]?.[paper];
  if (!paperData) return [];
  // Support both old array format and new {questions, pdfLink} format
  if (Array.isArray(paperData)) return paperData;
  return (paperData.questions || []).map(q => ({
    ...q,
    pdfLink: paperData.pdfLink || '',
  }));
}

// ─── Sample / Demo Data ────────────────────────────────────────

export const SAMPLE_DATA = generateSampleData();

function generateSampleData() {
  const subjects = ['Anatomy', 'Physiology', 'Biochemistry', 'Pathology', 'Microbiology',
    'Pharmacology', 'General Medicine', 'Pediatrics', 'General Surgery', 'Orthopedics',
    'Obstetrics & Gynecology', 'Ophthalmology', 'ENT', 'Dermatology', 'Cardiology'];
  const examTypes = ['DNB', 'DipNB'];
  const years = [2022, 2023, 2024];
  const sessions = ['June', 'October'];

  const questions = {
    'Anatomy': [
      'Describe the blood supply and venous drainage of the stomach.',
      'Write a note on the brachial plexus with clinical significance.',
      'Enumerate the contents of the inguinal canal. Describe the mechanism of inguinal hernia.',
      'Write a note on the femoral triangle – boundaries, contents, and clinical importance.',
      'Describe the anatomy of the middle ear and its surgical importance.',
      'Write short notes on: (a) Circle of Willis (b) Ligaments of the knee joint',
      'Describe the anatomy of the liver with reference to its blood supply.',
      'Explain the development of the heart and enumerate common congenital anomalies.',
      'Describe the anatomy of the diaphragm with its nerve supply and applied anatomy.',
      'Enumerate lymph node groups of the axilla. Describe their surgical significance.',
    ],
    'Physiology': [
      'Describe the mechanism of action potential generation and conduction in neurons.',
      'Explain the physiological basis of cardiac cycle. Draw a labeled diagram.',
      'Describe the counter-current mechanism in the kidney.',
      'Explain the role of hypothalamus in thermoregulation.',
      'Describe the physiology of respiration – mechanics of breathing and gas exchange.',
      'Write a note on the renin-angiotensin-aldosterone system.',
      'Explain the physiological changes during pregnancy.',
      'Describe the mechanism of neuromuscular transmission.',
      'Write a note on CSF – formation, circulation, and composition.',
      'Explain the physiology of pain and its modulation.',
    ],
    'General Medicine': [
      'Discuss the clinical features, investigations, and management of Infective Endocarditis.',
      'A 60-year-old man presents with crushing chest pain. Outline the management of STEMI.',
      'Describe the pathophysiology, clinical features, and treatment of nephrotic syndrome.',
      'Discuss the etiopathogenesis, clinical features, and management of Type 2 Diabetes Mellitus.',
      'Write a note on the management of acute severe asthma in adults.',
      'Describe the etiology, clinical features, and investigations of Viral Hepatitis B.',
      'Discuss the causes, clinical evaluation, and management of macrocytic anemia.',
      'A patient presents with hemoptysis. Enumerate the causes and describe the approach.',
      'Describe the clinical features, diagnosis, and management of Systemic Lupus Erythematosus.',
      'Discuss the management of acute pancreatitis and its complications.',
    ],
  };

  const defaultQuestions = [
    'Describe the etiology, clinical presentation, diagnostic workup, and management of this condition.',
    'Enumerate the causes and describe the pathophysiology. Discuss the treatment principles.',
    'A patient presents with classical features. How will you investigate and manage?',
    'Write a note on the classification, clinical features, and management.',
    'Discuss the complications and their prevention.',
    'Describe recent advances in the diagnosis and treatment.',
    'Write short notes on: (a) First part (b) Second part related to the topic.',
    'Enumerate the indications and contraindications. Describe the procedure.',
    'Discuss the pharmacology of drugs used in management.',
    'Describe the long-term management and prognosis.',
  ];

  const rows = [];
  subjects.forEach(subject => {
    examTypes.forEach(examType => {
      years.forEach(year => {
        sessions.forEach(session => {
          [1, 2, 3, 4].forEach(paper => {
            const subjectQs = questions[subject] || defaultQuestions;
            for (let q = 0; q < 10; q++) {
              rows.push({
                subject,
                year: String(year),
                session,
                examType,
                paperNumber: paper,
                questionText: subjectQs[q % subjectQs.length],
                marks: q === 0 ? 15 : 5,
              });
            }
          });
        });
      });
    });
  });
  return rows;
}
