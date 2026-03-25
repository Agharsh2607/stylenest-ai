import { useState, useRef, useCallback } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import { useNavigate } from 'react-router-dom'
import * as THREE from 'three'
import Sidebar from '../components/Sidebar'

// ─── Palettes ─── //
const COLORS = ['#c0392b','#8B4513','#2d4c4d','#1a1c1c','#c5a059','#f5f0e8','#e9c176','#456465','#7c5cbf','#2e7d32','#e67e22','#ecf0f1']
const WALL_COLORS  = ['#c0392b','#8B3A3A','#d4a5a5','#f5f0e8','#e8d5b7','#2f3131','#4a6741','#c8d8e8']
const FLOOR_COLORS = ['#f5f0e8','#e8ddd0','#c8b89a','#d4c5b0','#1a1c1c','#f3f3f3']

const FURNITURE_CATALOG = [
  { type: 'sofa',    label: 'Sofa',         icon: 'chair' },
  { type: 'chair',   label: 'Chair',        icon: 'chair_alt' },
  { type: 'table',   label: 'Coffee Table', icon: 'table_restaurant' },
  { type: 'plant',   label: 'Plant',        icon: 'yard' },
  { type: 'shelf',   label: 'TV Stand',     icon: 'shelves' },
  { type: 'lamp',    label: 'Floor Lamp',   icon: 'light' },
  { type: 'rug',     label: 'Area Rug',     icon: 'texture' },
  { type: 'picture', label: 'Wall Art',     icon: 'image' },
]

// ─── Drag hook (inside Canvas context) ─── //
function DraggableFurniture({ item, isSelected, onSelect, onMove, setOrbitEnabled }) {
  const groupRef   = useRef()
  const isDragging = useRef(false)
  const [hovered, setHovered] = useState(false)
  const onMoveRef = useRef(onMove)
  onMoveRef.current = onMove
  const { camera, gl } = useThree()

  useFrame(() => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, item.rotation ?? 0, 0.15)
  })

  const getFloorPoint = useCallback((cx, cy) => {
    const rect = gl.domElement.getBoundingClientRect()
    const nx = ((cx - rect.left) / rect.width)  *  2 - 1
    const ny = ((cy - rect.top)  / rect.height) * -2 + 1
    const ray = new THREE.Raycaster()
    ray.setFromCamera({ x: nx, y: ny }, camera)
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
    const hit = new THREE.Vector3()
    ray.ray.intersectPlane(plane, hit)
    return hit
  }, [camera, gl])

  const offsetRef = useRef(new THREE.Vector3())

  const handlePointerDown = useCallback((e) => {
    e.stopPropagation()
    onSelect(item.id)
    setOrbitEnabled(false)
    isDragging.current = true
    gl.domElement.setPointerCapture(e.pointerId)
    gl.domElement.style.cursor = 'grabbing'
    const hit = getFloorPoint(e.clientX, e.clientY)
    offsetRef.current.set(item.position[0] - hit.x, 0, item.position[2] - hit.z)
  }, [item.id, item.position, onSelect, setOrbitEnabled, gl, getFloorPoint])

  const handlePointerMove = useCallback((e) => {
    if (!isDragging.current) return
    const hit = getFloorPoint(e.clientX, e.clientY)
    const nx = Math.max(-4.5, Math.min(4.5, hit.x + offsetRef.current.x))
    const nz = Math.max(-4.5, Math.min(4.5, hit.z + offsetRef.current.z))
    onMoveRef.current(item.id, [nx, 0, nz])
  }, [item.id, getFloorPoint])

  const handlePointerUp = useCallback((e) => {
    if (!isDragging.current) return
    isDragging.current = false
    gl.domElement.releasePointerCapture(e.pointerId)
    gl.domElement.style.cursor = 'auto'
    setOrbitEnabled(true)
  }, [gl, setOrbitEnabled])

  return (
    <group
      ref={groupRef}
      position={item.position}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); gl.domElement.style.cursor = 'grab' }}
      onPointerOut={() => { setHovered(false); if (!isDragging.current) gl.domElement.style.cursor = 'auto' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={(e) => { e.stopPropagation(); onSelect(item.id) }}
    >
      <FurnitureMesh type={item.type} color={item.color} scale={item.scale} isSelected={isSelected} hovered={hovered} />
    </group>
  )
}

// ─── Furniture Meshes ─── //
function FurnitureMesh({ type, color, scale, isSelected, hovered }) {
  const outlineColor = isSelected ? '#f59e0b' : hovered ? '#ffffff' : null
  const mat = <meshStandardMaterial color={color} roughness={0.6} metalness={0.05} />
  const woodMat = <meshStandardMaterial color="#8B5E3C" roughness={0.7} />
  const darkMat = <meshStandardMaterial color="#2a1f1a" roughness={0.5} />

  const Sel = ({ w, h, d, pos }) => outlineColor ? (
    <mesh position={pos ?? [0,0,0]} scale={[1.06,1.06,1.06]}>
      <boxGeometry args={[w,h,d]} />
      <meshBasicMaterial color={outlineColor} side={THREE.BackSide} transparent opacity={0.8} />
    </mesh>
  ) : null

  switch (type) {
    case 'sofa': return (
      <group scale={scale}>
        <Sel w={2.5} h={0.5} d={1.1} pos={[0,0.25,0]} />
        {/* seat */}
        <mesh position={[0,0.25,0]} castShadow><boxGeometry args={[2.5,0.5,1.1]} />{mat}</mesh>
        {/* back */}
        <mesh position={[0,0.72,-0.42]} castShadow><boxGeometry args={[2.5,0.55,0.22]} />{mat}</mesh>
        {/* arms */}
        <mesh position={[-1.18,0.48,0]} castShadow><boxGeometry args={[0.22,0.45,1.1]} />{mat}</mesh>
        <mesh position={[1.18,0.48,0]}  castShadow><boxGeometry args={[0.22,0.45,1.1]} />{mat}</mesh>
        {/* legs */}
        {[[-1,0.07,0.4],[1,0.07,0.4],[-1,0.07,-0.4],[1,0.07,-0.4]].map((p,i)=>(
          <mesh key={i} position={p} castShadow><boxGeometry args={[0.1,0.14,0.1]} />{woodMat}</mesh>
        ))}
        {/* cushions */}
        <mesh position={[-0.6,0.54,0.1]} castShadow><boxGeometry args={[0.9,0.12,0.85]} /><meshStandardMaterial color="#f5f0e8" roughness={0.9}/></mesh>
        <mesh position={[0.6,0.54,0.1]}  castShadow><boxGeometry args={[0.9,0.12,0.85]} /><meshStandardMaterial color="#f5f0e8" roughness={0.9}/></mesh>
      </group>
    )
    case 'chair': return (
      <group scale={scale}>
        <Sel w={0.85} h={0.12} d={0.85} pos={[0,0.42,0]} />
        <mesh position={[0,0.42,0]}    castShadow><boxGeometry args={[0.85,0.12,0.85]} />{mat}</mesh>
        <mesh position={[0,0.88,-0.37]} castShadow><boxGeometry args={[0.85,0.85,0.12]} />{mat}</mesh>
        {[[-0.32,0.22,0.32],[0.32,0.22,0.32],[-0.32,0.22,-0.32],[0.32,0.22,-0.32]].map((p,i)=>(
          <mesh key={i} position={p} castShadow><cylinderGeometry args={[0.04,0.04,0.44,8]} />{darkMat}</mesh>
        ))}
      </group>
    )
    case 'table': return (
      <group scale={scale}>
        <Sel w={1.8} h={0.1} d={1.0} pos={[0,0.38,0]} />
        {/* top */}
        <mesh position={[0,0.38,0]} castShadow><boxGeometry args={[1.8,0.1,1.0]} />{mat}</mesh>
        {/* shelf */}
        <mesh position={[0,0.12,0]} castShadow><boxGeometry args={[1.6,0.06,0.85]} />{mat}</mesh>
        {/* legs */}
        {[[-0.8,0.22,0.4],[0.8,0.22,0.4],[-0.8,0.22,-0.4],[0.8,0.22,-0.4]].map((p,i)=>(
          <mesh key={i} position={p} castShadow><boxGeometry args={[0.07,0.44,0.07]} />{woodMat}</mesh>
        ))}
      </group>
    )
    case 'plant': return (
      <group scale={scale}>
        <Sel w={0.5} h={0.5} d={0.5} pos={[0,0.25,0]} />
        {/* pot */}
        <mesh position={[0,0.22,0]} castShadow><cylinderGeometry args={[0.22,0.18,0.44,16]} /><meshStandardMaterial color="#7a8a8a" roughness={0.9}/></mesh>
        {/* soil */}
        <mesh position={[0,0.46,0]} castShadow><cylinderGeometry args={[0.21,0.21,0.04,16]} /><meshStandardMaterial color="#3d2b1f"/></mesh>
        {/* foliage layers */}
        <mesh position={[0,0.82,0]} castShadow><sphereGeometry args={[0.38,12,12]} /><meshStandardMaterial color={color} roughness={0.8}/></mesh>
        <mesh position={[0,1.05,0]} castShadow><sphereGeometry args={[0.28,12,12]} /><meshStandardMaterial color={color} roughness={0.8}/></mesh>
        <mesh position={[0.18,0.95,0.1]} castShadow><sphereGeometry args={[0.22,10,10]} /><meshStandardMaterial color={color} roughness={0.8}/></mesh>
      </group>
    )
    case 'shelf': return (
      <group scale={scale}>
        <Sel w={2.0} h={0.8} d={0.5} pos={[0,0.4,0]} />
        {/* body */}
        <mesh position={[0,0.4,0]} castShadow><boxGeometry args={[2.0,0.8,0.5]} />{mat}</mesh>
        {/* shelf divider */}
        <mesh position={[0,0.42,0]} castShadow><boxGeometry args={[1.96,0.06,0.46]} />{woodMat}</mesh>
        {/* TV screen */}
        <mesh position={[0,1.05,0.22]} castShadow><boxGeometry args={[1.4,0.82,0.06]} /><meshStandardMaterial color="#111" roughness={0.2} metalness={0.5}/></mesh>
        <mesh position={[0,1.05,0.26]}><boxGeometry args={[1.32,0.74,0.01]} /><meshStandardMaterial color="#0a0a0a" roughness={0.1}/></mesh>
      </group>
    )
    case 'lamp': return (
      <group scale={scale}>
        <Sel w={0.3} h={1.6} d={0.3} pos={[0,0.8,0]} />
        {/* base */}
        <mesh position={[0,0.06,0]} castShadow><cylinderGeometry args={[0.18,0.22,0.12,16]} />{darkMat}</mesh>
        {/* pole */}
        <mesh position={[0,0.85,0]} castShadow><cylinderGeometry args={[0.025,0.025,1.5,8]} />{darkMat}</mesh>
        {/* shade */}
        <mesh position={[0,1.62,0]} castShadow><cylinderGeometry args={[0.28,0.18,0.38,16,1,true]} /><meshStandardMaterial color="#f5e6c8" roughness={0.9} side={THREE.DoubleSide}/></mesh>
        {/* light glow */}
        <mesh position={[0,1.55,0]}><sphereGeometry args={[0.1,8,8]} /><meshStandardMaterial color="#ffe8a0" emissive="#ffe8a0" emissiveIntensity={1.5}/></mesh>
      </group>
    )
    case 'rug': return (
      <group scale={scale}>
        <mesh position={[0,0.005,0]} receiveShadow rotation={[-Math.PI/2,0,0]}>
          <planeGeometry args={[2.8,1.8]} />
          <meshStandardMaterial color={color} roughness={0.95} />
        </mesh>
        {/* border */}
        <mesh position={[0,0.006,0]} receiveShadow rotation={[-Math.PI/2,0,0]}>
          <planeGeometry args={[3.0,2.0]} />
          <meshStandardMaterial color={color} roughness={0.95} transparent opacity={0.5}/>
        </mesh>
      </group>
    )
    case 'picture': return (
      <group scale={scale}>
        <Sel w={1.1} h={0.8} d={0.08} pos={[0,0,0]} />
        {/* frame */}
        <mesh castShadow><boxGeometry args={[1.1,0.8,0.06]} />{woodMat}</mesh>
        {/* canvas */}
        <mesh position={[0,0,0.04]}><boxGeometry args={[0.95,0.65,0.01]} /><meshStandardMaterial color="#f5f0e8"/></mesh>
        {/* art */}
        <mesh position={[0,0.05,0.05]}><boxGeometry args={[0.6,0.4,0.01]} /><meshStandardMaterial color="#c8b89a" roughness={1}/></mesh>
      </group>
    )
    default: return null
  }
}

// ─── Isometric Room (corner style like reference) ─── //
function IsoRoom({ wallColor, floorColor }) {
  const floorMat = <meshStandardMaterial color={floorColor} roughness={0.85} />
  const wallMat  = <meshStandardMaterial color={wallColor}  roughness={0.9}  />
  const ceilMat  = <meshStandardMaterial color="#f0ebe3" roughness={1} />
  const trimMat  = <meshStandardMaterial color="#e8e0d8" roughness={0.8} />

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI/2,0,0]} receiveShadow position={[0,0,0]}>
        <planeGeometry args={[10,10]} />{floorMat}
      </mesh>
      {/* Back wall */}
      <mesh position={[0,3,-5]} receiveShadow>
        <planeGeometry args={[10,6]} />{wallMat}
      </mesh>
      {/* Left wall */}
      <mesh position={[-5,3,0]} rotation={[0,Math.PI/2,0]} receiveShadow>
        <planeGeometry args={[10,6]} />{wallMat}
      </mesh>
      {/* Ceiling */}
      <mesh position={[0,6,0]} rotation={[Math.PI/2,0,0]}>
        <planeGeometry args={[10,10]} />{ceilMat}
      </mesh>
      {/* Floor baseboard back */}
      <mesh position={[0,0.06,-4.95]} castShadow>
        <boxGeometry args={[10,0.12,0.06]} />{trimMat}
      </mesh>
      {/* Floor baseboard left */}
      <mesh position={[-4.95,0.06,0]} rotation={[0,Math.PI/2,0]} castShadow>
        <boxGeometry args={[10,0.12,0.06]} />{trimMat}
      </mesh>
      {/* Ceiling trim back */}
      <mesh position={[0,5.94,-4.95]}>
        <boxGeometry args={[10,0.12,0.06]} />{trimMat}
      </mesh>
      {/* Ceiling trim left */}
      <mesh position={[-4.95,5.94,0]} rotation={[0,Math.PI/2,0]}>
        <boxGeometry args={[10,0.12,0.06]} />{trimMat}
      </mesh>
    </group>
  )
}

// ─── Main Page ─── //
export default function Canvas3D() {
  const navigate = useNavigate()
  const canvasRef = useRef()
  const nextId = useRef(10)

  const [furniture, setFurniture] = useState([
    { id:1, type:'sofa',  position:[-0.5,0,0],   color:'#c0392b', scale:1,   rotation:0 },
    { id:2, type:'table', position:[-0.5,0,1.8],  color:'#8B5E3C', scale:1,   rotation:0 },
    { id:3, type:'plant', position:[-3.8,0,-3.2], color:'#2e7d32', scale:0.9, rotation:0 },
    { id:4, type:'plant', position:[1.8,0,-3.5],  color:'#2e7d32', scale:0.8, rotation:0.3 },
    { id:5, type:'shelf', position:[2.8,0,-3.0],  color:'#8B5E3C', scale:1,   rotation:0 },
    { id:6, type:'lamp',  position:[-3.5,0,1.2],  color:'#2a1f1a', scale:1,   rotation:0 },
    { id:7, type:'rug',   position:[-0.5,0,0.8],  color:'#d4c5b0', scale:1,   rotation:0 },
    { id:8, type:'chair', position:[1.6,0,0.5],   color:'#c0392b', scale:0.85,rotation:-0.4 },
  ])
  const [selectedId,   setSelectedId]   = useState(null)
  const [wallColor,    setWallColor]    = useState('#c0392b')
  const [floorColor,   setFloorColor]   = useState('#f5f0e8')
  const [orbitEnabled, setOrbitEnabled] = useState(true)

  const selected = furniture.find(f => f.id === selectedId)

  const addFurniture = (type) =>
    setFurniture(prev => [...prev, {
      id: nextId.current++, type,
      position: [Math.random()*5-2.5, 0, Math.random()*4-1],
      color: type==='plant' ? '#2e7d32' : type==='sofa'||type==='chair' ? '#c0392b' : '#8B5E3C',
      scale: 1, rotation: 0,
    }])

  const removeFurniture = (id) => {
    setFurniture(prev => prev.filter(f => f.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  const updateColor = (id, color) =>
    setFurniture(prev => prev.map(f => f.id===id ? {...f, color} : f))

  const updatePosition = useCallback((id, pos) =>
    setFurniture(prev => prev.map(f => f.id===id ? {...f, position:pos} : f)), [])

  const rotateItem = (id, dir) =>
    setFurniture(prev => prev.map(f => f.id===id ? {...f, rotation:(f.rotation??0)+dir*(Math.PI/8)} : f))

  // ── Download scene as PNG ──
  const handleDownload = () => {
    const canvas = canvasRef.current?.querySelector('canvas')
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `stylenest-room-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{background:'#e8e4df'}}>
      <Sidebar
        activeView="workspace"
        onViewChange={(v) => { if(v==='workspace') navigate('/workspace') }}
        onNewProject={() => navigate('/workspace')}
      />
      <main className="ml-64 flex-1 h-full relative flex">

        {/* ── Canvas ── */}
        <div className="flex-1 relative" ref={canvasRef}>

          {/* Top bar */}
          <div className="absolute top-5 left-5 z-10 flex items-center gap-3">
            <div style={{background:'rgba(255,255,255,0.85)',backdropFilter:'blur(12px)'}}
              className="px-5 py-2.5 rounded-full flex items-center gap-2 shadow-sm border border-white/60">
              <span className="material-symbols-outlined text-red-600 text-lg">view_in_ar</span>
              <span className="text-zinc-600 font-medium text-sm">
                {selectedId ? 'Drag · Rotate · Recolor' : 'Click furniture to select'}
              </span>
            </div>
          </div>

          {/* Top-right actions */}
          <div className="absolute top-5 right-5 z-10 flex gap-3">
            <button onClick={handleDownload}
              style={{background:'rgba(255,255,255,0.9)',backdropFilter:'blur(12px)'}}
              className="px-5 py-2.5 rounded-xl font-semibold text-sm text-zinc-700 shadow-sm border border-white/60 flex items-center gap-2 hover:bg-white transition-all active:scale-95">
              <span className="material-symbols-outlined text-base">download</span>
              Download
            </button>
            <button onClick={() => navigate('/workspace')}
              className="px-5 py-2.5 rounded-xl font-bold text-sm text-white flex items-center gap-2 shadow-lg active:scale-95 transition-all"
              style={{background:'linear-gradient(135deg,#c0392b,#e74c3c)'}}>
              <span className="material-symbols-outlined text-base">auto_awesome</span>
              Save Scene
            </button>
          </div>

          <Canvas
            shadows
            gl={{ preserveDrawingBuffer: true }}
            camera={{ position: [7, 7, 9], fov: 42 }}
            style={{ width:'100%', height:'100%', background:'#e8e4df' }}
            onPointerMissed={() => setSelectedId(null)}
          >
            <color attach="background" args={['#e8e4df']} />
            <ambientLight intensity={0.55} />
            <directionalLight position={[8,12,8]} intensity={1.6} castShadow
              shadow-mapSize={[2048,2048]} shadow-camera-near={0.5} shadow-camera-far={50}
              shadow-camera-left={-10} shadow-camera-right={10}
              shadow-camera-top={10} shadow-camera-bottom={-10} />
            <pointLight position={[-3,4,2]} intensity={0.4} color="#ffe8c0" />

            <IsoRoom wallColor={wallColor} floorColor={floorColor} />

            {furniture.map(item => (
              <DraggableFurniture
                key={item.id}
                item={item}
                isSelected={item.id === selectedId}
                onSelect={setSelectedId}
                onMove={updatePosition}
                setOrbitEnabled={setOrbitEnabled}
              />
            ))}

            <ContactShadows position={[0,0.01,0]} opacity={0.5} scale={14} blur={2} far={5} />
            <Environment preset="apartment" />
            <OrbitControls
              makeDefault
              enabled={orbitEnabled}
              minPolarAngle={0.2}
              maxPolarAngle={Math.PI/2.15}
              minDistance={5}
              maxDistance={18}
            />
          </Canvas>

          {/* Bottom rotate/delete toolbar */}
          {selectedId && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 px-3 py-2 rounded-2xl shadow-xl border border-white/60"
              style={{background:'rgba(255,255,255,0.92)',backdropFilter:'blur(16px)'}}>
              <button onClick={() => rotateItem(selectedId,-1)}
                className="flex flex-col items-center w-14 h-14 rounded-xl hover:bg-zinc-100 transition-all text-zinc-600 justify-center">
                <span className="material-symbols-outlined text-xl">rotate_left</span>
                <span className="text-[9px] font-bold uppercase mt-0.5">Left</span>
              </button>
              <button onClick={() => rotateItem(selectedId,1)}
                className="flex flex-col items-center w-14 h-14 rounded-xl hover:bg-zinc-100 transition-all text-zinc-600 justify-center">
                <span className="material-symbols-outlined text-xl">rotate_right</span>
                <span className="text-[9px] font-bold uppercase mt-0.5">Right</span>
              </button>
              <div className="w-px h-8 bg-zinc-200 mx-1" />
              <button onClick={() => removeFurniture(selectedId)}
                className="flex flex-col items-center w-14 h-14 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all text-zinc-500 justify-center">
                <span className="material-symbols-outlined text-xl">delete</span>
                <span className="text-[9px] font-bold uppercase mt-0.5">Remove</span>
              </button>
            </div>
          )}
        </div>

        {/* ── Right Panel ── */}
        <aside className="w-72 h-full flex flex-col border-l border-zinc-200/60 overflow-hidden"
          style={{background:'rgba(255,255,255,0.88)',backdropFilter:'blur(20px)'}}>

          <div className="px-6 pt-6 pb-4 border-b border-zinc-100">
            <h3 className="font-bold text-lg text-zinc-800">Room Designer</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Add, drag & customize furniture</p>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

            {/* Furniture grid */}
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Add Furniture</p>
              <div className="grid grid-cols-2 gap-2">
                {FURNITURE_CATALOG.map(item => (
                  <button key={item.type} onClick={() => addFurniture(item.type)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-zinc-50 hover:bg-red-50 hover:text-red-600 border border-zinc-100 hover:border-red-200 transition-all text-zinc-600 text-left">
                    <span className="material-symbols-outlined text-lg">{item.icon}</span>
                    <span className="text-xs font-semibold">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Wall color */}
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Wall Color</p>
              <div className="flex gap-2 flex-wrap">
                {WALL_COLORS.map(c => (
                  <button key={c} onClick={() => setWallColor(c)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${wallColor===c ? 'border-zinc-800 scale-110 shadow-md' : 'border-zinc-200 hover:scale-105'}`}
                    style={{backgroundColor:c}} />
                ))}
              </div>
            </div>

            {/* Floor color */}
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Floor Color</p>
              <div className="flex gap-2 flex-wrap">
                {FLOOR_COLORS.map(c => (
                  <button key={c} onClick={() => setFloorColor(c)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${floorColor===c ? 'border-zinc-800 scale-110 shadow-md' : 'border-zinc-200 hover:scale-105'}`}
                    style={{backgroundColor:c}} />
                ))}
              </div>
            </div>
          </div>

          {/* Selected item panel */}
          {selected && (
            <div className="border-t border-zinc-100 px-6 py-5 space-y-4"
              style={{background:'rgba(255,255,255,0.95)'}}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-zinc-800 capitalize">{selected.type}</span>
                <span className="text-[10px] px-2 py-1 rounded-full font-bold uppercase text-red-600 bg-red-50">
                  selected
                </span>
              </div>

              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Color</p>
                <div className="flex gap-1.5 flex-wrap">
                  {COLORS.map(c => (
                    <button key={c} onClick={() => updateColor(selected.id, c)}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${selected.color===c ? 'border-zinc-800 scale-110' : 'border-zinc-200 hover:scale-105'}`}
                      style={{backgroundColor:c}} />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Custom</p>
                <div className="flex items-center gap-3">
                  <input type="color" value={selected.color}
                    onChange={e => updateColor(selected.id, e.target.value)}
                    className="w-9 h-9 rounded-lg cursor-pointer border border-zinc-200" />
                  <span className="text-xs font-mono text-zinc-400">{selected.color}</span>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Rotate</p>
                <div className="flex gap-2">
                  <button onClick={() => rotateItem(selected.id,-1)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-zinc-50 border border-zinc-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-sm font-medium transition-all text-zinc-600">
                    <span className="material-symbols-outlined text-base">rotate_left</span>
                  </button>
                  <button onClick={() => rotateItem(selected.id,1)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-zinc-50 border border-zinc-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-sm font-medium transition-all text-zinc-600">
                    <span className="material-symbols-outlined text-base">rotate_right</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </aside>
      </main>
    </div>
  )
}
