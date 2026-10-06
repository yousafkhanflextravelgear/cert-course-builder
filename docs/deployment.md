# Deployment

The course is static files: serve the folder as is.

## GitHub Pages (this repository's demo)

`.github/workflows/pages.yml` publishes `reference-template/` on every push to `main` that touches it. One-time: in the
repository, **Settings → Pages → Source → GitHub Actions**.

## Any static host

Upload the course folder. Requirements:

- Correct MIME types: `text/html`, `text/javascript`, `text/css`; `audio/webm` for recordings.
- No special headers needed. The engine uses no inline `<script src>` from other origins and no iframes, so it works under
  a strict Content-Security-Policy (`default-src 'self'` plus `style-src 'self' 'unsafe-inline'` for the few inline styles).
- HTTP range support is **not** required: recordings are fetched whole as Blobs so seeking works anywhere.

## Several courses on one origin

Each course must have its own `storageKey` in `course.config.js` (checked by the scanner), otherwise their progress would
overwrite each other.

## Offline single file

Optional. Compile the course into one `.html` by inlining the CSS and scripts; embed only the two natural voices' audio as
`data:` URIs; keep device voices as the fallback. Video links work but playing them needs a network. If the file is too
large to send in one piece, split it and verify the reassembled file is byte-identical.
