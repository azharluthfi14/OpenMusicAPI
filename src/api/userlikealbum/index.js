const UserLikeAlbumHandler = require("./handler");
const routes = require("./routes");

module.exports = {
  name: "user_album_likes",
  version: "1.0.0",
  register: async (server, { albumsService, userLikeAlbumService }) => {
    const userLikeAlbumHandler = new UserLikeAlbumHandler(albumsService, userLikeAlbumService);
    server.route(routes(userLikeAlbumHandler));
  },
};
