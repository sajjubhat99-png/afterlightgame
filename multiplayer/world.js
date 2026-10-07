import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export class AfterlightWorld {
  constructor(scene) {
    this.scene = scene;
    this.objects = [];
    this.animated = [];
    this.clock = new THREE.Clock();

    this.build();
  }

  material(color, options = {}) {
    return new THREE.MeshStandardMaterial({
      color,
      roughness: options.roughness ?? 0.55,
      metalness: options.metalness ?? 0.15,
      transparent: options.transparent ?? false,
      opacity: options.opacity ?? 1,
      emissive: options.emissive ?? 0x000000,
      emissiveIntensity: options.emissiveIntensity ?? 0
    });
  }

  add(mesh, animated = false) {
    this.scene.add(mesh);
    this.objects.push(mesh);

    if (animated) {
      this.animated.push(mesh);
    }

    return mesh;
  }

  box(name, x, y, z, sx, sy, sz, material) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(sx, sy, sz),
      material
    );

    mesh.name = name;
    mesh.position.set(x, y, z);

    return this.add(mesh);
  }

  cylinder(name, x, y, z, radius, height, material, segments = 32) {
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(
        radius,
        radius,
        height,
        segments
      ),
      material
    );

    mesh.name = name;
    mesh.position.set(x, y, z);

    return this.add(mesh);
  }

  sphere(name, x, y, z, radius, material) {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(
        radius,
        24,
        16
      ),
      material
    );

    mesh.name = name;
    mesh.position.set(x, y, z);

    return this.add(mesh);
  }

  build() {
    this.createMaterials();
    this.createFloor();
    this.createGrid();
    this.createWalls();
    this.createCeilingBeams();
    this.createCore();
    this.createZones();
    this.createChallengeDeck();
    this.createDoors();
    this.createHolograms();
    this.createEnergyObjects();
    this.createBalconies();
    this.createLights();
    this.createAtmosphere();
  }

  createMaterials() {
    this.floorMaterial = this.material(
      0x111923,
      {
        roughness: 0.32,
        metalness: 0.55
      }
    );

    this.darkMaterial = this.material(
      0x080d14,
      {
        roughness: 0.5,
        metalness: 0.45
      }
    );

    this.glassMaterial = this.material(
      0x193443,
      {
        roughness: 0.18,
        metalness: 0.45,
        transparent: true,
        opacity: 0.36
      }
    );

    this.cyanMaterial = this.material(
      0x25dfff,
      {
        roughness: 0.22,
        metalness: 0.35,
        emissive: 0x087f99,
        emissiveIntensity: 2.5
      }
    );

    this.blueMaterial = this.material(
      0x527cff,
      {
        roughness: 0.24,
        metalness: 0.3,
        emissive: 0x152f8c,
        emissiveIntensity: 2
      }
    );

    this.purpleMaterial = this.material(
      0x9a63ff,
      {
        roughness: 0.25,
        metalness: 0.3,
        emissive: 0x42188c,
        emissiveIntensity: 2
      }
    );

    this.whiteMaterial = this.material(
      0xcdeeff,
      {
        roughness: 0.25,
        metalness: 0.25,
        emissive: 0x326c80,
        emissiveIntensity: 0.8
      }
    );

    this.greenMaterial = this.material(
      0x43ffc0,
      {
        roughness: 0.25,
        metalness: 0.2,
        emissive: 0x0d8060,
        emissiveIntensity: 2
      }
    );
  }

  createFloor() {
    this.box(
      "MainFloor",
      0,
      -0.35,
      0,
      86,
      0.7,
      86,
      this.floorMaterial
    );

    const innerFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(78, 78),
      this.material(
        0x0d151f,
        {
          roughness: 0.28,
          metalness: 0.5
        }
      )
    );

    innerFloor.rotation.x = -Math.PI / 2;
    innerFloor.position.y = 0.02;

    this.add(innerFloor);
  }

  createGrid() {
    const grid = new THREE.GridHelper(
      78,
      39,
      0x1d6072,
      0x17313c
    );

    grid.position.y = 0.045;

    this.add(grid);

    const innerRing = new THREE.Mesh(
      new THREE.RingGeometry(
        13,
        13.15,
        96
      ),
      new THREE.MeshBasicMaterial({
        color: 0x25dfff,
        transparent: true,
        opacity: 0.65,
        side: THREE.DoubleSide
      })
    );

    innerRing.rotation.x = -Math.PI / 2;
    innerRing.position.y = 0.07;

    this.add(innerRing);

    this.animated.push(innerRing);
  }

  createWalls() {
    const wallHeight = 12;

    this.box(
      "NorthWall",
      0,
      wallHeight / 2,
      -43,
      86,
      wallHeight,
      0.7,
      this.darkMaterial
    );

    this.box(
      "SouthWall",
      0,
      wallHeight / 2,
      43,
      86,
      wallHeight,
      0.7,
      this.darkMaterial
    );

    this.box(
      "EastWall",
      43,
      wallHeight / 2,
      0,
      0.7,
      wallHeight,
      86,
      this.darkMaterial
    );

    this.box(
      "WestWall",
      -43,
      wallHeight / 2,
      0,
      0.7,
      wallHeight,
      86,
      this.darkMaterial
    );

    /*
      GLASS SECTIONS
    */

    for (const x of [-32, -18, 18, 32]) {
      this.box(
        `NorthGlass_${x}`,
        x,
        5,
        -42.55,
        10,
        9,
        0.08,
        this.glassMaterial
      );

      this.box(
        `SouthGlass_${x}`,
        x,
        5,
        42.55,
        10,
        9,
        0.08,
        this.glassMaterial
      );
    }

    for (const z of [-32, -18, 18, 32]) {
      this.box(
        `EastGlass_${z}`,
        42.55,
        5,
        z,
        0.08,
        9,
        10,
        this.glassMaterial
      );

      this.box(
        `WestGlass_${z}`,
        -42.55,
        5,
        z,
        0.08,
        9,
        10,
        this.glassMaterial
      );
    }
  }

  createCeilingBeams() {
    const beamMaterial = this.material(
      0x182733,
      {
        roughness: 0.35,
        metalness: 0.65
      }
    );

    for (const x of [-30, -15, 0, 15, 30]) {
      this.box(
        `CeilingBeamX_${x}`,
        x,
        11.2,
        0,
        0.35,
        0.35,
        82,
        beamMaterial
      );
    }

    for (const z of [-30, -15, 0, 15, 30]) {
      this.box(
        `CeilingBeamZ_${z}`,
        0,
        11.4,
        z,
        82,
        0.35,
        0.35,
        beamMaterial
      );
    }

    /*
      VERTICAL ARCHITECTURE
    */

    for (const x of [-38, -26, -14, 14, 26, 38]) {
      for (const z of [-38, 38]) {
        this.createTower(x, z);
      }
    }

    for (const z of [-26, -14, 14, 26]) {
      for (const x of [-38, 38]) {
        this.createTower(x, z);
      }
    }
  }

  createTower(x, z) {
    const tower = this.box(
      "FacilityTower",
      x,
      5,
      z,
      1.4,
      10,
      1.4,
      this.darkMaterial
    );

    const light = this.box(
      "TowerLight",
      x,
      5,
      z - 0.72,
      0.12,
      7,
      0.05,
      this.cyanMaterial
    );

    this.animated.push(light);

    return tower;
  }

  createCore() {
    /*
      CENTRAL PLATFORM
    */

    this.cylinder(
      "CorePlatform",
      0,
      0.15,
      0,
      7.2,
      0.3,
      this.darkMaterial,
      96
    );

    /*
      CORE BODY
    */

    const core = this.sphere(
      "AFTERLIGHT_CORE",
      0,
      3.2,
      0,
      2.4,
      this.cyanMaterial
    );

    this.animated.push(core);

    /*
      INNER CORE
    */

    const inner = this.sphere(
      "CoreInner",
      0,
      3.2,
      0,
      1.25,
      this.whiteMaterial
    );

    this.animated.push(inner);

    /*
      ORBIT RINGS
    */

    for (let i = 0; i < 4; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(
          3.1 + i * 0.45,
          0.035,
          8,
          96
        ),
        i % 2 === 0
          ? this.cyanMaterial
          : this.purpleMaterial
      );

      ring.position.y = 3.2;
      ring.rotation.x =
        Math.PI / 2 + i * 0.3;
      ring.rotation.z = i * 0.6;

      this.add(
        ring,
        true
      );
    }

    /*
      CORE PILLARS
    */

    for (let i = 0; i < 8; i++) {
      const a =
        (i / 8) *
        Math.PI *
        2;

      const x = Math.cos(a) * 5;
      const z = Math.sin(a) * 5;

      this.box(
        "CorePillar",
        x,
        2,
        z,
        0.25,
        4,
        0.25,
        this.cyanMaterial
      );
    }

    /*
      CORE LIGHT
    */

    const point = new THREE.PointLight(
      0x28dfff,
      5,
      25
    );

    point.position.set(
      0,
      4,
      0
    );

    this.add(point);
  }

  createZones() {
    this.createDiningHall();
    this.createLounge();
    this.createPowerStore();
    this.createSocialRoom();
    this.createAnnouncementRoom();
  }

  createDiningHall() {
    const x = -27;
    const z = -25;

    this.createZoneStructure(
      "DINING HALL",
      x,
      z,
      this.greenMaterial
    );

    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 3; col++) {
        const px =
          x - 4 + col * 4;

        const pz =
          z - 2 + row * 4;

        this.box(
          "DiningTable",
          px,
          1,
          pz,
          2.6,
          0.2,
          1.4,
          this.darkMaterial
        );

        for (const side of [-1, 1]) {
          this.box(
            "DiningSeat",
            px,
            0.45,
            pz + side * 1.1,
            1,
            0.35,
            0.55,
            this.greenMaterial
          );
        }
      }
    }
  }

  createLounge() {
    const x = 27;
    const z = -25;

    this.createZoneStructure(
      "LOUNGE",
      x,
      z,
      this.purpleMaterial
    );

    for (let i = 0; i < 4; i++) {
      this.box(
        "LoungeSeat",
        x - 3 + (i % 2) * 6,
        0.65,
        z - 2 + Math.floor(i / 2) * 4,
        2.8,
        0.7,
        1.2,
        this.purpleMaterial
      );
    }

    for (let i = 0; i < 3; i++) {
      this.sphere(
        "LoungeLight",
        x - 4 + i * 4,
        3,
        z + 3,
        0.22,
        this.purpleMaterial
      );
    }
  }

  createPowerStore() {
    const x = -27;
    const z = 25;

    this.createZoneStructure(
      "POWER STORE",
      x,
      z,
      this.cyanMaterial
    );

    for (let i = 0; i < 6; i++) {
      const px =
        x - 5 + (i % 3) * 5;

      const pz =
        z - 2 + Math.floor(i / 3) * 4;

      this.box(
        "PowerPod",
        px,
        1.2,
        pz,
        1.5,
        2.1,
        1,
        this.darkMaterial
      );

      this.box(
        "PowerPodLight",
        px,
        1.2,
        pz - 0.53,
        0.75,
        0.12,
        0.04,
        this.cyanMaterial
      );
    }
  }

  createSocialRoom() {
    const x = 27;
    const z = 25;

    this.createZoneStructure(
      "SOCIAL ROOM",
      x,
      z,
      this.blueMaterial
    );

    this.cylinder(
      "SocialTable",
      x,
      0.85,
      z,
      3,
      0.25,
      this.darkMaterial,
      48
    );

    for (let i = 0; i < 8; i++) {
      const a =
        (i / 8) *
        Math.PI *
        2;

      this.box(
        "SocialSeat",
        x + Math.cos(a) * 4,
        0.5,
        z + Math.sin(a) * 4,
        1.1,
        0.4,
        1.1,
        this.blueMaterial
      );
    }
  }

  createAnnouncementRoom() {
    const x = 0;
    const z = -35;

    this.box(
      "AnnouncementWall",
      x,
      4.2,
      z,
      16,
      8,
      0.5,
      this.darkMaterial
    );

    this.box(
      "AnnouncementScreen",
      x,
      4.5,
      z - 0.3,
      10,
      5,
      0.08,
      this.glassMaterial
    );

    for (const xPos of [-5, 0, 5]) {
      this.box(
        "AnnouncementLight",
        xPos,
        1.2,
        z - 0.6,
        0.12,
        5,
        0.05,
        this.cyanMaterial
      );
    }
  }

  createZoneStructure(label, x, z, accentMaterial) {
    /*
      PLATFORM
    */

    this.box(
      `${label}_Platform`,
      x,
      0.1,
      z,
      14,
      0.2,
      13,
      this.darkMaterial
    );

    /*
      BACK WALL
    */

    this.box(
      `${label}_BackWall`,
      x,
      3.2,
      z - 6,
      14,
      6,
      0.25,
      this.darkMaterial
    );

    /*
      SIDE WALLS
    */

    this.box(
      `${label}_LeftWall`,
      x - 7,
      3.2,
      z,
      0.25,
      6,
      12,
      this.darkMaterial
    );

    this.box(
      `${label}_RightWall`,
      x + 7,
      3.2,
      z,
      0.25,
      6,
      12,
      this.darkMaterial
    );

    /*
      TOP LIGHT
    */

    this.box(
      `${label}_TopLight`,
      x,
      6.25,
      z - 5.82,
      9,
      0.08,
      0.08,
      accentMaterial
    );

    /*
      ENTRANCE
    */

    this.box(
      `${label}_EntranceLeft`,
      x - 2.4,
      2.5,
      z + 6,
      0.25,
      5,
      0.25,
      accentMaterial
    );

    this.box(
      `${label}_EntranceRight`,
      x + 2.4,
      2.5,
      z + 6,
      0.25,
      5,
      0.25,
      accentMaterial
    );
  }

  createChallengeDeck() {
    const platform = this.cylinder(
      "ChallengeDeck",
      0,
      0.25,
      22,
      10,
      0.5,
      this.darkMaterial,
      96
    );

    /*
      RINGS
    */

    for (const radius of [6, 7, 8, 9]) {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(
          radius,
          radius + 0.05,
          96
        ),
        this.cyanMaterial
      );

      ring.rotation.x = -Math.PI / 2;
      ring.position.set(
        0,
        0.53,
        22
      );

      this.add(
        ring,
        true
      );
    }

    /*
      CHALLENGE PILLARS
    */

    for (let i = 0; i < 8; i++) {
      const a =
        (i / 8) *
        Math.PI *
        2;

      const x =
        Math.cos(a) * 8;

      const z =
        22 +
        Math.sin(a) * 8;

      this.box(
        "ChallengePillar",
        x,
        2.5,
        z,
        0.45,
        5,
        0.45,
        this.blueMaterial
      );
    }

    /*
      FLOATING CENTER
    */

    const orb = this.sphere(
      "ChallengeOrb",
      0,
      4,
      22,
      0.7,
      this.cyanMaterial
    );

    this.animated.push(orb);
  }

  createDoors() {
    const doors = [
      {
        x: 0,
        z: -41.8,
        label: "MAIN"
      },
      {
        x: -41.8,
        z: 0,
        label: "WEST"
      },
      {
        x: 41.8,
        z: 0,
        label: "EAST"
      },
      {
        x: 0,
        z: 41.8,
        label: "EXIT"
      }
    ];

    for (const door of doors) {
      const vertical =
        Math.abs(door.x) > 40;

      const width = 5;
      const height = 7;

      if (vertical) {
        this.box(
          `${door.label}_DoorLeft`,
          door.x,
          height / 2,
          door.z - width / 2,
          0.35,
          height,
          2.3,
          this.glassMaterial
        );

        this.box(
          `${door.label}_DoorRight`,
          door.x,
          height / 2,
          door.z + width / 2,
          0.35,
          height,
          2.3,
          this.glassMaterial
        );
      } else {
        this.box(
          `${door.label}_DoorLeft`,
          door.x - width / 2,
          height / 2,
          door.z,
          2.3,
          height,
          0.35,
          this.glassMaterial
        );

        this.box(
          `${door.label}_DoorRight`,
          door.x + width / 2,
          height / 2,
          door.z,
          2.3,
          height,
          0.35,
          this.glassMaterial
        );
      }
    }
  }

  createHolograms() {
    this.createLabel(
      "AFTERLIGHT",
      0,
      7.8,
      0,
      3.2,
      0x35e8ff
    );

    this.createLabel(
      "DINING",
      -27,
      7,
      -31,
      1.2,
      0x43ffc0
    );

    this.createLabel(
      "LOUNGE",
      27,
      7,
      -31,
      1.2,
      0x9a63ff
    );

    this.createLabel(
      "POWER STORE",
      -27,
      7,
      19,
      1.1,
      0x25dfff
    );

    this.createLabel(
      "SOCIAL",
      27,
      7,
      19,
      1.2,
      0x527cff
    );

    this.createLabel(
      "CHALLENGE",
      0,
      7,
      31,
      1.2,
      0x25dfff
    );
  }

  createLabel(text, x, y, z, size, color) {
    const canvas =
      document.createElement("canvas");

    canvas.width = 512;
    canvas.height = 128;

    const ctx =
      canvas.getContext("2d");

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.font =
      `bold ${Math.floor(size * 14)}px Arial`;

    ctx.fillStyle =
      "#ffffff";

    ctx.shadowColor =
      "#" + color.toString(16).padStart(6, "0");

    ctx.shadowBlur = 20;

    ctx.fillText(
      text,
      256,
      64
    );

    const texture =
      new THREE.CanvasTexture(canvas);

    const sprite =
      new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: texture,
          transparent: true,
          depthTest: false
        })
      );

    sprite.position.set(
      x,
      y,
      z
    );

    sprite.scale.set(
      size * 2.6,
      size * 0.65,
      1
    );

    this.add(sprite);
  }

  createEnergyObjects() {
    for (let i = 0; i < 18; i++) {
      const angle =
        (i / 18) *
        Math.PI *
        2;

      const radius =
        14 +
        (i % 3) * 3;

      const orb = this.sphere(
        "EnergyOrb",
        Math.cos(angle) * radius,
        1.2 + (i % 4) * 0.55,
        Math.sin(angle) * radius,
        0.12 + (i % 3) * 0.04,
        i % 2 === 0
          ? this.cyanMaterial
          : this.purpleMaterial
      );

      orb.userData.baseY =
        orb.position.y;

      orb.userData.phase =
        Math.random() * Math.PI * 2;

      this.animated.push(orb);
    }
  }

  createBalconies() {
    const balconyMaterial =
      this.material(
        0x172632,
        {
          roughness: 0.3,
          metalness: 0.7
        }
      );

    for (const side of [-1, 1]) {
      this.box(
        "UpperBalcony",
        side * 31,
        5.8,
        0,
        5,
        0.35,
        24,
        balconyMaterial
      );

      this.box(
        "BalconyRail",
        side * 31,
        6.5,
        0,
        0.15,
        1.3,
        24,
        this.cyanMaterial
      );
    }

    for (const z of [-31, 31]) {
      this.box(
        "UpperBalcony",
        0,
        5.8,
        z,
        24,
        0.35,
        5,
        balconyMaterial
      );

      this.box(
        "BalconyRail",
        0,
        6.5,
        z,
        24,
        1.3,
        0.15,
        this.cyanMaterial
      );
    }
  }

  createLights() {
    const ambient =
      new THREE.HemisphereLight(
        0x7edfff,
        0x05070c,
        1.5
      );

    this.add(ambient);

    const main =
      new THREE.DirectionalLight(
        0xa9eaff,
        2
      );

    main.position.set(
      0,
      18,
      8
    );

    main.castShadow = false;

    this.add(main);

    const cyanLight =
      new THREE.PointLight(
        0x25dfff,
        3,
        40
      );

    cyanLight.position.set(
      -20,
      5,
      -20
    );

    this.add(cyanLight);

    const purpleLight =
      new THREE.PointLight(
        0x9a63ff,
        3,
        40
      );

    purpleLight.position.set(
      20,
      5,
      -20
    );

    this.add(purpleLight);

    const blueLight =
      new THREE.PointLight(
        0x527cff,
        3,
        40
      );

    blueLight.position.set(
      20,
      5,
      20
    );

    this.add(blueLight);

    const greenLight =
      new THREE.PointLight(
        0x43ffc0,
        3,
        40
      );

    greenLight.position.set(
      -20,
      5,
      20
    );

    this.add(greenLight);
  }

  createAtmosphere() {
    this.scene.background =
      new THREE.Color(
        0x03070c
      );

    this.scene.fog =
      new THREE.FogExp2(
        0x03070c,
        0.012
      );

    /*
      STAR PARTICLES
    */

    const geometry =
      new THREE.BufferGeometry();

    const count = 500;

    const positions =
      new Float32Array(
        count * 3
      );

    for (let i = 0; i < count; i++) {
      positions[i * 3] =
        (Math.random() - 0.5) * 100;

      positions[i * 3 + 1] =
        Math.random() * 18 + 2;

      positions[i * 3 + 2] =
        (Math.random() - 0.5) * 100;
    }

    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(
        positions,
        3
      )
    );

    const particles =
      new THREE.Points(
        geometry,
        new THREE.PointsMaterial({
          color: 0x8deaff,
          size: 0.045,
          transparent: true,
          opacity: 0.65
        })
      );

    this.add(
      particles,
      true
    );
  }

  update() {
    const time =
      this.clock.getElapsedTime();

    /*
      CORE / RINGS
    */

    for (
      let i = 0;
      i < this.animated.length;
      i++
    ) {
      const object =
        this.animated[i];

      if (
        object.name ===
        "AFTERLIGHT_CORE"
      ) {
        object.scale.setScalar(
          1 +
          Math.sin(time * 2) * 0.05
        );
      }

      if (
        object.name ===
        "CoreInner"
      ) {
        object.rotation.y =
          time * 0.7;

        object.scale.setScalar(
          1 +
          Math.sin(time * 3) * 0.08
        );
      }

      if (
        object.name ===
        "ChallengeOrb"
      ) {
        object.position.y =
          4 +
          Math.sin(time * 2) * 0.35;

        object.rotation.y =
          time;
      }

      if (
        object.name ===
        "EnergyOrb"
      ) {
        object.position.y =
          object.userData.baseY +
          Math.sin(
            time * 2 +
            object.userData.phase
          ) * 0.3;

        object.rotation.y =
          time * 1.5;
      }

      if (
        object.name ===
        "TowerLight"
      ) {
        object.material.emissiveIntensity =
          1.4 +
          Math.sin(
            time * 3
          ) * 0.7;
      }
    }
  }

  dispose() {
    for (const object of this.objects) {
      if (object.geometry) {
        object.geometry.dispose();
      }

      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(
            material => material.dispose()
          );
        } else {
          object.material.dispose();
        }
      }
    }

    this.objects.length = 0;
    this.animated.length = 0;
  }
}
