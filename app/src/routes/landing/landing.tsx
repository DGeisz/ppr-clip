import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "drei";

function Box() {
    return (
        <mesh>
            <boxBufferGeometry attach="geometry" />
            <meshLambertMaterial attach="material" color="hotpink" />
        </mesh>
    );
}

const Landing: React.FC = () => {
    return (
        <Canvas>
            {/* <OrbitControls attach="camera" /> */}
            <Box />
        </Canvas>
    );
};

export default Landing;
