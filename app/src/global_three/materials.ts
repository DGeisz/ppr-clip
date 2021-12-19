import * as THREE from "three";
import { FlakesTexture } from "./textures";

let texture = new THREE.CanvasTexture(FlakesTexture());
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
//repeat the wrapping 10 (x) and 6 (y) times
texture.repeat.x = 10;
texture.repeat.y = 6;

function createMetallicMaterial(color: number | string): THREE.Material {
    return new THREE.MeshPhysicalMaterial({
        clearcoat: 0.9,
        metalness: 1,
        roughness: 0.6,
        color,
        normalMap: texture,
        normalScale: new THREE.Vector2(0.15, 0.15),
    });
}

export const OceanBlue = createMetallicMaterial(0x10a0de);
export const ForestGreen = createMetallicMaterial(0x0dba2d);

export const BasicMix = new THREE.ShaderMaterial({
    uniforms: {
        color1: {
            value: new THREE.Color(0x00ffa3),
        },
        color2: {
            value: new THREE.Color(0xdc1fff),
        },
    },
    vertexShader: `
      varying vec2 vUv;
  
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 color1;
      uniform vec3 color2;
    
      varying vec2 vUv;
      
      void main() {
        
        gl_FragColor = vec4(mix(color1, color2, vUv.y), 1.0);
      }
    `,
    wireframe: true,
});
