const routes = (handler) => [
  {
    method: "POST",
    path: "/playlists/{id}/activities",
    handler: handler.postActivityHandler,
    options: {
      auth: "openmusicapiv3_jwt",
    },
  },
  {
    method: "GET",
    path: "/playlists/{id}/activities",
    handler: handler.getActivitiesHandler,
    options: {
      auth: "openmusicapiv3_jwt",
    },
  },
];

module.exports = routes;
