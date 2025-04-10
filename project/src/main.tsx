import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { Text3D } from '@react-three/drei';

export default function YourComponent() {
  return (
    <Text3D
      font="/fonts/helvetiker_regular.typeface.json" // Cambia aquí el nombre de la fuente
      size={2}
      height={0.2}
      curveSegments={12}
      bevelEnabled
      bevelThickness={0.02}
      bevelSize={0.02}
      bevelOffset={0}
      bevelSegments={5}
    >
      Casino-Quiniela Papiweb
      <meshPhysicalMaterial
        color="#ffd700"
        metalness={1}
        roughness={0.2}
        clearcoat={1}
        clearcoatRoughness={0.1}
        envMapIntensity={1}
      />
    </Text3D>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
