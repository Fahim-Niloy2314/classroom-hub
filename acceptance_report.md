# Classroom Hub 4.1.1 — verification record

Date: 20 October 2026. Baseline: `5f1a9a6`. This report records finite checks, not a guarantee that every possible issue is absent.

## Implemented corrections

| Area | Change | Verification |
| --- | --- | --- |
| Navigation | Preserved Home → Student Tools → Faculty Directory → My Progress, with AI inside Tools | DOM integration routes through all four destinations and secondary views |
| Sign In | Added the missing accessible dialog; removed client-side password/hash checks and email-based admin impersonation | Dialog opens; forged local role is rejected; disconnected backend is explicit |
| Authentication | New salted scrypt owner password, expiring server session, logout revocation, login throttling | Python HTTP integration tests with synthetic credentials |
| Backend files | Replaced unsafe Python/Node file servers; public-file allowlist; private storage outside repository; confined academic file access; no native shell launching | GET and HEAD deny private paths, traversal and escaping symlinks |
| Inbox | Durable SQLite acknowledgements, idempotent retry, real central admin inbox and status changes | Concurrent retries produce one durable receipt; unauthenticated access rejected |
| Feedback/contributions | Local outbox and retry, honest undelivered state, optional contact, no fabricated email; resource review connects to central inbox | Offline UI shows pending and never a confirmed receipt; backend receipt checks |
| Publish | Public payload allowlist, credentials only on backend; commit pending until public revision matches | Missing publish credential is an error and leaves public file unchanged; real production publish requires backend setup |
| Owner drafts/backups | Preserve a separate owner draft; include faculty, registry, template metadata and hidden/featured flags; versioned restore and pre-restore snapshots | Validation and backend restore rejection checked; full live disaster-recovery exercise remains to be performed after hosting |
| Routine calendar | User-controlled term dates, true 24-hour inputs, legacy-label parsing, weekday calculation, UTC from Dhaka, bounded recurrence and UTF-8 line folding | Core tests check dates, times, Unicode byte lengths and invalid input |
| Routine Word | Actual saved class content; no forced minimum width overflowing a wide grid; unmapped-grid warning | Generated DOCX opened as ZIP and inspected for data, landscape and a 16-slot table fitting page width |
| CV | Save As preservation, restored/persisted template, visible delete and JSON import, overwrite confirmation, safer fields/URLs/photos and distinct section order | Synthetic form/save/reload/injection tests and portrait DOCX content checks |
| Faculty | Preserved 51-member data and individual Gmail recipients; Fahmida remains Lab Assistant / STAFF | DOM test inspects generated Gmail URLs and staff designation |
| Cache | Coherent 4.1.1 shell; same-origin public allowlist; no API/authenticated caching; correct offline fallback | JavaScript syntax checked; online/offline lifecycle still needs a device-level smoke test |
| Claims | Removed invented visitor fallback, hardcoded audit passes and local-save “published live” messages | Source review; unavailable visitor service displays unavailable |
| AI | Replaced retired Gemini 2.0 endpoint with current documented Flash model; API keys moved to headers; explicit built-in-reference/Drive limitations | Syntax and source checks only; no provider key/quota supplied for a real answer test |

## Reproducible automated checks

- `npm run check`: syntax checks for app, core helpers, corrective flows and service worker.
- `npm test`: **14 tests passed** (7 core + 7 DOM integration).
- `python -m unittest discover -s tests -p 'test_*.py' -v`: **11 tests passed**.
- Total: **25 tests passed**. Tests are committed under `tests/`, with dependency lockfile and a GitHub Actions workflow. Their assertions are available for review.

DOM tests run in jsdom and do not establish pixel-perfect mobile layout. DOCX tests establish document structure and content; they do not replace a visual review in each Word version or certify PDF pagination.

## Deployment and remaining setup

The public static changes are intended for the existing GitHub Pages site. No Netlify project, build or deployment is part of this change. Existing Drive archive/index files and the two downloadable Word templates are retained.

**Online admin login, central message delivery and one-click publishing require an actual HTTPS Python backend, durable private storage, a newly configured owner password and a server-side repository credential.** `backend-config.json` is deliberately unconfigured until that real endpoint exists. This report does not claim those services are live.

Local backend integration tests run on loopback with temporary synthetic records. No user password was entered, no live student feedback was submitted, no Drive files were changed, and no API secret was put in browser/public content.

The owner guide includes local setup, online hosting configuration, Docker deployment files, backup/recovery and exact limitations. Remaining external checks: authenticate against the eventual online backend, submit a harmless cross-device test message, verify a real content publish, review mobile device layouts and print pagination, and verify Drive sharing and curriculum with the department. Live Pages smoke-test observations will be summarized separately after deployment is served.

Sources for lifecycle/hosting decisions: [GitHub Pages capabilities](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site), [Google Gemini lifecycle](https://ai.google.dev/gemini-api/docs/deprecations/).

## Live Pages smoke test

The first fixed release was served live as commit `c2a5302`. GitHub reported both Regression checks and Pages build/deployment successful. A real browser verified the four-tab order, loaded all eight semester cards, opened the sign-in dialog, confirmed the disconnected-backend notice with sign-in disabled, and found the CV delete/import controls. Faculty rendering contained 142 Gmail compose links with no combined recipients and retained the Lab Assistant designation. No application JavaScript error was observed; an unrelated browser-extension metadata error was excluded.

The 4.1.1 patch removes the remaining preselected personal semester/section display and adds a regression assertion. Online admin/inbox remain unconfigured; no live credential was entered.
