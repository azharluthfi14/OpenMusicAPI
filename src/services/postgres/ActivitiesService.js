const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");

class ActivitiesService {
  constructor() {
    this._pool = new Pool();
  }

  async addActivity(playlistId, songId, userId, action) {
    const id = `activities-${nanoid(16)}`;
    const time = new Date().toISOString();
    const query = {
      text: "INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id",
      values: [id, playlistId, songId, userId, action, time],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError("Gagal menambahkan activity");
    }
    return result.rows[0].id;
  }

  async deleteActivity(playlistId) {
    const query = {
      text: "DELETE FROM playlist_song_activities WHERE playlist_id = $1 RETURNING id",
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError("Gagal menghapus activity");
    }
  }

  async getActivities(playlistId) {
    const queryIdPlaylist = {
      text: `SELECT playlist_id FROM playlist_song_activities
      WHERE playlist_id = $1 GROUP BY playlist_id`,
      values: [playlistId],
    };

    const queryActivities = {
      text: `SELECT users.username, songs.title, playlist_song_activities.action, playlist_song_activities.time 
      FROM ((playlist_song_activities 
        INNER JOIN users on users.id = playlist_song_activities.user_id)
        INNER JOIN songs on songs.id = playlist_song_activities.song_id) 
        WHERE playlist_song_activities.playlist_id = $1`,
      values: [playlistId],
    };

    const resultIdPlaylist = await this._pool.query(queryIdPlaylist);
    const resultActivities = await this._pool.query(queryActivities);

    const wrappData = {
      playlistId: resultIdPlaylist.rows[0].playlist_id,
      activities: [...resultActivities.rows],
    };

    if (!resultIdPlaylist.rows.length) {
      throw new NotFoundError("Playlist tidak dapat ditemukan");
    }

    return wrappData;
  }
}

module.exports = ActivitiesService;
