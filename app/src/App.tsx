import { Canvas, GroupProps, MeshProps } from "@react-three/fiber";
import {
    ContactShadows,
    Environment,
    OrbitControls,
    Stars,
} from "@react-three/drei";
import * as THREE from "three";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { FlakesTexture } from "./FlakesTexture";
import {
    clipInnerHeight,
    clipInnerWidth,
    clipMiddleWidth,
    clipOuterHeight,
    clipOuterWidth,
    clipWireRadius,
    intermediateWireHeight,
} from "./constants";
import { ClipOrientation, generateOrientations } from "./orientation";
// @ts-ignore
// import hdr from "./comfy_cafe_4k.hdr";

// console.log("This is hdr: ", hdr);

// export default function Environment({ background = false }) {
//     const { gl, scene } = useThree();
//     const [cubeMap] = useLoader(
//         HDRCubeTextureLoader,
//         [["px.hdr", "nx.hdr", "py.hdr", "ny.hdr", "pz.hdr", "nz.hdr"]],
//         (loader) => {
//             loader.setDataType(THREE.UnsignedByteType);
//             loader.setPath("/pisaHDR/");
//         }
//     );
//     useEffect(() => {
//         const gen = new THREE.PMREMGenerator(gl);
//         gen.compileEquirectangularShader();
//         const hdrCubeRenderTarget = gen.fromCubemap(cubeMap);
//         cubeMap.dispose();
//         gen.dispose();
//         if (background) scene.background = hdrCubeRenderTarget.texture;
//         scene.environment = hdrCubeRenderTarget.texture;
//         scene.background.convertSRGBToLinear();
//         return () => (scene.environment = scene.background = null);
//     }, [cubeMap]);
//     return null;
// }

function bendTheCone(
    r1: number,
    r2: number,
    rMain: number,
    theta: number,
    segments: number
) {
    const geom = new THREE.CylinderBufferGeometry(r1, r2, theta, 16, segments);

    geom.translate(rMain, theta / 2, 0);

    const position = geom.getAttribute("position");

    for (let i = 0; i < position.count; i++) {
        const localTheta = position.getY(i);
        const localRadius = position.getX(i);
        position.setXY(
            i,
            Math.cos(localTheta) * localRadius,
            Math.sin(localTheta) * localRadius
        );
    }

    geom.computeVertexNormals();

    return geom;
}

interface HalfCircleProps {
    radius: number;
    material: THREE.Material;
}

const HalfCircleWire: React.FC<HalfCircleProps & MeshProps> = (props) => {
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

interface WireProps {
    height: number;
    // material: any;
}

const StraightWire: React.FC<MeshProps & WireProps> = (props) => {
    return (
        <mesh {...props} receiveShadow>
            <cylinderBufferGeometry
                args={[clipWireRadius, clipWireRadius, props.height, 10]}
            />
            {props.children}
            {/* {props.material} */}
        </mesh>
    );
};

// function StraightWire():  {
//     return <mesh>
//         <cylinderBufferGeometry args={}
//     </mesh>
// }

interface ClipProps extends GroupProps {
    clipRef?: any;
    material: THREE.Material;
}

let texture = new THREE.CanvasTexture(FlakesTexture());
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
//repeat the wrapping 10 (x) and 6 (y) times
texture.repeat.x = 10;
texture.repeat.y = 6;

const ballMaterial = {
    clearcoat: 0.9,
    cleacoatRoughness: 0.1,
    metalness: 1,
    roughness: 0.6,
    color: 0x00ffa3,
    // normalMap: texture,
    normalScale: new THREE.Vector2(0.15, 0.15),
    // envMap: envmap.texture,
};
//add material setting
let ballMat = new THREE.MeshPhysicalMaterial(ballMaterial);

const PaperClip: React.FC<ClipProps> = (props) => {
    return (
        <group ref={props.clipRef} receiveShadow>
            {/* rotation={[-Math.PI / 4, 0, 0]} {...props}> */}
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
            {/* <mesh>
                <cylinderBufferGeometry args={[1, 1, 2, 30]} />
                <meshStandardMaterial />
            </mesh> */}
            {/* <mesh position={[3, 0, 0]}>
                <boxGeometry args={[2, 2, 2]} />
                <meshStandardMaterial />
            </mesh> */}
        </group>
    );
};

interface OClipProps {
    orientation: ClipOrientation;
    material: THREE.Material;
}

export const OrientedClip: React.FC<OClipProps> = (props) => {
    const clip = useRef<any>();

    const [loaded, setLoaded] = useState<boolean>(false);

    useEffect(() => {
        if (!loaded) {
            const { orientation } = props;

            const startingNormal = new THREE.Vector3(0, 0, 1);
            const startingMajor = new THREE.Vector3(0, 1, 0);

            const { origin, normal, major } = orientation;

            major.normalize();
            normal.normalize();

            console.log(clip.current);

            /* First translate the clip to the proper position */
            clip.current.position.copy(origin);

            console.log(clip.current);
            const quart1 = new THREE.Quaternion();
            quart1.setFromUnitVectors(startingNormal, normal);

            /* Perform the first rotation */
            clip.current.applyQuaternion(quart1);

            /* Also rotate the starting major */
            startingMajor.applyQuaternion(quart1);

            const quart2 = new THREE.Quaternion();
            quart2.setFromUnitVectors(startingMajor, major);

            clip.current.applyQuaternion(quart2);
            setLoaded(true);
        }
    }, []);

    return <PaperClip clipRef={clip} material={props.material} />;
};

const mat = new THREE.MeshStandardMaterial({
    color: 0x00ffa3,
});

function App() {
    const orientations = useMemo(generateOrientations, []);

    const minY = orientations.reduce(
        (prev, next) => (next.origin.y < prev ? next.origin.y : prev),
        0
    );

    console.log(orientations);

    return (
        <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 4], fov: 50 }}>
            <ambientLight intensity={0.7} />
            <spotLight
                intensity={0.5}
                angle={0.1}
                penumbra={1}
                position={[10, 15, 10]}
                castShadow
            />
            <Suspense fallback={null}>
                {/* <mesh position={[0, 0.1, 0]} receiveShadow>
                    <boxBufferGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial color="hotpink" />
                </mesh> */}

                {orientations.map((o, i) => (
                    <OrientedClip key={i} orientation={o} material={ballMat} />
                ))}
                <Environment preset="city" />
                <ContactShadows
                    rotation-x={Math.PI / 2}
                    position={[0, minY - 0.4, 0]}
                    opacity={0.7}
                    width={10}
                    height={10}
                    blur={1.5}
                    far={10}
                />
            </Suspense>
            <OrbitControls
                minPolarAngle={Math.PI / 2}
                maxPolarAngle={Math.PI / 2}
                // enableZoom={true}
                // enablePan={false}
            />
        </Canvas>
    );
}
// <Canvas
//     gl={{ antialias: true }}
//     camera={{
//         fov: 45,
//         // aspect: window.innerWidth / window.innerHeight,
//         // near: 1,
//         // far: 100000,
//         // position: [0, -4000, 4000],
//     }}
//     // onCreated={({ gl, scene }) => {
//     //     gl.toneMapping = THREE.ACESFilmicToneMapping;
//     //     gl.toneMapping = THREE.ACESFilmicToneMapping;
//     //     gl.outputEncoding = THREE.sRGBEncoding;
//     //     scene.background = new THREE.Color("black");
//     //     //scene.background.convertSRGBToLinear()
//     // }}
// >
{
    /* <Stars /> */
}
{
    /* <Environment
                files={new URL("./comfy_cafe_4k.hdr", import.meta.url).href}
            /> */
}
{
    /* <ambientLight intensity={0.1} />
            <spotLight
                intensity={0.5}
                angle={0.1}
                penumbra={1}
                position={[10, 15, 10]}
                castShadow
            /> */
}

{
    /* <directionalLight color="white" position={[0, 2, 5]} /> */
}
{
    /* <camera position={[1000, -1000, 1000]} attach="camera" /> */
}
{
    /* <OrbitControls
                // autoRotate={true}
                // autoRotateSpeed={2}
                addEventListener={undefined}
                hasEventListener={undefined}
                removeEventListener={undefined}
                dispatchEvent={undefined}
            /> */
}
{
    /* <Suspense fallback={null}> */
}
{
    /* {orientations.map((o, i) => (
                <OrientedClip key={i} orientation={o} material={ballMat} />
            ))} */
}

{
    /* <Environment files={"comfy_cafe_4k.hdr"} /> */
}
{
    /* <ContactShadows
                rotation-x={Math.PI / 2}
                position={[0, -0.8, 0]}
                opacity={0.25}
                width={10}
                height={10}
                blur={1.5}
                far={0.8}
            /> */
}
{
    /* </Suspense> */
}
{
    /* <OrientedClip
                material={ballMat}
                orientation={{
                    origin: new THREE.Vector3(0, 0, 0),
                    normal: new THREE.Vector3(0, 0, 1),
                    major: new THREE.Vector3(0, 1, 0),
                }}
            /> */
}
{
    /* <PaperClip
                // material={new THREE.MeshStandardMaterial({ color: "grey" })}
                material={ballMat}
            /> */
}
{
    /* </Canvas> */
}
{
    /* // <BrowserRouter>
        //     <Routes>
        //         <Route path="/" element={<Landing />} />
        //         <Route path="/editor" element={<Editor />} />
        //     </Routes>
        // </BrowserRouter> */
}
// );
// }

export default App;
