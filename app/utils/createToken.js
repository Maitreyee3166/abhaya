const jwt = require("jsonwebtoken");

const createAccessToken = (user) => {
  const accessToken = jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRECT,
    {
      expiresIn: "10m",
    },
  );

  return accessToken;
};

const createRefreshToken = (user) => {
  const refreshToken = jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    process.env.REFRESH_TOKEN,
    {
      expiresIn: "7d",
    },
  );

  return refreshToken;
};


module.exports = { createAccessToken, createRefreshToken };