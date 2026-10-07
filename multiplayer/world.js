// AFTERLIGHT — World Engine
// Creates the main futuristic AFTERLIGHT facility.

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export class AfterlightWorld {

    constructor(scene) {
        this.scene = scene;
        this.objects = [];
        this.rooms = [];

        this.build();
    }

    build() {
        this.createEnvironment();
        this.createMainFloor();
        this.createCore();
        this.createWalls();
        this.createColumns();
        this.createZones();
        this.createChallengeArea();
        this.createDoors();
        this.createDecoration();
        this.createLights();
    }

    // --------------------------------------------------
    // ENVIRONMENT
    // --------------------------------------------------

    createEnvironment() {

        this.scene.background = new THREE.Color(0x02040a);

        this.scene.fog = new THREE.Fog(
            0x02040a,
            25,
            95
        );
    }

    // --------------------------------------------------
    // FLOOR
    // --------------------------------------------------

    createMainFloor() {

        const floorGeometry = new THREE.BoxGeometry(
            70,
            0.4,
            70
        );

        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x10151d,
            metalness: 0.75,
            roughness: 0.3
        });

        const floor = new THREE.Mesh(
            floorGeometry,
            floorMaterial
        );

        floor.position.y = -0.2;

        this.scene.add(floor);
        this.objects.push(floor);

        // Grid

        const grid = new THREE.GridHelper(
            70,
            70,
            0x193d4d,
            0x0b2029
        );

        grid.position.y = 0.02;

        this.scene.add(grid);
        this.objects.push(grid);
    }

    // --------------------------------------------------
    // AFTERLIGHT CORE
    // --------------------------------------------------

    createCore() {

        const group = new THREE.Group();

        group.position.set(
            0,
            0,
            0
        );

        // Main core

        const coreGeometry =
            new THREE.SphereGeometry(
                2.4,
                32,
                32
            );

        const coreMaterial =
            new THREE.MeshStandardMaterial({
                color: 0x4deaff,
                emissive: 0x0088aa,
                emissiveIntensity: 4,
                metalness: 0.2,
                roughness: 0.15
            });

        const core =
            new THREE.Mesh(
                coreGeometry,
                coreMaterial
            );

        group.add(core);

        // Inner core

        const innerGeometry =
            new THREE.SphereGeometry(
                1.2,
                24,
                24
            );

        const innerMaterial =
            new THREE.MeshBasicMaterial({
                color: 0xffffff
            });

        const inner =
            new THREE.Mesh(
                innerGeometry,
                innerMaterial
            );

        group.add(inner);

        // Energy rings

        for (let i = 0; i < 4; i++) {

            const ring =
                new THREE.Mesh(
                    new THREE.TorusGeometry(
                        4 + i * 0.7,
                        0.045,
                        8,
                        96
                    ),
                    new THREE.MeshBasicMaterial({
                        color: 0x25dfff
                    })
                );

            ring.rotation.x =
                Math.PI / 2;

            ring.rotation.z =
                i * 0.6;

            group.add(ring);
        }

        // Core light

        const light =
            new THREE.PointLight(
                0x00ddff,
                15,
                30
            );

        light.position.y = 1;

        group.add(light);

        this.scene.add(group);

        this.core = group;
    }

    // --------------------------------------------------
    // WALLS
    // --------------------------------------------------

    createWalls() {

        const material =
            new THREE.MeshStandardMaterial({
                color: 0x080d14,
                metalness: 0.8,
                roughness: 0.3
            });

        this.addWall(
            0,
            3,
            -34,
            70,
            6,
            1,
            material
        );

        this.addWall(
            0,
            3,
            34,
            70,
            6,
            1,
            material
        );

        this.addWall(
            -34,
            3,
            0,
            1,
            6,
            70,
            material
        );

        this.addWall(
            34,
            3,
            0,
            1,
            6,
            70,
            material
        );
    }

    addWall(
        x,
        y,
        z,
        width,
        height,
        depth,
        material
    ) {

        const geometry =
            new THREE.BoxGeometry(
                width,
                height,
                depth
            );

        const wall =
            new THREE.Mesh(
                geometry,
                material
            );

        wall.position.set(
            x,
            y,
            z
        );

        this.scene.add(wall);
        this.objects.push(wall);
    }

    // --------------------------------------------------
    // COLUMNS
    // --------------------------------------------------

    createColumns() {

        const material =
            new THREE.MeshStandardMaterial({
                color: 0x111a24,
                metalness: 0.9,
                roughness: 0.25
            });

        const positions = [
            [-25, -25],
            [25, -25],
            [-25, 25],
            [25, 25],
            [-15, -15],
            [15, -15],
            [-15, 15],
            [15, 15]
        ];

        for (const [x, z] of positions) {

            const geometry =
                new THREE.CylinderGeometry(
                    1,
                    1.2,
                    6,
                    16
                );

            const column =
                new THREE.Mesh(
                    geometry,
                    material
                );

            column.position.set(
                x,
                3,
                z
            );

            this.scene.add(column);

            // Light strip

            const strip =
                new THREE.Mesh(
                    new THREE.BoxGeometry(
                        0.12,
                        5,
                        1.1
                    ),
                    new THREE.MeshBasicMaterial({
                        color: 0x20cfff
                    })
                );

            strip.position.set(
                x + 1.05,
                3,
                z
            );

            this.scene.add(strip);
        }
    }

    // --------------------------------------------------
    // FACILITY ZONES
    // --------------------------------------------------

    createZones() {

        this.createZone(
            "DINING HALL",
            -22,
            -20,
            18,
            12
        );

        this.createZone(
            "LOUNGE",
            22,
            -20,
            18,
            12
        );

        this.createZone(
            "POWER STORE",
            -22,
            20,
            18,
            12
        );

        this.createZone(
            "SOCIAL ROOM",
            22,
            20,
            18,
            12
        );
    }

    createZone(
        name,
        x,
        z,
        width,
        depth
    ) {

        const material =
            new THREE.MeshStandardMaterial({
                color: 0x0c131c,
                metalness: 0.7,
                roughness: 0.35
            });

        const floor =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    width,
                    0.15,
                    depth
                ),
                material
            );

        floor.position.set(
            x,
            0.1,
            z
        );

        this.scene.add(floor);

        this.rooms.push({
            name,
            x,
            z,
            width,
            depth
        });

        // Zone border

        const borderMaterial =
            new THREE.MeshBasicMaterial({
                color: 0x146477
            });

        const border =
            new THREE.LineSegments(
                new THREE.EdgesGeometry(
                    new THREE.BoxGeometry(
                        width,
                        0.2,
                        depth
                    )
                ),
                borderMaterial
            );

        border.position.set(
            x,
            0.2,
            z
        );

        this.scene.add(border);

        // Zone label

        this.createLabel(
            name,
            x,
            2.8,
            z
        );
    }

    // --------------------------------------------------
    // CHALLENGE AREA
    // --------------------------------------------------

    createChallengeArea() {

        const platformMaterial =
            new THREE.MeshStandardMaterial({
                color: 0x17202b,
                metalness: 0.85,
                roughness: 0.2
            });

        const platform =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    26,
                    0.6,
                    14
                ),
                platformMaterial
            );

        platform.position.set(
            0,
            0.3,
            -20
        );

        this.scene.add(platform);

        // Challenge lanes

        for (let i = 0; i < 7; i++) {

            const tile =
                new THREE.Mesh(
                    new THREE.BoxGeometry(
                        3,
                        0.3,
                        3
                    ),
                    new THREE.MeshStandardMaterial({
                        color:
                            i % 2 === 0
                                ? 0x17303b
                                : 0x10232c,
                        emissive:
                            i % 2 === 0
                                ? 0x003a44
                                : 0x001d24,
                        emissiveIntensity: 1
                    })
                );

            tile.position.set(
                -9 + i * 3,
                0.8,
                -20
            );

            this.scene.add(tile);
        }

        this.createLabel(
            "CHALLENGE PLATFORM",
            0,
            3,
            -20
        );
    }

    // --------------------------------------------------
    // DOORS
    // --------------------------------------------------

    createDoors() {

        const positions = [
            [-10, 0, -34],
            [10, 0, -34],
            [-34, 0, -10],
            [-34, 0, 10],
            [34, 0, -10],
            [34, 0, 10],
            [-10, 0, 34],
            [10, 0, 34]
        ];

        for (const [x, y, z] of positions) {

            const door =
                new THREE.Mesh(
                    new THREE.BoxGeometry(
                        4,
                        5,
                        0.5
                    ),
                    new THREE.MeshStandardMaterial({
                        color: 0x07121a,
                        emissive: 0x003d4b,
                        emissiveIntensity: 2
                    })
                );

            door.position.set(
                x,
                2.5,
                z
            );

            this.scene.add(door);

            const light =
                new THREE.Mesh(
                    new THREE.BoxGeometry(
                        3,
                        0.08,
                        0.08
                    ),
                    new THREE.MeshBasicMaterial({
                        color: 0x2bdcff
                    })
                );

            light.position.set(
                x,
                4.7,
                z
            );

            this.scene.add(light);
        }
    }

    // --------------------------------------------------
    // DECORATION
    // --------------------------------------------------

    createDecoration() {

        // Holographic panels

        const panelMaterial =
            new THREE.MeshBasicMaterial({
                color: 0x20cfff,
                transparent: true,
                opacity: 0.35
            });

        const panels = [
            [-10, 4, -33],
            [10, 4, -33],
            [-33, 4, 0],
            [33, 4, 0]
        ];

        for (const [x, y, z] of panels) {

            const panel =
                new THREE.Mesh(
                    new THREE.BoxGeometry(
                        5,
                        3,
                        0.08
                    ),
                    panelMaterial
                );

            panel.position.set(
                x,
                y,
                z
            );

            this.scene.add(panel);
        }

        // Decorative energy cubes

        for (let i = 0; i < 12; i++) {

            const cube =
                new THREE.Mesh(
                    new THREE.BoxGeometry(
                        0.5,
                        0.5,
                        0.5
                    ),
                    new THREE.MeshBasicMaterial({
                        color: 0x1bd5ff
                    })
                );

            cube.position.set(
                (Math.random() - 0.5) * 55,
                1 + Math.random() * 3,
                (Math.random() - 0.5) * 55
            );

            this.scene.add(cube);
        }
    }

    // --------------------------------------------------
    // LIGHTING
    // --------------------------------------------------

    createLights() {

        const ambient =
            new THREE.AmbientLight(
                0x17313c,
                1.5
            );

        this.scene.add(ambient);

        const main =
            new THREE.DirectionalLight(
                0xbdefff,
                1.5
            );

        main.position.set(
            15,
            30,
            10
        );

        this.scene.add(main);

        const blue =
            new THREE.PointLight(
                0x00bfff,
                5,
                40
            );

        blue.position.set(
            -20,
            5,
            -20
        );

        this.scene.add(blue);

        const purple =
            new THREE.PointLight(
                0x6633ff,
                4,
                35
            );

        purple.position.set(
            20,
            5,
            20
        );

        this.scene.add(purple);
    }

    // --------------------------------------------------
    // LABELS
    // --------------------------------------------------

    createLabel(
        text,
        x,
        y,
        z
    ) {

        const canvas =
            document.createElement("canvas");

        canvas.width = 512;
        canvas.height = 128;

        const context =
            canvas.getContext("2d");

        context.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        context.font =
            "bold 32px Arial";

        context.textAlign =
            "center";

        context.fillStyle =
            "#49eaff";

        context.fillText(
            text,
            canvas.width / 2,
            60
        );

        const texture =
            new THREE.CanvasTexture(
                canvas
            );

        const material =
            new THREE.SpriteMaterial({
                map: texture,
                transparent: true
            });

        const sprite =
            new THREE.Sprite(material);

        sprite.position.set(
            x,
            y,
            z
        );

        sprite.scale.set(
            7,
            1.75,
            1
        );

        this.scene.add(sprite);
    }

    // --------------------------------------------------
    // ANIMATION
    // --------------------------------------------------

    update(delta) {

        if (!this.core) return;

        this.core.rotation.y +=
            delta * 0.35;

        this.core.rotation.x +=
            delta * 0.08;
    }
}
