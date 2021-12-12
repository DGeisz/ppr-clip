import { MeshProps } from "@react-three/fiber";
import React, { useMemo } from "react";
import * as THREE from "three";
import { clipWireRadius } from "../../constants/paper_clip_dimensions";

function bendTheCone(
    r1: number,
    r2: number,
    rMain: number,
    theta: number,
    segments: number
) {
    const geometry = new THREE.CylinderBufferGeometry(
        r1,
        r2,
        theta,
        16,
        segments
    );

    geometry.translate(rMain, theta / 2, 0);

    const position = geometry.getAttribute("position");

    for (let i = 0; i < position.count; i++) {
        const localTheta = position.getY(i);
        const localRadius = position.getX(i);
        position.setXY(
            i,
            Math.cos(localTheta) * localRadius,
            Math.sin(localTheta) * localRadius
        );
    }

    geometry.computeVertexNormals();

    return geometry;
}

interface Props extends MeshProps {
    radius: number;
    material: THREE.Material;
}

const HalfCircleWire: React.FC<Props> = (props) => {
    const geometry = useMemo(
        () =>
            bendTheCone(
                clipWireRadius,
                clipWireRadius,
                props.radius,
                THREE.MathUtils.degToRad(180),
                40
            ),
        []
    );

    return (
        <mesh
            {...props}
            geometry={geometry}
            material={props.material}
            receiveShadow
        />
    );
};

export default HalfCircleWire;
