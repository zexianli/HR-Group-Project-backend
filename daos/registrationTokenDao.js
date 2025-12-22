import RegistrationToken from "../models/RegistrationToken.js";

export async function findValidToken(token) {
  // TODO: add "isUsed: false" and "expiresAt > now" checks
  return RegistrationToken.findOne({ token });
}
