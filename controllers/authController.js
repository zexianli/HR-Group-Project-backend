import { loginUser } from "../services/authService.js";

export async function login(req, res, next) {
  try {
    const result = await loginUser(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
