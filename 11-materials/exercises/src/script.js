import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { HDRCubeTextureLoader } from 'three/examples/jsm/Addons.js';

/**
 * Debug
 */
const gui = new GUI()

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Textures
const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()
//const hdrTextureLoader = new RGBELoader()

const doorColorTexture = textureLoader.load('./textures/door/color.jpg')
const doorAlphaTexture = textureLoader.load('./textures/door/alpha.jpg')
const doorNormalTexture = textureLoader.load('./textures/door/normal.jpg')
const doorAmbientOcclusionTexture = textureLoader.load('./textures/door/ambientOcclusion.jpg')
const doorHeightTexture = textureLoader.load('./textures/door/height.jpg')
const doorMetalnessTexture = textureLoader.load('./textures/door/metalness.jpg')
const doorRoughnessTexture = textureLoader.load('./textures/door/roughness.jpg')
const matcapTexture = textureLoader.load('./textures/matcaps/8.png')
const gradientTexture = textureLoader.load('./textures/gradients/5.jpg')
gradientTexture.minFilter = THREE.NearestFilter
gradientTexture.magFilter = THREE.NearestFilter
gradientTexture.generateMipmaps = false

const environmentMapTexture = cubeTextureLoader.load([
    '/textures/environmentMaps/3/px.jpg',
    '/textures/environmentMaps/3/px.jpg',
    '/textures/environmentMaps/3/py.jpg',
    '/textures/environmentMaps/3/ny.jpg',
    '/textures/environmentMaps/3/pz.jpg',
    '/textures/environmentMaps/3/nz.jpg',
])
//const environmentMapTexture = hdrTextureLoader.load('./textures/environmentMap/2k.hdr')

doorColorTexture.colorSpace = THREE.SRGBColorSpace
doorAmbientOcclusionTexture.colorSpace = THREE.SRGBColorSpace
matcapTexture.colorSpace = THREE.SRGBColorSpace

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
 * Objects
 */
// MeshBasicMaterial
// const material = new THREE.MeshBasicMaterial()
// material.map = doorColorTexture
// material.color = new THREE.Color('red')
// material.wireframe = true 
// material.opacity = 0.2
// material.transparent = true
// material.alphaMap = doorAlphaTexture
// material.side = THREE.DoubleSide

// MeshNormalMaterial
// const material = new THREE.MeshNormalMaterial()
// material.wireframe = true
// material.flatShading = true

// MeshMatcapMaterial
// const material = new THREE.MeshMatcapMaterial()
// material.matcap = matcapTexture

// MeshDepthMaterial
// const material = new THREE.MeshDepthMaterial()

// MeshLambertMaterial
// const material = new THREE.MeshLambertMaterial()

// MeshPhongMaterial
// const material = new THREE.MeshPhongMaterial()
// material.shininess = 1000
// material.specular = new THREE.Color(0xff00ff)

// MeshToonMaterial
// const material = new THREE.MeshToonMaterial()
// material.gradientMap = gradientTexture

// MeshStandardMaterial
// const material = new THREE.MeshStandardMaterial()
// material.metalness = 0.45
// material.roughness = 0.65
// material.map = doorColorTexture
// material.aoMap = doorAmbientOcclusionTexture
// material.aoMapIntensity = 1
// material.displacementMap = doorHeightTexture
// material.displacementScale = 0.05
// material.metalnessMap = doorMetalnessTexture
// material.roughnessMap = doorRoughnessTexture
// material.normalMap = doorNormalTexture
// material.normalScale.set(0.8, 0.8)
// material.alphaMap = doorAlphaTexture
// material.transparent = true

const material = new THREE.MeshStandardMaterial()
material.metalness = 0.7
material.roughness = 0.2
material.envMap = environmentMapTexture



// Debug
gui
    .add(material, 'metalness')
    .min(0)
    .max(1)
    .step(0.0001)

gui
    .add(material, 'roughness')
    .min(0)
    .max(1)
    .step(0.0001)

// gui
//     .add(material, 'aoMapIntensity')
//     .min(0)
//     .max(10)
//     .step(0.1)

// gui
//     .add(material, 'displacementScale')
//     .min(0)
//     .max(1)
//     .step(0.01)



const sphereMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 64, 64), 
    material
)
sphereMesh.position.x = - 1.5

sphereMesh.geometry.setAttribute(
    'uv2', 
    new THREE.BufferAttribute(sphereMesh.geometry.attributes.uv.array, 2)
)

const planeMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1, 100, 100), 
    material
)

planeMesh.geometry.setAttribute(
    'uv2', 
    new THREE.BufferAttribute(planeMesh.geometry.attributes.uv.array, 2)
)

const torusMesh = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.2, 64, 128), 
    material
)
torusMesh.position.x = 1.5

torusMesh.geometry.setAttribute(
    'uv2', 
    new THREE.BufferAttribute(torusMesh.geometry.attributes.uv.array, 2)
)

scene.add(sphereMesh, planeMesh, torusMesh)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)

const pointLight = new THREE.PointLight(0xffffff, 10)
pointLight.position.x = 1
pointLight.position.y = 2
pointLight.position.z = 1
scene.add(pointLight)

// const pointLightHelper = new THREE.PointLightHelper(pointLight)
// scene.add(pointLightHelper)

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 1
camera.position.y = 1
camera.position.z = 2
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update objects
    sphereMesh.rotation.y = 0.1 * elapsedTime
    planeMesh.rotation.y = 0.1 * elapsedTime
    torusMesh.rotation.y = 0.1 * elapsedTime

    sphereMesh.rotation.x = -0.15 * elapsedTime
    planeMesh.rotation.x = -0.15 * elapsedTime
    torusMesh.rotation.x = -0.15 * elapsedTime



    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()