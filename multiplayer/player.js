import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export class AfterlightPlayer {

  constructor(
    id,
    name = "Player",
    role = "Competitor",
    isLocal = false
  ) {

    this.id = id;
    this.name = name || "Player";
    this.role = role || "Competitor";
    this.isLocal = isLocal;

    this.position = new THREE.Vector3(0, 0, 0);
    this.targetPosition = new THREE.Vector3(0, 0, 0);

    this.alive = true;

    this.group = new THREE.Group();
    this.group.position.copy(this.position);

    this.body = null;
    this.energyCore = null;
    this.ring = null;
    this.nameplate = null;

    this.buildCharacter();
    this.buildNameplate();
  }


  /* =========================================
     CHARACTER
     ========================================= */

  buildCharacter() {

    const roleColors = {

      Champion: 0xffcc33,
      Strategist: 0x00e5ff,
      Leader: 0xff5577,
      "Social Player": 0xff66cc,
      Ghost: 0x8888ff,
      Cipher: 0x66ffcc,
      Observer: 0xbb88ff,
      Tracker: 0xff8844,
      Competitor: 0x00e5ff

    };

    const color =
      roleColors[this.role] || 0x00e5ff;


    const bodyMaterial =
      new THREE.MeshStandardMaterial({

        color,
        metalness: 0.75,
        roughness: 0.28,
        emissive: color,
        emissiveIntensity: 0.08

      });


    const darkMaterial =
      new THREE.MeshStandardMaterial({

        color: 0x101820,
        metalness: 0.8,
        roughness: 0.25

      });


    /* BODY */

    const bodyGeometry =
      new THREE.CapsuleGeometry(
        0.55,
        1.25,
        8,
        16
      );

    this.body =
      new THREE.Mesh(
        bodyGeometry,
        bodyMaterial
      );

    this.body.position.y = 1.15;

    this.group.add(this.body);


    /* CHEST */

    const chestGeometry =
      new THREE.BoxGeometry(
        0.85,
        0.75,
        0.38
      );

    const chest =
      new THREE.Mesh(
        chestGeometry,
        darkMaterial
      );

    chest.position.set(
      0,
      1.35,
      0.38
    );

    this.group.add(chest);


    /* HEAD */

    const headGeometry =
      new THREE.SphereGeometry(
        0.43,
        20,
        16
      );

    const head =
      new THREE.Mesh(
        headGeometry,
        darkMaterial
      );

    head.position.y = 2.15;

    this.group.add(head);


    /* VISOR */

    const visorGeometry =
      new THREE.BoxGeometry(
        0.58,
        0.18,
        0.48
      );

    const visorMaterial =
      new THREE.MeshStandardMaterial({

        color,
        emissive: color,
        emissiveIntensity: 0.8,
        metalness: 0.3,
        roughness: 0.15

      });

    const visor =
      new THREE.Mesh(
        visorGeometry,
        visorMaterial
      );

    visor.position.set(
      0,
      2.16,
      0.36
    );

    this.group.add(visor);


    /* SHOULDERS */

    const shoulderGeometry =
      new THREE.SphereGeometry(
        0.23,
        12,
        8
      );


    const leftShoulder =
      new THREE.Mesh(
        shoulderGeometry,
        bodyMaterial
      );

    leftShoulder.position.set(
      -0.67,
      1.45,
      0
    );

    this.group.add(leftShoulder);


    const rightShoulder =
      new THREE.Mesh(
        shoulderGeometry,
        bodyMaterial
      );

    rightShoulder.position.set(
      0.67,
      1.45,
      0
    );

    this.group.add(rightShoulder);


    /* ARMS */

    const armGeometry =
      new THREE.CapsuleGeometry(
        0.16,
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
      -0.67,
      0.95,
      0
    );

    leftArm.rotation.z = -0.08;

    this.group.add(leftArm);


    const rightArm =
      new THREE.Mesh(
        armGeometry,
        darkMaterial
      );

    rightArm.position.set(
      0.67,
      0.95,
      0
    );

    rightArm.rotation.z = 0.08;

    this.group.add(rightArm);


    /* LEGS */

    const legGeometry =
      new THREE.CapsuleGeometry(
        0.18,
        0.7,
        6,
        10
      );


    const leftLeg =
      new THREE.Mesh(
        legGeometry,
        darkMaterial
      );

    leftLeg.position.set(
      -0.28,
      0.15,
      0
    );

    this.group.add(leftLeg);


    const rightLeg =
      new THREE.Mesh(
        legGeometry,
        darkMaterial
      );

    rightLeg.position.set(
      0.28,
      0.15,
      0
    );

    this.group.add(rightLeg);


    /* ENERGY CORE */

    const coreGeometry =
      new THREE.SphereGeometry(
        0.13,
        16,
        16
      );

    const coreMaterial =
      new THREE.MeshBasicMaterial({
        color
      });

    this.energyCore =
      new THREE.Mesh(
        coreGeometry,
        coreMaterial
      );

    this.energyCore.position.set(
      0,
      1.35,
      0.61
    );

    this.group.add(
      this.energyCore
    );


    /* GROUND RING */

    const ringGeometry =
      new THREE.RingGeometry(
        0.7,
        0.78,
        40
      );

    const ringMaterial =
      new THREE.MeshBasicMaterial({

        color,
        transparent: true,
        opacity: this.isLocal
          ? 0.8
          : 0.35,

        side: THREE.DoubleSide,
        depthWrite: false

      });


    this.ring =
      new THREE.Mesh(
        ringGeometry,
        ringMaterial
      );

    this.ring.rotation.x =
      -Math.PI / 2;

    this.ring.position.y =
      0.03;

    this.group.add(
      this.ring
    );


    /* LOCAL PLAYER GLOW */

    if (this.isLocal) {

      const glowGeometry =
        new THREE.SphereGeometry(
          1.05,
          24,
          16
        );

      const glowMaterial =
        new THREE.MeshBasicMaterial({

          color,
          transparent: true,
          opacity: 0.07,
          depthWrite: false

        });

      const glow =
        new THREE.Mesh(
          glowGeometry,
          glowMaterial
        );

      glow.position.y =
        1.2;

      this.group.add(glow);
    }
  }


  /* =========================================
     NAMEPLATE
     ========================================= */

  buildNameplate() {

    const canvas =
      document.createElement(
        "canvas"
      );

    canvas.width = 1024;
    canvas.height = 256;

    const ctx =
      canvas.getContext("2d");

    this.drawNameplate(
      ctx,
      canvas
    );

    const texture =
      new THREE.CanvasTexture(
        canvas
      );

    texture.minFilter =
      THREE.LinearFilter;

    texture.magFilter =
      THREE.LinearFilter;

    texture.generateMipmaps =
      false;


    const material =
      new THREE.SpriteMaterial({

        map: texture,
        transparent: true,

        depthTest: false,
        depthWrite: false,

        sizeAttenuation: true

      });


    this.nameplate =
      new THREE.Sprite(
        material
      );


    this.nameplate.position.set(
      0,
      3.35,
      0
    );


    this.nameplate.scale.set(
      4.8,
      1.2,
      1
    );


    this.nameplate.renderOrder =
      9999;


    this.group.add(
      this.nameplate
    );
  }


  /* =========================================
     DRAW NAMEPLATE
     ========================================= */

  drawNameplate(
    ctx,
    canvas
  ) {

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );


    ctx.fillStyle =
      "rgba(5,12,20,0.92)";


    this.roundRect(
      ctx,
      20,
      25,
      984,
      206,
      45
    );

    ctx.fill();


    ctx.strokeStyle =
      "#00e5ff";

    ctx.lineWidth = 6;


    this.roundRect(
      ctx,
      20,
      25,
      984,
      206,
      45
    );

    ctx.stroke();


    ctx.textAlign =
      "center";

    ctx.textBaseline =
      "middle";


    ctx.font =
      "bold 72px Arial";

    ctx.fillStyle =
      "#ffffff";


    ctx.fillText(
      this.name,
      512,
      105
    );


    ctx.font =
      "bold 40px Arial";

    ctx.fillStyle =
      "#00e5ff";


    ctx.fillText(
      this.role,
      512,
      175
    );
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


  /* =========================================
     SERVER UPDATE
     ========================================= */

  updateFromServer(data) {

    if (!data) {
      return;
    }


    if (data.name) {
      this.name =
        data.name;
    }


    if (data.role) {
      this.role =
        data.role;
    }


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

    }


    this.alive =
      data.alive !== false;


    this.refreshNameplate();

    this.nameplate.visible =
      true;

    this.nameplate.renderOrder =
      9999;
  }


  /* =========================================
     REFRESH NAMEPLATE
     ========================================= */

  refreshNameplate() {

    if (!this.nameplate) {
      return;
    }


    const canvas =
      document.createElement(
        "canvas"
      );

    canvas.width = 1024;
    canvas.height = 256;


    const ctx =
      canvas.getContext("2d");


    this.drawNameplate(
      ctx,
      canvas
    );


    const oldTexture =
      this.nameplate.material.map;


    const newTexture =
      new THREE.CanvasTexture(
        canvas
      );


    newTexture.minFilter =
      THREE.LinearFilter;

    newTexture.magFilter =
      THREE.LinearFilter;

    newTexture.generateMipmaps =
      false;


    this.nameplate.material.map =
      newTexture;

    this.nameplate.material.needsUpdate =
      true;


    if (oldTexture) {
      oldTexture.dispose();
    }


    this.nameplate.visible =
      true;

    this.nameplate.renderOrder =
      9999;
  }


  /* =========================================
     SET POSITION
     ========================================= */

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


  /* =========================================
     UPDATE
     ========================================= */

  update(delta) {

    this.group.position.lerp(
      this.targetPosition,
      Math.min(
        delta * 8,
        1
      )
    );


    if (this.energyCore) {

      this.energyCore.rotation.y +=
        delta * 3;


      this.energyCore.position.y =
        1.35 +
        Math.sin(
          performance.now() * 0.004
        ) * 0.035;
    }


    if (this.ring) {

      this.ring.rotation.z +=
        delta * 0.5;
    }


    if (this.nameplate) {

      this.nameplate.visible =
        true;

      this.nameplate.renderOrder =
        9999;
    }


    if (!this.alive) {

      this.group.traverse(
        object => {

          if (
            object.material &&
            object.material.transparent !==
              undefined
          ) {

            object.material.transparent =
              true;

            if (
              object !==
              this.nameplate
            ) {

              object.material.opacity =
                0.25;
            }
          }
        }
      );


      if (this.nameplate) {

        this.nameplate.visible =
          true;

        this.nameplate.material.opacity =
          0.65;
      }
    }
  }


  /* =========================================
     REMOVE
     ========================================= */

  remove() {

    if (
      this.group.parent
    ) {

      this.group.parent.remove(
        this.group
      );
    }


    this.group.traverse(
      object => {

        if (object.geometry) {
          object.geometry.dispose();
        }


        if (object.material) {

          if (
            object.material.map
          ) {

            object.material.map.dispose();
          }


          object.material.dispose();
        }
      }
    );
  }
}
