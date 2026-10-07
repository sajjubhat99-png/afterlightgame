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
  "Complete a secret trade.",
  "Protect a player who does not expect it.",
  "Influence another player's vote.",
  "Discover who owns a rare power.",
  "Create an alliance and keep it secret.",
  "Convince another player to trade with you.",
  "Make a promise and keep it."
];

const POWERS = {
  "Power Ring": {
    price: 150,
    description: "Temporary stamina advantage."
  },
  "Pulse Watch": {
    price: 180,
    description: "Receive limited challenge information."
  },
  "Gravity Shoes": {
    price: 200,
    description: "Movement advantage during challenges."
  },
  "Spectra Visor": {
    price: 220,
    description: "Reveal a hidden clue."
  },
  "Phase Jacket": {
    price: 250,
    description: "Cancel one environmental penalty."
  },
  "Signal Band": {
    price: 120,
    description: "Send a secret message."
  },
  "Influence Chip": {
    price: 300,
    description: "Increase voting influence."
  },
  "Shadow Pack": {
    price: 170,
    description: "Increase item capacity."
  },
  "Oracle Lens": {
    price: 260,
    description: "Receive a limited hint."
  },
  "Shield Band": {
    price: 240,
    description: "Cancel one minor disadvantage."
  }
};

const PHASES = [
  "LOBBY",
  "ORIENTATION",
  "CHALLENGE",
  "BREAK",
  "SOCIAL",
  "VOTING",
  "RESULT",
  "FINAL",
  "WINNER"
];

function cleanName(value) {
  return String(value || "Player")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, 20) || "Player";
}

function clamp(value, min, max) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return min;
  }

  return Math.max(min, Math.min(max, number));
}

function createPlayer(id, number) {
  return {
    id,
    name: `Player ${number}`,
    role: ROLES[(number - 1) % ROLES.length],

    x: 0,
    y: 1,
    z: 0,

    credits: 500,
    influence: 10,
    trust: 50,
    energy: 100,

    alive: true,
    ready: false,

    protection: false,
    powers: [],

    mission: MISSIONS[Math.floor(Math.random() * MISSIONS.length)],
    missionComplete: false,

    votesReceived: 0,
    votedFor: null,

    joinedAt: Date.now()
  };
}

export class Room {
  constructor(state, env) {
    this.state = state;
    this.env = env;

    this.players = new Map();

    this.phase = "LOBBY";
    this.round = 1;

    this.started = false;
    this.challenge = null;

    this.voteOpen = false;
    this.votes = new Map();

    this.prizePool = 16000;

    this.log = [
      "AFTERLIGHT systems online.",
      "Waiting for competitors."
    ];
  }

  async fetch(request) {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response(
        JSON.stringify({
          game: "AFTERLIGHT",
          status: "online",
          multiplayer: true,
          players: this.players.size,
          maxPlayers: MAX_PLAYERS
        }),
        {
          headers: {
            "content-type": "application/json"
          }
        }
      );
    }

    if (this.players.size >= MAX_PLAYERS) {
      return new Response("AFTERLIGHT room is full.", {
        status: 409
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

    server.send(
      JSON.stringify({
        type: "welcome",
        id,
        player,
        room: this.publicState()
      })
    );

    this.addLog(`${player.name} entered AFTERLIGHT.`);

    this.broadcastState();

    server.addEventListener("message", event => {
      this.handleMessage(id, event.data);
    });

    server.addEventListener("close", () => {
      const leavingPlayer = this.players.get(id);

      if (leavingPlayer) {
        this.addLog(`${leavingPlayer.name} disconnected.`);
      }

      this.players.delete(id);

      this.broadcastState();
    });

    return new Response(null, {
      status: 101,
      webSocket: client
    });
  }

  handleMessage(id, rawData) {
    let message;

    try {
      message = JSON.parse(rawData);
    } catch {
      return;
    }

    const player = this.players.get(id);

    if (!player) {
      return;
    }

    switch (message.type) {
      case "join":
        this.join(player, message);
        break;

      case "move":
        this.move(player, message);
        break;

      case "ready":
        this.setReady(player, message);
        break;

      case "start":
        this.startGame(player);
        break;

      case "challenge":
        this.challengeAction(player, message);
        break;

      case "social":
        this.socialAction(player, message);
        break;

      case "mission":
        this.missionAction(player);
        break;

      case "trade":
        this.tradeAction(player, message);
        break;

      case "pact":
        this.pactAction(player, message);
        break;

      case "protect":
        this.protectAction(player, message);
        break;

      case "buyPower":
        this.buyPower(player, message);
        break;

      case "parallel":
        this.parallelAction(player);
        break;

      case "architect":
        this.architectAction(player);
        break;

      case "heist":
        this.heistAction(player);
        break;

      case "vacation":
        this.vacationAction(player);
        break;

      case "vote":
        this.vote(player, message);
        break;

      default:
        break;
    }

    this.broadcastState();
  }

  join(player, message) {
    player.name = cleanName(message.name);

    this.addLog(`${player.name} joined the competition.`);
  }

  move(player, message) {
    if (!player.alive) {
      return;
    }

    player.x = clamp(message.x, -22, 22);
    player.y = clamp(message.y, 0.5, 5);
    player.z = clamp(message.z, -22, 22);
  }

  setReady(player, message) {
    player.ready = Boolean(message.ready);

    this.addLog(
      `${player.name} is ${player.ready ? "READY" : "NOT READY"}.`
    );
  }

  startGame(player) {
    if (this.started) {
      return;
    }

    const players = [...this.players.values()];

    if (players.length < 2) {
      this.addLog("At least 2 competitors are required to start.");
      return;
    }

    if (!player.ready) {
      this.addLog(`${player.name} must be ready first.`);
      return;
    }

    const readyPlayers = players.filter(p => p.ready);

    if (readyPlayers.length < players.length) {
      this.addLog("All connected competitors must be ready.");
      return;
    }

    this.started = true;
    this.phase = "ORIENTATION";

    this.addLog("ORIENTATION begins.");

    setTimeout(() => {
      if (!this.started) {
        return;
      }

      this.phase = "CHALLENGE";

      this.challenge = {
        name: "THE FLOATING BRIDGE",
        description:
          "Choose your route. Safe decisions protect energy. Risky decisions can increase your reward.",
        active: true
      };

      this.addLog("Challenge 1: THE FLOATING BRIDGE.");

      this.broadcastState();
    }, 3000);
  }

  challengeAction(player, message) {
    if (!player.alive) {
      return;
    }

    if (this.phase !== "CHALLENGE") {
      return;
    }

    const choice = String(message.choice || "");

    if (!["safe", "risk", "observe"].includes(choice)) {
      return;
    }

    if (choice === "observe") {
      if (player.energy < 10) {
        this.addLog(`${player.name} lacks energy to observe.`);
        return;
      }

      player.energy -= 10;

      this.addLog(
        `${player.name} studied the Floating Bridge before moving.`
      );

      return;
    }

    if (choice === "safe") {
      player.energy = clamp(player.energy - 10, 0, 100);
      player.credits += 40;

      this.addLog(`${player.name} chose the safe route.`);
    }

    if (choice === "risk") {
      player.energy = clamp(player.energy - 25, 0, 100);

      const success = Math.random() > 0.35;

      if (success) {
        player.credits += 140;
        player.influence += 2;

        this.addLog(
          `${player.name} took the risk and succeeded.`
        );
      } else {
        player.energy = clamp(player.energy - 20, 0, 100);
        player.trust = clamp(player.trust - 5, 0, 100);

        this.addLog(
          `${player.name} took the risk and suffered a penalty.`
        );
      }
    }

    this.checkChallengeComplete();
  }

  checkChallengeComplete() {
    const alivePlayers = [...this.players.values()].filter(
      p => p.alive
    );

    if (alivePlayers.length === 0) {
      return;
    }

    const activePlayers = alivePlayers.filter(
      p => p.energy > 0
    );

    if (
      activePlayers.length <= 1 ||
      alivePlayers.every(p => p.energy < 20)
    ) {
      this.phase = "BREAK";

      this.challenge = null;

      this.addLog("Challenge complete. Break phase begins.");

      setTimeout(() => {
        if (this.started && this.phase === "BREAK") {
          this.beginSocialPhase();
        }
      }, 3000);
    }
  }

  beginSocialPhase() {
    this.phase = "SOCIAL";

    this.addLog("SOCIAL PHASE begins.");

    for (const player of this.players.values()) {
      player.votedFor = null;
      player.votesReceived = 0;
    }
  }

  socialAction(player, message) {
    if (!player.alive || this.phase !== "SOCIAL") {
      return;
    }

    const action = String(message.action || "");

    if (action === "talk") {
      player.trust = clamp(player.trust + 2, 0, 100);

      this.addLog(`${player.name} talked with the other competitors.`);
    }

    if (action === "accuse") {
      player.influence += 1;
      player.trust = clamp(player.trust - 3, 0, 100);

      this.addLog(`${player.name} made an accusation.`);
    }

    if (action === "deal") {
      if (player.credits < 50) {
        return;
      }

      player.credits -= 50;
      player.influence += 1;

      this.addLog(`${player.name} created a private deal.`);
    }

    if (action === "end") {
      this.phase = "VOTING";
      this.voteOpen = true;

      this.addLog("The social phase has ended.");
      this.addLog("VOTING is now open.");
    }
  }

  missionAction(player) {
    if (!player.alive || player.missionComplete) {
      return;
    }

    if (this.phase !== "SOCIAL") {
      return;
    }

    player.missionComplete = true;

    player.credits += 100;
    player.influence += 2;

    this.addLog(`${player.name} completed a secret mission.`);
  }

  tradeAction(player, message) {
    if (!player.alive || this.phase !== "SOCIAL") {
      return;
    }

    const target = this.players.get(String(message.targetId));

    if (!target || !target.alive || target.id === player.id) {
      return;
    }

    if (player.credits < 50) {
      return;
    }

    player.credits -= 50;
    target.credits += 50;

    player.trust = clamp(player.trust + 3, 0, 100);
    target.trust = clamp(target.trust + 3, 0, 100);

    this.addLog(
      `${player.name} completed a trade with ${target.name}.`
    );
  }

  pactAction(player, message) {
    if (!player.alive || this.phase !== "SOCIAL") {
      return;
    }

    const target = this.players.get(String(message.targetId));

    if (!target || !target.alive || target.id === player.id) {
      return;
    }

    player.trust = clamp(player.trust + 5, 0, 100);
    target.trust = clamp(target.trust + 5, 0, 100);

    this.addLog(
      `${player.name} formed a secret pact with ${target.name}.`
    );
  }

  protectAction(player, message) {
    if (!player.alive || this.phase !== "SOCIAL") {
      return;
    }

    const target = this.players.get(String(message.targetId));

    if (!target || !target.alive) {
      return;
    }

    if (player.influence < 3) {
      this.addLog(`${player.name} lacks enough influence.`);
      return;
    }

    player.influence -= 3;
    target.protection = true;

    this.addLog(
      `${player.name} secretly protected ${target.name}.`
    );
  }

  buyPower(player, message) {
    if (!player.alive) {
      return;
    }

    const powerName = String(message.power || "");
    const power = POWERS[powerName];

    if (!power) {
      return;
    }

    if (player.credits < power.price) {
      this.addLog(`${player.name} cannot afford ${powerName}.`);
      return;
    }

    if (player.powers.includes(powerName)) {
      return;
    }

    player.credits -= power.price;
    player.powers.push(powerName);

    this.addLog(`${player.name} acquired ${powerName}.`);
  }

  parallelAction(player) {
    if (!player.alive) {
      return;
    }

    if (player.energy < 20) {
      this.addLog(`${player.name} lacks energy for the Parallel World.`);
      return;
    }

    player.energy -= 20;

    const outcomes = [
      "TRUE MEMORY: Someone nearby may be hiding a powerful item.",
      "FALSE MEMORY: A trusted alliance may not be what it seems.",
      "ALTERED MEMORY: Someone's story contains a contradiction.",
      "UNKNOWN: The next vote may have an unexpected consequence."
    ];

    const result =
      outcomes[Math.floor(Math.random() * outcomes.length)];

    this.addLog(`${player.name} entered the Parallel World.`);
    this.addLog(result);
  }

  architectAction(player) {
    if (!player.alive) {
      return;
    }

    const costs = [50, 100, 150, 200, 250];

    const level = Math.min(
      5,
      Math.max(1, Math.floor((500 - player.credits) / 50) + 1)
    );

    const cost = costs[level - 1];

    if (player.credits < cost) {
      this.addLog(`${player.name} needs ${cost} credits.`);
      return;
    }

    player.credits -= cost;

    const clues = [
      "CLUE: The Architect watches social decisions.",
      "CLUE: The Architect has influenced a previous event.",
      "CLUE: The Architect may not be a single person.",
      "CLUE: Someone has access to hidden information.",
      "CLUE: The game itself may be part of the mystery."
    ];

    this.addLog(
      `${player.name} investigated Architect level ${level}.`
    );

    this.addLog(clues[level - 1]);
  }

  heistAction(player) {
    if (!player.alive) {
      return;
    }

    if (player.energy < 30) {
      this.addLog(`${player.name} lacks energy for Shadow Protocol.`);
      return;
    }

    player.energy -= 30;

    const success = Math.random() > 0.4;

    if (success) {
      player.credits += 200;
      player.influence += 3;

      this.addLog(
        `${player.name} completed part of SHADOW PROTOCOL.`
      );
    } else {
      player.energy = clamp(player.energy - 15, 0, 100);

      this.addLog(
        `${player.name} triggered a Shadow Protocol complication.`
      );
    }
  }

  vacationAction(player) {
    if (!player.alive) {
      return;
    }

    const destinations = [
      "THE LAST VALLEY",
      "AZURE ARCHIPELAGO",
      "AURORA",
      "THE RED HORIZON"
    ];

    const destination =
      destinations[Math.floor(Math.random() * destinations.length)];

    player.energy = clamp(player.energy + 30, 0, 100);

    player.trust = clamp(player.trust + 2, 0, 100);

    this.addLog(
      `${player.name} explored ${destination}.`
    );
  }

  vote(player, message) {
    if (!player.alive || this.phase !== "VOTING") {
      return;
    }

    if (!this.voteOpen) {
      return;
    }

    const targetId = String(message.targetId || "");

    const target = this.players.get(targetId);

    if (!target || !target.alive || target.id === player.id) {
      return;
    }

    this.votes.set(player.id, target.id);

    player.votedFor = target.id;

    this.addLog(
      `${player.name} submitted a vote.`
    );

    const alivePlayers = [...this.players.values()].filter(
      p => p.alive
    );

    if (this.votes.size >= alivePlayers.length) {
      this.resolveVoting();
    }
  }

  resolveVoting() {
    this.voteOpen = false;

    for (const player of this.players.values()) {
      player.votesReceived = 0;
    }

    for (const targetId of this.votes.values()) {
      const target = this.players.get(targetId);

      if (target) {
        target.votesReceived += 1;
      }
    }

    const candidates = [...this.players.values()]
      .filter(p => p.alive)
      .sort((a, b) => b.votesReceived - a.votesReceived);

    const target = candidates[0];

    if (!target || target.votesReceived === 0) {
      this.phase = "BREAK";
      this.addLog("No elimination occurred.");
      this.nextRound();
      return;
    }

    if (target.protection) {
      target.protection = false;

      this.phase = "RESULT";

      this.addLog(
        `${target.name} was protected and survived elimination.`
      );

      this.nextRound();

      return;
    }

    target.alive = false;

    const reward = 1000;

    this.prizePool += reward;

    this.phase = "RESULT";

    this.addLog(
      `${target.name} has been eliminated.`
    );

    this.addLog(
      `Prize pool increased to ${this.prizePool} CR.`
    );

    const remaining = [...this.players.values()].filter(
      p => p.alive
    );

    if (remaining.length <= 1) {
      this.finishGame();
      return;
    }

    this.nextRound();
  }

  nextRound() {
    setTimeout(() => {
      const alive = [...this.players.values()].filter(
        p => p.alive
      );

      if (alive.length <= 1) {
        this.finishGame();
        return;
      }

      this.round += 1;

      for (const player of alive) {
        player.votedFor = null;
        player.votesReceived = 0;
        player.ready = false;
      }

      this.votes.clear();

      this.phase = "BREAK";

      this.addLog(`Round ${this.round} begins.`);

      setTimeout(() => {
        this.phase = "CHALLENGE";

        this.challenge = {
          name:
            this.round >= 3
              ? "THE MIND TRIAL"
              : "THE VERTICAL MAZE",

          description:
            "Choose carefully. Every decision changes your position in AFTERLIGHT.",

          active: true
        };

        this.addLog(
          `Challenge ${this.round}: ${this.challenge.name}.`
        );

        this.broadcastState();
      }, 2500);

      this.broadcastState();
    }, 2500);
  }

  finishGame() {
    const winner = [...this.players.values()].find(
      p => p.alive
    );

    if (!winner) {
      this.phase = "WINNER";

      this.addLog("AFTERLIGHT has ended.");

      return;
    }

    this.phase = "WINNER";

    winner.credits += this.prizePool;

    this.addLog(
      `${winner.name} is the AFTERLIGHT WINNER.`
    );

    this.addLog(
      `${winner.name} receives ${this.prizePool} CR.`
    );
  }

  addLog(message) {
    this.log.push({
      text: message,
      time: Date.now()
    });

    if (this.log.length > 40) {
      this.log.shift();
    }
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
      powers: player.powers,

      missionComplete: player.missionComplete,
      votesReceived: player.votesReceived
    };
  }

  publicState() {
    return {
      phase: this.phase,
      round: this.round,
      started: this.started,

      challenge: this.challenge,

      voteOpen: this.voteOpen,

      prizePool: this.prizePool,

      maxPlayers: MAX_PLAYERS,

      players: [...this.players.values()].map(
        player => this.publicPlayer(player)
      ),

      log: this.log
    };
  }

  broadcastState() {
    const message = JSON.stringify({
      type: "state",
      room: this.publicState()
    });

    for (const socket of this.state.getWebSockets()) {
      try {
        socket.send(message);
      } catch {
        // Ignore closed connections.
      }
    }
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/ws") {
      const roomId = env.AFTERLIGHT_ROOM.idFromName("main");

      const room = env.AFTERLIGHT_ROOM.get(roomId);

      return room.fetch(request);
    }

    if (url.pathname === "/api/status") {
      const roomId = env.AFTERLIGHT_ROOM.idFromName("main");

      const room = env.AFTERLIGHT_ROOM.get(roomId);

      const response = await room.fetch(
        new Request("https://afterlight.internal/")
      );

      return response;
    }

    return new Response(
      JSON.stringify({
        game: "AFTERLIGHT",
        status: "online",
        version: "core-01",
        multiplayer: true,
        maxPlayers: MAX_PLAYERS
      }),
      {
        headers: {
          "content-type": "application/json"
        }
      }
    );
  }
};
