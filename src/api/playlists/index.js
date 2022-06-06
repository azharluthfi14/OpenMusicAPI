const Playlists = require("./handler");
const routes = require("./routes");

module.exports = {
  name: "playlist",
  version: "1.0.0",
  register: async (server, { service, validator }) => {
    const playlistsHandler = new Playlists(service, validator);
    server.route(routes(playlistsHandler));
  },
};
