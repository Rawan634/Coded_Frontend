// Teacher view: T1–T10 of the hi-fi prototype.
import { demoData } from "./data.js";
import { getState, getUi, setUi, updateState, cgvSummary, tierOf, answerDef, gradeRows, totalMark, isReleased } from "./state.js";
import { annot, avatar, bar, btn, esc, icon, modal, person, scan, showToast, stat, table, tag } from "./components.js";
import { navigate } from "./router.js";

const S = () => getState();
const ali = demoData.students[0];
const examTitle = demoData.exam.title;

function page({ crumb, title, subtitle = "", right = "", body }) {
  return `<main class="teacher-main" id="main"><div class="page-head"><div class="page-head__titles"><span class="crumb">${esc(crumb)}</span><h1>${esc(title)}</h1>${subtitle ? `<p class="subtitle">${subtitle}</p>` : ""}</div>${right}</div>${body}</main>`;
}

const card = (inner, cls = "") => `<section class="card ${cls}">${inner}</section>`;
const head = (title, sub = "", right = "") => `<div class="card__head"><div class="card__title"><h3>${esc(title)}</h3>${sub ? `<span class="caption">${esc(sub)}</span>` : ""}</div>${right}</div>`;
const note = (text) => `<p class="note">${icon("info", "icon--sm")}<span>${text}</span></p>`;

// Where Ali's exam is in the workflow, in the teacher's words.
function aliStatus() {
  const s = S();
  const q4 = s.exam.answers.q4.status;
  if (s.exam.state === "not_uploaded") return tag("Not sent yet", "neutral");
  if (s.exam.state === "ready_to_verify") {
    if (q4 === "clarify") return tag("Clarification pending", "glance");
    if (q4 === "replied") return tag("Ali replied", "cgv");
    return tag("Ready to verify", "decision");
  }
  if (s.exam.state === "ai_graded") return tag("To grade", "ink", "grading");
  if (s.exam.state === "teacher_confirmed") return tag("Graded · not released", "cgv");
  if (s.exam.state === "released") return tag("Released", "auto");
  return tag("Verified", "auto");
}

// ---------- T1 Dashboard ----------
export function renderDashboard() {
  const s = S();
  const d = demoData.dashboard;
  const uploaded = s.exam.state === "ready_to_verify";
  const banner = uploaded ? `<div class="new-upload">${icon("bell")}<span class="grow"><strong>New:</strong> Ali Khaled sent Maths Quiz 3 (3 pages). OCR has read it and it is ready to verify.</span>${btn("Open", { icon: "arrow-right", href: "#/teacher/cgv" })}</div>` : "";
  const progressCard = card(`${head("Grading progress", "", annot("F25"))}<span class="stat__value">${d.gradingProgress}%</span>${bar("Verified and graded", `${d.gradingProgress}%`, d.gradingProgress)}<span class="caption">${d.unchecked}</span>`);
  const waiting = card(`${head("Exams waiting")}<span class="stat__value">${d.toVerify} <span class="caption">to verify</span> · ${d.toGrade} <span class="caption">to grade</span></span><div class="row">${btn("Start verifying", { href: "#/teacher/verify", icon: "scan" })}${btn("Grade", { style: "secondary", href: "#/teacher/grading-list", icon: "grading" })}</div>`);
  const flags = card(`${head("Flagged students", "", annot("F9"))}<div class="flag-list">${demoData.students.filter((st) => st.flag).map((st) => `<div class="flag-item"><span class="person">${esc(st.name)}</span>${tag(st.flag, "decision")}</div>`).join("")}</div>${btn("Review flags", { style: "secondary", icon: "flag", href: "#/teacher/student" })}`);
  const problems = card(`${head("Class problem areas", "Share of students struggling", annot("F26"))}${d.problemAreas.map(([name, pct]) => `<div class="problem"><span>${esc(name)}</span><div class="bar__track"><div class="bar__fill" style="width:${pct}%"></div></div><strong>${pct}% struggling</strong></div>`).join("")}`);
  const ocr = card(`${head("Class OCR report", "", annot("F16"))}<span class="stat__value" style="color:var(--cgv-text)">${demoData.ocrReport.autoAccepted}%</span><span class="caption">of answers auto-accepted this month. Q7 (stacked fractions) and Q8 (German word) needed the most checks.</span>${btn("Open report", { style: "secondary", icon: "report", href: "#/teacher/reports" })}`, "card--cgv");
  const contacts = card(`${head("Students and contacts", "", annot("F27"))}<label class="field"><span class="field__label">Search</span><input class="input" type="search" placeholder="Search a student or parent" data-input="dash-search"></label><div class="contact-list" id="dash-contacts">${demoData.students.slice(0, 2).map((st) => `<div><strong>${esc(st.name)}</strong><br><span class="caption">Parent: ${esc(st.parent)} · ${esc(st.phone)}</span></div>`).join("")}</div>${btn("Open roster", { style: "secondary", icon: "users", href: "#/teacher/roster" })}`);
  const goal = card(`${head(`Class goal: ${s.goal.name.toLowerCase()}`, "", btn("Edit goal", { style: "secondary", icon: "edit", attrs: 'data-action="open-goal"' }))}${bar("Class 5B effort points", `${s.goal.points} / ${s.goal.target}`, (s.goal.points / s.goal.target) * 100, "sun")}<span class="caption">Everyone's effort counts. Only the class total is shown; no student is ranked. ${annot("F36")}</span>`);
  const goalModal = getUi().modal === "goal" ? modal("Edit class goal",
    `<p class="muted">Students earn effort points for practice, clarifying answers and trying again. Only the class total is shown; no student is ranked.</p>
     <label class="field"><span class="field__label">Goal</span><input class="input" id="goal-name" value="${esc(s.goal.name)}"></label>
     <label class="field"><span class="field__label">Effort points needed</span><input class="input" id="goal-target" type="number" min="${s.goal.points}" value="${s.goal.target}"></label>
     <label class="field"><span class="field__label">Ends on</span><select class="select" id="goal-ends">${["Thu 30 Oct", "Thu 6 Nov", "Thu 13 Nov"].map((o) => `<option ${o === s.goal.ends ? "selected" : ""}>${o}</option>`).join("")}</select></label>
     <label class="check"><input type="checkbox" checked> Show the class total to students and parents</label>
     ${note(`Class 5B has ${s.goal.points} of ${s.goal.target} points now. Changing the target keeps the points already earned.`)}`,
    `${btn("Cancel", { style: "secondary", attrs: 'data-action="close-modal"' })}${btn("Save goal", { attrs: 'data-action="save-goal"' })}`) : "";
  return page({
    crumb: "Class 5B · Mathematics · Week of 12 Oct", title: "Good morning, Ms. Mariam", subtitle: "48 exams this week. Here is what needs you first.",
    body: `${banner}<div class="grid-4" style="grid-template-columns:1fr 1fr 1fr">${progressCard}${waiting}${flags}</div><div class="grid-4" style="grid-template-columns:1fr 1fr 1fr">${problems}${ocr}${contacts}</div>${goal}${goalModal}`
  });
}

// ---------- T2 Exams to verify ----------
export function renderVerifyQueue() {
  const rows = demoData.examsToVerify.map((row) => {
    const st = demoData.students.find((x) => x.id === row.id);
    const isAli = row.id === "ali";
    const status = isAli ? aliStatus() : row.status === "Verified" ? tag("Verified", "auto") : row.status.startsWith("Reading") ? tag(row.status, "neutral", "hourglass") : row.status === "Clarification pending" ? tag(row.status, "glance") : tag(row.status, "decision");
    let action = btn("Verify", { style: "secondary", attrs: 'data-action="demo-only"' });
    if (isAli) action = S().exam.state === "not_uploaded" ? `<button class="link-btn" data-action="demo-mark-sent">Demo: mark as sent</button>` : btn(S().exam.state === "ready_to_verify" ? "Verify" : "Open", { href: "#/teacher/cgv", style: S().exam.state === "ready_to_verify" ? "primary" : "secondary" });
    else if (row.status === "Verified") action = btn("Open", { style: "secondary", href: "#/teacher/grading-list" });
    else if (row.status.startsWith("Reading")) action = "—";
    return [person(st.name, st.initials), esc(row.exam), row.language === "Deutsch" ? tag("Deutsch", "neutral", "language") : "English", esc(row.submitted), status, esc(row.check), action];
  });
  return page({
    crumb: "Verify exams · Class 5B", title: "Exams waiting for verification",
    subtitle: `Sorted by the most answers that need your decision, so your time goes where OCR is least sure. ${annot("F6 F14")}`,
    body: `${table(["Student", "Exam", "Expected language", "Submitted", "Status", "To check by hand", ""], rows, (i) => (demoData.examsToVerify[i].id === "ali" ? "is-selected" : ""))}
      ${card(bar("Class verification progress", "62%", 62))}
      ${note('"Reading pages" means OCR is still extracting the answers; the exam appears as Ready to verify when it is done.')}`
  });
}

// ---------- T3 CGV verification ----------
function statusTag(a, tier) {
  const st = S().exam.answers[a.id].status;
  if (st === "accepted") return tag("Accepted", "auto");
  if (st === "corrected") return tag("Corrected", "auto");
  if (st === "clarify") return tag("Asked Ali", "decision", "help");
  if (st === "replied") return tag("Ali replied", "cgv");
  if (st === "consulting") return tag("With a colleague", "cgv", "colleague");
  if (a.language && a.language !== S().exam.expectedLanguage) return tag("Language", "decision", "language");
  return tag(`${a.confidence}%`, tier, null);
}

function answerRow(a) {
  const text = S().exam.answers[a.id].text;
  const shown = text ? `"${text}"` : "[unreadable]";
  const label = a.id === "q4" && S().exam.answers.q4.status === "open" ? `"3/8" or "8/3"?` : shown;
  return `<button class="answer" type="button" data-action="select-answer" data-id="${a.id}" aria-current="${S().exam.selected === a.id}"><span class="answer__q">Q${a.q}</span><span class="answer__text">${esc(label)}</span>${statusTag(a, a.tier)}</button>`;
}

function tierBlock(tier, label, list, extra, sum) {
  const iconName = { decision: "alert", glance: "eye", auto: "check-circle" }[tier];
  const count = sum[tier];
  if (tier === "auto") {
    const open = S().exam.autoOpen;
    return `<button type="button" class="tier-head tier-head--auto" data-action="toggle-auto" aria-expanded="${open}">${icon(open ? "chevron-down" : "chevron-right", "icon--sm")}${icon(iconName, "icon--sm")}<span>${label}</span>${open ? "" : `<span class="tier-head__hint">click to expand</span>`}<span class="tier-head__count">${count}</span></button>
      ${open ? `${list.map(answerRow).join("")}<p class="answers__more">+ ${extra} more auto-accepted answers · open any one to check it</p>` : ""}`;
  }
  return `<div class="tier-head tier-head--${tier}">${icon("chevron-down", "icon--sm")}${icon(iconName, "icon--sm")}<span>${label}</span><span class="tier-head__count">${count}</span></div>${list.map(answerRow).join("")}${extra ? `<p class="answers__more">+ ${extra} more answers to glance at</p>` : ""}`;
}

function detailPanel(sum) {
  const s = S();
  const def = answerDef(s.exam.selected);
  const a = s.exam.answers[def.id];
  const tier = tierOf(def);
  const tierLabel = { decision: "Needs a decision", glance: "Needs a glance", auto: "Auto-accepted" }[tier];
  const resolved = ["accepted", "corrected"].includes(a.status);
  const langOk = !def.language || def.language === s.exam.expectedLanguage;
  const confTone = def.confidence < 50 ? "decision" : def.confidence < s.exam.threshold ? "glance" : "auto";
  const reply = a.status === "replied" ? `<div class="reply-box"><span class="caption" style="color:var(--text-student-accent)">Ali's reply · today 10:24</span><br><strong>"${esc(demoData.exam.studentReplyQ4)}"</strong></div>` : "";
  const consult = a.status === "consulting" ? `<div class="reply-box" style="background:var(--cgv-bg)"><span class="caption" style="color:var(--cgv-text)">${esc(s.exam.consultedWith)} replied</span><br><strong>"I read it as ${esc(def.correctTo || a.text)}."</strong></div>` : "";
  const pictured = def.scan ? scan(def.scan, `Student's handwriting (scan) · Q${def.q}`) : `<div class="scan"><span class="scan__caption">${icon("scan", "icon--sm")}Student's handwriting (scan) · Q${def.q}</span><div class="scan__img" style="display:grid;place-items:center;background:var(--bg-subtle)"><span class="caption">High-confidence answer: scan shown on request</span></div></div>`;
  const actions = resolved
    ? `<div class="row">${tag(a.status === "accepted" ? "Accepted" : "Corrected and saved to Ali's handwriting profile", "auto")}${btn("Reopen", { style: "ghost", icon: "undo", attrs: 'data-action="reopen"' })}</div>`
    : `<div class="row">${btn("Accept", { icon: "check", attrs: 'data-action="accept" title="Shortcut: A"' })}${btn("Correct", { style: "secondary", icon: "edit", attrs: 'data-action="correct" title="Shortcut: C"' })}${btn("Consult colleague", { style: "secondary", icon: "colleague", attrs: 'data-action="open-consult"' })}${btn("Ask student to clarify", { style: "secondary", icon: "help", attrs: 'data-action="clarify"', disabled: a.status === "clarify" })}</div>`;
  return card(`<div class="card__head"><h2>Question ${def.q} · ${esc(def.question)}</h2>${tag(a.status === "replied" ? "Ali replied" : resolved ? (a.status === "accepted" ? "Accepted" : "Corrected") : tierLabel, a.status === "replied" ? "cgv" : resolved ? "auto" : tier)}</div>
    <div class="detail"><div>${pictured}</div><div class="detail__right">
      <label class="field"><span class="field__label">Extracted text (editable)</span><input class="input" id="extracted-text" data-input="cgv-text" value="${esc(a.text)}" placeholder="Type what the student wrote"></label>
      <span class="caption">${esc(def.read || "Quick check: does the text match the scan?")}</span>${reply}${consult}
      <div class="row">${tag(`OCR confidence ${def.confidence}%`, confTone)}${langOk ? tag(`Language: ${s.exam.expectedLanguage} ✓`, "neutral", "language") : tag(`Language: ${def.language} · expected ${s.exam.expectedLanguage}`, "decision", "language")}</div>
      <div class="scheme">${icon("file", "icon--sm")}Marking scheme · Q${def.q}: ${esc(def.scheme)} (1 mark)</div>
    </div></div>${actions}
    ${note(`Corrections are saved to Ali's handwriting profile. Asking Ali to clarify holds this exam's grades until he replies. ${annot("F15 F18 F23 F24")}`)}`);
}

export function renderCgv() {
  const s = S();
  if (s.exam.state === "not_uploaded") {
    return page({ crumb: "Verify exams · Ali Khaled", title: examTitle, body: card(`<h2>Ali has not sent this exam yet</h2><p class="muted">Switch to the student view and upload Maths Quiz 3, or skip the upload for this demo.</p><div class="row">${btn("Demo: mark as sent", { attrs: 'data-action="demo-mark-sent"' })}${btn("Back to exams", { style: "secondary", href: "#/teacher/verify" })}</div>`) });
  }
  const sum = cgvSummary();
  const by = (t) => sum.listed.filter((a) => a.tier === t);
  const held = sum.pending ? `<span class="held">${icon("help", "icon--sm")}Clarification pending for Q4 · grades held</span>` : s.exam.answers.q4.status === "replied" ? `<span class="tag tag--cgv">${icon("trust")}Ali answered your question about Q4</span>` : "";
  const verified = !["not_uploaded", "ready_to_verify"].includes(s.exam.state);
  const right = `<label class="field" style="min-width:200px"><span class="field__label">Expected language ${annot("F11")}</span><select class="select" data-change="language"><option ${s.exam.expectedLanguage === "English" ? "selected" : ""}>English</option><option ${s.exam.expectedLanguage === "Deutsch" ? "selected" : ""}>Deutsch</option></select></label>`;
  const stats = `<div class="grid-4">${stat("To check by hand", `${sum.percent}%`, `${sum.decision + sum.glance} of ${sum.total} answers need you`, "cgv")}${stat("Time saved", `~${sum.minutes} min`, "vs. checking every answer", "cgv")}${stat("Trust score", `${sum.trust}%`, "auto-accepted at this threshold", "cgv")}
    <div class="stat stat--cgv"><div class="slider"><div class="slider__top"><label for="threshold">Auto-accept confidence ${annot("F13")}</label><strong id="threshold-value">${s.exam.threshold}%</strong></div><input id="threshold" type="range" min="70" max="98" step="1" value="${s.exam.threshold}" data-change="threshold"><span class="stat__caption">${s.exam.threshold > 90 ? `Raised to ${s.exam.threshold}%: more answers move to Needs a glance.` : "Raise it to check more answers by hand."}</span></div></div></div>`;
  const list = `<section class="card answers"><div class="answers__head"><h3 class="grow">Answers by confidence ${annot("F12")}</h3><button class="icon-btn" type="button" data-action="open-help-tip" aria-label="How the three groups work">${icon("help")}</button>${icon("trust", "icon--sm")}</div>
    ${tierBlock("decision", "Needs a decision", by("decision"), 0, sum)}${tierBlock("glance", "Needs a glance", by("glance"), sum.hiddenGlance, sum)}${tierBlock("auto", "Auto-accepted", by("auto"), sum.hiddenAuto, sum)}</section>`;
  const foot = `<div class="cgv-foot">${bar("Decisions resolved", `${sum.resolved} of ${sum.decisionTotal}`, (sum.resolved / Math.max(1, sum.decisionTotal)) * 100)}<span class="grow caption">${sum.pending ? "Waiting for Ali's reply before you can confirm." : sum.allDone ? "Everything is checked. Confirm to start AI grading." : "Accept or correct every answer that needs you."}</span>${verified ? btn("Open grading", { href: "#/teacher/grading" }) : btn("Confirm verified text", { icon: "check", attrs: 'data-action="confirm-text"', disabled: !sum.allDone || sum.pending })}</div>`;
  const ui = getUi();
  let overlay = "";
  if (ui.modal === "consult") overlay = modal(`Consult a colleague about Q${answerDef(s.exam.selected).q}`, `<p class="muted">Your colleague sees only this answer's scan and the marking scheme, not Ali's name.</p><label class="field"><span class="field__label">Colleague</span><select class="select" id="colleague">${demoData.colleagues.map((c) => `<option>${esc(c.name)} (${esc(c.role)})</option>`).join("")}</select></label><label class="field"><span class="field__label">Note (optional)</span><input class="input" value="Can you read this answer?"></label>${tag("Waiting for a reply puts this answer on hold", "cgv")}`, `${btn("Cancel", { style: "secondary", attrs: 'data-action="close-modal"' })}${btn("Send to colleague", { icon: "send", attrs: 'data-action="send-consult"' })}`);
  if (ui.modal === "help-tip") overlay = modal("How the three groups work", `${["decision", "glance", "auto"].map((t) => `<div class="stack-sm">${tag({ decision: "Needs a decision", glance: "Needs a glance", auto: "Auto-accepted" }[t], t)}<span class="muted">${{ decision: "OCR is under 50% sure, or the language does not match. You decide.", glance: `50–${s.exam.threshold - 1}% sure. A quick look at the scan is enough.`, auto: `At or above your threshold (${s.exam.threshold}%). Open any one to check it.` }[t]}</span></div>`).join("")}<p class="kbd">Shortcuts: A = Accept · C = Correct · ↓ = next answer</p>`, btn("Got it", { style: "secondary", attrs: 'data-action="close-modal"' }));
  if (ui.grading) overlay = `<div class="overlay grading-overlay"><section class="modal" role="alertdialog" aria-live="assertive">${icon("sparkles", "icon--xl")}<h2>AI is grading Maths Quiz 3</h2><p class="muted">Using the verified text and your marking scheme. You will review every mark before anything reaches Ali.</p>${bar("Grading 10 questions", "…", 70, "cgv")}</section></div>`;
  return page({ crumb: "Verify exams · Ali Khaled · Grade 5", title: examTitle, subtitle: `30 answers extracted from 3 pages · submitted ${demoData.exam.submitted}`, right, body: `${held}${stats}<div class="cgv-layout">${list}${detailPanel(sum)}</div>${foot}${overlay}` });
}

// ---------- T4 Grading ----------
export function renderGradingList() {
  const ready = !["not_uploaded", "ready_to_verify"].includes(S().exam.state);
  const rows = demoData.examsToGrade.map((r) => [person(r.name, r.initials), esc(r.exam), esc(r.isAli && !ready ? "Not yet" : r.verified), `<strong>${r.isAli && !ready ? "—" : esc(r.ai) + " (AI)"}</strong>`, tag(r.low[0], r.low[1]), r.isAli ? btn(ready ? "Review" : "Verify first", { style: ready ? "primary" : "secondary", href: ready ? "#/teacher/grading" : "#/teacher/cgv" }) : btn("Review", { style: "secondary", attrs: 'data-action="demo-only"' })]);
  return page({
    crumb: "Grading · Class 5B", title: "Exams ready to grade", subtitle: "Verified exams with an AI-suggested mark. You confirm or override every mark; nothing reaches students or parents until you release it.",
    right: btn("Review next: Ali Khaled", { icon: "arrow-right", href: ready ? "#/teacher/grading" : "#/teacher/cgv" }),
    body: `<div class="grid-4">${stat("To grade", "5", "verified, waiting for you")}${stat("Marks to check", "4", "low reliability across 3 exams")}${stat("Graded this week", "30 of 48", "62% of the class")}${stat("AI suggestions", "Not final", "you decide every mark", "cgv")}</div>${table(["Student", "Exam", "Verified", "AI suggestion", "Low reliability", ""], rows, (i) => (i === 0 ? "is-selected" : ""))}${note("Sorted by the most marks that need your check. Low reliability means the scan or the AI is unsure, so look at the handwriting before confirming.")}`
  });
}

export function renderGrading() {
  const s = S();
  if (["not_uploaded", "ready_to_verify"].includes(s.exam.state)) return page({ crumb: "Grading · Ali Khaled", title: examTitle, body: card(`<h2>Verify the text first</h2><p class="muted">AI grading starts after you confirm the verified text.</p>${btn("Go to verification", { href: "#/teacher/cgv" })}`) });
  const rows = gradeRows();
  const confirmedCount = rows.filter((r) => r.confirmed).length;
  const done = confirmedCount === rows.length;
  const lows = rows.filter((r) => r.reliability === "Low" && !r.confirmed).length;
  const tableRows = rows.map((r) => {
    const rel = r.reliability === "High" ? tag("High", "auto") : r.reliability === "Medium" ? tag("Medium · language", "glance") : tag(r.confirmed ? "Low · scan checked" : "Low · check scan", "decision");
    const ai = r.overridden ? `<span class="mark--right">✓ ${r.finalMark}/1</span> <span class="caption">AI ${r.mark}/1</span>` : `<span class="${r.mark ? "mark--right" : "mark--wrong"}">${r.mark ? "✓" : "✗"} ${r.mark}/1</span>`;
    const decision = r.overridden ? tag("Overridden by you", "ink") : `<div class="decision"><label class="check"><input type="checkbox" data-change="confirm-mark" data-q="${r.q}" ${r.confirmed ? "checked" : ""}> Confirm</label><button class="link-btn" type="button" data-action="open-override" data-q="${r.q}">Override</button></div>`;
    return [`<strong>Q${r.q}</strong>`, esc(r.def.question), `"${esc(r.text || "—")}"`, `<span class="muted">${esc(r.def.scheme)}</span>`, ai, rel, decision];
  });
  const total = totalMark();
  const ui = getUi();
  let drawer = "";
  if (ui.modal && ui.modal.type === "override") {
    const r = rows.find((x) => x.q === ui.modal.q);
    drawer = `<div class="overlay drawer-overlay" data-action="close-modal" data-self-only><aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="ov-title">
      <div class="card__head"><div><h2 id="ov-title">Override mark · Q${r.q}</h2><span class="muted">${esc(r.def.question)}</span></div><button class="icon-btn" data-action="close-modal" aria-label="Close">${icon("close")}</button></div>
      ${r.def.scan ? scan(r.def.scan, `Student's handwriting (scan) · Q${r.q}`) : ""}
      <div class="ai-note"><strong>${icon("sparkles", "icon--sm")} AI suggested ${r.mark}/1</strong><span>${r.q === 9 ? 'Read "1" on the first line and found no fraction. Reliability is low because the answer continues on a second line.' : "Marked against the marking scheme from the verified text."}</span></div>
      <label class="field"><span class="field__label">Your mark</span><select class="select" id="ov-mark"><option value="1" ${r.mark === 0 ? "selected" : ""}>1 / 1</option><option value="0" ${r.mark === 1 ? "selected" : ""}>0 / 1</option></select></label>
      <label class="field"><span class="field__label">Reason (required, saved with the grade)</span><textarea class="textarea" id="ov-reason">${r.q === 9 ? esc(demoData.overrideReason) : ""}</textarea><span class="field__help">Ali and his parents see the final mark, not this note.</span></label>
      <label class="check"><input type="checkbox" checked> Save to Ali's handwriting profile</label>
      <div class="row row--end" style="margin-top:auto">${btn("Cancel", { style: "secondary", attrs: 'data-action="close-modal"' })}${btn("Save override", { icon: "check", attrs: `data-action="save-override" data-q="${r.q}"` })}</div></aside></div>`;
  }
  const anyOverride = Object.keys(s.grading.overrides).length;
  return page({
    crumb: "Grading · Ali Khaled · Grade 5", title: examTitle,
    subtitle: `The AI suggested each mark from the verified text and your marking scheme. Confirm each mark or override it. ${annot("F7 F17 F18")}`,
    right: done ? tag("Confirmed by you", "auto") : tag("AI suggestion · not final", "cgv"),
    body: `<div class="grid-4">${stat(done ? "Final grade" : "AI-suggested grade", `${total}/10`, done ? `AI suggested 7/10 · ${anyOverride} override` : "not final until you confirm", "cgv")}${stat("Low reliability", String(lows), lows ? "Q4 and Q9: check the scan" : "all checked")}${stat("Comparing fractions", "1 of 3", "Q1 right · Q6 and Q7 wrong")}${stat("Language", "1 accepted", 'Q8 "Hälfte" (German)')}</div>
      ${table(["Q", "Question", "Verified answer", "Marking scheme", "AI mark", "Reliability", "Your decision"], tableRows, (i) => (rows[i].reliability === "Low" && !rows[i].confirmed ? "is-warning" : ""))}
      <div class="page-foot">${bar("Marks confirmed", `${confirmedCount} of 10`, confirmedCount * 10)}${btn("Back to verified text", { style: "ghost", icon: "chevron-left", href: "#/teacher/cgv" })}${btn("Next: learning gaps", { icon: "arrow-right", attrs: 'data-action="confirm-grade"', disabled: !done })}</div>
      ${note('"Next: learning gaps" unlocks when every mark is confirmed or overridden. Overrides need a short reason, saved with the grade.')}${drawer}`
  });
}

// ---------- T5 Gaps, recurring errors, red flag ----------
export function renderGaps() {
  const s = S();
  if (!["teacher_confirmed", "released"].includes(s.exam.state)) return page({ crumb: "Grading · Ali Khaled", title: "Learning gaps and support", body: card(`<h2>Confirm the grade first</h2><p class="muted">Gaps are suggested from the confirmed marks.</p>${btn("Go to grading", { href: "#/teacher/grading" })}`) });
  const g = s.gaps;
  const gap = (key, title, detail) => {
    const val = g[key];
    const actions = val === "confirmed" ? `${tag("Confirmed by you", "auto")}<button class="link-btn" data-action="gap-reset" data-key="${key}">Undo</button>` : val === "dismissed" ? `${tag(key === "mixed" ? "Dismissed by you · OCR read error, not a gap" : "Dismissed by you", "neutral")}<button class="link-btn" data-action="gap-reset" data-key="${key}">Undo</button>` : `${btn("Confirm", { style: "secondary", icon: "check", attrs: `data-action="gap-confirm" data-key="${key}"` })}${btn("Dismiss", { style: "ghost", icon: "close", attrs: `data-action="gap-dismiss" data-key="${key}"` })}`;
    return `<div class="gap ${val === "dismissed" ? "is-dismissed" : ""}"><strong>${esc(title)}</strong><span class="muted">${esc(detail)}</span><div class="row">${actions}</div></div>`;
  };
  const gaps = card(`${head("Gaps found in Quiz 3", "Suggested from the confirmed marks", tag("AI suggestion", "cgv"))}${gap("comparing", "Comparing fractions · Q6, Q7", "Ali compared the numerators only (2/3 < 3/5, 5/6 < 7/9). Q1 was right because the denominators were easy.")}${gap("mixed", "Mixed numbers · Q9", "Suggested because the AI marked Q9 wrong. You overrode Q9 to 1/1, so this is likely not a gap.")}`);
  const recurring = card(`${head("Recurring error · Comparing fractions", "Same topic across Ali's last four quizzes", tag("3 in a row", "decision"))}<div class="history">${demoData.topicHistory.map(([q, ok, sc]) => `<div class="history__item history__item--${ok ? "ok" : "bad"}">${icon(ok ? "check-circle" : "alert")}<span>${q}</span><small>${ok ? "Right" : "Wrong"} · ${sc}</small></div>`).join("")}</div><p class="muted">Pattern: compares numerators and ignores denominators. Suggested practice: find a common denominator first. ${annot("F8 F20")}</p>`);
  const flagState = g.flag === "confirmed" ? `<p class="row strong" style="color:var(--danger-text)">${icon("check-circle")}Confirmed · Ali's parents are told when you release <button class="link-btn" data-action="flag-reset">Undo</button></p>` : g.flag === "dismissed" ? `<p class="row">${tag("Dismissed for now", "neutral")}<button class="link-btn" data-action="flag-reset">Undo</button></p>` : `<div class="row">${btn("Confirm flag", { style: "danger", icon: "flag", attrs: 'data-action="flag-confirm"' })}${btn("Dismiss", { style: "ghost", attrs: 'data-action="flag-dismiss"' })}</div>`;
  const flag = `<section class="card card--danger flag-card"><div class="card__head"><h3 class="row">${icon("flag")}Red flag: Comparing fractions</h3>${tag(g.flag === "confirmed" ? "Confirmed" : g.flag === "dismissed" ? "Dismissed" : "Suggested", g.flag === "confirmed" ? "ink" : "decision")}</div><p style="color:var(--danger-text)">Below 50% on this topic twice in a row: Quiz 2 (1 of 3) and Quiz 3 (1 of 3). Confirming tells Ali's parents and suggests a support session. ${annot("F9")}</p>${flagState}</section>`;
  const slots = card(`${head("Offer a support session", "Your free slots this week (from your timetable)", annot("F22"))}<div class="row">${demoData.supportSlots.map((sl) => `<button class="chip" type="button" data-action="pick-slot" data-slot="${sl}" aria-pressed="${g.slot === sl}" ${g.booked ? "disabled" : ""}>${g.slot === sl ? icon("check", "icon--sm") : ""}${sl}</button>`).join("")}</div><label class="check"><input type="checkbox" data-change="notify-parent" ${g.notifyParent ? "checked" : ""}> Tell Ali's parents when a slot is booked</label>${g.booked ? `<p class="row strong">${icon("calendar")}Booked · ${esc(g.slot)} <button class="link-btn" data-action="unbook">Undo</button></p>` : btn("Book session", { style: "secondary", icon: "calendar", attrs: 'data-action="book"', disabled: !g.slot })}`);
  const ready = g.comparing && g.flag;
  return page({
    crumb: "Grading · Ali Khaled · Maths Quiz 3", title: "Learning gaps and support", subtitle: "The AI looked at this quiz and Ali's earlier quizzes. Confirm what is right or dismiss it; nothing is shared until you release.",
    right: tag("Step 2 of 3 · Gaps", "ink", null),
    body: `<div class="grid-2">${gaps}${recurring}</div><div class="grid-2">${flag}${slots}</div><div class="page-foot"><span class="grow note">${icon("info", "icon--sm")}${ready ? "All suggestions reviewed." : "Confirm or dismiss each suggestion to continue. A support session is optional."}</span>${btn("Back to marks", { style: "ghost", icon: "chevron-left", href: "#/teacher/grading" })}${btn("Next: feedback", { icon: "arrow-right", href: ready ? "#/teacher/feedback" : "", disabled: !ready })}</div>`
  });
}

// ---------- T6 Feedback and release ----------
export function renderFeedback() {
  const s = S();
  if (!["teacher_confirmed", "released"].includes(s.exam.state)) return page({ crumb: "Grading · Ali Khaled", title: "Feedback and release", body: card(`<h2>Confirm the grade and gaps first</h2>${btn("Go to grading", { href: "#/teacher/grading" })}`) });
  const released = isReleased();
  const practiceCount = Object.values(s.feedback.practice).filter(Boolean).length;
  const items = [
    [true, `Grade confirmed: ${totalMark()}/10${Object.keys(s.grading.overrides).length ? ` (${Object.keys(s.grading.overrides).length} override, reason saved)` : ""}`],
    [Boolean(s.gaps.comparing), s.gaps.comparing === "dismissed" ? "Gap dismissed: Comparing fractions" : "Gap confirmed: Comparing fractions"],
    [Boolean(s.gaps.flag), s.gaps.flag === "confirmed" ? "Red flag confirmed · parents will be told" : s.gaps.flag === "dismissed" ? "Red flag dismissed" : "Red flag not reviewed"],
    [s.gaps.booked, s.gaps.booked ? `Support session: ${s.gaps.slot}` : "No support session booked (optional)"],
    [practiceCount > 0, `Comment and ${practiceCount} practice ${practiceCount === 1 ? "activity" : "activities"}`]
  ];
  const ok = Boolean(s.gaps.comparing && s.gaps.flag && practiceCount);
  const feedbackCard = card(`${head("Feedback for Ali", "Short and kind; a Grade 5 student reads it", tag("AI draft · edited by you", "cgv"))}
    <label class="field"><span class="field__label">Comment (Ali and his parents see this)</span><textarea class="textarea" data-input="feedback" maxlength="300" ${released ? "disabled" : ""}>${esc(s.feedback.text)}</textarea><span class="field__help">${s.feedback.text.length} / 300 characters</span></label>
    <strong>Practice to assign ${annot("F30")}</strong>${demoData.practice.map((p) => `<label class="check"><input type="checkbox" data-change="practice" data-id="${p.id}" ${s.feedback.practice[p.id] ? "checked" : ""} ${released ? "disabled" : ""}> ${esc(p.title)} · ${esc(p.topic)} · ${esc(p.meta.split(" · ")[0])}</label>`).join("")}`);
  const releaseCard = card(`${head(released ? `Released today ${s.feedback.releasedAt}` : "Ready to release?", released ? "Ali and his parents can see this now" : "Everything below goes out together", released ? tag("Released", "auto") : annot("F10"))}
    <div class="release-list">${items.map(([done, text]) => `<div class="release-item ${done ? "" : "is-missing"}">${icon(done ? "check-circle" : "info")}<span>${esc(text)}</span></div>`).join("")}</div>
    <div class="who-box"><span class="caption">Who is notified</span><br><strong>Ali (student app) · Ali's parents (parent app)</strong></div>
    ${released ? btn("Next exam: Malak Ibrahim", { icon: "arrow-right", attrs: 'data-action="demo-only"' }) : `<div class="row">${btn("Save draft", { style: "secondary", attrs: 'data-action="save-draft"' })}${btn("Release results", { icon: "send", attrs: 'data-action="open-release"', disabled: !ok })}</div>`}`);
  const confirm = getUi().modal === "release" ? modal("Release results to Ali and his parents?", `<p class="muted">They will see the ${totalMark()}/10 grade, your comment, ${practiceCount} practice ${practiceCount === 1 ? "activity" : "activities"}${s.gaps.flag === "confirmed" ? ", the red flag" : ""}${s.gaps.booked ? ` and the ${s.gaps.slot} session` : ""}.</p>${note("You can undo for 10 seconds after releasing. Later edits notify them again.")}`, `${btn("Cancel", { style: "secondary", attrs: 'data-action="close-modal"' })}${btn("Release results", { icon: "send", attrs: 'data-action="release"' })}`) : "";
  return page({ crumb: "Grading · Ali Khaled · Maths Quiz 3", title: "Feedback and release", subtitle: "Write what Ali and his parents will see, pick practice, then release. You can undo a release for 10 seconds.", right: tag(released ? "Released" : "Step 3 of 3 · Release", released ? "auto" : "ink", released ? undefined : null), body: `<div class="grid-2" style="grid-template-columns:minmax(0,1fr) 420px">${feedbackCard}${releaseCard}</div>${confirm}` });
}

// ---------- T7 Class OCR report ----------
export function renderReports() {
  const r = demoData.ocrReport;
  const max = Math.max(...r.byQuestion.map((q) => q[1]));
  return page({
    crumb: "Reports · Class 5B", title: "Class OCR report", subtitle: `Where handwriting is hardest to read, so you know which questions and answer types to check. ${annot("F16")}`,
    body: `<div class="grid-4" style="grid-template-columns:repeat(3,1fr)">${stat("Answers auto-accepted", `${r.autoAccepted}%`, "Maths · this month", "cgv")}${stat("Corrections made", String(r.corrections), "this month · saved to handwriting profiles")}${stat("Time saved", `~${r.hoursSaved} h`, "vs. checking every answer")}</div>
      <div class="grid-2">${card(`${head("OCR problems by question", "Answers that needed a decision, Maths Quiz 3")}<div class="qbars">${r.byQuestion.map(([q, n]) => bar(q, `${n} exams`, (n / max) * 100, "cgv")).join("")}</div>`)}
      ${card(`${head("Answer types that cause problems")}<div class="row">${["Stacked fractions", "Mixed numbers on two lines", "German words", "Crossed-out working"].map((t) => tag(t, "neutral", null)).join("")}</div>${head("Handwriting profiles", "Read accuracy after corrections")}${[["Ali Khaled", 93, "up from 81%"], ["Youssef Adel", 88, "up from 79%"], ["Omar Nabil", 84, "new profile"]].map(([n, v, c]) => bar(`${n} · ${c}`, `${v}%`, v, "cgv")).join("")}`)}</div>`
  });
}

// ---------- T8 Roster and gradebook ----------
export function renderRoster() {
  const tab = getUi().tab;
  const tabs = `<div class="tabs" role="tablist"><button class="tab" role="tab" aria-selected="${tab === "students"}" data-action="tab" data-tab="students">Students and contacts</button><button class="tab" role="tab" aria-selected="${tab === "gradebook"}" data-action="tab" data-tab="gradebook">Gradebook ${annot("F19")}</button></div>`;
  let body;
  if (tab === "gradebook") {
    const q3 = (id) => (id === "ali" ? (isReleased() ? `${demoData.gradebook.ali[2]}%` : tag("Being graded", "neutral", null)) : id === "sara" ? tag("Being verified", "neutral", null) : `${demoData.gradebook[id][2]}%`);
    const rows = demoData.students.map((st) => {
      const g = demoData.gradebook[st.id];
      const avg = st.id === "ali" && !isReleased() ? Math.round((g[0] + g[1]) / 2) : Math.round(g.reduce((a, b) => a + b, 0) / g.length);
      return [person(st.name, st.initials), `${g[0]}%`, `${g[1]}%`, q3(st.id), `<strong>${avg}%</strong>`];
    });
    body = `${table(["Student", "Quiz 1", "Quiz 2", "Quiz 3", "Average"], rows)}<div class="row row--between"><span class="note">${icon("info", "icon--sm")}Grades are recorded automatically when you release results.</span>${btn("Export to Excel", { style: "secondary", icon: "download", attrs: 'data-action="export"' })}</div>`;
  } else {
    const rows = demoData.students.map((st) => [person(st.name, st.initials), esc(st.parent), esc(st.phone), esc(st.email), st.flag ? tag("Red flag", "decision") : tag("On track", "auto"), btn("Contact", { style: "secondary", icon: "message", attrs: `data-action="open-contact" data-id="${st.id}"` })]);
    body = `<label class="field" style="max-width:420px"><span class="field__label">Search</span><input class="input" type="search" placeholder="Search a student or parent" data-input="roster-search"></label>${table(["Student", "Parent or guardian", "Phone", "Email", "Status", ""], rows)}`;
  }
  return page({ crumb: "Roster · Class 5B", title: tab === "gradebook" ? "Gradebook" : "Students and contacts", subtitle: `Student and parent contacts one click from the dashboard (R15). ${annot("F27")}`, body: `${tabs}${body}${contactModal()}` });
}

function contactModal() {
  const m = getUi().modal;
  if (!m || m.type !== "contact") return "";
  const st = demoData.students.find((x) => x.id === m.id) || ali;
  const text = st.id === "ali" ? "Hello Mr. Khaled, Ali is working hard. Comparing fractions is still hard for him, so I booked a support session on Monday at 5:00 pm. The app has short practice ideas you can try at home." : `Hello, I would like to talk about ${st.name.split(" ")[0]}'s progress in Maths.`;
  return modal(`Contact ${st.name.split(" ")[0]}'s parent`, `<p class="muted">To: ${esc(st.parent)} · ${esc(st.name)}, Class 5B</p><div class="row"><button class="chip" aria-pressed="true">${icon("check", "icon--sm")}Message in app</button><a class="chip" href="tel:${esc(st.phone)}">Call ${esc(st.phone)}</a><a class="chip" href="mailto:${esc(st.email)}">Email</a></div><label class="field"><span class="field__label">Message</span><textarea class="textarea" id="contact-text">${esc(text)}</textarea><span class="field__help">Written in plain words; parents see it in the parent app.</span></label>${st.id === "ali" ? `<label class="check"><input type="checkbox" checked> Attach Quiz 3 summary (8/10, comparing fractions)</label>` : ""}`, `${btn("Cancel", { style: "secondary", attrs: 'data-action="close-modal"' })}${btn("Send message", { icon: "send", attrs: `data-action="send-contact" data-name="${esc(st.parent)}"` })}`);
}

// ---------- T9 Student profile ----------
export function renderStudentProfile() {
  const s = S();
  const flagText = s.gaps.flag === "confirmed" ? tag("Comparing fractions · confirmed", "decision") : tag("Comparing fractions · suggested", "glance");
  const weak = table(["Topic", "Quiz 0", "Quiz 1", "Quiz 2", "Quiz 3"], [
    ["Comparing fractions", tag("OK", "auto"), tag("Weak", "decision"), tag("Weak", "decision"), tag("Weak", "decision")],
    ["Word problems", tag("OK", "auto"), tag("OK", "auto"), tag("Weak", "glance"), tag("OK", "auto")],
    ["Equivalent fractions", tag("OK", "auto"), tag("OK", "auto"), tag("OK", "auto"), tag("OK", "auto")],
    ["Multiplication", tag("OK", "auto"), tag("OK", "auto"), tag("OK", "auto"), tag("OK", "auto")]
  ]);
  const history = demoData.quizHistory.filter(([q]) => q !== "Quiz 3" || isReleased() || s.exam.state === "teacher_confirmed");
  const chart = `<div class="chart" role="img" aria-label="Results over time: ${history.map(([q, v]) => `${q} ${v}%`).join(", ")}">${history.map(([q, v], i) => `<div class="chart__col ${i === history.length - 1 ? "is-latest" : ""}"><span>${v}%</span><div class="chart__bar" style="height:${v * 1.4}px"></div><span>${q}</span></div>`).join("")}</div>`;
  const corrections = 41 + Object.values(s.exam.answers).filter((a) => a.status === "corrected").length;
  return page({
    crumb: "Students · Class 5B", title: "Ali Khaled", subtitle: "Grade 5 · Class 5B · Parent: Khaled A. · 0100 000 0001",
    right: `<div class="row">${btn("Message Ali", { style: "secondary", icon: "message", href: "#/teacher/help" })}${btn("Contact parent", { style: "secondary", icon: "phone", attrs: 'data-action="open-contact" data-id="ali"' })}</div>`,
    body: `<div class="grid-2" style="grid-template-columns:minmax(0,1fr) 360px">${card(`${head("Weakness tracker", "Updated automatically after each confirmed exam", annot("F20"))}${weak}`)}
      <div class="stack">${card(`${head("Flag history", "", annot("F9"))}${flagText}<span class="muted">Low topic score in two consecutive quizzes (Quiz 2: 1 of 3, Quiz 3: 1 of 3).</span>${s.gaps.booked ? `<span class="row strong">${icon("calendar")}Support session booked: ${esc(s.gaps.slot)}</span>` : ""}${btn("Mark follow-up done", { icon: "check", attrs: 'data-action="follow-up"' })}${btn("Check next exam", { style: "ghost", icon: "flag", href: "#/teacher/grading-list" })}`)}
      ${card(`${head("Handwriting profile", "", annot("F15"))}<span class="stat__value" style="color:var(--cgv-text)">${corrections} corrections learned</span>${bar("Read accuracy", "93%", 93, "cgv")}<span class="caption">Up from 81% in September</span>`, "card--cgv")}</div></div>
      ${card(`${head("Results over time")}${chart}`)}${contactModal()}`
  });
}

// ---------- T10 Help requests ----------
export function renderHelpInbox() {
  const s = S();
  const aliItem = s.student.helpSent ? [{ name: "Ali Khaled", initials: "AK", topic: "Maths Quiz 3 · Q7 · comparing fractions", time: "10:40", ali: true }] : [];
  const items = [...aliItem, ...demoData.helpInbox];
  const list = `<section class="card" style="padding:12px">${items.map((it, i) => `<div class="request" aria-current="${i === 0 && it.ali}">${avatar(it.initials)}<div class="grow"><div class="row row--between"><strong>${esc(it.name)}</strong><span class="caption">${esc(it.time)}</span></div><span class="caption">${esc(it.topic)}</span><div>${it.ali && !s.teacherReply ? tag("New", "decision") : tag("Replied", "auto")}</div></div></div>`).join("")}</section>`;
  const convo = s.student.helpSent ? card(`${head("Ali Khaled · Maths Quiz 3", "Sent from his results screen · today 10:40", btn("Open Ali's profile", { style: "ghost", icon: "user", href: "#/teacher/student" }))}
      <div class="bubble"><span class="caption" style="color:var(--text-student-accent)">Ali · ${esc(s.student.helpTopic)}</span><span>"${esc(s.student.helpText || "Can you help me with this?")}"</span></div>
      <div class="row">${tag("Q7 · wrong (0/1)", "decision")}${s.gaps.flag === "confirmed" ? tag("Red flag: Comparing fractions", "ink") : ""}${s.gaps.booked ? tag(`Session booked ${s.gaps.slot}`, "neutral", "calendar") : ""}</div>
      ${s.teacherReply ? `<div class="bubble" style="background:var(--bg-subtle)"><span class="caption">Your reply</span><span>${esc(s.teacherReply)}</span></div>${tag("Sent · Ali sees it in his notifications", "auto")}` : `<label class="field"><span class="field__label">Your reply</span><textarea class="textarea" id="reply-text">Good question, Ali! Make the bottoms the same first: 5/6 = 15/18 and 7/9 = 14/18. 15 is more than 14, so 5/6 is bigger. Try the "Which is bigger?" practice next.</textarea><span class="field__help">Ali sees this in his notifications and on his results screen.</span></label>
      <div class="row row--end">${btn("Save draft", { style: "secondary", attrs: 'data-action="save-draft"' })}${btn("Send reply", { icon: "send", attrs: 'data-action="send-reply"' })}</div>`}`)
    : card(`<h2>No new help requests</h2><p class="muted">When a student taps "I need help" on their results, the question appears here. (Demo: switch to Ali, open his results and tap "I need help".)</p>`);
  return page({ crumb: "Students · Class 5B", title: "Help requests", subtitle: `Questions students send from their results. Reply in a sentence or two; the student sees it in their notifications. ${annot("F21")}`, right: s.student.helpSent && !s.teacherReply ? tag("1 new", "decision") : "", body: `<div class="inbox">${list}${convo}</div>` });
}

// ---------- Actions ----------
const firstOpen = () => cgvSummary().listed.find((a) => a.tier !== "auto" && ["open", "consulting", "replied"].includes(S().exam.answers[a.id].status) && a.id !== S().exam.selected);

function resolveSelected(status) {
  const id = S().exam.selected;
  const text = document.querySelector("#extracted-text")?.value.trim() ?? S().exam.answers[id].text;
  if (status === "corrected" && !text) { showToast("Type the corrected text first.", { tone: "info" }); document.querySelector("#extracted-text")?.focus(); return; }
  updateState((s) => { s.exam.answers[id].status = status; s.exam.answers[id].text = text; return s; });
  const next = firstOpen();
  if (next) updateState((s) => { s.exam.selected = next.id; return s; });
  showToast(status === "corrected" ? `Q${answerDef(id).q} corrected · saved to Ali's handwriting profile` : `Q${answerDef(id).q} accepted`, { tone: status === "corrected" ? "cgv" : "success", action: "Undo", onAction: () => updateState((s) => { s.exam.answers[id].status = "open"; s.exam.selected = id; return s; }) });
}

export const teacherActions = {
  "open-goal": () => setUi({ modal: "goal" }),
  "save-goal": () => {
    const name = document.querySelector("#goal-name").value.trim() || "Class game day";
    const target = Math.max(Number(document.querySelector("#goal-target").value) || 300, S().goal.points);
    const ends = document.querySelector("#goal-ends").value;
    updateState((s) => { s.goal = { ...s.goal, name, target, ends }; return s; });
    setUi({ modal: null });
    showToast("Class goal saved");
  },
  "demo-mark-sent": () => { updateState((s) => { s.exam.state = "ready_to_verify"; s.upload.status = "sent"; return s; }); showToast("Demo: Ali's exam is sent and read by OCR", { tone: "info" }); },
  "demo-only": () => showToast("In this demo only Ali Khaled's exam is filled in.", { tone: "info" }),
  "select-answer": (el) => updateState((s) => { s.exam.selected = el.dataset.id; return s; }),
  "toggle-auto": () => updateState((s) => { s.exam.autoOpen = !s.exam.autoOpen; return s; }),
  accept: () => resolveSelected("accepted"),
  correct: () => resolveSelected("corrected"),
  reopen: () => updateState((s) => { s.exam.answers[s.exam.selected].status = "open"; return s; }),
  "open-consult": () => setUi({ modal: "consult" }),
  "send-consult": () => {
    const who = (document.querySelector("#colleague")?.value || "Ms. Salma Nour").split(" (")[0];
    updateState((s) => { const a = s.exam.answers[s.exam.selected]; a.status = "consulting"; s.exam.consultedWith = who; const def = answerDef(s.exam.selected); if (def.correctTo) a.text = def.correctTo; return s; });
    setUi({ modal: null });
    showToast(`Sent to ${who}. Her reading is filled in; check it and click Correct.`, { tone: "cgv" });
  },
  clarify: () => {
    updateState((s) => { s.exam.answers[s.exam.selected].status = "clarify"; return s; });
    const next = firstOpen();
    if (next) updateState((s) => { s.exam.selected = next.id; return s; });
    showToast("Question sent to Ali. Grades for this exam are on hold until he replies.", { tone: "cgv" });
  },
  "open-help-tip": () => setUi({ modal: "help-tip" }),
  "confirm-text": () => {
    setUi({ grading: true });
    window.setTimeout(() => {
      updateState((s) => { s.exam.state = "ai_graded"; return s; });
      setUi({ grading: false });
      navigate("/teacher/grading");
      showToast("AI grading done: 7/10 suggested. Review every mark.", { tone: "cgv" });
    }, 1600);
  },
  "open-override": (el) => setUi({ modal: { type: "override", q: Number(el.dataset.q) } }),
  "save-override": (el) => {
    const q = Number(el.dataset.q);
    const reason = document.querySelector("#ov-reason").value.trim();
    if (!reason) { showToast("Add a short reason before saving the override.", { tone: "info" }); document.querySelector("#ov-reason").focus(); return; }
    const mark = Number(document.querySelector("#ov-mark").value);
    updateState((s) => { s.grading.overrides[q] = { mark, reason }; return s; });
    setUi({ modal: null });
    showToast(`Override saved for Q${q} (reason saved with the grade)`);
  },
  "confirm-grade": () => {
    updateState((s) => { if (s.exam.state === "ai_graded") s.exam.state = "teacher_confirmed"; return s; });
    showToast(`Grade confirmed: ${totalMark()}/10`);
    navigate("/teacher/gaps");
  },
  "gap-confirm": (el) => updateState((s) => { s.gaps[el.dataset.key] = "confirmed"; return s; }),
  "gap-dismiss": (el) => updateState((s) => { s.gaps[el.dataset.key] = "dismissed"; return s; }),
  "gap-reset": (el) => updateState((s) => { s.gaps[el.dataset.key] = null; return s; }),
  "flag-confirm": () => { updateState((s) => { s.gaps.flag = "confirmed"; return s; }); showToast("Red flag confirmed. Ali's parents are told when you release."); },
  "flag-dismiss": () => updateState((s) => { s.gaps.flag = "dismissed"; return s; }),
  "flag-reset": () => updateState((s) => { s.gaps.flag = null; return s; }),
  "pick-slot": (el) => updateState((s) => { s.gaps.slot = el.dataset.slot; return s; }),
  book: () => { updateState((s) => { s.gaps.booked = true; return s; }); showToast(`Support session booked: ${S().gaps.slot}`, { action: "Undo", onAction: () => updateState((s) => { s.gaps.booked = false; return s; }) }); },
  unbook: () => updateState((s) => { s.gaps.booked = false; return s; }),
  "open-release": () => setUi({ modal: "release" }),
  release: () => {
    const before = S().exam.state;
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    updateState((s) => { s.exam.state = "released"; s.feedback.releasedAt = time; return s; });
    setUi({ modal: null });
    showToast("Grades saved to the gradebook", { action: "View", onAction: () => { setUi({ tab: "gradebook" }); navigate("/teacher/roster"); } });
    showToast("Ali and his parents were notified", { tone: "cgv", action: "Undo · 10 s", ms: 10000, onAction: () => { updateState((s) => { s.exam.state = before; s.feedback.releasedAt = null; return s; }); showToast("Release undone. Nothing was sent.", { tone: "info" }); } });
  },
  "save-draft": () => showToast("Draft saved", { tone: "info" }),
  tab: (el) => setUi({ tab: el.dataset.tab }),
  export: () => {
    const rows = [["Student", "Quiz 1", "Quiz 2", "Quiz 3"], ...demoData.students.map((st) => [st.name, ...demoData.gradebook[st.id].map((v, i) => (i === 2 && ((st.id === "ali" && !isReleased()) || st.id === "sara") ? "" : `${v}%`))])];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = Object.assign(document.createElement("a"), { href: url, download: "class-5b-gradebook.csv" });
    link.click();
    URL.revokeObjectURL(url);
    showToast("Gradebook exported (opens in Excel)");
  },
  "open-contact": (el) => setUi({ modal: { type: "contact", id: el.dataset.id } }),
  "send-contact": (el) => { setUi({ modal: null }); showToast(`Message sent to ${el.dataset.name}`); },
  "follow-up": () => showToast("Follow-up marked as done. Ali stays on your watch list until the next quiz.", { tone: "info" }),
  "send-reply": () => {
    const text = document.querySelector("#reply-text").value.trim();
    if (!text) return showToast("Write a short reply first.", { tone: "info" });
    updateState((s) => { s.teacherReply = text; return s; });
    showToast("Reply sent. Ali sees it in his notifications.");
  }
};

export const teacherInputs = {
  "cgv-text": () => {},
  feedback: (el) => { updateState((s) => { s.feedback.text = el.value; return s; }, { silent: true }); const help = el.parentElement.querySelector(".field__help"); if (help) help.textContent = `${el.value.length} / 300 characters`; },
  "dash-search": (el) => filterList("#dash-contacts", el.value),
  "roster-search": (el) => document.querySelectorAll(".table-wrap tbody tr").forEach((tr) => { tr.hidden = !tr.textContent.toLowerCase().includes(el.value.toLowerCase()); })
};

function filterList(selector, query) {
  const box = document.querySelector(selector);
  if (!box) return;
  const q = query.toLowerCase();
  const matches = demoData.students.filter((st) => `${st.name} ${st.parent}`.toLowerCase().includes(q));
  box.innerHTML = matches.length ? matches.slice(0, 4).map((st) => `<div><strong>${esc(st.name)}</strong><br><span class="caption">Parent: ${esc(st.parent)} · ${esc(st.phone)}</span></div>`).join("") : `<span class="caption">No student or parent matches "${esc(query)}".</span>`;
}

export const teacherChanges = {
  language: (el) => updateState((s) => { s.exam.expectedLanguage = el.value; return s; }),
  threshold: (el) => updateState((s) => { s.exam.threshold = Number(el.value); return s; }),
  "confirm-mark": (el) => updateState((s) => { s.grading.confirmed[el.dataset.q] = el.checked; return s; }),
  "notify-parent": (el) => updateState((s) => { s.gaps.notifyParent = el.checked; return s; }, { silent: true }),
  practice: (el) => updateState((s) => { s.feedback.practice[el.dataset.id] = el.checked; return s; })
};

/** Keyboard shortcuts on the CGV screen: A = Accept, C = Correct, ↓/↑ = next/previous answer. */
export function cgvKeys(event) {
  if (!location.hash.startsWith("#/teacher/cgv") || getUi().modal || ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) return;
  const key = event.key.toLowerCase();
  if (key === "a") teacherActions.accept();
  if (key === "c") document.querySelector("#extracted-text")?.focus();
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    const ids = cgvSummary().listed.filter((a) => a.tier !== "auto" || S().exam.autoOpen).map((a) => a.id);
    const i = ids.indexOf(S().exam.selected);
    const next = ids[(i + (event.key === "ArrowDown" ? 1 : -1) + ids.length) % ids.length];
    event.preventDefault();
    updateState((s) => { s.exam.selected = next; return s; });
  }
}
