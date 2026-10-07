import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

export class AfterlightGame {

  constructor(scene, options = {}) {

    this.scene = scene;

    this.send =
      typeof options.send === "function"
        ? options.send
        : () => {};

    this.getPlayers =
      typeof options.getPlayers === "function"
        ? options.getPlayers
        : () => [];

    this.getLocalPlayer =
      typeof options.getLocalPlayer === "function"
        ? options.getLocalPlayer
        : () => null;

    this.onEvent =
      typeof options.onEvent === "function"
        ? options.onEvent
        : () => {};

    this.challengeGroup = null;

    this.bridge = [];

    this.safeTiles = [];

    this.dangerTiles = [];

    this.playerProgress = new Map();

    this.challengeActive = false;

    this.challengeFinished = false;

    this.challengeTime = 90;

    this.remainingTime = 90;

    this.countdown = 0;

    this.startTime = 0;

    this.lastUpdate = 0;

    this.selectedTile = null;

    this.cameraTarget = null;

    this.arenaWidth = 18;

    this.tileWidth = 3.4;

    this.tileDepth = 4.2;

    this.tileGap = 0.35;

    this.totalRows = 12;

    this.challengeId =
      "floating_bridge";

    this.materials = {};

    this.buildMaterials();

    this.createChallengeArena();
  }


  /* =====================================================
     MATERIALS
  ===================================================== */

  buildMaterials() {

    this.materials.floor =
      new THREE.MeshStandardMaterial({
        color: 0x07141c,
        metalness: 0.8,
        roughness: 0.3
      });

    this.materials.safe =
      new THREE.MeshStandardMaterial({
        color: 0x126678,
        emissive: 0x063541,
        emissiveIntensity: 0.8,
        metalness: 0.65,
        roughness: 0.25
      });

    this.materials.danger =
      new THREE.MeshStandardMaterial({
        color: 0x38151d,
        emissive: 0x3a0811,
        emissiveIntensity: 0.7,
        metalness: 0.5,
        roughness: 0.3
      });

    this.materials.edge =
      new THREE.MeshStandardMaterial({
        color: 0x173d4a,
        emissive: 0x0b2a35,
        emissiveIntensity: 0.8,
        metalness: 0.85,
        roughness: 0.2
      });

    this.materials.glass =
      new THREE.MeshPhysicalMaterial({
        color: 0x3edff8,
        emissive: 0x0b7180,
        emissiveIntensity: 0.7,
        transparent: true,
        opacity: 0.45,
        metalness: 0.15,
        roughness: 0.08
      });

    this.materials.warning =
      new THREE.MeshBasicMaterial({
        color: 0xff3655
      });

    this.materials.light =
      new THREE.MeshBasicMaterial({
        color: 0x56eaff
      });
  }


  /* =====================================================
     ARENA
  ===================================================== */

  createChallengeArena() {

    this.challengeGroup =
      new THREE.Group();

    this.challengeGroup.name =
      "AFTERLIGHT_FLOATING_BRIDGE";

    this.scene.add(
      this.challengeGroup
    );

    this.createArenaBase();

    this.createBridge();

    this.createSideStructures();

    this.createStartPlatform();

    this.createFinishPlatform();

    this.createArenaLights();

    this.challengeGroup.visible =
      false;
  }


  createArenaBase() {

    const baseGeometry =
      new THREE.BoxGeometry(
        32,
        1.5,
        58
      );

    const base =
      new THREE.Mesh(
        baseGeometry,
        this.materials.floor
      );

    base.position.set(
      0,
      -4,
      0
    );

    this.challengeGroup.add(
      base
    );

    const gridMaterial =
      new THREE.LineBasicMaterial({
        color: 0x145263,
        transparent: true,
        opacity: 0.35
      });

    for (
      let x = -15;
      x <= 15;
      x += 3
    ) {

      const geometry =
        new THREE.BufferGeometry();

      geometry.setFromPoints([
        new THREE.Vector3(
          x,
          -3.2,
          -28
        ),
        new THREE.Vector3(
          x,
          -3.2,
          28
        )
      ]);

      this.challengeGroup.add(
        new THREE.Line(
          geometry,
          gridMaterial
        )
      );
    }

    for (
      let z = -28;
      z <= 28;
      z += 3
    ) {

      const geometry =
        new THREE.BufferGeometry();

      geometry.setFromPoints([
        new THREE.Vector3(
          -15,
          -3.2,
          z
        ),
        new THREE.Vector3(
          15,
          -3.2,
          z
        )
      ]);

      this.challengeGroup.add(
        new THREE.Line(
          geometry,
          gridMaterial
        )
      );
    }
  }


  /* =====================================================
     BRIDGE
  ===================================================== */

  createBridge() {

    /*
      Every row contains two tiles.

      One tile is safe.
      One tile is unstable.

      The pattern is deterministic for now.
      Later the server will decide the real pattern.
    */

    const pattern = [
      0,1,1,0,
      1,0,0,1,
      0,0,1,1,
      1,0,1,0,
      1,1,0,0,
      0,1,0,1,
      1,0,0,1,
      0,1,1,0,
      1,1,0,1,
      0,0,1,0,
      1,0,1,1,
      0,1,0,0
    ];

    for (
      let row = 0;
      row < this.totalRows;
      row++
    ) {

      const z =
        24 -
        row * 4.4;

      const leftSafe =
        pattern[row * 1] === 0;

      const left =
        this.createTile(
          row,
          0,
          -2.05,
          z,
          leftSafe
        );

      const right =
        this.createTile(
          row,
          1,
          2.05,
          z,
          !leftSafe
        );

      this.bridge.push({
        row,
        left,
        right
      });
    }
  }


  createTile(
    row,
    column,
    x,
    z,
    safe
  ) {

    const geometry =
      new THREE.BoxGeometry(
        this.tileWidth,
        0.55,
        this.tileDepth
      );

    const material =
      safe
        ? this.materials.safe
        : this.materials.danger;

    const tile =
      new THREE.Mesh(
        geometry,
        material.clone()
      );

    tile.position.set(
      x,
      0,
      z
    );

    tile.userData = {
      type: "bridgeTile",
      row,
      column,
      safe
    };

    tile.castShadow = false;
    tile.receiveShadow = true;

    this.challengeGroup.add(
      tile
    );

    const border =
      new THREE.LineSegments(
        new THREE.EdgesGeometry(
          geometry
        ),
        this.materials.edge
      );

    tile.add(
      border
    );

    const light =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.15,
          0.08,
          this.tileDepth - 0.5
        ),
        this.materials.light
      );

    light.position.y =
      0.32;

    tile.add(
      light
    );

    if (safe) {
      this.safeTiles.push(tile);
    } else {
      this.dangerTiles.push(tile);
    }

    return tile;
  }


  /* =====================================================
     START / FINISH
  ===================================================== */

  createStartPlatform() {

    const geometry =
      new THREE.BoxGeometry(
        12,
        0.8,
        7
      );

    const platform =
      new THREE.Mesh(
        geometry,
        this.materials.edge
      );

    platform.position.set(
      0,
      0,
      29
    );

    this.challengeGroup.add(
      platform
    );

    this.createLabel(
      "START",
      0,
      1.1,
      29,
      0x58eaff
    );
  }


  createFinishPlatform() {

    const geometry =
      new THREE.BoxGeometry(
        12,
        0.8,
        7
      );

    const platform =
      new THREE.Mesh(
        geometry,
        this.materials.edge
      );

    platform.position.set(
      0,
      0,
      -29
    );

    this.challengeGroup.add(
      platform
    );

    this.createLabel(
      "FINAL GATE",
      0,
      1.1,
      -29,
      0x58eaff
    );
  }


  /* =====================================================
     SIDE STRUCTURES
  ===================================================== */

  createSideStructures() {

    for (
      let side of [-1,1]
    ) {

      const x =
        side * 8.5;

      const pillarGeometry =
        new THREE.BoxGeometry(
          1.2,
          10,
          1.2
        );

      for (
        let z = -25;
        z <= 25;
        z += 10
      ) {

        const pillar =
          new THREE.Mesh(
            pillarGeometry,
            this.materials.edge
          );

          pillar.position.set(
            x,
            2,
            z
          );

          this.challengeGroup.add(
            pillar
          );
      }
    }
  }


  /* =====================================================
     LIGHTING
  ===================================================== */

  createArenaLights() {

    const light =
      new THREE.PointLight(
        0x3ceaff,
        7,
        45
      );

    light.position.set(
      0,
      7,
      0
    );

    this.challengeGroup.add(
      light
    );

    for (
      let z = -24;
      z <= 24;
      z += 8
    ) {

      const orb =
        new THREE.Mesh(
          new THREE.SphereGeometry(
            0.12,
            8,
            8
          ),
          this.materials.light
        );

      orb.position.set(
        -7.8,
        5,
        z
      );

      this.challengeGroup.add(
        orb
      );

      const orb2 =
        orb.clone();

      orb2.position.x =
        7.8;

      this.challengeGroup.add(
        orb2
      );
    }
  }


  /* =====================================================
     LABEL
  ===================================================== */

  createLabel(
    text,
    x,
    y,
    z,
    color
  ) {

    const canvas =
      document.createElement(
        "canvas"
      );

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

    ctx.font =
      "bold 42px Arial";

    ctx.textAlign =
      "center";

    ctx.textBaseline =
      "middle";

    ctx.fillStyle =
      "#dffaff";

    ctx.shadowColor =
      "#35dfff";

    ctx.shadowBlur =
      20;

    ctx.fillText(
      text,
      256,
      64
    );

    const texture =
      new THREE.CanvasTexture(
        canvas
      );

    const material =
      new THREE.SpriteMaterial({
        map:texture,
        transparent:true,
        color
      });

    const sprite =
      new THREE.Sprite(
        material
      );

    sprite.scale.set(
      6,
      1.5,
      1
    );

    sprite.position.set(
      x,
      y,
      z
    );

    this.challengeGroup.add(
      sprite
    );

    return sprite;
  }


  /* =====================================================
     START CHALLENGE
  ===================================================== */

  startFloatingBridge(
    seconds = 90
  ) {

    this.challengeActive =
      true;

    this.challengeFinished =
      false;

    this.challengeTime =
      seconds;

    this.remainingTime =
      seconds;

    this.startTime =
      performance.now();

    this.challengeGroup.visible =
      true;

    this.playerProgress.clear();

    this.onEvent({
      type:"challengeStart",
      challenge:this.challengeId,
      duration:seconds
    });

    this.send({
      type:"challengeStart",
      challenge:this.challengeId
    });
  }


  /* =====================================================
     STOP CHALLENGE
  ===================================================== */

  stopChallenge() {

    this.challengeActive =
      false;

    this.challengeFinished =
      true;

    this.onEvent({
      type:"challengeEnd",
      challenge:this.challengeId
    });
  }


  /* =====================================================
     PLAYER ENTERS TILE
  ===================================================== */

  attemptTile(
    row,
    column
  ) {

    if (!this.challengeActive) {
      return;
    }

    if (
      row < 0 ||
      row >= this.bridge.length
    ) {
      return;
    }

    const pair =
      this.bridge[row];

    const tile =
      column === 0
        ? pair.left
        : pair.right;

    if (!tile) return;

    const safe =
      Boolean(
        tile.userData.safe
      );

    this.send({
      type:"challengeAction",
      action:"tile",
      challenge:this.challengeId,
      row,
      column
    });

    if (safe) {

      this.onEvent({
        type:"safeTile",
        row,
        column
      });

      this.animateSafeTile(
        tile
      );

      return true;
    }

    this.onEvent({
      type:"dangerTile",
      row,
      column
    });

    this.animateDangerTile(
      tile
    );

    return false;
  }


  /* =====================================================
     SAFE TILE ANIMATION
  ===================================================== */

  animateSafeTile(tile) {

    const originalY =
      tile.position.y;

    const start =
      performance.now();

    const duration =
      500;

    const animate =
      now => {

        const progress =
          Math.min(
            (now - start) /
            duration,
            1
          );

        tile.position.y =
          originalY +
          Math.sin(
            progress * Math.PI
          ) * 0.15;

        if (
          progress < 1
        ) {

          requestAnimationFrame(
            animate
          );

        } else {

          tile.position.y =
            originalY;
        }
      };

    requestAnimationFrame(
      animate
    );
  }


  /* =====================================================
     DANGER TILE ANIMATION
  ===================================================== */

  animateDangerTile(tile) {

    const originalY =
      tile.position.y;

    const start =
      performance.now();

    const duration =
      850;

    const animate =
      now => {

        const progress =
          Math.min(
            (now - start) /
            duration,
            1
          );

        if (
          progress < 0.45
        ) {

          tile.position.y =
            originalY -
            Math.sin(
              progress * Math.PI * 4
            ) * 0.12;

        } else {

          const fallProgress =
            (progress - 0.45) /
            0.55;

          tile.position.y =
            originalY -
            fallProgress * 5;
        }

        tile.rotation.z =
          Math.sin(
            progress * 18
          ) *
          0.04;

        if (
          progress < 1
        ) {

          requestAnimationFrame(
            animate
          );

        } else {

          tile.position.y =
            originalY;

          tile.rotation.z =
            0;
        }
      };

    requestAnimationFrame(
      animate
    );
  }


  /* =====================================================
     REGISTER PLAYER PROGRESS
  ===================================================== */

  updatePlayerProgress(
    playerId,
    row
  ) {

    if (!playerId) return;

    this.playerProgress.set(
      playerId,
      Math.max(
        0,
        Math.min(
          row,
          this.totalRows
        )
      )
    );
  }


  /* =====================================================
     GET PLAYER PROGRESS
  ===================================================== */

  getPlayerProgress(
    playerId
  ) {

    return (
      this.playerProgress.get(
        playerId
      ) || 0
    );
  }


  /* =====================================================
     FINISH PLAYER
  ===================================================== */

  finishPlayer(
    playerId
  ) {

    this.updatePlayerProgress(
      playerId,
      this.totalRows
    );

    this.onEvent({
      type:"playerFinished",
      playerId
    });

    this.send({
      type:"challengeAction",
      action:"finish",
      challenge:this.challengeId
    });
  }


  /* =====================================================
     UPDATE
  ===================================================== */

  update(time) {

    if (!this.challengeGroup) {
      return;
    }

    const elapsed =
      performance.now() -
      this.startTime;

    if (this.challengeActive) {

      this.remainingTime =
        Math.max(
          0,
          this.challengeTime -
          elapsed / 1000
        );

      if (
        this.remainingTime <= 0
      ) {

        this.stopChallenge();
      }
    }

    this.animateArena(
      time
    );
  }


  /* =====================================================
     ARENA ANIMATION
  ===================================================== */

  animateArena(time) {

    const pulse =
      1 +
      Math.sin(
        time * 2
      ) * 0.08;

    for (
      const tile of this.safeTiles
    ) {

      if (
        tile.children[1]
      ) {

        tile.children[1]
          .scale.x =
          pulse;
      }
    }

    for (
      const tile of this.dangerTiles
    ) {

      if (
        tile.children[1]
      ) {

        tile.children[1]
          .scale.x =
          0.9 +
          Math.sin(
            time * 3
          ) * 0.08;
      }
    }
  }


  /* =====================================================
     SHOW / HIDE
  ===================================================== */

  show() {

    if (this.challengeGroup) {
      this.challengeGroup.visible =
        true;
    }
  }


  hide() {

    if (this.challengeGroup) {
      this.challengeGroup.visible =
        false;
    }
  }


  /* =====================================================
     RESET
  ===================================================== */

  reset() {

    this.challengeActive =
      false;

    this.challengeFinished =
      false;

    this.remainingTime =
      this.challengeTime;

    this.playerProgress.clear();

    for (
      const pair of this.bridge
    ) {

      for (
        const tile of [
          pair.left,
          pair.right
        ]
      ) {

        if (!tile) continue;

        tile.position.y =
          0;

        tile.rotation.z =
          0;
      }
    }
  }


  /* =====================================================
     DISPOSE
  ===================================================== */

  dispose() {

    if (!this.challengeGroup) {
      return;
    }

    this.scene.remove(
      this.challengeGroup
    );

    this.challengeGroup.traverse(
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
              material => {
                material.dispose();
              }
            );

          } else {

            object.material.dispose();
          }
        }
      }
    );

    this.challengeGroup =
      null;

    this.bridge = [];

    this.safeTiles = [];

    this.dangerTiles = [];
  }
}
