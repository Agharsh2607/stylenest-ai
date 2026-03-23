import { useState, Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, Html } from '@react-three/drei'
import { useLocation, Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

// ─── 3D Furniture Components ─── //

/** Simple sofa mesh */
function Sofa({ position = [0, 0.4, 0], color = '#775a19', scale = 1, onClick, onPointerDown, onPointerUp }) {
  const meshRef = useRef()
  return (
    <group position={position} scale={scale} onClick={onClick} onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
      {/* Base */}
      <mesh ref={meshRef} position={[0, 0, 0]} castShadow>
        <boxGeometry args={[2.5, 0.5, 1]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* Backrest */}
      <mesh position={[0, 0.5, -0.4]} castShadow>
        <boxGeometry args={[2.5, 0.6, 0.2]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* Left arm */}
      <mesh position={[-1.15, 0.3, 0]} castShadow>
        <boxGeometry args={[0.2, 0.4, 1]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* Right arm */}
      <mesh position={[1.15, 0.3, 0]} castShadow>
        <boxGeometry args={[0.2, 0.4, 1]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
    </group>
  )
}

/** Simple chair mesh */
function Chair({ position = [2, 0.3, 1.5], color = '#456465', scale = 0.7, onClick, onPointerDown, onPointerUp }) {
  return (
    <group position={position} scale={scale} onClick={onClick} onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
      {/* Seat */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[0.8, 0.1, 0.8]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Backrest */}
      <mesh position={[0, 0.9, -0.35]} castShadow>
        <boxGeometry args={[0.8, 0.9, 0.1]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Legs */}
      {[[-0.3, 0.2, 0.3], [0.3, 0.2, 0.3], [-0.3, 0.2, -0.3], [0.3, 0.2, -0.3]].map((pos, i) => (
        <mesh key={i} position={pos} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.4]} />
          <meshStandardMaterial color="#1a1c1c" />
        </mesh>
      ))}
    </group>
  )
}

/** Simple table mesh */
function CoffeeTable({ position = [0, 0.2, 1.5], color = '#c5a059', scale = 1, onClick, onPointerDown, onPointerUp }) {
  return (
    <group position={position} scale={scale} onClick={onClick} onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
      {/* Table top */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.6, 0.6, 0.06, 32]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      {/* Legs */}
      {[[0.3, 0.17, 0.3], [-0.3, 0.17, 0.3], [0.3, 0.17, -0.3], [-0.3, 0.17, -0.3]].map((pos, i) => (
        <mesh key={i} position={pos} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.35]} />
          <meshStandardMaterial color="#2f3131" />
        </mesh>
      ))}
    </group>
  )
}

/** Room — floor + walls */
function Room({ wallColor = '#f1f1f1', floorColor = '#e2e2e2', onPointerMove, onPointerUp }) {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]} onPointerMove={onPointerMove} onPointerUp={onPointerUp}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color={floorColor} roughness={0.8} />
      </mesh>
      {/* Back wall */}
      <mesh position={[0, 5, -10]} receiveShadow>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>
      {/* Left wall */}
      <mesh position={[-10, 5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>
    </group>
  )
}

// ─── Color Palette ─── //
const COLORS = ['#775a19', '#2d4c4d', '#ba1a1a', '#1a1c1c', '#c5a059', '#f1f1f1', '#e9c176', '#456465']
const WALL_COLORS = ['#f1f1f1', '#e8e8e8', '#d1c5b4', '#2f3131', '#ffdea5']
const FLOOR_COLORS = ['#e2e2e2', '#c8c6c5', '#d1c5b4', '#1a1c1c', '#f3f3f3']

const FURNITURE_CATALOG = [
  { type: 'sofa', label: 'Nordic Sofa', icon: 'chair' },
  { type: 'chair', label: 'Studio Chair', icon: 'chair_alt' },
  { type: 'table', label: 'Oak Coffee Table', icon: 'table_restaurant' },
]

export default function Canvas3D() {
  const location = useLocation()
  const bgImage = location.state?.generatedImage || null

  const [furniture, setFurniture] = useState([
    { id: 1, type: 'sofa', position: [0, 0, 0], color: '#775a19', scale: 1 },
    { id: 2, type: 'chair', position: [2, 0, 1.5], color: '#456465', scale: 0.7 },
    { id: 3, type: 'table', position: [0, 0, 1.5], color: '#c5a059', scale: 1 },
  ])
  const [selectedId, setSelectedId] = useState(null)
  const [wallColor, setWallColor] = useState('#f1f1f1')
  const [floorColor, setFloorColor] = useState('#e2e2e2')

  const [draggingId, setDraggingId] = useState(null)

  const selected = furniture.find((f) => f.id === selectedId)
  let nextId = useRef(4)

  const addFurniture = (type) => {
    setFurniture((prev) => [
      ...prev,
      { id: nextId.current++, type, position: [Math.random() * 3 - 1.5, 0, Math.random() * 3], color: '#775a19', scale: 1 },
    ])
  }

  const removeFurniture = (id) => {
    setFurniture((prev) => prev.filter((f) => f.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  const updateColor = (id, color) => {
    setFurniture((prev) => prev.map((f) => (f.id === id ? { ...f, color } : f)))
  }

  const updatePosition = (id, newPos) => {
    setFurniture((prev) => prev.map((f) => (f.id === id ? { ...f, position: newPos } : f)))
  }

  const handlePointerDown = (e, id) => {
    e.stopPropagation()
    setSelectedId(id)
    setDraggingId(id)
    document.body.style.cursor = 'grabbing'
  }

  const handlePointerUp = () => {
    setDraggingId(null)
    document.body.style.cursor = 'auto'
  }

  const handleFloorMove = (e) => {
    if (draggingId) {
      e.stopPropagation()
      updatePosition(draggingId, [e.point.x, 0, e.point.z])
    }
  }

  const renderFurniture = (item) => {
    const props = {
      key: item.id,
      position: item.position,
      color: item.color,
      scale: item.scale,
      onClick: (e) => { e.stopPropagation(); setSelectedId(item.id) },
      onPointerDown: (e) => handlePointerDown(e, item.id),
      onPointerUp: handlePointerUp,
    }
    switch (item.type) {
      case 'sofa': return <Sofa {...props} />
      case 'chair': return <Chair {...props} />
      case 'table': return <CoffeeTable {...props} />
      default: return null
    }
  }

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar active="overview" />
      <main className="ml-64 flex-1 h-full relative flex">
        {/* 3D Canvas */}
        <div className="flex-1 relative">
          {/* Top Controls */}
          <div className="absolute top-8 left-8 z-10 flex gap-4">
            <div className="glass-panel px-6 py-3 rounded-full flex items-center gap-4 shadow-sm border border-white/40">
              <div className="flex items-center gap-2 text-on-surface-variant font-medium text-sm">
                <span className="material-symbols-outlined text-primary">view_in_ar</span>
                <span>Orbit Mode</span>
              </div>
            </div>
          </div>
          {/* Save CTA */}
          <div className="absolute top-8 right-8 z-10">
            <Link to="/dashboard" className="primary-gradient text-white px-8 py-4 rounded-xl font-headline font-bold shadow-xl shadow-primary/20 flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all">
              <span>Save Scene</span>
              <span className="material-symbols-outlined">auto_awesome</span>
            </Link>
          </div>

          <Canvas
            shadows
            camera={{ position: [6, 6, 8], fov: 45 }}
            style={{ width: '100%', height: '100%' }}
            onClick={() => setSelectedId(null)}
          >
            <Suspense fallback={<Html center><div className="text-primary font-bold">Loading 3D Models...</div></Html>}>
              <ambientLight intensity={0.6} />
              <directionalLight position={[10, 15, 10]} intensity={1.5} castShadow shadow-mapSize={[2048, 2048]} />
              <Room wallColor={wallColor} floorColor={floorColor} onPointerMove={handleFloorMove} onPointerUp={handlePointerUp} />
              {furniture.map(renderFurniture)}
              <ContactShadows position={[0, 0.01, 0]} opacity={0.5} scale={20} blur={2.5} far={4} />
              <OrbitControls makeDefault minPolarAngle={0.1} maxPolarAngle={Math.PI / 2.1} enabled={!draggingId} />
              <Environment preset="apartment" />
            </Suspense>
          </Canvas>

          {/* Bottom Controls */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 glass-panel p-2 rounded-2xl shadow-xl border border-white/50 flex items-center gap-1">
            <button className="flex flex-col items-center justify-center w-16 h-16 rounded-xl hover:bg-white transition-all text-on-surface-variant">
              <span className="material-symbols-outlined mb-1">sync</span>
              <span className="text-[10px] font-bold uppercase tracking-widest">Rotate</span>
            </button>
            <button className="flex flex-col items-center justify-center w-16 h-16 rounded-xl hover:bg-white transition-all text-on-surface-variant">
              <span className="material-symbols-outlined mb-1">open_in_full</span>
              <span className="text-[10px] font-bold uppercase tracking-widest">Scale</span>
            </button>
            <button className="flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-white text-primary shadow-sm">
              <span className="material-symbols-outlined mb-1">palette</span>
              <span className="text-[10px] font-bold uppercase tracking-widest">Color</span>
            </button>
            <div className="w-[1px] h-10 bg-outline-variant/20 mx-2" />
            {selectedId && (
              <button
                onClick={() => removeFurniture(selectedId)}
                className="flex flex-col items-center justify-center w-16 h-16 rounded-xl hover:bg-error/10 hover:text-error transition-all text-on-surface-variant"
              >
                <span className="material-symbols-outlined mb-1">delete</span>
                <span className="text-[10px] font-bold uppercase tracking-widest">Remove</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Panel — Furniture Library */}
        <aside className="w-80 h-full glass-panel border-l border-outline-variant/10 flex flex-col">
          <div className="p-8">
            <h3 className="font-headline font-bold text-xl text-on-surface mb-1">Library</h3>
            <p className="text-xs text-on-surface-variant font-medium uppercase tracking-widest">Click to add items</p>
          </div>
          <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-6">
            {/* Furniture Catalog */}
            <div>
              <h4 className="text-xs font-bold text-primary mb-4">FURNITURE</h4>
              <div className="grid grid-cols-2 gap-4">
                {FURNITURE_CATALOG.map((item) => (
                  <div
                    key={item.type}
                    className="group cursor-pointer"
                    onClick={() => addFurniture(item.type)}
                  >
                    <div className="aspect-square bg-white rounded-2xl border border-outline-variant/10 p-4 flex items-center justify-center group-hover:shadow-md transition-all">
                      <span className="material-symbols-outlined text-primary text-4xl">{item.icon}</span>
                    </div>
                    <p className="mt-2 text-xs font-semibold text-center text-on-surface-variant">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Wall & Floor Colors */}
            <div>
              <h4 className="text-xs font-bold text-primary mb-4">WALL COLOR</h4>
              <div className="flex gap-2 flex-wrap">
                {WALL_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setWallColor(c)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${wallColor === c ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-outline-variant/20'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-primary mb-4">FLOOR COLOR</h4>
              <div className="flex gap-2 flex-wrap">
                {FLOOR_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setFloorColor(c)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${floorColor === c ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-outline-variant/20'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Selected Item Properties */}
          {selected && (
            <div className="bg-surface-container-low p-8 rounded-t-3xl border-t border-outline-variant/10 shadow-inner">
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-bold font-headline">Selected Item</span>
                <span className="text-[10px] px-2 py-1 bg-primary/10 text-primary rounded-full font-bold uppercase">{selected.type}_{selected.id}</span>
              </div>
              <div>
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-2">Color</label>
                <div className="flex gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => updateColor(selected.id, c)}
                      className={`w-8 h-8 rounded-full transition-all ${selected.color === c ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </aside>
      </main>
    </div>
  )
}
