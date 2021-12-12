import * as THREE from "three";
import { GroupProps } from "@react-three/fiber";
import React, { useEffect, useRef } from "react";
import { intermediateWireHeight } from "../../constants";
import HalfCircleWire from "./building_blocks/half_circle_wire/half_circle_wire";
import StraightWire from "./building_blocks/straight_wire/straight_wire";
import {
    clipInnerHeight,
    clipInnerWidth,
    clipMiddleWidth,
    clipOuterHeight,
    clipOuterWidth,
} from "./constants/paper_clip_dimensions";
import { ClipOrientation } from "./types/orientation";

interface Props extends GroupProps {
    clipRef?: any;
    material: THREE.Material;
}

export const PaperClip: React.FC<Props> = (props) => {
    return (
        <group ref={props.clipRef} receiveShadow>
            {/* Top outer curve */}
            <HalfCircleWire
                radius={clipOuterWidth / 2}
                position-y={clipOuterHeight / 2}
                material={props.material}
            />
            {/* Left outer wire */}
            <StraightWire
                height={intermediateWireHeight}
                material={props.material}
                position={[
                    -clipOuterWidth / 2,
                    (clipOuterHeight - intermediateWireHeight) / 2,
                    0,
                ]}
            />
            {/* Right outer wire */}
            <StraightWire
                height={clipOuterHeight}
                position-x={clipOuterWidth / 2}
                material={props.material}
            />
            {/* Bottom curve */}
            <HalfCircleWire
                material={props.material}
                radius={clipMiddleWidth / 2}
                rotation-z={Math.PI}
                position={[
                    (clipOuterWidth - clipMiddleWidth) / 2,
                    -clipOuterHeight / 2,
                    0,
                ]}
            />
            {/* Left inner wire */}
            <StraightWire
                height={intermediateWireHeight}
                material={props.material}
                position={[
                    clipOuterWidth / 2 - clipMiddleWidth,
                    -(clipOuterHeight - intermediateWireHeight) / 2,
                    0,
                ]}
            />
            {/* Top inner curve */}
            <HalfCircleWire
                radius={clipInnerWidth / 2}
                position-y={clipInnerHeight / 2}
                material={props.material}
            />
            {/* Right inner wire */}
            <StraightWire
                height={clipInnerHeight}
                material={props.material}
                position-x={clipInnerWidth / 2}
            />
        </group>
    );
};

export const OrientedPaperClip: React.FC = () => {
    return <div />;
};

interface OrientedProps {
    orientation: ClipOrientation;
    material: THREE.Material;
}

export const OrientedClip: React.FC<OrientedProps> = (props) => {
    const clip = useRef<any>();

    useEffect(() => {
        const startingNormal = new THREE.Vector3(0, 0, 1);
        const startingMajor = new THREE.Vector3(0, 1, 0);

        startingNormal.applyEuler(clip.current.rotation);
        startingMajor.applyEuler(clip.current.rotation);

        const { origin, normal, major } = props.orientation;

        major.normalize();
        normal.normalize();

        /* First translate the clip to the proper position */
        clip.current.position.copy(origin);

        const q1 = new THREE.Quaternion();
        q1.setFromUnitVectors(startingNormal, normal);

        /* Perform the first rotation */
        clip.current.applyQuaternion(q1);

        /* Also rotate the starting major */
        startingMajor.applyQuaternion(q1);

        const q2 = new THREE.Quaternion();
        q2.setFromUnitVectors(startingMajor, major);

        clip.current.applyQuaternion(q2);
        startingMajor.applyQuaternion(q2);

        /* Rotate to the major a second time, 
        because only rotating once can sometimes 
        result in incomplete rotations  */
        if (startingMajor.angleTo(major) > 0.1) {
            const q22 = new THREE.Quaternion();
            q22.setFromUnitVectors(startingMajor, major);
            clip.current.applyQuaternion(q22);
        }
    }, [props.orientation]);

    return <PaperClip clipRef={clip} material={props.material} />;
};
