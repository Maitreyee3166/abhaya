const Joi = require('joi');

const reportSchemaValidation = Joi.object({

    userId: Joi.string()
        .hex()
        .length(24)
        .required()
        .messages({
            "string.hex": "Invalid role ID",
            "string.length": "Invalid role ID",
            "any.required": "Role is required"
        }),

    incidentTypeId: Joi.string()
        .hex()
        .length(24)
        .required()
        .messages({
            "string.hex": "Invalid role ID",
            "string.length": "Invalid role ID",
            "any.required": "Role is required"
        }),

    description: Joi.string()
        .min(3)
        .required(),

    evidence: Joi.string()
        .allow("")
        .default(""),

    cloudinaryId: Joi.string()
        .allow("")
        .default(""),

    date: Joi.date()
        .required()
        .messages({
            "date.base": "Date of birth must be a valid date",
            "any.required": "Date of birth is required"
        }),

    time: Joi.string()
        .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .required(),

    location: Joi.string()
        .trim()
        .allow("")
        .optional(),

    latitude: Joi.number()
        .min(-90)
        .max(90)
        .optional(),

    longitude: Joi.number()
        .min(-180)
        .max(180)
        .optional(),

    anonymous: Joi.boolean()
        .default(false),

    severity: Joi.string()
        .valid("Low", "Medium", "High")
        .default("Medium"),

    status: Joi.string()
        .valid("Pending", "Reviewed", "Approved", "Rejected"),

});


const incidentTypeValidation = Joi.object({

    incidenttypeName: Joi.string()
        .required(),

    description: Joi.string()
        .min(3),

    isDelete: Joi.boolean()
        .default(false)
            
})


module.exports = {
    reportSchemaValidation, incidentTypeValidation
};

