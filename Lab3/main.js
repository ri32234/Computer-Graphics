
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js';

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    100
)
camera.position.set(12, 10, 18)

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// Lights
const pointLight = new THREE.PointLight(0xffffff, 400, 0, 1.6)
const ambientLight = new THREE.AmbientLight(0xffffff, 2.3)
scene.add(pointLight, ambientLight)

// Sun
const geometry = new THREE.SphereGeometry(2, 32, 24)
const material = new THREE.MeshStandardMaterial({ color: 0xb44d1a })
const sun = new THREE.Mesh(geometry, material)
scene.add(sun)

// Earth orbit
const earthOrbit = new THREE.Object3D()
sun.add(earthOrbit)

const earth = new THREE.Mesh(
    new THREE.SphereGeometry(0.8, 32, 24),
    new THREE.MeshStandardMaterial({ color: 0x1E40FF, roughness: 0.9 })
)
earth.position.x = 6
earthOrbit.add(earth)

// Moon orbit
const moonOrbit = new THREE.Object3D()
earth.add(moonOrbit)

const moon = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 32, 24),
    new THREE.MeshStandardMaterial({ color: 0xaaaaaa })
)
moon.position.x = 1.8
moonOrbit.add(moon)

// Mars orbit
const marsOrbit = new THREE.Object3D()
sun.add(marsOrbit)

const mars = new THREE.Mesh(
    new THREE.SphereGeometry(0.55, 32, 24),
    new THREE.MeshStandardMaterial({ color: 0xc1440e })
)
mars.position.x = 9
marsOrbit.add(mars)

// Phobos orbit
const phobosOrbit = new THREE.Object3D()
mars.add(phobosOrbit)

const phobos = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 32, 24),
    new THREE.MeshStandardMaterial({ color: 0x888888 })
)
phobos.position.x = 1
phobosOrbit.add(phobos)

// Controls
const control = new OrbitControls(camera, renderer.domElement)

// Animation
function animate() {
    requestAnimationFrame(animate)

    control.update()

    earthOrbit.rotation.y += 0.01
    moonOrbit.rotation.y += 0.04
    earth.rotation.y += 0.05

    sun.rotation.y += 0.003

    marsOrbit.rotation.y += 0.006
    phobosOrbit.rotation.y += 0.08
    mars.rotation.y += 0.03

    renderer.render(scene, camera)
}

animate()

// Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
})
