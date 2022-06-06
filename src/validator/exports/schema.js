const Joi = require("joi");

const ExportsPlaylistSongPayloadSchema = Joi.object({
  targetEmail: Joi.string().email({ tlds: true }).required(),
});

module.exports = ExportsPlaylistSongPayloadSchema;
