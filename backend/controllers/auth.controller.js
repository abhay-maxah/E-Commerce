import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
  return { accessToken, refreshToken };
};

const storeRefreshToken = async (userId, refreshToken) => {
  await redis.set(
    `refresh_token:${userId}`,
    refreshToken,
    "EX",
    7 * 24 * 60 * 60
  ); // 7 Days
};
const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true, //prevent from xss attacks
    maxAge: 15 * 60 * 1000, //15 minutes
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", //prevent from CSRF attack
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, //prevent from xss attacks
    maxAge: 7 * 24 * 60 * 60 * 1000, //7days
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", //prevent from CSRF attack
  });
};

export const signup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email already exists" });
    }
    const user = await User.create({ name, email, password });
    //authenticate
    //store token in redis
    const { accessToken, refreshToken } = generateTokens(user._id);
    await storeRefreshToken(user._id, refreshToken);
    // store cookies
    setCookies(res, accessToken, refreshToken);
    res.status(201).json({
      user: {
        name: user.name,
        email: user.email,
        _id: user._id,
        role: user.role,
      },
      message: "user Created Successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    if (user && (await user.comparePassword(password))) {
      const { accessToken, refreshToken } = generateTokens(user._id);
      await storeRefreshToken(user._id, refreshToken);
      setCookies(res, accessToken, refreshToken);

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(400).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: error.message });
  }
};
export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      await redis.del(`refresh_token:${decoded.userId}`);

      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      res.json({ message: "Log Out Successfully" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error });
  }
};

//this is refresh access token
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const stordToken = await redis.get(`refresh_token:${decoded.userId}`);
    if (stordToken !== refreshToken) {
      return res.status(401).json({ message: "not get refrshToken" });
    }
    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );
    res.cookie("accessToken", accessToken, {
      httpOnly: true, //prevent from xss attacks
      maxAge: 15 * 60 * 1000, //15 minutes
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict", //prevent from CSRF attack
    });
    res.json({ accessToken });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

export const getProfile = async (req, res) => {
  try {
    res.json(req.user); // because we used protected route so send user directly
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const customers = await User.find({ role: "customer" });
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


export const deleteUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error });
  }
};
