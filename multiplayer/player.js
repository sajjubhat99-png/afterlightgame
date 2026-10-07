import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export class AfterlightPlayer {
  constructor(id, name = "Player", role = "Competitor", isLocal = false) {
    this.id = id;
    this.name = name || "Player";
    this.role = role || "Competitor";
    this.isLocal = isLocal;

    this.position = new THREE.Vector3();
    this.targetPosition = new THREE.Vector3();

    this.group = new THREE.Group();
    this.group.name = `player_${id}`;

    this.body = new THREE.Group();
    this.group.add(this.body);

    this.parts = {};
    this.walkTime = Math.random() * Math.PI * 2;
    this.lastPosition = this.position.clone();

    this.style = this.getCharacterStyle();

    this.buildCharacter();
    this.buildNameplate();
  }

  getCharacterStyle() {
    const roleStyles = {
      Champion: {
        skin: 0xb97958,
        hair: 0x17120f,
        suit: 0x172b42,
        accent: 0x4ce7ff,
        hairStyle: "short"
      },

      Strategist: {
        skin: 0xd19a78,
        hair: 0x211812,
        suit: 0x30294b,
        accent: 0xb98cff,
        hairStyle: "medium"
      },

      Leader: {
        skin: 0x9b6548,
        hair: 0x100d0b,
        suit: 0x183b37,
        accent: 0x48f0c5,
        hairStyle: "fade"
      },

      "Social Player": {
        skin: 0xd7a27e,
        hair: 0x342015,
        suit: 0x493126,
        accent: 0xffb45c,
        hairStyle: "long"
      },

      Ghost: {
        skin: 0x754a35,
        hair: 0x11100f,
        suit: 0x20262f,
        accent: 0x8295ff,
        hairStyle: "bob"
      },

      Cipher: {
        skin: 0xe0aa86,
        hair: 0x432719,
        suit: 0x263c4b,
        accent: 0x61dfff,
        hairStyle: "ponytail"
      },

      Observer: {
        skin: 0x9e694e,
        hair: 0x17100c,
        suit: 0x423228,
        accent: 0xff6e9d,
        hairStyle: "curly"
      },

      Tracker: {
        skin: 0xc78a68,
        hair: 0x2c1b14,
        suit: 0x253b2b,
        accent: 0x78ff75,
        hairStyle: "short"
      }
    };

    return roleStyles[this.role] || {
      skin: 0xc98b6b,
      hair: 0x161616,
      suit: 0x263b52,
      accent: 0x29d9ff,
      hairStyle: "short"
    };
  }

  mat(color, roughness = 0.55, metalness = 0.08) {
    return new THREE.MeshStandardMaterial({
      color,
      roughness,
      metalness
    });
  }

  addBox(name, size, material, position) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(size.x, size.y, size.z),
      material
    );

    mesh.name = name;
    mesh.position.copy(position);

    this.body.add(mesh);
    return mesh;
  }

  addSphere(name, radius, material, position, scale = null) {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 20, 14),
      material
    );

    mesh.name = name;
    mesh.position.copy(position);

    if (scale) mesh.scale.copy(scale);

    this.body.add(mesh);
    return mesh;
  }

  buildCharacter() {
    const s = this.style;

    const skin = this.mat(s.skin, 0.78, 0);
    const hair = this.mat(s.hair, 0.48, 0);
    const suit = this.mat(s.suit, 0.62, 0.08);
    const dark = this.mat(0x10151d, 0.45, 0.2);
    const accent = new THREE.MeshStandardMaterial({
      color: s.accent,
      emissive: s.accent,
      emissiveIntensity: 1.6,
      roughness: 0.3,
      metalness: 0.25
    });

    /*
      LEGS
    */

    const legMaterial = suit;

    const leftLeg = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.145, 0.65, 5, 10),
      legMaterial
    );

    const rightLeg = leftLeg.clone();

    leftLeg.position.set(-0.19, 0.42, 0);
    rightLeg.position.set(0.19, 0.42, 0);

    this.body.add(leftLeg);
    this.body.add(rightLeg);

    this.parts.leftLeg = leftLeg;
    this.parts.rightLeg = rightLeg;

    /*
      BOOTS
    */

    const leftBoot = this.addBox(
      "leftBoot",
      new THREE.Vector3(0.29, 0.16, 0.48),
      dark,
      new THREE.Vector3(-0.19, 0.02, 0.08)
    );

    const rightBoot = this.addBox(
      "rightBoot",
      new THREE.Vector3(0.29, 0.16, 0.48),
      dark,
      new THREE.Vector3(0.19, 0.02, 0.08)
    );

    /*
      WAIST
    */

    this.addBox(
      "waist",
      new THREE.Vector3(0.68, 0.22, 0.42),
      suit,
      new THREE.Vector3(0, 0.82, 0)
    );

    this.addBox(
      "belt",
      new THREE.Vector3(0.72, 0.055, 0.45),
      accent,
      new THREE.Vector3(0, 0.82, 0.01)
    );

    /*
      TORSO
    */

    const torso = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.43, 0.72, 6, 14),
      suit
    );

    torso.position.y = 1.32;
    torso.scale.z = 0.72;

    this.body.add(torso);
    this.parts.torso = torso;

    /*
      JACKET LAYERS
    */

    this.addBox(
      "chestCore",
      new THREE.Vector3(0.24, 0.34, 0.035),
      accent,
      new THREE.Vector3(0, 1.39, 0.34)
    );

    this.addBox(
      "chestDark",
      new THREE.Vector3(0.14, 0.22, 0.045),
      dark,
      new THREE.Vector3(0, 1.39, 0.365)
    );

    /*
      SHOULDERS
    */

    const shoulderGeometry = new THREE.SphereGeometry(
      0.22,
      14,
      10
    );

    const leftShoulder = new THREE.Mesh(
      shoulderGeometry,
      suit
    );

    const rightShoulder = new THREE.Mesh(
      shoulderGeometry,
      suit
    );

    leftShoulder.position.set(-0.48, 1.57, 0);
    rightShoulder.position.set(0.48, 1.57, 0);

    this.body.add(leftShoulder);
    this.body.add(rightShoulder);

    /*
      ARMS
    */

    const armGeometry = new THREE.CapsuleGeometry(
      0.105,
      0.58,
      5,
      9
    );

    const leftArm = new THREE.Mesh(
      armGeometry,
      suit
    );

    const rightArm = new THREE.Mesh(
      armGeometry,
      suit
    );

    leftArm.position.set(-0.55, 1.2, 0);
    rightArm.position.set(0.55, 1.2, 0);

    this.body.add(leftArm);
    this.body.add(rightArm);

    this.parts.leftArm = leftArm;
    this.parts.rightArm = rightArm;

    /*
      HANDS
    */

    this.addSphere(
      "leftHand",
      0.115,
      skin,
      new THREE.Vector3(-0.55, 0.82, 0)
    );

    this.addSphere(
      "rightHand",
      0.115,
      skin,
      new THREE.Vector3(0.55, 0.82, 0)
    );

    /*
      NECK
    */

    this.addBox(
      "neck",
      new THREE.Vector3(0.18, 0.22, 0.18),
      skin,
      new THREE.Vector3(0, 1.88, 0)
    );

    /*
      HEAD
    */

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.355, 24, 18),
      skin
    );

    head.position.y = 2.18;
    head.scale.set(0.92, 1.08, 0.9);

    this.body.add(head);
    this.parts.head = head;

    /*
      EARS
    */

    this.addSphere(
      "leftEar",
      0.07,
      skin,
      new THREE.Vector3(-0.34, 2.18, 0)
    );

    this.addSphere(
      "rightEar",
      0.07,
      skin,
      new THREE.Vector3(0.34, 2.18, 0)
    );

    /*
      EYES
    */

    const eyeMaterial = this.mat(0x090b10, 0.25, 0.05);

    this.addSphere(
      "leftEye",
      0.045,
      eyeMaterial,
      new THREE.Vector3(-0.12, 2.22, 0.335)
    );

    this.addSphere(
      "rightEye",
      0.045,
      eyeMaterial,
      new THREE.Vector3(0.12, 2.22, 0.335)
    );

    /*
      EYEBROWS
    */

    this.addBox(
      "leftBrow",
      new THREE.Vector3(0.10, 0.025, 0.025),
      hair,
      new THREE.Vector3(-0.12, 2.30, 0.34)
    );

    this.addBox(
      "rightBrow",
      new THREE.Vector3(0.10, 0.025, 0.025),
      hair,
      new THREE.Vector3(0.12, 2.30, 0.34)
    );

    /*
      NOSE
    */

    this.addSphere(
      "nose",
      0.045,
      skin,
      new THREE.Vector3(0, 2.13, 0.355),
      new THREE.Vector3(1, 1.2, 1.2)
    );

    /*
      MOUTH
    */

    this.addBox(
      "mouth",
      new THREE.Vector3(0.12, 0.018, 0.018),
      this.mat(0x552932, 0.8, 0),
      new THREE.Vector3(0, 2.02, 0.34)
    );

    /*
      HAIR
    */

    this.createHair();

    /*
      ROLE DEVICE
    */

    const device = this.addBox(
      "roleDevice",
      new THREE.Vector3(0.14, 0.19, 0.05),
      accent,
      new THREE.Vector3(0.34, 1.25, 0.29)
    );

    device.rotation.z = -0.15;

    /*
      WRIST LIGHT
    */

    const wristMaterial = new THREE.MeshStandardMaterial({
      color: s.accent,
      emissive: s.accent,
      emissiveIntensity: 2.5
    });

    this.addSphere(
      "wristLight",
      0.045,
      wristMaterial,
      new THREE.Vector3(-0.62, 0.93, 0)
    );

    /*
      LOCAL PLAYER RING
    */

    if (this.isLocal) {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.58, 0.64, 40),
        new THREE.MeshBasicMaterial({
          color: s.accent,
          transparent: true,
          opacity: 0.8,
          side: THREE.DoubleSide
        })
      );

      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.035;

      this.group.add(ring);
      this.parts.localRing = ring;
    }

    /*
      SHADOW
    */

    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.48, 28),
      new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.38,
        depthWrite: false
      })
    );

    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.025;

    this.group.add(shadow);
  }

  createHair() {
    const s = this.style;
    const hairMaterial = this.mat(s.hair, 0.45, 0);

    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(0.37, 20, 14),
      hairMaterial
    );

    cap.position.set(0, 2.33, -0.01);
    cap.scale.set(1, 0.62, 0.98);

    this.body.add(cap);

    if (s.hairStyle === "long") {
      for (const x of [-0.30, 0.30]) {
        const lock = new THREE.Mesh(
          new THREE.CapsuleGeometry(0.11, 0.52, 6, 9),
          hairMaterial
        );

        lock.position.set(x, 2.10, -0.02);
        this.body.add(lock);
      }
    }

    if (s.hairStyle === "ponytail") {
      const pony = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.12, 0.55, 6, 9),
        hairMaterial
      );

      pony.position.set(0, 2.08, -0.31);
      pony.rotation.x = -0.35;

      this.body.add(pony);
    }

    if (s.hairStyle === "curly") {
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * Math.PI * 2;

        const curl = new THREE.Mesh(
          new THREE.SphereGeometry(0.105, 10, 8),
          hairMaterial
        );

        curl.position.set(
          Math.cos(a) * 0.30,
          2.32 + Math.sin(i) * 0.035,
          Math.sin(a) * 0.25
        );

        this.body.add(curl);
      }
    }

    if (s.hairStyle === "fade") {
      cap.scale.set(0.95, 0.48, 0.9);
    }

    if (s.hairStyle === "bob") {
      cap.scale.set(1.04, 0.75, 1);
    }
  }

  buildNameplate() {
    const canvas = document.createElement("canvas");

    canvas.width = 512;
    canvas.height = 128;

    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, 512, 128);

    ctx.fillStyle = "rgba(4,10,17,0.88)";

    this.roundRect(ctx, 8, 8, 496, 112, 18);
    ctx.fill();

    ctx.strokeStyle = this.isLocal
      ? "#35e8ff"
      : "#496270";

    ctx.lineWidth = 4;

    this.roundRect(ctx, 8, 8, 496, 112, 18);
    ctx.stroke();

    ctx.textAlign = "center";

    ctx.font = "bold 31px Arial";
    ctx.fillStyle = "#ffffff";

    ctx.fillText(
      this.name.substring(0, 20),
      256,
      51
    );

    ctx.font = "20px Arial";
    ctx.fillStyle = this.isLocal
      ? "#35e8ff"
      : "#a9c5d4";

    ctx.fillText(
      this.role,
      256,
      82
    );

    if (this.isLocal) {
      ctx.font = "bold 16px Arial";
      ctx.fillStyle = "#ffffff";
      ctx.fillText("YOU", 256, 106);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    this.nameplate = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false
      })
    );

    this.nameplate.scale.set(2.4, 0.6, 1);
    this.nameplate.position.y = 3.03;

    this.group.add(this.nameplate);
  }

  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();

    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);

    ctx.quadraticCurveTo(
      x + width,
      y,
      x + width,
      y + radius
    );

    ctx.lineTo(
      x + width,
      y + height - radius
    );

    ctx.quadraticCurveTo(
      x + width,
      y + height,
      x + width - radius,
      y + height
    );

    ctx.lineTo(x + radius, y + height);

    ctx.quadraticCurveTo(
      x,
      y + height,
      x,
      y + height - radius
    );

    ctx.lineTo(x, y + radius);

    ctx.quadraticCurveTo(
      x,
      y,
      x + radius,
      y
    );

    ctx.closePath();
  }

  updateFromServer(data) {
    if (!data) return;

    if (
      typeof data.x === "number" &&
      typeof data.y === "number" &&
      typeof data.z === "number"
    ) {
      this.targetPosition.set(
        data.x,
        data.y,
        data.z
      );

      if (this.isLocal) {
        this.position.set(
          data.x,
          data.y,
          data.z
        );

        this.group.position.copy(
          this.position
        );
      }
    }
  }

  setLocalPosition(x, y, z) {
    this.position.set(x, y, z);
    this.targetPosition.copy(this.position);
    this.group.position.copy(this.position);
  }

  update(delta = 0.016) {
    if (!this.isLocal) {
      this.position.lerp(
        this.targetPosition,
        Math.min(1, delta * 10)
      );

      this.group.position.copy(
        this.position
      );
    }

    const movement =
      this.position.distanceTo(
        this.lastPosition
      );

    const moving = movement > 0.001;

    if (moving) {
      this.walkTime += delta * 10;

      const swing =
        Math.sin(this.walkTime) * 0.42;

      this.parts.leftArm.rotation.x = swing;
      this.parts.rightArm.rotation.x = -swing;

      this.parts.leftLeg.rotation.x = -swing;
      this.parts.rightLeg.rotation.x = swing;

      this.body.position.y =
        Math.abs(
          Math.sin(this.walkTime * 2)
        ) * 0.025;
    } else {
      this.walkTime += delta * 1.5;

      this.body.position.y =
        Math.sin(this.walkTime) * 0.012;

      this.parts.leftArm.rotation.x *= 0.9;
      this.parts.rightArm.rotation.x *= 0.9;

      this.parts.leftLeg.rotation.x *= 0.9;
      this.parts.rightLeg.rotation.x *= 0.9;
    }

    if (this.parts.localRing) {
      this.parts.localRing.rotation.z +=
        delta * 0.8;

      const pulse =
        1 +
        Math.sin(
          performance.now() * 0.004
        ) * 0.04;

      this.parts.localRing.scale.set(
        pulse,
        pulse,
        pulse
      );
    }

    this.lastPosition.copy(
      this.position
    );
  }

  remove() {
    this.group.traverse(object => {
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
    });

    if (this.group.parent) {
      this.group.parent.remove(
        this.group
      );
    }
  }
}
