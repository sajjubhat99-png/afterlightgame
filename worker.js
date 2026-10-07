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
  "Gain another player's trust.",
  "Influence a future vote.",
  "Complete a trade without revealing your goal.",
  "Protect another competitor.",
  "Discover who owns a rare power.",
  "Create an alliance and keep it.",
  "Convince another player to trade.",
  "Survive a risky decision."
];

const POWERS = [
  {
    id: "power-ring",
    name: "Power Ring",
    cost: 150,
    description: "Temporary stamina boost."
  },
  {
    id: "pulse-watch",
    name: "Pulse Watch",
    cost: 175,
    description: "Reveals limited challenge information."
  },
  {
    id: "gravity-shoes",
    name: "Gravity Shoes",
    cost: 200,
    description: "Improves movement during challenges."
  },
  {
    id: "spectra-visor",
    name: "Spectra Visor",
    cost: 150,
    description: "Reveals hidden paths and clues."
  },
  {
    id: "phase-jacket",
    name: "Phase Jacket",
    cost: 250,
    description: "Blocks one environmental penalty."
  },
  {
    id: "signal-band",
    name: "Signal Band",
    cost: 125,
    description: "Send a secret message."
  },
  {
    id: "influence-chip",
    name: "Influence Chip",
    cost: 100,
    description: "Adds voting influence."
  },
  {
    id: "shadow-pack",
    name: "Shadow Pack",
    cost: 125,
    description: "Increases item storage."
  },
  {
    id: "oracle-lens",
    name: "Oracle Lens",
    cost: 225,
    description: "Provides a limited hint."
  },
  {
    id: "shield-band",
    name: "Shield Band",
    cost: 175,
    description: "Cancels one minor disadvantage."
  }
];

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

function cleanName(name) {
  if (!name) return "Player";

  return String(name)
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 20) || "Player";
}

function randomMission() {
  return MISSIONS[Math.floor(Math.random() * MISSIONS.length)];
}

function createPlayer(id, number) {
  return {
    id,
    name: `Player ${number}`,
    role: ROLES[(number - 1) % ROLES.length],

    x: 0,
    y: 0,
    z: 0,

    credits: 500,
    influence: 10,
    trust: 50,
    energy: 100,

    alive: true,
    ready: false,

    protection: 0,

    powers: [],

    mission: randomMission(),
    missionComplete: false,

    votesReceived: 0,
    votedFor: null
  };
}

export class Room {
  constructor(state, env) {
    this.state = state;
    this.env = env;

    this.players = new Map();
    this.sockets = new Map();

    this.phase = PHASES.LOBBY;
    this.round = 1;

    this.prizePool = 16000;

    this.logs = [
      "System online.",
      "AFTERLIGHT systems ready."
    ];

    this.started = false;
  }

  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname !== "/ws") {
      return new Response("AFTERLIGHT ROOM ONLINE", {
        status: 200,
        headers: {
          "content-type": "text/plain"
        }
      });
    }

    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("WebSocket connection required.", {
        status: 426
      });
    }

    const pair = new WebSocketPair();

    const client = pair[0];
    const server = pair[1];

    const id = crypto.randomUUID();

    const playerNumber = this.players.size + 1;

    const player = createPlayer(id, playerNumber);

    this.players.set(id, player);

    server.accept();

    /*
     * IMPORTANT:
     *
     * Do NOT send welcome here.
     *
     * The browser must first show the name screen.
     * Welcome is now sent only after the player submits a name.
     */

    this.sockets.set(id, server);

    this.addLog(`Player ${playerNumber} connected.`);

    this.send(server, {
      type: "connected",
      id
    });

    this.broadcastState();

    server.addEventListener("message", event => {
      this.handleMessage(id, event.data);
    });

    server.addEventListener("close", () => {
      this.removePlayer(id);
    });

    server.addEventListener("error", () => {
      this.removePlayer(id);
    });

    return new Response(null, {
      status: 101,
      webSocket: client
    });
  }

  handleMessage(id, rawMessage) {
    const player = this.players.get(id);

    if (!player) return;

    let message;

    try {
      message = JSON.parse(rawMessage);
    } catch {
      return;
    }

    if (!message || typeof message.type !== "string") {
      return;
    }

    switch (message.type) {
      case "join":
        this.join(player, message);
        break;

      case "ready":
        this.ready(player);
        break;

      case "start":
        this.startGame();
        break;

      case "move":
        this.move(player, message);
        break;

      case "challenge":
        this.challenge(player, message);
        break;

      case "social":
        this.social(player, message);
        break;

      case "mission":
        this.completeMission(player);
        break;

      case "trade":
        this.trade(player, message);
        break;

      case "pact":
        this.secretPact(player, message);
        break;

      case "protect":
        this.protect(player, message);
        break;

      case "buyPower":
        this.buyPower(player, message);
        break;

      case "parallel":
        this.parallelWorld(player);
        break;

      case "architect":
        this.investigateArchitect(player);
        break;

      case "heist":
        this.heist(player);
        break;

      case "vacation":
        this.vacation(player);
        break;

      case "vote":
        this.vote(player, message);
        break;

      case "eliminate":
        this.eliminate(player, message);
        break;

      case "nextRound":
        this.nextRound();
        break;

      default:
        break;
    }
  }

  join(player, message) {
    const oldName = player.name;

    player.name = cleanName(message.name);

    this.addLog(`${player.name} joined the competition.`);

    const socket = this.sockets.get(player.id);

    /*
     * THIS IS THE IMPORTANT FIX.
     *
     * The welcome message is sent only after the player has
     * actually entered their name.
     */
    if (socket) {
      this.send(socket, {
        type: "welcome",
        id: player.id,
        player,
        room: this.publicState()
      });
    }

    this.broadcastState();

    if (oldName !== player.name) {
      this.send(socket, {
        type: "nameConfirmed",
        name: player.name
      });
    }
  }

  ready(player) {
    player.ready = !player.ready;

    this.addLog(
      `${player.name} is ${player.ready ? "ready" : "not ready"}.`
    );

    this.broadcastState();

    const activePlayers = [...this.players.values()].filter(
      p => p.alive
    );

    if (
      !this.started &&
      activePlayers.length >= 2 &&
      activePlayers.every(p => p.ready)
    ) {
      this.startGame();
    }
  }

  startGame() {
    if (this.started) return;

    const activePlayers = [...this.players.values()].filter(
      p => p.alive
    );

    if (activePlayers.length < 2) {
      this.addLog("At least 2 competitors are required.");
      this.broadcastState();
      return;
    }

    this.started = true;

    this.phase = PHASES.ORIENTATION;

    this.addLog("Orientation beginning.");

    this.broadcastState();

    setTimeout(() => {
      if (this.phase !== PHASES.ORIENTATION) return;

      this.phase = PHASES.CHALLENGE;

      this.addLog("Challenge phase activated.");

      this.broadcastState();
    }, 3000);
  }

  move(player, message) {
    if (!player.alive) return;

    const x = Number(message.x);
    const y = Number(message.y);
    const z = Number(message.z);

    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) {
      return;
    }

    player.x = Math.max(-22, Math.min(22, x));
    player.y = Math.max(0, Math.min(10, y));
    player.z = Math.max(-22, Math.min(22, z));

    this.broadcastState();
  }

  challenge(player, message) {
    if (!player.alive) return;

    if (
      this.phase !== PHASES.CHALLENGE &&
      this.phase !== PHASES.FINAL
    ) {
      return;
    }

    const action = message.action;

    if (action === "safe") {
      player.energy = Math.max(0, player.energy - 5);

      this.addLog(`${player.name} chose the safe route.`);
    }

    if (action === "risk") {
      player.energy = Math.max(0, player.energy - 15);

      const success = Math.random() > 0.35;

      if (success) {
        player.credits += 100;
        player.influence += 2;

        this.addLog(
          `${player.name} took a risk and succeeded.`
        );
      } else {
        player.energy = Math.max(0, player.energy - 15);

        this.addLog(
          `${player.name} took a risk and suffered a penalty.`
        );
      }
    }

    if (action === "observe") {
      player.energy = Math.max(0, player.energy - 3);

      this.addLog(
        `${player.name} observed the challenge carefully.`
      );
    }

    this.broadcastState();

    setTimeout(() => {
      if (this.phase === PHASES.CHALLENGE) {
        this.phase = PHASES.BREAK;

        this.addLog("Challenge complete. Break phase beginning.");

        this.broadcastState();

        setTimeout(() => {
          if (this.phase !== PHASES.BREAK) return;

          this.phase = PHASES.SOCIAL;

          this.addLog("Social phase is now open.");

          this.broadcastState();
        }, 3000);
      }
    }, 2500);
  }

  social(player, message) {
    if (!player.alive) return;

    if (this.phase !== PHASES.SOCIAL) {
      return;
    }

    const action = message.action;

    if (action === "talk") {
      player.trust = Math.min(100, player.trust + 2);

      this.addLog(`${player.name} started a conversation.`);
    }

    if (action === "accuse") {
      player.influence = Math.max(0, player.influence - 1);

      this.addLog(`${player.name} made an accusation.`);
    }

    if (action === "deal") {
      player.trust = Math.min(100, player.trust + 1);
      player.credits += 25;

      this.addLog(`${player.name} made a deal.`);
    }

    if (action === "end") {
      this.phase = PHASES.VOTING;

      this.addLog("Voting phase activated.");
    }

    this.broadcastState();
  }

  completeMission(player) {
    if (!player.alive || player.missionComplete) return;

    player.missionComplete = true;

    player.credits += 150;
    player.influence += 3;
    player.trust = Math.min(100, player.trust + 5);

    this.addLog(`${player.name} completed a secret mission.`);

    this.broadcastState();
  }

  trade(player, message) {
    if (!player.alive) return;

    const target = this.players.get(message.targetId);

    if (!target || !target.alive || target.id === player.id) {
      return;
    }

    if (player.credits < 25) {
      this.addLog(`${player.name} cannot afford the trade.`);
      this.broadcastState();
      return;
    }

    player.credits -= 25;
    target.credits += 25;

    player.trust = Math.min(100, player.trust + 2);
    target.trust = Math.min(100, target.trust + 2);

    this.addLog(
      `${player.name} traded 25 Credits with ${target.name}.`
    );

    this.broadcastState();
  }

  secretPact(player, message) {
    if (!player.alive) return;

    const target = this.players.get(message.targetId);

    if (!target || !target.alive || target.id === player.id) {
      return;
    }

    player.trust = Math.min(100, player.trust + 4);
    target.trust = Math.min(100, target.trust + 4);

    this.addLog(
      `${player.name} formed a secret pact with ${target.name}.`
    );

    this.broadcastState();
  }

  protect(player, message) {
    if (!player.alive) return;

    if (player.influence < 3) {
      this.addLog(`${player.name} does not have enough Influence.`);
      this.broadcastState();
      return;
    }

    const target = this.players.get(message.targetId);

    if (!target || !target.alive) {
      return;
    }

    player.influence -= 3;
    target.protection += 1;

    this.addLog(
      `${player.name} protected ${target.name}.`
    );

    this.broadcastState();
  }

  buyPower(player, message) {
    if (!player.alive) return;

    const power = POWERS.find(
      item => item.id === message.powerId
    );

    if (!power) return;

    if (player.credits < power.cost) {
      this.addLog(
        `${player.name} cannot afford ${power.name}.`
      );

      this.broadcastState();
      return;
    }

    if (player.powers.includes(power.id)) {
      return;
    }

    player.credits -= power.cost;

    player.powers.push(power.id);

    if (power.id === "influence-chip") {
      player.influence += 2;
    }

    if (power.id === "shadow-pack") {
      player.energy = Math.min(100, player.energy + 10);
    }

    this.addLog(
      `${player.name} acquired ${power.name}.`
    );

    this.broadcastState();
  }

  parallelWorld(player) {
    if (!player.alive) return;

    if (player.energy < 10) {
      this.addLog(
        `${player.name} does not have enough Energy to enter the Parallel World.`
      );

      this.broadcastState();
      return;
    }

    player.energy -= 10;

    const outcomes = [
      "TRUE MEMORY",
      "FALSE MEMORY",
      "ALTERED MEMORY",
      "UNKNOWN"
    ];

    const result =
      outcomes[Math.floor(Math.random() * outcomes.length)];

    this.addLog(
      `${player.name} entered the Parallel World and discovered: ${result}.`
    );

    this.broadcastState();
  }

  investigateArchitect(player) {
    if (!player.alive) return;

    const cost = 50;

    if (player.credits < cost) {
      this.addLog(
        `${player.name} needs 50 Credits to investigate the Architect.`
      );

      this.broadcastState();
      return;
    }

    player.credits -= cost;

    const clues = [
      "The Architect has interacted with another competitor.",
      "The Architect has accessed a restricted area.",
      "The Architect has manipulated information.",
      "The Architect may have a hidden alliance.",
      "The Architect has influenced a previous decision."
    ];

    const clue =
      clues[Math.floor(Math.random() * clues.length)];

    this.addLog(
      `${player.name} discovered an Architect clue: ${clue}`
    );

    this.broadcastState();
  }

  heist(player) {
    if (!player.alive) return;

    if (player.energy < 20) {
      this.addLog(
        `${player.name} does not have enough Energy for the Heist.`
      );

      this.broadcastState();
      return;
    }

    player.energy -= 20;

    const success = Math.random() > 0.4;

    if (success) {
      player.credits += 300;
      player.influence += 5;

      this.addLog(
        `${player.name} completed the Shadow Protocol Heist.`
      );
    } else {
      player.energy = Math.max(0, player.energy - 10);

      this.addLog(
        `${player.name} failed the Heist and suffered a penalty.`
      );
    }

    this.broadcastState();
  }

  vacation(player) {
    if (!player.alive) return;

    player.energy = Math.min(100, player.energy + 20);
    player.trust = Math.min(100, player.trust + 2);

    this.addLog(
      `${player.name} explored the vacation world.`
    );

    this.broadcastState();
  }

  vote(player, message) {
    if (!player.alive) return;

    if (this.phase !== PHASES.VOTING) {
      return;
    }

    const target = this.players.get(message.targetId);

    if (!target || !target.alive || target.id === player.id) {
      return;
    }

    player.votedFor = target.id;

    this.addLog(
      `${player.name} submitted a vote.`
    );

    this.broadcastState();

    this.checkVotingComplete();
  }

  checkVotingComplete() {
    const alivePlayers = [...this.players.values()].filter(
      p => p.alive
    );

    if (alivePlayers.length <= 1) {
      this.finishWinner();
      return;
    }

    const allVoted = alivePlayers.every(
      p => p.votedFor
    );

    if (!allVoted) {
      return;
    }

    const counts = new Map();

    for (const player of alivePlayers) {
      if (!player.votedFor) continue;

      counts.set(
        player.votedFor,
        (counts.get(player.votedFor) || 0) + 1
      );
    }

    let highest = 0;
    let eliminatedId = null;

    for (const [id, count] of counts.entries()) {
      if (count > highest) {
        highest = count;
        eliminatedId = id;
      }
    }

    if (eliminatedId) {
      const eliminated = this.players.get(eliminatedId);

      if (eliminated) {
        this.eliminatePlayer(eliminated);
      }
    }

    this.phase = PHASES.RESULT;

    this.broadcastState();

    setTimeout(() => {
      this.nextRound();
    }, 4000);
  }

  eliminate(player, message) {
    if (!player.alive) return;

    const target = this.players.get(message.targetId);

    if (!target || !target.alive) {
      return;
    }

    this.eliminatePlayer(target);

    this.broadcastState();
  }

  eliminatePlayer(player) {
    if (player.protection > 0) {
      player.protection -= 1;

      this.addLog(
        `${player.name} survived because of Protection.`
      );

      return;
    }

    player.alive = false;

    player.ready = false;

    this.prizePool += 1000;

    this.addLog(
      `${player.name} has been eliminated.`
    );

    const remaining = [...this.players.values()].filter(
      p => p.alive
    );

    if (remaining.length <= 1) {
      this.finishWinner();
    }
  }

  nextRound() {
    const remaining = [...this.players.values()].filter(
      p => p.alive
    );

    if (remaining.length <= 1) {
      this.finishWinner();
      return;
    }

    this.round += 1;

    this.phase = PHASES.CHALLENGE;

    for (const player of remaining) {
      player.votedFor = null;
      player.votesReceived = 0;
      player.ready = false;

      player.energy = Math.min(
        100,
        player.energy + 15
      );

      player.mission = randomMission();
      player.missionComplete = false;
    }

    this.addLog(
      `Round ${this.round} begins.`
    );

    this.broadcastState();
  }

  finishWinner() {
    const remaining = [...this.players.values()].filter(
      p => p.alive
    );

    this.phase = PHASES.WINNER;

    if (remaining.length === 1) {
      const winner = remaining[0];

      winner.credits += this.prizePool;

      this.addLog(
        `${winner.name} wins AFTERLIGHT. Prize: ${this.prizePool} Credits.`
      );
    } else {
      this.addLog(
        "AFTERLIGHT has ended."
      );
    }

    this.broadcastState();
  }

  removePlayer(id) {
    const player = this.players.get(id);

    if (player) {
      this.addLog(
        `${player.name} disconnected.`
      );
    }

    this.sockets.delete(id);
    this.players.delete(id);

    this.broadcastState();
  }

  addLog(message) {
    this.logs.push(message);

    if (this.logs.length > 30) {
      this.logs.shift();
    }
  }

  send(socket, data) {
    try {
      socket.send(JSON.stringify(data));
    } catch {
      // Ignore disconnected sockets.
    }
  }

  broadcastState() {
    const state = this.publicState();

    const message = JSON.stringify({
      type: "state",
      room: state
    });

    for (const [id, socket] of this.sockets.entries()) {
      try {
        socket.send(message);
      } catch {
        this.sockets.delete(id);
      }
    }
  }

  publicState() {
    return {
      phase: this.phase,

      round: this.round,

      started: this.started,

      prizePool: this.prizePool,

      competitors: [...this.players.values()].map(
        player => ({
          ...player
        })
      ),

      players: [...this.players.values()].map(
        player => ({
          ...player
        })
      ),

      powers: POWERS,

      logs: [...this.logs]
    };
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    /*
     * WebSocket requests go to the Durable Object.
     */
    if (
      url.pathname === "/ws" &&
      request.headers.get("Upgrade") === "websocket"
    ) {
      const id = env.AFTERLIGHT_ROOM.idFromName("main-room");

      const room = env.AFTERLIGHT_ROOM.get(id);

      return room.fetch(request);
    }

    /*
     * Simple status endpoint.
     */
    if (url.pathname === "/api/status") {
      return new Response(
        JSON.stringify({
          game: "AFTERLIGHT",
          status: "online",
          version: "1.0",
          maxPlayers: MAX_PLAYERS
        }),
        {
          headers: {
            "content-type": "application/json"
          }
        }
      );
    }

    /*
     * Let Cloudflare Assets serve the game files.
     */
    return env.ASSETS.fetch(request);
  }
};
