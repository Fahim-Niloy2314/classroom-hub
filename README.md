# Classroom Hub

[Live site](https://fahim-niloy2314.github.io/classroom-hub/) · [Acceptance report](acceptance_report.md)

CUET Mechanical Engineering academic-resource hub. Navigation: **Home → Student Tools → Faculty Directory → My Progress**. Student Tools includes personal routines, editable Word/calendar exports, a CV builder, GPA/CGPA calculation and AI connection options.

Personal CVs, routines, bookmarks and study progress are saved on the current device. Individual JSON backups let students transfer their work.

Owner access is restricted to the two fixed owner identities, verified by the private backend. There is no public owner registration or setup guide. Source code does not contain the owner password, provider keys or private feedback. A copy of this repository does not grant access to the actual owner's service.

The same repository supports GitHub Pages for the public frontend and Netlify for the full application. The Netlify build packages only public assets; same-origin Functions and Postgres provide owner sessions, live content publishing, a private feedback inbox and measured browser activity. GitHub Pages itself does not run these backend functions. Shared AI and automatic WhatsApp alerts remain disabled until the owner configures the corresponding provider. See the acceptance report for verification and deployment limitations.
