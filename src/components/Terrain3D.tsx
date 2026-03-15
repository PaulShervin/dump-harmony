import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useSimulationStore } from '@/simulation/store';
import { DEFAULT_CONFIG } from '@/simulation/config';
import * as THREE from 'three';

const TerrainMesh: React.FC = () => {
  const grid = useSimulationStore(s => s.grid);
  const { gridRows, gridCols } = DEFAULT_CONFIG;

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(gridCols, gridRows, gridCols - 1, gridRows - 1);
    const positions = geo.attributes.position;
    const colors: number[] = [];

    for (let i = 0; i < positions.count; i++) {
      const col = i % gridCols;
      const row = Math.floor(i / gridCols);

      if (grid[row] && grid[row][col]) {
        const h = grid[row][col].height * 0.3;
        positions.setZ(i, h);

        const t = grid[row][col].height / 5;
        colors.push(
          0.98 - t * 0.4,
          0.9 - t * 0.45,
          0.59 - t * 0.4
        );
      } else {
        colors.push(0.95, 0.95, 0.95);
      }
    }

    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, [grid]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <primitive object={geometry} attach="geometry" />
      <meshStandardMaterial vertexColors side={THREE.DoubleSide} />
    </mesh>
  );
};

const TruckMarkers: React.FC = () => {
  const trucks = useSimulationStore(s => s.trucks);
  const { gridCols, gridRows } = DEFAULT_CONFIG;

  return (
    <>
      {trucks.map(truck => {
        const nx = (truck.x / DEFAULT_CONFIG.yardWidth) * gridCols - gridCols / 2;
        const nz = (truck.y / DEFAULT_CONFIG.yardHeight) * gridRows - gridRows / 2;
        const isActive = truck.state === 'dumping';

        return (
          <mesh key={truck.id} position={[nx, 0.5, nz]}>
            <boxGeometry args={[0.4, 0.4, 0.4]} />
            <meshStandardMaterial color={isActive ? '#10B981' : '#FACC15'} />
          </mesh>
        );
      })}
    </>
  );
};

const Terrain3D: React.FC = () => {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [15, 15, 15], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 15, 10]} intensity={0.8} />
        <TerrainMesh />
        <TruckMarkers />
        <OrbitControls enableDamping dampingFactor={0.1} />
        <gridHelper args={[30, 30, '#E5E7EB', '#E5E7EB']} position={[0, -0.01, 0]} />
      </Canvas>
    </div>
  );
};

export default Terrain3D;
