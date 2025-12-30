// middleware/validateMiddleware.js
import Joi from "joi";

export const validate = (schema, property = "body") => {
  return (req, res, next) => {
    const options = {
      abortEarly: false,   // return all errors
      allowUnknown: false,
      stripUnknown: true, // remove unknown fields
    };

    const { error, value } = schema.validate(req[property], options);

    if (error) {
      const details = error.details.map(d => d.message);
      return res.status(400).json({
        message: "Validation error",
        errors: details,
      });
    }

    // replace with validated & sanitized data
    req[property] = value;
    next();
  };
};
