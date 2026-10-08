import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export class CinematicWorld {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = "AFTERLIGHT_CINEMATIC_WORLD";
    scene.add(this.group);

    this.time = 0;
    this.floatingObjects = [];
    this.lights = [];

    this.build();
  }

  build() {
    this.createAtmosphere();
    this.createMainFloor();
    this.createGrandAtrium();
    this.createGlassWalls();
    this.createEnergyCore();
    this.createUpperStructures();
    this.createHolograms();
    this.createSkyline();
    this.createLightStrips();
    this.createFloatingParticles();
  }

  material(color, metalness = 0.7, roughness = 0.25, emissive = 0x000000, intensity = 0) {
    return new THREE.MeshStandardMaterial({
      color,
      metalness,
      roughness,
      emissive,
      emissiveIntensity: intensity
    });
  }

  createAtmosphere() {
    this.scene.background = new THREE.Color(0x02050a);

    this.scene.fog = new THREE.FogExp2(
      0x071019,
      0.006
    );

    const ambient = new THREE.HemisphereLight(
      0x9fc9ff,
      0x020307,
      1.15
    );

    this.group.add(ambient);

    const mainLight = new THREE.DirectionalLight(
      0xc9e6ff,
      2.2
    );

    mainLight.position.set(30, 60, 20);
    this.group.add(mainLight);
    this.lights.push(mainLight);

    const coreLight = new THREE.PointLight(
      0x00eaff,
      20,
      90,
      2
    );

    coreLight.position.set(0, 8, 0);
    this.group.add(coreLight);
    this.lights.push(coreLight);

    const purpleLight = new THREE.PointLight(
      0x743cff,
      14,
      80,
      2
    );

    purpleLight.position.set(-35, 18, -30);
    this.group.add(purpleLight);
    this.lights.push(purpleLight);
  }

  createMainFloor() {
    const floorMaterial = this.material(
      0x101821,
      0.9,
      0.2
    );

    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(150, 1.2, 150),
      floorMaterial
    );

    floor.position.y = -1;
    this.group.add(floor);

    const innerFloorMaterial = this.material(
      0x18232d,
      0.8,
      0.18
    );

    const innerFloor = new THREE.Mesh(
      new THREE.CylinderGeometry(35, 35, 0.45, 64),
      innerFloorMaterial
    );

    innerFloor.position.y = -0.35;
    this.group.add(innerFloor);

    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x00dfff,
      transparent: true,
      opacity: 0.65
    });

    for (let r = 1; r <= 5; r++) {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(
          r * 6,
          r * 6 + 0.08,
          128
        ),
        ringMaterial
      );

      ring.rotation.x = -Math.PI / 2;
      ring.position.y = -0.08;
      this.group.add(ring);
    }
  }

  createGrandAtrium() {
    const darkMetal = this.material(
      0x0b1118,
      0.95,
      0.17
    );

    const silver = this.material(
      0x354451,
      0.95,
      0.14
    );

    // Massive structural pillars
    const pillarPositions = [
      [-42, -42],
      [42, -42],
      [-42, 42],
      [42, 42],
      [-25, -52],
      [25, -52],
      [-25, 52],
      [25, 52]
    ];

    for (const [x, z] of pillarPositions) {
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(
          2.4,
          3.2,
          38,
          32
        ),
        darkMetal
      );

      pillar.position.set(x, 18, z);
      this.group.add(pillar);

      const light = new THREE.Mesh(
        new THREE.BoxGeometry(
          0.16,
          32,
          0.16
        ),
        new THREE.MeshBasicMaterial({
          color: 0x00eaff
        })
      );

      light.position.set(x + 2.35, 18, z);
      this.group.add(light);
    }

    // Giant overhead structural ring
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(
        45,
        1.1,
        16,
        128
      ),
      silver
    );

    ring.position.y = 42;
    ring.rotation.x = Math.PI / 2;
    this.group.add(ring);

    const innerRing = new THREE.Mesh(
      new THREE.TorusGeometry(
        31,
        0.45,
        12,
        128
      ),
      new THREE.MeshBasicMaterial({
        color: 0x00eaff
      })
    );

    innerRing.position.y = 41;
    innerRing.rotation.x = Math.PI / 2;
    this.group.add(innerRing);
  }

  createGlassWalls() {
    const glass = new THREE.MeshPhysicalMaterial({
      color: 0x4b91a8,
      metalness: 0.1,
      roughness: 0.08,
      transmission: 0.72,
      transparent: true,
      opacity: 0.25,
      thickness: 0.4
    });

    const wallPositions = [
      [0, 18, -60, 120, 40, 1],
      [0, 18, 60, 120, 40, 1],
      [-60, 18, 0, 1, 40, 120],
      [60, 18, 0, 1, 40, 120]
    ];

    for (const [x, y, z, w, h, d] of wallPositions) {
      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        glass
      );

      wall.position.set(x, y, z);
      this.group.add(wall);
    }

    // Vertical window divisions
    const frameMaterial = this.material(
      0x263641,
      0.95,
      0.18
    );

    for (let x = -50; x <= 50; x += 10) {
      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(
          0.18,
          38,
          0.35
        ),
        frameMaterial
      );

      frame.position.set(x, 18, -59.2);
      this.group.add(frame);

      const frame2 = frame.clone();
      frame2.position.z = 59.2;
      this.group.add(frame2);
    }
  }

  createEnergyCore() {
    const coreGroup = new THREE.Group();
    coreGroup.position.set(0, 8, 0);

    const coreMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x00dfff,
      emissive: 0x00bfff,
      emissiveIntensity: 5,
      metalness: 0.2,
      roughness: 0.05,
      transparent: true,
      opacity: 0.92
    });

    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(5.5, 4),
      coreMaterial
    );

    coreGroup.add(core);

    for (let i = 0; i < 4; i++) {
      const orbit = new THREE.Mesh(
        new THREE.TorusGeometry(
          7 + i * 1.7,
          0.12,
          10,
          100
        ),
        new THREE.MeshBasicMaterial({
          color: i % 2
            ? 0x8c4dff
            : 0x00eaff,
          transparent: true,
          opacity: 0.8
        })
      );

      orbit.rotation.x =
        Math.PI / 3 + i * 0.35;

      orbit.rotation.z =
        i * 0.45;

      coreGroup.add(orbit);

      this.floatingObjects.push({
        object: orbit,
        speed: 0.25 + i * 0.08
      });
    }

    const light = new THREE.PointLight(
      0x00eaff,
      35,
      55,
      2
    );

    coreGroup.add(light);

    this.group.add(coreGroup);

    this.floatingObjects.push({
      object: core,
      speed: 0.7
    });
  }

  createUpperStructures() {
    const material = this.material(
      0x17232c,
      0.9,
      0.2
    );

    for (let level = 0; level < 3; level++) {
      const y = 15 + level * 10;

      const balcony = new THREE.Mesh(
        new THREE.TorusGeometry(
          28 + level * 3,
          1.1,
          12,
          128
        ),
        material
      );

      balcony.rotation.x = Math.PI / 2;
      balcony.position.y = y;
      this.group.add(balcony);

      const lights = new THREE.Mesh(
        new THREE.TorusGeometry(
          28 + level * 3,
          0.14,
          8,
          128
        ),
        new THREE.MeshBasicMaterial({
          color: 0x00dfff
        })
      );

      lights.rotation.x = Math.PI / 2;
      lights.position.y = y - 0.8;

      this.group.add(lights);
    }
  }

  createHolograms() {
    const hologramMaterial = new THREE.MeshBasicMaterial({
      color: 0x00eaff,
      transparent: true,
      opacity: 0.22,
      wireframe: true
    });

    for (let i = 0; i < 6; i++) {
      const group = new THREE.Group();

      const sphere = new THREE.Mesh(
        new THREE.IcosahedronGeometry(
          3 + Math.random() * 2,
          2
        ),
        hologramMaterial
      );

      group.add(sphere);

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(
          4,
          0.08,
          8,
          64
        ),
        new THREE.MeshBasicMaterial({
          color: 0x8b5cff,
          transparent: true,
          opacity: 0.65
        })
      );

      ring.rotation.x = Math.PI / 2;
      group.add(ring);

      group.position.set(
        -30 + i * 12,
        7 + (i % 2) * 8,
        -25
      );

      this.group.add(group);

      this.floatingObjects.push({
        object: group,
        speed: 0.2 + i * 0.03
      });
    }
  }

  createSkyline() {
    const skylineMaterial = this.material(
      0x091017,
      0.75,
      0.28
    );

    for (let i = 0; i < 32; i++) {
      const angle =
        (i / 32) * Math.PI * 2;

      const radius = 95;

      const height =
        15 + Math.random() * 65;

      const width =
        7 + Math.random() * 12;

      const building = new THREE.Mesh(
        new THREE.BoxGeometry(
          width,
          height,
          width
        ),
        skylineMaterial
      );

      building.position.set(
        Math.cos(angle) * radius,
        height / 2 - 1,
        Math.sin(angle) * radius
      );

      building.rotation.y = Math.random();

      this.group.add(building);

      // Building edge light
      const line = new THREE.Mesh(
        new THREE.BoxGeometry(
          0.12,
          height * 0.85,
          0.12
        ),
        new THREE.MeshBasicMaterial({
          color: i % 3 === 0
            ? 0x8a4cff
            : 0x00dfff
        })
      );

      line.position.set(
        building.position.x + width / 2,
        height / 2,
        building.position.z
      );

      this.group.add(line);
    }
  }

  createLightStrips() {
    const strips = [
      [-58, 4, 0, 0, 0, Math.PI / 2],
      [58, 4, 0, 0, 0, Math.PI / 2],
      [0, 4, -58, 0, 0, 0],
      [0, 4, 58, 0, 0, 0]
    ];

    for (const [x, y, z, rx, ry, rz] of strips) {
      const strip = new THREE.Mesh(
        new THREE.BoxGeometry(
          110,
          0.18,
          0.18
        ),
        new THREE.MeshBasicMaterial({
          color: 0x00eaff
        })
      );

      strip.position.set(x, y, z);
      strip.rotation.set(rx, ry, rz);

      this.group.add(strip);
    }
  }

  createFloatingParticles() {
    const count = 700;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] =
        (Math.random() - 0.5) * 130;

      positions[i * 3 + 1] =
        Math.random() * 45;

      positions[i * 3 + 2] =
        (Math.random() - 0.5) * 130;
    }

    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(
        positions,
        3
      )
    );

    const material =
      new THREE.PointsMaterial({
        color: 0x7cecff,
        size: 0.08,
        transparent: true,
        opacity: 0.7,
        depthWrite: false
      });

    const particles =
      new THREE.Points(
        geometry,
        material
      );

    this.group.add(particles);

    this.particles = particles;
  }

  update(time) {
    this.time = time;

    for (const item of this.floatingObjects) {
      if (!item.object) continue;

      item.object.rotation.y +=
        0.0008 * item.speed;

      item.object.rotation.x +=
        0.00035 * item.speed;
    }

    if (this.particles) {
      this.particles.rotation.y =
        time * 0.00001;
    }

    for (let i = 0; i < this.lights.length; i++) {
      this.lights[i].intensity =
        12 +
        Math.sin(
          time * 0.0015 + i
        ) * 3;
    }
  }
}
