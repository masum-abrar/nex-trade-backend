import jwt from "jsonwebtoken";

const jwtSign = (payload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1y" });
  return token;
};

export default jwtSign;
