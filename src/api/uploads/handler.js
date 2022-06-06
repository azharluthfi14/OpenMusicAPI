const ClientError = require("../../exceptions/ClientError");

class UploadsHandler {
  constructor(service, albumsService, validator) {
    this._service = service;
    this._albumsService = albumsService;
    this._validator = validator;

    this.postUploadImageHandler = this.postUploadImageHandler.bind(this);
  }

  // ===================== Handler upload album cover ===================
  async postUploadImageHandler(request, h) {
    try {
      const { cover: data } = request.payload;
      const { id: albumId } = request.params;

      this._validator.validateImageHeaders(data.hapi.headers);

      const fileName = await this._service.writeFile(data, data.hapi);
      const fileLocation = `http://${process.env.HOST}:${process.env.PORT}/upload/images/${fileName}`;
      await this._albumsService.addAlbumCover(albumId, fileLocation);

      const response = h.response({
        status: "success",
        message: "Sampul berhasil diunggah",
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
}

module.exports = UploadsHandler;
