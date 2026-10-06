# Narration and audio

## Tiers

1. **Recorded natural voices** (optional): two voices, packed per module, listed in the picker under *Natural voices
   (recorded)*.
2. **Device voices**: the browser's Web Speech API, under *Device voices*. This is the only tier the demo uses, and it is
   the fallback for everything else.

If a recording is missing, stale or fails to load, the engine says so briefly and speaks the slide with the device voice.

## Transcript

Every slide has a script (`narr`). It is split into sentences, shown under the slide. Clicking a sentence seeks there; the
sentence being spoken is highlighted.

## The viewport rule

Narration must never scroll or move the page, the transcript panel or the course map. Highlighting changes a CSS class
only. The browser test starts narration with a stubbed speech engine, scrolls the page mid-narration and fails if anything
moves. (A deliberately re-introduced `scrollIntoView` was confirmed to make it fail.)

## Audio manifest

`audio-manifest.js` sets `window.AUDIO_MANIFEST = { base, voices: [{id,label}], items: { <voiceId>: { <key>: item } } }`.

- **Key:** `${segment.id}:${module.code}:${slideIndex}`: positional, within the module's live slide list.
- **Item:** `{ m: <module audio file>, o: <offset s>, d: <duration s>, s: <sentence offsets>, h: <hash of the script> }`.
  The engine plays only if the hash of the current script equals `h`.
- Audio is packed **per module** (not per slide), in Opus/WebM, fetched as a Blob so seeking works on hosts without HTTP
  range support.

### Pitfall: inserting slides

Because keys are positional, inserting a slide into an already-narrated module (anywhere but the end) shifts every later
slide's key. Nothing crashes: later slides quietly use the device voice. Finalise slide order, videos included, **before**
generating a module's audio. If you must add one later, append its audio to the end of the module file and give it the new
key, or recompute every key.

## Rights for recorded audio

Check the provider's terms for the plan you use (commercial use, attribution, voice consent), disclose that voices are
AI-generated, never clone a real person's voice without written consent, and record all of it in the course's `RIGHTS.md`.
Do not commit audio to a public repository unless its terms allow redistribution. This repository bundles none.
