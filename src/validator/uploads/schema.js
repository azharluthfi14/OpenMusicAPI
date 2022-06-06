const Joi = require("joi");

const ImageHeaderSchema = Joi.object({
  "content-type": Joi.string()
    .valid(
      "image/apng",
      "image/avif",
      "image/gif",
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg"
    )
    .required(),
}).unknown();

module.exports = { ImageHeaderSchema };
