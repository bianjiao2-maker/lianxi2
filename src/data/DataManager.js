export class DataManager {
    constructor(devices) {
        this.devices = devices;
        this.refreshRate = 2000;
        this.intervalId = null;
        this.thresholds = {
            temperature: {
                warning: 60,
                danger: 80
            },
            pressure: {
                warning: 1.0,
                danger: 1.5
            },
            efficiency: {
                warning: 0.6,
                danger: 0.4
            }
        };
        
        this.startDataSimulation();
    }
    
    startDataSimulation() {
        this.updateData();
        this.intervalId = setInterval(() => this.updateData(), this.refreshRate);
    }
    
    setRefreshRate(rate) {
        this.refreshRate = rate;
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        this.intervalId = setInterval(() => this.updateData(), this.refreshRate);
    }
    
    updateData() {
        this.devices.forEach(device => {
            const tempDelta = (Math.random() - 0.5) * 10;
            device.data.temperature = Math.max(20, Math.min(100, 
                device.data.temperature + tempDelta));
            
            const pressureDelta = (Math.random() - 0.5) * 0.2;
            device.data.pressure = Math.max(0.1, Math.min(2.5, 
                device.data.pressure + pressureDelta));
            
            const efficiencyDelta = (Math.random() - 0.5) * 0.1;
            device.data.efficiency = Math.max(0.3, Math.min(1.0, 
                device.data.efficiency + efficiencyDelta));
            
            if (Math.random() < 0.05) {
                device.data.status = device.data.status === 'running' ? 'stopped' : 'running';
            }
            
            this.updateDeviceVisuals(device);
        });
    }
    
    updateDeviceVisuals(device) {
        const tempStatus = this.getStatus(device.data.temperature, 'temperature');
        const color = this.getColorForStatus(tempStatus);
        
        if (device.body && device.body.material) {
            device.body.material.color.setHex(color);
        }
        
        if (device.top && device.top.material) {
            const emissiveColor = tempStatus === 'danger' ? 0xff4444 : 
                                 tempStatus === 'warning' ? 0xffaa00 : 0x00ff88;
            device.top.material.emissive.setHex(emissiveColor);
            device.top.material.emissiveIntensity = 0.3;
        }
    }
    
    getStatus(value, type) {
        const threshold = this.thresholds[type];
        if (!threshold) return 'normal';
        
        if (value >= threshold.danger) return 'danger';
        if (value >= threshold.warning) return 'warning';
        return 'normal';
    }
    
    getColorForStatus(status) {
        switch(status) {
            case 'danger': return 0xff4444;
            case 'warning': return 0xffaa00;
            default: return 0x00ff88;
        }
    }
    
    update() {
    }
}
