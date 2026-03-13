import React, { useState, useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera, ContactShadows, Environment, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import FridgeInventory from "./FridgeInventory";

const WIDTH = 6;
const HEIGHT = 11;
const DEPTH = 3.5;
const WALL_THICKNESS = 0.2;

const FrenchDoorFridgeModel = ({ isOpen, onClick }) => {
  const leftDoorRef = useRef();
  const rightDoorRef = useRef();

  useFrame(() => {
    const targetRotation = isOpen ? Math.PI / 1.6 : 0;
    leftDoorRef.current.rotation.y = THREE.MathUtils.lerp(leftDoorRef.current.rotation.y, -targetRotation, 0.1);
    rightDoorRef.current.rotation.y = THREE.MathUtils.lerp(rightDoorRef.current.rotation.y, targetRotation, 0.1);
  });

  return (
    <group onClick={(e) => (e.stopPropagation(), onClick())} position={[0, -(HEIGHT / 2), 0]}>
      {/* --- HOLLOW CABINET CONSTRUCTION --- */}
      <group position={[0, HEIGHT / 2, 0]}>
        {/* Back Wall */}
        <mesh position={[0, 0, -DEPTH / 2]}>
          <boxGeometry args={[WIDTH, HEIGHT, WALL_THICKNESS]} />
          <meshStandardMaterial color="#f0f0f0" />
        </mesh>
        {/* Left Wall */}
        <mesh position={[-WIDTH / 2, 0, 0]}>
          <boxGeometry args={[WALL_THICKNESS, HEIGHT, DEPTH]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        {/* Right Wall */}
        <mesh position={[WIDTH / 2, 0, 0]}>
          <boxGeometry args={[WALL_THICKNESS, HEIGHT, DEPTH]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        {/* Top Wall */}
        <mesh position={[0, HEIGHT / 2, 0]}>
          <boxGeometry args={[WIDTH, WALL_THICKNESS, DEPTH]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        {/* Bottom Wall */}
        <mesh position={[0, -HEIGHT / 2, 0]}>
          <boxGeometry args={[WIDTH, WALL_THICKNESS, DEPTH]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        {/* Middle Divider (Separates Fridge and Freezer) */}
        <mesh position={[0, -HEIGHT * 0.15, 0]}>
          <boxGeometry args={[WIDTH - 0.2, WALL_THICKNESS, DEPTH - 0.2]} />
          <meshStandardMaterial color="#e0e0e0" />
        </mesh>
      </group>

      {/* --- INTERIOR LIGHT --- */}
      {isOpen && <pointLight position={[0, HEIGHT * 0.8, 0]} intensity={1.5} distance={10} color="#ffffff" />}

      {/* --- SHELVES (Now floating inside the cavity) --- */}
      <group position={[0, HEIGHT * 0.7, 0]}>
        {[1.8, 0.4, -1.0].map((y, i) => (
          <mesh key={i} position={[0, y, -0.2]}>
            <boxGeometry args={[WIDTH - 0.6, 0.05, DEPTH - 0.8]} />
            <meshStandardMaterial color="#c5e1eb" transparent opacity={0.5} metalness={0.2} />
          </mesh>
        ))}
      </group>

      {/* --- DOORS --- */}
      {/* Left Door */}
      <group ref={leftDoorRef} position={[-WIDTH / 2, HEIGHT * 0.65, DEPTH / 2]}>
        <mesh position={[WIDTH / 4, 0, 0.1]}>
          <boxGeometry args={[WIDTH / 2, HEIGHT * 0.7, 0.2]} />
          <meshStandardMaterial color="#ffffff" />
          {/* Internal door bin shelf (detail) */}
          <mesh position={[0, 0, -0.15]}>
            <boxGeometry args={[WIDTH / 2.5, 0.5, 0.1]} />
            <meshStandardMaterial color="#f9f9f9" />
          </mesh>
        </mesh>
      </group>

      {/* Right Door */}
      <group ref={rightDoorRef} position={[WIDTH / 2, HEIGHT * 0.65, DEPTH / 2]}>
        <mesh position={[-WIDTH / 4, 0, 0.1]}>
          <boxGeometry args={[WIDTH / 2, HEIGHT * 0.7, 0.2]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* --- BOTTOM FREEZER DRAWERS --- */}
      <group position={[0, HEIGHT * 0.15, DEPTH / 4]}>
        {[0.8, -0.8].map((y, i) => (
          <mesh key={i} position={[0, y, 0]}>
            <boxGeometry args={[WIDTH - 0.8, 1.4, DEPTH / 2]} />
            <meshStandardMaterial color="#eeeeee" />
          </mesh>
        ))}
      </group>
      
    </group>
  );
};

const Fridge = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full h-screen bg-white">
      <Canvas shadows dpr={[1, 2]}>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={80} />
          <OrbitControls enableZoom={false} minPolarAngle={Math.PI / 2.2} maxPolarAngle={Math.PI / 1.8} />
          <Environment preset="apartment" />
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1} />

          <FrenchDoorFridgeModel isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />

          <ContactShadows position={[0, -5.6, 0]} opacity={0.4} scale={20} blur={2.5} far={10} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Fridge;
