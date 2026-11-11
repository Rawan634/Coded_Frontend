# LearnLoop – coded front-end (CSEN 909, Milestone 3 bonus)

LearnLoop is a web app for AI-assisted exam assessment for children in Grades 1–5. Students upload photos of their paper exams. OCR reads the answers, and AI suggests grades, learning gaps and red flags. The teacher checks and confirms everything before students or parents see it.

Our unique feature is **Confidence-Guided Verification (CGV)**. It shows the teacher only the answers that OCR is unsure about, grouped as *needs a decision*, *needs a glance* and *auto-accepted*. It also saves each correction to the student's handwriting profile and shows how much time was saved.

This folder is a working front-end of the Figma prototype. It uses the same screens, labels, colours and demo data.

- Plain HTML, CSS and JavaScript (ES modules). There is no framework, no build step and no back-end.
- **All "AI" output is sample data:** OCR text, confidence scores, grades, gaps and feedback. The brief allows this.
- The demo state is stored in your browser's `localStorage`, so an action in one view shows up in the others. For example, when the teacher releases results, they appear on the student's home screen.

## Run it locally

ES modules do not load from `file://`, so serve the folder with any static server.

**Python (already on most computers)**

```bash
cd path/to/this/folder
python -m http.server 8000
```

Then open <http://localhost:8000> in Chrome, Edge or Firefox.

**Or Node**

```bash
npx serve .
```

**Or VS Code:** right-click `index.html` and choose **Open with Live Server**.

## Demo path (about 3 minutes)

1. **Start screen.** Pick **Student**. The role menu in the top bar switches views at any time, and **Reset demo** starts over.
2. **Student uploads.** Upload exam → Maths → *Maths Quiz 3 – 12 Oct* → Next: take photos. Page 2 is blurry, so tap **Retake page 2** → Next: check and send → **Send to Ms. Mariam**. To see the error state, use *Demo: try sending with no internet*.
3. **Teacher verifies with CGV.** Switch to **Teacher** → Dashboard → **Start verifying** → Verify (Ali).
   - Q4: **Ask student to clarify**.
   - Q7: **Correct** (saved to the handwriting profile), or **Consult colleague**.
   - Q8 ("Hälfte", German) and Q9: **Accept**.
   - Move the **threshold slider** to watch the groups and the trust score change.
   - The **?** icon explains the three groups.
4. **Student answers.** Switch to **Student – Ali** → **Answer** → pick "3/8" → **Send answer** (+5 points).
5. **Teacher grades and releases.**
   - Back in the teacher view, open Q4 and **Accept** → **Confirm verified text**. The "AI is grading…" screen moves on by itself.
   - Confirm every mark. Use **Override** on Q9 to give 1/1 with a reason (7/10 becomes 8/10) → **Next: learning gaps**.
   - **Confirm** the gap, **Confirm flag**, pick **Mon 5:00 pm** → **Book session** → **Next: feedback**.
   - **Release results** → confirm.
6. **Student results.** Switch to **Student – Ali** → See results → **I need help** or **Practise this** → finish the activity (+5 points) → **My progress**.
7. **Parent (bonus).** Switch to **Parent** → summary, alerts, practice ideas, contact the teacher.
8. **Leila (Grade 2).** On the start screen, choose *Demo: Leila's results* to see the younger-student view, with stars and a Listen button.

To show the feature IDs (F1–F36) on each screen, add `?annotate=1` to the URL, for example `http://localhost:8000/?annotate=1`.

## Deploy

- **GitHub Pages:** push this folder to a public repository. Go to **Settings → Pages → Deploy from a branch**, choose `main` and `/ (root)`, then save. The site appears at `https://<user>.github.io/<repo>/`.
- **Vercel:** import the repository as a static site. No build command is needed and the output directory is the root.

## Project structure

```
index.html          entry page
css/tokens.css      colour, type and spacing tokens ("Ink and sunflower", same as Figma)
css/*.css           base, components, shell, teacher, student and parent styles
js/data.js          frozen demo data (same names and numbers as the prototype and report)
js/state.js         demo state, saved in localStorage
js/router.js        hash router (#/teacher/cgv, #/student/home, …)
js/components.js    small HTML builders, one per Figma component
js/icons.js         Lucide icons (ISC licence)
js/teacher.js       teacher screens (dashboard, verify, CGV, grading, gaps, release, reports, roster, profile, help inbox)
js/student.js       student screens (home, upload, clarification, results, help, practice, progress, notifications)
js/parent.js        parent screens (summary, alerts, practice ideas, contact teacher)
assets/scans/       stand-in handwriting images (drawn, not real student work)
```

## Credits

Team LearnLoop, CSEN 909 Human-Computer Interaction, GUC, Winter 2026: Rawan Osama, Nouran Ahmed, Rawan Shahin and Omar El Ghazouly.

AI assistance (Claude) was used to write and update this code from the team's Figma prototype and specifications. See the AI-use statement in the Milestone 3 report.
