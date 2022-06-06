const routes = (handler) => [
  {
    method: "POST",
    path: "/export/playlists/{playlistId}",
    handler: handler.postExportPlaylistSongHandler,
    options: {
      auth: "openmusicapiv3_jwt",
    },
  },
];

module.exports = routes;
