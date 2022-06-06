const ClientError = require("../../exceptions/ClientError");

class CollaborationsHandler {
  constructor(collaborationsService, playlistsService, validator) {
    this._collaborationsService = collaborationsService;
    this._playlistsService = playlistsService;
    this._validator = validator;

    this.postCollaborationHandler = this.postCollaborationHandler.bind(this);
    this.deleteCollaborationHandler = this.deleteCollaborationHandler.bind(this);
  }

  // ============== Handler create collaboration ===================
  async postCollaborationHandler(request, h) {
    try {
      this._validator.validateCollaborationPayload(request.payload);

      const { playlistId, userId } = request.payload;
      const { id: credentialId } = request.auth.credentials;

      await this._playlistsService.checkPlaylistAccess(playlistId, credentialId);

      const collaborationId = await this._collaborationsService.addCollaboration(playlistId, userId);
      const response = h.response({
        status: "success",
        message: "Berhasil menambahkan kolaborasi",
        data: {
          collaborationId,
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
        message: "Maaf, server sedang error silahkan coba lagi nanti.",
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  // ============== Handler delete collaboration =======================
  async deleteCollaborationHandler(request, h) {
    try {
      this._validator.validateCollaborationPayload(request.payload);

      const { id: credentialId } = request.auth.credentials;
      const { playlistId, userId } = request.payload;

      await this._playlistsService.checkPlaylistByOwner(playlistId, credentialId);
      await this._collaborationsService.deleteCollaboration(playlistId, userId);

      return {
        status: "success",
        message: "Berhasil menghapus kolaborasi",
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

module.exports = CollaborationsHandler;
