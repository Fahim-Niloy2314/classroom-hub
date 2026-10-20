# Classroom Hub 4.2.1 — verification record

Owner-entry correction (`4.2.1-auth2` cache revision): the disconnected GitHub Pages sign-in now hides and disables credential fields and provides one same-tab link to the private owner portal. It explains the separate personal ChatGPT gate and Classroom Hub owner login in English/Bangla. Connected owner services retain the actual credential form; failed programmatic submission while disconnected cannot re-enable the button. Existing authentication and verified-owner integration checks cover both states. This UI correction does not activate the public backend or transfer hosting ownership.

Date: 21 October 2026 (Asia/Dhaka). Previous public release: 9b450d8. This is a record of finite checks, not a guarantee that every possible issue is absent.

## Public release

| Area | Implemented behavior | Evidence / limit |
| --- | --- | --- |
| Owner identity | Exactly the owner's two approved Gmail addresses; no public registration; no third-owner editor | Server authentication and rejection tests; emails are fixed in the backend |
| Public documentation | Removed OWNER_MANUAL.md, public setup links and setup instructions | DOM/source checks; old repository history remains historical source |
| Owner controls | Curriculum/course credits, faculty CRUD and administrative roles, restored notices/video/milestone/resource edit dialogs, CV template defaults, English/Bangla wording, advanced public modules | Verified-owner DOM integration exercises edits, preservation and validation |
| Recovery | Full public revision snapshots, undo, separate owner draft, public-content/local-history/inbox backup and restore | Restore validation is checked; credentials/provider configuration are deliberately excluded from exported backups |
| Faculty | Dr. Mohammad Mizanur Rahman appears in both Head & Dean and Professors; Professor rank is retained; Fahmida remains Lab Assistant / STAFF | Real filter-button DOM regression verifies both leadership cards and excludes unrelated staff; existing 51 records and independent Gmail recipients preserved |
| Curriculum and dates | No generated future examinations presented as confirmed dates; empty content stays empty | Faculty-empty regression; unsupported seeded exam dates removed; curriculum is owner-maintained, not independently certified for every cohort |
| Routine | Blank personal routine, custom courses/teachers/days/time slots, overlap labels, term dates, editable landscape Word, calendar and JSON backups | Real OpenXML/time/calendar tests retained; samples are examples, not a verified current department timetable |
| CV | Three layouts, private local drafts, section visibility/order without data loss, separate example draft, JSON backup and editable portrait Word | Save/reload/import, injection prevention and document-structure tests; photo appears in browser/PDF preview, not Word export |
| AI | Official Gemini/ChatGPT app launch with question copy; actual Gemini/OpenAI API paths, explicit reference-search mode, honest connection errors; KaTeX auto-render added | Provider payloads/caps tested with mocks; no real provider key or paid request was used; official-app answers appear in that app |
| Languages | Clear navigation translations and AI control relabeling preserve unsent question and selected mode; owner wording overrides | EN→BN→EN integration test |
| Feedback | Durable server acknowledgement or honest local pending state; retry; Gmail/WhatsApp forwarding; real owner inbox statuses | Offline receipt and central HTTP tests; forwarding opens a draft and the student sends it |
| WhatsApp automation | Private Business Cloud API settings, approved-template queue, instant/daily modes, bounded retry, revoke-token and retry controls | Mocked provider accepts are shown as accepted, never delivered/read; actual account/token/template not supplied |
| Owner usage statistics | Anonymous browsers active in the last 90 seconds, current routes, daily browsers and AI attempts | Real counting/expiry and owner-only API tests; browsers are not verified people |
| PWA/accessibility | Actual deferred browser install prompt, platform-specific fallback, coherent 4.2.1 public shell, API cache exclusion, zoom enabled | Captured browser-prompt test; a site cannot force installation without native browser confirmation |
| Contact/archive | Feedback Gmail uses approved owner address; archived bulletin opens an existing repository release | Release PDF returned HTTP 200; CUET's indexed original URL returned 404, so it is not presented as a live official download |

## Automated checks

- `npm run check`: all five JavaScript entry files and service worker parse.
- `npm test`: **26 passed** (7 core and 19 DOM integration tests).
- `python -m unittest discover -s tests -p 'test_*.py' -q`: **24 passed** (14 HTTP integration and 10 service tests).
- Public frontend/Python total: **50 passed**. GitHub Actions repeats these checks.
- A separate owner-private hosted backend has **10 additional API tests** using a real in-memory SQLite adapter and mocked providers. These test fixed owner identities, sessions, throttling, private controls, durable idempotent feedback, publication, measured browser activity and secret redaction.
- The portable `backend-worker` source has the same **10 API tests**, run locally, and a successful native Wrangler deployment dry-run. These overlap the separate backend checks; they are not 20 independent feature tests. The dry-run did not create a personal Cloudflare deployment or database.

DOM tests do not certify pixel-perfect rendering on every phone. DOCX structure tests do not certify pagination in every Word version. Production Gemini/OpenAI and WhatsApp deliveries remain unverified without real provider configuration.

## Runtime status

The public frontend remains on GitHub Pages. No Netlify project was changed or deployed. A separate owner-private Sites backend is deployed with durable database storage. Its actual production owner login returned HTTP 200, the two-address owner identity was verified, and the test session was revoked. It is not yet connected to anonymous GitHub Pages visitors. The public Sign In dialog links to the private owner portal. Direct public-site owner login, central student feedback, activity reporting and shared AI cannot be claimed connected until that public API connection is enabled and verified. The public interface reports the missing backend honestly.

The Python runtime supports an always-running notification worker. The separate serverless backend checks daily alerts on subsequent site activity; exact unattended daily scheduling is not enabled. No real WhatsApp messages have been sent.

## Access and hosting independence

Both approved personal Gmail addresses are on the private portal's external access list. These permissions allow access to the portal and are distinct from the Classroom Hub owner login. A secure browser sign-in using the first approved personal Gmail successfully reached the portal. The subsequent, separate Classroom Hub owner login rejected the credentials supplied in that browser attempt; that owner-dashboard browser session is not verified. Native hosting grants external visitors the viewer role, not hosting ownership. The shared account still controls the existing hosting project.

The repository now contains a portable Cloudflare Worker and database migrations in `backend-worker`, without provider credentials, owner password/hash, private inbox records or a dependency on the shared ChatGPT account. It is prepared source, not a deployed service under a personal account; its database identifier is intentionally a placeholder. A personally controlled hosting account must be used before claiming independence from the shared account. Public owner-setup guides remain removed.

When a backend is connected, the frontend reads its published public snapshot from `/api/portal`; an unavailable backend falls back to the static public JSON. Integration tests verify authoritative empty content and the fallback. This does not by itself connect GitHub Pages to a private API.

## Primary-source design and technical references

These sources informed specific patterns, not a claim to have reviewed every educational website:

- [Canvas: publication controls](https://community.instructure.com/en/kb/articles/660767-how-do-i-publish-a-course): separate editable draft and published state.
- [Google Classroom: topics](https://support.google.com/edu/classroom/answer/9093681?co=GENIE.Platform%3DDesktop&hl=en): ordered, discoverable academic content.
- [Moodle: restore](https://docs.moodle.org/en/Course_restore): validated backups and recoverability.
- [CUET faculty](https://cuet.ac.bd/faculty/mechanical-and-manufacturing-eng): Dean role; search index exposed the faculty content while a direct fetch returned a reduced page.
- [KaTeX auto-render](https://katex.org/docs/autorender): separate auto-render extension and whole-formula delimiters.
- [OpenAI Responses](https://developers.openai.com/api/docs/guides/migrate-to-responses) and [Gemini deprecations](https://ai.google.dev/gemini-api/docs/deprecations/): actual provider integration and model maintenance.
- [MDN install prompt](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Trigger_install_prompt): browser-controlled install eligibility and confirmation.
- [Meta-owned WhatsApp template reference](https://whatsapp.github.io/WhatsApp-Nodejs-SDK/api-reference/messages/template/): approved template prerequisites.

## Mobile rendering check

Browser QA used an iframe with its own narrow layout viewport, rather than shrinking a desktop screenshot. The tested frame sizes were 320, 360, 390, 768 and 1024 CSS pixels. Measured content viewport / document scroll widths matched at 314/314, 354/354, 384/384, 762/762 and 1018/1018 respectively (iframe borders/scrollbar consume the difference). Home, routine, CV form/preview, CGPA, AI, faculty and progress views were exercised across the phone sizes; Home was also checked at tablet sizes.

The header now uses two rows on phones; desktop tabs switch to bottom navigation before they become crowded. Student tool tabs wrap into two columns. Flex/grid children can shrink, long text wraps, dialogs fit the viewport, GPA fields stack, and large routine tables/equations scroll inside bounded panels. Browser inspection found no uncontained routine controls at the smallest size. Two actual KaTeX equations rendered through the chat UI with zero `.katex-error` elements; that check used a user question and did not spend provider quota. Physical-device installation and every possible long-content combination are not certified by this check.
