/* Segment 3 — Domain III: Learn and improve. DEMO CONTENT: invented for this repository. */
COURSE.segments.push({
  id: 's3', code: 'III', label: 'Domain III', title: 'Learn and improve', hue: 'd3', q: '6–8 scored questions',
  modules: [
  { code: 'III.A', title: 'Run blameless reviews that find contributing factors', slides: [
    { type: 'opener', eyebrow: 'Domain III · Learn and improve', title: 'Turn one bad day into a better system',
      lede: 'A review is only worth the meeting time if something changes afterwards. Domain III is about how to look, and how to make the changes stick.',
      narr: `Domain III is learn and improve. A review is only worth the meeting time if something changes afterwards. This domain covers how to run a review that finds real contributing factors, and how to make the resulting changes stick.` },

    { title: 'Blameless is not consequence-free', kicker: 'III.A · Review culture',
      html: `<p class="lede">A blameless review asks <i>how did the system and the situation make this decision seem reasonable at the time?</i> It does not ask who to punish.</p>
      ${H.cols(
        `${H.panel('Asks', 'What did people know? What did the tools show? What pressures were present? What made the safe path hard?', 'search')}`,
        `${H.panel('Avoids', 'Naming one person as the cause, hindsight judgements like “should have known”, and stopping at the first mechanical fault.', 'ban')}`)}
      ${H.trap('“Blameless” does not mean nobody is accountable. Accountability moves from punishing a person to owning and completing the improvements.')}
      ${H.tip('If an option blames a person, or declares the matter closed once the technical fault is found, it is usually the distractor. Look for the option that asks why the system allowed it.')}`,
      narr: `A blameless review asks how the system and the situation made a decision seem reasonable at the time. It does not ask who to punish. So it asks what people knew, what the tools showed, what pressures were present and what made the safe path hard. It avoids naming one person as the cause and stopping at the first mechanical fault. Blameless does not mean nobody is accountable. Accountability moves from punishing a person to owning and completing the improvements. If an option blames a person, or closes the matter once the technical fault is found, it is usually the distractor.` },

    { type: 'video', title: 'Watch: postmortem culture, a practitioner’s view', id: 'qgHWzQ2zcqQ',
      vtitle: 'Postmortem Culture at Google | Ramon Medrano Llamas | Conf42 SRE 2022', channel: 'Conf42',
      why: 'This talk is on the subject of this module — how organisations learn from failure — and offers a practitioner’s perspective from outside this course. It has not been reviewed for accuracy by this repository: treat it as a supplement, and check anything surprising against the module.',
      watch: ['How the speaker frames the purpose of a review: learning, or assigning fault?', 'Which practices make people willing to describe what really happened.', 'How improvements are followed up after the meeting ends.'],
      narr: `Here is an external video on postmortem culture, given by a practitioner. It opens in its own window, because this viewer does not embed players. Watch for how the speaker frames the purpose of a review, which practices make people willing to describe what really happened, and how improvements are followed up after the meeting ends. The video has not been reviewed for accuracy by this course, so treat it as a supplement and check anything surprising against the module.` },

    { type: 'case', code: 'III.A', title: 'The typo that took down checkout',
      scenario: `<p>An outage lasted 47 minutes. The immediate cause was a one-character typo in a configuration file. The change was reviewed by one colleague, passed automated tests, and was deployed on a Friday afternoon.</p><p>A manager proposes: “Write it up as human error and have a word with the engineer.”</p>`,
      prompts: [
        { q: 'What is wrong with “human error” as the conclusion?', a: `<p>It stops at the first mechanical fault and points at a person. Everyone makes typos; the useful question is why the system let one reach production.</p>` },
        { q: 'List three contributing factors the review should investigate.', a: `<ul><li>No validation of configuration before deployment.</li><li>A review that could not realistically catch a one-character change.</li><li>Deployment timing and the lack of a quick, rehearsed rollback.</li></ul>` },
        { q: 'What would a good outcome of the review look like?', a: `<p>A short list of owned, dated improvements — for example, an automated configuration check — and a plan to confirm they work. The engineer is thanked for describing what happened, not warned.</p>` }],
      narr: `An outage lasted forty seven minutes. The immediate cause was a one character typo in a configuration file. The change was reviewed by one colleague, passed automated tests, and was deployed on a Friday afternoon. A manager proposes writing it up as human error and having a word with the engineer. Decide what is wrong with that conclusion, which contributing factors you would investigate, and what a good outcome looks like. Then open each model answer.` },

    { type: 'quiz', id: 'q-IIIA', kicker: 'Module quiz', title: 'III.A — Blameless reviews',
      intro: 'Two questions on how a review should ask.',
      items: [
        { code: 'III.A', q: 'Which statement best describes a blameless review?', opts: [
          'It avoids naming any person or team so that nobody feels uncomfortable',
          'It names the individual whose mistake caused the incident and records a warning',
          'It examines why decisions made sense at the time, so the system can improve',
          'It concentrates on the technical fault and leaves process and people out of scope'], a: 2,
          why: 'The aim is to understand how conditions and decisions combined, then improve the system. Avoiding names is not the point, assigning a culprit defeats the point, and excluding process and people leaves most contributing factors unexamined.' },
        { code: 'III.A', q: 'Why do many reviewers treat the “five whys” technique with caution for complex incidents?', opts: [
          'It needs specialist software that most teams do not have available',
          'It tends to follow one causal chain and can stop at a convenient root cause',
          'It always produces more than five causes, which makes the output unusable',
          'It forbids questions about human factors, which are central to most failures'], a: 1,
          why: 'Complex failures usually have several interacting factors; a single chain of whys can end at whichever cause is easiest to accept. The technique needs no software, does not forbid human-factor questions, and does not always yield more than five causes.' }]}
  ]},

  { code: 'III.B', title: 'Track corrective actions until they are verified', slides: [
    { title: 'Actions that actually get done', kicker: 'III.B · Corrective actions',
      html: `<p class="lede">The most common failure of a review is a list of good intentions that nobody finishes. Write actions so that finishing them is likely and checkable.</p>
      ${H.tbl(['Weak action', 'Stronger action', 'Why it is stronger'], [
        ['“Be more careful with config changes”', 'Add a pre-deploy check that rejects invalid configuration', 'Changes the system, not the people'],
        ['“Review the process soon”', 'Platform team to propose a rollback drill by 14 March', 'Named owner and a date'],
        ['“Improve monitoring”', 'Alert when checkout error rate exceeds 2% for five minutes', 'Specific and testable']])}
      ${H.timeline({ title: 'Lifecycle of one action, illustrative', sub: 'Dates are invented. The point: the action is not done when the code merges, but when production behaviour is verified.', from: '2026-03-01', to: '2026-04-15', today: '2026-03-20',
        events: [['2026-03-03', 'Incident', '47-minute outage'], ['2026-03-05', 'Review held', 'Contributing factors agreed'], ['2026-03-10', 'Actions assigned', 'Owner and due date for each', true], ['2026-03-14', 'Code merged', 'Not yet “done”'], ['2026-04-07', 'Verified in production', 'A test exercises the failure', true]] })}
      ${H.trap('Marking an action done when the code merges, or when the owner says so in a meeting, leaves the risk unverified. Done means confirmed to work.')}`,
      narr: `The most common failure of a review is a list of good intentions that nobody finishes. Write actions so that finishing them is likely and checkable. Compare weak and strong actions. Be more careful with config changes becomes add a pre deploy check that rejects invalid configuration. Review the process soon becomes a named team proposing a rollback drill by a date. Improve monitoring becomes an alert on a specific error rate. The timeline, with invented dates, shows the point. The action is not done when the code merges. It is done when production behaviour is verified.` },

    { title: 'Follow-through is a workflow, not a document', kicker: 'III.B · Tracking',
      html: `${H.tiles([
        ['list', 'Real work queue', 'Actions live where engineers already plan work, not only in the review document.'],
        ['users', 'One owner each', 'A single accountable person or team, never “everyone”.'],
        ['clock', 'Due dates', 'Dates make slippage visible and discussable.'],
        ['search', 'Overdue review', 'A regular, brief look at what has stalled and why.']])}
      ${H.tip('When the question asks how to improve follow-through, look for the option that puts actions in the normal work queue with owners, dates, and a periodic review of overdue items.')}
      ${H.key('Commit to fewer actions you will complete over many you will not. State what you decided not to do, and why.')}`,
      narr: `Follow through is a workflow, not a document. Put actions in the real work queue where engineers already plan their work. Give each action one owner and a due date. Hold a short regular review of what is overdue and why. When a question asks how to improve follow through, look for the option that does these things. And remember that it is better to commit to fewer actions you will complete than many you will not. State what you decided not to do, and why.` },

    { type: 'quiz', id: 'q-IIIB', kicker: 'Module quiz', title: 'III.B — Corrective actions',
      intro: 'Two questions on action quality and completion.',
      items: [
        { code: 'III.B', q: 'Which corrective action is MOST likely to be completed and to be effective?', opts: [
          'Remind engineers to take more care when editing configuration files in future',
          'Review the configuration process soon, with the platform and release teams as joint owners',
          'Improve monitoring and documentation across all services, tracked as an ongoing initiative',
          'Add a pre-deploy check that rejects invalid configuration, one owner, due in two weeks'], a: 3,
          why: 'It changes the system, has a single owner and a date, and is specific enough to verify. Reminders rely on memory, joint ownership diffuses responsibility, and open-ended initiatives never finish.' },
        { code: 'III.B', q: 'A team marks a corrective action “done” when its code merges. What is the stronger completion standard?', opts: [
          'Confirm it works in production, for example with a test that exercises the failure',
          'Accept the merge, since peer-reviewed code shows that the work has been carried out',
          'Close it when the owner reports in the next team meeting that it is finished',
          'Close it once the review document links to the merged pull request'], a: 0,
          why: 'The purpose of an action is to reduce a risk, so completion means evidence that the risk is reduced. A merge, a verbal report, and a link each show only that something was done, not that it works.' }]}
  ]}
]});
