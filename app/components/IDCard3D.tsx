"use client";

import * as THREE from "three";
import { useEffect, useMemo, useRef, useState, Suspense } from "react";
import { Canvas, extend, useThree, useFrame } from "@react-three/fiber";
import { useGLTF, Environment } from "@react-three/drei";
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
} from "@react-three/rapier";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";

extend({ MeshLineGeometry, MeshLineMaterial });

const MODEL_URL =
  "https://assets.vercel.com/image/upload/contentful/image/e5382hct74si/5huRVDzcoDwnbgrKUo1Lzs/53b6dd7d6b4ffcdbd338fa60265949e1/tag.glb";

useGLTF.preload(MODEL_URL);

export default function IDCard3D() {
  return (
    <div className="relative h-full w-full min-h-[500px]">
      <Canvas camera={{ position: [0, 0, 13], fov: 25 }}>
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 8, 5]} intensity={1.8} />
        <directionalLight position={[-5, -2, -3]} intensity={0.6} />

        <Suspense fallback={null}>
          <Physics gravity={[0, -40, 0]} timeStep={1 / 60}>
            <Band />
          </Physics>
          <Environment preset="city" blur={0.6} />
        </Suspense>
      </Canvas>
    </div>
  );
}

function Band({ maxSpeed = 50, minSpeed = 10 }) {
  const band = useRef<any>(null);
  const fixed = useRef<any>(null);
  const j1 = useRef<any>(null);
  const j2 = useRef<any>(null);
  const j3 = useRef<any>(null);
  const card = useRef<any>(null);
  const hasAnimated = useRef(false);
  const introTimer = useRef(0);

  const { nodes, materials } = useGLTF(MODEL_URL) as any;
  const { width, height } = useThree((state) => state.size);

  const [dragged, drag] = useState<THREE.Vector3 | false>(false);
  const [hovered, hover] = useState(false);

  const vec = useMemo(() => new THREE.Vector3(), []);
  const ang = useMemo(() => new THREE.Vector3(), []);
  const rot = useMemo(() => new THREE.Vector3(), []);
  const dir = useMemo(() => new THREE.Vector3(), []);

  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
      ]),
    []
  );

  // Lanyard band text
  const bandTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 128;

    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#09090b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#22d3ee";
    ctx.font = "bold 52px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("THE VARMA ✦", 512, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 16;
    return texture;
  }, []);

  // Back face: Clean centered VN badge
  const backCardTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1650;

    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#0c0d12";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "rgba(34, 211, 238, 0.4)";
    ctx.lineWidth = 10;
    ctx.strokeRect(50, 160, canvas.width - 100, canvas.height - 210);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2 + 30;

    ctx.beginPath();
    ctx.arc(cx, cy, 260, 0, Math.PI * 2);
    ctx.fillStyle = "#18181b";
    ctx.fill();
    ctx.lineWidth = 10;
    ctx.strokeStyle = "#22d3ee";
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 200px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("VN", cx, cy);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 16;
    return texture;
  }, []);

  // Front face: VN emblem + name
  const frontCardTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1650;

    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#0c0d12";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "rgba(34, 211, 238, 0.4)";
    ctx.lineWidth = 10;
    ctx.strokeRect(50, 160, canvas.width - 100, canvas.height - 210);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2 + 30;

    ctx.beginPath();
    ctx.arc(cx, cy, 230, 0, Math.PI * 2);
    ctx.fillStyle = "#18181b";
    ctx.fill();
    ctx.lineWidth = 8;
    ctx.strokeStyle = "#22d3ee";
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 180px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("VN", cx, cy);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 64px sans-serif";
    ctx.fillText("VARMA NANDI", cx, cy + 360);

    ctx.fillStyle = "#22d3ee";
    ctx.font = "34px monospace";
    ctx.fillText("AUTHENTICATED ACCESS", cx, cy + 430);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 16;
    return texture;
  }, []);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.45, 0]]);

  useEffect(() => {
    document.body.style.cursor = hovered ? (dragged ? "grabbing" : "grab") : "auto";
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    if (dragged && card.current) {
      hasAnimated.current = true;
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));

      [card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp());
      card.current.setNextKinematicTranslation({
        x: vec.x - dragged.x,
        y: vec.y - dragged.y,
        z: vec.z - dragged.z,
      });
    }

    if (!fixed.current || !j1.current || !j2.current || !j3.current || !card.current) return;

    // Controlled smooth intro turns
    if (!hasAnimated.current) {
      introTimer.current += delta;
      const t = introTimer.current;
      if (t > 1.0 && t <= 5.5) {
        card.current.wakeUp();
        const progress = (t - 1.0) / 4.5;
        const targetSpin = Math.sin(progress * Math.PI) * 2.8;
        ang.copy(card.current.angvel());
        card.current.setAngvel({ x: ang.x * 0.8, y: targetSpin, z: ang.z * 0.8 }, true);
      } else if (t > 5.5) {
        hasAnimated.current = true;
      }
    }

    // Rope lerping
    [j1, j2].forEach((ref) => {
      const body = ref.current;
      if (!body.lerped) body.lerped = new THREE.Vector3().copy(body.translation());
      const dist = Math.max(0.1, Math.min(1, body.lerped.distanceTo(body.translation())));
      body.lerped.lerp(body.translation(), delta * (minSpeed + dist * (maxSpeed - minSpeed)));
    });

    curve.points[0].copy(j3.current.translation());
    curve.points[1].copy(j2.current.lerped);
    curve.points[2].copy(j1.current.lerped);
    curve.points[3].copy(fixed.current.translation());

    band.current?.geometry.setPoints(curve.getPoints(32));

    // Stabilizing front facing constraint
    ang.copy(card.current.angvel());
    rot.copy(card.current.rotation());
    card.current.setAngvel({
      x: ang.x,
      y: hasAnimated.current ? ang.y - rot.y * 0.4 : ang.y,
      z: ang.z,
    });
  });

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} type="fixed" />

        <RigidBody ref={j1} position={[0.5, 0, 0]} type="dynamic" canSleep colliders={false} angularDamping={2} linearDamping={2}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody ref={j2} position={[1, 0, 0]} type="dynamic" canSleep colliders={false} angularDamping={2} linearDamping={2}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody ref={j3} position={[1.5, 0, 0]} type="dynamic" canSleep colliders={false} angularDamping={2} linearDamping={2}>
          <BallCollider args={[0.1]} />
        </RigidBody>

        <RigidBody ref={card} position={[2, 0, 0]} type={dragged ? "kinematicPosition" : "dynamic"} canSleep colliders={false} angularDamping={2} linearDamping={2}>
          <CuboidCollider args={[0.8, 1.125, 0.03]} />

          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerDown={(e) => {
              e.stopPropagation();
              const target = e.target as EventTarget & { setPointerCapture?: (id: number) => void };
              target.setPointerCapture?.(e.pointerId);
              drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())));
            }}
            onPointerUp={(e) => {
              e.stopPropagation();
              const target = e.target as EventTarget & { releasePointerCapture?: (id: number) => void };
              target.releasePointerCapture?.(e.pointerId);
              drag(false);
            }}
          >
            {/* Acrylic base mesh */}
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial color="#090a0f" roughness={0.2} metalness={0.1} clearcoat={0.6} clearcoatRoughness={0.15} />
            </mesh>

            {/* Front Decal */}
            <mesh position={[0, 0.38, 0.007]}>
              <planeGeometry args={[0.82, 1.32]} />
              <meshBasicMaterial map={frontCardTexture} transparent polygonOffset polygonOffsetFactor={-1} />
            </mesh>

            {/* Back Decal */}
            <mesh position={[0, 0.38, -0.007]} rotation={[0, Math.PI, 0]}>
              <planeGeometry args={[0.82, 1.32]} />
              <meshBasicMaterial map={backCardTexture} transparent polygonOffset polygonOffsetFactor={-1} />
            </mesh>

            {/* Hardware metal parts */}
            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.25} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>

      {/* Lanyard Line */}
      <mesh ref={band}>
        {/* @ts-ignore */}
        <meshLineGeometry />
        {/* @ts-ignore */}
        <meshLineMaterial color="white" depthTest={false} resolution={[width, height]} useMap map={bandTexture} repeat={[-3, 1]} lineWidth={0.9} />
      </mesh>
    </>
  );
}