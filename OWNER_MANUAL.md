# Classroom Hub owner guide — 4.1.0

## What works on the GitHub Pages address

Home → Student Tools → Faculty Directory → My Progress. Student Tools contains Routine, CV, GPA/CGPA and AI. Students do not need an account to keep personal work on their own device.

The public site is static. GitHub Pages cannot run `server.py`, receive an inbox message or authenticate an owner merely because Python code is in the repository. See [GitHub's hosting documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site).

**Current deployment:** `backend-config.json` has an empty `apiBase`. The public sign-in dialog therefore reports that the online backend is not connected. It does not grant a fake admin role. Feedback stays visibly pending on the student's device until a real backend acknowledges it. Do not report online admin, inbox or publishing as operational before completing the setup below.

## First owner setup on your own computer

1. Install Python 3.10 or newer and clone/download this repository. The optional `server.js` launcher also uses this same Python backend.
2. In the project directory, run:
   ```sh
   python server.py --set-password
   ```
   Enter a **new** password twice in your terminal. Use at least 12 characters. Do not reuse the password previously shared in chat. No built-in password or client-side password hash is accepted.
3. Run `python server.py`, then open `http://127.0.0.1:8080`.
4. Select **Sign In / Admin**, enter `fahimcuet63@gmail.com` and your new password. `CLASSROOM_OWNER_EMAIL` can change the owner email on the backend.
5. An authenticated **Admin dashboard** button appears in the header, including mobile. Sessions expire after two hours. Sign out invalidates the backend token; restarting the backend also ends its sessions.

Passwords are hashed with salted scrypt. Session tokens exist in browser sessionStorage, not persistent localStorage. The old local identity, password hash and browser GitHub token keys are retired without deleting student routines, CVs, bookmarks or progress.

Private storage defaults to `~/.local/share/classroom-hub`, outside the public app directory. Use `CLASSROOM_PRIVATE_DIR` to select another **durable private directory outside the repository**. Back it up securely. The SQLite database contains private student submissions and owner snapshots; never commit or upload it to the public repository.

## Enable one-click publishing

Configure `GITHUB_TOKEN` **only in the backend host's secret/environment settings**. It needs Contents: read/write on `Fahim-Niloy2314/classroom-hub`; use a token restricted to that repository. Do not paste it into the site, chat, public JSON, HTML or source code. Protect the host and its secret settings with your own account.

1. Sign in, edit public content and review the result.
2. The dashboard saves an owner draft on this device. It is separate from the downloaded public baseline and survives refresh while the owner session remains valid. After signing back in, the retained owner draft can be loaded. Public content changes are not shared just by clicking a local Save button.
3. Select **Publish Live**. The backend validates the public-only payload and commits `portal_sync.json` to GitHub. The browser reports **deployment pending** until the exact revision is fetched from the public GitHub Pages address.
4. If a build is slow, the message remains pending. A failed commit or timeout is never labelled “Published Live”. The draft is retained so you can retry or download `portal_sync.json`.
5. For manual publishing, **Download portal_sync.json** exports public content only. Commit that file through your GitHub account and wait for Pages to update.

Public payloads include settings, contact content, curriculum, notices, faculty, department routines, resources, hidden/featured flags, videos, FAQs, timeline and CV-template metadata. They exclude passwords, tokens, API keys, webhooks, private inbox data and students' personal tools.

## Connect an online backend to the existing public site

This requires a host capable of running Python continuously with durable private disk and an HTTPS endpoint. It has **not** been provisioned by this release. A hosting subscription or credential must be supplied through your own hosting account; no paid plan was created.

1. Deploy the repository's Python backend to that host. Keep its private directory on durable disk, not an ephemeral container filesystem. Configure `CLASSROOM_BIND=0.0.0.0` only behind an HTTPS reverse proxy. Set the public port through `PORT` as required by your host. Configure request/time limits and access logging at the proxy without logging authorization headers or payloads.
2. Set `CLASSROOM_PRIVATE_DIR`, `CLASSROOM_OWNER_EMAIL` and `GITHUB_TOKEN` in the host's private settings. Initialize a new password using `python server.py --set-password` on that host.
3. Keep `CLASSROOM_ALLOWED_ORIGINS=https://fahim-niloy2314.github.io`. Add other legitimate origins as comma-separated full origins only if you actually host another frontend.
4. Update the public `backend-config.json` to `{"apiBase":"https://YOUR-ACTUAL-BACKEND-HOST"}`. The value is the backend **origin**, with no `/api` suffix, passwords, query or fragment. Replace the example with the host you actually deployed; never publish this placeholder as a working endpoint.
5. Verify `/api/status` returns JSON with `status: online` and `configured: true`. Verify login, logout, central inbox, a harmless test feedback submission, and a reversible public-content publish from a second device. Until these checks pass, online services remain incomplete.

A Dockerfile and `compose.yaml` are included as an alternative for an existing Docker host. `docker compose up -d --build` binds the app to loopback on the host. Then `docker compose exec classroom-hub python server.py --set-password` initializes the password. Configure your own HTTPS reverse proxy. The named volume `classroom-private` must be retained and backed up. The container's copy of public data is refreshed on a new build; the durable inbox remains on the volume.

Do not put the Python backend on a Netlify static deploy and expect Python execution. A serverless implementation would need a separate runtime and durable database adapter.

## Inbox and contributions

- A server receipt means the submission's SQLite transaction completed. Locally pending drafts are not receipts.
- Duplicate retries carry the same request ID and produce the same server receipt.
- The Feedback page displays a local outbox and a **Retry pending messages** button. An online event may retry those messages. A browser storage clear removes unsent messages, so forward important pending feedback through the offered Gmail/WhatsApp links if necessary.
- Contact is voluntary; no email is invented from a roll number.
- After owner sign-in, the central inbox loads from the backend. Set items to new, reviewed, resolved or archived. It does not display unrelated student messages gathered only from your own browser as a central inbox.
- Resource contributions enter the same central inbox. **Add resource to review queue**, approve in the dashboard, then Publish Live. A contributed link does not become public automatically.

The current Python implementation uses one process with a threaded HTTP server. Scaling to multiple processes requires shared authentication/rate-limit storage and operational review; do not describe it as a high-scale production platform.

## Backups and restore

Owner **Download Backup** exports a version 4 public-content draft plus local owner history and, when connected, a private backend inbox backup. Protect that downloaded file. Personal student CVs, routines and progress are intentionally separate.

Restore validates the backup, retains `classroom_pre_restore_backup` on this device and saves a private backend snapshot before changing inbox records. It merges inbox records rather than deleting newer records absent from the backup. Restored public content remains an unpublished draft; inspect it and explicitly publish. Legacy version 3 backups need deliberate migration, rather than silently discarding unfamiliar fields.

For disaster recovery, also back up the host's private directory, and keep GitHub access under your own account. Git commits preserve previous public revisions. Do not delete the private volume or clear browser storage as a troubleshooting shortcut.

## Personal routine

- Start blank or copy a department template. Days, times, courses, teachers, rooms and notes are editable per student.
- Use explicit 24-hour `HH:mm` times. `01:30` means 1:30 AM; unpadded legacy `1:30` is interpreted as the afternoon. Imported older default grids are migrated only when the known old afternoon-grid pattern is present.
- Set **Term start** and **Term end** before calendar export. Dates persist with the personal routine. Default range is 16 weeks including the first day (112 days), but it is editable.
- `.ics` uses Dhaka UTC conversion, correct first weekdays, bounded weekly recurrence and UTF-8-safe line folding.
- Download an editable blank/sample Word file, or export your own filled `.docx`. Routine Word and print use landscape; CV uses portrait. Wide routine grids fit the table width, though many columns naturally make text smaller.
- JSON backup transfers the personal routine between devices. “Saved on this device” does not mean cloud sync.

## CV, faculty and AI

CV fields start blank. **Load Example CV** contains illustrative sample content—replace every qualification, grade, award and link before use. Save As preserves current content and template. Draft selection restores its template. Creating a blank draft with an existing name asks before replacing it. Delete draft and Import CV JSON are visible; the default draft can be cleared instead of deleted. Job, engineering and academic templates use different section orders, with research displayed in academic mode. Preview, print and Word are editable/text based; optional profile photos currently appear in preview/PDF, not the Word export.

Faculty email addresses each have a separate Gmail action and copy button. Multiple-address cards show an address chooser. Institutional addresses are retained as recipients; opening Gmail does not convert an institutional email into a Gmail address. Ms. Fahmida Zahan remains **Lab Assistant / STAFF**; confirm official spelling with the department before renaming her.

AI is inside Student Tools. The assistant cannot read private Drive files from filenames. Without a configured personal API key it uses a built-in reference search. The old Gemini 2.0 endpoint was retired; this release uses `gemini-3.8-flash`, following [Google's model lifecycle documentation](https://ai.google.dev/gemini-api/docs/deprecations/). Personal AI API calls and current account quota were not live-tested because no API credential was supplied. A configured key is visible to the browser running that call; do not share an owner's secret through public portal settings. Model availability and costs depend on the provider account.

## Reproduce the checks

```sh
npm ci --ignore-scripts
npm run check
npm test
python -m unittest discover -s tests -p 'test_*.py' -v
```

See `acceptance_report.md` for exactly what was and was not verified. Passing a finite regression suite is not proof that every possible problem is absent.
