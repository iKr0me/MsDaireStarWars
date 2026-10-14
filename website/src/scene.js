import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
const files = {
  hero: "r2d2_starwars_fanart.glb",
  planet: "planet_of_phoenix.glb",
  death: "death_star_-_star_wars.glb",
  chase: "stylized_x-_wing_without_r2d2.glb",
  tie: "tie_fighter_-_star_wars.glb",
};
export async function createScene({ container, target, reduced, onStatus }) {
  const scene = new THREE.Scene();
  const content = new THREE.Group();
  content.visible = false;
  scene.add(content);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 500);
  camera.position.set(0, 2, 24);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld(true);
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x010205, 0);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  container.append(renderer.domElement);
  scene.add(new THREE.HemisphereLight(0xb9cbef, 0x050509, 0.38));
  const sun = new THREE.DirectionalLight(0xffead5, 3.8);
  sun.position.set(-10, 15, 12);
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0x7698e3, 0.8);
  fill.position.set(8, 3, -6);
  scene.add(fill);
  let seed = 741;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const starGeo = new THREE.BufferGeometry(),
    positions = [],
    colors = [];
  for (let i = 0; i < 11000; i++) {
    positions.push(
      (random() - 0.5) * 290,
      (random() - 0.5) * 200,
      -45 - random() * 145,
    );
    const brightness = 0.12 + Math.pow(random(), 3) * 0.88;
    colors.push(brightness * 0.8, brightness * 0.85, brightness);
  }
  starGeo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  starGeo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  const stars = new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({
      size: 0.09,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
      depthWrite: false,
    }),
  );
  scene.add(stars);
  scene.add(camera);
  // Individually scattered tapered ribbons avoid the polar shader's aliasing grid.
  const streakPositions=[], streakSeeds=[], streakAngles=[], streakSpeeds=[];
  for (let i=0;i<1100;i++) {
    const angle=random()*Math.PI*2, seed=random(), speed=.22+random()*.2;
    for(const [side,end] of [[-1,0],[1,1],[1,0],[-1,0],[-1,1],[1,1]]) {
      streakPositions.push(side,end,0); streakSeeds.push(seed);
      streakAngles.push(angle); streakSpeeds.push(speed);
    }
  }
  const tunnelGeometry=new THREE.BufferGeometry();
  tunnelGeometry.setAttribute('position',new THREE.Float32BufferAttribute(streakPositions,3));
  tunnelGeometry.setAttribute('seed',new THREE.Float32BufferAttribute(streakSeeds,1));
  tunnelGeometry.setAttribute('angle',new THREE.Float32BufferAttribute(streakAngles,1));
  tunnelGeometry.setAttribute('speed',new THREE.Float32BufferAttribute(streakSpeeds,1));
  const tunnelMaterial=new THREE.ShaderMaterial({
    transparent:true,depthTest:false,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,
    uniforms:{strength:{value:0},aspect:{value:1},time:{value:0}},
    vertexShader:`attribute float seed; attribute float angle; attribute float speed;
      uniform float strength; uniform float aspect; uniform float time;
      varying float side; varying float end; varying float fade;
      void main(){
        float progress=fract(seed+time*speed);
        float radius=.065+pow(progress,2.)*1.5;
        float length=(.003+pow(progress,3.)*.78)*strength;
        vec2 direction=vec2(cos(angle),sin(angle));
        vec2 normal=vec2(-direction.y,direction.x);
        float width=(.0006+pow(progress,2.)*.005)*(1.+strength*strength*2.2);
        vec2 p=direction*(radius+position.y*length)+normal*position.x*width;
        p.x/=aspect;
        gl_Position=vec4(p*2.,0.,1.);
        side=position.x;end=position.y;
        fade=smoothstep(0.,.07,progress)*(1.-smoothstep(.92,1.,progress));
        fade*=1.-smoothstep(strength-.04,strength+.04,seed);
      }`,
    fragmentShader:`uniform float strength;varying float side;varying float end;varying float fade;
      void main(){
        float glow=exp(-side*side*5.);
        float core=1.-smoothstep(.12,.45,abs(side));
        float taper=smoothstep(0.,.16,end)*(1.-smoothstep(.86,1.,end));
        vec3 color=vec3(.1,.36,.65)*glow*.5+vec3(.95,.98,1.)*core*(1.+strength*.7);
        gl_FragColor=vec4(color,strength*fade*taper*max(glow*.65,core));
      }`,
  });
  const tunnel=new THREE.Mesh(tunnelGeometry,tunnelMaterial);
  tunnel.frustumCulled=false;tunnel.renderOrder=40;tunnel.visible=false;scene.add(tunnel);
  let chapterVisible = false;
  const fleet = new THREE.Group();
  fleet.visible = false;
  content.add(fleet);
  let chaseCurve,
    chaseStart = 0,
    nextChase = 6,
    chaseWing,
    ties = [],
    chasePass = 0;
  const forward = new THREE.Vector3(0, 0, 1);

  const bolts = Array.from({length: 20}, () => {
    const group = new THREE.Group();
    const core = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.7, 6),
      new THREE.MeshBasicMaterial({color: 0xd5ff91, toneMapped:false}));
    const halo = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.85, 6),
      new THREE.MeshBasicMaterial({color: 0x33ff55, transparent:true, opacity:0.23,
        blending:THREE.AdditiveBlending, depthWrite:false, toneMapped:false}));
    group.add(core,halo); group.visible=false; content.add(group);
    return {group, direction:new THREE.Vector3(), life:0};
  });
  let lastShot = -1, boltIndex = 0;
  const loader = new GLTFLoader();
  function normalize(model, span) {
    model.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(model),
      center = box.getCenter(new THREE.Vector3()),
      size = box.getSize(new THREE.Vector3());
    const inner = new THREE.Group();
    model.position.sub(center);
    inner.add(model);
    inner.scale.setScalar(span / Math.max(size.x, size.y, size.z));
    const wrapper = new THREE.Group();
    wrapper.add(inner);
    return wrapper;
  }
  let hero, anchor, chestAnchor, signalLight, headPivot, planet, death;
  let headYaw = 0;
  let flashStarted = -Infinity, spinEventStarted = -Infinity;
  let spin = 0, spinVelocity = 0, nextSpin = 18;
  const baseCameraRotation = camera.rotation.clone();
  let paused = false,
    reading = false,
    elapsed = 0,
    last = performance.now(),
    width = innerWidth,
    height = innerHeight,
    available = false;
  const ray = new THREE.Vector3(),
    point = new THREE.Vector3();
  function project(world) {
    const p = world.clone().project(camera);
    return {
      x: ((p.x + 1) * width) / 2,
      y: ((1 - p.y) * height) / 2,
      depth: world.clone().applyMatrix4(camera.matrixWorldInverse).z,
    };
  }
  function worldAt(x, y, distance) {
    ray.set(x, y, 0.5).unproject(camera).sub(camera.position).normalize();
    return camera.position.clone().addScaledVector(ray, distance);
  }
  function layout() {
    width = container.clientWidth;
    height = container.clientHeight;
    camera.aspect = width / height;
    camera.fov = width < 700 ? 50 : 42;
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld(true);
    renderer.setSize(width, height);
    if (hero) {
      hero.scale.setScalar(width < 700 ? 0.69 : 1);
      hero.position.set(
        width < 700 ? -0.3 : -1.3,
        width < 700 ? -1.1 : -1.5,
        0,
      );
    }
    if (planet) {
      const distance = 100;
      planet.position.copy(worldAt(1.28, -1.38, distance));
      const radiusPx = Math.min(width * 0.64, height * 0.58),
        radius =
          (Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) *
            distance *
            radiusPx) /
          (height / 2);
      planet.scale.setScalar(radius);
    }
    if (death) death.position.copy(worldAt(-0.73, 0.2, 65));
  }
  function updateTarget() {
    if (!anchor) return;
    hero.updateMatrixWorld(true);
    chestAnchor.getWorldPosition(point);
    const p = project(point);
    target.style.left = `${p.x}px`;
    target.style.top = `${p.y}px`;
  }
  function render(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!paused && !reduced.matches) elapsed += dt;
    tunnelMaterial.uniforms.time.value=elapsed;
    if (chapterVisible && !paused && !reduced.matches && !reading && elapsed >= nextSpin) {
      spinEventStarted = elapsed;
      nextSpin = elapsed + 28;
    }
    if (hero && !paused) {
      const t = elapsed * 0.19;
      const still = paused || reduced.matches;
      const baseY = width < 700 ? -1.1 : -1.5;
      hero.position.x =
        (width < 700 ? -0.3 : -1.3) + (still ? 0 : Math.sin(t) * 0.85);
      hero.position.y = baseY + (still ? 0 : Math.sin(elapsed * 0.42) * 0.7);
      hero.position.z = still ? 0 : Math.cos(t * 0.78) * 1.3;
      if (!still) {
        const chaseAge = fleet.visible ? elapsed - chaseStart : -1;
        const gentleAge = elapsed - spinEventStarted;
        const gust = chaseAge >= 0 && chaseAge < 4.4 ? Math.pow(Math.sin(Math.PI * chaseAge / 4.4), 2) * 1.1 : 0;
        const turn = gentleAge >= 0 && gentleAge < 5 ? Math.pow(Math.sin(Math.PI * gentleAge / 5), 2) * .45 : 0;
        spinVelocity += (gust + turn - spinVelocity) * (1 - Math.exp(-dt * 2));
        spin += dt * (0.035 + spinVelocity);
      }
      hero.rotation.set(
        0.08 + (still ? 0 : Math.sin(t * 0.81) * 0.12),
        -0.35 + spin,
        still ? 0 : Math.sin(t) * 0.12 + Math.sin(spin) * Math.min(spinVelocity, 0.35),
      );
    }
    if (headPivot && !paused && !reduced.matches) {
      const phase = elapsed % 32;
      const wander = phase>24 && phase<29 ? .65 : 0;
      let desired = -hero.rotation.y + wander;
      if (fleet.visible && ties.length) {
        const headWorld=headPivot.getWorldPosition(new THREE.Vector3());
        const direction=ties[0].position.clone().sub(headWorld);
        desired=Math.atan2(direction.x,direction.z)-hero.rotation.y;
      }
      const delta=THREE.MathUtils.euclideanModulo(desired-headYaw+Math.PI,Math.PI*2)-Math.PI;
      const step=.8*dt;
      headYaw+=Math.sign(delta)*Math.min(Math.abs(delta),step);
      headPivot.rotation.y = headYaw;
    }
    if (!paused && !reduced.matches) {
      const strength = reading ? 0.15 : 1;
      camera.rotation.set(baseCameraRotation.x + Math.sin(elapsed * 1.1) * 0.0004 * strength,
        baseCameraRotation.y + Math.sin(elapsed * 0.73) * 0.0004 * strength, baseCameraRotation.z);
      camera.updateMatrixWorld(true);
    }

    if (signalLight) {
      const age = (now - flashStarted) / 1000;
      const pulse = reduced.matches ? age >= 0 && age < .65 :
        (age >= 0 && age < .16) || (age >= .45 && age < .61);
      signalLight.material.opacity = pulse ? 1 : .15;
      signalLight.scale.setScalar(pulse ? 1.25 : 1);
    }
    if (planet && !paused && !reduced.matches) planet.rotation.y += dt * 0.012;
    if (!paused && !reduced.matches)
      stars.rotation.z = Math.sin(elapsed * 0.009) * 0.006;
    if (
      chapterVisible &&
      !reduced.matches &&
      !paused &&
      !reading &&
      chaseWing &&
      ties.length &&
      elapsed >= nextChase &&
      !fleet.visible
    ) {
      const lane = Math.sin(elapsed) * 0.24;
      const behindPlanet = chasePass++ % 2 === 1;
      chaseCurve = behindPlanet
        ? new THREE.CubicBezierCurve3(
            worldAt(-1.8,lane+.2,48),
            worldAt(-.4,lane+.4,85),
            worldAt(.65,-.5,160),
            worldAt(1.02,-1.15,260),
          )
        : new THREE.CubicBezierCurve3(
            worldAt(1.85,lane+.18,48),
            worldAt(.6,lane+.37,85),
            worldAt(-.3,lane-.17,160),
            worldAt(-1.5,lane+.1,260),
          );
      chaseStart = elapsed;
      // The droid reaction ramps up through the flyby envelope, never an impulse.
      fleet.visible = true;
    }
    if (fleet.visible && chaseCurve) {
      const progress = (elapsed - chaseStart) / 3.6;
      if (progress > 1.22 || !chapterVisible || reduced.matches) {
        fleet.visible = false;
        nextChase = elapsed + 12;
      } else
        [ties[0], ties[1], chaseWing].forEach((ship, i) => {
          if (!ship) return;
          const t = Math.max(0, Math.min(1, progress - i * 0.065));
          const positionAt = u => {
            const position = chaseCurve.getPoint(u);
            if (i < 2) {
              const climb = THREE.MathUtils.smoothstep(u,.18,.72);
              position.y += climb * (2.2 + i * .8) + i * .35;
            }
            return position;
          };
          ship.position.copy(positionAt(t));
          const ahead = Math.min(1,t+.005), behind = Math.max(0,t-.005);
          const heading = positionAt(ahead).sub(positionAt(behind)).normalize();
          ship.quaternion.setFromUnitVectors(forward,heading);
          ship.rotateZ(i < 2 ? -Math.sin(t * Math.PI) * .2 : -Math.sin(t * Math.PI) * .12);

        });
    }
    if (fleet.visible && chaseWing && !paused && !reading && !reduced.matches && elapsed-lastShot > 1.35 && elapsed-chaseStart > .45 && elapsed-chaseStart < 3.2) {
      lastShot = elapsed;
      chaseWing.updateMatrixWorld(true);
      for (const side of [-1,1]) {
        const bolt = bolts[boltIndex++ % bolts.length];
        bolt.group.position.copy(chaseWing.localToWorld(new THREE.Vector3(side*0.695,0.126,0.674)));
        bolt.direction.copy(ties[boltIndex%2].position).sub(bolt.group.position).normalize();
        bolt.group.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),bolt.direction);
        bolt.life=0.55; bolt.group.visible=true;
      }
    }
    for (const bolt of bolts) {
      if (!paused && !reduced.matches && !reading) {
        bolt.life -= dt;
        bolt.group.position.addScaledVector(bolt.direction,dt*85);
      }
      bolt.group.visible = chapterVisible && bolt.life>0 && !reduced.matches;
    }
    updateTarget();
    if (!deliveryActive) renderer.render(scene, camera);
  }
  function visibility() {
    if (document.hidden) {
      renderer.setAnimationLoop(null);
    } else {
      last = performance.now();
      renderer.setAnimationLoop(render);
    }
  }
  addEventListener("resize", layout);
  document.addEventListener("visibilitychange", visibility);
  renderer.domElement.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    available = false;
    renderer.setAnimationLoop(null);
    onStatus("The scene paused. You can still receive letters.");
    document.querySelector("#galaxy").classList.add("fallback");
  });
  try {
    const result = await loader.loadAsync(`/models/${files.hero}`);
    // This download faces +X; rotate its wrapper so the eyes face the camera (+Z).
    result.scene.rotation.y = -Math.PI / 2;
    hero = normalize(result.scene, 5.2);
    content.add(hero);
    anchor = new THREE.Object3D();
    anchor.name = "R2_NOTE_ORIGIN";
    const bounds = new THREE.Box3().setFromObject(hero);
    anchor.position.set(0, bounds.max.y - 0.3, bounds.max.z * 0.65);
    hero.add(anchor);
    const bodyBox = new THREE.Box3().setFromObject(hero.getObjectByName('o_r2d2_body'));
    chestAnchor = new THREE.Object3D();
    chestAnchor.name = 'R2_CHEST_TARGET';
    chestAnchor.position.copy(bodyBox.getCenter(new THREE.Vector3()));
    chestAnchor.position.z = bodyBox.max.z + .03;
    hero.add(chestAnchor);
    const lightBox = new THREE.Box3().setFromObject(hero.getObjectByName('o_r2d2_eyes_1'));
    signalLight = new THREE.Mesh(new THREE.SphereGeometry(.055,12,8),
      new THREE.MeshBasicMaterial({color:0xff2929,transparent:true,opacity:.15,toneMapped:false}));
    signalLight.position.copy(lightBox.getCenter(new THREE.Vector3()));
    signalLight.position.z = lightBox.max.z + .015;
    hero.add(signalLight);
    const headNode = hero.getObjectByName('o_r2d2_head');
    const eyeNode = hero.getObjectByName('o_r2d2_eyes');
    const headBox = new THREE.Box3().setFromObject(headNode);
    headPivot = new THREE.Group();
    headPivot.position.copy(headBox.getCenter(new THREE.Vector3()));
    hero.add(headPivot);hero.updateMatrixWorld(true);
    headPivot.attach(headNode);headPivot.attach(eyeNode);
    headPivot.attach(signalLight);headPivot.attach(anchor);
    available = true;
    layout();
    renderer.setAnimationLoop(render);
  } catch (error) {
    renderer.dispose();
    renderer.domElement.remove();
    throw error;
  }
  // Decorative failures never prevent reading a note.
  const decor = async () => {
    for (const [key, span] of [
      ["planet", 2],
      ["death", 3],
    ]) {
      try {
        const g = await loader.loadAsync(`/models/${files[key]}`),
          model = normalize(g.scene, span);
        content.add(model);
        if (key === "planet") {
          planet = model;
        } else death = model;
        layout();
      } catch (error) {
        console.warn(`Optional ${key} model unavailable:`, error);
      }
    }
  };
  decor();
  Promise.all([
    loader.loadAsync(`/models/${files.chase}`),
    loader.loadAsync(`/models/${files.tie}`),
  ])
    .then(([wing, tie]) => {
      chaseWing = normalize(wing.scene, 1.6);
      ties = [normalize(tie.scene, 0.85), normalize(tie.scene.clone(true), 0.85)];
      fleet.add(...ties, chaseWing);
    })
    .catch((error) => console.warn("Distant chase models unavailable:", error));
  let falconPromise;
  let deliveryActive=false;
  falconPromise=loader.loadAsync('/models/millennium_falcon.glb').then(g=>normalize(g.scene,8));
  falconPromise.catch(()=>{falconPromise=null;});
  async function flyDelivery(onPass, pickup = {x:width/2,y:height/2}) {
    if (paused || reduced.matches || !available) { onPass(); return; }
    falconPromise ??= loader.loadAsync('/models/millennium_falcon.glb').then(g=>normalize(g.scene,8));
    let model;
    try {model=(await falconPromise).clone(true);} catch(e){falconPromise=null;throw new Error('The Falcon could not load. Please try again.');}
    // Reuse the proven scene renderer instead of creating another WebGL context.
    const deliveryScene=new THREE.Group();
    deliveryScene.add(model);scene.add(deliveryScene);deliveryActive=true;
    const pickupPoint=worldAt(pickup.x/width*2-1,1-pickup.y/height*2,20);
    const approach=new THREE.CubicBezierCurve3(worldAt(1.7,-.1,15),worldAt(.9,.03,16),
      pickupPoint.clone().add(new THREE.Vector3(3,0,0)),pickupPoint);
    // Follow the supplied drawing: left sweep, broad right bend, upper-left departure.
    const departure=new THREE.CatmullRomCurve3([
      pickupPoint,worldAt(-.45,.04,30),worldAt(-.66,.25,42),worldAt(-.66,.60,65),
      worldAt(-.40,.56,85),worldAt(.03,.40,125),worldAt(.26,.37,170),
      worldAt(.26,.54,215),worldAt(-.12,.76,285),worldAt(-.24,.95,360),
    ],false,'centripetal');
    const enginePoints=Array.from({length:17},(_,i)=>{
      const x=-2.2+i/16*4.4;
      return new THREE.Vector3(x,.08,-1.6-Math.sqrt(6.25-x*x)*.55);
    });
    const engineCurve=new THREE.CatmullRomCurve3(enginePoints);
    const engineGeometry=new THREE.TubeGeometry(engineCurve,32,.09,8,false);
    const engineGlowGeometry=new THREE.TubeGeometry(engineCurve,32,.21,8,false);
    const engineMaterial=new THREE.MeshBasicMaterial({color:0x6eeaff,toneMapped:false});
    const engineGlowMaterial=new THREE.MeshBasicMaterial({color:0x00c9f5,transparent:true,opacity:.3,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false});
    model.add(new THREE.Mesh(engineGeometry,engineMaterial),new THREE.Mesh(engineGlowGeometry,engineGlowMaterial));
    const trailSize=90, trailSegments=[];
    const coreGeometry=new THREE.BoxGeometry(1,1,1);
    const glowGeometry=new THREE.BoxGeometry(1.15,1,1.8);
    const coreMaterial=new THREE.MeshBasicMaterial({color:0x68dfff,transparent:true,opacity:.45,
      blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false});
    const glowMaterial=new THREE.MeshBasicMaterial({color:0x00a8ec,transparent:true,opacity:.18,
      blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false});
    const coreTrail=new THREE.InstancedMesh(coreGeometry,coreMaterial,trailSize);
    const glowTrail=new THREE.InstancedMesh(glowGeometry,glowMaterial,trailSize);
    coreTrail.frustumCulled=false;glowTrail.frustumCulled=false;
    deliveryScene.add(coreTrail,glowTrail);
    const dummy=new THREE.Object3D(), direction=new THREE.Vector3(), fadeColor=new THREE.Color();
    let trailIndex=0, previousTail;
    try {
      await new Promise((resolve,reject)=>{
        let time=0, prev=performance.now(), passed=false, bank=0;
        function frame(now){
          try {
          const dt=Math.min((now-prev)/1000,.05);
          if(!document.hidden)time+=dt;prev=now;
          const approaching=time<1.8;
          const q=approaching ? Math.min(1,time/1.8) : Math.min(1,(time-1.8)/5.6);
          const t=approaching?q:.5*q+.5*Math.pow(Math.max(0,(q-.4)/.6),2);
          const curve=approaching ? approach : departure;
          model.position.copy(curve.getPointAt(t));
          const heading=curve.getTangentAt(t).normalize();
          const right=new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0),heading).normalize();
          const up=new THREE.Vector3().crossVectors(heading,right).normalize();
          model.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(right,up,heading));
          const nextHeading=curve.getTangentAt(Math.min(1,t+.015)).normalize();
          const turn=new THREE.Vector3().crossVectors(heading,nextHeading).y;
          const targetBank=THREE.MathUtils.clamp(-turn*8,-.45,.45);
          bank+=(targetBank-bank)*(1-Math.exp(-dt*3));
          model.rotateZ(bank);
          model.visible=time<7.4;
          model.updateMatrixWorld(true);
          const tail=model.localToWorld(new THREE.Vector3(0,0,-2.8));
          if(previousTail && model.visible){
            trailSegments[trailIndex]={a:previousTail.clone(),b:tail.clone(),at:time};
            trailIndex=(trailIndex+1)%trailSize;
          }
          previousTail=tail;
          for(let i=0;i<trailSize;i++){
            const segment=trailSegments[i], age=segment ? time-segment.at : 2;
            if(age<1){
              direction.copy(segment.b).sub(segment.a);
              dummy.position.copy(segment.a).add(segment.b).multiplyScalar(.5);
              dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction.clone().normalize());
              dummy.scale.set(4.4*(1-age*.65),Math.max(.001,direction.length()),.12);
              fadeColor.setRGB(1-age,1-age,1-age);
            } else {dummy.scale.setScalar(0);fadeColor.setRGB(0,0,0);}
            dummy.updateMatrix();
            coreTrail.setMatrixAt(i,dummy.matrix);glowTrail.setMatrixAt(i,dummy.matrix);
            coreTrail.setColorAt(i,fadeColor);glowTrail.setColorAt(i,fadeColor);
          }
          coreTrail.instanceMatrix.needsUpdate=true;glowTrail.instanceMatrix.needsUpdate=true;
          coreTrail.instanceColor.needsUpdate=true;glowTrail.instanceColor.needsUpdate=true;
          if(!approaching && !passed){passed=true;onPass();}
          renderer.render(scene,camera);
          if(time>=8.4 || reduced.matches || paused){if(!passed)onPass();resolve();}
          else requestAnimationFrame(frame);
          } catch(error) { reject(error); }
        }
        requestAnimationFrame(frame);
      });
    } finally {
      scene.remove(deliveryScene);deliveryActive=false;engineGeometry.dispose();engineGlowGeometry.dispose();engineMaterial.dispose();engineGlowMaterial.dispose();coreGeometry.dispose();glowGeometry.dispose();coreMaterial.dispose();glowMaterial.dispose();

    }
  }

  return {
    flyDelivery,
    signalNote() { flashStarted = performance.now(); },
    setJourney({ visible, warp, starZoom = 1, sceneScale = 1 }) {
      chapterVisible = visible;
      content.visible = visible;
      content.scale.set(sceneScale,sceneScale,1);
      stars.scale.set(starZoom,starZoom,1);
      const amount = reduced.matches ? 0 : warp;

      tunnel.visible = amount > 0.01;
      tunnelMaterial.uniforms.strength.value = amount;
      tunnelMaterial.uniforms.aspect.value = width/height;

    },
    camera,
    project,
    worldAt,
    get ready() {
      return available;
    },
    captureOrigin() {
      hero.updateMatrixWorld(true);
      return anchor.getWorldPosition(new THREE.Vector3()).clone();
    },
    readingPoint() {
      return worldAt(0, -0.08, 6);
    },
    setPaused(value) {
      paused = value;
    },
    setReading(value) {
      reading = value;
    },
    dispose() {
      renderer.setAnimationLoop(null);
      renderer.dispose();
      removeEventListener("resize", layout);
      document.removeEventListener("visibilitychange", visibility);
    },
  };
}
