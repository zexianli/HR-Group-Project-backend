import User from "../models/User.js";

export async function findUserByUsername(username) {
  return User.findOne({ username });
}

export async function createUser(data) {
  return User.create(data);
}
