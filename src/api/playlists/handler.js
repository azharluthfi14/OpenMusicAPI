const ClientError = require("../../exceptions/ClientError");

class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    // Playlist
    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.getPlaylistByOwnerHandler = this.getPlaylistByOwnerHandler.bind(this);
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);

    // PlaylistSong
    this.postSongToPlaylistHandler = this.postSongToPlaylistHandler.bind(this);
    this.getSongFromPlaylistHandler = this.getSongFromPlaylistHandler.bind(this);
    this.deleteSongFromPlaylistHandler = this.deleteSongFromPlaylistHandler.bind(this);
  }

  /* =================== Playlist handler ================= */
  async postPlaylistHandler(request, h) {
    try {
      this._validator.validatePostPlaylistsPayload(request.payload);

      const { name } = request.payload;
      const { id: credentialId } = request.auth.credentials;
      const playlistId = await this._service.addPlaylist({
        name,
        owner: credentialId,
      });

      const response = h.response({
        status: "success",
        message: "Berhasil menambahkan playlist",
        data: {
          playlistId,
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

      // server error
      const response = h.response({
        status: "error",
        message: "Maaf, server sedang error silahkan coba lagi nanti.",
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async getPlaylistByOwnerHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this._service.getPlaylistByOwner(credentialId);

    return {
      status: "success",
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._service.checkPlaylistByOwner(id, credentialId);
      await this._service.deletePlaylistById(id);

      return {
        status: "success",
        message: "Berhasil menghapus playlist",
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

      // Server error
      const response = h.response({
        status: "error",
        message: "Maaf, server sedang error silahkan coba lagi nanti.",
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  /* ===================== Playlist song handler ================== */
  async postSongToPlaylistHandler(request, h) {
    try {
      this._validator.validatePostSongToPlaylistsPayload(request.payload);

      const { songId } = request.payload;
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._service.checkSongExist(songId);
      await this._service.checkPlaylistAccess(id, credentialId);

      const resultId = await this._service.addSongToPlaylist(songId, id, credentialId);

      const response = h.response({
        status: "success",
        message: "Berhasil menambahkan lagu ke dalam playlist",
        data: {
          playlistId: resultId,
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

      // Server error
      const response = h.response({
        status: "error",
        message: "Maaf, server sedang error silahkan coba lagi nanti.",
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async getSongFromPlaylistHandler(request, h) {
    try {
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._service.checkPlaylistAccess(id, credentialId);

      const playlist = await this._service.getSongFromPlaylist(id, credentialId);

      return {
        status: "success",
        data: {
          playlist,
        },
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

      // server error
      const response = h.response({
        status: "error",
        message: "Maaf, server sedang error silahkan coba lagi nanti.",
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async deleteSongFromPlaylistHandler(request, h) {
    try {
      const { id } = request.params;
      const { songId } = request.payload;
      const { id: credentialId } = request.auth.credentials;

      await this._service.checkPlaylistAccess(id, credentialId);
      await this._service.deleteSongFromPlaylist(songId, id, credentialId);

      return {
        status: "success",
        message: "Berhasil menghapus lagu dari playlist",
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

      // Server error
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

module.exports = PlaylistsHandler;
