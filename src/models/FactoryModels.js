import * as THREE from 'three';

export class FactoryModels {
    constructor(scene) {
        this.scene = scene;
        this.materials = this.createMaterials();
    }
    
    createMaterials() {
        return {
            floor: new THREE.MeshStandardMaterial({
                color: 0x2a2a3a,
                roughness: 0.8,
                metalness: 0.2
            }),
            wall: new THREE.MeshStandardMaterial({
                color: 0x4a4a5a,
                roughness: 0.9,
                metalness: 0.1
            }),
            machine: new THREE.MeshStandardMaterial({
                color: 0x6080a0,
                roughness: 0.4,
                metalness: 0.6
            }),
            machineActive: new THREE.MeshStandardMaterial({
                color: 0x00ff64,
                roughness: 0.4,
                metalness: 0.6,
                emissive: 0x004400,
                emissiveIntensity: 0.2
            }),
            machineWarning: new THREE.MeshStandardMaterial({
                color: 0xffc800,
                roughness: 0.4,
                metalness: 0.6,
                emissive: 0x443300,
                emissiveIntensity: 0.3
            }),
            machineDanger: new THREE.MeshStandardMaterial({
                color: 0xff3232,
                roughness: 0.4,
                metalness: 0.6,
                emissive: 0x440000,
                emissiveIntensity: 0.4
            }),
            machineStopped: new THREE.MeshStandardMaterial({
                color: 0x666666,
                roughness: 0.4,
                metalness: 0.6
            }),
            conveyor: new THREE.MeshStandardMaterial({
                color: 0x333333,
                roughness: 0.7,
                metalness: 0.3
            }),
            robot: new THREE.MeshStandardMaterial({
                color: 0xff6600,
                roughness: 0.3,
                metalness: 0.7
            }),
            tank: new THREE.MeshStandardMaterial({
                color: 0xcccccc,
                roughness: 0.2,
                metalness: 0.8
            }),
            pipe: new THREE.MeshStandardMaterial({
                color: 0x808080,
                roughness: 0.5,
                metalness: 0.5
            })
        };
    }
    
    createFloor() {
        const geometry = new THREE.PlaneGeometry(100, 100);
        const floor = new THREE.Mesh(geometry, this.materials.floor);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        
        const gridHelper = new THREE.GridHelper(100, 50, 0x444466, 0x333344);
        gridHelper.position.y = 0.01;
        
        const group = new THREE.Group();
        group.add(floor);
        group.add(gridHelper);
        
        return group;
    }
    
    createMachineBase(width, height, depth, x, z) {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const mesh = new THREE.Mesh(geometry, this.materials.machine.clone());
        mesh.position.set(x, height / 2, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
    }
    
    createCNCMachine(x, z, id) {
        const group = new THREE.Group();
        
        const base = this.createMachineBase(6, 4, 4, 0, 0);
        base.userData.deviceData = { id, type: 'cnc' };
        group.add(base);
        
        const column = this.createMachineBase(2, 6, 2, -1.5, -0.5);
        group.add(column);
        
        const spindle = this.createMachineBase(1.5, 2, 1.5, 0.5, -0.5);
        group.add(spindle);
        
        const controlPanel = this.createMachineBase(1, 2, 0.5, 2.5, 1);
        const panelMat = new THREE.MeshStandardMaterial({
            color: 0x222222,
            roughness: 0.5,
            metalness: 0.5
        });
        controlPanel.material = panelMat;
        group.add(controlPanel);
        
        const screenGeo = new THREE.PlaneGeometry(0.6, 0.4);
        const screenMat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const screen = new THREE.Mesh(screenGeo, screenMat);
        screen.position.set(2.5, 2.2, 1.26);
        group.add(screen);
        
        group.position.set(x, 0, z);
        
        const mainMesh = group.children[0];
        mainMesh.userData.deviceData = {
            id,
            type: 'cnc',
            name: `CNC加工中心 ${id}`,
            description: '高精度数控加工设备',
            group: group
        };
        
        return { mesh: mainMesh, group };
    }
    
    createRobotArm(x, z, id) {
        const group = new THREE.Group();
        
        const base = new THREE.Mesh(
            new THREE.CylinderGeometry(1.5, 1.8, 1, 16),
            this.materials.robot
        );
        base.position.y = 0.5;
        base.castShadow = true;
        group.add(base);
        
        const joint1 = new THREE.Mesh(
            new THREE.SphereGeometry(0.8, 16, 16),
            this.materials.robot
        );
        joint1.position.y = 2;
        group.add(joint1);
        
        const arm1 = new THREE.Mesh(
            new THREE.CylinderGeometry(0.4, 0.4, 4, 8),
            this.materials.robot
        );
        arm1.position.set(0, 3.5, 0);
        arm1.rotation.z = 0.3;
        arm1.castShadow = true;
        group.add(arm1);
        
        const joint2 = new THREE.Mesh(
            new THREE.SphereGeometry(0.6, 16, 16),
            this.materials.robot
        );
        joint2.position.set(1.2, 5.2, 0);
        group.add(joint2);
        
        const arm2 = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 0.3, 3, 8),
            this.materials.robot
        );
        arm2.position.set(2.5, 5.8, 0);
        arm2.rotation.z = -0.5;
        arm2.castShadow = true;
        group.add(arm2);
        
        const gripper = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 0.4, 0.4),
            new THREE.MeshStandardMaterial({ color: 0x333333 })
        );
        gripper.position.set(3.8, 6.5, 0);
        group.add(gripper);
        
        group.position.set(x, 0, z);
        
        base.userData.deviceData = {
            id,
            type: 'robot',
            name: `工业机器人 ${id}`,
            description: '六轴协作机器人',
            group: group,
            joints: [joint1, joint2]
        };
        
        return { mesh: base, group };
    }
    
    createConveyorBelt(x, z, width, length, id) {
        const group = new THREE.Group();
        
        const frame = new THREE.Mesh(
            new THREE.BoxGeometry(width, 1, length),
            this.materials.conveyor
        );
        frame.position.y = 0.5;
        frame.castShadow = true;
        group.add(frame);
        
        const belt = new THREE.Mesh(
            new THREE.PlaneGeometry(width - 0.4, length - 0.4),
            new THREE.MeshStandardMaterial({
                color: 0x111111,
                roughness: 0.9
            })
        );
        belt.rotation.x = -Math.PI / 2;
        belt.position.y = 1.01;
        group.add(belt);
        
        const rollerGeo = new THREE.CylinderGeometry(0.15, 0.15, width - 0.4, 8);
        const rollerMat = new THREE.MeshStandardMaterial({ color: 0x666666 });
        
        for (let i = -length/2 + 1; i < length/2; i += 2) {
            const roller = new THREE.Mesh(rollerGeo, rollerMat);
            roller.rotation.z = Math.PI / 2;
            roller.position.set(0, 0.8, i);
            group.add(roller);
        }
        
        group.position.set(x, 0, z);
        
        frame.userData.deviceData = {
            id,
            type: 'conveyor',
            name: `传送带 ${id}`,
            description: '自动物料输送系统',
            group: group
        };
        
        return { mesh: frame, group };
    }
    
    createStorageTank(x, z, id) {
        const group = new THREE.Group();
        
        const tank = new THREE.Mesh(
            new THREE.CylinderGeometry(3, 3, 8, 24),
            this.materials.tank
        );
        tank.position.y = 4;
        tank.castShadow = true;
        group.add(tank);
        
        const top = new THREE.Mesh(
            new THREE.SphereGeometry(3, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2),
            this.materials.tank
        );
        top.position.y = 8;
        group.add(top);
        
        const ladder = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 8, 0.1),
            new THREE.MeshStandardMaterial({ color: 0x666666 })
        );
        ladder.position.set(3.2, 4, 0);
        group.add(ladder);
        
        for (let i = 0.5; i < 8; i += 0.8) {
            const rung = new THREE.Mesh(
                new THREE.BoxGeometry(0.4, 0.1, 0.2),
                new THREE.MeshStandardMaterial({ color: 0x666666 })
            );
            rung.position.set(3.2, i, 0.1);
            group.add(rung);
        }
        
        const pipe = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 0.3, 4, 8),
            this.materials.pipe
        );
        pipe.position.set(0, 10, 0);
        group.add(pipe);
        
        group.position.set(x, 0, z);
        
        tank.userData.deviceData = {
            id,
            type: 'tank',
            name: `储料罐 ${id}`,
            description: '原料储存罐',
            group: group
        };
        
        return { mesh: tank, group };
    }
    
    createAssemblyStation(x, z, id) {
        const group = new THREE.Group();
        
        const table = new THREE.Mesh(
            new THREE.BoxGeometry(5, 2, 3),
            new THREE.MeshStandardMaterial({ color: 0x406080 })
        );
        table.position.y = 1;
        table.castShadow = true;
        group.add(table);
        
        const legGeo = new THREE.BoxGeometry(0.3, 2, 0.3);
        const legMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
        
        const positions = [
            [-2.2, 1, -1.2],
            [2.2, 1, -1.2],
            [-2.2, 1, 1.2],
            [2.2, 1, 1.2]
        ];
        
        positions.forEach(pos => {
            const leg = new THREE.Mesh(legGeo, legMat);
            leg.position.set(...pos);
            leg.position.y = 1;
            group.add(leg);
        });
        
        const monitor = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 1, 0.1),
            new THREE.MeshStandardMaterial({ color: 0x222222 })
        );
        monitor.position.set(0, 3, -1.4);
        monitor.rotation.x = 0.2;
        group.add(monitor);
        
        const screen = new THREE.Mesh(
            new THREE.PlaneGeometry(1.3, 0.8),
            new THREE.MeshBasicMaterial({ color: 0x0080ff })
        );
        screen.position.set(0, 3, -1.35);
        screen.rotation.x = 0.2;
        group.add(screen);
        
        group.position.set(x, 0, z);
        
        table.userData.deviceData = {
            id,
            type: 'assembly',
            name: `装配工作站 ${id}`,
            description: '产品装配作业区',
            group: group
        };
        
        return { mesh: table, group };
    }
    
    createAGV(x, z, id) {
        const group = new THREE.Group();
        
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(2, 0.8, 3),
            new THREE.MeshStandardMaterial({ color: 0xffaa00 })
        );
        body.position.y = 0.6;
        body.castShadow = true;
        group.add(body);
        
        const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16);
        const wheelMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
        
        const wheelPositions = [
            [-0.8, 0.3, -1],
            [0.8, 0.3, -1],
            [-0.8, 0.3, 1],
            [0.8, 0.3, 1]
        ];
        
        wheelPositions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeo, wheelMat);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(...pos);
            group.add(wheel);
        });
        
        const light = new THREE.Mesh(
            new THREE.SphereGeometry(0.15, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0x00ff00 })
        );
        light.position.set(0, 1.1, 1.4);
        group.add(light);
        
        group.position.set(x, 0, z);
        
        body.userData.deviceData = {
            id,
            type: 'agv',
            name: `AGV小车 ${id}`,
            description: '自动导引运输车',
            group: group,
            light: light
        };
        
        return { mesh: body, group };
    }
    
    updateMaterialColor(mesh, status) {
        if (!mesh || !mesh.material) return;
        
        let targetMaterial;
        switch (status) {
            case 'normal':
                targetMaterial = this.materials.machineActive;
                break;
            case 'warning':
                targetMaterial = this.materials.machineWarning;
                break;
            case 'danger':
                targetMaterial = this.materials.machineDanger;
                break;
            case 'stopped':
                targetMaterial = this.materials.machineStopped;
                break;
            default:
                targetMaterial = this.materials.machine;
        }
        
        mesh.material.color.copy(targetMaterial.color);
        mesh.material.emissive.copy(targetMaterial.emissive);
        mesh.material.emissiveIntensity = targetMaterial.emissiveIntensity;
    }
}
