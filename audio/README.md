# Audio for the build

## Included and ready to copy

| File | What it is |
| --- | --- |
| `droid-option-1.mp3` | Short, synthesized retro droid chirp by OwlStorm; CC0 |
| `droid-option-2.mp3` | Short, synthesized droid whistle by OwlStorm; CC0 |
| `droid-chirp.wav` | The earlier original synthesized fallback; its Python generator is included |
| `audio-manifest.json` | File paths, volumes, provenance, checksums, and the empty music slot |
| `preview.html` | Simple local player to compare the included effects |
| `REFERENCES.md` | Your exact YouTube references, their checked titles, and the alternative sound sources |

The two MP3s are the creator's published high-quality previews, downloaded from the links on the CC0 Freesound pages. They are usable local assets, but they are **not authentic R2 recordings or the selected YouTube clips**. Original WAV downloads from that creator require a Freesound login. Keeping these source details with the project makes the distinction clear.

Cursor should copy the three included audio files to `website/public/audio/` and use `audio-manifest.json` as the configuration source. Play exactly one selected clip per accepted R2 request, alternating between the two options. Busy presses and collection reopens stay silent. Retain the WAV as a fallback. Effects have a separate toggle from music, and a sound failure must never prevent a note from opening.

## Exact Force Theme still needed

The music reference is **Star Wars - The Force Suite (Theme)** by Jorah the Andal: <https://www.youtube.com/watch?v=eb2zuegwcwk>. Its recording is not included. The manifest's music source is deliberately `null`, so there is no fake file, broken music request, or unrelated replacement song.

When you have a permitted audio file, place it at `website/public/audio/force-theme.mp3` and set the configured music source to `/audio/force-theme.mp3`. Keep it disabled until a visitor chooses Enable music. One shared player should loop quietly across all chapters; check the actual end/start boundary before calling the loop seamless.

A visible YouTube player is an alternative if you choose that design, but the current brief does not add it to the galaxy. YouTube links are listening references, not direct audio sources, and a hidden/covered video player is not the background-music implementation. See `REFERENCES.md` for the official player documentation.

No audio API subscription is needed to play the included local effects. Nothing in this folder configures a cloud account.
