# Start here — Ms. Daire’s Galaxy

**Current implementation update (October 13):** Continue the existing `website/` app. The latest user direction replaces the open-cockpit hero with `r2d2_starwars_fanart.glb` and Coruscant with `planet_of_phoenix.glb`; no added atmosphere shell. Older cockpit/Coruscant directions below are historical and superseded. Use green chase bolts, evasive TIE flight, darker stars and shading, damped R2 spin reactions, steep bold yellow crawls, shorter reversible hyperspace crossings, and a centered final stop. Force Theme is now supplied locally. Do not fetch extra media without organizer approval.

The reader stays heart-shaped. The composer is a clearly labeled delivery preview; real Supabase saving, screening and approval remain to implement. Read `website/TASKS.md` and `website/SETUP.md` before proceeding.

This kit now includes the first working implementation in `website/`: a local demo with the opening/farewell crawls, reversible hyperspace, the R2-to-heart-note interaction, distant ship chases, collection, and sounds. It has not been connected to real submissions or deployed. Read `website/SETUP.md` for startup and current scope.

## The decision

**Continue the implementation in `website/` inside this kit; do not scaffold over it.** Open the whole extracted kit folder in Cursor. Use the old Roo prototype in `reference/roo-prototype/` only as a visual/code reference. It has no backend or 3D system, and its fixed message cards and automatic ending conflict with the new design. Do not try to preserve its page structure or old interaction script.

Use Codex inside Cursor with Vite, vanilla JavaScript, Three.js, and GSAP. No Roo extension, React migration, special MCP connection, Blender installation, or additional model purchase is necessary. The agent should create `website/`, copy the selected public assets there, and document how to run it.

## What is ready

- The full, revised implementation brief: `Cursor-Prompt-Ms-Daire.md`.
- Your five untouched Sketchfab downloads plus **two edited X-wings** in `3D_Models/`: an open-cockpit hero retaining R2 and a closed-cockpit chase craft without R2. The open model has an empty cabin, a movable canopy, and a named note-launch marker.
- Model credits, asset mapping, a reproducible editing script, and an inspection viewer. Both variants pass glTF validation with zero errors or warnings.
- **Two short usable droid-style MP3 effects** in `audio/`, with source records and a playback preview. They are synthesized alternatives, not authentic recordings from the films or your YouTube links.
- Your exact three YouTube references, preserved in `audio/REFERENCES.md`.
- A disabled-by-default music slot in `audio/audio-manifest.json`, ready for the requested recording when supplied.
- A copy of the old prototype for reference. Its original Desktop folder has not been changed.
- A first message to paste into Cursor, a morning checklist, and service/review setup instructions.

## What you still need

**To start the local visual build:** extract this kit, open it in Cursor, and use your existing coding access. Cursor, Node.js v24.21.0, and Git 2.50.1 were found on this Mac during preparation; ask Cursor to recheck before installing anything. You do not need cloud accounts to see the first scene and sample notes.

**Before testing genuine submissions:** create a dedicated Supabase project, obtain an OpenAI API key with moderation access, and enter the required values privately in the generated local environment file. Let Cursor generate and explain the database migrations and upload policies before applying them.

**Before sharing a live link:** connect the project to Vercel, typically through a private GitHub repository. Set the Vercel Root Directory to `website`. Add server environment values, test submission → Supabase approval → reading in another browser, then remove test notes.

**For the exact Force Theme loop:** supply an audio file you may use on the public website. The YouTube video is a reference, not a bundled MP3. Do not give a YouTube watch URL to an HTML audio element or hide a YouTube player. A visible YouTube embed is a separate design choice; this kit does not add one to the galaxy. The site can be built and used without music meanwhile.

## Read these in order

1. `MORNING-CHECKLIST.md` — the simplest path from opening Cursor to a working first interaction.
2. `FIRST-CURSOR-MESSAGE.md` — copy this into Codex with the main brief attached.
3. `Cursor-Prompt-Ms-Daire.md` — the authoritative product specification.
4. `Ms-Daire-Setup-Guide.md` — accounts, private keys, dashboard approval, and deployment.

The resource and cost guides are supporting references. **Use `3D_Models/` for the selected artwork.** The obsolete procedural model pack has been archived outside this kit, and the new viewer includes its own libraries. Keep planning documents, original source assets, editing scripts, and the Roo prototype outside the public website folder.
