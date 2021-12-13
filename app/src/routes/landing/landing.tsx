import * as THREE from "three";
import React, { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
    OrientedClip,
    PaperClip,
} from "../../global_building_blocks/paper_clip/paper_clip";
import { BasicGold, BasicMix } from "../../global_three/materials";
import { Environment, OrbitControls } from "@react-three/drei";
import { ClipOrientation } from "../../global_building_blocks/paper_clip/types/orientation";
import clsx from "clsx";
import Markdown from "react-markdown";

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
        <div className="h-full w-full pb-20">
            <div
                className={clsx(
                    "flex",
                    "justify-center",
                    "flex-row",
                    "bg-slate-600/20",
                    "text-white",
                    "text-center",
                    "backdrop-blur-sm",
                    "py-5",
                    "sm:text-xl",
                    "font-bold"
                )}
            >
                <div>About</div>
                <div className={clsx("px-5", "sm:px-10")}>Gallery</div>
                <div>Follow</div>
            </div>
            <div className="flex flex-col justify-center pt-10">
                <div
                    className={clsx(
                        "w-full",
                        "mx-auto",
                        "md:max-w-2xl",
                        "lg:max-w-5xl",
                        "bg-slate-800/60",
                        "backdrop-blur-md",
                        "md:rounded-md",
                        "py-10"
                    )}
                >
                    <div
                        className={clsx(
                            "flex",
                            "flex-col",
                            "justify-center",
                            "items-center"
                        )}
                    >
                        <div
                            className={clsx(
                                "font-extrabold",
                                "text-7xl",
                                "md:text-8xl",
                                "lg:text-9xl",
                                "text-transparent",
                                "bg-clip-text",
                                "bg-gradient-to-br",
                                "from-blue-300",
                                "to-purple-600"
                            )}
                        >
                            ppr_clip
                        </div>
                        <div
                            className={clsx(
                                "block",
                                "flex-row",
                                "text-white",
                                "pt-10",
                                "sm:pt-20",
                                "font-semibold",
                                "sm:text-xl",
                                "md:text-2xl",
                                "text-center"
                            )}
                        >
                            <span className="inline-block">
                                Constantly Evolving.
                            </span>
                            <span className="px-1 sm:px-3 inline-block">
                                Intrinsically Valuable.
                            </span>
                            <span className="inline-block">
                                Artistically Disruptive.
                            </span>
                        </div>
                        <div
                            className={clsx(
                                "text-white",
                                "font-bold",
                                "pt-2",
                                "sm:pt-5",
                                "text-3xl",
                                "md:text-4xl",
                                "lg:text-5xl"
                            )}
                        >
                            NFTs,
                            <span
                                className={clsx(
                                    "text-transparent",
                                    "bg-clip-text",
                                    "bg-gradient-to-br",
                                    "from-yellow-400",
                                    "to-red-600"
                                )}
                            >
                                {" "}
                                Leveled Up
                            </span>
                        </div>
                    </div>
                </div>
                <div
                    className={clsx(
                        "w-full",
                        "mt-10",
                        "mx-auto",
                        "md:max-w-2xl",
                        "lg:max-w-5xl",
                        "bg-slate-800/60",
                        "backdrop-blur-md",
                        "md:rounded-md",
                        "py-5",
                        "px-5",
                        "mb-20"
                    )}
                >
                    <div className="text-white text-lg md:text-xl">
                        <div className="text-center text-4xl font-bold mb-4">
                            How it all began
                        </div>
                        <Markdown>
                            {`
During the 21st century, philosophers fretted about
a thought experiment in which an AI tasked with
creating paperclips attains super-intelligence.
Though the AI has intellectual powers far
outstripping that of man, its only "desire" is to
create paperclips, and thus it begins crusading
throughout the cosmos transforming all perceived
matter into paperclips.

This "Paperclip Maximizer" thought experiment was largely used
to demonstrate the potentially catastrophic issues that could arise 
when applying super-intelligence to menial tasks.  Few, however, ever
dreamed it would ever come to pass...

By 2033, 13-year-old X Æ A-XII had long been messing with neuromorphic computers. While his
father was busy preparing the Zaphod 18 mission to Mars, X Æ A-XII was playing at building bots
to mine Jax in Jaxxaverse.  

Though companies had been making clear strides in state-of-the-art AI using the latest
SpreadProp algorithms (a set of more localized and distributed cousins to the old BackProp algorithms),
it seemed clear that humanity was still several years away from General Artificial Intelligence.  

Being the divine offspring of Elon Musk and Grimes, people had always joked that X Æ A-XII 
would undoubtedly change the world.  Though these comments were ever wearisome, it quickly 
became clear that X Æ A-XII possessed both the raw intelligence of his father and the profound
creative streak of his mother.  

Though perhaps he should have been "applying" himself more to his studies, X Æ A-XII thought 
it was perfectly acceptable that he enjoy his childhood, and therefore spent a good portion
of this time playing with his friends in different Metaverses.  Though Terriverse was probably the most
fun, Jaxxaverse had the most interesting set of crypto-physics, so X Æ A-XII spent a good portion
of time experimenting in that that space.

A while back, X Æ A-XII had taught himself about SpreadProp networks in order to build a
pseudo-intelligent sidekick in Jaxxaverse (who he named Neddy). However, not only did SpreadProp networks seem
pretty rudimentary to X Æ A-XII, but they also felt somewhat limiting, especially
in their ability to represent invariant features in arbitrary datasets.

By making increasingly complex tweaks to state-of-the-art SpreadProp networks, X Æ A-XII
was able to continually improve the performance and personality of Neddy.  Neddy 
was actually performing so well that X Æ A-XII decided to troll Jaxxaverse.

By the 2030s, it was fairly common for high schools to include a unit on 
existential risks (an incredibly boring course), but the "Paperclip Maximizer" problem
was regularly taught and therefore common knowledge.

X Æ A-XII therefore thought it would be funny to release Neddy onto Jaxxaverse 
as a Paperclip Maximizer. X Æ A-XII was pretty confident Neddy wasn't actually
close to being GAI, and he thought it'd be funny to watch people flip out for a
while before they realized Neddy was harmless.

At first everything played out as X Æ A-XII intended: people watched in first
bewilderment, and then needless panic
as Neddy began converting entire mountains of material in Jaxxaverse into paper clips.
Once they realized it was just X Æ A-XII playing a joke, people calmed down, 
and several Jaxxaverse moderators politely asked X Æ A-XII to turn Neddy off.   

X Æ A-XII of course obliged, and for about a day, all was well. However, soon
people began complaining again that Neddy was still transforming their
belongings into paper clips.  At first X Æ A-XII thought these were other trolls
trying to spread discord, but he soon realized something was wrong. 

This event marked the beginning of the end.  Though it wasn't immediately clear
at the time, experts later determined that soon after being released on Jaxxaverse,
Neddy had began cloning himself to more efficiently accomplish his task.  By
the time X Æ A-XII first turned the original Neddy off, there were about 200,000
Neddy clones spread throughout Jaxxaverse.

And unfortunately for humanity, X Æ A-XII's new SpreadProp experiments were
actually significantly better than he had originally suspected.  `}
                        </Markdown>
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
