import { Suspense, useRef, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { DeliveryRig } from "./DeliveryRig";

function ParallaxRig({ children }: { children: ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  useFrame(() => {
    if (!group.current) return;
    // Lerped, not snapped — a direct 1:1 follow reads as jittery/cheap;
    // easing toward the target each frame is what makes it feel considered.
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, pointer.x * 0.25, 0.04);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -pointer.y * 0.1, 0.04);
  });

  return <group ref={group}>{children}</group>;
}

export function HeroCanvas({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [0, 2.4, 5.5], fov: 38 }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={["#12141c"]} />
      <fog attach="fog" args={["#12141c", 6, 12]} />

      <ambientLight intensity={0.55} />
      <directionalLight
        position={[3, 4, 2]}
        intensity={1.4}
        color="#f5c77e"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-4, 2, -3]} intensity={0.4} color="#0f7a6c" />

      <Suspense fallback={null}>
        {reduceMotion ? (
          <DeliveryRig reduceMotion />
        ) : (
          <ParallaxRig>
            <DeliveryRig reduceMotion={false} />
          </ParallaxRig>
        )}
        <ContactShadows position={[0, -0.01, 0]} opacity={0.55} scale={10} blur={2.2} far={2} />
      </Suspense>
    </Canvas>
  );
}
