import './style.css'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import gsap from 'gsap'

// scene
const scene = new THREE.Scene()

// camera
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.z = 3.5;

// renderer 
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('canvas'),
    antialias: true,
    alpha: true,
})
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;

// Post processing
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const rgbShiftPass = new ShaderPass(RGBShiftShader);
rgbShiftPass.uniforms['amount'].value = 0.0030;
composer.addPass(rgbShiftPass);

// HDRI
let model;
const rgbeLoader = new RGBELoader();
rgbeLoader.load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/pond_bridge_night_1k.hdr', function(texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
    
    // model loader - load model after HDRI is ready
    const loader = new GLTFLoader()
    loader.load('./DamagedHelmet.gltf', (gltf)=>{
        model = gltf.scene;
        scene.add(model);
    }, undefined , (error)=>{
        console.error("An error occurred while loading the GLTF model:", error);
    }
)
});

// Window resize handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener("mousemove", (e)=>{
    if(model){
        const rotationX = (e.clientX / window.innerWidth - .5) * (Math.PI * .3);
        const rotationY = (e.clientY / window.innerHeight - .5) * (Math.PI * .3);
        gsap.to(model.rotation, {
            y: rotationX,
            x: rotationY,
            duration: 0.8,
            ease: "power2.out"
        });
    }
})

function animate(){
    window.requestAnimationFrame(animate);
    composer.render();
}
animate()
