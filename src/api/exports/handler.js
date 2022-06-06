const ClientError = require("../../exceptions/ClientError");

class ExportsHandler {
  constructor(service, playlistsService, validator) {
    this._service = service;
    this._playlistsService = playlistsService;
    this._validator = validator;

    this.postExportPlaylistSongHandler = this.postExportPlaylistSongHandler.bind(this);
  }

  // ============= Handler export playlist ===================
  async postExportPlaylistSongHandler(request, h) {
    try {
      this._validator.validateExportsPlaylistSongPayload(request.payload);

      const { playlistId } = request.params;
      const { id: userId } = request.auth.credentials;

      const message = {
        playlistId,
        userId: request.auth.credentials.id,
        targetEmail: request.payload.targetEmail,
      };

      await this._playlistsService.checkPlaylistByOwner(playlistId, userId);
      await this._service.sendMessage("export:playlists", JSON.stringify(message));

      const response = h.response({
        status: "success",
        message: "Permintaan Anda sedang kami proses",
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
        message: "Maaf, server sedang error silahkan coba lagi nanti.",
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
}

module.exports = ExportsHandler;
