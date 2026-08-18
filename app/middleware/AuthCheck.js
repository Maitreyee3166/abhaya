const jwt = require("jsonwebtoken");

const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    // console.log("token", token);
    
    if (!token) {
      res.cookie("redirectAfterRefresh", req.originalUrl, {
        httpOnly: true,
      });
      return res.redirect("/auth/refresh-token");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRECT);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      res.cookie("redirectAfterRefresh", req.originalUrl, {
        httpOnly: true,
      });
      return res.redirect("/auth/refresh-token");
    }
    return res.redirect("/auth/login");
  }
};

module.exports = protect;
