import * as THREE from 'three';

export class InteractionManager {
    constructor(scene, camera, devices) {
        this.scene = scene;
        this.camera = camera;
        this.devices = devices;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.selectedDevice = null;
        this.hoveredDevice = null;
        this.callbacks = [];
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        window.addEventListener('mousemove', (event) => this.onMouseMove(event));
        window.addEventListener('click', (event) => this.onClick(event));
        window.addEventListener('touchstart', (event) => this.onTouch(event));
    }
    
    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        this.checkIntersection();
        
        if (this.hoveredDevice) {
            document.body.style.cursor = 'pointer';
        } else {
            document.body.style.cursor = 'default';
        }
    }
    
    onClick(event) {
        if (this.hoveredDevice) {
            this.selectDevice(this.hoveredDevice);
        }
    }
    
    onTouch(event) {
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            this.mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
            
            this.checkIntersection();
            
            if (this.hoveredDevice) {
                this.selectDevice(this.hoveredDevice);
            }
        }
    }
    
    checkIntersection() {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        const meshes = this.devices.map(d => d.mesh);
        const intersects = this.raycaster.intersectObjects(meshes, true);
        
        if (intersects.length > 0) {
            const intersectedMesh = this.findParentDevice(intersects[0].object);
            
            if (intersectedMesh) {
                const device = this.devices.find(d => d.mesh === intersectedMesh);
                
                if (device !== this.hoveredDevice) {
                    if (this.hoveredDevice) {
                        this.unhighlightDevice(this.hoveredDevice);
                    }
                    this.hoveredDevice = device;
                    this.highlightDevice(device);
                }
            }
        } else {
            if (this.hoveredDevice) {
                this.unhighlightDevice(this.hoveredDevice);
                this.hoveredDevice = null;
            }
        }
    }
    
    findParentDevice(object) {
        let current = object;
        while (current) {
            if (this.devices.some(d => d.mesh === current)) {
                return current;
            }
            current = current.parent;
        }
        return null;
    }
    
    highlightDevice(device) {
        device.mesh.traverse((child) => {
            if (child.isMesh && child.material) {
                if (!child.userData.originalEmissive) {
                    child.userData.originalEmissive = child.material.emissive ? 
                        child.material.emissive.clone() : new THREE.Color(0x000000);
                    child.userData.originalEmissiveIntensity = child.material.emissiveIntensity || 0;
                }
                
                if (child.material.emissive) {
                    child.material.emissive.setHex(0x00d4ff);
                    child.material.emissiveIntensity = 0.3;
                }
            }
        });
    }
    
    unhighlightDevice(device) {
        device.mesh.traverse((child) => {
            if (child.isMesh && child.material && child.userData.originalEmissive) {
                if (child.material.emissive) {
                    child.material.emissive.copy(child.userData.originalEmissive);
                    child.material.emissiveIntensity = child.userData.originalEmissiveIntensity;
                }
            }
        });
    }
    
    selectDevice(device) {
        if (this.selectedDevice && this.selectedDevice !== device) {
            this.unhighlightDevice(this.selectedDevice);
        }
        
        this.selectedDevice = device;
        this.callbacks.forEach(cb => cb(device));
    }
    
    onSelect(callback) {
        this.callbacks.push(callback);
    }
}
