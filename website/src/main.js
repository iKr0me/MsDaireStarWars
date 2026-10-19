import { createAudioWelcome } from "./audio-welcome.js";
import { createComposer } from "./composer.js";
import "./styles.css";
import "./journey.css";
import { createJourney } from "./journey.js";
import { Notebook } from "./notebook.js";
import { createDataAdapter } from "./data.js";
import { createAudio } from "./audio.js";
import { createScene } from "./scene.js";
import { createReader, heartSVG } from "./reader.js";
const $ = (id) => document.getElementById(id),
  galaxy = $("galaxy"),
  target = $("r2-target"),
  panel = $("collection"),
  collectionToggle = $("collection-toggle"),
  grid = $("collection-grid"),
  reduced = matchMedia("(prefers-reduced-motion: reduce)");
const adapter = await createDataAdapter(),
  key = `ms-daire-${adapter.mode}-progress-v1`;
let saved;
try {
  saved = JSON.parse(localStorage.getItem(key) || "null");
} catch {}
const notebook = new Notebook({
    saved,
    persist: (value) => localStorage.setItem(key, JSON.stringify(value)),
  }),
  audio = createAudio();
let notes = [], initialLoadError = null;
let notesLoading = true;
// A slow database must never block the audio choice or the scene startup.
const initialNotes = adapter.list().then(value => ({notes:value}), error => ({error}));
let scene,
  reader,
  composer,
  journey,
  audioGateActive = true,
  panelWasOpen = false,
  previousFocus = null;
createAudioWelcome({audio,onClose({musicFailed}){
  audioGateActive=false; soundUI();musicUI();syncScrollLock();
  if(musicFailed)status('Music could not start. Try the music control.',4000);
  $('music-toggle').focus({preventScroll:true});
}});
let statusTimer;
function status(message, timeout = 0) {
  clearTimeout(statusTimer);
  $("status").textContent = message;
  if (timeout)
    statusTimer = setTimeout(() => {
      $("status").textContent = "";
    }, timeout);
}
$("mode-label").textContent =
  adapter.mode === "demo"
    ? "Demo — sample messages"
    : "For Ms. Daire";
$("reset-demo").hidden = adapter.mode !== "demo";
function syncScrollLock() {
  journey?.setLocked(audioGateActive || notebook.busy || composer?.active || !panel.hidden || !$("credits").hidden);
}
function stateChanged(state) {
  galaxy.dataset.state = state;
  const busy = state !== "idle" || Boolean(composer?.active);
  target.disabled =
    busy || !notes.length || (journey && journey.chapter !== "galaxy");
  collectionToggle.disabled = busy;
  $("reset-demo").disabled = busy;
  $("credits-open").disabled = busy;
  $("hud").inert = busy;
  $("write-note").disabled = busy;
  scene?.setReading(busy);
  syncScrollLock();
}
function collection(open) {
  if (notebook.busy || composer?.active) return;
  panel.hidden = !open;
  collectionToggle.setAttribute("aria-expanded", String(open));
  if (open) {
    renderCollection();
    $("collection-close").focus({ preventScroll: true });
  } else collectionToggle.focus({ preventScroll: true });
  syncScrollLock();
}
function renderCollection() {
  grid.replaceChildren();
  const collected = notes
    .filter((n) => notebook.collected.has(n.id))
    .sort(
      (a, b) => notebook.collected.get(b.id) - notebook.collected.get(a.id),
    );
  // Count only collected notes that remain approved; retain history for reapprovals.
  $("count").textContent = collected.length;
  panel.querySelector(".collection-empty").hidden = collected.length > 0;
  panel.querySelector(".collection-footnote").textContent =
    "Open a heart to read it again.";
  for (const note of collected) {
    const button = document.createElement("button");
    button.className = "keepsake";
    button.dataset.noteId = note.id;
    button.setAttribute(
      "aria-label",
      `Read the collected note from ${note.sender}: ${note.message.slice(0, 45)}`,
    );
    button.innerHTML = heartSVG;
    const name = document.createElement("span");
    name.textContent = note.sender;
    button.append(name);
    button.addEventListener("click", () => draw("collection", note.id, button));
    grid.append(button);
  }
}
async function draw(source = "r2", id = null, control = target) {
  if (journey?.chapter !== "galaxy" || (!panel.hidden && source === "r2"))
    return;
  if (composer?.active || !$("credits").hidden || !notebook.begin()) return;
  panelWasOpen = source === "collection";
  panel.hidden = true;
  collectionToggle.setAttribute("aria-expanded", "false");
  stateChanged("loading");
  status("");
  // Play in the user gesture, before awaiting the data adapter.
  if (source === "r2") { audio.play(); scene?.signalNote(); }
  try {
    if (source === "r2") {
      notes = await adapter.list();
      renderCollection();
    }
    const note =
      source === "collection" ? await adapter.get(id) : notebook.choose(notes);
    if (!note) {
      notes = await adapter.list();
      notebook.cancel();
      stateChanged("idle");
      renderCollection();
      status("No letters are available yet. Please check back soon.", 5000);
      if (panelWasOpen) collection(true);
      return;
    }
    await reader.open(note, source, control);
  } catch (error) {
    console.error("Letter interaction failed:", error);
    reader.fail();
    status("Your letter couldn’t open. Please try again.", 5000);
    target.focus({ preventScroll: true });
  }
}
collectionToggle.addEventListener("click", () => collection(panel.hidden));
$("collection-close").addEventListener("click", () => collection(false));
// Consume the dismissal click so it cannot also trigger the X-wing.
document.addEventListener(
  "click",
  (e) => {
    if (
      !panel.hidden &&
      !panel.contains(e.target) &&
      !collectionToggle.contains(e.target)
    ) {
      e.preventDefault();
      e.stopImmediatePropagation();
      collection(false);
    }
  },
  true,
);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !panel.hidden) {
    e.preventDefault();
    collection(false);
  }
  if (e.key === "Escape" && !$("credits").hidden) closeCredits();
});
target.addEventListener("click", () => draw());
$("reset-demo").addEventListener("click", () => {
  if (!notebook.reset()) return;
  collection(false);
  renderCollection();
  status("Sample collection reset.", 3500);
});
function soundUI() {
  const button = $("effects-toggle");
  button.setAttribute("aria-pressed", String(audio.enabled));
  button.setAttribute(
    "aria-label",
    audio.enabled ? "Turn sound effects off" : "Turn sound effects on",
  );
  button.textContent = audio.enabled ? "♫" : "♩";
}
function musicUI(){
  const enabled=audio.musicEnabled;
  $("music-toggle").setAttribute("aria-pressed",String(enabled));
  $("music-toggle").setAttribute("aria-label",enabled?"Pause Force Theme":"Play Force Theme");
  $("music-toggle").textContent=enabled?"♫":"♪";
}
$("music-toggle").addEventListener("click",async()=>{await audio.toggleMusic();musicUI();});
soundUI();
$("effects-toggle").addEventListener("click", () => {
  audio.toggle();
  soundUI();
});
$("credits-open").addEventListener("click", () => {
  if (notebook.busy || composer?.active) return;
  panel.hidden = true;
  collectionToggle.setAttribute("aria-expanded", "false");
  previousFocus = document.activeElement;
  $("credits").hidden = false;
  $("hud").inert = true;
  target.disabled = true;
  $("credits-close").focus();
  syncScrollLock();
});
function closeCredits() {
  $("credits").hidden = true;
  $("hud").inert = false;
  stateChanged("idle");
  previousFocus?.focus({ preventScroll: true });
}
$("credits-close").addEventListener("click", closeCredits);
$("credits").addEventListener("keydown", (e) => {
  if (e.key !== "Tab") return;
  const items = [...$("credits").querySelectorAll("button,a")],
    first = items[0],
    last = items.at(-1);
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
});
renderCollection();
try {
  scene = await createScene({
    container: $("scene"),
    target,
    reduced,
    onStatus: status,
    onFlingSound: () => audio.playFling(),
  });
  status("");
} catch (error) {
  console.error("3D scene unavailable:", error);
  galaxy.classList.add("fallback");
  status("3D is unavailable on this device. Your letters still work.", 5000);
}
journey = createJourney({
  scene,
  reduced,
  onChange(chapter) {
    if (chapter !== "galaxy") {
      panel.hidden = true;
      collectionToggle.setAttribute("aria-expanded", "false");
    }
    stateChanged(notebook.state);
  },
});
reader = createReader({
  notebook,
  scene,
  reduced,
  onState: stateChanged,
  onComplete: ({ source, note }) => {
    renderCollection();
    if (source === "collection") {
      collection(true);
      grid
        .querySelector(`[data-note-id="${CSS.escape(note.id)}"]`)
        ?.focus({ preventScroll: true });
    } else target.focus({ preventScroll: true });
  },
});
composer = createComposer({adapter, reduced, scene,
  onLock() { stateChanged(notebook.state); syncScrollLock(); },
  onDone:message=>status(message,6000)});
$("write-note").addEventListener("click",()=>{
  if(notebook.busy || composer.active || !$("credits").hidden || journey.chapter!=="galaxy")return;
  panel.hidden=true;collectionToggle.setAttribute("aria-expanded","false");composer.open();
});
stateChanged("idle");
if (adapter.mode === 'live') status('Loading approved notes…');
initialNotes.then(result => {
  notesLoading = false;
  if (result.error) {
    initialLoadError = result.error;
    status(initialLoadError.message);
  } else {
    notes = result.notes;
    renderCollection();stateChanged(notebook.state);
    status(notes.length ? '' : 'No approved notes yet. You can be the first to write one.');
  }
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) audio.stop();
});
let refreshing = false;
async function refresh() {
  if (document.hidden || notesLoading || refreshing || notebook.busy || composer?.active) return;
  refreshing = true;
  try {
    const updated = await adapter.list();
    // A reader may have opened while the request was in flight.
    if (notebook.busy || composer?.active) return;
    const wasEmpty = !notes.length;
    notes = updated;
    renderCollection();
    stateChanged("idle");
    if (initialLoadError || wasEmpty || !notes.length) {
      initialLoadError = null;
      status(notes.length ? "" : "No approved notes yet. You can be the first to write one.");
    }
  } catch {
    status("Couldn’t refresh notes. Please try again later.", 4000);
  } finally {
    refreshing = false;
  }
}
window.addEventListener("focus", refresh);
if (adapter.mode === "live") setInterval(refresh, 45000);
