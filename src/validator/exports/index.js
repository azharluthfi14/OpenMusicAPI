const ExportsPlaylistSongPayloadSchema = require("./schema");
const InvariantError = require("../../exceptions/InvariantError");

const ExportsValidator = {
  validateExportsPlaylistSongPayload: (payload) => {
    const validationResult = ExportsPlaylistSongPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = ExportsValidator;
