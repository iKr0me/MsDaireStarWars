# Audio references and sources

These are the exact references Sebastian selected. Their titles and creators were checked against YouTube's public metadata on October 12, 2026. The reference recordings themselves are **not bundled in this kit**.

| Role | Reference | Creator | Reported length |
| --- | --- | --- | --- |
| Background music | [Star Wars - The Force Suite (Theme)](https://www.youtube.com/watch?v=eb2zuegwcwk) | Jorah the Andal | 4:35 |
| R2 sound reference 1 | [R2D2 beep](https://www.youtube.com/watch?v=nGv66dtTcls) | Ewerton Oliveira | 0:07 |
| R2 sound reference 2 | [R2D2 Sounds #4 - Star Wars R2D2 Voice Sounds Speech](https://www.youtube.com/watch?v=FubhREQm5Pc) | Mood | 0:02 |

The Force Suite description credits John Williams and describes an arrangement of passages from several Star Wars scores. None of these three video descriptions supplied a separate audio download. The metadata reported embedding enabled at the time of the check; successful playback in the final website has not been verified and availability can change.

## Two reusable droid sound options

These are short, independently synthesized, retro droid sounds by **OwlStorm / Ashe Kirk / Owlish Media**, generated using Labchirp. They are alternatives for the R2 interaction, **not the film recordings or copies of the selected YouTube clips**. Both creator pages mark the sounds CC0.

1. [Retro video game sfx - R2D2](https://freesound.org/people/OwlStorm/sounds/404759/) — a short chirp; listed original duration 0.915 seconds, mono, 44.1 kHz, 16-bit WAV. [Published high-quality MP3 preview](https://cdn.freesound.org/previews/404/404759_140737-hq.mp3).
2. [Retro video game sfx - Whistle 3](https://freesound.org/people/OwlStorm/sounds/404784/) — a rising then falling whistle; listed original duration 0.636 seconds, mono, 44.1 kHz, 16-bit WAV. [Published high-quality MP3 preview](https://cdn.freesound.org/previews/404/404784_140737-hq.mp3).

The preview URLs above were read from each sound page's published `data-static-file-url` metadata. They are MP3 previews, not the original WAV downloads. The original WAV download requires a Freesound account. Keep the chosen files locally in the website so playback does not depend on a third-party preview URL. See the [CC0 deed](https://creativecommons.org/publicdomain/zero/1.0/) linked by the creator's pages. Credit is optional under that declaration; retaining the source record is useful for this classroom demo.

The separate `droid-chirp.wav` already in this kit is an original synthesized development fallback. Its generator is included beside it.

## How the exact music reference can be used

A YouTube watch URL is not an audio-file URL. It cannot be assigned to a normal HTML audio element.

For the intended immersive background loop, supply an audio file that is permitted for use on the website and configure the site's local music asset. Until that file is supplied, leave music unavailable or disabled without interrupting the rest of the experience. Do not label a substitute as the requested Force Suite.

YouTube provides a visible video embed as another option, if the uploader continues to allow it. That changes the design because the player must remain visible. YouTube's API policies prohibit isolating the audio from a video or using a hidden background player. The player documentation specifies a minimum 200 by 200 pixel viewport. Do not use a zero-sized, transparent, off-screen, or covered iframe to imitate a music file. See [YouTube developer policies](https://developers.google.com/youtube/terms/developer-policies) and [player parameters](https://developers.google.com/youtube/player_parameters).

A supported single-video loop uses both `loop=1` and `playlist=eb2zuegwcwk` on the visible embed. An embed can show YouTube branding or other platform UI; it is not a guarantee of seamless or ad-free background music.

For local music and sound effects, start playback after an explicit visitor interaction, provide a mute control, and handle a rejected playback attempt without breaking the note animation. Browsers can block audible autoplay. See [MDN's autoplay guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay).
