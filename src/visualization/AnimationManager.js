import * as THREE from 'three';

export class AnimationManager {
    constructor(scene) {
        this.scene = scene;
        this.animations = new Map();
        this.mixers = [];
        this.clock = new THREE.Clock();
    }
    
    addRotationAnimation(mesh, axis = 'y', speed = 1) {
        const id = mesh.uuid;
        
        this.animations.set(id, {
            type: 'rotation',
            mesh: mesh,
            axis: axis,
            speed: speed,
            update: (delta) => {
                if (mesh.userData.deviceData?.status === 'stopped') return;
                mesh.rotation[axis] += speed * delta;
            }
        });
    }
    
    addRobotAnimation(mesh, joints, speed = 1) {
        const id = mesh.uuid;
        let time = 0;
        
        this.animations.set(id, {
            type: 'robot',
            mesh: mesh,
            joints: joints,
            speed: speed,
            time: 0,
            update: (delta) => {
                if (mesh.userData.deviceData?.status === 'stopped') return;
                
                time += delta * speed;
                
                if (joints && joints.length >= 2) {
                    joints[0].rotation.y = Math.sin(time) * 0.5;
                    joints[1].rotation.z = Math.cos(time * 0.7) * 0.3;
                }
            }
        });
    }
    
    addConveyorAnimation(mesh, rollers, speed = 1) {
        const id = mesh.uuid;
        
        this.animations.set(id, {
            type: 'conveyor',
            mesh: mesh,
            rollers: rollers,
            speed: speed,
            update: (delta) => {
                if (mesh.userData.deviceData?.status === 'stopped') return;
                
                if (rollers) {
                    rollers.forEach(roller => {
                        roller.rotation.x += speed * delta * 2;
                    });
                }
            }
        });
    }
    
    addPulsingAnimation(mesh, minScale = 0.95, maxScale = 1.05, speed = 2) {
        const id = mesh.uuid;
        let time = 0;
        const baseScale = mesh.scale.clone();
        
        this.animations.set(id, {
            type: 'pulse',
            mesh: mesh,
            minScale: minScale,
            maxScale: maxScale,
            speed: speed,
            baseScale: baseScale,
            time: 0,
            update: (delta) => {
                if (mesh.userData.deviceData?.status === 'stopped') return;
                
                time += delta * speed;
                const scale = minScale + (maxScale - minScale) * (0.5 + 0.5 * Math.sin(time));
                mesh.scale.copy(baseScale).multiplyScalar(scale);
            }
        });
    }
    
    addFloatingAnimation(mesh, amplitude = 0.2, speed = 1) {
        const id = mesh.uuid;
        let time = 0;
        const baseY = mesh.position.y;
        
        this.animations.set(id, {
            type: 'float',
            mesh: mesh,
            amplitude: amplitude,
            speed: speed,
            baseY: baseY,
            time: 0,
            update: (delta) => {
                if (mesh.userData.deviceData?.status === 'stopped') return;
                
                time += delta * speed;
                mesh.position.y = baseY + Math.sin(time) * amplitude;
            }
        });
    }
    
    addAGVAnimation(mesh, path, speed = 2) {
        const id = mesh.uuid;
        let progress = 0;
        
        this.animations.set(id, {
            type: 'agv',
            mesh: mesh,
            path: path,
            speed: speed,
            progress: 0,
            update: (delta) => {
                if (mesh.userData.deviceData?.status === 'stopped') return;
                
                progress += delta * speed * 0.1;
                if (progress > 1) progress = 0;
                
                const point = this.getPointOnPath(path, progress);
                mesh.position.set(point.x, mesh.position.y, point.z);
                
                const nextPoint = this.getPointOnPath(path, progress + 0.01);
                mesh.lookAt(nextPoint.x, mesh.position.y, nextPoint.z);
            }
        });
    }
    
    getPointOnPath(path, t) {
        const index = Math.floor(t * (path.length - 1));
        const nextIndex = Math.min(index + 1, path.length - 1);
        const localT = (t * (path.length - 1)) - index;
        
        const p1 = path[index];
        const p2 = path[nextIndex];
        
        return {
            x: p1.x + (p2.x - p1.x) * localT,
            z: p1.z + (p2.z - p1.z) * localT
        };
    }
    
    addStatusLightAnimation(mesh, lightMesh) {
        const id = mesh.uuid + '_light';
        
        this.animations.set(id, {
            type: 'statusLight',
            mesh: mesh,
            light: lightMesh,
            update: (delta) => {
                const status = mesh.userData.deviceData?.status;
                const colors = {
                    normal: 0x00ff00,
                    warning: 0xffaa00,
                    danger: 0xff0000,
                    stopped: 0x666666
                };
                
                if (lightMesh && lightMesh.material) {
                    lightMesh.material.color.setHex(colors[status] || 0x666666);
                    
                    if (status === 'danger') {
                        const intensity = 0.5 + 0.5 * Math.sin(Date.now() * 0.01);
                        lightMesh.material.color.multiplyScalar(intensity + 0.5);
                    }
                }
            }
        });
    }
    
    update() {
        const delta = this.clock.getDelta();
        
        this.animations.forEach(animation => {
            try {
                animation.update(delta);
            } catch (error) {
                console.error('Animation update error:', error);
            }
        });
    }
    
    removeAnimation(id) {
        this.animations.delete(id);
    }
    
    removeAnimationsForMesh(mesh) {
        const idsToRemove = [];
        this.animations.forEach((animation, id) => {
            if (animation.mesh === mesh || id.startsWith(mesh.uuid)) {
                idsToRemove.push(id);
            }
        });
        
        idsToRemove.forEach(id => this.animations.delete(id));
    }
    
    pauseAll() {
        this.animations.forEach(animation => {
            animation.paused = true;
        });
    }
    
    resumeAll() {
        this.animations.forEach(animation => {
            animation.paused = false;
        });
    }
    
    dispose() {
        this.animations.clear();
    }
}
