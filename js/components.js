// Small HTML builders, one per Figma component.
import { ICONS } from "./icons.js";

export const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export function icon(name, cls = "") {
  return `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ""}</svg>`;
}

const TAG_ICONS = { decision: "alert", glance: "eye", auto: "check-circle", cgv: "trust", neutral: "info", ink: "check", student: "star" };

export function tag(label, tone = "neutral", iconName = TAG_ICONS[tone]) {
  return `<span class="tag tag--${tone}">${iconName ? icon(iconName) : ""}${esc(label)}</span>`;
}

/** Feature-ID pill, visible only with ?annotate=1 in the URL. */
export const annot = (ids) => `<span class="annot">${ids}</span>`;

export function btn(label, { style = "primary", size = "", icon: iconName = "", attrs = "", disabled = false, href = "" } = {}) {
  const cls = `btn btn--${style} ${size === "student" ? "btn--student" : ""} ${size === "block" ? "btn--block" : ""}`;
  const inner = `${iconName ? icon(iconName) : ""}<span>${esc(label)}</span>`;
  if (href) return `<a class="${cls}" href="${href}" ${attrs}>${inner}</a>`;
  return `<button type="button" class="${cls}" ${disabled ? "disabled" : ""} ${attrs}>${inner}</button>`;
}

export const avatar = (initials, size = "", tone = "") => `<span class="avatar ${size ? `avatar--${size}` : ""} ${tone ? `avatar--${tone}` : ""}" aria-hidden="true">${esc(initials)}</span>`;

export function bar(label, valueText, pct, tone = "") {
  const value = Math.max(0, Math.min(100, Math.round(pct)));
  return `<div class="bar ${tone ? `bar--${tone}` : ""}"><div class="bar__labels"><span>${esc(label)}</span><strong>${esc(valueText)}</strong></div><div class="bar__track" role="progressbar" aria-label="${esc(label)}" aria-valuenow="${value}" aria-valuemin="0" aria-valuemax="100"><div class="bar__fill" style="width:${value}%"></div></div></div>`;
}

export const stat = (label, value, caption, tone = "") => `<div class="stat ${tone ? `stat--${tone}` : ""}"><span class="stat__label">${esc(label)}</span><span class="stat__value">${esc(value)}</span><span class="stat__caption">${esc(caption)}</span></div>`;

export function table(headers, rows, rowClass = () => "") {
  return `<div class="table-wrap"><table><thead><tr>${headers.map((h) => `<th scope="col">${esc(h)}</th>`).join("")}</tr></thead><tbody>${rows.map((row, i) => `<tr class="${rowClass(i)}">${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}

export const person = (name, initials) => `<span class="person">${avatar(initials)}${esc(name)}</span>`;

export function modal(title, body, foot = "", { closeAction = "close-modal", wide = false } = {}) {
  return `<div class="overlay" data-action="${closeAction}" data-self-only><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" ${wide ? 'style="width:min(640px,100%)"' : ""}>
    <div class="modal__head"><h2 id="modal-title">${esc(title)}</h2><button class="icon-btn" type="button" data-action="${closeAction}" aria-label="Close">${icon("close")}</button></div>
    <div class="modal__body">${body}</div>${foot ? `<div class="modal__foot">${foot}</div>` : ""}</section></div>`;
}

export function scan(id, caption) {
  return `<figure class="scan" style="margin:0"><figcaption class="scan__caption">${icon("scan", "icon--sm")}${esc(caption)}</figcaption><img class="scan__img" src="assets/scans/${id}.jpg" alt="Scan of the student's handwriting, ${esc(caption)}"></figure>`;
}

export function jar(level = 0.7) {
  return `<span class="jar" role="img" aria-label="Effort jar ${Math.round(level * 100)}% full"><span class="jar__lid"></span><span class="jar__body"><span class="jar__fill" style="height:${Math.round(level * 100)}%"></span></span></span>`;
}

export function clearToasts() { document.querySelector(".toast-stack")?.replaceChildren(); }

// ---------- Toasts (kept outside #app so a re-render does not remove them) ----------
let toastId = 0;
export function showToast(message, { tone = "success", action = null, onAction = null, ms = 4000 } = {}) {
  let stack = document.querySelector(".toast-stack");
  if (!stack) {
    stack = document.createElement("div");
    stack.className = "toast-stack";
    stack.setAttribute("role", "status");
    stack.setAttribute("aria-live", "polite");
    document.body.appendChild(stack);
  }
  const el = document.createElement("div");
  const iconName = { success: "check-circle", cgv: "trust", info: "info" }[tone];
  el.className = `toast toast--${tone}`;
  el.dataset.toast = String(++toastId);
  el.innerHTML = `${icon(iconName)}<span>${esc(message)}</span>${action ? `<button class="toast__action" type="button">${esc(action)}</button>` : ""}`;
  if (action && onAction) el.querySelector("button").addEventListener("click", () => { onAction(); el.remove(); });
  stack.appendChild(el);
  while (stack.children.length > 3) stack.firstElementChild.remove();
  window.setTimeout(() => el.remove(), ms);
}
