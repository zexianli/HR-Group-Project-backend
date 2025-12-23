import jwt from "jsonwebtoken";

export const generateJWTToken = (user) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not configured");
  }

  const payload = {
    userId: user._id.toString(),
    role: user.role,
    username: user.username,
    email: user.email,
  };

  return jwt.sign(payload, secret, { expiresIn: "3h" });
};

export const verifyJWTToken = (token) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not configured");
  }

  return jwt.verify(token, secret);
};
