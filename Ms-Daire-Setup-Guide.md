# Ms. Daire’s Galaxy — setup guide

> **Current saved-notes implementation — October 14, 2026**
>
> Continue the existing `website/` application. Saved-note API routes, a Supabase SQL setup, private photo storage, and organizer approval are now implemented locally; real saving still requires your Supabase project and private settings. No live Supabase connection or deployment has been verified yet.
>
> Current screening uses local automatic rules followed by organizer approval in the Supabase Table Editor. Flagged text additionally requires a separate explicit `moderation_override = true`; the original flags remain recorded. No OpenAI API account or key is required for this implementation.
>
> [website/SUPABASE-SETUP.md](website/SUPABASE-SETUP.md) and [website/DEPLOY.md](website/DEPLOY.md) are the authoritative setup and deployment instructions. They supersede older demo-only status, OpenAI-only moderation plans, credential lists, and from-scratch build steps below. Use `npm run dev` for unlimited demo previews and `npm run dev:live` for real saved notes after setup. Preserve the existing scene and animations.

## Earlier planning notes (historical)

Updated October 13, 2026. Begin with [START-HERE.md](START-HERE.md) and [MORNING-CHECKLIST.md](MORNING-CHECKLIST.md). Open the **root folder of the extracted complete kit** in Cursor. The companion `Cursor-Prompt-Ms-Daire.md` directs Cursor to create a fresh Vite + vanilla JavaScript + Three.js + GSAP app in `website/`. This guide explains services and deployment. `Hackathon-Build-and-Cost-Plan.md` adds the build sequence, budget choices, and classroom presentation plan.

For the complete tool/asset inventory and first Cursor session, read `Resources-and-Cursor-Guide.md`.

## Decisions already made

- Anyone may contribute, including people who are not students. Anyone visiting the site may read approved notes and see their approved attached photos.
- Automatic text screening is followed by organizer approval. Ms. Daire does not need to administer the site.
- Messages have a 400-character limit including spaces; the earlier 150-character limit is replaced.
- Photos are optional. Names use a first name or nickname.
- Notes are shared across devices. The “Notes collected” count is personal to each browser and increases only after reading a new unique note, never after a repeat.
- Clicking “Notes collected” opens a small top-left collection of heart thumbnails with sender names. Collected notes can be reopened directly without affecting R2's shuffled order.
- Intro → hyperspace → Coruscant/notes → hyperspace → farewell. Scrolling upward naturally reverses both hyperspace transitions.
- The farewell has no student sign-off and no return button. C-3PO, Leia, Darth Vader, and holographic cameos are omitted.
- The selected approach is one Three.js scene using the supplied GLBs, with HTML/CSS notes and controls above it. Static image fallbacks handle rendering failure; no React rewrite is needed.

## Choose the coding tool and model

Use the **Codex extension inside Cursor**, which is already set up for this project. Use ChatGPT sign-in to use the included Codex allowance; API-key sign-in uses separate API billing. You do not need Cursor Pro or OpenRouter credits for this coding workflow. Included usage is limited, so watch your allowance instead of assuming unlimited building. [Official authentication guidance](https://learn.chatgpt.com/docs/auth).

Start with **GPT-6.1 Sol · Medium** if available in your Codex model picker. Use **High** for a difficult animation/state bug or database permissions review. For small, clear edits, Luna is an optional lower-usage choice. Avoid Max/Ultra for every task, and keep one main editing agent. These are practical recommendations; actual availability and usage depend on your account and client. [Model guidance](https://learn.chatgpt.com/docs/models).

For club members, the verified student offer is **$100 in Codex credits**, subject to student verification, for current university students studying and residing in the United States or Canada. Credits expire 12 months after the grant and are not API credits. Do not promise universal free ChatGPT Plus. Students can apply with a Free, Go, Plus, or Pro account. [Official student offer](https://developers.openai.com/community/students).

The coding account is separate from the website's Supabase settings. Current text screening needs no moderation API key. Students should enter service secrets privately.

## Before you begin

Have these ready before asking the agent to run the project:

1. Cursor installed and one working coding-agent/model setup selected.
2. The extracted complete kit, with `reference/roo-prototype/` preserved for reference. The original Desktop project stays untouched; Cursor can initialize Git at the kit root.
3. A supported [Node.js LTS release](https://nodejs.org/en/download) with its package manager, plus Git. Ask the agent to check existing installations before installing anything. You do not need to preinstall Three.js or GSAP yourself; the agent adds project dependencies.
4. The supplied root prompt, `3D_Models/`, and `audio/` folders kept together. Cursor copies the needed runtime assets into `website/public/`; you do not need to move files individually.
5. A browser for desktop checks and an actual phone for final touch/performance checks.

For the current live submission/review system, Supabase setup and Vercel deployment settings are required; an OpenAI API account is not needed, but you can build the visual scene before those accounts are connected. No custom domain, Blender installation, or special MCP connection is required to start. Blender is optional for editing model geometry. The supplied X-wing already has an empty cockpit.

## 1. Open the kit and keep the prototype as a reference

Extract the complete kit into a normal working folder, then use Cursor → File → Open Folder to open that **root folder**. You should see `START-HERE.md`, `Cursor-Prompt-Ms-Daire.md`, `3D_Models/`, `audio/`, and `reference/`. Do not open only a document or the old Desktop HTML file.

The Roo prototype in `reference/roo-prototype/` contains four static files: `index.html`, `styles.css`, `script.js`, and `config.js`. Its palette, paper-heart shape, and atmosphere are useful references, but its fixed note grid and droid handlers do not implement the new experience. Cursor should create the app cleanly in `website/`, without loading that old script or configuration. The original Desktop folder remains unchanged.

Use one main Cursor agent. Attach the root implementation prompt and the starting checklist. Cursor should inspect the kit, check Node.js/Git, create the new app, and record a Git checkpoint. On later sessions it should continue the working `website/` code rather than scaffold over it.

## 2. Add the supplied models and optional supporting artwork

The supplied `3D_Models` folder contains your five original Sketchfab downloads and two edited X-wing variants. **Cursor copies** these six scene files into `website/public/models`; you keep the kit folders together. The untouched original X-wing remains a source reference outside the deployed app, along with scripts, credits, and model viewers.

| File from `3D_Models` | Role |
| --- | --- |
| `stylized_x-_wing_open_cockpit.glb` | Main interactive X-wing with R2 and the canopy open |
| `stylized_x-_wing_without_r2d2.glb` | Separate chase X-wing with the original closed canopy and no R2 |
| `millennium_falcon.glb` | Pickup animation after a submission is saved |
| `tie_fighter_-_star_wars.glb` | Occasional distant chase craft; reuse copies |
| `death_star_-_star_wars.glb` | Distant background Death Star |
| `coruscant.glb` | Planet cropped into the bottom-right of the scene |

Give Cursor `3D_Models/README.md`, `CREDITS.md`, and `asset-manifest.json` along with the main prompt. Preserve the creator credits in the project's `ASSETS.md` and include the required attribution on the website. The metadata records different creator licenses; several have noncommercial labels. Use the selected GLBs in `3D_Models`; the obsolete procedural models and React example have been archived outside this working kit.

Ask Cursor to inspect each model's own orientation, scale, and bounds before building motion; do not assume a common nose direction. The open-cockpit variant exposes `R2_HEAD`, `R2_NOTE_ORIGIN`, and `XWING_CANOPY_PIVOT`. Preserve them, read their transform notes in the model README, and launch the heart from the note-origin node's current world position projected onto the screen. Keep the cockpit empty and open in the hero variant, and use the closed-canopy/no-R2 variant for distant chases. Lighting, camera placement, flight animation, and phone testing still determine the finished scene's quality.

The `website/public/models` folder is for public artwork, never secrets. Vite serves these files at `/models`, so browser URLs omit `website/public`. Keep all deployable runtime assets inside `website/`. Three.js provides a [glTF loader](https://threejs.org/docs/pages/GLTFLoader.html).

The kit includes two CC0 synthesized droid-style effects, `audio/droid-option-1.mp3` and `audio/droid-option-2.mp3`, plus the earlier `droid-chirp.wav` fallback. Cursor copies them into `website/public/audio` and configures them from `audio/audio-manifest.json`; you can compare them in `audio/preview.html`. They are not the authentic R2 clips from your references. The requested Force Suite recording is still needed as a permitted local audio file; its manifest source stays null meanwhile. When provided, Cursor adds one quiet looping player with a user-initiated Enable music control and separate effects/music controls. Do not substitute a hidden YouTube player. Additional optional assets are a permitted crawl-style font and individual model poster renders. See `Audio-and-Heart-Notes.md` and `audio/REFERENCES.md`.

Use 3D beneath HTML/CSS paper notes, forms, collection, and controls. Reuse models for distant ships, keep a static fallback for rendering failure, and inspect the real result on a phone. Supplied geometry saves asset preparation; it does not remove the need for camera, lighting, motion, and performance work.

## 3. Start Cursor on the build

Attach the root prompt, then send:

> Read START-HERE.md, MORNING-CHECKLIST.md, and Cursor-Prompt-Ms-Daire.md in this kit. Use one main agent. Inspect reference/roo-prototype for visual ideas, then create a fresh Vite + vanilla JavaScript + Three.js + GSAP app in website/. Preserve the reference files and original Desktop project. Copy the six selected GLBs from 3D_Models to website/public/models and configure the supplied audio according to audio's instructions. First build a clearly labeled demo slice: Coruscant scene → R2's X-wing moves gently through real depth → press R2 → a heart launches from his current marker and opens → close it → count once → reopen it from Notes collected without changing the count or shuffle. Do not add React or connect production services yet. Inspect the running result, document startup commands, and save a Git checkpoint. Tell me what works and what needs review.

Review that first slice, then continue with the writing/Falcon flow, reversible intro/farewell, and real backend in the complete prompt. These stages preserve all final requirements; they organize the work so motion and readability can be inspected early. Use real browser motion checks as well as screenshots. The first demo uses invented notes and no production keys.

For teaching, ask Cursor to provide a separate local/static demo with a visible “Demo — sample messages” banner, invented names, predictable note order, and a Reset demo control. Simulated submissions and review results must be labeled as simulations. The demo uses no production credentials and writes nothing to the real database. It should reuse the real visual/interaction code through a separate fixture data adapter. A browser flag must never turn off production moderation. Follow `Hackathon-Build-and-Cost-Plan.md` to rehearse this alongside a genuine submit → approve → read demonstration.

## 4. Create the connected services

You do not need a special Cursor plugin or MCP connection. The website connects to services using the keys Cursor’s setup guide requests.

| Service | Purpose | Your setup task |
| --- | --- | --- |
| Vercel | Hosts the website and backend routes | Create/sign in to an account; later import the project |
| Supabase | Notes database, photo storage, dashboard-based approval | Create one project, run the generated migrations, and review submissions in its dashboard |
| OpenAI API | Automatic text screening | Create an API project/key with access to moderation |

Start at [Vercel](https://vercel.com/), [Supabase](https://supabase.com/), and [OpenAI API](https://platform.openai.com/).

OpenAI documents its standalone moderation endpoint as free, subject to account access and rate limits. This does not mean every other part of hosting/storage is unlimited or free. Check each service’s current plan during account setup. [OpenAI moderation documentation](https://developers.openai.com/api/docs/guides/moderation).

## 5. Configure Supabase and review notes

Follow the generated `website/SETUP.md` in order. For a new, dedicated Supabase project, apply the generated SQL migrations and create the private photo bucket with its restrictions. You will use your existing Supabase dashboard account to review notes. No custom /admin page, application-level Supabase Auth user, or administrator allowlist is needed for version one.

The generated notes table should have a status field accepting pending, approved, and rejected, with pending as the default. Screening results and optional photo paths should be visible to you in the dashboard and protected from public access. Cursor must document the exact field names it creates.

Your review routine:

1. Sign into Supabase, open this project, then Table Editor → notes.
2. Filter status to pending. Read the sender name, complete message, and screening result.
3. If a photo is attached, open its stored path in the project's private Storage bucket and inspect it before approval.
4. If completed screening flagged harmless text, use the documented organizer override field after reviewing it; preserve the original screening result. Change status to approved or rejected and save. Failed/pending screening or unfinished photo processing must prevent approval. To unpublish an approved note, change it back to pending.
5. Verify that the website's next approved-note refresh reflects the change. Note APIs and photo-URL issuance must use no-store responses so cached results do not hide the edit. The app must handle short-lived image URL expiry and must never expose pending or rejected photos.

Approvals are manual dashboard edits. Automatic text screening alone does not publish anything. Database permissions and server validation must prevent visitors from approving their own notes or reading the pending queue. Database constraints/triggers must enforce the publication conditions even when status is changed in Table Editor. Completed but flagged text requires the documented explicit organizer override; failed or pending screening and unfinished/failed photo processing block approval until resolved. Dashboard access belongs only to trusted project organizers.

Use private storage even though approved photos will eventually be publicly viewable. Private storage keeps unapproved uploads from becoming publicly accessible before review. Approved display URLs must be issued by the app only after approval. [Supabase storage access models](https://supabase.com/docs/guides/storage/buckets/fundamentals).

The brief asks for direct, authorized uploads to storage. The private bucket must enforce the 5 MB limit and allowed image types; the server must also enforce decoded-image limits before processing, initially 12 million pixels and 6,000 pixels on either edge. This avoids routing large original photos through Vercel’s function request body. Supabase provides [signed upload URLs](https://supabase.com/docs/reference/javascript/storage-from-createsigneduploadurl), and Vercel documents its [function payload limits](https://vercel.com/docs/functions/limitations).

## 6. Enter credentials privately

Cursor must generate an `.env.example` and document the exact names its code uses. Typical names are:

| Example name | Source and visibility |
| --- | --- |
| `SUPABASE_URL` | Your project URL; not a secret |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase’s publishable key; intended for public/client use with access policies |
| `SUPABASE_SECRET_KEY` | Privileged Supabase key; server only |
| `OPENAI_API_KEY` | OpenAI API project key; server only |
| `ANON_COOKIE_SECRET` | Random server-only secret for signing the anonymous browser identity |
| `RATE_LIMIT_HASH_SECRET` | Random server secret if the implementation uses privacy-preserving rate-limit identifiers |
| `SITE_URL` | Local or deployed origin, as documented by the implementation |

These names are a guide, not a substitute for the generated setup file. Public variables may use a build-tool prefix. Never add that prefix to privileged keys.

Put local values in the ignored environment file named by Cursor. Add production values in the Vercel project’s environment settings, then deploy/redeploy so they take effect. Keep secret values out of chat, screenshots, the public assets folder, and Git. Vercel supports environment-specific values; do not point an unrestricted preview at the live notes database. [Vercel environment variables](https://vercel.com/docs/environment-variables).

## 7. Test locally before inviting contributors

Use the local startup commands in `website/SETUP.md`, from the `website/` directory. The frontend demo command and the server-backed development command must be distinguished; opening an HTML file directly will not test the backend. Test the server-enforced browser quota and retry protection locally before production.

Test with a few clearly labeled test submissions:

1. Submit a note without a photo. The Falcon flies only after saving is confirmed, and the site says it was sent for review.
2. Open another browser. The unapproved note must not be visible.
3. Open Supabase Table Editor → notes, review the row, set status to approved, save, and confirm it appears in the other browser’s R2 sequence.
4. Repeat with a photo and check that neither the pending note nor its image is public before approval.
5. Test a message at 400 characters and another at 401, including spaces and emoji.
6. Double-click Send and retry after a network interruption. There must not be duplicate submissions or a false success animation.
7. Read all approved notes. None should repeat automatically until the cycle finishes; rereading must not increase the unique collected count.
8. Click Notes collected, reopen a specific heart, and confirm its sender/message match. The counter and R2 queue must remain unchanged. Test two different notes with the same sender name.
9. Approve a new note. The counter stays unchanged until that note is read and closed, and R2 should offer it before repeats.
10. Check the phone layout, keyboard operation, sound toggle, reduced motion, and both hyperspace transitions in both scroll directions. Reverse direction midway through a transition too.
11. Delete/unpublish a test note and verify it disappears from R2's selection and the collection. Its historical collected ID stays recorded, so the lifetime counter does not decrease and reapproval does not count it twice. A previously issued photo link may remain usable until its short expiry; a visitor who downloaded an approved photo can retain it.
12. Test the 3D scene on a slow phone, simulate a failed model load, and check the image fallback. The messages and form must remain usable if rendering fails.
13. Check the labeled demo runs without production keys or a live backend, and Reset demo restores its sample collection. Check the production build cannot accidentally use mock approvals or fixture content.

## 8. Deploy on Vercel

Ask Cursor to prepare a clean Git repository at the kit root with secrets excluded. If you use GitHub, create a private repository and push the kit there. In Vercel, import that repository and set **Root Directory to `website`**. Keep app dependencies, runtime assets, and API routes inside that directory. A private code repository can still produce a public website.

Use the Vite build command, output directory, and framework preset documented by Cursor in `website/SETUP.md`; for a standard Vite setup these are `npm run build` and `dist`. Vercel documents [Git-based deployment](https://vercel.com/docs/git).

Add production environment values and deploy. There are no website login redirects to configure in this version. Update `SITE_URL` if needed and redeploy.

Open the final link in a signed-out/private browser, and repeat the submit → approve → read test there. Make sure the production website is accessible without a Vercel team login; preview deployments can have different protection settings.

## 9. Collect the notes, then share with Ms. Daire

Remove test submissions. Share the production link with classmates, colleagues, friends, family, and anyone else you want to invite. Explain that submitted names and optional approved photos will be public. Review submissions as they arrive. After a useful collection has been approved, share the same link with Ms. Daire so the experience contains real letters when she visits.

## Design clarifications and tradeoffs

- The requested effect is the Star Wars opening crawl, not the normal end-credit roll. Its font is also different from the familiar Star Wars logo font.
- Coruscant is a curved planet clipped into the bottom-right corner; the triangle description defines composition, not its literal outline.
- A 50%-wide note works on desktop, but the phone version needs more width for 400 characters.
- The Falcon sends only after Send is clicked and the server confirms a saved pending submission. “Sent” does not mean “approved.”
- The extra characters/cameos and student-specific farewell are removed. Visitors return by scrolling upward, with both hyperspace sequences working in reverse.
- An empty X-wing with its canopy open in space is a deliberate fantasy detail. It can stay exactly as requested.
- Public photos can be downloaded or reshared. Optional photos, a public-visibility notice, a permission checkbox, and organizer review are included; a nickname/no-photo note remains a complete contribution.
- Automatic text moderation can miss context and flag harmless text. Organizer review is the final publishing decision, with a private correction path for false positives.
- Message storage is shared; collection progress is per browser. If Ms. Daire changes devices, the letters remain available but her personal read counter starts fresh.
- The collection is for already-read notes, not an alternate list of unread ones. Manual rereading never advances R2's sequence. A lifetime counter may exceed visible hearts if previously collected notes are later unpublished; the collection should explain unavailable notes gently.
- The production assets determine much of the final visual quality. Animation cannot make mismatched or low-quality images look like a coherent scene.

## My critique and priorities

- The strongest feature is the personal letter delivery. Protect its legibility and pacing: make chase ships infrequent and reduce their activity while a letter is open.
- R2 must be easy to tap. Restrict the hero ship's drift and use a larger invisible hit area. Free-floating movement across the whole screen would make the main interaction frustrating.
- The collection makes rereading much better. Keep its first version compact; add search by sender later only if the note count makes browsing difficult.
- Repeated long animations can become tiring. Keep collection reopens short, retain Skip intro, and support reduced motion. Backward scrolling should feel natural rather than replaying a forced cinematic.
- Use an opaque paper surface with readable text. Leaving space visible around the note does not require making the message itself translucent.
- 3D is most valuable for the ships' banking, lighting, and retreat into depth. It adds model preparation and phone-performance work. Start with the main X-wing and Falcon, then expand only if the device tests remain smooth.
- A polished product is feasible, but a single prompt/model choice does not ensure it. Real assets, several visual iterations, working persistence, correct moderation access, and tests on a real phone determine whether it feels finished.

## Latest interaction, submission, and audio requirements

- Cloudflare Turnstile and CAPTCHA are omitted; no account, widget, or keys are needed for them.
- Allow five successfully saved notes per anonymous browser identity in a rolling 24 hours. Enforce this atomically in Supabase using a server-issued signed cookie. This is not a verified per-person limit: clearing cookies or changing browsers/devices can bypass it. Never apply the five-note cap to a whole school network. Failed saves and duplicate retries do not use another quota slot; saved notes keep counting even if later rejected or deleted.
- Persist idempotency keys and return the existing saved receipt on retries. Disable Send while processing; prevent duplicate saves and duplicate Falcon success animations. Keep separate burst/upload limits for failed requests.
- Lock R2 synchronously on the first accepted press. Ignore later presses and sounds throughout loading, flight, opening, reading, closing, and departure. Unlock only when the current heart has fully closed and left. Collection reopens use the same lock.
- Hearts use reusable HTML/CSS/SVG paper shapes with perspective transforms. Insert each selected record's message, sender name, and optional approved photo as live content. No heart model or separately generated letter image is required.
- Use the two included CC0 droid-style MP3 options through `audio/audio-manifest.json`, with the original WAV as a fallback. These are substitutes, not the selected YouTube recordings. Keep the music source null until a permitted Force Theme file is supplied; no broken requests or hidden YouTube player. Configured music starts from Enable music, loops through one shared player, and has controls separate from effects. See `Audio-and-Heart-Notes.md` and `audio/REFERENCES.md`.
- Test the sixth submission, exact rolling-window expiry, parallel requests, duplicate retries after quota exhaustion, rapid R2 presses in every state, reduced-motion closing, audio unavailable/blocked, and looping without overlapping players.
