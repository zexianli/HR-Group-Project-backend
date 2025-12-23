export function employeeOnly(req, res, next) {
  /**
   * Placeholder until JWT is ready:
   * Testing must send headers:
   * user-id: <mongo object id or string>
   * role: EMPLOYEE
   */
  const userId = req.header("user-id");
  const role = req.header("role");

  if (!userId) return res.status(401).json({ error: "User ID is required" });
  if (role !== "EMPLOYEE")
    return res
      .status(403)
      .json({ error: "Access denied, only employees are allowed" });
  req.userId = userId;
  req.role = role;
  next();
}
