import {
    Canvas,
    GroupProps,
    MeshProps,
    useFrame,
    useThree,
} from "@react-three/fiber";
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
    startingBlockHeight,
    startingBlockRadius,
    startingBlockWidth,
} from "./constants";
import {
    ClipOrientation,
    generateOrientations,
    getNewOrientationFromOld,
    startingOrientation,
} from "./orientation";
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
        <mesh {...props} receiveShadow castShadow>
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
    color: 0xffbf00,
    normalMap: texture,
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
    // const marker = useRef<any>();

    const [loaded, setLoaded] = useState<boolean>(false);

    // const [lGeo, setLGeo] = useState<THREE.BufferGeometry>(
    //     new THREE.BufferGeometry()
    // );

    // const lineGeometry = useMemo(() => {
    //     const points = [];
    //     const { orientation } = props;

    //     const { origin, normal, major } = orientation;

    //     major.normalize();

    //     const p0 = new THREE.Vector3();
    //     p0.copy(origin);
    //     p0.addScaledVector(normal, clipOuterHeight);

    //     const p1 = new THREE.Vector3();
    //     p1.copy(origin);

    //     const p2 = new THREE.Vector3();
    //     p2.copy(origin);

    //     p2.addScaledVector(major, clipOuterHeight);

    //     return new THREE.BufferGeometry().setFromPoints([p0, p1, p2]);
    // }, []);

    function setToOrientation(orientation: ClipOrientation) {
        const startingNormal = new THREE.Vector3(0, 0, 1);
        const startingMajor = new THREE.Vector3(0, 1, 0);

        startingNormal.applyEuler(clip.current.rotation);
        startingMajor.applyEuler(clip.current.rotation);

        const { origin, normal, major } = orientation;

        major.normalize();
        normal.normalize();

        // console.log(clip.current);

        /* First translate the clip to the proper position */
        clip.current.position.copy(origin);
        // marker.current.position.copy(origin);
        // console.log(clip.current.position, clip.current.rotation);

        // console.log(clip.current);
        const quart1 = new THREE.Quaternion();
        quart1.setFromUnitVectors(startingNormal, normal);

        // /* Perform the first rotation */
        clip.current.applyQuaternion(quart1);
        // // marker.current.applyQuaternion(quart1);

        // /* Also rotate the starting major */
        // startingMajor.applyQuaternion(quart1);

        // const quart2 = new THREE.Quaternion();
        // quart2.setFromUnitVectors(startingMajor, major);

        // clip.current.applyQuaternion(quart2);
        // // marker.current.applyQuaternion(quart2);
        // startingMajor.applyQuaternion(quart2);

        // const q22 = new THREE.Quaternion();
        // q22.setFromUnitVectors(startingMajor, major);

        // clip.current.applyQuaternion(q22);

        // marker.current.applyQuaternion(q22);

        // setLGeo(new THREE.BufferGeometry().setFromPoints([p1, p2]));
    }

    useEffect(() => {
        const startingNormal = new THREE.Vector3(0, 0, 1);
        const startingMajor = new THREE.Vector3(0, 1, 0);

        startingNormal.applyEuler(clip.current.rotation);
        startingMajor.applyEuler(clip.current.rotation);

        const { origin, normal, major } = props.orientation;

        major.normalize();
        normal.normalize();

        // console.log(clip.current);

        /* First translate the clip to the proper position */
        clip.current.position.copy(origin);
        // marker.current.position.copy(origin);

        // console.log(clip.current);
        const quart1 = new THREE.Quaternion();
        quart1.setFromUnitVectors(startingNormal, normal);

        /* Perform the first rotation */
        clip.current.applyQuaternion(quart1);
        // marker.current.applyQuaternion(quart1);

        /* Also rotate the starting major */
        startingMajor.applyQuaternion(quart1);

        const quart2 = new THREE.Quaternion();
        quart2.setFromUnitVectors(startingMajor, major);

        clip.current.applyQuaternion(quart2);
        // marker.current.applyQuaternion(quart2);
        startingMajor.applyQuaternion(quart2);

        const q22 = new THREE.Quaternion();
        q22.setFromUnitVectors(startingMajor, major);

        clip.current.applyQuaternion(q22);
        // marker.current.applyQuaternion(q22);

        // setLGeo(new THREE.BufferGeometry().setFromPoints([p1, p2]));
    }, [props.orientation]);

    return (
        <>
            <PaperClip clipRef={clip} material={props.material} />
            {/* <mesh ref={marker} material={props.material}>
                <boxBufferGeometry
                    args={[clipInnerHeight, clipInnerHeight, clipInnerHeight]}
                />
                {/* <meshStandardMaterial color="hotpink" /> */}
            {/* </mesh> */}
            {/* <line geometry={lineGeometry}>
                <lineBasicMaterial
                    attach="material"
                    color={"#9c88ff"}
                    linewidth={10}
                    linecap={"round"}
                    linejoin={"round"}
                />
            </line>
            <line geometry={lGeo}>
                <lineBasicMaterial
                    attach="material"
                    color={"red"}
                    linewidth={20}
                    linecap={"round"}
                    linejoin={"round"}
                />
            </line> */}
        </>
    );
};

const mat = new THREE.MeshStandardMaterial({
    color: 0x00ffa3,
});

// const { origin, major, normal } = startingOrientation;

// const a1 = new THREE.Vector3();
// a1.copy(origin);

// a1.addScaledVector(major, clipOuterHeight / 2);

function AppInner() {
    const orientations = useMemo(generateOrientations, []);

    const [theta, setTheta] = useState<number>(Math.PI / 2);
    const [psi, setPsi] = useState<number>(0);

    const [o, setO] = useState<ClipOrientation[]>([startingOrientation]);

    const minY = orientations.reduce(
        (prev, next) => (next.origin.y < prev ? next.origin.y : prev),
        0
    );

    const lastOrientation = o[o.length - 1];
    const { origin, major, normal } = lastOrientation;

    const nextOrientation = getNewOrientationFromOld(lastOrientation, {
        theta,
        psi,
    });

    useEffect(() => {
        function handler(e: MouseEvent) {
            if (e.shiftKey) {
                setO([...o, nextOrientation]);
            }
        }

        window.addEventListener("click", handler);

        return () => {
            window.removeEventListener("click", handler);
        };
    }, [theta, psi]);

    useFrame(({ camera, clock, mouse }) => {
        const pos = new THREE.Vector3();

        const len = camera.position.length() * 2;

        const vec = new THREE.Vector3(len * mouse.x, len * mouse.y, 0);
        vec.unproject(camera);

        console.log(vec, camera.position);

        // pos.copy(vec);
        // pos.addScaledVector(camera.position, -1);

        pos.copy(vec);

        const b = new THREE.Vector3();
        b.copy(origin);

        b.addScaledVector(major, clipOuterHeight / 2);

        pos.addScaledVector(b, -1);

        const time = clock.getElapsedTime();
        const cp = new THREE.Vector3();
        cp.copy(pos);

        const p = new THREE.Vector3();

        p.crossVectors(major, normal);

        cp.projectOnPlane(normal);
        cp.normalize();
        // console.log(time);

        setTheta((p.dot(cp) > 0 ? -1 : 1) * cp.angleTo(major));

        const tip = new THREE.Vector3();

        tip.copy(origin);
        const itip = new THREE.Vector3();

        itip.addScaledVector(cp, clipOuterWidth / 2);

        tip.add(itip);

        const diff = new THREE.Vector3();
        diff.copy(pos);

        diff.addScaledVector(tip, -1);

        setPsi(diff.angleTo(cp));
    });

    // console.log(nextOrientation);

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
                {/* <mesh position={[0, 0.1, 0]} receiveShadow>
                    <boxBufferGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial color="hotpink" />
                </mesh> */}
                {/* <mesh>
                    <boxBufferGeometry arg={} />
                </mesh> */}
                {/* <group>
                    <mesh
                        material={ballMat}
                        position-y={-startingBlockHeight / 2}
                    >
                         <octahedronBufferGeometry
                            args={[startingBlockRadius, 0]}
                        /> 
                        <cylinderBufferGeometry
                            args={[
                                startingBlockRadius,
                                startingBlockRadius,
                                startingBlockRadius,
                                30,
                            ]}
                        />
                    </mesh>
                </group> */}
                {o.map((or) => (
                    <OrientedClip orientation={or} material={ballMat} />
                ))}
                <OrientedClip
                    orientation={startingOrientation}
                    material={ballMat}
                />
                <OrientedClip
                    orientation={nextOrientation}
                    material={ballMat}
                />

                {/* {orientations.map((o, i) => (
                    <OrientedClip key={i} orientation={o} material={ballMat} />
                ))} */}
                <Environment preset="sunset" />
                <ContactShadows
                    // rotation-x={Math.PI / 2}
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
                // onChange={(e) => {
                //     console.log(e.target);
                // }}
                // enableZoom={true}
                // enablePan={false}
            />
        </>
    );
}

function App() {
    // useThree(({ camera }) => {
    //     // camera.position.set(0, 1, 1);
    // });

    const orientations = useMemo(generateOrientations, []);

    const minY = orientations.reduce(
        (prev, next) => (next.origin.y < prev ? next.origin.y : prev),
        0
    );

    // console.log(orientations);

    return (
        <Canvas shadows dpr={[1, 2]} camera={{ position: [4, 2, 2], fov: 50 }}>
            <AppInner />
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
