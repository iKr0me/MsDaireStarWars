# Ms. Daire’s Galaxy — first working slice

This stage implements the local, clearly labeled sample-note experience and the opening/galaxy/farewell journey. It does not submit real notes or connect to Supabase yet.

## Start

From this `website/` folder:

```sh
npm install
npm run dev
```

Open the local URL printed in the terminal. On this machine it is currently http://127.0.0.1:5173/.

The development server uses the isolated demo adapter. Six invented notes are marked as samples. Each browser stores its own collected IDs and shuffle progress. Reset demo clears only that demo progress.

## What to try

1. Scroll through the opening crawl and hyperspace. Press R2’s highlighted target in the galaxy. A short included droid effect plays and a paper heart travels from the droid’s current note anchor.
2. Press again during flight, opening, reading, closing, or departure. These presses do nothing.
3. Read the message and close it with the close button, Escape, or a stationary tap on the paper. Selecting message text does not close it.
4. Wait for the heart to depart. The collected count increases only for a new note.
5. Open Notes collected and reopen a specific heart. This leaves the R2 shuffle and count unchanged.
6. Read all six. Repeat reads leave the count at six, and the next shuffle avoids immediately repeating the previous last note.
7. Refresh: only IDs, collection timestamps, and shuffle progress are saved. Message text stays in the data adapter.
8. Check sound off, pause ambient motion, keyboard controls, reduced motion, a narrow screen, and the renderer-failure fallback.

## Builds

```sh
npm test
npm run build:demo
npm run build
```

`build:demo` produces `dist-demo/`, with visible sample labels and a separate fixture module. It is for rehearsal.

`build` produces `dist/`, with the fixture adapter compiled out. Until the real API adapter is implemented, it shows an unconnected preview and no sample notes. Never deploy the rehearsal build as Ms. Daire’s real note collection.

All runtime models/audio are local. No external background images, fonts, media, or hidden YouTube players are used. The absent Force Suite file is not requested.

## Files

- `src/scene.js`: model loading, normalization wrappers, camera, bounded XYZ flight, note-launch projection, and visibility handling.
- `src/notebook.js`: synchronous reader lock, legal state transitions, shuffle cycles, unique count, and persistence.
- `src/reader.js`: paper flight, opening, reading, closing/departure, safe text insertion, and focus.
- `src/main.js`: accessible controls and collection panel.
- `src/data.js` / `src/demo-data.js`: data boundary and isolated fixtures.
- `src/audio.js` / `src/audio-config.json`: included effects and their source records.
- `ASSETS.md`: model creators and adaptation notices. Audio creators are recorded in the config and parent kit.

## Next stages

The note-writing/Falcon flow, optional photos, real submission endpoints, Supabase storage/moderation/approval, quota/idempotency, and deployment remain to be implemented. No production secrets are needed for this first slice.

Vercel’s Root Directory will be `website` when the repository root is the complete kit. Real local API testing will require a server-backed command; Vite alone currently serves this frontend demo.

## Verification status

The nine collection/state/chapter tests and both builds pass. Production fixture exclusion and asset-copy integrity are checked. Browser verification has not run: the browser permission system blocks the local URL through a saved preference, even after chat approval. The scene’s final framing, animation continuity, and phone appearance still need inspection.

## Screenshot-guided changes

The open reader now keeps a heart outline, with its live HTML message inside the wide middle and its sender near the point. Longer text scrolls inside the message area. The page adds reversible opening and farewell crawls, two scroll-controlled hyperspace sequences, and distant TIE/X-wing chases using the supplied models. Coruscant is framed farther into the bottom-right corner. The gallery and read progress survive chapter changes; an active note/gallery locks page scrolling.

Refresh http://127.0.0.1:5173/ to review. Test reversing midway through both warp transitions, scrolling back from the farewell, a heart open on a phone, and rereading after returning to the galaxy. These visual changes need user screenshot feedback because browser access remains blocked.

## October 13 visual revision and composer preview

The active scene uses `r2d2_starwars_fanart.glb` and `planet_of_phoenix.glb`, copied from the organizer’s downloaded kit. Original GLBs are preserved. Phoenix has no added atmosphere sphere. The standalone droid has a measured launch marker attached near its dome, depth drift and damped flyby spins. The chase now lasts about 3.6 seconds and uses pooled green bolts, evasive TIE rolls and increasing camera distance. Crawl lettering uses local bold Arial-compatible fonts and a steep perspective; an exact reference font file has not been supplied.

The Force Theme is included as `public/audio/force-theme.mp3`. Press the music button to start it; sound effects have a separate control. Music survives chapter changes and pauses while the tab is hidden.

Write a note supports a 400-grapheme counter including spaces, a name, and an optional JPG/PNG/WebP photo up to 5 MB with public-sharing consent. In the local demo, Preview delivery plays a Falcon flyby and stores only a fingerprint/time ledger for duplicate protection only; the preview count limit has been removed for testing. It DOES NOT save or publish a real note, moderate text, upload a photo, or simulate organizer approval. The production Send button stays disabled until the real service is connected. This client preview protection is not server security.

Remaining implementation: Supabase tables/private photo storage, server-side text/name screening, organizer approval, an approved-only read endpoint, atomic quota/idempotency enforcement and genuine pending-submission receipts.

Builds and automated state/validation tests pass. Browser verification remains unavailable under the saved browser permission setting; use new screenshots/recordings to assess framing, model orientation, typography and motion. Phoenix is a 51.5 MB source GLB, so mobile download and GPU memory still need performance review.

## Latest screenshot revisions

Hyperspace renders independently randomized tapered ribbons with white cores, blue glow and a dark central opening; the previous polar-pattern shader and line overlay were removed. HUD and chapter prompts hide during the crossing. The composer uses black/navy panels, cyan accents and a local Trebuchet/Arial humanist sans stack following the cyan title-card reference. This is an approximate font match without a supplied font file.

Chase X-wing span is 1.6 world units and TIE span is 0.85 (Death Star span is 3), with the path receding to 260 units. Paired lasers are spaced at least 1.35 seconds apart and limited to the middle of a flyby. Phoenix rotates at 0.012 radians/sec (about nine minutes per full turn). R2 bobs with a 15-second period and 0.7-unit amplitude. Pause and reduced-motion settings stop this motion. New visual confirmation remains pending.

## R2, reader and hyperspace corrections

R2’s ambient clock now runs at its normal gentle speed while reading; note input stays locked until departure. The target follows a separate measured chest marker, while hearts still launch from the dome. Accepted R2 presses flash a small red indicator twice (a brief steady indication for reduced motion). Flyby spin speed ramps through a smooth envelope and eases down rather than jumping instantly.

TIE evasion is a shallow, gradual climb with modest banking and a heading that follows the climbing path. Flights alternate between right-to-left departures and an opposite pass ending behind the Phoenix planet, where the normal depth buffer occludes distant craft.

The heart now remains solid during flight and reveals its text on arrival without the folding-cover opening sequence. It remains heart-shaped and gently bobs while readable. Hyperspace ribbon winding was reversed to face the camera; DoubleSide is enabled as a guard against orientation changes. This addresses the invisible-streak regression shown in the supplied capture. Visual confirmation of the new changes is pending user screenshots.

## Plasma pickup and staged warp

Hyperspace now separates an initial eased starfield push-in from the bright streak window, followed by a zoom-out into the next chapter. Reversing the scroll reverses those stages. Streak length increased slightly again. The journey state test checks that stars zoom before streaks and settle after them.

The composer has a translucent dark backdrop that intercepts clicks without blurring the galaxy. Collection controls and gallery now share its cyan sans-serif design. A valid demo preview collapses the form into a glowing plasma orb; the Falcon crosses that exact screen position before the orb disappears. It banks to the left and returns toward the right while receding. Motion pause and reduced motion skip the pickup choreography. Actual shared submission remains unconnected.

R2’s head and eye meshes have a separate pivot preserving their source transforms; occasional smooth glances compensate for body orientation to face the viewer, interspersed with wandering turns. The light and note-origin marker follow that head pivot; the click target remains on the body. Visual confirmation of the new choreography remains pending screenshots.

## Audio choice, five-stage warp and drawn flight course

A first-load audio dialog offers Keep off (outlined cyan, left) and Turn on (filled cyan, right). It locks the page until a choice, and music starts only from the Turn on gesture. Music and effects can still be controlled afterward. The note eyebrow, With love salutation and Skip intro button were removed.

Both transitions have 1.15 viewport units of scroll travel, split into star zoom-in, sparse streak buildup, dense long streaks, deceleration, and star zoom-out. Intro zoom starts while the crawl is still visible near the top quarter. Scene 2 eases from a smaller presentation to normal during arrival. Farewell moves up and recedes on the same steep crawl plane as the opening while stopping at a readable final composition. Reversal and reduced-motion behavior remain supported.

R2’s head uses a fixed angular step rate (0.8 radians/sec), facing generally forward most of the time, occasionally glancing aside, or looking toward active flyby craft before returning forward. The composer only blurs through its own translucent panel; there is no full-screen blur. It contracts as a whole into the pickup orb.

The Falcon path follows the supplied drawing: pickup from the right, up-left sweep, broad bend to the right, and final upper-left climb deep into space. A world-up orientation with bank limited to about 26 degrees prevents upside-down flips. The private annotated source screenshot remains in Downloads and is not copied into the publishable repository.

## Falcon visibility and transition correction

Falcon delivery now reuses the main scene renderer instead of allocating a second WebGL context/canvas. Its existing GLB is preloaded; failed loading and animation frames reject with an error and restore the composer rather than silently completing or leaving an orb. Failed previews remove their pending duplicate fingerprint so the same draft can be retried. A CPU smoke run executed the real delivery function with supplied model geometry and a renderer stand-in: one pickup, 444 camera-visible frames and finite bounds throughout, using one renderer. This checks flight geometry/control flow, not GPU pixels. Browser visual confirmation is still pending.

The blue hyperspace backdrop shader was removed completely. White streak widths and bright cores increase at peak intensity. The scene-2 departure now zooms its objects as well as the stars before streak buildup. Farewell opacity fades in and the text travels back along Z with less vertical translation.

## Overlapping transition stages and continuous Falcon timing

Streaks begin alongside the star push-in and peak near 55% of each crossing before fading under the incoming scene. Scene 2’s materials fade away without a visible scale reset. Material opacity/depth-write settings are restored on arrival and support reverse scrolling.

Falcon approach/departure tangents are matched at pickup. Earlier timing used a joined route and gradual acceleration after the first major turn; the October 14 update below supersedes that timing and route.

## October 14 flight and hyperspace refinement

The Falcon now follows three broad connected curves: it sweeps left and upward, bends back to the right, then climbs toward the upper-left as it recedes. The curve is defined in screen space with continuously increasing depth, so the turns stay rounded and the ship shrinks more clearly. It accelerates from launch and gains a stronger speed increase after the second bend. Its blue trail is a soft, transparent ribbon sampled across the actual width of the rear engine section; it remains for 2.2 seconds as the ship departs.

Both hyperspace sequences now start forming streaks with the first part of the star zoom, use 1,900 scattered ribbons with longer blue-white cores and a slight blue edge glow, and blend the incoming scene under the slowing streaks. The second sequence keeps R2 closer to its normal size while it fades away. Both crossings have more scroll travel. The farewell crawl begins lower, with the extra scroll distance carrying the same perspective crawl through its final line.

Production and demo builds pass after these changes. The browser preview remains unavailable under the saved browser permission setting, so the new visuals still need review from the user’s browser or a screenshot. The generated asset samples and trail geometry have not been visually checked on a GPU.

## October 14 Falcon flyby polish

The delivery now starts close to the camera from the lower-right, where the large Falcon crops against the screen edge before crossing the note pickup and continuing left into its existing deep-space curves. Its materials receive slightly darker, rougher shading, and the scene fill light is lower for stronger contrast. The blue wake now fades along its length and lasts longer; small blue-white particles drift away from the engine trail.

When the Falcon crosses the note pickup, R2 gets a gradual spin and a short positional push upward and deeper into the scene. The droid then eases back to its normal bobbing path over several seconds. The demo build succeeds. The browser preview is still unavailable, so exact framing and shading need a visual check from the user.

## October 14 depth and wake refinement

The delivery Falcon now enters nearer the camera on a centered path across the mid-right, making its close pass substantially larger while the following route keeps receding into deep space. Its wake uses saturated neon blue with a broader additive glow and a few sparse, softly flickering blue-white particles. At the pass, R2 is pushed much farther behind the scene and gradually returns to its usual path over about eight seconds, with its spin reaction eased across the event. Review the close-pass crop and the depth of R2 in the local browser; GPU visual review is still unavailable here.
