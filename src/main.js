import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FactoryScene } from './scenes/FactoryScene.js';
import { DataManager } from './data/DataManager.js';
import { InteractionManager } from './interaction/InteractionManager.js';
import { LabelManager } from './ui/LabelManager.js';

class DigitalFactory {
    constructor() {
        this.container = document.getElementById('canvas-container');
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.factoryScene = null;
        this.dataManager = null;
        this.interactionManager = null;
        this.labelManager = null;
        this.clock = new THREE.Clock();
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fps = 0;
        
        this.init();
    }
    
    init() {
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createLights();
        this.createControls();
        
        this.factoryScene = new FactoryScene(this.scene);
        this.dataManager = new DataManager(this.factoryScene.getDevices());
        this.interactionManager = new InteractionManager(this.scene, this.camera, this.factoryScene.getDevices());
        this.labelManager = new LabelManager(this.container, this.camera);
        
        this.setupEventListeners();
        this.hideLoading();
        this.animate();
    }
    
    createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0f);
        this.scene.fog = new THREE.Fog(0x0a0a0f, 50, 200);
    }
    
    createCamera() {
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
        this.camera.position.set(40, 30, 40);
        this.camera.lookAt(0, 0, 0);
    }
    
    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.container.appendChild(this.renderer.domElement);
    }
    
    createLights() {
        const ambientLight = new THREE.AmbientLight(0x404060, 0.5);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        this.scene.add(directionalLight);
        
        const fillLight = new THREE.DirectionalLight(0x00d4ff, 0.3);
        fillLight.position.set(-50, 50, -50);
        this.scene.add(fillLight);
        
        const pointLight1 = new THREE.PointLight(0x00ff88, 0.5, 100);
        pointLight1.position.set(20, 15, 20);
        this.scene.add(pointLight1);
        
        const pointLight2 = new THREE.PointLight(0xff4444, 0.3, 80);
        pointLight2.position.set(-20, 10, -20);
        this.scene.add(pointLight2);
    }
    
    createControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 10;
        this.controls.maxDistance = 150;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.1;
        this.controls.target.set(0, 0, 0);
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
        
        document.getElementById('view-mode').addEventListener('change', (e) => {
            this.changeView(e.target.value);
        });
        
        document.getElementById('show-labels').addEventListener('change', (e) => {
            this.labelManager.setVisible(e.target.checked);
        });
        
        document.getElementById('auto-rotate').addEventListener('change', (e) => {
            this.controls.autoRotate = e.target.checked;
            this.controls.autoRotateSpeed = 0.5;
        });
        
        document.getElementById('refresh-rate').addEventListener('change', (e) => {
            this.dataManager.setRefreshRate(parseInt(e.target.value));
        });
        
        document.getElementById('close-info').addEventListener('click', () => {
            document.getElementById('info-panel').classList.add('hidden');
        });
        
        this.interactionManager.onSelect((device) => {
            this.showDeviceInfo(device);
        });
        
        this.updateTime();
        setInterval(() => this.updateTime(), 1000);
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    changeView(mode) {
        const duration = 1000;
        const startPos = this.camera.position.clone();
        const startTarget = this.controls.target.clone();
        let endPos, endTarget;
        
        switch(mode) {
            case 'top':
                endPos = new THREE.Vector3(0, 80, 0.1);
                endTarget = new THREE.Vector3(0, 0, 0);
                break;
            case 'front':
                endPos = new THREE.Vector3(0, 10, 60);
                endTarget = new THREE.Vector3(0, 5, 0);
                break;
            case 'side':
                endPos = new THREE.Vector3(60, 10, 0);
                endTarget = new THREE.Vector3(0, 5, 0);
                break;
            default:
                endPos = new THREE.Vector3(40, 30, 40);
                endTarget = new THREE.Vector3(0, 0, 0);
        }
        
        const startTime = performance.now();
        
        const animateCamera = () => {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            
            this.camera.position.lerpVectors(startPos, endPos, eased);
            this.controls.target.lerpVectors(startTarget, endTarget, eased);
            
            if (progress < 1) {
                requestAnimationFrame(animateCamera);
            }
        };
        
        animateCamera();
    }
    
    showDeviceInfo(device) {
        const panel = document.getElementById('info-panel');
        const info = document.getElementById('device-info');
        
        const statusClass = device.data.temperature > 80 ? 'danger' : 
                           device.data.temperature > 60 ? 'warning' : 'normal';
        
        info.innerHTML = `
            <div class="info-row">
                <span class="info-label">设备ID</span>
                <span class="info-value">${device.id}</span>
            </div>
            <div class="info-row">
                <span class="info-label">设备名称</span>
                <span class="info-value">${device.name}</span>
            </div>
            <div class="info-row">
                <span class="info-label">设备类型</span>
                <span class="info-value">${device.type}</span>
            </div>
            <div class="info-row">
                <span class="info-label">温度</span>
                <span class="info-value ${statusClass}">${device.data.temperature.toFixed(1)}°C</span>
            </div>
            <div class="info-row">
                <span class="info-label">压力</span>
                <span class="info-value">${device.data.pressure.toFixed(1)} MPa</span>
            </div>
            <div class="info-row">
                <span class="info-label">运行状态</span>
                <span class="info-value ${device.data.status === 'running' ? 'normal' : 'warning'}">
                    ${device.data.status === 'running' ? '运行中' : '停止'}
                </span>
            </div>
            <div class="info-row">
                <span class="info-label">效率</span>
                <span class="info-value">${(device.data.efficiency * 100).toFixed(1)}%</span>
            </div>
            <div class="info-row">
                <span class="info-label">最后更新</span>
                <span class="info-value">${new Date().toLocaleTimeString()}</span>
            </div>
        `;
        
        panel.classList.remove('hidden');
    }
    
    updateTime() {
        const now = new Date();
        document.getElementById('time').textContent = now.toLocaleString('zh-CN');
    }
    
    hideLoading() {
        setTimeout(() => {
            document.getElementById('loading').classList.add('hidden');
        }, 500);
    }
    
    updateFPS() {
        this.frameCount++;
        const currentTime = performance.now();
        
        if (currentTime - this.lastTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastTime = currentTime;
            document.getElementById('fps').textContent = `FPS: ${this.fps}`;
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const delta = this.clock.getDelta();
        
        this.controls.update();
        this.factoryScene.update(delta);
        this.dataManager.update();
        this.labelManager.update(this.factoryScene.getDevices());
        
        this.renderer.render(this.scene, this.camera);
        this.updateFPS();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new DigitalFactory();
});
