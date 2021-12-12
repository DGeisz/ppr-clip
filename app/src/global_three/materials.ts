import * as THREE from "three";
import { FlakesTexture } from "./textures";

let texture = new THREE.CanvasTexture(FlakesTexture());
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
//repeat the wrapping 10 (x) and 6 (y) times
texture.repeat.x = 10;
texture.repeat.y = 6;

export const BasicGold = new THREE.MeshPhysicalMaterial({
    clearcoat: 0.9,
    metalness: 1,
    roughness: 0.6,
    color: 0xffbf00,
    normalMap: texture,
    normalScale: new THREE.Vector2(0.15, 0.15),
});
