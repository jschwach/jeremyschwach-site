# Jeremy Schwach personal site

Review-only redesign. No build framework, runtime CDN, new hosting provider, or remote deployment is required. Main pages:

- `index.html`: combined about/work, advising, investing, speaking and contact
- `insights.html`: Insights & Appearances with searchable category filters

The existing `work.html`, `extracurriculars.html` and `contact.html` URLs redirect to the corresponding home sections, with a clickable fallback for browsers that disable automatic refresh.

## Preview

From this folder, run `python3 -m http.server 8765`, then open `http://localhost:8765`. Assets are relative, so the site also works under a subdirectory. Contact requires the existing Netlify Forms integration in production; a plain static preview cannot deliver messages.

## Update Insights & Appearances

1. Add or edit a record in `assets/content.json`.
2. Use one of `writing`, `podcast`, or `speaking`. Supply the original HTTPS source URL and a verified title. User-confirmed in-person appearances without a public event page may set url to null. Set `date` to `null` when it is not verified.
3. Run `python3 scripts/build-content.py` and commit the updated JSON and `insights.html` together when publication is approved.

Items display in the JSON’s editorial order. This is a curated, data-driven index, not automatic LinkedIn scraping or a live social integration. The generated cards remain readable without JavaScript; filtering and search progressively enhance them. Speaking and teaching entries use user-confirmed appearances and supplied photographs. Publication dates are only shown when confirmed; month-only dates are supported with date_precision set to month. Original source artwork is used where available; writing cards without accessible source artwork use clearly editorial typographic graphics. No made-up appearances or publication dates were added.

The home featured conversation is curated separately in `index.html`.

## Checks

- `python3 tests/check-site.py`
- `node --check assets/site.js`
- `node tests/site-unit.cjs`
- `python3 scripts/build-content.py` (regeneration should not produce a diff when content is unchanged)

The unit test uses a minimal mock DOM and mock network. It does not replace browser integration or visual testing. Before deploying, review at 390px, 768px and 1440px, verify the portrait/group-photo crops, keyboard navigation, anchor navigation and filter states, and test an actual Netlify form submission with an authorized destination.

## Contact behavior

The form retains the original `contact` Netlify form name and field names. Non-2xx and network failures display an error and retain the message; the form no longer claims success on failure. Repeated submission while a request is pending is blocked. Success only follows an HTTP success response. Actual Netlify ingestion and inbox delivery still need deployment-environment verification. The former misleading “Download Speaker Kit” link was replaced with a truthful speaking inquiry link.
