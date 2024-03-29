import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/user.model.js";
import { createAccessToken } from "../libs/jwt.js";
import { TOKEN_SECRET } from "../config.js";

export const register = async (req, res) => {
  const { email, username, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = new User({ email, username, password: passwordHash });

    const userSaved = await newUser.save();
    const token = await createAccessToken({ _id: userSaved._id });
    res.cookie("token", token);
    res.json({
      _id: userSaved._id,
      username: userSaved.username,
      email: userSaved.email,
      createdAt: userSaved.createdAt,
      updatedAt: userSaved.updatedAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: "User not found" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).json({ message: "Invalid credentials" });

      const token = await createAccessToken({ _id: user._id });

      res.cookie("token", token);
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } catch (error) {}
};

export const logout = async (req, res) => {
  res.cookie("token", "", {
    expires: new Date(0),
  });
  return res.sendStatus(200);
};

export const refreshToken = async (req, res) => {
  const { token } = req.cookies;
  if (!token) return res.status(401).send("Token not found");

  try {
    const user = jwt.verify(token, TOKEN_SECRET);
    const userFound = await User.findById(user._id);

    if (!userFound) return res.status(401).send("User not found");

    return res.json({
      id: userFound._id,
      username: userFound.username,
      email: userFound.email,
    });
    
  } catch (error) {
    return res.status(401).send("Invalid token");
  }
};

export const profile = async (req, res) => {
  const userFound = await User.findById(req.user.id);
  if (!userFound) return res.status(401).json({ message: "User not found" });

  return res.json({
    id: userFound._id,
    username: userFound.username,
    email: userFound.email,
    createdAt: userFound.createdAt,
    updatedAt: userFound.updatedAt,
  });
};
