export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/ws") {
      return new Response("AFTERLIGHT multiplayer server endpoint", {
        status: 200,
        headers: {
          "content-type": "text/plain"
        }
      });
    }

    return new Response(
      JSON.stringify({
        game: "AFTERLIGHT",
        status: "online",
        multiplayer: "foundation ready"
      }),
      {
        headers: {
          "content-type": "application/json"
        }
      }
    );
  }
};
