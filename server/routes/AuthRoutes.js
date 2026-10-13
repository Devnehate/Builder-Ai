import { Router } from "express";
import { login, logout, me, register } from "../controllers/AuthController.js";
import { AuthMiddleware } from "../middleware/AuthMiddleware.js";

const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.get('/me', AuthMiddleware, me);

export default authRouter;