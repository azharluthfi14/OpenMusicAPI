const mapDBToModel = ({ album_id, playlist_id, song_id, ...restdata }) => ({
  ...restdata,
  albumId: album_id,
  playlistId: playlist_id,
  songId: song_id,
});

module.exports = { mapDBToModel };
