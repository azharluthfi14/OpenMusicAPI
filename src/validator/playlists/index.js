const {
  PostPlaylistsPayloadSchema,
  PostSongToPlaylistsPayloadSchema,
} = require("./schema");

const InvariantError = require("../../exceptions/InvariantError");

const PlaylistsValidator = {
  validatePostPlaylistsPayload: (payload) => {
    const validationResult = PostPlaylistsPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validatePostSongToPlaylistsPayload: (payload) => {
    const validationResult = PostSongToPlaylistsPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = PlaylistsValidator;
