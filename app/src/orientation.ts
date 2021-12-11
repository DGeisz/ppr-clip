import * as THREE from "three";
import {
    clipMiddleWidth,
    clipOuterHeight,
    clipOuterWidth,
    clipWireRadius,
    widthDelta,
} from "./constants";

export interface NewClipTransform {
    theta: number;
    psi: number;
}

export interface ClipOrientation {
    origin: THREE.Vector3;
    normal: THREE.Vector3;
    major: THREE.Vector3;
}

function cloneOrientation(orientation: ClipOrientation) {
    const clone: ClipOrientation = {
        origin: new THREE.Vector3(),
        normal: new THREE.Vector3(),
        major: new THREE.Vector3(),
    };

    clone.origin.copy(orientation.origin);
    clone.normal.copy(orientation.normal);
    clone.major.copy(orientation.major);

    return clone;
}

export function getNewOrientationFromOld(
    oldOrientation: ClipOrientation,
    transform: NewClipTransform
): ClipOrientation {
    oldOrientation = cloneOrientation(oldOrientation);

    const {
        origin: oldOrigin,
        major: oldMajor,
        normal: oldNormal,
    } = oldOrientation;

    const { theta, psi } = transform;

    /* Make sure everything is normal */
    oldNormal.normalize();
    oldMajor.normalize();

    /* P is the vector orthogonal to major and normal */
    const p = new THREE.Vector3();

    p.crossVectors(oldMajor, oldNormal);
    p.normalize();

    const newOrigin = new THREE.Vector3();
    newOrigin.copy(oldOrigin);

    newOrigin.addScaledVector(oldMajor, clipOuterHeight / 2);

    /* Now get to the edge of the circle */
    const planeIntermediate = new THREE.Vector3();
    planeIntermediate.copy(oldMajor);
    planeIntermediate.multiplyScalar(clipOuterWidth / 2);

    planeIntermediate.applyAxisAngle(oldNormal, theta);

    newOrigin.add(planeIntermediate);

    const psiIntermediate = new THREE.Vector3();
    psiIntermediate.copy(oldMajor);

    /* Rotate about psi */
    psiIntermediate.applyAxisAngle(p, psi);

    const pICopy = new THREE.Vector3();
    pICopy.copy(psiIntermediate);

    /* Rotate about theta */
    psiIntermediate.applyAxisAngle(oldNormal, theta);

    /* Scale this bitch */
    psiIntermediate.multiplyScalar(
        clipOuterHeight / 2 + clipMiddleWidth / 2 - clipWireRadius
    );

    newOrigin.add(psiIntermediate);

    /* Finally, prepare the small off-origin adjustment */
    const offOrigin = new THREE.Vector3();
    offOrigin.crossVectors(p, pICopy);
    offOrigin.normalize();
    offOrigin.multiplyScalar(widthDelta / 2);

    newOrigin.add(offOrigin);

    const newNormal = new THREE.Vector3();
    newNormal.copy(p);
    newNormal.applyAxisAngle(oldNormal, theta);

    const newMajor = new THREE.Vector3();
    newMajor.copy(psiIntermediate);

    return {
        origin: newOrigin,
        normal: newNormal,
        major: newMajor,
    };
}

export function generateOrientations() {
    const startingOrientation: ClipOrientation = {
        origin: new THREE.Vector3(0, 0, 0),
        normal: new THREE.Vector3(0, 0, 1),
        major: new THREE.Vector3(0, 1, 0),
    };

    const angle = Math.PI / 6;

    const transforms = [];

    for (let i = 0; i < 40; i++) {
        const a = i % 4;

        switch (a) {
            case 0: {
                transforms.push({
                    theta: angle,
                    psi: 0.4,
                });
                break;
            }
            case 1: {
                transforms.push({
                    theta: 0,
                    psi: -angle,
                });
                break;
            }
            case 2: {
                transforms.push({
                    theta: -angle,
                    psi: 0,
                });
                break;
            }
            case 3: {
                transforms.push({
                    theta: 0,
                    psi: angle,
                });
                break;
            }
        }
    }

    let currOr = startingOrientation;

    const ors = [currOr];

    for (const t of transforms) {
        currOr = getNewOrientationFromOld(currOr, t);
        ors.push(currOr);
    }

    return ors;
}
