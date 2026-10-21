# Classroom Hub 4.4.0 — public verification summary

Updated 21 October 2026.

## Live application

https://classroom-hub-niloy2314.netlify.app/

The existing application and academic archive are retained. The GitHub Pages copy provides a link to the live application from its Sign In dialog. Browser-local student drafts do not automatically transfer between website domains; use the available export/import tools when moving supported data.

## Verified behavior

- The public website loads without a hosting-provider or ChatGPT login.
- Primary destinations remain Home, Student Tools, Faculty Directory and My Progress. AI is within Student Tools.
- The direct owner sign-in form opens. Live application checks verified authorized sign-in, content publication, and sign-out. Private administrative data is unavailable to unauthenticated visitors.
- The Dean filter displays Dr. Mohammad Mizanur Rahman separately from the Head filter.
- The existing routine, CV, academic tools, resource browsing, feedback and progress features are retained.
- Local verification passed 31 Node core/DOM tests, 30 Python tests and 9 Netlify/Postgres integration tests: 70 total. JavaScript syntax, TypeScript checks and the public build passed. The updated GitHub Pages sign-in link regression passed separately.

## Limits of verification

AI provider calls and automatic WhatsApp notifications require owner-supplied provider configuration and remain disabled until enabled. No real paid AI request or automatic WhatsApp delivery is claimed verified. Manual forwarding and official AI application launch options remain available.

PWA installation requires native browser confirmation. Activity statistics count browsers rather than verified people. DOM and document-structure tests do not certify every phone layout or every Word version. This report does not claim that every possible issue has been eliminated.
