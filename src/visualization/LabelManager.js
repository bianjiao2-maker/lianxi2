import * as THREE from 'three';

export class LabelManager {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.labels = new Map();
        this.labelContainer = document.createElement('div');
        this.labelContainer.style.position = 'absolute';
        this.labelContainer.style.top = '0';
        this.labelContainer.style.left = '0';
        this.labelContainer.style.pointerEvents = 'none';
        this.labelContainer.style.zIndex = '100';
        document.body.appendChild(this.labelContainer);
    }
    
    createLabel(deviceData, mesh) {
        const id = deviceData.id;
        
        const labelElement = document.createElement('div');
        labelElement.className = 'device-label';
        labelElement.style.cssText = `
            position: absolute;
            background: rgba(0, 20, 40, 0.9);
            border: 1px solid rgba(0, 255, 255, 0.4);
            border-radius: 8px;
            padding: 10px 15px;
            color: #fff;
            font-size: 12px;
            pointer-events: none;
            transform: translate(-50%, -100%);
            margin-top: -15px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
            min-width: 140px;
            transition: opacity 0.3s;
        `;
        
        this.updateLabelContent(labelElement, deviceData);
        this.labelContainer.appendChild(labelElement);
        
        const label = {
            element: labelElement,
            mesh: mesh,
            deviceId: id,
            visible: true
        };
        
        this.labels.set(id, label);
        this.updateLabelPosition(label);
        
        return label;
    }
    
    updateLabelContent(element, deviceData) {
        const statusColors = {
            normal: '#00ff64',
            warning: '#ffc800',
            danger: '#ff3232',
            stopped: '#666666'
        };
        
        const statusText = {
            normal: '正常',
            warning: '警告',
            danger: '故障',
            stopped: '停机'
        };
        
        const color = statusColors[deviceData.status] || '#888';
        const text = statusText[deviceData.status] || '未知';
        
        element.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 5px; color: #00ffff;">${deviceData.name}</div>
            <div style="display: flex; align-items: center; gap: 5px; margin-bottom: 3px;">
                <span style="color: #888;">状态:</span>
                <span style="color: ${color}; font-weight: bold;">${text}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                <span style="color: #888;">温度:</span>
                <span>${deviceData.temperature?.toFixed(1) || '--'}°C</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                <span style="color: #888;">压力:</span>
                <span>${deviceData.pressure?.toFixed(1) || '--'} PSI</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <span style="color: #888;">效率:</span>
                <span>${deviceData.efficiency?.toFixed(1) || '--'}%</span>
            </div>
        `;
    }
    
    updateLabelPosition(label) {
        if (!label.mesh || !label.visible) return;
        
        const mesh = label.mesh;
        const element = label.element;
        
        const position = new THREE.Vector3();
        
        if (mesh.geometry && mesh.geometry.boundingBox) {
            mesh.geometry.boundingBox.getCenter(position);
            position.y += mesh.geometry.boundingBox.max.y - mesh.geometry.boundingBox.min.y;
        } else {
            position.copy(mesh.position);
            position.y += 3;
        }
        
        position.applyMatrix4(mesh.matrixWorld);
        
        const screenPosition = position.clone();
        screenPosition.project(this.camera);
        
        const x = (screenPosition.x * 0.5 + 0.5) * this.renderer.domElement.clientWidth;
        const y = (-(screenPosition.y * 0.5) + 0.5) * this.renderer.domElement.clientHeight;
        
        if (screenPosition.z > 1) {
            element.style.opacity = '0';
        } else {
            element.style.left = `${x}px`;
            element.style.top = `${y}px`;
            element.style.opacity = '1';
        }
    }
    
    updateAllLabels() {
        this.labels.forEach(label => {
            this.updateLabelPosition(label);
        });
    }
    
    updateLabelData(deviceId, deviceData) {
        const label = this.labels.get(deviceId);
        if (label) {
            this.updateLabelContent(label.element, deviceData);
        }
    }
    
    showLabel(deviceId) {
        const label = this.labels.get(deviceId);
        if (label) {
            label.visible = true;
            label.element.style.display = 'block';
        }
    }
    
    hideLabel(deviceId) {
        const label = this.labels.get(deviceId);
        if (label) {
            label.visible = false;
            label.element.style.opacity = '0';
        }
    }
    
    removeLabel(deviceId) {
        const label = this.labels.get(deviceId);
        if (label) {
            label.element.remove();
            this.labels.delete(deviceId);
        }
    }
    
    setAllLabelsVisible(visible) {
        this.labels.forEach(label => {
            label.visible = visible;
            label.element.style.display = visible ? 'block' : 'none';
        });
    }
    
    dispose() {
        this.labels.forEach(label => {
            label.element.remove();
        });
        this.labels.clear();
        this.labelContainer.remove();
    }
}
