export async function registerUser(payload) {
  // TODO: verify registration token, create user, create employee profile, assign house
  return {
    message: "registration placeholder",
    received: Object.keys(payload || {}),
  };
}
