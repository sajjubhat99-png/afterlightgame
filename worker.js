const MAX_PLAYERS = 16;

const ROLES = [
  "Champion",
  "Strategist",
  "Leader",
  "Social Player",
  "Ghost",
  "Cipher",
  "Observer",
  "Tracker"
];

const MISSIONS = [
  "Gain someone's trust",
  "Influence a vote",
  "Make a secret alliance",
  "Complete a trade",
  "Protect a rival",
  "Discover a rare power",
  "Convince someone to trade",
  "Keep an alliance alive"
];

const POWERS = {
  "Power Ring": {
    cost: 150,
    type: "stamina"
  },
  "Pulse Watch": {
    cost: 200,
    type: "information"
  },
  "Gravity Shoes": {
    cost: 250,
    type: "movement"
  },
  "Spectra Visor": {
    cost: 300,
    type: "vision"
  },
  "Phase Jacket": {
    cost: 250,
    type: "protection"
  },
  "Signal Band": {
    cost: 100,
    type: "message"
  },
  "Influence Chip": {
    cost: 350,
    type: "influence"
  },
  "Shadow Pack": {
    cost: 200,
    type: "storage"
  },
  "Oracle Lens": {
    cost: 300,
    type: "hint"
  },
  "Shield Band": {
    cost: 250,
    type: "shield"
  }
};

const PHASES = {
  LOBBY: "LOBBY",
  ORIENTATION: "ORIENTATION",
  CHALLENGE: "CHALLENGE",
  BREAK: "BREAK",
  SOCIAL: "SOCIAL",
  VOTING: "VOTING",
  RESULT: "RESULT",
  FINAL: "FINAL",
  WINNER: "WINNER"
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/ws") {
      const id = env.AFTERLIGHT_ROOM.idFromName("main-room");
      const room = env.AFTERLIGHT_ROOM.get(id);
      return room.fetch(request);
    }

    if (url.pathname === "/api/status") {
      return Response.json({
        game: "AFTERLIGHT",
        status: "online",
        version: "multiplayer-v2",
        maxPlayers: MAX_PLAYERS
      });
    }

    return env.ASSETS.fetch(request);
  }
};

export class Room {
  constructor(state, env) {
    this.state = state;
    this.env = env;

    this.players = new Map();
    this.sockets = new Map();

    this.phase = PHASES.LOBBY;

    this.prizePool = 16000;
    this.round = 1;

    this.challenge = {
      active: false,
      name: null,
      startedAt: 0,
      duration: 0,
      endAt: 0,

      bridge: {
        tiles: [],
        currentStep: {},
        progress: {},
        finished: {},
        failed: {}
      }
    };

    this.logs = [
      "System online.",
      "AFTERLIGHT systems ready."
    ];

    this.phaseTimer = null;
    this.challengeTimer = null;
  }

  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname !== "/ws") {
      return new Response("AFTERLIGHT ROOM ONLINE");
    }

    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("WebSocket upgrade required", {
        status: 426
      });
    }

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];

    server.accept();

    const socketId = crypto.randomUUID();

    this.sockets.set(socketId, {
      socket: server,
      playerId: null
    });

    server.addEventListener("message", async event => {
      try {
        const message = JSON.parse(event.data);

        await this.handleMessage(
          socketId,
          server,
          message
        );
      } catch (error) {
        this.send(server, {
          type: "error",
          message: "Invalid server message."
        });
      }
    });

    server.addEventListener("close", () => {
      this.handleDisconnect(socketId);
    });

    server.addEventListener("error", () => {
      this.handleDisconnect(socketId);
    });

    this.send(server, {
      type: "connected",
      message: "Connected to AFTERLIGHT."
    });

    return new Response(null, {
      status: 101,
      webSocket: client
    });
  }

  async handleMessage(socketId, socket, message) {
    if (!message || typeof message.type !== "string") {
      return;
    }

    switch (message.type) {
      case "join":
        this.joinPlayer(socketId, socket, message);
        break;

      case "move":
        this.movePlayer(socketId, message);
        break;

      case "ready":
        this.readyPlayer(socketId);
        break;

      case "start":
        this.startGame();
        break;

      case "challenge":
        this.handleChallengeAction(socketId, message);
        break;

      case "challengeStart":
        this.startFloatingBridge();
        break;

      case "challengeStop":
        this.stopChallenge();
        break;

      case "social":
        this.socialAction(socketId, message);
        break;

      case "mission":
        this.completeMission(socketId);
        break;

      case "trade":
        this.trade(socketId, message);
        break;

      case "pact":
        this.secretPact(socketId, message);
        break;

      case "protect":
        this.protectPlayer(socketId, message);
        break;

      case "vote":
        this.vote(socketId, message);
        break;

      case "accuse":
        this.accuse(socketId, message);
        break;

      case "buyPower":
        this.buyPower(socketId, message);
        break;

      case "parallel":
        this.parallelWorld(socketId);
        break;

      case "architect":
        this.architectInvestigation(socketId);
        break;

      case "heist":
        this.heist(socketId);
        break;

      case "vacation":
        this.vacation(socketId);
        break;

      default:
        this.send(socket, {
          type: "error",
          message: "Unknown action."
        });
    }
  }

  joinPlayer(socketId, socket, message) {
    if (this.sockets.get(socketId)?.playerId) {
      return;
    }

    if (this.players.size >= MAX_PLAYERS) {
      this.send(socket, {
        type: "error",
        message: "AFTERLIGHT room is full."
      });

      return;
    }

    const playerId = crypto.randomUUID();

    const requestedName =
      typeof message.name === "string"
        ? message.name.trim()
        : "";

    const name =
      requestedName.length > 0
        ? requestedName.substring(0, 18)
        : `Player ${this.players.size + 1}`;

    const role =
      ROLES[this.players.size % ROLES.length];

    const mission =
      MISSIONS[
        Math.floor(Math.random() * MISSIONS.length)
      ];

    const player = {
      id: playerId,
      name,
      role,

      x: 0,
      y: 0,
      z: 0,

      credits: 500,
      influence: 10,
      trust: 50,
      energy: 100,

      alive: true,
      ready: false,

      protection: false,

      powers: [],

      mission,
      missionComplete: false,

      votesReceived: 0,
      votedFor: null,

      bridgeStep: 0,
      bridgeFinished: false,
      bridgeFailed: false
    };

    this.players.set(playerId, player);

    const connection = this.sockets.get(socketId);

    if (connection) {
      connection.playerId = playerId;
    }

    this.log(`${name} joined AFTERLIGHT.`);

    this.send(socket, {
      type: "welcome",
      player: this.publicPlayer(player),
      phase: this.phase,
      round: this.round,
      prizePool: this.prizePool,
      maxPlayers: MAX_PLAYERS
    });

    this.broadcastState();

    if (this.players.size >= 2) {
      this.log(
        `${this.players.size} competitors connected.`
      );
    }
  }

  movePlayer(socketId, message) {
    const player = this.getPlayerBySocket(socketId);

    if (!player || !player.alive) {
      return;
    }

    const x = Number(message.x);
    const y = Number(message.y);
    const z = Number(message.z);

    if (
      !Number.isFinite(x) ||
      !Number.isFinite(y) ||
      !Number.isFinite(z)
    ) {
      return;
    }

    player.x = this.clamp(x, -42, 42);
    player.y = this.clamp(y, 0, 8);
    player.z = this.clamp(z, -42, 42);

    this.broadcastState();
  }

  readyPlayer(socketId) {
    const player = this.getPlayerBySocket(socketId);

    if (!player) {
      return;
    }

    player.ready = true;

    this.log(`${player.name} is ready.`);

    this.broadcastState();

    this.tryStartGame();
  }

  tryStartGame() {
    const alivePlayers = [
      ...this.players.values()
    ].filter(player => player.alive);

    if (
      alivePlayers.length >= 2 &&
      alivePlayers.every(player => player.ready) &&
      this.phase === PHASES.LOBBY
    ) {
      this.startGame();
    }
  }

  startGame() {
    if (this.phase !== PHASES.LOBBY) {
      return;
    }

    this.phase = PHASES.ORIENTATION;

    this.log("Orientation sequence started.");

    this.broadcastState();

    this.clearPhaseTimer();

    this.phaseTimer = setTimeout(() => {
      this.startFloatingBridge();
    }, 3000);
  }

  startFloatingBridge() {
    if (
      this.phase !== PHASES.ORIENTATION &&
      this.phase !== PHASES.CHALLENGE
    ) {
      return;
    }

    if (this.challenge.active) {
      return;
    }

    this.phase = PHASES.CHALLENGE;

    const duration = 90;

    const tileCount = 12;

    const tiles = [];

    for (let i = 0; i < tileCount; i++) {
      const safeLeft = Math.random() > 0.5;

      tiles.push({
        step: i,
        leftSafe: safeLeft,
        rightSafe: !safeLeft,
        revealed: false
      });
    }

    this.challenge = {
      active: true,
      name: "Floating Bridge",

      startedAt: Date.now(),
      duration,
      endAt: Date.now() + duration * 1000,

      bridge: {
        tiles,

        currentStep: {},
        progress: {},
        finished: {},
        failed: {}
      }
    };

    for (const player of this.players.values()) {
      if (!player.alive) {
        continue;
      }

      player.bridgeStep = 0;
      player.bridgeFinished = false;
      player.bridgeFailed = false;

      this.challenge.bridge.currentStep[player.id] = 0;
      this.challenge.bridge.progress[player.id] = 0;
      this.challenge.bridge.finished[player.id] = false;
      this.challenge.bridge.failed[player.id] = false;
    }

    this.log("FLOATING BRIDGE challenge started.");

    this.broadcast({
      type: "challengeStart",
      challenge: this.publicChallenge()
    });

    this.broadcastState();

    this.clearChallengeTimer();

    this.challengeTimer = setTimeout(() => {
      this.finishFloatingBridge();
    }, duration * 1000);
  }

  handleChallengeAction(socketId, message) {
    const player = this.getPlayerBySocket(socketId);

    if (!player || !player.alive) {
      return;
    }

    if (
      this.phase !== PHASES.CHALLENGE ||
      !this.challenge.active
    ) {
      return;
    }

    if (this.challenge.name !== "Floating Bridge") {
      return;
    }

    if (player.bridgeFinished || player.bridgeFailed) {
      return;
    }

    const action =
      typeof message.action === "string"
        ? message.action
        : "";

    if (action === "observe") {
      this.bridgeObserve(player);
      return;
    }

    if (action !== "safe" && action !== "risk") {
      return;
    }

    this.bridgeChoose(player, action);
  }

  bridgeObserve(player) {
    const step = player.bridgeStep;

    if (
      step < 0 ||
      step >= this.challenge.bridge.tiles.length
    ) {
      return;
    }

    const tile =
      this.challenge.bridge.tiles[step];

    tile.revealed = true;

    this.sendToPlayer(player.id, {
      type: "challengeReveal",
      step,
      leftSafe: tile.leftSafe,
      rightSafe: tile.rightSafe
    });

    this.log(
      `${player.name} inspected bridge step ${step + 1}.`
    );
  }

  bridgeChoose(player, action) {
    const step = player.bridgeStep;

    const tile =
      this.challenge.bridge.tiles[step];

    const correct =
      action === "safe"
        ? tile.leftSafe
        : tile.rightSafe;

    if (!correct) {
      player.bridgeFailed = true;

      this.challenge.bridge.failed[player.id] = true;

      player.energy = Math.max(
        0,
        player.energy - 20
      );

      this.log(
        `${player.name} failed the Floating Bridge.`
      );

      this.sendToPlayer(player.id, {
        type: "challengeResult",
        success: false,
        step,
        message: "Unstable panel."
      });

      this.broadcastState();

      this.checkBridgeCompletion();

      return;
    }

    player.bridgeStep++;

    this.challenge.bridge.currentStep[player.id] =
      player.bridgeStep;

    this.challenge.bridge.progress[player.id] =
      player.bridgeStep;

    if (
      player.bridgeStep >=
      this.challenge.bridge.tiles.length
    ) {
      player.bridgeFinished = true;

      this.challenge.bridge.finished[player.id] =
        true;

      player.credits += 250;

      player.influence += 2;

      this.log(
        `${player.name} completed the Floating Bridge.`
      );

      this.sendToPlayer(player.id, {
        type: "challengeResult",
        success: true,
        finished: true,
        reward: {
          credits: 250,
          influence: 2
        }
      });
    } else {
      this.sendToPlayer(player.id, {
        type: "challengeResult",
        success: true,
        finished: false,
        step: player.bridgeStep,
        progress: player.bridgeStep
      });
    }

    this.broadcastState();

    this.checkBridgeCompletion();
  }

  checkBridgeCompletion() {
    const alivePlayers = [
      ...this.players.values()
    ].filter(player => player.alive);

    if (alivePlayers.length === 0) {
      return;
    }

    const remaining = alivePlayers.filter(
      player =>
        !player.bridgeFinished &&
        !player.bridgeFailed
    );

    if (remaining.length === 0) {
      this.finishFloatingBridge();
    }
  }

  finishFloatingBridge() {
    if (!this.challenge.active) {
      return;
    }

    this.clearChallengeTimer();

    this.challenge.active = false;

    const alivePlayers = [
      ...this.players.values()
    ].filter(player => player.alive);

    const finishers = alivePlayers.filter(
      player => player.bridgeFinished
    );

    const failed = alivePlayers.filter(
      player => player.bridgeFailed
    );

    for (const player of alivePlayers) {
      if (
        !player.bridgeFinished &&
        !player.bridgeFailed
      ) {
        player.energy = Math.max(
          0,
          player.energy - 10
        );
      }
    }

    this.log(
      `Floating Bridge complete: ${finishers.length} finished, ${failed.length} failed.`
    );

    this.phase = PHASES.BREAK;

    this.broadcast({
      type: "challengeEnd",
      challenge: this.publicChallenge()
    });

    this.broadcastState();

    this.clearPhaseTimer();

    this.phaseTimer = setTimeout(() => {
      this.startSocialPhase();
    }, 5000);
  }

  stopChallenge() {
    if (!this.challenge.active) {
      return;
    }

    this.clearChallengeTimer();

    this.challenge.active = false;

    this.phase = PHASES.BREAK;

    this.log("Challenge stopped.");

    this.broadcast({
      type: "challengeEnd",
      challenge: this.publicChallenge()
    });

    this.broadcastState();
  }

  startSocialPhase() {
    this.phase = PHASES.SOCIAL;

    this.log("Social Phase is now open.");

    for (const player of this.players.values()) {
      if (!player.alive) {
        continue;
      }

      player.energy = Math.min(
        100,
        player.energy + 10
      );
    }

    this.broadcastState();
  }

  socialAction(socketId, message) {
    const player = this.getPlayerBySocket(socketId);

    if (!player || !player.alive) {
      return;
    }

    if (this.phase !== PHASES.SOCIAL) {
      return;
    }

    const action =
      typeof message.action === "string"
        ? message.action
        : "";

    const target =
      message.targetId
        ? this.players.get(message.targetId)
        : null;

    if (action === "talk") {
      player.trust = this.clamp(
        player.trust + 2,
        0,
        100
      );

      this.log(
        `${player.name} entered the social room.`
      );
    }

    if (action === "accuse") {
      if (target && target.alive) {
        target.trust = this.clamp(
          target.trust - 5,
          0,
          100
        );

        player.influence += 1;

        this.log(
          `${player.name} accused ${target.name}.`
        );
      }
    }

    if (action === "deal") {
      if (target && target.alive) {
        player.trust = this.clamp(
          player.trust + 3,
          0,
          100
        );

        target.trust = this.clamp(
          target.trust + 3,
          0,
          100
        );

        this.log(
          `${player.name} made a deal with ${target.name}.`
        );
      }
    }

    if (action === "end") {
      this.log(
        `${player.name} left the Social Phase.`
      );
    }

    this.broadcastState();
  }

  completeMission(socketId) {
    const player = this.getPlayerBySocket(socketId);

    if (!player || !player.alive) {
      return;
    }

    if (player.missionComplete) {
      return;
    }

    player.missionComplete = true;

    player.credits += 150;
    player.influence += 2;
    player.trust = this.clamp(
      player.trust + 5,
      0,
      100
    );

    this.log(
      `${player.name} completed a secret mission.`
    );

    this.broadcastState();
  }

  trade(socketId, message) {
    const player = this.getPlayerBySocket(socketId);

    if (!player || !player.alive) {
      return;
    }

    const target =
      message.targetId
        ? this.players.get(message.targetId)
        : null;

    if (!target || !target.alive || target.id === player.id) {
      return;
    }

    const amount = this.clamp(
      Number(message.amount) || 50,
      1,
      500
    );

    if (player.credits < amount) {
      return;
    }

    player.credits -= amount;
    target.credits += amount;

    player.trust = this.clamp(
      player.trust + 2,
      0,
      100
    );

    target.trust = this.clamp(
      target.trust + 2,
      0,
      100
    );

    this.log(
      `${player.name} traded ${amount} Credits with ${target.name}.`
    );

    this.broadcastState();
  }

  secretPact(socketId, message) {
    const player = this.getPlayerBySocket(socketId);

    if (!player || !player.alive) {
      return;
    }

    const target =
      message.targetId
        ? this.players.get(message.targetId)
        : null;

    if (!target || !target.alive) {
      return;
    }

    player.trust = this.clamp(
      player.trust + 5,
      0,
      100
    );

    target.trust = this.clamp(
      target.trust + 5,
      0,
      100
    );

    player.influence += 1;

    this.log(
      `${player.name} formed a secret pact with ${target.name}.`
    );

    this.broadcastState();
  }

  protectPlayer(socketId, message) {
    const player = this.getPlayerBySocket(socketId);

    if (!player || !player.alive) {
      return;
    }

    const target =
      message.targetId
        ? this.players.get(message.targetId)
        : player;

    if (!target || !target.alive) {
      return;
    }

    if (player.influence < 2) {
      return;
    }

    player.influence -= 2;

    target.protection = true;

    this.log(
      `${player.name} protected ${target.name}.`
    );

    this.broadcastState();
  }

  accuse(socketId, message) {
    this.socialAction(socketId, {
      action: "accuse",
      targetId: message.targetId
    });
  }

  buyPower(socketId, message) {
    const player = this.getPlayerBySocket(socketId);

    if (!player || !player.alive) {
      return;
    }

    const powerName = message.power;

    if (!POWERS[powerName]) {
      return;
    }

    const power = POWERS[powerName];

    if (player.credits < power.cost) {
      this.sendToPlayer(player.id, {
        type: "error",
        message: "Not enough Credits."
      });

      return;
    }

    if (player.powers.includes(powerName)) {
      return;
    }

    player.credits -= power.cost;

    player.powers.push(powerName);

    this.log(
      `${player.name} acquired ${powerName}.`
    );

    this.broadcastState();
  }

  parallelWorld(socketId) {
    const player = this.getPlayerBySocket(socketId);

    if (!player || !player.alive) {
      return;
    }

    if (player.credits < 50) {
      return;
    }

    player.credits -= 50;

    const types = [
      "TRUE MEMORY",
      "FALSE MEMORY",
      "ALTERED MEMORY",
      "UNKNOWN"
    ];

    const type =
      types[
        Math.floor(Math.random() * types.length)
      ];

    const messages = {
      "TRUE MEMORY":
        "A real alliance exists somewhere in the facility.",
      "FALSE MEMORY":
        "Someone may be trusting information that never happened.",
      "ALTERED MEMORY":
        "A previous decision may have had a different consequence.",
      "UNKNOWN":
        "The system refuses to classify this outcome."
    };

    this.sendToPlayer(player.id, {
      type: "parallel",
      memory: {
        type,
        message: messages[type]
      }
    });

    this.log(
      `${player.name} entered the Parallel World.`
    );

    this.broadcastState();
  }

  architectInvestigation(socketId) {
    const player = this.getPlayerBySocket(socketId);

    if (!player || !player.alive) {
      return;
    }

    if (player.credits < 100) {
      return;
    }

    player.credits -= 100;

    const levels = [
      "Small clue discovered.",
      "A location is connected.",
      "A behavioral pattern was detected.",
      "A player connection was detected.",
      "A suspect profile is forming."
    ];

    const level =
      Math.floor(
        Math.random() * levels.length
      );

    this.sendToPlayer(player.id, {
      type: "architect",
      level: level + 1,
      clue: levels[level]
    });

    this.log(
      `${player.name} investigated the Unknown Architect.`
    );

    this.broadcastState();
  }

  heist(socketId) {
    const player = this.getPlayerBySocket(socketId);

    if (!player || !player.alive) {
      return;
    }

    const outcomes = [
      "Laser corridor cleared.",
      "False door discovered.",
      "Security drone detected.",
      "Time-lock puzzle solved.",
      "A hidden Power Core was located."
    ];

    const outcome =
      outcomes[
        Math.floor(
          Math.random() * outcomes.length
        )
      ];

    player.credits += 75;

    this.sendToPlayer(player.id, {
      type: "heist",
      outcome,
      reward: 75
    });

    this.log(
      `${player.name} entered The Heist.`
    );

    this.broadcastState();
  }

  vacation(socketId) {
    const player = this.getPlayerBySocket(socketId);

    if (!player || !player.alive) {
      return;
    }

    const locations = [
      "The Last Valley",
      "Azure Archipelago",
      "Aurora",
      "The Red Horizon"
    ];

    const destination =
      locations[
        Math.floor(
          Math.random() * locations.length
        )
      ];

    player.energy = Math.min(
      100,
      player.energy + 15
    );

    this.sendToPlayer(player.id, {
      type: "vacation",
      destination
    });

    this.log(
      `${player.name} explored ${destination}.`
    );

    this.broadcastState();
  }

  vote(socketId, message) {
    const player = this.getPlayerBySocket(socketId);

    if (!player || !player.alive) {
      return;
    }

    if (
      this.phase !== PHASES.SOCIAL &&
      this.phase !== PHASES.VOTING
    ) {
      return;
    }

    const target =
      message.targetId
        ? this.players.get(message.targetId)
        : null;

    if (!target || !target.alive || target.id === player.id) {
      return;
    }

    player.votedFor = target.id;

    if (this.phase !== PHASES.VOTING) {
      this.phase = PHASES.VOTING;
    }

    this.log(
      `${player.name} submitted a vote.`
    );

    this.broadcastState();

    this.resolveVotesIfReady();
  }

  resolveVotesIfReady() {
    const alivePlayers = [
      ...this.players.values()
    ].filter(player => player.alive);

    if (alivePlayers.length <= 1) {
      this.declareWinner();
      return;
    }

    const allVoted = alivePlayers.every(
      player => player.votedFor
    );

    if (!allVoted) {
      return;
    }

    for (const player of alivePlayers) {
      player.votesReceived = 0;
    }

    for (const player of alivePlayers) {
      const target =
        this.players.get(player.votedFor);

      if (target && target.alive) {
        target.votesReceived++;
      }
    }

    let highest = 0;
    let candidates = [];

    for (const player of alivePlayers) {
      if (player.votesReceived > highest) {
        highest = player.votesReceived;
        candidates = [player];
      } else if (
        player.votesReceived === highest
      ) {
        candidates.push(player);
      }
    }

    if (candidates.length === 0) {
      return;
    }

    const eliminated =
      candidates[
        Math.floor(
          Math.random() * candidates.length
        )
      ];

    if (eliminated.protection) {
      eliminated.protection = false;

      this.log(
        `${eliminated.name} was protected from elimination.`
      );

      for (const player of alivePlayers) {
        player.votedFor = null;
        player.votesReceived = 0;
      }

      this.phase = PHASES.RESULT;

      this.broadcastState();

      this.phaseTimer = setTimeout(() => {
        this.startSocialPhase();
      }, 4000);

      return;
    }

    this.eliminatePlayer(eliminated);
  }

  eliminatePlayer(player) {
    player.alive = false;

    this.prizePool += 1000;

    this.log(
      `${player.name} has been eliminated.`
    );

    for (const p of this.players.values()) {
      p.votedFor = null;
      p.votesReceived = 0;
    }

    const alivePlayers = [
      ...this.players.values()
    ].filter(p => p.alive);

    if (alivePlayers.length <= 1) {
      this.declareWinner();
      return;
    }

    this.phase = PHASES.RESULT;

    this.broadcastState();

    this.clearPhaseTimer();

    this.phaseTimer = setTimeout(() => {
      this.round++;

      for (const p of this.players.values()) {
        if (!p.alive) {
          continue;
        }

        p.ready = false;
        p.energy = Math.min(
          100,
          p.energy + 20
        );
      }

      this.phase = PHASES.LOBBY;

      this.log(
        `Round ${this.round} is ready.`
      );

      this.broadcastState();
    }, 5000);
  }

  declareWinner() {
    const alivePlayers = [
      ...this.players.values()
    ].filter(player => player.alive);

    if (alivePlayers.length !== 1) {
      return;
    }

    const winner = alivePlayers[0];

    this.phase = PHASES.WINNER;

    winner.credits += this.prizePool;

    this.log(
      `${winner.name} wins AFTERLIGHT.`
    );

    this.broadcast({
      type: "winner",
      winner: this.publicPlayer(winner),
      prizePool: this.prizePool
    });

    this.broadcastState();
  }

  publicChallenge() {
    const bridge = this.challenge.bridge;

    return {
      active: this.challenge.active,
      name: this.challenge.name,

      startedAt: this.challenge.startedAt,
      duration: this.challenge.duration,
      endAt: this.challenge.endAt,

      tiles: bridge.tiles.map(tile => ({
        step: tile.step,
        revealed: tile.revealed
      })),

      progress: {
        ...bridge.progress
      },

      finished: {
        ...bridge.finished
      },

      failed: {
        ...bridge.failed
      }
    };
  }

  publicPlayer(player) {
    return {
      id: player.id,
      name: player.name,
      role: player.role,

      x: player.x,
      y: player.y,
      z: player.z,

      credits: player.credits,
      influence: player.influence,
      trust: player.trust,
      energy: player.energy,

      alive: player.alive,
      ready: player.ready,

      protection: player.protection,

      powers: [...player.powers],

      mission: player.mission,
      missionComplete: player.missionComplete,

      votesReceived: player.votesReceived,

      bridgeStep: player.bridgeStep,
      bridgeFinished: player.bridgeFinished,
      bridgeFailed: player.bridgeFailed
    };
  }

  publicState() {
    return {
      phase: this.phase,
      round: this.round,
      prizePool: this.prizePool,

      players: [
        ...this.players.values()
      ].map(player =>
        this.publicPlayer(player)
      ),

      logs: this.logs.slice(-40),

      challenge: this.challenge.active
        ? this.publicChallenge()
        : {
            active: false,
            name: this.challenge.name
          }
    };
  }

  broadcastState() {
    this.broadcast({
      type: "state",
      state: this.publicState()
    });
  }

  broadcast(message) {
    const data = JSON.stringify(message);

    for (const connection of this.sockets.values()) {
      try {
        connection.socket.send(data);
      } catch {
        // Ignore disconnected sockets.
      }
    }
  }

  send(socket, message) {
    try {
      socket.send(JSON.stringify(message));
    } catch {
      // Ignore failed socket.
    }
  }

  sendToPlayer(playerId, message) {
    for (const connection of this.sockets.values()) {
      if (connection.playerId === playerId) {
        this.send(connection.socket, message);
        return;
      }
    }
  }

  getPlayerBySocket(socketId) {
    const connection = this.sockets.get(socketId);

    if (!connection || !connection.playerId) {
      return null;
    }

    return this.players.get(connection.playerId) || null;
  }

  handleDisconnect(socketId) {
    const connection =
      this.sockets.get(socketId);

    if (!connection) {
      return;
    }

    const playerId = connection.playerId;

    this.sockets.delete(socketId);

    if (!playerId) {
      return;
    }

    const player =
      this.players.get(playerId);

    if (!player) {
      return;
    }

    player.alive = false;

    this.log(
      `${player.name} disconnected.`
    );

    this.broadcastState();

    const alivePlayers = [
      ...this.players.values()
    ].filter(p => p.alive);

    if (
      alivePlayers.length === 1 &&
      this.phase !== PHASES.LOBBY &&
      this.phase !== PHASES.WINNER
    ) {
      this.declareWinner();
    }
  }

  log(message) {
    const timestamp =
      new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit"
      });

    this.logs.push(
      `[${timestamp}] ${message}`
    );

    if (this.logs.length > 80) {
      this.logs.shift();
    }

    this.broadcast({
      type: "log",
      message
    });
  }

  clearPhaseTimer() {
    if (this.phaseTimer) {
      clearTimeout(this.phaseTimer);
      this.phaseTimer = null;
    }
  }

  clearChallengeTimer() {
    if (this.challengeTimer) {
      clearTimeout(this.challengeTimer);
      this.challengeTimer = null;
    }
  }

  clamp(value, min, max) {
    return Math.min(
      max,
      Math.max(min, value)
    );
  }
}
