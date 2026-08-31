import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Brand tokens from src/index.css, duplicated here as plain hex since
// Three.js materials need real color values, not CSS custom properties.
const ROUTE_TEAL = "#0f7a6c";
const VEST_AMBER = "#f5a623";
const INK = "#12141c";
const SLATE = "#5b6472";

/**
 * A closed loop rather than a straight line — "a rider making a
 * delivery" reads more naturally as a continuous route than a one-shot
 * traversal that has to awkwardly reset. This is the same route-line
 * idea as StatusFlowRail, just literalized in three dimensions.
 */
function useRouteCurve() {
  return useMemo(() => {
    const points = [
      new THREE.Vector3(-3.2, 0, 1.4),
      new THREE.Vector3(-1.1, 0, 2.6),
      new THREE.Vector3(1.6, 0, 1.8),
      new THREE.Vector3(3.0, 0, -0.6),
      new THREE.Vector3(0.9, 0, -2.4),
      new THREE.Vector3(-1.8, 0, -1.6),
    ];
    return new THREE.CatmullRomCurve3(points, true, "catmullrom", 0.5);
  }, []);
}

export function RouteLine({ curve }: { curve: THREE.CatmullRomCurve3 }) {
  // Built as a real THREE.Line and rendered via <primitive> rather than
  // JSX <line>...</line> — the latter collides with React DOM's own SVG
  // <line> element typing when both are in scope, a known source of
  // confusing type errors in the R3F ecosystem. <primitive> sidesteps
  // that ambiguity entirely.
  const lineObject = useMemo(() => {
    const points = curve.getPoints(120);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: ROUTE_TEAL, transparent: true, opacity: 0.35 });
    return new THREE.Line(geometry, material);
  }, [curve]);

  return <primitive object={lineObject} />;
}

export function DeliveryRig({ reduceMotion }: { reduceMotion: boolean }) {
  const curve = useRouteCurve();
  const rig = useRef<THREE.Group>(null);
  const frontWheel = useRef<THREE.Mesh>(null);
  const backWheel = useRef<THREE.Mesh>(null);
  const progress = useRef(0);

  useFrame((_state, delta) => {
    if (!rig.current) return;

    if (!reduceMotion) {
      progress.current = (progress.current + delta * 0.05) % 1;
    }

    const position = curve.getPointAt(progress.current);
    const tangent = curve.getTangentAt(progress.current);
    const lookTarget = position.clone().add(tangent);

    rig.current.position.set(position.x, position.y, position.z);
    rig.current.lookAt(lookTarget.x, position.y, lookTarget.z);

    // A gentle vertical bob reads as suspension travel rather than the
    // rig floating — subtle enough to not fight the path-following
    // motion for attention.
    rig.current.position.y = 0.02 + Math.sin(_state.clock.elapsedTime * 4) * 0.015;

    if (!reduceMotion) {
      const spin = delta * 14;
      if (frontWheel.current) frontWheel.current.rotation.x += spin;
      if (backWheel.current) backWheel.current.rotation.x += spin;
    }
  });

  return (
    <>
      <RouteLine curve={curve} />
      <group ref={rig} rotation={[0, Math.PI, 0]}>
        {/* --- motorbike --- */}
        <group position={[0, 0.32, 0]}>
          {/* body */}
          <mesh position={[0, 0.06, 0]} castShadow>
            <capsuleGeometry args={[0.1, 0.55, 4, 8]} />
            <meshStandardMaterial color={INK} roughness={0.4} metalness={0.3} />
          </mesh>
          {/* front wheel */}
          <mesh ref={frontWheel} position={[0, -0.28, 0.42]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <torusGeometry args={[0.22, 0.05, 8, 24]} />
            <meshStandardMaterial color={SLATE} roughness={0.6} />
          </mesh>
          {/* back wheel */}
          <mesh ref={backWheel} position={[0, -0.28, -0.42]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <torusGeometry args={[0.22, 0.05, 8, 24]} />
            <meshStandardMaterial color={SLATE} roughness={0.6} />
          </mesh>
          {/* handlebar */}
          <mesh position={[0, 0.28, 0.34]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.015, 0.015, 0.34, 8]} />
            <meshStandardMaterial color={INK} />
          </mesh>
          {/* delivery box on the back rack — amber, the same "in motion" accent used across the app */}
          <mesh position={[0, 0.18, -0.5]} castShadow>
            <boxGeometry args={[0.26, 0.22, 0.22]} />
            <meshStandardMaterial color={VEST_AMBER} roughness={0.5} />
          </mesh>
        </group>

        {/* --- rider (deliberately abstract, not anatomical) --- */}
        <group position={[0, 0.68, 0.02]} rotation={[0.15, 0, 0]}>
          <mesh castShadow>
            <capsuleGeometry args={[0.12, 0.32, 4, 8]} />
            <meshStandardMaterial color={ROUTE_TEAL} roughness={0.55} />
          </mesh>
          <mesh position={[0, 0.32, 0.03]} castShadow>
            <sphereGeometry args={[0.13, 16, 16]} />
            <meshStandardMaterial color={INK} roughness={0.3} metalness={0.2} />
          </mesh>
          {/* arms reaching to the handlebar */}
          <mesh position={[0.1, -0.02, 0.22]} rotation={[0.9, 0, -0.3]} castShadow>
            <capsuleGeometry args={[0.045, 0.28, 4, 8]} />
            <meshStandardMaterial color={ROUTE_TEAL} roughness={0.55} />
          </mesh>
          <mesh position={[-0.1, -0.02, 0.22]} rotation={[0.9, 0, 0.3]} castShadow>
            <capsuleGeometry args={[0.045, 0.28, 4, 8]} />
            <meshStandardMaterial color={ROUTE_TEAL} roughness={0.55} />
          </mesh>
        </group>
      </group>
    </>
  );
}
