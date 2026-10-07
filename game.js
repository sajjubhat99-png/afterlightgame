const state = {
  playerName: "Player",
  roomCode: "",
  players: [],
  credits: 100,
  influence: 10,
  trust: 50,
  energy: 100,
  round: 1,
  phase: "Lobby",
  prize: 1000,
  eliminated: []
};

const names = [
  "Nova", "Cipher", "Ghost", "Atlas",
  "Echo", "Vega", "Raven", "Orion",
  "Luna", "Phoenix", "Zero", "Storm",
  "Sage", "Titan", "Mira", "Kai"
];

function makeRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function createRoom() {
  state.roomCode = makeRoomCode();
  state.playerName = prompt("Enter your player name:", "Player") || "Player";

  state.players = [
    {
      name: state.playerName,
      role: "You",
      trust: 50,
      influence: 10,
      alive: true
    }
  ];

  for (let i = 0; i < 7; i++) {
    state.players.push({
      name: names[i],
      role: "Competitor",
      trust: Math.floor(Math.random() * 41) + 30,
      influence: Math.floor(Math.random() * 10) + 5,
      alive: true
    });
  }

  state.phase = "Orientation";
  render();
  log("Room created: " + state.roomCode);
  log("Welcome to AFTERLIGHT.");
}

function joinRoom() {
  const code = prompt("Enter the AFTERLIGHT room code:");

  if (!code) return;

  state.roomCode = code.toUpperCase();
  state.playerName = prompt("Enter your player name:", "Player") || "Player";

  state.players = [
    {
      name: state.playerName,
      role: "You",
      trust: 50,
      influence: 10,
      alive: true
    }
  ];

  state.phase = "Orientation";

  render();
  log("Joined room " + state.roomCode);
}

function startChallenge() {
  state.phase = "Floating Bridge";
  state.energy -= 10;

  render();

  log("The Floating Bridge has begun.");
  log("Choose your path carefully.");

  const choice = prompt(
    "Floating Bridge:\n\n" +
    "1 = Safe path\n" +
    "2 = Risky shortcut\n" +
    "3 = Observe first"
  );

  if (choice === "1") {
    state.trust += 5;
    state.credits += 25;
    log("You chose the safe path. +25 Credits.");
  } else if (choice === "2") {
    if (Math.random() > 0.45) {
      state.credits += 75;
      state.influence += 5;
      log("Risk paid off! +75 Credits and +5 Influence.");
    } else {
      state.energy -= 25;
      log("The shortcut failed. -25 Energy.");
    }
  } else {
    state.trust += 10;
    log("You observed the bridge and gained useful information.");
  }

  state.phase = "Social Phase";
  render();
}

function socialAction(action) {
  if (action === "alliance") {
    state.trust += 10;
    state.influence += 2;
    log("You formed a temporary alliance.");
  }

  if (action === "trade") {
    if (state.credits >= 20) {
      state.credits -= 20;
      state.energy += 10;
      log("You traded 20 Credits for Energy.");
    } else {
      log("Not enough Credits.");
    }
  }

  if (action === "mission") {
    state.credits += 50;
    state.influence += 3;
    log("Secret Mission completed. +50 Credits.");
  }

  if (action === "protect") {
    if (state.influence >= 5) {
      state.influence -= 5;
      state.trust += 8;
      log("You used Influence to protect another player.");
    }
  }

  render();
}

function vote() {
  state.phase = "Voting";

  const alive = state.players.filter(p => p.alive);

  if (alive.length <= 1) {
    finishGame();
    return;
  }

  const candidates = alive.filter(p => p.name !== state.playerName);

  if (candidates.length === 0) {
    finishGame();
    return;
  }

  const target = candidates[
    Math.floor(Math.random() * candidates.length)
  ];

  target.alive = false;
  state.eliminated.push(target.name);
  state.prize += 250;

  log(target.name + " has been eliminated.");
  log("Prize pool increased to " + state.prize + " Credits.");

  state.round++;

  if (state.round >= 4) {
    finishGame();
    return;
  }

  state.phase = "Next Round";
  render();
}

function finishGame() {
  state.phase = "Final Challenge";

  const alive = state.players.filter(p => p.alive);

  if (alive.length === 1) {
    log("WINNER: " + alive[0].name);
    state.phase = "Winner";
  } else {
    log("You reached the Final Challenge.");
    log("The Fall awaits...");
  }

  render();
}

function buyPower(power) {
  const prices = {
    "Power Ring": 75,
    "Spectra Visor": 100,
    "Shield Band": 125,
    "Influence Chip": 150
  };

  const price = prices[power];

  if (state.credits < price) {
    log("Not enough Credits for " + power + ".");
    return;
  }

  state.credits -= price;
  log("Purchased " + power + ".");
  render();
}

function log(message) {
  const area = document.getElementById("log");

  if (!area) return;

  const line = document.createElement("div");
  line.textContent = "› " + message;

  area.prepend(line);
}

function renderPlayers() {
  const area = document.getElementById("players");

  if (!area) return;

  area.innerHTML = "";

  state.players.forEach(player => {
    const div = document.createElement("div");

    div.className = "player";

    div.innerHTML =
      "<strong>" + player.name + "</strong><br>" +
      player.role + "<br>" +
      "Trust: " + player.trust + "<br>" +
      "Influence: " + player.influence + "<br>" +
      (player.alive ? "ACTIVE" : "ELIMINATED");

    area.appendChild(div);
  });
}

function render() {
  const room = document.getElementById("room");
  const phase = document.getElementById("phase");
  const credits = document.getElementById("credits");
  const influence = document.getElementById("influence");
  const trust = document.getElementById("trust");
  const energy = document.getElementById("energy");
  const round = document.getElementById("round");
  const prize = document.getElementById("prize");

  if (room) room.textContent = state.roomCode || "----";
  if (phase) phase.textContent = state.phase;
  if (credits) credits.textContent = state.credits;
  if (influence) influence.textContent = state.influence;
  if (trust) trust.textContent = state.trust;
  if (energy) energy.textContent = state.energy;
  if (round) round.textContent = state.round;
  if (prize) prize.textContent = state.prize;

  renderPlayers();
}

document.addEventListener("DOMContentLoaded", render);
