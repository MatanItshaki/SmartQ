// middleware/validateMiddleware.js
import Joi from "joi";

export const validate = (schema, property = "body") => {
  return (req, res, next) => {
    const options = {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    };

    const { error, value } = schema.validate(req[property], options);

    if (error) {
      const errors = error.details.map((d) =>
        d.message.replace(/["]/g, "") // remove quotes
      );

      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    req[property] = value;
    next();
  };
};
