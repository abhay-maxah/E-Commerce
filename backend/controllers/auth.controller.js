import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import Address from "../models/address.model.js";
import Order from "../models/order.model.js";
import Coupon from "../models/coupon.model.js"
import jwt from "jsonwebtoken";
import oauth2client from "../lib/googleConfig.js"
import axios from "axios"
import resend from "../lib/resend.js"
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
  const { name, email, password, role = "user" } = req.body; // Default role = "user"

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const user = await User.create({ name, email, password, role }); // Include role here

    // authenticate
    const { accessToken, refreshToken } = generateTokens(user._id);
    await storeRefreshToken(user._id, refreshToken);

    setCookies(res, accessToken, refreshToken);

    res.status(201).json({
      user: {
        name: user.name,
        email: user.email,
        _id: user._id,
        role: user.role, // will reflect 'admin' or 'user'
      },
      message: "User created successfully",
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
        premium: user.premium,
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
    const customers = await User.find({ role: "user" });
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const loginGoogle = async (req, res) => {
  try {
    const { code } = req.query;
    const googleRes = await oauth2client.getToken(code);
    oauth2client.setCredentials(googleRes.tokens);

    const userRes = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
    );
    const { email, name, picture } = userRes.data;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({ name, email, image: picture });
    } else if (user.isDeleted) {
      // Restore the user if soft deleted
      user.isDeleted = false;
      user.name = name;
      user.image = picture;
      await user.save();
    }

    const { accessToken, refreshToken } = generateTokens(user._id);
    await storeRefreshToken(user._id, refreshToken);
    setCookies(res, accessToken, refreshToken);

    res.json({
      _id: user._id,
      image: user.image,
      name: user.name,
      email: user.email,
      premium: user.premium,
      role: user.role,
    });
  } catch (error) {
    console.error("Google Login Error:", error);
    res
      .status(500)
      .json({ message: "Server Error while login with Google", error: error.message });
  }
};

export const deleteUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    // 1. Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Prevent deleting admin users
    if (user.role === "admin") {
      return res.status(403).json({ message: "Cannot delete an admin account" });
    }

    // 4. Delete related addresses and orders
    await Promise.all([
      Address.deleteMany({ user: userId }),
      Order.deleteMany({ user: userId }),
      Coupon.deleteOne({ userId }) // Use deleteOne since userId is unique
    ]);
    await User.findByIdAndDelete(userId);

    res.json({ message: "User and related data deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error while delete a user", error: error });
  }
};

const verificationCodes = {};

export const sendAuthCode = async (req, res) => {
  try {
    const { email } = req.body;
    const code = Math.floor(100000 + Math.random() * 900000)
    verificationCodes[email] = code;
    await sendEmail(email, code);
    res.status(200).json({ message: "Code sent successfully", code });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Server Error while sending Mail", error });
  }
}
export const sendAuthCodeForgot = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const code = Math.floor(100000 + Math.random() * 900000)
    verificationCodes[email] = code;
    await sendEmail(email, code);
    res.status(200).json({ message: "Code sent successfully", code });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Server Error while sending Mail", error });
  }
}
export const verifyAuthCode = async (req, res) => {
  const { email, code } = req.body;
  if (verificationCodes[email] && verificationCodes[email] === parseInt(code)) {
    delete verificationCodes[email]; // Optionally clear after success
    return res.status(200).json({ message: "Code verified successfully" });
  }
  res.status(400).json({ message: "Invalid verification code" });
};
const sendEmail = async (email, code) => {
  try {
    await resend.emails.send({
      from: 'Cookiesman <support@cookiesman.me>',
      to: [email],
      subject: "🔐 Your Authentication Code from CookiesMan",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #fef9f6;">
          <div style="max-width: 500px; margin: auto; background-color: #fff8f2; border: 2px solid #e0c4aa; border-radius: 12px; padding: 30px; text-align: center; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
  
            <!-- Cookie-themed Logo -->
            <img src="https://cdn-icons-png.flaticon.com/512/1047/1047711.png" alt="CookiesMan Logo" style="height: 70px; margin-bottom: 20px;" />
  
            <h1 style="color: #a31621; margin-bottom: 0;">Welcome to CookiesMan 🍪</h1>
            <p style="font-size: 16px; color: #333;">Your sweet & secure login code is here!</p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
  
            <p style="font-size: 18px; color: #555;">Enter the following code:</p>
            <div style="font-size: 32px; font-weight: bold; color: #ffffff; background-color: #a31621; padding: 15px 0; border-radius: 8px; margin: 10px auto; width: 180px;">
              ${code}
            </div>
  
            <p style="font-size: 14px; color: #777; margin-top: 20px;">
              ⏰ <strong>This code is valid for only 5 minutes.</strong><br />
              Please do not share it with anyone.
            </p>
  
            <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;" />
            <p style="font-size: 13px; color: #aaa;">
              Didn't request this email? No worries, just ignore it.
            </p>
            <p style="font-size: 12px; color: #aaa;">— The CookiesMan Team 🍪</p>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.log(err)
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the password
    user.password = password; // Make sure this gets hashed before save
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Error resetting password" });
  }
};
