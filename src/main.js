import * as THREE from 'three';
import { SceneManager } from './core/SceneManager.js';
import { FactoryModels } from './models/FactoryModels.js';
import { DataManager } from './data/DataManager.js';
import { LabelManager } from './visualization/LabelManager.js';
import { AnimationManager } from './visualization/AnimationManager.js';
import { UIManager } from './ui/UIManager.js';

class DigitalFactory {
    constructor() {
        this.container = document.getElementById('canvas-container');
        this.sceneManager = null;
        this.factoryModels = null;
        this.dataManager = null;
        this.labelManager = null;
        this.animationManager = null;
        this.uiManager = null;
        this.devices = new Map();
        
        this.init();
    }
    
    async init() {
        try {
            this.sceneManager = new SceneManager(this.container);
            this.factoryModels = new FactoryModels(this.sceneManager.getScene());
            this.dataManager = new DataManager();
            this.labelManager = new LabelManager(
                this.sceneManager.getScene(),
                this.sceneManager.getCamera(),
                this.sceneManager.getRenderer()
            );
            this.animationManager = new AnimationManager(this.sceneManager.getScene());
            this.uiManager = new UIManager(this.dataManager);
            
            this.createEnvironment();
            this.createDevices();
            this.setupInteractions();
            this.setupDataBinding();
            this.startAnimationLoop();
            
            this.dataManager.startSimulation();
            
            setTimeout(() => {
                this.uiManager.hideLoadingScreen();
            }, 1500);
            
            console.log('3D数字工厂初始化完成');
        } catch (error) {
            console.error('初始化失败:', error);
        }
    }
    
    createEnvironment() {
        const floor = this.factoryModels.createFloor();
        this.sceneManager.add(floor);
        
        const wall1 = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 30),
            new THREE.MeshStandardMaterial({ 
                color: 0x3a3a4a,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.8
            })
        );
        wall1.position.set(0, 15, -50);
        wall1.receiveShadow = true;
        this.sceneManager.add(wall1);
        
        const wall2 = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 30),
            new THREE.MeshStandardMaterial({ 
                color: 0x3a3a4a,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.8
            })
        );
        wall2.rotation.y = Math.PI / 2;
        wall2.position.set(-50, 15, 0);
        wall2.receiveShadow = true;
        this.sceneManager.add(wall2);
    }
    
    createDevices() {
        const deviceConfigs = [
            { type: 'cnc', x: -20, z: -20, id: 'cnc-001' },
            { type: 'cnc', x: -10, z: -20, id: 'cnc-002' },
            { type: 'cnc', x: 0, z: -20, id: 'cnc-003' },
            { type: 'robot', x: 15, z: -15, id: 'robot-001' },
            { type: 'robot', x: 25, z: -15, id: 'robot-002' },
            { type: 'conveyor', x: -10, z: 0, width: 4, length: 30, id: 'conveyor-001' },
            { type: 'conveyor', x: 10, z: 0, width: 4, length: 30, id: 'conveyor-002' },
            { type: 'tank', x: -30, z: 20, id: 'tank-001' },
            { type: 'tank', x: -20, z: 20, id: 'tank-002' },
            { type: 'assembly', x: 20, z: 10, id: 'assembly-001' },
            { type: 'assembly', x: 30, z: 10, id: 'assembly-002' },
            { type: 'agv', x: 0, z: 25, id: 'agv-001' }
        ];
        
        deviceConfigs.forEach(config => {
            this.createDevice(config);
        });
    }
    
    createDevice(config) {
        let result;
        
        switch (config.type) {
            case 'cnc':
                result = this.factoryModels.createCNCMachine(config.x, config.z, config.id);
                break;
            case 'robot':
                result = this.factoryModels.createRobotArm(config.x, config.z, config.id);
                break;
            case 'conveyor':
                result = this.factoryModels.createConveyorBelt(
                    config.x, config.z, config.width, config.length, config.id
                );
                break;
            case 'tank':
                result = this.factoryModels.createStorageTank(config.x, config.z, config.id);
                break;
            case 'assembly':
                result = this.factoryModels.createAssemblyStation(config.x, config.z, config.id);
                break;
            case 'agv':
                result = this.factoryModels.createAGV(config.x, config.z, config.id);
                break;
            default:
                return;
        }
        
        if (result) {
            const { mesh, group } = result;
            
            this.sceneManager.add(group);
            this.sceneManager.addInteractableObject(mesh);
            
            this.dataManager.registerDevice(mesh.userData.deviceData);
            this.devices.set(config.id, { mesh, group, config });
            
            this.labelManager.createLabel(mesh.userData.deviceData, mesh);
            
            this.setupDeviceAnimation(mesh, group, config.type);
        }
    }
    
    setupDeviceAnimation(mesh, group, type) {
        const deviceData = mesh.userData.deviceData;
        
        switch (type) {
            case 'cnc':
                this.animationManager.addRotationAnimation(
                    group.children[2], 'y', 0.5
                );
                break;
            case 'robot':
                if (deviceData.joints) {
                    this.animationManager.addRobotAnimation(mesh, deviceData.joints, 0.8);
                }
                break;
            case 'conveyor':
                const rollers = group.children.filter(child => 
                    child.geometry && child.geometry.type === 'CylinderGeometry'
                );
                if (rollers.length > 0) {
                    this.animationManager.addConveyorAnimation(mesh, rollers, 1);
                }
                break;
            case 'agv':
                if (deviceData.light) {
                    this.animationManager.addStatusLightAnimation(mesh, deviceData.light);
                }
                const agvPath = [
                    { x: -20, z: 25 },
                    { x: 20, z: 25 },
                    { x: 20, z: 35 },
                    { x: -20, z: 35 }
                ];
                this.animationManager.addAGVAnimation(group, agvPath, 1);
                break;
        }
    }
    
    setupInteractions() {
        this.sceneManager.onObjectClick = (deviceData, object) => {
            this.uiManager.showDeviceDetails(deviceData);
            this.highlightDevice(object);
        };
        
        this.sceneManager.onObjectHover = (deviceData, object, event) => {
            if (deviceData) {
                this.uiManager.showTooltip(deviceData, event);
            } else {
                this.uiManager.hideTooltip();
            }
        };
    }
    
    setupDataBinding() {
        this.dataManager.on('dataUpdated', ({ id, data }) => {
            const device = this.devices.get(id);
            if (device) {
                this.factoryModels.updateMaterialColor(device.mesh, data.status);
                this.labelManager.updateLabelData(id, data);
            }
        });
        
        this.dataManager.on('statusChanged', ({ id, newStatus, alerts }) => {
            console.log(`设备 ${id} 状态变更为: ${newStatus}`);
            if (alerts && alerts.length > 0) {
                console.warn('告警:', alerts);
            }
        });
    }
    
    highlightDevice(object) {
        this.devices.forEach(({ mesh }) => {
            if (mesh.material && mesh.material.emissive) {
                mesh.material.emissiveIntensity = 
                    mesh.userData.deviceData?.status === 'normal' ? 0.2 : 
                    mesh.userData.deviceData?.status === 'warning' ? 0.3 :
                    mesh.userData.deviceData?.status === 'danger' ? 0.4 : 0;
            }
        });
        
        if (object && object.material) {
            const originalEmissive = object.material.emissive.clone();
            object.material.emissive.setHex(0x00ffff);
            object.material.emissiveIntensity = 0.5;
            
            setTimeout(() => {
                if (object.material) {
                    object.material.emissive.copy(originalEmissive);
                    const status = object.userData.deviceData?.status;
                    object.material.emissiveIntensity = 
                        status === 'normal' ? 0.2 : 
                        status === 'warning' ? 0.3 :
                        status === 'danger' ? 0.4 : 0;
                }
            }, 1000);
        }
    }
    
    startAnimationLoop() {
        const animate = () => {
            requestAnimationFrame(animate);
            
            this.animationManager.update();
            this.labelManager.updateAllLabels();
        };
        
        animate();
    }
    
    dispose() {
        this.dataManager.stopSimulation();
        this.dataManager.dispose();
        this.labelManager.dispose();
        this.animationManager.dispose();
        this.sceneManager.dispose();
    }
}

const factory = new DigitalFactory();

window.addEventListener('beforeunload', () => {
    factory.dispose();
});
