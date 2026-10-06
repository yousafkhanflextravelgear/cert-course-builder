/* Segment 1 — Domain I: Detect and triage. DEMO CONTENT: invented for this repository. */
COURSE.segments.push({
  id: 's1', code: 'I', label: 'Domain I', title: 'Detect and triage', hue: 'd1', q: '7–9 scored questions',
  modules: [
  { code: 'I.A', title: 'Classify and prioritise incidents', slides: [
    { type: 'opener', eyebrow: 'Domain I · Detect and triage', title: 'Decide how serious this is, and how soon it matters',
      lede: 'Classification is the first judgement call in every incident. Get it wrong and the wrong people wake up, or the right people sleep through it.',
      narr: `Domain I is detect and triage. Classification is the first judgement call in every incident. Get it wrong and the wrong people wake up, or the right people sleep through it. This module covers how to classify an incident and how to prioritise it.` },

    { title: 'Priority is impact combined with urgency', kicker: 'I.A · Classification',
      html: `<p class="lede">Impact asks how many people are affected and how badly. Urgency asks how fast the situation gets worse if nothing is done. Priority comes from both together.</p>
      ${H.tbl(['', 'Low urgency', 'High urgency'], [
        ['<b>High impact</b>', 'Plan a prompt fix and watch closely', '<span class="pill hi">Highest priority</span> Page responders now'],
        ['<b>Low impact</b>', '<span class="pill lo">Lowest priority</span> Queue as normal work', 'Fix soon: it may grow into high impact']])}
      ${H.trap('Impact alone is not priority. A rare cosmetic fault on a very visible page can be low impact, while a quiet data-corruption bug affecting few users can be high urgency because it spreads.')}
      ${H.tip('In a question stem, underline the two facts that set impact and urgency, then ignore the details that do neither — the number of teams involved, who reported it, or the time of day.')}`,
      narr: `Priority comes from impact and urgency together. Impact asks how many people are affected and how badly. Urgency asks how fast things get worse if nobody acts. A high impact, high urgency incident gets the highest priority and responders are paged immediately. A low impact, low urgency event is queued as normal work. The trap is treating impact alone as priority. A quiet data corruption bug affecting few users can still be urgent because it spreads. In a question, underline the two facts that set impact and urgency and ignore the details that do neither.` },

    { title: 'What a severity ladder looks like', kicker: 'I.A · Severity levels',
      html: `<p>Teams usually write severity levels as a short ladder so that people classify consistently under pressure. The wording differs between organisations; the logic does not.</p>
      ${H.tiles([
        ['alert', 'Severity 1', 'Major customer-facing outage or data loss. Everyone needed, round the clock.', true],
        ['bolt', 'Severity 2', 'Significant degradation or a key feature unavailable. Prompt, focused response.'],
        ['sliders', 'Severity 3', 'Limited impact with a workaround. Fix in working hours.'],
        ['clock', 'Severity 4', 'Minor issue or a warning sign. Schedule the work.']])}
      ${H.bars({ title: 'Incidents handled by severity, last quarter', sub: 'Illustrative numbers: most incidents are minor, and the process is built for the rare severe ones.', illus: true, unit: 'incidents',
        rows: [['Severity 1', 3, 'Rare, all hands'], ['Severity 2', 17, 'Focused team'], ['Severity 3', 64, 'Business hours'], ['Severity 4', 112, 'Scheduled work']], max: 120, step: 20, label: 130 })}
      ${H.upd('Many teams now tie severity to customer-facing service objectives, such as an error budget being consumed, rather than to how loud an alert sounds. Check which basis the scenario uses.', 'Practice update')}`,
      narr: `Teams write severity levels as a short ladder so people classify consistently under pressure. Severity one is a major customer facing outage or data loss, with everyone needed. Severity two is a significant degradation. Severity three has a workaround and can wait for working hours. Severity four is a minor issue or a warning sign. The chart shows illustrative numbers, and the lesson is the shape. Most incidents are minor, and the process is built for the rare severe ones. Many teams now tie severity to customer facing service objectives rather than to how loud an alert sounds.` },

    { type: 'case', code: 'I.A', title: 'Two alerts, one on-call engineer',
      scenario: `<p>At 02:10 your on-call phone shows two alerts. <b>Alert A:</b> the log server's disk is at 78% and grows about 1% a day. <b>Alert B:</b> checkout errors have risen from 0.2% to 4% in ten minutes and are still climbing; customers can retry successfully.</p><p>You are the only responder awake.</p>`,
      prompts: [
        { q: 'Which alert do you work first, and why?', a: `<p>Alert B. Impact is real and growing (paying customers, rising error rate) and urgency is high because the trend is upward. Alert A has no current impact and weeks of headroom.</p>` },
        { q: 'Does the retry workaround change the classification?', a: `<p>It moderates impact but not urgency. The workaround may justify a lower severity than a hard outage, yet the rising trend still demands prompt action. Record the workaround, because it also shapes customer messaging.</p>` },
        { q: 'What do you do about Alert A?', a: `<ul><li>Acknowledge it and create a ticket at low priority.</li><li>Note the growth rate so the capacity work is scheduled before the threshold is reached.</li><li>Do not page anyone for it.</li></ul>` }],
      narr: `At ten past two in the morning your phone shows two alerts. Alert A says the log server disk is at seventy eight percent and grows about one percent a day. Alert B says checkout errors have risen from point two percent to four percent in ten minutes and are still climbing, although customers can retry successfully. You are the only responder awake. Decide which alert you work first and why, then open each model answer.` },

    { type: 'quiz', id: 'q-IA', kicker: 'Module quiz', title: 'I.A — Classify and prioritise',
      intro: 'Two questions, instant feedback with an explanation for every option.',
      items: [
        { code: 'I.A', q: 'Disk usage on a log server is at 78% and rising about 1% per day. No customer is affected. What is the BEST classification?', opts: [
          'Critical incident: page the whole rotation and open a bridge call now',
          'Major incident: notify executives and start hourly customer updates',
          'Low-urgency event: schedule capacity work before the threshold bites',
          'Not an event: ignore it until a customer reports a visible symptom'], a: 2,
          why: 'There is no current impact and weeks of headroom, so it is a low-urgency event to schedule. Paging, bridging and executive notification are far out of proportion, and ignoring it lets a predictable problem become an outage.' },
        { code: 'I.A', q: 'Two hours into a medium-severity incident, new data shows the failure now blocks payroll processing ahead of a deadline. What should the incident lead do?', opts: [
          'Keep the original level so the incident record matches the first report',
          'Re-classify upward, announce the change, and bring in the extra responders',
          'Wait until the review to adjust the level once every fact is verified',
          'Close this incident and open a new ticket so the history starts clean'], a: 1,
          why: 'Classification follows current facts, not the first report. Raise it, tell everyone, and add the people the higher level requires. Waiting, freezing the level, or splitting the record all delay the right response.' }]}
  ]},

  { code: 'I.B', title: 'Triage and assign ownership', slides: [
    { title: 'One incident, one lead, clear roles', kicker: 'I.B · Ownership',
      html: `<p class="lede">The most common failure in a live incident is not technical. It is several capable people who each assume someone else is in charge.</p>
      ${H.terms([
        ['Incident lead', 'Coordinates the response and makes the calls. Does not need to be the most senior or most technical person.', 'compass'],
        ['Technical lead', 'Directs the investigation and chooses between mitigation options.', 'wrench'],
        ['Communications lead', 'Drafts and sends stakeholder updates on the agreed cadence so engineers keep working.', 'megaphone'],
        ['Scribe', 'Keeps a timestamped log of decisions and actions for the later review.', 'doc']])}
      ${H.tip('When a stem describes confusion on a call, the best first step is almost always to name one lead and assign owners to workstreams, before any technical step.')}
      ${H.trap('Having several people investigate the same hypothesis feels thorough, but it wastes the team’s scarce attention and leaves other hypotheses untested.')}`,
      narr: `The most common failure in a live incident is not technical. It is several capable people who each assume someone else is in charge. So name roles. The incident lead coordinates and makes the calls, and need not be the most senior person. The technical lead directs the investigation. The communications lead sends stakeholder updates so engineers can keep working. The scribe keeps a timestamped log for the review. When a question describes confusion on a call, the best first step is almost always to name one lead and assign owners to workstreams. Having everyone chase the same hypothesis feels thorough, but it leaves other ideas untested.` },

    { title: 'Triage is a short checklist, not an investigation', kicker: 'I.B · Triage',
      html: `${H.ol([
        '<b>Is it real?</b> Confirm the alert or report reflects actual customer or system impact.',
        '<b>Is it already known?</b> Check open incidents for a duplicate before starting a second investigation.',
        '<b>How serious is it?</b> Classify by impact and urgency, and record the basis.',
        '<b>Who owns it?</b> Assign one accountable owner and name the next update time.'])}
      ${H.stats([['< 5 min', 'Illustrative target to acknowledge a severity 1 page', 'Example only'], ['1', 'Accountable owner per incident at any moment', 'Principle'], ['0', 'Orphaned incidents: every open item has a named owner', 'Principle']])}
      ${H.tip('The duplicate check matters for two reasons: it prevents parallel investigations of the same problem, and it keeps what customers are told consistent.')}`,
      narr: `Triage is a short checklist, not an investigation. First, is it real. Confirm that the alert reflects actual impact. Second, is it already known. Check open incidents for a duplicate before starting a second investigation. Third, how serious is it. Classify by impact and urgency and record the basis. Fourth, who owns it. Assign one accountable owner and name the time of the next update. The duplicate check matters because it prevents parallel investigations of one problem and keeps customer messaging consistent.` },

    { type: 'quiz', id: 'q-IB', kicker: 'Module quiz', title: 'I.B — Triage and ownership',
      intro: 'Two questions on roles and handoffs.',
      items: [
        { code: 'I.B', q: 'Three engineers join a call and each assumes another is leading. Which first step best restores clarity?', opts: [
          'Ask all three to chase the same hypothesis so nothing gets missed',
          'Escalate to the executive sponsor to decide which engineer should lead',
          'Pause the response until a fuller written plan has been agreed by all',
          'Name one incident lead, then give each person a specific workstream'], a: 3,
          why: 'One named lead plus explicit workstreams ends the diffusion of responsibility immediately. Duplicated effort wastes attention, escalating for a decision adds delay, and pausing for a plan gives the problem more time.' },
        { code: 'I.B', q: 'An on-call engineer’s shift ends mid-incident. Which handoff practice is MOST reliable?', opts: [
          'A live handoff backed by notes on state, hypotheses and next steps',
          'Leave the ticket open so the next engineer can read the whole history afterwards',
          'A short chat message saying the incident continues and who to ask about it',
          'Hand over only the unresolved tasks, since finished work needs no mention'], a: 0,
          why: 'A live conversation lets the new owner ask questions, and written notes preserve what was tried and what is believed. A passive ticket, a thin message, or a list of open tasks all lose context that the new owner needs.' }]}
  ]}
]});
