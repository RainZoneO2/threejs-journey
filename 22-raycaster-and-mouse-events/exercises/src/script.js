import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Objects
 */
const object1 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 16, 16),
  new THREE.MeshBasicMaterial({ color: '#ff0000' })
)
object1.position.x = -2
object1.updateMatrixWorld()

const object2 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 16, 16),
  new THREE.MeshBasicMaterial({ color: '#ff0000' })
)
object2.updateMatrixWorld()

const object3 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 16, 16),
  new THREE.MeshBasicMaterial({ color: '#ff0000' })
)
object3.position.x = 2
object3.updateMatrixWorld()

scene.add(object1, object2, object3)

/**
 * Raycaster
 */
const raycaster = new THREE.Raycaster()

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

window.addEventListener('resize', () => {
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
 * Mouse
 */
const mouse = new THREE.Vector2()

window.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / sizes.width) * 2 - 1
  mouse.y = -(event.clientY / sizes.height) * 2 + 1
})

window.addEventListener('click', () => {
  if (currentIntersect) {
    switch (currentIntersect.object) {
      case object1:
        console.log('click on object1')
        break
      case object2:
        console.log('click on object2')
        break
      case object3:
        console.log('click on object3')
        break
    }
  }
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
)
camera.position.z = 3
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
 * Models
 */
const gltfLoader = new GLTFLoader()

let model = null
gltfLoader.load('/models/Duck/glTF-Binary/Duck.glb', (gltf) => {
  model = gltf.scene
  model.position.y = -1.2
  scene.add(model)
})

/**
 * Lights
 */
// Ambient Light
const ambientLight = new THREE.AmbientLight('#ffffff', 0.3)
scene.add(ambientLight)

// Directional Light
const directionalLight = new THREE.DirectionalLight('#ffffff', 0.7)
directionalLight.position.set(1, 2, 3)
scene.add(directionalLight)

/**
 * Animate
 */
const clock = new THREE.Clock()

const objectsToTest = [object1, object2, object3]
let intersects = null
let currentIntersect = null

const tick = () => {
  const elapsedTime = clock.getElapsedTime()

  // Animate objects
  object1.position.y = Math.sin(elapsedTime * 0.3) * 1.5
  object2.position.y = Math.sin(elapsedTime * 0.8) * 1.5
  object3.position.y = Math.sin(elapsedTime * 1.4) * 1.5

  // Cast a ray
  raycaster.setFromCamera(mouse, camera)
  intersects = raycaster.intersectObjects(objectsToTest)

  for (const object of objectsToTest) {
    const isIntersected = intersects.find((inter) => inter.object === object)
    const targetColor = isIntersected ? '#0000ff' : '#ff0000'
    if (object.material.color.getHexString() !== targetColor.replace('#', '')) {
      object.material.color.set(targetColor)
    }
  }

  if (intersects.length) {
    if (currentIntersect === null) {
      //   console.log('mouse enter')
    }

    currentIntersect = intersects[0]
  } else {
    if (currentIntersect) {
      //   console.log('mouse exit')
    }

    currentIntersect = null
  }

  // Test intersect with model
  if (model) {
    const modelIntersects = raycaster.intersectObject(model)
    const targetScale = modelIntersects.length ? 1.2 : 1
    if (model.scale.x !== targetScale) {
      model.scale.setScalar(targetScale)
    }
  }

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
