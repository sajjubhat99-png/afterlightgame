import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export class AfterlightPlayer {

    constructor(scene, data, isLocal = false) {
        this.scene = scene;
        this.id = data.id;
        this.name = data.name || "Player";
        this.role = data.role || "Competitor";
        this.isLocal = isLocal;

        this.position = new THREE.Vector3(
            Number(data.x) || 0,
            Number(data.y) || 1,
            Number(data.z) || 0
        );

        this.targetPosition =
            this.position.clone();

        this.alive =
            data.alive !== false;

        this.group =
            new THREE.Group();

        this.buildCharacter();
        this.buildNameplate();

        this.group.position.copy(
            this.position
        );

        this.scene.add(
            this.group
        );
    }

    // -----------------------------------------
    // CHARACTER
    // -----------------------------------------

    buildCharacter() {

        const colors = {
            Champion: 0xffb52e,
            Strategist: 0x3edbff,
            Leader: 0x9a6cff,
            "Social Player": 0xff55a8,
            Ghost: 0x7b8795,
            Cipher: 0x00ffb7,
            Observer: 0xffffff,
            Tracker: 0xff7043,
            Competitor: 0x4deaff
        };

        const mainColor =
            colors[this.role] ||
            colors.Competitor;

        const bodyMaterial =
            new THREE.MeshStandardMaterial({
                color: mainColor,
                metalness: 0.65,
                roughness: 0.3,
                emissive: mainColor,
                emissiveIntensity:
                    this.isLocal ? 0.16 : 0.06
            });

        const darkMaterial =
            new THREE.MeshStandardMaterial({
                color: 0x081018,
                metalness: 0.8,
                roughness: 0.25
            });

        // Body

        const body =
            new THREE.Mesh(
                new THREE.CapsuleGeometry(
                    0.42,
                    0.95,
                    8,
                    16
                ),
                bodyMaterial
            );

        body.position.y = 1.05;

        this.group.add(body);

        this.body = body;

        // Chest armor

        const chest =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.68,
                    0.62,
                    0.32
                ),
                darkMaterial
            );

        chest.position.set(
            0,
            1.25,
            -0.27
        );

        this.group.add(chest);

        // Head

        const head =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.32,
                    20,
                    20
                ),
                bodyMaterial
            );

        head.position.y =
            1.9;

        this.group.add(head);

        this.head = head;

        // Visor

        const visorMaterial =
            new THREE.MeshBasicMaterial({
                color:
                    this.isLocal
                        ? 0x8cffff
                        : 0x48eaff
            });

        const visor =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.46,
                    0.11,
                    0.08
                ),
                visorMaterial
            );

        visor.position.set(
            0,
            1.93,
            -0.29
        );

        this.group.add(visor);

        // Shoulders

        const shoulderGeometry =
            new THREE.SphereGeometry(
                0.23,
                12,
                12
            );

        const leftShoulder =
            new THREE.Mesh(
                shoulderGeometry,
                bodyMaterial
            );

        leftShoulder.position.set(
            -0.52,
            1.35,
            0
        );

        const rightShoulder =
            new THREE.Mesh(
                shoulderGeometry,
                bodyMaterial
            );

        rightShoulder.position.set(
            0.52,
            1.35,
            0
        );

        this.group.add(
            leftShoulder,
            rightShoulder
        );

        // Arms

        const armGeometry =
            new THREE.CapsuleGeometry(
                0.13,
                0.65,
                6,
                10
            );

        const leftArm =
            new THREE.Mesh(
                armGeometry,
                darkMaterial
            );

        leftArm.position.set(
            -0.55,
            0.9,
            0
        );

        const rightArm =
            new THREE.Mesh(
                armGeometry,
                darkMaterial
            );

        rightArm.position.set(
            0.55,
            0.9,
            0
        );

        this.group.add(
            leftArm,
            rightArm
        );

        // Legs

        const legGeometry =
            new THREE.CapsuleGeometry(
                0.16,
                0.65,
                6,
                10
            );

        const leftLeg =
            new THREE.Mesh(
                legGeometry,
                darkMaterial
            );

        leftLeg.position.set(
            -0.2,
            0.35,
            0
        );

        const rightLeg =
            new THREE.Mesh(
                legGeometry,
                darkMaterial
            );

        rightLeg.position.set(
            0.2,
            0.35,
            0
        );

        this.group.add(
            leftLeg,
            rightLeg
        );

        // Energy core

        const core =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.1,
                    12,
                    12
                ),
                new THREE.MeshBasicMaterial({
                    color: mainColor
                })
            );

        core.position.set(
            0,
            1.25,
            -0.48
        );

        this.group.add(core);

        this.core = core;

        // Local player glow

        if (this.isLocal) {

            const glow =
                new THREE.PointLight(
                    mainColor,
                    2,
                    4
                );

            glow.position.y =
                1.1;

            this.group.add(
                glow
            );
        }

        // Ground ring

        const ring =
            new THREE.Mesh(
                new THREE.TorusGeometry(
                    0.65,
                    0.025,
                    8,
                    40
                ),
                new THREE.MeshBasicMaterial({
                    color:
                        this.isLocal
                            ? 0x55eaff
                            : mainColor
                })
            );

        ring.rotation.x =
            Math.PI / 2;

        ring.position.y =
            0.03;

        this.group.add(ring);

        this.ring = ring;
    }

    // -----------------------------------------
    // NAMEPLATE
    // -----------------------------------------

    buildNameplate() {

        const canvas =
            document.createElement(
                "canvas"
            );

        canvas.width = 512;
        canvas.height = 150;

        const context =
            canvas.getContext(
                "2d"
            );

        context.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        context.textAlign =
            "center";

        // Player name

        context.font =
            "bold 38px Arial";

        context.fillStyle =
            this.isLocal
                ? "#55eaff"
                : "#ffffff";

        context.fillText(
            this.name,
            256,
            48
        );

        // Role

        context.font =
            "22px Arial";

        context.fillStyle =
            "#7e9ba7";

        context.fillText(
            this.role.toUpperCase(),
            256,
            82
        );

        const texture =
            new THREE.CanvasTexture(
                canvas
            );

        texture.colorSpace =
            THREE.SRGBColorSpace;

        const material =
            new THREE.SpriteMaterial({
                map: texture,
                transparent: true,
                depthTest: false
            });

        const sprite =
            new THREE.Sprite(
                material
            );

        sprite.position.y =
            2.75;

        sprite.scale.set(
            3.8,
            1.1,
            1
        );

        this.group.add(
            sprite
        );

        this.nameplate =
            sprite;
    }

    // -----------------------------------------
    // SERVER UPDATE
    // -----------------------------------------

    updateFromServer(data) {

        if (
            data.name &&
            data.name !== this.name
        ) {

            this.name =
                data.name;

            this.refreshNameplate();
        }

        if (data.role) {

            this.role =
                data.role;
        }

        this.targetPosition.set(
            Number(data.x) || 0,
            Number(data.y) || 1,
            Number(data.z) || 0
        );

        this.alive =
            data.alive !== false;

        if (!this.alive) {

            this.group.visible =
                false;
        }
        else {

            this.group.visible =
                true;
        }
    }

    // -----------------------------------------
    // SMOOTH MOVEMENT
    // -----------------------------------------

    update(delta) {

        const smoothing =
            Math.min(
                1,
                delta * 12
            );

        this.group.position.lerp(
            this.targetPosition,
            smoothing
        );

        // Floating energy core

        if (this.core) {

            this.core.position.y =
                1.25 +
                Math.sin(
                    performance.now() *
                    0.004
                ) *
                0.04;
        }

        // Ground ring

        if (this.ring) {

            this.ring.rotation.z +=
                delta * 0.8;
        }
    }

    // -----------------------------------------
    // LOCAL MOVEMENT
    // -----------------------------------------

    setLocalPosition(
        x,
        y,
        z
    ) {

        this.position.set(
            x,
            y,
            z
        );

        this.targetPosition.copy(
            this.position
        );

        this.group.position.copy(
            this.position
        );
    }

    // -----------------------------------------
    // NAMEPLATE UPDATE
    // -----------------------------------------

    refreshNameplate() {

        if (!this.nameplate) {
            return;
        }

        this.group.remove(
            this.nameplate
        );

        if (
            this.nameplate.material
        ) {

            this.nameplate.material.dispose();
        }

        this.buildNameplate();
    }

    // -----------------------------------------
    // REMOVE
    // -----------------------------------------

    remove() {

        this.scene.remove(
            this.group
        );

        this.group.traverse(
            object => {

                if (
                    object.geometry
                ) {
                    object.geometry.dispose();
                }

                if (
                    object.material
                ) {

                    if (
                        Array.isArray(
                            object.material
                        )
                    ) {

                        object.material.forEach(
                            material =>
                                material.dispose()
                        );

                    }
                    else {

                        object.material.dispose();
                    }
                }
            }
        );
    }
}
