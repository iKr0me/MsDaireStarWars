# Build, demonstrate, and teach Ms. Daire’s Galaxy

> **Current saved-notes implementation — October 14, 2026**
>
> Continue the existing `website/` application. Saved-note API routes, a Supabase SQL setup, private photo storage, and organizer approval are now implemented locally; real saving still requires your Supabase project and private settings. No live Supabase connection or deployment has been verified yet.
>
> Current screening uses local automatic rules followed by organizer approval in the Supabase Table Editor. Flagged text additionally requires a separate explicit `moderation_override = true`; the original flags remain recorded. No OpenAI API account or key is required for this implementation.
>
> [website/SUPABASE-SETUP.md](website/SUPABASE-SETUP.md) and [website/DEPLOY.md](website/DEPLOY.md) are the authoritative setup and deployment instructions. They supersede older demo-only status, OpenAI-only moderation plans, credential lists, and from-scratch build steps below. Use `npm run dev` for unlimited demo previews and `npm run dev:live` for real saved notes after setup. Preserve the existing scene and animations.

## Earlier planning notes (historical)

Updated October 13, 2026.

Use Cursor to build one working experience at a time. Start with the supplied models and a small set of clearly labeled sample notes, then connect the real moderation and storage. This gives you something useful to demonstrate early without confusing a prototype with the finished public website.

Begin with [START-HERE.md](START-HERE.md) and [MORNING-CHECKLIST.md](MORNING-CHECKLIST.md). Open the extracted kit root in Cursor and build the app in `website/`. The main implementation brief is `Cursor-Prompt-Ms-Daire.md`; account and deployment details are in `Ms-Daire-Setup-Guide.md`. This plan explains the build order, spending choices, and classroom demonstration.

## 1. Set a starting budget

Use Codex inside the Cursor editor with your existing ChatGPT sign-in. No additional Cursor subscription or OpenRouter purchase is needed for this workflow. Codex uses the included account allowance; API-key sign-in uses separate API billing. Check your usage before spending more. [Codex authentication](https://learn.chatgpt.com/docs/auth).

| Item | Sensible starting choice | Limit to remember |
| --- | --- | --- |
| Coding assistant | Codex using existing ChatGPT access or verified student credits | Included usage is limited; extra credits are optional |
| Hosting | Vercel Hobby, if this remains a personal noncommercial project | Usage limits can pause affected services |
| Notes, dashboard approval, photos | Supabase Free | 500 MB database, 1 GB files, 5 GB uncached plus 5 GB cached egress; up to 2 active projects |
| Text screening | OpenAI’s standalone Moderation API | Free endpoint, with account access and rate limits |
| Website address | Included Vercel address | A purchased custom domain is optional |
| Artwork | Supplied editable GLB kit | Final quality still depends on lighting, framing, animation, and testing |

Vercel Hobby is limited to personal, noncommercial use. The teacher gift described here appears to fit that purpose; reassess if the project becomes a commercial service. Its current allowances include 100 GB fast transfer, 1 million function invocations, and 4 active CPU hours. [Vercel Hobby](https://vercel.com/docs/plans/hobby).

Supabase Free can pause projects with low database activity over a week. Check that it is active before the event. The paid Pro tier starts at $25/month if continuous availability later becomes worth the expense. [Supabase pricing](https://supabase.com/pricing) and [pausing rules](https://supabase.com/docs/guides/platform/free-project-pausing).

The standalone moderation endpoint is free; this project does not need a paid text-generation call to screen each note. [OpenAI moderation](https://developers.openai.com/api/docs/guides/moderation).

The initial infrastructure bill may remain $0 within these allowances. That is not a guarantee of unlimited service or a fixed-price build. Extra AI usage, paid asset creation, domains, and upgraded services are separate choices. See the verified Codex student offer in the model-usage section below.

## 2. Prepare the project once

1. Extract the complete kit into a working folder and keep its folders together. The Roo prototype is preserved in `reference/roo-prototype/`; leave the original Desktop project untouched.
2. In Cursor, choose File → Open Folder and open the extracted kit's root folder.
3. Attach the root `Cursor-Prompt-Ms-Daire.md` and `MORNING-CHECKLIST.md` to one main Codex chat.
4. Ask Cursor to check Node.js and Git, inspect the reference, and scaffold a fresh Vite + vanilla JavaScript + Three.js + GSAP app inside `website/`. Reuse visual ideas selectively; do not carry over the old DOM and interaction script or add React.
5. Cursor copies the six selected GLBs from `3D_Models` to `website/public/models`, configures supplied audio from `audio/`, preserves credits, and documents startup commands. You do not need to copy individual assets.
6. Have Cursor create an initial Git checkpoint at the kit root. On later sessions, continue the working app without scaffolding over it.

The selected models are the supplied Sketchfab downloads and the two edited X-wing variants. Preserve and display their creator attribution from `3D_Models/CREDITS.md`; several embedded licenses have noncommercial labels. Inspect each asset's scale and orientation rather than assuming a common nose direction. The open-cockpit X-wing includes `R2_HEAD`, `R2_NOTE_ORIGIN`, and `XWING_CANOPY_PIVOT`; preserve these names and use the model README's transform notes. Use the separate no-R2/closed-canopy X-wing for distant chases. The obsolete procedural pack has been archived outside this working kit.

Put only public artwork in `website/public`. API secrets belong in ignored local environment files and server settings. Keep source/reference files outside `website/` and deploy with Vercel Root Directory `website`. No special Cursor plugin, separate OpenRouter purchase, custom domain, or Blender installation is required to begin.

## 3. Build the first complete interaction

Paste this after attaching the main brief:

> Use the root brief and morning checklist as the source of truth. Inspect the kit and reference/roo-prototype, then create the fresh vanilla Vite app in website/ and copy/configure the supplied assets. Build one complete labeled demo slice: Coruscant scene → R2 drifts through bounded 3D depth → click R2 → a heart launches from his current marker and opens → close it → count once → reopen it from Notes collected without changing the count or R2 queue. Use invented demo notes, preserve the model's named nodes, and keep production services disconnected at this stage. Open the result in a browser, document startup commands, and save a Git checkpoint before the next stage.

Your first review should answer concrete questions: Can you find and tap R2? Is the letter large and readable? Does it originate from R2? Does the counter stay fixed when rereading? Does the collection reopen the exact selected message?

Keep this version even if the lighting is unfinished. A working interaction is a better foundation for visual refinement than a beautiful screenshot with no behavior.

## 4. Add the visual story and delivery

Next ask:

> Add the reversible opening crawl, both hyperspace transitions, and farewell exactly as specified. Finish the note-writing form with the 400-character counter, required name, optional photo preview, and Falcon pickup. In the isolated demo only, label saving as simulated. Keep the public production flow separate. Then refine lighting, camera position, mobile layout, and flight paths using browser screenshots and actual motion checks.

Check that the Falcon enters large from the right, passes over the form, and retreats toward the left and into depth. Its success animation must eventually be tied to confirmed real saving, not merely pressing Send.

Reverse scrolling halfway through each hyperspace transition. Open and close notes repeatedly. Check the phone keyboard. Fix these behaviors before expanding the visual effects. Reuse the provided craft for distant chases and keep them infrequent.

## 5. Connect real notes and organizer approval

Create the accounts described in `Ms-Daire-Setup-Guide.md`, then follow the generated setup file. Enter keys privately. Ask Cursor:

> Implement the real server adapter and Supabase Table Editor review flow from the main brief. Production submissions must pass server validation, the rolling five-note browser quota, duplicate-send protection, and automatic text screening, then be saved pending organizer approval. Photos also require review before public display. Keep fixture data and mock approval completely isolated from production. Verify one note from submission through approval to reading in a second browser. Report any untested credential-dependent step precisely.

Test with a harmless, clearly labeled test note. It should be absent from the public reader until you approve it. Test a photo as well. Verify rejected/unpublished material stays out of the public collection, and delete test submissions before sharing the actual gift.

Also test a 401-character message, repeated Send clicks, a service failure, attempts by visitors to read pending notes or change approval status, and a newly approved note arriving after all older notes have been collected. The live site must not pretend to save successfully when a service fails.

## 6. Spend model usage where it helps

Use one coding agent on the working files at a time. Keep the long brief in the project and request focused changes instead of repeatedly asking for a complete rebuild.

- Start with GPT-6.1 Sol and Medium thinking if available in Codex.
- Use High for a difficult bug, state-machine edge case, or permissions review.
- Luna is an optional choice for small, clear edits; Max and Ultra are unnecessary for routine work.
- Give the exact failing interaction, screenshot, and relevant files when escalating.
- Checkpoint a verified feature in Git and repair specific failures rather than regenerating the whole site.

These are practical assignments, not benchmark guarantees. Watch your Codex allowance. [Model guidance](https://learn.chatgpt.com/docs/models). Eligible university students in the United States and Canada can apply for $100 in Codex credits, valid for 12 months after grant, subject to verification. This is not a universal free-Plus offer and does not include API credits. [Student offer](https://developers.openai.com/community/students).

## 7. Deploy and rehearse both modes

Follow `website/SETUP.md`. If Git tracks the kit root, import that repository into Vercel with **Root Directory `website`**; its runtime must not depend on source files outside that folder. Confirm organizer access to the Supabase project dashboard, and test the final public URL in a signed-out browser. Use a phone on the same network as the presentation when possible.

Keep two clearly differentiated experiences:

| Experience | Purpose | Data and behavior |
| --- | --- | --- |
| Real deployed site | Demonstrates actual persistence and approval | Genuine API calls, real pending/approved status, organizer authorization |
| Isolated classroom demo | Repeatable visual demonstration without network dependencies | Invented notes, visible Demo label, predictable order, simulated sends, Reset demo |

The demo should reuse the real visual code through a fixture adapter, with all required assets stored locally. It must contain no production credentials and must not write to the real database. A URL parameter on the public site must never disable moderation. An offline simulated review result must be described as a simulation.

The isolated demo simulates quotas and approval; label those results and keep the production server safeguards separate.

Before the event, confirm Supabase is active, the production URL is public, the organizer can access the Supabase dashboard, model files load, and reduced motion works. Record a short screen capture as an explicitly identified backup. These steps reduce demo risk; they cannot guarantee that a live network or service will never fail.

## 8. Present it in about four minutes

1. **The purpose:** “I wanted people to send Ms. Daire encouragement in a way she could explore and revisit.”
2. **The experience:** scroll into Coruscant, press R2, read and collect a note, then reopen that same heart from the collection.
3. **The contribution:** write a short note and show the Falcon delivery. State whether this is the real site or the labeled demo.
4. **The engineering:** show how a real submission remains private until an organizer approves it, then appears in another browser. Use a prepared recording if needed, clearly identified as such.
5. **The lesson:** explain that the visual layer, the interaction rules, and the shared data are separate responsibilities. AI helped implement them, while you supplied the design, reviewed behavior, and tested the result.

Avoid creating accounts, installing packages, or projecting secret keys during the presentation. If an event limits prebuilt work, disclose the existing prototype and supplied models according to its rules.

## 9. Teach a smaller version in a workshop

Prepare the running starter and assets beforehand. Building the entire production website from nothing is too much for a short class. A suggested 60–75 minute session is:

| Time | Activity |
| --- | --- |
| 0–10 minutes | Show the finished interaction and identify its states: idle, flying, open, closing |
| 10–25 minutes | Ask Cursor for one small improvement, such as an accessible collection button or character counter |
| 25–40 minutes | Compare the result with the written requirement and fix a visible problem |
| 40–55 minutes | Demonstrate unique-note IDs, persistent storage, and why approval happens on the server |
| 55–65 minutes | Test mobile layout, repeated clicks, and reduced motion |
| Remaining time | Let learners explain one design decision and one failure case they checked |

Use invented fixture notes during exercises. Learners should not need access to real submissions or administrator secrets. The goal is to teach a repeatable process—specify, implement, inspect, test, and improve—not to imply that one prompt removes the need for judgment.

## Latest interaction, submission, and audio requirements

- Cloudflare Turnstile and CAPTCHA are omitted; no account, widget, or keys are needed for them.
- Allow five successfully saved notes per anonymous browser identity in a rolling 24 hours. Enforce this atomically in Supabase using a server-issued signed cookie. This is not a verified per-person limit: clearing cookies or changing browsers/devices can bypass it. Never apply the five-note cap to a whole school network. Failed saves and duplicate retries do not use another quota slot; saved notes keep counting even if later rejected or deleted.
- Persist idempotency keys and return the existing saved receipt on retries. Disable Send while processing; prevent duplicate saves and duplicate Falcon success animations. Keep separate burst/upload limits for failed requests.
- Lock R2 synchronously on the first accepted press. Ignore later presses and sounds throughout loading, flight, opening, reading, closing, and departure. Unlock only when the current heart has fully closed and left. Collection reopens use the same lock.
- Hearts use reusable HTML/CSS/SVG paper shapes with perspective transforms. Insert each selected record's message, sender name, and optional approved photo as live content. No heart model or separately generated letter image is required.
- Use the two included CC0 droid-style MP3 options through `audio/audio-manifest.json`, with the original WAV as a fallback. These are substitutes, not the selected YouTube recordings. Keep the music source null until a permitted Force Theme file is supplied; no broken requests or hidden YouTube player. Configured music starts from Enable music, loops through one shared player, and has controls separate from effects. See `Audio-and-Heart-Notes.md` and `audio/REFERENCES.md`.
- Test the sixth submission, exact rolling-window expiry, parallel requests, duplicate retries after quota exhaustion, rapid R2 presses in every state, reduced-motion closing, audio unavailable/blocked, and looping without overlapping players.
