/* Segment 2 — Domain II: Respond and communicate. DEMO CONTENT: invented for this repository. */
COURSE.segments.push({
  id: 's2', code: 'II', label: 'Domain II', title: 'Respond and communicate', hue: 'd2', q: '8–10 scored questions',
  modules: [
  { code: 'II.A', title: 'Contain the problem and restore service', slides: [
    { type: 'opener', eyebrow: 'Domain II · Respond and communicate', title: 'Stop the harm first, then work out why it happened',
      lede: 'Containment and restoration is the heaviest competency in the blueprint. The exam rewards the option that reduces customer harm soonest at acceptable risk.',
      narr: `Domain II is respond and communicate. Containment and restoration is the heaviest competency in this blueprint. The exam rewards the option that reduces customer harm soonest at acceptable risk. First we look at how to contain and restore, then at how to keep stakeholders informed while you do.` },

    { title: 'Restore first, understand second', kicker: 'II.A · Mitigation',
      html: `<p class="lede">Mitigation makes the harm stop. Root-cause analysis explains why it started. During the incident, the first job always outranks the second.</p>
      ${H.tbl(['Mitigation option', 'Fits when…', 'Watch out for'], [
        ['Roll back', 'A recent release correlates with the failure and the old version is known good', 'Data or schema changes that cannot simply be reversed'],
        ['Switch a feature off', 'The fault is isolated to one feature behind a flag', 'Users who depend on the feature; clear messaging'],
        ['Shift traffic away', 'One region or instance group is failing and others are healthy', 'Overloading the healthy capacity you shift to'],
        ['Add capacity', 'The cause is demand, not a defect', 'Masking a defect that returns at the next peak']])}
      ${H.trap('Keeping a faulty release live “to preserve the evidence” is rarely right. Capture logs, metrics and snapshots as you mitigate, then restore service.')}
      ${H.tip('Among reasonable options, prefer the one that is fast, reversible and low risk. A rollback usually beats a hurried patch written under pressure.')}`,
      narr: `Mitigation makes the harm stop. Root cause analysis explains why it started. During the incident the first job always outranks the second. Look at four common mitigation options. Roll back when a recent release correlates with the failure. Switch a feature off when the fault is isolated behind a flag. Shift traffic away when one region is failing and others are healthy. Add capacity when the cause is demand and not a defect. The trap is keeping a faulty release live to preserve evidence. Capture logs and metrics as you mitigate, then restore service. Among reasonable options, prefer the one that is fast, reversible and low risk.` },

    { title: 'Why “mitigate first” pays off', kicker: 'II.A · Evidence',
      html: `${H.lines({ title: 'Median minutes to restore service, by team habit', sub: 'Illustrative data for eight weeks: teams that mitigate before diagnosing recover faster and more predictably.', illus: true,
        x: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'], unit: '', yMin: 0, yMax: 120, yStep: 20, xName: 'Week',
        series: [{ name: 'Mitigate first', v: [70, 64, 60, 52, 47, 42, 40, 36] }, { name: 'Debug first', v: [96, 101, 92, 97, 90, 94, 99, 93], dash: true }] })}
      ${H.key('Time to restore is the number customers feel. Time to understand is the number the review needs. Optimise them in that order.')}`,
      narr: `Why does mitigate first pay off. The chart shows illustrative data over eight weeks. Teams that mitigate before they diagnose recover faster, and their results get more predictable. Teams that debug first stay high and noisy. Time to restore is the number customers feel. Time to understand is the number the review needs. Optimise them in that order.` },

    { type: 'case', code: 'II.A', title: 'The faulty release at 14:05',
      scenario: `<p>A release went out at 13:50. At 14:05, error rates on the order service jump from 0.1% to 9%. The previous version is known good, and the release contained no database migration.</p><p>A senior engineer suggests leaving the release live while the team traces the bug, to “see it happening”.</p>`,
      prompts: [
        { q: 'What do you do, and in what order?', a: `<ul><li>Roll back to the previous version now: it is fast, reversible and low risk.</li><li>Capture logs, metrics and a snapshot of the failing state before and during the rollback.</li><li>Verify recovery with a real order, not only a dashboard.</li></ul>` },
        { q: 'How do you answer the “see it happening” argument?', a: `<p>Evidence can be preserved while mitigating. Customers are being harmed each minute the release stays live; investigation can continue against the captured data and a reproduction in staging.</p>` },
        { q: 'When is rolling back the wrong choice?', a: `<p>When the release included a data or schema change that cannot be reversed safely. Then a roll-forward fix, a feature flag, or traffic shifting may be the lower-risk option.</p>` }],
      narr: `A release went out at one fifty. At five past two, error rates on the order service jump from point one percent to nine percent. The previous version is known good, and the release contained no database migration. A senior engineer suggests leaving the release live while the team traces the bug, to see it happening. Decide what you do and in what order, then open each model answer.` },

    { type: 'check', code: 'II.A', title: 'Check: is it really recovered?',
      q: 'After a restart the dashboard turns green. Which check BEST confirms that the service is truly restored for customers?',
      opts: [
        'Accept the green dashboard, because it reflects the system’s own health reporting',
        'Wait one minute and close the incident if no new alerts have been raised',
        'Ask the engineer who restarted it whether the service feels normal again',
        'Run a real customer transaction and watch the key metrics hold steady'],
      a: 3,
      why: 'Verify what customers experience: a real transaction, plus metrics that stay steady over time. A green dashboard can lag or measure the wrong thing, silence is not evidence, and a feeling is not a measurement.',
      narr: `After a restart the dashboard turns green. Which check best confirms that the service is truly restored for customers. Choose one, then read the explanation.` },

    { type: 'quiz', id: 'q-IIA', kicker: 'Module quiz', title: 'II.A — Contain and restore',
      intro: 'Two questions on mitigation and emergency change.',
      items: [
        { code: 'II.A', q: 'Traffic to one region is failing while two other regions are healthy. Which mitigation is LEAST disruptive to customers?', opts: [
          'Shift traffic away from the failing region to the healthy ones for now',
          'Restart every service globally to clear any hidden shared state',
          'Disable the entire feature for all regions until the cause is found',
          'Add capacity inside the failing region and wait for errors to ease'], a: 0,
          why: 'Moving traffic to healthy regions removes the harm without touching what is working. A global restart and a global shutdown disrupt everyone, and adding capacity to a failing region does not address why it is failing.' },
        { code: 'II.A', q: 'During a major incident an engineer wants to apply an untested fix directly to production. What is the BEST response?', opts: [
          'Refuse all changes until the normal approval board can meet next week',
          'Allow an emergency change with a named approver, a rollback plan, and the lead told',
          'Permit it silently, because speed matters more than any record of the change',
          'Require the fix to pass the full release pipeline and every normal test before anyone touches production'], a: 1,
          why: 'Emergency change keeps speed and adds just enough control: an approver, a way back, and visibility. A week-long wait or the full pipeline defeats the purpose, and a silent change makes the later review blind.' }]}
  ]},

  { code: 'II.B', title: 'Communicate with stakeholders while the incident runs', slides: [
    { title: 'Updates on a clock, in plain language', kicker: 'II.B · Cadence and audience',
      html: `<p class="lede">Silence is read as “nobody is in control”. Agree a cadence at the start and keep to it, even when the update is “no change”.</p>
      ${H.cols(
        `${H.panel('Engineers', 'Technical detail: hypotheses, evidence, what is being tried next. Lives in the incident channel.', 'wrench')}${H.panel('Executives', 'Business impact, customer exposure, decisions needed from them, and the time of the next update.', 'briefcase')}`,
        `${H.panel('Customers', 'Plain-language impact, a workaround if there is one, and when they will hear more. No internal jargon.', 'users')}<div class="mock"><div class="mock-bar"><i></i><i></i><i></i><span>Status page — example update</span></div><div class="mock-body"><p><b>Investigating</b> · Some customers see errors at checkout.</p><p>Retrying the payment works. We are applying a fix and will post again by 15:30.</p></div></div>`)}
      ${H.tip('An update that states a time for the next update is almost always a better answer than one that only describes progress.')}`,
      narr: `Silence is read as nobody being in control. Agree an update cadence at the start and keep to it, even when the update is no change. Different audiences need different content. Engineers get technical detail in the incident channel. Executives get business impact, customer exposure, decisions needed from them and the time of the next update. Customers get plain language impact, a workaround if there is one, and when they will hear more. An update that states a time for the next update is almost always a better answer than one that only describes progress.` },

    { title: 'Say what you know, what you do not, and when you will update', kicker: 'II.B · Honest uncertainty',
      html: `${H.ol([
        '<b>What we know:</b> observable facts only — what is affected and since when.',
        '<b>What we do not know yet:</b> say so plainly, including the cause if it is unknown.',
        '<b>What we are doing:</b> the current action, without promising an outcome.',
        '<b>When you will hear next:</b> a clock time, not “soon”.'])}
      ${H.trap('Presenting the leading theory as the confirmed cause “to show progress” backfires when it changes. Label theories as theories.')}
      ${H.upd('Many organisations publish a short closing message when service is restored, with a pointer to when the review will be shared. It completes the communication loop and lowers repeat enquiries.', 'Practice update')}`,
      narr: `Use four lines in every update. What we know, as observable facts only. What we do not know yet, including the cause if it is unknown. What we are doing, without promising an outcome. And when you will hear next, as a clock time and not soon. The trap is presenting the leading theory as the confirmed cause to show progress. It backfires when the theory changes. Many organisations also publish a short closing message when service is restored, with a pointer to when the review will be shared.` },

    { type: 'quiz', id: 'q-IIB', kicker: 'Module quiz', title: 'II.B — Stakeholder communication',
      intro: 'Two questions on cadence and honesty.',
      items: [
        { code: 'II.B', q: 'Executives ask for constant updates during a long incident. Which approach BEST serves everyone?', opts: [
          'Reply to each executive individually the moment engineers learn something',
          'Pause updates until the cause is known so nothing shared later changes',
          'Agree a cadence, publish on schedule, and state when the next update will land',
          'Let engineers post raw investigation notes in a shared channel for anyone to follow'], a: 2,
          why: 'A published cadence meets the need to know without pulling engineers off the work. Ad-hoc replies fragment effort, pausing updates creates a vacuum, and raw notes are unreadable to a business audience.' },
        { code: 'II.B', q: 'The cause is unknown and there is no recovery estimate. What should the next update say?', opts: [
          'Offer an optimistic estimate to keep stakeholders calm until facts improve',
          'Skip it, because nothing new has been learned since the previous update',
          'Describe the leading theory as the confirmed cause to show progress',
          'State what is known, what is not, and when the next update will be sent'], a: 3,
          why: 'Honest uncertainty with a committed next update keeps trust. An invented estimate or a theory presented as fact will have to be retracted, and skipping an update is read as loss of control.' }]}
  ]}
]});
