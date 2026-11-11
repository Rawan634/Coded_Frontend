// Parent view (bonus): P1–P4 for Dina, Ali and Leila's mother.
import { demoData } from "./data.js";
import { getState, getUi, setUi, updateState, isReleased, totalMark } from "./state.js";
import { btn, esc, icon, showToast, tag, bar, annot } from "./components.js";

const S = () => getState();
const main = (inner) => `<main class="parent-main" id="main">${inner}</main>`;
const card = (inner) => `<section class="card">${inner}</section>`;

export function bottomNav(path) {
  const item = (href, iconName, label) => `<a class="tabitem" href="#${href}" ${path === href ? 'aria-current="page"' : ""}>${icon(iconName)}${label}</a>`;
  return `<nav class="bottom-nav" aria-label="Parent"><div class="bottom-nav__inner">${item("/parent/summary", "home", "Summary")}${item("/parent/alerts", "bell", "Alerts")}${item("/parent/contact", "message", "Contact teacher")}</div></nav>`;
}

const flagOn = () => isReleased() && S().gaps.flag === "confirmed";

export function renderSummary() {
  const s = S();
  const child = getUi().child || "ali";
  const switcher = `<div class="row">${[["ali", "Ali · Grade 5"], ["leila", "Leila · Grade 2"]].map(([id, label]) => `<button class="chip" type="button" data-action="pick-child" data-child="${id}" aria-pressed="${child === id}">${child === id ? icon("check", "icon--sm") : ""}${label}</button>`).join("")}</div>`;
  if (child === "leila") {
    return main(`<h1>Leila's week</h1>${switcher}${card(`<span class="caption">Latest result</span><div class="row row--between"><strong>Maths · Adding up to 20</strong><span class="row" style="color:var(--accent-sunflower)">★★★</span></div>${tag("Confirmed by her teacher", "auto")}<p class="quote">"Great job with adding! Next: telling the time."</p>`)}`);
  }
  const alertBar = flagOn() ? `<a class="alert-bar" href="#/parent/alerts">${icon("flag")}<span class="grow">Red flag: Comparing fractions${s.gaps.booked ? ` · support session ${esc(s.gaps.slot)}` : ""}</span>${icon("chevron-right")}</a>` : "";
  const result = isReleased()
    ? card(`<span class="caption">Latest result</span><div class="row row--between"><div class="stack-sm"><h3>Maths Quiz 3</h3>${tag("Confirmed by Ms. Mariam", "auto")}</div><span class="stat__value">${totalMark()}/10</span></div><p class="quote">"${esc(s.feedback.text)}"</p>`)
    : card(`<span class="caption">Latest result</span><h3>Maths Quiz 3</h3><p class="muted">Ms. Mariam is still checking this quiz. You will see the result once she confirms it.</p>${tag("Being checked", "neutral", "hourglass")}`);
  const topic = isReleased() && s.gaps.comparing === "confirmed" ? card(`<span class="caption">Topic to work on</span><h2>Comparing fractions</h2><p class="muted">Ali mixed up which fraction is bigger in Q6 and Q7.</p>${btn("See practice ideas", { style: "secondary", icon: "lightbulb", attrs: 'data-action="open-ideas"' })}`) : "";
  const history = demoData.quizHistory.filter(([q]) => q !== "Quiz 3" || isReleased());
  const progress = card(`<span class="caption">Progress this term · Maths</span>${history.map(([q, v], i) => bar(q, `${v}%`, v, i === history.length - 1 ? "" : "muted")).join("")}`);
  const sheet = getUi().sheet === "ideas" ? `<div class="overlay sheet-overlay" data-action="close-sheet" data-self-only><section class="sheet" role="dialog" aria-modal="true" aria-labelledby="ideas-title"><span class="sheet__grab"></span><div class="row row--between"><h2 id="ideas-title">Practice ideas · Comparing fractions</h2><button class="icon-btn" data-action="close-sheet" aria-label="Close">${icon("close")}</button></div><p class="muted">Short ideas for home. Ms. Mariam also assigned "Which is bigger?" in Ali's app.</p>
    ${[["lightbulb", "Paper pizza", "10 min", "Cut two paper circles into 3 and 5 slices. Shade 2/3 and 3/5. Which shaded part is bigger?"], ["target", "Same bottoms", "5 min", "Ask Ali to turn 2/3 and 3/5 into fifteenths (10/15 and 9/15), then compare."], ["practice", "In the app", S().student.practiceDone ? "Done" : "Not started", "Which is bigger? · 5 questions · assigned by Ms. Mariam"]].map(([i, t, m, d]) => `<div class="idea">${icon(i)}<div class="grow"><div class="row row--between"><strong>${t}</strong><span class="caption">${m}</span></div><span class="muted">${d}</span></div></div>`).join("")}
    ${btn("Got it", { icon: "check", size: "block", attrs: 'data-action="close-sheet"' })}</section></div>` : "";
  return main(`<h1>Ali's week</h1>${switcher}${alertBar}${result}${topic}${progress}${sheet}<p class="caption">${annot("F31 F32 F33")}</p>`);
}

export function renderAlerts() {
  const s = S();
  const alerts = [];
  if (flagOn()) alerts.push(["flag", "var(--danger-icon)", "Red flag · Ali", `Comparing fractions${s.gaps.booked ? ` · support session booked ${s.gaps.slot}` : ""}`]);
  if (isReleased()) alerts.push(["star", "var(--success-icon)", "Results ready · Ali", `Maths Quiz 3 · ${totalMark()}/10 · confirmed`]);
  alerts.push(["star", "var(--accent-sunflower)", "Results ready · Leila", "Adding up to 20 · ★★★"]);
  S().parentMessages.forEach((m) => alerts.push(["message", "var(--text-secondary)", "You wrote to Ms. Mariam", m]));
  return main(`<h1>Alerts</h1>${card(alerts.map(([i, c, t, sub]) => `<a class="alert-row" href="#/parent/summary"><span style="color:${c}">${icon(i)}</span><span class="grow"><strong>${esc(t)}</strong><br><span class="caption">${esc(sub)}</span></span>${icon("chevron-right")}</a>`).join(""))}${btn("Contact Ms. Mariam", { icon: "message", size: "block", href: "#/parent/contact" })}`);
}

export function renderContact() {
  return main(`<h1>Contact teacher</h1>${card(`<div class="row"><span class="avatar avatar--md">MA</span><div><strong>Ms. Mariam Adel</strong><br><span class="caption">Maths · Class 5B</span></div></div>`)}
    ${card(`<div class="row"><button class="chip" aria-pressed="true">${icon("check", "icon--sm")}Message</button><button class="chip" type="button" data-action="ask-call">Ask for a call</button></div>
    <label class="field"><span class="field__label">About</span><select class="select" id="about"><option>Ali · ${S().gaps.booked ? `support session ${esc(S().gaps.slot)}` : "Maths Quiz 3"}</option><option>Leila · general</option></select></label>
    <label class="field"><span class="field__label">Message</span><textarea class="textarea" id="parent-msg">Hello Ms. Mariam, thank you for booking the session. Ali will be there on Monday. What can we practise at home?</textarea><span class="field__help">Ms. Mariam usually replies within one school day.</span></label>
    ${btn("Send message", { icon: "send", size: "block", attrs: 'data-action="parent-send"' })}`)}`);
}

export const parentActions = {
  "pick-child": (el) => setUi({ child: el.dataset.child }),
  "open-ideas": () => setUi({ sheet: "ideas" }),
  "close-sheet": () => setUi({ sheet: null }),
  "ask-call": () => showToast("Call request sent. Ms. Mariam will suggest a time.", { tone: "info" }),
  "parent-send": () => {
    const text = document.querySelector("#parent-msg").value.trim();
    if (!text) return showToast("Write a short message first.", { tone: "info" });
    updateState((s) => { s.parentMessages.push(text.slice(0, 80)); return s; });
    showToast("Message sent to Ms. Mariam");
  }
};
