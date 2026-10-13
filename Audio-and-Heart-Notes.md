# Heart notes, sounds, and the latest interaction rules

The Cursor prompt and all setup guides have been updated. These are instructions for the website Cursor will implement; editing the kit does not change the existing prototype automatically.

## How every heart displays a different message

There is one reusable paper-heart design. Cursor builds its silhouette, pink border, folding halves, and shadows with HTML/CSS and, where useful, SVG. The closed heart follows a 3D curve computed from R2’s world position at release; the app projects it into the HTML layer, using perspective scale and tumbling before the readable paper opens. CSS perspective transforms provide the fold. It travels independently after launch instead of remaining attached to the moving ship. A separate Blender/GLB heart model is unnecessary.

When R2 is pressed, the app selects an approved Supabase record and puts that record's message, sender name, and optional approved photo into the heart's interior. These are normal web text and images, not text painted into a 3D model. The same design can therefore display every message without making separate images or models. Text remains selectable and accessible; the layout adapts for up to 400 characters. All user text must be rendered as plain text.

One letter remains active until it has closed and drifted away. Reader states are idle, loading, flying, opening, reading, closing, and departing. The first accepted press locks the shared handler immediately. Every further R2 press is ignored, including sound and queue changes, until the state returns to idle. Reduced-motion and failure paths must release the lock safely.

## Audio files and references

| File in `website/public/audio/` | Role | Included? |
| --- | --- | --- |
| `droid-option-1.mp3` | Short synthesized droid chirp by OwlStorm, CC0 | Yes |
| `droid-option-2.mp3` | Short synthesized droid whistle by OwlStorm, CC0 | Yes |
| `droid-chirp.wav` | Earlier original development fallback | Yes |
| `force-theme.mp3` | The requested Force Suite background recording | No — needs a permitted audio file |

Cursor copies the included files from the kit's `audio/` directory and uses `audio/audio-manifest.json` to configure them. Open `audio/preview.html` to compare the effects. They are creator-generated alternatives, not authentic R2 recordings. The two exact YouTube R2 clips and Force Suite reference, checked titles, sources, and playback constraints are preserved in `audio/REFERENCES.md`.

The music source is deliberately null until a usable recording is supplied. Do not fetch a nonexistent file or show a broken Enable music control. YouTube watch URLs cannot be used as audio-file sources, and a hidden YouTube player is not this site's music implementation. A visible video player changes the design and would be a separate choice. The exact Force Theme is therefore the remaining audio asset, not a blocker for building the scene and notes.

Use one shared music player with looping enabled and a quiet initial volume. It persists across the crawl, scene, farewell, and reverse scrolling. Never create another player on each chapter entry. Once music is configured, provide optional Enable music, on/off and volume controls, and a separate effects toggle. Pause when the tab is hidden; resume only if it was playing and remains enabled. Handle blocked playback without interrupting reading. [MDN autoplay guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay).

Each accepted R2 request plays one selected effect, alternating between the two configured options. Busy presses do nothing, including leaving effect selection unchanged; collection reopens are silent. A missing or blocked effect must never break the reader. Inspect the supplied music's end/start boundary before calling it seamless; a fade-out or silence does not disappear merely because loop is enabled. [MDN audio basics](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Audio_and_video_delivery/Cross-browser_audio_basics).

## Five notes per rolling 24 hours

The intended first version has no visitor accounts. Use a signed browser cookie to recognize the anonymous browser, and enforce its quota on the server with persistent Supabase records. Do not trust a localStorage count or a submitted name.

Count successful saves during the preceding 24 hours, whether the notes are pending, approved, rejected, or later deleted. After five saves, refuse a new sixth submission, preserve the draft, and show the next available sending time. The oldest counted submission ages out after 24 hours; this is not a midnight reset. Reading and rereading are unlimited.

This is a browser-based convenience limit, not proof of identity. Another browser/device or clearing cookies can reset the identity. A strict per-person limit would need an identity mechanism. A school's shared internet address must not make all students share five notes.

## Duplicate-send protection

Disable Send immediately while saving. Keep one stable submission ID through repeated clicks and uncertain retries, and enforce uniqueness in Supabase. A retry returns the existing receipt; it does not create another note, consume another quota slot, or replay the Falcon. Reject reuse of the ID with changed contents. Cursor should also suppress an identical name/message/photo from the same browser within a documented short window, initially ten minutes, without blocking matching messages from different senders.

Enforce the quota and duplicate checks atomically so parallel browser tabs cannot exceed five successful saves. Upload attempts and failed requests need separate modest limits; they should not consume successful-note slots. The prompt includes these implementation and verification requirements.
