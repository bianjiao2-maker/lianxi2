import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class SceneManager {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.interactableObjects = [];
        this.onObjectClick = null;
        this.onObjectHover = null;
        
        this.init();
    }
    
    init() {
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createLighting();
        this.createControls();
        this.setupEventListeners();
        this.animate();
    }
    
    createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a1a);
        this.scene.fog = new THREE.Fog(0x0a0a1a, 50, 200);
    }
    
    createCamera() {
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
        this.camera.position.set(40, 30, 40);
        this.camera.lookAt(0, 0, 0);
    }
    
    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        this.container.appendChild(this.renderer.domElement);
    }
    
    createLighting() {
        const ambientLight = new THREE.AmbientLight(0x404080, 0.5);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(50, 80, 30);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.1;
        directionalLight.shadow.camera.far = 200;
        directionalLight.shadow.camera.left = -50;
        directionalLight.shadow.camera.right = 50;
        directionalLight.shadow.camera.top = 50;
        directionalLight.shadow.camera.bottom = -50;
        this.scene.add(directionalLight);
        
        const pointLight1 = new THREE.PointLight(0x00ffff, 0.5, 50);
        pointLight1.position.set(-20, 20, -20);
        this.scene.add(pointLight1);
        
        const pointLight2 = new THREE.PointLight(0xff0080, 0.5, 50);
        pointLight2.position.set(20, 20, 20);
        this.scene.add(pointLight2);
    }
    
    createControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 10;
        this.controls.maxDistance = 100;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.1;
        this.controls.target.set(0, 0, 0);
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize(), false);
        
        this.renderer.domElement.addEventListener('click', (event) => {
            this.onMouseClick(event);
        }, false);
        
        this.renderer.domElement.addEventListener('mousemove', (event) => {
            this.onMouseMove(event);
        }, false);
    }
    
    onWindowResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
    
    updateMousePosition(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }
    
    onMouseClick(event) {
        this.updateMousePosition(event);
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.interactableObjects, true);
        
        if (intersects.length > 0) {
            const object = intersects[0].object;
            const deviceData = object.userData.deviceData;
            
            if (deviceData && this.onObjectClick) {
                this.onObjectClick(deviceData, object);
            }
        }
    }
    
    onMouseMove(event) {
        this.updateMousePosition(event);
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.interactableObjects, true);
        
        if (intersects.length > 0) {
            const object = intersects[0].object;
            const deviceData = object.userData.deviceData;
            
            if (deviceData && this.onObjectHover) {
                this.onObjectHover(deviceData, object, event);
            }
            this.renderer.domElement.style.cursor = 'pointer';
        } else {
            this.renderer.domElement.style.cursor = 'default';
            if (this.onObjectHover) {
                this.onObjectHover(null, null, event);
            }
        }
    }
    
    addInteractableObject(object) {
        this.interactableObjects.push(object);
    }
    
    removeInteractableObject(object) {
        const index = this.interactableObjects.indexOf(object);
        if (index > -1) {
            this.interactableObjects.splice(index, 1);
        }
    }
    
    add(object) {
        this.scene.add(object);
    }
    
    remove(object) {
        this.scene.remove(object);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.controls) {
            this.controls.update();
        }
        
        this.renderer.render(this.scene, this.camera);
    }
    
    dispose() {
        this.renderer.dispose();
        this.container.removeChild(this.renderer.domElement);
    }
    
    getScene() {
        return this.scene;
    }
    
    getCamera() {
        return this.camera;
    }
    
    getRenderer() {
        return this.renderer;
    }
}
