import express from "express";
import { register, login, getUser, logout } from "./../controllers/auth.js";
import { protectedMiddleware } from "./../middleware/authMiddleware.js";

const router = express.Router();

//post /api/v1/auth/register

router.post("/register", register);

//post /api/v1/auth/login
router.post("/login", login);
//get api v1 logout
router.get("/logout", protectedMiddleware, logout);

//get api v1 getuser
router.get("/getuser", protectedMiddleware, getUser);

export default router;
