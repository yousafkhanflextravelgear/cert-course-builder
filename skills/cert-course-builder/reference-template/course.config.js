/* Course configuration — the ONLY file (besides content) you edit to turn this template into a new course.
   Everything here is read by app.js. Title, brand, meta and disclaimer are inserted as plain text; `blueprintLabel` and
   `exam.scaleNote` are inserted as HTML, so only put text you wrote yourself in them. */
window.COURSE_CONFIG = {
  /* Browser tab title and the brand shown in the top bar. */
  title: 'Practical Incident Management — Demo Course',
  brand: { mark: 'PIM', name: 'Demo' },

  /* Shown next to the brand: name the blueprint/body-of-knowledge version and its effective date. */
  meta: 'Fictional demo exam · Blueprint v1.0 (illustrative)',
  /* Used in the blueprint chart caption. */
  blueprintLabel: 'illustrative blueprint v1.0',

  /* localStorage key. MUST be unique per course — several courses can share one origin (e.g. GitHub Pages).
     Never reuse a key from another course, and never put a real certification name in a public repo's key. */
  storageKey: 'ccb-demo-pim-v1',

  /* Window name for the "pop-out player" so repeat clicks reuse one window. */
  videoWindowName: 'ccbDemoVideo',

  /* Exam settings. `scored` is the total number of scored questions the blueprint ranges are expressed against. */
  exam: {
    scored: 24,
    full: { n: 24, minutes: 30 },
    half: { n: 12, minutes: 15 },
    /* Shown on the results screen. Say honestly how (or whether) the mock maps to the real scoring scale. */
    scaleNote: 'This is a fictional exam, so there is no official scoring scale. As a study habit, aim to clear about 75% on a mock before treating a topic as secure.'
  },

  /* Shown at the bottom of the course map. Required for any course built from a real certification:
     say it is independent, name the trademark owner, and do not imply endorsement. */
  disclaimer: 'Independent study aid. Not affiliated with, endorsed by, or sponsored by any certifying body. All questions and explanations are original. Product and certification names belong to their owners.'
};
