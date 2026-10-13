import config from "./audio-config.json";
export function createAudio() {
  const key = "ms-daire-effects-v1";
  let enabled = true;
  try {
    enabled = localStorage.getItem(key) !== "off";
  } catch {}
  const clips = config.effects.clips.map((c) => {
    const a = new Audio(c.src);
    a.preload = "auto";
    a.volume = config.effects.initialVolume;
    return a;
  });
  const fallback = new Audio(config.effects.fallbackSrc);
  fallback.volume = config.effects.initialVolume;
  const music = config.music.src ? new Audio(config.music.src) : null;
  if (music) { music.loop = true; music.volume = config.music.initialVolume; music.preload = "none"; }
  let musicEnabled = false;
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) music?.pause();
    else if (musicEnabled) music?.play().catch(() => {});
  });
  let index = 0;
  return {
    get musicEnabled() { return musicEnabled; },
    async toggleMusic() {
      if (!music) return false;
      if (musicEnabled) { music.pause(); musicEnabled=false; }
      else { try { await music.play(); musicEnabled=true; } catch { musicEnabled=false; } }
      return musicEnabled;
    },
    get enabled() {
      return enabled;
    },
    toggle() {
      enabled = !enabled;
      clips.forEach((c) => c.pause());
      try {
        localStorage.setItem(key, enabled ? "on" : "off");
      } catch {}
      return enabled;
    },
    play() {
      if (!enabled) return;
      const clip = clips[index++ % clips.length];
      clip.currentTime = 0;
      clip.play().catch(() => {
        fallback.currentTime = 0;
        fallback.play().catch(() => {});
      });
    },
    stop() {
      [...clips, fallback].forEach((c) => c.pause());
    },
  };
}
