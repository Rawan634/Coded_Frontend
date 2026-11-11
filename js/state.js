// App state: one object, saved in localStorage so the teacher and student views share it.
// Workflow: not_uploaded → ready_to_verify → (clarification) → verified → ai_graded → teacher_confirmed → released
import { demoData } from "./data.js";

const STORAGE_KEY = "learnloop-demo-state-v3";
const listeners = new Set();

const initialState = () => ({
  role: "teacher",
  selectedStudentId: "ali",
  upload: { subject: "Maths", choice: "Maths Quiz 3 – 12 Oct", page2Retaken: false, status: "not_sent" },
  exam: {
    state: "not_uploaded",
    threshold: 90,
    expectedLanguage: "English",
    selected: "q4",
    autoOpen: false,
    answers: Object.fromEntries(demoData.exam.answers.map((a) => [a.id, { status: "open", text: a.text }])),
    consultedWith: null
  },
  grading: { confirmed: {}, overrides: {} },
  gaps: { comparing: null, mixed: "dismissed", flag: null, slot: null, booked: false, notifyParent: true },
  feedback: { text: demoData.feedback, practice: Object.fromEntries(demoData.practice.map((p) => [p.id, p.checked])), releasedAt: null },
  goal: { ...demoData.dashboard.goal, ends: "Thu 30 Oct" },
  student: { points: 46, helpSent: false, helpText: "Why is 5/6 bigger than 7/9? 7 and 9 are bigger numbers.", helpTopic: "I don't get Q7", practiceDone: false, activity: { index: 0, pick: null, checked: false, right: 0 }, clarifyPick: "3/8" },
  teacherReply: null,
  parentMessages: []
});

let state = load();
// UI-only state (open dialogs, tabs): not saved, reset on reload.
let ui = { modal: null, tab: "students", popover: false, sheet: null, grading: false };

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!saved) return initialState();
    const base = initialState();
    return { ...base, ...saved, exam: { ...base.exam, ...saved.exam }, grading: { ...base.grading, ...saved.grading }, student: { ...base.student, ...saved.student } };
  } catch (error) {
    console.warn("Saved demo state could not be read; starting fresh.", error);
    return initialState();
  }
}

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (error) { /* private mode: keep going in memory */ }
}

const notify = () => listeners.forEach((listener) => listener());

export const getState = () => state;
export const getUi = () => ui;

/** Change state and re-render. Pass { silent: true } for typing, so the field keeps focus. */
export function updateState(change, { silent = false } = {}) {
  state = change(structuredClone(state)) || state;
  save();
  if (!silent) notify();
}

export function setUi(patch) {
  ui = { ...ui, ...patch };
  notify();
}

export function setRole(role, selectedStudentId = state.selectedStudentId) {
  updateState((s) => { s.role = role; s.selectedStudentId = selectedStudentId; return s; });
}

export function resetDemo() {
  state = initialState();
  ui = { modal: null, tab: "students", popover: false, sheet: null, grading: false };
  save();
  notify();
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getRouteForRole(role) {
  if (role === "teacher") return "#/teacher/dashboard";
  if (role === "parent") return "#/parent/summary";
  return "#/student/home";
}

// ---------- Derived values used by several views ----------

export const isReleased = () => state.exam.state === "released";
export const answerDef = (id) => demoData.exam.answers.find((a) => a.id === id);

/** Which CGV group an answer belongs to at the current threshold and expected language. */
export function tierOf(answer) {
  if (answer.language && answer.language !== state.exam.expectedLanguage) return "decision";
  if (answer.confidence < 50) return "decision";
  if (answer.confidence < state.exam.threshold) return "glance";
  return "auto";
}

export function cgvSummary() {
  const listed = demoData.exam.answers.map((a) => ({ ...a, tier: tierOf(a) }));
  const others = demoData.exam.otherConfidences.map((c) => (c < state.exam.threshold ? "glance" : "auto"));
  const count = (t) => listed.filter((a) => a.tier === t).length + others.filter((o) => o === t).length;
  const decision = count("decision"), glance = count("glance"), auto = count("auto");
  const total = demoData.exam.totalAnswers;
  const decisionIds = listed.filter((a) => a.tier === "decision").map((a) => a.id);
  const resolved = decisionIds.filter((id) => ["accepted", "corrected"].includes(state.exam.answers[id].status)).length;
  const toCheck = listed.filter((a) => a.tier !== "auto");
  const allDone = toCheck.every((a) => ["accepted", "corrected"].includes(state.exam.answers[a.id].status));
  return {
    listed, decision, glance, auto, total, resolved, decisionTotal: decisionIds.length, allDone,
    hiddenGlance: others.filter((o) => o === "glance").length,
    hiddenAuto: others.filter((o) => o === "auto").length,
    percent: Math.round(((decision + glance) / total) * 100),
    minutes: Math.round(auto * 0.3),
    trust: Math.round((auto / total) * 100),
    pending: Object.values(state.exam.answers).some((a) => a.status === "clarify")
  };
}

export function gradeRows() {
  return demoData.grading.map((g) => {
    const def = demoData.exam.answers.find((a) => a.q === g.q);
    const text = state.exam.answers[def.id].text || def.correctTo || "";
    const overridden = state.grading.overrides[g.q] || null;
    return { ...g, def, text, finalMark: overridden ? overridden.mark : g.mark, overridden, confirmed: Boolean(state.grading.confirmed[g.q]) || Boolean(overridden) };
  });
}

export const totalMark = () => gradeRows().reduce((sum, r) => sum + r.finalMark, 0);
