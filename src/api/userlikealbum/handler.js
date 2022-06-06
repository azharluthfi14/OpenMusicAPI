const ClientError = require("../../exceptions/ClientError");

class UserLikeAlbumHandler {
  constructor(albumsService, userLikeAlbumService) {
    this._albumsService = albumsService;
    this._userLikeAlbumService = userLikeAlbumService;

    this.postUserLikeAlbumHandler = this.postUserLikeAlbumHandler.bind(this);
    this.getUserLikeAlbumCountHandler = this.getUserLikeAlbumCountHandler.bind(this);
  }

  // =================== Handler user like/unlike album ==================
  async postUserLikeAlbumHandler(request, h) {
    try {
      const { id: albumId } = request.params;
      const { id: userId } = request.auth.credentials;

      await this._albumsService.checkAlbumExist(albumId);

      const isLiked = await this._userLikeAlbumService.checkLikeAlbumByUser(userId, albumId);

      if (!isLiked) {
        await this._userLikeAlbumService.likeAlbum(userId, albumId);
        const response = h.response({
          status: "success",
          message: "Like berhasil ditambahkan",
        });
        response.code(201);
        return response;
      }

      await this._userLikeAlbumService.unlikeAlbum(userId, albumId);
      const response = h.response({
        status: "success",
        message: "Like berhasil dibatalkan",
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

  // ======================= Handler get count like album ========================
  async getUserLikeAlbumCountHandler(request, h) {
    try {
      const { id: albumId } = request.params;
      const countLike = await this._userLikeAlbumService.getUserLikeAlbumCount(albumId);
      const response = h.response({
        status: "success",
        data: {
          likes: countLike.count,
        },
      });
      response.header("X-Data-Source", countLike.source);
      response.code(200);
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
}

module.exports = UserLikeAlbumHandler;
