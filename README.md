# Essex Pathway Portal

A prototype member-matching portal for the Essex Provincial Pathway team.

The portal lets the Provincial Membership Team see, search, and match the lodges of the Province against prospective candidates. It replaces an older Wix-based site with a structured, more usable tool.

This is a working prototype, not a finished product. It runs entirely in the browser using static files — no backend, no database — and uses each user's local browser storage for any data they enter. The full system, when built, will move to a proper backend.

## Live site

The portal is hosted via GitHub Pages. See the URL in the repository's About section.

A quick-start guide is available at `/guide.html` from the live site.

## What's inside

- `index.html` — the portal shell
- `data.js` — lodge data, centres, and lineage
- `core.js` — routing, state, utilities
- `views.js` — page render functions
- `profile.js` — the profile editor and read-only views
- `handlers.js` — event handlers
- `styles.css` — all styling
- `guide.html` — the standalone quick-start guide
- `logo.png` — Pathway logo

## Running locally

The portal is static HTML, CSS, and JavaScript. To run it locally:

```bash
cd /path/to/portal
python3 -m http.server 8000
```

Then open `http://localhost:8000` in a browser.

You need to run via a local server rather than opening `index.html` directly — the portal uses fetch and script loading that requires a server context.

## Status

Prototype phase. Feedback is welcomed via the Provincial Membership Team.
