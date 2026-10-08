import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const ROLE_STYLES = {
  Champion: {
    body: 0xb52d3b,
    accent: 0xffd15c,
    hair: 0x17191f
  },

  Strategist: {
    body: 0x315dff,
    accent: 0x6ee7ff,
    hair: 0x20242d
  },

  Leader: {
    body: 0x6938c7,
    accent: 0xf0b6ff,
    hair: 0x111318
  },

  "Social Player": {
    body: 0x0c9c83,
    accent: 0x72ffe4,
    hair: 0x202020
  },

  Ghost: {
    body: 0x344052,
    accent: 0x9caeff,
    hair: 0x0a0c10
  },

  Cipher: {
    body: 0x995b22,
    accent: 0xffd08a,
    hair: 0x17120d
  },

  Observer: {
    body: 0x26718c,
    accent: 0x7beaff,
    hair: 0x121a20
  },

  Tracker: {
    body: 0x596b2f,
    accent: 0xd8ff69,
    hair: 0x11160b
  }
};

export class AfterlightPlayer {
  constructor(data, local = false) {
    this.id = data.id;
    this.name = data.name || "Unknown";
    this.role = data.role || "Tracker";

    this.local = local;

    this.target = new THREE.Vector3(
      data.x || 0,
      data.y || 0,
      data.z || 0
    );

    this.velocity = new THREE.Vector3();

    this.group =
      new THREE.Group();

    this.group.name =
      `PLAYER_${this.id}`;

    this.group.position.copy(
      this.target
    );

    this.parts = {};

    this.walkTime = Math.random() * 10;

    this.buildCharacter();

    this.createNameplate();

    if (this.local) {
      this.createSelectionRing();
    }
  }

  buildCharacter() {
    const style =
      ROLE_STYLES[this.role] ||
      ROLE_STYLES.Tracker;

    const root =
      new THREE.Group();

    this.group.add(root);

    this.root = root;

    const bodyMat =
      new THREE.MeshStandardMaterial({
        color: style.body,
        metalness: 0.45,
        roughness: 0.35
      });

    const accentMat =
      new THREE.MeshStandardMaterial({
        color: style.accent,
        emissive: style.accent,
        emissiveIntensity: 0.35,
        metalness: 0.5,
        roughness: 0.25
      });

    const darkMat =
      new THREE.MeshStandardMaterial({
        color: 0x10151c,
        metalness: 0.75,
        roughness: 0.25
      });

    const skinMat =
      new THREE.MeshStandardMaterial({
        color: 0xd18f70,
        roughness: 0.65
      });

    const hairMat =
      new THREE.MeshStandardMaterial({
        color: style.hair,
        roughness: 0.45
      });

    this.parts.leftArm =
      this.limb(
        0.72,
        2.35,
        0,
        0.23,
        1.45,
        bodyMat
      );

    this.parts.rightArm =
      this.limb(
        -0.72,
        2.35,
        0,
        0.23,
        1.45,
        bodyMat
      );

    this.parts.leftLeg =
      this.limb(
        0.3,
        0.95,
        0,
        0.27,
        1.55,
        darkMat
      );

    this.parts.rightLeg =
      this.limb(
        -0.3,
        0.95,
        0,
        0.27,
        1.55,
        darkMat
      );

    const torso =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          1.25,
          1.7,
          0.65
        ),
        bodyMat
      );

    torso.position.y = 2.5;

    torso.castShadow = true;

    root.add(torso);

    this.parts.torso = torso;

    const chest =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.42,
          0.48,
          0.08
        ),
        accentMat
      );

    chest.position.set(
      0,
      2.55,
      0.36
    );

    root.add(chest);

    const neck =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.2,
          0.2,
          0.3,
          12
        ),
        skinMat
      );

    neck.position.y = 3.48;

    root.add(neck);

    const head =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.52,
          20,
          16
        ),
        skinMat
      );

    head.position.y = 4.05;

    head.scale.set(
      0.9,
      1.05,
      0.9
    );

    head.castShadow = true;

    root.add(head);

    this.parts.head = head;

    const hair =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.55,
          16,
          10,
          0,
          Math.PI * 2,
          0,
          Math.PI * 0.55
        ),
        hairMat
      );

    hair.position.y = 4.2;

    hair.scale.set(
      1,
      0.8,
      1
    );

    root.add(hair);

    const eyeMat =
      new THREE.MeshBasicMaterial({
        color: 0xc8faff
      });

    for (const side of [-1, 1]) {
      const eye =
        new THREE.Mesh(
          new THREE.SphereGeometry(
            0.055,
            8,
            8
          ),
          eyeMat
        );

      eye.position.set(
        side * 0.19,
        4.08,
        0.47
      );

      root.add(eye);
    }

    const belt =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          1.3,
          0.18,
          0.72
        ),
        darkMat
      );

    belt.position.y = 1.8;

    root.add(belt);

    const device =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.22,
          0.22,
          0.22
        ),
        accentMat
      );

    device.position.set(
      0.78,
      2.7,
      0.15
    );

    root.add(device);

    this.parts.device = device;

    const shoulderLeft =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.3,
          12,
          8
        ),
        accentMat
      );

    shoulderLeft.position.set(
      0.7,
      3.1,
      0
    );

    root.add(shoulderLeft);

    const shoulderRight =
      shoulderLeft.clone();

    shoulderRight.position.x =
      -0.7;

    root.add(shoulderRight);

    this.createBoot(
      0.3,
      0.12,
      darkMat
    );

    this.createBoot(
      -0.3,
      0.12,
      darkMat
    );

    if (this.role === "Ghost") {
      const hood =
        new THREE.Mesh(
          new THREE.SphereGeometry(
            0.7,
            16,
            12
          ),
          darkMat
        );

      hood.position.y = 3.9;

      hood.scale.set(
        1,
        1.15,
        0.9
      );

      hood.material.transparent = true;
      hood.material.opacity = 0.5;

      root.add(hood);
    }

    if (this.role === "Champion") {
      const crest =
        new THREE.Mesh(
          new THREE.ConeGeometry(
            0.16,
            0.5,
            8
          ),
          accentMat
        );

      crest.position.y = 4.75;

      root.add(crest);
    }

    if (this.role === "Cipher") {
      const visor =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            0.75,
            0.16,
            0.08
          ),
          accentMat
        );

      visor.position.set(
        0,
        4.08,
        0.48
      );

      root.add(visor);
    }
  }

  limb(
    x,
    y,
    z,
    radius,
    height,
    material
  ) {
    const group =
      new THREE.Group();

    group.position.set(
      x,
      y,
      z
    );

    const mesh =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          radius,
          radius,
          height,
          10
        ),
        material
      );

    mesh.position.y =
      -height / 2;

    mesh.castShadow = true;

    group.add(mesh);

    this.root.add(group);

    return group;
  }

  createBoot(x, y, material) {
    const boot =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.48,
          0.28,
          0.75
        ),
        material
      );

    boot.position.set(
      x,
      y,
      0.12
    );

    boot.castShadow = true;

    this.root.add(boot);
  }

  createSelectionRing() {
    const geometry =
      new THREE.RingGeometry(
        0.75,
        0.9,
        32
      );

    const material =
      new THREE.MeshBasicMaterial({
        color: 0x19e6ff,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide
      });

    this.ring =
      new THREE.Mesh(
        geometry,
        material
      );

    this.ring.rotation.x =
      -Math.PI / 2;

    this.ring.position.y =
      0.04;

    this.group.add(this.ring);
  }

  createNameplate() {
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

    ctx.fillStyle =
      "rgba(2,8,14,0.8)";

    ctx.roundRect(
      20,
      20,
      472,
      88,
      18
    );

    ctx.fill();

    ctx.font =
      "bold 32px Arial";

    ctx.textAlign =
      "center";

    ctx.fillStyle =
      "#d8fbff";

    ctx.fillText(
      this.name,
      256,
      57
    );

    ctx.font =
      "22px Arial";

    ctx.fillStyle =
      "#75eaff";

    ctx.fillText(
      this.role,
      256,
      88
    );

    const texture =
      new THREE.CanvasTexture(
        canvas
      );

    const material =
      new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthWrite: false
      });

    this.nameplate =
      new THREE.Sprite(material);

    this.nameplate.position.y =
      5.25;

    this.nameplate.scale.set(
      4.8,
      1.2,
      1
    );

    this.group.add(
      this.nameplate
    );
  }

  update(data, delta = 0.016) {
    if (data) {
      this.target.set(
        Number(data.x) || 0,
        Number(data.y) || 0,
        Number(data.z) || 0
      );
    }

    const distance =
      this.group.position.distanceTo(
        this.target
      );

    if (distance > 0.02) {
      this.group.position.lerp(
        this.target,
        Math.min(
          1,
          delta * 10
        )
      );

      this.walkTime +=
        delta * 9;

      const swing =
        Math.sin(
          this.walkTime
        ) * 0.55;

      this.parts.leftArm.rotation.x =
        swing;

      this.parts.rightArm.rotation.x =
        -swing;

      this.parts.leftLeg.rotation.x =
        -swing * 0.7;

      this.parts.rightLeg.rotation.x =
        swing * 0.7;
    } else {
      this.parts.leftArm.rotation.x =
        0;

      this.parts.rightArm.rotation.x =
        0;

      this.parts.leftLeg.rotation.x =
        0;

      this.parts.rightLeg.rotation.x =
        0;
    }

    if (this.ring) {
      this.ring.rotation.z +=
        delta * 0.5;

      this.ring.material.opacity =
        0.55 +
        Math.sin(
          this.walkTime * 2
        ) * 0.2;
    }

    if (this.parts.device) {
      this.parts.device.rotation.y +=
        delta * 2;
    }
  }

  setVisible(value) {
    this.group.visible = value;
  }

  remove() {
    if (
      this.group.parent
    ) {
      this.group.parent.remove(
        this.group
      );
    }
  }
}
