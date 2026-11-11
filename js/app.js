// Entry point: routes, the shared shell (top bar, teacher side nav, parent tab bar) and event delegation.
import { demoData } from "./data.js";
import { getState, getUi, setUi, setRole, resetDemo, subscribe, getRouteForRole } from "./state.js";
import { avatar, btn, icon, showToast, clearToasts } from "./components.js";
import { registerRoute, startRouter, renderRoute, currentPath, navigate } from "./router.js";
import * as T from "./teacher.js";
import * as St from "./student.js";
import * as P from "./parent.js";

// E0 — choose a role (demo sign-in)
function renderRoleSelect() {
  const role = (href, iconName, label, who, r, sid = "ali") => `<a class="role-card" href="${href}" data-action="set-role" data-role="${r}" data-student="${sid}"><span class="role-card__icon">${icon(iconName, "icon--lg")}</span>${label}<small>${who}</small></a>`;
  return `<main class="role-page" id="main"><div class="role-page__inner"><a class="brand" href="#/" aria-label="LearnLoop"><span class="brand__mark"></span>LearnLoop</a><h1>Who is using LearnLoop?</h1><p class="muted">Demo sign-in. Pick a role to open that view.</p>
    <div class="role-cards">${role("#/teacher/dashboard", "clipboard-check", "Teacher", "Ms. Mariam Adel · Class 5B", "teacher")}${role("#/student/home", "smile", "Student", "Ali Khaled · Grade 5", "student")}${role("#/parent/summary", "users", "Parent", "Dina Mostafa · Ali and Leila", "parent")}</div>
    <p class="caption">No real sign-in or AI back-end: OCR text, grades and feedback are sample data.</p>
    <div class="demo-links"><a href="#/student/results" data-action="set-role" data-role="student" data-student="leila">Demo: Leila's results (Grade 2 view)</a><button class="link-btn" data-action="reset-demo">Reset the demo</button></div></div></main>`;
}

const ROUTES = {
  "/": renderRoleSelect,
  "/teacher/dashboard": T.renderDashboard, "/teacher/verify": T.renderVerifyQueue, "/teacher/cgv": T.renderCgv,
  "/teacher/grading-list": T.renderGradingList, "/teacher/grading": T.renderGrading, "/teacher/gaps": T.renderGaps,
  "/teacher/feedback": T.renderFeedback, "/teacher/reports": T.renderReports, "/teacher/roster": T.renderRoster,
  "/teacher/student": T.renderStudentProfile, "/teacher/help": T.renderHelpInbox,
  "/student/home": St.renderHome, "/student/choose-exam": St.renderChooseExam, "/student/capture": St.renderCapture,
  "/student/review": St.renderReview, "/student/sent": St.renderSent, "/student/clarify": St.renderClarify,
  "/student/results": St.renderResults, "/student/practice": St.renderPractice, "/student/activity": St.renderActivity,
  "/student/progress": St.renderProgress, "/student/notifications": St.renderNotifications, "/student/reply": St.renderReply,
  "/parent/summary": P.renderSummary, "/parent/alerts": P.renderAlerts, "/parent/contact": P.renderContact
};
Object.entries(ROUTES).forEach(([path, view]) => registerRoute(path, view));

const ACTIONS = { ...T.teacherActions, ...St.studentActions, ...P.parentActions };
const INPUTS = { ...T.teacherInputs, ...St.studentInputs };
const CHANGES = { ...T.teacherChanges };

function topbar(area) {
  const s = getState();
  const value = s.role === "student" ? s.selectedStudentId : s.role;
  const options = [["teacher", "Teacher — Ms. Mariam"], ["ali", "Student — Ali"], ["leila", "Student — Leila"], ["parent", "Parent — Dina"]].map(([v, l]) => `<option value="${v}" ${v === value ? "selected" : ""}>${l}</option>`).join("");
  const unread = area === "student" ? St.studentNotifications().some((n) => n.isNew) : area === "teacher" ? s.exam.state === "ready_to_verify" || (s.student.helpSent && !s.teacherReply) : false;
  const bellHref = area === "student" ? "#/student/notifications" : area === "parent" ? "#/parent/alerts" : s.student.helpSent && !s.teacherReply ? "#/teacher/help" : "#/teacher/verify";
  const who = area === "teacher" ? `${avatar("MA")}<span>${demoData.teacher.name}</span>` : area === "parent" ? `${avatar("D")}<span>Dina</span>` : `${avatar(s.selectedStudentId === "leila" ? "L" : "A", "", "sun")}<span>${s.selectedStudentId === "leila" ? "Leila" : "Ali"}</span>`;
  return `<header class="topbar"><a class="brand" href="#/" aria-label="LearnLoop — switch role"><span class="brand__mark"></span><span>LearnLoop</span></a>
    <div class="topbar__right"><div class="topbar__demo"><label class="sr-only" for="role-switcher">Demo role</label><select class="select" id="role-switcher" data-change="role">${options}</select>${btn("Reset demo", { style: "secondary", attrs: 'data-action="reset-demo"' })}</div>
    <a class="icon-btn bell" href="${bellHref}" aria-label="Notifications">${icon("bell")}${unread ? '<span class="bell__dot"></span>' : ""}</a><span class="who">${who}</span></div></header>`;
}

function sidenav() {
  const path = currentPath();
  const item = (href, iconName, label, count, also = []) => `<a class="navitem" href="#${href}" ${path === href || also.includes(path) ? 'aria-current="page"' : ""}>${icon(iconName)}${label}${count ? `<span class="navitem__count">${count}</span>` : ""}</a>`;
  const verifyCount = getState().exam.state === "ready_to_verify" ? 13 : 12;
  return `<nav class="sidenav" aria-label="Teacher"><span class="sidenav__class">${demoData.teacher.className}</span>
    ${item("/teacher/dashboard", "home", "Dashboard")}${item("/teacher/verify", "scan", "Verify exams", verifyCount, ["/teacher/cgv"])}${item("/teacher/grading-list", "grading", "Grading", 5, ["/teacher/grading", "/teacher/gaps", "/teacher/feedback"])}${item("/teacher/help", "users", "Students", getState().student.helpSent && !getState().teacherReply ? 1 : 0, ["/teacher/student"])}${item("/teacher/reports", "report", "Reports")}${item("/teacher/roster", "clipboard-check", "Roster")}</nav>`;
}

const app = document.querySelector("#app");
let lastArea = null;

function render() {
  const path = currentPath();
  const area = path.split("/")[1] || "";
  if (lastArea !== null && area !== lastArea) clearToasts();
  lastArea = area;
  const view = renderRoute();
  document.body.classList.toggle("annotate", new URLSearchParams(location.search).get("annotate") === "1");
  if (!area) app.innerHTML = view;
  else if (area === "teacher") app.innerHTML = `${topbar(area)}<div class="teacher-shell">${sidenav()}${view}</div>`;
  else if (area === "parent") app.innerHTML = `${topbar(area)}${view}${P.bottomNav(path)}`;
  else app.innerHTML = `${topbar(area)}${view}`;
  const dialog = app.querySelector('[role="dialog"], [role="alertdialog"]');
  if (dialog && !dialog.contains(document.activeElement)) dialog.querySelector("textarea, input, select, button:not([data-action='close-modal'])")?.focus();
}

// One listener per event type: elements say what they do with data-action / data-input / data-change.
document.addEventListener("click", (event) => {
  const el = event.target.closest("[data-action]");
  if (!el || el.disabled) return;
  if (el.hasAttribute("data-self-only") && event.target !== el) return;
  const name = el.dataset.action;
  if (name === "close-modal") return setUi({ modal: null });
  if (name === "reset-demo") { event.preventDefault(); resetDemo(); navigate("/"); return showToast("Demo reset to the start", { tone: "info" }); }
  if (name === "set-role") { setRole(el.dataset.role, el.dataset.student || "ali"); return; }
  const action = ACTIONS[name];
  if (action) { if (el.tagName === "A" && !el.getAttribute("href")) event.preventDefault(); action(el, event); }
});
document.addEventListener("input", (event) => { const el = event.target.closest("[data-input]"); if (el && INPUTS[el.dataset.input]) INPUTS[el.dataset.input](el); if (event.target.id === "threshold") document.querySelector("#threshold-value").textContent = `${event.target.value}%`; });
document.addEventListener("change", (event) => {
  const el = event.target.closest("[data-change]");
  if (!el) return;
  if (el.dataset.change === "role") {
    const v = el.value;
    const role = v === "teacher" || v === "parent" ? v : "student";
    setRole(role, role === "student" ? v : "ali");
    return navigate(getRouteForRole(role));
  }
  CHANGES[el.dataset.change]?.(el);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && (getUi().modal || getUi().sheet)) return setUi({ modal: null, sheet: null });
  T.cgvKeys(event);
});

subscribe(render);
startRouter(render);
