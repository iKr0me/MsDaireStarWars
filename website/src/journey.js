import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CHAPTERS, journeyState } from "./journey-state.js";
gsap.registerPlugin(ScrollTrigger);
export function createJourney({ scene, reduced, onChange }) {
  const shell = document.querySelector("#journey"),
    galaxy = document.querySelector("#galaxy"),
    opening = document.querySelector("#opening"),
    farewell = document.querySelector("#farewell"),
    warp = document.querySelector("#hyperspace");
  const intro = gsap.timeline({ paused: true }).fromTo(
    "#opening-crawl",
    { y: 0, scale: 1, rotationX: 58, opacity: 1 },
    {
      y: () => -innerHeight * 0.55,
      scale: 0.36,
      rotationX: 65,
      opacity: 0,
      duration: 1,
      ease: "none",
    },
  );
  const outro = gsap.timeline({paused:true}).fromTo(
    '#farewell-crawl',
    {y:()=>innerHeight*.27,z:0,scale:1,rotationX:58,opacity:0},
    {y:()=>-innerHeight*.18,z:-500,scale:.68,rotationX:65,opacity:1,duration:1,ease:'none'},
  );
  let locked = false,
    lastUnits = 0,
    current = "intro",
    scrollFrame;
  const view = (units) => {
    if (locked) return;
    const s = journeyState(units, reduced.matches);
    lastUnits = units;
    galaxy.dataset.chapter = s.chapter;
    opening.hidden = reduced.matches ? s.chapter !== "intro" : units >= CHAPTERS.enterEnd;
    farewell.hidden = reduced.matches ? s.chapter !== "farewell" : s.farewellOpacity <= 0;
    if (reduced.matches) {
      intro.progress(0);
      outro.progress(0);
      gsap.set("#opening-crawl", { opacity: 1, scale: 1, y: 0, rotationX: 0 });
      gsap.set("#farewell-crawl", { opacity: 1, scale: 1, y: 0, rotationX: 0 });
    } else {
      intro.progress(s.intro, true);
      outro.progress(s.farewell, true);
      gsap.set("#farewell-crawl",{opacity:s.farewellOpacity});
    }
    warp.style.opacity = String(s.warp * 0.94);
    scene?.setJourney({ visible: s.sceneVisible, warp: s.warp, starZoom:s.starZoom, sceneScale:s.sceneScale, sceneOpacity:s.sceneOpacity });
    if (current !== s.chapter) {
      current = s.chapter;
      onChange(s.chapter);
    }
  };
  const trigger = ScrollTrigger.create({
    trigger: shell,
    start: "top top",
    end: () => `+=${shell.offsetHeight - galaxy.offsetHeight}`,
    invalidateOnRefresh: true,
    onUpdate: (self) => view(self.progress * CHAPTERS.end),
    onRefresh: (self) => {
      intro.invalidate();
      outro.invalidate();
      view(self.progress * CHAPTERS.end);
    },
  });
  document.querySelector("#galaxy-scroll-cue").addEventListener("click", () => {
    if (!locked)
      window.scrollTo({
        top: shell.offsetHeight - galaxy.offsetHeight,
        behavior: reduced.matches ? "instant" : "smooth",
      });
  });
  reduced.addEventListener("change", () => {
    intro.invalidate();
    outro.invalidate();
    view(lastUnits);
  });
  view(Math.max(0, window.scrollY / innerHeight));
  return {
    get chapter() {
      return current;
    },
    setLocked(value) {
      if (locked === value) return;
      locked = value;
      document.documentElement.classList.toggle("scroll-locked", value);
      if (!value) {
        cancelAnimationFrame(scrollFrame);
        scrollFrame = requestAnimationFrame(() => {
          ScrollTrigger.update();
          view(trigger.progress * CHAPTERS.end);
        });
      }
    },
    dispose() {
      trigger.kill();
      intro.kill();
      outro.kill();
      document.documentElement.classList.remove("scroll-locked");
    },
  };
}
