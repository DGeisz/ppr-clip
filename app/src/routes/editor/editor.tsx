import * as THREE from "three";
import { ContactShadows, Environment, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import React, { Suspense, useEffect, useState } from "react";
import { OrientedClip } from "../../global_building_blocks/paper_clip/paper_clip";
import {
    ClipOrientation,
    getNewOrientationFromOld,
    startingOrientation,
} from "../../global_building_blocks/paper_clip/types/orientation";
import { BasicGold } from "../../global_three/materials";
import { clipOuterHeight, clipOuterWidth } from "../../constants";
import {
    visibleHeightAtDistance,
    visibleWidthAtDistance,
} from "../../global_three/utils/camera";

const EditorInner: React.FC = () => {
    const [orientations, setOrientations] = useState<ClipOrientation[]>([
        startingOrientation,
    ]);

    const lastOrientation = orientations[orientations.length - 1];

    const [theta, setTheta] = useState<number>(0);
    const [psi, setPsi] = useState<number>(0);
    const [shiftDown, setShiftDown] = useState<boolean>(false);

    const nextOrientation = getNewOrientationFromOld(lastOrientation, {
        theta,
        psi,
    });

    useEffect(() => {
        function keydownHandler(e: KeyboardEvent) {
            if (e.key.toLowerCase() === "shift") {
                setShiftDown(true);
            }
        }

        function keyupHandler(e: KeyboardEvent) {
            if (e.key.toLowerCase() === "shift") {
                setShiftDown(false);
            }
        }

        window.addEventListener("keydown", keydownHandler);
        window.addEventListener("keyup", keyupHandler);

        return () => {
            window.removeEventListener("keydown", keydownHandler);
            window.removeEventListener("keyup", keyupHandler);
        };
    }, []);

    useEffect(() => {
        function handler(e: MouseEvent) {
            if (e.shiftKey) {
                setOrientations([...orientations, nextOrientation]);
            }
        }

        window.addEventListener("click", handler);

        return () => {
            window.removeEventListener("click", handler);
        };
    }, [theta, psi]);

    useFrame(({ camera, mouse }) => {
        const { origin, major, normal } = lastOrientation;

        const cameraDirection = new THREE.Vector3(0, 0, 1);
        const cameraY = new THREE.Vector3(0, 1, 0);
        const cameraX = new THREE.Vector3(1, 0, 0);
        cameraDirection.applyEuler(camera.rotation);
        cameraY.applyEuler(camera.rotation);
        cameraX.applyEuler(camera.rotation);

        const clipMajorCenter = new THREE.Vector3();
        clipMajorCenter.copy(origin);

        clipMajorCenter.addScaledVector(major, clipOuterHeight / 2);

        /* cm = clip major */
        const cmPlaneComp = new THREE.Vector3();
        cmPlaneComp.copy(clipMajorCenter);
        cmPlaneComp.projectOnPlane(cameraDirection);

        const cmOrthoComp = new THREE.Vector3();
        cmOrthoComp.copy(clipMajorCenter);
        cmOrthoComp.addScaledVector(cmPlaneComp, -1);

        const mouseVector = new THREE.Vector3();
        mouseVector.copy(camera.position);

        const cameraInPlane = new THREE.Vector3();
        cameraInPlane.copy(mouseVector);
        cameraInPlane.projectOnPlane(cameraDirection);
        cameraInPlane.add(cmOrthoComp);

        const distanceToPlane = camera.position.distanceTo(cameraInPlane);

        const visiblePlaneHeight = visibleHeightAtDistance(
            distanceToPlane,
            camera
        );
        const visiblePlaneWidth = visibleWidthAtDistance(
            distanceToPlane,
            camera
        );

        const mouseInPlane = new THREE.Vector3();
        mouseInPlane.copy(cameraInPlane);
        mouseInPlane.addScaledVector(
            cameraY,
            (visiblePlaneHeight / 2) * mouse.y
        );
        mouseInPlane.addScaledVector(
            cameraX,
            (visiblePlaneWidth / 2) * mouse.x
        );

        /* Next clip direction */
        const nextDirection = new THREE.Vector3();
        nextDirection.copy(clipMajorCenter);
        nextDirection.addScaledVector(mouseInPlane, -1);

        const ortho = new THREE.Vector3();
        ortho.crossVectors(major, normal);

        const inClipPlane = new THREE.Vector3();
        inClipPlane.copy(nextDirection);
        inClipPlane.projectOnPlane(normal);
        inClipPlane.normalize();

        if (major.dot(nextDirection) < 0) {
            inClipPlane.multiplyScalar(-1);
        }

        if (ortho.dot(inClipPlane) > 0) {
            setTheta(-inClipPlane.angleTo(major));
        } else {
            setTheta(inClipPlane.angleTo(major));
        }

        const tip = new THREE.Vector3();
        tip.copy(clipMajorCenter);
        tip.addScaledVector(inClipPlane, clipOuterWidth / 2);

        const diff = new THREE.Vector3();
        diff.copy(mouseInPlane);

        diff.addScaledVector(tip, -1);

        if (diff.dot(normal) > 0) {
            setPsi(diff.angleTo(inClipPlane));
        } else {
            setPsi(-diff.angleTo(inClipPlane));
        }
    });

    const minY = orientations.reduce(
        (prev, next) => (next.origin.y < prev ? next.origin.y : prev),
        0
    );

    return (
        <>
            <ambientLight intensity={0.7} />
            <spotLight
                intensity={0.5}
                angle={0.1}
                penumbra={1}
                position={[10, 15, 10]}
                castShadow
            />
            <Suspense fallback={null}>
                {orientations.map((orientation, i) => (
                    <OrientedClip
                        key={`editor:${i}`}
                        orientation={orientation}
                        material={BasicGold}
                    />
                ))}
                <OrientedClip
                    orientation={nextOrientation}
                    material={BasicGold}
                />
                <Environment preset="sunset" />
                <ContactShadows
                    position={[0, minY - 0.4, 0]}
                    opacity={0.4}
                    width={10}
                    height={10}
                    blur={1}
                    far={20}
                />
            </Suspense>
            <OrbitControls
                minPolarAngle={Math.PI / 3}
                maxPolarAngle={Math.PI / 2}
                enablePan={!shiftDown}
                enableRotate={!shiftDown}
                enableZoom={!shiftDown}
            />
        </>
    );
};

const Editor: React.FC = () => {
    return (
        <Canvas
            shadows
            dpr={[1, 2]}
            camera={{
                position: [4, 2, 2],
                // position: [0, 0, 1],
                fov: 50,
            }}
        >
            <EditorInner />
        </Canvas>
    );
};

export default Editor;
