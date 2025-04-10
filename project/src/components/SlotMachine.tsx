import { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text3D, Center } from '@react-three/drei';
import { Howl } from 'howler';
import { Coffee, Trophy } from 'lucide-react';
import * as THREE from 'three';

const spinSound = new Howl({
  src: ['https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'],
});

const winSound = new Howl({
  src: ['https://assets.mixkit.co/active_storage/sfx/2020/2020-preview.mp3'],
});

const pushSound = new Howl({
  src: ['https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3'],
});

function RotatingTitle() {
  const titleRef = useRef();

  useEffect(() => {
    const animation = () => {
      if (titleRef.current) {
        titleRef.current.rotation.y += 0.005;
      }
    };

    const animationId = setInterval(animation, 16);
    return () => clearInterval(animationId);
  }, []);

  return (
    <group ref={titleRef} position={[0, -2, 0]} scale={[0.3, 0.3, 0.3]}>
      <Center>
        <Text3D
          font="/fonts/helvetiker_regular.typeface.json"
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
      </Center>
    </group>
  );
}

function Machine() {
  const boxRef = useRef();
  const [numbers, setNumbers] = useState(['00', '00', '00']);
  const [isSpinning, setIsSpinning] = useState(false);
  const [flash, setFlash] = useState(false);

  // Create metallic gold material
  const goldMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#ffd700'),
    metalness: 1,
    roughness: 0.2,
    envMapIntensity: 1,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
  });

  const spin = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    spinSound.play();

    let spins = 0;
    const maxSpins = 20;
    const interval = setInterval(() => {
      setNumbers(numbers.map(() => 
        Math.floor(Math.random() * 100).toString().padStart(2, '0')
      ));

      spins++;
      if (spins >= maxSpins) {
        clearInterval(interval);
        setIsSpinning(false);
        const isJackpot = Math.random() < 0.1;
        
        if (isJackpot) {
          const jackpotNumber = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
          setNumbers([jackpotNumber, jackpotNumber, jackpotNumber]);
          winSound.play();
          setFlash(true);
          setTimeout(() => setFlash(false), 3000);
        }
      }
    }, 100);
  };

  useEffect(() => {
    const animation = () => {
      if (boxRef.current) {
        boxRef.current.rotation.y += 0.005;
      }
    };

    const animationId = setInterval(animation, 16);
    return () => clearInterval(animationId);
  }, []);

  return (
    <group ref={boxRef}>
      {/* Main slot machine body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[4, 2, 0.3]} />
        <primitive object={goldMaterial} attach="material" />
      </mesh>

      {/* Decorative elements */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.1, 32]} />
        <primitive object={goldMaterial} attach="material" />
      </mesh>

      {/* Display numbers */}
      {numbers.map((number, i) => (
        <Center key={i} position={[(i - 1) * 1.2, 0, 0.2]}>
          <Text3D
            font="/fonts/helvetiker_regular.typeface.json"
            size={0.5}
            height={0.1}
          >
            {number}
            <meshPhysicalMaterial
              color={flash ? '#ff0000' : '#ffd700'}
              metalness={0.9}
              roughness={0.1}
              clearcoat={1}
              clearcoatRoughness={0.1}
            />
          </Text3D>
        </Center>
      ))}
    </group>
  );
}

function DigitalCounter({ onPush }: { onPush: (number: number) => void }) {
  const [count, setCount] = useState(0);
  const [isPaused, setPaused] = useState(false);
  const [showBig, setShowBig] = useState(false);
  const [bgColor, setBgColor] = useState('#ff0000');

  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        setCount((prev) => (prev + 1) % 100);
        setBgColor(`hsl(${Math.random() * 360}, 100%, 50%)`);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isPaused]);

  const handlePush = () => {
    setPaused(true);
    setShowBig(true);
    pushSound.play();
    onPush(count);

    setTimeout(() => {
      setShowBig(false);
      setPaused(false);
    }, 2000);
  };

  return (
    <div className="fixed top-4 right-4 flex items-center gap-4">
      <div 
        className="bg-black p-4 rounded-lg shadow-lg transition-all duration-300"
        style={{ transform: showBig ? 'scale(1.5)' : 'scale(1)' }}
      >
        <div 
          className="font-mono text-4xl font-bold transition-colors duration-200"
          style={{ color: bgColor }}
        >
          {count.toString().padStart(2, '0')}
        </div>
      </div>
      <button
        onClick={handlePush}
        disabled={isPaused}
        className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-full shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        PUSH
      </button>
    </div>
  );
}

export default function SlotMachine() {
  const [jackpot, setJackpot] = useState({ gold: 100000, silver: 50000 });
  const [winningNumbers, setWinningNumbers] = useState<string[]>([]);
  const [pushedNumbers, setPushedNumbers] = useState<number[]>([]);

  const updateWinningNumbers = (numbers: string[]) => {
    setWinningNumbers(prev => [...numbers, ...prev].slice(0, 5));
  };

  const handlePush = (number: number) => {
    setPushedNumbers(prev => [number, ...prev].slice(0, 5));
  };

  return (
    <div className="h-screen w-full bg-gradient-to-b from-purple-900 to-black">
      <div className="container mx-auto px-4 py-8">
        {/* Digital Counter */}
        <DigitalCounter onPush={handlePush} />

        {/* Pushed Numbers Display */}
        {pushedNumbers.length > 0 && (
          <div className="fixed top-20 right-4 bg-black bg-opacity-80 p-4 rounded-lg">
            <h3 className="text-white text-sm font-bold mb-2">Números Push</h3>
            <div className="flex flex-col gap-2">
              {pushedNumbers.map((number, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-red-500 to-red-700 px-3 py-1 rounded text-white font-mono font-bold text-center"
                >
                  {number.toString().padStart(2, '0')}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Jackpot Display */}
        <div className="mb-8 flex justify-center gap-8">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 p-4 rounded-lg shadow-lg">
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6" />
              <span className="font-bold">GOLD JACKPOT</span>
            </div>
            <div className="text-2xl font-bold text-center">
              ${jackpot.gold.toLocaleString()}
            </div>
          </div>
          <div className="bg-gradient-to-r from-gray-300 to-gray-400 p-4 rounded-lg shadow-lg">
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6" />
              <span className="font-bold">SILVER JACKPOT</span>
            </div>
            <div className="text-2xl font-bold text-center">
              ${jackpot.silver.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Winning Numbers Display */}
        {winningNumbers.length > 0 && (
          <div className="mb-8 bg-black bg-opacity-50 p-4 rounded-lg">
            <h3 className="text-white text-center font-bold mb-2">Últimos Números Ganadores</h3>
            <div className="flex justify-center gap-4">
              {winningNumbers.map((number, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-yellow-400 to-yellow-600 p-2 rounded-lg min-w-[60px] text-center font-bold"
                >
                  {number}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="h-[60vh] w-full">
          <Canvas camera={{ position: [0, 0, 5] }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            {/* Add focal spot lights for dramatic effect */}
            <spotLight
              position={[-5, 5, 2]}
              angle={0.3}
              penumbra={1}
              intensity={1}
              castShadow
            />
            <spotLight
              position={[5, 5, 2]}
              angle={0.3}
              penumbra={1}
              intensity={1}
              castShadow
            />
            <Machine />
            <RotatingTitle />
            <OrbitControls enableZoom={false} />
          </Canvas>
        </div>
        
        <div className="mt-8 flex flex-col items-center gap-8">
          <button
            className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold py-4 px-8 rounded-full text-xl shadow-lg hover:from-yellow-500 hover:to-yellow-700 transform hover:scale-105 transition-all"
            onClick={() => {
              const button = document.querySelector('button');
              if (button) {
                button.click();
                // Simulate winning numbers update
                const newNumbers = Array(3).fill(0).map(() => 
                  Math.floor(Math.random() * 100).toString().padStart(2, '0')
                );
                updateWinningNumbers(newNumbers);
              }
            }}
          >
            ¡GIRAR!
          </button>
          
          <a
            href="https://cafecito.app/papiweb"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Coffee className="w-6 h-6" />
            <span>¡Apóyanos en Cafecito!</span>
          </a>
          
          <div className="text-white text-center">
            <p className="text-xl font-bold">Papiweb Desarrollos Informáticos</p>
            <p className="text-sm opacity-75">© 2024 Todos los derechos reservados</p>
          </div>
        </div>
      </div>
    </div>
  );
}