# Selected models for Ms. Daire’s Galaxy

This folder contains your five original Sketchfab GLB downloads and two edited versions of `stylized_x-_wing.glb`. The originals are preserved. Use these selected models for the new website; the obsolete procedural pack has been archived outside this kit.

## Which file goes where

| File from `3D_Models` | Role |
| --- | --- |
| `stylized_x-_wing_open_cockpit.glb` | Main interactive X-wing with R2 and the canopy open |
| `stylized_x-_wing_without_r2d2.glb` | Separate chase X-wing with the original closed canopy and no R2 |
| `millennium_falcon.glb` | Pickup animation after a submission is saved |
| `tie_fighter_-_star_wars.glb` | Occasional distant chase craft; reuse copies |
| `death_star_-_star_wars.glb` | Distant background Death Star |
| `coruscant.glb` | Planet cropped into the bottom-right of the scene |

The untouched `stylized_x-_wing.glb` is the source reference. You do not need to load all three X-wing versions in the website. Cursor copies the six scene files above into `website/public/models` and keeps their filenames; you do not need to move them yourself. For a setup that serves `public` at the site root, the hero URL is `/models/stylized_x-_wing_open_cockpit.glb`.

Give Cursor this README, `CREDITS.md`, and `asset-manifest.json` along with the main website brief. Copy the credit details into `ASSETS.md` and include a visible credits link on the website. The embedded author/license/source details are recorded as supplied; they have not been independently reverified online.

## X-wing variants

- **Open cockpit:** retains R2, with the canopy lifted and independently addressable, plus a simple empty cockpit lining, seat, and dashboard. Use this for the main note interaction.
- **Without R2:** removes the exposed R2 dome, retaining the original astromech socket and closed-canopy pose. Use this for the separate X-wing chasing TIE fighters.

The hero variant includes these integration nodes. Coordinates below are in each node's local parent space, not world space:

| Node | Role and initial transform |
| --- | --- |
| `XWING_CANOPY_PIVOT` | Hinge under `Main`, at `[0, -3.6759, 1.2783]`, with an initial **local X rotation of −55°** |
| `R2_HEAD` | Pivot for the original exposed R2 dome, at `[0, -2.843005, 1.327547]`; dome yaw uses this node's **local Z axis** |
| `R2_DOME_MESH` | Original dome beneath `R2_HEAD`, with the inverse pivot translation to retain its original position |
| `R2_NOTE_ORIGIN` | Empty marker beneath `R2_HEAD` at local `[0, 0, 0.78]`; use it as the heart's launch point |

Preserve every imported root transform. Store the loaded base rotations before adding animation; avoid resetting rotations to zero or using world Y for the dome merely because the loaded ship appears Y-up. The supplied X-wing appears with world Y up and its nose toward +Z after its imported transforms are applied; this does not establish the other models' conventions.

Use `R2_NOTE_ORIGIN` to obtain R2's current world position after the ship transforms have been updated, then project that position through the camera for the heart's starting point. Do not hard-code a fixed screen location. The marker does not supply an animation: the website still controls the heart's flight.

## Using the models

The assets come from different creators. Inspect each model's orientation, size, bounds, materials, and texture appearance, then normalize it through a separate application wrapper. No common ship-nose direction or scale is promised. Keep the original hierarchy inside the wrapper so the named hero nodes continue to work.

No flight animations are bundled in the five original downloads. The website must animate the ships' positions and banking along 3D curves, keeping the hero easy to click. Reuse loaded geometry and textures for distant copies. The GLBs include their textures; the Death Star and TIE also declare `KHR_materials_emissive_strength`, which the chosen loader must support.

The five originals total about 18.1 MB. A smaller download does not by itself mean a lightweight scene: inspect triangle counts, textures, and phone performance. Keep unmodified masters and make separate deployment copies if optimizing later. Prepare a static image fallback from the selected models after the scene's camera and lighting are set.

To edit these selected assets further in Blender, import the relevant GLB. The original X-wing and reproduction script remain in this folder.

## Reproducing these two edits

`make_xwing_variants.py` uses Python's standard library and the included `xwing-edit-selections.json` with the untouched `stylized_x-_wing.glb`. Run the script to rebuild both variant files in this folder. It preserves the embedded texture bytes and original creator metadata while adding a modification notice. Keep a copy of any later manual edits before rerunning it, because it replaces the two variant outputs.

## Preview and verification

Open `3D_Models/viewer/index.html` through a local development server serving the complete kit folder. The viewer includes its own local Three.js libraries and license; no account or remote download is needed. Drag to orbit, scroll to zoom, and choose any of the seven files. It is an asset inspector, not the finished website.

Both edited X-wings were loaded and visually inspected in Three.js. The Khronos glTF validator reported **zero errors and zero warnings** for the original and both variants. Its informational notices identify the intentional empty note-launch marker and the retained original index accessor. See `VERIFICATION.md`.
