import authenticationRoutes from "./auth.js";
import roleRoutes from "./roles.js";
import moduleRoutes from "./modules.js";
import roleModuleRoutes from "./role-module.js";
import userRoutes from "./users.js";

const authRoutes = [
  authenticationRoutes,
  roleRoutes,
  moduleRoutes,
  userRoutes,
  roleModuleRoutes,
];

export default authRoutes;
