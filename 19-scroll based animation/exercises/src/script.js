import * as THREE from 'three'
import GUI from 'lil-gui'
import gsap from 'gsap'

/**
 * Debug
 */
const gui = new GUI()

const parameters = {
    objectColor: '#ffeded',
    particleColor: '#ffeded',
    particleCount: 200,
    particleSize: 0.02,
    parallaxStrength: 0.5
}

const objectFolder = gui.addFolder('Objects')
objectFolder.close()
const particleFolder = gui.addFolder('Particles')
particleFolder.close()


/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Objects
 */
// Texture
const textureLoader = new THREE.TextureLoader()
const gradientTexture = textureLoader.load('/textures/gradients/3.jpg')

gradientTexture.magFilter = THREE.NearestFilter

// Material
const material = new THREE.MeshToonMaterial({ 
    color: parameters.materialColor,
    gradientMap: gradientTexture
})

// Meshes
const objectsDistance = 4

const mesh1 = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.4, 16, 60),
    material
)
const mesh2 = new THREE.Mesh(
    new THREE.ConeGeometry(1, 2, 32),
    material
)
const mesh3 = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
    material
)

mesh1.position.y = - objectsDistance * 0
mesh2.position.y = - objectsDistance * 1
mesh3.position.y = - objectsDistance * 2

mesh1.position.x = 1.5
mesh2.position.x = - 1.5
mesh3.position.x = 1.5

scene.add(mesh1, mesh2, mesh3)

const sectionMeshes = [ mesh1, mesh2, mesh3]

/**
 * Particles
 */
// Geometry
const positions = new Float32Array(parameters.particleCount * 3)

let particlesGeometry = null
let particlesMaterial = null
let particles = null

const generateParticles = () => {
    // Null check - Destroy old particles
    if (particles !== null) {
        particlesGeometry.dispose()
        particlesMaterial.dispose()
        scene.remove(particles)
    }

    /**
     * Geometry
     */
    for (let i = 0; i < parameters.particleCounty; i++) {
        // Positions
        positions[i * 3 + 0] = (Math.random() - 0.5) * 10
        positions[i * 3 + 1] = objectsDistance * 0.5 - Math.random() * objectsDistance * sectionMeshes.length
        positions[i * 3 + 2] = (Math.random() - 0.5) * 10
    }
    
    particlesGeometry = new THREE.BufferGeometry()
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    
    /**
     * Material
     */
    particlesMaterial = new THREE.PointsMaterial({
        color: parameters.materialColor,
        size: parameters.particleSize,
        sizeAttenuation: true
    })

    // Mesh
    particles = new THREE.Points(particlesGeometry, particlesMaterial)
    scene.add(particles)
}
generateParticles()

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
directionalLight.position.set(1, 1, 0)
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Group
const cameraGroup = new THREE.Group()
scene.add(cameraGroup)

// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6
cameraGroup.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Scroll
 */
let scrollY = window.scrollY
let currentSection = 0

window.addEventListener('scroll', () => {
    scrollY = window.scrollY
    const newSection = Math.round(scrollY / sizes.height)
    
    if (newSection != currentSection) {
        currentSection = newSection

        gsap.to(
            sectionMeshes[currentSection].rotation,
            {
                duration: 1.5,
                ease: 'power2.inOut',
                x: '+=6',
                y: '+=3',
                z: '+=3'
            }
        )
    }
    
})

/**
 * Cursor
 */
const cursor = {}
cursor.x = 0
cursor.y = 0

window.addEventListener('mousemove', (event) => {
    cursor.x = (event.clientX / sizes.width) - 0.5
    cursor.y = (event.clientY / sizes.height) - 0.5
})

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // Animate camera
    camera.position.y = - scrollY / sizes.height * objectsDistance

    const parallaxX = cursor.x * parameters.parallaxStrength
    const parallaxY = - cursor.y * parameters.parallaxStrength
    cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 3 * deltaTime
    cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 3 * deltaTime

    // Animate meshes
    sectionMeshes.forEach(mesh => {
        mesh.rotation.x += deltaTime * 0.1
        mesh.rotation.y += deltaTime * 0.12

    })

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()

// Debug
objectFolder.addColor(parameters, 'objectColor').onChange(() => {
    material.color.set(parameters.objectColor)
})
particleFolder.addColor(parameters, 'particleColor').onChange(() => {
    particlesMaterial.color.set(parameters.particleColor)
})
particleFolder.add(parameters, 'particleCount')
    .min(100).max(1000).step(10).onFinishChange(generateParticles)
particleFolder.add(parameters, 'particleSize')
    .min(0.01).max(0.5).step(0.001).onFinishChange(generateParticles)
gui.add(parameters, 'parallaxStrength')
    .min(0).max(1).step(0.01)
