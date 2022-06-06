const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const InvariantError = require("../../exceptions/InvariantError");

class UserAlbumsLikesService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async likeAlbum(userId, albumId) {
    const userAlbumLikeId = `albumlikes-${nanoid(16)}`;

    const query = {
      text: "INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id",
      values: [userAlbumLikeId, userId, albumId],
    };

    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError("Like gagal ditambahkan. Id tidak ditemukan");
    }

    await this._cacheService.delete(`user_album_likes: ${albumId}`);

    return result.rows[0].id;
  }

  async unlikeAlbum(userId, albumId) {
    const query = {
      text: "DELETE FROM user_album_likes WHERE user_id = $1 and album_id = $2 RETURNING id",
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError("Like gagal dibatalkan");
    }

    await this._cacheService.delete(`user_album_likes: ${albumId}`);
  }

  async getUserLikeAlbumCount(albumId) {
    try {
      const result = await this._cacheService.get(`user_album_likes: ${albumId}`);

      return {
        count: JSON.parse(result),
        source: "cache",
      };
    } catch (error) {
      const query = {
        text: "SELECT * FROM user_album_likes WHERE album_id = $1",
        values: [albumId],
      };

      const result = await this._pool.query(query);

      await this._cacheService.set(`user_album_likes: ${albumId}`, JSON.stringify(result.rows.length));

      return {
        count: result.rows.length,
        source: "database",
      };
    }
  }

  async checkLikeAlbumByUser(userId, albumId) {
    const query = {
      text: "SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2",
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    return result.rows.length;
  }
}

module.exports = UserAlbumsLikesService;
