import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export class AfterlightWorld {
  constructor(scene) {
    this.scene = scene;

    this.root = new THREE.Group();
    this.root.name = "AFTERLIGHT_WORLD";

    scene.add(this.root);

    this.time = 0;

    this.materials = {};
    this.animated = [];

    this.buildMaterials();
    this.buildEnvironment();
    this.buildCore();
    this.buildMainHall();
    this.buildDining();
    this.buildLounge();
    this.buildPowerStore();
    this.buildSocialRoom();
    this.buildChallengeArena();
    this.buildArchitecture();
    this.buildDecorations();
    this.buildLights();
    this.buildAtmosphere();
  }

  buildMaterials() {
    this.materials.floor = new THREE.MeshStandardMaterial({
      color: 0x101821,
      metalness: 0.75,
      roughness: 0.3
    });

    this.materials.dark = new THREE.MeshStandardMaterial({
      color: 0x070c12,
      metalness: 0.8,
      roughness: 0.25
    });

    this.materials.wall = new THREE.MeshStandardMaterial({
      color: 0x16232d,
      metalness: 0.65,
      roughness: 0.3
    });

    this.materials.glass = new THREE.MeshPhysicalMaterial({
      color: 0x183849,
      metalness: 0.15,
      roughness: 0.15,
      transparent: true,
      opacity: 0.42
    });

    this.materials.neon = new THREE.MeshBasicMaterial({
      color: 0x19e6ff
    });

    this.materials.purple = new THREE.MeshBasicMaterial({
      color: 0x9d65ff
    });

    this.materials.white = new THREE.MeshBasicMaterial({
      color: 0xdffaff
    });

    this.materials.green = new THREE.MeshStandardMaterial({
      color: 0x164d45,
      roughness: 0.8
    });

    this.materials.plant = new THREE.MeshStandardMaterial({
      color: 0x238f72,
      roughness: 0.9
    });
  }

  box(
    x,
    y,
    z,
    sx,
    sy,
    sz,
    material,
    parent = this.root
  ) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(sx, sy, sz),
      material
    );

    mesh.position.set(x, y, z);

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    parent.add(mesh);

    return mesh;
  }

  cylinder(
    x,
    y,
    z,
    radius,
    height,
    material,
    parent = this.root
  ) {
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(
        radius,
        radius,
        height,
        16
      ),
      material
    );

    mesh.position.set(x, y, z);

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    parent.add(mesh);

    return mesh;
  }

  sphere(
    x,
    y,
    z,
    radius,
    material,
    parent = this.root
  ) {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 16, 12),
      material
    );

    mesh.position.set(x, y, z);

    mesh.castShadow = true;

    parent.add(mesh);

    return mesh;
  }

  textLabel(text, x, y, z, scale = 1) {
    const canvas = document.createElement("canvas");

    canvas.width = 512;
    canvas.height = 128;

    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, 512, 128);

    ctx.font = "bold 38px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillStyle = "#bdf8ff";
    ctx.fillText(text, 256, 64);

    const texture = new THREE.CanvasTexture(canvas);

    const material =
      new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthWrite: false
      });

    const sprite =
      new THREE.Sprite(material);

    sprite.position.set(x, y, z);

    sprite.scale.set(
      6 * scale,
      1.5 * scale,
      1
    );

    this.root.add(sprite);

    return sprite;
  }

  buildEnvironment() {
    this.box(
      0,
      -0.4,
      0,
      90,
      0.8,
      90,
      this.materials.floor
    );

    for (let x = -42; x <= 42; x += 6) {
      this.box(
        x,
        0.02,
        0,
        0.025,
        0.02,
        84,
        this.materials.neon
      );
    }

    for (let z = -42; z <= 42; z += 6) {
      this.box(
        0,
        0.025,
        z,
        84,
        0.02,
        0.025,
        this.materials.neon
      );
    }
  }

  buildCore() {
    const core = new THREE.Group();

    core.position.set(0, 0, 0);

    this.root.add(core);

    this.cylinder(
      0,
      0.3,
      0,
      7,
      0.6,
      this.materials.dark,
      core
    );

    this.cylinder(
      0,
      0.65,
      0,
      5,
      0.15,
      this.materials.neon,
      core
    );

    const orb = this.sphere(
      0,
      6,
      0,
      3.1,
      this.materials.neon,
      core
    );

    orb.material.transparent = true;
    orb.material.opacity = 0.72;

    const inner = this.sphere(
      0,
      6,
      0,
      1.8,
      this.materials.white,
      core
    );

    inner.material.transparent = true;
    inner.material.opacity = 0.9;

    const ring1 =
      new THREE.Mesh(
        new THREE.TorusGeometry(
          4.2,
          0.12,
          8,
          64
        ),
        this.materials.neon
      );

    ring1.position.y = 6;

    core.add(ring1);

    const ring2 =
      new THREE.Mesh(
        new THREE.TorusGeometry(
          5,
          0.08,
          8,
          64
        ),
        this.materials.purple
      );

    ring2.position.y = 6;

    ring2.rotation.x =
      Math.PI / 2;

    core.add(ring2);

    this.animated.push({
      object: ring1,
      speed: 0.25
    });

    this.animated.push({
      object: ring2,
      speed: -0.18
    });

    this.textLabel(
      "AFTERLIGHT CORE",
      0,
      11,
      0,
      0.85
    );
  }

  buildMainHall() {
    const columns = [
      [-32, -32],
      [32, -32],
      [-32, 32],
      [32, 32],
      [-20, -32],
      [20, -32],
      [-20, 32],
      [20, 32]
    ];

    for (const [x, z] of columns) {
      this.box(
        x,
        6,
        z,
        1.4,
        12,
        1.4,
        this.materials.wall
      );

      this.box(
        x,
        7,
        z - 0.76,
        0.18,
        7,
        0.05,
        this.materials.neon
      );
    }

    this.box(
      0,
      13,
      -40,
      82,
      1.4,
      1.2,
      this.materials.wall
    );

    this.box(
      0,
      13,
      40,
      82,
      1.4,
      1.2,
      this.materials.wall
    );

    this.box(
      -40,
      13,
      0,
      1.2,
      1.4,
      82,
      this.materials.wall
    );

    this.box(
      40,
      13,
      0,
      1.2,
      1.4,
      82,
      this.materials.wall
    );
  }

  buildDining() {
    const group = new THREE.Group();

    group.position.set(
      -25,
      0,
      -22
    );

    this.root.add(group);

    this.textLabel(
      "DINING HALL",
      0,
      9,
      0,
      0.65
    ).position.x = -25;

    for (let i = -1; i <= 1; i++) {
      this.box(
        0,
        1.2,
        i * 5,
        13,
        0.5,
        2.3,
        this.materials.dark,
        group
      );

      for (let j = -2; j <= 2; j++) {
        this.box(
          j * 3,
          0.7,
          i * 5 + 2,
          1.3,
          1.4,
          1.3,
          this.materials.wall,
          group
        );

        this.box(
          j * 3,
          1.45,
          i * 5 + 2,
          1.4,
          0.12,
          0.15,
          this.materials.neon,
          group
        );
      }
    }

    this.addPlants(group, 4, 8);
  }

  buildLounge() {
    const group = new THREE.Group();

    group.position.set(
      24,
      0,
      -22
    );

    this.root.add(group);

    this.textLabel(
      "LOUNGE",
      24,
      9,
      -22,
      0.7
    );

    for (let i = -1; i <= 1; i++) {
      this.box(
        i * 5,
        1,
        0,
        4,
        1,
        2,
        this.materials.purple,
        group
      );

      this.box(
        i * 5,
        2,
        -0.8,
        4,
        1.5,
        0.5,
        this.materials.dark,
        group
      );
    }

    this.box(
      0,
      0.7,
      6,
      11,
      0.8,
      3,
      this.materials.glass,
      group
    );

    this.addPlants(group, -5, 5);
  }

  buildPowerStore() {
    const group = new THREE.Group();

    group.position.set(
      -25,
      0,
      22
    );

    this.root.add(group);

    this.textLabel(
      "POWER STORE",
      -25,
      9,
      22,
      0.7
    );

    for (let x = -6; x <= 6; x += 3) {
      this.box(
        x,
        2.5,
        0,
        2.1,
        5,
        1,
        this.materials.glass,
        group
      );

      this.box(
        x,
        2.5,
        -0.55,
        1.5,
        2.5,
        0.08,
        this.materials.neon,
        group
      );
    }
  }

  buildSocialRoom() {
    const group = new THREE.Group();

    group.position.set(
      25,
      0,
      22
    );

    this.root.add(group);

    this.textLabel(
      "SOCIAL ROOM",
      25,
      9,
      22,
      0.7
    );

    for (let i = 0; i < 6; i++) {
      const angle =
        (i / 6) * Math.PI * 2;

      const x =
        Math.cos(angle) * 7;

      const z =
        Math.sin(angle) * 7;

      this.cylinder(
        x,
        0.7,
        z,
        1.1,
        1.4,
        this.materials.dark,
        group
      );
    }

    this.cylinder(
      0,
      1,
      0,
      3,
      2,
      this.materials.glass,
      group
    );
  }

  buildChallengeArena() {
    const group = new THREE.Group();

    group.position.set(
      0,
      0,
      -30
    );

    this.root.add(group);

    this.textLabel(
      "CHALLENGE DECK",
      0,
      8,
      -30,
      0.8
    );

    this.box(
      0,
      0.2,
      0,
      32,
      0.4,
      15,
      this.materials.dark,
      group
    );

    for (let i = -5; i <= 5; i++) {
      const tile =
        this.box(
          i * 2.6,
          1,
          0,
          2.2,
          0.25,
          5,
          i % 2 === 0
            ? this.materials.neon
            : this.materials.purple,
          group
        );

      tile.material.transparent = true;
      tile.material.opacity = 0.45;
    }

    for (let x = -15; x <= 15; x += 5) {
      this.box(
        x,
        4,
        -6,
        0.5,
        8,
        0.5,
        this.materials.wall,
        group
      );
    }

    const orb =
      this.sphere(
        0,
        8,
        0,
        1.5,
        this.materials.neon,
        group
      );

    this.animated.push({
      object: orb,
      floating: true
    });
  }

  buildArchitecture() {
    for (let i = 0; i < 10; i++) {
      const angle =
        (i / 10) *
        Math.PI *
        2;

      const radius = 36;

      const x =
        Math.cos(angle) * radius;

      const z =
        Math.sin(angle) * radius;

      this.box(
        x,
        8,
        z,
        2,
        16,
        2,
        this.materials.wall
      );

      this.box(
        x,
        8,
        z - 1.05,
        0.08,
        11,
        0.05,
        this.materials.neon
      );
    }

    for (let i = 0; i < 6; i++) {
      const beam =
        this.box(
          0,
          12 + i * 0.35,
          0,
          75 - i * 5,
          0.15,
          1,
          this.materials.dark
        );

      beam.rotation.y =
        i % 2 === 0
          ? 0
          : Math.PI / 2;
    }
  }

  addPlants(parent, x, z) {
    for (let i = 0; i < 5; i++) {
      const group =
        new THREE.Group();

      group.position.set(
        x + i * 1.5,
        0,
        z + (i % 2) * 2
      );

      parent.add(group);

      this.cylinder(
        0,
        1,
        0,
        0.5,
        2,
        this.materials.green,
        group
      );

      for (let j = 0; j < 4; j++) {
        const leaf =
          this.sphere(
            (j - 1.5) * 0.35,
            2.3 + j * 0.25,
            0,
            0.45,
            this.materials.plant,
            group
          );

        leaf.scale.y = 1.5;
      }
    }
  }

  buildDecorations() {
    for (let i = 0; i < 12; i++) {
      const angle =
        Math.random() *
        Math.PI *
        2;

      const radius =
        15 +
        Math.random() * 22;

      const x =
        Math.cos(angle) * radius;

      const z =
        Math.sin(angle) * radius;

      const orb =
        this.sphere(
          x,
          3 + Math.random() * 5,
          z,
          0.18,
          this.materials.neon
        );

      this.animated.push({
        object: orb,
        floating: true,
        phase: Math.random() * 10
      });
    }
  }

  buildLights() {
    const ambient =
      new THREE.HemisphereLight(
        0x24445a,
        0x020409,
        1.2
      );

    this.root.add(ambient);

    const key =
      new THREE.DirectionalLight(
        0xc9f7ff,
        2.2
      );

    key.position.set(
      20,
      35,
      15
    );

    key.castShadow = true;

    key.shadow.mapSize.width = 1024;
    key.shadow.mapSize.height = 1024;

    key.shadow.camera.left = -45;
    key.shadow.camera.right = 45;
    key.shadow.camera.top = 45;
    key.shadow.camera.bottom = -45;

    this.root.add(key);

    const colors = [
      0x19e6ff,
      0x9d65ff,
      0x16d9b8,
      0x4e7cff
    ];

    for (let i = 0; i < 8; i++) {
      const angle =
        (i / 8) *
        Math.PI *
        2;

      const light =
        new THREE.PointLight(
          colors[i % colors.length],
          3,
          30
        );

      light.position.set(
        Math.cos(angle) * 25,
        7,
        Math.sin(angle) * 25
      );

      this.root.add(light);
    }
  }

  buildAtmosphere() {
    this.scene.background =
      new THREE.Color(0x02050a);

    this.scene.fog =
      new THREE.FogExp2(
        0x02050a,
        0.014
      );
  }

  update(time) {
    this.time = time;

    for (const item of this.animated) {
      if (!item.object) {
        continue;
      }

      if (item.speed) {
        item.object.rotation.y +=
          item.speed * 0.01;
      }

      if (item.floating) {
        const phase =
          item.phase || 0;

        item.object.position.y +=
          Math.sin(
            time * 0.001 + phase
          ) * 0.002;
      }
    }
  }

  dispose() {
    this.scene.remove(this.root);
  }
}
