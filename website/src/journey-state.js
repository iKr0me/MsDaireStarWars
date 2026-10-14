export const CHAPTERS = {
  enterStart: 0.38,
  enterEnd: 0.66,
  leaveStart: 1.35,
  leaveEnd: 1.63,
  end: 1.98,
};
const clamp = (value) => Math.max(0, Math.min(1, value));
export function journeyState(units, reduced = false) {
  const enter = clamp(
    (units - CHAPTERS.enterStart) / (CHAPTERS.enterEnd - CHAPTERS.enterStart),
  );
  const leave = clamp(
    (units - CHAPTERS.leaveStart) / (CHAPTERS.leaveEnd - CHAPTERS.leaveStart),
  );
  const animatedChapter =
    units < CHAPTERS.enterStart
      ? "intro"
      : units < CHAPTERS.enterEnd
        ? "transition"
        : units < CHAPTERS.leaveStart
          ? "galaxy"
          : units < CHAPTERS.leaveEnd
            ? "transition"
            : "farewell";
  const chapter = reduced
    ? units < CHAPTERS.enterEnd
      ? "intro"
      : units < 1.49
        ? "galaxy"
        : "farewell"
    : animatedChapter;
  const phase = enter > 0 && enter < 1 ? enter : leave > 0 && leave < 1 ? leave : 0;
  // First push gently into the stars, then streak, then settle back out.
  const warp = reduced || phase <= .25 || phase >= .75
    ? 0 : Math.sin(clamp((phase - .25) / .5) * Math.PI);
  const starZoom = reduced ? 1 : 1 + Math.pow(Math.sin(phase * Math.PI),2) * .65;
  return {
    chapter,
    warp,
    starZoom,
    sceneVisible: reduced
      ? chapter === "galaxy"
      : units >= 0.52 && units < 1.49,
    intro: clamp(units / CHAPTERS.enterStart),
    farewell: clamp(
      (units - CHAPTERS.leaveEnd) / (CHAPTERS.end - CHAPTERS.leaveEnd),
    ),
  };
}
