# Verification of the X-wing edits

The original and both variants were checked using the Khronos glTF Validator. All three reported **0 errors and 0 warnings**.

The open-cockpit variant has two informational notices: the intentional empty `R2_NOTE_ORIGIN` marker and the retained original index accessor. The no-R2 variant has the retained-index informational notice. Neither is a rendering or format error.

## Geometry changes checked

- The original 124-triangle canopy shell was separated from the body while retaining its UVs and material, then hinged upward by 55 degrees at its rear edge.
- The original 154-triangle R2 dome was retained and given a pivot in the hero variant. A note-launch marker was added above it.
- The exposed hero cockpit received a simple dark lining, empty seat, and dashboard. No pilot was added.
- The second variant removes the 154-triangle R2 dome and keeps the original closed canopy and astromech socket. The underlying hull already covers the socket; the edit does not leave a hole through the ship.
- Original embedded texture bytes and creator/license/source metadata were preserved. Both variants carry modification notices.

## Visual checks

Both variants loaded successfully in the bundled Three.js viewer. Close cockpit and rear views confirmed the raised canopy/empty seat on the hero and the closed canopy/empty socket on the chase craft. The no-R2 edit changes the requested droid only; it does not replace the rest of the ship.

The website's final camera, lighting, hit area, and motion still need implementation and phone testing. The raised canopy may obscure R2 from some camera angles; frame the hero from an angle where R2 remains visible and keep the accessible target generous. The canopy pivot can be adjusted without editing the hull.

All five original downloaded GLBs were compared byte-for-byte with the provided Downloads folder and remain unchanged. Checksums for originals and variants are in `asset-manifest.json`.
