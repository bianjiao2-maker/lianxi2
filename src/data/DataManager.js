import { EventEmitter } from '../utils/EventEmitter.js';

export class DataManager extends EventEmitter {
    constructor() {
        super();
        this.devices = new Map();
        this.dataHistory = new Map();
        this.maxHistoryLength = 20;
        this.simulationInterval = null;
        this.isSimulating = false;
    }
    
    registerDevice(deviceData) {
        const id = deviceData.id;
        
        this.devices.set(id, {
            ...deviceData,
            status: 'normal',
            temperature: 25 + Math.random() * 20,
            pressure: 100 + Math.random() * 50,
            speed: 50 + Math.random() * 50,
            power: 1000 + Math.random() * 500,
            efficiency: 85 + Math.random() * 15,
            runtime: Math.floor(Math.random() * 1000),
            lastMaintenance: new Date().toISOString().split('T')[0],
            alerts: []
        });
        
        this.dataHistory.set(id, []);
        
        this.emit('deviceRegistered', { id, data: this.devices.get(id) });
    }
    
    getDeviceData(id) {
        return this.devices.get(id);
    }
    
    getAllDevices() {
        return Array.from(this.devices.values());
    }
    
    updateDeviceData(id, data) {
        const device = this.devices.get(id);
        if (!device) return;
        
        Object.assign(device, data);
        
        this.addToHistory(id, {
            timestamp: Date.now(),
            temperature: device.temperature,
            pressure: device.pressure,
            speed: device.speed,
            efficiency: device.efficiency
        });
        
        this.checkThresholds(id);
        
        this.emit('dataUpdated', { id, data: device });
    }
    
    addToHistory(id, dataPoint) {
        const history = this.dataHistory.get(id);
        if (history) {
            history.push(dataPoint);
            if (history.length > this.maxHistoryLength) {
                history.shift();
            }
        }
    }
    
    getDeviceHistory(id) {
        return this.dataHistory.get(id) || [];
    }
    
    checkThresholds(id) {
        const device = this.devices.get(id);
        if (!device) return;
        
        const oldStatus = device.status;
        let newStatus = 'normal';
        const alerts = [];
        
        if (device.temperature > 80) {
            newStatus = 'danger';
            alerts.push({ type: 'danger', message: `温度过高: ${device.temperature.toFixed(1)}°C` });
        } else if (device.temperature > 60) {
            newStatus = 'warning';
            alerts.push({ type: 'warning', message: `温度偏高: ${device.temperature.toFixed(1)}°C` });
        }
        
        if (device.pressure > 180) {
            newStatus = 'danger';
            alerts.push({ type: 'danger', message: `压力过高: ${device.pressure.toFixed(1)} PSI` });
        } else if (device.pressure > 150) {
            if (newStatus !== 'danger') newStatus = 'warning';
            alerts.push({ type: 'warning', message: `压力偏高: ${device.pressure.toFixed(1)} PSI` });
        }
        
        if (device.efficiency < 50) {
            newStatus = 'danger';
            alerts.push({ type: 'danger', message: `效率过低: ${device.efficiency.toFixed(1)}%` });
        } else if (device.efficiency < 70) {
            if (newStatus !== 'danger') newStatus = 'warning';
            alerts.push({ type: 'warning', message: `效率偏低: ${device.efficiency.toFixed(1)}%` });
        }
        
        device.status = newStatus;
        device.alerts = alerts;
        
        if (oldStatus !== newStatus) {
            this.emit('statusChanged', { id, oldStatus, newStatus, alerts });
        }
    }
    
    startSimulation() {
        if (this.isSimulating) return;
        
        this.isSimulating = true;
        this.simulationInterval = setInterval(() => {
            this.simulateDataChanges();
        }, 2000);
        
        this.emit('simulationStarted');
    }
    
    stopSimulation() {
        if (!this.isSimulating) return;
        
        this.isSimulating = false;
        if (this.simulationInterval) {
            clearInterval(this.simulationInterval);
            this.simulationInterval = null;
        }
        
        this.emit('simulationStopped');
    }
    
    simulateDataChanges() {
        this.devices.forEach((device, id) => {
            if (device.status === 'stopped') return;
            
            const tempChange = (Math.random() - 0.5) * 5;
            const pressureChange = (Math.random() - 0.5) * 10;
            const speedChange = (Math.random() - 0.5) * 5;
            
            const updates = {
                temperature: Math.max(20, Math.min(100, device.temperature + tempChange)),
                pressure: Math.max(50, Math.min(200, device.pressure + pressureChange)),
                speed: Math.max(0, Math.min(100, device.speed + speedChange)),
                efficiency: Math.max(30, Math.min(100, device.efficiency + (Math.random() - 0.5) * 3)),
                runtime: device.runtime + 1
            };
            
            this.updateDeviceData(id, updates);
        });
    }
    
    setDeviceStatus(id, status) {
        const device = this.devices.get(id);
        if (!device) return;
        
        const oldStatus = device.status;
        device.status = status;
        
        if (status === 'stopped') {
            device.speed = 0;
            device.efficiency = 0;
        }
        
        this.emit('statusChanged', { id, oldStatus, newStatus: status, alerts: device.alerts });
        this.emit('dataUpdated', { id, data: device });
    }
    
    getStatistics() {
        const devices = this.getAllDevices();
        return {
            total: devices.length,
            normal: devices.filter(d => d.status === 'normal').length,
            warning: devices.filter(d => d.status === 'warning').length,
            danger: devices.filter(d => d.status === 'danger').length,
            stopped: devices.filter(d => d.status === 'stopped').length
        };
    }
    
    dispose() {
        this.stopSimulation();
        this.devices.clear();
        this.dataHistory.clear();
        this.removeAllListeners();
    }
}
