// middleware/validateMiddleware.js
import Joi from "joi";

/**
 * Middleware factory for validating request data against a Joi schema.
 * 
 * Validates the specified property of the request object (defaulting to "body").
 * If validation fails, it expects specific Joi options and returns a 400 Bad Request with details.
 * If validation succeeds, it replaces `req[property]` with the validated (and potentially transformed) value.
 * 
 * @param {import("joi").Schema} schema - The Joi validation schema.
 * @param {string} [property="body"] - The property of the request object to validate (e.g., "body", "query", "params").
 * @returns {import("express").RequestHandler} Express middleware function.
 */
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
