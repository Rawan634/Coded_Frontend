# LearnLoop Milestone 3: Copilot Kit

## How to use this (read first)

1. Create the repo folder and open it in VS Code. Use **Copilot Chat in Agent mode**.
2. Create `.github/copilot-instructions.md` and paste **Part 1** into it. Copilot reads this file automatically in every chat, so it never forgets the spec.
3. Export every wireframe frame from Figma as PNG (T1 to T9, S1 to S10, P1 to P2) into `/docs/wireframes/`. When you run a phase prompt, **attach the matching PNGs** to the chat so Copilot copies the layout.
4. Paste the **Part 2** prompts one at a time, in order. After each phase: run it with Live Server, click through, fix, then `git commit`. Do not move on while the previous phase is broken.
5. Keep your Copilot chat history for the AI disclosure (Command Palette: "Chat: Export Chat", or copy it manually).

---

# PART 1: paste into `.github/copilot-instructions.md`

## Project
LearnLoop is a front-end prototype for a course project (CSEN 909 HCI, GUC). It is an AI-assisted exam assessment web app for children in Grades 1 to 5, with a Student view, a Teacher view and an optional Parent view. The teacher always verifies and confirms before anything reaches the student (human in the loop). There is **no backend and no real AI or OCR**: all AI output (OCR text, confidence scores, grades, weaknesses, feedback) is hard-coded mock data.

## Tech rules
- Plain HTML, CSS and vanilla JavaScript only. No frameworks, no build step, no npm dependencies.
- Must run by opening with VS Code Live Server and deploy as-is on GitHub Pages (use relative paths).
- Single-page app with hash routing (`#/teacher/dashboard`, `#/student/home`, `#/parent/summary`, and so on).
- Folder layout: `index.html`, `css/` (tokens.css, base.css, components.css, one css file per view), `js/` (state.js, data.js, router.js, one js file per view, components.js), `assets/`.
- All shared data lives in `js/data.js`. All app state lives in `js/state.js` and is saved to `localStorage` so a teacher action (for example releasing results) is visible in the student view without a page reload. Provide a "Reset demo" button.
- Add a small **demo role switcher** in the top bar: Teacher (Ms. Mariam) / Student (Ali, Grade 5) / Student (Leila, Grade 2) / Parent (Dina). This lets us demo the full workflow in one browser.
- Use semantic HTML, labels on inputs, visible focus states, sufficient contrast, and keyboard-operable buttons.

## Source of truth
The Milestone 2 report is the spec. Keep the **same screens, same layout, same flow, same feature IDs (F1 to F36), same wording and same mock data** as the wireframes. Milestone 3 is the **high-fidelity** version of those wireframes: same structure, now with real colour, icons, typography and polish. Do not invent new screens or features. If something is unclear, ask.

## Design system (high fidelity)
- Light theme only, clean and simple, **nothing dark** (teacher requirement R16). White cards on a very light grey background, soft shadows, rounded corners.
- Primary colour blue (matches the blue feature pills in the wireframes). Status colours: green = good/auto-accepted, amber = needs a glance, red = needs a decision/red flag, purple = CGV elements.
- Define everything as CSS variables in `tokens.css` (colours, spacing, radius, font sizes).
- Font: Inter (Google Fonts) with a system-ui fallback.
- Teacher view: desktop-first (1440 wide), sidebar nav (Dashboard, Verify exams, Grading, Students, Reports, Roster), denser tables and cards.
- Student view: tablet-first (1024 x 768), **big buttons, big icons, short text, one main action per screen**, friendly rounded style, emoji/inline SVG icons.
- Parent view: phone-first (390 wide) with a bottom tab bar (Summary, Alerts, Contact teacher).
- Everything must stay responsive (nothing breaks between 360 and 1440 px).
- Feature pills (F12, F23, and so on) shown in the wireframes are annotations. Show them only when `?annotate=1` is in the URL, otherwise hide them.

## Exam workflow state machine (drives everything)
`not_uploaded -> submitted -> ready_to_verify -> (clarification_pending -> ready_to_verify) -> verified -> ai_graded -> teacher_confirmed -> released`
- Student sees a grade, feedback, weaknesses and red flags **only when state = released** (F2, F3).
- While any answer is `clarification_pending` (F23), results cannot be released and the student sees the clarification request on S1/S5.
- Releasing results triggers: student notification (F4), parent alert (F33), gradebook entry (F19), weakness tracker update (F20), student effort points where applicable.

## Mock data (use exactly this)
- Teacher: Ms. Mariam Adel, Class 4B Mathematics, 48 exams this week.
- Students: Ali Khaled (Grade 5, parent Khaled A.), Leila Khaled (Grade 2), Mona Samir, Nour Hassan, Omar Nabil, Youssef Adel, Sara Fathy. Parent: Dina Mostafa (mother of Ali and Leila).
- Exam: "Maths Quiz 3 - Fractions", Ali, 30 answers extracted. 22 auto-accepted, 5 needs a glance, 3 needs a decision.
  - Needs a decision: Q4 "3/8" or "8/3"? (Low 41%), Q7 [unreadable] (Low 28%), Q12 "Hälfte" (Language mismatch; expected language English).
  - Needs a glance: Q2 "5/6" (Medium 72%), Q9 "1 1/4" (Medium 68%), plus 3 more.
  - Trust score 88%, 12% to check by hand (4 of 30), about 8 min saved, confidence threshold slider default 90%.
- Grading table (marking scheme visible): Q1 "3/4 > 1/2" 1/1 High; Q4 "3/8 < 5/8" 1/1 Low (check scan); Q6 "2/3 = 3/6" 0/1 High; Q9 "1 1/4 = 5/4" 1/2 Low (check scan); Q10 "12 / 3 = 4 sweets" 2/2 High. AI grade 7/10; teacher overrides Q9 to 2/2 with reason "Working on the second line is correct; OCR missed it." giving 8/10 (80%).
- Learning gaps: Comparing fractions (Q4, Q6), Word problems (Q10), Mixed numbers (Q9, dismissed). Recurring: comparing fractions wrong in 3 of last 4 exams (Quiz 0 ok, Quiz 1/2/3 wrong).
- Red flag rule: low topic score in **two consecutive exams** (Fractions: Quiz 2 45%, Quiz 3 40%). Flagged students on dashboard: Ali (Fractions), Mona Samir (Word problems), Youssef Adel (Multiplication).
- Dashboard: grading progress 62% (18 of 48 exams), 12 to verify, 5 to grade; class problem areas: Comparing fractions 64%, Word problems 41%, Long multiplication 28%; class goal 240/300 effort points (class game day).
- Gradebook: Ali 70% / 45% / 80% (avg 65%), Nour 90/85/95 (90%), Mona 60/50/55 (55%).
- Support slots: Sun 4:00 pm, Mon 5:00 pm, Tue 4:30 pm.
- Feedback text: "Great work on equivalent fractions! Next, practise comparing fractions with different denominators: find a common denominator first." Personal comment: "You're improving, keep it up!"
- Practice: "Which is bigger?" (5 questions), "Fraction number line" (game), "Fractions in stories" (3 word problems).
- Effort points rules: on-time upload +10, answering a clarification +5, finishing practice +5, practice streak +2 per day, asking for help +3 (once per topic per week). Grades never earn points, points are never removed, no individual ranking anywhere. Ali: 46 points this week, beat own record by 6. Badges: First upload, 3-day streak, Fraction explorer.
- Leila's younger-student result view: 3 stars, "Great job with adding!", picture "Practise: telling time", Listen button (use the browser SpeechSynthesis API), effort jar.

## Languages
Exams can be English or German. Include one German exam (subject "German") in the student exam list and the teacher "Expected language" dropdown (English / Deutsch). CGV flags answers whose language does not match the expected language and sends them to "needs a decision".

## Code quality
Small readable functions, no duplicated markup (build reusable components in `components.js`: card, pill, button, table, toast, modal, progress bar), comments only where logic is non-obvious, no console errors.

---

# PART 2: prompts, one per phase

### Phase 0: scaffold
> Read `.github/copilot-instructions.md`. Scaffold the project exactly as described: folder structure, `index.html` shell, hash router, top bar with the demo role switcher and "Reset demo" button, `tokens.css` design tokens, base styles, and reusable components (card, pill, button, table, toast, modal, progress bar). Create `data.js` with all mock data from the instructions and `state.js` with the exam state machine, localStorage persistence and a simple subscribe/notify mechanism. Add empty placeholder pages for all routes: teacher T1 to T9, student S1 to S10, parent P1 to P2. Do not build the screens yet.

### Phase 1: student upload flow (S1 to S4), HTA 1
> Attached are the wireframes for S1, S2, S3 and S4. Build these four student screens in high fidelity, matching the layout and wording. S1 Home: clarification banner (only when an answer is pending), "results ready" banner (only when state is released), three big tiles (Upload exam, My results, My progress). S2: choose subject (Maths, Science, English, German) then exam. S3: simulated page capture for 3 pages: clicking "Take photo" adds a mock page thumbnail, page 2 is marked "Blurry, please retake" until the student retakes it once, with the tip "put the page flat in good light". S4: review pages, "Send exam", then the status tracker (Submitted, Being checked by your teacher, Results ready). Sending sets the exam state to `submitted` then `ready_to_verify` and gives +10 effort points if on time. Follow the HTA 1 plans (retake if unclear, check all pages before sending).

### Phase 2: teacher dashboard and CGV verification (T1 to T3), HTA 2
> Attached are wireframes T1, T2, T3. Build the teacher shell (sidebar nav, top bar) and these three screens. T1 dashboard with all cards from the wireframe. T2 exams-to-verify table, sorted by most answers needing a decision, with filters and status pills; the exam submitted by Ali in Phase 1 must appear here as "Ready to verify". T3 is our unique feature (Confidence-Guided Verification) so make it the most polished screen: summary bar with 12% to check, minutes saved, trust score and a working confidence-threshold slider (moving it re-sorts answers between tiers using the mock confidence values); left list of answers grouped into Needs a decision / Needs a glance / Auto-accepted (collapsed but expandable); right panel with scan placeholder, editable extracted text, OCR confidence pill, language pill and marking scheme line; buttons Accept, Correct, Consult colleague, Ask student to clarify. Correct shows the toast "Correction saved to Ali's handwriting profile". Ask student to clarify sets that answer to `clarification_pending` and blocks "Confirm verified text". Expected-language dropdown (English / Deutsch) re-flags language mismatches. Progress "Decisions resolved: x of 3". Confirm verified text moves the exam to `verified` and then `ai_graded`.

### Phase 3: student clarification (S5), the hand-over
> Attached: S5 and the S1 banner. When the teacher asks Ali to clarify Q4, show the banner on S1 and the S5 screen with the scan image and a text field. Sending the answer gives +5 points, returns that answer to the teacher as resolved (teacher sees the student's text in T3 and can Accept or Correct it), and unblocks verification.

### Phase 4: grading, gaps and release (T4 to T6), HTA 3 and HTA 5
> Attached: T4, T5, T6. Build grade review (table with student answer, AI mark, marking scheme, reliability pill, Confirm / Override; override opens a panel with new mark and a **required** reason; live total updates 7/10 to 8/10), learning gaps and red flags (Confirm / Dismiss per gap, recurring-errors card, red flag card with Confirm flag / Dismiss, schedule support session with slots and "notify Ali" checkbox), and feedback and release (editable AI-suggested feedback with the "Suggested by AI, edited by teacher" tag, practice checklist, optional personal comment, "Ready to release?" checklist that only enables the Release button when every item is done). Release sets state to `released` and fires all side effects listed in the instructions (notification, parent alert, gradebook, weakness tracker, toast "Grades saved to the gradebook").

### Phase 5: student results, help, practice, progress, notifications (S6 to S10), HTA 4
> Attached: S6 to S10. Build them using the released data. S6 shows grade, per-question marks, teacher feedback, weakness card with "I need help" and "Practise this"; for Leila show the younger-student version (stars, picture, one short sentence, Listen button using speechSynthesis, effort jar). S7 help modal (topic prefilled, optional message, +3 points once per topic per week, appears in teacher notifications). S8 practice cards with Start; finishing one gives +5 and the "+5 points! Activity finished" toast. S9 progress: results chart (inline SVG/CSS bars), topic chips, badges and streak ("Only you and your teacher see this"), effort points with "beat your own record" message, and class goal bar ("Everyone's effort counts. No one is ranked."). S10 notifications list that reflects real events from the state. Never show any ranking or classmate comparison.

### Phase 6: remaining teacher screens (T7 to T9)
> Attached: T7, T8, T9. Build the class OCR report (stat strip, bar chart of OCR problems per question, hardest handwriting list, answer types that cause problems), roster and gradebook with two tabs, contact buttons and an **Export to Excel** button that downloads a real CSV, and the student profile (weakness tracker grid, flag history with "Mark follow-up done" and "Check next exam", handwriting profile card, results-over-time chart). Also build the "Edit goal / Change reward" modal for the class goal.

### Phase 7: parent view (P1 to P2), HTA 6 (bonus)
> Attached: P1, P2. Build the phone-first parent view with a child switcher (Ali, Leila), latest result (only after release, "Confirmed by Ms. Mariam"), topic to work on with practice ideas, progress this term, red flag and support-session alerts, bottom tab bar, and an Alerts screen with a "Contact Ms. Mariam" button.

### Phase 8: polish and QA
> Review the whole app against the Milestone 2 report: (1) run the complete demo path (student uploads, teacher verifies with one clarification round, teacher grades with one override, confirms a red flag and books support, releases, student views results, asks for help, practises, parent sees summary) and fix any break; (2) make sure no student or parent view ever shows an unreleased grade; (3) check responsiveness at 360, 768, 1024 and 1440 px; (4) check keyboard navigation, focus states, contrast and alt/aria labels; (5) fix console errors; (6) make sure "Reset demo" restores the starting state; (7) add subtle transitions only where they help (toasts, modals). List anything you could not fix.

### Phase 9: README and deployment
> Write `README.md`: project summary, the three views, how to run locally (Live Server), how to deploy on GitHub Pages (Settings, Pages, branch main, root), the demo script (the exact click path for the full workflow with demo role switches), the feature ID to screen table, the mock-data note (no real AI or OCR), team members and the AI-use note. Add a screenshot folder reference.

---

# PART 3: Milestone 3 checklist beyond the code

| Deliverable (from the brief) | What to do |
|---|---|
| Interactive prototype covering the full workflow in both views, upload through personalized feedback | The coded app, with the demo path in Phase 8 working end to end |
| Coded front-end: repository link and short deployment instructions | Public GitHub repo, README from Phase 9, deployed GitHub Pages link. Test in an incognito window |
| Video walkthrough, 2 to 4 minutes | Record the demo path with the role switcher: student upload, teacher CGV (spend the most time here), grading and release, student results, then 10 seconds on the parent view. Say clearly how CGV addresses the gap |
| HTD (hierarchical task design) for the **same primary tasks** as the M2 HTAs | Same task goals as HTA 1 to 6, but now steps name real interface elements (buttons, screens, T/S/P codes). Draw in FigJam or draw.io |
| AI chat history | Export the Copilot chats and the Claude and ChatGPT conversations, submit all |
| Cover page | Team name, IDs, tutorials, emails |

**One thing to confirm with your TA:** the brief lists "high-fidelity Figma or any interactive prototyping tool" as the prototype, and a coded front-end as the bonus. Ask whether a coded front-end alone is accepted as the main prototype. If not, also build a quick clickable Figma version of the same screens.
