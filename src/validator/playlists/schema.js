const Joi = require("joi");

const PostPlaylistsPayloadSchema = Joi.object({
  name: Joi.string().required(),
  owner: Joi.string(),
});

const PostSongToPlaylistsPayloadSchema = Joi.object({
  playlistId: Joi.string(),
  songId: Joi.string().required(),
});

module.exports = {
  PostPlaylistsPayloadSchema,
  PostSongToPlaylistsPayloadSchema,
};
