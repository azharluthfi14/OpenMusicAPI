const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const ClientError = require("../../exceptions/ClientError");
const InvariantError = require("../../exceptions/InvariantError");
const AuthorizationError = require("../../exceptions/AuthorizationError");
const NotFoundError = require("../../exceptions/NotFoundError");

class PlaylistsService {
  constructor(collaborationService, activitiesService) {
    this._pool = new Pool();
    this._collaborationService = collaborationService;
    this._activitiesService = activitiesService;
  }

  /* =========== Playlist services ============ */

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: "INSERT INTO playlists VALUES($1, $2, $3) RETURNING id",
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError("Fail to add playlist");
    }

    const songId = "-";
    const action = "create";
    await this._activitiesService.addActivity(id, songId, owner, action);

    return result.rows[0].id;
  }

  async getPlaylistByOwner(owner) {
    const queryCollaboration = {
      text: `SELECT playlist_id FROM collaborations WHERE user_id = $1`,
      values: [owner],
    };
    const resultCollaboration = await this._pool.query(queryCollaboration);

    let playlistId = "";
    if (resultCollaboration.rows.length) {
      const result = resultCollaboration.rows[0].playlist_id;
      playlistId = result;
    }
    const queryPlaylist = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists
      LEFT JOIN users ON users.id = playlists.owner
      WHERE owner = $1 OR playlists.id = $2`,
      values: [owner, playlistId],
    };

    const result = await this._pool.query(queryPlaylist);
    return result.rows;
  }

  async deletePlaylistById(playlistId) {
    const query = {
      text: "DELETE FROM playlists WHERE id = $1 RETURNING id",
      values: [playlistId],
    };

    await this._activitiesService.deleteActivity(playlistId);
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Gagal menghapus playlist. Id tidak ditemukan");
    }
  }

  async checkPlaylistByOwner(playlistId, userId) {
    const query = {
      text: "SELECT * FROM playlists WHERE id = $1",
      values: [playlistId],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Tidak dapat menemukan playlist");
    }
    const playlist = result.rows[0];
    if (playlist.owner !== userId) {
      throw new AuthorizationError("Maaf, anda tidak memiliki hak akses");
    }
  }

  async checkPlaylistAccess(playlistId, userId) {
    try {
      await this.checkPlaylistByOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }

  /* ============ Playlist song service =================== */
  async addSongToPlaylist(songId, playlistId, credentialId) {
    const id = `playlistsong-${nanoid(16)}`;
    const query = {
      text: "INSERT INTO playlistsongs VALUES($1, $2, $3) RETURNING id",
      values: [id, songId, playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError("Gagal menambahkan lagu kedalam playlist");
    }

    const action = "add";
    const userId = credentialId;
    await this._activitiesService.addActivity(playlistId, songId, userId, action);

    return result.rows[0].id;
  }

  async getSongFromPlaylist(id, owner) {
    const playlistId = id;

    const queryPlaylist = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists
      INNER JOIN users ON users.id = playlists.owner 
      WHERE playlists.id = $3 OR owner = $1 AND playlists.id = $2`,
      values: [owner, id, playlistId],
    };

    const querySong = {
      text: `SELECT songs.id, songs.title, songs.performer FROM songs
      LEFT JOIN playlistsongs
      ON playlistsongs.song_id = songs.id
      WHERE playlistsongs.playlist_id = $1 OR playlistsongs.playlist_id = $2`,
      values: [id, playlistId],
    };

    const resultPlaylist = await this._pool.query(queryPlaylist);

    const resultSong = await this._pool.query(querySong);

    const wrappData = {
      ...resultPlaylist.rows[0],
      songs: [...resultSong.rows],
    };

    if (!resultPlaylist.rows.length) {
      throw new NotFoundError("Playlist tidak dapat ditemuan");
    }

    return wrappData;
  }

  async deleteSongFromPlaylist(id, playlistId, credentialId) {
    const query = {
      text: "DELETE FROM playlistsongs WHERE song_id = $1 AND playlist_id = $2 RETURNING id",
      values: [id, playlistId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new ClientError("Gagal menghapus lagu pada playlist");
    }

    const action = "delete";
    const songId = id;
    const userId = credentialId;

    await this._activitiesService.addActivity(playlistId, songId, userId, action);
  }

  async checkSongExist(id) {
    const query = {
      text: "SELECT * FROM songs WHERE id = $1",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Gagal mendapatkan lagu. Id tidak ditemukan");
    }
  }
}

module.exports = PlaylistsService;
