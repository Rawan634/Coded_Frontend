// Frozen demo data — the same names and numbers as the Figma prototype and the M3 report.
// No real AI or OCR: every "AI" result below is mock data.

export const demoData = {
  teacher: { name: "Ms. Mariam Adel", initials: "MA", className: "Class 5B · Maths", examsThisWeek: 48 },
  colleagues: [
    { id: "salma", name: "Ms. Salma Nour", role: "Maths, Class 5A" },
    { id: "hany", name: "Mr. Hany Fawzy", role: "Maths, Class 5C" }
  ],
  students: [
    { id: "ali", name: "Ali Khaled", initials: "AK", grade: 5, parent: "Khaled A.", phone: "0100 000 0001", email: "khaled.a@example.com", flag: "Comparing fractions" },
    { id: "nour", name: "Nour Hassan", initials: "NH", grade: 5, parent: "Sara H.", phone: "0100 000 0002", email: "sara.h@example.com" },
    { id: "mona", name: "Mona Samir", initials: "MS", grade: 5, parent: "Samir F.", phone: "0100 000 0003", email: "samir.f@example.com", flag: "Word problems" },
    { id: "omar", name: "Omar Nabil", initials: "ON", grade: 5, parent: "Nabil O.", phone: "0100 000 0004", email: "nabil.o@example.com" },
    { id: "youssef", name: "Youssef Adel", initials: "YA", grade: 5, parent: "Adel Y.", phone: "0100 000 0005", email: "adel.y@example.com", flag: "Multiplication" },
    { id: "sara", name: "Sara Fathy", initials: "SF", grade: 5, parent: "Fathy S.", phone: "0100 000 0006", email: "fathy.s@example.com" }
  ],
  leila: { id: "leila", name: "Leila Khaled", initials: "L", grade: 2 },
  parent: { name: "Dina Mostafa", children: ["ali", "leila"] },

  exam: {
    title: "Maths Quiz 3 – Fractions",
    date: "12 Oct",
    pages: 3,
    totalAnswers: 30,
    submitted: "today 08:12",
    // The answers the teacher sees one by one. Confidence is the OCR confidence in %.
    answers: [
      { id: "q4", q: 4, question: "Write the shaded fraction", text: "3/8", read: "OCR read this as \"3/8\" or \"8/3\"", confidence: 41, scheme: "3/8", scan: "q4", lowReason: "Low confidence" },
      { id: "q7", q: 7, question: "Compare 5/6 and 7/9", text: "", read: "OCR could not read this answer", confidence: 28, scheme: "5/6 > 7/9", scan: "q7", correctTo: "5/6 < 7/9" },
      { id: "q8", q: 8, question: "Write 1/2 in words", text: "Hälfte", read: "Written in German; the exam expects English", confidence: 88, language: "Deutsch", scheme: "half / one half", scan: "q8" },
      { id: "q9", q: 9, question: "Write 5/4 as a mixed number", text: "1 1/4", read: "Quick check: does the text match the scan?", confidence: 68, scheme: "1 1/4", scan: "q9" },
      { id: "q1", q: 1, question: "Compare 3/4 and 1/2", text: "3/4 > 1/2", confidence: 93, scheme: "3/4 > 1/2" },
      { id: "q2", q: 2, question: "Simplify 10/12", text: "5/6", confidence: 93, scheme: "5/6" },
      { id: "q5", q: 5, question: "2/5 + 1/5", text: "3/5", confidence: 94, scheme: "3/5" },
      { id: "q3", q: 3, question: "Write a fraction equal to 1/2", text: "4/8", confidence: 96, scheme: "any equal fraction" },
      { id: "q6", q: 6, question: "Compare 2/3 and 3/5", text: "2/3 < 3/5", confidence: 98, scheme: "2/3 > 3/5" },
      { id: "q10", q: 10, question: "12 sweets shared by 3", text: "4 sweets", confidence: 99, scheme: "4" }
    ],
    // The other 20 extracted lines (working, names, dates): only their confidence matters for the tiers.
    otherConfidences: [92, 91, 97, 98, 99, 99, 98, 97, 99, 96, 98, 99, 97, 99, 98, 96, 99, 97, 98, 99],
    studentReplyQ4: "I wrote 3/8. Three out of eight parts are shaded."
  },

  // AI-suggested marks (1 mark each). Q9 is the one the teacher overrides.
  grading: [
    { q: 1, mark: 1, reliability: "High" }, { q: 2, mark: 1, reliability: "High" }, { q: 3, mark: 1, reliability: "High" },
    { q: 4, mark: 1, reliability: "Low" }, { q: 5, mark: 1, reliability: "High" }, { q: 6, mark: 0, reliability: "High" },
    { q: 7, mark: 0, reliability: "High" }, { q: 8, mark: 1, reliability: "Medium" }, { q: 9, mark: 0, reliability: "Low" },
    { q: 10, mark: 1, reliability: "High" }
  ],
  overrideReason: "The answer on the second line is correct; OCR missed it.",

  examsToVerify: [
    { id: "mona", exam: "Maths Quiz 3", language: "English", submitted: "Today 08:30", status: "Ready to verify", check: "20% · 6 answers" },
    { id: "ali", exam: "Maths Quiz 3", language: "English", submitted: "Today 08:12", status: "ali", check: "13% · 4 answers" },
    { id: "youssef", exam: "Maths Quiz 3", language: "English", submitted: "Yesterday", status: "Ready to verify", check: "7% · 2 answers" },
    { id: "nour", exam: "Maths Quiz 3", language: "English", submitted: "Today 09:02", status: "Clarification pending", check: "3% · 1 answer" },
    { id: "sara", exam: "Maths Quiz 3", language: "English", submitted: "Just now", status: "Reading pages (OCR)…", check: "—" },
    { id: "omar", exam: "Mathe-Quiz 3", language: "Deutsch", submitted: "Yesterday", status: "Verified", check: "0%" }
  ],
  examsToGrade: [
    { name: "Ali Khaled", initials: "AK", exam: "Maths Quiz 3", verified: "Today 10:31", ai: "7/10", low: ["2 to check", "decision"], isAli: true },
    { name: "Malak Ibrahim", initials: "MI", exam: "Maths Quiz 3", verified: "Today 09:40", ai: "8/10", low: ["1 to check", "decision"] },
    { name: "Hana Mostafa", initials: "HM", exam: "Maths Quiz 3", verified: "Yesterday", ai: "6/10", low: ["1 to check", "decision"] },
    { name: "Karim Tarek", initials: "KT", exam: "Maths Quiz 3", verified: "Yesterday", ai: "9/10", low: ["All high", "auto"] },
    { name: "Omar Nabil", initials: "ON", exam: "Mathe-Quiz 3 (Deutsch)", verified: "Yesterday", ai: "9/10", low: ["All high", "auto"] }
  ],

  dashboard: {
    gradingProgress: 62, unchecked: "38% still unchecked · 18 of 48 exams", toVerify: 13, toGrade: 5,
    problemAreas: [["Comparing fractions", 64], ["Word problems", 41], ["Long multiplication", 28]],
    goal: { name: "Class game day", points: 240, target: 300 }
  },
  quizHistory: [["Quiz 0", 85], ["Quiz 1", 70], ["Quiz 2", 45], ["Quiz 3", 80]],
  topicHistory: [["Quiz 0", true, "2 of 2"], ["Quiz 1", false, "1 of 3"], ["Quiz 2", false, "1 of 3"], ["Quiz 3", false, "1 of 3"]],
  gradebook: { ali: [70, 45, 80], nour: [90, 85, 95], mona: [60, 50, 55], omar: [72, 76, 84], youssef: [68, 61, 58], sara: [82, 88, 91] },
  supportSlots: ["Sun 4:00 pm", "Mon 5:00 pm", "Tue 4:30 pm"],
  feedback: "Great work on equal fractions and adding fractions! Next step: when you compare fractions, make the bottoms the same first.",
  practice: [
    { id: "bigger", title: "Which is bigger?", meta: "5 questions · 10 min", topic: "comparing fractions", checked: true },
    { id: "bottoms", title: "Same bottoms first", meta: "4 questions · 8 min", topic: "common denominators warm-up", checked: true },
    { id: "mixed", title: "Mixed numbers review", meta: "5 questions", topic: "mixed numbers", checked: false }
  ],
  activity: [[2, 3, 3, 5], [5, 6, 7, 9], [1, 2, 2, 5], [3, 4, 5, 8], [2, 3, 4, 5]],
  subjects: ["Maths", "Science", "English", "German"],
  examChoices: {
    Maths: ["Maths Quiz 3 – 12 Oct", "Maths Quiz 2 – 28 Sep", "Maths homework 4 – 5 Oct"],
    Science: ["Science Quiz 2 – 9 Oct"],
    English: ["English Test 1 – 7 Oct"],
    German: ["Mathe-Quiz 3 – 12 Oct", "Deutsch Quiz 2 – 5 Oct"]
  },
  helpInbox: [
    { name: "Mona Samir", initials: "MS", topic: "Word problems · homework 4", time: "Yesterday" },
    { name: "Youssef Adel", initials: "YA", topic: "Multiplication · Quiz 2 · Q5", time: "Mon" }
  ],
  ocrReport: { autoAccepted: 84, corrections: 126, hoursSaved: 3.5, byQuestion: [["Q7 – stacked fractions", 8], ["Q8 – German word", 6], ["Q4 – shaded fraction", 5], ["Q9 – mixed number", 3]] }
};
