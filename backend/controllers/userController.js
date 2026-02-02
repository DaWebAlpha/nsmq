import User from './models/userModel.js'
import jwt from 'jsonwebtoken'
import rateLimit from 'express-rate-limit';
import validator from 'validator';
import autoCatchFn from "../utils/autoCatchFn.js"
import dotenv from 'dotenv';

dotenv.config();


const jwtSecret = process.env.JWT_SECRET;
const adminPassword = process.env.ADMIN_PASSWORD;
const isProduction = process.env.NODE_ENV;
const isAdminName = process.env.ADMIN_NAME;



export const showRegister = async(req, res) =>{
    return res.json({error: null})
}

/**
 * REGISTER USER
 * POST /api/auth/register
 */
export const register = autoCatchFn(async (req, res) => {
  let { username, email, password, phoneNumber } = req.body || {};

  // -----------------------------
  // 1. BASIC VALIDATION
  // -----------------------------
  if (!username || !email || !password || !phoneNumber) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  username = username.toLowerCase().trim();
  email = email.toLowerCase().trim();
  phoneNumber = phoneNumber.trim();

  if (!validator.isEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Enter a valid email address",
    });
  }

  if (!validator.isMobilePhone(phoneNumber + "", "any")) {
    return res.status(400).json({
      success: false,
      message: "Enter a valid phone number",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters",
    });
  }

  // -----------------------------
  // 2. CHECK FOR DUPLICATES
  // -----------------------------
  const existingUser = await User.findOne({
    $or: [{ email }, { username }, { phoneNumber }],
  });

  if (existingUser) {
    let field =
      existingUser.email === email
        ? "Email"
        : existingUser.username === username
        ? "Username"
        : "Phone number";

    return res.status(409).json({
      success: false,
      message: `${field} is already in use`,
    });
  }

  // -----------------------------
  // 3. CREATE USER
  // -----------------------------
  const newUser = await User.create({
    username,
    email,
    phoneNumber,
    password, // hashed via pre-save hook
  });

  // -----------------------------
  // 4. RESPONSE
  // -----------------------------
  return res.status(201).json({
    success: true,
    message: "Registration successful. Kindly login",
    user: {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt,
    },
  });
})





export const showLogin = autoCatchFn(async(req, res)=>{
    return res.json({
        error: null
    })
})



export const login = autoCatchFn(async (req, res) => {
  let { username, password } = req.body || {};

  // -----------------------------
  // 1. BASIC VALIDATION
  // -----------------------------
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username and password are required",
    });
  }

  username = username.toLowerCase().trim();

  // -----------------------------
  // 2. FIND USER (WITH PASSWORD)
  // -----------------------------
  const user = await User.findOne({ username }).select("+password");

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  // -----------------------------
  // 3. CHECK ACCOUNT STATUS
  // -----------------------------
  if (!user.isActive) {
    return res.status(403).json({
      success: false,
      message: "Account is disabled. Contact admin.",
    });
  }

  if (user.isLocked()) {
    return res.status(423).json({
      success: false,
      message: "Account temporarily locked due to failed logins",
    });
  }

  // -----------------------------
  // 4. VERIFY PASSWORD
  // -----------------------------
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    await user.incrementLoginAttempts();

    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  // -----------------------------
  // 5. RESET LOGIN ATTEMPTS
  // -----------------------------
  await user.resetLoginAttempts();

  // -----------------------------
  // 6. CREATE JWT
  // -----------------------------
  const payload = {
    id: user._id,
    username: user.username,
    role: user.role,
  };

  const token = jwt.sign(payload, jwtSecret, {
    expiresIn: "2h",
  });

  // -----------------------------
  // 7. SET COOKIE
  // -----------------------------
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge: 2 * 60 * 60 * 1000, // 2 hours
  });

  // -----------------------------
  // 8. RESPONSE
  // -----------------------------
  return res.status(200).json({
    success: true,
    message: "Login successful",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      lastLogin: user.loginStats.lastLogin,
    },
  });
});


export const logout = autoCatchFn(async(req, res)=>{
    res.clearCookie("token", {
        httpOnly: true,
        secure: isProduction,
        sameSite: "strict"
    });
    return res.status(200).json({
        success: true,
        message: "Logged out successfully. Kindly log in again"
    })
})