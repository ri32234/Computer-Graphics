import * as THREE from 'three'
import { GLTFLoader, OrbitControls } from 'three/examples/jsm/Addons.js';

const scene = new THREE.Scene()
scene.background = new THREE.Color(0xcccccc)

const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 100)
camera.position.set(3, 2, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(innerWidth, innerHeight)
document.body.appendChild(renderer.domElement)


scene.add(new THREE.AmbientLight(0xffffff, 0.4))
const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5)
directionalLight.position.set(5, 8, 4)
scene.add(directionalLight)

const loader = new GLTFLoader();
loader.load('public/model.glb', (gltf) => {
    gltf.scene.rotation.y = Math.PI
    scene.add(gltf.scene);

    let meshCount = 0;
    let totalVerices = 0;
    let totalFaces = 0;
    gltf.scene.traverse((child) => {
        if (child.isMesh) {
            meshCount++

            const geometry = child.geometry
            const position = geometry.getAttribute('position')
            const index = geometry.index

            const vertices = position.count
            const faces = index.count / 3

            totalVerices += vertices
            totalFaces += faces

            console.log('Mesh', child.name)
            console.log('Vertices', vertices)
            console.log('Faces', faces)

        }
    })
    console.log('Total Meshes', meshCount)
    console.log('Total Vertices', totalVerices)
    console.log('Total Faces', totalFaces)
});

const control = new OrbitControls(camera, renderer.domElement)
function animate() {
    requestAnimationFrame(animate)
    control.update()
    renderer.render(scene, camera)
}
animate()