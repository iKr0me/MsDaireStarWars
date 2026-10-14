import gsap from "gsap";
import * as THREE from "three";
export const heartSVG = `<svg viewBox="0 0 440 390" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="paper-pink" x2="1" y2="1"><stop stop-color="#fff3ed"/><stop offset="1" stop-color="#ebc2cf"/></linearGradient></defs><path d="M220 351C200 332 52 233 34 159C9 52 153 8 220 96C287 8 431 52 406 159C388 233 240 332 220 351Z" fill="url(#paper-pink)" stroke="#f4d4df" stroke-width="11"/><path d="M220 334C192 313 72 225 55 154C37 72 157 33 220 118C283 33 403 72 385 154C368 225 248 313 220 334Z" fill="none" stroke="#c88ea33b" stroke-width="1"/><path d="M220 100V342" stroke="#ba899d44"/><path d="m204 191 16 13 16-13" fill="none" stroke="#b97e9677" stroke-width="1.5"/></svg>`;
export function createReader({
  notebook,
  scene,
  reduced,
  onState,
  onComplete,
}) {
  const root = document.querySelector("#reader"),
    stage = document.querySelector("#note-stage"),
    paper = document.querySelector("#paper"),
    left = document.querySelector(".cover-left"),
    right = document.querySelector(".cover-right"),
    close = document.querySelector("#reader-close");
  const letterContent = [...paper.children].filter(node => !node.classList.contains("open-heart-paper"));
  const paperStops = [...paper.querySelectorAll("#open-paper-gradient stop")];
  left.innerHTML = heartSVG;
  right.innerHTML = heartSVG;
  let active = null,
    source = null,
    originControl = null,
    bob = null,
    timeline = null,
    flightTween = null,
    resize = null;
  const setState = (next) => {
    notebook.transition(next);
    onState(next);
  };
  const animate = (targets, vars) =>
    new Promise((resolve) => {
      gsap.to(targets, { ...vars, onComplete: resolve });
    });
  const placement = () => ({
    x: root.clientWidth / 2,
    y: root.clientHeight * 0.54,
  });
  async function open(note, from, control) {
    active = note;
    source = from;
    originControl = control;
    document.querySelector("#reader-message").textContent = note.message;
    document.querySelector("#reader-sender").textContent = note.sender;
    const photo = document.querySelector("#reader-photo");
    photo.hidden = true;
    photo.removeAttribute("src");
    photo.alt = `Photo shared by ${note.sender}`;
    photo.onload = () => { photo.hidden = !photo.getAttribute('src'); };
    photo.onerror = () => { photo.hidden = true; };
    if (note.photoUrl) photo.src = note.photoUrl;
    document.querySelector("#letter-number").textContent =
      "";
    root.hidden = false;
    root.classList.remove("reading");
    document.querySelector("#galaxy").classList.add("reading");
    paper.inert = true;
    gsap.set(stage, {
      opacity: 1,
      xPercent: -50,
      yPercent: -50,
      rotationX: 0,
      rotationY: 0,
      rotation: 0,
      scale: 1,
    });
    gsap.set(paper, { opacity: 1, scale: 1 });
    gsap.set(letterContent, { opacity: 0 });
    gsap.set(paperStops, { attr: { "stop-color": "#fdb0c0" } });
    gsap.set([left, right], { opacity: 0, rotationY: 0 });
    setState("flying");
    if (from === "r2" && scene?.ready && !reduced.matches) {
      const start = scene.captureOrigin(),
        end = scene.readingPoint(),
        c1 = start.clone().add(new THREE.Vector3(1.5, 1.8, 1)),
        c2 = end.clone().add(new THREE.Vector3(-1.9, 1.1, -3));
      const curve = new THREE.CubicBezierCurve3(start, c1, c2, end),
        p = { t: 0 },
        endDepth = Math.abs(scene.project(end).depth);
      const paint = () => {
        const v = curve.getPoint(p.t),
          position = scene.project(v),
          ratio = endDepth / Math.max(0.01, Math.abs(position.depth));
        gsap.set(stage, {
          x: position.x,
          y: position.y,
          scale: ratio * (0.12 + 0.88 * p.t),
          rotationX: Math.sin(p.t * Math.PI * 3) * 36 * (1 - p.t),
          rotationY: (1 - p.t) * 360,
          rotation: (1 - p.t) * -240,
        });
      };
      resize = paint;
      addEventListener("resize", resize);
      paint();
      await new Promise((resolve) => {
        flightTween = gsap.to(p, {
          t: 1,
          duration: 2.35,
          ease: "power2.inOut",
          onUpdate: paint,
          onComplete: resolve,
        });
      });
      removeEventListener("resize", resize);
      resize = null;
    } else if (from === "collection" && !reduced.matches) {
      const box = control.getBoundingClientRect();
      gsap.set(stage, {
        x: box.left + box.width / 2,
        y: box.top + box.height / 2,
        scale: 0.1,
        rotation: -12,
      });
      await animate(stage, {
        ...placement(),
        scale: 1,
        rotation: 0,
        duration: 0.7,
        ease: "power3.inOut",
      });
    } else {
      gsap.set(stage, { ...placement(), scale: 1, opacity: 0 });
      await animate(stage, { opacity: 1, duration: 0.15 });
    }
    await animate(stage, {
      ...placement(),
      scale: 1,
      rotationX: 0,
      rotationY: 0,
      rotation: 0,
      duration: reduced.matches ? 0.08 : 0.2,
    });
    setState("opening");
    // The soft-pink heart stays opaque in flight; paper and text settle gently on arrival.
    await new Promise(resolve => {
      timeline = gsap.timeline({onComplete:resolve})
        .to(paperStops, {attr:{"stop-color":index => index === 0 ? "#fffaf0" : "#f5e7da"},
          duration:reduced.matches ? .08 : .6, ease:"sine.inOut"},0)
        .to(letterContent, {opacity:1,duration:reduced.matches ? .08 : .75,ease:"sine.out"},
          reduced.matches ? 0 : .12);
    });
    setState("reading");
    root.classList.add("reading");
    paper.inert = false;
    close.focus({ preventScroll: true });
    if (!reduced.matches)
      bob = gsap.to(stage, {
        y: "+=5",
        duration: 4,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
  }
  async function shut() {
    if (notebook.state !== "reading") return;
    setState("closing");
    root.classList.remove("reading");
    paper.inert = true;
    bob?.kill();
    bob = null;
    gsap.set(letterContent, { opacity: 0 });
    await animate(stage, { scale: .98, duration: reduced.matches ? .01 : .12 });
    setState("departing");
    await animate(stage, {
      y: innerHeight + stage.offsetHeight * 0.5,
      scale: 0.2,
      rotation: -23,
      opacity: 1,
      duration: reduced.matches ? 0.12 : 1.05,
      ease: "power2.in",
    });
    notebook.complete(active, source);
    root.hidden = true;
    document.querySelector("#galaxy").classList.remove("reading");
    onState("idle");
    onComplete({ note: active, source, control: originControl });
    active = null;
  }
  close.addEventListener("click", (event) => {
    event.stopPropagation();
    shut();
  });
  // Dragging/selecting/scrolling text must not dismiss the letter.
  let down = null;
  paper.addEventListener("pointerdown", (e) => {
    down = { x: e.clientX, y: e.clientY };
  });
  paper.addEventListener("click", (e) => {
    if (e.target.closest("button") || !down) return;
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y) > 7;
    down = null;
    if (moved || window.getSelection()?.toString()) return;
    shut();
  });
  root.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      shut();
    }
    if (e.key === "Tab" && notebook.state === "reading") {
      e.preventDefault();
      close.focus();
    }
  });
  const recenter = () => {
    if (notebook.state === "reading") {
      bob?.kill();
      gsap.set(stage, placement());
      if (!reduced.matches)
        bob = gsap.to(stage, {
          y: "+=5",
          duration: 4,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
    }
  };
  addEventListener("resize", recenter);
  reduced.addEventListener("change", () => {
    if (reduced.matches) {
      bob?.kill();
      bob = null;
      flightTween?.progress(1);
      timeline?.progress(1);
    }
  });
  return {
    open,
    close: shut,
    fail() {
      timeline?.kill();
      gsap.killTweensOf([stage, paper, left, right, ...letterContent, ...paperStops]);
      bob?.kill();
      if (resize) removeEventListener("resize", resize);
      root.hidden = true;
      document.querySelector("#galaxy").classList.remove("reading");
      paper.inert = true;
      notebook.cancel();
      onState("idle");
    },
  };
}
