import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// =====================================
// SCENE, CAMERA AND RENDERER
// =====================================

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(6, 6, 8);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

document.body.appendChild(renderer.domElement);

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// =====================================
// TODO 1: AXES HELPER
// =====================================

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

const grid = new THREE.GridHelper(10, 10);
scene.add(grid);

// =====================================
// TODO 2: VECTORS A AND B
// =====================================

const a = new THREE.Vector3(3, 4, 0);
const b = new THREE.Vector3(1, 0, 0);

let arrowA = null;
let arrowB = null;
let arrowSum = null;

// Function to create or update an arrow
function updateArrow(oldArrow, vector, color) {
    if (oldArrow) {
        scene.remove(oldArrow);
        oldArrow.dispose();
    }

    const length = vector.length();

    // ArrowHelper cannot display a zero-length vector
    if (length < 0.000001) {
        return null;
    }

    const direction = vector.clone().normalize();

    const arrow = new THREE.ArrowHelper(
        direction,
        new THREE.Vector3(0, 0, 0),
        length,
        color,
        Math.min(0.3, length * 0.2),
        Math.min(0.2, length * 0.12)
    );

    scene.add(arrow);

    return arrow;
}

// =====================================
// TODO 3: SUM, DOT PRODUCT AND ANGLE
// =====================================

function updateVectors() {
    // Read input values
    a.set(
        Number(document.getElementById('ax').value),
        Number(document.getElementById('ay').value),
        Number(document.getElementById('az').value)
    );

    b.set(
        Number(document.getElementById('bx').value),
        Number(document.getElementById('by').value),
        Number(document.getElementById('bz').value)
    );

    // Calculate a + b
    const sum = a.clone().add(b);

    // Calculate dot product
    const dot = a.dot(b);

    // Calculate angle between vectors
    let angleText = 'Undefined';

    if (a.length() > 0 && b.length() > 0) {
        const cosine = THREE.MathUtils.clamp(
            dot / (a.length() * b.length()),
            -1,
            1
        );

        const angle = Math.acos(cosine);

        angleText =
            THREE.MathUtils.radToDeg(angle).toFixed(2) + '°';
    }

    // Update arrows
    arrowA = updateArrow(arrowA, a, 0xff0000);
    arrowB = updateArrow(arrowB, b, 0x0000ff);
    arrowSum = updateArrow(arrowSum, sum, 0x00aa00);

    // Display results
    document.getElementById('results').innerHTML = `
        <hr>

        <strong>Vector a:</strong>
        (${a.x.toFixed(2)}, ${a.y.toFixed(2)}, ${a.z.toFixed(2)})
        <br>

        <strong>Vector b:</strong>
        (${b.x.toFixed(2)}, ${b.y.toFixed(2)}, ${b.z.toFixed(2)})
        <br>

        <strong>a + b:</strong>
        (${sum.x.toFixed(2)}, ${sum.y.toFixed(2)}, ${sum.z.toFixed(2)})
        <br>

        <strong>a · b:</strong> ${dot.toFixed(2)}
        <br>

        <strong>Angle θ:</strong> ${angleText}
        <br><br>

        <span class="vector-a">Red: a</span><br>
        <span class="vector-b">Blue: b</span><br>
        <span class="vector-sum">Green: a + b</span>
    `;
}

// Update whenever an input changes
document.querySelectorAll('#panel input').forEach(input => {
    input.addEventListener('input', updateVectors);
});

// =====================================
// CHALLENGE 1: PLANE AND RAY
// =====================================

// Plane equation: z = 2
// General plane equation: n . p + constant = 0

const plane = new THREE.Plane(
    new THREE.Vector3(0, 0, 1),
    -2
);

// Create a visible yellow plane
const planeGeometry = new THREE.PlaneGeometry(4, 4);

const planeMaterial = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    transparent: true,
    opacity: 0.25,
    side: THREE.DoubleSide,
    depthWrite: false
});

const planeMesh = new THREE.Mesh(
    planeGeometry,
    planeMaterial
);

planeMesh.position.z = 2;
scene.add(planeMesh);

// Ray origin and direction
const rayOrigin = new THREE.Vector3(0, 0, 5);

const rayDirection = new THREE.Vector3(0.5, 0.4, -1)
    .normalize();

// Draw the ray as a purple line
const rayLength = 8;

const rayEnd = rayOrigin.clone().add(
    rayDirection.clone().multiplyScalar(rayLength)
);

const rayGeometry = new THREE.BufferGeometry().setFromPoints([
    rayOrigin,
    rayEnd
]);

const rayMaterial = new THREE.LineBasicMaterial({
    color: 0x8800ff
});

const rayLine = new THREE.Line(rayGeometry, rayMaterial);
scene.add(rayLine);

// =====================================
// CHALLENGE 2: MATHEMATICAL INTERSECTION
// =====================================

// Ray equation: P(t) = origin + t * direction
//
// Plane equation: n . P + constant = 0
//
// t = -(n . origin + constant) / (n . direction)

const denominator = plane.normal.dot(rayDirection);

let intersectionPoint = null;

if (Math.abs(denominator) > 0.000001) {
    const t = -(
        plane.normal.dot(rayOrigin) + plane.constant
    ) / denominator;

    // Only accept intersections in the forward ray direction
    if (t >= 0) {
        intersectionPoint = rayOrigin.clone().add(
            rayDirection.clone().multiplyScalar(t)
        );
    }
}

// =====================================
// CHALLENGE 3: VERIFY WITH RAYCASTER
// =====================================

const raycaster = new THREE.Raycaster(
    rayOrigin,
    rayDirection
);

// intersectPlane checks the mathematical plane
const raycasterPoint = raycaster.ray.intersectPlane(
    plane,
    new THREE.Vector3()
);

// Create a magenta sphere at the intersection point
if (intersectionPoint) {
    const pointGeometry = new THREE.SphereGeometry(
        0.12,
        16,
        16
    );

    const pointMaterial = new THREE.MeshBasicMaterial({
        color: 0xff00ff
    });

    const pointMesh = new THREE.Mesh(
        pointGeometry,
        pointMaterial
    );

    pointMesh.position.copy(intersectionPoint);
    scene.add(pointMesh);
}

// Display Challenge results
const challengeResults = document.getElementById(
    'challengeResults'
);

if (intersectionPoint && raycasterPoint) {
    const difference = intersectionPoint.distanceTo(
        raycasterPoint
    );

    challengeResults.innerHTML = `
        <hr>
        <strong>CHALLENGE: Ray and Plane</strong><br>

        <span style="color:#8800ff">Purple: ray</span><br>
        <span style="color:#999900">Yellow: plane (z = 2)</span><br>
        <span style="color:#cc00cc">Magenta: intersection</span>
        <br><br>

        <strong>Formula result:</strong><br>
        (${intersectionPoint.x.toFixed(3)},
        ${intersectionPoint.y.toFixed(3)},
        ${intersectionPoint.z.toFixed(3)})
        <br><br>

        <strong>Raycaster result:</strong><br>
        (${raycasterPoint.x.toFixed(3)},
        ${raycasterPoint.y.toFixed(3)},
        ${raycasterPoint.z.toFixed(3)})
        <br><br>

        <strong>Difference:</strong>
        ${difference.toExponential(2)}
        <br>

        <strong>Results match:</strong>
        ${difference < 0.000001 ? 'YES' : 'NO'}
    `;

    console.log('Formula intersection:', intersectionPoint);
    console.log('Raycaster intersection:', raycasterPoint);
    console.log('Difference:', difference);
} else {
    challengeResults.innerHTML = `
        <hr>
        <strong>Challenge:</strong>
        No forward intersection with the plane.
    `;
}

// Initial vector calculation
updateVectors();

// =====================================
// RESIZE HANDLER
// =====================================

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );
});

// =====================================
// RENDER LOOP
// =====================================

function animate() {
    requestAnimationFrame(animate);

    controls.update();

    renderer.render(scene, camera);
}

animate();
