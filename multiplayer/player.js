import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export class AfterlightPlayer {
  constructor(id, name = "Player", role = "Competitor", isLocal = false) {
    this.id = id;
    this.name = name || "Player";
    this.role = role || "Competitor";
    this.isLocal = isLocal;

    this.position = new THREE.Vector3(0, 0, 0);
    this.targetPosition = new THREE.Vector3(0, 0, 0);

    this.group = new THREE.Group();
    this.group.name = `player_${this.id}`;

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
    const styles = [
      {
        gender: "male",
        skin: 0xc98b6b,
        hair: 0x161616,
        suit: 0x263b52,
        accent: 0x29d9ff,
        shoes: 0x11151b,
        hairStyle: "short"
      },
      {
        gender: "female",
        skin: 0xd99a78,
        hair: 0x21150f,
        suit: 0x402f55,
        accent: 0xff58d0,
        shoes: 0x141018,
        hairStyle: "long"
      },
      {
        gender: "male",
        skin: 0x9b6549,
        hair: 0x090909,
        suit: 0x193d39,
        accent: 0x46ffd4,
        shoes: 0x101514,
        hairStyle: "fade"
      },
      {
        gender: "female",
        skin: 0xb87955,
        hair: 0x321d16,
        suit: 0x473b24,
        accent: 0xffc857,
        shoes: 0x17140e,
        hairStyle: "ponytail"
      },
      {
        gender: "male",
        skin: 0xe0aa86,
        hair: 0x3b2416,
        suit: 0x29334b,
        accent: 0x7895ff,
        shoes: 0x11131b,
        hairStyle: "medium"
      },
      {
        gender: "female",
        skin: 0x75462f,
        hair: 0x120c0b,
        suit: 0x452f32,
        accent: 0xff6f91,
        shoes: 0x160e10,
        hairStyle: "bob"
      },
      {
        gender: "male",
        skin: 0x6e432e,
        hair: 0x21130d,
        suit: 0x283d29,
        accent: 0x7dff67,
        shoes: 0x101510,
        hairStyle: "curly"
      },
      {
        gender: "female",
        skin: 0xe0a982,
        hair: 0x56331d,
        suit: 0x303b54,
        accent: 0x68a7ff,
        shoes: 0x10141b,
        hairStyle: "long"
      }
    ];

    let hash = 0;

    for (let i = 0; i < this.id.length; i++) {
      hash = ((hash << 5) - hash) + this.id.charCodeAt(i);
      hash |= 0;
    }

    return styles[Math.abs(hash) % styles.length];
  }

  material(color, roughness = 0.65, metalness = 0.05) {
    return new THREE.MeshStandardMaterial({
      color,
      roughness,
      metalness
    });
  }

  createBox(name, size, color, position) {
    const geometry = new THREE.BoxGeometry(
      size.x,
      size.y,
      size.z
    );

    const mesh = new THREE.Mesh(
      geometry,
      this.material(color)
    );

    mesh.name = name;
    mesh.position.copy(position);

    this.body.add(mesh);

    return mesh;
  }

  createSphere(name, radius, color, position, scale = null) {
    const geometry = new THREE.SphereGeometry(
      radius,
      16,
      12
    );

    const mesh = new THREE.Mesh(
      geometry,
      this.material(color)
    );

    mesh.name = name;
    mesh.position.copy(position);

    if (scale) {
      mesh.scale.copy(scale);
    }

    this.body.add(mesh);

    return mesh;
  }

  buildCharacter() {
    const s = this.style;

    const skin = this.material(s.skin, 0.8, 0);
    const hair = this.material(s.hair, 0.5, 0);
    const suit = this.material(s.suit, 0.62, 0.1);
    const accent = this.material(s.accent, 0.35, 0.25);
    const shoes = this.material(s.shoes, 0.5, 0.15);

    /*
      BODY
    */

    const torsoGeometry = new THREE.CapsuleGeometry(
      s.gender === "female" ? 0.43 : 0.46,
      0.85,
      6,
      12
    );

    const torso = new THREE.Mesh(
      torsoGeometry,
      suit
    );

    torso.position.y = 1.25;
    torso.scale.z = 0.72;

    this.body.add(torso);
    this.parts.torso = torso;

    /*
      NECK
    */

    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.13,
        0.15,
        0.22,
        12
      ),
      skin
    );

    neck.position.y = 1.84;

    this.body.add(neck);

    /*
      HEAD
    */

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(
        0.36,
        20,
        16
      ),
      skin
    );

    head.position.y = 2.17;
    head.scale.set(
      0.92,
      1.08,
      0.92
    );

    this.body.add(head);
    this.parts.head = head;

    /*
      EARS
    */

    const earGeometry = new THREE.SphereGeometry(
      0.075,
      10,
      8
    );

    const leftEar = new THREE.Mesh(
      earGeometry,
      skin
    );

    const rightEar = new THREE.Mesh(
      earGeometry,
      skin
    );

    leftEar.position.set(
      -0.345,
      2.18,
      0
    );

    rightEar.position.set(
      0.345,
      2.18,
      0
    );

    this.body.add(leftEar);
    this.body.add(rightEar);

    /*
      EYES
    */

    const eyeMaterial = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.3
    });

    const eyeGeometry = new THREE.SphereGeometry(
      0.045,
      8,
      8
    );

    const leftEye = new THREE.Mesh(
      eyeGeometry,
      eyeMaterial
    );

    const rightEye = new THREE.Mesh(
      eyeGeometry,
      eyeMaterial
    );

    leftEye.position.set(
      -0.125,
      2.22,
      0.335
    );

    rightEye.position.set(
      0.125,
      2.22,
      0.335
    );

    this.body.add(leftEye);
    this.body.add(rightEye);

    /*
      NOSE
    */

    const nose = new THREE.Mesh(
      new THREE.ConeGeometry(
        0.045,
        0.12,
        8
      ),
      skin
    );

    nose.rotation.x = Math.PI / 2;

    nose.position.set(
      0,
      2.13,
      0.36
    );

    this.body.add(nose);

    /*
      MOUTH
    */

    const mouth = new THREE.Mesh(
      new THREE.BoxGeometry(
        0.13,
        0.025,
        0.025
      ),
      this.material(0x592d35, 0.8, 0)
    );

    mouth.position.set(
      0,
      2.03,
      0.345
    );

    this.body.add(mouth);

    /*
      HAIR
    */

    this.createHair();

    /*
      SHOULDERS
    */

    const shoulderGeometry = new THREE.SphereGeometry(
      0.22,
      12,
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

    leftShoulder.position.set(
      -0.5,
      1.55,
      0
    );

    rightShoulder.position.set(
      0.5,
      1.55,
      0
    );

    this.body.add(leftShoulder);
    this.body.add(rightShoulder);

    /*
      ARMS
    */

    const armGeometry = new THREE.CapsuleGeometry(
      0.115,
      0.63,
      5,
      8
    );

    const leftArm = new THREE.Mesh(
      armGeometry,
      suit
    );

    const rightArm = new THREE.Mesh(
      armGeometry,
      suit
    );

    leftArm.position.set(
      -0.56,
      1.2,
      0
    );

    rightArm.position.set(
      0.56,
      1.2,
      0
    );

    this.body.add(leftArm);
    this.body.add(rightArm);

    this.parts.leftArm = leftArm;
    this.parts.rightArm = rightArm;

    /*
      HANDS
    */

    const handGeometry = new THREE.SphereGeometry(
      0.12,
      12,
      8
    );

    const leftHand = new THREE.Mesh(
      handGeometry,
      skin
    );

    const rightHand = new THREE.Mesh(
      handGeometry,
      skin
    );

    leftHand.position.set(
      -0.56,
      0.79,
      0
    );

    rightHand.position.set(
      0.56,
      0.79,
      0
    );

    this.body.add(leftHand);
    this.body.add(rightHand);

    /*
      WAIST
    */

    const waist = new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.35,
        0.4,
        0.22,
        12
      ),
      suit
    );

    waist.position.y = 0.78;

    this.body.add(waist);

    /*
      LEGS
    */

    const legGeometry = new THREE.CapsuleGeometry(
      0.15,
      0.72,
      5,
      8
    );

    const leftLeg = new THREE.Mesh(
      legGeometry,
      suit
    );

    const rightLeg = new THREE.Mesh(
      legGeometry,
      suit
    );

    leftLeg.position.set(
      -0.21,
      0.35,
      0
    );

    rightLeg.position.set(
      0.21,
      0.35,
      0
    );

    this.body.add(leftLeg);
    this.body.add(rightLeg);

    this.parts.leftLeg = leftLeg;
    this.parts.rightLeg = rightLeg;

    /*
      SHOES
    */

    const shoeGeometry = new THREE.BoxGeometry(
      0.28,
      0.16,
      0.48
    );

    const leftShoe = new THREE.Mesh(
      shoeGeometry,
      shoes
    );

    const rightShoe = new THREE.Mesh(
      shoeGeometry,
      shoes
    );

    leftShoe.position.set(
      -0.21,
      -0.04,
      0.08
    );

    rightShoe.position.set(
      0.21,
      -0.04,
      0.08
    );

    this.body.add(leftShoe);
    this.body.add(rightShoe);

    /*
      FUTURISTIC CHEST PANEL
    */

    const chestPanel = new THREE.Mesh(
      new THREE.BoxGeometry(
        0.28,
        0.36,
        0.035
      ),
      accent
    );

    chestPanel.position.set(
      0,
      1.36,
      0.34
    );

    this.body.add(chestPanel);

    /*
      WAIST LIGHT
    */

    const belt = new THREE.Mesh(
      new THREE.BoxGeometry(
        0.68,
        0.06,
        0.42
      ),
      accent
    );

    belt.position.y = 0.83;

    this.body.add(belt);

    /*
      SHOULDER LIGHTS
    */

    const shoulderLightGeometry =
      new THREE.SphereGeometry(
        0.055,
        10,
        8
      );

    const lightMaterial =
      new THREE.MeshStandardMaterial({
        color: s.accent,
        emissive: s.accent,
        emissiveIntensity: 2
      });

    const leftLight = new THREE.Mesh(
      shoulderLightGeometry,
      lightMaterial
    );

    const rightLight = new THREE.Mesh(
      shoulderLightGeometry,
      lightMaterial
    );

    leftLight.position.set(
      -0.52,
      1.58,
      0.16
    );

    rightLight.position.set(
      0.52,
      1.58,
      0.16
    );

    this.body.add(leftLight);
    this.body.add(rightLight);

    /*
      LOCAL PLAYER GLOW
    */

    if (this.isLocal) {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(
          0.58,
          0.64,
          32
        ),
        new THREE.MeshBasicMaterial({
          color: s.accent,
          transparent: true,
          opacity: 0.75,
          side: THREE.DoubleSide
        })
      );

      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.03;

      this.group.add(ring);
      this.parts.localRing = ring;
    }

    /*
      PLAYER SHADOW
    */

    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(
        0.48,
        24
      ),
      new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.35,
        depthWrite: false
      })
    );

    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;

    this.group.add(shadow);
  }

  createHair() {
    const s = this.style;

    const hairMaterial = this.material(
      s.hair,
      0.5,
      0
    );

    if (s.hairStyle === "short") {
      const hair = new THREE.Mesh(
        new THREE.SphereGeometry(
          0.37,
          16,
          10,
          0,
          Math.PI * 2,
          0,
          Math.PI * 0.48
        ),
        hairMaterial
      );

      hair.position.y = 2.32;
      hair.scale.z = 0.95;

      this.body.add(hair);
    }

    else if (s.hairStyle === "fade") {
      const top = new THREE.Mesh(
        new THREE.SphereGeometry(
          0.34,
          16,
          10,
          0,
          Math.PI * 2,
          0,
          Math.PI * 0.42
        ),
        hairMaterial
      );

      top.position.y = 2.34;

      this.body.add(top);
    }

    else if (s.hairStyle === "medium") {
      const hair = new THREE.Mesh(
        new THREE.SphereGeometry(
          0.39,
          16,
          12
        ),
        hairMaterial
      );

      hair.position.y = 2.3;
      hair.scale.set(
        1,
        0.9,
        0.95
      );

      this.body.add(hair);
    }

    else if (s.hairStyle === "long") {
      const top = new THREE.Mesh(
        new THREE.SphereGeometry(
          0.38,
          16,
          12
        ),
        hairMaterial
      );

      top.position.y = 2.3;

      this.body.add(top);

      const leftHair = new THREE.Mesh(
        new THREE.CapsuleGeometry(
          0.12,
          0.52,
          6,
          8
        ),
        hairMaterial
      );

      const rightHair = leftHair.clone();

      leftHair.position.set(
        -0.32,
        2.05,
        -0.02
      );

      rightHair.position.set(
        0.32,
        2.05,
        -0.02
      );

      this.body.add(leftHair);
      this.body.add(rightHair);
    }

    else if (s.hairStyle === "ponytail") {
      const top = new THREE.Mesh(
        new THREE.SphereGeometry(
          0.38,
          16,
          12
        ),
        hairMaterial
      );

      top.position.y = 2.3;

      this.body.add(top);

      const pony = new THREE.Mesh(
        new THREE.CapsuleGeometry(
          0.13,
          0.55,
          6,
          8
        ),
        hairMaterial
      );

      pony.position.set(
        0,
        2.05,
        -0.28
      );

      pony.rotation.x = -0.35;

      this.body.add(pony);
    }

    else if (s.hairStyle === "bob") {
      const hair = new THREE.Mesh(
        new THREE.SphereGeometry(
          0.4,
          16,
          12
        ),
        hairMaterial
      );

      hair.position.y = 2.28;
      hair.scale.y = 0.95;

      this.body.add(hair);
    }

    else if (s.hairStyle === "curly") {
      const main = new THREE.Mesh(
        new THREE.SphereGeometry(
          0.39,
          16,
          12
        ),
        hairMaterial
      );

      main.position.y = 2.31;

      this.body.add(main);

      for (let i = 0; i < 7; i++) {
        const curl = new THREE.Mesh(
          new THREE.SphereGeometry(
            0.12,
            10,
            8
          ),
          hairMaterial
        );

        const angle =
          (i / 7) * Math.PI * 2;

        curl.position.set(
          Math.cos(angle) * 0.3,
          2.29 + Math.sin(i) * 0.04,
          Math.sin(angle) * 0.25
        );

        this.body.add(curl);
      }
    }
  }

  buildNameplate() {
    const canvas =
      document.createElement("canvas");

    canvas.width = 512;
    canvas.height = 128;

    const ctx = canvas.getContext("2d");

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    /*
      BACKGROUND
    */

    ctx.fillStyle =
      "rgba(5,12,20,0.86)";

    this.roundRect(
      ctx,
      8,
      8,
      496,
      112,
      18
    );

    ctx.fill();

    /*
      BORDER
    */

    ctx.strokeStyle =
      this.isLocal
        ? "#35e8ff"
        : "#587080";

    ctx.lineWidth = 4;

    this.roundRect(
      ctx,
      8,
      8,
      496,
      112,
      18
    );

    ctx.stroke();

    /*
      NAME
    */

    ctx.textAlign = "center";

    ctx.font =
      "bold 32px Arial";

    ctx.fillStyle =
      "#ffffff";

    ctx.fillText(
      this.name,
      256,
      52
    );

    /*
      ROLE
    */

    ctx.font =
      "20px Arial";

    ctx.fillStyle =
      this.isLocal
        ? "#35e8ff"
        : "#a9c5d4";

    ctx.fillText(
      this.role,
      256,
      84
    );

    /*
      LOCAL LABEL
    */

    if (this.isLocal) {
      ctx.font =
        "bold 16px Arial";

      ctx.fillStyle =
        "#ffffff";

      ctx.fillText(
        "YOU",
        256,
        106
      );
    }

    const texture =
      new THREE.CanvasTexture(canvas);

    texture.needsUpdate = true;

    const material =
      new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false
      });

    this.nameplate =
      new THREE.Sprite(material);

    this.nameplate.scale.set(
      2.4,
      0.6,
      1
    );

    this.nameplate.position.y = 3.05;

    this.group.add(this.nameplate);
  }

  roundRect(
    ctx,
    x,
    y,
    width,
    height,
    radius
  ) {
    ctx.beginPath();

    ctx.moveTo(
      x + radius,
      y
    );

    ctx.lineTo(
      x + width - radius,
      y
    );

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

    ctx.lineTo(
      x + radius,
      y + height
    );

    ctx.quadraticCurveTo(
      x,
      y + height,
      x,
      y + height - radius
    );

    ctx.lineTo(
      x,
      y + radius
    );

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

    if (data.name) {
      this.name = data.name;
    }

    if (data.role) {
      this.role = data.role;
    }
  }

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

  update(delta = 0.016) {
    /*
      Remote player interpolation
    */

    if (!this.isLocal) {
      this.position.lerp(
        this.targetPosition,
        Math.min(
          1,
          delta * 10
        )
      );

      this.group.position.copy(
        this.position
      );
    }

    /*
      Detect movement
    */

    const movement =
      this.position.distanceTo(
        this.lastPosition
      );

    const moving =
      movement > 0.001;

    /*
      Walking animation
    */

    if (moving) {
      this.walkTime +=
        delta * 10;

      const swing =
        Math.sin(
          this.walkTime
        ) * 0.45;

      if (this.parts.leftArm) {
        this.parts.leftArm.rotation.x =
          swing;
      }

      if (this.parts.rightArm) {
        this.parts.rightArm.rotation.x =
          -swing;
      }

      if (this.parts.leftLeg) {
        this.parts.leftLeg.rotation.x =
          -swing;
      }

      if (this.parts.rightLeg) {
        this.parts.rightLeg.rotation.x =
          swing;
      }

      this.body.position.y =
        Math.abs(
          Math.sin(
            this.walkTime * 2
          )
        ) * 0.025;
    }

    /*
      Idle animation
    */

    else {
      this.walkTime +=
        delta * 1.5;

      const idle =
        Math.sin(
          this.walkTime
        ) * 0.012;

      this.body.position.y =
        idle;

      if (this.parts.leftArm) {
        this.parts.leftArm.rotation.x *= 0.9;
      }

      if (this.parts.rightArm) {
        this.parts.rightArm.rotation.x *= 0.9;
      }

      if (this.parts.leftLeg) {
        this.parts.leftLeg.rotation.x *= 0.9;
      }

      if (this.parts.rightLeg) {
        this.parts.rightLeg.rotation.x *= 0.9;
      }
    }

    /*
      Local player ring animation
    */

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
    this.group.traverse(
      object => {
        if (object.geometry) {
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
          } else {
            object.material.dispose();
          }
        }
      }
    );

    if (
      this.group.parent
    ) {
      this.group.parent.remove(
        this.group
      );
    }
  }
}
