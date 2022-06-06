const ClientError = require("../../exceptions/ClientError");

class ActivitiesHandler {
  constructor(activitiesService, playlistService) {
    this._activitiesService = activitiesService;
    this._playlistsService = playlistService;

    this.postActivityHandler = this.postActivityHandler.bind(this);
    this.getActivitiesHandler = this.getActivitiesHandler.bind(this);
  }

  async postActivityHandler(request, h) {
    try {
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._playlistsService.verifyPlaylistAccess(id, credentialId);
      const activityId = await this._activitiesService.addActivity(id);

      const response = h.response({
        status: "success",
        message: "Berhasil menambahkan activity",
        data: {
          activityId,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: "fail",
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server Error!
      const response = h.response({
        status: "error",
        message: "Maaf, terjadi kegagalan pada server kami.",
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async getActivitiesHandler(request, h) {
    try {
      const { id: credentialId } = request.auth.credentials;
      const { id } = request.params;

      await this._playlistsService.checkPlaylistAccess(id, credentialId);
      const data = await this._activitiesService.getActivities(id);

      return {
        status: "success",
        data,
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: "fail",
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: "error",
        message: "Maaf, terjadi kegagalan pada server kami.",
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
}

module.exports = ActivitiesHandler;
