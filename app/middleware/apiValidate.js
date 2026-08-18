const validate = (schema, redirectPath) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnkmown: true
        });

        if (error) {
            req.flash("error", error.details.map((err) => err.message).join(", "));
            req.flash("old", req.body); //So user doesn’t lose form data after error.

            return res.redirect(redirectPath);
        }

        req.body = value;
        next()

    }
}


module.exports = validate