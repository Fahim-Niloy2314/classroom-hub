# Classroom Hub

[Live site](https://fahim-niloy2314.github.io/classroom-hub/) · [Owner guide](OWNER_MANUAL.md) · [Acceptance report](acceptance_report.md)

CUET Mechanical Engineering academic-resource hub. Existing course folders and Google Drive links remain the public archive. Navigation: **Home → Student Tools → Faculty Directory → My Progress**. Student Tools includes a personal routine, editable Word/calendar exports, CV builder, GPA/CGPA calculator and study assistant.

The frontend runs on GitHub Pages. Personal CVs, routines, bookmarks and study progress stay on the current device; use the individual JSON export/import controls to transfer them.

A separate Python backend provides real owner authentication, a private central inbox and server-side GitHub publishing. Its source is included, but **online backend hosting has not been provisioned**. Sign In reports that state accurately; a static Pages deployment cannot execute Python. No Netlify project or deploy is used.

For local owner access:

```sh
python server.py --set-password
python server.py
```

Open `http://127.0.0.1:8080`. Configure a new password in your own terminal. See the owner guide before connecting a public HTTPS backend. Never put credentials, tokens or private submissions in this public repository.

Checks:

```sh
npm ci --ignore-scripts
npm run check
npm test
python -m unittest discover -s tests -p 'test_*.py' -v
```
