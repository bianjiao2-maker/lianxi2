import * as THREE from 'three';

export class LabelManager {
    constructor(container, camera) {
        this.container = container;
        this.camera = camera;
        this.labels = new Map();
        this.visible = true;
    }
    
    setVisible(visible) {
        this.visible = visible;
        this.labels.forEach(label => {
            label.element.style.display = visible ? 'block' : 'none';
        });
    }
    
    update(devices) {
        devices.forEach(device => {
            let label = this.labels.get(device.id);
            
            if (!label) {
                label = this.createLabel(device);
                this.labels.set(device.id, label);
            }
            
            this.updateLabelContent(label, device);
            this.updateLabelPosition(label, device);
        });
    }
    
    createLabel(device) {
        const element = document.createElement('div');
        element.className = 'label-3d';
        element.innerHTML = `
            <div class="label-name">${device.name}</div>
            <div class="label-value">--</div>
        `;
        this.container.appendChild(element);
        
        return { element, device };
    }
    
    updateLabelContent(label, device) {
        const valueElement = label.element.querySelector('.label-value');
        const temp = device.data.temperature.toFixed(1);
        const status = this.getTemperatureStatus(device.data.temperature);
        
        valueElement.textContent = `${temp}°C`;
        valueElement.className = `label-value ${status}`;
    }
    
    updateLabelPosition(label, device) {
        if (!this.visible) return;
        
        const position = new THREE.Vector3();
        device.mesh.getWorldPosition(position);
        position.y += 6;
        
        const projected = position.clone().project(this.camera);
        
        if (projected.z > 1) {
            label.element.style.display = 'none';
            return;
        }
        
        label.element.style.display = 'block';
        
        const x = (projected.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-projected.y * 0.5 + 0.5) * window.innerHeight;
        
        label.element.style.left = `${x}px`;
        label.element.style.top = `${y}px`;
    }
    
    getTemperatureStatus(temp) {
        if (temp >= 80) return 'danger';
        if (temp >= 60) return 'warning';
        return '';
    }
}
