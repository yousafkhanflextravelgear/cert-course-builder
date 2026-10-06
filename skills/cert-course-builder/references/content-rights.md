# Content rights and shareability

Read this **before building** (so the course is written in a shareable way from the first slide) and **again before
anyone shares, publishes or sells a finished course**. It is a practical checklist, not legal advice. Rules differ by
country and by certifying body, and bodies change their terms. Re-check the body's current pages at build time and
record what you found (see `rights-record-template.md`).

## 1. The one rule that keeps a course shareable

> A course may **describe and teach** what an exam covers. It may not **reproduce** the body's protected material or
> anything from the real exam.

In practice that means:

| Do | Don't |
|---|---|
| Link to the official blueprint / body of knowledge and cite its version and date | Copy the blueprint, its task statements or its sample questions into the course |
| Name the certification once, factually, to say what the course prepares for (nominative use) | Use the body's logo, badge, colours, or a name that implies endorsement ("Official CISSP course") |
| Write every explanation, scenario, quiz and exam question **in your own words, from the underlying standards and general knowledge** | Write questions from memory of the real exam, from "brain dumps", or from a candidate's recollection |
| Teach from public standards (NIST, ISO summaries, statutes) and cite them | Paste paid standards (ISO, ITIL, PMBOK, COBIT, vendor courseware) |
| Link out to videos (title and channel verified, opened in a new window) | Download, re-host, or embed videos you do not own |
| State plainly: independent study aid, not affiliated with or endorsed by the certifying body | Imply that passing the course grants, or is a substitute for, the certification |

If you cannot tell whether something is yours to reproduce, **do not reproduce it**; paraphrase, or link.

## 2. What was found when this was researched (verify again at build time)

These are examples from the bodies' own pages, fetched while preparing this repository. They show the *pattern*;
they are not a substitute for reading the current terms for the certification you are building.

| Topic | What the body says | Consequence for a course |
|---|---|---|
| **ISC2 (CISSP etc.)** | Site content "may not be copied, reproduced or distributed without prior written permission"; its marks may be used by third parties only with authorisation. Candidates agree to a non-disclosure agreement before the exam (the agreement text was not visible on the public page: read it when you register). [copyright page](https://www.isc2.org/policies-procedures/copyright-information), [NDA page](https://www.isc2.org/Exams/Non-Disclosure-Agreement) | Do not copy the exam outline; link to it. Never write items from what you saw in the exam. |
| **IAPP (CIPP, AIGP etc.)** | Exam content is "the exclusive and confidential property of the IAPP"; candidates pledge not to disclose questions, answers or exam content, indefinitely. The Body of Knowledge topic lists are published as a study resource. Materials from non-official sources are "not endorsed by the IAPP". [Certification Handbook](https://assets.contentstack.io/v3/assets/bltd4dd5b2d705252bc/blteb8b5d531fd78971/IAPP-Certification_Handbook.pdf) | You may reference the published Body of Knowledge; you may not use exam content. Say "not endorsed" in the disclaimer. |
| **PeopleCert (ITIL)** | A third party needs a **valid licence** to use ITIL marks; ITIL-related products go through a licensing process with fees and royalties, renewed every two years; a specified trademark acknowledgement must accompany the first use of ITIL®. [marks policy](https://peoplecert.org/-/media/folders-reorganized/legal-documents/marks-usage-policy.pdf), [third-party licensing](https://peoplecert.org/Organizations/Services/third-party-product-licensing-service) | **Do not publish an ITIL course** without a PeopleCert licence. Keep it private, or teach the generic practice under a non-ITIL name with no ITIL text. |
| **NIST (SP 800-series, CSF)** | Works by NIST employees in its technical series are not subject to copyright in the US; reuse is permitted, with the request to cite and add "Republished courtesy of the National Institute of Standards and Technology". Third-party content inside a NIST document may remain protected. [NIST statement](https://www.nist.gov/open/copyright-fair-use-and-licensing-statements-srd-data-software-and-technical-series-publications) | Safe to teach from and quote briefly with attribution; still check embedded third-party material. |
| **Nominative use of marks** | In *ISC2 v. Security University* (CISSP®), the court granted summary judgment to the training company on nominative fair use: the mark was needed to identify the service, only what was necessary was used, and no sponsorship was implied. [case summary](https://wlo.willamette.edu/ip/2014/08/intl-info.-sys.-sec.-certification-consortium-v.-sec.-univ..html) | Naming the certification factually is generally defensible. Logos, stylised marks and "official" wording are not. One US ruling, not a guarantee elsewhere. |
| **YouTube** | Owners can disable embedding; the YouTube API Terms apply to the embedded player; age-restricted videos cannot be embedded on most third-party sites. [YouTube Help](https://support.google.com/youtube/answer/171780) | The engine **links out** (new tab) and never embeds, which avoids most of this. Verify each video through oEmbed; do not claim the video is "reviewed" or "endorsed". |
| **Text-to-speech audio** | OpenAI's usage policies require a clear disclosure that a TTS voice is AI-generated. [OpenAI TTS guide](https://developers.openai.com/api/docs/guides/text-to-speech). ElevenLabs: paid plans carry commercial rights to the output, the free plan does not and requires attribution; cloning needs consent. [summary](https://terms.law/ai-output-rights/elevenlabs/) | Before bundling recorded narration, read the provider's *current* terms for your plan. Always disclose AI voices in the UI (the engine's `disclaimer` and voice picker do this). Never clone a real person's voice without written consent. |
| **Google Fonts** | A Munich court (2022) found that loading Google Fonts from Google's servers transmitted visitors' IP addresses unlawfully under German data-protection law, because the fonts could be self-hosted. [analysis](https://decoded.legal/blog/2022/02/google-fonts-an-ip-address-and-the-gdpr-must-i-now-self-host-all-my-web-page-resources) | The default theme uses system fonts only. If a brand theme needs web fonts, self-host them (check the font's licence, e.g. SIL OFL). |

## 3. Decision table: can this course be shared?

| Situation | Private study | Share free (public repo / link) | Sell |
|---|---|---|---|
| Original content, standards-based, nominative name, disclaimer | Yes | Yes | Yes, check the body's trademark rules |
| Course mirrors the body's blueprint headings and weights | Yes | Yes if you only **cite** the blueprint (version, date, link) and your slides are your own words; no if you reproduce its task statements | Same, plus stricter reading of trademark rules |
| Any question recalled from the real exam, or from "dumps" | **No** | **No** | **No** (it can also expose *you* to the body's agreement) |
| Body requires a content/trademark licence (e.g. ITIL) and you have none | Private only, never use their marks externally | **No** | **No** |
| Bundled AI narration on a plan that forbids commercial use | Yes | Check provider terms | **No** |
| Uses a person's real voice | Only with that person's written consent, in all cases | | |
| Third-party images, icon sets, fonts without a verified licence | Yes | **No** until licence is verified | **No** |

## 4. Required notices (put them in the course UI and the repo)

1. **Non-affiliation** (the engine shows `COURSE_CONFIG.disclaimer` in the course map):
   > Independent study aid. Not affiliated with, endorsed by, or sponsored by *<certifying body>*. *<Certification>* is a trademark of its owner and is named here only to say what this course helps you prepare for. Practice questions are original and are not from any real exam.
2. **Blueprint currency**: name the version and effective date of the blueprint you studied, and link to the official copy.
3. **Third-party marks**: add whatever acknowledgement the owner requires (PeopleCert, for example, specifies a statement for ITIL®).
4. **AI narration**: say the recorded voices are AI-generated.
5. **Videos**: say they are external, opened on their host site, and not reviewed for accuracy.
6. **Prerequisites**: say plainly whether the certification needs experience or endorsement that the course cannot give.

## 5. Process: three gates

- **Gate A, before building.** Read the body's current copyright, trademark, candidate-agreement and exam-content
  pages. Fill in `rights-record-template.md` (one page per course). If the body requires a licence for derived
  materials, tell the user now and agree: private build only, or obtain the licence.
- **Gate B, while writing.** Original wording only. Never accept a user's pasted "real exam questions"; offer to write
  new ones on the same topic instead. Keep a source list for every standard you rely on.
- **Gate C, before sharing.** Run `scripts/scan_publish_safety.py` over the course folder (it must report no errors),
  re-read the rights record, remove anything private (storage key, personal paths, brand assets you do not own), and
  only then publish.

A finished course that has not passed Gate C is **private**. Say so when delivering it.
