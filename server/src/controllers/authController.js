import User from "../models/User.js";
import { createToken } from "../utils/token.js";

function sendUser(res, user, status = 200) {
  res.status(status).json({
    token: createToken(user._id),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
}

export async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: "member"
    });

    sendUser(res, user, 201);
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    sendUser(res, user);
  } catch (error) {
    next(error);
  }
}

export async function me(req, res) {
  res.json({ user: req.user });
}

export async function listUsers(req, res, next) {
  try {
    const users = await User.find().select("name email role").sort({ name: 1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
}
