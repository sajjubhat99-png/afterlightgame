export class Room {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.players = new Map();
  }

  async fetch(request) {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("AFTERLIGHT Room Online", {
        status: 200
      });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    const id = crypto.randomUUID();

    this.players.set(id, {
      id,
      name: "Player",
      x: 0,
      y: 1,
      z: 0,
      credits: 500,
      influence: 10,
      trust: 50,
      energy: 100
    });

    server.accept();

    server.send(JSON.stringify({
      type: "welcome",
      id,
      players: [...this.players.values()]
    }));

    server.addEventListener("message", event => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === "join") {
          const player = this.players.get(id);

          if (player) {
            player.name = String(message.name || "Player").slice(0, 20);
          }
        }

        if (message.type === "move") {
          const player = this.players.get(id);

          if (player) {
            player.x = Number(message.x) || 0;
            player.y = Number(message.y) || 1;
            player.z = Number(message.z) || 0;
          }
        }

        const update = JSON.stringify({
          type: "players",
          players: [...this.players.values()]
        });

        for (const playerSocket of this.state.getWebSockets()) {
          try {
            playerSocket.send(update);
          } catch {}
        }

      } catch {}
    });

    server.addEventListener("close", () => {
      this.players.delete(id);

      const update = JSON.stringify({
        type: "players",
        players: [...this.players.values()]
      });

      for (const playerSocket of this.state.getWebSockets()) {
        try {
          playerSocket.send(update);
        } catch {}
      }
    });

    return new Response(null, {
      status: 101,
      webSocket: client
    });
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

    return new Response(
      JSON.stringify({
        game: "AFTERLIGHT",
        status: "online",
        multiplayer: "websocket-ready"
      }),
      {
        headers: {
          "content-type": "application/json"
        }
      }
    );
  }
};
