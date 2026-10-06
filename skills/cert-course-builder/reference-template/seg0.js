/* Segment 0 — Orientation. DEMO CONTENT: invented for this repository; not derived from any real exam or body of knowledge. */
COURSE.segments.push({
  id: 's0', code: 'OR', label: 'Orientation', title: 'Orientation & how to use this course', hue: 'd0', q: 'Start here · ~10 min',
  modules: [
  { code: 'O.1', title: 'Welcome & course map', slides: [
    { title: 'A demo course that shows every slide type', kicker: 'Welcome',
      html: `<p class="lede">This is a fictional exam-prep course about incident management. Its content is invented for this repository so you can see how the engine behaves — the structure, the callouts, the quizzes, the narration transcript, and a timed mock exam.</p>
      ${H.tbl(['Segment', 'What it covers', 'Scored questions'], [
        ['Orientation', 'How the course works and how to read a question', '—'],
        ['Domain I', 'Detect and triage: classify, prioritise, assign ownership', '<span class="num">7–9</span>'],
        ['Domain II', 'Respond and communicate: contain, restore, keep stakeholders informed', '<span class="num">8–10</span>'],
        ['Domain III', 'Learn and improve: blameless reviews and corrective actions', '<span class="num">6–8</span>'],
        ['Final review', 'Flashcards and a 24-question timed mock exam', '—']])}
      ${H.tip('Every module in the course map carries its blueprint code (I.A, II.B …) and its share of the scored questions, so you always know how much a topic is worth.')}`,
      narr: `Welcome to the demo course. This is a fictional exam-prep course about incident management, and its content was invented so you can see how the course engine behaves. You will meet every kind of slide the engine supports, including callouts, charts, case studies, quizzes, flashcards, an external video and a timed mock exam. The course follows an illustrative blueprint with three domains. Detect and triage, respond and communicate, and learn and improve. Every module carries its blueprint code and its share of the scored questions, so you always know how much a topic is worth.` },

    { type: 'blueprint', title: 'Where the 24 scored questions come from', kicker: 'Illustrative blueprint v1.0',
      before: `<p>Each bar shows the range of scored questions a competency may contribute. Heavier bars deserve more of your study time.</p>`,
      after: `${H.key('Study time should follow question weight, not personal comfort. Spend the most hours on the widest bars you can not yet explain out loud.', 'Study rule')}`,
      narr: `Here is the illustrative blueprint. Each bar shows the range of scored questions a competency may contribute to the exam. Contain and restore is the heaviest, with four to six questions. The review competencies are lighter, but they are the easiest marks to win because the ideas are compact. Study time should follow question weight, not personal comfort. Spend your hours on the wide bars you cannot yet explain out loud.` },

    { title: 'Four callouts you will see everywhere', kicker: 'How to read a slide',
      html: `<p class="lede">Slides use four visually distinct callouts. Learn to recognise them and you can skim a module quickly.</p>
      ${H.tip('Practical exam or field guidance — what to do with this idea when you meet it in a question or at work.', 'Tip')}
      ${H.upd('A recent change in practice, a standard, or a regulation that is worth knowing about. Check the date before relying on it.', 'Update')}
      ${H.trap('A common misconception or distractor pattern. If an option feels attractive because it is fast or simple, check it against the trap.', 'Trap')}
      ${H.key('The single idea to carry out of the slide even if you forget the rest.', 'Key point')}`,
      narr: `Slides use four callouts. A tip is practical guidance for the exam or the job. An update flags a recent change worth knowing about. A trap warns you about a common misconception or a distractor pattern. And a key point is the single idea to carry out of the slide. Learn to recognise them and you can skim a module quickly, then slow down on the traps.` },

    { type: 'check', code: 'Exam technique', title: 'Try the method',
      q: 'A question asks for the BEST first action. Two options are both reasonable steps. What is the most reliable way to choose?',
      opts: [
        'Pick the option that restores customer service soonest while keeping risk contained',
        'Pick the option that would take the most engineering effort to carry out properly',
        'Pick the option that would be easiest to describe in the final written review',
        'Pick the option that involves notifying the largest number of senior stakeholders'],
      a: 0,
      why: 'When two steps are reasonable, ask which one most reduces harm soonest at acceptable risk. Effort, ease of documentation, and breadth of notification are not what makes an action first.',
      narr: `Try the method on a short question. When two options are both reasonable steps, the most reliable way to choose is to ask which one reduces harm soonest at an acceptable risk. Effort, ease of documentation and the number of people notified are not what makes an action come first.` }
  ]}
]});
