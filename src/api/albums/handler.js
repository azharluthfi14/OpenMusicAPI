const ClientError = require("../../exceptions/ClientError");

class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postAlbumHandler = this.postAlbumHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
  }

  // Handler for create Album
  async postAlbumHandler(request, h) {
    try {
      this._validator.validateAlbumPayload(request.payload);

      const albumId = await this._service.addAlbum(request.payload);

      const response = h.response({
        status: "success",
        message: "Album berhasil ditambahkan",
        data: {
          albumId,
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

      // If Server Error
      const response = h.response({
        status: "error",
        message: "Maaf, server sedang error silahkan coba lagi nanti.",
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  // Handler for get Album by id
  async getAlbumByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const album = await this._service.getAlbumById(id);
      const song = await this._service.getSongInAlbum(id);
      return {
        status: "success",
        data: {
          album: {
            id: album.id,
            name: album.name,
            year: album.year,
            coverUrl: album.cover,
            songs: song,
          },
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

      // If server Error
      const response = h.response({
        status: "error",
        message: "Maaf, server sedang error silahkan coba lagi nanti.",
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  // Handler update Album by id
  async putAlbumByIdHandler(request, h) {
    try {
      this._validator.validateAlbumPayload(request.payload);
      const { id } = request.params;
      await this._service.editAlbumById(id, request.payload);
      return {
        status: "success",
        message: "Album berhasil diperbarui",
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

      // If server error
      const response = h.response({
        status: "error",
        message: "Maaf, server sedang error silahkan coba lagi nanti.",
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  // Handler delete Album by id
  async deleteAlbumByIdHandler(request, h) {
    try {
      const { id } = request.params;
      await this._service.deleteAlbumById(id);

      return {
        status: "success",
        message: "Album berhasil dihapus",
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: "fail",
          message: "Album gagal dihapus. Id tidak dapat ditemukan",
        });
        response.code(error.statusCode);
        return response;
      }

      // If server error
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

module.exports = AlbumsHandler;
