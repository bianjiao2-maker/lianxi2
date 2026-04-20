export class UIManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.selectedDeviceId = null;
        this.elements = {};
        this.init();
    }
    
    init() {
        this.cacheElements();
        this.bindEvents();
        this.startStatsUpdate();
    }
    
    cacheElements() {
        this.elements = {
            totalDevices: document.getElementById('total-devices'),
            runningDevices: document.getElementById('running-devices'),
            warningDevices: document.getElementById('warning-devices'),
            fpsCounter: document.getElementById('fps-counter'),
            deviceDetails: document.getElementById('device-details'),
            infoPanel: document.getElementById('info-panel'),
            tooltip: document.getElementById('tooltip'),
            loadingScreen: document.getElementById('loading-screen')
        };
    }
    
    bindEvents() {
        this.dataManager.on('dataUpdated', ({ id, data }) => {
            if (this.selectedDeviceId === id) {
                this.updateDeviceDetails(data);
            }
        });
        
        this.dataManager.on('statusChanged', () => {
            this.updateStatistics();
        });
    }
    
    startStatsUpdate() {
        let lastTime = performance.now();
        let frames = 0;
        
        const updateFPS = () => {
            const currentTime = performance.now();
            frames++;
            
            if (currentTime - lastTime >= 1000) {
                const fps = Math.round((frames * 1000) / (currentTime - lastTime));
                if (this.elements.fpsCounter) {
                    this.elements.fpsCounter.textContent = fps;
                }
                frames = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(updateFPS);
        };
        
        updateFPS();
        
        setInterval(() => {
            this.updateStatistics();
        }, 2000);
    }
    
    updateStatistics() {
        const stats = this.dataManager.getStatistics();
        
        if (this.elements.totalDevices) {
            this.elements.totalDevices.textContent = stats.total;
        }
        if (this.elements.runningDevices) {
            this.elements.runningDevices.textContent = stats.normal;
        }
        if (this.elements.warningDevices) {
            this.elements.warningDevices.textContent = stats.warning + stats.danger;
        }
    }
    
    showDeviceDetails(deviceData) {
        this.selectedDeviceId = deviceData.id;
        
        const statusConfig = {
            normal: { class: 'status-normal', text: '正常运行' },
            warning: { class: 'status-warning', text: '警告状态' },
            danger: { class: 'status-danger', text: '故障状态' },
            stopped: { class: 'status-normal', text: '停机状态' }
        };
        
        const config = statusConfig[deviceData.status] || statusConfig.normal;
        
        const history = this.dataManager.getDeviceHistory(deviceData.id);
        const chartBars = this.generateChartBars(history);
        
        const alertsHtml = deviceData.alerts && deviceData.alerts.length > 0
            ? deviceData.alerts.map(alert => `
                <div style="
                    background: ${alert.type === 'danger' ? 'rgba(255, 50, 50, 0.2)' : 'rgba(255, 200, 0, 0.2)'};
                    border-left: 3px solid ${alert.type === 'danger' ? '#ff3232' : '#ffc800'};
                    padding: 8px 12px;
                    margin: 5px 0;
                    border-radius: 4px;
                    font-size: 12px;
                ">
                    ${alert.message}
                </div>
            `).join('')
            : '<div style="color: #666; font-size: 12px;">暂无告警</div>';
        
        const html = `
            <div class="device-info">
                <div class="info-row">
                    <span class="info-label">设备名称</span>
                    <span class="info-value">${deviceData.name}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">设备类型</span>
                    <span class="info-value">${deviceData.description}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">设备ID</span>
                    <span class="info-value">${deviceData.id}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">运行状态</span>
                    <span class="status-badge ${config.class}">${config.text}</span>
                </div>
            </div>
            
            <div class="panel-title">实时数据</div>
            <div class="device-info">
                <div class="info-row">
                    <span class="info-label">温度</span>
                    <span class="info-value" style="color: ${this.getTemperatureColor(deviceData.temperature)}">
                        ${deviceData.temperature?.toFixed(1) || '--'} °C
                    </span>
                </div>
                <div class="info-row">
                    <span class="info-label">压力</span>
                    <span class="info-value">${deviceData.pressure?.toFixed(1) || '--'} PSI</span>
                </div>
                <div class="info-row">
                    <span class="info-label">转速</span>
                    <span class="info-value">${deviceData.speed?.toFixed(0) || '--'} RPM</span>
                </div>
                <div class="info-row">
                    <span class="info-label">功率</span>
                    <span class="info-value">${deviceData.power?.toFixed(0) || '--'} W</span>
                </div>
                <div class="info-row">
                    <span class="info-label">效率</span>
                    <span class="info-value" style="color: ${this.getEfficiencyColor(deviceData.efficiency)}">
                        ${deviceData.efficiency?.toFixed(1) || '--'}%
                    </span>
                </div>
                <div class="info-row">
                    <span class="info-label">运行时间</span>
                    <span class="info-value">${deviceData.runtime || 0} 小时</span>
                </div>
            </div>
            
            <div class="panel-title">温度趋势</div>
            <div class="data-chart">
                ${chartBars}
            </div>
            
            <div class="panel-title">告警信息</div>
            <div style="margin-top: 10px;">
                ${alertsHtml}
            </div>
            
            <div class="panel-title">维护信息</div>
            <div class="device-info">
                <div class="info-row">
                    <span class="info-label">上次维护</span>
                    <span class="info-value">${deviceData.lastMaintenance || '--'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">建议维护</span>
                    <span class="info-value">${this.calculateNextMaintenance(deviceData)}</span>
                </div>
            </div>
        `;
        
        if (this.elements.deviceDetails) {
            this.elements.deviceDetails.innerHTML = html;
        }
    }
    
    updateDeviceDetails(deviceData) {
        this.showDeviceDetails(deviceData);
    }
    
    generateChartBars(history) {
        if (!history || history.length === 0) {
            return '<div style="color: #666; text-align: center; line-height: 100px;">暂无数据</div>';
        }
        
        const maxTemp = Math.max(...history.map(h => h.temperature), 100);
        const minTemp = Math.min(...history.map(h => h.temperature), 0);
        const range = maxTemp - minTemp || 1;
        
        const barWidth = Math.max(4, Math.floor(140 / history.length));
        const gap = 2;
        
        return history.map((data, index) => {
            const height = ((data.temperature - minTemp) / range) * 80 + 10;
            const left = index * (barWidth + gap) + 5;
            const color = data.temperature > 60 
                ? (data.temperature > 80 ? '#ff3232' : '#ffc800')
                : '#00ffff';
            
            return `<div class="chart-bar" style="
                height: ${height}px;
                left: ${left}px;
                width: ${barWidth}px;
                background: ${color};
            " title="${data.temperature.toFixed(1)}°C"></div>`;
        }).join('');
    }
    
    getTemperatureColor(temp) {
        if (temp > 80) return '#ff3232';
        if (temp > 60) return '#ffc800';
        return '#00ff64';
    }
    
    getEfficiencyColor(eff) {
        if (eff < 50) return '#ff3232';
        if (eff < 70) return '#ffc800';
        return '#00ff64';
    }
    
    calculateNextMaintenance(deviceData) {
        if (!deviceData.lastMaintenance) return '--';
        
        const lastDate = new Date(deviceData.lastMaintenance);
        const nextDate = new Date(lastDate);
        nextDate.setMonth(nextDate.getMonth() + 3);
        
        return nextDate.toISOString().split('T')[0];
    }
    
    showTooltip(deviceData, event) {
        if (!this.elements.tooltip || !deviceData) return;
        
        this.elements.tooltip.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 5px;">${deviceData.name}</div>
            <div>温度: ${deviceData.temperature?.toFixed(1)}°C</div>
            <div>状态: ${this.getStatusText(deviceData.status)}</div>
        `;
        
        this.elements.tooltip.style.left = `${event.clientX + 15}px`;
        this.elements.tooltip.style.top = `${event.clientY + 15}px`;
        this.elements.tooltip.style.opacity = '1';
    }
    
    hideTooltip() {
        if (this.elements.tooltip) {
            this.elements.tooltip.style.opacity = '0';
        }
    }
    
    getStatusText(status) {
        const statusMap = {
            normal: '正常',
            warning: '警告',
            danger: '故障',
            stopped: '停机'
        };
        return statusMap[status] || '未知';
    }
    
    hideLoadingScreen() {
        if (this.elements.loadingScreen) {
            this.elements.loadingScreen.classList.add('hidden');
            setTimeout(() => {
                this.elements.loadingScreen.style.display = 'none';
            }, 500);
        }
    }
    
    showLoadingScreen() {
        if (this.elements.loadingScreen) {
            this.elements.loadingScreen.style.display = 'flex';
            this.elements.loadingScreen.classList.remove('hidden');
        }
    }
}
