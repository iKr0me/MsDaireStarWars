# Saved-notes checkpoint — October 14, 2026

The Vercel API, Supabase migration, approval guards, private processed photos, browser quotas, and retry protection are implemented. Account creation and live verification are still pending. Follow [website/SUPABASE-SETUP.md](website/SUPABASE-SETUP.md) and [website/DEPLOY.md](website/DEPLOY.md). The preparation checks below describe earlier stages.

# Final preparation check

## Ready for Cursor

- Five supplied GLBs preserved byte-for-byte, including their embedded textures and creator metadata.
- Two X-wing variants created, visually inspected, and validated with zero glTF errors/warnings: open canopy with R2 and an empty cockpit; closed canopy without R2.
- Model names and roles aligned across the brief and guides. The obsolete procedural pack is archived outside the working kit; the selected model viewer has its own libraries.
- The four Roo prototype files copied unchanged into `reference/roo-prototype/`; the Desktop original remains untouched.
- The build consistently starts as Vite + vanilla JavaScript + Three.js + GSAP in `website/`, with one main Cursor agent.
- Both downloaded CC0 droid MP3s loaded and completed playback in the browser without audio errors (about 0.916 and 0.636 seconds). They are clearly identified as synthesized alternatives.
- Exact YouTube references recorded. Music configuration remains null, with no falsely supplied Force Theme file.
- The main prompt explicitly covers bounded 3D depth movement, release-time heart positioning, the full reader lock, unique-note collection, reversible scrolling, and no removed cameos/sign-off/button.
- Backend instructions include dashboard approval guards at the database level, private photo handling, no-store public note APIs, five notes per browser per rolling 24 hours, and atomic duplicate protection.
- Cursor, Node.js v24.21.0, and Git 2.50.1 were present on the preparation Mac.

## Still to implement or supply

The first local R2-to-heart-note slice is implemented in `website/`. Real cloud services and deployment remain unconnected. The labeled sample-note adapter runs without backend credentials.

Real submissions require the Supabase setup in `website/SUPABASE-SETUP.md`, the supplied database migration, private environment values, and a successful submit → organizer approval → second-browser read test. The implemented rule-based screening needs no OpenAI account or key. Publishing also requires Vercel setup and a deployed check.

The exact Force Suite and exact linked R2 recordings are not bundled. The included droid alternatives are usable; replacing them is optional. The requested music needs a permitted local file before its background loop can work. Its seamlessness and final mix cannot be verified until that recording is supplied.

## Kit cleanup — October 13, 2026

The obsolete procedural model folder and React example have been archived outside the working kit. The selected model viewer now contains its own local Three.js libraries and license. All seven model checksums, both included MP3 checksums, local document links, and viewer import paths were verified after relocation. The guides now use Codex inside Cursor with ChatGPT sign-in and Sol/Medium as the recommended starting point. The exact Force Suite file remains the one missing requested music asset.

## First implementation checkpoint

Built the Vite/Three.js scene, bounded XYZ hero movement, R2 note-origin projection, folded-paper reader, synchronous busy lock through departure, nonrepeating draw cycles, unique collected count, collection rereads, sound/motion controls, reduced-motion paths, and a readable renderer-failure fallback.

Six automated collection/state tests pass. Both production and demo builds pass, and the production build excludes sample-note data. Copied model/audio bytes match the supplied masters. Build output includes a bundle-size advisory for Three.js/GSAP; phone performance needs browser/device testing.

Browser verification is pending: access to http://127.0.0.1:5173 was denied by a saved browser permission preference, including after permission was granted in chat. No visual or browser-flow success is claimed. Re-enable that local preview in browser permission controls before browser verification.

## Screenshot-guided scene checkpoint

The three provided screenshots confirmed the first reader and collection render; their rectangular reader prompted a heart-shaped open paper correction. The open note now retains a heart silhouette with a scrollable central message area. Added opening/farewell crawls, reversible scroll-driven hyperspace, and occasional TIE/X-wing chases. Adjusted Coruscant toward the corner and moved the R2 prompt clear of the ship. No external visual/audio assets were added.

Nine collection/state/chapter tests pass, including reverse chapter mapping and static reduced-motion chapters. Production and demo builds pass. Actual animation and responsive appearance still need user review through screenshots or a recording; browser access remains blocked.
