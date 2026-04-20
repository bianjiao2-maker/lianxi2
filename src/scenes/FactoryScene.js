import * as THREE from 'three';

export class FactoryScene {
    constructor(scene) {
        this.scene = scene;
        this.devices = [];
        this.animations = [];
        
        this.createFloor();
        this.createWalls();
        this.createDevices();
        this.createConveyors();
        this.createStorage();
        this.createEnvironment();
    }
    
    createFloor() {
        const floorGeometry = new THREE.PlaneGeometry(100, 100);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a2e,
            roughness: 0.8,
            metalness: 0.2
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);
        
        const gridHelper = new THREE.GridHelper(100, 50, 0x00d4ff, 0x0a1628);
        gridHelper.position.y = 0.01;
        this.scene.add(gridHelper);
        
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                const markingGeometry = new THREE.PlaneGeometry(8, 8);
                const markingMaterial = new THREE.MeshStandardMaterial({
                    color: 0x0a1628,
                    roughness: 0.9
                });
                const marking = new THREE.Mesh(markingGeometry, markingMaterial);
                marking.rotation.x = -Math.PI / 2;
                marking.position.set(-20 + i * 10, 0.02, -20 + j * 10);
                this.scene.add(marking);
            }
        }
    }
    
    createWalls() {
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0x16213e,
            roughness: 0.7,
            metalness: 0.3,
            side: THREE.DoubleSide
        });
        
        const backWall = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 20),
            wallMaterial
        );
        backWall.position.set(0, 10, -50);
        this.scene.add(backWall);
        
        const leftWall = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 20),
            wallMaterial
        );
        leftWall.rotation.y = Math.PI / 2;
        leftWall.position.set(-50, 10, 0);
        this.scene.add(leftWall);
        
        const rightWall = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 20),
            wallMaterial
        );
        rightWall.rotation.y = -Math.PI / 2;
        rightWall.position.set(50, 10, 0);
        this.scene.add(rightWall);
    }
    
    createDevices() {
        this.createMachine('MACHINE-001', '数控机床', -15, 0, -15);
        this.createMachine('MACHINE-002', '数控机床', 0, 0, -15);
        this.createMachine('MACHINE-003', '数控机床', 15, 0, -15);
        
        this.createReactor('REACTOR-001', '反应釜', -20, 0, 10);
        this.createReactor('REACTOR-002', '反应釜', -20, 0, 25);
        
        this.createGenerator('GENERATOR-001', '发电机组', 20, 0, 10);
        this.createGenerator('GENERATOR-002', '发电机组', 20, 0, 25);
        
        this.createPump('PUMP-001', '泵站', 0, 0, 20);
        this.createPump('PUMP-002', '泵站', 0, 0, 30);
        
        this.createRobot('ROBOT-001', '机械臂', 15, 0, -30);
    }
    
    createMachine(id, name, x, y, z) {
        const group = new THREE.Group();
        
        const baseGeometry = new THREE.BoxGeometry(6, 1.5, 4);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0x2d3436,
            roughness: 0.5,
            metalness: 0.7
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.75;
        base.castShadow = true;
        base.receiveShadow = true;
        group.add(base);
        
        const bodyGeometry = new THREE.BoxGeometry(5, 3, 3.5);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0x3498db,
            roughness: 0.3,
            metalness: 0.6
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 3;
        body.castShadow = true;
        group.add(body);
        
        const topGeometry = new THREE.BoxGeometry(4, 1, 2.5);
        const topMaterial = new THREE.MeshStandardMaterial({
            color: 0x00d4ff,
            roughness: 0.2,
            metalness: 0.8,
            emissive: 0x00d4ff,
            emissiveIntensity: 0.2
        });
        const top = new THREE.Mesh(topGeometry, topMaterial);
        top.position.y = 4.5;
        top.castShadow = true;
        group.add(top);
        
        const screenGeometry = new THREE.PlaneGeometry(1.5, 1);
        const screenMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff88,
            transparent: true,
            opacity: 0.9
        });
        const screen = new THREE.Mesh(screenGeometry, screenMaterial);
        screen.position.set(0, 3.5, 1.76);
        group.add(screen);
        
        group.position.set(x, y, z);
        this.scene.add(group);
        
        const device = {
            id,
            name,
            type: '数控机床',
            mesh: group,
            body,
            top,
            screen,
            data: {
                temperature: 45 + Math.random() * 30,
                pressure: 0.5 + Math.random() * 0.5,
                status: 'running',
                efficiency: 0.7 + Math.random() * 0.3
            }
        };
        
        this.devices.push(device);
        
        this.animations.push({
            device,
            update: (delta) => {
                if (device.data.status === 'running') {
                    body.rotation.y += delta * 0.5;
                }
            }
        });
    }
    
    createReactor(id, name, x, y, z) {
        const group = new THREE.Group();
        
        const baseGeometry = new THREE.CylinderGeometry(3, 3.5, 1, 32);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0x2d3436,
            roughness: 0.6,
            metalness: 0.5
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.5;
        base.castShadow = true;
        group.add(base);
        
        const tankGeometry = new THREE.CylinderGeometry(2.5, 2.5, 6, 32);
        const tankMaterial = new THREE.MeshStandardMaterial({
            color: 0x27ae60,
            roughness: 0.4,
            metalness: 0.6
        });
        const tank = new THREE.Mesh(tankGeometry, tankMaterial);
        tank.position.y = 4;
        tank.castShadow = true;
        group.add(tank);
        
        const topGeometry = new THREE.SphereGeometry(2.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const topMaterial = new THREE.MeshStandardMaterial({
            color: 0x2ecc71,
            roughness: 0.3,
            metalness: 0.7
        });
        const top = new THREE.Mesh(topGeometry, topMaterial);
        top.position.y = 7;
        top.castShadow = true;
        group.add(top);
        
        const pipeGeometry = new THREE.CylinderGeometry(0.3, 0.3, 3, 16);
        const pipeMaterial = new THREE.MeshStandardMaterial({
            color: 0x7f8c8d,
            roughness: 0.5,
            metalness: 0.6
        });
        
        for (let i = 0; i < 4; i++) {
            const pipe = new THREE.Mesh(pipeGeometry, pipeMaterial);
            pipe.position.set(
                Math.cos(i * Math.PI / 2) * 2,
                8.5,
                Math.sin(i * Math.PI / 2) * 2
            );
            pipe.castShadow = true;
            group.add(pipe);
        }
        
        group.position.set(x, y, z);
        this.scene.add(group);
        
        const device = {
            id,
            name,
            type: '反应釜',
            mesh: group,
            body: tank,
            top,
            data: {
                temperature: 60 + Math.random() * 40,
                pressure: 1 + Math.random() * 1.5,
                status: 'running',
                efficiency: 0.8 + Math.random() * 0.2
            }
        };
        
        this.devices.push(device);
        
        this.animations.push({
            device,
            update: (delta, time) => {
                if (device.data.status === 'running') {
                    tank.scale.y = 1 + Math.sin(time * 2) * 0.02;
                }
            }
        });
    }
    
    createGenerator(id, name, x, y, z) {
        const group = new THREE.Group();
        
        const baseGeometry = new THREE.BoxGeometry(5, 1, 3);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0x2d3436,
            roughness: 0.5,
            metalness: 0.6
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.5;
        base.castShadow = true;
        group.add(base);
        
        const engineGeometry = new THREE.CylinderGeometry(1.5, 1.5, 4, 32);
        const engineMaterial = new THREE.MeshStandardMaterial({
            color: 0xe74c3c,
            roughness: 0.4,
            metalness: 0.6
        });
        const engine = new THREE.Mesh(engineGeometry, engineMaterial);
        engine.rotation.z = Math.PI / 2;
        engine.position.set(-0.5, 2, 0);
        engine.castShadow = true;
        group.add(engine);
        
        const alternatorGeometry = new THREE.CylinderGeometry(1, 1, 3, 32);
        const alternatorMaterial = new THREE.MeshStandardMaterial({
            color: 0xf39c12,
            roughness: 0.3,
            metalness: 0.7
        });
        const alternator = new THREE.Mesh(alternatorGeometry, alternatorMaterial);
        alternator.rotation.z = Math.PI / 2;
        alternator.position.set(2, 2, 0);
        alternator.castShadow = true;
        group.add(alternator);
        
        const fanGeometry = new THREE.CircleGeometry(1.2, 6);
        const fanMaterial = new THREE.MeshStandardMaterial({
            color: 0x95a5a6,
            roughness: 0.5,
            metalness: 0.5,
            side: THREE.DoubleSide
        });
        const fan = new THREE.Mesh(fanGeometry, fanMaterial);
        fan.position.set(-2.5, 2, 0);
        fan.rotation.y = Math.PI / 2;
        group.add(fan);
        
        group.position.set(x, y, z);
        this.scene.add(group);
        
        const device = {
            id,
            name,
            type: '发电机组',
            mesh: group,
            body: engine,
            top: alternator,
            fan,
            data: {
                temperature: 70 + Math.random() * 30,
                pressure: 0.8 + Math.random() * 0.4,
                status: 'running',
                efficiency: 0.85 + Math.random() * 0.15
            }
        };
        
        this.devices.push(device);
        
        this.animations.push({
            device,
            update: (delta, time) => {
                if (device.data.status === 'running') {
                    fan.rotation.z += delta * 10;
                }
            }
        });
    }
    
    createPump(id, name, x, y, z) {
        const group = new THREE.Group();
        
        const baseGeometry = new THREE.BoxGeometry(3, 0.5, 3);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0x2d3436,
            roughness: 0.6,
            metalness: 0.5
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.25;
        base.castShadow = true;
        group.add(base);
        
        const pumpGeometry = new THREE.CylinderGeometry(1, 1, 2, 32);
        const pumpMaterial = new THREE.MeshStandardMaterial({
            color: 0x9b59b6,
            roughness: 0.4,
            metalness: 0.6
        });
        const pump = new THREE.Mesh(pumpGeometry, pumpMaterial);
        pump.position.y = 1.5;
        pump.castShadow = true;
        group.add(pump);
        
        const motorGeometry = new THREE.CylinderGeometry(0.6, 0.6, 2.5, 32);
        const motorMaterial = new THREE.MeshStandardMaterial({
            color: 0x8e44ad,
            roughness: 0.3,
            metalness: 0.7
        });
        const motor = new THREE.Mesh(motorGeometry, motorMaterial);
        motor.rotation.z = Math.PI / 2;
        motor.position.set(1.5, 1.5, 0);
        motor.castShadow = true;
        group.add(motor);
        
        const pipeGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1.5, 16);
        const pipeMaterial = new THREE.MeshStandardMaterial({
            color: 0x7f8c8d,
            roughness: 0.5,
            metalness: 0.6
        });
        
        const inletPipe = new THREE.Mesh(pipeGeometry, pipeMaterial);
        inletPipe.position.set(-1, 1.5, 0);
        group.add(inletPipe);
        
        const outletPipe = new THREE.Mesh(pipeGeometry, pipeMaterial);
        outletPipe.position.set(0, 3, 0);
        group.add(outletPipe);
        
        group.position.set(x, y, z);
        this.scene.add(group);
        
        const device = {
            id,
            name,
            type: '泵站',
            mesh: group,
            body: pump,
            top: motor,
            data: {
                temperature: 40 + Math.random() * 20,
                pressure: 0.3 + Math.random() * 0.4,
                status: 'running',
                efficiency: 0.75 + Math.random() * 0.25
            }
        };
        
        this.devices.push(device);
        
        this.animations.push({
            device,
            update: (delta, time) => {
                if (device.data.status === 'running') {
                    pump.rotation.y += delta * 3;
                }
            }
        });
    }
    
    createRobot(id, name, x, y, z) {
        const group = new THREE.Group();
        
        const baseGeometry = new THREE.CylinderGeometry(1.5, 2, 1, 32);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0x2d3436,
            roughness: 0.5,
            metalness: 0.6
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.5;
        base.castShadow = true;
        group.add(base);
        
        const columnGeometry = new THREE.CylinderGeometry(0.5, 0.5, 4, 16);
        const columnMaterial = new THREE.MeshStandardMaterial({
            color: 0xf39c12,
            roughness: 0.3,
            metalness: 0.7
        });
        const column = new THREE.Mesh(columnGeometry, columnMaterial);
        column.position.y = 3;
        column.castShadow = true;
        group.add(column);
        
        const arm1Geometry = new THREE.BoxGeometry(3, 0.5, 0.5);
        const armMaterial = new THREE.MeshStandardMaterial({
            color: 0xe67e22,
            roughness: 0.4,
            metalness: 0.6
        });
        const arm1 = new THREE.Mesh(arm1Geometry, armMaterial);
        arm1.position.set(1.5, 5, 0);
        arm1.castShadow = true;
        group.add(arm1);
        
        const jointGeometry = new THREE.SphereGeometry(0.4, 16, 16);
        const jointMaterial = new THREE.MeshStandardMaterial({
            color: 0x00d4ff,
            roughness: 0.2,
            metalness: 0.8,
            emissive: 0x00d4ff,
            emissiveIntensity: 0.3
        });
        const joint = new THREE.Mesh(jointGeometry, jointMaterial);
        joint.position.set(3, 5, 0);
        group.add(joint);
        
        const arm2Geometry = new THREE.BoxGeometry(2, 0.4, 0.4);
        const arm2 = new THREE.Mesh(arm2Geometry, armMaterial);
        arm2.position.set(4, 4.5, 0);
        arm2.castShadow = true;
        group.add(arm2);
        
        const endEffectorGeometry = new THREE.BoxGeometry(0.3, 0.8, 0.8);
        const endEffectorMaterial = new THREE.MeshStandardMaterial({
            color: 0x00ff88,
            roughness: 0.3,
            metalness: 0.7
        });
        const endEffector = new THREE.Mesh(endEffectorGeometry, endEffectorMaterial);
        endEffector.position.set(5, 4.5, 0);
        group.add(endEffector);
        
        group.position.set(x, y, z);
        this.scene.add(group);
        
        const device = {
            id,
            name,
            type: '机械臂',
            mesh: group,
            body: column,
            top: arm1,
            arm1,
            arm2,
            data: {
                temperature: 35 + Math.random() * 15,
                pressure: 0.2 + Math.random() * 0.2,
                status: 'running',
                efficiency: 0.9 + Math.random() * 0.1
            }
        };
        
        this.devices.push(device);
        
        this.animations.push({
            device,
            update: (delta, time) => {
                if (device.data.status === 'running') {
                    base.rotation.y += delta * 0.5;
                    arm1.rotation.z = Math.sin(time * 2) * 0.3;
                    arm2.rotation.z = Math.sin(time * 2 + 1) * 0.4;
                }
            }
        });
    }
    
    createConveyors() {
        const conveyorGroup = new THREE.Group();
        
        const beltGeometry = new THREE.BoxGeometry(40, 0.3, 2);
        const beltMaterial = new THREE.MeshStandardMaterial({
            color: 0x34495e,
            roughness: 0.7,
            metalness: 0.3
        });
        const belt = new THREE.Mesh(beltGeometry, beltMaterial);
        belt.position.set(0, 0.5, 35);
        belt.castShadow = true;
        conveyorGroup.add(belt);
        
        const legGeometry = new THREE.BoxGeometry(0.3, 0.5, 0.3);
        const legMaterial = new THREE.MeshStandardMaterial({
            color: 0x7f8c8d,
            roughness: 0.6,
            metalness: 0.4
        });
        
        for (let i = 0; i < 10; i++) {
            const leg1 = new THREE.Mesh(legGeometry, legMaterial);
            leg1.position.set(-18 + i * 4, 0.25, 34);
            conveyorGroup.add(leg1);
            
            const leg2 = new THREE.Mesh(legGeometry, legMaterial);
            leg2.position.set(-18 + i * 4, 0.25, 36);
            conveyorGroup.add(leg2);
        }
        
        const boxGeometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
        const boxMaterial = new THREE.MeshStandardMaterial({
            color: 0x00d4ff,
            roughness: 0.4,
            metalness: 0.5
        });
        
        this.conveyorBoxes = [];
        for (let i = 0; i < 5; i++) {
            const box = new THREE.Mesh(boxGeometry, boxMaterial);
            box.position.set(-15 + i * 8, 1.4, 35);
            box.castShadow = true;
            conveyorGroup.add(box);
            this.conveyorBoxes.push(box);
        }
        
        this.scene.add(conveyorGroup);
        
        this.animations.push({
            update: (delta) => {
                this.conveyorBoxes.forEach(box => {
                    box.position.x += delta * 2;
                    if (box.position.x > 20) {
                        box.position.x = -20;
                    }
                });
            }
        });
    }
    
    createStorage() {
        const storageGroup = new THREE.Group();
        
        const rackMaterial = new THREE.MeshStandardMaterial({
            color: 0x7f8c8d,
            roughness: 0.6,
            metalness: 0.4
        });
        
        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 3; col++) {
                const rackGeometry = new THREE.BoxGeometry(0.2, 8, 6);
                const rack = new THREE.Mesh(rackGeometry, rackMaterial);
                rack.position.set(-35 + col * 3, 4, -35 + row * 8);
                rack.castShadow = true;
                storageGroup.add(rack);
            }
        }
        
        const shelfMaterial = new THREE.MeshStandardMaterial({
            color: 0x95a5a6,
            roughness: 0.7,
            metalness: 0.3
        });
        
        for (let level = 0; level < 4; level++) {
            for (let row = 0; row < 2; row++) {
                const shelfGeometry = new THREE.BoxGeometry(6, 0.1, 6);
                const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
                shelf.position.set(-35, 1 + level * 2, -35 + row * 8);
                shelf.castShadow = true;
                storageGroup.add(shelf);
            }
        }
        
        const crateGeometry = new THREE.BoxGeometry(1.2, 0.8, 1.2);
        const crateMaterial = new THREE.MeshStandardMaterial({
            color: 0xe67e22,
            roughness: 0.8,
            metalness: 0.2
        });
        
        for (let level = 0; level < 4; level++) {
            for (let row = 0; row < 2; row++) {
                for (let col = 0; col < 4; col++) {
                    const crate = new THREE.Mesh(crateGeometry, crateMaterial);
                    crate.position.set(
                        -37 + col * 1.5,
                        1.5 + level * 2,
                        -37 + row * 8 + col * 0.3
                    );
                    crate.castShadow = true;
                    storageGroup.add(crate);
                }
            }
        }
        
        this.scene.add(storageGroup);
    }
    
    createEnvironment() {
        const beamGeometry = new THREE.BoxGeometry(100, 1, 1);
        const beamMaterial = new THREE.MeshStandardMaterial({
            color: 0x2c3e50,
            roughness: 0.7,
            metalness: 0.3
        });
        
        for (let i = 0; i < 3; i++) {
            const beam = new THREE.Mesh(beamGeometry, beamMaterial);
            beam.position.set(0, 15, -40 + i * 40);
            beam.castShadow = true;
            this.scene.add(beam);
        }
        
        const pillarGeometry = new THREE.BoxGeometry(1, 15, 1);
        const pillarMaterial = new THREE.MeshStandardMaterial({
            color: 0x34495e,
            roughness: 0.6,
            metalness: 0.4
        });
        
        const pillarPositions = [
            [-40, -40], [-40, 0], [-40, 40],
            [40, -40], [40, 0], [40, 40]
        ];
        
        pillarPositions.forEach(([x, z]) => {
            const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
            pillar.position.set(x, 7.5, z);
            pillar.castShadow = true;
            this.scene.add(pillar);
        });
        
        const lightGeometry = new THREE.BoxGeometry(2, 0.2, 0.5);
        const lightMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.9
        });
        
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 3; j++) {
                const light = new THREE.Mesh(lightGeometry, lightMaterial);
                light.position.set(-30 + i * 15, 14.5, -30 + j * 30);
                this.scene.add(light);
            }
        }
    }
    
    getDevices() {
        return this.devices;
    }
    
    update(delta) {
        const time = this.clock || 0;
        this.clock = (this.clock || 0) + delta;
        
        this.animations.forEach(anim => {
            anim.update(delta, this.clock);
        });
    }
}
