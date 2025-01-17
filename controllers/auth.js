import User from "./../models/user.js";
import asyncHandler from "./../middleware/asyncHandler.js";
import jwt from "jsonwebtoken";

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "6d",
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const isDev = process.env.NODE_ENV === "development" ? false : true;

  const cookieOption = {
    expires: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: isDev,
  };

  res.cookie("jwt", token, cookieOption);

  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

export const register = asyncHandler(async (req, res) => {
  const isAdmin = (await User.countDocuments()) === 0;

  const role = isAdmin ? "admin" : "user";

  const createUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    role: role,
  });
  createSendToken(createUser, 201, res);
});

export const login = asyncHandler(async (req, res) => {
  // validasi apabila form login tidak diisi
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({
      message: "Please provide email and password",
    });
  }
  // mencari user didatabase
  const userEmail = await User.findOne({
    email: req.body.email,
  });

  // Cek password

  if (userEmail && (await userEmail.matchPassword(req.body.password))) {
    createSendToken(userEmail, 200, res);
  } else {
    res.status(401).json({
      message: "Invalid email or password",
    });
  }
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");

  if (user) {
    res.status(200).json({
      status: "success",
      data: user,
    });
  } else {
    res.status(404).json({
      message: "User not found",
    });
  }
});

export const logout = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    expires: new Date(Date.now() - 1000), // Kedaluwarsa di masa lalu
    httpOnly: true,
  });

  res.status(200).json({
    message: "Logout success",
  });
});
