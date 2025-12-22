export async function loginUser({ username, _password }) {
  // TODO: validate input, query user via DAO, verify password, issue token
  return {
    message: "login placeholder",
    username,
    // never return password
  };
}
