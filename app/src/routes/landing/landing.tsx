import * as THREE from "three";
import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
    OrientedClip,
    PaperClip,
} from "../../global_building_blocks/paper_clip/paper_clip";
import { BasicGold, BasicMix } from "../../global_three/materials";
import { Environment, OrbitControls } from "@react-three/drei";
import { ClipOrientation } from "../../global_building_blocks/paper_clip/types/orientation";

function Box() {
    return (
        <mesh>
            <boxBufferGeometry attach="geometry" />
            <meshLambertMaterial attach="material" color="hotpink" />
        </mesh>
    );
}

const mainOrientation: ClipOrientation = {
    major: new THREE.Vector3(0, 1, -1),
    normal: new THREE.Vector3(0, 1, 1),
    origin: new THREE.Vector3(0, 0, 0),
};

mainOrientation.major.normalize();
mainOrientation.normal.normalize();

const SpinningClipBackground: React.FC = () => {
    return (
        <Canvas
            camera={{
                position: [0.1, 0.2, 0],
                near: 0.01,
            }}
        >
            <color attach="background" args={["black"]} />
            <ambientLight intensity={0.7} />
            <spotLight
                intensity={0.5}
                angle={0.1}
                penumbra={1}
                position={[10, 15, 10]}
                castShadow
            />
            <Suspense fallback={null}>
                <OrientedClip
                    orientation={mainOrientation}
                    material={BasicMix}
                />
                <Environment preset="sunset" />
            </Suspense>
            <OrbitControls
                autoRotate
                minPolarAngle={Math.PI / 2}
                maxPolarAngle={Math.PI / 2}
                enableZoom={false}
                enablePan={false}
            />
        </Canvas>
    );
};

const MainPage: React.FC = () => {
    return (
        <div className="h-full w-full">
            <div className="flex justify-center flex-row bg-slate-600/20 text-white text-center backdrop-blur-sm py-5 text-xl font-bold">
                <div>About</div>
                <div className="px-10">Gallery</div>
                <div>Follow</div>
            </div>
            <div className="flex justify-center pt-10">
                <div
                    className={
                        "flex flex-col justify-center items-center bg-slate-800/60 backdrop-blur-md rounded-md px-40 py-10"
                    }
                >
                    <div className="font-extrabold text-9xl text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-purple-600">
                        ppr_clip
                    </div>
                    <div className="flex flex-row text-white pt-20 font-semibold text-2xl">
                        <span>Constantly Evolving.</span>
                        <span className="px-3">Intrinsically Valuable.</span>
                        <span>Artistically Disruptive.</span>
                    </div>
                    <div className="text-white font-bold pt-5 text-5xl">
                        NFTs,{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-br from-yellow-400 to-red-600">
                            {" "}
                            Leveled Up
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Landing: React.FC = () => {
    return (
        <>
            <div className="fixed overscroll-none inset-0 --z-10">
                <SpinningClipBackground />
            </div>
            <MainPage />
        </>
    );
};

export default Landing;
