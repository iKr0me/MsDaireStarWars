# Build Ms. Daire’s Galaxy of Good Wishes

**Current implementation update (October 13):** Continue the existing `website/` app. The latest user direction replaces the open-cockpit hero with `r2d2_starwars_fanart.glb` and Coruscant with `planet_of_phoenix.glb`; no added atmosphere shell. Older cockpit/Coruscant directions below are historical and superseded. Use green chase bolts, evasive TIE flight, darker stars and shading, damped R2 spin reactions, steep bold yellow crawls, shorter reversible hyperspace crossings, and a centered final stop. Force Theme is now supplied locally. Do not fetch extra media without organizer approval.

The reader stays heart-shaped. The composer is a clearly labeled delivery preview; real Supabase saving, screening and approval remain to implement. Read `website/TASKS.md` and `website/SETUP.md` before proceeding.

Updated October 13, 2026. Open the **root of the extracted complete kit** in Cursor. Create a fresh **Vite + vanilla JavaScript + Three.js + GSAP** application in its `website/` subfolder. Read [START-HERE.md](START-HERE.md) and [MORNING-CHECKLIST.md](MORNING-CHECKLIST.md) for the starting workflow. This brief supersedes earlier instructions: messages allow **400 characters including spaces**, and the central experience is an interactive space scene with a personal collection of previously read notes.

The untouched Roo prototype is in `reference/roo-prototype/`. Inspect it for the palette, paper styling, and other useful visual ideas, but replace its page structure and interaction logic. Do not load its old `script.js` or `config.js` into the new application: they depend on the removed droids, fixed note grid, and automatic final-surprise scroll. Do not modify the original Desktop project. Keep the new app modular without introducing React or Next.js. If `website/` already contains working code from this build, inspect and improve it without overwriting progress.

Use one main editing agent and build one complete interaction before the remaining features. Cursor should copy the selected model files from `3D_Models/` into `website/public/models/` and configure the supplied audio from `audio/`; the user does not need to move individual assets manually. Keep original asset masters, source credit records, prompts, and the reference prototype outside the deployed app; copy the required runtime assets and visible attribution into the app. Git may track the kit root; configure Vercel's Root Directory as `website`, with all runtime files and dependencies contained there. Document local commands run from `website/`, including the distinction between the frontend demo and the server-backed mode.

This is a caring gift for **Ms. Daire** from people who care about her. Anyone may contribute; contributors are not limited to students. Use inclusive words such as “sender,” “visitor,” and “your name” throughout. The website is public: anyone may read approved notes and see their attached approved photos. Every submission must undergo automatic text screening and then be approved by me or another authorized organizer. Ms. Daire should not have to moderate it.

## Visual direction and implementation

Create a cinematic, polished, intergalactic Star Wars experience with warm, charming artwork and convincing space motion. Include R2-D2, the Millennium Falcon, the Death Star, X-wings, TIE fighters, and Coruscant. Omit C-3PO, Leia, Darth Vader, and all holographic cameos. Keep it affectionate and peaceful, with occasional distant chases rather than a chaotic combat game.

Use the supplied GLB models as the actual scene artwork in one Three.js renderer. Keep lighting, color treatment, and scale coherent across the different creators’ models. Do not replace them with generic robot drawings or flat moving icons. An asset manifest must document each file, its source/license, and its role. Static images are loading/rendering-failure fallbacks; preserve their proportions. Report missing assets explicitly, and keep any temporary placeholders out of the final scene.

Use the user-selected Sketchfab assets in the kit's `3D_Models` folder. Cursor must copy the following six scene files to `website/public/models`, keeping their filenames:

| File from `3D_Models` | Role |
| --- | --- |
| `stylized_x-_wing_open_cockpit.glb` | Main interactive X-wing with R2 and the canopy open |
| `stylized_x-_wing_without_r2d2.glb` | Separate chase X-wing with the original closed canopy and no R2 |
| `millennium_falcon.glb` | Pickup animation after a submission is saved |
| `tie_fighter_-_star_wars.glb` | Occasional distant chase craft; reuse copies |
| `death_star_-_star_wars.glb` | Distant background Death Star |
| `coruscant.glb` | Planet cropped into the bottom-right of the scene |

The untouched `stylized_x-_wing.glb` is retained as the source reference; do not load it alongside both variants unless needed. The obsolete procedural pack has been archived outside this kit. Preserve the supplied `3D_Models/CREDITS.md` and `asset-manifest.json`, record the credits in `ASSETS.md`, and expose the required model attribution in the finished website. Metadata lists creator licenses, including noncommercial labels on Coruscant, the Death Star, and the TIE fighter; do not claim that any download is an official Star Wars asset or grants blanket rights to the franchise.

Inspect each model's hierarchy, scale, orientation, texture behavior, and bounds before placing it. These assets come from different creators and do not share a promised nose direction or scale. Normalize each once through its own wrapper while preserving the source hierarchy. In the open-cockpit hero variant, preserve `R2_HEAD`, `R2_NOTE_ORIGIN`, and `XWING_CANOPY_PIVOT`; check their actual transforms in the supplied model README before animating them. Use the note-origin node's current world position as the heart launch anchor and project it into screen coordinates. Report a missing node rather than silently substituting an arbitrary ship position. In Vite, load `/models/stylized_x-_wing_open_cockpit.glb`, etc.; browser URLs omit `website/public`. Use the separate no-R2 variant for X-wing chases. Flight animations are implemented in the website, not supplied as animation clips.

Build the new app with Vite and maintainable vanilla JavaScript modules for scene assets, flights, scroll chapters, the reader state machine, forms, collection, audio, and data adapters. Use GSAP timelines and ScrollTrigger for coordinated motion and reversible scroll transitions. Use CSS perspective/transforms for the crawl and paper folding. Install dependencies in `website/`; do not add a second frontend framework.

Use one lightweight Three.js renderer for the ships, planet, stars, and hyperspace, with semantic HTML/CSS above it for every message, form, collection, and control. Preserve the supplied open-canopy hero model and the separate closed-canopy/no-R2 chase model. The first complete demo slice should use the selected models from the start; do not spend a separate stage building substitute 2D ships.

Reuse loaded geometry and textures for distant ships, cap mobile rendering resolution, pause rendering in hidden tabs, and provide static fallbacks if model loading or rendering fails. Optimize deployment copies only after measuring performance; preserve original assets and avoid unnecessary destructive texture compression. Keep an accessible HTML button aligned with the hero ship/R2, using his projected world position and a generous hit area. Avoid heavy full-scene effects. A background video is not the implementation for the interactive ships or reversible chapters.

## Chapter 1: opening crawl and hyperspace

Start with very large text, broken into these lines:

TO MS. DAIRE,

FROM A GALAXY

FAR, FAR AWAY…

Use the recognizable **Star Wars opening-crawl** treatment: warm yellow lettering, strong perspective, and an upward vanishing point. Use a supplied, appropriately licensed crawl-style font, with a close fallback if unavailable; do not confuse the logo lettering with the crawl typeface or claim an exact font when it is not available.

As the visitor scrolls down, the words move upward and shrink into the distance. Tie this to scroll progress, not a timer. Keep the initial greeting readable. Add subtle “Scroll to begin” and “Skip intro” controls.

At the end of the crawl, create a brief hyperspace transition: stars stretch into directional streaks and resolve into the next scene. Avoid flashing. Make this a reversible scroll-driven timeline. Scrolling upward travels through the same transition back to the intro; reversing direction mid-transition smoothly reverses the existing timeline instead of starting a second animation. It must work on every deliberate crossing, not only the first visit, without duplicating sounds, listeners, or UI state.

## Chapter 2: the interactive Coruscant scene

Use a viewport-filling scene that remains available indefinitely while the visitor stays in this chapter. Allow deliberate scrolling onward to the farewell, with a small “Scroll for a final message” cue. Do not automatically advance or require reading every note first. Pause chapter scrolling while a note or form is open, then restore it when closed. Do not trap the visitor in a long sequence of forced scroll gestures.

Coruscant’s curved planetary edge enters from outside the bottom-right corner and occupies approximately a quarter of the visible screen, with subtle city lights and an atmospheric rim. The intended “30–60–90 triangle” refers to the corner composition, not a literal triangular planet.

Use a coherent scene with distant stars, restrained nebulae, and a small Death Star. Add occasional X-wing/TIE-fighter chases behind the interactive content, using different curved paths, gentle banking, smooth acceleration, and believable shrinking into the distance. One distant group every roughly 20–35 seconds is a starting point; make timing configurable. Decorative objects must not intercept clicks.

### R2-D2 and controls

Use `stylized_x-_wing_open_cockpit.glb` for R2-D2 in his astromech socket behind the cockpit. The pilot seat is empty and the cockpit canopy is open. Preserve this deliberately whimsical arrangement; do not insert a pilot or place a separate floating R2 beside the ship.

Keep this X-wing distinct from decorative chase ships. Animate it along a slow, smooth, bounded curve through **X, Y, and Z**: it travels gently deeper into the scene and nearer again, with modest banking and orientation changes following its path. This must be real 3D movement, not just left-to-right motion or a scale tween. Keep its visible range and depth changes restrained so R2 remains large enough and easy to select, including on phones. Visually indicate R2 as the target while making the whole nearby X-wing/R2 area a generous, keyboard-accessible button.

Place “Press R2-D2” at the top center. In a separate top-left stack, place “Write a note” above a clickable “Notes collected: 0” control. Use a subtle chevron or heart icon and a visible focus/hover state so the collection control looks interactive. Prevent these controls from overlapping at smaller sizes. Include a sound toggle elsewhere.

On an accepted R2 press while the reader is idle, play exactly one short effect if effects are enabled. Use `audio/audio-manifest.json`: copy `droid-option-1.mp3`, `droid-option-2.mp3`, and fallback `droid-chirp.wav` into `website/public/audio/`. Alternate the two configured MP3s across accepted requests. They are included creator-synthesized CC0 droid effects, not authentic film recordings or the supplied YouTube clips. Preserve their provenance. Allow replacing those configured files later with permitted authentic clips without changing reader logic. Ignored presses while busy must not play sounds, advance effect selection, or queue future sounds. A failed audio play must never block the letter interaction. Collection reopens do not play R2 audio.

### Background music and sound controls

The exact music reference is “Star Wars - The Force Suite (Theme)” at https://www.youtube.com/watch?v=eb2zuegwcwk. The two R2 listening references are https://www.youtube.com/watch?v=nGv66dtTcls and https://www.youtube.com/watch?v=FubhREQm5Pc. They are documented in `audio/REFERENCES.md`; their exact recordings are not included in this kit.

Use one shared background audio player with the configuration in `audio/audio-manifest.json`. Its music source is intentionally `null` until the user supplies a recording they may use on the public website. When supplied, copy it to `website/public/audio/force-theme.mp3` and set the source to `/audio/force-theme.mp3`. Until then, make no missing-file requests and omit the nonfunctional Enable music control. Complete the visual experience and effects independently. Do not invent an audio file, claim that the exact theme is supplied, extract the linked YouTube recordings, hide a YouTube iframe, or silently replace the tune. A visible YouTube embed is a separate design choice and is not requested for the galaxy. Build and test the player with a clearly labeled development test asset if necessary; do not ship that test tune as the Force Theme.

When a music source is configured, offer a small optional Enable music control from the opening scene; do not add a mandatory splash screen or interfere with scrolling. Start audible playback from a deliberate click/tap, handle rejected play promises, and keep the experience functional silently. Once enabled, loop the supplied music at a low background volume (about 15% is an adjustable starting point) throughout the crawl, scene, and farewell. Keep one player across chapters so scrolling in either direction does not restart it or create overlapping tracks. Provide separate music and sound-effects toggles plus music volume. Remember preferences, but handle fresh-page autoplay restrictions. Pause when the page is hidden and resume only if it was playing and the visitor has not muted it. Test the recording's end/start boundary; do not promise a seamless loop when it has silence, fades, or incompatible musical endpoints. Document file replacement and provenance in ASSETS.md.

### Heart-letter animation

The fully open note must retain a heart-shaped paper silhouette; place readable text inside its broad middle and the sender toward the lower point. Do not turn it into a rectangular card. Use internal scrolling for longer messages on small screens. Use one reusable HTML/CSS heart-letter component, with SVG or CSS shapes for the heart silhouette, a pale pink paper edge, and two folding halves. CSS perspective and 3D transforms provide tumbling and folding; no additional GLB heart model or image with baked-in text is required. Populate its message, sender name, and approved photo from the selected database record. Keep the message as real selectable, accessible HTML text rendered safely as plain text. Attach the readable content to the paper interior and reveal it as the halves open; reset the component between notes. Use the same component for collection reopens.

Acquire the next approved note before beginning its reveal. **At the actual moment of release**, update the hero's world matrices, read `R2_NOTE_ORIGIN`'s current world position, and clone that position as the flight start. Do not capture it at page load or keep the launched heart attached to the moving ship.

Compute a graceful curved trajectory from that captured 3D point toward a camera-facing reading position. Project the trajectory through the current camera each frame to position the reusable HTML/CSS folded heart, deriving its scale from depth while adding gentle tumbling with CSS perspective transforms. The heart travels independently after release, settles front-facing, then opens like a book around a visible central fold. Match the flight's ending position and size to the reading layout so there is no visible jump. Handle a resize during flight without losing the letter. This approach does not require an extra heart GLB or text baked into a texture. A shadow and paper texture should make it feel tactile.

The open note should occupy about half the viewport width on desktop: approximately one quarter empty on each side, with a sensible maximum width. On phones use approximately 90% width so up to 400 characters remain readable. Adapt height to the message; do not cut off text or use tiny type. Allow internal scrolling when a small screen requires it.

Show the sender's message, name, and optional approved portrait, with a modest photo area. Use readable typography. The paper is opaque; the surrounding background remains fully visible with **no blur, no dark scrim, and no dimming**. The note gently bobs a few pixels on a slow 6–10 second cycle. Stop tumbling once it opens. Keep ambient motion restrained while reading.

At the bottom of the note, show subtle but readable “Tap to close letter.” Tapping the paper closes it, except while selecting text or scrolling its content. Also include an explicit close button and Escape support. The halves fold shut, then the heart slowly drifts down and out of view. Restore focus to the originating control: R2 for a new draw, or the selected collection heart for a reopened note. Re-enable interaction afterward.

Allow only one form, note reader, or collection panel to be active at a time. Implement the reader states idle → loading → flying → opening → reading → closing → departing → idle. Acquire a synchronous interaction lock on the first accepted R2 press, before awaiting data or starting animation. Ignore every additional pointer, touch, or keyboard activation until the current heart is fully closed AND has finished departing. Do not enqueue another draw, replay a beep, advance the shuffle, fetch another note, or change the counter on ignored input. Enforce this in the shared handler as well as disabled/aria-disabled controls; CSS pointer blocking alone is insufficient. Apply the same lock to collection reopens and keep Write a note unavailable while a reader is active. A close request must be idempotent. Count a newly read note only once after completed closing/departure, then release the lock and restore focus. Error, empty-result, canceled-animation, and reduced-motion paths must settle safely and unlock without marking an unread note collected. Never leave the site stuck busy.

### Selection and collected count

Use immutable database note IDs, not names or message text, and a shuffled unread queue for R2. Show every currently approved note once before automatic repeats. After completing a cycle, reshuffle; when there is more than one note, avoid immediately repeating the last note across the cycle boundary. Newly approved notes that have never been read take priority over repeats. Two different notes from one sender are distinct notes; editing or reapproving the same ID does not create a new collected note.

Maintain separate state for R2's current shuffle cycle and lifetime unique notes collected on this browser. Count a note once, after its first completed reading/close. Reopening from the collection, opening the collection panel, rereading an R2 repeat, and sending a note must never increment the counter or reset the unique count.

Display a single lifetime count, such as “Notes collected: 24,” without a changing total denominator. After all 24 notes are read, it stays at 24 through every repeat. If a new note is approved, optionally show a small separate “1 new note” indicator; the collected count stays 24 until that new note is actually read and closed, then becomes 25. Pending submissions do not affect either signal.

Store only stable reading IDs, collection timestamps, and shuffle progress locally, not message text/photos as a permanent offline cache. The database remains the shared content source. Progress is per browser/device; cross-device progress sync is not required. Storage failure must not break the reader; fall back to session progress.

Refresh the approved list when entering or returning to the scene, on tab focus, and periodically while idle. Insert newly approved notes into the unread pool before repeats; reconcile removed/unpublished notes. Do not change an open note mid-reading. Define zero-note and one-note behavior. With no approved notes, show a warm invitation to write the first one; never pass sample notes off as real submissions.

### Clickable collection of read notes

Clicking “Notes collected” toggles a small panel anchored beneath it at the top-left. Use an opaque, softly styled paper surface with no backdrop blur, scrim, or dimming. Show a compact grid of folded pink heart thumbnails with the sender's name beneath each one. Include only notes this visitor has already collected. Each heart uses its note ID, so multiple notes from the same person remain separately selectable. Add a short preview or date in its accessible label to distinguish them.

Sort by most recently collected first. Wrap long names, constrain panel height, and allow scrolling within it. Use progressive rendering for large collections. Before any notes are collected, show “Your collected notes will appear here.” On narrow screens, retain the top-left anchor but allow a wider compact panel with safe margins; it must not cover the whole screen unnecessarily.

Clicking a heart reopens that specific approved note in the same full-size reader with a shorter expansion from the thumbnail. Do not replay the entire R2 launch or R2 sound. Hide the collection panel while reading; restore it, its scroll position, and keyboard focus to the selected heart when the letter closes. Deliberate collection rereads are allowed whenever the reader is idle and must not advance, reshuffle, or reset R2's queue.

Close the panel with its control, an explicit close button, Escape, or an outside click. An outside click that dismisses it must not also activate the X-wing or another underlying action. Confine wheel/touch scrolling to the panel while browsing; restore ordinary page scrolling on close. Opening the form dismisses the collection cleanly. Preserve state during resize and reverse chapter navigation.

Recheck availability before reopening a note. If it was unpublished or deleted, remove its thumbnail and cached display data, show a gentle unavailable message, and never serve a locally cached copy. Keep the historical collected ID so it cannot be counted again if reapproved. The lifetime counter remains unchanged even if a previously collected note becomes unavailable; if needed, explain inside the panel that some previously collected notes are no longer available. This is an intentional lifetime-count policy.

## Writing a note and the Falcon delivery

“Write a note” opens a centered paper-style form over the still-visible scene, again with no background blur or dimming. Make underlying controls inactive while the form is open without changing the scene’s appearance. Support keyboard focus, Escape, and an explicit close control.

Fields:

- Message: required, maximum **400 characters including spaces and line breaks**. Show a subtle but accessible counter at the textarea’s bottom-right, such as “138 / 400.” Count visible Unicode characters consistently on client and server using grapheme segmentation; reject whitespace-only submissions. Preserve internal spaces and newlines. Never silently truncate.
- Name: required, 1–30 visible characters; label it “First name or nickname.” Names are self-entered, not verified identities. Screen this field as well as the message.
- Photo: optional portrait upload with preview, replace, and remove controls. Accept JPEG, PNG, and WebP up to 5 MB; explain unsupported formats rather than failing silently. Add simple cropping if practical. Convert to a small, sanitized display image and remove embedded metadata on the server.

Place a clear notice: “Approved notes, names, and photos can be seen by anyone who visits this website. Use a first name or nickname and leave out private information.” If a photo is attached, require a checkbox confirming permission to share it publicly. Do not require a photo, an account, or student status.

The Send button is at the form’s bottom-right. It becomes visually active when required fields are valid and any selected photo is valid. It submits **only when pressed**, not automatically when the form becomes valid.

Submission sequence: validate → identify the anonymous browser and check its quota/idempotency → upload and validate any photo → screen the name and message → atomically save the complete submission as pending review within its quota → server confirms persistence → play the Falcon delivery. No Turnstile or CAPTCHA setup is required.

During processing, disable Send synchronously and show a clear busy state. Generate one idempotency key per logical draft submission and retain it through double clicks, refreshes, timeouts, and retries of that same payload. Enforce a database uniqueness constraint scoped to the anonymous sender and key; store a payload hash and reject key reuse with different contents. A retry after a successful save returns the existing receipt and never inserts another note, charges another quota slot, reruns moderation, or uploads another photo. Look up existing successful receipts before rejecting a retry for exhausted quota. New or edited submissions receive a new key; never discard the old uncertain receipt without reconciliation. Also suppress identical name/message/photo submissions from the same anonymous browser within a short documented window, initially 10 minutes, while allowing the same text from different senders. Play the Falcon success animation once per confirmed logical submission. On failure, preserve the draft, explain how to retry, and do not play a success animation.

After confirmed saving, the Millennium Falcon enters large from the **right**, crosses in front of the writing panel, and appears to collect it. The panel disappears as the ship passes over it. The Falcon continues toward the **left and deeper into space**, smoothly shrinking until it vanishes. Use a curved path with believable banking; the ship should not look like an icon sliding horizontally.

Display “Delivered for review. Your note will appear once approved.” Clear the draft only after saved success. Finish in the normal interactive scene so the visitor can read more notes or write another. This delivery does not increment Notes collected. If an animation fails, still display the accurate saved status and unlock the UI.

## Chapter 3: farewell

Deliberately scrolling beyond the interactive chapter triggers a second brief hyperspace transition, then another perspective crawl with these lines:

THANK YOU,

WITH MUCH LOVE,

WE HOPE YOU

RECOVER SOON!

End with the farewell text alone: no student-specific sign-off and no return button. Visitors return by scrolling upward naturally. The second hyperspace transition must reverse smoothly back into the Coruscant scene; continued upward scrolling reverses the first transition back to the opening crawl. Preserve the note collection, counter, and shuffle progress throughout. A mid-transition change of scroll direction must reverse the same timeline without stacking animations. Scroll animations must never resubmit a form, replay a successful delivery, or change collection counts.

## Backend, moderation, and administration

Use Vercel Functions for API routes; Supabase Postgres for shared notes and persistent quota/idempotency records; Supabase Storage for photos; the Supabase Dashboard for organizer review; and OpenAI’s Moderation API with `omni-moderation-latest` for text and sender-name screening. Omit Cloudflare Turnstile, CAPTCHA widgets, their dependencies, keys, and setup. Version one has no custom /admin page, website login, Supabase Auth integration, or admin-user allowlist. The organizer signs into their Supabase account directly.

The site is public to read and open to contributions from anyone. Do not add a class passcode. Only approved notes and approved attached photos are public. Automatic screening is not a complete appropriateness check: every submission remains pending until an organizer approves it. Flagged text should be marked prominently for the organizer in the private review queue; it must never reach the public reader before an explicit approval. Photos receive human review too. Do not send uploaded photos to an AI provider merely because text moderation is enabled.

Make manual review practical in Supabase's Table Editor. Use a notes table with status constrained to pending, approved, or rejected, defaulting to pending. Include sender_name, message, created_at, a separate moderation_status, and the optional processed photo's storage path. Store detailed screening metadata privately. Document how the organizer filters pending rows, reviews full text and the corresponding private file in Storage, changes status, and saves. Returning an approved row to pending unpublishes it. False-positive text flags can be explicitly overridden by the organizer after review; record the original screening result. Enforce publishing conditions with database constraints and/or triggers that also run on ordinary Table Editor updates, not solely in the public API. Record distinct screening states such as pending, passed, flagged, and failed. Approval requires completed screening; a flagged result additionally requires a separate explicit organizer override that retains the original flag. Failed/pending screening and unfinished or failed processing of an attached photo must block an approved status until resolved. Document the exact override field and dashboard steps; changing status alone must not bypass these conditions. Flagged submissions must never auto-publish. Public submission code must always create pending records and must not accept a client-supplied approval status.

Enforce server-side validation and response/body limits. Use database row-level security and grants to prevent public writes, pending-note reads, and approval bypasses. Serve public note data through endpoints that explicitly filter approved status and return only necessary fields. Render messages as plain text, never HTML. Public endpoints must not expose moderation details, uploader metadata, or pending counts. Send `Cache-Control: no-store` for note-list/detail APIs, approved-photo URL issuance, and submission/quota/receipt APIs; bypass framework/CDN caching for these endpoints and do not put their responses into a service-worker cache. Static GLB/audio assets may use normal asset caching. Recheck current approval whenever a note or photo URL is requested so an unpublish is reflected on the next retrieval; an already-issued short-lived image URL can remain usable until expiry.

Use private storage for all uploaded photos. Authorize upload sessions on the server and issue scoped signed upload URLs with server-chosen random paths, no overwrites, and bounded lifetime. Upload the original directly from the browser to the authorized Supabase path, avoiding a large Vercel function request body. Configure the bucket's enforced maximum object size to match the form's 5 MB limit and restrict allowed MIME types; a signed URL alone is not a substitute for these bucket limits. Bind the uploaded object to its submission so someone cannot attach another user's photo.

Verify actual decoded contents, dimensions, and byte size server-side; do not trust filename, extension, or browser MIME type. Before decoding large pixel buffers, enforce image-decoder limits, initially at most 12 million pixels and 6,000 pixels on either edge, and reject animated/multipage images for this portrait field. Also bound decoded memory/processing time. Explain rejections and retain the written draft. Re-encode a small static portrait with metadata removed, record successful processing privately, and expose only approved processed images through controlled short-lived URLs. Pending/rejected images and unreviewed originals must not be retrievable publicly. Clean up failed/abandoned uploads.

Public approved images can be saved by visitors; private storage does not make approved display private. Delete associated stored photos when their note is deleted, and document cleanup for abandoned uploads and rejected submissions. Keep signed display URL lifetimes short and handle expired URLs gracefully.

Enforce a maximum of FIVE successfully saved notes per anonymous browser identity in a ROLLING 24-HOUR window, measured with server time. Use a server-issued signed anonymous identifier in a Secure, HttpOnly, SameSite cookie in production, with an appropriate local-development configuration. Store quota records in Supabase, not just localStorage or per-function memory. Do not use the submitted name as identity. This is a practical browser-based limit, not verified per-person enforcement; clearing cookies or switching browsers/devices can bypass it. Document that limitation without adding accounts or invasive fingerprinting.

Count every successfully saved submission regardless of whether it is later approved, rejected, unpublished, or deleted. Keep the quota ledger independently of note deletion for the necessary window. Failed validation, failed saves, and idempotent retries do not consume another slot. On the sixth submission, return HTTP 429 with an accurate retry time/Retry-After and friendly copy such as “You’ve sent 5 notes in the last 24 hours. You can send another at [local time].” Preserve the draft. Reading notes remains unlimited. Use database transactions/locking and uniqueness guarantees so simultaneous requests or tabs cannot save a sixth note. Use bounded expiring reservations where needed to avoid concurrent expensive work; release failed reservations reliably. The final write must enforce the quota atomically. Add separate modest server-side burst and upload-attempt limits so failed requests cannot run moderation/uploads without bound. Allow students sharing a school IP to each have their browser quota; do not apply the five-note cap to the entire network. Keep raw IPs and message/photo contents out of unnecessary logs.

If moderation or storage is unavailable, do not publish or claim successful delivery. Keep the draft retryable. Keep all privileged keys server-side and out of public config, browser code, Git, and logs.

## Delivery and verification

Work through complete stages: asset inventory and structure; visual chapters and motion; note/form state; persistent backend and moderation; Supabase Table Editor review; responsive/accessibility work; end-to-end verification. Use labeled development fixtures only for preview and keep them out of the production database.

### Isolated classroom demonstration

Provide a separate local/static demo build or clearly separated development mode with a persistent “Demo — sample messages” label, invented sender names, fixed sample notes, and a Reset demo control. Reset restores its sample queue/count. Keep fixtures, simulated saves, and simulated review results out of the production database and public recipient experience. Demo submissions must explicitly say they are simulated and do not send a real note. The demo should run with local artwork/fonts and no production credentials so the presentation can continue if the school network is unavailable.

Use the real note reader, collection, and animation code with a separate fixture data adapter; do not duplicate the whole product. Demo timing and note order may be deterministic for rehearsal. The production adapter must always validate, screen, save pending, and require organizer approval. A query parameter or browser switch must never bypass production moderation or authorization. Do not ship a mock approval endpoint in production. Production backend secrets remain server-side; none are needed by the isolated demo. If showing offline moderation examples, label them as simulated rather than claiming the classifier actually ran.

Document separate demo and real-service startup/build commands and verify that the production build cannot use the fixture adapter accidentally. See the companion `Hackathon-Build-and-Cost-Plan.md` for the staged teaching and budget workflow. Demo quota/approval results must be clearly identified as simulated.

Create migrations, API routes, storage policies, a Supabase review walkthrough, `.env.example`, `.gitignore`, `ASSETS.md`, and `SETUP.md` inside `website/`, with a root ignore file if Git is initialized at the kit root. Document exact environment names, where to obtain values, local commands, Supabase setup, Table Editor approval/rejection/unpublishing, private-photo review and cleanup, anonymous-cookie signing secrets, rolling quota/idempotency behavior, audio-file placement, and Vercel settings. Document how the website refreshes approved notes after a dashboard edit. Provide placeholders rather than asking me to paste secrets into chat. If credentials or assets are missing, finish independent work and identify what remains unverified without faking success.

Test both functional behavior and visual quality. Verify the 400/401-character boundary including spaces and emoji; moderation flags/timeouts; duplicate clicks and retries; photo validation; pending-photo privacy; visitor attempts to read pending rows or change approval status; actual persistence from another browser after approval; all-notes-before-repeat; a counter that stays fixed through repeats and changes only after a new unique note is read; manual collection rereads that leave R2's queue unchanged; new-note arrival; deletion/unpublishing and reapproval; duplicate sender names; empty and large collections; zero and one approved note; interrupted/reversed scroll transitions; small screens and the mobile keyboard; reduced motion; keyboard navigation; focus restoration; scroll restoration; and 3D loading/rendering failures where applicable.

Also verify that ordinary Table Editor edits cannot approve failed/pending screening or unfinished photos, flagged text requires an explicit organizer override, unpublishing is reflected by uncached note APIs, and oversize or excessive-pixel uploads are rejected before expensive processing. Verify five accepted saves and rejection of a sixth within a rolling 24 hours; expiry using server time; concurrent-tab quota enforcement; a previously saved retry succeeding without charging another slot even at the limit; failed saves releasing reservations; and duplicate Falcon suppression. Rapidly press R2 during every reader state and confirm one note, one accepted sound, no queued draw, and unlock only after departure. Test text/name/photo changes on the reusable heart, music/effect controls, blocked or missing audio, tab visibility, and one continuous looping music player across reverse scrolling.

Reduced-motion mode must keep the entire experience usable with static layouts and short fades instead of crawling, hyperspace streaks, tumbling, or flybys. Include Skip intro, sound controls, and a pause-animation control. Pause background work when the tab is hidden. Keep semantic HTML controls above decorative canvases and images. No missing assets, console errors, or stuck overlays.

Inspect actual browser screenshots at desktop and phone sizes and verify the real flows. If browser access is unavailable, say so. Prepare the project for Vercel with Root Directory `website`, the app build command, and output directory documented explicitly. Keep source assets and the reference prototype outside the deployment. Do not describe it as deployed or fully connected until those actions have actually succeeded.
