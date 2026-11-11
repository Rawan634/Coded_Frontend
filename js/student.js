// Student view: S1–S10 (Ali, Grade 5) and S6L (Leila, Grade 2).
import { demoData } from "./data.js";
import { getState, getUi, setUi, updateState, isReleased, gradeRows, totalMark } from "./state.js";
import { btn, esc, icon, jar, scan, showToast, tag, annot } from "./components.js";
import { navigate } from "./router.js";

const S = () => getState();
const isLeila = () => S().selectedStudentId === "leila";
const main = (inner) => `<main class="student-main" id="main">${inner}</main>`;
const back = (href, label) => `<a class="back" href="${href}">${icon("chevron-left")}${esc(label)}</a>`;
const card = (inner, cls = "") => `<section class="card card--student ${cls}">${inner}</section>`;
const listen = (text) => btn("Listen", { style: "ghost", size: "student", icon: "listen", attrs: `data-action="listen" data-say="${esc(text)}"` });

function tracker(step) {
  const steps = ["Submitted", "Being checked by your teacher", "Results ready"];
  return `<div class="tracker">${steps.map((label, i) => `<div class="tracker__step ${i < step ? "is-done" : i === step ? "is-current" : ""}"><span class="tracker__dot">${i < step ? icon("check", "icon--sm") : ""}</span>${label}</div>`).join("")}</div>`;
}

const banner = (tone, iconName, title, body, label, href) => `<div class="banner banner--${tone}"><span class="banner__icon">${icon(iconName, "icon--lg")}</span><div class="grow"><div class="banner__title">${esc(title)}</div><div class="banner__body">${esc(body)}</div></div>${btn(label, { size: "student", href })}</div>`;

/** Notifications are worked out from where the workflow is. Newest first. */
export function studentNotifications() {
  const s = S();
  const list = [];
  if (s.teacherReply) list.push({ icon: "message", title: "Ms. Mariam answered your question", sub: "About Q7 · just now", href: "#/student/reply", isNew: true });
  if (isReleased()) list.push({ icon: "star", title: "Your Maths Quiz 3 results are ready", sub: `${totalMark()}/10 · today ${s.feedback.releasedAt || ""}`, href: "#/student/results", isNew: !s.teacherReply });
  if (s.exam.answers.q4.status === "replied" || (s.exam.answers.q4.status === "accepted" && s.student.points > 46)) list.push({ icon: "badge", title: "+5 points for answering Q4", sub: "Thank you for helping Ms. Mariam", href: "#/student/progress" });
  if (s.exam.answers.q4.status === "clarify") list.push({ icon: "help", title: "Ms. Mariam has a question about Q4", sub: "Tap to answer", href: "#/student/clarify", isNew: true });
  if (s.upload.status === "sent") list.push({ icon: "check-circle", title: "Maths Quiz 3 was sent", sub: "Ms. Mariam is checking it", href: "#/student/sent" });
  return list;
}

// ---------- S1 Home ----------
export function renderHome() {
  const s = S();
  if (isLeila()) {
    return main(`<h1 class="s-title">Hi Leila!</h1><p class="s-small">What do you want to do today?</p>${banner("result", "star", "Your Maths results are ready!", "You got three stars.", "See results", "#/student/results")}
      <div class="tiles">${tile("upload", "Upload exam", "#/student/choose-exam")}${tile("star", "My results", "#/student/results")}${tile("practice", "Practice", "#/student/practice")}</div>`);
  }
  let top = "";
  if (s.exam.answers.q4.status === "clarify") top = banner("question", "help", "Ms. Mariam has a question about Q4", "Tap to answer. It takes 10 seconds.", "Answer", "#/student/clarify");
  else if (isReleased()) top = banner("result", "star", "Your Maths Quiz 3 results are ready!", "Ms. Mariam checked your exam.", "See results", "#/student/results");
  const nothing = top ? "" : `<p class="row s-small">${icon("check-circle")}Nothing waiting for you. ${s.upload.status === "sent" ? "Ms. Mariam is checking your Maths Quiz 3." : "Upload your next exam when you get it back."}</p>`;
  return main(`<div><h1 class="s-title">Hi Ali!</h1><p class="s-small">What do you want to do today?</p></div>${top}
    <div class="tiles">${tile("upload", "Upload exam", "#/student/choose-exam")}${tile("star", "My results", "#/student/results")}${tile("practice", "Practice", "#/student/practice")}</div>
    ${card(`<div class="effort">${jar(Math.min(1, s.student.points / 60))}<div class="grow"><div class="s-heading">${s.student.points} effort points</div><div class="s-small">3-day streak · keep going! ${annot("F29 F34")}</div></div>${btn("My progress", { style: "secondary", size: "student", icon: "trophy", href: "#/student/progress" })}</div>`)}${nothing}`);
}

const tile = (iconName, label, href) => `<a class="tile" href="${href}"><span class="tile__icon">${icon(iconName)}</span>${esc(label)}</a>`;

// ---------- S2 Choose exam ----------
export function renderChooseExam() {
  const s = S();
  const choices = demoData.examChoices[s.upload.subject] || [];
  const sent = s.upload.status === "sent" || s.upload.status === "reading";
  return main(`${back("#/student/home", "Home")}<div class="s-head"><div><h1 class="s-title">Which exam is it?</h1><p class="s-small">Pick the subject, then the exam.</p></div>${tag("Step 1 of 3 · Choose", "student", null)}</div>
    <div class="row">${demoData.subjects.map((sub) => `<button class="chip" type="button" data-action="pick-subject" data-subject="${sub}" aria-pressed="${s.upload.subject === sub}">${s.upload.subject === sub ? icon("check", "icon--sm") : ""}${sub}</button>`).join("")}</div>
    <div class="stack" role="radiogroup" aria-label="Exam">${choices.map((c) => `<button class="choice" type="button" role="radio" aria-checked="${s.upload.choice === c}" data-action="pick-exam" data-choice="${esc(c)}"><span class="choice__dot"></span>${esc(c)}</button>`).join("")}</div>
    ${sent ? `<p class="row s-small">${icon("info")}You already sent Maths Quiz 3. You can still practise sending it in this demo.</p>` : ""}
    <div class="row row--end">${btn("Next: take photos", { size: "student", icon: "camera", href: "#/student/capture" })}</div>`);
}

// ---------- S3 Capture ----------
export function renderCapture() {
  const s = S();
  const blurry = !s.upload.page2Retaken;
  const page = (n) => {
    const isBlurry = n === 2 && blurry;
    return `<div class="page-card ${isBlurry ? "is-blurry" : ""}"><img src="assets/scans/${isBlurry ? "page2_blurry" : `page${n}`}.jpg" alt="Photo of page ${n}${isBlurry ? ", blurry" : ""}"><strong class="s-body">Page ${n}</strong>${isBlurry ? tag("Blurry – take it again", "glance") : tag("Clear", "auto")}</div>`;
  };
  return main(`${back("#/student/choose-exam", "Choose exam")}<div class="s-head"><div><h1 class="s-title">Take a photo of each page</h1><p class="s-small">${esc(s.upload.choice)} · 3 pages</p></div>${tag("Step 2 of 3 · Photos", "student", null)}</div>
    <div class="pages">${page(1)}${page(2)}${page(3)}<button class="page-card page-card--add" type="button" data-action="add-page">${icon("plus", "icon--lg")}Add page</button></div>
    ${blurry ? `<div class="banner banner--info"><span class="banner__icon">${icon("info", "icon--lg")}</span><div class="grow"><div class="banner__title">Page 2 is blurry</div><div class="banner__body">Hold the tablet still, in good light, and take it again.</div></div>${btn("Retake page 2", { size: "student", icon: "retake", attrs: 'data-action="retake"' })}</div>` : ""}
    <div class="row row--end">${btn("Next: check and send", { size: "student", icon: "arrow-right", href: blurry ? "" : "#/student/review", disabled: blurry })}</div>
    <p class="s-small" style="font-size:14px">${annot("F1")} The app checks each photo for blur before you can send.</p>`);
}

// ---------- S4 Check and send / sent / failed ----------
export function renderReview() {
  const s = S();
  const failed = s.upload.status === "failed";
  const line = (iconName, label, value) => `<div class="summary-line">${icon(iconName, "icon--lg")}<span class="s-small">${label}</span><strong class="s-body">${esc(value)}</strong></div>`;
  return main(`${back("#/student/capture", "Photos")}<div class="s-head"><div><h1 class="s-title">${failed ? "Not sent yet" : "Ready to send?"}</h1><p class="s-small">Ms. Mariam gets your pages and checks them.</p></div>${tag(failed ? "Not sent yet" : "Step 3 of 3 · Send", "student", null)}</div>
    ${card(`${line("file", "Exam", s.upload.choice)}${line("image", "Pages", "3 pages · all clear")}${line("user", "Goes to", "Ms. Mariam (Maths)")}`)}
    ${failed ? `<div class="banner banner--info"><span class="banner__icon">${icon("info", "icon--lg")}</span><div class="grow"><div class="banner__title">Sending didn't work</div><div class="banner__body">No internet right now. Your photos are saved on this tablet.</div></div>${btn("Try again", { size: "student", icon: "retake", attrs: 'data-action="send"' })}</div>` : ""}
    <div class="row row--end">${btn("Change photos", { style: "secondary", size: "student", icon: "retake", href: "#/student/capture" })}${failed ? "" : btn("Send to Ms. Mariam", { size: "student", icon: "send", attrs: 'data-action="send"' })}</div>
    ${failed ? "" : `<p class="row" style="justify-content:center"><button class="link-btn" data-action="send-fail">Demo: try sending with no internet</button></p>`}`);
}

export function renderSent() {
  const s = S();
  const reading = s.upload.status === "reading";
  return main(`<div class="center"><span class="big-check">${icon("check")}</span><h1 class="s-title">Sent! Great job, Ali.</h1>
    <p class="s-small" style="max-width:620px">${reading ? "Reading your pages… You can close the app." : "Your pages are read."} We will tell you when Ms. Mariam has checked it.</p>
    <div style="width:min(520px,100%)" class="bar bar--sun"><div class="bar__labels"><span>Reading pages</span><strong>${reading ? "2 of 3" : "3 of 3"}</strong></div><div class="bar__track"><div class="bar__fill" style="width:${reading ? 66 : 100}%"></div></div></div>
    ${tracker(isReleased() ? 3 : 1)}${btn("Back home", { size: "student", icon: "home", href: "#/student/home" })}</div>`);
}

// ---------- S5 Clarification ----------
export function renderClarify() {
  const s = S();
  const status = s.exam.answers.q4.status;
  if (status !== "clarify") {
    if (status === "replied" || status === "accepted") return renderClarifySent();
    return main(`${back("#/student/home", "Home")}<h1 class="s-title">No questions right now</h1><p class="s-small">When Ms. Mariam cannot read an answer, she asks you here.</p>`);
  }
  const pick = s.student.clarifyPick;
  return main(`${back("#/student/home", "Home")}<div><h1 class="s-title">Ms. Mariam has a question</h1><p class="s-small">She could not read one answer. Which one did you write?</p></div>
    ${card(`<div class="grid-2"><div>${scan("q4", "Your answer to Q4")}</div><div class="stack"><span class="s-small">Q4 · Write the shaded fraction</span><span class="s-title">Is this 3/8 or 8/3?</span>${listen("Is this three eighths, or eight thirds?")}</div></div>
      <div class="stack" role="radiogroup" aria-label="What you wrote">${["3/8", "8/3", "Something else"].map((c) => `<button class="choice" type="button" role="radio" aria-checked="${pick === c}" data-action="clarify-pick" data-choice="${c}"><span class="choice__dot"></span>${c}</button>`).join("")}</div>`)}
    <div class="row row--end">${btn("Send answer", { size: "student", icon: "send", attrs: 'data-action="clarify-send"' })}</div><p class="s-small" style="font-size:14px">${annot("F23")} Your marks are not final until you answer.</p>`);
}

function renderClarifySent() {
  return main(`<div class="center"><span class="points-toast">${icon("badge")}+5 points! You helped Ms. Mariam</span><span class="big-check">${icon("check")}</span><h1 class="s-title">Thanks, Ali!</h1><p class="s-small">You told Ms. Mariam you wrote "${esc(S().exam.answers.q4.text)}". She will finish checking your exam.</p>${btn("Back home", { size: "student", icon: "home", href: "#/student/home" })}</div>`);
}

// ---------- S6 Results (and S7 help) ----------
export function renderResults() {
  if (isLeila()) return renderLeila();
  const s = S();
  if (!isReleased()) {
    return main(`${back("#/student/home", "Home")}<h1 class="s-title">Maths Quiz 3 – Fractions</h1>${card(`<p class="s-body">${s.upload.status === "sent" ? "Ms. Mariam is still checking your exam. You will get a notification when your results are ready." : "You have not sent this exam yet."}</p>${tracker(s.upload.status === "sent" ? 1 : 0)}`)}
      ${s.upload.status === "sent" ? "" : btn("Upload exam", { size: "student", icon: "upload", href: "#/student/choose-exam" })}`);
  }
  const rows = gradeRows();
  const total = totalMark();
  const chips = rows.map((r) => `<div class="qchip qchip--${r.finalMark ? "ok" : "bad"}">${icon(r.finalMark ? "check-circle" : "alert")}Q${r.q} · ${r.finalMark ? "Right" : "Try again"}</div>`).join("");
  const wrong = rows.filter((r) => !r.finalMark).map((r) => `Q${r.q}`);
  const help = s.gaps.flag === "confirmed" && s.gaps.booked ? card(`<div class="effort"><span class="banner__icon" style="background:var(--bg-student)">${icon("calendar", "icon--lg")}</span><div class="grow"><div class="s-heading">Extra help with Ms. Mariam · ${esc(s.gaps.slot.replace("Sun", "Sunday").replace("Mon", "Monday").replace("Tue", "Tuesday"))}</div><div class="s-small">Comparing fractions was tricky in two quizzes, so she booked a short session to help you.</div></div></div>`) : "";
  const practise = s.gaps.comparing === "confirmed" ? `<section class="card card--student card--sun"><div class="effort"><div class="grow"><div class="s-heading">Practise: comparing fractions</div><div class="s-small">You mixed up which fraction is bigger in ${wrong.join(" and ")}.</div></div>${btn(s.student.helpSent ? "Help asked" : "I need help", { style: "secondary", size: "student", icon: "help", attrs: 'data-action="open-help"', disabled: s.student.helpSent })}${btn("Practise this", { size: "student", icon: "practice", href: "#/student/practice" })}</div></section>` : "";
  const modalHtml = getUi().modal === "help" ? helpModal() : "";
  return main(`${back("#/student/home", "Home")}<div class="s-head"><div class="stack-sm"><h1 class="s-title">Maths Quiz 3 – Fractions</h1>${tag("Checked by Ms. Mariam", "auto")}</div><div class="score"><strong>${total}/10</strong><span class="s-small" style="color:inherit">${total >= 8 ? "Great work!" : "Good effort!"}</span></div></div>
    <div class="qchips">${chips}</div>
    ${card(`<div class="row">${`<span class="avatar">MA</span>`}<span class="s-small">Ms. Mariam says</span></div><p class="s-body">${esc(s.feedback.text)}</p>${listen(s.feedback.text)}`)}${help}${practise}${modalHtml}
    <p class="s-small" style="font-size:14px">${annot("F2 F3 F21 F22 F28 F30")}</p>`);
}

function helpModal() {
  const s = S();
  const topics = ["I don't get Q7", "I don't get Q6", "Something else"];
  return `<div class="overlay" data-action="close-modal" data-self-only><section class="modal" role="dialog" aria-modal="true" aria-labelledby="help-title" style="width:min(680px,100%);border-radius:24px">
    <div class="modal__head"><h2 id="help-title" class="s-heading">Ask Ms. Mariam for help</h2><button class="icon-btn" data-action="close-modal" aria-label="Close">${icon("close")}</button></div>
    <div class="modal__body"><p class="s-small">What is tricky?</p>${topics.map((t) => `<button class="choice" type="button" role="radio" aria-checked="${s.student.helpTopic === t}" data-action="help-topic" data-topic="${t}"><span class="choice__dot"></span>${t}</button>`).join("")}
    <label class="field"><span class="field__label">Tell her more (you can skip this)</span><textarea class="textarea" data-input="help-text">${esc(s.student.helpText)}</textarea></label></div>
    <div class="modal__foot">${btn("Cancel", { style: "secondary", size: "student", attrs: 'data-action="close-modal"' })}${btn("Send to Ms. Mariam", { size: "student", icon: "send", attrs: 'data-action="send-help"' })}</div></section></div>`;
}

function renderLeila() {
  return main(`${back("#/student/home", "Home")}<section class="card card--student" style="align-items:center;text-align:center"><span class="s-small">Maths · Adding up to 20</span><div class="stars" role="img" aria-label="Three stars">${icon("star")}${icon("star")}${icon("star")}</div><h1 class="s-title">Great job with adding!</h1>${btn("Listen", { style: "secondary", size: "student", icon: "listen", attrs: 'data-action="listen" data-say="Great job with adding! You got three stars. Next, let us practise telling the time."' })}</section>
    <div class="grid-2">${card(`<div class="center" style="padding:0"><span class="s-small">Let's practise next</span><a class="tile" href="#/student/practice" style="width:100%;min-height:160px"><span class="tile__icon">${icon("clock")}</span>Telling the time</a>${btn("Start", { size: "student", icon: "arrow-right", attrs: 'data-action="demo-leila"' })}</div>`)}
      ${card(`<div class="center" style="padding:0"><span class="s-heading">Your effort jar</span>${jar(0.5)}<span class="s-small">Half full! Every try adds a drop.</span></div>`)}</div><p class="s-small" style="font-size:14px">${annot("F28")}</p>`);
}

// ---------- S8 Practice ----------
export function renderPractice() {
  const s = S();
  const doneBigger = s.student.practiceDone;
  const cards = [
    { id: "bigger", title: "Which is bigger?", meta: "5 questions · 10 min", done: doneBigger, href: "#/student/activity" },
    { id: "bottoms", title: "Same bottoms first", meta: "4 questions · 8 min", done: false, href: "" },
    { id: "adding", title: "Adding fractions", meta: "Done on Monday", done: true, href: "" }
  ];
  return main(`${back("#/student/home", "Home")}<div><h1 class="s-title">Practice</h1><p class="s-small">Short activities from Ms. Mariam. Each one gives you +5 effort points.</p></div>
    <div class="practice-cards">${cards.map((c) => `<div class="practice-card"><div class="practice-card__art">${icon(c.done ? "check-circle" : "practice")}</div><strong class="s-body">${esc(c.title)}</strong><span class="s-small">${esc(c.meta)}</span>${c.done ? tag("Done · +5 points", "auto") : c.href ? btn("Start", { size: "student", href: c.href, icon: "arrow-right" }) : btn("Start", { size: "student", style: "secondary", attrs: 'data-action="demo-practice"' })}</div>`).join("")}</div><p class="s-small" style="font-size:14px">${annot("F30")}</p>`);
}

const fracBar = (n, d) => `<div class="fraction-bar" role="img" aria-label="${n} out of ${d} parts shaded">${Array.from({ length: d }, (_, i) => `<span class="${i < n ? "is-on" : ""}"></span>`).join("")}</div>`;

export function renderActivity() {
  const s = S();
  const act = s.student.activity;
  const total = demoData.activity.length;
  if (act.index >= total) {
    return main(`<div class="center"><span class="points-toast">${icon("badge")}+5 points! Activity finished</span>${jar(0.85)}<h1 class="s-title">You did it, Ali!</h1><p class="s-small">${act.right} of ${total} right. ${act.right >= 4 ? "You made the bottoms the same every time." : "Try it again tomorrow for your streak."}</p><div class="row">${btn("More practice", { style: "secondary", size: "student", icon: "practice", attrs: 'data-action="restart-activity"' })}${btn("See my progress", { size: "student", icon: "trophy", href: "#/student/progress" })}</div></div>`);
  }
  const [a, b, c, d] = demoData.activity[act.index];
  const left = `${a}/${b}`, right = `${c}/${d}`;
  const correct = a / b > c / d ? left : right;
  const lcm = b * d;
  const feedback = act.checked ? (act.pick === correct ? `<p class="feedback-good">Yes! ${correct} is bigger: ${a * d}/${lcm} and ${c * b}/${lcm}.</p>` : `<p class="feedback-bad">Not quite. Make the bottoms the same: ${left} = ${a * d}/${lcm} and ${right} = ${c * b}/${lcm}.</p>`) : "";
  return main(`${back("#/student/practice", "Practice")}<div class="bar bar--sun"><div class="bar__labels"><span>Which is bigger?</span><strong>${act.index + 1} of ${total}</strong></div><div class="bar__track"><div class="bar__fill" style="width:${((act.index + 1) / total) * 100}%"></div></div></div>
    ${card(`<h1 class="s-title" style="text-align:center">Which is bigger: ${left} or ${right}?</h1><div class="grid-2">${[[a, b, left], [c, d, right]].map(([n, dd, label]) => `<div class="stack">${fracBar(n, dd)}<button class="choice" type="button" role="radio" aria-checked="${act.pick === label}" data-action="activity-pick" data-choice="${label}" ${act.checked ? "disabled" : ""}><span class="choice__dot"></span>${label} is bigger</button></div>`).join("")}</div>
      <div class="hint">${icon("lightbulb")}<span>Hint: make the bottoms the same. ${left} = ${a * d}/${lcm} and ${right} = ${c * b}/${lcm}.</span></div>${feedback}`)}
    <div class="row">${listen(`Which is bigger: ${a} over ${b}, or ${c} over ${d}?`)}<span class="grow"></span>${act.checked ? btn(act.index + 1 === total ? "Finish" : "Next question", { size: "student", icon: "arrow-right", attrs: 'data-action="activity-next"' }) : btn("Check answer", { size: "student", icon: "check", attrs: 'data-action="activity-check"', disabled: !act.pick })}</div>`);
}

// ---------- S9 Progress ----------
export function renderProgress() {
  const s = S();
  const history = demoData.quizHistory.filter(([q]) => q !== "Quiz 3" || isReleased());
  const badges = [["upload", "First upload", true], ["help", "Asked for help", true], ["edit", "Fixed a mistake", true], ["flame", "5-day streak", false]];
  return main(`${back("#/student/home", "Home")}<h1 class="s-title">My progress</h1>
    <div class="grid-2" style="grid-template-columns:minmax(0,1fr) 280px">${card(`<div class="effort">${jar(Math.min(1, s.student.points / 60))}<div class="stack-sm"><span class="s-title">${s.student.points} points this week</span>${tag(`You beat your own record by ${s.student.points - 40}!`, "student")}</div></div>`)}${card(`<div class="center" style="padding:0">${icon("flame", "icon--xl")}<span class="s-heading">3-day streak</span><span class="s-small">Practise tomorrow for 4!</span></div>`)}</div>
    ${card(`<span class="s-heading">My Maths quizzes</span><div class="s-chart" role="img" aria-label="${history.map(([q, v]) => `${q} ${v}%`).join(", ")}">${history.map(([q, v], i) => `<div class="chart__col ${i === history.length - 1 ? "is-latest" : ""}"><span>${v}%</span><div class="chart__bar" style="height:${v * 1.2}px"></div><span>${q}</span></div>`).join("")}</div><span class="s-small">${isReleased() ? "Up from 45% to 80% since Quiz 2. Keep practising comparing fractions!" : "Quiz 3 shows here when Ms. Mariam has checked it."}</span>`)}
    ${card(`<span class="s-heading">My badges</span><div class="badges">${badges.map(([i, l, on]) => `<div class="badge ${on ? "" : "is-locked"}"><span class="badge__icon">${icon(i, "icon--lg")}</span>${l}</div>`).join("")}</div>`)}
    ${card(`<span class="s-heading row">${icon("trophy")}Class goal: ${esc(s.goal.name.toLowerCase())}</span><div class="bar bar--sun"><div class="bar__labels"><span>Class 5B effort points</span><strong>${s.goal.points} / ${s.goal.target}</strong></div><div class="bar__track"><div class="bar__fill" style="width:${(s.goal.points / s.goal.target) * 100}%"></div></div></div><span class="s-small">Everyone's effort counts. No one is ranked.</span>`, "card--sun")}
    <p class="s-small" style="font-size:14px">${annot("F5 F29 F34 F35 F36")}</p>`);
}

// ---------- S10 Notifications ----------
export function renderNotifications() {
  const list = studentNotifications();
  return main(`${back("#/student/home", "Home")}<h1 class="s-title">Notifications</h1>${card(list.length ? list.map((n) => `<a class="notif ${n.isNew ? "is-new" : ""}" href="${n.href}"><span class="notif__icon">${icon(n.icon)}</span><span class="grow"><strong class="${n.isNew ? "s-heading" : "s-body"}" style="font-size:20px">${esc(n.title)}</strong><br><span class="s-small">${esc(n.sub)}</span></span>${n.isNew ? tag("New", "student", null) : ""}${icon("chevron-right")}</a>`).join("") : `<p class="s-body">Nothing yet. You will see news from Ms. Mariam here.</p>`, "")}<p class="s-small" style="font-size:14px">${annot("F4")}</p>`);
}

export function renderReply() {
  const s = S();
  if (!s.teacherReply) return main(`${back("#/student/notifications", "Notifications")}<h1 class="s-title">No answer yet</h1><p class="s-small">Ms. Mariam will answer soon.</p>`);
  return main(`${back("#/student/notifications", "Notifications")}<h1 class="s-title">Ms. Mariam answered you</h1>
    <section class="card card--student" style="background:var(--bg-subtle);box-shadow:none"><span class="s-small">You asked · ${esc(s.student.helpTopic)}</span><span class="s-body muted">"${esc(s.student.helpText)}"</span></section>
    ${card(`<div class="row"><span class="avatar">MA</span><span class="s-small">Ms. Mariam</span></div><p class="s-body">${esc(s.teacherReply)}</p><div class="grid-2">${[[5, 6, "5/6"], [7, 9, "7/9"]].map(([n, d, l]) => `<div class="stack-sm"><strong class="s-heading">${l}</strong>${fracBar(n, d)}</div>`).join("")}</div>`, "card--sun")}
    <div class="row">${listen(s.teacherReply)}<span class="grow"></span>${btn("Thanks!", { style: "secondary", size: "student", icon: "smile", href: "#/student/home" })}${btn('Try "Which is bigger?"', { size: "student", icon: "practice", href: "#/student/activity" })}</div>`);
}

// ---------- Actions ----------
function speak(text) {
  if (!("speechSynthesis" in window)) return showToast("Read-aloud is not available in this browser.", { tone: "info" });
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.9;
  window.speechSynthesis.speak(u);
}

export const studentActions = {
  listen: (el) => speak(el.dataset.say),
  "pick-subject": (el) => updateState((s) => { s.upload.subject = el.dataset.subject; s.upload.choice = (demoData.examChoices[el.dataset.subject] || [""])[0]; return s; }),
  "pick-exam": (el) => updateState((s) => { s.upload.choice = el.dataset.choice; return s; }),
  retake: () => { updateState((s) => { s.upload.page2Retaken = true; return s; }); showToast("Page 2 is clear now"); },
  "add-page": () => showToast("This exam has 3 pages. All of them are here.", { tone: "info" }),
  "send-fail": () => updateState((s) => { s.upload.status = "failed"; return s; }),
  send: () => {
    updateState((s) => { s.upload.status = "reading"; return s; });
    navigate("/student/sent");
    window.setTimeout(() => {
      updateState((s) => { s.upload.status = "sent"; if (s.exam.state === "not_uploaded") s.exam.state = "ready_to_verify"; return s; });
      showToast("Your pages are read. Ms. Mariam can check them now.");
    }, 2200);
  },
  "clarify-pick": (el) => updateState((s) => { s.student.clarifyPick = el.dataset.choice; return s; }),
  "clarify-send": () => {
    updateState((s) => { s.exam.answers.q4.status = "replied"; s.exam.answers.q4.text = s.student.clarifyPick === "Something else" ? "" : s.student.clarifyPick; s.student.points += 5; s.goal.points += 5; return s; });
    showToast("+5 points! Thank you for answering.", { tone: "success" });
  },
  "open-help": () => setUi({ modal: "help" }),
  "help-topic": (el) => updateState((s) => { s.student.helpTopic = el.dataset.topic; return s; }),
  "send-help": () => { updateState((s) => { s.student.helpSent = true; return s; }); setUi({ modal: null }); showToast("Sent to Ms. Mariam. You will get a notification when she answers."); },
  "demo-practice": () => showToast("Start with \"Which is bigger?\" first.", { tone: "info" }),
  "demo-leila": () => showToast("In this demo only Ali's practice activity is built.", { tone: "info" }),
  "activity-pick": (el) => updateState((s) => { s.student.activity.pick = el.dataset.choice; return s; }),
  "activity-check": () => updateState((s) => {
    const [a, b, c, d] = demoData.activity[s.student.activity.index];
    const correct = a / b > c / d ? `${a}/${b}` : `${c}/${d}`;
    s.student.activity.checked = true;
    if (s.student.activity.pick === correct) s.student.activity.right += 1;
    return s;
  }),
  "activity-next": () => updateState((s) => {
    s.student.activity = { ...s.student.activity, index: s.student.activity.index + 1, pick: null, checked: false };
    if (s.student.activity.index >= demoData.activity.length && !s.student.practiceDone) { s.student.practiceDone = true; s.student.points += 5; s.goal.points += 5; }
    return s;
  }),
  "restart-activity": () => { updateState((s) => { s.student.activity = { index: 0, pick: null, checked: false, right: 0 }; return s; }); navigate("/student/practice"); }
};

export const studentInputs = {
  "help-text": (el) => updateState((s) => { s.student.helpText = el.value; return s; }, { silent: true })
};
