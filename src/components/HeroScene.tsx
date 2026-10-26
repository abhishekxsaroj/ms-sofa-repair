import { Suspense, useLayoutEffect, useMemo, useRef, type MutableRefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, PerspectiveCamera, RoundedBox } from "@react-three/drei";
import gsap from "gsap";
import * as THREE from "three";

type SceneProps = {
  reduced: boolean;
  progress: MutableRefObject<number>;
};

const WALL = "#161310";
const LINEN = "#c4b08c";

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp01((x - edge0) / Math.max(0.0001, edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function makeLinenTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#b89a72";
  ctx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 1) {
    for (let x = 0; x < 256; x += 1) {
      const weave = ((x % 4 === 0 ? 1 : 0) + (y % 3 === 0 ? 1 : 0)) * 0.07;
      const noise = ((x * 19 + y * 13) % 11) / 180;
      ctx.fillStyle = `rgba(18, 12, 8, ${weave + noise})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4.5, 7);
  texture.anisotropy = 8;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeCurtainGeometry(width: number, height: number, pleats: number) {
  const geometry = new THREE.PlaneGeometry(width, height, 96, 64);
  const position = geometry.attributes.position;
  const colors = new Float32Array(position.count * 3);
  const light = new THREE.Color("#e2d0b2");
  const valley = new THREE.Color("#7a6248");
  const shade = new THREE.Color();

  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i);
    const y = position.getY(i);
    const u = (x + width / 2) / width;
    const v = (y + height / 2) / height;
    const hem = 1 - v;

    const p = u * pleats;
    const cell = Math.floor(p);
    const local = p - cell;
    const irregular = 0.9 + 0.12 * Math.sin(cell * 1.73 + 0.4);
    const pinch = Math.pow(Math.abs(local - 0.5) * 2, lerp(1.55, 0.85, v));
    const depth = (0.12 + 0.025 * Math.sin(cell * 2.1)) * lerp(0.42, 1, v) * irregular;
    const ripple = Math.sin(u * Math.PI * 16 + v * 3.2) * 0.008 * hem;

    const gather = lerp(1, 1.01, Math.pow(hem, 1.6));
    const bunch = (local - 0.5) * lerp(0.08, 0.22, v) * (width / pleats) * 0.28;
    const sag = Math.sin(u * Math.PI) * 0.006 * hem;
    const hemWeight = Math.pow(hem, 2.2) * 0.018;

    const z = (1 - pinch) * depth + ripple + hemWeight;
    position.setXYZ(i, x * gather - bunch, y - sag, z);

    shade.copy(valley).lerp(light, 0.18 + pinch * 0.72);
    colors[i * 3] = shade.r;
    colors[i * 3 + 1] = shade.g;
    colors[i * 3 + 2] = shade.b;
  }

  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return geometry;
}

function Stage() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.4]} receiveShadow>
        <planeGeometry args={[16, 14]} />
        <meshStandardMaterial color="#0d0b09" roughness={0.94} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.15, 0.008, 0.55]}>
        <circleGeometry args={[2.15, 48]} />
        <meshStandardMaterial color="#1a1612" roughness={0.9} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 4.15, 0]}>
        <planeGeometry args={[16, 14]} />
        <meshStandardMaterial color="#100e0c" roughness={1} />
      </mesh>

      <mesh position={[-5.35, 2.05, -3.55]}>
        <boxGeometry args={[4.4, 4.2, 0.2]} />
        <meshStandardMaterial color={WALL} roughness={0.9} />
      </mesh>
      <mesh position={[5.35, 2.05, -3.55]}>
        <boxGeometry args={[4.4, 4.2, 0.2]} />
        <meshStandardMaterial color={WALL} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.32, -3.55]}>
        <boxGeometry args={[6.4, 0.64, 0.2]} />
        <meshStandardMaterial color={WALL} roughness={0.9} />
      </mesh>
      <mesh position={[0, 3.78, -3.55]}>
        <boxGeometry args={[6.4, 0.72, 0.2]} />
        <meshStandardMaterial color={WALL} roughness={0.9} />
      </mesh>

      <mesh position={[-4.4, 1.9, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[9, 4.4]} />
        <meshStandardMaterial color="#12100e" roughness={0.94} />
      </mesh>
      <mesh position={[4.4, 1.9, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[9, 4.4]} />
        <meshStandardMaterial color="#13110f" roughness={0.94} />
      </mesh>

      <mesh position={[0, 3.5, -3.34]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.032, 0.032, 6.7, 16]} />
        <meshStandardMaterial color="#c4a574" roughness={0.22} metalness={0.62} />
      </mesh>
      <mesh position={[-3.32, 3.5, -3.34]}>
        <sphereGeometry args={[0.05, 12, 10]} />
        <meshStandardMaterial color="#c4a574" roughness={0.22} metalness={0.62} />
      </mesh>
      <mesh position={[3.32, 3.5, -3.34]}>
        <sphereGeometry args={[0.05, 12, 10]} />
        <meshStandardMaterial color="#c4a574" roughness={0.22} metalness={0.62} />
      </mesh>
      <mesh position={[0, 3.64, -3.28]}>
        <boxGeometry args={[6.85, 0.18, 0.22]} />
        <meshStandardMaterial color="#6e4f32" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.62, -3.26]}>
        <boxGeometry args={[6.5, 0.09, 0.34]} />
        <meshStandardMaterial color="#2a241c" roughness={0.6} />
      </mesh>
    </group>
  );
}

function CurtainPanel({ side, map }: { side: -1 | 1; map: THREE.Texture | null }) {
  const mesh = useRef<THREE.Mesh>(null);
  const geometry = useMemo(() => makeCurtainGeometry(3.65, 3.52, 7), []);
  const base = useMemo(() => new Float32Array(geometry.attributes.position.array), [geometry]);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const position = mesh.current.geometry.attributes.position;
    const time = clock.elapsedTime;
    const gust = 0.5 + 0.5 * Math.sin(time * 0.34 + side * 0.7);
    const gustB = 0.5 + 0.5 * Math.sin(time * 0.19 + 1.4);
    for (let i = 0; i < position.count; i += 1) {
      const x = base[i * 3];
      const y = base[i * 3 + 1];
      const hang = clamp01((1.76 - y) / 3.5);
      const hangEase = Math.pow(hang, 1.12);
      const inner = clamp01((side === -1 ? x + 0.15 : 0.15 - x) / 2.35);
      const wind = hangEase * (0.5 + inner * 0.85) * (0.5 + gust * 0.7) * (0.75 + gustB * 0.35);
      const billow = Math.sin(time * 1.22 + y * 1.55 + x * 0.5 + side) * 0.2 * wind;
      const travel = Math.sin(time * 0.78 + y * 2.15 + side * 0.45) * 0.09 * wind;
      const flutter = Math.sin(time * 2.85 + x * 3.6 + y * 2.2) * 0.045 * hangEase * gust;
      const drift = Math.sin(time * 0.9 + y * 0.85 + side) * 0.08 * wind;
      position.setX(i, x + drift);
      position.setZ(i, base[i * 3 + 2] + billow + travel + flutter);
    }
    position.needsUpdate = true;
    mesh.current.geometry.computeVertexNormals();
  });

  const rings = Array.from({ length: 7 }, (_, index) => {
    const t = (index + 0.5) / 7;
    return side * lerp(0.18, 3.15, t);
  });

  return (
    <group>
      <mesh ref={mesh} geometry={geometry} position={[side * 1.68, 0, 0]} rotation={[0, side * 0.03, 0]} castShadow>
        <meshStandardMaterial
          color={LINEN}
          map={map ?? undefined}
          vertexColors
          roughness={0.74}
          metalness={0}
          emissive="#3d2c1c"
          emissiveIntensity={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[side * 1.68, 0, -0.09]} rotation={[0, side * 0.03, 0]}>
        <planeGeometry args={[3.55, 3.48]} />
        <meshStandardMaterial color="#4a3a2a" roughness={0.94} side={THREE.DoubleSide} />
      </mesh>
      {rings.map((x) => (
        <mesh key={x} position={[x, 1.72, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.038, 0.009, 8, 18]} />
          <meshStandardMaterial color="#c4a574" roughness={0.24} metalness={0.7} />
        </mesh>
      ))}
      <mesh position={[side * 1.68, -1.73, 0.08]}>
        <boxGeometry args={[3.5, 0.05, 0.1]} />
        <meshStandardMaterial color="#5c4632" roughness={0.5} />
      </mesh>
    </group>
  );
}

function Sofa() {
  const fabric = "#7a6754";
  const seat = "#9a8670";
  const wood = "#2c2118";
  const pillow = "#b7a48c";
  const throwColor = "#7a6550";

  return (
    <group>
      <RoundedBox args={[2.62, 0.36, 1.18]} radius={0.08} smoothness={4} position={[0, 0.22, 0]}>
        <meshStandardMaterial color={fabric} roughness={0.58} />
      </RoundedBox>
      <RoundedBox args={[2.62, 0.86, 0.32]} radius={0.08} smoothness={4} position={[0, 0.66, -0.44]}>
        <meshStandardMaterial color={fabric} roughness={0.58} />
      </RoundedBox>
      <RoundedBox args={[0.28, 0.56, 1.18]} radius={0.08} smoothness={4} position={[-1.18, 0.46, 0]}>
        <meshStandardMaterial color={fabric} roughness={0.56} />
      </RoundedBox>
      <RoundedBox args={[0.28, 0.56, 1.18]} radius={0.08} smoothness={4} position={[1.18, 0.46, 0]}>
        <meshStandardMaterial color={fabric} roughness={0.56} />
      </RoundedBox>
      <RoundedBox args={[0.78, 0.16, 0.78]} radius={0.05} smoothness={4} position={[-0.72, 0.48, 0.1]}>
        <meshStandardMaterial color={seat} roughness={0.7} />
      </RoundedBox>
      <RoundedBox args={[0.78, 0.16, 0.78]} radius={0.05} smoothness={4} position={[0, 0.48, 0.1]}>
        <meshStandardMaterial color={seat} roughness={0.7} />
      </RoundedBox>
      <RoundedBox args={[0.78, 0.16, 0.78]} radius={0.05} smoothness={4} position={[0.72, 0.48, 0.1]}>
        <meshStandardMaterial color={seat} roughness={0.7} />
      </RoundedBox>
      <RoundedBox args={[0.42, 0.36, 0.16]} radius={0.05} smoothness={4} position={[0.7, 0.78, -0.18]} rotation={[0, 0.22, 0.18]}>
        <meshStandardMaterial color={pillow} roughness={0.76} />
      </RoundedBox>
      <RoundedBox args={[0.38, 0.32, 0.14]} radius={0.05} smoothness={4} position={[-0.55, 0.76, -0.14]} rotation={[0, -0.28, -0.12]}>
        <meshStandardMaterial color="#a8947a" roughness={0.74} />
      </RoundedBox>
      <RoundedBox args={[0.9, 0.06, 0.55]} radius={0.03} smoothness={4} position={[0.15, 0.6, 0.22]} rotation={[0.12, 0.35, 0.04]}>
        <meshStandardMaterial color={throwColor} roughness={0.8} />
      </RoundedBox>
      <RoundedBox args={[2.48, 0.05, 1.08]} radius={0.02} smoothness={3} position={[0, 0.055, 0]}>
        <meshStandardMaterial color={wood} roughness={0.5} />
      </RoundedBox>
      {[
        [-1.08, 0.42],
        [1.08, 0.42],
        [-1.08, -0.42],
        [1.08, -0.42],
      ].map(([x, z]) => (
        <mesh key={`${x}-${z}`} position={[x, 0.028, z]}>
          <boxGeometry args={[0.08, 0.055, 0.08]} />
          <meshStandardMaterial color={wood} roughness={0.42} />
        </mesh>
      ))}
    </group>
  );
}

function ConsoleTable() {
  const wood = "#7a5636";
  const dark = "#4a3424";
  return (
    <group>
      <RoundedBox args={[0.92, 0.05, 0.42]} radius={0.012} smoothness={3} position={[0, 0.62, 0]}>
        <meshStandardMaterial color={wood} roughness={0.42} />
      </RoundedBox>
      <mesh position={[-0.38, 0.31, -0.15]}>
        <boxGeometry args={[0.045, 0.62, 0.045]} />
        <meshStandardMaterial color={dark} roughness={0.5} />
      </mesh>
      <mesh position={[0.38, 0.31, -0.15]}>
        <boxGeometry args={[0.045, 0.62, 0.045]} />
        <meshStandardMaterial color={dark} roughness={0.5} />
      </mesh>
      <mesh position={[-0.38, 0.31, 0.15]}>
        <boxGeometry args={[0.045, 0.62, 0.045]} />
        <meshStandardMaterial color={dark} roughness={0.5} />
      </mesh>
      <mesh position={[0.38, 0.31, 0.15]}>
        <boxGeometry args={[0.045, 0.62, 0.045]} />
        <meshStandardMaterial color={dark} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.18, 0]}>
        <boxGeometry args={[0.78, 0.025, 0.32]} />
        <meshStandardMaterial color={wood} roughness={0.48} />
      </mesh>
    </group>
  );
}

function Vase({ color = "#d8ccba" }: { color?: string }) {
  return (
    <group>
      <mesh position={[0, 0.11, 0]}>
        <sphereGeometry args={[0.11, 20, 16]} />
        <meshStandardMaterial color={color} roughness={0.22} />
      </mesh>
      <mesh position={[0, 0.24, 0]}>
        <cylinderGeometry args={[0.042, 0.085, 0.2, 18]} />
        <meshStandardMaterial color={color} roughness={0.24} />
      </mesh>
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.058, 0.044, 0.05, 18]} />
        <meshStandardMaterial color="#eee6d8" roughness={0.28} />
      </mesh>
    </group>
  );
}

function Leaf({
  color,
  scale,
  rotation,
  position,
}: {
  color: string;
  scale: [number, number, number];
  rotation: [number, number, number];
  position: [number, number, number];
}) {
  return (
    <mesh position={position} rotation={rotation} scale={scale}>
      <sphereGeometry args={[0.18, 10, 8]} />
      <meshStandardMaterial color={color} roughness={0.58} />
    </mesh>
  );
}

function Plant({ tall = false }: { tall?: boolean }) {
  const greenA = "#5c7846";
  const greenB = "#3d582e";
  const greenC = "#7a9358";
  const h = tall ? 1 : 0.72;

  return (
    <group>
      <mesh position={[0, tall ? 0.16 : 0.13, 0]}>
        <cylinderGeometry args={[tall ? 0.15 : 0.11, tall ? 0.12 : 0.09, tall ? 0.32 : 0.22, 18]} />
        <meshStandardMaterial color="#8a5638" roughness={0.68} />
      </mesh>
      <mesh position={[0, tall ? 0.3 : 0.23, 0]}>
        <cylinderGeometry args={[tall ? 0.13 : 0.095, tall ? 0.13 : 0.095, 0.035, 18]} />
        <meshStandardMaterial color="#3a2a1c" roughness={0.85} />
      </mesh>
      <mesh position={[0, tall ? 0.62 : 0.46, 0]}>
        <cylinderGeometry args={[0.012, 0.02, tall ? 0.7 : 0.48, 8]} />
        <meshStandardMaterial color="#4a5c32" roughness={0.7} />
      </mesh>
      <Leaf color={greenA} position={[0.1, 0.58 * h + 0.28, 0.05]} rotation={[-0.55, 0.45, 0.35]} scale={[1.15, 0.26, 0.78]} />
      <Leaf color={greenB} position={[-0.12, 0.68 * h + 0.28, -0.03]} rotation={[0.45, -0.55, -0.25]} scale={[1.25, 0.24, 0.82]} />
      <Leaf color={greenC} position={[0.04, 0.82 * h + 0.28, 0.12]} rotation={[-0.25, 0.22, 0.55]} scale={[1.05, 0.22, 0.7]} />
      <Leaf color={greenA} position={[-0.08, 0.5 * h + 0.28, 0.14]} rotation={[0.65, 0.32, -0.42]} scale={[0.95, 0.2, 0.66]} />
      <Leaf color={greenC} position={[0.14, 0.7 * h + 0.22, -0.08]} rotation={[-0.4, -0.28, 0.18]} scale={[1.08, 0.23, 0.72]} />
      <Leaf color={greenB} position={[-0.16, 0.78 * h + 0.2, 0.06]} rotation={[0.22, 0.6, -0.12]} scale={[1.02, 0.21, 0.74]} />
      {tall ? (
        <>
          <Leaf color={greenA} position={[0.08, 1.22, 0.02]} rotation={[-0.3, 0.15, 0.28]} scale={[1.12, 0.24, 0.7]} />
          <Leaf color={greenC} position={[-0.1, 1.14, -0.1]} rotation={[0.18, -0.4, -0.2]} scale={[1.18, 0.22, 0.76]} />
        </>
      ) : null}
    </group>
  );
}

function Books() {
  return (
    <group>
      <mesh position={[0, 0.018, 0]} rotation={[0, 0.12, 0]}>
        <boxGeometry args={[0.16, 0.036, 0.12]} />
        <meshStandardMaterial color="#6a4a32" roughness={0.7} />
      </mesh>
      <mesh position={[0.01, 0.05, 0.005]} rotation={[0, -0.08, 0]}>
        <boxGeometry args={[0.15, 0.028, 0.11]} />
        <meshStandardMaterial color="#c4a574" roughness={0.65} />
      </mesh>
    </group>
  );
}

function Room({ reduced, progress }: SceneProps) {
  const sofa = useRef<THREE.Group>(null);
  const leftCurtain = useRef<THREE.Group>(null);
  const rightCurtain = useRef<THREE.Group>(null);
  const intro = useRef({ t: reduced ? 1 : 0 });
  const linenMap = useMemo(() => makeLinenTexture(), []);

  useLayoutEffect(() => {
    if (reduced) return;
    const tween = gsap.to(intro.current, {
      t: 1,
      duration: 2.2,
      ease: "power3.out",
      delay: 0.12,
    });
    return () => {
      tween.kill();
    };
  }, [reduced]);

  useFrame(({ clock }) => {
    const introT = intro.current.t;
    const p = progress.current;
    const exit = smoothstep(0, 0.32, p);
    const open = smoothstep(0.28, 0.72, p);
    const walk = introT * (1 - exit);
    const sway = Math.sin(clock.elapsedTime * 0.5) * 0.012 * (1 - exit);
    const gust = 0.5 + 0.5 * Math.sin(clock.elapsedTime * 0.31);
    const edge = Math.sin(clock.elapsedTime * 1.05) * 0.018 * gust;

    if (sofa.current) {
      sofa.current.position.set(1.62 - walk * 0.38, 0, 1.38 + sway);
      sofa.current.rotation.y = -0.5 + walk * 0.12;
      sofa.current.scale.setScalar(1.24);
      sofa.current.visible = walk > 0.02;
    }

    if (leftCurtain.current) {
      leftCurtain.current.position.set(lerp(0.08, -3.7, open), 2.22, -3.36);
      leftCurtain.current.rotation.y = lerp(0, 0.18, open) + edge;
      leftCurtain.current.scale.set(lerp(1, 0.52, open), 1, 1);
    }
    if (rightCurtain.current) {
      rightCurtain.current.position.set(lerp(-0.08, 3.7, open), 2.22, -3.36);
      rightCurtain.current.rotation.y = lerp(0, -0.18, open) - edge * 0.85;
      rightCurtain.current.scale.set(lerp(1, 0.52, open), 1, 1);
    }
  });

  return (
    <>
      <hemisphereLight args={["#4a3d30", "#0a0806", 0.32]} />
      <ambientLight intensity={0.18} color="#241c16" />
      <directionalLight position={[-1.5, 3.0, 2.6]} intensity={0.58} color="#e0c9a8" />
      <directionalLight position={[0.12, 2.7, -3.0]} intensity={1.05} color="#f0d4a8" />
      <pointLight position={[0, 2.2, -2.4]} intensity={0.45} color="#c4a574" distance={7} />
      <pointLight position={[0.8, 1.2, 1.3]} intensity={0.16} color="#c4a574" />

      <Stage />

      <group ref={leftCurtain}>
        <CurtainPanel side={-1} map={linenMap} />
      </group>
      <group ref={rightCurtain}>
        <CurtainPanel side={1} map={linenMap} />
      </group>

      <group position={[-1.92, 0, -1.72]}>
        <ConsoleTable />
        <group position={[-0.2, 0.64, 0.04]}>
          <Vase />
          <group position={[0, 0.34, 0]} scale={0.7}>
            <Plant />
          </group>
        </group>
        <group position={[0.3, 0.645, 0.06]}>
          <Books />
        </group>
      </group>

      <group position={[2.18, 0, -1.55]} scale={1.28}>
        <Plant tall />
      </group>

      <group ref={sofa}>
        <Sofa />
      </group>

      <ContactShadows position={[0, 0.01, 0.4]} opacity={0.55} scale={14} blur={2.8} far={6} color="#000000" />
    </>
  );
}

function Rig({ reduced, progress }: SceneProps) {
  const camera = useRef<THREE.PerspectiveCamera>(null);
  const intro = useRef({ t: reduced ? 1 : 0 });
  const look = useRef(new THREE.Vector3(0, 1.2, -1.6));

  useLayoutEffect(() => {
    if (reduced) return;
    const tween = gsap.to(intro.current, {
      t: 1,
      duration: 2.4,
      ease: "power2.inOut",
    });
    return () => {
      tween.kill();
    };
  }, [reduced]);

  useFrame(({ clock }) => {
    if (!camera.current) return;
    const introT = intro.current.t;
    const zoom = smoothstep(0.22, 0.78, progress.current);
    const breathe = Math.sin(clock.elapsedTime * 0.28) * 0.03 * (1 - zoom);

    const idleX = lerp(0.18, 0.1, introT);
    const idleY = lerp(1.42, 1.22, introT);
    const idleZ = lerp(6.05, 5.55, introT) + breathe;

    camera.current.position.set(
      lerp(idleX, 0, zoom),
      lerp(idleY, 1.85, zoom),
      lerp(idleZ, 2.15, zoom),
    );
    look.current.set(0.15, lerp(1.12, 2.0, zoom), lerp(-1.4, -3.45, zoom));
    camera.current.lookAt(look.current);
    camera.current.fov = lerp(36, 34, zoom);
    camera.current.updateProjectionMatrix();
  });

  return <PerspectiveCamera ref={camera} makeDefault fov={36} near={0.08} far={40} />;
}

type HeroSceneProps = SceneProps & {
  onReady?: () => void;
};

export function HeroScene({ reduced, progress, onReady }: HeroSceneProps) {
  return (
    <Canvas
      dpr={[1, 1.25]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0.12, 1.32, 5.6], fov: 36 }}
      performance={{ min: 0.5 }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.domElement.style.pointerEvents = "none";
        gl.domElement.style.touchAction = "pan-y";
        onReady?.();
      }}
    >
      <Suspense fallback={null}>
        <Rig reduced={reduced} progress={progress} />
        <Room reduced={reduced} progress={progress} />
      </Suspense>
    </Canvas>
  );
}
