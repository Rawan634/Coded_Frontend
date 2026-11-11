# LearnLoop project instructions

LearnLoop is a front-end prototype for a course project (CSEN 909 HCI, GUC). It is an AI-assisted exam assessment web app for children in Grades 1 to 5, with a Student view, a Teacher view and an optional Parent view. The teacher always verifies and confirms before anything reaches the student (human in the loop). There is no backend and no real AI or OCR: all AI output is hard-coded mock data.

## Technology and structure

- Use plain HTML, CSS and vanilla JavaScript only. No frameworks, build step or npm dependencies.
- Run with VS Code Live Server and deploy as-is on GitHub Pages with relative paths.
- Use hash routing and the folder layout described in `LearnLoop_M3_Copilot_Kit.md`.
- Shared data belongs in `js/data.js`; state belongs in `js/state.js` and persists in `localStorage`.
- Keep the role switcher and Reset demo control available in the top bar.
- Use semantic HTML, labels, visible focus states, sufficient contrast and keyboard-operable controls.

## Design and behavior

- Light theme only with white cards on a very light grey background.
- Use CSS variables in `css/tokens.css`.
- Use Inter with a system-ui fallback.
- Teacher is desktop-first, Student tablet-first and Parent phone-first.
- Keep the app responsive from 360px to 1440px.
- Feature annotations are visible only when `?annotate=1` is in the URL.
- Preserve the screens, wording, flow, feature IDs and mock data from the project kit.

## Quality

Use small readable functions and reusable components. Do not invent backend behavior, real AI, OCR or unsupported screens.
