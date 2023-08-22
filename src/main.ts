import "./main.css";
import { GLTF, GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
  AnimationClip,
  AnimationMixer,
  LoopOnce,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  SpotLight,
  Vector3,
  WebGLRenderer,
} from "three";
import MONKEY_URL from "./monkey.glb?url";

const BASE_TIMEOUT = 2000; // time until animations start

const scene = new Scene();
const renderer = new WebGLRenderer({ antialias: true });
const loader = new GLTFLoader();
const camera = new PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const controls = new OrbitControls(camera, renderer.domElement);
const dracoLoader = new DRACOLoader();
const plane = new Mesh(
  new PlaneGeometry(10, 10),
  new MeshStandardMaterial({ color: 0x999999 })
);
plane.rotateX(-Math.PI / 2);
plane.receiveShadow = true;

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

controls.target = new Vector3(0, 0.3, 0);
camera.position.x = 1;
camera.position.y = 0.3;
scene.add(plane);

loader.setDRACOLoader(dracoLoader);
loader.load(
  MONKEY_URL,
  onMonkeyLoad,
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  (error): void => {
    console.error("An error happened", error);
  }
);

function onMonkeyLoad(gltf: GLTF) {
  gltf.scene.traverse((obj) => (obj.castShadow = true));
  scene.add(gltf.scene);

  const mixer = new AnimationMixer(gltf.scene);

  let lastT = null;
  function animate(t: number) {
    if (lastT !== null) {
      const dT = t - lastT;

      mixer.update(dT / 1000);
      controls.update();
      renderer.render(scene, camera);
    }

    lastT = t;
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);

  setTimeout(() => {
    const light = new SpotLight(0xff3333, 16, 0, Math.PI / 16, 0.9);
    light.position.set(-0.5, 1, -1);
    light.castShadow = true;
    scene.add(light);
  }, BASE_TIMEOUT);
  setTimeout(() => {
    const light = new SpotLight(0x3333ff, 16, 0, Math.PI / 16, 0.9);
    light.position.set(-0.5, 1, 1);
    light.castShadow = true;
    scene.add(light);
  }, BASE_TIMEOUT + 500);
  setTimeout(() => {
    const light = new SpotLight(0x88ff88, 2, 0, Math.PI / 6, 0.5);
    light.position.set(0.5, 1, 0);
    light.castShadow = true;
    scene.add(light);
  }, BASE_TIMEOUT + 1000);
  setTimeout(() => {
    gltf.animations.forEach(function (clip: AnimationClip) {
      const action = mixer.clipAction(clip).play();
      action.setLoop(LoopOnce, 1);
      action.clampWhenFinished = true;
    });
  }, BASE_TIMEOUT + 2500);
}

window.addEventListener("resize", () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
