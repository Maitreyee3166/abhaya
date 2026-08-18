const Joi = require('joi');

const registerSchemaValidation = Joi.object({

  fullName: Joi.string()
    .min(3)
    .max(50)
    .required(),

  email: Joi.string()
    .email()
    .required(),

  password: Joi.number()
    .min(6)
    .max(30)
    .required(),

  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required(),

  dob: Joi.date()
    .required()
    .messages({
      "date.base": "Date of birth must be a valid date",
      "any.required": "Date of birth is required"
    }),

  gender: Joi.string()
    .valid("female", "male", "other")
    .required(),

  district: Joi.string()
    .valid()
    .required(),

  city: Joi.string()
    .valid()
    .required(),

  roleId: Joi.string()
    .hex()
    .length(24)
    .required()
    .messages({
      "string.hex": "Invalid role ID",
      "string.length": "Invalid role ID",
      "any.required": "Role is required"
    }),

  image: Joi.string()
    .allow("")
    .default(""),

  cloudinaryId: Joi.string()
    .allow("")
    .default(""),

  location: Joi.object({
    type: Joi.string()
      .valid("Point")
      .default("Point"),

    coordinates: Joi.array()
      .items(Joi.number())
      .length(2)
      .required()
      .messages({
        "array.length": "Coordinates must contain longitude and latitude"
      })
  }),

  refreshToken: Joi.string()
    .allow(""),

  isVerified: Joi.boolean()
    .default(false),

  status: Joi.string()
    .valid("Active", "Inactive"),

  isDelete: Joi.boolean()
    .default(false)

});

const policeSchemaValidation = Joi.object({

  stationName: Joi.string()
    .min(3)
    .max(50)
    .required(),

  fullName: Joi.string()
    .min(3)
    .max(50)
    .required(),

  badgeNumber: Joi.string()
    .min(3)
    .max(50)
    .required(),

  email: Joi.string()
    .email()
    .required(),

  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required(),

  gender: Joi.string()
    .valid("female", "male", "other")
    .required(),

  state: Joi.string()
    .valid()
    .required(),

  district: Joi.string()
    .valid()
    .required(),

  city: Joi.string()
    .valid()
    .required(),

  image: Joi.string()
    .allow("")
    .default(""),

  cloudinaryId: Joi.string()
    .allow("")
    .default(""),

  location: Joi.object({
    type: Joi.string()
      .valid("Point")
      .default("Point"),

    coordinates: Joi.array()
      .items(Joi.number())
      .length(2)
      .required()
      .messages({
        "array.length": "Coordinates must contain longitude and latitude"
      })
  }),

  refreshToken: Joi.string()
    .allow(""),

  isVerified: Joi.boolean()
    .default(false),

  status: Joi.string()
    .valid("Active", "Inactive"),

  isDelete: Joi.boolean()
    .default(false)

});


const loginSchemaValidation = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Please enter a valid email address",
    "any.required": "Email is required",
  }),

  password: Joi.string()
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/,
    )
    .required()
    .messages({
      "string.empty": "Password is required",
      "string.pattern.base":
        "Password must contain uppercase, lowercase, number, special character and be at least 8 characters long",
      "any.required": "Password is required",
    }),
});


const forgotPasswordValidation = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Please enter a valid email",
    "any.required": "Email is required",
  }),
});


const resetPasswordValidation = Joi.object({
  password: Joi.string()
    .pattern(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#^()_+\\-=[\\]{};':\"\\\\|,.<>/?]).{8,}$"
      )
    )
    .required()
    .messages({
      "string.empty": "Password is required",
      "string.pattern.base":
        "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.",
      "any.required": "Password is required",
    }),

  confirmPassword: Joi.any()
    .valid(Joi.ref("password"))
    .required()
    .messages({
      "any.only": "Confirm Password does not match",
      "any.required": "Confirm Password is required",
    }),
});


module.exports = {
  registerSchemaValidation, loginSchemaValidation, forgotPasswordValidation, resetPasswordValidation, policeSchemaValidation
};

