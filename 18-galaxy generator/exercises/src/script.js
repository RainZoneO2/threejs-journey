import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new GUI({ title: 'Galaxy'})

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Galaxy
 */
const parameters = {}
parameters.count = 100000
parameters.size = 0.01
parameters.radius = 5
parameters.branches = 15
parameters.spin = 1
parameters.randomness = 0.2
parameters.randomnessPower = 3
parameters.insideColor = '#ff6030'
parameters.outsideColor = '#1b3984'
parameters.rotateGalaxy = true
parameters.rotationSpeed = 0.1
parameters.maxDiskHeight = 0.6

let geometry = null
let material = null
let points = null

const generateGalaxy = () => {
    // Null check - Destroy old galaxy
    if (points !== null) {
        geometry.dispose()
        material.dispose()
        scene.remove(points)
    }
    
    /**
     * Geometry
     */
    geometry = new THREE.BufferGeometry()
    
    const positions = new Float32Array(parameters.count * 3)
    const colors = new Float32Array(parameters.count * 3)

    const insideColor = new THREE.Color(parameters.insideColor)
    const outsideColor = new THREE.Color(parameters.outsideColor)

    for (let i = 0; i < parameters.count; i++) {
        const i3 = i * 3

        // Position
        const radius = Math.random() * parameters.radius 
        const spinAngle = radius * parameters.spin
        const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2

        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)

        const taperFactor = 1 - (radius / parameters.radius)
        const maxY = parameters.maxDiskHeight * taperFactor

        positions[i3 + 0] = Math.cos(branchAngle + spinAngle) * radius + randomX
        positions[i3 + 1] = randomY * maxY
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ

        // Color
        const mixedColor = insideColor.clone()
        mixedColor.lerp(outsideColor, radius / parameters.radius)

        colors[i3   ] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    /**
     * Material
     */
    material = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    })

    /**
     * Points
     */
    points = new THREE.Points(geometry, material)
    scene.add(points)
}
generateGalaxy()

// Debug

const geometryFolder = gui.addFolder('Geometry')
geometryFolder.close()
geometryFolder.add(parameters, 'count').min(100).max(500000).step(10).onFinishChange(generateGalaxy)
geometryFolder.add(parameters, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(generateGalaxy)
geometryFolder.add(parameters, 'radius').min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy)
geometryFolder.add(parameters, 'branches').min(2).max(20).step(1).onFinishChange(generateGalaxy)
geometryFolder.add(parameters, 'spin').min(-5).max(5).step(0.01).onFinishChange(generateGalaxy)
geometryFolder.add(parameters, 'randomness').min(0.05).max(2).step(0.001).onFinishChange(generateGalaxy)
geometryFolder.add(parameters, 'randomnessPower').min(0).max(10).step(0.001).onFinishChange(generateGalaxy)
geometryFolder.add(parameters, 'maxDiskHeight').min(0.3).max(1).step(0.001).onFinishChange(generateGalaxy)
gui.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy)
gui.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy)
gui.add(parameters, 'rotateGalaxy')
gui.add(parameters, 'rotationSpeed').min(0.05).max(0.5).step(0.001)

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
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

controls.minDistance = 0.1
controls.maxDistance = 25

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

    // Update galaxy
    if (parameters.rotateGalaxy && points !== null) {
        points.rotation.y = elapsedTime * parameters.rotationSpeed
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()