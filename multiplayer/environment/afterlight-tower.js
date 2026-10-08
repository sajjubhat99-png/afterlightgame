// AFTERLIGHT — Futuristic Tower Environment
// Additive environment module.
// Does not control players, networking, challenges, voting, or game state.

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export class AfterlightTower {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = "AFTERLIGHT_TOWER";

    scene.add(this.group);

    this.materials();
    this.buildTower();
    this.buildAtrium();
    this.buildEnergyCore();
    this.buildWalkways();
    this.buildWindows();
    this.buildLights();
    this.buildDetails();
  }

  materials() {
    this.metal = new THREE.MeshStandardMaterial({
      color: 0x101722,
      metalness: 0.85,
      roughness: 0.28
    });

    this.darkMetal = new THREE.MeshStandardMaterial({
      color: 0x05080d,
      metalness: 0.9,
      roughness: 0.2
    });

    this.glass = new THREE.MeshPhysicalMaterial({
      color: 0x16445c,
      metalness: 0.15,
      roughness: 0.12,
      transmission: 0.18,
      transparent: true,
      opacity: 0.55
    });

    this.floor = new THREE.MeshStandardMaterial({
      color: 0x080c13,
      metalness: 0.75,
      roughness: 0.2
    });

    this.light = new THREE.MeshBasicMaterial({
      color: 0x20e6ff
    });

    this.gold = new THREE.MeshBasicMaterial({
      color: 0xffc857
    });
  }

  box(w, h, d, material, x, y, z) {
    const geometry = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    this.group.add(mesh);
    return mesh;
  }

  cylinder(radius, height, material, x, y, z) {
    const geometry = new THREE.CylinderGeometry(
      radius,
      radius,
      height,
      32
    );

    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(x, y, z);

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    this.group.add(mesh);
    return mesh;
  }

  buildTower() {
    // Main floor
    this.box(
      90,
      1,
      70,
      this.floor,
      0,
      0,
      0
    );

    // Upper floors
    const floors = [12, 24, 36];

    for (const y of floors) {
      this.box(
        90,
        0.7,
        70,
        this.floor,
        0,
        y,
        0
      );

      // Outer structural beams
      this.box(
        2,
        12,
        2,
        this.darkMetal,
        -43,
        y - 6,
        -33
      );

      this.box(
        2,
        12,
        2,
        this.darkMetal,
        43,
        y - 6,
        -33
      );

      this.box(
        2,
        12,
        2,
        this.darkMetal,
        -43,
        y - 6,
        33
      );

      this.box(
        2,
        12,
        2,
        this.darkMetal,
        43,
        y - 6,
        33
      );
    }

    // Roof
    this.box(
      94,
      1,
      74,
      this.darkMetal,
      0,
      48,
      0
    );
  }

  buildAtrium() {
    // Central open atrium frame

    const pillars = [
      [-25, -18],
      [25, -18],
      [-25, 18],
      [25, 18]
    ];

    for (const [x, z] of pillars) {
      this.box(
        3,
        48,
        3,
        this.darkMetal,
        x,
        24,
        z
      );
    }

    // Massive upper beams
    this.box(
      56,
      3,
      3,
      this.metal,
      0,
      46,
      -20
    );

    this.box(
      56,
      3,
      3,
      this.metal,
      0,
      46,
      20
    );

    // Entrance structure
    this.box(
      30,
      14,
      3,
      this.metal,
      0,
      7,
      -34
    );

    // Entrance glow
    this.box(
      22,
      0.35,
      0.4,
      this.light,
      0,
      11,
      -35.6
    );
  }

  buildEnergyCore() {
    const core = new THREE.Group();
    core.name = "AFTERLIGHT_CORE";

    this.group.add(core);

    // Outer rings
    for (let i = 0; i < 4; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(
          5 + i * 2,
          0.18,
          12,
          64
        ),
        this.light
      );

      ring.rotation.x = Math.PI / 2;
      ring.position.y = 2 + i * 0.5;

      core.add(ring);
    }

    // Central energy column
    const column = new THREE.Mesh(
      new THREE.CylinderGeometry(
        2.2,
        2.2,
        12,
        32
      ),
      new THREE.MeshBasicMaterial({
        color: 0x20e6ff,
        transparent: true,
        opacity: 0.32
      })
    );

    column.position.y = 6;

    core.add(column);

    // Core base
    this.cylinder(
      8,
      0.8,
      this.darkMetal,
      0,
      0.8,
      0
    );
  }

  buildWalkways() {
    // Four large suspended walkways

    this.box(
      40,
      0.6,
      5,
      this.metal,
      0,
      12.5,
      15
    );

    this.box(
      40,
      0.6,
      5,
      this.metal,
      0,
      24.5,
      -15
    );

    this.box(
      5,
      0.6,
      30,
      this.metal,
      15,
      36.5,
      0
    );

    this.box(
      5,
      0.6,
      30,
      this.metal,
      -15,
      36.5,
      0
    );

    // Railings
    for (const y of [13, 25, 37]) {
      this.box(
        40,
        1,
        0.3,
        this.light,
        0,
        y + 1.2,
        17.5
      );

      this.box(
        40,
        1,
        0.3,
        this.light,
        0,
        y + 1.2,
        -17.5
      );
    }
  }

  buildWindows() {
    // Long futuristic glass walls

    this.box(
      82,
      42,
      0.35,
      this.glass,
      0,
      24,
      -34.5
    );

    this.box(
      82,
      42,
      0.35,
      this.glass,
      0,
      24,
      34.5
    );

    this.box(
      0.35,
      42,
      62,
      this.glass,
      -43.5,
      24,
      0
    );

    this.box(
      0.35,
      42,
      62,
      this.glass,
      43.5,
      24,
      0
    );

    // Vertical window divisions

    for (let x = -40; x <= 40; x += 10) {
      this.box(
        0.18,
        42,
        0.25,
        this.darkMetal,
        x,
        24,
        -34.8
      );

      this.box(
        0.18,
        42,
        0.25,
        this.darkMetal,
        x,
        24,
        34.8
      );
    }
  }

  buildLights() {
    // Architectural light strips

    const levels = [4, 16, 28, 40];

    for (const y of levels) {
      this.box(
        70,
        0.22,
        0.22,
        this.light,
        0,
        y,
        -33.8
      );

      this.box(
        70,
        0.22,
        0.22,
        this.light,
        0,
        y,
        33.8
      );
    }

    // Vertical energy strips
    for (let x = -35; x <= 35; x += 10) {
      this.box(
        0.18,
        40,
        0.18,
        this.light,
        x,
        24,
        -34.1
      );
    }
  }

  buildDetails() {
    // Holographic information panels

    const panelMaterial = new THREE.MeshBasicMaterial({
      color: 0x20e6ff,
      transparent: true,
      opacity: 0.25
    });

    for (let i = 0; i < 6; i++) {
      const panel = new THREE.Mesh(
        new THREE.PlaneGeometry(5, 3),
        panelMaterial
      );

      panel.position.set(
        -35 + i * 14,
        8,
        -33
      );

      this.group.add(panel);
    }

    // Roof antenna
    this.box(
      1,
      12,
      1,
      this.darkMetal,
      0,
      54,
      0
    );

    this.cylinder(
      2,
      0.5,
      this.light,
      0,
      60,
      0
    );
  }

  update(time) {
    // Animate the energy core
    const core = this.group.getObjectByName(
      "AFTERLIGHT_CORE"
    );

    if (core) {
      core.rotation.y = time * 0.00025;

      core.children.forEach((child, index) => {
        if (child.geometry &&
            child.geometry.type === "TorusGeometry") {
          child.rotation.z =
            time * 0.0005 * (index + 1);
        }
      });
    }
  }
}
