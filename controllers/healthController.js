import { getHealth } from "../services/healthService.js";

export function healthCheck(req, res) {
  const data = getHealth();
  res.json(data);
}
