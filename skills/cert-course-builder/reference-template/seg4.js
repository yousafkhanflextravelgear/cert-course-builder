/* Segment 4 — Final review. DEMO CONTENT: invented for this repository. */
COURSE.segments.push({
  id: 's4', code: 'FR', label: 'Final review', title: 'Final review & mock exam', hue: 'd0', q: 'Flashcards · 30-minute mock',
  modules: [
  { code: 'F.1', title: 'Cram sheet & flashcards', slides: [
    { title: 'One page to re-read before the exam', kicker: 'Cram sheet',
      html: `${H.tbl(['Domain', 'Rule of thumb the exam rewards'], [
        ['I · Detect and triage', 'Priority = impact × urgency, re-assessed as facts change. One lead, named roles, a live handoff with written notes.'],
        ['II · Respond and communicate', 'Restore first, understand second: fast, reversible, low-risk mitigation. Emergency change keeps an approver and a way back. Verify with a real transaction. Update on a clock; say what you know, what you do not, and when next.'],
        ['III · Learn and improve', 'Blameless means asking why the system allowed it, not who to blame. Actions are specific, owned, dated, and done only when verified in production.']])}
      ${H.tip('If two options both look reasonable, choose the one that reduces harm soonest at acceptable risk, keeps people informed on a schedule, and changes the system rather than relying on people to remember.')}`,
      narr: `Here is the one page to re read before the exam. Domain one. Priority is impact and urgency, reassessed as facts change, with one lead, named roles, and a live handoff backed by written notes. Domain two. Restore first and understand second, using fast, reversible, low risk mitigation. Keep an approver and a way back for emergency changes, verify with a real transaction, and update on a clock. Domain three. Blameless means asking why the system allowed it. Actions are specific, owned and dated, and done only when verified in production. If two options both look reasonable, choose the one that reduces harm soonest at acceptable risk and changes the system rather than relying on people to remember.` },

    { type: 'flash', title: 'Twelve flashcards across all three domains', kicker: 'Flashcards',
      cards: [
        ['How is priority derived?', 'From impact (how many, how badly) combined with urgency (how fast it worsens).'],
        ['Why check for a duplicate incident during triage?', 'It prevents parallel investigations and keeps customer messages consistent.'],
        ['Who should be the incident lead?', 'Whoever is best placed to coordinate: not necessarily the most senior or the most technical person.'],
        ['What makes a handoff reliable?', 'A live conversation plus written notes on state, hypotheses and next steps.'],
        ['Restore or diagnose first?', 'Restore first, while capturing evidence; diagnose properly once customers are unaffected.'],
        ['What does an emergency change still need?', 'A named approver, a rollback plan, and the incident lead informed.'],
        ['How do you confirm recovery?', 'A real customer transaction, and key metrics that hold steady over time.'],
        ['What belongs in every update?', 'What we know, what we do not, what we are doing, and exactly when the next update comes.'],
        ['Why not present a theory as the cause?', 'It has to be retracted if the theory changes, which damages trust.'],
        ['What does “blameless” mean?', 'Asking why decisions made sense at the time so the system improves; accountability moves to the improvements.'],
        ['Why is “human error” a weak conclusion?', 'It stops at the first mechanical fault and ignores why the system allowed it.'],
        ['When is a corrective action done?', 'When it is confirmed to work in production, not when the code merges.']],
      narr: `Here are twelve flashcards across all three domains. Read the prompt, answer out loud, then flip the card. Press the F key to flip. Shuffle the deck once you can answer most of them without hesitation.` }
  ]},

  { code: 'F.2', title: 'Timed mock exam', slides: [
    { type: 'exam', title: '24-question timed mock exam',
      html: `<p class="lede">The full mock mirrors the blueprint's domain mix, runs against a 30-minute timer, and gives no feedback until you submit. Afterwards you get a breakdown by domain and by competency, with links back to the modules to revisit.</p>${H.tip('Flag a question and move on rather than spending more than about a minute on it. Answer every question: an unanswered question scores zero.')}`,
      narr: `You are ready for the timed mock exam. It mirrors the domain mix of the blueprint, runs against a thirty minute timer, and gives no feedback until you submit. Afterwards you get a breakdown by domain and by competency, with links back to the modules to revisit. Flag a question and move on rather than spending more than about a minute on it. Answer every question, because an unanswered question scores zero.` }
  ]}
]});
