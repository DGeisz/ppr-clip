import { MeshProps } from "@react-three/fiber";
import React from "react";
import { clipWireRadius } from "../../constants/paper_clip_dimensions";

interface Props extends MeshProps {
    height: number;
}

const StraightWire: React.FC<Props> = (props) => {
    return (
        <mesh {...props} receiveShadow castShadow>
            <cylinderBufferGeometry
                args={[clipWireRadius, clipWireRadius, props.height, 10]}
            />
            {props.children}
        </mesh>
    );
};

export default StraightWire;
